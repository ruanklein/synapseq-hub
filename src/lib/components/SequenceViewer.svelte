<script lang="ts">
	import { ArrowLeft, Copy, ChevronDown } from 'lucide-svelte';
	import type { ManifestEntry } from '$lib/types';
	import DownloadModal from './DownloadModal.svelte';

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
	let copyButtonText = $state('Copy');
	let isDownloadModalOpen = $state(false);

	const cliCommand = $derived(`synapseq -hub-get ${sequence.id} ${sequence.name}.wav`);

	async function loadSourceCode() {
		if (sourceCode) return;
		isLoadingSource = true;
		try {
			const response = await fetch(sequence.download_url);
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

	async function copyCommand() {
		try {
			await navigator.clipboard.writeText(cliCommand);
			copyButtonText = 'Copied!';
			setTimeout(() => {
				copyButtonText = 'Copy';
			}, 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	}

	// Check if description is long (more than 6 lines)
	const shouldShowReadMore = $derived(descriptionLines.length > 6);

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
					<h1 class="sequence-title">{sequence.name}</h1>
					<div class="metadata">
						<span class="category-badge">{sequence.category}</span>
						<span class="divider">•</span>
						<span class="author">by {sequence.author}</span>
					</div>
				</div>
				<button class="download-button-primary" onclick={handleDownloadClick}>
					Download Sequence
				</button>
			</div>
		</div>

		<!-- Main Content Card -->
		<div class="content-card">
			<!-- CLI Command Section -->
			<div class="cli-section">
				<h3 class="section-title">Run via CLI</h3>
				<p class="section-subtitle">Execute this command to generate the audio file:</p>
				<div class="cli-command-wrapper">
					<code class="cli-command">{cliCommand}</code>
					<button class="copy-button" onclick={copyCommand}>
						<div class="icon">
							<Copy size={16} />
						</div>
						<span>{copyButtonText}</span>
					</button>
				</div>
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
						{description}
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
</div>

<DownloadModal {sequence} bind:isOpen={isDownloadModalOpen} />

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
		border-radius: 1rem;
		padding: 2rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
	}

	:global(.dark) .header-card {
		background: rgb(31 41 55);
		border-color: rgb(55 65 81);
	}

	.header-content {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.title-section {
		flex: 1;
		min-width: 0;
	}

	.sequence-title {
		font-size: 2rem;
		font-weight: 700;
		color: rgb(17 24 39);
		margin: 0 0 0.75rem 0;
		background: linear-gradient(135deg, rgb(37 99 235), rgb(6 182 212));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	:global(.dark) .sequence-title {
		background: linear-gradient(135deg, rgb(96 165 250), rgb(34 211 238));
		-webkit-background-clip: text;
		background-clip: text;
	}

	.metadata {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.category-badge {
		display: inline-flex;
		padding: 0.375rem 0.75rem;
		background: rgb(219 234 254);
		color: rgb(30 64 175);
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		border: 1px solid rgb(191 219 254);
	}

	:global(.dark) .category-badge {
		background: rgb(30 58 138 / 0.3);
		color: rgb(147 197 253);
		border-color: rgb(59 130 246 / 0.3);
	}

	.divider {
		color: rgb(209 213 219);
	}

	:global(.dark) .divider {
		color: rgb(75 85 99);
	}

	.author {
		color: rgb(107 114 128);
		font-size: 0.875rem;
	}

	:global(.dark) .author {
		color: rgb(156 163 175);
	}

	.download-button-primary {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74));
		color: white;
		border: none;
		border-radius: 0.75rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 6px rgb(0 0 0 / 0.1);
		white-space: nowrap;
	}

	.download-button-primary:hover {
		background: linear-gradient(135deg, rgb(22 163 74), rgb(21 128 61));
		box-shadow: 0 6px 8px rgb(0 0 0 / 0.15);
		transform: translateY(-2px);
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
		.header-content {
			flex-direction: column;
			align-items: stretch;
		}

		.download-button-primary {
			width: 100%;
		}

		.cli-command-wrapper {
			flex-direction: column;
			align-items: stretch;
		}

		.copy-button {
			width: 100%;
			justify-content: center;
		}

		.sequence-title {
			font-size: 1.5rem;
		}
	}
</style>
