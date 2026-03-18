import type { WorkingCopy, Snapshot } from './versioning';
import type { ScheduleTemplate } from '$lib/engine/models/scheduleTypes';
import type { KojiPreset, MotoPreset, MoromiPreset } from '$lib/engine/models/catalogTypes';

/**
 * @deprecated Compatibility model — no longer reflects the server schema.
 * The server now uses generic process composition (see processes.ts).
 * Retained only because the bundle/fixture/engine pipeline still consumes these types.
 * Remove once the engine is migrated to process-native types.
 */

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
