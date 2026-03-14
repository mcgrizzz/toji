import type { WorkingCopy, Snapshot } from './versioning';
import type { ScheduleTemplate } from '$lib/engine/models/scheduleTypes';
import type { KojiPreset, MotoPreset, MoromiPreset } from '$lib/engine/models/catalogTypes';

export type KojiMethodBody = {
	kind: 'koji';
	preset: KojiPreset;
	schedule?: ScheduleTemplate;
};

export type MotoMethodBody = {
	kind: 'moto';
	preset: MotoPreset;
	schedule?: ScheduleTemplate;
};

export type MoromiMethodBody = {
	kind: 'moromi';
	preset: MoromiPreset;
	schedule?: ScheduleTemplate;
};

export type MethodBody = KojiMethodBody | MotoMethodBody | MoromiMethodBody;

export type Method = WorkingCopy<MethodBody>;
export type MethodSnapshot = Snapshot<MethodBody>;
