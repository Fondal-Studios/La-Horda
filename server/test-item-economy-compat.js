'use strict';
/* Integración de la economía V2 con lo que ya tenía main: Brasas->piezas por el ledger, botín con el catálogo real (Kit de Magos,
   legendarios de build, roleOnly, mínimos de arena), fuentes viejas (misiones, cofres, regalos, respec, ascensión) y concesiones del
   Game Master. Corre con almacenamiento persistente (la economía solo actúa ahí). */
const assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path'), http = require('node:http'), vm = require('node:vm');
process.env.HORDA_ITEM_ECONOMY = '1'; process.env.DATA_PERSISTENT = '1'; process.env.ADMIN_USERS = 'compatowner';
const { create } = require('./accounts'), wallet = require('./wallet'), LOOT = require('./item-economy-loot');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'horda-compat-'));
let now = Date.parse('2026-10-15T12:00:00Z'), app, server, url, seq = 0, checks = 0;
async function start() { app = create({ dataDir: dir, databaseUrl: process.env.HORDA_TEST_PG_URL || '', now: () => now, log: () => {}, originAllowed: () => true }); await app.ready; server = http.createServer((q, s) => app.handle(q, s) || s.end()); await new Promise(r => server.listen(0, '127.0.0.1', r)); url = 'http://127.0.0.1:' + server.address().port; }
async function stop() { await new Promise(r => server.close(r)); await app.close(); }
async function api(method, p, body, t, status = 200) { const r = await fetch(url + p, { method, headers: { 'content-type': 'application/json', ...(t ? { authorization: 'Bearer ' + t } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) }), j = await r.json(); assert.equal(r.status, status, p + ' ' + JSON.stringify(j)); checks++; return j; }
const action = (t, op, args = {}, status = 200, id = 'cmp_' + (++seq)) => api('POST', '/api/economy/action', { op, args, requestId: id }, t, status);
const premium = async (id) => (await app.store.walletGet(id)).premium;
(async () => {
  assert.equal(wallet.pricing().__flags().PIECES_FOR_BRASAS, true, 'PIECES_FOR_BRASAS sigue en true (decisión del dueño)');
  wallet.setTestFlags({ SHOP_MODE: 'demo' });
  await start();
  const owner = await api('POST', '/api/register', { user: 'compatowner', pass: 'test-long-password' }, null, 201), user = await api('POST', '/api/register', { user: 'compatplayer', pass: 'test-long-password' }, null, 201);
  const uid = (await app.store.getUserByKey('compatplayer')).id, id = String(uid);
  await app.store.putSave(uid, JSON.stringify({ gold: 100, gems: 2, stash: [], champions: { tanque: { unlocked: true, equipment: {} } }, cosmeticUnlocks: {} }), {}, 0, false);
  await api('GET', '/api/economy', undefined, user.token);

  /* ---------- (a) Brasas -> pieza de set por el ledger ---------- */
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'shop-pieces.json'), 'utf8')), pieceId = Object.keys(db.pieces)[0];
  await app.store.walletApply({ userId: uid, delta: 1000, reason: 'test', ref: 'compat_seed', actor: uid, at: now });
  const buy = (ref, piece = pieceId) => api('POST', '/api/wallet/buy-piece', { piece, ref, expectedPrice: 200 }, user.token, 200);
  const b1 = await buy('compat_ref_00001');
  assert.equal(b1.ledger, true); assert.equal(await premium(uid), 800);
  let eco = await api('GET', '/api/economy', undefined, user.token);
  const mine = eco.items.filter(it => it.designId === pieceId);
  assert.equal(mine.length, 1); assert.equal(mine[0].uid, b1.piece.uid); assert.equal(mine[0].bought, true); assert.equal(mine[0].owner, id);
  assert.ok(eco.projection.stash.some(it => it.uid === b1.piece.uid), 'la pieza aparece en el Arsenal/proyección');
  const b2 = await buy('compat_ref_00001'); assert.equal(b2.repeated, true); assert.equal(await premium(uid), 800);   // misma referencia: no cobra ni duplica
  eco = await api('GET', '/api/economy', undefined, user.token); assert.equal(eco.items.filter(it => it.designId === pieceId).length, 1);
  await api('POST', '/api/wallet/buy-piece', { piece: pieceId, ref: 'compat_ref_00002', expectedPrice: 200 }, user.token, 409);   // OWNED
  assert.equal(await premium(uid), 800);
  // un PUT de guardado no puede reemplazar el inventario autoritativo
  const cloud = await api('GET', '/api/save', undefined, user.token);
  await api('PUT', '/api/save', { baseVersion: cloud.version, data: { ...cloud.data, stash: [] } }, user.token);
  assert.ok((await api('GET', '/api/save', undefined, user.token)).data.stash.some(it => it.uid === b1.piece.uid));
  // saldo insuficiente: nada se entrega
  const pieceB = Object.keys(db.pieces)[1];
  await app.store.walletApply({ userId: uid, delta: -(await premium(uid)), reason: 'test', ref: 'compat_drain', actor: uid, at: now });
  await api('POST', '/api/wallet/buy-piece', { piece: pieceB, ref: 'compat_ref_00003', expectedPrice: 200 }, user.token, 402);
  eco = await api('GET', '/api/economy', undefined, user.token); assert.equal(eco.items.filter(it => it.designId === pieceB).length, 0);

  /* ---------- (b) botín: mismo catálogo y reglas que el cliente ---------- */
  let magePieces = 0, buildPieces = 0, early = 0;
  for (let i = 0; i < 1500; i++) {
    const it = LOOT.rollOne({ arena: 'ciudad', grade: 'S+', champion: 'tanque', source: 'chest', endless: false }).item;
    if (it && (it.magePower || it.buildPower)) early++;
  }
  assert.equal(early, 0, 'en la arena 1 de campaña no caen legendarios de build ni del Kit de Magos (mínimos de arena)');
  for (let i = 0; i < 6000; i++) {
    const it = LOOT.rollOne({ arena: 'infernal', grade: 'S+', champion: 'mago', source: i % 2 ? 'ground' : 'chest', highMult: 1, endless: true }).item;
    if (!it) continue;
    if (it.magePower) { magePieces++; assert.equal(it.roleOnly, 'mago'); assert.equal(LOOT.canEquip(it, 'tanque'), false); assert.equal(LOOT.canEquip(it, 'mago'), true); }
    if (it.buildPower) buildPieces++;
  }
  assert.ok(magePieces > 0, 'el servidor emite piezas del Kit de Magos'); assert.ok(buildPieces > 0, 'el servidor emite legendarios de build');
  // roleOnly se respeta al equipar
  const gmLedger = async (fn) => app.store.gmUpdate(async raw => { fn(raw.itemEconomy, raw.itemEconomy.accounts[id]); return { state: raw, value: null }; });
  const rawKit = LOOT.designedItem('mku_corona_voz');
  assert.ok(rawKit && rawKit.roleOnly === 'mago');
  await gmLedger((s, a) => { s.items.kit1 = { ...rawKit, uid: 'kit1', owner: id, level: 1, passives: [], affixes: [] }; });
  await action(user.token, 'equip', { champion: 'tanque', item: 'kit1' }, 400);   // INCOMPATIBLE_ITEM
  // partida real con el ledger: la pieza que sale es del catálogo
  const run = (await action(user.token, 'run.start', { arena: 'infernal', champion: 'tanque', mode: 'endless' })).run;
  for (let i = 0; i < 3; i++) { now += 50000; await action(user.token, 'run.pulse', { run: run.id, round: 1 + i }); }
  const lootRes = await action(user.token, 'run.loot', { run: run.id, rank: 'jefe', build: true });
  assert.equal(lootRes.items.length, 1); assert.equal(typeof lootRes.items[0].name, 'string');
  const fin = await action(user.token, 'run.finish', { run: run.id, durationMs: 150000, round: 4, score: 1000, victory: false });
  assert.ok(fin.items.length >= 0);

  /* ---------- (c) fuentes viejas ---------- */
  const goldOf = async () => (await api('GET', '/api/economy', undefined, user.token)).account.gold;
  const g0 = await goldOf();
  const claim = await action(user.token, 'reward.claim', { source: 'quest', gold: 300, gems: 1 }, 200, 'claim_a1');
  assert.equal(await goldOf(), g0 + 300);
  await action(user.token, 'reward.claim', { source: 'quest', gold: 300, gems: 1 }, 200, 'claim_a1');           // mismo requestId: no duplica
  assert.equal(await goldOf(), g0 + 300);
  await action(user.token, 'reward.claim', { source: 'quest', gold: 999999 }, 400);                              // monto elegido por el cliente: rechazado
  await action(user.token, 'reward.claim', { source: 'hack', gold: 1 }, 400);
  for (let i = 0; i < 11; i++) await action(user.token, 'reward.claim', { source: 'quest', gold: 5000 }, 200, 'claim_cap_' + i);
  await action(user.token, 'reward.claim', { source: 'quest', gold: 5000 }, 409, 'claim_cap_x');                  // tope diario
  const quests = vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/data/quests.js'), 'utf8') + ';QUEST_CHESTS');
  const live = require('./item-economy-live');
  assert.ok(live.QUEST_CHESTS, 'QUEST_CHESTS exportado'); assert.deepEqual(JSON.parse(JSON.stringify(live.QUEST_CHESTS)), JSON.parse(JSON.stringify(quests)), 'el espejo del servidor coincide con js/data/quests.js');
  const chest = await action(user.token, 'chest.open', { variant: 4, arena: 'ciudad', champion: 'tanque' }, 200, 'chest_1');
  assert.equal(chest.items.length, 2); assert.equal(chest.gems, 4);
  const chestAgain = await action(user.token, 'chest.open', { variant: 4, arena: 'ciudad', champion: 'tanque' }, 200, 'chest_1');
  assert.deepEqual(chestAgain.items.map(x => x.uid), chest.items.map(x => x.uid));                               // idempotente
  await action(user.token, 'chest.open', { variant: 9, arena: 'ciudad', champion: 'tanque' }, 400);
  await action(user.token, 'chest.open', { variant: 1, arena: 'ciudad', champion: 'mago' }, 403);              // campeón no desbloqueado
  const set = db.pieces[pieceId].set, gift = await action(user.token, 'gift.set', { set }, 200, 'gift_1');
  assert.ok(gift.items.length >= 1); assert.ok(!gift.items.some(it => it.designId === pieceId), 'no duplica la pieza que ya tenía');
  await action(user.token, 'gift.set', { set: 'no_existe' }, 400);
  const before = await goldOf(); await action(user.token, 'spend', { amount: 500, reason: 'talent.respec' }); assert.equal(await goldOf(), before - 500);
  await action(user.token, 'spend', { amount: 1e7, reason: 'talent.respec' }, 409); await action(user.token, 'spend', { amount: 5, reason: 'otra' }, 400);
  await action(user.token, 'ascension.unlock', { champion: 'aurelia' }); assert.ok((await api('GET', '/api/economy', undefined, user.token)).account.unlocked.includes('aurelia'));
  await action(user.token, 'ascension.unlock', { champion: 'tanque' }, 403);

  /* ---------- (d) Game Master sobre una cuenta con ledger ---------- */
  const ver = async () => (await api('GET', '/api/save', undefined, user.token)).version;
  await api('POST', '/api/gm/user/currency', { id: uid, field: 'gold', value: 7777, baseVersion: await ver(), confirm: true, reason: 'test' }, owner.token);
  assert.equal(await goldOf(), 7777);
  await api('POST', '/api/gm/user/mailbox', { id: uid, kind: 'set', ref: 'alba', baseVersion: await ver(), reason: 'test' }, owner.token);
  eco = await api('GET', '/api/economy', undefined, user.token);
  assert.ok(eco.items.filter(it => it.set === 'alba' && it.gift).length >= 1, 'el set concedido llega al ledger');
  const grantable = 'mago';
  await api('POST', '/api/gm/user/champion', { id: uid, champion: grantable, action: 'grant', baseVersion: await ver(), reason: 'test' }, owner.token);
  assert.ok((await api('GET', '/api/economy', undefined, user.token)).account.unlocked.includes(grantable));

  const state = await app.store.gmRead(); await stop(); await start(); assert.deepEqual(await app.store.gmRead(), state);
  await stop(); fs.rmSync(dir, { recursive: true, force: true });
  console.log(`PASS item economy compat: ${checks} HTTP assertions; Brasas->pieza por ledger, botín con kit de magos/roleOnly, fuentes viejas, Game Master`);
})().catch(async e => { console.error(e); if (server?.listening) await stop(); process.exitCode = 1; });
