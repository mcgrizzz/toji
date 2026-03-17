<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getMyRecipeBundle } from '$lib/services/recipeService';
	import { getMyInventory, type Inventory } from '$lib/services/inventoryService';
	import { createBatch } from '$lib/services/batchService';
	import { resolveBrewRun } from '$lib/engine/resolvers/resolveBrewRun';
	import type { RecipeBundle, BrewRunResult } from '$lib/app/types';
	import type { RecipePlanDraft } from '$lib/engine/models/planTypes';
	import RecipePlanForm from './RecipePlanForm.svelte';
	import MaterialsSummary from './MaterialsSummary.svelte';
	import WorkflowPreviewCard from './WorkflowPreviewCard.svelte';

	// ── Async data ─────────────────────────────────────────────────────────
	let bundle = $state<RecipeBundle | null>(null);
	let inventory = $state<Inventory | null>(null);
	let loading = $state(true);
	let loadError = $state('');

	$effect(() => {
		const recipeId = $page.params.id;
		if (!recipeId) return;
		loading = true;
		loadError = '';
		bundle = null;
		inventory = null;
		result = null;
		currentDraft = null;

		Promise.all([getMyRecipeBundle(recipeId), getMyInventory()])
			.then(([b, inv]) => {
				bundle = b;
				inventory = inv;
			})
			.catch((e) => (loadError = e instanceof Error ? e.message : String(e)))
			.finally(() => (loading = false));
	});

	// ── Preview state ──────────────────────────────────────────────────────
	let result = $state<BrewRunResult | null>(null);
	let error = $state('');
	let currentDraft = $state<RecipePlanDraft | null>(null);

	function preview(plan: RecipePlanDraft) {
		error = '';
		result = null;
		currentDraft = plan;
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

	// ── Start batch ────────────────────────────────────────────────────────
	let starting = $state(false);

	async function startBatch() {
		const recipeId = $page.params.id;
		if (!recipeId || !currentDraft || starting) return;
		starting = true;
		error = '';

		try {
			await createBatch(recipeId, currentDraft);
			goto('/recipes');
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			starting = false;
		}
	}
</script>

{#if loading}
	<main class="mx-auto max-w-4xl p-4">
		<p class="text-sm text-muted-foreground">Loading...</p>
	</main>
{:else if loadError || !bundle || !inventory}
	<main class="mx-auto max-w-4xl p-4">
		<p class="text-destructive">{loadError || 'Recipe not found.'}</p>
		<a href="/recipes" class="text-sm text-primary hover:underline">&larr; My Recipes</a>
	</main>
{:else}
	<main class="mx-auto max-w-4xl space-y-6 p-4">
		<div>
			<a
				href="/recipes/{$page.params.id}"
				class="text-xs text-muted-foreground hover:underline">&larr; {bundle.name}</a
			>
			<h1 class="text-lg font-semibold">{bundle.name} — Plan</h1>
			{#if bundle.description}
				<p class="text-sm text-muted-foreground">{bundle.description}</p>
			{/if}
		</div>

		<RecipePlanForm {bundle} {inventory} onpreview={preview} />

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

			<button
				type="button"
				onclick={startBatch}
				disabled={starting}
				class="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none"
			>
				{starting ? 'Creating...' : 'Start Batch'}
			</button>
		{/if}
	</main>
{/if}
