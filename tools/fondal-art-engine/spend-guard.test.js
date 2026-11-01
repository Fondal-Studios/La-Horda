'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const {SpendGuard} = require('./spend-guard');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'sg-'));
test('exige ruta absoluta', () => assert.throws(() => new SpendGuard({ledgerPath: 'rel.json'})));
test('tope por tarea, lote y día', () => {
  const d = tmp(), g = new SpendGuard({ledgerPath: path.join(d, 'l.json'), limits: {perTaskCents: 20, perBatchCents: 30, perDayCents: 50}});
  assert.throws(() => g.reserve({batch: 'b', task: 't0', cents: 21}), /por tarea/);
  g.reserve({batch: 'b', task: 't1', cents: 20});
  assert.throws(() => g.reserve({batch: 'b', task: 't2', cents: 20}), /por lote/);
  g.reserve({batch: 'b2', task: 't3', cents: 20});
  assert.throws(() => g.reserve({batch: 'b3', task: 't4', cents: 20}), /diario/);
  assert.equal(g.spentTodayCents(), 40);
});
test('no reserva dos veces la misma tarea (sin reintento ciego)', () => {
  const g = new SpendGuard({ledgerPath: path.join(tmp(), 'l.json')}); g.reserve({batch: 'b', task: 't', cents: 5});
  assert.throws(() => g.reserve({batch: 'b', task: 't', cents: 5}), /ya reservada/);
});
test('caché por hash de prompt + referencias', () => {
  const d = tmp(), ref = path.join(d, 'r.png'); fs.writeFileSync(ref, 'x'); const g = new SpendGuard({ledgerPath: path.join(d, 'l.json')});
  const k = SpendGuard.cacheKey({provider: 'p', model: 'm', prompt: 'a', refs: [ref]}); assert.equal(g.cached(k), null);
  g.store(k, Buffer.from('png')); assert.ok(g.cached(k));
  fs.writeFileSync(ref, 'y'); assert.notEqual(SpendGuard.cacheKey({provider: 'p', model: 'm', prompt: 'a', refs: [ref]}), k);
});
test('el libro no guarda claves', () => { const d = tmp(), g = new SpendGuard({ledgerPath: path.join(d, 'l.json')}); process.env.X_KEY = 'sekret'; g.reserve({batch: 'b', task: 't', cents: 1, provider: 'p'}); assert.ok(!fs.readFileSync(path.join(d, 'l.json'), 'utf8').includes('sekret')); });

test('corrupted and historical cache bytes are not reused', () => {
  const d = tmp(), g = new SpendGuard({ledgerPath: path.join(d, 'l.json')}), key = 'a'.repeat(64);
  const file = g.store(key, Buffer.from('original')); fs.writeFileSync(file, 'corrupt'); assert.equal(g.cached(key), null);
  fs.unlinkSync(file + '.sha256'); assert.equal(g.cached(key), null);
});
test('invalid limits and held lock fail closed without losing reservations', () => {
  const d = tmp(), ledgerPath = path.join(d, 'l.json');
  for (const n of [NaN, Infinity, -1, 1.5]) assert.throws(() => new SpendGuard({ledgerPath, limits: {perDayCents: n}}));
  const g = new SpendGuard({ledgerPath}); g.reserve({batch: 'b', task: 'a', cents: 10});
  fs.writeFileSync(ledgerPath + '.lock', ''); assert.throws(() => g.reserve({batch: 'b', task: 'b', cents: 10}), /locked/);
  assert.equal(g.spentTodayCents(), 10); fs.unlinkSync(ledgerPath + '.lock'); g.reserve({batch: 'b', task: 'b', cents: 10}); assert.equal(g.spentTodayCents(), 20);
});
