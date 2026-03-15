import type { RecipeSnapshot } from '$lib/app/models/recipes';
import type {
	RecipePlan,
	PlanTarget,
	KojiPlanSelection,
	RiceLotRef,
	YeastRef
} from '$lib/engine/models/planTypes';
import type { AcidType, WaterProfile } from '$lib/engine/models/catalogTypes';

export function buildRecipePlan(params: {
	recipe: RecipeSnapshot;
	target: PlanTarget;
	koji: KojiPlanSelection;
	moto: { riceLot: RiceLotRef; yeast: YeastRef; acid: AcidType };
	moromiStages: { stageOrdinal: number; riceLot: RiceLotRef }[];
	water: WaterProfile | null;
}): RecipePlan {
	const { recipe, target, koji, moto, moromiStages, water } = params;

	return {
		recipeSnapshotId: recipe.id,
		target,
		koji,
		moto: {
			riceLot: moto.riceLot,
			yeast: moto.yeast,
			acid: moto.acid
		},
		moromi: {
			stages: moromiStages
		},
		water
	};
}
