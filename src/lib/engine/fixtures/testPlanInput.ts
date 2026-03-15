import type { RecipePlan, LoadedPresets } from '../models/planTypes';
import type { StoredRecipeTemplate } from '../models/templateTypes';
import { uedaStandard as kojiPreset } from '$lib/data/catalog/kojiPresets';
import { sokujoStandard as motoPreset } from '$lib/data/catalog/motoPresets';
import { sandanStandard as moromiPreset } from '$lib/data/catalog/moromiPresets';
import { ginjo1 } from '$lib/data/catalog/waterProfiles';
import { lacticAcid88 as lacticAcid } from '$lib/data/catalog/acids';
import { availableSalts } from '$lib/data/catalog/salts';

export { kojiPreset, motoPreset, moromiPreset, ginjo1, lacticAcid, availableSalts };

// ── Spec (built from catalog imports) ────────────────────────────────────────

export const spec: StoredRecipeTemplate = {
	id: 'snap-recipe-sakura-ginjo-001',
	name: 'Sakura Ginjo',
	kojiPresetRef: kojiPreset.id,
	motoPresetRef: motoPreset.id,
	moromiPresetRef: moromiPreset.id,
	waterProfileRef: ginjo1.id,
	recommendedRiceVariety: 'Yamadanishiki',
	recommendedPolishPct: 60,
	amendments: [
		{ kind: 'Sakura Petals', fracOfTotalRice: 0.0005, placement: { where: 'moromi', stageOrdinal: 1 } }
	]
};

// ── Assembled presets ───────────────────────────────────────────────────────

export const sakuraGinjoPresets: LoadedPresets = {
	kojiPreset,
	motoPreset,
	moromiPreset,
	waterProfile: ginjo1,
	availableSalts,
	spec
};

// ── Rice lot refs ───────────────────────────────────────────────────────────

const kojiLot = { lotId: 'lot-a', variety: 'Gohyakumangoku', polishPct: 65, lotLabel: 'Lot A' };
const mainLot = { lotId: 'lot-b', variety: 'Gohyakumangoku', polishPct: 60, lotLabel: 'Lot B' };

// ── Plans ───────────────────────────────────────────────────────────────────

/** 6.7L genshu target, make koji, lots A+B */
export const sakuraGinjoPlan: RecipePlan = {
	recipeSnapshotId: 'snap-recipe-sakura-ginjo-001',
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

/** Same as sakuraGinjoPlan but with premade koji */
export const premadeKojiPlan: RecipePlan = {
	recipeSnapshotId: 'snap-recipe-sakura-ginjo-001',
	target: { kind: 'genshu_volume_L', value: 6.7 },
	koji: { mode: 'premade' },
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

/** Same as sakuraGinjoPlan but with no water profile */
export const noWaterPlan: RecipePlan = {
	recipeSnapshotId: 'snap-recipe-sakura-ginjo-001',
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
	water: null
};
