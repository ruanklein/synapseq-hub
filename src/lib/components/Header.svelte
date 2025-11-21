<script lang="ts">
	import { Moon, Lightbulb } from 'lucide-svelte';

	let theme = $state<'light' | 'dark'>('light');

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.classList.toggle('dark');
	}
</script>

<header class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
	<div class="container mx-auto px-4 py-4">
		<div class="flex items-center justify-between flex-wrap gap-4">
			<div class="flex items-center gap-3">
				<img src="/logo.png" alt="SynapSeq Logo" class="w-12 h-12 rounded-lg object-cover" />
				<h1
					class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent"
				>
					SynapSeq Hub
				</h1>
			</div>

			<button
				onclick={toggleTheme}
				class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-200"
			>
				{#if theme === 'light'}
					<Moon class="w-5 h-5" />
					<span class="hidden sm:inline">Dark Mode</span>
				{:else}
					<Lightbulb class="w-5 h-5" />
					<span class="hidden sm:inline">Light Mode</span>
				{/if}
			</button>
		</div>
	</div>
</header>
