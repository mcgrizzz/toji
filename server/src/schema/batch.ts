import { table, t } from 'spacetimedb/server';

// ── Enums ─────────────────────────────────────────────────────────────────────

const BatchStatus = t.enum('BatchStatus', [
  'planned',
  'in_progress',
  'complete',
  'abandoned',
]);

const TargetKind = t.enum('TargetKind', ['genshu_volume_L', 'total_rice_kg']);

// ── Batch tables ──────────────────────────────────────────────────────────────

/**
 * recipeSnapshotEntityId must point to Entity where entityKind=snapshot, dataType=recipe.
 * Commented out selections specifics as I don't know how to make this a flexible system yet.
 */
export const Batch = table(
  {
    name: 'batch',
    public: true,
    indexes: [
      { accessor: 'byOwnerId', algorithm: 'btree' as const, columns: ['ownerId'] },
      { accessor: 'byRecipeSnapshotEntityId', algorithm: 'btree' as const, columns: ['recipeSnapshotEntityId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    ownerId: t.string(),
    recipeSnapshotEntityId: t.string(),
    name: t.string(),
    status: BatchStatus,
    // TODO: selection/override fields — design TBD
    targetKind: TargetKind,
    targetValue: t.f64(),
    // usePremadeKoji: t.bool(),
    // kojiRiceLotId: t.option(t.string()),
    // kojiSporeLotId: t.option(t.string()),
    // motoRiceLotId: t.option(t.string()),
    // yeastStockId: t.option(t.string()),
    // acidTypeId: t.option(t.string()),
    // waterProfileEntityId: t.option(t.string()),
    startedAt: t.option(t.timestamp()),
    completedAt: t.option(t.timestamp()),
    notes: t.option(t.string()),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

// TODO: BatchMoromiStageLot — design TBD (per-stage rice lot assignments)
// export const BatchMoromiStageLot = table(
//   {
//     name: 'batch_moromi_stage_lot',
//     public: true,
//     indexes: [
//       { accessor: 'byBatchId', algorithm: 'btree' as const, columns: ['batchId'] },
//     ],
//   },
//   {
//     id: t.string().primaryKey(),
//     batchId: t.string(),
//     stageOrdinal: t.i32(),
//     riceLotId: t.string(),
//   }
// );
