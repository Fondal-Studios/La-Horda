// Comportamiento del reproductor de música por archivos (js/audio/music-files.js), sin audio real:
// la lógica es pura y se prueba con dependencias simuladas y un reloj falso.
//   no pide nada antes del primer toque · catálogo vacío/pista faltante → procedural · archivo roto →
//   fallback sin excepciones · calma↔intensa con histéresis y permanencia mínima · jefe · pausa · mute.
//   node tools/audio/t_music_player.js
const path = require('path');
const Lib = require(path.join(__dirname, '../../js/audio/music-files.js'));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 200) : '')); if (!ok) fails++; };

const CAT = { tracks: [
  { id: 'c1', archivo: 'x/c1.ogg', verificada: true, loopable: true },
  { id: 'i1', archivo: 'x/i1.ogg', verificada: true, loopable: true },
  { id: 'b1', archivo: 'x/b1.ogg', verificada: true, loopable: true },
  { id: 'm1', archivo: 'x/m1.ogg', verificada: true, loopable: true },
  { id: 'v1', archivo: 'x/v1.ogg', verificada: true, loopable: false },
  { id: 'broken', archivo: 'x/broken.ogg', verificada: true, loopable: true },
  { id: 'nover', archivo: 'x/nover.ogg', verificada: false, loopable: true } ] };
const MAP = { menu: 'm1', victoria: 'v1', derrota: null, arenas: {
  ciudad: { calma: 'c1', intensa: 'i1', jefe: 'b1' }, bosque: { calma: 'broken', intensa: 'i1', jefe: null }, hielo: { calma: 'nover', intensa: null, jefe: null } } };

