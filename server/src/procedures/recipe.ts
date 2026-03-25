import { t } from 'spacetimedb/server';
import spacetimedb from '../schema';
import { buildBundle } from '../lib/bundleBuilder';
import { copyRecipeEntity } from '../lib/copyRecipe';
import { tsToIso } from '../lib/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const getMyRecipes = spacetimedb.procedure(
  t.string(),
  (ctx) => ctx.withTx(tx => {
    const senderId = tx.sender.toHexString();
    const all = [...tx.db.Asset.byOwnerId.filter(senderId)];
    const recipes = all.filter(
      (e: any) => e.assetKind.tag === 'working' && e.dataType.tag === 'recipe'
    );
    // Filter out recipes attached to a batch
    const unattached = recipes.filter((r: any) => {
      const payload = tx.db.Recipe.assetId.find(r.id);
      return !payload?.attachedBatchId;
    });
    return JSON.stringify(unattached.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      createdAt: tsToIso(r.createdAt),
      updatedAt: tsToIso(r.updatedAt),
    })));
  })
);

export const getMyRecipeBundle = spacetimedb.procedure(
  { recipeId: t.string() },
  t.string(),
  (ctx, { recipeId }) => ctx.withTx(tx => {
    const senderId = tx.sender.toHexString();
    const entity = tx.db.Asset.id.find(recipeId);
    if (!entity) throw new Error(`Recipe ${recipeId} not found`);
    if (entity.ownerId !== senderId) throw new Error('Not the owner');
    if (entity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    const payload = tx.db.Recipe.assetId.find(recipeId);
    if (!payload) throw new Error(`Recipe payload ${recipeId} not found`);

    return JSON.stringify(buildBundle(tx, entity, payload));
  })
);

export const copyRecipeSnapshotToRecipe = spacetimedb.procedure(
  { snapshotId: t.string() },
  t.string(),
  (ctx, { snapshotId }) => ctx.withTx(tx => {
    const sourceEntity = tx.db.Asset.id.find(snapshotId);
    if (!sourceEntity) throw new Error(`Snapshot ${snapshotId} not found`);
    if (!sourceEntity.isPublic) throw new Error('Cannot copy a non-public snapshot');
    if (sourceEntity.assetKind.tag !== 'snapshot') throw new Error('Not a snapshot');
    if (sourceEntity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    const senderId = tx.sender.toHexString();
    const { newEntityId } = copyRecipeEntity(tx, snapshotId, senderId, {
      assetKind: 'working',
      provenanceKind: 'copied_from_public',
      provenanceAssetId: snapshotId,
    });

    return JSON.stringify({ recipeId: newEntityId });
  })
);

export const deleteRecipe = spacetimedb.reducer(
  { recipeId: t.string() },
  (ctx, { recipeId }) => {
    const senderId = ctx.sender.toHexString();
    const entity = ctx.db.Asset.id.find(recipeId);
    if (!entity) throw new Error(`Recipe ${recipeId} not found`);
    if (entity.ownerId !== senderId) throw new Error('Not the owner');
    if (entity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    // Delete bindings for each RPU
    const rpus = [...ctx.db.RecipeProcess.byRecipeAssetId.filter(recipeId)];
    for (const rpu of rpus) {
      const bindings = [...ctx.db.RecipeMaterialBinding.byRecipeProcessId.filter(rpu.id)];
      for (const b of bindings) {
        ctx.db.RecipeMaterialBinding.id.delete(b.id);
      }
      ctx.db.RecipeProcess.id.delete(rpu.id);
    }

    // Delete material specs
    const specs = [...ctx.db.RecipeMaterial.byRecipeAssetId.filter(recipeId)];
    for (const s of specs) {
      ctx.db.RecipeMaterial.id.delete(s.id);
    }

    // Delete payload and entity
    ctx.db.Recipe.assetId.delete(recipeId);
    ctx.db.Asset.id.delete(recipeId);
  }
);
