'use strict';
// Art Factory 3.0 / S0F — orquestador de producción real sobre el contrato de cada campeón.
// Estados (nunca se confunden): PLANNED (solo plan/dry-run) · GENERATED (hay pixeles del proveedor) · VALIDATED (evaluador automático ≥ 90 sin críticos)
// · APPROVED (aprobación humana registrada) · STAGED_REVIEW_ONLY (arte y parche preparados; el registro en el motor lo hace un PR revisado) · BLOCKED (con motivo).
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), {spawnSync} = require('node:child_process');
const {readContract, ROOT} = require('./contract');
const {SpendGuard} = require('../../fondal-art-engine/spend-guard');
const {OpenAIImageProvider, BFLFlux2Provider, RunwayProvider, withFallback, Blocked} = require('../../fondal-art-engine/providers-s0f');
const JOBS = () => process.env.FONDAL_JOBS_ROOT || path.join(ROOT, 'art-source/factory-jobs');
const PY = process.env.PYTHON || 'python3';
const py = (...a) => { const r = spawnSync(PY, [path.join(ROOT, 'tools/factory/art_factory.py'), ...a], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024}); if (r.status !== 0) throw Error('art_factory.py ' + a[0] + ' falló: ' + (r.stderr || r.stdout).slice(-400)); return JSON.parse(r.stdout); };
const writeJSON = (f, o) => { fs.mkdirSync(path.dirname(f), {recursive: true}); const tmp = f + '.tmp-' + process.pid; fs.writeFileSync(tmp, JSON.stringify(o, null, 2) + '\n', {mode: 0o600}); fs.renameSync(tmp, f); };
const readJSON = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const latestRun = id => { const d = path.join(JOBS(), id); if (!fs.existsSync(d)) return null; const r = fs.readdirSync(d).filter(x => fs.statSync(path.join(d, x)).isDirectory()).sort(); return r.length ? path.join(d, r.at(-1)) : null; };
function setState(dir, state, note, extra = {}) { const f = path.join(dir, 'state.json'), s = fs.existsSync(f) ? readJSON(f) : {history: []}; s.state = state; s.note = note || ''; s.history.push({state, at: new Date().toISOString(), note: note || ''}); Object.assign(s, extra); writeJSON(f, s); return s; }

const STYLE = 'Pixel art de fantasía oscura moderna del juego La Horda: chibi (cabeza ~40-45 % de la altura), contorno oscuro de 1 px, sombreado de 2-3 tonos por color sin degradados, paleta acotada, fondo TRANSPARENTE si el modelo lo admite; si no, un ÚNICO color plano verde #00FF00 sin sombras, degradados ni suelo, sin texto ni marcos.';
function plan(contract, {kind = 'champion', action = null, skin = null} = {}) {
  if (contract.kind !== 'atlas') throw new Blocked('BLOCKED_CONTRACT', contract.reason);
  if ((skin || null) !== (contract.skin || null)) throw new Blocked('BLOCKED_CONTRACT', 'la skin solicitada no corresponde al contrato de arte existente');
  const jobs = []; const names = action ? [action] : Object.keys(contract.clips);
  if (action && !contract.clips[action]) throw new Blocked('BLOCKED_CONTRACT', `el campeón no tiene el clip «${action}». Clips: ${Object.keys(contract.clips).join(', ')}`);
  const seen = new Set();
  for (const name of names) {
    const fr = contract.clips[name].unique.filter(i => !seen.has(i)); fr.forEach(i => seen.add(i)); // un cuadro del atlas se genera una sola vez aunque lo usen varios clips
    for (let k = 0; k < fr.length; k += 4) {
      const chunk = fr.slice(k, k + 4);
      jobs.push({id: `${name}-${k / 4}`, label: `${contract.id}/${name}`, clip: name, frames: chunk,
        prompt: `${STYLE} Personaje: ${contract.id} (referencia: sprite de identidad del Códice recortado y tira de poses actuales). ${skin ? `Reparar skin EXISTENTE «${skin}»: conservar identidad, diseño, paleta, ropa, arma y silueta; no crear skin ni recolorear base.` : 'Conservar rostro, vestimenta, arma, paleta y proporciones del Códice.'} Generar ${chunk.length} poses DISTINTAS de «${name}» en una fila horizontal${/walk|run/.test(name) ? ' (ciclo de caminar: contacto, paso, contacto con la otra pierna, paso: las piernas y los brazos cambian de posición en cada pose)' : ''}, mismo tamaño y pies alineados, misma escala. PROHIBIDO: texto, letras, números, rótulos, línea de suelo, sombra, tierra, marcos y cualquier elemento que no sea el personaje.`,
        needs: ['codexPage', 'currentStrip']});
    }
  }
  // The runtime always submits two references. Reject the entire order before
  // any billable request; never silently truncate identity or animation instructions.
  const referenceSuffix = ' @ref1 @ref2 (referencias de identidad y de poses).';
  for (const job of jobs) if ((job.prompt + referenceSuffix).length > 1000) throw new Blocked('BLOCKED_CONTRACT', `prompt de ${job.id} supera 1000 unidades UTF-16 con sus referencias; corregir el contrato antes de generar`);
  return jobs;
}

