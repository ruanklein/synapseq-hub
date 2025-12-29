import type SynapSeq from '$lib/types/synapseq';

type PlayerState = 'idle' | 'loading' | 'generating' | 'playing' | 'stopped' | 'error';

class SynapSeqPlayer {
	private instance: SynapSeq | null = $state(null);

	state = $state<PlayerState>('idle');
	currentTime = $state(0);
	error = $state<string | null>(null);
	isReady = $state(false);
	version = $state<string>('');

	private timeInterval: number | null = null;
	private initializationPromise: Promise<void> | null = null;

	async initialize() {
		if (typeof window === 'undefined') return;

		// If already ready, just return
		if (this.isReady) {
			return;
		}

		if (this.initializationPromise) {
			await this.initializationPromise;
			return;
		}

		// Start new initialization
		this.initializationPromise = this._initialize();

		try {
			await this.initializationPromise;
		} finally {
			this.initializationPromise = null;
		}
	}

	private async _initialize() {
		try {
			const wasmUrl = `${window.location.origin}/wasm/synapseq.wasm`;
			const wasmExecUrl = `${window.location.origin}/wasm/wasm_exec.js`;

			const SynapSeq = (window as any).SynapSeq;

			if (!SynapSeq) {
				throw new Error('SynapSeq constructor not found on window object');
			}

			this.instance = new SynapSeq({
				wasmPath: wasmUrl,
				wasmExecPath: wasmExecUrl
			});

			if (!this.instance) {
				throw new Error('Failed to create SynapSeq instance');
			}

			this.instance.onloaded = () => {
				this.state = 'idle';
			};

			this.instance.ongenerating = () => {
				this.state = 'generating';
			};

			this.instance.onplaying = () => {
				this.state = 'playing';
				this.startTimeTracking();
			};

			this.instance.onstopped = () => {
				this.state = 'stopped';
				this.stopTimeTracking();
			};

			this.instance.onended = () => {
				// Update current time one last time before stopping tracking
				if (this.instance) {
					this.currentTime = this.instance.getCurrentTime();
				}
				this.state = 'idle';
				this.stopTimeTracking();
			};

			this.instance.onerror = (detail) => {
				this.state = 'error';
				this.error = detail.error.message;
				this.stopTimeTracking();
			};

			// Wait for WASM to be ready using the library's isReady() method
			while (!this.instance.isReady()) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			this.isReady = true;
			this.version = await this.instance.getVersion();
		} catch (err) {
			console.error('Failed to initialize SynapSeq:', err);
			this.error = err instanceof Error ? err.message : 'Failed to initialize SynapSeq';
			this.state = 'error';
			throw err;
		}
	}

	async loadSequence(content: string, format: 'text' | 'json' = 'text') {
		if (!this.instance || !this.isReady) {
			throw new Error('SynapSeq not initialized');
		}

		this.state = 'loading';
		this.error = null;

		try {
			await this.instance.load(content, format);
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load sequence';
			this.state = 'error';
			throw err;
		}
	}

	async loadFromUrl(url: string, format: 'text' | 'json' = 'text') {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch: ${response.statusText}`);
			}
			const content = await response.text();
			await this.loadSequence(content, format);
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load from URL';
			this.state = 'error';
			throw err;
		}
	}

	async play() {
		if (!this.instance || !this.isReady) {
			throw new Error('SynapSeq not initialized');
		}

		// Ensure any previous playback is fully stopped
		this.stop();

		// Give time for stop to complete
		await new Promise((resolve) => setTimeout(resolve, 100));

		try {
			await this.instance.play();
			// Clear any previous errors if play succeeded
			this.error = null;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to play';

			// Wait a bit to check if playback actually started despite the error
			await new Promise((resolve) => setTimeout(resolve, 300));

			// Only set error state if we're not already playing
			// This handles the case where the error is thrown but playback actually started
			if (this.state !== 'playing') {
				this.error = errorMessage;
				this.state = 'error';
				console.error('Play failed:', errorMessage);
				throw err;
			}
			// If playing, silently ignore the error since audio is working
		}
	}

	stop() {
		if (this.instance) {
			this.instance.stop();
		}
	}

	private startTimeTracking() {
		this.stopTimeTracking();
		this.timeInterval = window.setInterval(() => {
			if (this.instance) {
				this.currentTime = this.instance.getCurrentTime();
			}
		}, 100);
	}

	private stopTimeTracking() {
		if (this.timeInterval !== null) {
			clearInterval(this.timeInterval);
			this.timeInterval = null;
		}
		// Don't reset currentTime here to show final position
	}

	destroy() {
		this.stopTimeTracking();
		if (this.instance) {
			this.instance.destroy();
			this.instance = null;
		}
		this.isReady = false;
		this.initializationPromise = null;
	}

	// Reset method to clear instance and force re-initialization
	reset() {
		this.destroy();
		this.error = null;
		this.state = 'idle';
	}
}

export const synapseqPlayer = new SynapSeqPlayer();
