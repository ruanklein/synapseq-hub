<script lang="ts">
	import { X } from 'lucide-svelte';
	import JSZip from 'jszip';
	import type { ManifestEntry } from '$lib/types';

	let {
		sequence,
		isOpen = $bindable(false)
	}: {
		sequence: ManifestEntry;
		isOpen?: boolean;
	} = $props();

	let countdown = $state(3);
	let downloadStarted = $state(false);
	let countdownTimer: ReturnType<typeof setInterval> | null = null;

	const zipName = $derived(`${sequence.name}.zip`);
	const folderName = $derived(sequence.name);
	const sequenceName = $derived(sequence.name);

	const unzipWindows = $derived(`Expand-Archive -Path ${zipName} -DestinationPath .`);
	const unzipUnix = $derived(`unzip ${zipName}`);
	const cdCommand = $derived(`cd ${folderName}`);
	const generateCommand = $derived(`synapseq ${sequenceName}.spsq ${sequenceName}.wav`);

	$effect(() => {
		if (isOpen && !downloadStarted) {
			startCountdown();
		}
		return () => {
			if (countdownTimer) {
				clearInterval(countdownTimer);
				countdownTimer = null;
			}
		};
	});

	function startCountdown() {
		countdown = 3;
		downloadStarted = false;

		countdownTimer = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				if (countdownTimer) {
					clearInterval(countdownTimer);
					countdownTimer = null;
				}
				handleDownload();
				downloadStarted = true;
			}
		}, 1000);
	}

	function closeModal() {
		if (countdownTimer) {
			clearInterval(countdownTimer);
			countdownTimer = null;
		}
		isOpen = false;
		downloadStarted = false;
		countdown = 3;
	}

	async function copyCode(text: string, event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		try {
			await navigator.clipboard.writeText(text);
			button.classList.add('copied');
			setTimeout(() => {
				button.classList.remove('copied');
			}, 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	}

	async function trackDownload(id: string) {
		// Only track downloads in production
		if (import.meta.env.DEV) {
			console.log('[DEV] Download tracking skipped for:', id);
			return;
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 3000);

		try {
			const res = await fetch('https://us-central1-synapseq-hub.cloudfunctions.net/trackDownload', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-SYNAPSEQ-SOURCE': 'WEB',
					'X-SYNAPSEQ-ACTION': 'DOWNLOAD'
				},
				body: JSON.stringify({ id }),
				signal: controller.signal
			});

			if (!res.ok) {
				console.warn(`Tracking failed: HTTP ${res.status}`);
				return;
			}

			const data = await res.json();
			if (!data.success) {
				console.warn('Tracking returned non-success:', data);
			}
		} catch (err: any) {
			if (err.name === 'AbortError') {
				console.warn('Tracking request timed out');
			} else {
				console.error('Tracking request failed:', err);
			}
		} finally {
			clearTimeout(timeout);
		}
	}

	async function handleDownload() {
		try {
			const zip = new JSZip();
			const folder = zip.folder(sequence.name);

			if (!folder) return;

			// Add main sequence file
			const seqResp = await fetch(sequence.download_url);
			folder.file(`${sequence.name}.spsq`, await seqResp.text());

			// Add dependencies
			for (const dep of sequence.dependencies || []) {
				const res = await fetch(dep.download_url);
				if (!res.ok) continue;

				const fname = dep.download_url.split('/').pop() || dep.name;

				if (fname.endsWith('.wav')) {
					const buffer = await res.arrayBuffer();
					folder.file(fname, buffer);
				} else {
					const text = await res.text();
					folder.file(fname, text);
				}
			}

			// Generate and download ZIP
			const blob = await zip.generateAsync({ type: 'blob' });
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = zipName;
			link.click();

			// Track download
			trackDownload(sequence.id)
				.then(() => {
					console.log('Download tracked successfully');
				})
				.catch((err) => {
					console.error('Error tracking download:', err);
				});
		} catch (error) {
			console.error('Failed to create ZIP:', error);
		}
	}
</script>

