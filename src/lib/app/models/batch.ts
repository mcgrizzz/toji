export type BatchStatus = 'planned' | 'in_progress' | 'complete' | 'abandoned';

export type Batch = {
	id: string;
	sourceRecipeEntityId: string;
	batchRecipeEntityId: string;
	name: string;
	status: BatchStatus;
	createdAt: string;
};
