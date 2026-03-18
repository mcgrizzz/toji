/**
 * FIXTURE DATA — not authoritative.
 * Used only for engine tests and isolated playground pages.
 * The server (SpacetimeDB) is the source of truth for app data.
 * These values are allowed to drift from the server schema.
 */

import type { RiceLotItem } from '$lib/app/models/inventory';

export const riceLots: RiceLotItem[] = [
	{
		id: 'lot-yamada-60',
		variety: 'Yamadanishiki',
		polishPct: 60,
		lotLabel: 'Lot A'
	},
	{
		id: 'lot-yamada-70',
		variety: 'Yamadanishiki',
		polishPct: 70,
		lotLabel: 'Lot B'
	},
	{
		id: 'lot-gohyaku-50',
		variety: 'Gohyakumangoku',
		polishPct: 50,
		lotLabel: 'Lot C'
	}
];
