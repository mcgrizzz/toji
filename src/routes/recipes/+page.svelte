<script lang="ts">
	import { getAllRecipes } from '$lib/data/recipes/recipeStore.svelte';

	const recipes = $derived(getAllRecipes());
</script>

<main class="mx-auto max-w-3xl space-y-6 p-4">
	<div>
		<h1 class="text-lg font-semibold">My Recipes</h1>
		<p class="text-sm text-muted-foreground">Your working recipes. Select one to plan a brew.</p>
	</div>

	{#each recipes as recipe (recipe.id)}
		<a
			href="/recipes/{recipe.id}/plan"
			class="block rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
		>
			<h2 class="text-base font-semibold">{recipe.name}</h2>
			{#if recipe.body.description}
				<p class="mt-1 text-sm text-muted-foreground">{recipe.body.description}</p>
			{/if}
			<p class="mt-3 text-sm font-medium text-primary">Plan brew &rarr;</p>
		</a>
	{:else}
		<div class="rounded-lg border border-dashed bg-background p-6 text-center">
			<p class="text-sm text-muted-foreground">No recipes yet.</p>
			<a href="/library" class="mt-2 inline-block text-sm font-medium text-primary hover:underline">
				Browse the library to copy one
			</a>
		</div>
	{/each}
</main>
