/**
 * FIXTURE DATA — not authoritative.
 * Used only for engine tests and isolated playground pages.
 * The server (SpacetimeDB) is the source of truth for app data.
 * These values are allowed to drift from the server schema.
 */

import type { MethodSnapshot } from '$lib/app/models/methods';
import { sandanStandard } from '$lib/data/catalog/moromiPresets';

export const sandanMoromiMethodSnapshot: MethodSnapshot = {
	id: 'snap-method-moromi-sandan-001',
	sourceId: 'method-moromi-sandan',
	version: '1.0.0',
	name: 'Sandan Moromi Method',
	isPublic: true,
	body: {
		kind: 'moromi',
		preset: sandanStandard
	}
};
