<script lang="ts">
	import { ArrowLeft, Copy, ChevronDown, Play, Download } from 'lucide-svelte';
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

	let descriptionExpanded = $state(false);
	let dependenciesExpanded = $state(false);
	let sourceCodeExpanded = $state(false);
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

	const playCommand = $derived(`synapseq -play -hub-get ${sequence.id}`);
	const wavCommand = $derived(`synapseq -hub-get ${sequence.id}`);
	const mp3Command = $derived(`synapseq -mp3 -hub-get ${sequence.id}`);

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

	function toggleSourceCode() {
		sourceCodeExpanded = !sourceCodeExpanded;
		if (sourceCodeExpanded) {
			loadSourceCode();
		}
	}

	function toggleDependencies() {
		dependenciesExpanded = !dependenciesExpanded;
	}

	function toggleDescription() {
		descriptionExpanded = !descriptionExpanded;
	}

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

	// Check if description is long (more than 6 lines)
	const shouldShowReadMore = $derived(descriptionLines.length > 6);

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
			<div class="header-content">
				<div class="title-section">
					<div class="metadata-top">
						<span class="category-badge">{sequence.category}</span>
						<span class="author">by {sequence.author}</span>
					</div>
					<h1 class="sequence-title">{sequence.name}</h1>
				</div>
			</div>

			<!-- Primary CTA Section -->
			{#if !isPlayingInBrowser}
				<div class="cta-section">
					<button class="play-button-primary" onclick={() => playBrowser(sequence.id)}>
						<div class="play-icon-wrapper">
							<Play size={24} strokeWidth={2.5} fill="currentColor" />
						</div>
						<div class="play-text">
							<span class="play-label">Listen Now</span>
							<span class="play-subtitle">Stream instantly in your browser</span>
						</div>
					</button>
				</div>
			{/if}
		</div>

		{#if !isPlayingInBrowser}
			<!-- Main Content Card -->
			<div class="content-card">
				<!-- CLI Command Section -->
				<div class="cli-section">
					<h3 class="section-title">Run via CLI</h3>
					<p class="section-subtitle">
						Choose one of the following commands (requires SynapSeq v3.5+):
					</p>

					<div class="cli-commands-grid">
						<!-- Play Command -->
						<div class="cli-command-item">
							<h4 class="command-title">Play Sequence</h4>
							<div class="cli-command-wrapper">
								<code class="cli-command">{playCommand}</code>
								<button class="copy-button" onclick={copyPlayCommand}>
									<div class="icon">
										<Copy size={16} />
									</div>
									<span>{copyPlayButtonText}</span>
								</button>
							</div>
						</div>

						<!-- WAV Export Command -->
						<div class="cli-command-item">
							<h4 class="command-title">Export to WAV</h4>
							<div class="cli-command-wrapper">
								<code class="cli-command">{wavCommand}</code>
								<button class="copy-button" onclick={copyWavCommand}>
									<div class="icon">
										<Copy size={16} />
									</div>
									<span>{copyWavButtonText}</span>
								</button>
							</div>
						</div>

						<!-- MP3 Export Command -->
						<div class="cli-command-item">
							<h4 class="command-title">Export to MP3</h4>
							<div class="cli-command-wrapper">
								<code class="cli-command">{mp3Command}</code>
								<button class="copy-button" onclick={copyMp3Command}>
									<div class="icon">
										<Copy size={16} />
									</div>
									<span>{copyMp3ButtonText}</span>
								</button>
							</div>
						</div>
					</div>

					<!-- OR Divider -->
					<div class="or-divider">
						<span class="or-text">OR</span>
					</div>

					<!-- Download Ghost Button -->
					<button class="download-ghost-button" onclick={handleDownloadClick}>
						<Download size={18} strokeWidth={2} />
						<span>Download sequence in .spsq</span>
					</button>
				</div>

				<!-- Description Section -->
				{#if description}
					<div class="section-divider"></div>
					<div class="description-section">
						<h3 class="section-title">Description</h3>
						<div
							class="description-content"
							class:collapsed={!descriptionExpanded && shouldShowReadMore}
						>
							{@html formattedDescription}
						</div>
						{#if shouldShowReadMore}
							<button class="read-more-button" onclick={toggleDescription}>
								{descriptionExpanded ? 'Read less' : 'Read more'}
							</button>
						{/if}
					</div>
				{/if}

				<!-- Dependencies Section -->
				{#if sequence.dependencies && sequence.dependencies.length > 0}
					<div class="section-divider"></div>
					<div class="collapsible-section">
						<button class="section-toggle" onclick={toggleDependencies}>
							<h3 class="section-title">Dependencies</h3>
							<div class="icon chevron" class:expanded={dependenciesExpanded}>
								<ChevronDown size={20} />
							</div>
						</button>
						{#if dependenciesExpanded}
							<div class="section-content">
								<div class="dependencies-list">
									{#each sequence.dependencies as dep}
										<div class="dependency-item">
											<span class="dependency-type">{dep.type}</span>
											<a
												href={dep.download_url}
												class="dependency-name"
												target="_blank"
												rel="noopener noreferrer"
											>
												{dep.name}
											</a>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Source Code Section -->
				<div class="section-divider"></div>
				<div class="collapsible-section">
					<button class="section-toggle" onclick={toggleSourceCode}>
						<h3 class="section-title">Source Code</h3>
						<div class="icon chevron" class:expanded={sourceCodeExpanded}>
							<ChevronDown size={20} />
						</div>
					</button>
					{#if sourceCodeExpanded}
						<div class="section-content">
							{#if isLoadingSource}
								<div class="loading-source">Loading source code...</div>
							{:else}
								<pre class="source-code">{codeWithoutDescription}</pre>
							{/if}
						</div>
					{/if}
				</div>
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
		background: linear-gradient(135deg, rgb(249 250 251) 0%, white 100%);
		border: 1px solid rgb(229 231 235);
		border-radius: 1.5rem;
		padding: 2.5rem;
		margin-bottom: 1.5rem;
		box-shadow:
			0 4px 6px rgb(0 0 0 / 0.05),
			0 1px 3px rgb(0 0 0 / 0.1);
	}

	:global(.dark) .header-card {
		background: linear-gradient(135deg, rgb(31 41 55) 0%, rgb(17 24 39) 100%);
		border-color: rgb(55 65 81);
	}

	.header-content {
		margin-bottom: 2rem;
	}

	.title-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.metadata-top {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.sequence-title {
		font-size: 2.5rem;
		font-weight: 800;
		color: rgb(17 24 39);
		margin: 0;
		line-height: 1.2;
		letter-spacing: -0.02em;
	}

	:global(.dark) .sequence-title {
		color: rgb(243 244 246);
	}

	.category-badge {
		display: inline-flex;
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, rgb(219 234 254), rgb(191 219 254));
		color: rgb(30 64 175);
		border-radius: 0.75rem;
		font-size: 0.875rem;
		font-weight: 700;
		border: 1px solid rgb(191 219 254);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	:global(.dark) .category-badge {
		background: linear-gradient(135deg, rgb(30 58 138 / 0.4), rgb(30 64 175 / 0.2));
		color: rgb(147 197 253);
		border-color: rgb(59 130 246 / 0.3);
	}

	.author {
		color: rgb(107 114 128);
		font-size: 0.9375rem;
		font-weight: 500;
	}

	:global(.dark) .author {
		color: rgb(156 163 175);
	}

	/* CTA Section */
	.cta-section {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.play-button-primary {
		flex: 1;
		min-width: 280px;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.75rem;
		background: linear-gradient(135deg, rgb(79 70 229), rgb(59 130 246));
		color: white;
		border: none;
		border-radius: 1rem;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow:
			0 10px 15px -3px rgb(79 70 229 / 0.3),
			0 4px 6px -4px rgb(79 70 229 / 0.3);
		position: relative;
		overflow: hidden;
	}

	.play-button-primary::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.play-button-primary:hover::before {
		opacity: 1;
	}

	.play-button-primary:hover {
		transform: translateY(-2px);
		box-shadow:
			0 20px 25px -5px rgb(79 70 229 / 0.4),
			0 8px 10px -6px rgb(79 70 229 / 0.4);
	}

	:global(.dark) .play-button-primary {
		background: linear-gradient(135deg, rgb(99 102 241), rgb(59 130 246));
		box-shadow:
			0 10px 15px -3px rgb(99 102 241 / 0.4),
			0 4px 6px -4px rgb(99 102 241 / 0.4);
	}

	:global(.dark) .play-button-primary:hover {
		box-shadow:
			0 20px 25px -5px rgb(99 102 241 / 0.5),
			0 8px 10px -6px rgb(99 102 241 / 0.5);
	}

	.play-icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		flex-shrink: 0;
	}

	.play-text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.125rem;
		text-align: left;
	}

	.play-label {
		font-size: 1.125rem;
		font-weight: 800;
		line-height: 1.2;
	}

	.play-subtitle {
		font-size: 0.8125rem;
		font-weight: 400;
		opacity: 0.85;
	}

	/* Main Content Card */
	.content-card {
		background: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
	}

	:global(.dark) .content-card {
		background: rgb(31 41 55);
		border-color: rgb(55 65 81);
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: rgb(17 24 39);
		margin: 0;
	}

	:global(.dark) .section-title {
		color: rgb(243 244 246);
	}

	.section-subtitle {
		color: rgb(107 114 128);
		font-size: 0.875rem;
		margin: 0.5rem 0 1rem 0;
	}

	:global(.dark) .section-subtitle {
		color: rgb(156 163 175);
	}

	.section-divider {
		height: 1px;
		background: rgb(229 231 235);
		margin: 2rem 0;
	}

	:global(.dark) .section-divider {
		background: rgb(55 65 81);
	}

	/* CLI Section */
	.cli-section {
		margin-bottom: 0;
	}

	.cli-commands-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.cli-command-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.command-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgb(75 85 99);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	:global(.dark) .command-title {
		color: rgb(156 163 175);
	}

	.cli-command-wrapper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgb(249 250 251);
		border: 1px solid rgb(229 231 235);
		border-radius: 0.75rem;
		padding: 1rem 1.25rem;
	}

	:global(.dark) .cli-command-wrapper {
		background: rgb(17 24 39);
		border-color: rgb(55 65 81);
	}

	.cli-command {
		flex: 1;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.875rem;
		color: rgb(30 64 175);
		word-break: break-all;
	}

	:global(.dark) .cli-command {
		color: rgb(147 197 253);
	}

	.copy-button {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		background: rgb(59 130 246);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.copy-button:hover {
		background: rgb(37 99 235);
	}

	.copy-button .icon {
		display: flex;
	}

	/* OR Divider */
	.or-divider {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 1.5rem 0 1rem 0;
	}

	.or-divider::before,
	.or-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: rgb(229 231 235);
	}

	:global(.dark) .or-divider::before,
	:global(.dark) .or-divider::after {
		background: rgb(55 65 81);
	}

	.or-text {
		color: rgb(156 163 175);
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	:global(.dark) .or-text {
		color: rgb(107 114 128);
	}

	/* Download Ghost Button */
	.download-ghost-button {
		width: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.875rem 1.25rem;
		background: transparent;
		border: 1.5px dashed rgb(209 213 219);
		color: rgb(107 114 128);
		border-radius: 0.75rem;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.download-ghost-button:hover {
		border-color: rgb(59 130 246);
		border-style: solid;
		color: rgb(59 130 246);
		background: rgb(239 246 255);
	}

	:global(.dark) .download-ghost-button {
		border-color: rgb(75 85 99);
		color: rgb(156 163 175);
	}

	:global(.dark) .download-ghost-button:hover {
		border-color: rgb(99 102 241);
		border-style: solid;
		color: rgb(147 197 253);
		background: rgb(30 58 138 / 0.15);
	}

	/* Description Section */
	.description-section {
		margin-bottom: 0;
	}

	.description-content {
		color: rgb(55 65 81);
		line-height: 1.7;
		font-size: 0.9375rem;
		position: relative;
		white-space: pre-wrap;
		margin-top: 0.75rem;
		word-wrap: break-word;
		overflow-wrap: break-word;
		word-break: break-word;
	}

	.description-content.collapsed {
		max-height: 6rem;
		overflow: hidden;
	}

	.description-content.collapsed::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2rem;
		background: linear-gradient(to bottom, transparent, white);
		pointer-events: none;
	}

	:global(.dark) .description-content.collapsed::after {
		background: linear-gradient(to bottom, transparent, rgb(31 41 55));
	}

	:global(.dark) .description-content {
		color: rgb(209 213 219);
	}

	.read-more-button {
		margin-top: 0.75rem;
		color: rgb(59 130 246);
		background: none;
		border: none;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		padding: 0;
		transition: color 0.2s;
	}

	.read-more-button:hover {
		color: rgb(37 99 235);
		text-decoration: underline;
	}

	:global(.dark) .read-more-button {
		color: rgb(147 197 253);
	}

	/* Description Links */
	.description-content :global(.description-link) {
		color: rgb(59 130 246);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: all 0.2s ease;
		word-break: break-all;
	}

	.description-content :global(.description-link:visited) {
		color: rgb(139 92 246);
	}

	.description-content :global(.description-link:hover) {
		color: rgb(37 99 235);
	}

	:global(.dark) .description-content :global(.description-link) {
		color: rgb(147 197 253);
	}

	:global(.dark) .description-content :global(.description-link:visited) {
		color: rgb(196 181 253);
	}

	:global(.dark) .description-content :global(.description-link:hover) {
		color: rgb(96 165 250);
	}

	/* lor: rgb(147 197 253);
	}

	/* Collapsible Sections */
	.collapsible-section {
		margin-bottom: 0;
	}

	.section-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.section-toggle:hover {
		opacity: 0.7;
	}

	.section-toggle .icon.chevron {
		display: flex;
		color: rgb(107 114 128);
		transition: transform 0.2s;
	}

	.section-toggle .icon.chevron.expanded {
		transform: rotate(180deg);
	}

	:global(.dark) .section-toggle .icon.chevron {
		color: rgb(156 163 175);
	}

	.section-content {
		padding-top: 1rem;
	}

	/* Dependencies */
	.dependencies-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.dependency-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: rgb(249 250 251);
		border: 1px solid rgb(229 231 235);
		border-radius: 0.5rem;
	}

	:global(.dark) .dependency-item {
		background: rgb(17 24 39);
		border-color: rgb(55 65 81);
	}

	.dependency-type {
		padding: 0.25rem 0.625rem;
		background: rgb(219 234 254);
		color: rgb(30 64 175);
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	:global(.dark) .dependency-type {
		background: rgb(30 58 138 / 0.5);
		color: rgb(147 197 253);
	}

	.dependency-name {
		font-size: 0.875rem;
		color: rgb(16 185 129);
		font-weight: 500;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.dependency-name:hover {
		color: rgb(5 150 105);
		text-decoration: underline;
	}

	:global(.dark) .dependency-name {
		color: rgb(52 211 153);
	}

	:global(.dark) .dependency-name:hover {
		color: rgb(110 231 183);
	}

	/* Source Code */
	.loading-source {
		text-align: center;
		padding: 2rem;
		color: rgb(107 114 128);
		font-size: 0.875rem;
	}

	:global(.dark) .loading-source {
		color: rgb(156 163 175);
	}

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
		.cta-section {
			flex-direction: column;
		}

		.play-button-primary {
			min-width: 100%;
		}

		.cli-command-wrapper {
			flex-direction: column;
			align-items: stretch;
		}

		.cli-commands-grid {
			gap: 1.25rem;
		}

		.copy-button {
			width: 100%;
			justify-content: center;
		}

		.sequence-title {
			font-size: 1.75rem;
		}
	}
</style>
