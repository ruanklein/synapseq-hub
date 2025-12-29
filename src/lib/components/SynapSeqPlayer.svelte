<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Square, Loader2, AlertCircle } from 'lucide-svelte';
	import { synapseqPlayer } from '$lib/stores/synapseq.svelte';

	let {
		sequenceUrl,
		sequenceContent,
		sequenceName = '',
		onClose
	}: {
		sequenceUrl?: string;
		sequenceContent?: string;
		sequenceName?: string;
		onClose?: () => void;
	} = $props();

	let mounted = $state(false);
	let totalDuration = $state(0);
	let wakeLock: any = null;

	onMount(async () => {
		mounted = true;

		// Parse duration from sequence content
		if (sequenceContent) {
			totalDuration = parseDuration(sequenceContent);
		}

		// Request wake lock to prevent device from sleeping
		await requestWakeLock();

		// Initialize and load sequence, then auto-play
		try {
			// Ensure player is initialized (will be fresh if reset() was called)
			if (!synapseqPlayer.isReady) {
				await synapseqPlayer.initialize();
			}

			// Load sequence content
			if (sequenceContent) {
				await synapseqPlayer.loadSequence(sequenceContent, 'text');
				await handlePlay();
			} else if (sequenceUrl) {
				await loadSequence();
				await handlePlay();
			}
		} catch (error) {
			// Check if despite the error, the player is actually playing
			if (synapseqPlayer.state !== 'playing') {
				// Only log error if not playing
				console.error('Failed to initialize, load, or play:', error);
			}
		}
	});

	onDestroy(() => {
		releaseWakeLock();
		// Reset the player completely to avoid state issues
		synapseqPlayer.reset();
	});

	async function requestWakeLock() {
		if ('wakeLock' in navigator) {
			try {
				wakeLock = await (navigator as any).wakeLock.request('screen');
			} catch (err) {
				console.warn('Failed to acquire wake lock:', err);
			}
		}
	}

	function releaseWakeLock() {
		if (wakeLock) {
			wakeLock.release();
			wakeLock = null;
		}
	}

	function parseDuration(content: string): number {
		// Find the last timeline entry (format: hh:mm:ss preset)
		const lines = content.split('\n');
		const timelinePattern = /^(\d{2}):(\d{2}):(\d{2})\s+\w+/;

		let lastTime = 0;
		for (const line of lines) {
			const match = line.trim().match(timelinePattern);
			if (match) {
				const hours = parseInt(match[1]);
				const minutes = parseInt(match[2]);
				const seconds = parseInt(match[3]);
				lastTime = hours * 3600 + minutes * 60 + seconds;
			}
		}

		return lastTime;
	}

	async function loadSequence() {
		if (!sequenceUrl) return;
		await synapseqPlayer.loadFromUrl(sequenceUrl);
	}

	async function handlePlay() {
		try {
			// Double check player is ready
			if (!synapseqPlayer.isReady) {
				console.warn('Player not ready, waiting for initialization...');
				return; // Don't try to play if not ready
			}

			await synapseqPlayer.play();
		} catch (error) {
			console.error('Error playing sequence:', error);
			// Error will be shown in the UI via synapseqPlayer.error state
		}
	}

	function handleStop() {
		synapseqPlayer.stop();
		releaseWakeLock();
		if (onClose) {
			onClose();
		}
	}

	function formatTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);

		if (hours > 0) {
			return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	const progress = $derived(
		totalDuration > 0 ? (synapseqPlayer.currentTime / totalDuration) * 100 : 0
	);

	// Watch for state changes and auto-close when playback ends
	let previousState = $state<string>('');

	$effect(() => {
		const currentState = synapseqPlayer.state;

		// Detect when state changes from 'playing' to 'stopped' or 'idle' (playback ended)
		if (
			previousState === 'playing' &&
			(currentState === 'stopped' || currentState === 'idle') &&
			mounted
		) {
			// Audio finished playing, close the player after a brief moment
			setTimeout(() => {
				if (onClose) {
					onClose();
				}
			}, 500);
		}

		previousState = currentState;
	});
</script>

{#if !mounted}
	<div class="fullscreen-player loading">
		<div class="loading-content">
			<Loader2 class="spinner" />
			<span>Initializing SynapSeq...</span>
		</div>
	</div>
{:else if synapseqPlayer.error && synapseqPlayer.state !== 'playing'}
	<div class="fullscreen-player error">
		<div class="error-content">
			<AlertCircle class="error-icon" />
			<div>
				<p class="error-title">Error</p>
				<p class="error-message">{synapseqPlayer.error}</p>
			</div>
			<button onclick={handleStop} class="btn-close">Close</button>
		</div>
	</div>
{:else}
	<div class="fullscreen-player">
		<div class="player-content">
			<!-- Animated wave icon -->
			<div class="wave-icon">
				<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
					<circle cx="50" cy="50" r="45" class="wave-circle" />
					<path
						d="M 25 50 Q 35 35, 50 50 T 75 50"
						class="wave-line wave-1"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
					/>
					<path
						d="M 25 50 Q 35 65, 50 50 T 75 50"
						class="wave-line wave-2"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
					/>
					<path
						d="M 30 50 Q 40 40, 50 50 T 70 50"
						class="wave-line wave-3"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					/>
				</svg>
			</div>

			<!-- Status and title -->
			<div class="status-section">
				{#if synapseqPlayer.state === 'loading' || synapseqPlayer.state === 'generating'}
					<p class="status-text">
						{synapseqPlayer.state === 'loading' ? 'Loading...' : 'Generating...'}
					</p>
				{:else if synapseqPlayer.state === 'playing'}
					<p class="status-label">NOW PLAYING</p>
				{/if}

				{#if sequenceName}
					<h1 class="sequence-name">{sequenceName}</h1>
				{/if}
			</div>

			<!-- Progress bar -->
			<div class="progress-section">
				<div class="progress-bar-container">
					<div class="progress-bar" style="width: {progress}%"></div>
				</div>
				<div class="time-display">
					<span class="time-current">{formatTime(synapseqPlayer.currentTime)}</span>
					<span class="time-separator">/</span>
					<span class="time-total">{formatTime(totalDuration)}</span>
				</div>
			</div>

			<!-- Stop button -->
			<button onclick={handleStop} class="btn-stop">
				<Square class="icon-stop" />
				Stop
			</button>
		</div>
	</div>
{/if}

<style>
	.fullscreen-player {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		color: white;
	}

	.fullscreen-player.loading,
	.fullscreen-player.error {
		background: #0a0a0a;
	}

	.loading-content,
	.error-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		text-align: center;
	}

	.loading-content :global(.spinner) {
		width: 3rem;
		height: 3rem;
		color: #22d3ee;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-content span {
		font-size: 1.125rem;
		color: #9ca3af;
	}

	.error-content {
		padding: 2rem;
		max-width: 28rem;
	}

	.error-content :global(.error-icon) {
		width: 3rem;
		height: 3rem;
		color: #ef4444;
	}

	.error-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #fca5a5;
		margin-bottom: 0.5rem;
	}

	.error-message {
		font-size: 1rem;
		color: #fecaca;
	}

	.player-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 600px;
		padding: 2rem;
		gap: 3rem;
	}

	.wave-icon {
		width: 200px;
		height: 200px;
		color: #22d3ee;
		filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.5));
	}

	.wave-icon svg {
		width: 100%;
		height: 100%;
	}

	.wave-circle {
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		opacity: 0.3;
		animation: pulse 2s ease-in-out infinite;
	}

	.wave-line {
		animation: wave 2s ease-in-out infinite;
	}

	.wave-1 {
		animation-delay: 0s;
	}

	.wave-2 {
		animation-delay: 0.2s;
	}

	.wave-3 {
		animation-delay: 0.4s;
		opacity: 0.6;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.05);
		}
	}

	@keyframes wave {
		0%,
		100% {
			d: path('M 25 50 Q 35 35, 50 50 T 75 50');
		}
		50% {
			d: path('M 25 50 Q 35 65, 50 50 T 75 50');
		}
	}

	.status-section {
		text-align: center;
		width: 100%;
	}

	.status-label {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: #6b7280;
		margin-bottom: 0.75rem;
		text-transform: uppercase;
	}

	.status-text {
		font-size: 1.125rem;
		color: #9ca3af;
		margin-bottom: 0.75rem;
	}

	.sequence-name {
		font-size: 2rem;
		font-weight: 700;
		color: #22d3ee;
		margin: 0;
		line-height: 1.2;
	}

	.progress-section {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.progress-bar-container {
		width: 100%;
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		overflow: hidden;
		position: relative;
	}

	.progress-bar {
		height: 100%;
		background: linear-gradient(90deg, #06b6d4 0%, #22d3ee 100%);
		border-radius: 3px;
		transition: width 0.3s ease;
		box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
	}

	.time-display {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 1.5rem;
		font-weight: 500;
		color: #e5e7eb;
	}

	.time-current {
		color: #22d3ee;
	}

	.time-separator {
		color: #6b7280;
	}

	.time-total {
		color: #9ca3af;
	}

	.btn-stop,
	.btn-close {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 1rem 2.5rem;
		background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
		color: white;
		border: none;
		border-radius: 9999px;
		font-size: 1.125rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);
	}

	.btn-stop:hover,
	.btn-close:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5);
	}

	.btn-stop:active,
	.btn-close:active {
		transform: translateY(0);
	}

	.btn-stop :global(.icon-stop) {
		width: 1.25rem;
		height: 1.25rem;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.player-content {
			padding: 1.5rem;
			gap: 2rem;
		}

		.wave-icon {
			width: 150px;
			height: 150px;
		}

		.sequence-name {
			font-size: 1.5rem;
		}

		.time-display {
			font-size: 1.25rem;
		}

		.btn-stop,
		.btn-close {
			padding: 0.875rem 2rem;
			font-size: 1rem;
		}
	}
</style>
