/**
 * FIXTURE DATA — not authoritative.
 * Used only for engine tests and isolated playground pages.
 * The server (SpacetimeDB) is the source of truth for app data.
 * These values are allowed to drift from the server schema.
 */

import type { RecipeSnapshot } from '$lib/app/models/recipes';

export const sakuraGinjoSnapshot: RecipeSnapshot = {
	id: 'snap-recipe-sakura-ginjo-001',
	sourceId: 'recipe-sakura-ginjo',
	version: '1.0.0',
	name: 'Sakura Ginjo',
	isPublic: true,
	body: {
		description:
			'A light ginjo-style sake with delicate sakura petal additions during soe. ' +
			'Uses sokujo moto with sandan moromi build and soft ginjo water profile.',
		kojiMethodSnapshotId: 'snap-method-koji-ueda-001',
		motoMethodSnapshotId: 'snap-method-moto-sokujo-001',
		moromiMethodSnapshotId: 'snap-method-moromi-sandan-001',
		waterProfileId: '00000004-0000-0000-0000-000000000001',
		amendments: [
			{
				kind: 'Sakura Petals',
				fracOfTotalRice: 0.0005,
				placement: { where: 'moromi', stageOrdinal: 1 }
			}
		],
		defaults: {
			recommendedRiceVariety: 'Yamadanishiki',
			recommendedPolishPct: 60,
			recommendedAcidId: '00000005-0000-0000-0000-000000000001'
		}
	}
};
