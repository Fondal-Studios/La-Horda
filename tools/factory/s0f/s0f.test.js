'use strict';
// Prueba de extremo a extremo del pipeline con un proveedor FIXTURE (solo para pruebas: devuelve la propia referencia actual).
// NO es generación de IA y nunca se usa como evidencia del piloto: sirve para probar contrato → ensamblado → atlas → validación → estados.
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
process.env.FONDAL_JOBS_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 's0f-jobs-')); process.env.FONDAL_SPEND_LEDGER = path.join(process.env.FONDAL_JOBS_ROOT, 'spend.json');
['BFL_API_KEY', 'ART_GEN_API_KEY', 'OPENAI_API_KEY'].forEach(k => delete process.env[k]);
const s0f = require('./s0f'), {readContract} = require('./contract');
const fixture = {name: 'fixture-test-only', estimate: j => ({estimated_cents_max: 0}), generate: async j => ({status: 'GENERATED', cached: false, file: j.references.at(-1), cost_cents: 0})};
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
