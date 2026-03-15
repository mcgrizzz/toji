import type {
	RecipePlanDraft,
	PlanTarget,
	KojiPlanSelection,
	RiceLotRef,
	YeastRef
} from '$lib/engine/models/planTypes';
import type { AcidType, WaterProfile } from '$lib/engine/models/catalogTypes';

export function buildRecipePlanDraft(params: {
	recipeId: string;
	target: PlanTarget;
	koji: KojiPlanSelection;
	moto: { riceLot: RiceLotRef; yeast: YeastRef; acid: AcidType };
	moromiStages: { stageOrdinal: number; riceLot: RiceLotRef }[];
	water: WaterProfile | null;
}): RecipePlanDraft {
	const { recipeId, target, koji, moto, moromiStages, water } = params;

	return {
		recipeId,
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
