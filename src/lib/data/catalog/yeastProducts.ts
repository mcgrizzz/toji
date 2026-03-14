import type { YeastProduct } from '$lib/engine/models/yeastTypes';

export const wl707: YeastProduct = {
	id: 'wl707',
	name: 'WL707',
	isBuiltIn: true,
	format: 'liquid_pouch',
	manufacturer: 'White Labs',
	cellsPerPackageBn: 100,
	viability: {
		kind: 'linear',
		initialViabilityFrac: 0.97,
		dailyLossFrac: 0.007,
		maxAgeDays: 120
	}
};
