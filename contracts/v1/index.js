'use strict';
/* Contratos compartidos de La Horda, versión 1. Solo lectura / validación: NO cambian el comportamiento de producción.
 * Reutilizan lo existente: los adaptadores leen los registros reales del servidor (run, libro de la billetera, guardado,
 * lista cerrada de eventos de /api/telemetry). Propietario del directorio: Arquitectura (ver docs/arquitectura-compartida). */
const { validateSchema } = require('./core');
const { CODES, ContractError } = require('./errors');
const { appliedMigrations, MIGRATIONS } = require('./migrations');

const SCHEMAS = {
  GameResult: require('./game-result.schema.json'),
  PlayerProfile: require('./player-profile.schema.json'),
  EconomyTransaction: require('./economy-transaction.schema.json'),
  TelemetryEvent: require('./telemetry-event.schema.json')
};
const VERSIONS = Object.freeze({ GameResult: '1.0.0', PlayerProfile: '1.0.0', EconomyTransaction: '1.0.0', TelemetryEvent: '1.0.0' });
// Propietario único de cada contrato (quien aprueba cambios). Ver docs/arquitectura-compartida/PROPIEDAD_DE_ARCHIVOS.md.
const OWNERS = Object.freeze({ GameResult: 'A', EconomyTransaction: 'A', PlayerProfile: 'B', TelemetryEvent: 'C' });

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
function parseVersion(v){ const m = SEMVER.exec(String(v)); return m ? { major: +m[1], minor: +m[2], patch: +m[3] } : null; }
// Regla: mismo MAJOR; el consumidor acepta un MINOR igual o menor al suyo (los MINOR solo agregan; se actualiza primero al consumidor).
function checkVersion(name, v){
  const have = parseVersion(VERSIONS[name]), got = parseVersion(v);
  if(!got) return [{ path: '$.version', code: 'BAD_VERSION' }];
  if(got.major !== have.major || got.minor > have.minor) return [{ path: '$.version', code: 'UNSUPPORTED_VERSION', detail: `${v} vs ${VERSIONS[name]}` }];
  return [];
}
const PII_KEYS = /^(email|mail|user|username|name|nick|text|message|chat|ip|url|stack|token|pass|password|accountId)$/i;
function piiScan(value, path = '$', out = []){
  if(value && typeof value === 'object') for(const [k, v] of Object.entries(value)){
    if(path === '$' && k === 'name') continue; // 'name' es el nombre del EVENTO en el nivel superior, no un nombre de persona
    if(PII_KEYS.test(k)) out.push({ path: path + '.' + k, code: 'PII_FIELD' });
    piiScan(v, path + '.' + k, out);
  }
  return out;
}

function validate(name, value){
  const schema = SCHEMAS[name];
  if(!schema) return { ok: false, errors: [{ path: '$', code: 'UNKNOWN_CONTRACT', detail: name }] };
  if(!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, errors: [{ path: '$', code: 'BAD_TYPE' }] };
  let errors = checkVersion(name, value.version);
  if(name === 'TelemetryEvent') errors = errors.concat(piiScan(value));
  if(errors.some(e => e.code === 'UNSUPPORTED_VERSION' || e.code === 'BAD_VERSION')) return { ok: false, errors };
  errors = errors.concat(validateSchema(schema, value).errors);
  errors = errors.concat(semantic(name, value));
  // PII_FIELD ya describe el campo: se quita el UNKNOWN_FIELD duplicado del mismo camino.
  const pii = new Set(errors.filter(e => e.code === 'PII_FIELD').map(e => e.path));
  errors = errors.filter(e => !(e.code === 'UNKNOWN_FIELD' && pii.has(e.path)));
  return { ok: errors.length === 0, errors };
}
function assertValid(name, value){ const r = validate(name, value); if(!r.ok) throw new ContractError(r.errors); return value; }

