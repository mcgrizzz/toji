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
