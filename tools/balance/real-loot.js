// BOTÍN REAL DE UNA VICTORIA para las herramientas de balance (se evalúa DENTRO de la página: page.evaluate(require('./real-loot.js'))).
// Instala window.__RL con:
//   run(tier, arena, pity, classKey, kills, rng)  -> objetos reales de UNA victoria: lo que cae al piso por rango de baja (kills = {normal, subelite, elite,
//        named, subjefe, jefe}; sin kills, el supuesto de la reseña de economía) + el cofre de victoria (calificación A), con la dificultad forzada
//        (diffCurrent) para que cuenten lootFactor / lootRowShift / ilvlBase / itemLvl. NO toca el inventario (devuelve los objetos).
//   equipBest(classKey)  -> equipa en cada ranura el objeto del inventario con más stat garantizado que `classKey` pueda llevar (lo que hace una persona;
//        autoEquipBest solo llena ranuras VACÍAS con piezas diseñadas para ese guardián: pensado para bots).
//   path(tierTo, arenaTo, plays, classKey, rng) -> el botín de un jugador que ganó `plays` veces cada (dificultad, arena) ANTERIOR a (tierTo, arenaTo) en el orden
//        Normal -> Pesadilla -> Infierno; queda en el inventario (save.stash, tope 24 mejores por stat) y devuelve cuántas victorias fueron.
// Por qué existe: la opción loot=N de tools/playtest/campaign.js tira SOLO el cofre (≈2 objetos por victoria); una victoria real suelta ≈12-13 (piso + cofre).
module.exports = function () {
  const DEFAULT_KILLS = { normal: 500, subelite: 15, elite: 3, named: 2, subjefe: 2, jefe: 1 };
  function run(tier, arena, pity, classKey, kills, rng) {
    rng = rng || Math.random; kills = kills || DEFAULT_KILLS;
    const keepCur = window.diffCurrent; window.diffCurrent = () => tier; const keepArena = currentArena; currentArena = arena;
    const keepRunLevel = typeof runLevel !== 'undefined' ? runLevel : 1, keepSub = typeof subjefesDefeated !== 'undefined' ? subjefesDefeated : 0;
    const items = [];
    try {
      const lb = diffItemLevelBonus();
      for (const rk in kills) {
        const e = { rank: rk === 'named' ? 'elite' : rk, eliteName: rk === 'named' ? 'x' : null };
        const src = _glSource(e); if (!src) continue;
        for (let k = 0; k < kills[rk]; k++) {
          const n = groundLootRollCount(src, rng);
          const build = src.build > 0 && buildLegendAllowed(arena) && rng() < src.build;
          for (let i = 0; i < n + (build ? 1 : 0); i++) {
            const b = build && i === n;
            const t = b ? 'legendario' : groundLootRollTier(arena, src.grade, src.hm, pity, rng, i === 0 ? src.floor : null);
            let spec = b ? { tier: t, build: true } : { tier: t };
            if (t === 'set') { const sp = _rollSetPiece(arena, ownedDesignIds(), rng, classKey); spec = sp ? { tier: t, setId: sp.setId, designId: sp.designId, type: sp.type } : { tier: 'legendario' }; }
            if (LOOT_PITY[spec.tier]) pity[spec.tier] = 0;
            const it = materializeLoot(spec, classKey, arena); if (!it) continue;
            it.lootTier = spec.tier; if (lb > 0) it.level = Math.min(ITEM_MAX_LEVEL, itemLevel(it) + lb); // igual que groundLootDrop
            it._src = rk; items.push(it);
          }
        }
      }
      runLevel = LEVEL_COUNT; subjefesDefeated = 2; save.lootPity = Object.assign({}, pity);
      const before = new Set(stashItems().map(it => it.uid));
      const L = grantEndOfRunLoot(classKey, { grade: 'A' }, true);
      Object.assign(pity, save.lootPity);
      for (const it of L.items) { it._src = 'cofre'; items.push(it); }
      save.stash = stashItems().filter(it => it && before.has(it.uid)); // el cofre ya se guardó: se saca, quien llama decide qué se queda
    } finally { window.diffCurrent = keepCur; currentArena = keepArena; runLevel = keepRunLevel; subjefesDefeated = keepSub; }
    return items;
  }
  function equipBest(classKey) {
    for (const type of EQUIP_SLOT_TYPES) {
      const cands = stashItems().filter(it => it.type === type && canEquipItem(classKey, it));
      cands.sort((a, b) => itemStat(b) - itemStat(a));
      if (cands[0]) equipItem(classKey, cands[0].uid);
    }
  }
  function path(tierTo, arenaTo, plays, classKey, rng) {
    const TIERS = ['normal', 'pesadilla', 'infierno']; let pity = {}, wins = 0; save.firstWinLoot = true;
    for (const tier of TIERS) for (const arena of CAMPAIGN_ORDER) {
      if (tier === tierTo && arena === arenaTo) return wins;
      for (let p = 0; p < plays; p++) {
        const items = run(tier, arena, pity, classKey, null, rng); wins++;
        const all = stashItems().concat(items).filter(it => canEquipItem(classKey, it));
        all.sort((a, b) => itemStat(b) - itemStat(a));
        save.stash = all.slice(0, 24); // el inventario de una persona: se queda con lo mejor (deja lugar al cofre: 30 espacios)
      }
    }
    return wins;
  }
  window.__RL = { run, equipBest, path, DEFAULT_KILLS };
};
