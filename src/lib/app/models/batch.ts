export type BatchStatus = 'planned' | 'in_progress' | 'completed';

export type Batch = {
	id: string;
	recipeSnapshotId: string;
	name: string;
	status: BatchStatus;
	createdAt: string;
};
