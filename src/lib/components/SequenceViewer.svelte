<script lang="ts">
	import {
		ArrowLeft,
		Copy,
		Play,
		Download,
		Terminal,
		Info,
		Package,
		Code,
		Share2
	} from 'lucide-svelte';
	import type { ManifestEntry, Dependency } from '$lib/types';
	import DownloadModal from './DownloadModal.svelte';
	import SynapSeqPlayer from './SynapSeqPlayer.svelte';
	import { synapseqPlayer } from '$lib/stores/synapseq.svelte';

	let {
		sequence,
		onBack
	}: {
		sequence: ManifestEntry;
		onBack: () => void;
	} = $props();

	let activeTab = $state<'cli' | 'description' | 'dependencies' | 'source'>('description');
	let sourceCode = $state<string>('');
	let description = $state<string>('');
	let descriptionLines = $state<string[]>([]);
	let codeWithoutDescription = $state<string>('');
	let isLoadingSource = $state(false);
	let copyPlayButtonText = $state('Copy');
	let copyWavButtonText = $state('Copy');
	let copyMp3ButtonText = $state('Copy');
	let isDownloadModalOpen = $state(false);
	let isPlayingInBrowser = $state(false);
	let processedSequenceContent = $state<string>('');
	let shareButtonText = $state('Share');

	const playCommand = $derived(`synapseq -play -hub-get ${sequence.id}`);
	const wavCommand = $derived(`synapseq -hub-get ${sequence.id}`);
	const mp3Command = $derived(`synapseq -mp3 -hub-get ${sequence.id}`);

	async function handleShare() {
		const shareUrl = window.location.href;
		const shareTitle = sequence.name;
		const shareText = `Check out "${sequence.name}" on SynapSeq Hub`;

		// Try native Web Share API first (mobile)
		if (navigator.share) {
			try {
				await navigator.share({
					title: shareTitle,
					text: shareText,
					url: shareUrl
				});
				return;
			} catch (err) {
				// User cancelled or error, fallback to copy
			}
		}

		// Fallback: copy to clipboard
		try {
			await navigator.clipboard.writeText(shareUrl);
			shareButtonText = 'Copied!';
			setTimeout(() => {
				shareButtonText = 'Share';
			}, 2000);
		} catch (error) {
			console.error('Failed to share:', error);
		}
	}

	async function loadSourceCode() {
		if (sourceCode) return;
		isLoadingSource = true;
		try {
			// Try local path first to avoid CORS issues
			const localPath = '/' + sequence.path;
			let response = await fetch(localPath);

			// If local fails, try the original download_url
			if (!response.ok) {
				response = await fetch(sequence.download_url);
			}

			if (!response.ok) {
				throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
			}

			const fullContent = await response.text();
			sourceCode = fullContent;

			// Extract description and clean code
			const lines = fullContent.split('\n');
			const descLines: string[] = [];
			const codeLines: string[] = [];

			lines.forEach((line) => {
				if (line.trim().startsWith('##')) {
					// Remove ## and trim
					descLines.push(line.trim().substring(2).trim());
				} else {
					codeLines.push(line);
				}
			});

			descriptionLines = descLines;
			description = descLines.join('\n');
			codeWithoutDescription = codeLines.join('\n');
		} catch (error) {
			console.error('Failed to load source code:', error);
			sourceCode = 'Failed to load source code';
			codeWithoutDescription = 'Failed to load source code';
		} finally {
			isLoadingSource = false;
		}
	}

	// Load source code immediately when component mounts
	$effect(() => {
		loadSourceCode();
	});

	async function copyPlayCommand() {
		try {
			await navigator.clipboard.writeText(playCommand);
			copyPlayButtonText = 'Copied!';
			setTimeout(() => {
				copyPlayButtonText = 'Copy';
			}, 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	}

	async function copyWavCommand() {
		try {
			await navigator.clipboard.writeText(wavCommand);
			copyWavButtonText = 'Copied!';
			setTimeout(() => {
				copyWavButtonText = 'Copy';
			}, 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	}

	async function copyMp3Command() {
		try {
			await navigator.clipboard.writeText(mp3Command);
			copyMp3ButtonText = 'Copied!';
			setTimeout(() => {
				copyMp3ButtonText = 'Copy';
			}, 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	}

	// Convert URLs in description to clickable links
	function formatDescriptionWithLinks(text: string): string {
		// Regex to match URLs starting with http:// or https://
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		return text.replace(
			urlRegex,
			'<a href="$1" target="_blank" rel="noopener noreferrer" class="description-link">$1</a>'
		);
	}

	const formattedDescription = $derived(formatDescriptionWithLinks(description));

	function handleDownloadClick() {
		// Direct download for mobile, modal for desktop
		const isMobile = window.innerWidth <= 768;
		if (isMobile) {
			// Mobile users can use the modal too, but it will auto-download
			isDownloadModalOpen = true;
		} else {
			isDownloadModalOpen = true;
		}
	}

	// Track play action
	async function playBrowser(id: string) {
		// Only track in production
		const isDevelopment = import.meta.env.MODE === 'development';

		if (!isDevelopment) {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 3000);

			fetch('https://us-central1-synapseq-hub.cloudfunctions.net/trackDownload', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-SYNAPSEQ-SOURCE': 'WEB',
					'X-SYNAPSEQ-ACTION': 'PLAY'
				},
				body: JSON.stringify({ id }),
				signal: controller.signal
			})
				.then(async (res) => {
					if (!res.ok) {
						console.warn(`Tracking failed: HTTP ${res.status}`);
						return;
					}

					res.json().then((data) => {
						if (!data.success) {
							console.warn('Tracking returned non-success:', data);
						}
					});
				})
				.catch((err) => {
					if (err.name === 'AbortError') {
						console.warn('Tracking request timed out');
					} else {
						console.error('Tracking request failed:', err);
					}
				})
				.finally(() => {
					clearTimeout(timeout);
				});
		}

		// Process dependencies and load into player
		await processSequenceDependencies();

		// Set flag to show player (player will handle initialization and playback)
		isPlayingInBrowser = true;
	}

	// Process sequence dependencies: replace @presetlist and @background with URLs
	async function processSequenceDependencies() {
		try {
			let processed = codeWithoutDescription;

			// Process each dependency
			for (const dep of sequence.dependencies) {
				if (dep.type === 'presetlist') {
					// Replace @presetlist <filename>.spsq with @presetlist <url>
					const regex = new RegExp(`@presetlist\\s+${dep.name}\\.spsq`, 'g');
					processed = processed.replace(regex, `@presetlist ${dep.download_url}`);
				} else if (dep.type === 'background') {
					// Replace @background <filename>.wav with @background <url>
					const regex = new RegExp(`@background\\s+${dep.name}\\.wav`, 'g');
					processed = processed.replace(regex, `@background ${dep.download_url}`);
				}
			}

			processedSequenceContent = processed;
		} catch (error) {
			console.error('Failed to process sequence:', error);
			alert(
				'Failed to process sequence: ' + (error instanceof Error ? error.message : 'Unknown error')
			);
		}
	}

	function closePlayer() {
		synapseqPlayer.stop();
		isPlayingInBrowser = false;
	}
</script>

<div class="sequence-viewer">
	<button class="back-button" onclick={onBack}>
		<div class="icon">
			<ArrowLeft size={20} />
		</div>
		<span>Back to Sequences</span>
	</button>

	{#if isLoadingSource}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading sequence...</p>
		</div>
	{:else}
		<!-- Header Card -->
		<div class="header-card">
			<div class="header-top">
				<div class="metadata-top">
					<span class="category-badge">{sequence.category}</span>
					<span class="author">by {sequence.author}</span>
					<button class="share-icon-button" onclick={handleShare} title="Share sequence">
						<Share2 size={16} />
					</button>
				</div>
				<h1 class="sequence-title">{sequence.name}</h1>
			</div>

			<!-- Primary Actions -->
			{#if !isPlayingInBrowser}
				<div class="actions-grid">
					<button class="action-button primary" onclick={() => playBrowser(sequence.id)}>
						<Play size={20} strokeWidth={2.5} fill="currentColor" />
						<span>Listen Now</span>
					</button>
					<button class="action-button secondary" onclick={handleDownloadClick}>
						<Download size={20} strokeWidth={2} />
						<span>Download .spsq</span>
					</button>
				</div>
			{/if}
		</div>

		{#if !isPlayingInBrowser}
			<!-- Tabs Navigation -->
			<div class="tabs-container">
				<div class="tabs">
					<button
						class="tab"
						class:active={activeTab === 'description'}
						onclick={() => (activeTab = 'description')}
					>
						<Info size={18} />
						<span>About</span>
					</button>
					<button
						class="tab"
						class:active={activeTab === 'cli'}
						onclick={() => (activeTab = 'cli')}
					>
						<Terminal size={18} />
						<span>CLI</span>
					</button>
					{#if sequence.dependencies && sequence.dependencies.length > 0}
						<button
							class="tab"
							class:active={activeTab === 'dependencies'}
							onclick={() => (activeTab = 'dependencies')}
						>
							<Package size={18} />
							<span>Dependencies</span>
						</button>
					{/if}
					<button
						class="tab"
						class:active={activeTab === 'source'}
						onclick={() => (activeTab = 'source')}
					>
						<Code size={18} />
						<span>Source</span>
					</button>
				</div>
			</div>

			<!-- Tab Content -->
			<div class="tab-content">
				{#if activeTab === 'description'}
					<div class="description-tab">
						{#if description}
							<div class="description-text">
								{@html formattedDescription}
							</div>
						{:else}
							<p class="empty-state">No description available.</p>
						{/if}
					</div>
				{:else if activeTab === 'cli'}
					<div class="cli-tab">
						<p class="tab-intro">
							Use these commands with SynapSeq v3.5+ to run or export the sequence:
						</p>

						<div class="cli-commands">
							<div class="cli-item">
								<div class="cli-header">
									<h4>Play Sequence</h4>
									<button class="copy-btn" onclick={copyPlayCommand}>
										<Copy size={14} />
										<span>{copyPlayButtonText}</span>
									</button>
								</div>
								<code class="cli-code">{playCommand}</code>
							</div>

							<div class="cli-item">
								<div class="cli-header">
									<h4>Export to WAV</h4>
									<button class="copy-btn" onclick={copyWavCommand}>
										<Copy size={14} />
										<span>{copyWavButtonText}</span>
									</button>
								</div>
								<code class="cli-code">{wavCommand}</code>
							</div>

							<div class="cli-item">
								<div class="cli-header">
									<h4>Export to MP3</h4>
									<button class="copy-btn" onclick={copyMp3Command}>
										<Copy size={14} />
										<span>{copyMp3ButtonText}</span>
									</button>
								</div>
								<code class="cli-code">{mp3Command}</code>
							</div>
						</div>
					</div>
				{:else if activeTab === 'dependencies'}
					<div class="dependencies-tab">
						<div class="dependencies-grid">
							{#each sequence.dependencies as dep}
								<a
									href={dep.download_url}
									class="dependency-card"
									target="_blank"
									rel="noopener noreferrer"
								>
									<div class="dep-type">{dep.type}</div>
									<div class="dep-name">{dep.name}</div>
								</a>
							{/each}
						</div>
					</div>
				{:else if activeTab === 'source'}
					<div class="source-tab">
						<pre class="source-code">{codeWithoutDescription}</pre>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<DownloadModal {sequence} bind:isOpen={isDownloadModalOpen} />

<!-- Fullscreen Player -->
{#if isPlayingInBrowser}
	<SynapSeqPlayer
		sequenceContent={processedSequenceContent}
		sequenceName={sequence.name}
		onClose={closePlayer}
	/>
{/if}

<!-- Fullscreen Player -->
{#if isPlayingInBrowser}
	<SynapSeqPlayer
		sequenceContent={processedSequenceContent}
		sequenceName={sequence.name}
		onClose={closePlayer}
	/>
{/if}

<style>
	.sequence-viewer {
		padding: 2rem 0;
		max-width: 56rem;
		margin: 0 auto;
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.75rem;
		color: rgb(55 65 81);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: 2rem;
	}

	.back-button:hover {
		background: rgb(249 250 251);
		border-color: rgb(209 213 219);
	}

	.back-button .icon {
		display: flex;
		color: rgb(107 114 128);
	}

	:global(.dark) .back-button {
		background: rgb(31 41 55);
		border-color: rgb(55 65 81);
		color: rgb(229 231 235);
	}

	:global(.dark) .back-button:hover {
		background: rgb(55 65 81 / 0.5);
		border-color: rgb(75 85 99);
	}

	/* Header Card */
	.header-card {
		background: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 1.5rem;
		padding: 2rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
	}

	:global(.dark) .header-card {
		background: rgb(31 41 55);
		border-color: rgb(55 65 81);
	}

	.header-top {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.metadata-top {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.sequence-title {
		font-size: 2rem;
		font-weight: 700;
		color: rgb(17 24 39);
		margin: 0;
		line-height: 1.2;
	}

	:global(.dark) .sequence-title {
		color: rgb(243 244 246);
	}

	.category-badge {
		display: inline-flex;
		padding: 0.375rem 0.75rem;
		background: rgb(219 234 254);
		color: rgb(30 64 175);
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 700;
		border: 1px solid rgb(191 219 254);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	:global(.dark) .category-badge {
		background: rgb(30 58 138 / 0.3);
		color: rgb(147 197 253);
		border-color: rgb(59 130 246 / 0.3);
	}

	.author {
		color: rgb(107 114 128);
		font-size: 0.875rem;
		font-weight: 500;
	}

	:global(.dark) .author {
		color: rgb(156 163 175);
	}

	.share-icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: rgb(249 250 251);
		border: 1px solid rgb(229 231 235);
		border-radius: 0.5rem;
		color: rgb(107 114 128);
		cursor: pointer;
		transition: all 0.2s;
		margin-left: auto;
	}

	.share-icon-button:hover {
		background: rgb(59 130 246);
		color: white;
		border-color: rgb(59 130 246);
		transform: translateY(-1px);
	}

	:global(.dark) .share-icon-button {
		background: rgb(17 24 39);
		border-color: rgb(55 65 81);
		color: rgb(156 163 175);
	}

	:global(.dark) .share-icon-button:hover {
		background: rgb(99 102 241);
		color: white;
		border-color: rgb(99 102 241);
	}

	/* Actions Grid */
	.actions-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1rem;
	}

	.action-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		border: none;
		border-radius: 0.75rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-button.primary {
		background: linear-gradient(135deg, rgb(59 130 246), rgb(37 99 235));
		color: white;
		box-shadow: 0 4px 6px rgb(59 130 246 / 0.3);
	}

	.action-button.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgb(59 130 246 / 0.4);
	}

	.action-button.secondary {
		background: white;
		color: rgb(55 65 81);
		border: 1.5px solid rgb(229 231 235);
	}

	.action-button.secondary:hover {
		border-color: rgb(209 213 219);
		background: rgb(249 250 251);
	}

	:global(.dark) .action-button.primary {
		background: linear-gradient(135deg, rgb(99 102 241), rgb(79 70 229));
	}

	:global(.dark) .action-button.secondary {
		background: rgb(17 24 39);
		color: rgb(229 231 235);
		border-color: rgb(55 65 81);
	}

	:global(.dark) .action-button.secondary:hover {
		background: rgb(31 41 55);
		border-color: rgb(75 85 99);
	}

	/* Tabs */
	.tabs-container {
		background: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 1rem 1rem 0 0;
		padding: 0.5rem;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.05);
	}

	:global(.dark) .tabs-container {
		background: rgb(31 41 55);
		border-color: rgb(55 65 81);
	}

	.tabs {
		display: flex;
		gap: 0.25rem;
	}

	.tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-radius: 0.5rem;
		color: rgb(107 114 128);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab:hover {
		background: rgb(249 250 251);
		color: rgb(55 65 81);
	}

	.tab.active {
		background: rgb(59 130 246);
		color: white;
	}

	:global(.dark) .tab {
		color: rgb(156 163 175);
	}

	:global(.dark) .tab:hover {
		background: rgb(55 65 81);
		color: rgb(229 231 235);
	}

	:global(.dark) .tab.active {
		background: rgb(99 102 241);
		color: white;
	}

	/* Tab Content */
	.tab-content {
		background: white;
		border: 1px solid rgb(229 231 235);
		border-top: none;
		border-radius: 0 0 1rem 1rem;
		padding: 2rem;
		min-height: 300px;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.05);
	}

	:global(.dark) .tab-content {
		background: rgb(31 41 55);
		border-color: rgb(55 65 81);
	}

	/* Description Tab */
	.description-tab {
		line-height: 1.7;
	}

	.description-text {
		color: rgb(55 65 81);
		font-size: 0.9375rem;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	:global(.dark) .description-text {
		color: rgb(209 213 219);
	}

	.description-text :global(.description-link) {
		color: rgb(59 130 246);
		text-decoration: underline;
		transition: color 0.2s;
	}

	.description-text :global(.description-link:hover) {
		color: rgb(37 99 235);
	}

	:global(.dark) .description-text :global(.description-link) {
		color: rgb(147 197 253);
	}

	.empty-state {
		text-align: center;
		color: rgb(156 163 175);
		font-size: 0.875rem;
		padding: 2rem;
	}

	/* CLI Tab */
	.cli-tab {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.tab-intro {
		color: rgb(107 114 128);
		font-size: 0.875rem;
		margin: 0;
	}

	:global(.dark) .tab-intro {
		color: rgb(156 163 175);
	}

	.cli-commands {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.cli-item {
		background: rgb(249 250 251);
		border: 1px solid rgb(229 231 235);
		border-radius: 0.75rem;
		padding: 1rem;
	}

	:global(.dark) .cli-item {
		background: rgb(17 24 39);
		border-color: rgb(55 65 81);
	}

	.cli-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.cli-header h4 {
		font-size: 0.75rem;
		font-weight: 600;
		color: rgb(107 114 128);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	:global(.dark) .cli-header h4 {
		color: rgb(156 163 175);
	}

	.copy-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: rgb(59 130 246);
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.copy-btn:hover {
		background: rgb(37 99 235);
	}

	.cli-code {
		display: block;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.875rem;
		color: rgb(30 64 175);
		word-break: break-all;
	}

	:global(.dark) .cli-code {
		color: rgb(147 197 253);
	}

	/* Dependencies Tab */
	.dependencies-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.dependency-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: rgb(249 250 251);
		border: 1px solid rgb(229 231 235);
		border-radius: 0.75rem;
		text-decoration: none;
		transition: all 0.2s;
	}

	.dependency-card:hover {
		border-color: rgb(59 130 246);
		box-shadow: 0 4px 6px rgb(0 0 0 / 0.05);
		transform: translateY(-2px);
	}

	:global(.dark) .dependency-card {
		background: rgb(17 24 39);
		border-color: rgb(55 65 81);
	}

	:global(.dark) .dependency-card:hover {
		border-color: rgb(99 102 241);
	}

	.dep-type {
		display: inline-block;
		width: fit-content;
		padding: 0.25rem 0.5rem;
		background: rgb(219 234 254);
		color: rgb(30 64 175);
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	:global(.dark) .dep-type {
		background: rgb(30 58 138 / 0.5);
		color: rgb(147 197 253);
	}

	.dep-name {
		color: rgb(16 185 129);
		font-size: 0.875rem;
		font-weight: 500;
	}

	:global(.dark) .dep-name {
		color: rgb(52 211 153);
	}

	/* Source Tab */
	.source-code {
		background: rgb(17 24 39);
		color: rgb(229 231 235);
		padding: 1.25rem;
		border-radius: 0.75rem;
		overflow-x: auto;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 0;
		border: 1px solid rgb(55 65 81);
	}

	/* Loading */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		gap: 1.5rem;
	}

	.spinner {
		width: 3rem;
		height: 3rem;
		border: 4px solid rgb(229 231 235);
		border-top-color: rgb(59 130 246);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	:global(.dark) .spinner {
		border-color: rgb(55 65 81);
		border-top-color: rgb(147 197 253);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-container p {
		color: rgb(107 114 128);
		font-size: 0.9375rem;
		font-weight: 500;
	}

	:global(.dark) .loading-container p {
		color: rgb(156 163 175);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.sequence-viewer {
			padding: 1rem 0;
		}

		.header-card {
			padding: 1.5rem;
		}

		.sequence-title {
			font-size: 1.5rem;
		}

		.actions-grid {
			grid-template-columns: 1fr;
		}

		.tabs {
			overflow-x: auto;
			scrollbar-width: none;
		}

		.tabs::-webkit-scrollbar {
			display: none;
		}

		.tab {
			flex-shrink: 0;
			white-space: nowrap;
		}

		.tab-content {
			padding: 1.5rem;
		}

		.dependencies-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
