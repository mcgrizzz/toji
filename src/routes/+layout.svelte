<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { connect } from '$lib/spacetimedb/connection';

	let { children } = $props();

	onMount(() => {
		connect().catch((err) => console.error('[stdb] failed to connect', err));
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
