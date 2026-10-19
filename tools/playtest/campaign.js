// Playtest campaign: full runs (level 1 -> victory/defeat) driven by the autopilot "competent player".
// usage: node campaign.js <jobs.json> <out.jsonl> [port]   (serve the repo first: python3 -m http.server <port>)
//   job: {cls, arena, lvl, tag, progression?:[{cls,arena}...]}  (lvl<=0: keep save as is)
//        opciones de equipo: loot=N (solo cofres), gear (autoEquipBest), lootPath=P (equipo real de P victorias por arena previa), equipBest (equipa lo mejor por stat)
const { chromium } = (()=>{ try { return require('playwright'); } catch (e) { return require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright'); } })();
const fs = require('fs'); const path = require('path'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const [jobsFile, outFile, port] = [process.argv[2], process.argv[3], process.argv[4] || '8763'];
const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));
const HOOKS = () => {
  if (window.__CP) return; const CP = window.__CP = {};
  CP.reset = () => { CP.killer = null; CP.fallInfo = null; CP.falls = 0; CP.hangs = 0; CP.dmgSrc = {}; CP.items = []; CP.buffs = []; CP.levelAt = {}; CP.bossAt = null; CP.bossDeadAt = null; CP.idleMs = 0; CP.peakEnemies = 0; CP.minHpPct = 100; CP.revives = 0; CP.allyDowns = 0; CP.bigHits = []; };
  CP.reset();
  const dh = window.damageHero;
  window.damageHero = function (h, amount, src) {
    if (CP.god) amount = 0; // job.god: el equipo no recibe daño (mide ingresos/ritmo de una partida completa aunque la dificultad sea un muro)
    const hp0 = h.hp, a0 = h.alive; dh(h, amount, src);
    if (h === player) { let k = src && src.type ? src.type : (src && src.from && src.from.type ? src.from.type + '(proj)' : null);
      if (!k) { const fr = (new Error().stack || '').split('\n').slice(2, 5).map(x => (x.trim().split(' ')[1] || '?')).join('<'); k = 'fn:' + fr; }
      const lost = Math.max(0, Math.min(hp0, hp0 - h.hp)); CP.dmgSrc[k] = (CP.dmgSrc[k] || 0) + lost;
      if (amount > h.maxHp * 0.6 && CP.bigHits.length < 5) CP.bigHits.push(k + (src && src.kind ? '[' + src.kind + ']' : '') + ' ' + Math.round(amount) + '/' + Math.round(h.maxHp) + ' L' + runLevel);
      if (a0 && !h.alive) CP.killer = k + ' (hit ' + Math.round(amount) + ', hp antes ' + Math.round(hp0) + '/' + Math.round(h.maxHp) + ', nivel ' + runLevel + ')'; }
    else if (a0 && !h.alive) CP.allyDowns++;
  };
  // Abismo: colgarse del borde y caer al vacío no pasan por damageHero
  if (typeof window.abHangFall === 'function') { const hf = window.abHangFall; window.abHangFall = function (h, H) { if (h === player) { CP.falls++; CP.killer = 'caída al vacío (nivel ' + runLevel + ')';
      try { const R = CP.lastRescue; const pi = R ? abPlatAt(R.x, R.y, 0) : -1;
        CP.fallInfo = { hang: [Math.round(H.lx), Math.round(H.ly)], rescue: R ? [R.x, R.y, Math.round((runElapsedMs - R.t))] : null, botsAtHang: R ? R.bots : null, rescuePlat: pi, rescuePlatSt: pi >= 0 ? abS.p[pi].st : null, enemiesNear: enemies.filter(e => e.alive && Math.hypot(e.x - H.lx, e.y - H.ly) < 300).length,
          bots: heroes.filter(o => o !== h).map(o => ({ k: o.classKey, alive: o.alive, hang: !!o.abHang, goal: o._ctxGoal, hold: o._ctxHold, d: R ? Math.round(Math.hypot(o.x - R.x, o.y - R.y)) : null, reach: R && typeof abReachable === 'function' ? abReachable(o, R) : null, hp: Math.round(100 * o.hp / o.maxHp), x: Math.round(o.x), y: Math.round(o.y), onPlat: abPlatAt(o.x, o.y, 0) })) }; } catch (e) { CP.fallInfo = { err: String(e) }; } } return hf(h, H); }; }
  if (typeof window.abHangStart === 'function') { const hs = window.abHangStart; window.abHangStart = function (h, n) { const was = h === player && h.alive && !h.abHang; const r = hs(h, n); if (was) { CP.hangs++; const R = abS.rescue[abS.rescue.length - 1]; CP.lastRescue = R ? { x: R.x, y: R.y, t: runElapsedMs, bots: heroes.filter(o => o !== h).map(o => ({ k: o.classKey, x: Math.round(o.x), y: Math.round(o.y), alive: o.alive })) } : null; } return r; }; }
  const ai = window.addItemToInventory;
  window.addItemToInventory = function (k, item) { const r = ai(k, item); if (r) CP.items.push((item.rarity || '?') + ':' + (item.type || item.slot || '?')); return r; };
  __AP.pickBuff = function () { const c = document.querySelector('#buff-cards .buff-card'); if (c) { const n = c.querySelector('.buff-name'); CP.buffs.push(n ? n.textContent : '?'); c.click(); return true; } return false; };
};
async function runOne(page, job) {
  return page.evaluate(([job]) => {
    if (job.lvl > 0) for (const k in save.champions) { save.champions[k].level = job.lvl; const al = Math.min(10, Math.floor(job.lvl / 3)); save.champions[k].skillMastery.forEach(m => m.alloc = al); save.champions[k].ultMastery.alloc = al; }
    if (job.diff) Object.assign(DIFF, job.diff);
    // job.seed: Math.random determinista (mulberry32) para repetir una partida; el host sigue metiendo ruido de tiempo
    if (job.seed) { let s = job.seed >>> 0; Math.random = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    // job.tier ("pesadilla"|"infierno"): abre esa dificultad y las arenas anteriores a job.arena en ella, y la elige
    if (job.tier && job.tier !== 'normal') {
      save.arenasCleared = save.arenasCleared || {}; for (const k of ARENA_ORDER) save.arenasCleared[k] = true;
      diffSetSelected('normal'); // fuerza _diffSaveShape
      const ti = DIFF_TIER_ORDER.indexOf(job.tier);
      for (let i = 1; i < ti; i++) for (const k of ARENA_ORDER) save.diffCleared[DIFF_TIER_ORDER[i]][k] = true;
      for (const k of ARENA_ORDER) { if (k === job.arena) break; save.diffCleared[job.tier][k] = true; }
      diffSetSelected(job.tier);
    }
    if (job.penalty !== undefined) ARENA_FAIL_PENALTY_PCT = job.penalty;
    if (job.mods) Object.assign(ARENA_MODS[job.arena], job.mods);
    // job.loot = N: el botín de N victorias de campaña (rollLoot + materializeLoot, como tools/balance/lootsim2.js) para job.cls,
    // repartidas en orden por las arenas; sin esto un guardado de prueba juega a nivel 54 SIN equipo (más duro que un jugador real)
    if (job.loot) {
      const GR = () => { const x = Math.random(); return x < 0.12 ? 'B' : (x < 0.55 ? 'A' : (x < 0.9 ? 'S' : 'S+')); };
      let pity = {}; save.stash = save.stash || [];
      for (let v = 0; v < job.loot; v++) {
        const a = ARENA_ORDER[Math.min(ARENA_ORDER.length - 1, Math.floor(v * ARENA_ORDER.length / job.loot))];
        const r = rollLoot({ arena: a, grade: GR(), victory: true, subjefes: 2, owned: ownedDesignIds(), pity, classKey: job.cls }); pity = r.pity;
        for (const spec of r.items) { const it = materializeLoot(spec, job.cls, a); if (it.rarity === 'comun') continue; save.stash.push(it); collectionRegister(it, true); }
      }
    }
    if (job.gear) { for (const k in save.champions) if (typeof autoEquipBest === 'function') autoEquipBest(k); }
    // un jugador competente gasta sus puntos de talento (el HUD le sugiere cuál subir)
    if (job.lvl <= 0 && typeof suggestedSkillInvest === 'function') for (let g = 0; g < 60; g++) { const i = suggestedSkillInvest(job.cls); if (i === null || i === undefined || !investTalentPoint(job.cls, i)) break; }
    __CP.reset(); __CP.god = !!job.god;
    if (job.arena === 'auto') job.arena = ARENA_ORDER.find(a => !(save.arenasCleared||{})[a]) || 'infernal';
    // job.lootPath = P: el equipo REAL de un jugador que ganó P veces (1 o 2) cada arena anterior a (job.tier, job.arena) en el orden Normal -> Pesadilla -> Infierno
    // (piso + cofre, tools/balance/real-loot.js; job.loot=N tira SOLO el cofre: ~2 objetos por victoria contra ~12 de una victoria real).
    // job.equipBest = true: se equipa el objeto de más stat por ranura (autoEquipBest, de job.gear, solo llena ranuras vacías con piezas diseñadas para el guardián).
    if (job.lootPath) { __RL.path(job.tier || 'normal', job.arena, job.lootPath, job.cls); }
    if (job.equipBest) { __RL.equipBest(job.cls); }
    const lvl0 = save.champions[job.cls].level, xp0 = save.champions[job.cls].xp, gold0 = save.gold;
    __AP.start(job.cls, job.arena, 1);
    let t = 0, lastLv = 0;
    while (t < 22 * 60000) {
      const o = __AP.sim(1000); t += 1000;
      if (runLevel !== lastLv) { __CP.levelAt[runLevel] = Math.round(t / 1000); lastLv = runLevel; }
      const alive = enemies.filter(e => e.alive).length; if (alive === 0 && state === 'playing') __CP.idleMs += 1000;
      __CP.peakEnemies = Math.max(__CP.peakEnemies, alive);
      if (player.alive) __CP.minHpPct = Math.min(__CP.minHpPct, Math.round(100 * player.hp / player.maxHp));
      if (boss && __CP.bossAt === null && runLevel === LEVEL_COUNT) __CP.bossAt = Math.round(t / 1000);
      if (boss && !boss.alive && __CP.bossDeadAt === null && __CP.bossAt !== null) __CP.bossDeadAt = Math.round(t / 1000);
      if (state !== 'playing' && state !== 'buff') break;
    }
    const st = player.stats || {};
    const allyDmg = allies.reduce((s, a) => s + ((a.stats && a.stats.dmgDealt) || 0), 0);
    const top = Object.entries(__CP.dmgSrc).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + ' ' + Math.round(v));
    const res = { tag: job.tag, tier: (typeof diffCurrent === 'function' ? diffCurrent() : 'normal'), seed: job.seed || null, cls: job.cls, arena: job.arena, lvl: lvl0, result: state, reached: runLevel, secs: Math.round(t / 1000), kills,
      bossSecs: __CP.bossAt !== null ? ((__CP.bossDeadAt || Math.round(t / 1000)) - __CP.bossAt) : null, bossType: boss ? boss.type : null, bossHpLeftPct: boss && boss.alive ? Math.round(100 * boss.hp / boss.maxHp) : 0,
      dmgShare: Math.round(100 * (st.dmgDealt || 0) / Math.max(1, (st.dmgDealt || 0) + allyDmg)), casts: st.skillCasts || 0, dmgTaken: Math.round(st.dmgTaken || 0), healDone: Math.round(st.healDone || 0),
      minHpPct: __CP.minHpPct, idleSecs: Math.round(__CP.idleMs / 1000), peakEnemies: __CP.peakEnemies, allyDowns: __CP.allyDowns,
      items: __CP.items, bigHits: __CP.bigHits, killer: __CP.killer || null, falls: __CP.falls, hangs: __CP.hangs, fallInfo: __CP.fallInfo || null, buffs: __CP.buffs, levelAt: __CP.levelAt, top,
      xpGain: (save.champions[job.cls].level - lvl0) + ' lv / ' + Math.round(save.champions[job.cls].xp - xp0) + ' xp', goldGain: save.gold - gold0, apErr: __AP.err || null,
      exit: __AP.exit ? { seenS: Math.round(__AP.exit.seenAt / 1000), reachedS: __AP.exit.reachedAt === null ? null : Math.round(__AP.exit.reachedAt / 1000), holds: __AP.exit.holds } : null,
      after: { lv: save.champions[job.cls].level, totXp: totalXpForChamp(job.cls), gold: save.gold, cleared: Object.keys(save.arenasCleared || {}).length } };
    // partida que no terminó (tope de tiempo): foto del estado para diagnosticar dónde se trabó
    if (state === 'playing') {
      const R = v => Math.round(v);
      const ent = e => e ? { type: e.type, alive: e.alive, hp: R(e.hp), max: R(e.maxHp), x: R(e.x), y: R(e.y), dmgTakenMult: e.dmgTakenMult, encMult: e._encMult, stun: R(e.stunTimer || 0), rank: e.rank } : null;
      const byType = {}; for (const e of enemies) if (e.alive) byType[e.type] = (byType[e.type] || 0) + 1;
      const st = { levelTimer: R(levelTimer), levelDuration: levelDuration > 1e8 ? 'inf' : R(levelDuration), levelClearing, runEnding, bossActive,
        hold: (typeof arenaHas === 'function' && arenaHas('holdLevel')) ? !!arenaHook('holdLevel') : null,
        boss: ent(boss), champ: ent(activeChampion), byType,
        player: { x: R(player.x), y: R(player.y), walkable: (typeof arenaHas === 'function' && arenaHas('inside')) ? !!arenaHook('inside', player.x, player.y, 0) : null, alive: player.alive, hp: R(player.hp), joy: joyVec && { x: +joyVec.x.toFixed(2), y: +joyVec.y.toFixed(2) }, ctxHold: player._ctxHold },
        allies: allies.map(a => ({ k: a.classKey, alive: a.alive, x: R(a.x), y: R(a.y) })) };
      try { const ts = ctxTargets(); if (ts) st.ctx = ts.map(t => ({ id: t.id, kind: t.kind, x: R(t.x), y: R(t.y), r: t.r, prog: R(t.prog || 0), dur: t.dur, done: !!t.done })); } catch (e) {}
      if (typeof mnS !== 'undefined' && mnS && job.arena === 'minas') st.minas = { sec: mnS.sec, portal: mnS.portal && { st: mnS.portal.st, t: R(mnS.portal.t || 0) }, cb: mnS.cb && { st: mnS.cb.st } };
      if (typeof cmS !== 'undefined' && cmS && job.arena === 'ciudad') st.ciudad = { sub: cmS.sub && { st: cmS.sub.st, t: R(cmS.sub.t) }, pr: cmS.pr && { st: cmS.pr.st, act: cmS.pr.act, t: R(cmS.pr.t) }, saved: cmS.saved, lost: cmS.lost };
      res.stall = st;
    }
    // leave the run cleanly so the next job starts from a menu state
    try { if (typeof clearRunTimers === 'function') clearRunTimers(); } catch (e) {}
    state = 'menu';
    return res;
  }, [job]);
}
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  let page = null, errors = [];
  const fresh = async (seedSave) => {
    if (page) await page.context().close();
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
    await ctx.addInitScript(() => { window.__campaignMode = true; }); // campaña real (sin el modo prueba que libera todo)
    if (seedSave === 'empty') await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('__s')) { localStorage.clear(); sessionStorage.setItem('__s', '1'); } } catch (e) {} });
    page = await ctx.newPage(); errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'load', timeout: 180000 });
    for (let i = 0; i < 300; i++) { const ok = await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; }); if (ok) break; await sleep(100); }
    await page.addScriptTag({ path: path.join(__dirname, 'autopilot.js') });
    await page.evaluate(require('../fortaleza/sim-helpers.js'));
    await page.evaluate(require('../balance/real-loot.js'));
    await page.evaluate(HOOKS);
  };
  for (const job of jobs) {
    if (!job.keep) await fresh(job.empty ? 'empty' : null);
    const t0 = Date.now();
    let r; try { r = await runOne(page, job); } catch (e) { r = { tag: job.tag, cls: job.cls, arena: job.arena, crash: String(e).slice(0, 300) }; }
    r.errors = errors.slice(0, 3); r.wall = Math.round((Date.now() - t0) / 1000);
    fs.appendFileSync(outFile, JSON.stringify(r) + '\n');
    console.log(`${r.tag} ${r.cls}/${r.arena} lv${r.lvl} -> ${r.result} L${r.reached} ${r.secs}s boss=${r.bossSecs} err=${r.errors.length} wall=${r.wall}s`);
  }
  await browser.close();
})();