function rig(over) {
  const R = { t: 0, ctxOk: false, intensity: 0, hot: false, fetched: [], opened: [], disposed: [], active: [], timers: [], cat: CAT, log: [] };
  const handle = (url) => { const h = { url, vol: null, paused: false, loop: null, play: async () => {}, pause() { h.paused = true; }, resume() { h.paused = false; }, fadeTo(v) { h.vol = v; }, dispose() { R.disposed.push(url); } }; return h; };
  R.deps = Object.assign({
    map: MAP, now: () => R.t, canPlay: () => R.ctxOk,
    fetchCatalog: async (u) => { R.fetched.push(u); if (!R.cat) throw new Error('404'); return R.cat; },
    open: async (u, o) => { R.opened.push([u, o.loop]); if (/broken/.test(u)) throw new Error('formato'); const h = handle(u); R.last = h; return h; },
    later: (fn) => { R.timers.push(fn); }, every: () => 1, clear: () => {},
    intensity: () => R.intensity, hot: () => R.hot, onActive: (on) => R.active.push(on), config: {}
  }, over || {});
  R.p = Lib.create(R.deps);
  R.step = async (ms) => { R.t += ms; await R.p.tick(); };
  return R;
}
(async () => {
  // 1. nada antes del primer toque (contexto sin correr): ni catálogo ni archivos
  let R = rig(); await R.p.setMode('menu', 1, '_'); await R.step(1000);
  check('sin contexto corriendo no se pide catálogo ni archivos', R.fetched.length === 0 && R.opened.length === 0);
  // 2. con contexto: el menú abre su tema, en loop
  R.ctxOk = true; await R.step(600);
  check('menú: abre m1 en loop, una sola vez', R.opened.length === 1 && /m1\.ogg$/.test(R.opened[0][0]) && R.opened[0][1] === true, R.opened);
  check('avisa AU.fileActive=true', R.active[R.active.length - 1] === true);
  await R.step(600); check('no reabre la misma pista', R.opened.length === 1);
  // 3. catálogo caído → procedural, sin excepción
  R = rig(); R.cat = null; R.ctxOk = true; let threw = false; try { await R.p.setMode('menu', 1, '_'); await R.step(500); } catch (e) { threw = true; }
  check('catálogo 404: no lanza, queda procedural', !threw && R.p.state().catalog === 'failed' && !R.p.state().active);
  // 4. mapa sin pista / pista no verificada → procedural
  R = rig(); R.ctxOk = true; await R.p.setMode('defeat', 1, '_'); await R.step(500);
  check('derrota sin pista en el mapa: nada abierto', R.opened.length === 0 && !R.p.state().active);
  await R.p.setMode('wave', 1, 'hielo'); await R.step(500);
  check('pista no verificada nunca se usa', R.opened.length === 0);
  // 5. archivo roto → fallback sin errores, y se rinde tras maxFails sin colgar
  R = rig(); R.ctxOk = true; await R.p.setMode('wave', 1, 'bosque'); threw = false;
  try { for (let i = 0; i < 6; i++) await R.step(600); } catch (e) { threw = true; }
  const st = R.p.state();
  check('archivo roto: no lanza, queda procedural', !threw && !st.active && R.active[R.active.length - 1] === false, st);
  check('archivo roto: deja de reintentar tras 3 fallos', st.dead && R.opened.length === 3, R.opened.length);
  // 6. calma ↔ intensa con histéresis
  R = rig(); R.ctxOk = true; await R.p.setMode('wave', 3, 'ciudad'); await R.step(600);
  check('oleada: arranca en calma c1', R.p.state().trackId === 'c1');
  R.intensity = 0.9; await R.step(1000);
  check('pico corto (1 s) NO cambia', R.p.state().trackId === 'c1');
  R.intensity = 0.1; await R.step(600); R.intensity = 0.9; await R.step(600);
  check('pico intermitente no acumula', R.p.state().trackId === 'c1');
  R.intensity = 0.9; for (let i = 0; i < 6; i++) await R.step(600);
  check('intensidad sostenida → intensa i1', R.p.state().trackId === 'i1' && R.p.state().intense, R.p.state());
  const nOpen = R.opened.length;
  R.intensity = 0.1; await R.step(5000);
  check('baja 5 s: sigue intensa (histéresis + permanencia)', R.p.state().trackId === 'i1');
  R.intensity = 0.45; await R.step(15000);
  check('zona media (0.3..0.6): no vuelve', R.p.state().trackId === 'i1');
  R.intensity = 0.1; for (let i = 0; i < 20; i++) await R.step(600);
  check('baja sostenida y permanencia cumplida → vuelve a calma', R.p.state().trackId === 'c1' && !R.p.state().intense);
  check('el cruce destruye la pista vieja (timers)', R.timers.length >= 2 && (R.timers.forEach(f => f()), R.disposed.length >= 2));
  check('una apertura por cambio (calma, intensa, calma)', R.opened.length === nOpen + 1, R.opened.length);
  // 7. élite fuerza intensa aunque la intensidad sea baja
  R = rig(); R.ctxOk = true; await R.p.setMode('wave', 3, 'ciudad'); await R.step(600); R.hot = true; for (let i = 0; i < 6; i++) await R.step(600);
  check('élite/jefe vivo sostenido → intensa', R.p.state().trackId === 'i1');
  // 8. jefe y victoria (one-shot sin loop)
  await R.p.setMode('boss', 10, 'ciudad'); await R.step(600);
  check('jefe: pista b1', R.p.state().trackId === 'b1');
  await R.p.setMode('victory', 10, 'ciudad'); await R.step(600);
  check('victoria: v1 sin loop', R.p.state().trackId === 'v1' && R.opened[R.opened.length - 1][1] === false);
  // 9. pausa y mute
  R.p.pause(true); check('pausa del juego/pestaña pausa el archivo', R.last.paused === true);
  const before = R.opened.length; R.ctxOk = true; await R.step(5000); check('en pausa no cambia de pista', R.opened.length === before);
  R.p.pause(false); check('reanuda', R.last.paused === false);
  R.ctxOk = false; await R.p.setMode('menu', 1, '_'); await R.step(1000);
  check('mute/contexto suspendido: no abre pistas nuevas', R.p.state().trackId === 'v1');
  console.log(fails ? `\n${fails} FALLAS` : '\nOK'); process.exit(fails ? 1 : 0);
})();
