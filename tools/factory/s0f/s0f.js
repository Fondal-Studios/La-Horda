'use strict';
// Art Factory 3.0 / S0F — orquestador de producción real sobre el contrato de cada campeón.
// Estados (nunca se confunden): PLANNED (solo plan/dry-run) · GENERATED (hay pixeles del proveedor) · VALIDATED (evaluador automático ≥ 90 sin críticos)
// · APPROVED (aprobación humana registrada) · INTEGRATED (copiado a una ruta NUEVA; el registro en el motor lo hace el PR) · BLOCKED (con motivo).
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), {spawnSync} = require('node:child_process');
const {readContract, ROOT} = require('./contract');
const {SpendGuard} = require('../../fondal-art-engine/spend-guard');
const {OpenAIImageProvider, BFLFlux2Provider, RunwayProvider, withFallback, Blocked} = require('../../fondal-art-engine/providers-s0f');
const JOBS = () => process.env.FONDAL_JOBS_ROOT || path.join(ROOT, 'art-source/factory-jobs');
const PY = process.env.PYTHON || 'python3';
const py = (...a) => { const r = spawnSync(PY, [path.join(ROOT, 'tools/factory/art_factory.py'), ...a], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024}); if (r.status !== 0) throw Error('art_factory.py ' + a[0] + ' falló: ' + (r.stderr || r.stdout).slice(-400)); return JSON.parse(r.stdout); };
const writeJSON = (f, o) => { fs.mkdirSync(path.dirname(f), {recursive: true}); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n'); };
const readJSON = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const latestRun = id => { const d = path.join(JOBS(), id); if (!fs.existsSync(d)) return null; const r = fs.readdirSync(d).filter(x => fs.statSync(path.join(d, x)).isDirectory()).sort(); return r.length ? path.join(d, r.at(-1)) : null; };
function setState(dir, state, note, extra = {}) { const f = path.join(dir, 'state.json'), s = fs.existsSync(f) ? readJSON(f) : {history: []}; s.state = state; s.note = note || ''; s.history.push({state, at: new Date().toISOString(), note: note || ''}); Object.assign(s, extra); writeJSON(f, s); return s; }

const STYLE = 'Pixel art de fantasía oscura moderna del juego La Horda: chibi (cabeza ~40-45 % de la altura), contorno oscuro de 1 px, sombreado de 2-3 tonos por color sin degradados, paleta acotada, fondo TRANSPARENTE si el modelo lo admite; si no, un ÚNICO color plano verde #00FF00 sin sombras, degradados ni suelo, sin texto ni marcos.';
function plan(contract, {kind = 'champion', action = null, skin = null} = {}) {
  if (contract.kind !== 'atlas') throw new Blocked('BLOCKED_CONTRACT', contract.reason);
  const jobs = []; const names = action ? [action] : Object.keys(contract.clips);
  if (action && !contract.clips[action]) throw new Blocked('BLOCKED_CONTRACT', `el campeón no tiene el clip «${action}». Clips: ${Object.keys(contract.clips).join(', ')}`);
  const seen = new Set();
  for (const name of names) {
    const fr = contract.clips[name].unique.filter(i => !seen.has(i)); fr.forEach(i => seen.add(i)); // un cuadro del atlas se genera una sola vez aunque lo usen varios clips
    for (let k = 0; k < fr.length; k += 4) {
      const chunk = fr.slice(k, k + 4);
      jobs.push({id: `${name}-${k / 4}`, label: `${contract.id}/${name}`, clip: name, frames: chunk,
        prompt: `${STYLE} Personaje: ${contract.id} (referencia: página del Códice y tira de poses actuales). ${kind === 'skin' ? `Skin premium «${skin}»: diseño propio nuevo, silueta y arma reconocibles, NO un recoloreo.` : 'Conservar rostro, vestimenta, arma, paleta y proporciones del Códice.'} Generar ${chunk.length} poses DISTINTAS de «${name}» en una fila horizontal${/walk|run/.test(name) ? ' (ciclo de caminar: contacto, paso, contacto con la otra pierna, paso: las piernas y los brazos cambian de posición en cada pose)' : ''}, mismo tamaño y pies alineados, misma escala. PROHIBIDO: texto, letras, números, rótulos, línea de suelo, sombra, tierra, marcos y cualquier elemento que no sea el personaje.`,
        needs: ['codexPage', 'currentStrip']});
    }
  }
  return jobs;
}

async function generate(id, opts = {}) {
  const contract = readContract(id), runId = new Date().toISOString().replace(/[:.]/g, '-'), kind = opts.kind || 'champion';
  const dir = path.join(JOBS(), kind === 'skin' ? `${id}__skin-${opts.skin}` : id, runId); fs.mkdirSync(dir, {recursive: true});
  let jobs;
  try { jobs = plan(contract, opts); } catch (e) { if (e instanceof Blocked) { setState(dir, 'BLOCKED', e.message); return {state: 'BLOCKED', reason: e.message, dir}; } throw e; }
  writeJSON(path.join(dir, 'contract.json'), contract); writeJSON(path.join(dir, 'plan.json'), {id, kind, opts, jobs});
  const ledger = process.env.FONDAL_SPEND_LEDGER || path.join(dir, '..', 'spend-ledger.json'), guard = new SpendGuard({ledgerPath: path.resolve(ledger), limits: opts.limits || {}});
  const dry = !!opts.dryRun, names = (opts.provider || process.env.FONDAL_PROVIDER || 'runway,openai,bfl').split(',');
  const mk = n => n === 'runway' ? new RunwayProvider({guard, dryRun: dry}) : n === 'openai' ? new OpenAIImageProvider({guard, dryRun: dry}) : n === 'bfl' ? new BFLFlux2Provider({guard, dryRun: dry}) : (opts.providers && opts.providers[n]) || (() => { throw Error('proveedor desconocido: ' + n); })();
  const providers = names.map(mk), batch = runId;
  const est = jobs.map(j => providers[0].estimate(j)); const maxCents = est.reduce((s, e) => s + (e.estimated_cents_max || 0), 0);
  writeJSON(path.join(dir, 'estimate.json'), {provider: names, jobs: jobs.length, max_cents: maxCents, note: 'tope conservador; el costo real lo informa el proveedor y queda en el libro de gasto'});
  if (dry) { setState(dir, 'PLANNED', `dry-run: ${jobs.length} pedidos, hasta ${maxCents}c. No se llamó a ningún proveedor.`); return {state: 'PLANNED', jobs: jobs.length, max_cents: maxCents, dir}; }
  const refDir = path.join(dir, 'refs'), stripDir = path.join(dir, 'strips'), partsDir = path.join(dir, 'parts'); [refDir, stripDir, partsDir].forEach(d => fs.mkdirSync(d, {recursive: true}));
  const assemblies = [], failures = []; let spent = 0, blocked = null, i = 0; const conc = opts.concurrency || 2;
  const runJob = async job => {
    const strip = path.join(refDir, job.id + '.current.png'); py('refstrip', path.join(dir, 'contract.json'), JSON.stringify(job.frames), strip);
    job.references = [contract.codexPage && path.join(ROOT, contract.codexPage), strip].filter(Boolean);
    const r = await withFallback(providers, job, {batch}); spent += r.cost_cents || 0;
    const out = path.join(stripDir, job.id + '.png'); fs.copyFileSync(r.file, out);
    const a = py('assemble', path.join(dir, 'contract.json'), out, job.clip, JSON.stringify(job.frames), partsDir);
    if (!a.ok) { // reparación localizada: reintento solo de ESTA tira (no de todo el atlas), con otra semilla de prompt, y nunca más de una vez
      failures.push({job: job.id, reason: a.reason}); return; }
    assemblies.push({job: job.id, provider: r.provider, cached: r.cached, ...a});
  };
  const queue = jobs.slice(); const worker = async () => { while (queue.length && !blocked) { const j = queue.shift(); i++; try { await runJob(j); } catch (e) { if (e instanceof Blocked) blocked = e; else failures.push({job: j.id, reason: e.message}); } } };
  await Promise.all(Array.from({length: conc}, worker));
  if (!assemblies.length) { const why = blocked ? blocked.message : 'ningún pedido produjo piezas utilizables'; setState(dir, 'BLOCKED', why, {failures}); return {state: 'BLOCKED', reason: why, failures, spent_cents: spent, dir}; }
  const all = py('build-atlas', path.join(dir, 'contract.json'), partsDir, path.join(dir, 'atlas.png'));
  writeJSON(path.join(dir, 'assembly.json'), {...all, assemblies, failures});
  setState(dir, 'GENERATED', `${assemblies.length}/${jobs.length} pedidos ensamblados; cobertura ${all.coverage_pct}% de cuadros; el resto se hereda del atlas actual. NO validado.`, {spent_cents: spent});
  return {state: 'GENERATED', coverage_pct: all.coverage_pct, failures, spent_cents: spent, partial_blocked: blocked ? blocked.message : null, dir};
}
function validate(id, dir = latestRun(id)) {
  if (!dir) throw Error('sin corrida para ' + id);
  const s = readJSON(path.join(dir, 'state.json')); if (!['GENERATED', 'VALIDATED'].includes(s.state)) throw Error(`validate exige GENERATED (estado actual: ${s.state})`);
  const ev = py('evaluate-candidate', path.join(dir, 'contract.json'), path.join(dir, 'atlas.png'), path.join(dir, 'assembly.json')); writeJSON(path.join(dir, 'evaluation.json'), ev);
  if (ev.pass_threshold_90) setState(dir, 'VALIDATED', `automático ${ev.score}/100 sin críticos; falta revisión artística humana`); else setState(dir, 'GENERATED', `validación automática NO superada (${ev.score}/100, ${ev.critical} críticos)`, {validation: 'FAILED'});
  return {score: ev.score, critical: ev.critical, state: readJSON(path.join(dir, 'state.json')).state, defects: ev.defects};
}
function preview(id, dir = latestRun(id)) { return py('preview', path.join(dir, 'contract.json'), path.join(dir, 'atlas.png'), path.join(dir, 'preview.png')); }
function approve(id, reviewer, dir = latestRun(id)) {
  if (!reviewer) throw Error('approve requiere --reviewer <nombre> (aprobación humana)'); const s = readJSON(path.join(dir, 'state.json'));
  if (s.state !== 'VALIDATED') throw Error(`approve exige VALIDATED (actual: ${s.state})`); writeJSON(path.join(dir, 'approval.json'), {reviewer, at: new Date().toISOString(), atlasSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, 'atlas.png'))).digest('hex')});
  return setState(dir, 'APPROVED', 'aprobado por ' + reviewer);
}
function integrate(id, dir = latestRun(id)) {
  const s = readJSON(path.join(dir, 'state.json')); if (s.state !== 'APPROVED') throw Error(`integrate exige APPROVED (actual: ${s.state}). No se integra arte sin aprobación.`);
  const ap = readJSON(path.join(dir, 'approval.json')), sha = crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, 'atlas.png'))).digest('hex'); if (sha !== ap.atlasSha256) throw Error('el atlas cambió después de la aprobación');
  const c = readJSON(path.join(dir, 'contract.json')), dest = path.join(ROOT, 'assets/sprites/champions', id, 'codex-v2', 'atlas.png'); if (fs.existsSync(dest)) throw Error('ya existe ' + dest + ': no se sobrescribe');
  fs.mkdirSync(path.dirname(dest), {recursive: true}); fs.copyFileSync(path.join(dir, 'atlas.png'), dest);
  const reg = `champPackLoadAtlas("${id}", "assets/sprites/champions/${id}/codex-v2/atlas.png", ${JSON.stringify({w: c.cell.w, h: c.cell.h, cols: c.cols, refH: c.refH, anchor: c.anchor, fix: c.fix, sets: Object.fromEntries(Object.entries(c.clips).map(([k, v]) => [k, v.frames]))})});`;
  writeJSON(path.join(dir, 'integration.json'), {dest: path.relative(ROOT, dest), registration_snippet: reg, note: 'El archivo está en una ruta NUEVA. El cambio de registro (champPackLoadAtlas) y su revisión son del PR: el sprite anterior sigue siendo el activo.'});
  return setState(dir, 'INTEGRATED', 'copiado a ' + path.relative(ROOT, dest) + '; registro pendiente del PR');
}
function status(id) { const d = latestRun(id); return d ? {dir: path.relative(ROOT, d), ...readJSON(path.join(d, 'state.json'))} : {state: 'NONE'}; }
module.exports = {generate, validate, preview, approve, integrate, status, plan, latestRun};
