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
      { accessor: 'byBatchRecipeEntityId', algorithm: 'btree' as const, columns: ['batchRecipeEntityId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    ownerId: t.string(),
    sourceRecipeEntityId: t.string(),
    batchRecipeEntityId: t.string(),
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

// ── Execution instance tables ────────────────────────────────────────────────

export const BatchProcessInstance = table(
  {
    name: 'batch_process_instance',
    public: true,
    indexes: [
      { accessor: 'byBatchId', algorithm: 'btree' as const, columns: ['batchId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchId: t.string(),
    recipeProcessUseId: t.string(),
    ordinal: t.i32(),
    processSnapshotEntityId: t.string(),
    label: t.string(),
    status: ExecutionStatus,
    startedAt: t.option(t.timestamp()),
    completedAt: t.option(t.timestamp()),
  }
);

export const BatchStageInstance = table(
  {
    name: 'batch_stage_instance',
    public: true,
    indexes: [
      { accessor: 'byBatchProcessInstanceId', algorithm: 'btree' as const, columns: ['batchProcessInstanceId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchProcessInstanceId: t.string(),
    stageSpecId: t.string(),
    ordinal: t.i32(),
    label: t.string(),
    status: ExecutionStatus,
    startedAt: t.option(t.timestamp()),
    completedAt: t.option(t.timestamp()),
  }
);

export const BatchStepInstance = table(
  {
    name: 'batch_step_instance',
    public: true,
    indexes: [
      { accessor: 'byBatchStageInstanceId', algorithm: 'btree' as const, columns: ['batchStageInstanceId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchStageInstanceId: t.string(),
    stepSpecId: t.string(),
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

export const BatchStepFieldValue = table(
  {
    name: 'batch_step_field_value',
    public: true,
    indexes: [
      { accessor: 'byBatchStepInstanceId', algorithm: 'btree' as const, columns: ['batchStepInstanceId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchStepInstanceId: t.string(),
    stepFieldSpecId: t.string(),
    key: t.string(),
    plannedNumber: t.option(t.f64()),
    plannedText: t.option(t.string()),
    plannedBool: t.option(t.bool()),
    actualNumber: t.option(t.f64()),
    actualText: t.option(t.string()),
    actualBool: t.option(t.bool()),
    actualLoggedAt: t.option(t.timestamp()),
  }
);

export const BatchMaterialPlan = table(
  {
    name: 'batch_material_plan',
    public: true,
    indexes: [
      { accessor: 'byBatchId', algorithm: 'btree' as const, columns: ['batchId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchId: t.string(),
    batchProcessInstanceId: t.option(t.string()),
    batchStageInstanceId: t.option(t.string()),
    processMaterialSlotSpecId: t.option(t.string()),
    recipeMaterialSpecId: t.option(t.string()),
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

export const BatchTaskInstance = table(
  {
    name: 'batch_task_instance',
    public: true,
    indexes: [
      { accessor: 'byBatchId', algorithm: 'btree' as const, columns: ['batchId'] },
      { accessor: 'byBatchProcessInstanceId', algorithm: 'btree' as const, columns: ['batchProcessInstanceId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchId: t.string(),
    batchProcessInstanceId: t.string(),
    batchStageInstanceId: t.option(t.string()),
    batchStepInstanceId: t.option(t.string()),
    taskSpecId: t.string(),
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

// ── Future concepts (not yet implemented) ─────────────────────────────────────
//
// Block
//   A discrete unit of work within a stage (e.g. "rice prep block" containing
//   rinse → soak → drain → steam). Blocks group steps for reuse and calculator
//   attachment.
//
// ObservationSetSpec / ObservationValueSpec
//   Structured logging definitions — what measurements to capture at each
//   observation point (temperature, pH, baumé, etc.).
//
// ToolAttachment / ToolOutputBinding
//   Attaches calculators or external tools to blocks/tasks, with bindings
//   that map tool outputs back to step field values.
