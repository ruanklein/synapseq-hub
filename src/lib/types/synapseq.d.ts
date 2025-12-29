declare class SynapSeq {
	constructor(options?: { wasmPath?: string; wasmExecPath?: string });

	load(input: string | File, format?: 'text' | 'json'): Promise<void>;
	play(): Promise<void>;
	stop(): void;
	destroy(): void;

	getCurrentTime(): number;
	getState(): 'idle' | 'playing' | 'stopped';
	isLoaded(): boolean;
	getSampleRate(): number;
	isReady(): boolean;

	getVersion(): Promise<string>;
	getBuildDate(): Promise<string>;
	getHash(): Promise<string>;

	onloaded: (() => void) | null;
	ongenerating: (() => void) | null;
	onplaying: (() => void) | null;
	onstopped: (() => void) | null;
	onended: (() => void) | null;
	onerror: ((detail: { error: Error }) => void) | null;
}

export default SynapSeq;
