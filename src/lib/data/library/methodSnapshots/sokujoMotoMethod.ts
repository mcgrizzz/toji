/**
 * FIXTURE DATA — not authoritative.
 * Used only for engine tests and isolated playground pages.
 * The server (SpacetimeDB) is the source of truth for app data.
 * These values are allowed to drift from the server schema.
 */

import type { MethodSnapshot } from '$lib/app/models/methods';
import { sokujoStandard } from '$lib/data/catalog/motoPresets';
import { sokujoMotoSchedule } from '$lib/data/schedules/sokujoMotoSchedule';

export const sokujoMotoMethodSnapshot: MethodSnapshot = {
	id: 'snap-method-moto-sokujo-001',
	sourceId: 'method-moto-sokujo',
	version: '1.0.0',
	name: 'Sokujo Moto Method',
	isPublic: true,
	body: {
		kind: 'moto',
		preset: sokujoStandard,
		schedule: sokujoMotoSchedule
	}
};
