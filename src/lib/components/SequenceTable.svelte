<script lang="ts">
	import { goto } from '$app/navigation';
	import { Clock, ListFilter, ArrowRight } from 'lucide-svelte';
	import { filteredSequences, formatRelativeTime, formatFullDate } from '$lib/store';

	function handleCardClick(sequenceId: string) {
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

<!-- Cards Grid -->
<div class="p-6">
	{#if $filteredSequences.length === 0}
		<div class="text-center py-16">
			<p class="text-gray-500 dark:text-gray-400 text-lg">No sequences found</p>
			<p class="text-gray-400 dark:text-gray-500 text-sm mt-2">
				Try adjusting your search or filters
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
			{#each $filteredSequences as sequence}
				<button
					onclick={() => handleCardClick(sequence.id)}
					class="sequence-card group relative bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-left hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
				>
					<!-- Gradient overlay on hover -->
					<div
						class="absolute inset-0 bg-linear-to-br from-blue-500/5 via-cyan-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:via-cyan-500/10 dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
					></div>

					<!-- Content -->
					<div class="relative z-10 space-y-4">
						<!-- Header with category and author -->
						<div class="flex items-start justify-between gap-3">
							<span
								class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
							>
								{sequence.category}
							</span>
							<span
								class={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide border ${
									sequence.author === 'synapseq'
										? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700'
										: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-200 dark:border-green-700'
								}`}
							>
								{sequence.author}
							</span>
						</div>

						<!-- Sequence Name -->
						<div>
							<h3
								class="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2"
							>
								{sequence.name}
							</h3>
						</div>

						<!-- Footer with timestamp and arrow -->
						<div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
							<div
								class="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
								title={formatFullDate(sequence.updated_at)}
							>
								<Clock class="w-3.5 h-3.5" />
								<span class="text-xs">{formatRelativeTime(sequence.updated_at)}</span>
							</div>
							<div
								class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 group-hover:bg-blue-500 dark:group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300"
							>
								<ArrowRight class="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
							</div>
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
