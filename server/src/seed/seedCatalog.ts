/* eslint-disable @typescript-eslint/no-explicit-any */

export type CatalogIds = {
  riceYamada: string;
  riceGohyaku: string;
  yeastWl707: string;
  yeastK7: string;
  sporeA1: string;
  sporeHishi: string;
};

export function seedCatalog(ctx: any): CatalogIds {
  const riceYamada = 'cat-rice-yamadanishiki';
  if (!ctx.db.CatalogRiceVariety.id.find(riceYamada)) {
    ctx.db.CatalogRiceVariety.insert({ id: riceYamada, name: 'Yamadanishiki', region: 'Hyogo', description: undefined });
  }
  const riceGohyaku = 'cat-rice-gohyakumangoku';
  if (!ctx.db.CatalogRiceVariety.id.find(riceGohyaku)) {
    ctx.db.CatalogRiceVariety.insert({ id: riceGohyaku, name: 'Gohyakumangoku', region: 'Niigata', description: undefined });
  }

  const yeastWl707 = 'cat-yeast-wl707';
  if (!ctx.db.CatalogYeastProduct.id.find(yeastWl707)) {
    ctx.db.CatalogYeastProduct.insert({ id: yeastWl707, name: 'WL707', format: { tag: 'liquid_pouch' }, supplier: 'White Labs', description: undefined });
  }
  const yeastK7 = 'cat-yeast-k7-dry';
  if (!ctx.db.CatalogYeastProduct.id.find(yeastK7)) {
    ctx.db.CatalogYeastProduct.insert({ id: yeastK7, name: 'K7 Dry', format: { tag: 'dry' }, supplier: undefined, description: undefined });
  }

  const sporeA1 = 'cat-koji-konno-a1';
  if (!ctx.db.CatalogKojiSporeProduct.id.find(sporeA1)) {
    ctx.db.CatalogKojiSporeProduct.insert({ id: sporeA1, name: 'Akita Konno A-1', supplier: undefined, description: undefined });
  }
  const sporeHishi = 'cat-koji-hishiroku';
  if (!ctx.db.CatalogKojiSporeProduct.id.find(sporeHishi)) {
    ctx.db.CatalogKojiSporeProduct.insert({ id: sporeHishi, name: 'Hishiroku Moyashi', supplier: undefined, description: undefined });
  }

  const acidId = 'acid-lactic-88';
  if (!ctx.db.AcidType.id.find(acidId)) {
    ctx.db.AcidType.insert({ id: acidId, name: 'Lactic 88%', strengthPct: 88, relativeAcidity: 1.0 });
  }

  const salts = [
    { id: 'salt-mgso4', name: 'MgSO4·7H2O (Epsom Salt)', primaryIon: 'Mg', ions: [{ ionSymbol: 'Mg', massGPerGSalt: 24.31 / 246.47 }, { ionSymbol: 'SO4', massGPerGSalt: 96.06 / 246.47 }] },
    { id: 'salt-nacl', name: 'NaCl (Table Salt)', primaryIon: 'Na', ions: [{ ionSymbol: 'Na', massGPerGSalt: 22.99 / 58.44 }, { ionSymbol: 'Cl', massGPerGSalt: 35.45 / 58.44 }] },
    { id: 'salt-kh2po4', name: 'KH2PO4 (Monopotassium Phosphate)', primaryIon: 'PO4', ions: [{ ionSymbol: 'K', massGPerGSalt: 39.10 / 136.09 }, { ionSymbol: 'PO4', massGPerGSalt: 94.97 / 136.09 }] },
    { id: 'salt-caso4', name: 'CaSO4 (Gypsum)', primaryIon: 'Ca', ions: [{ ionSymbol: 'Ca', massGPerGSalt: 40.08 / 136.14 }, { ionSymbol: 'SO4', massGPerGSalt: 96.06 / 136.14 }] },
    { id: 'salt-cacl2', name: 'CaCl2 (Calcium Chloride)', primaryIon: 'Ca', ions: [{ ionSymbol: 'Ca', massGPerGSalt: 40.08 / 110.98 }, { ionSymbol: 'Cl', massGPerGSalt: 70.90 / 110.98 }] },
    { id: 'salt-kcl', name: 'KCl (Potassium Chloride)', primaryIon: 'K', ions: [{ ionSymbol: 'K', massGPerGSalt: 39.10 / 74.55 }, { ionSymbol: 'Cl', massGPerGSalt: 35.45 / 74.55 }] },
    { id: 'salt-k2so4', name: 'K2SO4 (Potassium Sulfate)', primaryIon: 'K', ions: [{ ionSymbol: 'K', massGPerGSalt: 78.20 / 174.26 }, { ionSymbol: 'SO4', massGPerGSalt: 96.06 / 174.26 }] },
  ];

  for (const salt of salts) {
    if (!ctx.db.MineralSalt.id.find(salt.id)) {
      ctx.db.MineralSalt.insert({ id: salt.id, name: salt.name, primaryIon: salt.primaryIon });
      for (const ion of salt.ions) {
        ctx.db.MineralSaltIon.insert({
          id: ctx.newUuidV4().toString(),
          saltId: salt.id,
          ionSymbol: ion.ionSymbol,
          massGPerGSalt: ion.massGPerGSalt,
        });
      }
    }
  }

  return { riceYamada, riceGohyaku, yeastWl707, yeastK7, sporeA1, sporeHishi };
}
