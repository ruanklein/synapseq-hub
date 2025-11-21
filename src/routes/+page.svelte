<script lang="ts">
	import { onMount } from 'svelte';
	import { List, Clock } from 'lucide-svelte';

	import Header from '$lib/components/Header.svelte';
	import ContributeBanner from '$lib/components/ContributeBanner.svelte';
	import StatsCard from '$lib/components/StatsCard.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import FilterPanel from '$lib/components/FilterPanel.svelte';
	import SequenceTable from '$lib/components/SequenceTable.svelte';

	import {
		loadManifest,
		sequences,
		lastUpdated,
		formatRelativeTime,
		formatFullDate
	} from '$lib/store';

	let isLoading = $state(true);

	onMount(async () => {
		await loadManifest();
		isLoading = false;
	});
</script>

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
			<!-- Stats -->
			<div class="grid sm:grid-cols-2 gap-4">
				<StatsCard icon={List} label="Total Sequences" value={$sequences.length} />
				<StatsCard
					icon={Clock}
					label="Last Updated"
					value={$lastUpdated ? formatRelativeTime($lastUpdated) : 'N/A'}
					title={$lastUpdated ? formatFullDate($lastUpdated) : undefined}
				/>
			</div>

			<!-- Contribute Banner -->
			<ContributeBanner />

			<!-- Search -->
			<SearchBar />

			<!-- Filters -->
			<FilterPanel />

			<!-- Table -->
			<SequenceTable />
		{/if}
	</main>
</div>
