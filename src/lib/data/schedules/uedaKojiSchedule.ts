/**
 * FIXTURE DATA — not authoritative.
 * Used only for engine tests and isolated playground pages.
 * The server (SpacetimeDB) is the source of truth for app data.
 * These values are allowed to drift from the server schema.
 */

import type { ScheduleTemplate } from '$lib/engine/models/scheduleTypes';

export const uedaKojiSchedule: ScheduleTemplate = {
	name: 'Ueda Koji Schedule',
	workflow: { kind: 'koji' },
	steps: [
		{
			key: 'soak_drain',
			label: 'Soak + Drain Rest',
			atH: 0,
			durationH: 4,
			goals: [{ description: 'Target 29–32% weight gain by end of soak/drain period' }],
			actions: [
				{
					description:
						'Soak rice to target absorption, drain, then rest to allow moisture to distribute evenly'
				}
			]
		},
		{
			key: 'steam',
			label: 'Steam Rice',
			atH: 4,
			durationH: 1,
			goals: [{ description: 'Target 42–43% post-steam weight gain (40–44% acceptable)' }],
			actions: [
				{
					description:
						'Steam thoroughly until grains are evenly gelatinized through the center'
				}
			]
		},
		{
			key: 'dry',
			label: 'Hiki-komi / Drying',
			atH: 5,
			durationH: 3,
			goals: [
				{ description: 'Dry rice down to 28–31% weight gain before inoculation' },
				{ description: 'For a first run with a new rice, aim for 29–30%' }
			],
			checks: [
				{ description: 'Keep rice spread out for even drying' },
				{
					description:
						'Use ~37–40°C chamber heat; up to 45°C is acceptable in an oven'
				},
				{ description: 'Avoid prolonged exposure above 50°C' }
			],
			actions: [
				{
					description:
						'Dry steamed rice on racks in a warm, ventilated chamber or low-temp oven until target weight is reached'
				}
			]
		},
		{
			key: 'inoculate',
			label: 'Tane-kiri / Inoculation',
			atH: 8,
			goals: [{ description: 'Rice will typically end around 29–30% after tane-kiri' }],
			checks: [
				{ description: 'Rice must be at or below 40°C before inoculation' },
				{ description: 'Distribute spores as evenly as possible' }
			],
			actions: [
				{
					description:
						'Measure and dilute starter as needed, then shake evenly over rice while breaking up clumps and turning rice'
				}
			]
		},
		{
			key: 'germination',
			label: 'Momi-age / Germination',
			atH: 8,
			durationH: 18,
			goals: [
				{ description: 'Chamber target: 32°C' },
				{ description: 'Koji target at start: 32°C' },
				{ description: 'Expected weight ratio: 28–29%' }
			],
			checks: [
				{
					description:
						'Use sanitized tubs with lids loosely placed to retain rice moisture'
				},
				{ description: 'Do not add extra humidity to the chamber' }
			],
			actions: [
				{
					description:
						'Divide rice into tubs, record weights, loosely cover, and hold at 32°C for germination'
				}
			]
		},
		{
			key: 'mori',
			label: 'Mori / Heaping',
			atH: 26,
			durationH: 6,
			goals: [
				{ description: 'Weight should remain stable, with less than 0.5% drop' },
				{ description: 'Koji temp target at start: 32.5–34°C' },
				{ description: 'Chamber target: 32°C' }
			],
			checks: [
				{ description: 'Proceed to naka when surface haze reaches roughly 10–20%' }
			],
			actions: [
				{
					description:
						'Break up any clumps, stir lightly, record weight, and crack lid slightly for oxygen'
				}
			]
		},
		{
			key: 'naka',
			label: 'Naka-shigoto / Middle Work',
			atH: 32,
			durationH: 6,
			goals: [
				{ description: 'Weight should remain stable, with less than 0.5% drop' },
				{ description: 'Koji temp target at start: 34–35°C' },
				{ description: 'Chamber target: 33–34°C' }
			],
			checks: [
				{ description: 'Proceed to shimai when surface haze reaches roughly 30–40%' }
			],
			actions: [
				{
					description:
						'Mix lightly, break up clumps so grains are loose again, and record weight'
				}
			]
		},
		{
			key: 'shimai',
			label: 'Shimai-shigoto / Final Work',
			atH: 38,
			goals: [
				{ description: 'Ideal timing is around 38.5°C koji temperature' },
				{ description: 'Koji temp target at start: 38–39°C' },
				{ description: 'Chamber target: 35–36°C' }
			],
			checks: [
				{
					description:
						'Once koji reaches 40°C, or at shimai, remove lid and cover tub with a clean dry cotton towel'
				}
			],
			actions: [
				{
					description:
						'Mix thoroughly so grains are separated, record weight, then transition from lid to dry towel cover'
				}
			]
		},
		{
			key: 'peak',
			label: 'Peak Temperature Hold',
			atH: 42,
			goals: [
				{
					description:
						'Target peak koji temperature: 40–41°C for a typical batch'
				},
				{
					description:
						'Acceptable overall peak range: 40–43°C depending on strain and goals'
				},
				{ description: 'Maintain near peak until de-koji' }
			],
			checks: [
				{ description: 'Start de-koji timing once peak temperature is reached' },
				{
					description:
						'If temperature overshoots, mix and/or lower chamber by 1–2°C'
				},
				{
					description:
						'Do not remove towel during correction or rice may dry too quickly'
				}
			],
			actions: [
				{ description: 'Hold near peak temperature and monitor for stability' }
			]
		},
		{
			key: 'dekoji',
			label: 'De-koji',
			atH: 50,
			goals: [
				{ description: 'Typical finish is 48–50 hours from tane-kiri' },
				{
					description:
						'Final weight ratio often lands around 13–17%, though 10–20% is acceptable'
				}
			],
			checks: [
				{
					description:
						'Usually finish 10–18 hours after peak temperature is reached'
				},
				{
					description:
						'Cool in a dry place or fridge, but do not seal immediately to avoid condensation'
				}
			],
			actions: [
				{
					description:
						'Remove koji from chamber, record final weight, and cool gradually'
				}
			]
		}
	]
};
