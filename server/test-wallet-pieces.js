"use strict";
// PIEZAS DE SET CON BRASAS (POST /api/wallet/buy-piece): precio y catálogo del servidor, rotación "live", interruptor
// PIECES_FOR_BRASAS, entrega en el guardado de la nube, regalo del set completo, idempotencia, reintegro e inventario lleno.
process.env.PORT = '8823'; process.env.DATABASE_URL = ''; process.env.ADMIN_USERS = 'Director'; process.env.ALLOWED_ORIGINS = 'http://127.0.0.1:8802';
delete process.env.PAYMENTS_PROVIDER; delete process.env.PAYMENTS_WEBHOOK_SECRET;
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'horda-pieces-'));
const { server, accounts } = require('./relay');
const wallet = require('./wallet');
const results = [];
const check = (name, ok, x) => { results.push({ name, ok: !!ok }); if(!ok) console.log('FAIL', name, x !== undefined ? JSON.stringify(x).slice(0, 400) : ''); };
async function api(method, p, body, token){
  const r = await fetch('http://127.0.0.1:8823' + p, { method, headers: { origin: 'http://127.0.0.1:8802', 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body) });
  let j = null; try{ j = await r.json(); }catch(e){}
  return { status: r.status, j };
}
const ref = () => crypto.randomUUID();
(async () => {
  await accounts.ready;
  const AT = (await api('POST', '/api/register', { user: 'Director', pass: 'espada123' })).j.token;
  const UT = (await api('POST', '/api/register', { user: 'Jugador', pass: 'espada123' })).j.token;
  const NT = (await api('POST', '/api/register', { user: 'SinNube', pass: 'espada123' })).j.token;
  const FT = (await api('POST', '/api/register', { user: 'Lleno', pass: 'espada123' })).j.token;
  const baseSave = (extra) => ({ gold: 1e9, champions: {}, cosmeticUnlocks: {}, cromas: {}, stash: [], collection: {}, ...(extra || {}) });
  await api('PUT', '/api/save', { data: baseSave(), baseVersion: 0 }, UT);
  await api('PUT', '/api/save', { data: baseSave({ stash: Array.from({ length: 30 }, (_, i) => ({ uid: 'relleno_' + i, designed: false, type: 'arma' })) }), baseVersion: 0 }, FT);
  const users = (await api('GET', '/api/gm/users', undefined, AT)).j.users, idOf = (n) => users.find(u => u.user === n).id;
  const credit = (n, amount) => api('POST', '/api/gm/user/premium', { id: idOf(n), amount, reason: 'prueba piezas', ref: ref() }, AT);
  const P = wallet.pricing(), db = wallet.pieceDb(), cat = wallet.skinCatalog();
  const PRICE = P.pricingBrasas('pieza');
  const setId = Object.keys(db.sets).find(s => cat[s] && cat[s].kind === 'set' && db.sets[s].length >= 4 && db.sets[s].every(id => db.pieces[id]));
  const ids = db.sets[setId], expected = (id) => ({ piece: id, ref: ref(), expectedPrice: PRICE });
  const buy = (id, token, over) => api('POST', '/api/wallet/buy-piece', { ...expected(id), ...(over || {}) }, token || UT);

  check('precio de pieza en pricing.js: ✦200; 4 piezas = skin de set (ningún camino abarata la skin)', PRICE === 200 && P.pricingBrasas('set') <= PRICE * 4, { PRICE });
  check('manifiesto: 4+ piezas por set con skin y la rotación cubre las piezas de set', !!setId && ids.every(id => db.pool.some(e => e.key === 'd:' + id && e.cat === 'set')), setId);
  check('anónimo: 401', (await api('POST', '/api/wallet/buy-piece', expected(ids[0]))).status === 401);
  const production = (await api('GET', '/api/wallet', undefined, UT)).j;
  const blocked = await buy(ids[0]);
  check('política actual: equipo por Brasas desactivado en servidor', production.pieces.enabled === false && blocked.status === 403 && blocked.j.error === 'PIECES_OFF');
  // Retain the historical delivery/refund regression coverage without enabling sales in production.
  wallet.setTestFlags({ PIECES_FOR_BRASAS: true });
  const w0 = (await api('GET', '/api/wallet', undefined, UT)).j;
  check('GET /api/wallet informa el interruptor y el precio de pieza', w0.pieces && w0.pieces.enabled === true && w0.pieces.price === 200 && w0.prices.brasas.pieza === 200, w0.pieces);
  check('sin saldo: 402 y nada se entrega', (await buy(ids[0])).status === 402 && (await api('GET', '/api/save', undefined, UT)).j.data.stash.length === 0);
  await credit('Jugador', 5000);

  // validaciones
  check('pieza inexistente / skin / campeón: 400', (await buy('no_existe')).status === 400 && (await buy(setId)).status === 400 && (await buy('__proto__')).status === 400 && (await api('POST', '/api/wallet/buy-piece', { ref: ref(), expectedPrice: PRICE }, UT)).status === 400);
  check('una pieza no se puede comprar por /api/wallet/buy (catálogo de apariencias)', (await api('POST', '/api/wallet/buy', { sku: ids[0], ref: ref(), expectedPrice: PRICE }, UT)).status === 400);
  check('sin cotización o con precio más barato: 409', (await buy(ids[0], UT, { expectedPrice: undefined })).status === 409 && (await buy(ids[0], UT, { expectedPrice: 1 })).status === 409 && (await buy(ids[0], UT, { expectedPrice: 0 })).status === 409);
  check('sin referencia: 400', (await buy(ids[0], UT, { ref: 'x' })).status === 400);
  check('no se cobró por los pedidos inválidos', (await api('GET', '/api/wallet', undefined, UT)).j.premium === 5000);

  // compra, entrega y reintento (modo demo por defecto)
  const r0 = ref(), b1 = await api('POST', '/api/wallet/buy-piece', { piece: ids[0], ref: r0, expectedPrice: PRICE }, UT);
  const s1 = (await api('GET', '/api/save', undefined, UT)).j.data;
  const it = s1.stash.find(x => x.designId === ids[0]);
  check('compra de una pieza: ✦200 menos y entregada en el guardado (esbozo del servidor)', b1.status === 200 && b1.j.premium === 4800 && b1.j.price === 200 && !!it && it.srvGrant === true && it.bought === true && it.set === setId && it.uid === b1.j.piece.uid && s1.stash.length === 1, { b1: b1.j, s1 });
  check('la colección registra la pieza y el oro no se toca', s1.collection[ids[0]] && s1.collection[ids[0]].n === 1 && s1.gold === 1e9);
  check('sin skin hasta completar el set', !s1.cosmeticUnlocks[setId] && b1.j.setCompleted === null);
  const b1r = await api('POST', '/api/wallet/buy-piece', { piece: ids[0], ref: r0, expectedPrice: PRICE }, UT);
  const s1r = (await api('GET', '/api/save', undefined, UT)).j.data;
  check('reintentar con la misma referencia: no cobra ni duplica', b1r.status === 200 && b1r.j.repeated === true && b1r.j.premium === 4800 && s1r.stash.length === 1 && s1r.collection[ids[0]].n === 1, b1r);
  const dup = await buy(ids[0]);
  check('la que ya tenés: 409 OWNED sin cobrar', dup.status === 409 && dup.j.error === 'OWNED' && (await api('GET', '/api/wallet', undefined, UT)).j.premium === 4800, dup);
  // si el guardado perdió la pieza entre el cobro y la entrega, reintentar con la misma referencia la completa sin cobrar otra vez
  {
    const cur = (await api('GET', '/api/save', undefined, UT)); const d = cur.j.data; const keep = d.stash; d.stash = []; d.collection = {};
    await api('PUT', '/api/save', { data: d, baseVersion: cur.j.version }, UT);
    const rr = await api('POST', '/api/wallet/buy-piece', { piece: ids[0], ref: r0, expectedPrice: PRICE }, UT);
    const sv = (await api('GET', '/api/save', undefined, UT)).j.data;
    check('reintento tras entrega perdida: se completa sin segundo cobro', rr.status === 200 && rr.j.repeated && sv.stash.length === 1 && sv.stash[0].uid === keep[0].uid && (await api('GET', '/api/wallet', undefined, UT)).j.premium === 4800, rr);
  }

  // compras simultáneas de la misma pieza: se cobra una sola
  {
    const before = (await api('GET', '/api/wallet', undefined, UT)).j.premium;
    const burst = await Promise.all([1, 2, 3, 4].map(() => buy(ids[1])));
    const after = (await api('GET', '/api/wallet', undefined, UT)).j.premium;
    check('4 compras simultáneas de la misma pieza: una sola cobrada', burst.filter(r => r.status === 200).length === 1 && burst.filter(r => r.status === 409).length === 3 && before - after === 200, { st: burst.map(r => r.status), before, after });
  }
  // completar el set por compra: el servidor regala la skin con la última pieza
  let last = null; for(const id of ids.slice(2)) last = await buy(id);
  const sDone = (await api('GET', '/api/save', undefined, UT)).j.data;
  check('set completo por compra: la última pieza entrega la skin del set', last.status === 200 && last.j.setCompleted === setId && last.j.cosmetics[0].id === setId && sDone.cosmeticUnlocks[setId] === true && ids.every(id => sDone.collection[id] && sDone.collection[id].n > 0), last.j);
  check('gasto exacto: una pieza por ✦200 (nada más) y oro intacto', (await api('GET', '/api/wallet', undefined, UT)).j.premium === 5000 - 200 * ids.length && sDone.gold === 1e9, { premium: (await api('GET', '/api/wallet', undefined, UT)).j.premium });
  const led = (await api('GET', '/api/wallet', undefined, UT)).j.ledger;
  check('el libro registra las compras de pieza (últimos 20 asientos)', led.filter(e => /^buyp:/.test(e.reason) && e.delta === -200).length === Math.min(20, ids.length), led.map(e => e.reason));

  // sin guardado en la nube: se reintegra
  await credit('SinNube', 1000);
  const nb = await buy(ids[0], NT), nw = (await api('GET', '/api/wallet', undefined, NT)).j;
  check('sin guardado en la nube: 409 y no se cobra', nb.status === 409 && nw.premium === 1000, { nb: nb.j, premium: nw.premium });
  // inventario lleno: no se cobra
  await credit('Lleno', 1000);
  const fb = await buy(ids[0], FT), fw = (await api('GET', '/api/wallet', undefined, FT)).j;
  check('inventario lleno (30/30): 409 INVENTORY_FULL y no se cobra', fb.status === 409 && fb.j.error === 'INVENTORY_FULL' && fw.premium === 1000, { fb: fb.j, premium: fw.premium });

  // modo live: solo lo que sale hoy
  const today = Math.floor(Date.now() / 86400000), onSale = wallet.rotationKeys(today).filter(k => db.pieces[k.slice(2)]).map(k => k.slice(2));
  wallet.setTestFlags({ SHOP_MODE: 'live', PIECES_FOR_BRASAS: true });
  const notToday = Object.keys(db.pieces).find(id => !wallet.rotationKeys(today).includes('d:' + id) );
  await api('PUT', '/api/save', { data: baseSave(), baseVersion: (await api('GET', '/api/save', undefined, NT)).j.version || 0 }, NT);
  const wlive = (await api('GET', '/api/wallet', undefined, UT)).j;
  check('GET /api/wallet informa el modo', wlive.pieces.mode === 'live');
  check('live: hay piezas de set en la rotación de hoy y otras que no', onSale.length > 0 && !!notToday, { onSale: onSale.length });
  const before = (await api('GET', '/api/wallet', undefined, NT)).j.premium;
  const nt = await buy(notToday, NT);
  check('live: una pieza que no sale hoy: 409 NOT_ON_SALE y no se cobra', nt.status === 409 && nt.j.error === 'NOT_ON_SALE' && (await api('GET', '/api/wallet', undefined, NT)).j.premium === before, nt);
  const okLive = await buy(onSale[0], NT);
  check('live: una pieza que sale hoy se vende al mismo precio (✦200, sin recargo de oro)', okLive.status === 200 && okLive.j.price === 200, okLive);
  check('la rotación del servidor repite 6 por día y cada pieza sale más de una vez por ciclo', wallet.rotationKeys(today).length === P.pricingRotationConfig().n && wallet.rotationKeys(today).join() === wallet.rotationKeys(today).join());
  wallet.setTestFlags(null);

  // interruptor apagado
  wallet.setTestFlags({ PIECES_FOR_BRASAS: false });
  const off = await buy(ids[0], FT), woff = (await api('GET', '/api/wallet', undefined, UT)).j;
  check('PIECES_FOR_BRASAS=false: 403 PIECES_OFF y el GET lo informa', off.status === 403 && off.j.error === 'PIECES_OFF' && woff.pieces.enabled === false, { off: off.j, p: woff.pieces });
  check('apagado: las skins y cromas se siguen vendiendo', (await api('POST', '/api/wallet/buy', { sku: Object.values(cat).find(s => s.kind === 'set' && s.id !== setId).id, ref: ref(), expectedPrice: 800 }, UT)).status === 200);
  wallet.setTestFlags(null);
  check('sin override de prueba: permanece bloqueada la compra de equipo', (await buy(ids[0], FT)).status === 403);

  fs.mkdirSync(path.join(__dirname, '../docs/ux'), { recursive: true });
  const bad = results.filter(r => !r.ok);
  console.log(`${results.length - bad.length}/${results.length} PASS`);
  server.close(); process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
