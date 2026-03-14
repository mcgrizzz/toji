<script lang="ts">
	import type { MaterialsBill } from '$lib/engine/models/planTypes';
	import type { KojiPreset } from '$lib/engine/models/catalogTypes';
	import { lacticAcid88 } from '$lib/data/catalog/acids';

	type Props = {
		bill: MaterialsBill;
		kojiPreset: KojiPreset;
	};

	let { bill, kojiPreset }: Props = $props();

	function r(n: number, digits = 3) {
		return n.toFixed(digits);
	}
</script>

<!-- Koji -->
<section class="rounded-lg border bg-background" aria-labelledby="heading-koji">
	<div class="border-b px-4 py-2">
		<h2 id="heading-koji" class="text-sm font-semibold">Koji</h2>
	</div>
	<div class="p-4 font-mono text-sm">
		{#if bill.koji.mode === 'premade'}
			<p>Buy <strong>{r(bill.koji.requiredKg)} kg</strong> premade koji</p>
		{:else}
			<p>
				Rice: <strong>{r(bill.koji.riceKg)} kg</strong> &times;
				{bill.koji.riceLot.variety}
				{bill.koji.riceLot.polishPct}%
				{#if bill.koji.riceLot.lotLabel}({bill.koji.riceLot.lotLabel}){/if}
			</p>
			<p>Strain: {bill.koji.kojiStrain.name}</p>
			<p>Tane-koji: {r(bill.koji.taneKojiG, 2)} g</p>
			<p>
				Carrier ({kojiPreset.carrier}): {r(bill.koji.carrierG, 2)} g
			</p>
			<p>Est. dry koji: {r(bill.koji.estimatedDryKojiKg)} kg</p>
		{/if}
	</div>
</section>

<!-- Moto -->
<section class="rounded-lg border bg-background" aria-labelledby="heading-moto">
	<div class="border-b px-4 py-2">
		<h2 id="heading-moto" class="text-sm font-semibold">Moto</h2>
	</div>
	<div class="p-4 font-mono text-sm">
		<p>Total rice: <strong>{r(bill.moto.totalRiceKg)} kg</strong></p>
		<p>
			Kake: {r(bill.moto.kakeKg)} kg &times; {bill.moto.riceLot.variety}
			{bill.moto.riceLot.polishPct}%
		</p>
		<p>Koji: {r(bill.moto.kojiKg)} kg</p>
		<p>Water: {r(bill.moto.waterL)} L</p>
		<p>Acid: {r(bill.moto.acidDoseMl, 2)} mL ({lacticAcid88.name})</p>
		<p>Yeast: {bill.moto.yeast.name} ({bill.moto.yeast.format})</p>
	</div>
</section>

<!-- Moromi -->
<section class="rounded-lg border bg-background" aria-labelledby="heading-moromi">
	<div class="border-b px-4 py-2">
		<h2 id="heading-moromi" class="text-sm font-semibold">Moromi</h2>
	</div>
	<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<caption class="sr-only">Moromi stage additions</caption>
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
						<td class="px-4 py-2 text-xs">
							{stage.riceLot.variety} {stage.riceLot.polishPct}%
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<!-- Rice Shopping List -->
<section class="rounded-lg border bg-background" aria-labelledby="heading-rice">
	<div class="border-b px-4 py-2">
		<h2 id="heading-rice" class="text-sm font-semibold">Rice Shopping List</h2>
	</div>
	<div class="space-y-1 p-4 font-mono text-sm">
		{#each bill.riceByLot as entry}
			<p>
				<strong>{r(entry.totalKg)} kg</strong> &times; {entry.lot.variety}
				{entry.lot.polishPct}%
				{#if entry.lot.lotLabel}({entry.lot.lotLabel}){/if}
			</p>
		{/each}
	</div>
</section>

<!-- Water Additions -->
{#if bill.water}
	<section class="rounded-lg border bg-background" aria-labelledby="heading-water">
		<div class="border-b px-4 py-2">
			<h2 id="heading-water" class="text-sm font-semibold">Water &mdash; {bill.water.profileName}</h2>
		</div>
		<div class="space-y-1 p-4 font-mono text-sm">
			<p>Hardness: {r(bill.water.hardnessAsCaCO3, 1)} ppm as CaCO3</p>
			<p>
				SO4:Cl ratio: {bill.water.so4ClRatio != null
					? r(bill.water.so4ClRatio, 2)
					: '—'}
			</p>
			<p>
				Ca:Mg ratio: {bill.water.caMgRatio != null
					? r(bill.water.caMgRatio, 2)
					: '—'}
			</p>
		</div>
		{#if bill.water.motoAdditions.length > 0}
			<div class="border-t px-4 py-3">
				<p class="mb-1 text-xs font-semibold text-muted-foreground">Moto additions</p>
				{#each bill.water.motoAdditions as line}
					<p class="font-mono text-sm">{line.salt.name}: {r(line.massG, 3)} g</p>
				{/each}
			</div>
		{/if}
		{#if bill.water.moromiAdditions.length > 0}
			<div class="border-t px-4 py-3">
				<p class="mb-1 text-xs font-semibold text-muted-foreground">
					Moromi additions
				</p>
				{#each bill.water.moromiAdditions as line}
					<p class="font-mono text-sm">{line.salt.name}: {r(line.massG, 3)} g</p>
				{/each}
			</div>
		{/if}
	</section>
{/if}

<!-- Engine Totals -->
<section class="rounded-lg border bg-background" aria-labelledby="heading-totals">
	<div class="border-b px-4 py-2">
		<h2 id="heading-totals" class="text-sm font-semibold">Engine Totals</h2>
	</div>
	<div class="space-y-1 p-4 font-mono text-sm">
		<p>Total rice: {r(bill.engineOutput.totals.totalRiceKg)} kg</p>
		<p>
			Total koji: {r(bill.engineOutput.totals.totalKojiKg)} kg ({r(
				bill.engineOutput.totals.kojiFrac * 100,
				1
			)}%)
		</p>
		<p>Total kake: {r(bill.engineOutput.totals.totalKakeKg)} kg</p>
		<p>Total water: {r(bill.engineOutput.totals.totalWaterL)} L</p>
		<p>Overall water rate: {r(bill.engineOutput.totals.waterLPerKg)} L/kg</p>
	</div>
</section>
