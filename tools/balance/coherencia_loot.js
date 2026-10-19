// COHERENCIA DE BOTÍN (herramienta de desarrollo): qué EQUIPO dropea realmente una victoria en cada arena y dificultad.
// Sin partidas: Monte Carlo sobre el código REAL (rollLoot + groundLootRollTier + materializeLoot + grantEndOfRunLoot) en Chromium,
// con la dificultad forzada (diffCurrent) y las bajas por rango de una partida (RUNS=runs.jsonl de tools/balance/campaign_runs.js;
// sin RUNS, las del supuesto de la reseña de economía). Mide, por victoria: objetos, rareza, piezas de set, nivel de objeto (ilvl),
// nivel de Gemas con que cae y el STAT garantizado real (itemStat) relativo a un Muy Raro de ilvl 1 / nivel 1 (=1,00).
// "Mejor por ranura en 2 partidas" = el equipo que se queda un jugador que juega esa arena 2 veces y se equipa lo mejor (por stat).
//   (python3 -m http.server 8931 &)  GAME_URL=http://127.0.0.1:8931/index.html [RUNS=runs.jsonl] [N=200] [OUT=loot.json] node tools/balance/coherencia_loot.js
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright');
const fs = require('fs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const N = +(process.env.N || 200);
const RUNS = {};
if (process.env.RUNS) for (const f of process.env.RUNS.split(',')) for (const l of fs.readFileSync(f, 'utf8').split('\n')) { try { const r = JSON.parse(l.trim()); if (r.arena && r.kills) RUNS[(r.tier || 'normal') + ':' + r.arena] = r; } catch (e) {} }
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 844, height: 390 } })).newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { window.__campaignMode = true; });
  page.setDefaultTimeout(0);
  await page.goto(process.env.GAME_URL || 'http://127.0.0.1:8931/index.html', { waitUntil: 'load', timeout: 300000 });
  for (let i = 0; i < 1200; i++) { const ok = await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; }); if (ok) break; await sleep(100); }
  await page.evaluate(require('./real-loot.js'));
  const out = await page.evaluate(([N, RUNS, TIERCFG]) => {
    loop = function () {};
    for (const t in TIERCFG) Object.assign(DIFF_TIERS[t], TIERCFG[t]);   // TIERCFG='{"pesadilla":{"ilvlBase":8}}': probar tablas sin editar el código
    let seed = 20261019; const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    Math.random = rng;
    const DEFAULT_KILLS = __RL.DEFAULT_KILLS;
    const CLS = 'guerrero';
    const SLOTS = EQUIP_SLOT_TYPES.slice();
    const REF = t => RARITY_VALUES[t].muyraro;           // 1,00 = Muy Raro, ilvl 1, nivel 1, roll medio
    const rel = it => itemStat(it) / REF(it.type);
    const killsOf = (tier, arena) => {
      const r = RUNS[tier + ':' + arena]; if (!r) return DEFAULT_KILLS;
      const k = Object.assign({}, r.kills); k.named = r.named || 0; k.elite = k.elite || 0; return k;
    };
    const runLoot = (tier, arena, pity) => __RL.run(tier, arena, pity, CLS, killsOf(tier, arena), rng);
    const r2 = x => Math.round(x * 100) / 100;
    const res = { n: N, tiers: {} };
    save.firstWinLoot = true; save.stash = [];
    for (const tier of ['normal', 'pesadilla', 'infierno']) {
      res.tiers[tier] = {};
      for (const arena of CAMPAIGN_ORDER) {
        let pity = {}, total = 0, cnt = {}, setP = 0, setMine = 0, ilvl = 0, lvl = 0, relSum = 0, bestSum = 0, best2Sum = 0, hi = 0, rareUp = 0, mr = 0, legend = 0;
        const runsAll = [];
        for (let r = 0; r < N; r++) { runsAll.push(runLoot(tier, arena, pity)); save.stash = []; }
        for (let r = 0; r < N; r++) {
          const items = runsAll[r];
          const bestSlot = s => Math.max(0, ...items.filter(i => i.type === s).map(rel));
          bestSum += SLOTS.reduce((a, s) => a + bestSlot(s), 0) / SLOTS.length;
          const other = runsAll[(r + 1) % N]; const both = items.concat(other);
          best2Sum += SLOTS.reduce((a, s) => a + Math.max(0, ...both.filter(i => i.type === s).map(rel)), 0) / SLOTS.length;
          for (const it of items) {
            const t = itemTier(it); cnt[t] = (cnt[t] || 0) + 1; total++;
            if (t === 'set') { setP++; if (it.champion === CLS || (SET_DB[it.set] && SET_DB[it.set].champion === CLS)) setMine++; }
            if ((TIER_ORDER[t] || 0) >= TIER_ORDER.legendario) legend++;
            if ((TIER_ORDER[t] || 0) >= TIER_ORDER.muyraro) mr++;
            ilvl += itemIlvl(it); lvl += itemLevel(it); relSum += rel(it);
          }
        }
        const pct = {}; for (const t in cnt) pct[t] = r2(cnt[t] / total * 100);
        res.tiers[tier][arena] = { n: campaignNumber(arena), objetos: r2(total / N), pct, muyRaroOMas: r2(mr / N), legendarioOMas: r2(legend / N), setPorPartida: r2(setP / N), setPropioPorPartida: r2(setMine / N),
          ilvl: r2(ilvl / total), nivelGemas: r2(lvl / total), statMedio: r2(relSum / total), mejorPorRanura1: r2(bestSum / N), mejorPorRanura2: r2(best2Sum / N), kills: killsOf(tier, arena) };
      }
    }
    // ---- CARRERA de un jugador típico: gana cada arena PLAYS veces (en el orden Normal -> Pesadilla -> Infierno), se queda con el mejor stat por ranura ----
    const PLAYS = 2, CAREERS = Math.max(20, Math.round(N / 2));
    const steps = []; for (const tier of ['normal', 'pesadilla', 'infierno']) for (const arena of CAMPAIGN_ORDER) steps.push([tier, arena]);
    const agg = steps.map(() => ({ enter: 0, after1: 0, after2: 0, up1: 0, up2: 0, hiUp: 0 }));
    for (let c = 0; c < CAREERS; c++) {
      const held = {}; SLOTS.forEach(sl => held[sl] = 0); let pity = {}; save.firstWinLoot = true; save.stash = [];
      const GI = () => SLOTS.reduce((a, sl) => a + held[sl], 0) / SLOTS.length;
      steps.forEach(([tier, arena], si) => {
        agg[si].enter += GI();
        for (let p = 1; p <= PLAYS; p++) {
          const items = runLoot(tier, arena, pity); save.stash = [];
          let ups = 0, hi = 0;
          for (const sl of SLOTS) {
            const best = items.filter(i => i.type === sl).sort((a, b) => rel(b) - rel(a))[0];
            if (best && rel(best) > held[sl] * 1.03) { ups++; if ((TIER_ORDER[itemTier(best)] || 0) >= TIER_ORDER.legendario) hi++; held[sl] = rel(best); }
          }
          if (p === 1) { agg[si].after1 += GI(); agg[si].up1 += ups; agg[si].hiUp += hi; } else { agg[si].after2 += GI(); agg[si].up2 += ups; }
        }
      });
    }
    res.carrera = steps.map(([tier, arena], si) => ({ tier, arena, n: campaignNumber(arena), poderAlEntrar: r2(agg[si].enter / CAREERS), tras1: r2(agg[si].after1 / CAREERS), tras2: r2(agg[si].after2 / CAREERS),
      mejorasEn1ra: r2(agg[si].up1 / CAREERS), mejorasEn2da: r2(agg[si].up2 / CAREERS), mejorasLegendarias1ra: r2(agg[si].hiUp / CAREERS) }));
    res.careers = CAREERS; res.plays = PLAYS;
    // ---- ¿Qué equipo da la opción loot=N de tools/playtest/campaign.js? (SOLO el cofre, N victorias repartidas por las 10 arenas, sin Comunes) ----
    // contra el de N victorias reales (piso + cofre) en el mismo orden; mismo criterio de "mejor stat por ranura"
    res.lootN = {};
    const GR = () => { const x = rng(); return x < 0.12 ? 'B' : (x < 0.55 ? 'A' : (x < 0.9 ? 'S' : 'S+')); };
    for (const tier of ['normal', 'pesadilla']) for (const NV of [8, 16, 30]) {
      let giChest = 0, giReal = 0, itemsChest = 0, itemsReal = 0; const R = 12;
      for (let c = 0; c < R; c++) {
        const heldC = {}, heldR = {}; SLOTS.forEach(sl => { heldC[sl] = 0; heldR[sl] = 0; }); let pity = {}, pityR = {};
        window.diffCurrent = () => tier;
        for (let v = 0; v < NV; v++) {
          const a = CAMPAIGN_ORDER[Math.min(CAMPAIGN_ORDER.length - 1, Math.floor(v * CAMPAIGN_ORDER.length / NV))];
          const r = rollLoot({ arena: a, grade: GR(), victory: true, subjefes: 2, owned: new Set(), pity, classKey: CLS }); pity = r.pity;
          for (const spec of r.items) { const it = materializeLoot(spec, CLS, a); if (it.rarity === 'comun') continue; itemsChest++; heldC[it.type] = Math.max(heldC[it.type], rel(it)); }
          const items = __RL.run(tier, a, pityR, CLS, killsOf(tier, a), rng); itemsReal += items.length; save.stash = [];
          for (const it of items) heldR[it.type] = Math.max(heldR[it.type], rel(it));
        }
        giChest += SLOTS.reduce((s, sl) => s + heldC[sl], 0) / SLOTS.length; giReal += SLOTS.reduce((s, sl) => s + heldR[sl], 0) / SLOTS.length;
      }
      res.lootN[tier + ':' + NV] = { soloCofre: r2(giChest / R), real: r2(giReal / R), objetosCofre: r2(itemsChest / R), objetosReal: r2(itemsReal / R) };
    }
    return res;
  }, [N, RUNS, process.env.TIERCFG ? JSON.parse(process.env.TIERCFG) : {}]);
  out.errors = errors.slice(0, 3);
  const s = JSON.stringify(out, null, 1);
  if (process.env.OUT) fs.writeFileSync(process.env.OUT, s); else console.log(s);
  await browser.close();
})();