// ---------------- reglas semánticas (lo que un esquema no puede decir) ----------------
const ELAPSED_TOLERANCE_MS = 5000; // espejo de server/item-economy-live.js: la duración no puede superar lo observado + 5 s
function semantic(name, v){
  const out = [];
  if(name === 'GameResult'){
    if(v.credit && v.credit.eligible){
      if(!v.evidence || v.evidence.source !== 'server_run') out.push({ path: '$.evidence.source', code: 'NOT_CREDITABLE', detail: 'la evidencia no la emitió el servidor' });
      if(!v.verified) out.push({ path: '$.verified', code: 'NOT_CREDITABLE', detail: 'falta el resultado verificado' });
      if(v.evidence && v.evidence.closedBy !== 'finish') out.push({ path: '$.evidence.closedBy', code: 'NOT_CREDITABLE', detail: 'la partida no se cerró con finish' });
      if(v.outcome === 'unknown') out.push({ path: '$.outcome', code: 'NOT_CREDITABLE', detail: 'resultado desconocido' });
      if(v.verified && v.evidence && v.verified.durationMs > v.evidence.elapsedMs + ELAPSED_TOLERANCE_MS) out.push({ path: '$.verified.durationMs', code: 'NOT_CREDITABLE', detail: 'duración mayor a la observada' });
    }
    if(v.evidence && v.evidence.source === 'client_declared' && v.verified) out.push({ path: '$.verified', code: 'NOT_CREDITABLE', detail: 'un resultado declarado por el cliente no se puede marcar verificado' });
  }
  if(name === 'EconomyTransaction'){
    const a = v.amount;
    if(typeof a === 'number'){
      if(v.kind === 'credit' && !(a > 0)) out.push({ path: '$.amount', code: 'SIGN_MISMATCH', detail: 'credit exige monto > 0' });
      if(v.kind === 'refund' && !(a > 0)) out.push({ path: '$.amount', code: 'SIGN_MISMATCH', detail: 'refund exige monto > 0' });
      if(v.kind === 'debit' && !(a < 0)) out.push({ path: '$.amount', code: 'SIGN_MISMATCH', detail: 'debit exige monto < 0' });
    }
    if(['run_reward', 'chest'].includes(v.source)){
      if(!v.evidenceRef) out.push({ path: '$.evidenceRef', code: 'EVIDENCE_REQUIRED' });
      if(v.actor !== 'server') out.push({ path: '$.actor', code: 'NOT_CREDITABLE', detail: 'solo el servidor acredita recompensas de partida' });
    }
  }
  return out;
}
// Idempotencia: misma clave + mismo contenido = repetición legítima; misma clave + contenido distinto = error.
const IDEMPOTENT_FIELDS = ['accountId', 'kind', 'currency', 'amount', 'source', 'evidenceRef'];
function compareReplay(prev, next){
  const diff = IDEMPOTENT_FIELDS.filter(k => prev[k] !== next[k]);
  return diff.length ? { ok: false, errors: [{ path: '$', code: 'IDEMPOTENCY_MISMATCH', detail: diff.join(',') }] } : { ok: true, replay: true };
}

