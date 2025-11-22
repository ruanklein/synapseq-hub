<script lang="ts">
	import { onMount } from 'svelte';

	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import FilterPanel from '$lib/components/FilterPanel.svelte';
	import SequenceTable from '$lib/components/SequenceTable.svelte';

	import { loadManifest } from '$lib/store';

	let isLoading = $state(true);

	onMount(async () => {
		await loadManifest();
		isLoading = false;
	});
</script>

<svelte:head>
	<title>All Sequences - SynapSeq Hub</title>
	<meta
		name="description"
		content="Browse all available SynapSeq sequences for brainwave entrainment and audio therapy."
	/>
</svelte:head>

<div
	class="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:bg-linear-to-br dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 transition-colors duration-200"
>
	<Header />

	<main class="container mx-auto px-4 py-8 max-w-6xl space-y-6">
		{#if isLoading}
			<div class="flex items-center justify-center py-20">
				<div class="text-gray-500 dark:text-gray-400">Loading...</div>
			</div>
		{:else}
			<!-- Page Description -->
			<div
				class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
			>
				<h1
					class="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-3"
				>
					All Sequences
				</h1>
				<p class="text-gray-600 dark:text-gray-300 leading-relaxed">
					Explore our complete collection of SynapSeq sequences. Use the search and filters below to
					find sequences by name, category, or author. Each sequence is designed for specific
					brainwave entrainment purposes, from deep relaxation to focused concentration.
				</p>
			</div>

			<!-- Unified Sequences Browser -->
			<div
				class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
			>
				<!-- Search and Filters Header -->
				<div class="p-6 border-b border-gray-200 dark:border-gray-700">
					<!-- Desktop: Search and Filters in one row -->
					<div class="hidden md:grid md:grid-cols-3 gap-4">
						<div class="md:col-span-2">
							<SearchBar />
						</div>
						<div>
							<FilterPanel />
						</div>
					</div>

					<!-- Mobile: Search and Filters stacked -->
					<div class="md:hidden space-y-4">
						<SearchBar />
						<FilterPanel />
					</div>
				</div>

				<!-- Table -->
				<SequenceTable />
			</div>
		{/if}
	</main>

	<Footer />
</div>
