'use strict';
// Contratos v1: esquemas bien formados, versionado, rechazo de datos inválidos. Sin red, sin servidor, sin navegador.
const C = require('../../contracts/v1'), { check, codes, summary } = require('./lib');
const uuid = '3f2b8a1c-0d4e-4c7a-9b1e-5a6d7c8e9f00';
const gr = (o = {}) => ({ contract: 'GameResult', version: '1.0.0', runId: uuid, accountId: '7', mode: 'campaign', arena: 'ciudad', champion: 'tanque', outcome: 'victory',
  evidence: { source: 'server_run', startedAt: 1000, lastPulseAt: 150000, elapsedMs: 150000, pulses: 3, closedBy: 'finish' },
  verified: { durationMs: 150000, round: 5, verifier: 'server-economy-live' }, credit: { eligible: true }, ...o });
const tx = (o = {}) => ({ contract: 'EconomyTransaction', version: '1.0.0', txId: 'run_reward:' + uuid, idempotencyKey: 'run_reward:' + uuid, accountId: '7', kind: 'credit', currency: 'gold', amount: 1280, source: 'run_reward', evidenceRef: uuid, actor: 'server', at: 1, ...o });
const pp = (o = {}) => ({ contract: 'PlayerProfile', version: '1.0.0', accountId: '7', save: { cloudVersion: 3, itemSchemaV: 2, bytes: 1000, appliedMigrations: ['itemSchemaV2'] }, progress: { gold: 10, gems: 1 }, champions: { tanque: { level: 12, unlocked: true } }, ...o });
const te = (o = {}) => ({ contract: 'TelemetryEvent', version: '1.0.0', name: 'victory', session: 'a'.repeat(32), build: 'alpha-completion-2', dims: { champion: 'tanque' }, values: { durationMs: 1000 }, ...o });

