import type { RecipeBundle } from '$lib/app/types';
import { buildLoadedPresets } from './buildLoadedPresets';
import type { MethodSnapshot, KojiMethodBody, MotoMethodBody, MoromiMethodBody } from '$lib/app/models/methods';
import type { RecipeSnapshot } from '$lib/app/models/recipes';
import type { WaterProfile, MineralSalt, AcidType } from '$lib/engine/models/catalogTypes';
import type { WorkflowKind, ScheduleTemplate } from '$lib/engine/models/scheduleTypes';

export function buildRecipeBundle(params: {
	recipe: RecipeSnapshot;
	kojiMethod: MethodSnapshot;
	motoMethod: MethodSnapshot;
	moromiMethod: MethodSnapshot;
	waterProfile: WaterProfile | null;
	availableSalts: MineralSalt[];
	defaultAcid: AcidType;
	defaults?: { targetKind: 'genshu_volume_L' | 'total_rice_kg'; targetValue: number };
}): RecipeBundle {
	const { recipe, kojiMethod, motoMethod, moromiMethod, waterProfile, availableSalts, defaultAcid, defaults } =
		params;

	const presets = buildLoadedPresets({
		kojiMethod,
		motoMethod,
		moromiMethod,
		waterProfile,
		availableSalts,
		recipe
	});

	const schedules: Partial<Record<WorkflowKind, ScheduleTemplate>> = {};
	const kojiSchedule = (kojiMethod.body as KojiMethodBody).schedule;
	const motoSchedule = (motoMethod.body as MotoMethodBody).schedule;
	const moromiSchedule = (moromiMethod.body as MoromiMethodBody).schedule;
	if (kojiSchedule) schedules.koji = kojiSchedule;
	if (motoSchedule) schedules.moto = motoSchedule;
	if (moromiSchedule) schedules.moromi = moromiSchedule;

	return {
		id: recipe.id,
		name: recipe.name,
		description: recipe.body.description,
		template: presets.spec,
		presets,
		schedules,
		defaultAcid,
		defaults: defaults ?? { targetKind: 'total_rice_kg', targetValue: 5.5 }
	};
}
