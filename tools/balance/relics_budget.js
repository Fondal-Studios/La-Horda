'use strict';
/* PRESUPUESTO DE PODER DE LAS RELIQUIAS DE LA HORDA (sin navegador; corre en CI en segundos).
 * Carga js/data/horde-relics.js y js/systems/horde-relics.js en un contexto aislado (con los globales mínimos) y comprueba:
 *   1. datos: 24 reliquias, ids únicos, etiquetas/rarezas válidas, textos fijos (sin números armados), topes por rareza;
 *   2. determinismo: la oferta es una función pura de (semilla, ronda, lo que tienen los humanos) y NO usa Math.random;
 *   3. presupuesto: ninguna build (al azar ni la mejor que encuentra una búsqueda) pasa de los topes de la capa ni de los puntos
 *      de poder; el "índice de daño" de la mejor build queda por debajo del de DOS refuerzos de la Horda (1,20 x 1,20 = 1,44);
 *   4. economía: el código de las reliquias no toca oro, XP, gemas, Brasas, pociones ni botín;
 *   5. alcance: todo efecto cuelga de endlessOn() (sin efecto fuera de la Horda).
 *   node tools/balance/relics_budget.js [--json]
 */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.resolve(__dirname, '../..');
const dataSrc = fs.readFileSync(path.join(ROOT, 'js/data/horde-relics.js'), 'utf8'), sysSrc = fs.readFileSync(path.join(ROOT, 'js/systems/horde-relics.js'), 'utf8');
let fails = 0;
const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 300))); if (!c) fails++; };

const sandbox = { console, Math, Object, Array, JSON, Number, String, Map, Set, WeakMap, Error, parseInt,
  window: { addEventListener() {} }, document: {}, state: 'playing', heroes: [], enemies: [], runElapsedMs: 0,
  boonParseOpt: () => null, buffOptHTML: () => '', buffOptClass: () => '', buffOptName: () => '', buffApplyOpt: () => false,
  damageEnemy() {}, killEnemy() {}, skillEvoOnCast() {}, netIsGuest: () => false, endlessOn: () => true };
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox, { filename: 'horde-relics.data.js' });
vm.runInContext(sysSrc, sandbox, { filename: 'horde-relics.sys.js' });
const get = n => vm.runInContext(n, sandbox);
const CFG = get('HRELIC_CFG'), R = get('HRELICS'), TAGS = get('HRELIC_TAGS'), META = get('HRELIC_RARITY_META');
const canTake = get('hrelCanTake'), layerOf = get('hrelLayerOf'), build = get('hrelBuildOffer'), power = get('hrelPower'), total = get('hrelTotal'), capOf = get('hrelCapOf');

