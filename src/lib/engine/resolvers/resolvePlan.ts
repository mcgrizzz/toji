import type { Allocation } from '../core/engineTypes';
import { calcAcidDoseMl } from '../math/acidMath';
import { calcTaneKojiG, calcCarrierG, estimateDryKojiKg } from '../math/kojiMath';
import { estimateTotalRiceFromGenshuVolume } from '../math/sizing';
import { validateRiceFracSum } from '../core/validation';
import {
	calcCaMgRatio,
	calcHardnessAsCaCO3,
	calcSO4ClRatio,
	getIonPpm
} from '../math/waterMath';
import { resolveWaterAdditions } from './resolveWaterAdditions';
import type {
	AllocationSource,
	CompiledPlan,
	KojiMaterials,
	LoadedPresets,
	MaterialsBill,
	MoromiStageMaterials,
	MotoMaterials,
	RecipePlan,
	RiceLotRef,
	WaterBill
} from '../models/planTypes';
import { resolveRecipe } from '../core/resolveRecipe';
import type { MoromiAdditionSpec } from '../models/catalogTypes';

// ── Target resolution ────────────────────────────────────────────────────────

function resolveTarget(plan: RecipePlan): number {
	if (plan.target.kind === 'total_rice_kg') {
		return plan.target.value;
	}
	return estimateTotalRiceFromGenshuVolume(plan.target.value);
}

// ── Compile plan to engine input ─────────────────────────────────────────────

export function compilePlanToEngineInput(
	plan: RecipePlan,
	presets: LoadedPresets,
	totalRiceKg: number
): CompiledPlan {
	const { motoPreset, moromiPreset, spec } = presets;

	// Sort moromi stages by ordinal
	const sortedStages = [...moromiPreset.stages].sort((a, b) => a.ordinal - b.ordinal);

	const allocations: Allocation[] = [];
	const allocationMap: AllocationSource[] = [];

	// Allocation 0: moto
	const motoAlloc: Allocation = {
		riceFrac: motoPreset.riceFrac,
		kojiFrac: motoPreset.kojiFrac,
		waterLPerKg: motoPreset.waterLPerKg
	};

	const motoAmendments = spec.amendments.filter((a) => a.placement.where === 'moto');
	if (motoAmendments.length > 0) {
		motoAlloc.extras = motoAmendments.map((a) => ({
			kind: a.kind,
			fracOfRice: a.fracOfTotalRice
		}));
	}
	allocations.push(motoAlloc);
	allocationMap.push({ source: 'moto' });

	// Allocations 1..N: moromi material-addition stages in ordinal order.
	for (const stage of sortedStages) {
		const stageAmendments = spec.amendments.filter(
			(a) => a.placement.where === 'moromi' && a.placement.stageOrdinal === stage.ordinal
		);

		const stageAlloc: Allocation = {
			riceFrac: stage.riceFrac,
			kojiFrac: stage.kojiFrac,
			waterLPerKg: stage.waterLPerKg
		};

		if (stageAmendments.length > 0) {
			stageAlloc.extras = stageAmendments.map((a) => ({
				kind: a.kind,
				fracOfRice: a.fracOfTotalRice
			}));
		}

		allocations.push(stageAlloc);
		allocationMap.push({ source: 'moromi', stageOrdinal: stage.ordinal, stageName: stage.name });
	}

	if (!validateRiceFracSum(allocations)) {
		const sum = allocations.reduce((acc, a) => acc + a.riceFrac, 0);
		throw new Error(
			`Rice fractions sum to ${sum.toFixed(4)}, expected 1.0 ± 0.001. ` +
				`Check moto riceFrac + all moromi stage riceFracs.`
		);
	}

	return { engineInput: { totalRiceKg, allocations }, allocationMap };
}

// ── Resolve lot for a moromi stage ──────────────────────────────────────────

function moromiLot(plan: RecipePlan, stage: MoromiAdditionSpec): RiceLotRef {
	const found = plan.moromi.stages.find((s) => s.stageOrdinal === stage.ordinal);
	// Fall back to moto lot if not specified
	return found?.riceLot ?? plan.moto.riceLot;
}

// ── Main resolver ────────────────────────────────────────────────────────────

