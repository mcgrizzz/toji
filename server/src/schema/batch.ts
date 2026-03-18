import { table, t } from 'spacetimedb/server';
import { MaterialClass } from './recipe';

// ── Enums ─────────────────────────────────────────────────────────────────────

const BatchStatus = t.enum('BatchStatus', [
  'planned',
  'in_progress',
  'complete',
  'abandoned',
]);

const TargetKind = t.enum('TargetKind', ['genshu_volume_L', 'total_rice_kg']);

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
    status: BatchStatus,
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
    status: BatchStatus,
    startedAt: t.option(t.timestamp()),
    completedAt: t.option(t.timestamp()),
  }
);

export const BatchSubstageInstance = table(
  {
    name: 'batch_substage_instance',
    public: true,
    indexes: [
      { accessor: 'byBatchStageInstanceId', algorithm: 'btree' as const, columns: ['batchStageInstanceId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchStageInstanceId: t.string(),
    substageSpecId: t.string(),
    ordinal: t.i32(),
    label: t.string(),
  }
);

export const BatchStepInstance = table(
  {
    name: 'batch_step_instance',
    public: true,
    indexes: [
      { accessor: 'byBatchSubstageInstanceId', algorithm: 'btree' as const, columns: ['batchSubstageInstanceId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    batchSubstageInstanceId: t.string(),
    stepSpecId: t.string(),
    ordinal: t.i32(),
    label: t.string(),
    renderedInstruction: t.string(),
    status: BatchStatus,
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
