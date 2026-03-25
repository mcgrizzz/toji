import { t } from 'spacetimedb/server';
import spacetimedb from '../schema';
import { buildBundle } from '../lib/bundleBuilder';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const getPublicLibraryEntries = spacetimedb.procedure(
  t.string(),
  (ctx) => ctx.withTx(tx => {
    const all = [...tx.db.Asset.iter()];
    const publicSnapshots = all.filter(
      (e: any) => e.isPublic && e.assetKind.tag === 'snapshot' && e.dataType.tag === 'recipe'
    );

    // Group by lineageRootId, keep first per root
    const byRoot = new Map<string, any>();
    for (const snap of publicSnapshots) {
      if (!byRoot.has(snap.lineageRootId)) {
        byRoot.set(snap.lineageRootId, snap);
      }
    }

    const entries = [...byRoot.values()].map((s: any) => ({
      snapshotId: s.id,
      name: s.name,
      description: s.description,
      version: s.version,
    }));
    return JSON.stringify(entries);
  })
);

export const getRecipeBundle = spacetimedb.procedure(
  { snapshotId: t.string() },
  t.string(),
  (ctx, { snapshotId }) => ctx.withTx(tx => {
    const entity = tx.db.Asset.id.find(snapshotId);
    if (!entity) throw new Error(`Entity ${snapshotId} not found`);
    if (!entity.isPublic) throw new Error('Cannot view a non-public snapshot');
    if (entity.assetKind.tag !== 'snapshot') throw new Error('Not a snapshot');
    if (entity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    const payload = tx.db.Recipe.assetId.find(snapshotId);
    if (!payload) throw new Error(`Recipe payload ${snapshotId} not found`);

    return JSON.stringify(buildBundle(tx, entity, payload));
  })
);
