'use strict';
// Control de gasto y caché para proveedores de pago (S0F). Un solo libro por entorno (FONDAL_SPEND_LEDGER, ruta absoluta).
// Límites: por tarea (un pedido), por lote (un `generate`) y por día UTC. Reserva ANTES de cada POST facturable y nunca
// reembolsa un pedido incierto (una respuesta perdida puede haber costado). Caché: mismo (proveedor, modelo, prompt, hashes de
// referencias, parámetros) => se reutiliza el resultado guardado y no se gasta de nuevo. No lee ni escribe claves.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const LIMITS_DEFAULT = {perTaskCents: 50, perBatchCents: 500, perDayCents: 500};
class SpendGuard {
  constructor({ledgerPath, cacheDir, limits = {}, now = () => new Date()} = {}) {
    if (!ledgerPath || !path.isAbsolute(ledgerPath)) throw Error('SpendGuard: ledgerPath absoluto obligatorio (FONDAL_SPEND_LEDGER)');
    this.ledgerPath = ledgerPath; this.cacheDir = cacheDir || path.join(path.dirname(ledgerPath), 'cache'); this.limits = {...LIMITS_DEFAULT, ...limits}; this.now = now;
    for (const [name, value] of Object.entries(this.limits)) if (!Number.isSafeInteger(value) || value < 0) throw Error('SpendGuard: límite inválido ' + name);
  }
  _read() { return fs.existsSync(this.ledgerPath) ? JSON.parse(fs.readFileSync(this.ledgerPath, 'utf8')) : {schema: 'fondal.spend.v1', entries: []}; }
  _write(l) { this._atomic(this.ledgerPath, JSON.stringify(l, null, 2) + '\n'); }
  static cacheKey({provider, model, prompt, refs = [], params = {}}) { return sha(JSON.stringify({provider, model, prompt, refs: refs.map(r => sha(fs.readFileSync(r))), params})); }
  _lock(fn) {
    fs.mkdirSync(path.dirname(this.ledgerPath), {recursive: true});
    const lock = this.ledgerPath + '.lock'; let fd;
    try { fd = fs.openSync(lock, 'wx', 0o600); } catch (e) { if (e.code === 'EEXIST') throw Error('SpendGuard: ledger locked; inspect owner before retrying (never remove a live lock)'); throw e; }
    try { return fn(); } finally { fs.closeSync(fd); fs.unlinkSync(lock); }
  }
  _atomic(file, bytes) {
    fs.mkdirSync(path.dirname(file), {recursive: true});
    const temp = file + '.' + crypto.randomUUID() + '.tmp';
    const fd = fs.openSync(temp, 'wx', 0o600);
    try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    fs.renameSync(temp, file);
    const directory = fs.openSync(path.dirname(file), 'r');
    try { fs.fsyncSync(directory); } finally { fs.closeSync(directory); }
  }
  _key(key) { if (!/^[a-f0-9]{64}$/.test(key)) throw Error('SpendGuard: invalid cache key'); return key; }
  cached(key) {
    const f = path.join(this.cacheDir, this._key(key) + '.png'), meta = f + '.sha256';
    if (!fs.existsSync(f) || !fs.existsSync(meta)) return null; // historical unverified entries are not trusted
    return sha(fs.readFileSync(f)) === fs.readFileSync(meta, 'utf8') ? f : null;
  }
  store(key, bytes) {
    const f = path.join(this.cacheDir, this._key(key) + '.png'); this._atomic(f, bytes); this._atomic(f + '.sha256', sha(bytes)); return f;
  }
  request(key, update) {
    const file = path.join(this.cacheDir, this._key(key) + '.request.json');
    const read = () => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
    if (!update) return read();
    return this._lock(() => { const next = update(read()); this._atomic(file, JSON.stringify(next, null, 2)); return next; });
  }
  spentTodayCents() { const d = this.now().toISOString().slice(0, 10); return this._read().entries.filter(e => e.at.startsWith(d)).reduce((s, e) => s + e.cents, 0); }
  // Reserva `cents` para una tarea de un lote. Lanza si supera algún tope.
  reserve(args) { return this._lock(() => this._reserve(args)); }
  _reserve({batch, task, cents, provider, note}) {
    if (!Number.isSafeInteger(cents) || cents < 0) throw Error('SpendGuard: monto inválido');
    const l = this._read(), d = this.now().toISOString().slice(0, 10);
    if (cents > this.limits.perTaskCents) throw Error(`SpendGuard: ${cents}c supera el tope por tarea (${this.limits.perTaskCents}c)`);
    const batchSum = l.entries.filter(e => e.batch === batch).reduce((s, e) => s + e.cents, 0);
    if (batchSum + cents > this.limits.perBatchCents) throw Error(`SpendGuard: supera el tope por lote (${this.limits.perBatchCents}c)`);
    const daySum = l.entries.filter(e => e.at.startsWith(d)).reduce((s, e) => s + e.cents, 0);
    if (daySum + cents > this.limits.perDayCents) throw Error(`SpendGuard: supera el tope diario (${this.limits.perDayCents}c)`);
    if (l.entries.some(e => e.task === task && e.batch === batch)) throw Error('SpendGuard: tarea ya reservada en este lote (no se reenvía sin revisar el diario)');
    l.entries.push({at: this.now().toISOString(), batch, task, cents, provider, note: note || ''}); this._write(l); return {reservedCents: cents, batchSum: batchSum + cents, daySum: daySum + cents};
  }
}
module.exports = {SpendGuard, LIMITS_DEFAULT, sha};
