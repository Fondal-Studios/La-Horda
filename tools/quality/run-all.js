#!/usr/bin/env node
'use strict';
/* Corre la batería de pruebas del juego con un servidor ESTÁTICO PROPIO en un puerto libre (sin red externa, sin relay, sin
 * dispositivos) y resume PASS/FAIL. Pensado para el dueño antes de lanzar:
 *
 *   node tools/quality/run-all.js                 todo lo que corre sin red (unas decenas de minutos)
 *   node tools/quality/run-all.js --quick         solo la lógica pura y las pruebas rápidas (sin navegador pesado)
 *   node tools/quality/run-all.js --fast          todo menos las más lentas (formas de definitivas, decales, simulaciones del gate de entrada, campaña completa)
 *   node tools/quality/run-all.js --only items    solo las pruebas cuyo ruta contiene "items" (se puede repetir: --only a --only b)
 *   node tools/quality/run-all.js --list          lista las pruebas y sale
 *   node tools/quality/run-all.js --jobs 4        pruebas en paralelo (por omisión 3; con equipos lentos probá --jobs 1)
 *   node tools/quality/run-all.js --retry 1       reintentos de lo que falla (por omisión 1): si pasa en el reintento se informa como FLAKY
 *   node tools/quality/run-all.js --out carpeta   dónde dejar los logs (por omisión una carpeta temporal)
 *
 * Código de salida: 0 si todo pasó (los FLAKY avisan pero no rompen), 1 si algo falló de verdad, 2 si no se pudo arrancar.
 * Cada prueba se corre como proceso aparte contra ESTE árbol; el servidor propio comprueba que sirve este árbol (tools/lib/serve.js).
 * No hace falta ningún servidor levantado de antemano. Resultado y motivos: docs/quality/ESTADO_DE_PRUEBAS.md.
 *
 * Qué NO cubre (necesita otra cosa, ver el doc): pruebas con relay/WebSocket de varios jugadores, pagos reales, dispositivos reales,
 * revisión humana de arte/audio. Un PASS acá no sustituye esa revisión.
 * Las pruebas "generadoras" (ability-gate, entry-gate, capturas de UX) reescriben archivos de docs/: al terminar la batería restaura lo que cambió DURANTE la corrida
 * y borra las capturas nuevas (lo que ya estaba modificado antes no se toca; --keep-artifacts lo desactiva). */
const {spawn, spawnSync} = require('node:child_process'), fs = require('node:fs'), os = require('node:os'), path = require('node:path'), net = require('node:net');
const ROOT = path.resolve(__dirname, '../..');
const H = require('../lib/serve');

