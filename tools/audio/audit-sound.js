// AUDITORÍA DE SONIDO (reproducible). Mide, no opina.
//   node tools/audio/audit-sound.js [--json docs/audio/audit-results.json]
// A) Archivos: pico, sonoridad (LUFS), silencio inicial, costura del bucle (clic), BPM estimado, peso.
// B) Cobertura: todo playSfx("x") del código contra el registro real (SFX_CFG + ARENA_SFX); habilidades sin sonido propio.
// C) Mezcla en vivo con el lo-fi (AudioContext real): nivel de la música sola, de los golpes, de las voces y pico final.
// D) Memoria decodificada y cantidad de fuentes simultáneas.
// Sale con código 1 si algo cae en una categoría CRÍTICA (ver docs/audio/AUDITORIA_SONIDO.md).
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path'), fs = require('fs'), http = require('http'), { spawn, spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '../..'), A = d => path.join(ROOT, 'assets/audio', d);
const PORT = 8801, BASE = `http://127.0.0.1:${PORT}`, sleep = ms => new Promise(r => setTimeout(r, ms));
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const R = { critico: [], importante: [], opcional: [], info: {} }; let crit = 0;
const note = (lvl, name, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + '[' + lvl + '] ' + name + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 300) : '')); if (!ok) { R[lvl === 'CRÍTICO' ? 'critico' : lvl === 'IMPORTANTE' ? 'importante' : 'opcional'].push({ name, detail: x }); if (lvl === 'CRÍTICO') crit++; } };

