import type { IonTarget } from '../models/catalogTypes';

/** Total hardness expressed as CaCO3 equivalents (ppm) */
export function calcHardnessAsCaCO3(caPpm: number, mgPpm: number): number {
	return caPpm * 2.497 + mgPpm * 4.116;
}

/** SO4:Cl ratio — dryness/bitterness lever. Returns null when Cl = 0. */
export function calcSO4ClRatio(so4Ppm: number, clPpm: number): number | null {
	if (clPpm === 0) return null;
	return so4Ppm / clPpm;
}

/** Ca:Mg ratio — fermentation character. Returns null when Mg = 0. */
export function calcCaMgRatio(caPpm: number, mgPpm: number): number | null {
	if (mgPpm === 0) return null;
	return caPpm / mgPpm;
}

/** Look up a single ion's target ppm from an IonTarget array. Returns 0 if not found. */
export function getIonPpm(ions: IonTarget[], symbol: string): number {
	return ions.find((i) => i.symbol === symbol)?.targetPpm ?? 0;
}