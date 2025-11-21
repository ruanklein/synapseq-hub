<script lang="ts">
	import { Github } from 'lucide-svelte';
</script>

<div
	class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 hover:-translate-y-0.5"
>
	<div class="flex items-center gap-3 flex-wrap">
		<Github class="w-5 h-5 text-gray-600 dark:text-gray-400 hidden sm:block" />
		<p class="text-sm text-gray-700 dark:text-gray-300 flex-1 text-center sm:text-left">
			Want to contribute and share your creations? Submit a Pull Request to the
			<a
				href="https://github.com/ruanklein/synapseq-hub"
				target="_blank"
				rel="noopener noreferrer"
				class="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
			>
				official Hub repository
			</a>
		</p>
	</div>
</div>
