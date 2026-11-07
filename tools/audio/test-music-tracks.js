// CAPA DE PISTAS DE ARCHIVO (js/audio/music-tracks.js) sobre el motor real, en Chromium:
// reproduce una pista aprobada, no repite dos veces seguidas, no deja reproductores sin liberar, cae al procedural si
// el archivo falla o no hay pista, respeta pausa/mute y se suspende en segundo plano.
// Las pistas son WAV sintéticos inyectados por red (no dependen de archivos reales ni de la biblioteca).
//   node tools/audio/test-music-tracks.js       (levanta su propio servidor en 127.0.0.1:8797)
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path'), http = require('http'), { spawn } = require('child_process');
const PORT = 8797, ROOT = path.join(__dirname, '../..');
const BASE = process.env.SE_BASE_URL || `http://127.0.0.1:${PORT}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 300) : '')); if (!ok) fails++; };
const up = () => new Promise(res => { const rq = http.get(BASE + '/index.html', r => { r.resume(); res(r.statusCode === 200); }); rq.on('error', () => res(false)); rq.setTimeout(800, () => { rq.destroy(); res(false); }); });
function wav(freq, secs) { const sr = 22050, n = sr * secs, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(2 * Math.PI * freq * i / sr) * 0.3 * 32767), 44 + i * 2); return b; }
const MANIFEST = { contract: 'MusicAssignments', version: 1, tracks: {
    ta: { file: 'assets/audio/music/test-a.wav', gainDb: 0 }, tb: { file: 'assets/audio/music/test-b.wav', gainDb: 0 }, tbroken: { file: 'assets/audio/music/test-missing.wav', gainDb: 0 } },
  slots: { 'wave@bosque': ['ta', 'tb'], boss: ['tb'], victory: ['ta'], 'wave@minas': ['tbroken'] } };
(async () => {
  let server = null;
  if (!(await up())) { server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); for (let i = 0; i < 50 && !(await up()); i++) await sleep(200); }
  const browser = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const page = await (await browser.newContext({ viewport: { width: 844, height: 390 } })).newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/assets/audio/music/assignments.v1.json', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(MANIFEST) }));
  await page.route('**/assets/audio/music/test-a.wav', r => r.fulfill({ contentType: 'audio/wav', body: wav(220, 8) }));
  await page.route('**/assets/audio/music/test-b.wav', r => r.fulfill({ contentType: 'audio/wav', body: wav(440, 8) }));
  await page.route('**/assets/audio/music/test-missing.wav', r => r.fulfill({ status: 404, body: 'nope' }));
  await page.goto(`${BASE}/index.html`);
  for (let i = 0; i < 100; i++) { if (await page.evaluate(() => typeof MusicTracks !== 'undefined' && !!MusicTracks.manifest)) break; await sleep(100); }
  check('manifiesto cargado', await page.evaluate(() => !!MusicTracks.manifest));
  // medidor a la salida del master
  await page.evaluate(() => { initAudio(); startMusic(); const a = audioCtx.createAnalyser(); a.fftSize = 2048; masterGain.connect(a); window.__an = a; window.__rms = () => { const d = new Float32Array(2048); __an.getFloatTimeDomainData(d); return Math.sqrt(d.reduce((s, v) => s + v * v, 0) / d.length); }; });
  const state = () => page.evaluate(() => ({ cur: MusicTracks.current && MusicTracks.current.id, alive: MusicTracks.current && MusicTracks.current.alive, paused: MusicTracks.current && MusicTracks.current.el.paused, st: MusicTracks.stats, ft: !!M.fileTrack, ctx: audioCtx.state, log: MusicTracks.log.filter(l => l.kind === 'error').length }));
  const set = (mode, arena) => page.evaluate(([m, a]) => { currentArena = a; setMusicMode(m, 1); }, [mode, arena]);
  // 1) pista aprobada suena
  await set('wave', 'bosque'); await sleep(4500); let s = await state();
  check('wave@bosque usa una pista de archivo viva', ['ta', 'tb'].includes(s.cur) && s.alive && !s.paused && s.ft, s);
  const first = s.cur;
  // 2) sin repetir dos veces seguidas la misma pista del slot
  await set('boss', 'bosque'); await sleep(4500); await set('wave', 'bosque'); await sleep(4500); s = await state();
  check('rotación: no repite la pista del slot', s.cur !== first && ['ta', 'tb'].includes(s.cur), { first, now: s.cur });
  // 3) volumen audible por la ruta de música
  const rmsPlay = await page.evaluate(() => __rms()); check('la pista se oye en el master', rmsPlay > 0.005, { rmsPlay });
  // 4) sin pista para el modo => procedural
  await set('menu', 'bosque'); await sleep(4500); s = await state(); check('menu sin pista cae al procedural', !s.ft, s);
  // 5) archivo roto => respaldo procedural y error registrado
  await set('wave', 'minas'); await sleep(5000); s = await state();
  check('archivo 404: el procedural toma el relevo y queda registrado', s.log >= 1 && s.alive === false, s);
  const stepA = await page.evaluate(() => M.step + M.bar * 64); await sleep(900);
  check('el secuenciador procedural avanza tras el fallo', (await page.evaluate(() => M.step + M.bar * 64)) !== stepA);
  // 6) pausa baja la música; mute la calla
  await set('wave', 'bosque'); await sleep(4500); const rPlay = await page.evaluate(() => __rms());
  await page.evaluate(() => musicOnState('paused')); await sleep(800); const rPause = await page.evaluate(() => __rms());
  check('pausa baja la música', rPause < rPlay * 0.8, { rPlay, rPause });
  await page.evaluate(() => { musicOnState('playing'); setAudioEnabled(false); }); await sleep(600);
  check('mute silencia', (await page.evaluate(() => __rms())) < 0.0005); await page.evaluate(() => setAudioEnabled(true)); await sleep(300);
  // 7) segundo plano: se suspende y vuelve
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }); await sleep(500); s = await state();
  check('en segundo plano: contexto suspendido y pista en pausa', s.ctx === 'suspended' && s.paused === true, s);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }); await sleep(1200); s = await state();
  check('al volver: reanuda sin duplicar', s.ctx === 'running' && s.paused === false && s.st.active <= 2, s);
  // 8) victoria: una sola vez (no bucle)
  await set('victory', 'bosque'); await sleep(4500); check('victoria usa pista sin bucle', await page.evaluate(() => MusicTracks.current && MusicTracks.current.el.loop === false));
  // 9) estrés de cambios: sin reproductores colgados
  for (let i = 0; i < 12; i++) { await set(i % 2 ? 'boss' : 'wave', 'bosque'); await sleep(250); }
  await sleep(9000); s = await state();
  check('sin fugas: creados - liberados = activos <= 1 tras los cambios', s.st.created - s.st.disposed === s.st.active && s.st.active <= 1, s.st);
  check('sin errores de consola', errors.length === 0, errors);
  await browser.close(); if (server) server.kill();
  console.log(fails ? `FAILED ${fails}` : 'SUMMARY OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
