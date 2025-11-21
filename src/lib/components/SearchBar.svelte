<script lang="ts">
	import { Search, X } from 'lucide-svelte';
	import { searchTerm } from '$lib/store';

	function clearSearch() {
		$searchTerm = '';
	}
</script>

<div class="relative">
	<div class="relative">
		<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
		<input
			type="text"
			bind:value={$searchTerm}
			placeholder="Search sequences..."
			class="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
		/>
		{#if $searchTerm}
			<button
				onclick={clearSearch}
				class="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors duration-200"
			>
				<X class="w-4 h-4 text-gray-400" />
			</button>
		{/if}
	</div>
</div>
