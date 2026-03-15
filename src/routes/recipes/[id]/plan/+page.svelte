<script lang="ts">
	import { page } from '$app/stores';
	import { getRecipeById } from '$lib/data/recipes/recipeStore.svelte';
	import { resolveBundleFromSource } from '$lib/data/lookups';
	import { resolveBrewRun } from '$lib/engine/resolvers/resolveBrewRun';
	import type { BrewRunResult } from '$lib/app/types';
	import type { RecipePlanDraft } from '$lib/engine/models/planTypes';
	import RecipePlanForm from './RecipePlanForm.svelte';
	import MaterialsSummary from './MaterialsSummary.svelte';
	import WorkflowPreviewCard from './WorkflowPreviewCard.svelte';

	// ── Resolve recipe from store via route param ───────────────────────────
	const recipe = $derived(
		$page.params.id ? getRecipeById($page.params.id) : undefined
	);

	const bundle = $derived(recipe ? resolveBundleFromSource(recipe) : null);

	// ── Result state ────────────────────────────────────────────────────────
	let result = $state<BrewRunResult | null>(null);
	let error = $state('');

	function preview(plan: RecipePlanDraft) {
		error = '';
		result = null;
		if (!bundle) return;

		try {
			result = resolveBrewRun({
				plan,
				presets: bundle.presets,
				schedules: bundle.schedules
			});
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}
</script>

{#if !recipe || !bundle}
	<main class="mx-auto max-w-3xl p-4">
		<p class="text-destructive">Recipe not found.</p>
		<a href="/recipes" class="text-sm text-primary hover:underline">&larr; My Recipes</a>
	</main>
{:else}
	<main class="mx-auto max-w-4xl space-y-6 p-4">
		<div>
			<a href="/recipes" class="text-xs text-muted-foreground hover:underline">&larr; My Recipes</a>
			<h1 class="text-lg font-semibold">{bundle.name} — Plan</h1>
			{#if bundle.description}
				<p class="text-sm text-muted-foreground">{bundle.description}</p>
			{/if}
		</div>

		<RecipePlanForm {bundle} onpreview={preview} />

		{#if error}
			<p role="alert" class="text-sm text-destructive">{error}</p>
		{/if}

		{#if result}
			<MaterialsSummary bill={result.materials} kojiPreset={bundle.presets.kojiPreset} />

			{#each Object.values(bundle.schedules) as template}
				{#if template}
					<WorkflowPreviewCard {template} />
				{/if}
			{/each}
		{/if}
	</main>
{/if}
