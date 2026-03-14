import type { IonTarget, MineralSalt } from '../models/catalogTypes';
import { getIonPpm } from '../math/waterMath';

// ── Mineral addition solver ──────────────────────────────────────────────────
//
// Greedy multi-salt solver: iterates salts in priority order, allocating mass
// to satisfy the primary-ion delta, then subtracts cross-ion contributions
// from remaining deltas.
//
// Solver priority for sake (passed in by caller via `salts` order):
//   MgSO4·7H2O → NaCl → KH2PO4 → CaSO4 → CaCl2 → KCl → K2SO4

export function resolveWaterAdditions(
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
