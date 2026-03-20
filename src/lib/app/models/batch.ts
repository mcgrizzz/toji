export type BatchStatus = 'planned' | 'in_progress' | 'complete' | 'abandoned';

export type Batch = {
	id: string;
	sourceRecipeAssetId: string;
	batchRecipeAssetId: string;
	name: string;
	status: BatchStatus;
	createdAt: string;
};
