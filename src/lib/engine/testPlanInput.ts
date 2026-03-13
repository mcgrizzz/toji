import type { RecipePlan, LoadedPresets } from './planTypes';
import type {
	KojiPreset,
	MotoPreset,
	MoromiPreset,
	WaterProfile,
	MineralSalt,
	AcidType
} from './catalogTypes';
import type { StoredRecipeTemplate } from './templateTypes';

// ── Built-in preset data (mirrors seed.ts) ─────────────────────────────────

export const kojiPreset: KojiPreset = {
	id: '00000001-0000-0000-0000-000000000001',
	name: 'Ueda Standard',
	isBuiltIn: true,
	kojiGPerKgRice: 0.08,
	carrier: 'Toasted Rice Flour',
	carrierRatioGPerG: 5
};

export const motoPreset: MotoPreset = {
	id: '00000002-0000-0000-0000-000000000001',
	name: 'Sokujo Standard',
	isBuiltIn: true,
	riceFrac: 0.07,
	kojiFrac: 0.3,
	waterLPerKg: 1.07,
	yeastPitchRateMPerMl: 3,
	acidRefMlPerL: 0.03,
	acidRefStrengthPct: 88
};

export const moromiPreset: MoromiPreset = {
	id: '00000003-0000-0000-0000-000000000001',
	name: 'Sandan Standard',
	isBuiltIn: true,
	stages: [
		{ name: 'Soe', ordinal: 1, riceFrac: 0.15, kojiFrac: 0.28, waterLPerKg: 0.92 },
		{ name: 'Naka', ordinal: 2, riceFrac: 0.3, kojiFrac: 0.21, waterLPerKg: 1.2 },
		{ name: 'Tome', ordinal: 3, riceFrac: 0.48, kojiFrac: 0.21, waterLPerKg: 1.2 }
	]
};

export const ginjo1: WaterProfile = {
	id: '00000004-0000-0000-0000-000000000001',
	name: 'Ginjo 1',
	isBuiltIn: true,
	ions: [
		{ symbol: 'Ca', targetPpm: 10 },
		{ symbol: 'Mg', targetPpm: 3 }
	]
};

export const lacticAcid: AcidType = {
	id: '00000005-0000-0000-0000-000000000001',
	name: 'Lactic 88%',
	isBuiltIn: true,
	strengthPct: 88,
	relativeAcidity: 1.0
};

export const availableSalts: MineralSalt[] = [
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

export const spec: StoredRecipeTemplate = {
	id: 'sakura-ginjo',
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

/** Same as sakuraGinjoPlan but with premade koji */
export const premadeKojiPlan: RecipePlan = {
	recipeSpecId: 'sakura-ginjo',
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
	water: null
};

