"use strict";
// STEAM (servidor): inicio de sesión por ticket, vinculación de cuentas y microtransacciones (InitTxn / QueryTxn / FinalizeTxn)
// contra un Steam FALSO. NO prueba Steam real: hay que repetirlo en sandbox con un AppID real (docs/steam/STEAMWORKS_GUIA.md §4).
process.env.DATA_PERSISTENT = '1'; // directorio temporal aislado: solo simula la compuerta de almacenamiento persistente
process.env.PORT = '8826'; process.env.DATABASE_URL = ''; process.env.ALLOWED_ORIGINS = 'http://127.0.0.1:8803';
process.env.PAYMENTS_PROVIDER = 'steam'; process.env.STEAM_ENABLED = '1'; process.env.STEAM_APP_ID = '480';
process.env.STEAM_PUBLISHER_KEY = 'ABCDEF0123456789ABCDEF0123456789'; process.env.STEAM_MODE = 'sandbox';
const fs = require('fs'), os = require('os'), path = require('path');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'horda-steam-'));
const { server, accounts } = require('./relay');
const steam = require('./steam'), payments = require('./payments');
let fails = 0, n = 0; const check = (name, ok, x) => { n++; if(!ok){ fails++; console.log('FAIL', name, x !== undefined ? JSON.stringify(x).slice(0, 400) : ''); } };
async function api(method, p, body, token){
  const r = await fetch('http://127.0.0.1:8826' + p, { method, headers: { origin: 'http://127.0.0.1:8803', 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  let j = null; try{ j = await r.json(); }catch(e){} return { status: r.status, j };
}
const SID_A = '76561197960265729', SID_B = '76561197960265730', SID_BAN = '76561197960265731', SID_C = '76561197960265732';
// Steam falso: tickets "aa…" -> SID_A, "bb…" -> SID_B, "cc…" -> baneado; pedidos en memoria
const orders = {}, calls = [];
steam._setFetch(async (url, opts) => {
  const u = new URL(url), body = opts && opts.body ? Object.fromEntries(new URLSearchParams(opts.body)) : Object.fromEntries(u.searchParams);
  calls.push({ path: u.pathname, body });
  const ok = (response) => ({ ok: true, status: 200, json: async () => ({ response }) });
  if(body.key !== process.env.STEAM_PUBLISHER_KEY) return { ok: false, status: 403, json: async () => ({}) };
  if(u.pathname.endsWith('/AuthenticateUserTicket/v1/')){
    const t = body.ticket || '';
    if(t.startsWith('aa')) return ok({ params: { result: 'OK', steamid: SID_A, ownersteamid: SID_A, vacbanned: false, publisherbanned: false } });
    if(t.startsWith('bb')) return ok({ params: { result: 'OK', steamid: SID_B, ownersteamid: SID_B, vacbanned: false, publisherbanned: false } });
    if(t.startsWith('dd')) return ok({ params: { result: 'OK', steamid: SID_C, ownersteamid: SID_C, vacbanned: false, publisherbanned: false } });
    if(t.startsWith('cc')) return ok({ params: { result: 'OK', steamid: SID_BAN, ownersteamid: SID_BAN, vacbanned: true, publisherbanned: false } });
    return ok({ error: { errorcode: 3, errordesc: 'Invalid ticket' } });
  }
  if(u.pathname.endsWith('/InitTxn/v3/')){
    if(!u.pathname.includes('ISteamMicroTxnSandbox')) return { ok: false, status: 400, json: async () => ({}) };
    orders[body.orderid] = { status: 'Init', steamid: body.steamid, currency: body.currency, items: [{ itemid: Number(body['itemid[0]']), qty: Number(body['qty[0]']), amount: Number(body['amount[0]']) }] };
    return ok({ result: 'OK', params: { orderid: body.orderid, transid: 'T' + body.orderid } });
  }
  if(u.pathname.endsWith('/QueryTxn/v3/')){
    const o = orders[body.orderid]; if(!o) return ok({ result: 'Failure', error: { errorcode: 7, errordesc: 'order not found' } });
    return ok({ result: 'OK', params: { orderid: body.orderid, status: o.status, steamid: o.steamid, currency: o.currency, items: o.items } });
  }
  if(u.pathname.endsWith('/FinalizeTxn/v2/')){
    const o = orders[body.orderid]; if(!o || o.status !== 'Approved') return ok({ result: 'Failure' });
    o.status = 'Succeeded'; return ok({ result: 'OK', params: { orderid: body.orderid, transid: 'T' + body.orderid } });
  }
  return { ok: false, status: 404, json: async () => ({}) };
});
const premium = async (T) => (await api('GET', '/api/wallet', undefined, T)).j.premium;
(async () => {
  await accounts.ready;
  // ---- identidad ----
  const bad = await api('POST', '/api/steam/login', { ticket: 'ee112233445566778899' });
  check('login: ticket que Steam rechaza -> 401', bad.status === 401, bad);
  check('login: ticket que no es hexadecimal -> 400', (await api('POST', '/api/steam/login', { ticket: 'no-es-hex!' })).status === 400);
  const ban = await api('POST', '/api/steam/login', { ticket: 'cc112233445566778899' });
  check('login: cuenta de Steam con baneo -> 403', ban.status === 403, ban);
  const l1 = await api('POST', '/api/steam/login', { ticket: 'aa112233445566778899', name: 'Cazadora' });
  check('login: la primera vez crea la cuenta (201) y devuelve sesión', l1.status === 201 && l1.j.created === true && l1.j.token && l1.j.user.steam === true, l1);
  const TA = l1.j.token;
  const l2 = await api('POST', '/api/steam/login', { ticket: 'aa998877665544332211' });
  check('login: la segunda vez abre la MISMA cuenta (200)', l2.status === 200 && l2.j.created === false && l2.j.user.user === l1.j.user.user, l2);
  check('login: el cuerpo no puede elegir el steamid (se ignora)', (await api('POST', '/api/steam/login', { ticket: 'bb112233445566778899', steamid: SID_A })).j.user.user !== l1.j.user.user);
  // ---- vinculación ----
  const reg = await api('POST', '/api/register', { user: 'Clasico', pass: 'espada123' }); const TC = reg.j.token;
  const lk0 = await api('POST', '/api/steam/link', { ticket: 'aa112233445566778899' }, TC);
  check('vincular: un steamid de OTRA cuenta no se puede tomar (409)', lk0.status === 409 && lk0.j.error === 'STEAM_TAKEN', lk0);
  check('vincular: sin sesión -> 401', (await api('POST', '/api/steam/link', { ticket: 'dd112233445566778899' })).status === 401);
  const reg2 = await api('POST', '/api/register', { user: 'Clasico2', pass: 'espada123' }); const TC2 = reg2.j.token;
  const lk1 = await api('POST', '/api/steam/link', { ticket: 'dd112233445566778899' }, TC2);
  check('vincular: una cuenta con contraseña se vincula a un steamid libre', lk1.status === 200 && lk1.j.linked === true && lk1.j.user.steam === true, lk1);
  check('vincular: repetir es idempotente', (await api('POST', '/api/steam/link', { ticket: 'dd112233445566778899' }, TC2)).j.already === true);
  // ---- catálogo y checkout ----
  const w = (await api('GET', '/api/wallet', undefined, TA)).j;
  const ids = w.payments.packs.map(p => p.id);
  check('catálogo: pagos habilitados y solo packs con artículo de Steam', w.payments.enabled === true && ids.includes('brasas_1000') && ids.includes('brasas_bienvenida_v2') && !ids.includes('brasas_bienvenida') && !ids.includes('brasas_inicio'), ids);
  const ckNo = await api('POST', '/api/wallet/checkout', { pack: 'brasas_1000', expectedPrice: { currency: 'USD', amount: 9.99 } }, TC);
  check('checkout: una cuenta sin steamid vinculado no puede comprar con Steam (403)', ckNo.status === 403 && ckNo.j.error === 'STEAM_NOT_LINKED', ckNo);
  check('checkout: precio desactualizado -> 409', (await api('POST', '/api/wallet/checkout', { pack: 'brasas_1000', expectedPrice: { currency: 'USD', amount: 1 } }, TA)).status === 409);
  check('checkout: el pack retirado no está a la venta (400)', (await api('POST', '/api/wallet/checkout', { pack: 'brasas_bienvenida', expectedPrice: { currency: 'USD', amount: 6.99 } }, TA)).status === 400);
  const ck = await api('POST', '/api/wallet/checkout', { pack: 'brasas_1000', expectedPrice: { currency: 'USD', amount: 9.99 } }, TA);
  check('checkout: abre un pedido en Steam', ck.status === 200 && ck.j.steam === true && /^\d{10,18}$/.test(ck.j.orderId), ck);
  const init = calls.filter(c => c.path.endsWith('/InitTxn/v3/')).pop();
  check('checkout: InitTxn con el steamid de la cuenta, el artículo 1002, 999 centavos en USD y 1 unidad', init && init.body.steamid === SID_A && init.body['itemid[0]'] === '1002' && init.body['amount[0]'] === '999' && init.body.currency === 'USD' && init.body['qty[0]'] === '1' && init.body.appid === '480', init && init.body);
  const o1 = ck.j.orderId, before = await premium(TA);
  // ---- confirmación ----
  check('confirmar: pedido mal formado -> 400', (await api('POST', '/api/wallet/steam/confirm', { orderId: '12ab' }, TA)).status === 400);
  const c0 = await api('POST', '/api/wallet/steam/confirm', { orderId: o1 }, TA);
  check('confirmar: pedido sin aprobar todavía -> pendiente, nada se acredita', c0.status === 200 && c0.j.pending === true && await premium(TA) === before, c0);
  check('confirmar: el pedido de OTRA cuenta no se ve ni se acredita (404)', (await api('POST', '/api/wallet/steam/confirm', { orderId: o1 }, TC2)).status === 404);
  orders[o1].status = 'Approved';
  const c1 = await api('POST', '/api/wallet/steam/confirm', { orderId: o1 }, TA);
  check('confirmar: aprobado -> FinalizeTxn una vez y se acreditan 1100 Brasas (1000 + 100)', c1.status === 200 && c1.j.credited === true && await premium(TA) === before + 1100 && calls.filter(c => c.path.endsWith('/FinalizeTxn/v2/')).length === 1, { c1: c1.j, premium: await premium(TA), before });
  const c2 = await api('POST', '/api/wallet/steam/confirm', { orderId: o1 }, TA);
  check('confirmar: repetir (Succeeded) no acredita de nuevo', c2.status === 200 && c2.j.duplicate === true && await premium(TA) === before + 1100 && calls.filter(c => c.path.endsWith('/FinalizeTxn/v2/')).length === 1, c2);
  // ---- montos y artículos manipulados ----
  const ck2 = await api('POST', '/api/wallet/checkout', { pack: 'brasas_500', expectedPrice: { currency: 'USD', amount: 4.99 } }, TA);
  orders[ck2.j.orderId].items[0].amount = 1; orders[ck2.j.orderId].status = 'Approved';
  const b0 = await premium(TA); const cm = await api('POST', '/api/wallet/steam/confirm', { orderId: ck2.j.orderId }, TA);
  check('confirmar: monto distinto al precio -> no se acredita ni se cierra', cm.j.credited === false && await premium(TA) === b0 && orders[ck2.j.orderId].status === 'Approved', cm);
  const ck3 = await api('POST', '/api/wallet/checkout', { pack: 'brasas_500', expectedPrice: { currency: 'USD', amount: 4.99 } }, TA);
  orders[ck3.j.orderId].items[0].qty = 5; orders[ck3.j.orderId].status = 'Approved';
  check('confirmar: cantidad distinta de 1 -> no se acredita', (await api('POST', '/api/wallet/steam/confirm', { orderId: ck3.j.orderId }, TA)).j.credited === false && await premium(TA) === b0);
  const ck4 = await api('POST', '/api/wallet/checkout', { pack: 'brasas_500', expectedPrice: { currency: 'USD', amount: 4.99 } }, TA);
  orders[ck4.j.orderId].items[0].itemid = 1005; orders[ck4.j.orderId].status = 'Approved';   // otro artículo (10.000 Brasas) con el monto de 500
  check('confirmar: artículo cambiado por otro más caro con el monto del barato -> no se acredita', (await api('POST', '/api/wallet/steam/confirm', { orderId: ck4.j.orderId }, TA)).j.credited === false && await premium(TA) === b0);
  const ck5 = await api('POST', '/api/wallet/checkout', { pack: 'brasas_500', expectedPrice: { currency: 'USD', amount: 4.99 } }, TA);
  orders[ck5.j.orderId].status = 'Failed';
  check('confirmar: pedido fallido -> no se acredita', (await api('POST', '/api/wallet/steam/confirm', { orderId: ck5.j.orderId }, TA)).j.credited === false && await premium(TA) === b0);
  // ---- reembolso ----
  orders[o1].status = 'Refunded';
  const rf = await api('POST', '/api/wallet/steam/confirm', { orderId: o1 }, TA);
  check('reembolso: se descuentan las Brasas de ESE pedido, una sola vez', rf.j.reversed && rf.j.reversed.reversed === 1100 && await premium(TA) === before, rf);
  const rf2 = await api('POST', '/api/wallet/steam/confirm', { orderId: o1 }, TA);
  check('reembolso: repetir no descuenta de nuevo', await premium(TA) === before && rf2.j.reversed && rf2.j.reversed.duplicate === true, rf2);
  // ---- pack de bienvenida vigente: una vez, solo Brasas, sin campeones ----
  const wv = async (o) => { const c = await api('POST', '/api/wallet/checkout', { pack: 'brasas_bienvenida_v2', expectedPrice: { currency: 'USD', amount: 6.99 } }, TA); return c; };
  const p0 = await premium(TA);
  const w1 = await wv(); orders[w1.j.orderId].status = 'Approved';
  const wc1 = await api('POST', '/api/wallet/steam/confirm', { orderId: w1.j.orderId }, TA);
  check('bienvenida v2: acredita 900 Brasas', wc1.j.credited === true && await premium(TA) === p0 + 900, { wc1: wc1.j, premium: await premium(TA), p0 });
  const wl = (await api('GET', '/api/wallet', undefined, TA)).j;
  check('bienvenida v2: NO da derecho a campeones y deja de ofrecerse', wl.welcome.entitled === 0 && wl.payments.packs.find(p => p.id === 'brasas_bienvenida_v2').available === false, wl.welcome);
  check('bienvenida v2: un segundo checkout se rechaza (409)', (await wv()).status === 409);
  // ---- sin configuración nada funciona ----
  const keep = process.env.STEAM_ENABLED; process.env.STEAM_ENABLED = '0';
  check('apagado: login 501 y confirmar 501', (await api('POST', '/api/steam/login', { ticket: 'aa112233445566778899' })).status === 501 && (await api('POST', '/api/wallet/steam/confirm', { orderId: o1 }, TA)).status === 501);
  process.env.STEAM_ENABLED = keep;
  // el modo live no acepta STEAM_API_BASE ajeno y usa la interfaz real
  process.env.STEAM_MODE = 'live'; process.env.STEAM_API_BASE = 'http://127.0.0.1:9';
  check('live: STEAM_API_BASE se ignora y se usa partner.steam-api.com', steam._apiBase() === 'https://partner.steam-api.com');
  process.env.STEAM_MODE = 'sandbox'; process.env.STEAM_API_BASE = 'https://evil.example';
  check('sandbox: STEAM_API_BASE que no es esta máquina se ignora', steam._apiBase() === 'https://partner.steam-api.com');
  console.log(fails ? ('FALLARON ' + fails + ' de ' + n) : ('test-steam: ' + n + ' comprobaciones OK'));
  server.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