// kind: 'site'  usa el servidor compartido (variables de URL) y puede correr en paralelo
//       'own'   levanta su propio servidor: se le da un puerto libre por variable (*_PORT) y puede ir en paralelo
//       'fixed' tiene un puerto escrito en el código: corre de a una por vez
//       'node'  sin navegador
// t: tiempo máximo en segundos. q: entra en --quick.
const T = (f, kind = 'site', t = 600, extra = {}) => ({f, kind, t, ...extra});
const TESTS = [
  // ---- lógica pura (sin navegador) ----
  T('tools/lib/test-serve.js', 'node', 180, {q: 1}),
  T('tools/lib/test-http-ready.js', 'node', 120, {q: 1, args: ['--test']}),
  T('tools/items/t_codex_book_logic.js', 'node', 180, {q: 1}),
  T('tools/balance/check-entry-reference.js', 'node', 120, {q: 1}),
  T('tools/regression/test-aim-hostiles.js', 'node', 180, {q: 1, args: ['--test']}),
  T('tools/audio/test-rng-isolation.js', 'node', 180, {q: 1}),
  T('tools/audio/t_music_catalog.js', 'node', 60, {q: 1}),
  T('tools/audio/t_music_player.js', 'node', 60, {q: 1}),
  T('tools/audio/t_music_boot.js', 'node', 120, {q: 1}),
  T('tools/quality/test-talent-gate.js', 'node', 180, {q: 1}),
  T('tools/quality/test-single-champion-revive.js', 'node', 180, {q: 1}),
  T('tools/quality/test-floating-text.js', 'node', 180, {q: 1}),
  T('tools/quality/test-combat-language.js', 'node', 180, {q: 1}),
  T('tools/quality/test-vfx-pools.js', 'node', 180, {q: 1}),
  T('tools/quality/test-coliseo-no-revive.js', 'node', 180, {q: 1}),
  T('tools/collection/check-collection.js', 'node', 180, {q: 1}),
  T('tools/alpha/public-defaults.js', 'node', 120, {q: 1}),
  T('tools/alpha/account-environments.js', 'node', 120, {q: 1}),
  T('tools/alpha/rooms-unit.js', 'node', 120, {q: 1}),
  T('tools/alpha/services-test.js', 'node', 180, {q: 1}),
  T('tools/alpha/event-receipts-test.js', 'node', 180, {q: 1}),
  T('tests/competitive-roster.test.js', 'node', 120, {q: 1}),
  T('tests/competitive-signatures.test.js', 'node', 120, {q: 1}),
  T('tools/crystal-wars/test-competitive.js', 'node', 300, {q: 1}),
  T('tools/crystal-wars/test-simulation.js', 'node', 300, {q: 1}),
  T('tools/crystal-wars/balance-gate.js', 'node', 900, {slow: 1}),
  T('tools/crystal-wars/coliseum-balance-gate.js', 'node', 600),
  T('tools/crystal-wars/required-files.js', 'node', 120, {q: 1}),
  T('tools/bible/champion-validator.js', 'node', 300, {args: ['--strict']}),
  T('tools/bible/arena-validator.js', 'node', 300, {args: ['--strict']}),
  T('tools/bible/boss-validator.js', 'node', 300, {args: ['--strict']}),
  // ---- objetos, economía, dificultad (navegador, servidor compartido) ----
  ...['t_abismo', 't_boons', 't_breakables', 't_build_uniques', 't_camp', 't_campaign', 't_codex', 't_codex_book', 't_collision', 't_cromas', 't_crystals',
    't_difficulty', 't_endless', 't_evolution', 't_ground_loot', 't_hechicero', 't_hpbonus', 't_itemization', 't_items', 't_mage_kit', 't_nigro_elements',
    't_nigro_golems', 't_nigromante', 't_pacing', 't_perf_exploits', 't_q4_economia', 't_quests', 't_reactions', 't_resonance', 't_roles', 't_sets',
    't_skins_brasas', 't_starter_gift', 't_story', 't_synergies'].map(n => T(`tools/items/${n}.js`, 'site', n === 't_campaign' ? 1800 : 900, n === 't_campaign' || n === 't_difficulty' ? {slow: 1} : {})),
  // ---- identidad, regresión, UX ----
  T('tools/identity/t_identity.js', 'site', 1200),
  T('tools/identity/t_objectives.js', 'site', 600),
  ...['t_bestias', 't_boss_assist', 't_champs_se', 't_checkpoint', 't_defeat_clear', 't_drag_aim', 't_hit_react', 't_ilkan_migration', 't_juice',
    't_run_end', 't_save_sanitize'].map(n => T(`tools/regression/${n}.js`, 'site', 900, n === 't_run_end' ? {kind: 'fixed'} : n === 't_ilkan_migration' ? {args: site => [site.url]} : {})),
  // cámara/resolución sobre el sitio servido tal cual (el resto de la carpeta regression compara dos versiones instrumentadas: ver su README)
  T('tools/regression/t_camera.js', 'site', 600, {args: (site, out) => ['.', out]}),
  T('tools/ux/test-accessibility-prefs.js', 'site', 600),
  T('tools/ux/test-skill-glyphs.js', 'site', 600),
  T('tools/ux/test-ability-inspector.js', 'own', 600),
  T('tools/ux/test-arena-briefing-tutorial.js', 'own', 600),
  T('tools/ux/test-libro-unico.js', 'site', 900),
  T('tools/ux/test-hub-legibility.js', 'own', 600),
  T('tools/ux/test-tactical-panel.js', 'own', 600),
  T('tools/ux/test-text-overflow.js', 'own', 900),
  T('tools/ux/test-touch-targets.js', 'own', 600),
  T('tools/ux/test-first-minute-taps.js', 'site', 600),
  T('tools/ux/functional.js', 'fixed', 900),
  // ---- calidad, VFX, arte ----
  T('tools/quality/test-ability-resources.js', 'own', 900),
  T('tools/quality/test-classic-passives.js', 'own', 900),
  T('tools/quality/test-floating-text-rate.js', 'own', 600),
  T('tools/quality/test-nano-render.js', 'own', 600),
  T('tools/quality/test-projectile-identity.js', 'own', 600),
  T('tools/vfx/test-ult-forms.js', 'site', 2400, {slow: 1}),
  T('tools/vfx/test-decal-legible.js', 'site', 1800, {slow: 1}),
  T('tools/art/check-skill-icons.js', 'site', 900, {args: ['--self-test']}),
  T('tools/art/check-pixel-icons.js', 'node', 300),
  T('tools/art/roster-loading-test.js', 'own', 900),
  T('tools/art/t_pixrig_bosses.js', 'site', 600),
  T('tools/art/check-presentation-browser.js', 'fixed', 600),
  // ---- carriles, Coliseo, Cristales, colección, balance ----
  T('tools/lanes/test-sides.js', 'site', 900),
  T('tools/lanes/postgame-test.js', 'own', 900),
  T('tools/lanes/team-card-test.js', 'node', 300),
  T('tools/coliseum/flow.js', 'own', 900),
  T('tools/lanes/flow.js', 'own', 900),
  T('tools/collection/t_shop_rotation.js', 'site', 600),
  T('tools/collection/shop-pricing-browser.js', 'fixed', 600),
  T('tools/collection/pricing-sync.js', 'fixed', 600),
  T('tools/collection/browser-collection.js', 'fixed', 600),
  T('tools/collection/codex-unlock-progress.js', 'fixed', 600),
  T('tools/collection/welcome-picks.js', 'fixed', 600),
  T('tools/balance/test-campaign-startup.js', 'site', 600, {args: ['--test']}),
  T('tools/balance/entry-gate.js', 'own', 2400, {slow: 1}),
  T('tools/bible/ability-gate.js', 'site', 1200, {args: ['--strict']}),
  // ---- alpha (navegador, servidor propio en puerto fijo) ----
  ...['services-browser', 'training-test', 'goal-guide', 'main-flow', 'navigation-profiles', 'public-onboarding', 'bot-identity', 'training-player', 'new-account-starter']
    .map(n => T(`tools/alpha/${n}.js`, 'fixed', 600)),
];

