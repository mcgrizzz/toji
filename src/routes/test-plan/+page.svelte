<script lang="ts">
	import { resolvePlan } from '$lib/engine/resolvePlan';
	import type { RecipePlan, LoadedPresets, MaterialsBill } from '$lib/engine/planTypes';
	import type { WaterProfile, MineralSalt, StoredRecipeTemplate } from '$lib/engine/recipeTypes';

	// ── Built-in preset data (mirrors seed.ts) ─────────────────────────────────
	const kojiPreset = {
		id: '00000001-0000-0000-0000-000000000001',
		name: 'Ueda Standard',
		isBuiltIn: true,
		kojiGPerKgRice: 0.08,
		carrier: 'Toasted Rice Flour',
		carrierRatioGPerG: 5
	} as const;

	const motoPreset = {
		id: '00000002-0000-0000-0000-000000000001',
		name: 'Sokujo Standard',
		isBuiltIn: true,
		riceFrac: 0.07,
		kojiFrac: 0.3,
		waterLPerKg: 1.07,
		yeastPitchRateMPerMl: 3,
		acidRefMlPerL: 0.03,
		acidRefStrengthPct: 88
	} as const;

	const moromiPreset = {
		id: '00000003-0000-0000-0000-000000000001',
		name: 'Sandan Standard',
		isBuiltIn: true,
		stages: [
			{ name: 'Soe', ordinal: 1, riceFrac: 0.15, kojiFrac: 0.28, waterLPerKg: 0.92 },
			{ name: 'Naka', ordinal: 2, riceFrac: 0.3, kojiFrac: 0.21, waterLPerKg: 1.2 },
			{ name: 'Tome', ordinal: 3, riceFrac: 0.48, kojiFrac: 0.21, waterLPerKg: 1.2 }
		]
	};

	// Ginjo 1 profile: light Ca/Mg targets, no other ions
	const ginjo1: WaterProfile = {
		id: '00000004-0000-0000-0000-000000000001',
		name: 'Ginjo 1',
		isBuiltIn: true,
		ions: [
			{ symbol: 'Ca', targetPpm: 10 },
			{ symbol: 'Mg', targetPpm: 3 }
		]
	};

	const lacticAcid = {
		id: '00000005-0000-0000-0000-000000000001',
		name: 'Lactic 88%',
		isBuiltIn: true,
		strengthPct: 88,
		relativeAcidity: 1.0
	} as const;

	// Built-in mineral salts in solver priority order for sake brewing.
	// Contribution ratios = ionMW / saltMW.
	const availableSalts: MineralSalt[] = [
		{
			id: '00000006-0000-0000-0000-000000000001',
			name: 'MgSO4·7H2O (Epsom Salt)',
			isBuiltIn: true,
			primaryIon: 'Mg',
			contributions: [
				{ ionSymbol: 'Mg', massGPerGSalt: 24.31 / 246.47 },
				{ ionSymbol: 'SO4', massGPerGSalt: 96.06 / 246.47 }
			]
		},
		{
			id: '00000006-0000-0000-0000-000000000002',
			name: 'NaCl (Table Salt)',
			isBuiltIn: true,
			primaryIon: 'Na',
			contributions: [
				{ ionSymbol: 'Na', massGPerGSalt: 22.99 / 58.44 },
				{ ionSymbol: 'Cl', massGPerGSalt: 35.45 / 58.44 }
			]
		},
		{
			id: '00000006-0000-0000-0000-000000000003',
			name: 'KH2PO4 (Monopotassium Phosphate)',
			isBuiltIn: true,
			primaryIon: 'PO4',
			contributions: [
				{ ionSymbol: 'K', massGPerGSalt: 39.10 / 136.09 },
				{ ionSymbol: 'PO4', massGPerGSalt: 94.97 / 136.09 }
			]
		},
		{
			id: '00000006-0000-0000-0000-000000000004',
			name: 'CaSO4 (Gypsum)',
			isBuiltIn: true,
			primaryIon: 'Ca',
			contributions: [
				{ ionSymbol: 'Ca', massGPerGSalt: 40.08 / 136.14 },
				{ ionSymbol: 'SO4', massGPerGSalt: 96.06 / 136.14 }
			]
		},
		{
			id: '00000006-0000-0000-0000-000000000005',
			name: 'CaCl2 (Calcium Chloride)',
			isBuiltIn: true,
			primaryIon: 'Ca',
			contributions: [
				{ ionSymbol: 'Ca', massGPerGSalt: 40.08 / 110.98 },
				{ ionSymbol: 'Cl', massGPerGSalt: 70.90 / 110.98 }
			]
		},
		{
			id: '00000006-0000-0000-0000-000000000006',
			name: 'KCl (Potassium Chloride)',
			isBuiltIn: true,
			primaryIon: 'K',
			contributions: [
				{ ionSymbol: 'K', massGPerGSalt: 39.10 / 74.55 },
				{ ionSymbol: 'Cl', massGPerGSalt: 35.45 / 74.55 }
			]
		},
		{
			id: '00000006-0000-0000-0000-000000000007',
			name: 'K2SO4 (Potassium Sulfate)',
			isBuiltIn: true,
			primaryIon: 'K',
			contributions: [
				{ ionSymbol: 'K', massGPerGSalt: 78.20 / 174.26 },
				{ ionSymbol: 'SO4', massGPerGSalt: 96.06 / 174.26 }
			]
		}
	];

	// ── "Sakura Ginjo" plan from recipe_flow_example ────────────────────────────
	// Target: 6.7 L genshu; Ginjo 1 water profile; Soe amendment

	const kojiLot = { lotId: 'lot-a', variety: 'Gohyakumangoku', polishPct: 65, lotLabel: 'Lot A' };
	const mainLot = { lotId: 'lot-b', variety: 'Gohyakumangoku', polishPct: 60, lotLabel: 'Lot B' };

	const plan: RecipePlan = {
		recipeSpecId: 'sakura-ginjo',
		target: { kind: 'genshu_volume_L', value: 6.7 },
		koji: {
			mode: 'make',
			riceLot: kojiLot,
			kojiStrain: { strainId: 'ak-a1', name: 'Akita Konno A-1' }
		},
		moto: {
			riceLot: mainLot,
			yeast: { yeastId: 'wl707', name: 'WL707', format: 'liquid_pouch' },
			acid: lacticAcid
		},
		moromi: {
			stages: [
				{ stageOrdinal: 1, riceLot: mainLot },
				{ stageOrdinal: 2, riceLot: mainLot },
				{ stageOrdinal: 3, riceLot: mainLot }
			]
		},
		water: ginjo1
	};

	const spec: StoredRecipeTemplate = {
		id: 'sakura-ginjo',
		name: 'Sakura Ginjo',
		kojiPresetRef: kojiPreset.id,
		motoPresetRef: motoPreset.id,
		moromiPresetRef: moromiPreset.id,
		waterProfileRef: ginjo1.id,
		recommendedRiceVariety: 'Yamadanishiki',
		recommendedPolishPct: 60,
		amendments: [
			// HACK: Sakura Petals is semantically an Odori addition, but AmendmentPlacement
			// has no schedule-step target yet. Temporarily pinned to stageOrdinal: 1 (Soe)
			// as the closest material-stage placeholder. Remove/replace once schedule-step
			// targeting exists.
			{ kind: 'Sakura Petals', fracOfTotalRice: 0.0005, placement: { where: 'moromi', stageOrdinal: 1 } }
		]
	};

	const presets: LoadedPresets = {
		kojiPreset,
		motoPreset,
		moromiPreset,
		waterProfile: ginjo1,
		availableSalts,
		spec
	};

	const bill: MaterialsBill = resolvePlan(plan, presets);

	function r(n: number, digits = 3) {
		return n.toFixed(digits);
	}
