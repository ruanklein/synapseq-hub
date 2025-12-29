<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Play, Square, Loader2, AlertCircle } from 'lucide-svelte';
	import { synapseqPlayer } from '$lib/stores/synapseq.svelte';

	let {
		sequenceUrl,
		autoLoad = false,
		showControls = true
	}: {
		sequenceUrl?: string;
		autoLoad?: boolean;
		showControls?: boolean;
	} = $props();

	let mounted = $state(false);

	onMount(async () => {
		// Player já foi inicializado pelo SequenceViewer, apenas marca como montado
		mounted = true;

		if (autoLoad && sequenceUrl) {
			await loadSequence();
		}
	});

	onDestroy(() => {
		// Não destruir o player aqui, ele será gerenciado pelo store
		// synapseqPlayer.destroy();
	});

	async function loadSequence() {
		if (!sequenceUrl) return;
		await synapseqPlayer.loadFromUrl(sequenceUrl);
	}

	async function handlePlay() {
		// Se há URL e não está carregado, carrega primeiro
		if (sequenceUrl && synapseqPlayer.state === 'idle' && !synapseqPlayer.instance?.isLoaded()) {
			await loadSequence();
		}
		await synapseqPlayer.play();
	}

	function handleStop() {
		synapseqPlayer.stop();
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

{#if !mounted}
	<div class="flex items-center justify-center gap-3 p-6">
		<Loader2 class="w-5 h-5 animate-spin text-blue-600 dark:text-cyan-400" />
		<span class="text-gray-600 dark:text-gray-400">Initializing SynapSeq...</span>
	</div>
{:else if synapseqPlayer.error}
	<div
		class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
	>
		<AlertCircle class="w-5 h-5 text-red-600 dark:text-red-400" />
		<div>
			<p class="font-semibold text-red-900 dark:text-red-200">Error</p>
			<p class="text-sm text-red-700 dark:text-red-300">{synapseqPlayer.error}</p>
		</div>
	</div>
{:else if showControls}
	<div class="space-y-4">
		<!-- Player Controls -->
		<div class="flex items-center gap-4">
			{#if synapseqPlayer.state === 'playing'}
				<button
					onclick={handleStop}
					class="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
				>
					<Square class="w-5 h-5" />
					Stop
				</button>
			{:else if synapseqPlayer.state === 'generating' || synapseqPlayer.state === 'loading'}
				<button
					disabled
					class="flex items-center gap-2 px-6 py-3 bg-blue-400 text-white rounded-lg font-semibold cursor-not-allowed"
				>
					<Loader2 class="w-5 h-5 animate-spin" />
					{synapseqPlayer.state === 'loading' ? 'Loading...' : 'Generating...'}
				</button>
			{:else}
				<button
					onclick={handlePlay}
					class="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
				>
					<Play class="w-5 h-5" />
					Play
				</button>
			{/if}

			<!-- Time Display -->
			{#if synapseqPlayer.state === 'playing'}
				<div class="text-lg font-mono text-gray-700 dark:text-gray-300">
					{formatTime(synapseqPlayer.currentTime)}
				</div>
			{/if}
		</div>

		<!-- Status -->
		<div class="text-sm text-gray-600 dark:text-gray-400">
			<span class="font-semibold">Status:</span>
			<span class="capitalize">{synapseqPlayer.state}</span>
			{#if synapseqPlayer.version}
				<span class="ml-4 text-gray-500">v{synapseqPlayer.version}</span>
			{/if}
		</div>
	</div>
{/if}
