// ── Amendment / StoredRecipeTemplate ─────────────────────────────────────────

export type AmendmentPlacement =
	| { where: 'moto' }
	| { where: 'moromi'; stageOrdinal: number };

export type AmendmentSpec = {
	kind: string;
	/** Fraction of total batch rice mass */
	fracOfTotalRice: number;
	placement: AmendmentPlacement;
};

export type StoredRecipeTemplate = {
	id: string;
	name: string;
	kojiPresetRef: string;
	motoPresetRef: string;
	moromiPresetRef: string;
	waterProfileRef: string;
	recommendedRiceVariety?: string;
	recommendedPolishPct?: number;
	amendments: AmendmentSpec[];
};