export function resolvePlan(plan: RecipePlan, presets: LoadedPresets): MaterialsBill {
	const totalRiceKg = resolveTarget(plan);
	const compiled = compilePlanToEngineInput(plan, presets, totalRiceKg);
	const engineOutput = resolveRecipe(compiled.engineInput);

	const { motoPreset, moromiPreset, kojiPreset } = presets;
	const sortedStages = [...moromiPreset.stages].sort((a, b) => a.ordinal - b.ordinal);

	// ── Koji materials ────────────────────────────────────────────────────────
	const totalKojiKg = engineOutput.totals.totalKojiKg;

	let koji: KojiMaterials;
	if (plan.koji.mode === 'premade') {
		koji = { mode: 'premade', requiredKg: totalKojiKg };
	} else {
		const taneKojiG = calcTaneKojiG(totalKojiKg, kojiPreset.kojiGPerKgRice);
		const carrierG = calcCarrierG(taneKojiG, kojiPreset.carrierRatioGPerG);
		koji = {
			mode: 'make',
			riceKg: totalKojiKg,
			riceLot: plan.koji.riceLot,
			kojiStrain: plan.koji.kojiStrain,
			taneKojiG,
			carrierG,
			estimatedDryKojiKg: estimateDryKojiKg(totalKojiKg)
		};
	}

	// ── Moto materials ────────────────────────────────────────────────────────
	const motoIdx = compiled.allocationMap.findIndex((p) => p.source === 'moto');
	const motoResult = engineOutput.allocations[motoIdx];
	const acidDoseMl = calcAcidDoseMl(
		motoResult.waterL,
		motoPreset.acidRefMlPerL,
		motoPreset.acidRefStrengthPct,
		plan.moto.acid.strengthPct,
		plan.moto.acid.relativeAcidity
	);

	const moto: MotoMaterials = {
		totalRiceKg: motoResult.riceKg,
		kakeKg: motoResult.kakeKg,
		kojiKg: motoResult.kojiKg,
		waterL: motoResult.waterL,
		acidDoseMl,
		yeast: plan.moto.yeast,
		riceLot: plan.moto.riceLot
	};

	// ── Moromi materials ──────────────────────────────────────────────────────
	const moromi: MoromiStageMaterials[] = sortedStages.map((stage) => {
		const stageIdx = compiled.allocationMap.findIndex(
			(p) => p.source === 'moromi' && p.stageOrdinal === stage.ordinal
		);
		const result = engineOutput.allocations[stageIdx];
		return {
			stageName: stage.name,
			ordinal: stage.ordinal,
			kakeKg: result.kakeKg,
			kojiKg: result.kojiKg,
			waterL: result.waterL,
			riceLot: moromiLot(plan, stage)
		};
	});

	// ── Rice by lot (shopping list) ───────────────────────────────────────────
	const lotMap = new Map<string, { lot: RiceLotRef; totalKg: number }>();

	function addToLot(lot: RiceLotRef, kg: number) {
		const existing = lotMap.get(lot.lotId);
		if (existing) {
			existing.totalKg += kg;
		} else {
			lotMap.set(lot.lotId, { lot, totalKg: kg });
		}
	}

	// Koji rice (only when making koji — premade koji is purchased, not a rice lot)
	if (koji.mode === 'make') {
		addToLot(koji.riceLot, koji.riceKg);
	}
	// Moto kake rice
	addToLot(moto.riceLot, moto.kakeKg);
	// Moromi kake rice per stage
	for (const stage of moromi) {
		addToLot(stage.riceLot, stage.kakeKg);
	}

	const riceByLot = [...lotMap.values()];

	// ── Water bill ────────────────────────────────────────────────────────────
	let water: WaterBill | null = null;
	if (plan.water) {
		const profile = plan.water;
		const motoWaterL = moto.waterL;
		const moromiWaterL = moromi.reduce((sum, s) => sum + s.waterL, 0);

		water = {
			profileName: profile.name,
			motoAdditions: resolveWaterAdditions(motoWaterL, profile.ions, presets.availableSalts),
			moromiAdditions: resolveWaterAdditions(moromiWaterL, profile.ions, presets.availableSalts),
			hardnessAsCaCO3: calcHardnessAsCaCO3(getIonPpm(profile.ions, 'Ca'), getIonPpm(profile.ions, 'Mg')),
			so4ClRatio: calcSO4ClRatio(getIonPpm(profile.ions, 'SO4'), getIonPpm(profile.ions, 'Cl')),
			caMgRatio: calcCaMgRatio(getIonPpm(profile.ions, 'Ca'), getIonPpm(profile.ions, 'Mg'))
		};
	}

	return {
		koji,
		moto,
		moromi,
		riceByLot,
		water,
		engineInput: compiled.engineInput,
		engineOutput
	};
}
