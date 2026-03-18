export type BatchStatus = 'planned' | 'in_progress' | 'completed';

export type Batch = {
	id: string;
	sourceRecipeEntityId: string;
	batchRecipeEntityId: string;
	name: string;
	status: BatchStatus;
	createdAt: string;
};
