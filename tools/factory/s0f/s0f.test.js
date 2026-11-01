'use strict';
// Prueba de extremo a extremo del pipeline con un proveedor FIXTURE (solo para pruebas: devuelve la propia referencia actual).
// NO es generación de IA y nunca se usa como evidencia del piloto: sirve para probar contrato → ensamblado → atlas → validación → estados.
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
process.env.FONDAL_JOBS_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 's0f-jobs-')); process.env.FONDAL_SPEND_LEDGER = path.join(process.env.FONDAL_JOBS_ROOT, 'spend.json');
['BFL_API_KEY', 'ART_GEN_API_KEY', 'OPENAI_API_KEY'].forEach(k => delete process.env[k]);
const s0f = require('./s0f'), {readContract} = require('./contract');
// Proveedor FIXTURE (solo pruebas): compone una tira horizontal con las poses ACTUALES, como lo haría un proveedor que devuelve tiras. No es IA.
const createFixture = skin => ({name: 'fixture-test-only', estimate: j => ({estimated_cents_max: 0}), generate: async j => {
  const out = path.join(os.tmpdir(), 'fixture-' + j.id + '.png'), cj = path.join(process.env.FONDAL_JOBS_ROOT, 'fixture-contract.json'); fs.writeFileSync(cj, JSON.stringify(readContract('cazadora', {skin})));
  const r = require('node:child_process').spawnSync('python3', ['-c', `
import sys, json; sys.path.insert(0, '${path.resolve(__dirname, '..').replace(/\\/g, '/')}')
import art_factory as af
from PIL import Image
c = json.load(open('${cj}')); cells = af.cells_of(af.load(af.ROOT / c['atlas']), c['cell']['w'], c['cell']['h'], c['cols']); fr = json.loads('${JSON.stringify(j.frames)}')
cw, ch = c['cell']['w'], c['cell']['h']; strip = Image.new('RGBA', ((cw + 40) * len(fr), ch), (0, 0, 0, 0))
for k, i in enumerate(fr): strip.paste(Image.fromarray(cells[i], 'RGBA'), (k * (cw + 40) + 20, 0))
strip.save('${out}')`], {encoding: 'utf8'}); if (r.status !== 0) throw Error(r.stderr);
  return {status: 'GENERATED', cached: false, file: out, cost_cents: 0}; }});
const fixture = createFixture();
test('contrato real de Sylva (no 36 poses) y de Libertador distinto; Tanque sin contrato literal => BLOCKED_CONTRACT', () => {
  const c = readContract('cazadora'); assert.equal(c.cell.w, 192); assert.equal(c.frames, 52); assert.notEqual(c.frames, 36);
  assert.notDeepEqual(readContract('libertador').cell, c.cell); assert.equal(readContract('tanque').kind, 'unsupported');
});
test('sin clave: dry-run => PLANNED; real => BLOCKED_CREDENTIAL con gasto 0 y sin atlas', async () => {
  const a = await s0f.generate('cazadora', {provider: 'bfl', dryRun: true}); assert.equal(a.state, 'PLANNED'); assert.equal(a.jobs, 13);
  const b = await s0f.generate('cazadora', {provider: 'bfl'}); assert.equal(b.state, 'BLOCKED'); assert.match(b.reason, /BLOCKED_CREDENTIAL/); assert.equal(b.spent_cents, 0);
  assert.equal(fs.existsSync(path.join(b.dir, 'atlas.png')), false);
});
test('pipeline completo con fixture: GENERATED -> VALIDATED -> APPROVED (y integrate exige aprobación)', async () => {
  const g = await s0f.generate('cazadora', {provider: 'fixture', providers: {fixture}, kind: 'animation', action: 'walk_down'});
  assert.equal(g.state, 'GENERATED'); assert.ok(g.coverage_pct > 0 && g.coverage_pct < 100); // el resto se hereda y se declara
  assert.throws(() => s0f.integrate('cazadora'), /exige APPROVED/);
  const v = s0f.validate('cazadora'); assert.equal(v.critical, 0); assert.equal(v.state, 'VALIDATED', JSON.stringify(v.defects));
  assert.throws(() => s0f.approve('cazadora'), /--reviewer/);
  assert.equal(s0f.approve('cazadora', 'revisor-humano').state, 'APPROVED');
  let abs;
  try {
    const result = s0f.integrate('cazadora'); assert.equal(result.state, 'STAGED_REVIEW_ONLY'); assert.equal(result.runtimeActive, false);
    abs = path.dirname(path.resolve(__dirname, '../../..', result.destination));
    assert.equal(fs.existsSync(path.join(abs, 'atlas.png')), true);
    assert.throws(() => s0f.integrate('cazadora'), /exige APPROVED/);
  } finally { if (abs) fs.rmSync(abs, {recursive: true, force: true}); }
});
test('una tira inutilizable no rompe el atlas: queda en failures y el estado no miente', async () => {
  const bad = {name: 'bad', estimate: () => ({estimated_cents_max: 0}), generate: async j => { const f = path.join(os.tmpdir(), 'blank.png'); require('node:child_process').spawnSync('python3', ['-c', `from PIL import Image;Image.new('RGBA',(400,100),(0,0,0,0)).save('${f}')`]); return {status: 'GENERATED', file: f, cost_cents: 0}; }};
  const r = await s0f.generate('cazadora', {provider: 'bad', providers: {bad}, kind: 'animation', action: 'idle_down'});
  assert.equal(r.state, 'BLOCKED'); assert.ok(r.failures.length >= 1);
});

