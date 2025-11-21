<script lang="ts">
	import { onMount } from 'svelte';
	import { Moon, Lightbulb } from 'lucide-svelte';

	let theme = $state<'light' | 'dark'>('light');

	onMount(() => {
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
		const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (savedTheme) {
			theme = savedTheme;
		} else if (systemPrefersDark) {
			theme = 'dark';
		}

		applyTheme(theme);
	});

	function applyTheme(newTheme: 'light' | 'dark') {
		const html = document.documentElement;
		if (newTheme === 'dark') {
			html.classList.add('dark');
		} else {
			html.classList.remove('dark');
		}
	}

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		applyTheme(theme);
		localStorage.setItem('theme', theme);
	}
</script>

<header
	class="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950 backdrop-blur-sm"
>
	<div class="container mx-auto px-4 py-4">
		<div class="flex items-center justify-between flex-wrap gap-4">
			<div class="flex items-center gap-3">
				<img src="/logo.png" alt="SynapSeq Logo" class="w-12 h-12 rounded-lg object-cover" />
				<h1
					class="text-2xl md:text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent"
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
