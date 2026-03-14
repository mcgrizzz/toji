import type { KojiPreset } from '$lib/engine/models/catalogTypes';

export const uedaStandard: KojiPreset = {
	id: '00000001-0000-0000-0000-000000000001',
	name: 'Ueda Standard',
	isBuiltIn: true,
	kojiGPerKgRice: 0.08,
	carrier: 'Toasted Rice Flour',
	carrierRatioGPerG: 5
};