{#if isOpen}
	<div
		class="modal-overlay"
		onclick={closeModal}
		role="presentation"
		onkeydown={(e) => e.key === 'Escape' && closeModal()}
	>
		<div
			class="modal-content"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<button class="modal-close" onclick={closeModal} aria-label="Close modal">
				<X size={20} />
			</button>

			<h2>Download Instructions</h2>

			<div class="instructions">
				<h3>After downloading, follow these steps:</h3>

				<div class="step">
					<span class="step-number">1</span>
					<div class="step-content">
						<p><strong>Extract the ZIP file:</strong></p>
						<p class="step-label">Windows (PowerShell):</p>
						<div class="code-wrapper">
							<code>{unzipWindows}</code>
							<button
								class="copy-code-btn"
								onclick={(e) => copyCode(unzipWindows, e)}
								aria-label="Copy Windows unzip command"
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<rect
										x="4"
										y="4"
										width="8"
										height="10"
										rx="1"
										stroke="currentColor"
										stroke-width="1.5"
									/>
									<path
										d="M12 4V2.5C12 1.67 11.33 1 10.5 1H5.5C4.67 1 4 1.67 4 2.5V4"
										stroke="currentColor"
										stroke-width="1.5"
									/>
								</svg>
							</button>
						</div>
						<p class="step-label">macOS / Linux:</p>
						<div class="code-wrapper">
							<code>{unzipUnix}</code>
							<button
								class="copy-code-btn"
								onclick={(e) => copyCode(unzipUnix, e)}
								aria-label="Copy Unix unzip command"
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<rect
										x="4"
										y="4"
										width="8"
										height="10"
										rx="1"
										stroke="currentColor"
										stroke-width="1.5"
									/>
									<path
										d="M12 4V2.5C12 1.67 11.33 1 10.5 1H5.5C4.67 1 4 1.67 4 2.5V4"
										stroke="currentColor"
										stroke-width="1.5"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>

				<div class="step">
					<span class="step-number">2</span>
					<div class="step-content">
						<p><strong>Navigate to the extracted folder:</strong></p>
						<div class="code-wrapper">
							<code>{cdCommand}</code>
							<button
								class="copy-code-btn"
								onclick={(e) => copyCode(cdCommand, e)}
								aria-label="Copy cd command"
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<rect
										x="4"
										y="4"
										width="8"
										height="10"
										rx="1"
										stroke="currentColor"
										stroke-width="1.5"
									/>
									<path
										d="M12 4V2.5C12 1.67 11.33 1 10.5 1H5.5C4.67 1 4 1.67 4 2.5V4"
										stroke="currentColor"
										stroke-width="1.5"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>

				<div class="step">
					<span class="step-number">3</span>
					<div class="step-content">
						<p><strong>Use SynapSeq 3.5+:</strong></p>

						<p class="step-label">Play audio directly:</p>
						<div class="code-wrapper">
							<code>synapseq -play {sequenceName}.spsq</code>
							<button
								class="copy-code-btn"
								onclick={(e) => copyCode(`synapseq -play ${sequenceName}.spsq`, e)}
								aria-label="Copy play command"
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<rect
										x="4"
										y="4"
										width="8"
										height="10"
										rx="1"
										stroke="currentColor"
										stroke-width="1.5"
									/>
									<path
										d="M12 4V2.5C12 1.67 11.33 1 10.5 1H5.5C4.67 1 4 1.67 4 2.5V4"
										stroke="currentColor"
										stroke-width="1.5"
									/>
								</svg>
							</button>
						</div>

						<p class="step-label">Or generate WAV file:</p>
						<div class="code-wrapper">
							<code>{generateCommand}</code>
							<button
								class="copy-code-btn"
								onclick={(e) => copyCode(generateCommand, e)}
								aria-label="Copy WAV command"
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<rect
										x="4"
										y="4"
										width="8"
										height="10"
										rx="1"
										stroke="currentColor"
										stroke-width="1.5"
									/>
									<path
										d="M12 4V2.5C12 1.67 11.33 1 10.5 1H5.5C4.67 1 4 1.67 4 2.5V4"
										stroke="currentColor"
										stroke-width="1.5"
									/>
								</svg>
							</button>
						</div>

						<p class="step-label">Or generate MP3 file:</p>
						<div class="code-wrapper">
							<code>synapseq -mp3 {sequenceName}.spsq {sequenceName}.mp3</code>
							<button
								class="copy-code-btn"
								onclick={(e) =>
									copyCode(`synapseq -mp3 ${sequenceName}.spsq ${sequenceName}.mp3`, e)}
								aria-label="Copy MP3 command"
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<rect
										x="4"
										y="4"
										width="8"
										height="10"
										rx="1"
										stroke="currentColor"
										stroke-width="1.5"
									/>
									<path
										d="M12 4V2.5C12 1.67 11.33 1 10.5 1H5.5C4.67 1 4 1.67 4 2.5V4"
										stroke="currentColor"
										stroke-width="1.5"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>

			<button
				class="download-btn"
				class:countdown={!downloadStarted}
				disabled={!downloadStarted}
				onclick={downloadStarted ? handleDownload : undefined}
			>
				{#if downloadStarted}
					<span>Download Again</span>
				{:else}
					<span>Download starting in <strong>{countdown}</strong>...</span>
				{/if}
			</button>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: white;
		border-radius: 1rem;
		padding: 2rem;
		max-width: 42rem;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
	}

	:global(.dark) .modal-content {
		background: rgb(31 41 55);
	}

	.modal-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgb(243 244 246);
		border: none;
		border-radius: 0.5rem;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		color: rgb(55 65 81);
	}

	.modal-close:hover {
		background: rgb(229 231 235);
		color: rgb(17 24 39);
	}

	:global(.dark) .modal-close {
		background: rgb(55 65 81);
		color: rgb(209 213 219);
	}

	:global(.dark) .modal-close:hover {
		background: rgb(75 85 99);
		color: rgb(243 244 246);
	}

	h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: rgb(17 24 39);
		margin-bottom: 1.5rem;
		padding-right: 2.5rem;
	}

	:global(.dark) h2 {
		color: rgb(243 244 246);
	}

	.instructions h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: rgb(55 65 81);
		margin-bottom: 1.5rem;
	}

	:global(.dark) .instructions h3 {
		color: rgb(209 213 219);
	}

	.step {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.step:last-child {
		margin-bottom: 0;
	}

	.step-number {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		background: linear-gradient(135deg, rgb(59 130 246) 0%, rgb(37 99 235) 100%);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.875rem;
	}

	.step-content {
		flex: 1;
	}

	.step-content p {
		color: rgb(55 65 81);
		margin-bottom: 0.5rem;
		font-size: 0.9375rem;
	}

	:global(.dark) .step-content p {
		color: rgb(209 213 219);
	}

	.step-label {
		font-size: 0.8125rem;
		color: rgb(107 114 128);
		font-weight: 600;
		margin-top: 1rem;
		margin-bottom: 0.375rem;
	}

	:global(.dark) .step-label {
		color: rgb(156 163 175);
	}

	.code-wrapper {
		position: relative;
		background: rgb(249 250 251);
		border: 1px solid rgb(229 231 235);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		margin-bottom: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	:global(.dark) .code-wrapper {
		background: rgb(17 24 39);
		border-color: rgb(55 65 81);
	}

	.code-wrapper code {
		flex: 1;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.8125rem;
		color: rgb(30 64 175);
		word-break: break-all;
	}

	:global(.dark) .code-wrapper code {
		color: rgb(147 197 253);
	}

	.copy-code-btn {
		flex-shrink: 0;
		background: transparent;
		border: none;
		color: rgb(107 114 128);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.25rem;
		transition: all 0.2s;
		display: flex;
		align-items: center;
	}

	.copy-code-btn:hover {
		color: rgb(59 130 246);
		background: rgb(239 246 255);
	}

	:global(.dark) .copy-code-btn {
		color: rgb(156 163 175);
	}

	:global(.dark) .copy-code-btn:hover {
		color: rgb(147 197 253);
		background: rgb(30 58 138 / 0.3);
	}

	.copy-code-btn:global(.copied) {
		color: rgb(34 197 94);
	}

	:global(.dark) .copy-code-btn:global(.copied) {
		color: rgb(134 239 172);
	}

	.download-btn {
		width: 100%;
		padding: 1rem;
		background: linear-gradient(135deg, rgb(59 130 246) 0%, rgb(37 99 235) 100%);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		margin-top: 2rem;
	}

	.download-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, rgb(37 99 235) 0%, rgb(29 78 216) 100%);
		transform: translateY(-1px);
		box-shadow: 0 6px 10px -1px rgba(0, 0, 0, 0.15);
	}

	.download-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.download-btn.countdown {
		background: rgb(107 114 128);
	}

	:global(.dark) .download-btn.countdown {
		background: rgb(75 85 99);
	}

	.download-btn strong {
		font-weight: 700;
		font-size: 1.125rem;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.modal-content {
			padding: 1.5rem;
		}

		h2 {
			font-size: 1.25rem;
		}

		.step {
			gap: 0.75rem;
		}

		.step-number {
			width: 1.75rem;
			height: 1.75rem;
			font-size: 0.8125rem;
		}
	}
</style>
