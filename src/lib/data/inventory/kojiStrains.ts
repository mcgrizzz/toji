/**
 * FIXTURE DATA — not authoritative.
 * Used only for engine tests and isolated playground pages.
 * The server (SpacetimeDB) is the source of truth for app data.
 * These values are allowed to drift from the server schema.
 */

import type { KojiStrainItem } from '$lib/app/models/inventory';

export const kojiStrains: KojiStrainItem[] = [
	{
		id: 'koji-konno-a1',
		name: 'Akita Konno A-1'
	},
	{
		id: 'koji-hishiroku-moyashi',
		name: 'Hishiroku Moyashi'
	}
];
