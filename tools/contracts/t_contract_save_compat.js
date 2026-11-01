'use strict';
// Compatibilidad con guardados existentes y recuperación tras reinicio, contra el servidor REAL en proceso (carpeta temporal).
// Ruta heredada (HORDA_ITEM_ECONOMY=0): es el comportamiento de producción hoy mientras no haya base persistente.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { ROOT, check, codes, summary, harness } = require('./lib');
const C = require('../../contracts/v1');
const legacy = require(path.join(ROOT, 'js/storage/legacy-champion-ids.js'));
const FIX = path.join(ROOT, 'tools/regression/fixtures');
const fixtures = fs.readdirSync(FIX).filter(f => /^save_.*\.json$/.test(f)).sort();

(async () => {
  check('hay al menos 3 guardados reales de versiones distintas', fixtures.length >= 3, fixtures);
  // 1. Proyección PlayerProfile de cada guardado real, sin mutarlo.
  for(const f of fixtures){
    const raw = fs.readFileSync(path.join(FIX, f), 'utf8'), before = JSON.parse(raw);
    const prof = C.fromSave({ data: raw, version: 4, updatedAt: 1760000000000 }, 7);
    const v = C.validate('PlayerProfile', prof);
    check(`${f}: se proyecta a PlayerProfile v1 válido`, v.ok, v.errors);
    check(`${f}: la proyección no muta el guardado`, (() => { try{ assert.deepEqual(JSON.parse(raw), before); return true; }catch{ return false; } })());
    check(`${f}: conserva todos los campeones (${Object.keys(before.champions).length})`, Object.keys(prof.champions).length === Object.keys(before.champions).length);
  }
  // 2. Ids heredados: el guardado con 'eren' se migra con la implementación REAL compartida y el perfil lo refleja.
  const old = JSON.parse(fs.readFileSync(path.join(FIX, fixtures[0]), 'utf8'));
  old.champions.eren = { level: 5, xp: 10, unlocked: true };
  check('guardado heredado con eren: la migración legacy se marca pendiente', !C.fromSave({ data: old, version: 1 }, 7).save.appliedMigrations.includes('legacyChampionIds'));
  const changed = legacy.legacyChampionMigrate(old);
  const after = C.fromSave({ data: old, version: 2 }, 7);
  check('legacyChampionMigrate cambia el guardado y deja de existir eren', changed && !old.champions.eren && !!old.champions.ilkan);
  check('tras migrar el perfil marca legacyChampionIds y sigue siendo válido', after.save.appliedMigrations.includes('legacyChampionIds') && C.validate('PlayerProfile', after).ok);
  // 3. Registro de migraciones: cada migración apunta a un archivo que existe.
  check('cada migración declarada apunta a un archivo existente', C.MIGRATIONS.every(m => fs.existsSync(path.join(ROOT, m.implementedIn))), C.MIGRATIONS.filter(m => !fs.existsSync(path.join(ROOT, m.implementedIn))).map(m => m.id));
  // 4. Servidor real: PUT/GET, conflicto de versión, rechazo de datos inválidos y reinicio.
  const h = harness({ HORDA_ITEM_ECONOMY: '0', DATA_PERSISTENT: '1' });
  await h.start();
  try{
    const reg = await h.api('POST', '/api/register', { user: 'contractsave', pass: 'test-long-password' });
    check('registro de cuenta de prueba', reg.status === 201 && !!reg.body.token, reg);
    const t = reg.body.token;
    const g0 = await h.api('GET', '/api/save', undefined, t);
    check('cuenta nueva: guardado en la nube vacío y versión 0', g0.status === 200 && g0.body.version === 0 && g0.body.data === null, g0.body);
    const data = JSON.parse(fs.readFileSync(path.join(FIX, fixtures[fixtures.length - 1]), 'utf8'));
    const put = await h.api('PUT', '/api/save', { baseVersion: 0, data }, t);
    check('PUT del guardado real (versión base 0) => 200 y versión 1', put.status === 200 && put.body.version === 1, put);
    check('PUT no reporta ajustes de derechos sobre un guardado legítimo', Array.isArray(put.body.enforced) && put.body.enforced.length === 0, put.body.enforced);
    const g1 = await h.api('GET', '/api/save', undefined, t);
    const p1 = C.fromSave({ data: g1.body.data, version: g1.body.version, updatedAt: g1.body.updatedAt }, 'contractsave');
    check('GET devuelve el guardado y se proyecta a PlayerProfile válido', g1.status === 200 && C.validate('PlayerProfile', p1).ok, C.validate('PlayerProfile', p1).errors);
    check('ida y vuelta en la nube: oro, gemas y campeones idénticos', g1.body.data.gold === data.gold && g1.body.data.gems === data.gems && Object.keys(g1.body.data.champions).length === Object.keys(data.champions).length);
    // Conflicto: otro dispositivo con versión base vieja.
    const stale = await h.api('PUT', '/api/save', { baseVersion: 0, data }, t);
    check('versión base vieja => 409 CONFLICT con la versión vigente', stale.status === 409 && stale.body.error === 'CONFLICT' && stale.body.version === 1, stale);
    const next = await h.api('PUT', '/api/save', { baseVersion: 1, data: { ...data, gold: (data.gold | 0) + 5 } }, t);
    check('versión base correcta => 200 y versión 2', next.status === 200 && next.body.version === 2, next);
    // Datos inválidos.
    check('guardado que no es objeto => 400 BAD_SAVE', (await h.api('PUT', '/api/save', { baseVersion: 2, data: [1, 2] }, t)).body?.error === 'BAD_SAVE');
    check('sin versión base => 400 BAD_VERSION', (await h.api('PUT', '/api/save', { data }, t)).body?.error === 'BAD_VERSION');
    const big = await h.api('PUT', '/api/save', { baseVersion: 2, data: { x: 'a'.repeat(600 * 1024) } }, t);
    check('guardado > 512 KB => 413 SAVE_TOO_BIG', big.status === 413, big.body);
    check('sin sesión => 401', (await h.api('GET', '/api/save')).status === 401);
    // Reinicio del servidor: el guardado, la versión y el acceso sobreviven (modo archivo).
    const before = (await h.api('GET', '/api/save', undefined, t)).body;
    await h.stop(); await h.start();
    const login = await h.api('POST', '/api/login', { user: 'contractsave', pass: 'test-long-password' });
    check('tras reiniciar el servidor la cuenta inicia sesión', login.status === 200 && !!login.body.token, login);
    const after2 = (await h.api('GET', '/api/save', undefined, login.body.token)).body;
    check('tras reiniciar: mismo guardado y misma versión', after2.version === before.version && JSON.stringify(after2.data) === JSON.stringify(before.data));
    const health = await h.api('GET', '/api/health');
    console.log('INFO /api/health en modo de prueba:', JSON.stringify({ store: health.body?.store, persistent: health.body?.persistent }));
    // Recuperación tras desconexión del cliente: reintentar el mismo PUT con la versión que no llegó a confirmar es seguro.
    const lost = await h.api('PUT', '/api/save', { baseVersion: after2.version, data: { ...after2.data, gold: 777 } }, login.body.token);
    const retry = await h.api('PUT', '/api/save', { baseVersion: after2.version, data: { ...after2.data, gold: 777 } }, login.body.token);
    check('PUT confirmado y reintentado con la misma base => el reintento recibe 409 y la versión vigente (el cliente se reconcilia sin duplicar)', lost.status === 200 && retry.status === 409 && retry.body.version === lost.body.version, { lost: lost.status, retry: retry.status });
  } finally { await h.stop().catch(() => {}); h.cleanup(); }
  summary('compatibilidad de guardados y recuperación');
})().catch(e => { console.error(e); process.exitCode = 1; });
