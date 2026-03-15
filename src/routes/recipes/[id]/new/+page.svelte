<script lang="ts">
	import { page } from '$app/stores';
	import { resolveRecipeBundle } from '$lib/data/library';
	import { resolveBrewRun } from '$lib/engine/resolvers/resolveBrewRun';
	import type { BrewRunResult } from '$lib/app/types';
	import type { RecipePlan } from '$lib/engine/models/planTypes';
	import RecipePlanForm from './RecipePlanForm.svelte';
	import MaterialsSummary from './MaterialsSummary.svelte';
	import WorkflowPreviewCard from './WorkflowPreviewCard.svelte';

	// ── Resolve bundle from snapshot id via route param ─────────────────────
	const bundle = $derived(
		$page.params.id ? resolveRecipeBundle($page.params.id) : null
	);

	// ── Result state ────────────────────────────────────────────────────────
	let result = $state<BrewRunResult | null>(null);
	let error = $state('');

	function preview(plan: RecipePlan) {
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

{#if !bundle}
	<main class="mx-auto max-w-3xl p-4">
		<p class="text-destructive">Recipe "{$page.params.id}" not found.</p>
		<a href="/" class="text-sm text-primary hover:underline">&larr; Back to recipes</a>
	</main>
{:else}
	<main class="mx-auto max-w-4xl space-y-6 p-4">
		<div>
			<a href="/" class="text-xs text-muted-foreground hover:underline">&larr; Recipes</a>
			<h1 class="text-lg font-semibold">{bundle.name} — New Plan</h1>
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
