// PARIDAD MECÁNICA del rework de Ilkan (campeón original que reemplazó al campeón anterior, clave legada "eren").
// Compara, contra una foto tomada del árbol ANTERIOR, que las habilidades hacen EXACTAMENTE lo mismo:
//   1) datos: clases y kit humano/coloso, ILKAN_CFG, talentos, maestrías, refuerzos, set, perfiles de apuntado;
//   2) comportamiento: 4 partidas deterministas (semilla fija, reloj virtual) con la rotación completa del kit
//      (humano -> transformación -> coloso -> definitiva II) y traza de héroe/enemigos cada 15 cuadros.
// Los nombres, textos, colores e ids visibles se descartan; las claves internas renombradas se mapean.
//
//   node tools/regression/build_site.py ... (ver tools/regression/README.md) o cualquier sitio con ?det=1
//   node tools/regression/t_ilkan_parity.js --record <urlBase> [--key eren]   # foto del árbol anterior (docs/balance/ilkan-parity-baseline.json)
//   node tools/regression/t_ilkan_parity.js <urlBase> [--key ilkan]           # compara el árbol actual contra la foto
// <urlBase> apunta a un sitio instrumentado (build_site.py), p.ej. http://127.0.0.1:8750/despues
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs');
const path = require('path');
const BASELINE = path.join(__dirname, '..', '..', 'docs', 'balance', 'ilkan-parity-baseline.json');
const args = process.argv.slice(2);
const record = args.includes('--record');
const keyArg = args.includes('--key') ? args[args.indexOf('--key') + 1] : (record ? 'eren' : 'ilkan');
const site = args.find(a => /^https?:/.test(a));
if (!site) { console.error('falta la URL base del sitio instrumentado'); process.exit(2); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------------------------------------------------------------- normalización (árbol anterior -> nombres nuevos)
const KEY_MAP = { titan: 'colossus', biteMs: 'invokeMs', retumbar: 'march', rumbling: 'finale', titanGainMult: 'colossusGainMult',
  titanHpPct: 'colossusHpPct', rumblingDmgPct: 'finaleDmgPct', isEren: 'isIlkan', isTitanForm: 'isColossusForm' };
const STR_MAP = { eren_hook: 'ilkan_lance', eren_instinct: 'ilkan_temple', eren_advance: 'ilkan_caravan', eren_titan_ult: 'ilkan_colossus_ult',
  eren_rumbling_ult: 'ilkan_finale_ult', rumblingDmgPct: 'finaleDmgPct', titan_sismo: 'colossus_slam', titan_terremoto: 'colossus_sinkhole', titan_retumbar: 'colossus_march',
  eren: 'ilkan', maniobras: 'pendon', instinto: 'duna', titan: 'coloso', rumble: 'finale', rumbleStep: 'finaleStep', rumbling: 'finaleScreen',
  hookPrep: 'hookPrep' };
const ID_PREFIX = [['er_m_man_', 'il_m_pen_'], ['er_m_ins_', 'il_m_dun_'], ['er_m_tit_', 'il_m_col_'], ['er_man_', 'il_pen_'], ['er_ins_', 'il_dun_'], ['er_tit_', 'il_col_'],
  ['er_cuchillas', 'il_hoces'], ['er_vapor', 'il_arena'], ['er_grito', 'il_silbido'], ['er_juramento', 'il_pacto'], ['er_duo', 'il_duo']];
const TEXT_KEYS = new Set(['name', 'ico', 'icon', 'desc', 'rankDesc', 'lore', 'role', 'color', 'glow', 'hudName', 'label', 'look', 'text', 'theme', 'aura', 'tint', 'origin', 'title', 'tagline', 'shortName']);
function normStr(s) {
  if (typeof s !== 'string') return s;
  for (const [a, b] of ID_PREFIX) if (s.startsWith(a)) return b + s.slice(a.length);
  if (Object.prototype.hasOwnProperty.call(STR_MAP, s)) return STR_MAP[s];
  return s.replace(/\beren(?=[A-Z_])/g, 'ilkan').replace(/\bEREN(?=_)/g, 'ILKAN').replace(/Titan/g, 'Colossus').replace(/titan/g, 'colossus').replace(/Rumbling|Rumble/g, 'Finale').replace(/\bretumbar\b/g, 'march');
}
function norm(v, key) {
  if (Array.isArray(v)) return v.map(x => norm(x));
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) {
      if (TEXT_KEYS.has(k)) continue;
      const nk = KEY_MAP[k] || normStr(k);
      o[nk] = norm(v[k], k);
    }
    return o;
  }
  if (typeof v === 'string') return TEXT_KEYS.has(key) ? undefined : normStr(v);
  return v;
}