</script>

<div class="mx-auto max-w-4xl space-y-6 p-4">
	<div>
		<h1 class="text-lg font-semibold">Plan Resolver Debug — Sakura Ginjo</h1>
		<p class="text-sm text-muted-foreground">
			Target: <strong>6.7 L</strong> genshu · Sokujo Sandan · Ginjo 1 water
		</p>
	</div>

	<!-- Koji -->
	<section class="rounded-lg border bg-background">
		<div class="border-b px-4 py-2">
			<h2 class="text-sm font-semibold">Koji</h2>
		</div>
		<div class="p-4 font-mono text-sm">
			{#if bill.koji.mode === 'premade'}
				<p>Buy <strong>{r(bill.koji.requiredKg)} kg</strong> premade koji</p>
			{:else}
				<p>Rice: <strong>{r(bill.koji.riceKg)} kg</strong> × {bill.koji.riceLot.variety} {bill.koji.riceLot.polishPct}% ({bill.koji.riceLot.lotLabel})</p>
				<p>Strain: {bill.koji.kojiStrain.name}</p>
				<p>Tane-koji: {r(bill.koji.taneKojiG, 2)} g</p>
				<p>Carrier ({kojiPreset.carrier}): {r(bill.koji.carrierG, 2)} g</p>
				<p>Est. dry koji: {r(bill.koji.estimatedDryKojiKg)} kg</p>
			{/if}
		</div>
	</section>

	<!-- Moto -->
	<section class="rounded-lg border bg-background">
		<div class="border-b px-4 py-2">
			<h2 class="text-sm font-semibold">Moto</h2>
		</div>
		<div class="p-4 font-mono text-sm">
			<p>Total rice: <strong>{r(bill.moto.totalRiceKg)} kg</strong></p>
			<p>Kake: {r(bill.moto.kakeKg)} kg × {bill.moto.riceLot.variety} {bill.moto.riceLot.polishPct}%</p>
			<p>Koji: {r(bill.moto.kojiKg)} kg</p>
			<p>Water: {r(bill.moto.waterL)} L</p>
			<p>Acid ({bill.moto.yeast.name}): {r(bill.moto.acidDoseMl, 2)} mL @ {lacticAcid.strengthPct}%</p>
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
		<!-- Amendments -->
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

	<!-- Raw JSON -->
	<section class="rounded-lg border bg-background">
		<div class="border-b px-4 py-2">
			<h2 class="text-sm font-semibold">MaterialsBill (raw JSON)</h2>
		</div>
		<div class="p-3">
			<pre class="max-h-[50vh] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-5">{JSON.stringify(bill, null, 2)}</pre>
		</div>
	</section>
</div>
