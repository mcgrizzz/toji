import { t } from 'spacetimedb/server';
import spacetimedb from '../schema';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const getMyInventory = spacetimedb.procedure(
  t.string(),
  (ctx) => ctx.withTx(tx => {
    const senderId = tx.sender.toHexString();

    const riceLots = [...tx.db.InventoryRiceLot.byOwnerId.filter(senderId)].map((r: any) => {
      let variety = r.customVarietyName;
      if (r.catalogRiceVarietyId) {
        const cat = tx.db.CatalogRiceVariety.id.find(r.catalogRiceVarietyId);
        if (cat) variety = cat.name;
      }
      return { lotId: r.id, variety: variety ?? 'Unknown', polishPct: r.polishPct, lotLabel: r.lotLabel };
    });

    const kojiStrains = [...tx.db.InventoryKojiSporeLot.byOwnerId.filter(senderId)].map((k: any) => {
      let name = k.customName;
      if (k.catalogKojiSporeProductId) {
        const cat = tx.db.CatalogKojiSporeProduct.id.find(k.catalogKojiSporeProductId);
        if (cat) name = cat.name;
      }
      return { strainId: k.id, name: name ?? 'Unknown' };
    });

    const yeasts = [...tx.db.InventoryYeastStock.byOwnerId.filter(senderId)].map((y: any) => {
      let name = y.customName;
      let format = y.format?.tag;
      if (y.catalogYeastProductId) {
        const cat = tx.db.CatalogYeastProduct.id.find(y.catalogYeastProductId);
        if (cat) {
          name = cat.name;
          if (cat.format) format = cat.format.tag;
        }
      }
      return { yeastId: y.id, name: name ?? 'Unknown', format: format ?? 'liquid_pouch' };
    });

    return JSON.stringify({ riceLots, kojiStrains, yeasts });
  })
);

export const getSeedInventory = spacetimedb.procedure(
  t.string(),
  (ctx) => ctx.withTx(tx => {
    const ownerId = '__system__';

    const riceLots = [...tx.db.InventoryRiceLot.byOwnerId.filter(ownerId)].map((r: any) => {
      let variety = r.customVarietyName;
      if (r.catalogRiceVarietyId) {
        const cat = tx.db.CatalogRiceVariety.id.find(r.catalogRiceVarietyId);
        if (cat) variety = cat.name;
      }
      return { lotId: r.id, variety: variety ?? 'Unknown', polishPct: r.polishPct, lotLabel: r.lotLabel };
    });

    const kojiStrains = [...tx.db.InventoryKojiSporeLot.byOwnerId.filter(ownerId)].map((k: any) => {
      let name = k.customName;
      if (k.catalogKojiSporeProductId) {
        const cat = tx.db.CatalogKojiSporeProduct.id.find(k.catalogKojiSporeProductId);
        if (cat) name = cat.name;
      }
      return { strainId: k.id, name: name ?? 'Unknown' };
    });

    const yeasts = [...tx.db.InventoryYeastStock.byOwnerId.filter(ownerId)].map((y: any) => {
      let name = y.customName;
      let format = y.format?.tag;
      if (y.catalogYeastProductId) {
        const cat = tx.db.CatalogYeastProduct.id.find(y.catalogYeastProductId);
        if (cat) {
          name = cat.name;
          if (cat.format) format = cat.format.tag;
        }
      }
      return { yeastId: y.id, name: name ?? 'Unknown', format: format ?? 'liquid_pouch' };
    });

    return JSON.stringify({ riceLots, kojiStrains, yeasts });
  })
);
