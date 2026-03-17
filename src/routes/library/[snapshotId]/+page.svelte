<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getRecipeBundle } from '$lib/services/libraryService';
	import { copyRecipeSnapshotToRecipe } from '$lib/services/recipeService';
	import type { RecipeBundle } from '$lib/app/types';

	let bundle = $state<RecipeBundle | null>(null);
	let loading = $state(true);
	let error = $state('');
	let copying = $state(false);

	$effect(() => {
		const snapshotId = $page.params.snapshotId;
		if (!snapshotId) return;
		loading = true;
		error = '';
		bundle = null;

		getRecipeBundle(snapshotId)
			.then((b) => (bundle = b))
			.catch((e) => (error = e instanceof Error ? e.message : String(e)))
			.finally(() => (loading = false));
	});

	async function copyToMyRecipes() {
		const snapshotId = $page.params.snapshotId;
		if (!snapshotId || copying) return;
		copying = true;
		try {
			await copyRecipeSnapshotToRecipe(snapshotId);
			goto('/recipes');
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			copying = false;
		}
	}
</script>

{#if loading}
	<main class="mx-auto max-w-3xl p-4">
		<p class="text-sm text-muted-foreground">Loading...</p>
	</main>
{:else if error || !bundle}
	<main class="mx-auto max-w-3xl p-4">
		<p class="text-destructive">{error || 'Snapshot not found.'}</p>
		<a href="/library" class="text-sm text-primary hover:underline">&larr; Library</a>
	</main>
{:else}
	<main class="mx-auto max-w-3xl space-y-6 p-4">
		<div>
			<a href="/library" class="text-xs text-muted-foreground hover:underline">&larr; Library</a>
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
				<span class="rounded-sm bg-muted px-2 py-0.5 text-xs"
					>{bundle.presets.waterProfile.name}</span
				>
			</section>
		{/if}

		{#if bundle.template.amendments?.length}
			<section class="space-y-3">
				<h2 class="text-sm font-medium text-muted-foreground">Amendments</h2>
				<ul class="space-y-1 text-sm">
					{#each bundle.template.amendments as amendment}
						<li class="text-muted-foreground">
							{amendment.kind} — {amendment.placement.where}{amendment.placement.where === 'moromi' && 'stageOrdinal' in amendment.placement
								? ` (stage ${amendment.placement.stageOrdinal})`
								: ''}
						</li>
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

		<button
			type="button"
			onclick={copyToMyRecipes}
			disabled={copying}
			class="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none"
		>
			{copying ? 'Copying...' : 'Copy to My Recipes'}
		</button>
	</main>
{/if}