// ---------------------------------------------------------------- 1) datos (se evalúa dentro de la página)
const EXTRACT = key => {
  const out = {};
  const CFG = typeof ILKAN_CFG !== 'undefined' ? ILKAN_CFG : EREN_CFG;
  const COL = typeof ILKAN_COLOSSUS_CLS !== 'undefined' ? ILKAN_COLOSSUS_CLS : EREN_TITAN_CLS;
  const fnSrc = f => typeof f === 'function' ? f.toString().replace(/\s+/g, '').replace(/ILKAN_CFG|EREN_CFG/g, 'CFG') : f;
  const plain = (o, d) => {
    d = d || 0;
    if (typeof o === 'function') return 'fn:' + fnSrc(o);
    if (!o || typeof o !== 'object') return o;
    if (d > 8) return null;
    if (Array.isArray(o)) return o.map(x => plain(x, d + 1));
    const r = {}; for (const k of Object.keys(o)) r[k] = plain(o[k], d + 1); return r;
  };
  out.cls = plain(CLASSES[key]);
  out.colossus = plain(COL);
  out.cfg = plain(CFG);
  const T = TALENT_TREES[key];
  const evalMods = n => { const m = []; for (let r = 1; r <= (n.maxRank || 1); r++) { try { m.push(plain(n.mods(r))); } catch (e) { m.push('ERR'); } } return m; };
  out.talents = { masteryRequirement: T.masteryRequirement,
    nodes: T.nodes.map(n => ({ id: n.id, branch: n.branch, type: n.type, maxRank: n.maxRank, cost: n.cost, requires: n.requires, mods: evalMods(n) })),
    masteries: Object.keys(T.masteries).map(k => { const M = T.masteries[k]; return { id: M.id, branch: M.branch, nodes: M.miniTree.map(n => ({ id: n.id, maxRank: n.maxRank, cost: n.cost, requires: n.requires, exclusiveWith: n.exclusiveWith || null, mods: evalMods(n) })) }; }) };
  out.synergies = plain(TALENT_SYNERGIES[key]);
  out.boons = BOONS.filter(b => b.champ === key).map(b => ({ id: b.id, skill: b.skill, duo: b.duo || null, fx: plain(b.fx), test: b.test, rarity: b.rarity || null }));
  const S = SET_DB.legion;
  out.set = { champion: S.champion, pieces: Object.keys(S.pieces), thresholds: S.thresholds.map(t => ({ count: t.count, mods: t.mods().length, transform: t.transform ? 'yes' : null })), rarity: S.rarity };
  const TR = CHAMPION_SET_TRANSFORMS.legion;
  out.setTransform = { skill: TR.skill, test: TR.test, fx: plain(TR.fx) };
  const kinds = [...CLASSES[key].skills, CLASSES[key].ultimate, ...COL.skills, COL.ultimate].map(s => s.kind);
  out.aim = {}; for (const k of kinds) out.aim[k] = AIM_PROFILES[k] ? plain(AIM_PROFILES[k]) : null;
  out.entryBalance = CHAMPION_ENTRY_BALANCE.filter(e => e.key === key).map(e => ({ role: e.role, existing: e.existing, budgetAfter: e.budgetAfter }));
  out.resource = { ultMax: 100, price: CHAMPION_CATALOG.find(c => c.id === key).priceGold };
  return out;
};

