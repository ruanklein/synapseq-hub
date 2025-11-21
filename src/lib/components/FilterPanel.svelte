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

<div class="space-y-4">
	<button
		onclick={togglePanel}
		class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
		class:ring-2={isOpen}
		class:ring-blue-500={isOpen}
		class:dark:ring-cyan-500={isOpen}
	>
		<Filter class="w-5 h-5" />
		<span class="font-medium">Advanced Filters</span>
		<div class="ml-auto transition-transform duration-200" class:rotate-180={isOpen}>
			<ChevronDown class="w-4 h-4" />
		</div>
	</button>

	{#if isOpen}
		<div
			class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 space-y-4 animate-in slide-in-from-top-2 duration-200"
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
