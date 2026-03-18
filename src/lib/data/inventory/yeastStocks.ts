/**
 * FIXTURE DATA — not authoritative.
 * Used only for engine tests and isolated playground pages.
 * The server (SpacetimeDB) is the source of truth for app data.
 * These values are allowed to drift from the server schema.
 */

import type { YeastStockItem } from '$lib/app/models/inventory';

export const yeastStocks: YeastStockItem[] = [
	{
		id: 'yeast-wl707',
		productId: 'wl707',
		name: 'WL707',
		format: 'liquid_pouch'
	},
	{
		id: 'yeast-k7-dry',
		productId: 'k7-dry',
		name: 'K7 Dry',
		format: 'dry'
	}
];