// ---------------------------------------------------------------- 2) comportamiento (partidas deterministas)
const PHASE_MAP = { rumble: 'finale' };
const SCENARIOS = [
  // rotación del kit humano y transformación (con el kit del coloso, incluido Los Tres Pasos)
  { name: 'kit_completo_bosque', arena: 'bosque', level: 3, frames: 1500, script: {
    0: 'spawnRing()', 20: 'basicHeld=true;__T.setJoy(1,0)', 60: 'cast(0)', 140: 'cast(1)', 200: 'cast(2)', 260: 'cast(0)', 330: 'fillUlt();ult()',
    520: 'castC(0)', 600: 'castC(1)', 760: 'castC(2)', 900: 'basicHeld=true', 960: 'forceFinale();ult()', 1300: 'basicHeld=false' } },
  // vida baja: pasiva, ganancia de Tormenta, Piel de Duna
  { name: 'pasiva_vida_baja', arena: 'hielo', level: 2, frames: 900, script: { 0: 'spawnRing()', 10: 'lowHp()', 30: 'basicHeld=true;__T.setJoy(0,1)', 80: 'cast(1)', 200: 'cast(2)', 300: 'cast(0)', 420: 'hurt(30)', 600: 'hurt(40)' } },
  // jefe: reglas por rango (sin empuje) y Los Tres Pasos exigen condición
  { name: 'jefe_tres_pasos', arena: 'laberinto', level: 10, frames: 1800, script: {
    0: 'godMode()', 20: 'spawnRing()', 40: '__T.startBoss()', 100: 'basicHeld=true;__T.setJoy(1,0)', 200: 'cast(0)', 280: 'fillUlt();ult()', 520: 'castC(0)', 680: 'castC(1)', 860: 'castC(2)', 1000: 'forceFinale();ult()', 1500: 'basicHeld=false' } },
  // cooperativo local con aliados bots: la IA de Ilkan usa el kit sola
  { name: 'bot_ia_ilkan', arena: 'acuatica', level: 6, frames: 2400, bot: true, script: { 0: 'spawnRing();godOthers()', 300: 'fillUlt()', 700: 'spawnRing()', 720: 'fillUlt()', 1300: 'spawnRing()', 1320: 'fillUlt()', 1900: 'spawnRing()', 1920: 'fillUlt()' } },
];
const HELPERS = key => `
  const KEY = ${JSON.stringify(key)};
  window.S = () => heroes.find(h => h.classKey === KEY) || player;
  window.spawnRing = () => { for (let i = 0; i < 12; i++) { const id = __T.spawn(i % 5 === 0 ? 'dama_bosque' : 'duende_bosque'); const a = i / 12 * Math.PI * 2, r = 120 + (i % 3) * 70; __T.place(id, Math.cos(a) * r, Math.sin(a) * r); window.__T.tank(id); } };
  window.cast = i => { const h = S(); h.energy = 999; h.cds[i] = 0; castAbility(h, h.cls.skills[i], false, i); };
  window.castC = window.cast;
  window.fillUlt = () => { const h = S(); h.ultCharge = h.ultMax; h.ultCd = 0; };
  window.ult = () => { const h = S(); castAbility(h, h.cls.ultimate, true, 3); };
  window.forceFinale = () => { const h = S(); h.ultCharge = h.ultMax; h.ultCd = 0; const a = heroes.find(o => o !== h); if (a && !(typeof boss !== 'undefined' && boss && boss.alive)) { a.hp = 0; a.alive = false; } };
  window.lowHp = () => { const h = S(); h.hp = h.maxHp * 0.2; };
  window.hurt = n => { damageHero(S(), n); };
  window.godMode = () => { for (const h of heroes) h.hp = h.maxHp = 1e9; };
  window.godOthers = () => { const me = S(); for (const h of heroes) if (h !== me) h.hp = h.maxHp = 1e9; };
`;
const TRACE = () => {
  const r = x => typeof x === 'number' ? +x.toFixed(4) : x;
  const pfx = KEY_PREFIX, P = heroes.find(h => h.classKey === KEY_PREFIX) || player;
  const hv = {};
  for (const k of Object.keys(P)) {
    if (!k.startsWith(pfx) || k.startsWith(pfx + 'Anchor')) continue;
    const v = P[k];
    if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string' || v === null) hv[k.slice(pfx.length)] = typeof v === 'number' ? r(v) : v;
  }
  return { x: r(P.x), y: r(P.y), hp: r(P.hp), maxHp: r(P.maxHp), en: r(P.energy), cds: P.cds.map(r), ult: r(P.ultCharge), ultCd: r(P.ultCd),
    radius: r(P.radius), def: r(P.def), alive: P.alive, hv,
    enemies: enemies.map(e => [r(e.hp), e.alive ? 1 : 0, Math.round(e.x), Math.round(e.y)]), kills: kills, fx: champFx.length, boss: (typeof boss !== 'undefined' && boss) ? r(boss.hp) : null };
};