// 1. Los esquemas existen, tienen $id y la versión del esquema coincide con VERSIONS.
for(const [n, s] of Object.entries(C.SCHEMAS)){
  check(`${n}: esquema declara su $id con la versión vigente`, s.$id === `fondal/la-horda/${n}/${C.VERSIONS[n]}`, s.$id);
  check(`${n}: propietario asignado`, ['A', 'B', 'C'].includes(C.OWNERS[n]));
  check(`${n}: rechaza campos no declarados (additionalProperties:false)`, s.additionalProperties === false);
}
// 2. Un ejemplo válido de cada contrato pasa.
check('GameResult válido pasa', C.validate('GameResult', gr()).ok, C.validate('GameResult', gr()).errors);
check('EconomyTransaction válida pasa', C.validate('EconomyTransaction', tx()).ok, C.validate('EconomyTransaction', tx()).errors);
check('PlayerProfile válido pasa', C.validate('PlayerProfile', pp()).ok, C.validate('PlayerProfile', pp()).errors);
check('TelemetryEvent válido pasa', C.validate('TelemetryEvent', te()).ok, C.validate('TelemetryEvent', te()).errors);
// 3. Versionado.
check('versión sin formato semver => BAD_VERSION', codes(C.validate('GameResult', gr({ version: 'uno' }))).includes('BAD_VERSION'));
check('versión MAJOR distinta => UNSUPPORTED_VERSION', codes(C.validate('GameResult', gr({ version: '2.0.0' }))).includes('UNSUPPORTED_VERSION'));
check('MINOR mayor que el del consumidor => UNSUPPORTED_VERSION', codes(C.validate('TelemetryEvent', te({ version: '1.1.0' }))).includes('UNSUPPORTED_VERSION'));
check('PATCH distinto es compatible', C.validate('TelemetryEvent', te({ version: '1.0.7' })).ok);
check('contrato desconocido => UNKNOWN_CONTRACT', codes(C.validate('Nada', {})).includes('UNKNOWN_CONTRACT'));
check('valor que no es objeto => BAD_TYPE', codes(C.validate('GameResult', 'x')).includes('BAD_TYPE') && codes(C.validate('GameResult', null)).includes('BAD_TYPE') && codes(C.validate('GameResult', [])).includes('BAD_TYPE'));
// 4. Rechazo de datos inválidos, por código.
const bad = (label, name, v, code) => check(label, codes(C.validate(name, v)).includes(code), C.validate(name, v).errors);
bad('GameResult: falta runId', 'GameResult', (() => { const x = gr(); delete x.runId; return x; })(), 'MISSING_FIELD');
bad('GameResult: campo extra', 'GameResult', gr({ gold: 999999 }), 'UNKNOWN_FIELD');
bad('GameResult: modo fuera de lista', 'GameResult', gr({ mode: 'dios' }), 'BAD_ENUM');
bad('GameResult: duración negativa declarada', 'GameResult', gr({ claimed: { durationMs: -1 } }), 'OUT_OF_RANGE');
bad('GameResult: duración mayor a 6 h', 'GameResult', gr({ claimed: { durationMs: 21600001 } }), 'OUT_OF_RANGE');
bad('GameResult: tipo incorrecto', 'GameResult', gr({ evidence: { ...gr().evidence, pulses: '3' } }), 'BAD_TYPE');
bad('GameResult: NaN rechazado', 'GameResult', gr({ claimed: { score: NaN } }), 'BAD_TYPE');
bad('GameResult: prototipo contaminado', 'GameResult', JSON.parse('{"__proto__":{"x":1},"contract":"GameResult","version":"1.0.0"}'), 'UNKNOWN_FIELD');
bad('EconomyTransaction: monto decimal', 'EconomyTransaction', tx({ amount: 1.5 }), 'BAD_TYPE');
bad('EconomyTransaction: moneda desconocida', 'EconomyTransaction', tx({ currency: 'bitcoin' }), 'BAD_ENUM');
bad('EconomyTransaction: txId corto', 'EconomyTransaction', tx({ txId: 'abc' }), 'BAD_FORMAT');
bad('EconomyTransaction: monto fuera de rango', 'EconomyTransaction', tx({ amount: 2e9 }), 'OUT_OF_RANGE');
bad('EconomyTransaction: credit con monto negativo', 'EconomyTransaction', tx({ amount: -5 }), 'SIGN_MISMATCH');
bad('EconomyTransaction: debit con monto positivo', 'EconomyTransaction', tx({ kind: 'debit', source: 'shop_purchase', actor: 'user', evidenceRef: undefined, amount: 5 }), 'SIGN_MISMATCH');
bad('PlayerProfile: oro negativo', 'PlayerProfile', pp({ progress: { gold: -1, gems: 0 } }), 'OUT_OF_RANGE');
bad('PlayerProfile: guardado > 512 KB', 'PlayerProfile', pp({ save: { ...pp().save, bytes: 600000 } }), 'OUT_OF_RANGE');
bad('PlayerProfile: campeón sin nivel', 'PlayerProfile', pp({ champions: { tanque: { unlocked: true } } }), 'MISSING_FIELD');
bad('TelemetryEvent: sesión no hexadecimal', 'TelemetryEvent', te({ session: 'zz' }), 'BAD_FORMAT');
bad('TelemetryEvent: dimensión con caracteres peligrosos', 'TelemetryEvent', te({ dims: { champion: '<img onerror=1>' } }), 'BAD_FORMAT');
bad('TelemetryEvent: correo (dato personal)', 'TelemetryEvent', te({ email: 'a@b.cd' }), 'PII_FIELD');
bad('TelemetryEvent: usuario dentro de dims', 'TelemetryEvent', te({ dims: { user: 'bob' } }), 'PII_FIELD');
bad('TelemetryEvent: pila de errores', 'TelemetryEvent', te({ values: { stack: 'x' } }), 'PII_FIELD');
bad('TelemetryEvent: valor fuera de rango', 'TelemetryEvent', te({ values: { durationMs: 90000000 } }), 'OUT_OF_RANGE');
// 5. Reglas semánticas de acreditación.
const nc = (label, r) => check(label, codes(C.validate('GameResult', r)).includes('NOT_CREDITABLE'), C.validate('GameResult', r).errors);
nc('no acreditable: evidencia declarada por el cliente', gr({ evidence: { ...gr().evidence, source: 'client_declared' } }));
nc('no acreditable: sin resultado verificado', (() => { const x = gr(); delete x.verified; return x; })());
nc('no acreditable: partida no cerrada con finish', gr({ evidence: { ...gr().evidence, closedBy: 'abandon' } }));
nc('no acreditable: resultado desconocido', gr({ outcome: 'unknown' }));
nc('no acreditable: duración verificada mayor a la observada', gr({ verified: { ...gr().verified, durationMs: 200000 } }));
nc('un resultado del cliente no puede marcarse verificado', gr({ credit: { eligible: false }, evidence: { ...gr().evidence, source: 'client_declared' } }));
check('GameResult no acreditable pero informativo (eligible:false) es válido', C.validate('GameResult', gr({ credit: { eligible: false }, outcome: 'abandon', evidence: { ...gr().evidence, closedBy: 'abandon' }, verified: undefined })).ok);
bad('recompensa de partida sin evidenceRef', 'EconomyTransaction', (() => { const x = tx(); delete x.evidenceRef; return x; })(), 'EVIDENCE_REQUIRED');
bad('recompensa de partida acreditada por el usuario', 'EconomyTransaction', tx({ actor: 'user' }), 'NOT_CREDITABLE');
// 6. Idempotencia.
check('misma clave y mismo contenido => repetición', C.compareReplay(tx(), tx()).replay === true);
check('misma clave y monto distinto => IDEMPOTENCY_MISMATCH', codes(C.compareReplay(tx(), tx({ amount: 99999 }))).includes('IDEMPOTENCY_MISMATCH'));
check('misma clave y cuenta distinta => IDEMPOTENCY_MISMATCH', codes(C.compareReplay(tx(), tx({ accountId: '8' }))).includes('IDEMPOTENCY_MISMATCH'));
// 7. Los códigos de error de los contratos están documentados.
const doc = require('node:fs').readFileSync(require('node:path').join(require('./lib').ROOT, 'docs/arquitectura-compartida/CONTRATOS.md'), 'utf8');
for(const c of Object.keys(C.CODES)) check(`código ${c} documentado en CONTRATOS.md`, doc.includes('`' + c + '`'));
summary('contratos: esquemas, versionado y rechazo');
