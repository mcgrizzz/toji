import {
  loadRecipeProcessUses,
  loadRecipeMaterialSpecs,
  loadRecipeMaterialBindings,
} from './loaders';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function copyRecipeEntity(tx: any, sourceEntityId: string, senderId: string, overrides: {
  assetKind: 'working' | 'snapshot';
  attachedBatchId?: string;
  version?: string;
  lineageRootId?: string;
  provenanceKind?: string;
  provenanceAssetId?: string;
}): { newEntityId: string; rpuIdMap: Map<string, string>; rmsIdMap: Map<string, string> } {
  const sourceEntity = tx.db.Asset.id.find(sourceEntityId);
  if (!sourceEntity) throw new Error(`Entity ${sourceEntityId} not found`);
  const sourcePayload = tx.db.Recipe.assetId.find(sourceEntityId);
  if (!sourcePayload) throw new Error(`Recipe payload ${sourceEntityId} not found`);

  const newEntityId = tx.newUuidV4().toString();
  const now = tx.timestamp;

  // Copy Entity
  tx.db.Asset.insert({
    id: newEntityId,
    ownerId: senderId,
    dataType: { tag: 'recipe' },
    assetKind: { tag: overrides.assetKind },
    name: sourceEntity.name,
    description: sourceEntity.description,
    version: overrides.version,
    isPublic: false,
    isArchived: false,
    lineageRootId: overrides.lineageRootId ?? newEntityId,
    parentAssetId: sourceEntityId,
    provenanceKind: overrides.provenanceKind
      ? { tag: overrides.provenanceKind }
      : sourceEntity.provenanceKind,
    provenanceAssetId: overrides.provenanceAssetId ?? sourceEntity.provenanceAssetId,
    createdAt: now,
    updatedAt: now,
  });

  // Copy Recipe payload
  tx.db.Recipe.insert({
    assetId: newEntityId,
    defaultWaterProfileAssetId: sourcePayload.defaultWaterProfileAssetId,
    attachedBatchId: overrides.attachedBatchId,
    notes: sourcePayload.notes,
  });

  // Copy RecipeProcessUse rows with ID remapping
  const sourceRpus = loadRecipeProcessUses(tx, sourceEntityId);
  const rpuIdMap = new Map<string, string>();
  for (const rpu of sourceRpus) {
    const newRpuId = tx.newUuidV4().toString();
    rpuIdMap.set(rpu.id, newRpuId);
    tx.db.RecipeProcess.insert({
      id: newRpuId,
      recipeAssetId: newEntityId,
      ordinal: rpu.ordinal,
      label: rpu.label,
      processSnapshotAssetId: rpu.processSnapshotAssetId,
      notes: rpu.notes,
    });
  }

  // Copy RecipeMaterialSpec rows with ID remapping
  const sourceRms = loadRecipeMaterialSpecs(tx, sourceEntityId);
  const rmsIdMap = new Map<string, string>();
  for (const rms of sourceRms) {
    const newRmsId = tx.newUuidV4().toString();
    rmsIdMap.set(rms.id, newRmsId);
    tx.db.RecipeMaterial.insert({
      id: newRmsId,
      recipeAssetId: newEntityId,
      key: rms.key,
      label: rms.label,
      materialClass: rms.materialClass,
      defaultUnit: rms.defaultUnit,
      catalogRefType: rms.catalogRefType,
      catalogRefId: rms.catalogRefId,
      customName: rms.customName,
      notes: rms.notes,
    });
  }

  // Copy RecipeProcessMaterialBinding rows with remapped IDs
  for (const [oldRpuId, newRpuId] of rpuIdMap) {
    const bindings = loadRecipeMaterialBindings(tx, oldRpuId);
    for (const b of bindings) {
      tx.db.RecipeMaterialBinding.insert({
        id: tx.newUuidV4().toString(),
        recipeProcessId: newRpuId,
        processMaterialSlotId: b.processMaterialSlotId,
        recipeMaterialId: rmsIdMap.get(b.recipeMaterialId) ?? b.recipeMaterialId,
        quantityOverride: b.quantityOverride,
        quantityUnitOverride: b.quantityUnitOverride,
        notes: b.notes,
      });
    }
  }

  return { newEntityId, rpuIdMap, rmsIdMap };
}
