/* eslint-disable @typescript-eslint/no-explicit-any */

import type { CatalogIds } from './seedCatalog';

export function seedInventory(ctx: any, catalogIds: CatalogIds): void {
  const now = ctx.timestamp;
  const invOwner = '__system__';

  const riceLots = [
    { id: 'inv-lot-yamada-60', catId: catalogIds.riceYamada, polishPct: 60, lotLabel: 'Lot A' },
    { id: 'inv-lot-yamada-70', catId: catalogIds.riceYamada, polishPct: 70, lotLabel: 'Lot B' },
    { id: 'inv-lot-gohyaku-50', catId: catalogIds.riceGohyaku, polishPct: 50, lotLabel: 'Lot C' },
  ];
  for (const lot of riceLots) {
    if (!ctx.db.InventoryRiceLot.id.find(lot.id)) {
      ctx.db.InventoryRiceLot.insert({
        id: lot.id, ownerId: invOwner,
        catalogRiceVarietyId: lot.catId, customVarietyName: undefined,
        polishPct: lot.polishPct, lotLabel: lot.lotLabel,
        massKgAvailable: undefined, createdAt: now, updatedAt: now,
      });
    }
  }

  const kojiSpores = [
    { id: 'inv-koji-konno-a1', catId: catalogIds.sporeA1 },
    { id: 'inv-koji-hishiroku', catId: catalogIds.sporeHishi },
  ];
  for (const spore of kojiSpores) {
    if (!ctx.db.InventoryKojiSporeLot.id.find(spore.id)) {
      ctx.db.InventoryKojiSporeLot.insert({
        id: spore.id, ownerId: invOwner,
        catalogKojiSporeProductId: spore.catId, customName: undefined,
        createdAt: now, updatedAt: now,
      });
    }
  }

  const yeastStocks = [
    { id: 'inv-yeast-wl707', catId: catalogIds.yeastWl707 },
    { id: 'inv-yeast-k7-dry', catId: catalogIds.yeastK7 },
  ];
  for (const stock of yeastStocks) {
    if (!ctx.db.InventoryYeastStock.id.find(stock.id)) {
      ctx.db.InventoryYeastStock.insert({
        id: stock.id, ownerId: invOwner,
        catalogYeastProductId: stock.catId, customName: undefined,
        format: undefined, createdAt: now, updatedAt: now,
      });
    }
  }
}
