'use strict';
// Telemetría: el contrato TelemetryEvent frente a la ruta REAL POST /api/telemetry y a la lista cerrada de eventos.
const fs = require('node:fs'), path = require('node:path');
const { ROOT, check, summary, harness } = require('./lib');
const C = require('../../contracts/v1');
const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const setOf = (text, re) => { const m = re.exec(text); return m ? [...m[1].matchAll(/'([a-z_0-9]+)'/g)].map(x => x[1]) : null; };

(async () => {
  // 1. Desalineación entre el contrato y la lista que el servidor acepta hoy.
  const server = setOf(src('server/game-master.js'), /const EVENTS = new Set\(\[([^\]]+)\]\)/);
  check('se pudo leer la lista de eventos del servidor', Array.isArray(server) && server.length > 20, server && server.length);
  check('ACCEPTED_EVENT_NAMES coincide exactamente con server/game-master.js', JSON.stringify([...server].sort()) === JSON.stringify([...C.ACCEPTED_EVENT_NAMES].sort()));
  const client = [...src('js/net/alpha-services.js').matchAll(/const knownEvents = new Set\(\[([^\]]+)\]\)/g)][0];
  const clientNames = client ? [...client[1].matchAll(/"([a-z_0-9]+)"/g)].map(x => x[1]) : [];
  const aliases = { run_started: 'arena_started', defeat: 'death', skill: 'ability' }; // alias que el servidor normaliza
  const notAccepted = clientNames.filter(n => !server.includes(aliases[n] || n));
  console.log(`INFO el cliente puede emitir ${clientNames.length} nombres; el servidor rechazaría (BAD_EVENT) ${notAccepted.length}: ${notAccepted.join(',') || '-'}`);
  check('los eventos propuestos aún no existen en el servidor (no se rompe nada al publicarlos como contrato)', C.PROPOSED_EVENT_NAMES.every(n => !server.includes(n)));
  check('propuestos y aceptados no se solapan', C.PROPOSED_EVENT_NAMES.every(n => !C.ACCEPTED_EVENT_NAMES.includes(n)));

  // 2. Traducción a la forma de red actual.
  const base = { contract: 'TelemetryEvent', version: '1.0.0', session: 'ab'.repeat(16), build: 'ct-test' };
  const ev = { ...base, name: 'victory', dims: { champion: 'tanque', arena: 'ciudad' }, values: { durationMs: 150000, level: 7, fps: 58.5 } };
  const w = C.toWire(ev);
  check('toWire conserva las dimensiones y valores que el servidor acepta', w.wire.name === 'victory' && w.wire.champion === 'tanque' && w.wire.durationMs === 150000 && w.wire.level === 7);
  check('toWire informa lo que el servidor todavía no acepta (fps) en vez de enviarlo', w.dropped.includes('fps') && !('fps' in w.wire));
  check('toWire marca un nombre propuesto como no aceptado', C.toWire({ ...base, name: 'perf_sample' }).dropped.includes('name:perf_sample'));

  // 3. Contra el servidor real.
  const h = harness({ HORDA_ITEM_ECONOMY: '0' });
  await h.start();
  try{
    const post = events => h.api('POST', '/api/telemetry', { session: base.session, build: 'ct-test', version: 'ct-test', alpha: '02', events });
    const ok = await post([w.wire, { name: 'arena_started', champion: 'mago', arena: 'bosque' }]);
    check('el servidor acepta los eventos traducidos', ok.status === 200 && ok.body.accepted === 2, ok);
    const alias = await post([{ name: 'run_started', champion: 'mago' }, { name: 'defeat' }, { name: 'skill', ability: 'bola' }]);
    check('el servidor normaliza los alias del cliente', alias.status === 200 && alias.body.accepted === 3, alias);
    const prop = await post([{ name: 'perf_sample' }]);
    check('un evento propuesto hoy se rechaza (400): hay que habilitarlo en el servidor antes de emitirlo', prop.status === 400, prop.body);
    check('lote vacío => 400', (await post([])).status === 400);
    check('más de 30 eventos => 400', (await post(Array.from({ length: 31 }, () => ({ name: 'heartbeat' })))).status === 400);
    check('dimensión con caracteres peligrosos => 400', (await post([{ name: 'start', champion: '<img onerror=1>' }])).status === 400);
    check('valor fuera de rango => 400', (await post([{ name: 'victory', durationMs: 90000000 }])).status === 400);
    const pii = await post([{ name: 'start', email: 'private@example.com', user: 'bob', text: 'hola' }]);
    const gm = await h.app.store.gmRead();
    check('campos personales enviados por error no se guardan (la ruta los descarta)', pii.status === 200 && !JSON.stringify(gm.metrics || {}).match(/private@example|bob|hola/), pii);
    check('el contrato rechaza esos mismos campos antes de enviar', !C.validate('TelemetryEvent', { ...base, name: 'start', email: 'private@example.com' }).ok);
    // Límite por IP: 60 lotes por minuto.
    let last = 200; for(let i = 0; i < 70 && last === 200; i++) last = (await post([{ name: 'heartbeat' }])).status;
    check('el servidor limita los lotes por IP (429 antes de 70 lotes)', last === 429, last);
    check('las métricas del servidor suman solo lo aceptado', (gm.metrics?.total?.victory | 0) >= 1 && (gm.metrics?.total?.arena_started | 0) >= 1);
  } finally { await h.stop().catch(() => {}); h.cleanup(); }
  summary('telemetría: contrato y ruta real');
})().catch(e => { console.error(e); process.exitCode = 1; });
