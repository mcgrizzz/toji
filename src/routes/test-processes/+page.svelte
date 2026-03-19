<script lang="ts">
	import { onMount } from 'svelte';
	import { getLibraryEntries, getRecipeBundle, type LibraryEntry } from '$lib/services/libraryService';
	import type { RecipeBundle } from '$lib/app/types';
	import DebugNav from '../DebugNav.svelte';

	let entries = $state<LibraryEntry[]>([]);
	let bundle = $state<RecipeBundle | null>(null);
	let loading = $state(true);
	let loadingBundle = $state(false);
	let error = $state('');
	let selectedSnapshotId = $state('');
	let debugOpen = $state(false);

	onMount(async () => {
		try {
			entries = await getLibraryEntries();
			if (entries.length > 0) {
				loadBundle(entries[0].snapshotId);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	});

	async function loadBundle(snapshotId: string) {
		selectedSnapshotId = snapshotId;
		if (!snapshotId) {
			bundle = null;
			return;
		}
		loadingBundle = true;
		error = '';
		try {
			bundle = await getRecipeBundle(snapshotId);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			bundle = null;
		} finally {
			loadingBundle = false;
		}
	}
</script>

<DebugNav current="processes" />

<div class="mx-auto max-w-4xl space-y-6 p-4">
	<div>
		<h1 class="text-lg font-semibold">Recipe Bundle Inspector</h1>
		<p class="text-sm text-muted-foreground">Browse DB-backed recipe bundles.</p>
	</div>

	{#if loading}
		<p class="text-sm text-muted-foreground">Loading library...</p>
	{:else if error && !bundle}
		<p class="text-sm text-destructive">{error}</p>
	{:else if entries.length === 0}
		<p class="text-sm text-muted-foreground">No seeded data found. Run <code>seedDemoData</code> first.</p>
	{:else}
		<!-- Library picker -->
		<div>
			<label for="entry-picker" class="text-xs font-medium text-muted-foreground">Recipe</label>
			<select
				id="entry-picker"
				class="mt-1 block w-full rounded border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
				value={selectedSnapshotId}
				onchange={(e) => loadBundle(e.currentTarget.value)}
			>
				<option value="">Select a recipe...</option>
				{#each entries as entry}
					<option value={entry.snapshotId}>{entry.name} (v{entry.version})</option>
				{/each}
			</select>
		</div>

		{#if loadingBundle}
			<p class="text-sm text-muted-foreground">Loading bundle...</p>
		{:else if error}
			<p class="text-sm text-destructive">{error}</p>
		{:else if bundle}
			<!-- Recipe header -->
			<section class="rounded-lg border bg-background p-4">
				<h2 class="text-base font-semibold">{bundle.name}</h2>
				{#if bundle.description}
					<p class="mt-1 text-sm text-muted-foreground">{bundle.description}</p>
				{/if}
				<p class="mt-2 font-mono text-xs text-muted-foreground">id={bundle.id}</p>
			</section>

			<!-- Koji preset -->
			<section class="rounded-lg border bg-background">
				<div class="border-b px-4 py-2">
					<h2 class="text-sm font-semibold">Koji Preset — {bundle.presets.kojiPreset.name}</h2>
				</div>
				<div class="p-4 font-mono text-sm space-y-1">
					<p>Tane-koji rate: {bundle.presets.kojiPreset.kojiGPerKgRice} g/kg rice</p>
					<p>Carrier: {bundle.presets.kojiPreset.carrier} @ {bundle.presets.kojiPreset.carrierRatioGPerG}× ratio</p>
				</div>
			</section>

			<!-- Moto preset -->
			<section class="rounded-lg border bg-background">
				<div class="border-b px-4 py-2">
					<h2 class="text-sm font-semibold">Moto Preset — {bundle.presets.motoPreset.name}</h2>
				</div>
				<div class="p-4 font-mono text-sm space-y-1">
					<p>Rice fraction: {(bundle.presets.motoPreset.riceFrac * 100).toFixed(1)}%</p>
					<p>Koji fraction: {(bundle.presets.motoPreset.kojiFrac * 100).toFixed(1)}%</p>
					<p>Water rate: {bundle.presets.motoPreset.waterLPerKg} L/kg</p>
					<p>Acid ref: {bundle.presets.motoPreset.acidRefMlPerL} mL/L @ {bundle.presets.motoPreset.acidRefStrengthPct}%</p>
				</div>
			</section>

			<!-- Moromi preset -->
			<section class="rounded-lg border bg-background">
				<div class="border-b px-4 py-2">
					<h2 class="text-sm font-semibold">Moromi Preset — {bundle.presets.moromiPreset.name}</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-xs text-muted-foreground">
								<th class="px-4 py-2">#</th>
								<th class="px-4 py-2">Stage</th>
								<th class="px-4 py-2 text-right">Rice %</th>
								<th class="px-4 py-2 text-right">Koji %</th>
								<th class="px-4 py-2 text-right">Water (L/kg)</th>
							</tr>
						</thead>
						<tbody>
							{#each bundle.presets.moromiPreset.stages as stage}
								<tr class="border-b font-mono">
									<td class="px-4 py-2 text-muted-foreground">{stage.ordinal}</td>
									<td class="px-4 py-2">{stage.name}</td>
									<td class="px-4 py-2 text-right">{(stage.riceFrac * 100).toFixed(1)}</td>
									<td class="px-4 py-2 text-right">{(stage.kojiFrac * 100).toFixed(1)}</td>
									<td class="px-4 py-2 text-right">{stage.waterLPerKg}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			<!-- Water profile -->
			{#if bundle.presets.waterProfile}
				<section class="rounded-lg border bg-background">
					<div class="border-b px-4 py-2">
						<h2 class="text-sm font-semibold">Water Profile — {bundle.presets.waterProfile.name}</h2>
					</div>
					<div class="p-4 font-mono text-sm space-y-1">
						{#each bundle.presets.waterProfile.ions as ion}
							<p>{ion.symbol}: {ion.targetPpm} ppm</p>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Schedules -->
			{#if Object.keys(bundle.schedules).length > 0}
				{#each Object.entries(bundle.schedules) as [kind, template]}
					{#if template}
						<section class="rounded-lg border bg-background">
							<div class="border-b px-4 py-2">
								<h2 class="text-sm font-semibold">Schedule — {template.name} <span class="text-muted-foreground font-normal">({kind})</span></h2>
							</div>
							<div class="p-4 text-sm space-y-1">
								{#each template.steps as step, i}
									<div class="flex items-baseline gap-3 font-mono text-xs">
										<span class="text-muted-foreground w-4 shrink-0 text-right">{i + 1}.</span>
										<span class="font-medium">{step.label}</span>
										<span class="text-muted-foreground">@{step.atH}h</span>
										{#if step.durationH != null}
											<span class="text-muted-foreground">({step.durationH}h)</span>
										{/if}
									</div>
								{/each}
							</div>
						</section>
					{/if}
				{/each}
			{/if}

			<!-- Amendments -->
			{#if bundle.template.amendments?.length}
				<section class="rounded-lg border bg-background">
					<div class="border-b px-4 py-2">
						<h2 class="text-sm font-semibold">Amendments</h2>
					</div>
					<div class="p-4 text-sm space-y-1">
						{#each bundle.template.amendments as amendment}
							<div class="flex items-baseline gap-2 font-mono text-xs">
								<span class="font-medium">{amendment.kind}</span>
								<span class="text-muted-foreground">
									{(amendment.fracOfTotalRice * 100).toFixed(3)}% of total rice
								</span>
								<span class="text-muted-foreground">→</span>
								<span class="text-muted-foreground">
									{amendment.placement.where}{amendment.placement.where === 'moromi' && 'stageOrdinal' in amendment.placement ? ` stage ${amendment.placement.stageOrdinal}` : ''}
								</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Defaults -->
			<section class="rounded-lg border bg-background">
				<div class="border-b px-4 py-2">
					<h2 class="text-sm font-semibold">Defaults</h2>
				</div>
				<div class="p-4 font-mono text-sm space-y-1">
					<p>Target: {bundle.defaults.targetValue} ({bundle.defaults.targetKind.replace(/_/g, ' ')})</p>
					<p>Acid: {bundle.defaultAcid.name} ({bundle.defaultAcid.strengthPct}%)</p>
					{#if bundle.template.recommendedRiceVariety}
						<p>Rice: {bundle.template.recommendedRiceVariety} {bundle.template.recommendedPolishPct ? `@ ${bundle.template.recommendedPolishPct}%` : ''}</p>
					{/if}
				</div>
			</section>

			<!-- Debug JSON -->
			<section class="rounded-lg border bg-background">
				<button
					type="button"
					class="w-full border-b px-4 py-2 text-left"
					onclick={() => (debugOpen = !debugOpen)}
				>
					<h2 class="text-sm font-semibold">
						{debugOpen ? '▾' : '▸'} Debug JSON
					</h2>
				</button>
				{#if debugOpen}
					<div class="p-3 space-y-4">
						<div>
							<p class="text-xs font-semibold text-muted-foreground mb-1">Library Entries</p>
							<pre class="max-h-[30vh] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-5">{JSON.stringify(entries, null, 2)}</pre>
						</div>
						<div>
							<p class="text-xs font-semibold text-muted-foreground mb-1">RecipeBundle</p>
							<pre class="max-h-[50vh] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-5">{JSON.stringify(bundle, null, 2)}</pre>
						</div>
					</div>
				{/if}
			</section>
		{/if}
	{/if}
</div>
