#!/usr/bin/env node
'use strict';
/* Exporta los logros internos del juego (js/data/quests.js: ACHIEVEMENTS) para cargarlos en Steamworks.
 *   node tools/steam/export-achievements.js            escribe docs/steam/achievements.json y achievements.csv
 *   node tools/steam/export-achievements.js --check    falla si los archivos escritos no coinciden con el código
 * El "API Name" del logro en Steamworks es el id interno en MINÚSCULAS (números y _; hasta 40 caracteres: lo exige desktop/main.js).
 * Los logros secretos van con "hidden": true. El juego los desbloquea en Steam con window.HORDA_DESKTOP.unlockAchievement(id)
 * desde js/systems/quests.js (un solo punto: questsEvaluate). Nada de esto hace falta para jugar. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const OUTBOX = {};
const sandbox = new Proxy({ console, __out: OUTBOX }, { has: () => true, get: (t, k) => k in t ? t[k] : (k === Symbol.unscopables ? undefined : function () { return 0; }) });
const ctx = vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data/quests.js'), 'utf8') + '\n;__out.A = ACHIEVEMENTS;', ctx, { filename: 'js/data/quests.js' });
const steamId = id => String(id).toLowerCase();   // = lo que manda js/systems/quests.js (questsSteamId): desktop/main.js solo acepta [a-z0-9_]
const list = OUTBOX.A.map(a => ({ id: steamId(a.id), internal: a.id, name: a.name, description: a.desc, category: a.cat, hidden: !!a.secret, goal: typeof a.goal === 'function' ? null : a.goal }));
const problems = [];
const seen = new Set();
for (const a of list) {
  if (!/^[a-z0-9_]{1,40}$/.test(a.id)) problems.push('id inválido para Steam (aun en minúsculas): ' + a.internal);
  if (seen.has(a.id)) problems.push('id repetido: ' + a.id); seen.add(a.id);
  if (!a.name || !a.description) problems.push('falta nombre o descripción: ' + a.id);
}
const json = JSON.stringify({ note: 'Generado por tools/steam/export-achievements.js. El id es el API Name en Steamworks.', count: list.length, achievements: list }, null, 1) + '\n';
const q = s => '"' + String(s).replace(/"/g, '""') + '"';
const csv = 'api_name,display_name,description,hidden,category\n' + list.map(a => [a.id, q(a.name), q(a.description), a.hidden ? 1 : 0, a.category].join(',')).join('\n') + '\n';
const OUT = path.join(ROOT, 'docs/steam');
if (process.argv.includes('--check')) {
  let bad = problems.slice();
  for (const [f, body] of [['achievements.json', json], ['achievements.csv', csv]]) { try { if (fs.readFileSync(path.join(OUT, f), 'utf8') !== body) bad.push(f + ' desactualizado: regeneralo con node tools/steam/export-achievements.js'); } catch (e) { bad.push('falta docs/steam/' + f); } }
  console.log(bad.length ? 'FALLA\n - ' + bad.join('\n - ') : 'OK ' + list.length + ' logros listos para Steam (ids válidos, únicos, con nombre y descripción)');
  process.exit(bad.length ? 1 : 0);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'achievements.json'), json); fs.writeFileSync(path.join(OUT, 'achievements.csv'), csv);
console.log('escrito docs/steam/achievements.json y .csv (' + list.length + ' logros)');