// 1. datos
const ids = new Set(R.map(r => r.id));
ok(R.length === 24 && ids.size === 24, 'pool de 24 reliquias con ids únicos', R.length);
ok(R.every(r => TAGS[r.tag] && r.r >= 0 && r.r <= 2 && r.name && r.desc && (r.L || r.fx)), 'cada reliquia tiene etiqueta, rareza válida, nombre, descripción y efecto');
ok(Object.keys(TAGS).every(t => R.filter(r => r.tag === t).length === 3 && [0, 1, 2].every(k => R.some(r => r.tag === t && r.r === k))), 'cada etiqueta tiene una común, una rara y una épica');
ok(R.every(r => !/\$\{|\+ *[A-Za-z_]/.test(r.name + r.desc)), 'textos fijos (traducibles por entrada)');
ok(CFG.stackCap.comun === 3 && CFG.stackCap.rara === 2 && CFG.stackCap.epica === 1, 'topes de apilado por rareza: 3 / 2 / 1');
ok(META.length === 3 && Object.keys(TAGS).every(t => TAGS[t].icon), 'rarezas y un ícono pixel por etiqueta');

// 2. determinismo
let rnd = 0; const realRandom = sandbox.Math.random; sandbox.Math.random = () => { rnd++; return 0.5; };
let same = true, spread = new Set();
for (let s = 1; s <= 2000; s++) { const m = [{ brasa_viva: s % 4 }, {}]; const a = build(s, 1 + s % 40, m), b = build(s, 1 + s % 40, m); if (a.join() !== b.join()) same = false; spread.add(a.join()); }
sandbox.Math.random = realRandom;
ok(same && rnd === 0, 'la oferta es pura: misma entrada = misma salida y no consume Math.random', { rnd });
ok(spread.size > 300, 'la oferta varía con la semilla y la ronda', spread.size);

// 3. presupuesto
function rngOf(seed) { let a = seed >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
// índice de daño: daño x crítico esperado x (ataque básico ^0,5, porque solo afecta a los básicos) respecto de la partida sin reliquias (crítico base 4%, x1,8)
const idx = L => L.dmgMult * (1 + (0.04 + L.critChance) * (1.8 + L.critMult - 1)) / (1 + 0.04 * 0.8) * Math.sqrt(L.atkSpeedMult) * (1 + 0.15 * (L.eliteDmgMult - 1) + 0.1 * L.executeBonus);
let maxPow = 0, maxTot = 0, viol = 0, best = { v: 0 };
for (let s = 1; s <= 3000; s++) {
  const rng = rngOf(s), m = {}; let g = 0;
  while (g++ < 100) { const c = R.filter(r => canTake(m, r.id)); if (!c.length) break; const r = c[(rng() * c.length) | 0]; m[r.id] = (m[r.id] | 0) + 1; }
  const L = layerOf(m); maxPow = Math.max(maxPow, power(m)); maxTot = Math.max(maxTot, total(m));
  for (const k in CFG.layerCap) if (L[k] > CFG.layerCap[k][1] + 1e-9 || L[k] < CFG.layerCap[k][0] - 1e-9) viol++;
  if (power(m) > CFG.budget || total(m) > CFG.maxTotalStacks) viol++;
  const v = idx(L); if (v > best.v) best = { v, m: Object.assign({}, m) };
}
// escalada de la mejor build aleatoria (cambia una reliquia por otra mientras mejore el índice)
for (let it = 0; it < 4000; it++) {
  const m = Object.assign({}, best.m), ks = Object.keys(m), rng = rngOf(900000 + it);
  const drop = ks[(rng() * ks.length) | 0]; if (--m[drop] <= 0) delete m[drop];
  for (let g = 0; g < 3; g++) { const c = R.filter(r => canTake(m, r.id)); if (!c.length) break; const r = c[(rng() * c.length) | 0]; m[r.id] = (m[r.id] | 0) + 1; }
  const v = idx(layerOf(m)); if (v > best.v) best = { v, m };
}
const allMax = {}; R.forEach(r => { allMax[r.id] = capOf(r); });
const idxAll = idx(layerOf(allMax)), BEST_LIMIT = 1.44;
ok(viol === 0 && maxPow <= CFG.budget && maxTot <= CFG.maxTotalStacks, 'ninguna build rompe topes de la capa, de poder ni de cantidad (3000 al azar)', { viol, maxPow, maxTot });
ok(best.v <= BEST_LIMIT, `índice de daño de la mejor build (${best.v.toFixed(3)}) <= ${BEST_LIMIT} (dos refuerzos de la Horda valen 1,44; ver HORDA_MEJORAS.md)`, best);
ok(idxAll <= 1.75, `incluso todas las reliquias a tope (sin presupuesto) quedan topadas por la capa (índice ${idxAll.toFixed(3)} <= 1,75)`);
ok(CFG.layerCap.dmgMult[1] <= 1.30 && CFG.layerCap.hpMult[1] <= 1.25 && CFG.layerCap.critChance[1] <= 0.15, 'topes de la capa dentro de lo acordado (daño <= +30%, vida <= +25%, crítico <= +15 pts)');
ok(CFG.extraDmgPerSec <= 1.2, 'techo de daño extra por segundo de los efectos con disparo <= 1,2 x daño base', CFG.extraDmgPerSec);
const layerKeys = new Set(); R.forEach(r => Object.keys(r.L || {}).forEach(k => layerKeys.add(k))); Object.values(TAGS).forEach(t => Object.keys(t.L2 || {}).concat(Object.keys(t.L4 || {})).forEach(k => layerKeys.add(k)));
ok([...layerKeys].every(k => k in CFG.layerCap), 'toda clave de la capa tiene tope', [...layerKeys].filter(k => !(k in CFG.layerCap)));

// 4. economía y 5. alcance (análisis del código fuente)
const code = sysSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const forbidden = ['goldMult', 'xpMult', 'potionRateMult', 'grantGold', 'grantXp', 'save.gold', 'save.gems', 'save.xp', 'addItemToInventory', 'endlessRollItem', 'materializeLoot', 'lootTier', 'dropPotion', 'groundLoot', 'persist(', 'save.embers', 'save.brasas'];
const hits = forbidden.filter(f => code.includes(f) || dataSrc.replace(/\/\*[\s\S]*?\*\//g, '').includes(f));
ok(hits.length === 0, 'el código de las reliquias no toca oro, XP, gemas, Brasas, pociones ni botín', hits);
ok(/function hrelGrant\(h, id\)\{[^}]*!hrelOn\(\)/.test(code) && /function hrelUpdate\(dt\)\{\s*if\(!hrelOn\(\)/.test(code), 'elegir y los efectos periódicos exigen estar en la Horda (hrelOn)');
ok(/hr = \(h && h\.hrel && e && hrelOn\(\)\)/.test(code) && /hrelOn\(\) && !netIsGuest\(\)\) hrelAs\(src/.test(code) && /hr && hrelOn\(\) && !netIsGuest\(\) && caster\.alive/.test(code), 'los ganchos de daño, muerte y lanzamiento exigen la Horda (y no corren en el invitado)');

if (process.argv.includes('--json')) console.log(JSON.stringify({ maxPow, maxTot, bestIndex: +best.v.toFixed(3), allMaxIndex: +idxAll.toFixed(3), bestBuild: best.m, bestLayer: layerOf(best.m) }, null, 1));
else console.log(`\nMejor build hallada: índice ${best.v.toFixed(3)} · poder ${power(best.m)}/${CFG.budget} · ${total(best.m)} niveles · ${JSON.stringify(best.m)}`);
console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK');
process.exit(fails ? 1 : 0);
