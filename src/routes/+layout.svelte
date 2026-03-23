<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { initAuth, connect, reducers } from '$lib/spacetimedb/connection';
	import Header from '$lib/components/Header.svelte';

	let { data, children } = $props();

	// Set auth context before child components — initAuth is synchronous
	// and determines whether connect() will use a JWT or anonymous auth.
	initAuth(data.user);

	onMount(() => {
		connect()
			.then(() => {
				if (data.user) {
					reducers().syncProfile({
						displayName: data.user.name,
						email: data.user.email || undefined,
						avatarUrl: data.user.image || undefined
					});
				}
			})
			.catch((err) => console.error('[stdb] failed to connect', err));
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Header />
<div>{@render children()}</div>
