<script lang="ts">
	import type { RecipeBundle } from '$lib/app/types';
	import type { RecipePlan } from '$lib/engine/models/planTypes';
	import { lacticAcid88 } from '$lib/data/catalog/acids';

	type Props = {
		bundle: RecipeBundle;
		onpreview: (plan: RecipePlan) => void;
	};

	let { bundle, onpreview }: Props = $props();

	// ── Form state ──────────────────────────────────────────────────────────
	let targetKind = $state<'genshu_volume_L' | 'total_rice_kg'>(
		bundle.defaults.targetKind ?? 'genshu_volume_L'
	);
	let targetValue = $state(bundle.defaults.targetValue ?? 6.7);
	let premadeKoji = $state(false);

	// Rice lots
	let kojiRiceVariety = $state(bundle.template.recommendedRiceVariety ?? '');
	let kojiRicePolish = $state(bundle.template.recommendedPolishPct ?? 60);
	let kojiRiceLabel = $state('Lot A');
	let kakeRiceVariety = $state(bundle.template.recommendedRiceVariety ?? '');
	let kakeRicePolish = $state(bundle.template.recommendedPolishPct ?? 60);
	let kakeRiceLabel = $state('Lot B');

	// Koji & yeast
	let kojiStrain = $state('Akita Konno A-1');
	let yeastName = $state('WL707');

	function submit(e: SubmitEvent) {
		e.preventDefault();

		const kojiLot = {
			lotId: 'lot-koji',
			variety: kojiRiceVariety,
			polishPct: kojiRicePolish,
			lotLabel: kojiRiceLabel
		};
		const kakeLot = {
			lotId: 'lot-kake',
			variety: kakeRiceVariety,
			polishPct: kakeRicePolish,
			lotLabel: kakeRiceLabel
		};

		const plan: RecipePlan = {
			recipeSpecId: bundle.template.id,
			target: { kind: targetKind, value: targetValue },
			koji: premadeKoji
				? { mode: 'premade' }
				: {
						mode: 'make',
						riceLot: kojiLot,
						kojiStrain: { strainId: 'user-koji', name: kojiStrain }
					},
			moto: {
				riceLot: kakeLot,
				yeast: { yeastId: 'user-yeast', name: yeastName, format: 'liquid_pouch' },
				acid: lacticAcid88
			},
			moromi: {
				stages: bundle.presets.moromiPreset.stages.map((s) => ({
					stageOrdinal: s.ordinal,
					riceLot: kakeLot
				}))
			},
			water: bundle.presets.waterProfile
		};

		onpreview(plan);
	}
</script>

<form
	onsubmit={submit}
	class="space-y-4 rounded-lg border bg-background p-4"
>
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

	<!-- Koji rice (shown only when making koji) -->
	{#if !premadeKoji}
		<fieldset class="space-y-2">
			<legend class="text-xs font-semibold text-muted-foreground">Koji Rice</legend>
			<div class="flex flex-wrap gap-3">
				<label class="block">
					<span class="sr-only">Koji rice variety</span>
					<input
						type="text"
						bind:value={kojiRiceVariety}
						placeholder="Variety"
						class="w-40 rounded border bg-background px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					/>
				</label>
				<div class="flex items-center gap-1">
					<label class="block">
						<span class="sr-only">Koji rice polish percentage</span>
						<input
							type="number"
							bind:value={kojiRicePolish}
							min="1"
							max="100"
							class="w-16 rounded border bg-background px-2 py-1 text-sm font-mono focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						/>
					</label>
					<span class="text-xs text-muted-foreground" aria-hidden="true">%</span>
				</div>
				<label class="block">
					<span class="sr-only">Koji rice lot label</span>
					<input
						type="text"
						bind:value={kojiRiceLabel}
						placeholder="Lot label"
						class="w-24 rounded border bg-background px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					/>
				</label>
			</div>
		</fieldset>

		<fieldset class="space-y-2">
			<legend class="text-xs font-semibold text-muted-foreground">Koji Strain</legend>
			<input
				type="text"
				bind:value={kojiStrain}
				aria-label="Koji strain name"
				class="w-48 rounded border bg-background px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			/>
		</fieldset>
	{/if}

	<!-- Kake rice -->
	<fieldset class="space-y-2">
		<legend class="text-xs font-semibold text-muted-foreground">Kake Rice</legend>
		<div class="flex flex-wrap gap-3">
			<label class="block">
				<span class="sr-only">Kake rice variety</span>
				<input
					type="text"
					bind:value={kakeRiceVariety}
					placeholder="Variety"
					class="w-40 rounded border bg-background px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				/>
			</label>
			<div class="flex items-center gap-1">
				<label class="block">
					<span class="sr-only">Kake rice polish percentage</span>
					<input
						type="number"
						bind:value={kakeRicePolish}
						min="1"
						max="100"
						class="w-16 rounded border bg-background px-2 py-1 text-sm font-mono focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					/>
				</label>
				<span class="text-xs text-muted-foreground" aria-hidden="true">%</span>
			</div>
			<label class="block">
				<span class="sr-only">Kake rice lot label</span>
				<input
					type="text"
					bind:value={kakeRiceLabel}
					placeholder="Lot label"
					class="w-24 rounded border bg-background px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				/>
			</label>
		</div>
	</fieldset>

	<!-- Yeast -->
	<fieldset class="space-y-2">
		<legend class="text-xs font-semibold text-muted-foreground">Yeast</legend>
		<input
			type="text"
			bind:value={yeastName}
			aria-label="Yeast strain name"
			class="w-48 rounded border bg-background px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		/>
	</fieldset>

	<!-- Acid / Water (display only) -->
	<div class="flex flex-wrap gap-6 text-sm text-muted-foreground">
		<span>Acid: {lacticAcid88.name}</span>
		{#if bundle.presets.waterProfile}
			<span>Water: {bundle.presets.waterProfile.name}</span>
		{:else}
			<span>Water: none</span>
		{/if}
	</div>

	<button
		type="submit"
		class="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
	>
		Preview
	</button>
</form>
