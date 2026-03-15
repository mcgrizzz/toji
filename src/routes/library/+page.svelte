<script lang="ts">
	import { goto } from '$app/navigation';
	import { getLibraryRecipeEntries, resolveRecipeBundle } from '$lib/data/library';
	import { createRecipeFromSnapshot } from '$lib/app/adapters/copySnapshotToRecipe';
	import { addRecipe } from '$lib/data/recipes/recipeStore.svelte';

	import type { RecipeBundle } from '$lib/app/types';
	import type { LibraryRecipeEntry } from '$lib/app/models/library';

	const entries = getLibraryRecipeEntries();
	const bundles: { entry: LibraryRecipeEntry; bundle: RecipeBundle }[] = entries
		.map((e) => ({ entry: e, bundle: resolveRecipeBundle(e.latestSnapshotId) }))
		.filter((b): b is { entry: LibraryRecipeEntry; bundle: RecipeBundle } => b.bundle != null);

	function copyToMyRecipes(snapshotId: string) {
		const recipe = createRecipeFromSnapshot(snapshotId);
		if (!recipe) return;
		addRecipe(recipe);
		goto('/recipes');
	}
</script>

<main class="mx-auto max-w-3xl space-y-6 p-4">
	<div>
		<h1 class="text-lg font-semibold">Recipe Library</h1>
		<p class="text-sm text-muted-foreground">Browse recipes and copy them to your collection.</p>
	</div>

	{#each bundles as { entry, bundle }}
		<div
			class="rounded-lg border bg-background p-4"
		>
			<h2 class="text-base font-semibold">{bundle.name}</h2>
			{#if bundle.description}
				<p class="mt-1 text-sm text-muted-foreground">{bundle.description}</p>
			{/if}
			<div class="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
				{#if bundle.template.recommendedRiceVariety}
					<span class="rounded-sm bg-muted px-2 py-0.5">
						{bundle.template.recommendedRiceVariety}
						{#if bundle.template.recommendedPolishPct}
							<span class="font-mono">{bundle.template.recommendedPolishPct}%</span>
						{/if}
					</span>
				{/if}
				<span class="rounded-sm bg-muted px-2 py-0.5">{bundle.presets.kojiPreset.name}</span>
				<span class="rounded-sm bg-muted px-2 py-0.5">{bundle.presets.motoPreset.name}</span>
				<span class="rounded-sm bg-muted px-2 py-0.5">{bundle.presets.moromiPreset.name}</span>
				{#if bundle.presets.waterProfile}
					<span class="rounded-sm bg-muted px-2 py-0.5">{bundle.presets.waterProfile.name}</span>
				{/if}
			</div>
			<button
				type="button"
				onclick={() => copyToMyRecipes(entry.latestSnapshotId)}
				class="mt-3 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
			>
				Copy to My Recipes
			</button>
		</div>
	{:else}
		<p class="text-sm text-muted-foreground">No recipes in the library.</p>
	{/each}
</main>
