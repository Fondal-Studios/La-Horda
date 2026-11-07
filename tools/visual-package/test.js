'use strict';
const {test} = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), L = require('./lib');
const stored = JSON.parse(fs.readFileSync(path.join(L.ROOT, 'assets/visual-packages/manifest.v1.json'), 'utf8'));
test('el manifiesto coincide con las registraciones reales y todo paquete integrado es válido', () => {
  assert.equal(JSON.stringify(stored), JSON.stringify(L.buildManifest()));
  assert.deepEqual(stored.packages.flatMap(p => L.validatePackage(p)), []);
  assert.ok(stored.packages.length > 80);
});
test('un archivo alterado se detecta por sha256', () => {
  const p = JSON.parse(JSON.stringify(stored.packages[0])); p.atlas.sha256 = '0'.repeat(64);
  assert.ok(L.validatePackage(p).some(e => /sha256/.test(e)));
});
function candidate() {
  const base = JSON.parse(JSON.stringify(stored.packages.find(p => p.id === 'axiom')));
  return Object.assign(base, {legacy: false, packageVersion: '1.1.0', fallback: 'axiom', champion: 'axiom',
    timings: Object.fromEntries(Object.keys(base.states).map(k => [k, 8])), attachmentPoints: {weapon: null, fx: null},
    lifecycle: {generated: 'pass', technicalValidation: 'pending', visualApproval: 'pending', integrated: 'pending', inGameVerification: 'pending'}});
}
test('candidato incompleto es rechazado con la causa', () => {
  const states = candidate().states, c0 = candidate();
  for (const [mut, re] of [[c => { c.timings = null; }, /timings/], [c => { c.attachmentPoints = null; }, /attachmentPoints/], [c => { c.fallback = null; }, /fallback/],
    [c => { c.lifecycle.visualApproval = 'approved'; }, /aprobación visual exige/], [c => { c.lifecycle.inGameVerification = 'pass'; }, /verificación en partida exige/],
    [c => { c.packageVersion = 'x'; }, /semver/], [c => { for (const k of Object.keys(c.states)) if (/_up$/.test(k)) delete c.states[k]; }, /direcciones/]]) {
    const c = candidate(); mut(c);
    assert.ok(L.validatePackage(c, L.ROOT, {strict: true}).some(e => re.test(e)), String(re));
  }
  assert.deepEqual(L.validatePackage(c0, L.ROOT, {strict: true}), [], states && 'un candidato completo y pendiente es válido');
});
// ---- runtime (js/assets/visual-packages.js) con Image simulada
function loadRuntime(dims, fail) {
  const registered = [];
  const root = {console: {warn() {}}, CHAMP_PACK: {axiom: {id: 'integrado'}}, champPackLoadAtlas: (k, s, m) => registered.push({k, s, m}),
    Image: class { set src(v) { setImmediate(() => fail ? this.onerror() : (this.naturalWidth = dims[0], this.naturalHeight = dims[1], this.onload())); } }};
  const vm = require('node:vm'); vm.runInNewContext(fs.readFileSync(path.join(L.ROOT, 'js/assets/visual-packages.js'), 'utf8'), Object.assign(root, {globalThis: root, window: undefined}));
  return {root, registered, VP: root.VisualPackages};
}
const wait = () => new Promise(r => setTimeout(r, 20));
test('runtime: candidato aprobado y activado con dimensiones correctas reemplaza al integrado', async () => {
  const c = candidate(); c.lifecycle.technicalValidation = 'pass'; c.lifecycle.visualApproval = 'approved'; c.activation = {enabled: true};
  const {VP, registered} = loadRuntime([c.atlas.width, c.atlas.height]); VP.apply([c]); await wait();
  assert.equal(registered.length, 1); assert.equal(registered[0].k, 'axiom'); assert.equal(registered[0].m.cols, c.grid.cols); assert.equal(VP.report().active[0].candidate, c.id);
});
test('runtime: dimensiones incorrectas o error de carga conservan el respaldo y lo registran', async () => {
  const c = candidate(); c.lifecycle.technicalValidation = 'pass'; c.lifecycle.visualApproval = 'approved'; c.activation = {enabled: true};
  for (const [dims, fail] of [[[1, 1], false], [[0, 0], true]]) {
    const {VP, registered} = loadRuntime(dims, fail); VP.apply([c]); await wait();
    assert.equal(registered.length, 0); assert.ok(VP.report().log.some(l => l.kind === 'fallback')); assert.equal(VP.report().active.length, 0);
  }
});
test('runtime: sin activación o sin aprobación nunca reemplaza', async () => {
  for (const mut of [c => { c.activation = {enabled: false}; }, c => { c.activation = {enabled: true}; c.lifecycle.visualApproval = 'pending'; }, c => { c.activation = {enabled: true}; c.lifecycle.technicalValidation = 'pending'; c.lifecycle.visualApproval = 'approved'; }]) {
    const c = candidate(); mut(c); const {VP, registered} = loadRuntime([c.atlas.width, c.atlas.height]); VP.apply([c]); await wait(); assert.equal(registered.length, 0);
  }
});
