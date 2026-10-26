'use strict';
/* Integración V2 + main en el navegador, con servidor propio y base persistente en memoria de disco temporal:
   (1) sin cuenta: premio ganado con la bolsa llena -> Recompensas pendientes (comportamiento de main);
   (2) con cuenta y V2 activa: ese mismo camino no pierde nada (el ledger es el inventario) y las fuentes viejas
       (misión, cofre de misión, Brasas->pieza) pasan por el servidor;
   (3) la pestaña Set de la Tienda no se rompe con los conjuntos Míticos V2. */
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
process.env.DATA_PERSISTENT = '1'; process.env.HORDA_ITEM_ECONOMY = '1';
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'horda-compat-ui-')), app = require('../../server/accounts').create({ dataDir: dir, databaseUrl: '', log: () => {}, originAllowed: () => true }); await app.ready;
  const server = http.createServer((q, s) => app.handle(q, s) || s.end()); await new Promise(r => server.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + server.address().port;
  const r = await fetch(base + '/api/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ user: 'compatui', pass: 'test-long-password' }) }), user = await r.json(), id = (await app.store.getUserByKey('compatui')).id;
  await app.store.putSave(id, JSON.stringify({ gold: 1000, gems: 5, stash: [], champions: { tanque: { unlocked: true, equipment: {} } } }), {}, 0, false);
  await app.store.walletApply({ userId: id, delta: 1000, reason: 'test', ref: 'compat_ui_seed', actor: id, at: Date.now() });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 800 } }), errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto((process.env.SE_BASE_URL || 'http://127.0.0.1:8821') + '/index.html', { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => typeof economyOpen === 'function' && typeof save !== 'undefined' && typeof rewardOverflowPush === 'function');
    await page.evaluate(() => { loop = function () {}; });

    // (1) sin cuenta: comportamiento de main
    const offline = await page.evaluate(() => {
      const full = () => { save.stash = []; for (let i = 0; i < INVENTORY_CAPACITY; i++) save.stash.push(makeItem('arma', 'raro', null, { noAffixes: true })); save.rewardOverflow = []; };
      full();
      const active = economyActive();
      const earned = makeItem('arma', 'legendario', null, { noAffixes: true });
      const a = addItemToInventory(null, earned, true);
      const pickup = makeItem('casco', 'raro', null, { noAffixes: true });
      const b = addItemToInventory(null, pickup, false);   // recogida nueva con bolsa llena: reserva visible (V2 client) -> overflow
      return { active, earned: !!a, pending: rewardOverflowCount(), stash: save.stash.length, pickupReserved: !!b && b.overflow === true };
    });
    assert.equal(offline.active, false); assert.equal(offline.earned, true);
    assert.equal(offline.pending, 1, 'el premio ganado con la bolsa llena queda en Recompensas pendientes');
    assert.equal(offline.stash, 31, 'la recogida nueva entró a la reserva; el premio no sobrescribió el inventario');
    assert.equal(offline.pickupReserved, true);

    // (2) con cuenta y V2 activa
    await page.evaluate(async ({ base, token }) => {
      save.stash = []; save.rewardOverflow = [];
      accountState = () => ({ logged: true, user: 'compatui' });
      accountFetch = async (method, p, b) => { const r = await fetch(base + p, { method, headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' }, body: b === undefined ? undefined : JSON.stringify(b) }); return { status: r.status, j: await r.json() }; };
      await economyRefresh();
    }, { base, token: user.token });
    assert.equal(await page.evaluate(() => economyActive()), true);
    const gold0 = await page.evaluate(() => ECON.data.account.gold);
    // premio ganado: la V2 no lo escribe en el guardado ni en el buzón (el servidor lo entrega por el recibo)
    const v2 = await page.evaluate(() => { const it = makeItem('arma', 'legendario', null, { noAffixes: true }); return { r: addItemToInventory(null, it, true), pending: rewardOverflowCount() }; });
    assert.equal(v2.r, null); assert.equal(v2.pending, 0);
    // misión: oro por el servidor, idempotente ante reintento
    await page.evaluate(() => { questsGrant({ gold: 400, gems: 1 }, true); });
    await page.waitForFunction(g => ECON.data.account.gold === g + 400, gold0);
    assert.equal(await page.evaluate(() => save.gold), gold0 + 400);
    await page.evaluate(() => economyFlushClaims());
    assert.equal(await page.evaluate(() => ECON.data.account.gold), gold0 + 400, 'la cola no duplica');
    assert.equal(await page.evaluate(() => (JSON.parse(localStorage.getItem('horda_economy_claims') || '[]')).length), 0);
    // cofre de misión: el cofre local se consume cuando el servidor respondió y el objeto queda en el ledger
    const n0 = await page.evaluate(() => ECON.data.items.length);
    await page.evaluate(() => { const q = questsState(); q.chests = [2]; questsOpenChestUI(); });
    await page.waitForFunction(n => ECON.data.items.length > n, n0);
    assert.equal(await page.evaluate(() => questsState().chests.length), 0);
    await page.evaluate(() => { document.querySelectorAll('.qs-chest-ov').forEach(o => o.remove()); });
    // Brasas -> pieza por el ledger y aparece en el inventario proyectado
    const piece = await page.evaluate(() => Object.keys(DESIGNED_ITEMS).find(k => premiumPieceEntry(k) && !premiumPieceOwned(k)));
    const buy = await fetch(base + '/api/wallet/buy-piece', { method: 'POST', headers: { authorization: 'Bearer ' + user.token, 'content-type': 'application/json' }, body: JSON.stringify({ piece, ref: 'compat_ui_buy_0001', expectedPrice: 200 }) }), bj = await buy.json();
    assert.equal(buy.status, 200, JSON.stringify(bj)); assert.equal(bj.ledger, true);
    await page.evaluate(j => premiumApplyPiece(j), bj);
    await page.waitForFunction(p => save.stash.some(it => it.designId === p), piece);
    assert.equal(await page.evaluate(p => save.stash.filter(it => it.designId === p).length, piece), 1);

    // (3) la Tienda no se rompe con los conjuntos Míticos V2
    const shop = await page.evaluate(() => { shopCat = 'set'; const panel = document.createElement('div'); renderShopObjects(panel); return { html: panel.innerHTML.length, hidden: ['lucifer', 'glaciar', 'coloso', 'tempestad', 'alba'].every(s => !panel.querySelector('[data-set="' + s + '"]')) }; });
    assert.ok(shop.html > 100); assert.equal(shop.hidden, true);
    assert.deepEqual(errors, []);
    console.log('PASS integración V2/main en navegador: desborde sin cuenta (Recompensas pendientes) y con cuenta (ledger), misión idempotente, cofre de misión, Brasas->pieza, Tienda sin conjuntos Míticos, sin errores JS');
  } finally { await browser.close(); await new Promise(r => server.close(r)); await app.close(); fs.rmSync(dir, { recursive: true, force: true }); }
})().catch(e => { console.error(e); process.exitCode = 1; });