// ---------- A) archivos ----------
function pcm(file, sr, secs) {
  const r = spawnSync('ffmpeg', ['-v', 'error', ...(secs ? ['-t', String(secs)] : []), '-i', file, '-ac', '1', '-ar', String(sr), '-f', 'f32le', '-'], { maxBuffer: 1 << 29 });
  return new Float32Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 4));
}
function ebur(file) {
  const r = spawnSync('ffmpeg', ['-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const i = /I:\s+(-?[\d.]+) LUFS/.exec(r.slice(r.lastIndexOf('Summary'))), p = /Peak:\s+(-?[\d.]+) dBFS/.exec(r.slice(r.lastIndexOf('Summary')));
  return { lufs: i ? +i[1] : null, tp: p ? +p[1] : null };
}
function attacks(x, sr) { // ataques por segundo (flujo de energía total y de agudos): mide el RITMO percibido sin depender del conteo de pulsos
  const hop = Math.floor(sr / 100), n = Math.floor(x.length / hop), f = new Float64Array(n - 1); let pe = 0, ph = 0;
  for (let i = 0; i < n; i++) { let e = 0, h = 0; for (let k = 1; k < hop; k++) { const v = x[i * hop + k], d = v - x[i * hop + k - 1]; e += v * v; h += d * d; } e = Math.log1p(50 * Math.sqrt(e / hop)); h = Math.log1p(400 * Math.sqrt(h / hop)); if (i) f[i - 1] = Math.max(0, e - pe) + Math.max(0, h - ph); pe = e; ph = h; }
  let m = 0, s2 = 0; for (const v of f) m += v; m /= f.length; for (const v of f) s2 += (v - m) * (v - m); const th = m + Math.sqrt(s2 / f.length); let c = 0;
  for (let i = 1; i < f.length - 1; i++) if (f[i] > th && f[i] > f[i - 1] && f[i] >= f[i + 1]) c++;
  return +(c / (n / 100)).toFixed(1);
}
function bpm(x, sr) { // autocorrelación del flujo de energía (estimación: puede dar la mitad o el doble)
  const hop = Math.floor(sr / 100), n = Math.floor(x.length / hop), e = new Float64Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < hop; k++) { const v = x[i * hop + k]; s += v * v; } e[i] = Math.sqrt(s / hop); }
  const o = new Float64Array(n - 1); let mean = 0; for (let i = 1; i < n; i++) { o[i - 1] = Math.max(0, Math.log1p(50 * e[i]) - Math.log1p(50 * e[i - 1])); mean += o[i - 1]; } mean /= o.length; for (let i = 0; i < o.length; i++) o[i] -= mean;
  const ac = lag => { let s = 0; for (let i = 0; i + lag < o.length; i++) s += o[i] * o[i + lag]; return s; }, a0 = ac(0), fr = sr / hop;
  let best = [0, 0]; for (let b = 60; b <= 200; b++) { const lag = Math.round(fr * 60 / b), v = (ac(lag) + 0.5 * ac(2 * lag)) / a0; if (v > best[0]) best = [v, b]; }
  return best[1];
}
const man = JSON.parse(fs.readFileSync(A('manifest.json'), 'utf8')), music = {};
for (const [id, m] of Object.entries(man.music)) {
  const f = A(m.file), q = ebur(f), xx = pcm(f, 44100), n = Math.round(m.loopEnd * 44100), s0 = Math.round(m.loopStart * 44100);
  // costura REAL del bucle: la última muestra tocada (loopEnd) y la primera (loopStart), dentro del archivo con relleno.
  // Error de predicción lineal en la costura contra el percentil 99 del mismo error en 4000 muestras cercanas.
  const x = xx, pe = (a, b, c) => Math.abs(c - (2 * b - a)), seam = pe(x[n - 2], x[n - 1], x[s0]), errs = [];
  for (let i = 2; i < 4000; i++) errs.push(pe(x[n - 1 - i], x[n - i], x[n - i + 1]), pe(x[s0 + i - 2], x[s0 + i - 1], x[s0 + i]));
  errs.sort((p, q) => p - q); const typ = errs[Math.floor(errs.length * 0.99)];
  music[id] = { seconds: m.seconds, lufs: q.lufs, truePeak: q.tp, bpmEst: bpm(pcm(f, 11025, 80), 11025), attacksPerSec: attacks(pcm(f, 11025, 80), 11025), seamJump: +seam.toFixed(4), typicalStep: +typ.toFixed(4), kB: Math.round(fs.statSync(f).size / 1024) };
}
R.info.music = music; console.log('INFO música', JSON.stringify(music));
const L = Object.values(music).map(m => m.lufs);
note('IMPORTANTE', 'temas parejos en sonoridad (dispersión <= 2 LU)', Math.max(...L) - Math.min(...L) <= 2, { min: Math.min(...L), max: Math.max(...L) });
note('CRÍTICO', 'ningún tema pasa de -1 dBTP (sin recorte)', Object.values(music).every(m => m.truePeak <= -1), Object.values(music).map(m => m.truePeak));
note('IMPORTANTE', 'bucles sin clic (error de predicción en la costura <= 3× el p99 local)', Object.entries(music).every(([k, m]) => m.seamJump <= 3 * m.typicalStep + 0.01), Object.fromEntries(Object.entries(music).map(([k, m]) => [k, [m.seamJump, m.typicalStep]])));
const menus = ['title', 'hub'].map(k => music[k]), game = ['wave-a', 'wave-b', 'wave-c', 'boss'].map(k => music[k]);
note('IMPORTANTE', 'la música de partida tiene más ritmo que la de menús (ataques/s: cada tema de partida > el más movido de menús)', Math.min(...game.map(m => m.attacksPerSec)) > Math.max(...menus.map(m => m.attacksPerSec)), Object.fromEntries(Object.entries(music).map(([k, m]) => [k, m.attacksPerSec])));
console.log('INFO BPM estimado (puede dar mitad/doble; el juicio de ritmo es ataques/s): ' + JSON.stringify(Object.fromEntries(Object.entries(music).map(([k, m]) => [k, m.bpmEst]))));
const small = [];
for (const [dir, items] of [['sfx', Object.values(man.sfx).flatMap(s => s.files)], ['voice', Object.values(man.voice)]]) for (const f of items) {
  const x = pcm(A(f.file), 44100); let pk = 0, lead = 0; for (let i = 0; i < x.length; i++) pk = Math.max(pk, Math.abs(x[i]));
  while (lead < x.length && Math.abs(x[lead]) < 0.01) lead++;
  small.push({ f: f.file, peakDb: +(20 * Math.log10(pk)).toFixed(1), leadMs: Math.round(lead / 44.1), seconds: f.seconds });
}
note('CRÍTICO', 'efectos y voces sin recorte (pico <= -1 dBFS)', small.every(s => s.peakDb <= -1), small.filter(s => s.peakDb > -1).map(s => s.f));
note('IMPORTANTE', 'efectos y voces sin silencio inicial > 40 ms (latencia percibida)', small.every(s => s.leadMs <= 40), small.filter(s => s.leadMs > 40).map(s => [s.f, s.leadMs]));
const sizes = ['music', 'sfx', 'voice'].map(d => fs.readdirSync(A(d)).reduce((a, f) => a + fs.statSync(path.join(A(d), f)).size, 0));
R.info.disk_MB = { music: +(sizes[0] / 1e6).toFixed(2), sfx: +(sizes[1] / 1e6).toFixed(2), voice: +(sizes[2] / 1e6).toFixed(2) };
note('IMPORTANTE', 'peso total del audio de archivo <= 8 MB', sizes.reduce((a, b) => a + b) <= 8e6, R.info.disk_MB);

