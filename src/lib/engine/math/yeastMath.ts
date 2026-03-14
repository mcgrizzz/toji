import type { YeastViabilityModel } from '../models/yeastTypes';

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
export function calcViableCellsPerPackageM(
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
