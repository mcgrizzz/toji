import type { RecipeSnapshot } from '$lib/app/models/recipes';

export const sakuraGinjoSnapshot: RecipeSnapshot = {
	id: 'snap-recipe-sakura-ginjo-001',
	sourceId: 'recipe-sakura-ginjo',
	version: '1.0.0',
	name: 'Sakura Ginjo',
	isPublic: true,
	body: {
		kojiMethodSnapshotId: 'snap-method-koji-ueda-001',
		motoMethodSnapshotId: 'snap-method-moto-sokujo-001',
		moromiMethodSnapshotId: 'snap-method-moromi-sandan-001',
		amendments: [
			{
				kind: 'Sakura Petals',
				fracOfTotalRice: 0.0005,
				placement: { where: 'moromi', stageOrdinal: 1 }
			}
		]
	}
};