// ---------- B, C, D) navegador ----------
const up = () => new Promise(res => { const rq = http.get(BASE + '/index.html', r => { r.resume(); res(r.statusCode === 200); }); rq.on('error', () => res(false)); rq.setTimeout(800, () => { rq.destroy(); res(false); }); });
(async () => {
  let server = null;
  if (!(await up())) { server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); for (let i = 0; i < 40 && !(await up()); i++) await sleep(150); }
  const src = []; // llamados literales playSfx("x") en el código
  const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.js$/.test(e.name)) { const t = fs.readFileSync(p, 'utf8'); for (const m of t.matchAll(/playSfx\(\s*["']([A-Za-z0-9_]+)["'](\s*[,)+])/g)) src.push([m[1], m[2].includes('+') ? 'prefijo' : 'literal', path.relative(ROOT, p)]); } } };
  walk(path.join(ROOT, 'js'));
  const browser = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(BASE + '/index.html?sw=0'); await sleep(1500);
  await page.evaluate(() => startMusic()); await sleep(600);
  const reg = await page.evaluate(() => ({ cfg: Object.keys(SFX_CFG), arena: Object.keys(ARENA_SFX), arenaBad: Object.entries(ARENA_SFX).filter(([k, v]) => typeof v.play !== 'function' || !(v.p >= 1)).map(([k]) => k) }));
  const lit = [...new Set(src.filter(s => s[1] === 'literal').map(s => s[0]))], known = new Set([...reg.cfg, ...reg.arena]);
  const unresolved = lit.filter(n => !known.has(n));
  // los de arena (abXxx, cmXxx, fortXxx…) se registran al CARGAR su arena: se ven en el registro real
  note('CRÍTICO', 'todo playSfx("literal") del código tiene sonido definido (' + lit.length + ' nombres)', unresolved.length === 0, unresolved);
  note('CRÍTICO', 'cada sonido de arena tiene play() y prioridad válida (' + reg.arena.length + ')', reg.arenaBad.length === 0, reg.arenaBad);
  R.info.sfx = { definidos: reg.cfg.length, arena: reg.arena.length, literales: lit.length, prefijos: [...new Set(src.filter(s => s[1] === 'prefijo').map(s => s[0]))] };
  // habilidades de héroes sin ninguna capa propia (solo lo genérico)
  const sk = await page.evaluate(async () => {
    await SampleBank.loadManifest(); const fam = {}; let total = 0;
    for (const [k, c] of Object.entries(CLASSES)) for (const s of [...(c.skills || []), c.ultimate].filter(Boolean)) { total++; const f = SampleBank.skillFamily(s); (fam[f] = fam[f] || []).push(k + ':' + s.name); }
    return { total, counts: Object.fromEntries(Object.entries(fam).map(([k, v]) => [k, v.length])) };
  });
  R.info.habilidades = sk; console.log('INFO habilidades por familia', JSON.stringify(sk));
  note('OPCIONAL', 'familias "magic" (genérico) <= 35 % de las habilidades', (sk.counts.magic || 0) <= sk.total * 0.35, sk.counts);

  // C) mezcla en vivo con lo-fi
  const live = await page.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms)); await SampleBank.loadManifest();
    const an = audioCtx.createAnalyser(); an.fftSize = 2048; AU.out.connect(an); const buf = new Float32Array(an.fftSize);
    const meas = async (secs) => { let pk = 0, ss = 0, n = 0; const t0 = performance.now(); while (performance.now() - t0 < secs * 1000) { an.getFloatTimeDomainData(buf); for (const v of buf) { pk = Math.max(pk, Math.abs(v)); ss += v * v; n++; } await sleep(20); } return { peak: +(20 * Math.log10(pk || 1e-6)).toFixed(1), rms: +(10 * Math.log10(ss / n || 1e-12)).toFixed(1) }; };
    const out = {}; currentArena = 'ciudad'; setMusicMode('wave', 1);
    for (let i = 0; i < 100 && !SampleBank.holds(); i++) await sleep(100); await sleep(2500);
    out.holds = SampleBank.holds(); out.musica = await meas(3);
    // ráfaga de combate: golpes + habilidades + rugido; mismo tramo con y sin voces
    const hit = { x: 0, y: 0 }; const burst = async (withVoice) => { const t = []; for (let i = 0; i < 14; i++) { playSfx(i % 4 === 0 ? 'crit' : 'hit', hit); if (i % 5 === 0) { playSfx('cast'); SampleBank.abilityAudio({ x: 0, y: 0, classKey: withVoice ? 'tanque' : '_none', alive: true }, { element: 'fire', name: 'x' }, i === 10); } if (i === 7) playSfx('bossRoar'); await sleep(90); } };
    window.inView = () => true; const mm = await meas(0.01); const p = burst(false); out.combate = await meas(1.6); await p;
    SampleBank.ensureBank('m'); await sleep(1500); await sleep(2800); // el banco decodifica y se vacía el límite de voces
    const v = (async () => { SampleBank.voice({ classKey: 'tanque', x: 0, y: 0 }, 'ult'); })(); out.voz = await meas(1.5); await v;
    out.mem = SampleBank.status();
    return out;
  });
  R.info.mezcla = live; console.log('INFO mezcla en vivo', JSON.stringify(live));
  note('CRÍTICO', 'con el lo-fi el pico final queda <= -1 dBFS (nada satura)', live.combate.peak <= -1 && live.voz.peak <= -1, [live.combate.peak, live.voz.peak]);
  note('CRÍTICO', 'el lo-fi suena (el sintético le cede el lugar) y no está mudo', live.holds && live.musica.rms > -40, live.musica);
  note('IMPORTANTE', 'la música sola queda entre -32 y -14 dBFS de RMS (se oye en un parlante de celular sin tapar)', live.musica.rms >= -32 && live.musica.rms <= -14, live.musica);
  note('IMPORTANTE', 'los golpes de combate superan a la música (>= +3 dB de RMS)', live.combate.rms - live.musica.rms >= 3, [live.combate.rms, live.musica.rms]);
  note('IMPORTANTE', 'memoria de audio decodificada <= 110 MB', live.mem.decodedMB <= 110, live.mem.decodedMB);
  note('CRÍTICO', 'sin errores de página durante la auditoría', errs.length === 0, errs.slice(0, 3));
  await browser.close(); if (server) server.kill();
  console.log('\nCRÍTICOS: ' + crit + ' · IMPORTANTES: ' + R.importante.length + ' · OPCIONALES: ' + R.opcional.length);
  if (jsonOut) fs.writeFileSync(path.join(ROOT, jsonOut), JSON.stringify({ fecha: new Date().toISOString().slice(0, 10), ...R }, null, 1));
  process.exit(crit ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
