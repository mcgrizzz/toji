/* eslint-disable @typescript-eslint/no-explicit-any */

export function loadProcessEntity(tx: any, assetId: string) {
  const entity = tx.db.Asset.id.find(assetId);
  if (!entity) throw new Error(`Process entity ${assetId} not found`);
  const process = tx.db.Process.assetId.find(assetId);
  if (!process) throw new Error(`Process payload ${assetId} not found`);
  return { entity, process };
}

export function loadProcessParamMap(tx: any, assetId: string): Map<string, number | string | boolean> {
  const rows = [...tx.db.ProcessParameter.byProcessAssetId.filter(assetId)];
  const map = new Map<string, number | string | boolean>();
  for (const r of rows) {
    switch (r.valueType.tag) {
      case 'number': if (r.defaultNumberValue != null) map.set(r.key, r.defaultNumberValue); break;
      case 'text': if (r.defaultTextValue != null) map.set(r.key, r.defaultTextValue); break;
      case 'boolean': if (r.defaultBoolValue != null) map.set(r.key, r.defaultBoolValue); break;
    }
  }
  return map;
}

export function loadProcessStages(tx: any, assetId: string) {
  return [...tx.db.ProcessStage.byProcessAssetId.filter(assetId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
}

export function loadProcessMaterialSlots(tx: any, assetId: string) {
  return [...tx.db.ProcessMaterialSlot.byProcessAssetId.filter(assetId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
}

export function loadRecipeProcessUses(tx: any, recipeEntityId: string) {
  return [...tx.db.RecipeProcess.byRecipeAssetId.filter(recipeEntityId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
}

export function loadRecipeMaterialSpecs(tx: any, recipeEntityId: string) {
  return [...tx.db.RecipeMaterial.byRecipeAssetId.filter(recipeEntityId)];
}

export function loadRecipeMaterialBindings(tx: any, rpuId: string) {
  return [...tx.db.RecipeMaterialBinding.byRecipeProcessId.filter(rpuId)];
}

export function loadProcessSteps(tx: any, stageId: string) {
  return [...tx.db.ProcessStep.byStageId.filter(stageId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
}