const hashFile = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function checkedRun(id, dir) {
  if (!dir || !path.isAbsolute(dir)) throw Error('runDir absoluto obligatorio');
  const c = readJSON(path.join(dir, 'contract.json'));
  if (c.id !== id) throw Error('BLOCKED_CONTRACT: la corrida pertenece a otro campeón');
  const p = readJSON(path.join(dir, 'plan.json'));
  if (p.schema !== 'fondal.s0f.run.v2' || !p.identity || p.id !== id || p.identity.id !== id || p.identity.kind !== p.kind) throw Error('BLOCKED_EVIDENCE: corrida legacy o identidad incompleta; requiere nuevo plan verificable');
  if (p.identity) {
    const current = readContract(id, {skin: c.skin});
    if (JSON.stringify(p.jobs) !== JSON.stringify(plan(c, p.identity))) throw Error('BLOCKED_CONTRACT: plan de cuadros modificado');
    const sources = Object.fromEntries([current.atlas, current.codexPage].filter(Boolean).map(f => [f, hashFile(path.join(ROOT, f))]));
    if (JSON.stringify(current) !== JSON.stringify(c) || JSON.stringify(sources) !== JSON.stringify(p.identity.sources)) throw Error('BLOCKED_CONTRACT: cambiaron el contrato o las referencias; revisar antes de producir/integrar');
  }
  return c;
}
async function generate(id, opts = {}) {
  const contract = readContract(id, {skin: opts.skin}), kind = opts.kind || 'champion';
  if (!['champion', 'animation', 'skin'].includes(kind)) throw Error('tipo de generación no soportado');
  if (kind === 'animation' && !opts.action) throw Error('animation requiere action');
  if ((kind === 'skin' || opts.skin) && !/^[a-z][a-z0-9_-]{0,63}$/.test(opts.skin || '')) throw Error('skin requiere identificador seguro');
  const conc = opts.concurrency === undefined ? 2 : opts.concurrency;
  if (!Number.isInteger(conc) || conc < 1 || conc > 4) throw Error('concurrency debe ser entero de 1 a 4');
  for (const [k, v] of Object.entries(opts.limits || {})) if (!['perTaskCents', 'perBatchCents', 'perDayCents'].includes(k) || !Number.isSafeInteger(v) || v < 0) throw Error('límite de gasto inválido: ' + k);
  if (opts.runDir && !path.isAbsolute(opts.runDir)) throw Error('runDir absoluto obligatorio');
  if (opts.ledgerPath && !path.isAbsolute(opts.ledgerPath)) throw Error('ledgerPath absoluto obligatorio');
  const runId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + crypto.randomUUID().slice(0, 8);
  const dir = opts.runDir || path.resolve(JOBS(), kind === 'skin' ? `${id}__skin-${opts.skin}` : id, runId);
  fs.mkdirSync(dir, {recursive: true});
  const lock = path.join(dir, 'execution.lock');
  let fd;
  try { fd = fs.openSync(lock, 'wx', 0o600); fs.writeFileSync(fd, JSON.stringify({pid: process.pid, at: new Date().toISOString()})); }
  catch (e) { if (e.code === 'EEXIST') throw Error('BLOCKED_RUN_LOCKED: corrida en ejecución o interrumpida; verificar proceso y retirar lock antes de reanudar'); throw e; }
  try { return await generateLocked(); } finally { fs.closeSync(fd); fs.unlinkSync(lock); }
  async function generateLocked() {
    let jobs;
    try { jobs = plan(contract, opts); } catch (e) { if (e instanceof Blocked) { setState(dir, 'BLOCKED', e.message, {code: e.code}); return {state: 'BLOCKED', code: e.code, reason: e.message, dir}; } throw e; }
    if (!jobs.length) throw Error('BLOCKED_CONTRACT: contrato sin cuadros generables');
    const names = (opts.provider || process.env.FONDAL_PROVIDER || 'runway').split(',').map(n => n.trim());
    if (names.length !== 1 || !names[0]) throw Error('Elegir un único proveedor explícito; no hay fallback automático');
    const providerOptions = {...(names[0] === 'runway' ? {model: process.env.FONDAL_RUNWAY_MODEL || 'gen4_image', ratio: process.env.FONDAL_RUNWAY_RATIO || '1920:1080'} : names[0] === 'openai' ? {model: process.env.FONDAL_OPENAI_IMAGE_MODEL || 'gpt-image-1.5'} : {}), ...(opts.providerOptions || {})};
    const ledger = path.resolve(opts.ledgerPath || process.env.FONDAL_SPEND_LEDGER || path.resolve(JOBS(), 'spend-ledger.json'));
    const identity = {id, kind, ledgerPath: ledger, action: opts.action || null, skin: opts.skin || null, providers: names,
      providerOptions: Object.fromEntries(Object.entries(providerOptions).filter(([k]) => ['model', 'ratio', 'reserveCents', 'size', 'width', 'height'].includes(k))),
      sources: Object.fromEntries([contract.atlas, contract.codexPage].filter(Boolean).map(f => [f, hashFile(path.join(ROOT, f))]))};
    const planFile = path.join(dir, 'plan.json');
    if (fs.existsSync(planFile)) {
      const old = readJSON(planFile);
      if (JSON.stringify(old.identity) !== JSON.stringify(identity) || JSON.stringify(old.jobs) !== JSON.stringify(jobs)) throw Error('BLOCKED_CONTRACT: la corrida no coincide con plan/proveedor/referencias actuales');
      checkedRun(id, dir);
      const oldState = fs.existsSync(path.join(dir, 'state.json')) ? readJSON(path.join(dir, 'state.json')) : null;
      if (oldState && ['GENERATED', 'VALIDATED', 'APPROVED', 'STAGED_REVIEW_ONLY'].includes(oldState.state) && oldState.complete_requested) {
        if (!oldState.atlas_sha256 || hashFile(path.join(dir, 'atlas.png')) !== oldState.atlas_sha256) throw Error('BLOCKED_ARTIFACT_CHANGED: atlas modificado');
        return {...oldState, reused: true, dir};
      }
    } else {
      writeJSON(path.join(dir, 'contract.json'), contract);
      writeJSON(planFile, {schema: 'fondal.s0f.run.v2', id, kind, identity, jobs});
    }
    const guard = new SpendGuard({ledgerPath: path.resolve(ledger), limits: opts.limits || {}}), dry = !!opts.dryRun;
    const mk = n => n === 'runway' ? new RunwayProvider({...providerOptions, guard, dryRun: dry}) : n === 'openai' ? new OpenAIImageProvider({...providerOptions, guard, dryRun: dry}) : n === 'bfl' ? new BFLFlux2Provider({...providerOptions, guard, dryRun: dry}) : (opts.providers && opts.providers[n]) || (() => { throw Error('proveedor desconocido: ' + n); })();
    const providers = names.map(mk), batch = crypto.createHash('sha256').update(dir).digest('hex');
    const est = jobs.map(j => providers[0].estimate(j)), maxCents = est.reduce((s, e) => s + (e.estimated_cents_max || 0), 0);
    writeJSON(path.join(dir, 'estimate.json'), {provider: names, jobs: jobs.length, max_cents: maxCents, note: 'tope conservador; facturación real externa'});
    if (dry) { if (!fs.existsSync(path.join(dir, 'state.json'))) setState(dir, 'PLANNED', `dry-run: ${jobs.length} pedidos, hasta ${maxCents}c. Sin red ni gasto.`); return {state: 'PLANNED', jobs: jobs.length, max_cents: maxCents, dir}; }
    // Preflight the whole requested order before any provider call. Reservations remain
    // authoritative per POST; this conservative estimate is not provider account balance.
    const entries = guard._read().entries;
    const reserved = entries.filter(e => e.batch === batch);
    const remainingCents = jobs.reduce((sum, job, index) => {
      const receiptFile = path.join(dir, 'strips', job.id + '.json'), png = path.join(dir, 'strips', job.id + '.png');
      const delivered = fs.existsSync(receiptFile) && fs.existsSync(png) && readJSON(receiptFile).sha256 === hashFile(png);
      return sum + (delivered || reserved.some(e => e.task === job.id) ? 0 : est[index].estimated_cents_max || 0);
    }, 0);
    const batchReserved = reserved.reduce((sum, e) => sum + e.cents, 0);
    if (maxCents > guard.limits.perBatchCents || batchReserved + remainingCents > guard.limits.perBatchCents || guard.spentTodayCents() + remainingCents > guard.limits.perDayCents || est.some(e => e.estimated_cents_max > guard.limits.perTaskCents)) {
      const reason = `BLOCKED_BUDGET: pedido completo hasta ${maxCents}c (${remainingCents}c sin reservar); ajustar presupuesto explícito antes de iniciar`;
      setState(dir, 'BLOCKED', reason, {code: 'BLOCKED_BUDGET', complete_requested: false, spent_cents: batchReserved});
      return {state: 'BLOCKED', code: 'BLOCKED_BUDGET', reason, max_cents: maxCents, remaining_cents: remainingCents, complete_requested: false, spent_cents: batchReserved, dir};
    }
    const refDir = path.join(dir, 'refs'), stripDir = path.join(dir, 'strips'), partsDir = path.join(dir, 'parts');
    [refDir, stripDir, partsDir].forEach(d => fs.mkdirSync(d, {recursive: true}));
    const identityReference = path.join(refDir, 'identity.png');
    py('prepare-reference', path.join(dir, 'contract.json'), identityReference);
    const assemblies = [], failures = []; let spent = 0, blocked = null;
    const checkLease = async () => { if (opts.shouldContinue && !await opts.shouldContinue()) throw new Blocked('BLOCKED_LEASE_LOST', 'worker lease no longer confirmed; no further billable requests'); };
    const runJob = async plannedJob => {
      const job = {...plannedJob};
      const strip = path.join(refDir, job.id + '.current.png'); py('refstrip', path.join(dir, 'contract.json'), JSON.stringify(job.frames), strip);
      job.references = [identityReference, strip];
      const out = path.join(stripDir, job.id + '.png'), receiptFile = path.join(stripDir, job.id + '.json');
      let receipt;
      if (fs.existsSync(receiptFile)) {
        receipt = readJSON(receiptFile);
        if (!fs.existsSync(out) || hashFile(out) !== receipt.sha256) throw new Blocked('BLOCKED_ARTIFACT_CHANGED', 'tira guardada modificada: ' + job.id);
      } else {
        await checkLease();
        const r = await withFallback(providers, job, {batch});
        const tmp = out + '.tmp'; fs.copyFileSync(r.file, tmp); fs.renameSync(tmp, out);
        receipt = {provider: r.provider, cached: !!r.cached, cost_cents: r.cost_cents || 0, sha256: hashFile(out)};
        writeJSON(receiptFile, receipt);
      }
      spent += receipt.cost_cents;
      const a = py('assemble', path.join(dir, 'contract.json'), out, job.clip, JSON.stringify(job.frames), partsDir);
      if (!a.ok) { failures.push({job: job.id, code: 'ASSEMBLY_REJECTED', reason: a.reason}); return; }
      assemblies.push({job: job.id, provider: receipt.provider, cached: receipt.cached, ...a});
    };
    const queue = jobs.slice();
    const worker = async () => { while (queue.length && !blocked) { const j = queue.shift(); try { await checkLease(); await runJob(j); } catch (e) { failures.push({job: j.id, code: e.code || 'GENERATION_FAILED', reason: e.message}); if (e instanceof Blocked) blocked = e; } } };
    await Promise.all(Array.from({length: conc}, worker));
    const complete = assemblies.length === jobs.length && !failures.length && !blocked;
    let all = null;
    if (assemblies.length) {
      all = py('build-atlas', path.join(dir, 'contract.json'), partsDir, path.join(dir, 'atlas.png'));
      writeJSON(path.join(dir, 'assembly.json'), {...all, assemblies, failures, complete_requested: complete});
    }
    const state = complete ? 'GENERATED' : 'BLOCKED';
    const code = blocked ? blocked.code : complete ? null : 'BLOCKED_INCOMPLETE';
    const reason = complete ? `${assemblies.length}/${jobs.length} pedidos; cobertura ${all.coverage_pct}%. Falta validar y revisar.` : (blocked ? blocked.message : 'no se completaron todos los pedidos solicitados');
    const extra = {code, failures, complete_requested: complete, coverage_pct: all ? all.coverage_pct : 0, spent_cents: spent, atlas_sha256: all ? hashFile(path.join(dir, 'atlas.png')) : null};
    setState(dir, state, reason, extra);
    return {state, reason, ...extra, dir};
  }
}

