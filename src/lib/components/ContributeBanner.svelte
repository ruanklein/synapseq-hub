<script lang="ts">
	import { Github } from 'lucide-svelte';
</script>

<div
	class="bg-blue-50 dark:bg-gray-800/50 border border-blue-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-400 dark:hover:border-gray-600 transition-all duration-200 hover:-translate-y-0.5"
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
