/**
 * FIXTURE DATA — not authoritative.
 * Used only for engine tests and isolated playground pages.
 * The server (SpacetimeDB) is the source of truth for app data.
 * These values are allowed to drift from the server schema.
 */

import type { MotoPreset } from '$lib/engine/models/catalogTypes';

export const sokujoStandard: MotoPreset = {
	id: '00000002-0000-0000-0000-000000000001',
	name: 'Sokujo Standard',
	isBuiltIn: true,
	riceFrac: 0.07,
	kojiFrac: 0.3,
	waterLPerKg: 1.07,
	yeastPitchRateMPerMl: 3,
	acidRefMlPerL: 0.03,
	acidRefStrengthPct: 88
};
