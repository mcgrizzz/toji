/**
 * Volume of acid to add to moto water, normalised to a reference acid.
 * Scales refMlPerL by the strength ratio and relative acidity of the chosen acid.
 */
export function calcAcidDoseMl(
	motoWaterL: number,
	refMlPerL: number,
	refStrengthPct: number,
	targetStrengthPct: number,
	targetRelativeAcidity: number
): number {
	return motoWaterL * refMlPerL * (refStrengthPct / targetStrengthPct) / targetRelativeAcidity;
}