async function runScenario(browser, sc, key) {
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 560 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // el MISMO guardado "viejo" (con la clave anterior) alimenta ambos árboles: el actual lo migra al cargar
  const save = { champions: {}, gold: 500, gems: 0, playtestV1Bonus: true, campaignResetV1: true, campaignResetV2: true, campaignResetV3: true, testStageV1: true, starterChosen: true, divineArenaUnlocked: true, itemSchemaV: 2,
    arenasCleared: { bosque: true, acuatica: true, fortaleza: true, micelial: true, hielo: true, laberinto: true, infernal: true }, relics: { hp: 0, dmg: 0, def: 0, vel: 0 } };
  for (const c of ['tanque', 'guerrero', 'mago', 'soporte', 'eren']) save.champions[c] = { level: 20, xp: 0, talentPoints: 0, unlocked: true, skillMastery: [0, 1, 2].map(() => ({ useXp: 0, useLvl: 1, alloc: 4 })), ultMastery: { useXp: 0, useLvl: 1, alloc: 4 }, inventory: [], equipment: {} };
  await ctx.addInitScript(() => { window.__campaignMode = true; });
  await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('__seeded')) { localStorage.setItem('laHordaSave_v1', s); sessionStorage.setItem('__seeded', '1'); } } catch (e) {} }, JSON.stringify(save));
  await page.goto(`${site}/index.html?det=1&seed=777`, { waitUntil: 'load', timeout: 120000 });
  for (let t = 0; t < 600; t++) { const st = await page.evaluate(() => window.__imgState && window.__imgState()); if (st && st.done === st.total && st.total > 0) break; await sleep(150); }
  await page.evaluate(code => window.__T.ev(code), HELPERS(key));
  await page.evaluate(k => { window.KEY_PREFIX = k; }, key);
  // equipo
  const startCode = sc.bot ? `lobbyAllies = [${JSON.stringify(key)}, 'soporte', 'mago']; __T.startAs('tanque', ${JSON.stringify(sc.arena)}, ${sc.level})` : `__T.startAs(${JSON.stringify(key)}, ${JSON.stringify(sc.arena)}, ${sc.level})`;
  await page.evaluate(code => window.__T.ev(code), startCode);
  const trace = [], marks = new Set(Object.keys(sc.script).map(Number));
  let f = 0;
  while (f < sc.frames) {
    if (marks.has(f)) await page.evaluate(code => window.__T.ev(code), sc.script[f]);
    let next = sc.frames;
    for (const m of marks) if (m > f && m < next) next = m;
    const nd = Math.ceil((f + 1) / 15) * 15; if (nd < next) next = nd;
    await page.evaluate(n => window.__step(n), next - f);
    f = next;
    if (f % 15 === 0) trace.push([f, await page.evaluate(TRACE)]);
    const st = await page.evaluate(() => window.__T.state());
    if (st === 'buff') await page.evaluate(() => { const c = document.querySelector('#buff-cards .buff-card'); if (c) c.click(); });
    else if (st !== 'playing') break;
  }
  const errs = (await page.evaluate(() => window.__errors.slice())).concat(errors);
  await ctx.close();
  return { name: sc.name, frames: f, trace, errors: errs };
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  const result = { key: keyArg, data: null, runs: {} };
  // datos
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage();
    await page.goto(`${site}/index.html?det=1&seed=1`, { waitUntil: 'load', timeout: 120000 });
    for (let t = 0; t < 600; t++) { const ok = await page.evaluate(() => typeof CLASSES !== 'undefined' && typeof BOONS !== 'undefined' && typeof CHAMPION_ENTRY_BALANCE !== 'undefined'); if (ok) break; await sleep(150); }
    await sleep(500);
    result.data = await page.evaluate(EXTRACT, keyArg);
    await ctx.close();
  }
  // comportamiento
  for (const sc of SCENARIOS) {
    const t0 = Date.now();
    result.runs[sc.name] = await runScenario(browser, sc, keyArg);
    console.log(`  ${sc.name}: ${result.runs[sc.name].trace.length} muestras, ${result.runs[sc.name].errors.length} errores, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();
  const normalized = { data: norm(result.data), runs: {} };
  const normHv = hv => { const o = {}; for (const k of Object.keys(hv).sort()) o[normStr(k.replace(/Titan/g, 'Colossus').replace(/Rumbling|Rumble/g, 'Finale'))] = (typeof hv[k] === 'string') ? (PHASE_MAP[hv[k]] || normStr(hv[k])) : hv[k]; return o; };
  for (const [n, r] of Object.entries(result.runs)) normalized.runs[n] = { frames: r.frames, errors: r.errors, trace: r.trace.map(([f, t]) => [f, Object.assign({}, t, { hv: normHv(t.hv) })]) };
  if (record) {
    fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
    fs.writeFileSync(BASELINE, JSON.stringify(normalized));
    console.log('foto del árbol anterior escrita en', path.relative(process.cwd(), BASELINE));
    return;
  }
  const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const diffs = [];
  const cmp = (a, b, p) => {
    if (JSON.stringify(a) === JSON.stringify(b)) return;
    if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) cmp(a[k], b[k], p + '.' + k);
    } else if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) a.forEach((x, i) => cmp(x, b[i], p + '[' + i + ']'));
    else diffs.push(p + ': antes=' + JSON.stringify(a).slice(0, 90) + ' ahora=' + JSON.stringify(b).slice(0, 90));
  };
  cmp(base.data, normalized.data, 'data');
  const dataDiffs = diffs.length;
  for (const n of Object.keys(base.runs)) cmp(base.runs[n].trace, (normalized.runs[n] || {}).trace, 'run.' + n);
  const total = Object.values(base.runs).reduce((s, r) => s + r.trace.length, 0);
  const errCount = Object.values(normalized.runs).reduce((s, r) => s + r.errors.length, 0);
  console.log(`datos: ${dataDiffs ? 'DIFIEREN ' + dataDiffs : 'idénticos'} · trazas: ${diffs.length - dataDiffs ? 'DIFIEREN ' + (diffs.length - dataDiffs) : 'idénticas'} (${total} muestras, ${Object.keys(base.runs).length} partidas) · errores de página: ${errCount}`);
  for (const d of diffs.slice(0, 25)) console.log('  ' + d);
  process.exit(diffs.length || errCount ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
