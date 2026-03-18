/**
 * FIXTURE DATA — not authoritative.
 * Used only for engine tests and isolated playground pages.
 * The server (SpacetimeDB) is the source of truth for app data.
 * These values are allowed to drift from the server schema.
 */

import type { MethodSnapshot } from '$lib/app/models/methods';
import { uedaStandard } from '$lib/data/catalog/kojiPresets';
import { uedaKojiSchedule } from '$lib/data/schedules/uedaKojiSchedule';

export const uedaKojiMethodSnapshot: MethodSnapshot = {
	id: 'snap-method-koji-ueda-001',
	sourceId: 'method-koji-ueda',
	version: '1.0.0',
	name: 'Ueda Koji Method',
	isPublic: true,
	body: {
		kind: 'koji',
		preset: uedaStandard,
		schedule: uedaKojiSchedule
	}
};
