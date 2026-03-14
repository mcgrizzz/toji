import type { AcidType, KojiPreset, MineralSalt, MoromiPreset, MotoPreset, WaterProfile } from './catalogTypes';
import type { StoredRecipeTemplate } from './templateTypes';
import type { EngineInput, EngineOutput } from '../core/engineTypes';

// ── Inventory refs ───────────────────────────────────────────────────────────

export type RiceLotRef = {
	lotId: string;
	variety: string;
	polishPct: number;
	lotLabel?: string;
};

export type KojiStrainRef = {
	strainId: string;
	name: string;
};

export type YeastRef = {
	yeastId: string;
	name: string;
	format: 'liquid_pouch' | 'dry' | 'slant';
};

// ── Per-block selections ─────────────────────────────────────────────────────

export type KojiPlanSelection =
	| { mode: 'premade' }
	| { mode: 'make'; riceLot: RiceLotRef; kojiStrain: KojiStrainRef };

export type MotoPlanSelection = {
	riceLot: RiceLotRef;
	yeast: YeastRef;
	acid: AcidType;
};

export type MoromiPlanSelection = {
	stages: { stageOrdinal: number; riceLot: RiceLotRef }[];
};

// ── Target ───────────────────────────────────────────────────────────────────

export type PlanTarget =
	| { kind: 'genshu_volume_L'; value: number }
	| { kind: 'total_rice_kg'; value: number };

// ── Plan ─────────────────────────────────────────────────────────────────────

export type RecipePlan = {
	recipeSpecId: string;
	target: PlanTarget;
	koji: KojiPlanSelection;
	moto: MotoPlanSelection;
	moromi: MoromiPlanSelection;
	/** null = no mineral additions (RO base, no profile) */
	water: WaterProfile | null;
};

// ── Resolver inputs ──────────────────────────────────────────────────────────

export type LoadedPresets = {
	kojiPreset: KojiPreset;
	motoPreset: MotoPreset;
	moromiPreset: MoromiPreset;
	waterProfile: WaterProfile | null;
	availableSalts: MineralSalt[];
	spec: StoredRecipeTemplate;
};

// ── Compilation ──────────────────────────────────────────────────────────────

export type AllocationSource =
	| { source: 'moto' }
	| { source: 'moromi'; stageOrdinal: number; stageName: string };

export type CompiledPlan = {
	engineInput: EngineInput;
	/** allocationMap[i] corresponds to engineInput.allocations[i] and engineOutput.allocations[i]. */
	allocationMap: AllocationSource[];
};

// ── Output ───────────────────────────────────────────────────────────────────

export type WaterAdditionLine = {
	salt: MineralSalt;
	massG: number;
};

export type WaterBill = {
	profileName: string;
	/** Mineral additions for moto water volume */
	motoAdditions: WaterAdditionLine[];
	/** Mineral additions scaled to total moromi water volume */
	moromiAdditions: WaterAdditionLine[];
	/** Computed from profile — not stored in DB */
	hardnessAsCaCO3: number;
	/** null when Cl = 0 */
	so4ClRatio: number | null;
	/** null when Mg = 0 */
	caMgRatio: number | null;
};

export type KojiMaterials =
	| { mode: 'premade'; requiredKg: number }
	| {
			mode: 'make';
			riceKg: number;
			riceLot: RiceLotRef;
			kojiStrain: KojiStrainRef;
			taneKojiG: number;
			carrierG: number;
			estimatedDryKojiKg: number;
	  };

export type MotoMaterials = {
	totalRiceKg: number;
	kakeKg: number;
	kojiKg: number;
	waterL: number;
	acidDoseMl: number;
	acid: AcidType;
	yeast: YeastRef;
	riceLot: RiceLotRef;
};

export type MoromiStageMaterials = {
	stageName: string;
	ordinal: number;
	kakeKg: number;
	kojiKg: number;
	waterL: number;
	riceLot: RiceLotRef;
};

export type MaterialsBill = {
	koji: KojiMaterials;
	moto: MotoMaterials;
	moromi: MoromiStageMaterials[];
	/** Rice totals grouped by lot (for shopping list) */
	riceByLot: { lot: RiceLotRef; totalKg: number }[];
	water: WaterBill | null;
	engineInput: EngineInput;
	engineOutput: EngineOutput;
};
