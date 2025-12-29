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

	private loadScript(src: string): Promise<void> {
		return new Promise((resolve, reject) => {
			// Check if script is already loaded
			const existing = document.querySelector(`script[src="${src}"]`);
			if (existing) {
				resolve();
				return;
			}

			const script = document.createElement('script');
			script.src = src;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
			document.head.appendChild(script);
		});
	}

	async initialize() {
		if (typeof window === 'undefined') return;

		try {
			console.log('Starting SynapSeq initialization...');

			// Test if WASM files are accessible
			const wasmUrl = `${window.location.origin}/wasm/synapseq.wasm`;
			const wasmExecUrl = `${window.location.origin}/wasm/wasm_exec.js`;
			const jsUrl = `${window.location.origin}/wasm/synapseq.js`;

			console.log('Testing WASM file access...');
			console.log('WASM URL:', wasmUrl);
			console.log('WASM Exec URL:', wasmExecUrl);
			console.log('JS URL:', jsUrl);

			// Test if files exist
			try {
				const testWasm = await fetch(wasmUrl, { method: 'HEAD' });
				const testExec = await fetch(wasmExecUrl, { method: 'HEAD' });
				console.log('WASM file status:', testWasm.status, testWasm.ok);
				console.log('WASM Exec file status:', testExec.status, testExec.ok);

				if (!testWasm.ok || !testExec.ok) {
					throw new Error('WASM files not accessible');
				}
			} catch (err) {
				console.error('Failed to access WASM files:', err);
				throw new Error('Cannot access WASM files. Make sure they are in the /wasm/ directory.');
			}

			// Load the SynapSeq script dynamically
			await this.loadScript(jsUrl);

			// Access the global SynapSeq constructor
			const SynapSeq = (window as any).SynapSeq;

			if (!SynapSeq) {
				throw new Error('SynapSeq constructor not found on window object');
			}

			console.log('SynapSeq constructor loaded:', SynapSeq);

			this.instance = new SynapSeq({
				wasmPath: wasmUrl,
				wasmExecPath: wasmExecUrl
			});

			console.log('SynapSeq instance created:', this.instance);

			// Setup event handlers BEFORE waiting for ready
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
				this.state = 'idle';
				this.stopTimeTracking();
			};

			this.instance.onerror = (detail) => {
				this.state = 'error';
				this.error = detail.error.message;
				this.stopTimeTracking();
			};

			// Wait for WASM to be ready with polling and timeout
			console.log('Waiting for WASM to be ready...');
			const startTime = Date.now();
			const timeout = 30000; // 30 seconds

			while (!this.instance.isReady()) {
				if (Date.now() - startTime > timeout) {
					throw new Error('Timeout waiting for WASM to initialize');
				}
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			this.isReady = true;
			this.version = await this.instance.getVersion();
			console.log('SynapSeq initialized successfully. Version:', this.version);
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

		try {
			await this.instance.play();
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to play';
			this.state = 'error';
			throw err;
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
		this.currentTime = 0;
	}

	destroy() {
		this.stopTimeTracking();
		if (this.instance) {
			this.instance.destroy();
			this.instance = null;
		}
		this.isReady = false;
	}
}

export const synapseqPlayer = new SynapSeqPlayer();
