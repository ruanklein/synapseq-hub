<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import SequenceViewer from '$lib/components/SequenceViewer.svelte';
	import type { PageData } from './$types';
	import { toTitleCase } from '$lib/utils/formatters';

	let { data }: { data: PageData } = $props();

	function handleBack() {
		goto('/sequences');
	}

	// Gerar descrição limpa para meta tags
	const getCleanDescription = (sequence: any) => {
		if (!sequence) return 'Listen to brainwave entrainment sequences on SynapSeq Hub';

		const category = sequence.category || 'Sequence';
		const author = sequence.author || 'SynapSeq';
		return `${category} sequence by ${author}. Stream or download this brainwave entrainment audio on SynapSeq Hub.`;
	};

	const pageTitle = $derived(
		data.sequence ? `${toTitleCase(data.sequence.name)} | SynapSeq Hub` : 'SynapSeq Hub'
	);
	const pageDescription = $derived(getCleanDescription(data.sequence));
	const pageUrl = $derived(`https://synapseq-hub.ruan.sh/sequence/${data.sequence?.id || ''}`);
	const pageImage = $derived(
		data.sequence?.thumbnail
			? `https://synapseq-hub.ruan.sh/${data.sequence.thumbnail}`
			: 'https://synapseq-hub.ruan.sh/default-thumbnail.webp'
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={pageImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={pageUrl} />
	<meta property="twitter:title" content={pageTitle} />
	<meta property="twitter:description" content={pageDescription} />
	<meta property="twitter:image" content={pageImage} />
</svelte:head>

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

	<Footer />
</div>
