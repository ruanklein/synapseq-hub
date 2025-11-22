<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.ico';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>SynapSeq Hub</title>
	<meta
		name="description"
		content="The official repository of sequences, presets, and soundscapes for SynapSeq"
	/>
</svelte:head>

{@render children()}
