import { table, t } from 'spacetimedb/server';
import { MaterialClass, TaskKind } from './recipe';

// ── Enums ─────────────────────────────────────────────────────────────────────

const BatchStatus = t.enum('BatchStatus', [
  'planned',
  'in_progress',
  'complete',
  'abandoned',
]);

const TargetKind = t.enum('TargetKind', ['genshu_volume_L', 'total_rice_kg']);

const ExecutionStatus = t.enum('ExecutionStatus', [
  'pending',
  'in_progress',
  'complete',
  'skipped',
]);

// ── Batch table ──────────────────────────────────────────────────────────────

export const Batch = table(
  {
    name: 'batch',
    public: true,
    indexes: [
      { accessor: 'byOwnerId', algorithm: 'btree' as const, columns: ['ownerId'] },
      { accessor: 'byBatchRecipeAssetId', algorithm: 'btree' as const, columns: ['batchRecipeAssetId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    ownerId: t.string(),
    sourceRecipeAssetId: t.string(),
    batchRecipeAssetId: t.string(),
    name: t.string(),
    status: BatchStatus,
    targetKind: TargetKind,
    targetValue: t.f64(),
    startedAt: t.option(t.timestamp()),
    completedAt: t.option(t.timestamp()),
    notes: t.option(t.string()),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

// ── Execution tables ────────────────────────────────────────────────────────

export const BatchProcess = table(
  {
    name: 'batch_process',
    public: true,
    indexes: [
      { accessor: 'byBatchId', algorithm: 'btree' as const, columns: ['batchId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchId: t.string(),
    recipeProcessId: t.string(),
    ordinal: t.i32(),
    processSnapshotAssetId: t.string(),
    label: t.string(),
    status: ExecutionStatus,
    startedAt: t.option(t.timestamp()),
    completedAt: t.option(t.timestamp()),
  }
);

export const BatchStage = table(
  {
    name: 'batch_stage',
    public: true,
    indexes: [
      { accessor: 'byBatchProcessId', algorithm: 'btree' as const, columns: ['batchProcessId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchProcessId: t.string(),
    stageId: t.string(),
    ordinal: t.i32(),
    label: t.string(),
    status: ExecutionStatus,
    startedAt: t.option(t.timestamp()),
    completedAt: t.option(t.timestamp()),
  }
);

export const BatchStep = table(
  {
    name: 'batch_step',
    public: true,
    indexes: [
      { accessor: 'byBatchStageId', algorithm: 'btree' as const, columns: ['batchStageId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchStageId: t.string(),
    stepId: t.string(),
    ordinal: t.i32(),
    label: t.string(),
    renderedInstruction: t.string(),
    sectionKey: t.option(t.string()),
    sectionLabel: t.option(t.string()),
    status: ExecutionStatus,
    dueAt: t.option(t.timestamp()),
    completedAt: t.option(t.timestamp()),
    notes: t.option(t.string()),
  }
);

export const BatchMaterial = table(
  {
    name: 'batch_material',
    public: true,
    indexes: [
      { accessor: 'byBatchId', algorithm: 'btree' as const, columns: ['batchId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchId: t.string(),
    batchProcessId: t.option(t.string()),
    batchStageId: t.option(t.string()),
    processMaterialSlotId: t.option(t.string()),
    recipeMaterialId: t.option(t.string()),
    label: t.string(),
    materialClass: MaterialClass,
    plannedQuantity: t.option(t.f64()),
    plannedUnit: t.option(t.string()),
    inventoryRefType: t.option(t.string()),
    inventoryRefId: t.option(t.string()),
    customName: t.option(t.string()),
    notes: t.option(t.string()),
  }
);

export const BatchTask = table(
  {
    name: 'batch_task',
    public: true,
    indexes: [
      { accessor: 'byBatchId', algorithm: 'btree' as const, columns: ['batchId'] },
      { accessor: 'byBatchProcessId', algorithm: 'btree' as const, columns: ['batchProcessId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchId: t.string(),
    batchProcessId: t.string(),
    batchStageId: t.option(t.string()),
    batchStepId: t.option(t.string()),
    processTaskId: t.string(),
    ordinal: t.i32(),
    key: t.string(),
    label: t.string(),
    taskKind: TaskKind,
    sectionKey: t.option(t.string()),
    sectionLabel: t.option(t.string()),
    dueAt: t.option(t.timestamp()),
    status: ExecutionStatus,
    completedAt: t.option(t.timestamp()),
    notes: t.option(t.string()),
  }
);

// ── Observation / context tables ────────────────────────────────────────────

export const BatchObservation = table(
  {
    name: 'batch_observation',
    public: true,
    indexes: [
      { accessor: 'byBatchId', algorithm: 'btree' as const, columns: ['batchId'] },
      { accessor: 'byBatchProcessId', algorithm: 'btree' as const, columns: ['batchProcessId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchId: t.string(),
    batchProcessId: t.option(t.string()),
    batchStageId: t.option(t.string()),
    batchStepId: t.option(t.string()),
    batchTaskId: t.option(t.string()),
    processMetricId: t.option(t.string()),
    stepPromptId: t.option(t.string()),
    recordedAt: t.timestamp(),
    numberValue: t.option(t.f64()),
    textValue: t.option(t.string()),
    boolValue: t.option(t.bool()),
    rawJson: t.option(t.string()),
    derivedJson: t.option(t.string()),
    notes: t.option(t.string()),
  }
);

export const BatchContextValue = table(
  {
    name: 'batch_context_value',
    public: true,
    indexes: [
      { accessor: 'byBatchId', algorithm: 'btree' as const, columns: ['batchId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchId: t.string(),
    batchProcessId: t.option(t.string()),
    batchStageId: t.option(t.string()),
    key: t.string(),
    numberValue: t.option(t.f64()),
    textValue: t.option(t.string()),
    boolValue: t.option(t.bool()),
    effectiveAt: t.timestamp(),
    notes: t.option(t.string()),
  }
);

// ── Future concepts (not yet implemented) ─────────────────────────────────────
//
// Block
//   A discrete unit of work within a stage (e.g. "rice prep block" containing
//   rinse → soak → drain → steam). Blocks group steps for reuse and calculator
//   attachment.
//
// ToolAttachment / ToolOutputBinding
//   Attaches calculators or external tools to blocks/tasks, with bindings
//   that map tool outputs back to step field values.
