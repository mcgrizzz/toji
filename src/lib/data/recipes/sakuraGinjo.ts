import type { RecipeBundle } from '$lib/app/types';
import { uedaStandard } from '$lib/data/catalog/kojiPresets';
import { sokujoStandard } from '$lib/data/catalog/motoPresets';
import { sandanStandard } from '$lib/data/catalog/moromiPresets';
import { ginjo1 } from '$lib/data/catalog/waterProfiles';
import { availableSalts } from '$lib/data/catalog/salts';
import { uedaKojiSchedule } from '$lib/data/schedules/uedaKojiSchedule';
import { sokujoMotoSchedule } from '$lib/data/schedules/sokujoMotoSchedule';
import { lacticAcid88 } from '$lib/data/catalog/acids';
import type { StoredRecipeTemplate } from '$lib/engine/models/templateTypes';

const template: StoredRecipeTemplate = {
	id: 'sakura-ginjo',
	name: 'Sakura Ginjo',
	kojiPresetRef: uedaStandard.id,
	motoPresetRef: sokujoStandard.id,
	moromiPresetRef: sandanStandard.id,
	waterProfileRef: ginjo1.id,
	recommendedRiceVariety: 'Yamadanishiki',
	recommendedPolishPct: 60,
	amendments: [
		{
			kind: 'Sakura Petals',
			fracOfTotalRice: 0.0005,
			placement: { where: 'moromi', stageOrdinal: 1 }
		}
	]
};

export const sakuraGinjoBundle: RecipeBundle = {
	id: 'sakura-ginjo',
	name: 'Sakura Ginjo',
	description:
		'A light ginjo-style sake with delicate sakura petal additions during soe. ' +
		'Uses sokujo moto with sandan moromi build and soft ginjo water profile.',
	template,
	presets: {
		kojiPreset: uedaStandard,
		motoPreset: sokujoStandard,
		moromiPreset: sandanStandard,
		waterProfile: ginjo1,
		availableSalts,
		spec: template
	},
	defaultAcid: lacticAcid88,
	schedules: {
		koji: uedaKojiSchedule,
		moto: sokujoMotoSchedule
	},
	defaults: {
		targetKind: 'genshu_volume_L',
		targetValue: 6.7
	}
};
