/**
 * FIXTURE DATA — not authoritative.
 * Used only for engine tests and isolated playground pages.
 * The server (SpacetimeDB) is the source of truth for app data.
 * These values are allowed to drift from the server schema.
 */

import type { MoromiPreset } from '$lib/engine/models/catalogTypes';

export const sandanStandard: MoromiPreset = {
	id: '00000003-0000-0000-0000-000000000001',
	name: 'Sandan Standard',
	isBuiltIn: true,
	stages: [
		{ name: 'Soe', ordinal: 1, riceFrac: 0.15, kojiFrac: 0.28, waterLPerKg: 0.92 },
		{ name: 'Naka', ordinal: 2, riceFrac: 0.3, kojiFrac: 0.21, waterLPerKg: 1.2 },
		{ name: 'Tome', ordinal: 3, riceFrac: 0.48, kojiFrac: 0.21, waterLPerKg: 1.2 }
	]
};