const ESSENTIAL_CHECKS = ['dimensiones', 'alfa_binario', 'sin_siluetas_cortadas', 'sin_cuadros_vacios', 'estilo_en_rango_del_roster', 'pies_estables', 'altura_constante_entre_poses', 'animacion_con_movimiento', 'sin_residuos_sueltos', 'escala_vs_sprite_actual', 'tiene_consumidor'];
function evaluationPass(ev) { return ev.pass_threshold_90 === true && Number.isFinite(ev.score) && ev.score >= 90 && ev.critical === 0 && ESSENTIAL_CHECKS.every(k => ev.checks?.[k] === true); }
function evidence(id, dir) {
  const c = checkedRun(id, dir), p = readJSON(path.join(dir, 'plan.json')), a = readJSON(path.join(dir, 'assembly.json'));
  const jobs = plan(c, p.identity || {kind: p.kind, ...(p.opts || {})});
  if (JSON.stringify(jobs) !== JSON.stringify(p.jobs)) throw Error('BLOCKED_CONTRACT: plan de cuadros modificado');
  const expected = [...new Set(jobs.flatMap(j => j.frames))].sort((x, y) => x - y);
  const actual = a.generated_frames;
  if (!Array.isArray(actual) || actual.some(x => !Number.isInteger(x)) || new Set(actual).size !== actual.length || JSON.stringify([...actual].sort((x,y) => x-y)) !== JSON.stringify(expected)) throw Error('BLOCKED_EVIDENCE: cuadros generados no corresponden exactamente al plan');
  if (!Array.isArray(a.assemblies) || a.assemblies.length !== jobs.length || new Set(a.assemblies.map(x => x.job)).size !== jobs.length || jobs.some(j => !a.assemblies.some(x => x.job === j.id && JSON.stringify(x.frames) === JSON.stringify(j.frames))) || a.failures?.length) throw Error('BLOCKED_EVIDENCE: ensamblados incompletos');
  const parts = fs.readdirSync(path.join(dir, 'parts')).filter(n => n.endsWith('.png')).sort();
  const wanted = expected.map(i => 'f' + String(i).padStart(3, '0') + '.png').sort();
  if (JSON.stringify(parts) !== JSON.stringify(wanted)) throw Error('BLOCKED_EVIDENCE: piezas no corresponden al plan');
  const files = ['plan.json', 'contract.json', 'assembly.json', 'atlas.png', ...parts.map(n => 'parts/' + n)];
  const proof = {files: {}, sources: {}};
  for (const f of files) { const full = path.join(dir, f); if (!fs.lstatSync(full).isFile()) throw Error('BLOCKED_EVIDENCE: archivo irregular ' + f); proof.files[f] = hashFile(full); }
  for (const f of ['tools/factory/art_factory.py', 'tools/factory/s0f/contract.js', 'tools/factory/s0f/s0f.js', 'tools/factory/s0f/integration.js', 'docs/art-factory/ART_DIRECTION_REFS.json', c.atlas, c.codexPage, c.consumer].filter(Boolean)) proof.sources[f] = hashFile(path.join(ROOT, f));
  return proof;
}
function freshEvaluation(id, dir) {
  const before = evidence(id, dir);
  const ev = py('evaluate-candidate', path.join(dir, 'contract.json'), path.join(dir, 'atlas.png'), path.join(dir, 'assembly.json'));
  const after = evidence(id, dir);
  if (JSON.stringify(before) !== JSON.stringify(after)) throw Error('BLOCKED_EVIDENCE: evidencia cambió durante evaluación');
  return {ev, proof: after};
}
function requireValidatedEvidence(id, dir) {
  const saved = readJSON(path.join(dir, 'validation.json')), current = evidence(id, dir);
  if (JSON.stringify(saved.proof) !== JSON.stringify(current) || saved.evaluation_sha256 !== hashFile(path.join(dir, 'evaluation.json'))) throw Error('BLOCKED_EVIDENCE: evidencia cambió después de validar');
  const fresh = freshEvaluation(id, dir), previous = readJSON(path.join(dir, 'evaluation.json'));
  if (!evaluationPass(fresh.ev) || JSON.stringify(fresh.ev) !== JSON.stringify(previous)) throw Error('BLOCKED_EVIDENCE: reevaluación actual no aprueba o no coincide');
  return saved;
}
function validate(id, dir = latestRun(id)) {
  if (!dir) throw Error('sin corrida para ' + id);
  checkedRun(id, dir);
  const s = readJSON(path.join(dir, 'state.json')); if (!['GENERATED', 'VALIDATED'].includes(s.state)) throw Error(`validate exige GENERATED (estado actual: ${s.state})`);
  if (s.complete_requested === false) throw Error('validación bloqueada: corrida incompleta');
  if (s.atlas_sha256 && hashFile(path.join(dir, 'atlas.png')) !== s.atlas_sha256) throw Error('BLOCKED_ARTIFACT_CHANGED: atlas modificado');
  const {ev, proof} = freshEvaluation(id, dir);
  writeJSON(path.join(dir, 'evaluation.json'), ev);
  const pass = evaluationPass(ev);
  writeJSON(path.join(dir, 'validation.json'), {proof, evaluation_sha256: hashFile(path.join(dir, 'evaluation.json')), pass});
  if (pass) setState(dir, 'VALIDATED', `automático ${ev.score}/100 sin críticos y controles esenciales; falta revisión artística humana`, {validation: 'PASSED'});
  else setState(dir, 'GENERATED', `validación automática NO superada (${ev.score}/100, ${ev.critical} críticos o control esencial fallido)`, {validation: 'FAILED'});
  return {score: ev.score, critical: ev.critical, state: readJSON(path.join(dir, 'state.json')).state, defects: ev.defects};
}

