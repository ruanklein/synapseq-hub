<script lang="ts">
	import { goto } from '$app/navigation';
	import { Clock, ListFilter } from 'lucide-svelte';
	import { filteredSequences, formatRelativeTime, formatFullDate } from '$lib/store';

	function handleRowClick(sequenceId: string) {
		goto(`/sequence/${sequenceId}`);
	}
</script>

<!-- Results Counter -->
{#if $filteredSequences.length > 0}
	<div
		class="px-6 py-3 bg-linear-to-r from-blue-50 to-cyan-50 dark:from-gray-800/30 dark:to-gray-800/30 border-b border-gray-200 dark:border-gray-700"
	>
		<div class="flex items-center gap-2 text-sm">
			<ListFilter class="w-4 h-4 text-blue-600 dark:text-cyan-400" />
			<span class="font-semibold text-gray-700 dark:text-gray-200">
				{$filteredSequences.length}
				{$filteredSequences.length === 1 ? 'sequence' : 'sequences'} found
			</span>
		</div>
	</div>
{/if}

<div class="overflow-x-auto">
	<table class="w-full">
		<thead class="bg-gray-50 dark:bg-gray-900/50">
			<tr>
				<th
					class="px-6 py-4 text-left text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider"
				>
					Name
				</th>
				<th
					class="px-6 py-4 text-left text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider hidden sm:table-cell"
				>
					Category
				</th>
				<th
					class="px-6 py-4 text-left text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider"
				>
					Author
				</th>
				<th
					class="px-6 py-4 text-left text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider hidden md:table-cell"
				>
					Updated
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200 dark:divide-gray-800">
			{#if $filteredSequences.length === 0}
				<tr>
					<td colspan="4" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
						No sequences found
					</td>
				</tr>
			{:else}
				{#each $filteredSequences as sequence}
					<tr
						class="group relative hover:bg-blue-50/50 dark:hover:bg-gray-800/30 cursor-pointer border-l-4 border-transparent hover:border-blue-500 dark:hover:border-cyan-500 transition-all duration-200 hover:shadow-sm"
						onclick={() => handleRowClick(sequence.id)}
						role="button"
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								handleRowClick(sequence.id);
							}
						}}
					>
						<td class="px-6 py-4">
							<div
								class="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-200"
							>
								{sequence.name}
							</div>
							<div class="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
								{sequence.category}
							</div>
						</td>
						<td class="px-6 py-4 text-gray-700 dark:text-gray-300 hidden sm:table-cell capitalize">
							{sequence.category}
						</td>
						<td class="px-6 py-4">
							<span
								class={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${
									sequence.author === 'synapseq'
										? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700'
										: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-200 dark:border-green-700'
								}`}
							>
								{sequence.author}
							</span>
						</td>
						<td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
							<div class="flex items-center gap-1.5" title={formatFullDate(sequence.updated_at)}>
								<Clock class="w-3.5 h-3.5" />
								{formatRelativeTime(sequence.updated_at)}
							</div>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
