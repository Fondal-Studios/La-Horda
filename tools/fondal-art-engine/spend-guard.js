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
  }
  _read() { return fs.existsSync(this.ledgerPath) ? JSON.parse(fs.readFileSync(this.ledgerPath, 'utf8')) : {schema: 'fondal.spend.v1', entries: []}; }
  _write(l) { fs.mkdirSync(path.dirname(this.ledgerPath), {recursive: true}); const t = this.ledgerPath + '.tmp'; fs.writeFileSync(t, JSON.stringify(l, null, 2) + '\n', {mode: 0o600}); fs.renameSync(t, this.ledgerPath); }
  static cacheKey({provider, model, prompt, refs = [], params = {}}) { return sha(JSON.stringify({provider, model, prompt, refs: refs.map(r => sha(fs.readFileSync(r))), params})); }
  cached(key) { const f = path.join(this.cacheDir, key + '.png'); return fs.existsSync(f) ? f : null; }
  store(key, bytes) { fs.mkdirSync(this.cacheDir, {recursive: true}); const f = path.join(this.cacheDir, key + '.png'); fs.writeFileSync(f, bytes); return f; }
  spentTodayCents() { const d = this.now().toISOString().slice(0, 10); return this._read().entries.filter(e => e.at.startsWith(d)).reduce((s, e) => s + e.cents, 0); }
  // Reserva `cents` para una tarea de un lote. Lanza si supera algún tope.
  reserve({batch, task, cents, provider, note}) {
    if (!Number.isFinite(cents) || cents < 0) throw Error('SpendGuard: monto inválido');
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
