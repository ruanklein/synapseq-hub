<script lang="ts">
	import { Github, ExternalLink, Home, List } from 'lucide-svelte';
</script>

<footer
	class="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm mt-16"
>
	<div class="container mx-auto px-4 py-12 max-w-6xl">
		<div class="grid md:grid-cols-3 gap-8">
			<!-- About Section -->
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<img src="/logo.png" alt="SynapSeq Logo" class="w-8 h-8 rounded-lg object-cover" />
					<h3 class="text-lg font-bold text-gray-900 dark:text-white">SynapSeq Hub</h3>
				</div>
				<p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
					Your central repository for discovering and sharing brainwave entrainment sequences.
				</p>
			</div>

			<!-- Navigation -->
			<div class="space-y-4">
				<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
					Navigation
				</h3>
				<nav class="flex flex-col gap-2">
					<a
						href="/"
						class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
					>
						<Home class="w-4 h-4" />
						Home
					</a>
					<a
						href="/sequences"
						class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
					>
						<List class="w-4 h-4" />
						Sequences
					</a>
				</nav>
			</div>

			<!-- Links -->
			<div class="space-y-4">
				<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
					Links
				</h3>
				<nav class="flex flex-col gap-2">
					<a
						href="https://github.com/ruanklein/synapseq"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
					>
						<Github class="w-4 h-4" />
						SynapSeq Project
						<ExternalLink class="w-3 h-3" />
					</a>
					<a
						href="https://github.com/ruanklein/synapseq-hub"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
					>
						<Github class="w-4 h-4" />
						Hub Repository
						<ExternalLink class="w-3 h-3" />
					</a>
					<a
						href="https://ruan.sh"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
					>
						<ExternalLink class="w-4 h-4" />
						ruan.sh
					</a>
				</nav>
			</div>
		</div>

		<!-- Bottom Bar -->
		<div
			class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4"
		>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				© {new Date().getFullYear()} SynapSeq Hub
			</p>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				Made by
				<a
					href="https://ruan.sh"
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-600 dark:text-cyan-400 hover:underline font-medium">Ruan</a
				>
			</p>
		</div>
	</div>
</footer>
