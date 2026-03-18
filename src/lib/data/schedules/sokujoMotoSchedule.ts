/**
 * FIXTURE DATA — not authoritative.
 * Used only for engine tests and isolated playground pages.
 * The server (SpacetimeDB) is the source of truth for app data.
 * These values are allowed to drift from the server schema.
 */

import type { ScheduleTemplate } from '$lib/engine/models/scheduleTypes';

export const sokujoMotoSchedule: ScheduleTemplate = {
	name: 'Sokujo Moto Schedule',
	workflow: { kind: 'moto' },
	steps: [
		{
			key: 'prep_water',
			label: 'Prepare Moto Water',
			atH: 0,
			durationH: 1,
			goals: [{ description: 'Water treated and at target temperature' }],
			actions: [{ description: 'Measure water, add mineral salts and lactic acid, mix thoroughly' }]
		},
		{
			key: 'combine',
			label: 'Combine Koji, Water, and Yeast',
			atH: 1,
			goals: [{ description: 'Koji hydrated and yeast pitched' }],
			actions: [
				{ description: 'Add koji to treated water, stir to break up clumps' },
				{ description: 'Pitch yeast into the mixture' }
			]
		},
		{
			key: 'add_rice',
			label: 'Add Kake Rice',
			atH: 2,
			goals: [{ description: 'Steamed kake rice incorporated into moto' }],
			actions: [{ description: 'Add cooled steamed rice, mix evenly into koji-water mixture' }]
		},
		{
			key: 'ferment',
			label: 'Fermentation',
			atH: 2,
			durationH: 336,
			goals: [{ description: 'Active fermentation with yeast propagation' }],
			checks: [
				{ description: 'Stir once or twice daily for the first few days' },
				{ description: 'Monitor temperature and aroma for healthy fermentation signs' }
			]
		},
		{
			key: 'ready',
			label: 'Moto Ready',
			atH: 338,
			goals: [{ description: 'Moto is mature and ready for moromi build' }],
			checks: [{ description: 'Confirm healthy yeast population before proceeding to soe' }]
		}
	]
};
