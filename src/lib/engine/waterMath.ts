import type { IonTarget, MineralSalt } from './catalogTypes';

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

// ── Mineral addition solver ──────────────────────────────────────────────────
//
// Greedy multi-salt solver: iterates salts in priority order, allocating mass
// to satisfy the primary-ion delta, then subtracts cross-ion contributions
// from remaining deltas.
//
// Solver priority for sake (passed in by caller via `salts` order):
//   MgSO4·7H2O → NaCl → KH2PO4 → CaSO4 → CaCl2 → KCl → K2SO4

export function calcWaterMineralAdditions(
	waterL: number,
	targets: IonTarget[],
	salts: MineralSalt[],
	source: IonTarget[] = []
): { salt: MineralSalt; massG: number }[] {
	// Build mutable delta map: target - source, clamped to ≥ 0
	const delta = new Map<string, number>();
	for (const t of targets) {
		const sourcePpm = getIonPpm(source, t.symbol);
		delta.set(t.symbol, Math.max(0, t.targetPpm - sourcePpm));
	}

	const results: { salt: MineralSalt; massG: number }[] = [];

	for (const salt of salts) {
		const primaryDelta = delta.get(salt.primaryIon) ?? 0;
		if (primaryDelta <= 0) continue;

		const primaryContrib = salt.contributions.find((c) => c.ionSymbol === salt.primaryIon);
		if (!primaryContrib) continue;

		// Mass of salt needed to supply the primary ion delta
		const massG = (primaryDelta * waterL) / 1000 / primaryContrib.massGPerGSalt;

		results.push({ salt, massG });

		// Subtract cross-ion contributions from remaining deltas
		for (const contrib of salt.contributions) {
			const supplied = (massG * contrib.massGPerGSalt * 1000) / waterL;
			const current = delta.get(contrib.ionSymbol) ?? 0;
			delta.set(contrib.ionSymbol, Math.max(0, current - supplied));
		}
	}

	return results.filter((r) => r.massG > 0.0001);
}