function arg(name, def) { const i = process.argv.indexOf(name); return i < 0 ? def : (process.argv[i + 1] === undefined || process.argv[i + 1].startsWith('--') ? true : process.argv[i + 1]); }
function args(name) { const o = []; process.argv.forEach((a, i) => { if (a === name && process.argv[i + 1]) o.push(process.argv[i + 1]); }); return o; }
const freePort = () => new Promise((ok, ko) => { const s = net.createServer(); s.once('error', ko); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => ok(p)); }); });
const PORT_VARS = ['LH_PORT', 'PORT', 'TEXTRATE_PORT', 'INSPECT_PORT', 'BRIEF_PORT', 'HUB_PORT', 'TACTICAL_PORT', 'OVERFLOW_PORT', 'TOUCH_PORT', 'RESOURCE_GATE_PORT', 'PASSIVE_PORT',
  'NANO_RENDER_PORT', 'PROJ_PORT', 'BOSS_HOOKS_PORT', 'BENCH_PORT', 'ENTRY_PORT', 'CW_HUB_PORT'];

function runOne(t, site, outDir, attempt) {
  return new Promise(async res => {
    const env = {...process.env};
    const base = site.url;
    if (t.kind === 'site' || t.kind === 'fixed') for (const k of ['SE_BASE_URL', 'BASE_URL', 'ABILITY_BASE_URL', 'SITE', 'REGRESSION_BASE_URL', 'GAME_URL', 'PM_BASE_URL']) env[k] = base;
    if (t.kind === 'own') for (const k of PORT_VARS) env[k] = String(await freePort());
    for (const k of ['SE_BASE_URL', 'BASE_URL', 'ABILITY_BASE_URL', 'SITE']) if (t.kind !== 'site' && t.kind !== 'fixed') delete env[k];
    const name = t.f.replace(/[\\/]/g, '__') + (attempt ? `.retry${attempt}` : '') + '.log';
    const logFile = path.join(outDir, name), log = fs.openSync(logFile, 'w');
    const tune = t.kind === 'node' ? [] : ['--require', path.join(ROOT, 'tools/lib/pw-tune.js')];
    const targs = typeof t.args === 'function' ? t.args(site, outDir) : (t.args || []);
    const a = targs[0] === '--test' ? ['--test', ...tune, t.f] : [...tune, t.f, ...targs];
    const t0 = Date.now();
    const child = spawn(process.execPath, a, {cwd: ROOT, env, stdio: ['ignore', log, log], detached: true});
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; try { process.kill(-child.pid, 'SIGKILL'); } catch (e) { /* ya terminó */ } }, t.t * 1000 * (+process.env.TEST_TIMEOUT_SCALE || 1));
    child.on('exit', (code, sig) => {
      clearTimeout(timer); fs.closeSync(log);
      try { process.kill(-child.pid, 'SIGKILL'); } catch (e) { /* sin huérfanos */ }
      const txt = fs.readFileSync(logFile, 'utf8');
      const fails = [...txt.matchAll(/^(?:FAIL|not ok|✗|FALLA)\s+(.{0,160})/gm)].map(m => m[1].trim());
      const passes = (txt.match(/^(?:PASS|ok|✓)\b/gm) || []).length;
      res({f: t.f, code: timedOut ? 'TIMEOUT' : code === null ? sig : code, secs: Math.round((Date.now() - t0) / 1000), passes, fails, logFile});
    });
  });
}

