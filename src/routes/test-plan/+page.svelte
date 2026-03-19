<script lang="ts">
	import { onMount } from 'svelte';
	import { getLibraryEntries, getRecipeBundle, type LibraryEntry } from '$lib/services/libraryService';
	import { getSeedInventory, type Inventory } from '$lib/services/inventoryService';
	import type { RecipeBundle } from '$lib/app/types';
	import DebugNav from '../DebugNav.svelte';
	import { resolvePlan } from '$lib/engine/resolvers/resolvePlan';
	import type { MaterialsBill, RecipePlan } from '$lib/engine/models/planTypes';

	let entries = $state<LibraryEntry[]>([]);
	let bundle = $state<RecipeBundle | null>(null);
	let inventory = $state<Inventory | null>(null);
	let plan = $state<RecipePlan | null>(null);
	let bill = $state<MaterialsBill | null>(null);
	let loading = $state(true);
	let loadingBundle = $state(false);
	let error = $state('');
	let selectedSnapshotId = $state('');
	let targetValue = $state(5.5);
	let debugOpen = $state(false);

	onMount(async () => {
		try {
			[entries, inventory] = await Promise.all([getLibraryEntries(), getSeedInventory()]);
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
		bundle = null;
		plan = null;
		bill = null;
		if (!snapshotId) return;
		loadingBundle = true;
		error = '';
		try {
			bundle = await getRecipeBundle(snapshotId);
			targetValue = bundle.defaults.targetValue;
			buildPlan();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			bundle = null;
		} finally {
			loadingBundle = false;
		}
	}

	function buildPlan() {
		if (!bundle || !inventory) return;

		const riceLot = inventory.riceLots[0];
		const kojiStrain = inventory.kojiStrains[0];
		const yeast = inventory.yeasts[0];

		if (!riceLot || !yeast) {
			error = 'Inventory is empty — need at least one rice lot and one yeast to build a plan.';
			return;
		}

		const autoPlan: RecipePlan = {
			recipeSnapshotId: bundle.id,
			target: { kind: bundle.defaults.targetKind, value: targetValue },
			koji: kojiStrain
				? { mode: 'make', riceLot, kojiStrain }
				: { mode: 'premade' },
			moto: {
				riceLot,
				yeast,
				acid: bundle.defaultAcid
			},
			moromi: {
				stages: bundle.presets.moromiPreset.stages.map((s) => ({
					stageOrdinal: s.ordinal,
					riceLot
				}))
			},
			water: bundle.presets.waterProfile
		};

		plan = autoPlan;

		try {
			bill = resolvePlan(autoPlan, bundle.presets);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	function r(n: number, digits = 3) {
		return n.toFixed(digits);
	}
</script>

<DebugNav current="plan" />

<div class="mx-auto max-w-4xl space-y-6 p-4">
	<div>
		<h1 class="text-lg font-semibold">Plan Resolver Debug</h1>
		<p class="text-sm text-muted-foreground">Auto-builds a plan from DB presets + inventory, then resolves materials.</p>
	</div>

	{#if loading}
		<p class="text-sm text-muted-foreground">Loading library &amp; inventory...</p>
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
		{:else if bill}
			<!-- Target override -->
			<div class="flex items-center gap-3 text-sm text-muted-foreground">
				<label for="target-value" class="shrink-0">Target ({bundle?.defaults.targetKind.replace(/_/g, ' ')}):</label>
				<input
					id="target-value"
					type="number"
					step="0.1"
					min="0.1"
					class="w-24 rounded border bg-background px-2 py-1 font-mono text-sm text-foreground focus:ring-2 focus:ring-ring"
					bind:value={targetValue}
					onchange={() => buildPlan()}
				/>
				<span class="text-xs">kg · using first available inventory items</span>
			</div>

			<!-- Koji -->
			<section class="rounded-lg border bg-background">
				<div class="border-b px-4 py-2">
					<h2 class="text-sm font-semibold">Koji</h2>
				</div>
				<div class="p-4 font-mono text-sm space-y-1">
					{#if bill.koji.mode === 'premade'}
						<p>Buy <strong>{r(bill.koji.requiredKg)} kg</strong> premade koji</p>
					{:else}
						<p>Rice: <strong>{r(bill.koji.riceKg)} kg</strong> × {bill.koji.riceLot.variety} {bill.koji.riceLot.polishPct}% ({bill.koji.riceLot.lotLabel})</p>
						<p>Strain: {bill.koji.kojiStrain.name}</p>
						<p>Tane-koji: {r(bill.koji.taneKojiG, 2)} g</p>
						<p>Carrier: {r(bill.koji.carrierG, 2)} g</p>
						<p>Est. dry koji: {r(bill.koji.estimatedDryKojiKg)} kg</p>
					{/if}
				</div>
			</section>

			<!-- Moto -->
			<section class="rounded-lg border bg-background">
				<div class="border-b px-4 py-2">
					<h2 class="text-sm font-semibold">Moto</h2>
				</div>
				<div class="p-4 font-mono text-sm space-y-1">
					<p>Total rice: <strong>{r(bill.moto.totalRiceKg)} kg</strong></p>
					<p>Kake: {r(bill.moto.kakeKg)} kg × {bill.moto.riceLot.variety} {bill.moto.riceLot.polishPct}%</p>
					<p>Koji: {r(bill.moto.kojiKg)} kg</p>
					<p>Water: {r(bill.moto.waterL)} L</p>
					<p>Acid ({bill.moto.acid.name}): {r(bill.moto.acidDoseMl, 2)} mL @ {bill.moto.acid.strengthPct}%</p>
					<p>Yeast: {bill.moto.yeast.name} ({bill.moto.yeast.format})</p>
				</div>
			</section>

			<!-- Moromi -->
			<section class="rounded-lg border bg-background">
				<div class="border-b px-4 py-2">
					<h2 class="text-sm font-semibold">Moromi</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-xs text-muted-foreground">
								<th class="px-4 py-2">Stage</th>
								<th class="px-4 py-2 text-right">Kake (kg)</th>
								<th class="px-4 py-2 text-right">Koji (kg)</th>
								<th class="px-4 py-2 text-right">Water (L)</th>
								<th class="px-4 py-2">Rice Lot</th>
							</tr>
						</thead>
						<tbody>
							{#each bill.moromi as stage}
								<tr class="border-b font-mono">
									<td class="px-4 py-2">{stage.stageName}</td>
									<td class="px-4 py-2 text-right">{r(stage.kakeKg)}</td>
									<td class="px-4 py-2 text-right">{r(stage.kojiKg)}</td>
									<td class="px-4 py-2 text-right">{r(stage.waterL)}</td>
									<td class="px-4 py-2 text-xs">{stage.riceLot.variety} {stage.riceLot.polishPct}%</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				{#each bill.engineOutput.allocations as alloc, i}
					{#if alloc.extras && alloc.extras.length > 0}
						<div class="border-t px-4 py-2 text-sm font-mono text-muted-foreground">
							Allocation {i} extras:
							{#each alloc.extras as e}
								<span class="ml-2">{e.kind}: {r(e.massKg, 4)} kg</span>
							{/each}
						</div>
					{/if}
				{/each}
			</section>

			<!-- Rice by lot -->
			<section class="rounded-lg border bg-background">
				<div class="border-b px-4 py-2">
					<h2 class="text-sm font-semibold">Rice Summary (by lot)</h2>
				</div>
				<div class="p-4 space-y-1 font-mono text-sm">
					{#each bill.riceByLot as entry}
						<p><strong>{r(entry.totalKg)} kg</strong> × {entry.lot.variety} {entry.lot.polishPct}% {entry.lot.lotLabel ? `(${entry.lot.lotLabel})` : ''}</p>
					{/each}
				</div>
			</section>

			<!-- Water bill -->
			{#if bill.water}
				<section class="rounded-lg border bg-background">
					<div class="border-b px-4 py-2">
						<h2 class="text-sm font-semibold">Water — {bill.water.profileName}</h2>
					</div>
					<div class="p-4 font-mono text-sm space-y-1">
						<p>Hardness: {r(bill.water.hardnessAsCaCO3, 1)} ppm as CaCO3</p>
						<p>SO4:Cl ratio: {bill.water.so4ClRatio != null ? r(bill.water.so4ClRatio, 2) : '—'}</p>
						<p>Ca:Mg ratio: {bill.water.caMgRatio != null ? r(bill.water.caMgRatio, 2) : '—'}</p>
					</div>
					{#if bill.water.motoAdditions.length > 0}
						<div class="border-t px-4 py-3">
							<p class="text-xs font-semibold text-muted-foreground mb-1">Moto additions</p>
							{#each bill.water.motoAdditions as line}
								<p class="font-mono text-sm">{line.salt.name}: {r(line.massG, 3)} g</p>
							{/each}
						</div>
					{/if}
					{#if bill.water.moromiAdditions.length > 0}
						<div class="border-t px-4 py-3">
							<p class="text-xs font-semibold text-muted-foreground mb-1">Moromi additions</p>
							{#each bill.water.moromiAdditions as line}
								<p class="font-mono text-sm">{line.salt.name}: {r(line.massG, 3)} g</p>
							{/each}
						</div>
					{/if}
				</section>
			{/if}

			<!-- Totals -->
			<section class="rounded-lg border bg-background">
				<div class="border-b px-4 py-2">
					<h2 class="text-sm font-semibold">Engine Totals</h2>
				</div>
				<div class="p-4 font-mono text-sm space-y-1">
					<p>Total rice: {r(bill.engineOutput.totals.totalRiceKg)} kg</p>
					<p>Total koji: {r(bill.engineOutput.totals.totalKojiKg)} kg ({r(bill.engineOutput.totals.kojiFrac * 100, 1)}%)</p>
					<p>Total kake: {r(bill.engineOutput.totals.totalKakeKg)} kg</p>
					<p>Total water: {r(bill.engineOutput.totals.totalWaterL)} L</p>
					<p>Overall water rate: {r(bill.engineOutput.totals.waterLPerKg)} L/kg</p>
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
							<p class="text-xs font-semibold text-muted-foreground mb-1">RecipeBundle</p>
							<pre class="max-h-[30vh] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-5">{JSON.stringify(bundle, null, 2)}</pre>
						</div>
						<div>
							<p class="text-xs font-semibold text-muted-foreground mb-1">RecipePlan (auto-built)</p>
							<pre class="max-h-[30vh] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-5">{JSON.stringify(plan, null, 2)}</pre>
						</div>
						<div>
							<p class="text-xs font-semibold text-muted-foreground mb-1">MaterialsBill</p>
							<pre class="max-h-[50vh] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-5">{JSON.stringify(bill, null, 2)}</pre>
						</div>
					</div>
				{/if}
			</section>
		{/if}
	{/if}
</div>
