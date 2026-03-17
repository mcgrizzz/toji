<script lang="ts">
	import type { RecipeBundle } from '$lib/app/types';
	import type { RecipePlanDraft } from '$lib/engine/models/planTypes';
	import type { Inventory } from '$lib/services/inventoryService';

	type Props = {
		bundle: RecipeBundle;
		inventory: Inventory;
		onpreview: (plan: RecipePlanDraft) => void;
	};

	let { bundle, inventory, onpreview }: Props = $props();

	// ── Form state ──────────────────────────────────────────────────────────
	let targetKind = $state<'genshu_volume_L' | 'total_rice_kg'>(
		bundle.defaults.targetKind ?? 'genshu_volume_L'
	);
	let targetValue = $state(bundle.defaults.targetValue ?? 6.7);
	let premadeKoji = $state(false);

	// Inventory selections (ID-based, using ref shapes)
	let selectedKojiRiceLotId = $state(inventory.riceLots[0]?.lotId ?? '');
	let selectedMainRiceLotId = $state(inventory.riceLots[0]?.lotId ?? '');
	let selectedKojiStrainId = $state(inventory.kojiStrains[0]?.strainId ?? '');
	let selectedYeastId = $state(inventory.yeasts[0]?.yeastId ?? '');

	// Derived lookups
	let selectedKojiRiceLot = $derived(
		inventory.riceLots.find((l) => l.lotId === selectedKojiRiceLotId)
	);
	let selectedMainRiceLot = $derived(
		inventory.riceLots.find((l) => l.lotId === selectedMainRiceLotId)
	);
	let selectedKojiStrain = $derived(
		inventory.kojiStrains.find((s) => s.strainId === selectedKojiStrainId)
	);
	let selectedYeast = $derived(inventory.yeasts.find((y) => y.yeastId === selectedYeastId));

	let canSubmit = $derived(
		selectedMainRiceLot != null &&
			selectedYeast != null &&
			(premadeKoji || (selectedKojiRiceLot != null && selectedKojiStrain != null))
	);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!canSubmit) return;

		const plan: RecipePlanDraft = {
			recipeId: bundle.id,
			target: { kind: targetKind, value: targetValue },
			koji: premadeKoji
				? { mode: 'premade' }
				: {
						mode: 'make',
						riceLot: selectedKojiRiceLot!,
						kojiStrain: selectedKojiStrain!
					},
			moto: {
				riceLot: selectedMainRiceLot!,
				yeast: selectedYeast!,
				acid: bundle.defaultAcid
			},
			moromi: {
				stages: bundle.presets.moromiPreset.stages.map((s) => ({
					stageOrdinal: s.ordinal,
					riceLot: selectedMainRiceLot!
				}))
			},
			water: bundle.presets.waterProfile
		};

		onpreview(plan);
	}

	const selectClass =
		'w-full rounded border bg-background px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';
</script>

<form onsubmit={submit} class="space-y-4 rounded-lg border bg-background p-4">
	<h2 class="text-sm font-semibold">Plan Settings</h2>

	<!-- Target -->
	<fieldset class="space-y-2">
		<legend class="text-xs font-semibold text-muted-foreground">Target</legend>
		<div class="flex items-center gap-4">
			<label class="flex items-center gap-1.5 text-sm">
				<input
					type="radio"
					bind:group={targetKind}
					value="genshu_volume_L"
					class="accent-primary"
				/>
				Genshu volume (L)
			</label>
			<label class="flex items-center gap-1.5 text-sm">
				<input
					type="radio"
					bind:group={targetKind}
					value="total_rice_kg"
					class="accent-primary"
				/>
				Total rice (kg)
			</label>
		</div>
		<label class="block">
			<span class="sr-only">Target amount</span>
			<input
				type="number"
				bind:value={targetValue}
				step="0.1"
				min="0.1"
				class="w-32 rounded border bg-background px-2 py-1 text-sm font-mono focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			/>
		</label>
	</fieldset>

	<!-- Koji mode -->
	<label class="flex items-center gap-2 text-sm">
		<input type="checkbox" bind:checked={premadeKoji} class="accent-primary" />
		Use premade koji
	</label>

	<!-- Koji rice & strain (shown only when making koji) -->
	{#if !premadeKoji}
		<fieldset class="space-y-2">
			<legend class="text-xs font-semibold text-muted-foreground">Koji Rice</legend>
			<label class="block">
				<span class="sr-only">Koji rice lot</span>
				<select bind:value={selectedKojiRiceLotId} class={selectClass}>
					{#each inventory.riceLots as lot (lot.lotId)}
						<option value={lot.lotId}>
							{lot.variety}
							{lot.polishPct}%{lot.lotLabel ? ` (${lot.lotLabel})` : ''}
						</option>
					{/each}
				</select>
			</label>
		</fieldset>

		<fieldset class="space-y-2">
			<legend class="text-xs font-semibold text-muted-foreground">Koji Strain</legend>
			<label class="block">
				<span class="sr-only">Koji strain</span>
				<select bind:value={selectedKojiStrainId} class={selectClass}>
					{#each inventory.kojiStrains as strain (strain.strainId)}
						<option value={strain.strainId}>{strain.name}</option>
					{/each}
				</select>
			</label>
		</fieldset>
	{/if}

	<!-- Main rice lot (kake + moromi) -->
	<fieldset class="space-y-2">
		<legend class="text-xs font-semibold text-muted-foreground">Kake Rice</legend>
		<label class="block">
			<span class="sr-only">Main rice lot</span>
			<select bind:value={selectedMainRiceLotId} class={selectClass}>
				{#each inventory.riceLots as lot (lot.lotId)}
					<option value={lot.lotId}>
						{lot.variety}
						{lot.polishPct}%{lot.lotLabel ? ` (${lot.lotLabel})` : ''}
					</option>
				{/each}
			</select>
		</label>
	</fieldset>

	<!-- Yeast -->
	<fieldset class="space-y-2">
		<legend class="text-xs font-semibold text-muted-foreground">Yeast</legend>
		<label class="block">
			<span class="sr-only">Yeast</span>
			<select bind:value={selectedYeastId} class={selectClass}>
				{#each inventory.yeasts as yeast (yeast.yeastId)}
					<option value={yeast.yeastId}>{yeast.name} ({yeast.format})</option>
				{/each}
			</select>
		</label>
	</fieldset>

	<!-- Acid / Water (display only) -->
	<div class="flex flex-wrap gap-6 text-sm text-muted-foreground">
		<span>Acid: {bundle.defaultAcid.name}</span>
		{#if bundle.presets.waterProfile}
			<span>Water: {bundle.presets.waterProfile.name}</span>
		{:else}
			<span>Water: none</span>
		{/if}
	</div>

	<button
		type="submit"
		disabled={!canSubmit}
		class="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none"
	>
		Preview
	</button>
</form>
