import { connect, procedures } from '$lib/spacetimedb/connection';
import type { RecipePlanDraft } from '$lib/engine/models/planTypes';

export type BatchListItem = {
	id: string;
	sourceRecipeEntityId: string;
	batchRecipeEntityId: string;
	recipeName: string;
	status: string;
	targetKind: string;
	targetValue: number;
	createdAt?: string;
	startedAt?: string;
	completedAt?: string;
	notes?: string;
};

/** Convert a client-side RecipePlanDraft to the DB BatchSelections shape (JSON). */
function draftToSelectionsJson(draft: RecipePlanDraft): string {
	return JSON.stringify({
		targetKind: { tag: draft.target.kind },
		targetValue: draft.target.value,
		usePremadeKoji: draft.koji.mode === 'premade',
		kojiRiceLotId: draft.koji.mode === 'make' ? draft.koji.riceLot.lotId : undefined,
		kojiStrainId: draft.koji.mode === 'make' ? draft.koji.kojiStrain.strainId : undefined,
		motoRiceLotId: draft.moto.riceLot.lotId,
		yeastId: draft.moto.yeast.yeastId,
		acidTypeId: draft.moto.acid.id,
		moromiStageLots: draft.moromi.stages.map((s) => ({
			stageOrdinal: s.stageOrdinal,
			riceLotId: s.riceLot.lotId,
		})),
		waterProfileId: draft.water?.id,
	});
}

export async function createBatch(
	recipeId: string,
	draft: RecipePlanDraft,
	version?: string
): Promise<{ batchId: string; batchRecipeEntityId: string }> {
	await connect();
	const json = await procedures().createBatch({
		recipeId,
		selections: draftToSelectionsJson(draft),
		version,
	});
	return JSON.parse(json);
}

export async function getMyBatches(): Promise<BatchListItem[]> {
	await connect();
	const json = await procedures().getMyBatches({} as never);
	return JSON.parse(json);
}
