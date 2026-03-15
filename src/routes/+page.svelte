<script lang="ts">
	import { getLibraryRecipeEntries, resolveRecipeBundle } from '$lib/data/library';

	const entries = getLibraryRecipeEntries();

	// Resolve bundles for display metadata (preset names, rice variety, etc.)
	const bundles = entries.map((e) => resolveRecipeBundle(e.latestSnapshotId)).filter((b) => b != null);
</script>

<main class="mx-auto max-w-3xl space-y-6 p-4">
	<div>
		<h1 class="text-lg font-semibold">Recipes</h1>
		<p class="text-sm text-muted-foreground">Select a recipe to start planning a brew.</p>
	</div>

	{#each bundles as recipe}
		<a
			href="/recipes/{recipe.id}/new"
			class="block rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
		>
			<h2 class="text-base font-semibold">{recipe.name}</h2>
			{#if recipe.description}
				<p class="mt-1 text-sm text-muted-foreground">{recipe.description}</p>
			{/if}
			<div class="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
				{#if recipe.template.recommendedRiceVariety}
					<span class="rounded-sm bg-muted px-2 py-0.5">
						{recipe.template.recommendedRiceVariety}
						{#if recipe.template.recommendedPolishPct}
							<span class="font-mono">{recipe.template.recommendedPolishPct}%</span>
						{/if}
					</span>
				{/if}
				<span class="rounded-sm bg-muted px-2 py-0.5">{recipe.presets.kojiPreset.name}</span>
				<span class="rounded-sm bg-muted px-2 py-0.5">{recipe.presets.motoPreset.name}</span>
				<span class="rounded-sm bg-muted px-2 py-0.5">{recipe.presets.moromiPreset.name}</span>
				{#if recipe.presets.waterProfile}
					<span class="rounded-sm bg-muted px-2 py-0.5">{recipe.presets.waterProfile.name}</span>
				{/if}
			</div>
			<p class="mt-3 text-sm font-medium text-primary">Start plan &rarr;</p>
		</a>
	{:else}
		<p class="text-sm text-muted-foreground">No recipes yet.</p>
	{/each}
</main>
