<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Brain, Zap, Github, ArrowRight, Clock, Users } from 'lucide-svelte';

	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { loadManifest, sequences, formatRelativeTime } from '$lib/store';
	import type { ManifestEntry } from '$lib/types';
	import { toTitleCase } from '$lib/utils/formatters';

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

	<main class="container mx-auto px-4 py-8 max-w-7xl space-y-24">
		<!-- Hero Section - Compact & Focused -->
		<section class="text-center space-y-6 py-12">
			<div class="inline-block">
				<div
					class="p-5 bg-linear-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-3xl backdrop-blur-sm border border-blue-200/50 dark:border-cyan-500/30"
				>
					<Brain class="w-20 h-20 text-blue-600 dark:text-cyan-400" />
				</div>
			</div>

			<h1
				class="text-6xl md:text-7xl font-black bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent leading-tight"
			>
				SynapSeq Hub
			</h1>

			<p class="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
				Discover powerful brainwave entrainment sequences for focus, relaxation, and mental clarity
			</p>

			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
				<a
					href="/sequences"
					class="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
				>
					Browse Sequences
					<ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
				</a>
				<a
					href="https://github.com/ruanklein/synapseq-hub"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-3 px-8 py-4 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl font-semibold text-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
				>
					<Github class="w-5 h-5" />
					Contribute
				</a>
			</div>
		</section>

		<!-- Features Grid -->
		<section class="space-y-12">
			<div class="text-center space-y-4">
				<h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
					Powerful Brainwave Technology
				</h2>
				<p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
					SynapSeq combines cutting-edge audio techniques to guide your brain into optimal mental
					states
				</p>
			</div>

			<div class="grid md:grid-cols-3 gap-8">
				<div
					class="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-cyan-600 hover:shadow-xl transition-all duration-200"
				>
					<div
						class="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
					>
						<Zap class="w-7 h-7 text-blue-600 dark:text-cyan-400" />
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Multiple Techniques</h3>
					<p class="text-gray-700 dark:text-gray-300 leading-relaxed">
						Binaural beats, isochronic tones, monaural beats, and custom waveforms combined for
						maximum effect
					</p>
				</div>

				<div
					class="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-cyan-600 hover:shadow-xl transition-all duration-200"
				>
					<div
						class="w-14 h-14 rounded-xl bg-gray-500 dark:bg-gray-600/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
					>
						<Brain class="w-7 h-7 text-gray-300 dark:text-gray-400" />
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Precisely Crafted</h3>
					<p class="text-gray-700 dark:text-gray-300 leading-relaxed">
						Each sequence targets specific brainwave frequencies, from deep Delta relaxation to
						focused Gamma states
					</p>
				</div>

				<div
					class="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-cyan-600 hover:shadow-xl transition-all duration-200"
				>
					<div
						class="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
					>
						<Users class="w-7 h-7 text-green-600 dark:text-green-400" />
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Community Driven</h3>
					<p class="text-gray-700 dark:text-gray-300 leading-relaxed">
						Open-source repository where creators share sequences and the community benefits from
						collective knowledge
					</p>
				</div>
			</div>
		</section>

		<!-- How to Use - Simplified -->
		<section
			class="bg-linear-to-br from-blue-50 to-cyan-50/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-3xl p-12 md:p-16 border border-blue-100 dark:border-gray-700"
		>
			<h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-12 text-center">
				Get Started in 3 Steps
			</h2>

			<div class="grid md:grid-cols-3 gap-8">
				<div class="relative text-center space-y-4">
					<div
						class="w-16 h-16 mx-auto rounded-2xl bg-blue-600 dark:bg-cyan-500 text-white flex items-center justify-center font-black text-2xl shadow-lg"
					>
						1
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white">Browse</h3>
					<p class="text-gray-700 dark:text-gray-300 leading-relaxed">
						Explore sequences by category: focus, relaxation, meditation, and more
					</p>
				</div>

				<div class="relative text-center space-y-4">
					<div
						class="w-16 h-16 mx-auto rounded-2xl bg-blue-600 dark:bg-cyan-500 text-white flex items-center justify-center font-black text-2xl shadow-lg"
					>
						2
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white">Listen or Generate</h3>
					<p class="text-gray-700 dark:text-gray-300 leading-relaxed">
						Stream instantly in your browser or use the CLI to generate WAV/MP3 files and play via
						terminal
					</p>
				</div>

				<div class="relative text-center space-y-4">
					<div
						class="w-16 h-16 mx-auto rounded-2xl bg-blue-600 dark:bg-cyan-500 text-white flex items-center justify-center font-black text-2xl shadow-lg"
					>
						3
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white">Experience</h3>
					<p class="text-gray-700 dark:text-gray-300 leading-relaxed">
						Use sequences for your goals and share your own creations with the community
					</p>
				</div>
			</div>
		</section>

		<!-- Last Sequences Added -->
		{#if isLoading}
			<div class="flex items-center justify-center py-20">
				<div class="text-gray-500 dark:text-gray-400 text-lg">Loading sequences...</div>
			</div>
		{:else if lastSequences.length > 0}
			<section class="space-y-10">
				<div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
					<div class="space-y-3">
						<h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
							Recently Added
						</h2>
						<p class="text-lg text-gray-600 dark:text-gray-400">
							Discover the latest sequences from our community
						</p>
					</div>
					<button
						onclick={goToSequences}
						class="group inline-flex items-center gap-2 px-6 py-3 text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 font-bold text-lg transition-colors cursor-pointer"
					>
						View All Sequences
						<ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
					</button>
				</div>

				<div class="grid md:grid-cols-3 gap-8">
					{#each lastSequences as sequence}
						<button
							onclick={() => goToSequence(sequence.id)}
							class="group relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-cyan-500 hover:shadow-2xl transition-all duration-300 text-left overflow-hidden cursor-pointer"
						>
							<!-- Thumbnail -->
							<div class="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
								<img
									src="/{sequence.thumbnail}"
									alt={sequence.name}
									onerror={(e) =>
										((e.currentTarget as HTMLImageElement).src = '/default-thumbnail.webp')}
									class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
								/>
								<!-- Gradient overlay -->
								<div
									class="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"
								></div>
								<!-- Category Badge on Thumbnail -->
								<div class="absolute top-3 left-3 z-10">
									<span
										class="px-3 py-1.5 text-xs font-bold bg-blue-600/90 dark:bg-cyan-600/90 backdrop-blur-sm text-white rounded-lg border border-blue-400/50 dark:border-cyan-400/50 uppercase tracking-wide shadow-lg"
									>
										{sequence.category}
									</span>
								</div>
							</div>

							<!-- Content -->
							<div class="relative z-10 p-6 space-y-4">
								<!-- Title -->
								<h3
									class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-tight"
								>
									{toTitleCase(sequence.name)}
								</h3>

								<!-- Updated -->
								<div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
									<Clock class="w-4 h-4" />
									<span>{formatRelativeTime(sequence.updated_at)}</span>
								</div>

								<!-- CTA -->
								<div
									class="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-bold text-base pt-2 group-hover:gap-3 transition-all"
								>
									View Details
									<ArrowRight class="w-5 h-5" />
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