test('salida SIN alfa con fondo plano: el ensamblador lo recorta y separa las poses; fondo no plano => se rechaza', () => {
  const {spawnSync} = require('node:child_process'), c = path.join(process.env.FONDAL_JOBS_ROOT, 'c.json'); fs.writeFileSync(c, JSON.stringify(readContract('cazadora')));
  const mk = (name, flat) => { const f = path.join(process.env.FONDAL_JOBS_ROOT, name); spawnSync('python3', ['-c', `
from PIL import Image, ImageDraw
import random
random.seed(1)
im = Image.new('RGB', (800, 200), (0,255,0))
if not ${flat ? 'True' : 'False'}:
    px = im.load()
    for x in range(800):
        for y in range(200): px[x, y] = (random.randint(0,255), random.randint(0,255), random.randint(0,255))
d = ImageDraw.Draw(im)
for k in range(4): d.rectangle([40 + k*200, 30, 120 + k*200, 170], fill=(120, 60 + k*20, 30), outline=(10,10,10))
im.save('${f}')`]); return f; };
  const run = f => JSON.parse(spawnSync('python3', [path.resolve(__dirname, '../art_factory.py'), 'assemble', c, f, 'walk_down', '[0,1,2,3]', path.join(process.env.FONDAL_JOBS_ROOT, 'parts-' + path.basename(f))], {encoding: 'utf8'}).stdout);
  const ok = run(mk('flat.png', true)); assert.equal(ok.ok, true, JSON.stringify(ok)); assert.equal(ok.background_keyed, true); assert.deepEqual(ok.frames, [0, 1, 2, 3]);
  const bad = run(mk('noisy.png', false)); assert.equal(bad.ok, false); assert.match(bad.reason, /no es plano/);
});

