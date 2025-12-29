<script lang="ts">
	import { Filter, ChevronDown } from 'lucide-svelte';
	import { selectedCategory, selectedAuthor, categories, authors } from '$lib/store';

	let isOpen = $state(false);

	function togglePanel() {
		isOpen = !isOpen;
	}

	function clearFilters() {
		$selectedCategory = '';
		$selectedAuthor = '';
	}
</script>

<div class="space-y-3">
	<button
		onclick={togglePanel}
		class="w-full flex items-center justify-between gap-2 px-4 py-3.5 border text-gray-700 dark:text-gray-200 rounded-lg transition-all duration-200 text-sm font-medium cursor-pointer"
		class:bg-blue-50={isOpen}
		class:bg-gray-50={!isOpen}
		class:border-blue-300={isOpen}
		class:border-gray-200={!isOpen}
		class:hover:bg-gray-100={!isOpen}
	>
		<div class="flex items-center gap-2">
			<Filter class="w-4 h-4" />
			<span>Advanced Filters</span>
			{#if $selectedCategory || $selectedAuthor}
				<span class="ml-1 px-2 py-0.5 bg-blue-500 dark:bg-cyan-500 text-white text-xs rounded-full">
					{($selectedCategory ? 1 : 0) + ($selectedAuthor ? 1 : 0)}
				</span>
			{/if}
		</div>
		<div class="transition-transform duration-200" class:rotate-180={isOpen}>
			<ChevronDown class="w-4 h-4" />
		</div>
	</button>

	{#if isOpen}
		<div
			class="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
		>
			<div class="grid md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<label
						for="filter-category"
						class="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
					>
						Category
					</label>
					<select
						id="filter-category"
						bind:value={$selectedCategory}
						class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 transition-all duration-200"
					>
						<option value="">All</option>
						{#each $categories as category}
							<option value={category} class="capitalize">{category}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2">
					<label
						for="filter-author"
						class="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
					>
						Author
					</label>
					<select
						id="filter-author"
						bind:value={$selectedAuthor}
						class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 transition-all duration-200"
					>
						<option value="">All</option>
						{#each $authors as author}
							<option value={author}>{author}</option>
						{/each}
					</select>
				</div>
			</div>
			<button
				onclick={clearFilters}
				class="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all duration-200"
			>
				Clear All Filters
			</button>
		</div>
	{/if}
</div>

<style>
	:global(.dark) button.bg-blue-50 {
		background-color: rgb(30 58 138 / 0.2);
	}

	:global(.dark) button.border-blue-300 {
		border-color: rgb(29 78 216 / 0.5);
	}

	:global(.dark) button.bg-gray-50 {
		background-color: rgb(31 41 55 / 0.5);
	}

	:global(.dark) button.border-gray-200 {
		border-color: rgb(55 65 81);
	}

	:global(.dark) button.hover\:bg-gray-100:hover {
		background-color: rgb(31 41 55);
	}
</style>
