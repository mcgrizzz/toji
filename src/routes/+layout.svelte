<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { connect, reducers } from '$lib/spacetimedb/connection';

	let { data, children } = $props();

	onMount(() => {
		if (data.user) {
			connect(data.idToken ?? undefined)
				.then(() => {
					reducers().syncProfile({
						displayName: data.user!.name,
						email: data.user!.email || undefined,
						avatarUrl: data.user!.picture || undefined
					});
				})
				.catch((err) => console.error('[stdb] failed to connect', err));
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{#if data.user}
	{@render children()}
{:else}
	<div class="flex min-h-screen items-center justify-center bg-background">
		<div class="flex flex-col items-center gap-6">
			<h1 class="text-2xl font-light tracking-wide text-foreground">toji</h1>
			<a
				href="/auth/login"
				class="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Login with Discord
			</a>
		</div>
	</div>
{/if}
