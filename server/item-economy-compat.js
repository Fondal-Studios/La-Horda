'use strict';
/* Puente entre las rutas VIEJAS del servidor (Brasas→piezas, concesiones del Game Master, regalos de evento, pack de bienvenida)
   y el ledger de la economía V2 (server/item-economy*.js).
   Regla: con V2 activa y la cuenta ya migrada ("ledger user"), el inventario, el oro, las gemas/materiales y los campeones
   desbloqueados son del ledger; escribirlos solo en el guardado (save.stash/gold/gems) se pierde en la próxima proyección.
   Cada operación es idempotente por `ref` (recibo "compat:<ref>" en s.receipts) y queda en la auditoría del ledger.
   Si V2 está apagada (HORDA_ITEM_ECONOMY=0), sin almacenamiento persistente o la cuenta no está migrada, estas funciones
   NO actúan (active() = false) y el llamador usa su camino anterior sin cambios. */
const crypto = require('node:crypto');
const E = () => require('./item-economy');
const L = () => require('./item-economy-live');
const LOOT = () => require('./item-economy-loot');

function enabled(store) { return process.env.HORDA_ITEM_ECONOMY !== '0' && !!(store && store.persistent && store.gmUpdate); }
async function active(store, userId) {
  if (!enabled(store)) return false;
  const raw = await store.gmRead();
  return !!raw?.itemEconomy?.migrations?.[String(userId)];
}
function stateOf() { return require('./game-master').stateOf(null); }
// Ejecuta fn(s, account, now) dentro de la transacción del ledger, migrando a la cuenta si hiciera falta.
async function mutate(store, user, fn, now = Date.now()) {
  return store.gmUpdate(async raw => {
    const root = raw || stateOf();
    const s = root.itemEconomy || (root.itemEconomy = E().initial());
    L().prepare(s);
    await L().migrate(s, user, store, now);
    const a = s.accounts[String(user.id)];
    const value = await fn(s, a, now);
    E().invariant(s);
    return { state: root, value };
  });
}
function receiptOnce(s, ref, fingerprint, make) {
  const key = 'compat:' + ref;
  if (Object.hasOwn(s.receipts, key)) { const old = s.receipts[key]; if (old.fingerprint !== fingerprint) { const e = new Error('IDEMPOTENCY_CONFLICT'); e.status = 409; throw e; } return { ...old.value, repeated: true }; }
  const value = make();
  s.receipts[key] = { fingerprint, value: JSON.parse(JSON.stringify(value)) };
  return value;
}
const owns = (s, id, designId) => Object.values(s.items).some(it => it.owner === String(id) && it.designId === designId);
function addDesigned(s, id, designId, extra, uid) {
  const raw = LOOT().designedItem(designId);
  if (!raw) { const e = new Error('BAD_DESIGN'); e.status = 400; throw e; }
  const it = L().normalizeItem({ ...raw, ...(extra || {}), uid: uid || crypto.randomUUID(), owner: String(id) });
  delete it.overflow;
  if (s.items[it.uid]) return s.items[it.uid];
  s.items[it.uid] = it; L().unlock(s, String(id));
  return it;
}
/* Pieza comprada con Brasas: ítem diseñado en el ledger con el uid determinístico de la compra (misma referencia → mismo objeto). */
async function grantPurchasedPiece(store, user, { ref, uid, designId }) {
  return mutate(store, user, (s) => receiptOnce(s, ref, JSON.stringify({ designId }), () => {
    const it = addDesigned(s, user.id, designId, { bought: true, srvGrant: true }, uid);
    E().audit(s, 'server', 'compat.piece', { target: user.id, designId, ref }, Date.now());
    return { uid: it.uid, designId };
  }));
}
async function ownsDesign(store, userId, designId) {
  const raw = await store.gmRead();
  return owns(raw?.itemEconomy || { items: {} }, userId, designId);
}
async function designIdsOwned(store, userId) {
  const raw = await store.gmRead();
  return new Set(Object.values(raw?.itemEconomy?.items || {}).filter(it => it.owner === String(userId) && it.designId).map(it => it.designId));
}
/* Concesión del Game Master: campeón. */
async function grantChampion(store, user, champion, ref) {
  return mutate(store, user, (s, a) => receiptOnce(s, ref, champion, () => { a.unlocked = a.unlocked || []; if (!a.unlocked.includes(champion)) a.unlocked.push(champion); E().audit(s, 'server', 'compat.champion', { target: user.id, champion }, Date.now()); return { ok: true }; }));
}
async function revokeChampion(store, user, champion, ref) {
  return mutate(store, user, (s, a) => receiptOnce(s, ref, 'revoke:' + champion, () => { a.unlocked = (a.unlocked || []).filter(c => c !== champion); for (const slot of Object.keys(a.equipment?.[champion] || {})) delete a.equipment[champion][slot]; return { ok: true }; }));
}
/* GM: fija oro o gemas/materiales (ya validados por la ruta). */
async function setCurrency(store, user, field, value, ref) {
  return mutate(store, user, (s, a) => receiptOnce(s, ref, field + ':' + value, () => {
    const before = field === 'gems' ? a.materials : a.gold;
    if (field === 'gems') a.materials = value; else a.gold = value;
    E().audit(s, 'server', 'compat.currency', { target: user.id, field, before, after: value }, Date.now());
    return { before };
  }));
}
async function readCurrency(store, user, field) {
  const raw = await store.gmRead(); const a = raw?.itemEconomy?.accounts?.[String(user.id)];
  return a ? (field === 'gems' ? a.materials : a.gold) : 0;
}
/* GM: objetos o set completo por clave de catálogo (los resuelve el llamador a designIds). */
async function grantDesigns(store, user, designIds, ref, flags) {
  return mutate(store, user, (s) => receiptOnce(s, ref, designIds.join(','), () => {
    const uids = designIds.map(id => addDesigned(s, user.id, id, flags || { gift: 'ADMIN_GRANT' }).uid);
    E().audit(s, 'server', 'compat.designs', { target: user.id, count: uids.length, ref }, Date.now());
    return { uids };
  }));
}
/* GM (buzón): clave de catálogo de la Tienda ("d:<designId>", "a:<ranura>:<sustantivo>") o set completo. Idempotente por ref. */
async function grantMailbox(store, user, kind, key, ref) {
  return mutate(store, user, (s) => receiptOnce(s, ref, kind + ':' + key, () => {
    const out = [];
    if (kind === 'set') { for (const id of LOOT().setPieces(key)) out.push(addDesigned(s, user.id, id, { gift: 'ADMIN_GRANT' }).uid); }
    else if (key.startsWith('d:')) out.push(addDesigned(s, user.id, key.slice(2), { gift: 'ADMIN_GRANT' }).uid);
    else if (key.startsWith('a:')) {
      const [, type, noun] = key.split(':'), raw = LOOT().archetypeItem(type, noun);
      if (!raw) { const e = new Error('BAD_ITEM'); e.status = 400; throw e; }
      const it = L().normalizeItem({ ...raw, uid: crypto.randomUUID(), owner: String(user.id), gift: 'ADMIN_GRANT' }); s.items[it.uid] = it; out.push(it.uid);
    }
    if (!out.length) { const e = new Error('BAD_ITEM'); e.status = 400; throw e; }
    E().audit(s, 'server', 'compat.mailbox', { target: user.id, kind, key, count: out.length }, Date.now());
    return { uids: out };
  }));
}
/* GM: borrar el inventario (reset). Los reliquias vuelven a la Bóveda; nada se destruye con listado abierto. */
async function wipeInventory(store, user, ref) {
  return mutate(store, user, (s, a) => receiptOnce(s, ref, 'wipe', () => {
    let n = 0;
    for (const it of Object.values(s.items)) {
      if (it.owner !== String(user.id) || it.listing) continue;
      if (it.relicId) { E().transfer(s, it, null, 'gm.reset', Date.now()); continue; }
      delete s.items[it.uid]; n++;
    }
    a.equipment = {};
    return { removed: n };
  }));
}
async function wipeGold(store, user, ref) { return setCurrency(store, user, 'gold', 0, ref); }
/* Recompensas del cliente que el servidor puede acotar y registrar (misiones, cofres, eventos): ver item-economy-live.js ('reward.*'). */
module.exports = { enabled, active, mutate, grantPurchasedPiece, ownsDesign, designIdsOwned, grantChampion, revokeChampion, setCurrency, readCurrency, grantDesigns, grantMailbox, wipeInventory, wipeGold };
