<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import SequenceViewer from '$lib/components/SequenceViewer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function handleBack() {
		goto('/');
	}
</script>

<div
	class="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:bg-linear-to-br dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 transition-colors duration-200"
>
	<Header />

	<main class="container mx-auto px-4 py-8 max-w-6xl">
		{#if data.sequence}
			<SequenceViewer sequence={data.sequence} onBack={handleBack} />
		{:else}
			<div class="flex flex-col items-center justify-center py-20">
				<div class="text-gray-500 dark:text-gray-400 mb-4">Sequence not found</div>
				<button
					onclick={handleBack}
					class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
				>
					Back to Home
				</button>
			</div>
		{/if}
	</main>
</div>
