'use strict';
// Prueba de extremo a extremo del pipeline con un proveedor FIXTURE (solo para pruebas: devuelve la propia referencia actual).
// NO es generación de IA y nunca se usa como evidencia del piloto: sirve para probar contrato → ensamblado → atlas → validación → estados.
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
process.env.FONDAL_JOBS_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 's0f-jobs-')); process.env.FONDAL_SPEND_LEDGER = path.join(process.env.FONDAL_JOBS_ROOT, 'spend.json');
['BFL_API_KEY', 'ART_GEN_API_KEY', 'OPENAI_API_KEY'].forEach(k => delete process.env[k]);
const s0f = require('./s0f'), {readContract} = require('./contract');
// Proveedor FIXTURE (solo pruebas): compone una tira horizontal con las poses ACTUALES, como lo haría un proveedor que devuelve tiras. No es IA.
const fixture = {name: 'fixture-test-only', estimate: j => ({estimated_cents_max: 0}), generate: async j => {
  const out = path.join(os.tmpdir(), 'fixture-' + j.id + '.png'), cj = path.join(process.env.FONDAL_JOBS_ROOT, 'fixture-contract.json'); fs.writeFileSync(cj, JSON.stringify(readContract('cazadora')));
  const r = require('node:child_process').spawnSync('python3', ['-c', `
import sys, json; sys.path.insert(0, '${path.resolve(__dirname, '..').replace(/\\/g, '/')}')
import art_factory as af
from PIL import Image
c = json.load(open('${cj}')); cells = af.cells_of(af.load(af.ROOT / c['atlas']), c['cell']['w'], c['cell']['h'], c['cols']); fr = json.loads('${JSON.stringify(j.frames)}')
cw, ch = c['cell']['w'], c['cell']['h']; strip = Image.new('RGBA', ((cw + 40) * len(fr), ch), (0, 0, 0, 0))
for k, i in enumerate(fr): strip.paste(Image.fromarray(cells[i], 'RGBA'), (k * (cw + 40) + 20, 0))
strip.save('${out}')`], {encoding: 'utf8'}); if (r.status !== 0) throw Error(r.stderr);
  return {status: 'GENERATED', cached: false, file: out, cost_cents: 0}; }};
test('contrato real de Sylva (no 36 poses) y de Libertador distinto; Tanque sin contrato literal => BLOCKED_CONTRACT', () => {
  const c = readContract('cazadora'); assert.equal(c.cell.w, 192); assert.equal(c.frames, 52); assert.notEqual(c.frames, 36);
  assert.notDeepEqual(readContract('libertador').cell, c.cell); assert.equal(readContract('tanque').kind, 'unsupported');
});
test('sin clave: dry-run => PLANNED; real => BLOCKED_CREDENTIAL con gasto 0 y sin atlas', async () => {
  const a = await s0f.generate('cazadora', {provider: 'bfl,openai', dryRun: true}); assert.equal(a.state, 'PLANNED'); assert.equal(a.jobs, 13);
  const b = await s0f.generate('cazadora', {provider: 'bfl,openai'}); assert.equal(b.state, 'BLOCKED'); assert.match(b.reason, /BLOCKED_CREDENTIAL/); assert.equal(b.spent_cents, 0);
  assert.equal(fs.existsSync(path.join(b.dir, 'atlas.png')), false);
});
test('pipeline completo con fixture: GENERATED -> VALIDATED -> APPROVED (y integrate exige aprobación)', async () => {
  const g = await s0f.generate('cazadora', {provider: 'fixture', providers: {fixture}, kind: 'animation', action: 'walk_down'});
  assert.equal(g.state, 'GENERATED'); assert.ok(g.coverage_pct > 0 && g.coverage_pct < 100); // el resto se hereda y se declara
  assert.throws(() => s0f.integrate('cazadora'), /exige APPROVED/);
  const v = s0f.validate('cazadora'); assert.equal(v.critical, 0); assert.equal(v.state, 'VALIDATED', JSON.stringify(v.defects));
  assert.throws(() => s0f.approve('cazadora'), /--reviewer/);
  assert.equal(s0f.approve('cazadora', 'revisor-humano').state, 'APPROVED');
  const dest = path.join(readContract('cazadora').atlas, '../../codex-v2');
  const abs = path.resolve(__dirname, '../../..', dest); assert.equal(fs.existsSync(abs), false);
  try { assert.equal(s0f.integrate('cazadora').state, 'INTEGRATED'); assert.throws(() => s0f.integrate('cazadora'), /exige APPROVED|ya existe/); } finally { fs.rmSync(abs, {recursive: true, force: true}); }
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
