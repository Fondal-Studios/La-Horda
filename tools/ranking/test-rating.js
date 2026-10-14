'use strict';
/* Rango (js/systems/ranking.js): reglas del rating sin navegador. Uso: node tools/ranking/test-rating.js
 * Cubre: divisiones, subida/bajada, Elo de dos y cuatro equipos, bots (peso, techo, tope diario, práctica), abandono, AFK, duplicados,
 * Horda contra la «par», migración/normalización de guardados (basura incluida) y propiedades en 5.000 partidas al azar. */
const assert = require('node:assert/strict');
const L = require('../../js/systems/ranking.js');
const C = L.CFG, DAY = 86400000, T0 = Date.UTC(2026, 9, 14, 12);
let n = 0; const ok = (name, fn) => { fn(); n++; console.log('ok  ' + name); };
const fresh = (mode, mmr, games) => { const sv = {}; L.ensure(sv); if(mmr != null) sv.ladder.modes[mode].mmr = sv.ladder.modes[mode].peak = mmr; if(games != null) sv.ladder.modes[mode].games = games; return sv; };
let seq = 0; const id = () => 'm' + (++seq);
const H = [{human: true}], B = [{human: false}];

ok('divisiones: bordes y nombres', () => {
  const t = m => L.tierOf(m).label;
  assert.equal(t(0), 'Ceniza'); assert.equal(t(999), 'Ceniza'); assert.equal(t(1000), 'Hierro III'); assert.equal(t(1099), 'Hierro III'); assert.equal(t(1100), 'Hierro II');
  assert.equal(t(1299), 'Hierro I'); assert.equal(t(1300), 'Brasa III'); assert.equal(t(1900), 'Zafiro III'); assert.equal(t(2499), 'Cristal I'); assert.equal(t(2500), 'Leyenda'); assert.equal(t(4000), 'Leyenda');
  assert.deepEqual(L.TIERS.map(x => x.name), ['Ceniza', 'Hierro', 'Brasa', 'Ámbar', 'Zafiro', 'Cristal', 'Leyenda']);
  assert.equal(L.tierOf(1050).progress, 0.5); assert.equal(L.tierOf(3000).progress, 1);
});
ok('Elo: esperado simétrico y rival más fuerte vale más', () => {
  assert.equal(L.expected(1000, 1000), 0.5); assert.ok(Math.abs(L.expected(1200, 1000) + L.expected(1000, 1200) - 1) < 1e-12);
  const a = fresh('cw', 1000, 20), b = fresh('cw', 1000, 20);
  const win = L.record(a, {id: id(), mode: 'cw', outcome: 'win', opps: [{human: true, mmr: 1400}]}, T0).delta;
  const win2 = L.record(b, {id: id(), mode: 'cw', outcome: 'win', opps: [{human: true, mmr: 800}]}, T0).delta;
  assert.ok(win > 12 && win2 < 12 && win > win2, `ganarle a uno más fuerte suma más (${win} > ${win2})`);
});
ok('subida y bajada contra humanos: completo, K de clasificación, luego K normal', () => {
  const sv = fresh('cw');
  const r1 = L.record(sv, {id: id(), mode: 'cw', outcome: 'win', opps: H}, T0); assert.equal(r1.counted, true); assert.equal(r1.delta, 20); assert.equal(r1.after, 1020); assert.equal(r1.vs, 'humans');
  const r2 = L.record(sv, {id: id(), mode: 'cw', outcome: 'loss', opps: H}, T0 + 1); assert.ok(r2.delta < 0 && r2.delta >= -22, 'bajó ' + r2.delta);
  const q = fresh('cw', 1000, 30); assert.equal(L.record(q, {id: id(), mode: 'cw', outcome: 'win', opps: H}, T0).delta, 12);   // K 24 → +12
  assert.equal(sv.ladder.modes.cw.wins, 1); assert.equal(sv.ladder.modes.cw.losses, 1); assert.equal(sv.ladder.modes.cw.games, 2); assert.equal(sv.ladder.modes.cw.streak, -1);
  const draw = fresh('cw', 1000, 30); assert.equal(L.record(draw, {id: id(), mode: 'cw', outcome: 'draw', opps: H}, T0).delta, 0);
});
ok('ascenso y descenso de división se informan', () => {
  const up = fresh('cw', 1095, 30); const r = L.record(up, {id: id(), mode: 'cw', outcome: 'win', opps: H}, T0); assert.equal(r.promoted, true); assert.equal(r.tierAfter.label, 'Hierro II');
  const dn = fresh('cw', 1100, 30); const d = L.record(dn, {id: id(), mode: 'cw', outcome: 'loss', opps: H}, T0); assert.equal(d.demoted, true); assert.equal(d.tierAfter.label, 'Hierro III');
  assert.match(L.describe(r), /RANGO GUERRA DE CRISTALES · Hierro II · \d+ \(\+\d+\) · ¡SUBISTE!/);
});
ok('BOTS: valen la mitad y el rival vale BOT_MMR', () => {
  const h = fresh('cw', 1100, 30), b = fresh('cw', 1100, 30);
  const dh = L.record(h, {id: id(), mode: 'cw', outcome: 'win', opps: [{human: true, mmr: 1000}]}, T0).delta, db = L.record(b, {id: id(), mode: 'cw', outcome: 'win', opps: B}, T0);
  assert.equal(db.vs, 'bots'); assert.ok(db.delta > 0 && db.delta <= Math.ceil(dh / 2), `bots ${db.delta} <= mitad de ${dh}`);
  assert.match(L.describe(db), /contra bots vale la mitad/);
});
ok('BOTS: techo (con bots no se pasa de BOT_CEIL) y práctica sin puntos arriba', () => {
  const sv = fresh('col', C.BOT_CEIL - 1, 30);
  const r = L.record(sv, {id: id(), mode: 'col', outcome: 'win', place: 1, opps: [{}, {}, {}]}, T0); assert.equal(r.counted, true); assert.equal(sv.ladder.modes.col.mmr, C.BOT_CEIL, 'llega al techo y no lo pasa');
  const p = L.record(sv, {id: id(), mode: 'col', outcome: 'win', place: 1, opps: [{}, {}, {}]}, T0 + 1);
  assert.equal(p.counted, false); assert.equal(p.reason, 'ceiling'); assert.equal(p.delta, 0); assert.equal(sv.ladder.modes.col.mmr, C.BOT_CEIL);
  assert.equal(sv.ladder.modes.col.practice.games, 1); assert.equal(sv.ladder.modes.col.practice.wins, 1); assert.equal(sv.ladder.modes.col.games, 31, 'la práctica no suma partidas con rango');
  const lose = L.record(sv, {id: id(), mode: 'col', outcome: 'loss', place: 4, opps: [{}, {}, {}]}, T0 + 2); assert.equal(lose.counted, false, 'en práctica tampoco se resta'); assert.equal(sv.ladder.modes.col.mmr, C.BOT_CEIL);
  assert.match(L.describe(p), /Práctica: contra bots no se sube más de Brasa III/);
  // contra personas sí se sigue subiendo
  const hu = L.record(sv, {id: id(), mode: 'col', outcome: 'win', place: 1, opps: [{human: true}, {}, {}]}, T0 + 3); assert.equal(hu.counted, true); assert.ok(sv.ladder.modes.col.mmr > C.BOT_CEIL);
});
ok('BOTS: tope de ganancia por día y reinicio al día siguiente; las derrotas no tienen tope', () => {
  const sv = fresh('cw', 1000, 30); let gain = 0, daycap = false;
  for(let i = 0; i < 40; i++){ const r = L.record(sv, {id: id(), mode: 'cw', outcome: 'win', opps: B}, T0 + i); if(r.reason === 'daycap') daycap = true; gain += r.counted ? r.delta : 0; }
  assert.equal(gain, C.BOT_DAY_GAIN, 'sumó exactamente el tope diario'); assert.equal(daycap, true); assert.equal(sv.ladder.modes.cw.mmr, 1000 + C.BOT_DAY_GAIN);
  const l = L.record(sv, {id: id(), mode: 'cw', outcome: 'loss', opps: B}, T0 + 100); assert.equal(l.counted, true); assert.ok(l.delta < 0);
  const next = L.record(sv, {id: id(), mode: 'cw', outcome: 'win', opps: B}, T0 + DAY + 5); assert.equal(next.counted, true); assert.ok(next.delta > 0, 'al día siguiente vuelve a sumar');
});
ok('BOTS: farmear 1.000 victorias fáciles nunca pasa del techo', () => {
  const sv = fresh('cw'); for(let i = 0; i < 1000; i++) L.record(sv, {id: id(), mode: 'cw', outcome: 'win', opps: B}, T0 + i * DAY / 3);
  assert.ok(sv.ladder.modes.cw.mmr <= C.BOT_CEIL, 'mmr ' + sv.ladder.modes.cw.mmr);
});
ok('ABANDONO: es derrota (nunca suma), de más contra personas, y salir enseguida no se anota', () => {
  const sv = fresh('cw', 1000, 30);
  const a = L.record(sv, {id: id(), mode: 'cw', outcome: 'win', abandon: true, durationMs: 60000, opps: H}, T0);   // aunque el informe diga «win»
  assert.equal(a.reason, 'abandon'); assert.equal(a.outcome, 'loss'); assert.ok(a.delta <= -(12 + C.ABANDON_EXTRA) + 1, 'resta de más: ' + a.delta); assert.equal(sv.ladder.modes.cw.abandons, 1);
  const normal = fresh('cw', 1000, 30); const l = L.record(normal, {id: id(), mode: 'cw', outcome: 'loss', opps: H}, T0); assert.ok(a.delta < l.delta, 'abandonar cuesta más que perder');
  const vsBots = fresh('cw', 1100, 30); const ab = L.record(vsBots, {id: id(), mode: 'cw', outcome: 'win', abandon: true, durationMs: 60000, opps: B}, T0); assert.ok(ab.delta < 0, 'contra bots también es derrota (peso de bots)');
  const early = fresh('cw'); const e = L.record(early, {id: id(), mode: 'cw', outcome: 'loss', abandon: true, durationMs: 5000, opps: H}, T0); assert.equal(e.reason, 'short'); assert.equal(early.ladder.modes.cw.mmr, 1000); assert.equal(early.ladder.log.length, 0);
  const col = fresh('col', 1000, 30); const c = L.record(col, {id: id(), mode: 'col', outcome: 'win', place: 1, abandon: true, durationMs: 90000, opps: [{human: true}, {}, {}]}, T0); assert.ok(c.delta < 0, 'en el Coliseo irse del torneo es el último puesto');
});
ok('AFK: nunca suma (ganar = +0), perder resta normal', () => {
  const sv = fresh('cw', 1000, 30);
  const w = L.record(sv, {id: id(), mode: 'cw', outcome: 'win', afk: true, opps: H}, T0); assert.equal(w.delta, 0); assert.equal(w.reason, 'afk'); assert.equal(w.counted, true);
  const l = L.record(sv, {id: id(), mode: 'cw', outcome: 'loss', afk: true, opps: H}, T0 + 1); assert.ok(l.delta < 0);
  assert.match(L.describe(w), /sin puntos por inactividad/);
  const h = fresh('horda', 1000, 30); assert.ok(L.record(h, {id: id(), mode: 'horda', outcome: 'loss', round: 40, afk: true}, T0).delta <= 0);
});
ok('inelegible (entrenamiento / banco de pruebas): no cambia nada, ni práctica', () => {
  const sv = fresh('col'); const before = JSON.stringify(sv); const r = L.record(sv, {id: id(), mode: 'col', outcome: 'win', place: 1, eligible: false, why: 'entrenamiento', opps: H}, T0);
  assert.equal(r.counted, false); assert.equal(r.reason, 'ineligible'); assert.equal(JSON.stringify(sv), before);
});
ok('duplicados: la misma partida no se anota dos veces', () => {
  const sv = fresh('cw'); const rep = {id: 'dup-1', mode: 'cw', outcome: 'win', opps: H};
  assert.equal(L.record(sv, rep, T0).counted, true); const again = L.record(sv, rep, T0 + 1); assert.equal(again.reason, 'duplicate'); assert.equal(sv.ladder.modes.cw.games, 1);
});
ok('COLISEO por puesto: 1.º > 2.º > 3.º > 4.º, suma cero entre iguales, empate compartido', () => {
  const d = place => L.record(fresh('col', 1000, 30), {id: id(), mode: 'col', outcome: 'loss', place, opps: [{human: true}, {human: true}, {human: true}]}, T0).delta;
  const ds = [1, 2, 3, 4].map(d); assert.ok(ds[0] > ds[1] && ds[1] > ds[2] && ds[2] > ds[3], ds.join(','));
  assert.equal(ds.reduce((a, b) => a + b, 0), 0, 'cuatro equipos iguales: lo que suben unos lo bajan otros');
  assert.ok(ds[0] > 0 && ds[3] < 0);
  const tie = L.record(fresh('col', 1000, 30), {id: id(), mode: 'col', outcome: 'draw', place: 1, tied: 2, opps: [{human: true}, {human: true}, {human: true}]}, T0).delta;
  assert.ok(tie > ds[1] && tie < ds[0], 'el empate por el 1.º vale entre el 1.º y el 2.º: ' + tie);
  const fav = L.record(fresh('col', 1800, 30), {id: id(), mode: 'col', outcome: 'win', place: 1, opps: [{human: true, mmr: 1000}, {human: true, mmr: 1000}, {human: true, mmr: 1000}]}, T0).delta; assert.ok(fav < ds[0], 'ganarles a rivales mucho más flojos suma poco');
});
ok('HORDA: contra la «par» de tu rango; quedarse corto resta, pasarla suma; abandono/AFK/ronda 1 nunca suman', () => {
  const par = L.record(fresh('horda', 1000, 30), {id: id(), mode: 'horda', outcome: 'loss', round: C.HORDA_PAR0}, T0).delta; assert.equal(par, 0, 'en la par no cambia');
  const hi = L.record(fresh('horda', 1000, 30), {id: id(), mode: 'horda', outcome: 'loss', round: 20}, T0).delta, lo = L.record(fresh('horda', 1000, 30), {id: id(), mode: 'horda', outcome: 'loss', round: 1}, T0).delta;
  assert.equal(hi, C.HORDA_K); assert.ok(lo < 0 && lo >= -C.HORDA_K);
  const hard = L.record(fresh('horda', 1900, 30), {id: id(), mode: 'horda', outcome: 'loss', round: 20}, T0).delta; assert.ok(hard < 0, 'a Zafiro 20 rondas ya no le alcanzan: ' + hard);
  const q = L.record(fresh('horda', 1000, 30), {id: id(), mode: 'horda', outcome: 'loss', round: 30, abandon: true, durationMs: 120000}, T0); assert.ok(q.delta <= 0 && q.reason === 'abandon');
  assert.equal(L.record(fresh('horda', 1000, 30), {id: id(), mode: 'horda', outcome: 'loss', round: 1}, T0).delta < 0, true);
  const prov = L.record(fresh('horda'), {id: id(), mode: 'horda', outcome: 'loss', round: 20}, T0).delta; assert.equal(prov, C.HORDA_K * 1.5);
  const s = fresh('horda'); L.record(s, {id: id(), mode: 'horda', outcome: 'loss', round: 20}, T0); assert.equal(s.ladder.log[0].vs, 'pve'); assert.equal(s.ladder.modes.horda.practice.games, 0, 'sin bots no hay techo');
});
ok('piso en 0 y tope en MAX', () => {
  const sv = fresh('cw', 5, 30); for(let i = 0; i < 20; i++) L.record(sv, {id: id(), mode: 'cw', outcome: 'loss', opps: H}, T0 + i); assert.equal(sv.ladder.modes.cw.mmr, 0);
  const top = fresh('cw', 3995, 30); for(let i = 0; i < 20; i++) L.record(top, {id: id(), mode: 'cw', outcome: 'win', opps: [{human: true, mmr: 3990}]}, T0 + i); assert.equal(top.ladder.modes.cw.mmr, C.MAX);
});
ok('MIGRACIÓN: un guardado viejo (sin rango) gana save.ladder y no pierde nada más', () => {
  const old = {champions: {mago: {level: 7, xp: 12}}, gold: 321, gems: 4, stash: [{id: 'x'}], arenasCleared: {bosque: true}, endless: {runs: 3, best: {score: 9999}}};
  const snap = JSON.stringify(old); const L1 = L.ensure(old);
  assert.deepEqual(Object.keys(L1.modes).sort(), ['col', 'cw', 'horda']); assert.equal(L1.modes.cw.mmr, 1000); assert.equal(L1.v, 1); assert.deepEqual(L1.log, []);
  const without = JSON.parse(JSON.stringify(old)); delete without.ladder; assert.equal(JSON.stringify(without), snap, 'todo lo demás idéntico');
  assert.deepEqual(L.normalize(JSON.parse(JSON.stringify(L1))), L1, 'idempotente');
});
ok('MIGRACIÓN: basura y guardados manipulados se normalizan sin lanzar', () => {
  const junk = [undefined, null, 0, 'texto', [], [1, 2], {}, {modes: 5}, {modes: {cw: 'x'}}, {modes: {cw: {mmr: '9e99', games: -5, wins: 'a', streak: 1e12, practice: 7}}}, {log: 'x'}, {log: [null, 3, {mode: 'nada'}, {mode: 'cw', delta: 1e9, id: 'x'.repeat(500)}]}, {botDay: {d: {}, gain: 'x'}}, {season: -9}];
  for(const j of junk){
    const out = L.normalize(j);
    for(const k of L.MODE_KEYS){ const m = out.modes[k]; assert.ok(Number.isInteger(m.mmr) && m.mmr >= 0 && m.mmr <= C.MAX, 'mmr ' + m.mmr); assert.ok(m.games >= 0 && m.streak >= -1000 && m.streak <= 1000); assert.ok(m.peak >= m.mmr); assert.ok(m.practice.games >= 0); }
    assert.ok(out.log.length <= C.LOG_MAX); for(const e of out.log){ assert.ok(L.MODES[e.mode]); assert.ok(Math.abs(e.delta) <= 500); assert.ok(e.id.length <= 64); }
    assert.deepEqual(L.normalize(out), out, 'idempotente');
    assert.doesNotThrow(() => L.record({ladder: j}, {id: id(), mode: 'cw', outcome: 'win', opps: H}, T0));
  }
  assert.equal(L.normalize({modes: {cw: {mmr: '9e99'}}}).modes.cw.mmr, C.MAX);
  assert.equal(L.ensure(null), null); assert.equal(L.ensure('x'), null);
  assert.equal(L.record({}, {mode: 'nada'}, T0).reason, 'ineligible'); assert.equal(L.record({}, null, T0).reason, 'ineligible');
});
ok('historial acotado y cola para una tabla global (pendientes / sincronizadas)', () => {
  const sv = fresh('cw', 1000, 30); for(let i = 0; i < 80; i++) L.record(sv, {id: 'h' + i, mode: 'cw', outcome: i % 2 ? 'win' : 'loss', opps: H}, T0 + i);
  assert.equal(sv.ladder.log.length, C.LOG_MAX); assert.equal(sv.ladder.log[C.LOG_MAX - 1].id, 'h79');
  const pend = L.pendingReports(sv); assert.equal(pend.length, C.LOG_MAX); assert.equal(L.markSynced(sv, ['h79', 'h78', 'nunca']), 2); assert.equal(L.pendingReports(sv).length, C.LOG_MAX - 2);
  for(const e of pend) assert.ok(['id', 'mode', 'at', 'outcome', 'place', 'field', 'vs', 'counted', 'reason', 'delta', 'before', 'after', 'abandon', 'afk', 'round', 'durationMs', 'synced'].every(k => k in e), 'forma del informe');
});
ok('PROPIEDADES en 5.000 partidas al azar', () => {
  let seed = 12345; const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  const sv = {}; L.ensure(sv); let t = T0, botGainToday = 0, day = L.dayKey(t);
  for(let i = 0; i < 5000; i++){
    t += Math.floor(rnd() * DAY / 6); if(L.dayKey(t) !== day){ day = L.dayKey(t); botGainToday = 0; }
    const mode = L.MODE_KEYS[(rnd() * 3) | 0], pve = mode === 'horda', human = rnd() < 0.3, ab = rnd() < 0.1, afk = rnd() < 0.05, out = ['win', 'loss', 'draw'][(rnd() * 3) | 0];
    const field = mode === 'col' ? 4 : 2, rep = {id: 'p' + i, mode, outcome: out, abandon: ab, afk, durationMs: 30000 + rnd() * 1e6, round: (rnd() * 40) | 0, place: mode === 'col' ? 1 + ((rnd() * 4) | 0) : 0, opps: Array.from({length: field - 1}, () => ({human, mmr: 800 + rnd() * 1500}))};
    const before = JSON.stringify(sv.ladder.modes[mode]), r = L.record(sv, rep, t), m = sv.ladder.modes[mode];
    assert.ok(m.mmr >= 0 && m.mmr <= C.MAX, 'rango válido'); assert.ok(m.peak >= m.mmr);
    if(r.counted && (ab || afk)) assert.ok(r.delta <= 0, `abandono/AFK nunca suma (${r.delta}) ${JSON.stringify(rep)}`);
    if(!r.counted) assert.equal(JSON.stringify(sv.ladder.modes[mode]).replace(/"practice":\{[^}]*\}/, ''), before.replace(/"practice":\{[^}]*\}/, ''), 'práctica no cambia el rating');
    if(!pve && !human && r.counted && r.delta > 0){ botGainToday += r.delta; assert.ok(botGainToday <= C.BOT_DAY_GAIN * 3 + 3, 'tope diario de bots (tres modos)'); assert.ok(m.mmr <= Math.max(C.BOT_CEIL, r.before), 'techo de bots'); }
    assert.ok(sv.ladder.log.length <= C.LOG_MAX);
  }
});
console.log('PASS ranking: ' + n + ' grupos de pruebas');
