'use strict';
// Contratos de la arquitectura Beta (S0C): TelemetryConsent, SkillEvent (HUD), ChampionSelection, ArtAsset y LobbyMessage.
// Usa datos REALES: los ids de campeón salen del catálogo del servidor, los mensajes de sala los emite un relay real en proceso
// (server/relay.js, carpeta temporal, puerto libre) y los archivos de arte son los del repositorio.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), net = require('node:net'), cp = require('node:child_process');
const { ROOT, check, codes, summary } = require('./lib');
const C = require('../../contracts/v1');
const WS = require(path.join(ROOT, 'server/node_modules/ws'));
const tax = require(path.join(ROOT, 'server/entitlements')).taxonomy();
const ids = tax.ids;
const bad = (label, name, v, code, o) => check(label, codes(C.validate(name, v, o)).includes(code), C.validate(name, v, o).errors);
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  // ---------- TelemetryConsent ----------
  const alpha = fs.readFileSync(path.join(ROOT, 'js/net/alpha-services.js'), 'utf8');
  const legacyOptOut = /getItem\("horda_telemetry"\)\s*!==\s*"off"/.test(alpha);
  console.log(`INFO el cliente actual ${legacyOptOut ? 'ENVÍA salvo que valga "off" (opt-out): no cumple aún TelemetryConsent' : 'ya no usa el opt-out heredado'}`);
  const k0 = C.fromConsentStorage(null), kOff = C.fromConsentStorage('off', { policyVersion: 'v1' }), kOn = C.fromConsentStorage('on', { policyVersion: 'v1' }), kAuto = C.fromConsentStorage(null, { automation: true });
  check('sin valor guardado => unset (el contrato no da por consentido el comportamiento heredado)', k0.state === 'unset' && k0.source === 'legacy_default' && C.validate('TelemetryConsent', k0).ok);
  check('"off" => denied por decisión del usuario', kOff.state === 'denied' && C.validate('TelemetryConsent', kOff).ok);
  check('"on" => granted por decisión del usuario, con fecha', kOn.state === 'granted' && kOn.decidedAt > 0 && C.validate('TelemetryConsent', kOn).ok);
  check('un navegador automatizado nunca consiente', kAuto.state === 'denied' && kAuto.source === 'automation' && C.validate('TelemetryConsent', kAuto).ok);
  bad('granted por defecto heredado => NOT_CONSENTED', 'TelemetryConsent', { ...kOn, source: 'legacy_default' }, 'NOT_CONSENTED');
  bad('granted sin fecha => NOT_CONSENTED', 'TelemetryConsent', (() => { const x = { ...kOn }; delete x.decidedAt; return x; })(), 'NOT_CONSENTED');
  bad('granted por automatización => NOT_CONSENTED', 'TelemetryConsent', { ...kOn, source: 'automation' }, 'NOT_CONSENTED');
  bad('estado inventado => BAD_ENUM', 'TelemetryConsent', { ...kOn, state: 'quizas' }, 'BAD_ENUM');
  bad('identificador de cuenta en el consentimiento => UNKNOWN_FIELD', 'TelemetryConsent', { ...kOn, accountId: '7' }, 'UNKNOWN_FIELD');

  // ---------- SkillEvent: 43 campeones x 4 botones ----------
  check(`el catálogo real tiene campeones (${ids.length})`, ids.length >= 40, ids.length);
  let badEv = 0, n = 0;
  for (const id of ids) for (const slot of [0, 1, 2, 'ult']) {
    for (const h of [{ ready: true }, { cast: true, cd: 8000, cdMax: 8000 }, { blocked: true, reason: 'energy', cd: 0, cdMax: 5000 }]) {
      n++; const ev = C.fromHudSlot({ classKey: id, slot, ...h }); if (!C.validate('SkillEvent', ev).ok) badEv++;
    }
  }
  check(`${n} eventos de HUD (campeón x botón x estado) validan`, badEv === 0, badEv);
  check('ult_ready solo para el botón de definitiva', C.fromHudSlot({ classKey: 'mago', slot: 'ult', ready: true }).type === 'ult_ready' && C.fromHudSlot({ classKey: 'mago', slot: 1, ready: true }).type === 'ready');
  const ev = C.fromHudSlot({ classKey: 'mago', slot: 0, cast: true, cd: 8000, cdMax: 8000 });
  bad('blocked sin motivo => INCOMPLETE_EVENT', 'SkillEvent', { ...C.fromHudSlot({ classKey: 'mago', slot: 0, blocked: true }), reason: undefined }, 'INCOMPLETE_EVENT');
  bad('cast sin cooldownMaxMs => INCOMPLETE_EVENT', 'SkillEvent', (() => { const x = { ...ev }; delete x.cooldownMaxMs; return x; })(), 'INCOMPLETE_EVENT');
  bad('ready con enfriamiento pendiente => INCOMPLETE_EVENT', 'SkillEvent', { ...ev, type: 'ready', cooldownMs: 100 }, 'INCOMPLETE_EVENT');
  bad('botón 7 => BAD_ENUM', 'SkillEvent', { ...ev, slot: 7 }, 'BAD_ENUM');
  bad('enfriamiento negativo => OUT_OF_RANGE', 'SkillEvent', { ...ev, cooldownMs: -1 }, 'OUT_OF_RANGE');
  bad('campeón con caracteres peligrosos => BAD_FORMAT', 'SkillEvent', { ...ev, champion: '<img>' }, 'BAD_FORMAT');
  bad('ult_ready en un botón normal => INCOMPLETE_EVENT', 'SkillEvent', { ...ev, type: 'ult_ready', slot: 1, cooldownMs: 0 }, 'INCOMPLETE_EVENT');

  // ---------- ChampionSelection ----------
  const sel = C.fromSelection({ selectedClass: ids[0], lobbyAllies: [ids[1], ids[2], ids[3]], unlocked: ids.slice(0, 10), mode: 'campaign' });
  check('selección real (catálogo del servidor) valida', C.validate('ChampionSelection', sel).ok, C.validate('ChampionSelection', sel).errors);
  check('todos los ids del catálogo son aceptados como campeón elegido', ids.every(id => C.validate('ChampionSelection', C.fromSelection({ selectedClass: id, lobbyAllies: [], unlocked: [id] })).ok));
  bad('campeón elegido sin desbloquear => NOT_UNLOCKED', 'ChampionSelection', { ...sel, selected: ids[20] }, 'NOT_UNLOCKED');
  bad('aliado repetido => DUPLICATE_CHAMPION', 'ChampionSelection', { ...sel, allies: [ids[1], ids[1]] }, 'DUPLICATE_CHAMPION');
  bad('aliado igual al elegido => DUPLICATE_CHAMPION', 'ChampionSelection', { ...sel, allies: [ids[0]] }, 'DUPLICATE_CHAMPION');
  bad('4 aliados => TOO_LONG', 'ChampionSelection', { ...sel, allies: [ids[1], ids[2], ids[3], ids[4]] }, 'TOO_LONG');
  bad('modo inventado => BAD_ENUM', 'ChampionSelection', { ...sel, mode: 'pvp_mundial' }, 'BAD_ENUM');
  bad('campo extra => UNKNOWN_FIELD', 'ChampionSelection', { ...sel, gold: 999 }, 'UNKNOWN_FIELD');

  // ---------- ArtAsset: archivos reales del repositorio ----------
  const exceptions = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/art-gate/pixel-density-exceptions.json'), 'utf8')).exceptions;
  const sample = ['assets/sprites/arenas/world-v1/bosque.png', 'assets/sprites/arenas/world-v1/hielo.png'];
  for (const rel of sample) {
    const a = C.fromAssetFile(ROOT, rel, { id: rel.replace(/^assets\//, '').replace(/\.png$/, ''), kind: 'arena_background', source: 'ai_assisted', gates: { pixelDensity: 'fail', styleGate: 'not_run', emojiLint: 'pass' } });
    check(`${rel}: se describe como ArtAsset válido (sha256, ${a.width}x${a.height})`, C.validate('ArtAsset', a).ok && a.width > 1 && a.height > 1 && /^[a-f0-9]{64}$/.test(a.sha256), C.validate('ArtAsset', a).errors);
    check(`${rel}: queda registrada con la puerta de densidad en "fail" (decisión D-24 pendiente), no se maquilla`, a.gates.pixelDensity === 'fail');
  }
  const ex0 = exceptions[0], exAsset = fs.existsSync(path.join(ROOT, ex0.id + '.png')) ? ex0.id + '.png' : null;
  if (exAsset) { const a = C.fromAssetFile(ROOT, exAsset, { id: ex0.id.replace(/^assets\//, ''), kind: 'sprite_sheet', gates: { pixelDensity: 'exception' }, exception: { reason: ex0.motivo.slice(0, 300), signedBy: 'registro-de-excepciones' } }); check('un activo con excepción documentada valida y exige su motivo', C.validate('ArtAsset', a).ok); }
  const base = C.fromAssetFile(ROOT, sample[0], { id: 'x', kind: 'icon', gates: { pixelDensity: 'exception' } });
  bad('excepción de densidad sin motivo => MISSING_FIELD', 'ArtAsset', base, 'MISSING_FIELD');
  bad('ruta fuera de assets/ => BAD_FORMAT', 'ArtAsset', { ...C.fromAssetFile(ROOT, sample[0], { id: 'x', kind: 'icon' }), path: '../server/accounts.js' }, 'BAD_FORMAT');
  bad('sha256 mal formado => BAD_FORMAT', 'ArtAsset', { ...C.fromAssetFile(ROOT, sample[0], { id: 'x', kind: 'icon' }), sha256: 'abc' }, 'BAD_FORMAT');
  bad('tipo de activo inventado => BAD_ENUM', 'ArtAsset', { ...C.fromAssetFile(ROOT, sample[0], { id: 'x', kind: 'icon' }), kind: 'video' }, 'BAD_ENUM');

  // ---------- LobbyMessage contra un relay real ----------
  const port = await freePort(), tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lobby-contract-'));
  const child = cp.spawn(process.execPath, [path.join(ROOT, 'server/relay.js')], { cwd: path.join(ROOT, 'server'), env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', DATA_DIR: tmp, ALLOWED_ORIGINS: '' }, stdio: 'ignore' });
  try {
    for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${port}/health`); if (r.status === 200) break; } catch (e) {} await sleep(150); }
    const session = (msgs) => new Promise(res => {
      const got = []; const ws = new WS(`ws://127.0.0.1:${port}`);
      const t = setTimeout(() => { try { ws.terminate(); } catch (e) {} res(got); }, 3000);
      ws.on('open', () => msgs.forEach(m => ws.send(JSON.stringify(m))));
      ws.on('message', b => { try { got.push(JSON.parse(b.toString())); } catch (e) {} if (got.length >= msgs.length + 0) { /* espera breve para recibir todo */ setTimeout(() => { clearTimeout(t); try { ws.close(); } catch (e) {} res(got); }, 400); } });
      ws.on('error', () => {});
    });
    const create = { t: 'create', protocol: 1, build: 'contract-test', arena: 'bosque', champ: ids[0], level: 5, name: 'ct', clientId: 'ct1', public: false };
    check('create (cliente->servidor) valida', C.validate('LobbyMessage', create, { direction: 'c2s' }).ok, C.validate('LobbyMessage', create, { direction: 'c2s' }).errors);
    const out = await session([{ t: 'ping' }, create]);
    const pong = out.find(m => m.t === 'pong'), joined = out.find(m => m.t === 'joined');
    check('el relay real responde pong y el mensaje cumple el contrato', !!pong && C.validate('LobbyMessage', pong, { direction: 's2c' }).ok, pong);
    check('el relay real responde joined y el mensaje cumple el contrato', !!joined && C.validate('LobbyMessage', joined, { direction: 's2c' }).ok, C.validate('LobbyMessage', joined || {}, { direction: 's2c' }).errors);
    const listOut = await session([{ t: 'rooms', build: 'contract-test' }]);
    const list = listOut.find(m => m.t === 'rooms');
    check('el relay real responde la lista de salas y cumple el contrato', !!list && C.validate('LobbyMessage', list, { direction: 's2c' }).ok, list);
    check('rooms (cliente->servidor) valida', C.validate('LobbyMessage', { t: 'rooms', build: 'x' }, { direction: 'c2s' }).ok);
    const errOut = await session([{ ...create, protocol: 999 }]);
    const err = errOut.find(m => m.t === 'error');
    check('protocolo distinto => el relay real responde error VERSION y cumple el contrato', !!err && err.code === 'VERSION' && C.validate('LobbyMessage', err, { direction: 's2c' }).ok, err);
    const joinBad = await session([{ t: 'join', protocol: 1, build: 'contract-test', code: 'ZZZZZZ', champ: ids[0], name: 'x', clientId: 'ct2' }]);
    check('unirse a una sala inexistente => error del relay que cumple el contrato', joinBad.some(m => m.t === 'error' && C.validate('LobbyMessage', m, { direction: 's2c' }).ok), joinBad);
  } finally { child.kill(); fs.rmSync(tmp, { recursive: true, force: true }); }
  bad('create sin clientId => MISSING_FIELD', 'LobbyMessage', { t: 'create', protocol: 1, build: 'b', arena: 'bosque', champ: 'x', level: 1, name: 'n' }, 'MISSING_FIELD', { direction: 'c2s' });
  bad('create con nivel negativo => OUT_OF_RANGE', 'LobbyMessage', { t: 'create', protocol: 1, build: 'b', arena: 'bosque', champ: 'x', level: -3, name: 'n', clientId: 'c' }, 'OUT_OF_RANGE', { direction: 'c2s' });
  bad('join con código en minúsculas => BAD_FORMAT', 'LobbyMessage', { t: 'join', protocol: 1, build: 'b', code: 'abc', champ: 'x', name: 'n', clientId: 'c' }, 'BAD_FORMAT', { direction: 'c2s' });
  bad('tipo de mensaje no cubierto => UNKNOWN_MESSAGE', 'LobbyMessage', { t: 'teletransportar' }, 'UNKNOWN_MESSAGE');
  bad('mensaje del servidor enviado como del cliente => UNKNOWN_MESSAGE', 'LobbyMessage', { t: 'joined', slot: 0, host: true, room: {} }, 'UNKNOWN_MESSAGE', { direction: 'c2s' });
  check('LobbyMessage es de solo lectura: lo posee Arquitectura y ningún agente', C.OWNERS.LobbyMessage === 'ARQ');
  summary('contratos Beta: consentimiento, HUD, selección, arte y lobby');
})().catch(e => { console.error(e); process.exitCode = 1; });