function preview(id, dir = latestRun(id)) { checkedRun(id, dir); return py('preview', path.join(dir, 'contract.json'), path.join(dir, 'atlas.png'), path.join(dir, 'preview.png')); }
function approve(id, reviewer, dir = latestRun(id)) {
  checkedRun(id, dir);
  if (!reviewer) throw Error('approve requiere --reviewer <nombre> (aprobación humana)'); const s = readJSON(path.join(dir, 'state.json'));
  if (s.atlas_sha256 && hashFile(path.join(dir, 'atlas.png')) !== s.atlas_sha256) throw Error('BLOCKED_ARTIFACT_CHANGED: atlas modificado tras validar');
  if (s.state !== 'VALIDATED') throw Error(`approve exige VALIDATED (actual: ${s.state})`);
  requireValidatedEvidence(id, dir);
  writeJSON(path.join(dir, 'approval.json'), {reviewer, at: new Date().toISOString(), validationSha256: hashFile(path.join(dir, 'validation.json')), atlasSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, 'atlas.png'))).digest('hex')});
  return setState(dir, 'APPROVED', 'aprobado por ' + reviewer);
}
function integrate(id, dir = latestRun(id)) {
  checkedRun(id, dir);
  const s = readJSON(path.join(dir, 'state.json')); if (s.state !== 'APPROVED') throw Error(`integrate exige APPROVED (actual: ${s.state}). No se integra arte sin aprobación.`);
  const ap = readJSON(path.join(dir, 'approval.json')), sha = crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, 'atlas.png'))).digest('hex'); if (sha !== ap.atlasSha256) throw Error('el atlas cambió después de la aprobación');
  if (ap.validationSha256 !== hashFile(path.join(dir, 'validation.json'))) throw Error('BLOCKED_EVIDENCE: validación cambió después de aprobar');
  requireValidatedEvidence(id, dir);
  const {prepareIntegration, stageIntegration} = require('./integration');
  const prepared = prepareIntegration({root: ROOT, runDir: dir});
  const delivery = stageIntegration(prepared);
  // The registration file remains unchanged. The exact patch belongs in an independently reviewed asset PR.
  const {previewBase64, ...manifest} = delivery;
  writeJSON(path.join(dir, 'integration.json'), manifest);
  fs.writeFileSync(path.join(dir, 'registration.patch'), delivery.registration.patch, {mode: 0o600});
  return setState(dir, 'STAGED_REVIEW_ONLY', 'arte preparado en ruta inmutable y parche exacto; NO instalado ni publicado', {runtimeActive: false, destination: delivery.dest, registration_patch: path.join(dir, 'registration.patch')});
}
function status(id, d = latestRun(id)) { if (d) checkedRun(id, d); return d ? {dir: path.relative(ROOT, d), ...readJSON(path.join(d, 'state.json'))} : {state: 'NONE'}; }
module.exports = {generate, validate, preview, approve, integrate, status, plan, latestRun, evaluationPass};
