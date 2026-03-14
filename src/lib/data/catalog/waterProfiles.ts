import type { WaterProfile } from '$lib/engine/models/catalogTypes';

export const ginjo1: WaterProfile = {
	id: '00000004-0000-0000-0000-000000000001',
	name: 'Ginjo 1',
	isBuiltIn: true,
	ions: [
		{ symbol: 'Ca', targetPpm: 10 },
		{ symbol: 'Mg', targetPpm: 3 }
	]
};
