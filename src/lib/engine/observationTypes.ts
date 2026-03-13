/** Which brewing workflow this observation belongs to */
export type ObservationWorkflow = 'koji' | 'moto' | 'moromi';

/** What kind of value is being recorded */
export type FieldKind = 'number' | 'boolean' | 'text';

// ── Field definitions ───────────────────────────────────────────────────────

/** Known observation field keys */
export type ObservationFieldKey =
	| 'rice_weight'
	| 'koji_temp'
	| 'chamber_temp'
	| 'baume'
	| 'ph'
	| 'notes';

/** Defines a single observable field — lives in one place, referenced by key */
export type ObservationFieldSpec = {
	key: ObservationFieldKey;
	label: string;
	kind: FieldKind;
	unit?: string; // e.g. 'kg', '°C', '%'
};

// ── Prompt placement ────────────────────────────────────────────────────────

/** Which fields to prompt for at a given schedule step */
export type ObservationPromptSpec = {
	fieldKeys: ObservationFieldKey[];
	required?: boolean;
};

// ── Records ─────────────────────────────────────────────────────────────────

/** A single recorded observation value */
export type ObservationRecord = {
	fieldKey: ObservationFieldKey;
	value: number | boolean | string;
	recordedAt: string; // ISO 8601 timestamp
	notes?: string;
};

/** All observations for one schedule step instance */
export type StepObservations = {
	stepKey: string;
	workflow: ObservationWorkflow;
	records: ObservationRecord[];
};
