<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Brain, Zap, Github, ArrowRight, Clock } from 'lucide-svelte';

	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { loadManifest, sequences, formatRelativeTime } from '$lib/store';
	import type { ManifestEntry } from '$lib/types';

	let isLoading = $state(true);
	let lastSequences = $state<ManifestEntry[]>([]);

	onMount(async () => {
		await loadManifest();
		// Get last 3 sequences sorted by updated date
		lastSequences = [...$sequences]
			.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
			.slice(0, 3);
		isLoading = false;
	});

	function goToSequence(id: string) {
		goto(`/sequence/${id}`);
	}

	function goToSequences() {
		goto('/sequences');
	}
</script>

<svelte:head>
	<title>SynapSeq Hub - Brainwave Entrainment Sequences</title>
	<meta
		name="description"
		content="Discover and download SynapSeq sequences for brainwave entrainment, meditation, focus, and relaxation."
	/>
</svelte:head>

<div
	class="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:bg-linear-to-br dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 transition-colors duration-200"
>
	<Header />

	<main class="container mx-auto px-4 py-12 max-w-6xl space-y-16">
		<!-- Hero Section -->
		<section class="text-center space-y-6 py-8">
			<div class="inline-block mb-4">
				<div
					class="p-4 bg-linear-to-br from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950 rounded-2xl"
				>
					<Brain class="w-16 h-16 text-blue-600 dark:text-cyan-400" />
				</div>
			</div>

			<h1
				class="text-5xl md:text-6xl font-bold bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent"
			>
				SynapSeq Hub
			</h1>

			<p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
				Your gateway to brainwave entrainment sequences for enhanced focus, deep relaxation, and
				mental clarity
			</p>
		</section>

		<!-- What is SynapSeq -->
		<section
			class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg"
		>
			<div class="flex items-center gap-3 mb-6">
				<div
					class="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
				>
					<Zap class="w-6 h-6 text-blue-600 dark:text-cyan-400" />
				</div>
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white">What is SynapSeq?</h2>
			</div>

			<div class="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
				<p>
					SynapSeq is a powerful engine for creating brainwave entrainment sequences that combine
					binaural beats, isochronic tones, monaural beats, and various waveforms to influence
					mental states and enhance cognitive performance.
				</p>

				<p>
					Each sequence is carefully designed to guide your brain into specific frequency ranges
					associated with different mental states. From deep relaxation (Delta waves) to intense
					focus (Gamma waves).
				</p>

				<p class="font-semibold text-gray-900 dark:text-white">
					The SynapSeq Hub is your central repository for discovering, downloading, and sharing
					these powerful audio sequences.
				</p>
			</div>
		</section>

		<!-- How to Use -->
		<section
			class="bg-linear-to-br from-blue-50 to-cyan-50 dark:from-gray-800/80 dark:to-gray-900/80 rounded-2xl border border-blue-200 dark:border-gray-700 p-8 backdrop-blur-sm"
		>
			<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">How to Use</h2>

			<div class="grid md:grid-cols-3 gap-6">
				<div class="space-y-3">
					<div
						class="w-12 h-12 rounded-full bg-blue-600 dark:bg-cyan-500 text-white flex items-center justify-center font-bold text-xl"
					>
						1
					</div>
					<h3 class="text-xl font-semibold text-gray-900 dark:text-white">Browse Sequences</h3>
					<p class="text-gray-700 dark:text-gray-300">
						Explore our collection of sequences categorized by purpose - focus, relaxation,
						meditation, and more.
					</p>
				</div>

				<div class="space-y-3">
					<div
						class="w-12 h-12 rounded-full bg-blue-600 dark:bg-cyan-500 text-white flex items-center justify-center font-bold text-xl"
					>
						2
					</div>
					<h3 class="text-xl font-semibold text-gray-900 dark:text-white">Download & Install</h3>
					<p class="text-gray-700 dark:text-gray-300">
						Download sequences and their dependencies. Install them using the SynapSeq CLI with
						simple commands.
					</p>
				</div>

				<div class="space-y-3">
					<div
						class="w-12 h-12 rounded-full bg-blue-600 dark:bg-cyan-500 text-white flex items-center justify-center font-bold text-xl"
					>
						3
					</div>
					<h3 class="text-xl font-semibold text-gray-900 dark:text-white">Experience & Share</h3>
					<p class="text-gray-700 dark:text-gray-300">
						Use sequences for your desired mental state, and contribute your own creations back to
						the community.
					</p>
				</div>
			</div>
		</section>

		<!-- How to Contribute -->
		<section
			class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg"
		>
			<div class="flex items-center gap-3 mb-6">
				<div
					class="p-2 bg-green-100 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800"
				>
					<Github class="w-6 h-6 text-green-600 dark:text-green-400" />
				</div>
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white">How to Contribute</h2>
			</div>

			<div class="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
				<p>
					SynapSeq Hub is an open-source project, and we welcome contributions from the community!
					Whether you're creating new sequences or enhancing the hub itself, your input is valuable.
				</p>

				<a
					href="https://github.com/ruanklein/synapseq-hub"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-800 dark:hover:bg-white"
				>
					<Github class="w-5 h-5" />
					Visit GitHub Repository
					<ArrowRight class="w-4 h-4" />
				</a>
			</div>
		</section>

		<!-- Last Sequences Added -->
		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="text-gray-500 dark:text-gray-400">Loading sequences...</div>
			</div>
		{:else if lastSequences.length > 0}
			<section class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-3xl font-bold text-gray-900 dark:text-white">Last Sequences Added</h2>
					<button
						onclick={goToSequences}
						class="inline-flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 font-semibold transition-colors"
					>
						View All
						<ArrowRight class="w-4 h-4" />
					</button>
				</div>

				<div class="grid md:grid-cols-3 gap-6">
					{#each lastSequences as sequence}
						<button
							onclick={() => goToSequence(sequence.id)}
							class="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-cyan-600 hover:shadow-xl transition-all duration-200 text-left"
						>
							<div class="space-y-4">
								<!-- Header -->
								<div class="flex items-start justify-between gap-3">
									<h3
										class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2"
									>
										{sequence.name}
									</h3>
									<span
										class="shrink-0 px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-cyan-300 rounded-lg border border-blue-200 dark:border-cyan-700"
									>
										{sequence.category}
									</span>
								</div>

								<!-- Author -->
								<p class="text-sm text-gray-600 dark:text-gray-400">
									by <span class="font-medium text-gray-900 dark:text-gray-200"
										>{sequence.author}</span
									>
								</p>

								<!-- Updated -->
								<div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
									<Clock class="w-4 h-4" />
									{formatRelativeTime(sequence.updated_at)}
								</div>

								<!-- View Button -->
								<div
									class="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-semibold text-sm group-hover:gap-3 transition-all"
								>
									View Details
									<ArrowRight class="w-4 h-4" />
								</div>
							</div>
						</button>
					{/each}
				</div>
			</section>
		{/if}
	</main>

	<Footer />
</div>
