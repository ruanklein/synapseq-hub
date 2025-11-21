<script lang="ts">
	import { ArrowLeft, Copy, ChevronDown } from 'lucide-svelte';
	import type { ManifestEntry } from '$lib/types';

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
</script>

<div class="sequence-viewer">
	<button class="back-button" onclick={onBack}>
		<div class="icon">
			<ArrowLeft size={20} />
		</div>
		<span>Back</span>
	</button>

	<div class="viewer-content">
		<!-- CLI Command Section -->
		<div class="cli-section">
			<p class="cli-label">Run this sequence via CLI:</p>
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
			<div class="description-section">
				<h3>Description</h3>
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
			<div class="collapsible-section">
				<button class="section-toggle" onclick={toggleDependencies}>
					<div class="icon chevron" class:expanded={dependenciesExpanded}>
						<ChevronDown size={16} />
					</div>
					<span>{dependenciesExpanded ? 'Hide' : 'Show'} dependencies</span>
				</button>
				{#if dependenciesExpanded}
					<div class="section-content">
						<div class="dependencies-list">
							{#each sequence.dependencies as dep}
								<div class="dependency-item">
									<span class="dependency-type">{dep.type}</span>
									<span class="dependency-name">{dep.name}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Source Code Section -->
		<div class="collapsible-section">
			<button class="section-toggle" onclick={toggleSourceCode}>
				<div class="icon chevron" class:expanded={sourceCodeExpanded}>
					<ChevronDown size={16} />
				</div>
				<span>{sourceCodeExpanded ? 'Hide' : 'Show'} source code</span>
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

		<!-- Download Button -->
		<div class="actions">
			<button class="download-button">Download Sequence</button>
		</div>
	</div>
</div>

<style>
	.sequence-viewer {
		padding: 2rem 0;
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.5rem;
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

	:global(.dark) .back-button .icon {
		color: rgb(156 163 175);
	}

	.viewer-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* CLI Section */
	.cli-section {
		background: linear-gradient(135deg, rgb(219 234 254) 0%, rgb(191 219 254) 100%);
		border: 1px solid rgb(147 197 253);
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	:global(.dark) .cli-section {
		background: linear-gradient(135deg, rgb(30 58 138 / 0.3) 0%, rgb(29 78 216 / 0.3) 100%);
		border-color: rgb(59 130 246 / 0.5);
	}

	.cli-label {
		font-weight: 600;
		color: rgb(30 64 175);
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
	}

	:global(.dark) .cli-label {
		color: rgb(147 197 253);
	}

	.cli-command-wrapper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: white;
		border: 1px solid rgb(191 219 254);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
	}

	:global(.dark) .cli-command-wrapper {
		background: rgb(17 24 39);
		border-color: rgb(59 130 246 / 0.3);
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
		border-radius: 0.375rem;
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
		background: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	:global(.dark) .description-section {
		background: rgb(31 41 55);
		border-color: rgb(55 65 81);
	}

	.description-section h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: rgb(17 24 39);
		margin-bottom: 0.75rem;
	}

	:global(.dark) .description-section h3 {
		color: rgb(243 244 246);
	}

	.description-content {
		color: rgb(55 65 81);
		line-height: 1.6;
		font-size: 0.9375rem;
		position: relative;
		white-space: pre-wrap;
	}

	.description-content.collapsed {
		max-height: 4.5rem;
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
	}

	:global(.dark) .read-more-button {
		color: rgb(147 197 253);
	}

	:global(.dark) .read-more-button:hover {
		color: rgb(191 219 254);
	}

	/* Collapsible Sections */
	.collapsible-section {
		background: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.75rem;
		overflow: hidden;
	}

	:global(.dark) .collapsible-section {
		background: rgb(31 41 55);
		border-color: rgb(55 65 81);
	}

	.section-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		background: none;
		border: none;
		color: rgb(17 24 39);
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
		text-align: left;
	}

	.section-toggle:hover {
		background: rgb(249 250 251);
	}

	:global(.dark) .section-toggle {
		color: rgb(243 244 246);
	}

	:global(.dark) .section-toggle:hover {
		background: rgb(55 65 81 / 0.3);
	}

	.section-toggle .icon {
		display: flex;
		color: rgb(107 114 128);
		transition: transform 0.2s;
	}

	.section-toggle .icon.chevron.expanded {
		transform: rotate(180deg);
	}

	:global(.dark) .section-toggle .icon {
		color: rgb(156 163 175);
	}

	.section-content {
		padding: 0 1.5rem 1.5rem;
	}

	/* Dependencies List */
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
		color: rgb(55 65 81);
		font-weight: 500;
	}

	:global(.dark) .dependency-name {
		color: rgb(209 213 219);
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
		border-radius: 0.5rem;
		overflow-x: auto;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 0;
	}

	:global(.dark) .source-code {
		background: rgb(17 24 39);
		border: 1px solid rgb(55 65 81);
	}

	/* Actions */
	.actions {
		display: flex;
		justify-content: center;
		padding-top: 1rem;
	}

	.download-button {
		padding: 0.875rem 2rem;
		background: linear-gradient(135deg, rgb(59 130 246) 0%, rgb(37 99 235) 100%);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
	}

	.download-button:hover {
		background: linear-gradient(135deg, rgb(37 99 235) 0%, rgb(29 78 216) 100%);
		box-shadow: 0 6px 8px -1px rgb(0 0 0 / 0.15);
		transform: translateY(-1px);
	}

	.download-button:active {
		transform: translateY(0);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.cli-command-wrapper {
			flex-direction: column;
			align-items: stretch;
		}

		.copy-button {
			width: 100%;
			justify-content: center;
		}

		.sequence-viewer {
			padding: 1rem 0;
		}

		.back-button {
			margin-bottom: 1.5rem;
		}
	}
</style>
