import { schema } from 'spacetimedb/server';

export {
  CatalogRiceVariety,
  CatalogYeastProduct,
  CatalogKojiSporeProduct,
  AcidType,
  MineralSalt,
  MineralSaltIon,
  InventoryRiceLot,
  InventoryYeastStock,
  InventoryKojiSporeLot,
} from './catalog';

export {
  User,
  Entity,
  Recipe,
  KojiMethod,
  MotoMethod,
  MoromiMethod,
  WaterProfile,
  RecipeAmendment,
  MoromiStage,
  WaterProfileIon,
  ScheduleTable,
  ScheduleEvent,
} from './recipe';

export { Batch } from './batch';

import {
  CatalogRiceVariety,
  CatalogYeastProduct,
  CatalogKojiSporeProduct,
  AcidType,
  MineralSalt,
  MineralSaltIon,
  InventoryRiceLot,
  InventoryYeastStock,
  InventoryKojiSporeLot,
} from './catalog';

import {
  User,
  Entity,
  Recipe,
  KojiMethod,
  MotoMethod,
  MoromiMethod,
  WaterProfile,
  RecipeAmendment,
  MoromiStage,
  WaterProfileIon,
  ScheduleTable,
  ScheduleEvent,
} from './recipe';

import { Batch } from './batch';

export default schema({
  User,
  Entity,
  Recipe,
  KojiMethod,
  MotoMethod,
  MoromiMethod,
  WaterProfile,
  RecipeAmendment,
  MoromiStage,
  WaterProfileIon,
  ScheduleTable,
  ScheduleEvent,
  CatalogRiceVariety,
  CatalogYeastProduct,
  CatalogKojiSporeProduct,
  AcidType,
  MineralSalt,
  MineralSaltIon,
  InventoryRiceLot,
  InventoryYeastStock,
  InventoryKojiSporeLot,
  Batch,
});
