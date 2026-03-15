<script lang="ts">
	import { getLibraryRecipeEntries } from '$lib/data/library';

	const entries = getLibraryRecipeEntries();
</script>

<main class="mx-auto max-w-3xl space-y-6 p-4">
	<div>
		<h1 class="text-lg font-semibold">Recipe Library</h1>
		<p class="text-sm text-muted-foreground">Browse recipes and copy them to your collection.</p>
	</div>

	{#each entries as entry (entry.id)}
		<a
			href="/library/{entry.latestSnapshotId}"
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
</main>
