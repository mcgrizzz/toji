import type { ScheduleTemplate } from './scheduleTypes';

/** Minimal koji schedule fixture — just enough to test structure, ordering, and timing */
export const exampleKojiSchedule: ScheduleTemplate = {
	name: 'Example Koji Schedule',
	workflow: { kind: 'koji' },
	steps: [
		{ key: 'wash', label: 'Wash Rice', atH: 0 },
		{ key: 'soak', label: 'Soak Rice', atH: 1, durationH: 4 },
		{ key: 'steam', label: 'Steam Rice', atH: 6, durationH: 1 },
		{ key: 'inoculate', label: 'Tane-tsuke', atH: 8 },
		{ key: 'dekoji', label: 'De-koji', atH: 48 }
	]
};
