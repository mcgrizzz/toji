<script lang="ts">
	import { onMount } from 'svelte';
	import { getLibraryEntries, type LibraryEntry } from '$lib/services/libraryService';

	let entries = $state<LibraryEntry[]>([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			entries = await getLibraryEntries();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	});
</script>

<main class="mx-auto max-w-3xl space-y-6 p-4">
	<div>
		<h1 class="text-lg font-semibold">Recipe Library</h1>
		<p class="text-sm text-muted-foreground">Browse recipes and copy them to your collection.</p>
	</div>

	{#if loading}
		<p class="text-sm text-muted-foreground">Loading...</p>
	{:else if error}
		<p class="text-sm text-destructive">{error}</p>
	{:else}
		{#each entries as entry (entry.snapshotId)}
			<a
				href="/library/{entry.snapshotId}"
				class="block rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
			>
				<h2 class="text-base font-semibold">{entry.name}</h2>
				{#if entry.description}
					<p class="mt-1 text-sm text-muted-foreground">{entry.description}</p>
				{/if}
				<p class="mt-2 font-mono text-xs text-muted-foreground">v{entry.version}</p>
			</a>
		{:else}
			<p class="text-sm text-muted-foreground">No recipes in the library.</p>
		{/each}
	{/if}
</main>
