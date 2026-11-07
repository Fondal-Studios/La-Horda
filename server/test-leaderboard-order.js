'use strict';
// Ranking de la Horda Infinita (beta): manda la RONDA sobrevivida por cada jugador; el puntaje solo desempata.
const assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { create } = require('./accounts');
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'horda-lborder-'));
  const pg = process.env.HORDA_TEST_PG_URL || '';   // opcional: base localhost vacía horda_test_* para probar el SQL
  const app = create({ dataDir: dir, databaseUrl: pg, adminUsers: '', log: () => {}, originAllowed: () => true });
  await app.ready;
  const st = app.store, W = '2026-W40', t = 1e12;
  const ids = [];
  for (const n of ['u1', 'u2', 'u3']) ids.push((await st.createUser({ userKey: n, user: n, name: n, email: null, passHash: 'x', createdAt: t, lastLogin: null })).id);
  const [U1, U2, U3] = ids;
  const a = await st.lbPut(W, U1, 'mago', { score: 1000, round: 10, durationMs: 600000, at: t });
  const b = await st.lbPut(W, U2, 'mago', { score: 90000, round: 9, durationMs: 600000, at: t + 1 });
  assert(a.improved && b.improved);
  let top = await st.lbTop(W, null, 10);
  assert.deepEqual(top.map(r => r.userId), [U1, U2], 'más ronda gana aunque tenga menos puntaje');
  // misma ronda: desempata el puntaje
  await st.lbPut(W, U3, 'mago', { score: 5000, round: 10, durationMs: 700000, at: t + 2 });
  top = await st.lbTop(W, null, 10);
  assert.deepEqual(top.map(r => r.userId), [U3, U1, U2], 'misma ronda: gana el puntaje');
  // subir de ronda reemplaza aunque el puntaje sea menor; bajar de ronda con más puntaje NO reemplaza
  const up = await st.lbPut(W, U2, 'mago', { score: 10, round: 11, durationMs: 800000, at: t + 3 });
  assert(up.improved);
  const down = await st.lbPut(W, U2, 'mago', { score: 99999, round: 8, durationMs: 800000, at: t + 4 });
  assert(!down.improved, 'menos rondas no mejora, por mucho puntaje');
  top = await st.lbTop(W, null, 10);
  assert.deepEqual(top.map(r => r.userId), [U2, U3, U1]);
  const r1 = await st.lbRank(W, null, U1); assert.equal(r1.rank, 3);
  console.log('PASS leaderboard order (' + (pg ? 'postgres' : 'archivo') + '): ronda personal primero, puntaje desempata.');
  if (app.close) await app.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
