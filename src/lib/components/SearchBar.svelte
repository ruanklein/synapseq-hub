<script lang="ts">
	import { Search, X } from 'lucide-svelte';
	import { searchTerm } from '$lib/store';

	function clearSearch() {
		$searchTerm = '';
	}
</script>

<div class="relative">
	<div class="relative group">
		<Search
			class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-cyan-400 transition-colors duration-200"
		/>
		<input
			type="text"
			bind:value={$searchTerm}
			placeholder="Search by name, category, or author..."
			class="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-sm"
		/>
		{#if $searchTerm}
			<div class="absolute right-12 top-1/2 -translate-y-1/2">
				<span
					class="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full"
				>
					Active
				</span>
			</div>
			<button
				onclick={clearSearch}
				class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200 group/clear"
				title="Clear search"
			>
				<X
					class="w-4 h-4 text-gray-400 group-hover/clear:text-gray-600 dark:group-hover/clear:text-gray-300"
				/>
			</button>
		{/if}
	</div>
</div>
