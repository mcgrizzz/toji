<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getRecipeById, deleteRecipe } from '$lib/data/recipes/recipeStore.svelte';
	import { resolveBundleFromSource } from '$lib/data/lookups';

	const recipe = $derived(
		$page.params.id ? getRecipeById($page.params.id) : undefined
	);

	const bundle = $derived(recipe ? resolveBundleFromSource(recipe) : null);

	function handleDelete() {
		if (!recipe) return;
		deleteRecipe(recipe.id);
		goto('/recipes');
	}
</script>

{#if !recipe || !bundle}
	<main class="mx-auto max-w-3xl p-4">
		<p class="text-destructive">Recipe not found.</p>
		<a href="/recipes" class="text-sm text-primary hover:underline">&larr; My Recipes</a>
	</main>
{:else}
	<main class="mx-auto max-w-3xl space-y-6 p-4">
		<div>
			<a href="/recipes" class="text-xs text-muted-foreground hover:underline">&larr; My Recipes</a>
			<h1 class="text-lg font-semibold">{bundle.name}</h1>
			{#if bundle.description}
				<p class="mt-1 text-sm text-muted-foreground">{bundle.description}</p>
			{/if}
		</div>

		<section class="space-y-3">
			<h2 class="text-sm font-medium text-muted-foreground">Methods</h2>
			<div class="flex flex-wrap gap-2 text-xs">
				<span class="rounded-sm bg-muted px-2 py-0.5">{bundle.presets.kojiPreset.name}</span>
				<span class="rounded-sm bg-muted px-2 py-0.5">{bundle.presets.motoPreset.name}</span>
				<span class="rounded-sm bg-muted px-2 py-0.5">{bundle.presets.moromiPreset.name}</span>
			</div>
		</section>

		{#if bundle.presets.waterProfile}
			<section class="space-y-3">
				<h2 class="text-sm font-medium text-muted-foreground">Water Profile</h2>
				<span class="rounded-sm bg-muted px-2 py-0.5 text-xs">{bundle.presets.waterProfile.name}</span>
			</section>
		{/if}

		{#if bundle.template.amendments?.length}
			<section class="space-y-3">
				<h2 class="text-sm font-medium text-muted-foreground">Amendments</h2>
				<ul class="space-y-1 text-sm">
					{#each bundle.template.amendments as amendment}
						<li class="text-muted-foreground">{amendment.kind} — {amendment.placement}</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if bundle.template.recommendedRiceVariety}
			<section class="space-y-3">
				<h2 class="text-sm font-medium text-muted-foreground">Defaults</h2>
				<div class="flex flex-wrap gap-2 text-xs">
					<span class="rounded-sm bg-muted px-2 py-0.5">
						{bundle.template.recommendedRiceVariety}
						{#if bundle.template.recommendedPolishPct}
							<span class="font-mono">{bundle.template.recommendedPolishPct}%</span>
						{/if}
					</span>
				</div>
			</section>
		{/if}

		<div class="flex items-center gap-3">
			<a
				href="/recipes/{recipe.id}/plan"
				class="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
			>
				Plan a Brew
			</a>
			<button
				type="button"
				onclick={handleDelete}
				class="rounded border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
			>
				Delete
			</button>
		</div>
	</main>
{/if}
