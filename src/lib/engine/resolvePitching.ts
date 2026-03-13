import type { YeastSelection, YeastViabilityModel } from './yeastTypes';

export type PitchingInput = {
	/** Total moromi volume in litres (moto water + moromi water) */
	totalMoromiVolumeL: number;
	/** From MotoPreset */
	targetPitchRateMPerMl: number;
	/** Selected yeast with package info */
	yeast: YeastSelection;
	/** Date the moto will be pitched (ISO 8601) */
	pitchDate: string;
};

export type PitchingResult = {
	/** Million cells needed total */
	requiredCellsM: number;
	/** Estimated viable cells per package at pitch date */
	viableCellsPerPackageM: number;
	/** Total available cells from all packages */
	availableCellsM: number;
	/** Packages needed (ceiling of required / viable-per-package) */
	packsNeeded: number;
	/** Whether available >= required */
	sufficient: boolean;
	/** Estimated viability percentage at pitch date */
	viabilityPct: number;
};

export function calcAgeDays(packageDate: string, pitchDate: string): number {
	const msPerDay = 86_400_000;
	return Math.max(
		0,
		(new Date(pitchDate).getTime() - new Date(packageDate).getTime()) / msPerDay
	);
}

export function calcViabilityFrac(ageDays: number, model: YeastViabilityModel): number {
	if (ageDays >= model.maxAgeDays) return 0;
	switch (model.kind) {
		case 'exponential':
			return Math.max(0, model.initialViabilityFrac * Math.exp(model.decayRatePerDay * ageDays));
		case 'linear':
			return Math.max(0, model.initialViabilityFrac - model.dailyLossFrac * ageDays);
	}
}

/** Calculate viable cells (in millions) for a single package given age and viability model */
export function calcViableCells(
	cellsPerPackageBn: number,
	packageDate: string,
	pitchDate: string,
	model: YeastViabilityModel
): number {
	const ageDays = calcAgeDays(packageDate, pitchDate);
	const viabilityFrac = calcViabilityFrac(ageDays, model);
	// Convert billions → millions (* 1000)
	return cellsPerPackageBn * 1000 * viabilityFrac;
}

/** Resolve full pitching requirements */
export function resolvePitching(input: PitchingInput): PitchingResult {
	const { totalMoromiVolumeL, targetPitchRateMPerMl, yeast, pitchDate } = input;
	const { product, packageDate, packageCount } = yeast;

	// Total mL of moromi
	const totalMl = totalMoromiVolumeL * 1000;

	// Million cells needed
	const requiredCellsM = targetPitchRateMPerMl * totalMl;

	// Viable cells per package at pitch date
	const viableCellsPerPackageM = calcViableCells(
		product.cellsPerPackageBn,
		packageDate,
		pitchDate,
		product.viability
	);

	const availableCellsM = viableCellsPerPackageM * packageCount;

	// Packs needed to meet requirement
	const packsNeeded =
		viableCellsPerPackageM > 0 ? Math.ceil(requiredCellsM / viableCellsPerPackageM) : Infinity;

	// Viability percentage
	const totalFreshCellsM = product.cellsPerPackageBn * 1000;
	const viabilityPct = totalFreshCellsM > 0 ? (viableCellsPerPackageM / totalFreshCellsM) * 100 : 0;

	return {
		requiredCellsM,
		viableCellsPerPackageM,
		availableCellsM,
		packsNeeded,
		sufficient: availableCellsM >= requiredCellsM,
		viabilityPct
	};
}
