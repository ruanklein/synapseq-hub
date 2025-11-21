<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Moon, Lightbulb, Home, List, Menu, X } from 'lucide-svelte';

	let theme = $state<'light' | 'dark'>('light');
	let mobileMenuOpen = $state(false);

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

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<header class="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
	<nav
		class="container mx-auto max-w-7xl px-6 py-3 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-gray-200/20 dark:shadow-gray-950/40"
	>
		<div class="flex items-center justify-between gap-6">
			<!-- Mobile Menu Button (Left side on mobile) -->
			<button
				onclick={toggleMobileMenu}
				class="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-linear-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-850 text-gray-700 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
				aria-label="Toggle menu"
			>
				{#if mobileMenuOpen}
					<X class="w-4 h-4" />
				{:else}
					<Menu class="w-4 h-4" />
				{/if}
			</button>

			<!-- Logo and Title (Hidden on mobile) -->
			<a href="/" class="hidden sm:flex items-center gap-3 hover:opacity-80 transition-opacity">
				<img src="/logo.png" alt="SynapSeq Logo" class="w-9 h-9 rounded-lg object-cover" />
				<h1
					class="text-xl md:text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent"
				>
					SynapSeq Hub
				</h1>
			</a>

			<!-- Spacer for mobile to push theme toggle to the right -->
			<div class="flex-1 sm:hidden"></div>

			<div class="flex items-center gap-3">
				<!-- Desktop Navigation Links -->
				<nav class="hidden md:flex items-center gap-2">
					<a
						href="/"
						class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors {$page
							.url.pathname === '/'
							? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
							: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
					>
						<Home class="w-4 h-4" />
						Home
					</a>
					<a
						href="/sequences"
						class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors {$page
							.url.pathname === '/sequences'
							? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
							: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
					>
						<List class="w-4 h-4" />
						Sequences
					</a>
				</nav>

				<!-- Theme Toggle -->
				<button
					onclick={toggleTheme}
					class="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-linear-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-850 text-gray-700 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200"
					aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
				>
					{#if theme === 'light'}
						<Moon class="w-4 h-4" />
						<span class="hidden sm:inline text-sm font-medium">Dark Mode</span>
					{:else}
						<Lightbulb class="w-4 h-4" />
						<span class="hidden sm:inline text-sm font-medium">Light Mode</span>
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile Menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
				<nav class="flex flex-col gap-2">
					<a
						href="/"
						onclick={closeMobileMenu}
						class="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors {$page
							.url.pathname === '/'
							? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
							: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
					>
						<Home class="w-5 h-5" />
						Home
					</a>
					<a
						href="/sequences"
						onclick={closeMobileMenu}
						class="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors {$page
							.url.pathname === '/sequences'
							? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
							: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
					>
						<List class="w-5 h-5" />
						Sequences
					</a>
				</nav>
			</div>
		{/if}
	</nav>
</header>

<!-- Spacer to prevent content from hiding under fixed header -->
<div class="h-20"></div>