(async () => {
  const only = args('--only'), quick = !!arg('--quick');
  const jobs = Math.max(1, +arg('--jobs', 3) || 3), retry = Math.max(0, +arg('--retry', 1) || 0);
  const fast = !!arg('--fast');
  let list = TESTS.filter(t => (!quick || t.q) && (!fast || !t.slow) && (!only.length || only.some(o => t.f.includes(o))));
  if (arg('--list')) { for (const t of list) console.log(`${t.kind.padEnd(5)} ${t.slow ? 'lenta ' : '      '}${t.f}`); return; }
  const missing = list.filter(t => !fs.existsSync(path.join(ROOT, t.f)));
  if (missing.length) { console.error('No existen: ' + missing.map(t => t.f).join(', ')); list = list.filter(t => !missing.includes(t)); }
  if (!list.length) { console.error('Nada que correr.'); process.exit(2); }
  const outDir = path.resolve(typeof arg('--out') === 'string' ? arg('--out') : fs.mkdtempSync(path.join(os.tmpdir(), 'la-horda-run-all-')));
  fs.mkdirSync(outDir, {recursive: true});
  // Algunas pruebas regeneran capturas e informes dentro del repo (docs/, art-source/...). Se anota qué estaba sucio ANTES para dejar el árbol como estaba.
  const hasGit = fs.existsSync(path.join(ROOT, '.git'));
  const dirty = () => { if (!hasGit) return new Map(); const r = spawnSync('git', ['status', '--porcelain', '-z', '--untracked-files=all'], {cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28});
    return new Map((r.stdout || '').split('\0').filter(Boolean).map(l => [l.slice(3), l.slice(0, 2)])); };
  const dirtyBefore = dirty();
  let site;
  try { site = await H.startSite({envUrl: [], quiet: true}); } catch (e) { console.error('No se pudo levantar el servidor propio: ' + e.message); process.exit(2); }
  console.log(`[run-all] ${list.length} pruebas, ${jobs} en paralelo, servidor propio ${site.url}, logs en ${outDir}`);
  const results = [];
  const show = r => console.log(`${r.code === 0 ? 'PASS ' : 'FAIL '} ${String(r.secs).padStart(4)}s  ${r.f}${r.code === 0 ? '' : `  (código ${r.code})`}${r.fails.length ? '\n        - ' + r.fails.slice(0, 6).join('\n        - ') : ''}`);
  const queue = list.filter(t => t.kind !== 'fixed'), fixed = list.filter(t => t.kind === 'fixed');
  async function worker(q) { while (q.length) { const t = q.shift(); let r = await runOne(t, site, outDir, 0); r.t = t; show(r); results.push(r); } }
  await Promise.all([...Array.from({length: jobs}, () => worker(queue)), worker(fixed)]);
  // Reintentos (de a uno, sin carga): distinguen una falla real de una intermitente.
  const final = [];
  for (const r of results) {
    if (r.code === 0) { final.push({...r, status: 'PASS'}); continue; }
    let status = 'FAIL', again = null;
    for (let i = 1; i <= retry; i++) { again = await runOne(r.t, site, outDir, i); if (again.code === 0) { status = 'FLAKY'; break; } }
    if (retry) console.log(`reintento ${r.f}: ${status}`);
    final.push({...r, status, retryFails: again && again.code !== 0 ? again.fails : []});
  }
  await site.close();
  // Las pruebas generadoras dejan archivos modificados o nuevos (capturas, informes): se restauran los que aparecieron durante la corrida.
  // Lo que ya estaba modificado antes de empezar no se toca nunca. --keep-artifacts lo desactiva.
  if (hasGit && !arg('--keep-artifacts')) {
    const after = dirty(), tracked = [], fresh = [];
    for (const [f, st] of after) if (!dirtyBefore.has(f)) (st === '??' ? fresh : tracked).push(f);
    if (tracked.length) spawnSync('git', ['checkout', '--', ...tracked], {cwd: ROOT, stdio: 'ignore'});
    for (const f of fresh) { try { fs.rmSync(path.join(ROOT, f), {force: true}); } catch (e) { /* queda */ } }
    if (tracked.length || fresh.length) console.log(`[run-all] restauradas ${tracked.length} modificaciones y borradas ${fresh.length} capturas nuevas que generaron las pruebas`);
  }
  const by = s => final.filter(r => r.status === s);
  console.log('\n==================== RESUMEN ====================');
  console.log(`PASS ${by('PASS').length}   FLAKY ${by('FLAKY').length}   FAIL ${by('FAIL').length}   (de ${final.length})`);
  for (const r of by('FLAKY')) console.log(`FLAKY ${r.f}  falló la primera vez: ${r.fails.slice(0, 3).join(' | ') || 'código ' + r.code}`);
  for (const r of by('FAIL')) console.log(`FAIL  ${r.f}  (código ${r.code})\n        ${(r.retryFails.length ? r.retryFails : r.fails).slice(0, 8).join('\n        ') || 'ver ' + r.logFile}`);
  fs.writeFileSync(path.join(outDir, 'resumen.json'), JSON.stringify(final.map(({t, ...r}) => r), null, 1));
  console.log(`\nLogs y resumen.json en ${outDir}`);
  process.exit(by('FAIL').length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
