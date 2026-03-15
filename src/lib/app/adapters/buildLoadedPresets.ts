import type { MethodSnapshot, KojiMethodBody, MotoMethodBody, MoromiMethodBody } from '$lib/app/models/methods';
import type { RecipeSource } from '$lib/app/models/recipes';
import type { LoadedPresets } from '$lib/engine/models/planTypes';
import type { StoredRecipeTemplate } from '$lib/engine/models/templateTypes';
import type { WaterProfile, MineralSalt } from '$lib/engine/models/catalogTypes';

export function buildLoadedPresets(params: {
	kojiMethod: MethodSnapshot;
	motoMethod: MethodSnapshot;
	moromiMethod: MethodSnapshot;
	waterProfile: WaterProfile | null;
	availableSalts: MineralSalt[];
	recipe: RecipeSource;
}): LoadedPresets {
	const { kojiMethod, motoMethod, moromiMethod, waterProfile, availableSalts, recipe } = params;

	const spec: StoredRecipeTemplate = {
		id: recipe.id,
		name: recipe.name,
		kojiPresetRef: kojiMethod.id,
		motoPresetRef: motoMethod.id,
		moromiPresetRef: moromiMethod.id,
		waterProfileRef: waterProfile?.id ?? '',
		amendments: recipe.body.amendments,
		recommendedRiceVariety: recipe.body.defaults?.recommendedRiceVariety,
		recommendedPolishPct: recipe.body.defaults?.recommendedPolishPct
	};

	return {
		kojiPreset: (kojiMethod.body as KojiMethodBody).preset,
		motoPreset: (motoMethod.body as MotoMethodBody).preset,
		moromiPreset: (moromiMethod.body as MoromiMethodBody).preset,
		waterProfile,
		availableSalts,
		spec
	};
}
