<script lang="ts">
	import type { ComponentType } from 'svelte';

	interface Props {
		icon: ComponentType;
		label: string;
		value: string | number;
		title?: string;
	}

	let { icon: IconComponent, label, value, title }: Props = $props();
</script>

<div
	class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-blue-400 dark:hover:border-blue-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-cyan-500/10 transition-all duration-200"
	{title}
>
	<div class="flex items-center gap-4">
		<div class="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-blue-600 dark:text-cyan-400">
			<IconComponent class="w-6 h-6" />
		</div>
		<div class="flex-1">
			<p class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
				{label}
			</p>
			<p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
				{value}
			</p>
		</div>
	</div>
</div>
