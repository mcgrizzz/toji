import type { YeastSelection } from '../models/yeastTypes';
import { calcAgeDays, calcViabilityFrac, calcViableCellsPerPackageM } from '../math/yeastMath';

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

/** Resolve full pitching requirements */
export function resolvePitching(input: PitchingInput): PitchingResult {
	const { totalMoromiVolumeL, targetPitchRateMPerMl, yeast, pitchDate } = input;
	const { product, packageDate, packageCount } = yeast;

	// Total mL of moromi
	const totalMl = totalMoromiVolumeL * 1000;

	// Million cells needed
	const requiredCellsM = targetPitchRateMPerMl * totalMl;

	// Viable cells per package at pitch date
	const viableCellsPerPackageM = calcViableCellsPerPackageM(
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
	const ageDays = calcAgeDays(packageDate, pitchDate);
	const viabilityPct = calcViabilityFrac(ageDays, product.viability) * 100;

	return {
		requiredCellsM,
		viableCellsPerPackageM,
		availableCellsM,
		packsNeeded,
		sufficient: availableCellsM >= requiredCellsM,
		viabilityPct
	};
}
