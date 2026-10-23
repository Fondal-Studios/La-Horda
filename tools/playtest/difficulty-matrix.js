// Matriz de dificultad por arena (docs/economy/DIFICULTAD_GRUPO1.md). Genera listas de trabajos para tools/playtest/campaign.js y resume resultados.
//   node tools/playtest/difficulty-matrix.js gen <spec.json> <dirSalida> [shards=2] [hechos.jsonl ...]   -> jobs_0.json ... (reparto alternado)
//   node tools/playtest/difficulty-matrix.js agg <a.jsonl> [b.jsonl ...]              -> tabla victorias/intentos por casilla con IC de Wilson 95 %
// spec: { label, arenas:[..], tier:"normal"|"pesadilla"|"infierno", profiles:["aprendiz","ocasional","habitual","competente"], classes:[..], n:8, seed0:1000,
//         lvlAdd:0, lvl:"arena"|54, loot:"seq"|N|"pos", mods:{arena:{...}} }
//   por defecto lootPath=1 + equipBest (equipo real de haber ganado una vez cada arena anterior, Normal -> Pesadilla -> Infierno); spec.loot=N es el método viejo (solo cofres).
const fs = require('fs'), path = require('path');
const PROFILES = { aprendiz: { skill: 0.45, reaction: 650 }, ocasional: { skill: 0.7, reaction: 400 }, habitual: { skill: 0.9, reaction: 220 }, competente: { skill: 0.85, reaction: 260 } };
const CAMPAIGN = ['ciudad', 'fortaleza', 'bosque', 'micelial', 'hielo', 'acuatica', 'laberinto', 'abismo', 'minas', 'infernal'];
function wilson(k, n) { if (!n) return [0, 1]; const z = 1.96, p = k / n, d = 1 + z * z / n, c = p + z * z / (2 * n), m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return [Math.max(0, (c - m) / d), Math.min(1, (c + m) / d)]; }
function gen(spec, outDir, shards, doneFiles) {
  // doneFiles: resultados ya obtenidos (jsonl); sus trabajos (tag+semilla) no se repiten, para retomar una corrida cortada
  const done = new Set((doneFiles || []).flatMap(f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => { try { const r = JSON.parse(l); return r.tag + '#' + r.seed; } catch (e) { return ''; } }) : []));
  const jobs = [];
  for (let i = 0; i < spec.n; i++) for (const arena of spec.arenas) for (const profile of spec.profiles) {
    const cls = spec.classes[(i + CAMPAIGN.indexOf(arena)) % spec.classes.length], pr = PROFILES[profile];
    const j = { tag: [spec.label, spec.tier, arena, profile].join('|'), cls, arena, tier: spec.tier, lvl: spec.lvlByArena && spec.lvlByArena[arena] !== undefined ? spec.lvlByArena[arena] : (spec.lvl === undefined ? 'arena' : spec.lvl), lvlAdd: spec.lvlAdd || 0, skill: pr.skill, reaction: pr.reaction,
      seed: (spec.seed0 || 1000) + 7 * i + CAMPAIGN.indexOf(arena) + 101 * Object.keys(PROFILES).indexOf(profile), gear: true };
    // equipo REAL (tools/balance/real-loot.js): lootPath = victorias por cada arena previa (1 por defecto), equipBest = equipa lo mejor por ranura. spec.loot=N usa el cofre suelto (método viejo, casi desnudo)
    if (spec.loot !== undefined) { if (spec.loot > 0) { j.loot = spec.loot; j.lootSeq = true; } } else { j.lootPath = spec.lootPath || 1; j.equipBest = true; }
    if (spec.mods && spec.mods[arena]) j.mods = spec.mods[arena];
    if (!done.has(j.tag + '#' + j.seed)) jobs.push(j);
  }
  fs.mkdirSync(outDir, { recursive: true });
  for (let s = 0; s < shards; s++) fs.writeFileSync(path.join(outDir, `jobs_${s}.json`), JSON.stringify(jobs.filter((_, i) => i % shards === s)));
  console.log(`${jobs.length} trabajos en ${shards} archivos`);
}
function agg(files) {
  const rows = files.flatMap(f => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch (e) { return { crash: 'linea cortada' }; } })).filter(r => !r.crash);
  const g = {};
  for (const r of rows) { const k = r.tag; (g[k] = g[k] || { n: 0, w: 0, secs: [], reached: [], cls: {}, killers: {} }); const c = g[k]; c.n++; const win = r.result === 'victory'; if (win) c.w++; c.secs.push(r.secs); c.reached.push(r.reached);
    const cc = c.cls[r.cls] = c.cls[r.cls] || [0, 0]; cc[1]++; if (win) cc[0]++;
    if (!win && r.killer) { const kk = (r.killer.match(/^[^ (]+/) || ['?'])[0]; c.killers[kk] = (c.killers[kk] || 0) + 1; } }
  for (const k of Object.keys(g).sort()) { const c = g[k], [lo, hi] = wilson(c.w, c.n), med = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
    console.log(`${k.padEnd(44)} ${c.w}/${c.n} ${(100 * c.w / c.n).toFixed(0)}% IC[${(100 * lo).toFixed(0)}-${(100 * hi).toFixed(0)}] medL${med(c.reached)} med${med(c.secs)}s  por cls ${Object.entries(c.cls).map(([a, b]) => a + ' ' + b[0] + '/' + b[1]).join(' ')}  muertes ${JSON.stringify(c.killers)}`); }
}
const [cmd, a, b, c] = process.argv.slice(2);
if (cmd === 'gen') gen(JSON.parse(fs.readFileSync(a, 'utf8')), b, +c || 2, process.argv.slice(6)); else if (cmd === 'agg') agg(process.argv.slice(3)); else console.log('uso: gen <spec> <dir> [shards] | agg <jsonl...>');
