// ── Preset types (mirror DB rows; loaded from DB into memory) ────────────────

export type KojiPreset = {
	id: string;
	name: string;
	isBuiltIn: boolean;
	/** Grams of tane-koji spores per kg of koji rice */
	kojiGPerKgRice: number;
	/** Carrier material (e.g. "Toasted Rice Flour") */
	carrier: string;
	/** Carrier mass : tane-koji mass ratio */
	carrierRatioGPerG: number;
};

export type MotoPreset = {
	id: string;
	name: string;
	isBuiltIn: boolean;
	/** Fraction of total batch rice allocated to moto */
	riceFrac: number;
	/** Fraction of moto rice that becomes koji */
	kojiFrac: number;
	/** Litres of water per kg of moto rice */
	waterLPerKg: number;
	/** Yeast pitch rate in million cells per mL of total moromi volume */
	yeastPitchRateMPerMl: number;
	/** Reference acid volume in mL per L of moto water */
	acidRefMlPerL: number;
	/** Strength of the reference acid solution (%) */
	acidRefStrengthPct: number;
};

export type MoromiAdditionSpec = {
	name: string;
	/** Ordinal position: 1 = soe, 2 = naka, 3 = tome */
	ordinal: number;
	/** Fraction of total batch rice in this stage */
	riceFrac: number;
	/** Fraction of this stage's rice that becomes koji */
	kojiFrac: number;
	/** Litres of water per kg of this stage's rice */
	waterLPerKg: number;
};

export type MoromiPreset = {
	id: string;
	name: string;
	isBuiltIn: boolean;
	stages: MoromiAdditionSpec[];
};

// ── Water chemistry types ─────────────────────────────────────────────────────

/** One ion target expressed as mg/L (ppm) */
export type IonTarget = {
	symbol: string; // e.g. 'Ca', 'Mg', 'SO4', 'Cl', 'Na', 'K', 'PO4', 'Fe'
	targetPpm: number;
};

/** How much of a specific ion (mg) is contributed per gram of a salt */
export type IonContribution = {
	ionSymbol: string;
	massGPerGSalt: number; // = ionMW / saltMW (or formula-unit fraction)
};

/** A mineral salt that can be added to water, with all its ionic contributions */
export type MineralSalt = {
	id: string;
	name: string;
	isBuiltIn: boolean;
	/** The ion this salt is primarily used to supply (used by the greedy solver) */
	primaryIon: string;
	contributions: IonContribution[];
};

/**
 * Target water chemistry expressed as ion concentrations (mg/L = ppm).
 * Derived values (hardness, SO4:Cl ratio, Ca:Mg ratio) are computed on read
 * via calcHardnessAsCaCO3 / calcSO4ClRatio / calcCaMgRatio — never stored.
 */
export type WaterProfile = {
	id: string;
	name: string;
	isBuiltIn: boolean;
	ions: IonTarget[];
};

export type AcidType = {
	id: string;
	name: string;
	isBuiltIn: boolean;
	/** Actual acid concentration of the solution (%) */
	strengthPct: number;
	/** Relative acidity compared to the reference acid (lactic 88% = 1.0) */
	relativeAcidity: number;
};