// ---------------- adaptadores sobre los registros REALES (no duplican lógica) ----------------
const MODE_MAP = { campaign: 'campaign', endless: 'endless', multiplayer: 'multiplayer' };
// run: registro de server/item-economy-live.js (s.runs[id]). result: lo que devuelve run.finish (r.result). Limitación conocida: hoy el
// registro NO guarda si fue victoria ni lo que declaró el cliente; por eso el resultado sale 'unknown' y no acreditable salvo que se pase `known`.
function fromServerRun(run, result, known = {}){
  const closedBy = run.abandoned ? 'abandon' : run.done ? (run.result ? 'finish' : 'expired') : 'open';
  const outcome = known.outcome || (run.abandoned ? 'abandon' : run.done && !run.result ? 'expired' : run.done ? 'unknown' : 'unknown');
  const r = {
    contract: 'GameResult', version: VERSIONS.GameResult, runId: String(run.id), accountId: String(run.owner),
    mode: MODE_MAP[run.mode] || 'campaign', arena: String(run.arena), champion: String(run.champion), outcome,
    evidence: { source: 'server_run', startedAt: run.start, ...(run.pulses ? { lastPulseAt: run.last } : {}), elapsedMs: Math.max(0, Math.min(21600000, (known.closedAt || run.last) - run.start)), pulses: run.pulses | 0, closedBy }
  };
  if(known.claimed) r.claimed = known.claimed;
  if(known.verified) r.verified = known.verified;
  r.credit = { eligible: !!(known.verified && closedBy === 'finish' && outcome !== 'unknown') };
  return r;
}
// Entrada del libro de server/accounts.js (walletApply): { id, userId, delta, balanceAfter, reason, ref, actor, at }.
function fromWalletEntry(e){
  const reason = String(e.reason || '');
  const source = /^(buy|buyp|buyc):/.test(reason) ? 'shop_purchase' : reason.startsWith('refund:') ? 'refund' : /^(payment|mp):/.test(reason) ? 'payment' : /^welcome/.test(reason) ? 'migration' : 'gm_adjust';
  const kind = e.delta === 0 ? 'adjust' : e.delta < 0 ? 'debit' : source === 'refund' ? 'refund' : source === 'gm_adjust' ? 'adjust' : 'credit';
  const ref = e.ref && /^[a-zA-Z0-9_.:-]{8,80}$/.test(e.ref) ? e.ref : null;
  return {
    contract: 'EconomyTransaction', version: VERSIONS.EconomyTransaction, txId: ref || ('wallet:' + e.userId + ':' + e.id),
    ...(ref ? { idempotencyKey: ref } : {}), accountId: String(e.userId), kind, currency: 'brasas', amount: e.delta, balanceAfter: e.balanceAfter,
    source, actor: source === 'shop_purchase' || source === 'refund' ? 'user' : (e.actor && String(e.actor) !== String(e.userId) ? 'admin' : 'server'), at: e.at, reason: reason.slice(0, 120)
  };
}
// Fila de guardado: { data (objeto o texto JSON), version, updatedAt } como la devuelve store.getSave().
function fromSave(row, accountId){
  const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
  const bytes = Buffer.byteLength(typeof row.data === 'string' ? row.data : JSON.stringify(row.data));
  const champions = {};
  for(const [k, c] of Object.entries(data.champions || {})) champions[k] = { level: c.level | 0 || 1, ...(Number.isInteger(c.xp) ? { xp: c.xp } : {}), unlocked: !!c.unlocked };
  return {
    contract: 'PlayerProfile', version: VERSIONS.PlayerProfile, accountId: String(accountId),
    save: { cloudVersion: row.version | 0, ...(row.updatedAt ? { updatedAt: row.updatedAt } : {}), itemSchemaV: data.itemSchemaV | 0, bytes, appliedMigrations: appliedMigrations(data), economyV2: data.economyV2 === true },
    progress: { gold: Math.max(0, Math.floor(Number(data.gold) || 0)), gems: Math.max(0, Math.floor(Number(data.gems) || 0)), arenasCleared: Object.values(data.arenasCleared || {}).filter(Boolean).length, starterChosen: !!data.starterChosen },
    champions
  };
}
// Lista cerrada que acepta HOY POST /api/telemetry (server/game-master.js, const EVENTS). Una prueba detecta si se desalinea.
const ACCEPTED_EVENT_NAMES = Object.freeze(['start','login','menu','tutorial_started','tutorial_completed','arena_started','death','abandon','victory','next_arena','ability','talent','equipment','set','drop','codex','skin','croma','multiplayer','error','heartbeat','level_up','pickup','tutorial_step','tutorial_step_complete','tutorial_abandoned','tutorial_skipped']);
// Propuestos para el Agente C: el servidor de producción todavía los rechaza (BAD_EVENT) hasta que C los habilite.
const PROPOSED_EVENT_NAMES = Object.freeze(['session_end','client_error','perf_sample','retention_day']);
const WIRE_DIMS = ['champion','arena','skin','croma','ability','talent','equipment','set','step','errorCode'], WIRE_VALUES = ['durationMs','level','wave'];
// TelemetryEvent -> forma que acepta el servidor hoy. Lo que el servidor no acepta se informa en `dropped`, no se envía.
function toWire(ev){
  const wire = { name: ev.name }, dropped = [];
  for(const [k, v] of Object.entries(ev.dims || {})) (WIRE_DIMS.includes(k) ? (wire[k] = v) : dropped.push(k));
  for(const [k, v] of Object.entries(ev.values || {})) (WIRE_VALUES.includes(k) ? (wire[k] = v) : dropped.push(k));
  if(!ACCEPTED_EVENT_NAMES.includes(ev.name)) dropped.push('name:' + ev.name);
  return { wire, dropped };
}

module.exports = { VERSIONS, OWNERS, SCHEMAS, CODES, ContractError, validate, assertValid, checkVersion, parseVersion, compareReplay, fromServerRun, fromWalletEntry, fromSave, toWire, ACCEPTED_EVENT_NAMES, PROPOSED_EVENT_NAMES, MIGRATIONS, appliedMigrations, ELAPSED_TOLERANCE_MS };
