"use strict";
// MERCADO PAGO (adaptador): checkout con conversión a pesos, webhook verificado contra la API (nunca por lo que dice el cuerpo),
// acreditación idempotente y rechazo de pagos aprobados por menos, de otra cuenta/paquete, en otra moneda o inexistentes.
process.env.DATA_PERSISTENT = '1'; // isolated temp directory: only simulates the storage gate in this test
process.env.MP_WEBHOOK_SECRET = 'test-webhook-secret-32-characters-long';
process.env.PAYMENTS_ORDER_SECRET = 'test-order-secret-32-characters-long';
process.env.MP_COLLECTOR_ID = '123456'; process.env.MP_LIVE_MODE = 'false';
const crypto = require('crypto');
process.env.PORT = '8820'; process.env.DATABASE_URL = ''; process.env.ALLOWED_ORIGINS = 'http://127.0.0.1:8802';
process.env.PAYMENTS_PROVIDER = 'mercadopago'; process.env.MP_ACCESS_TOKEN = 'TEST-1234567890abcdef-token'; process.env.MP_ARS_PER_USD = '1200';
process.env.PAYMENTS_NOTIFY_URL = 'https://ejemplo.test/api/payments/webhook'; process.env.PAYMENTS_SUCCESS_URL = 'https://ejemplo.test/la-horda/jugar/';
const fs = require('fs'), os = require('os'), path = require('path');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'horda-mp-'));
const { server, accounts } = require('./relay');
const payments = require('./payments');
let fails = 0, n = 0; const check = (name, ok, x) => { n++; if(!ok){ fails++; console.log('FAIL', name, x !== undefined ? JSON.stringify(x).slice(0, 300) : ''); } };
async function api(method, p, body, token, extraHeaders = {}){
  const r = await fetch('http://127.0.0.1:8820' + p, { method, headers: { origin: 'http://127.0.0.1:8802', 'content-type': 'application/json', ...extraHeaders, ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  let j = null; try{ j = await r.json(); }catch(e){} return { status: r.status, j };
}
(async () => {
  await accounts.ready;
  const UT = (await api('POST', '/api/register', { user: 'Jugador', pass: 'espada123' })).j.token;
  const me = (await api('GET', '/api/wallet', undefined, UT)).j;
  const uid = (await api('GET', '/api/me', undefined, UT)).j && (await api('GET', '/api/me', undefined, UT)).j.id;
  const calls = [];
  const payDB = {};
  payments._setFetch(async (url, opts) => {
    calls.push({ url, opts });
    if(String(url).endsWith('/checkout/preferences')){ const b = JSON.parse(opts.body); payDB.last = b; return { ok: true, json: async () => ({ init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=abc' }) }; }
    const id = String(url).split('/').pop(); const p = payDB[id];
    if(!p) return { ok: false, status: 404, json: async () => ({ message: 'not found' }) };
    return { ok: true, json: async () => p };
  });
  // catálogo: habilitado
  check('catálogo: pagos habilitados', me.payments && me.payments.enabled === true, me.payments);
  // checkout: convierte USD → ARS y manda external_reference con la cuenta y el paquete
  const ck = await api('POST', '/api/wallet/checkout', { pack: 'brasas_500', expectedPrice: {currency:'ARS', amount:5988} }, UT);
  check('checkout devuelve el link de Mercado Pago', ck.status === 200 && /^https:\/\/www\.mercadopago\.com\.ar\//.test(ck.j.redirect), ck);
  check('checkout cobra en pesos (4,99 USD × 1200)', payDB.last.items[0].currency_id === 'ARS' && payDB.last.items[0].unit_price === Math.ceil(4.99 * 1200), payDB.last.items);
  check('checkout lleva notification_url y referencia de cuenta+paquete', payDB.last.notification_url === process.env.PAYMENTS_NOTIFY_URL && /^v1:\d+:brasas_500:5988:500:[0-9a-f]{24}:[0-9a-f]{64}$/.test(payDB.last.external_reference), payDB.last);
  check('el token va solo en el encabezado del servidor', calls[0].opts.headers.authorization.startsWith('Bearer TEST-') && !JSON.stringify(ck.j).includes('TEST-'));
  const ref = payDB.last.external_reference, userId = Number(ref.split(':')[1]);
  const hook = (id, body) => {
    if(payDB[id]) payDB[id] = { id:Number(id), collector_id:123456, live_mode:false, ...payDB[id] };
    const ts = String(Date.now()), rid = 'request-test-123';
    const sig = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET).update(`id:${id};request-id:${rid};ts:${ts};`).digest('hex');
    return api('POST', '/api/payments/webhook?data.id=' + id + '&type=payment', body || { type:'payment', data:{id} }, null,
      {'x-request-id':rid, 'x-signature':`ts=${ts},v1=${sig}`});
  };
  const before = (await api('GET', '/api/wallet', undefined, UT)).j.premium;
  // pago aprobado y correcto → acredita
  payDB['111111'] = { status: 'approved', currency_id: 'ARS', transaction_amount: Math.ceil(4.99 * 1200), external_reference: ref };
  const ok1 = await hook('111111'); check('webhook aprobado acredita', ok1.status === 200 && ok1.j.ok && !ok1.j.duplicate, ok1);
  const after = (await api('GET', '/api/wallet', undefined, UT)).j.premium; check('saldo +500 Brasas', after === before + 500, { before, after });
  // el mismo aviso otra vez (Mercado Pago reintenta) → no acredita dos veces
  const ok2 = await hook('111111'); check('reintento del webhook no acredita de nuevo', ok2.status === 200 && ok2.j.duplicate === true && (await api('GET', '/api/wallet', undefined, UT)).j.premium === after, ok2);
  // casos que NO acreditan
  const bad = async (name, id, pay, body) => { payDB[id] = pay; const r = await hook(id, body); check(name, r.status === (pay.status !== 'approved' && pay.external_reference === ref ? 200 : 400), r); };
  await bad('pendiente no acredita', '222222', { status: 'pending', currency_id: 'ARS', transaction_amount: 9999, external_reference: ref });
  await bad('rechazado no acredita', '222223', { status: 'rejected', currency_id: 'ARS', transaction_amount: 9999, external_reference: ref });
  await bad('pagó menos de lo que vale no acredita', '333333', { status: 'approved', currency_id: 'ARS', transaction_amount: 100, external_reference: ref });
  await bad('otra moneda no acredita', '333334', { status: 'approved', currency_id: 'USD', transaction_amount: 9999, external_reference: ref });
  await bad('paquete inexistente no acredita', '444444', { status: 'approved', currency_id: 'ARS', transaction_amount: 9999, external_reference: userId + ':brasas_gratis:abcdef' });
  await bad('referencia ajena/rota no acredita', '444445', { status: 'approved', currency_id: 'ARS', transaction_amount: 9999, external_reference: 'hola' });
  const r404 = await hook('999999'); check('id inexistente en Mercado Pago no acredita', r404.status === 400, r404);
  const rbad = await api('POST', '/api/payments/webhook', { type: 'payment', data: { id: '../../etc' } }); check('id con formato raro se ignora', rbad.status === 400, rbad);
  // un webhook "firmado" por el modo hmac NO sirve acá: lo que cuenta es la API de Mercado Pago
  const spoof = await api('POST', '/api/payments/webhook', { userId, pack: 'brasas_10000', paymentId: 'pay_fake_1' }); check('cuerpo inventado sin pago real no acredita', spoof.status === 400, spoof);
  check('saldo final intacto tras los casos malos', (await api('GET', '/api/wallet', undefined, UT)).j.premium === after);
  check('catálogo muestra el importe real ARS', me.payments.packs.find(p=>p.id==='brasas_500').price.currency === 'ARS' && me.payments.packs.find(p=>p.id==='brasas_500').price.amount === 5988);
  const wrongPrice = await api('POST','/api/wallet/checkout',{pack:'brasas_500',expectedPrice:{currency:'ARS',amount:1}},UT);
  check('precio distinto requiere nueva confirmación', wrongPrice.status === 409);
  const unsignedBefore = calls.length;
  const unsigned = await api('POST','/api/payments/webhook?data.id=111111', {data:{id:'111111'}});
  check('sin firma no consulta API ni acredita', unsigned.status === 400 && calls.length === unsignedBefore);
  const valid = { status:'approved', currency_id:'ARS', transaction_amount:5988, external_reference:ref };
  await bad('otro vendedor rechazado','555551',{...valid,collector_id:999});
  await bad('modo de producción inesperado rechazado','555552',{...valid,live_mode:true});
  await bad('referencia alterada rechazada','555553',{...valid,external_reference:ref.replace(':500:',':5000:')});
  await bad('pago parcialmente reembolsado rechazado','555554',{...valid,transaction_amount_refunded:1});
  await bad('pago 1% menor rechazado','555555',{...valid,transaction_amount:5928});
  process.env.MP_ARS_PER_USD = '1400';
  const repeatAfterRateChange = await hook('111111');
  check('un cambio de cotización no invalida un pago previo', repeatAfterRateChange.status === 200 && repeatAfterRateChange.j.duplicate);
  process.env.MP_ARS_PER_USD = '1200';
  process.env.PAYMENTS_PACK_IDS = 'brasas_1000';
  const hidden = await api('POST','/api/wallet/checkout',{pack:'brasas_500',expectedPrice:{currency:'ARS',amount:5988}},UT);
  check('paquete fuera del lanzamiento no inicia cobro', hidden.status === 400);
  check('paquete retirado sigue acreditando pagos pendientes', (await hook('111111')).status === 200);
  process.env.PAYMENTS_PACK_IDS = 'brasas_inicio,brasas_coleccion';
  const launch = await api('GET','/api/wallet',undefined,UT);
  check('oferta de lanzamiento muestra solo dos packs',launch.j.payments.packs.length === 2 && launch.j.payments.packs[0].id === 'brasas_inicio');
  const launchCk = await api('POST','/api/wallet/checkout',{pack:'brasas_inicio',expectedPrice:{currency:'ARS',amount:3588}},UT);
  check('pack inicial cotiza 1200 Brasas en ARS',launchCk.status === 200 && launchCk.j.charged.amount === 3588 && launch.j.payments.packs[0].premium === 1200);
  delete process.env.PAYMENTS_PACK_IDS;
  const persistent = accounts.store.persistent; accounts.store.persistent = false;
  check('sin persistencia catálogo desactiva compras', !(await api('GET','/api/wallet',undefined,UT)).j.payments.enabled);
  check('sin persistencia checkout bloqueado', (await api('POST','/api/wallet/checkout',{pack:'brasas_500'},UT)).status === 503);
  check('sin persistencia webhook pide reintento', (await hook('111111')).status === 503);
  accounts.store.persistent = persistent;
  // sin token configurado: apagado
  process.env.MP_ACCESS_TOKEN = ''; const off = await api('POST', '/api/wallet/checkout', { pack: 'brasas_500', expectedPrice: {currency:'ARS', amount:5988} }, UT); check('sin token: pagos apagados', off.status === 501, off);
  server.close(); console.log(fails ? 'FAIL ' + fails + ' de ' + n : 'PASS Mercado Pago: ' + n + ' checks'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
