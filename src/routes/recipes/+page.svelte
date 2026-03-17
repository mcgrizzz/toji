<script lang="ts">
	import { onMount } from 'svelte';
	import { getMyRecipes, type RecipeListItem } from '$lib/services/recipeService';

	let recipes = $state<RecipeListItem[]>([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			recipes = await getMyRecipes();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	});
</script>

<main class="mx-auto max-w-3xl space-y-6 p-4">
	<div>
		<h1 class="text-lg font-semibold">My Recipes</h1>
		<p class="text-sm text-muted-foreground">Your working recipes. Select one to plan a brew.</p>
	</div>

	{#if loading}
		<p class="text-sm text-muted-foreground">Loading...</p>
	{:else if error}
		<p class="text-sm text-destructive">{error}</p>
	{:else}
		{#each recipes as recipe (recipe.id)}
			<a
				href="/recipes/{recipe.id}"
				class="block rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
			>
				<h2 class="text-base font-semibold">{recipe.name}</h2>
				{#if recipe.description}
					<p class="mt-1 text-sm text-muted-foreground">{recipe.description}</p>
				{/if}
			</a>
		{:else}
			<div class="rounded-lg border border-dashed bg-background p-6 text-center">
				<p class="text-sm text-muted-foreground">No recipes yet.</p>
				<a
					href="/library"
					class="mt-2 inline-block text-sm font-medium text-primary hover:underline"
				>
					Browse the library to copy one
				</a>
			</div>
		{/each}
	{/if}
</main>