test('explicit durable run resumes without duplicate provider work; exact run review is pinned', async () => {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 's0f-resume-'));
  let calls = 0;
  const tracked = {...fixture, generate: async j => { calls++; return fixture.generate(j); }};
  const opts = {runDir, provider: 'fixture', providers: {fixture: tracked}, kind: 'animation', action: 'walk_down'};
  const a = await s0f.generate('cazadora', opts); assert.equal(a.complete_requested, true); assert.equal(calls, 1);
  const b = await s0f.generate('cazadora', opts); assert.equal(b.reused, true); assert.equal(calls, 1);
  assert.throws(() => s0f.validate('aelith', runDir), /otro campeón/);
  await assert.rejects(s0f.generate('cazadora', {...opts, action: 'idle_down'}), /no coincide/);
  fs.appendFileSync(path.join(runDir, 'atlas.png'), 'changed');
  assert.throws(() => s0f.validate('cazadora', runDir), /ARTIFACT_CHANGED/);
  await assert.rejects(s0f.generate('cazadora', opts), /ARTIFACT_CHANGED/);
});
test('partial requested generation cannot become VALIDATED or silently switch provider', async () => {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 's0f-partial-'));
  let calls = 0;
  const partial = {...fixture, generate: async j => { if (++calls > 1) throw Error('fixture outage'); return fixture.generate(j); }};
  const g = await s0f.generate('cazadora', {runDir, provider: 'fixture', providers: {fixture: partial}, concurrency: 1});
  assert.equal(g.state, 'BLOCKED'); assert.equal(g.complete_requested, false); assert.ok(g.failures.length);
  assert.throws(() => s0f.validate('cazadora', runDir), /exige GENERATED/);
  await assert.rejects(s0f.generate('cazadora', {provider: 'runway,openai', dryRun: true}), /único proveedor/);
});
test('invalid concurrency, budgets and run paths fail before provider', async () => {
  for (const concurrency of [0, -1, 1.5, 5, NaN]) await assert.rejects(s0f.generate('cazadora', {concurrency}), /concurrency/);
  for (const perBatchCents of [-1, NaN, Infinity, 0.1]) await assert.rejects(s0f.generate('cazadora', {limits: {perBatchCents}}), /límite/);
  await assert.rejects(s0f.generate('cazadora', {runDir: 'relative'}), /absoluto/);
});
test('incomplete run resumes only missing strips and source contract changes fail closed', async () => {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 's0f-retry-'));
  const calls = new Map(); let fail = true;
  const retryFixture = {...fixture, generate: async j => {
    calls.set(j.id, (calls.get(j.id) || 0) + 1);
    if (j.id !== 'idle_down-0' && fail) throw Error('fixture interrupted');
    return fixture.generate(j);
  }};
  const opts = {runDir, provider: 'fixture', providers: {fixture: retryFixture}, concurrency: 1};
  const first = await s0f.generate('cazadora', opts); assert.equal(first.state, 'BLOCKED');
  fail = false;
  const second = await s0f.generate('cazadora', opts); assert.equal(second.complete_requested, true); assert.equal(calls.get('idle_down-0'), 1);
  const contractPath = path.join(runDir, 'contract.json'), c = JSON.parse(fs.readFileSync(contractPath)); c.refH++;
  fs.writeFileSync(contractPath, JSON.stringify(c));
  assert.throws(() => s0f.preview('cazadora', runDir), /cambiaron el contrato/);
});
test('lease loss prevents every subsequent billable mock request', async () => {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 's0f-lease-'));
  let confirmed = true, calls = 0;
  const leaseFixture = {...fixture, generate: async j => { calls++; const result = await fixture.generate(j); confirmed = false; return result; }};
  const result = await s0f.generate('cazadora', {runDir, provider: 'fixture', providers: {fixture: leaseFixture}, concurrency: 1, shouldContinue: () => confirmed});
  assert.equal(calls, 1); assert.equal(result.state, 'BLOCKED'); assert.equal(result.code, 'BLOCKED_LEASE_LOST');
  assert.equal(result.complete_requested, false);
  assert.equal(JSON.stringify(JSON.parse(fs.readFileSync(path.join(runDir, 'plan.json')))).includes('shouldContinue'), false);
});
test('essential motion gate cannot be offset by a 91.7 average', () => {
  const checks = Object.fromEntries(['dimensiones', 'alfa_binario', 'sin_siluetas_cortadas', 'sin_cuadros_vacios', 'estilo_en_rango_del_roster', 'pies_estables', 'altura_constante_entre_poses', 'animacion_con_movimiento', 'sin_residuos_sueltos', 'escala_vs_sprite_actual', 'tiene_consumidor'].map(k => [k, true]));
  const ev = {score: 91.7, pass_threshold_90: true, critical: 0, checks};
  assert.equal(s0f.evaluationPass(ev), true);
  assert.equal(s0f.evaluationPass({...ev, checks: {...checks, animacion_con_movimiento: false}}), false);
  assert.equal(s0f.evaluationPass({...ev, checks: {...checks, sin_residuos_sueltos: false}}), false);
});
test('exact generated-frame union and unchanged evidence required through fixture approval/install', async () => {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 's0f-proof-'));
  await s0f.generate('cazadora', {runDir, provider: 'fixture', providers: {fixture}, kind: 'animation', action: 'walk_down'});
  const aPath = path.join(runDir, 'assembly.json'), original = fs.readFileSync(aPath), a = JSON.parse(original);
  a.generated_frames.pop(); fs.writeFileSync(aPath, JSON.stringify(a));
  assert.throws(() => s0f.validate('cazadora', runDir), /cuadros generados/);
  fs.writeFileSync(aPath, original);
  assert.equal(s0f.validate('cazadora', runDir).state, 'VALIDATED');
  fs.appendFileSync(aPath, ' ');
  assert.throws(() => s0f.approve('cazadora', 'fixture-only-review', runDir), /evidencia cambió/);
  fs.writeFileSync(aPath, original);
  assert.equal(s0f.approve('cazadora', 'fixture-only-review', runDir).state, 'APPROVED');
  fs.appendFileSync(aPath, ' ');
  assert.throws(() => s0f.integrate('cazadora', runDir), /evidencia cambió/);
  const pp = path.join(runDir, 'plan.json'), p = JSON.parse(fs.readFileSync(pp)); delete p.identity;
  fs.writeFileSync(pp, JSON.stringify(p));
  assert.throws(() => s0f.status('cazadora', runDir), /legacy o identidad incompleta/);
});
test('authored skin uses its own pinned atlas/reference and repairs identity, never base fallback', async () => {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 's0f-skin-plan-'));
  const g = await s0f.generate('cazadora', {runDir, provider: 'runway', dryRun: true, kind: 'skin', skin: 'cazadora_escarcha'});
  assert.equal(g.state, 'PLANNED');
  const c = JSON.parse(fs.readFileSync(path.join(runDir, 'contract.json'))), p = JSON.parse(fs.readFileSync(path.join(runDir, 'plan.json')));
  assert.equal(c.skin, 'cazadora_escarcha'); assert.equal(c.consumerType, 'authored-skin'); assert.equal(c.frames, 24);
  assert.ok(p.jobs.every(j => j.prompt.includes('skin EXISTENTE') && !j.prompt.includes('diseño propio nuevo')));
  const unknown = await s0f.generate('cazadora', {provider: 'runway', dryRun: true, kind: 'skin', skin: 'inexistente'});
  assert.equal(unknown.state, 'BLOCKED'); assert.equal(unknown.code, 'BLOCKED_CONTRACT');
});
test('existing authored skin fixture stages only after all meaningful style gates pass', async () => {
  const skin = 'cazadora_escarcha', runDir = fs.mkdtempSync(path.join(os.tmpdir(), 's0f-skin-e2e-'));
  const contract = readContract('cazadora', {skin}), registry = path.resolve(__dirname, '../../..', contract.registeredIn), before = fs.readFileSync(registry);
  let destination;
  try {
    const g = await s0f.generate('cazadora', {runDir, provider: 'fixture', providers: {fixture: createFixture(skin)}, kind: 'skin', skin});
    assert.equal(g.complete_requested, true);
    const v = s0f.validate('cazadora', runDir), ev = JSON.parse(fs.readFileSync(path.join(runDir, 'evaluation.json')));
    assert.equal(v.state, 'VALIDATED', JSON.stringify(v)); assert.equal(ev.checks.estilo_en_rango_del_roster, true);
    assert.equal(ev.diagnostics.find(d => d.metric === 'shade_sd').gating, false);
    assert.ok(ev.style_metrics.shade_sd > ev.diagnostics[0].roster_range[1]);
    s0f.approve('cazadora', 'fixture-only-review', runDir);
    const staged = s0f.integrate('cazadora', runDir); destination = path.dirname(path.resolve(__dirname, '../../..', staged.destination));
    assert.equal(staged.state, 'STAGED_REVIEW_ONLY'); assert.equal(staged.runtimeActive, false);
    assert.ok(staged.destination.includes('/skins/cazadora_escarcha/'));
    const manifest = JSON.parse(fs.readFileSync(path.join(runDir, 'integration.json')));
    assert.match(manifest.registration.after, /authoredPacks/); assert.equal(fs.readFileSync(registry).equals(before), true);
  } finally { if (destination) fs.rmSync(destination, {recursive: true, force: true}); }
});
test('whole-order preflight rejects insufficient batch/day budget before any provider call', async () => {
  let calls = 0;
  const paidFixture = {...fixture, estimate: () => ({estimated_cents_max: 10}), generate: async j => { calls++; return fixture.generate(j); }};
  const opts = {provider: 'fixture', providers: {fixture: paidFixture}, skin: 'cazadora_escarcha', kind: 'skin'};
  const batch = await s0f.generate('cazadora', {...opts, limits: {perBatchCents: 130}});
  assert.equal(batch.code, 'BLOCKED_BUDGET'); assert.equal(batch.max_cents, 180); assert.equal(calls, 0);
  const day = await s0f.generate('cazadora', {...opts, limits: {perBatchCents: 180, perDayCents: 179}});
  assert.equal(day.code, 'BLOCKED_BUDGET'); assert.equal(calls, 0);
});
test('complete base and existing skin prompts fit Runway including two reference tags in UTF-16', () => {
  for (const skin of [undefined, 'cazadora_escarcha']) {
    const jobs = s0f.plan(readContract('cazadora', {skin}), {kind: skin ? 'skin' : 'champion', skin});
    assert.equal(jobs.length, skin ? 18 : 13);
    for (const job of jobs) {
      const submitted = job.prompt + ' @ref1 @ref2 (referencias de identidad y de poses).';
      assert.ok(submitted.length >= 1 && submitted.length <= 1000, `${skin || 'base'}/${job.id}: ${submitted.length} UTF-16 units`);
      if (skin) for (const text of ['skin EXISTENTE', 'identidad', 'diseño', 'paleta', 'ropa', 'arma', 'silueta', 'no crear skin ni recolorear base']) assert.ok(job.prompt.includes(text));
    }
  }
});
test('whole-plan preflight rejects an oversized contract prompt before any generation', () => {
  const contract = {...readContract('cazadora'), id: 'x'.repeat(1000)};
  assert.throws(() => s0f.plan(contract), e => e.code === 'BLOCKED_CONTRACT' && /1000 unidades UTF-16|provider limit/.test(e.message));
});
test('controlled frame probe reuses exact full mixed-plan job and splits only difficult walking clips', () => {
  const c = readContract('cazadora'), opts = {generationMode:'single-frame',frameClips:['walk_down']};
  const full = s0f.plan(c, opts), probe = s0f.plan(c, {...opts, kind:'animation', action:'walk_down', frameIndices:[3]});
  assert.equal(full.length,16); assert.equal(probe.length,1); assert.equal(probe[0].id,'walk_down-frame-3');
  assert.deepEqual(probe[0],full.find(j=>j.id==='walk_down-frame-3'));
  assert.equal(probe[0].guidePhase,3); assert.equal(probe[0].recipe.id,'controlled-walk-frame-v4');
  assert.match(probe[0].prompt,/rodilla IZQUIERDA de PANTALLA levantada/); assert.match(probe[0].prompt,/margen vacío mínimo20%/);
  assert.ok(full.filter(j=>j.clip!=='walk_down').every(j=>j.generationMethod===undefined));
  assert.equal(s0f.plan(readContract('cazadora',{skin:'cazadora_escarcha'}),{...opts,skin:'cazadora_escarcha'}).length,19);
  for(const bad of [{frameIndices:[3]}, {...opts,action:'walk_down',frameIndices:[3,3]}, {...opts,action:'walk_down',frameIndices:[99]}, {...opts,action:'idle_down',frameIndices:[3]}, {...opts,frameClips:['attack_down']}, {generationMode:'invented'}]) assert.throws(()=>s0f.plan(c,bad),e=>e.code==='BLOCKED_CONTRACT');
});
test('controlled dry-run estimates one probe and full mixed order without any provider call', async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'v4-cost-'));
  const probe=await s0f.generate('cazadora',{provider:'runway',dryRun:true,generationMode:'single-frame',kind:'animation',action:'walk_down',frameIndices:[3],runDir:path.join(root,'probe')});
  const full=await s0f.generate('cazadora',{provider:'runway',dryRun:true,generationMode:'single-frame',runDir:path.join(root,'full')});
  assert.equal(probe.jobs,1);assert.equal(probe.max_cents,10);assert.equal(full.jobs,16);assert.equal(full.max_cents,160);
  const skin=await s0f.generate('cazadora',{provider:'runway',dryRun:true,generationMode:'single-frame',kind:'skin',skin:'cazadora_escarcha',runDir:path.join(root,'skin')});
  assert.equal(skin.jobs,19);assert.equal(skin.max_cents,190);
});
