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
