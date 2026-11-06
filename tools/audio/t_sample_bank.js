// AUDITORÍA DE LA CAPA DE MUESTRAS (js/audio/sample-bank.js) en un AudioContext REAL (Chromium sin cabeza).
//   node tools/audio/t_sample_bank.js        (levanta su propio servidor en 127.0.0.1:8797)
// Comprueba: manifiesto y archivos (existen, licencia CC0, tamaños), decodificación real de TODOS los archivos,
// música por modo (título/menú/oleada por arena/jefe/victoria), el sintético calla mientras suena el lo-fi y vuelve
// si se elige "Original", cada familia de habilidad suena, cada campeón tiene voz, topes de voces y de nodos, y que
// no hay errores de consola. Sale con código 1 si algo falla.
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path'), fs = require('fs'), http = require('http'), { spawn } = require('child_process');
const PORT = 8797, ROOT = path.join(__dirname, '../..'), BASE = process.env.SE_BASE_URL || `http://127.0.0.1:${PORT}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 400) : '')); if (!ok) fails++; };
const up = () => new Promise(res => { const rq = http.get(BASE + '/index.html', r => { r.resume(); res(r.statusCode === 200); }); rq.on('error', () => res(false)); rq.setTimeout(800, () => { rq.destroy(); res(false); }); });

(async () => {
  // ---- 1) estático: manifiesto, archivos, licencias, peso ----
  const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/audio/manifest.json'), 'utf8'));
  const files = [];
  for (const m of Object.values(man.music)) files.push(m);
  for (const s of Object.values(man.sfx)) for (const f of s.files) files.push({ ...f, license: s.license });
  for (const v of Object.values(man.voice)) files.push(v);
  check('todos los archivos del manifiesto existen', files.every(f => fs.existsSync(path.join(ROOT, 'assets/audio', f.file))), files.length);
  check('todos son CC0', files.every(f => f.license === 'CC0'));
  check('todos tienen fuente (URL)', files.every(f => /^https:\/\/opengameart\.org\/content\//.test(f.source)));
  const bytes = d => fs.readdirSync(path.join(ROOT, 'assets/audio', d)).reduce((a, f) => a + fs.statSync(path.join(ROOT, 'assets/audio', d, f)).size, 0);
  console.log('INFO peso  música ' + (bytes('music') / 1e6).toFixed(2) + ' MB, efectos ' + (bytes('sfx') / 1e6).toFixed(2) + ' MB, voces ' + (bytes('voice') / 1e6).toFixed(2) + ' MB');
  check('efectos+voces precargados < 2 MB', bytes('sfx') + bytes('voice') < 2e6);
  check('ningún efecto dura más de 2,5 s', files.filter(f => /^sfx/.test(f.file)).every(f => f.seconds <= 2.5));
  check('créditos presentes', fs.existsSync(path.join(ROOT, 'assets/audio/CREDITS.md')));

  let server = null;
  if (!(await up())) { server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); for (let i = 0; i < 40 && !(await up()); i++) await sleep(150); }
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'] });
  const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(BASE + '/index.html?sw=0'); await sleep(1500);
  await page.evaluate(() => { startMusic(); });
  await sleep(500);
  const ev = (f, a) => page.evaluate(f, a);

  // ---- 2) decodificación REAL de todos los archivos ----
  const dec = await ev(async () => {
    const m = await SampleBank.loadManifest(); const bad = []; let n = 0;
    const rel = [...Object.values(m.music).map(x => x.file), ...Object.values(m.sfx).flatMap(s => s.files.map(f => f.file)), ...Object.values(m.voice).map(v => v.file)];
    for (const f of rel) { const b = await SampleBank.load(f); n++; if (!b || !(b.duration > 0.05)) bad.push(f); }
    return { n, bad };
  });
  check('los ' + dec.n + ' archivos decodifican en el navegador', dec.bad.length === 0, dec.bad);

  // ---- 3) música por modo ----
  const wait = async (cond, ms = 6000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await ev(cond)) return true; await sleep(100); } return false; };
  const mode = async (m, arena, level) => { await ev(([m, a, l]) => { if (a) currentArena = a; setMusicMode(m, l); }, [m, arena, level]); };
  await mode('menu'); check('menú → tema "hub" y el sintético calla', await wait(() => SampleBank.status().music === 'hub' && SampleBank.holds()), await ev(() => SampleBank.status()));
  await mode('title'); check('título → tema "title"', await wait(() => SampleBank.status().music === 'title'));
  const seen = new Set();
  for (const [a, l] of [['ciudad', 1], ['hielo', 1], ['fabrica', 4], ['minas', 7], ['abismo', 1]]) {
    await mode('menu'); await sleep(120); await mode('wave', a, l);
    if (await wait(() => /^wave-/.test(SampleBank.status().music || ''), 7000)) seen.add(await ev(() => SampleBank.status().music));
  }
  check('oleadas: suenan temas "wave-*" y rotan (>= 2 distintos)', seen.size >= 2, [...seen]);
  await mode('boss'); check('jefe → tema "boss"', await wait(() => SampleBank.status().music === 'boss'));
  await mode('victory'); check('victoria → vuelve el sintético (holds=false)', await wait(() => !SampleBank.holds() && SampleBank.status().want === null));
  await mode('menu'); await wait(() => SampleBank.holds());
  await ev(() => SampleBank.setStyle('synth')); check('estilo "Original": el lo-fi se apaga y el sintético vuelve', await wait(() => !SampleBank.holds() && SampleBank.status().music === null));
  await ev(() => SampleBank.setStyle('lofi')); check('estilo "Lo-fi": vuelve el tema', await wait(() => SampleBank.holds()));
  check('estilo se recuerda', await ev(() => localStorage.getItem('horda_music_style')) === 'lofi');

  // ---- 4) efectos y habilidades: cuentan fuentes reales ----
  const sfxRes = await ev(async () => {
    const ctx = audioCtx; let started = 0; const o = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function () { started++; return o.apply(this, arguments); };
    const out = { byType: {}, err: [] };
    const dummy = { x: player ? player.x : 0, y: player ? player.y : 0, mat: 'flesh' };
    for (const t of ['hit', 'crit', 'heavy', 'kill', 'eliteKill', 'bigKill', 'bossRoar', 'bossDeath', 'cast', 'ult', 'skillHit', 'hurt', 'hurtHeavy', 'blade', 'punch', 'stomp', 'boom', 'thunder', 'zap', 'freeze', 'shatter', 'splat', 'gib', 'burnDeath', 'hook']) {
      const before = started; try { _sfxVoices = []; performance.now = (p => () => p.call(performance) + 5000)(performance.now); playSfx(t, dummy); } catch (e) { out.err.push(t + ':' + e); }
      out.byType[t] = started - before;
    }
    AudioBufferSourceNode.prototype.start = o; return out;
  });
  const silent = Object.entries(sfxRes.byType).filter(([t, n]) => n === 0).map(([t]) => t);
  check('playSfx sin excepciones', sfxRes.err.length === 0, sfxRes.err);
  console.log('INFO tipos con capa de muestra: ' + (Object.keys(sfxRes.byType).length - silent.length) + '/' + Object.keys(sfxRes.byType).length + (silent.length ? '  sin capa: ' + silent.join(',') : ''));
  const fam = await ev(() => {
    const kinds = [{ element: 'fire' }, { element: 'ice' }, { element: 'lightning' }, { element: 'heal' }, { element: 'holy' }, { element: 'bleed' }, { element: 'physical', kind: 'colossus_slam' }, { kind: 'summon_golem' }, { kind: 'piercing_shot' }, { kind: 'teleport_blink' }, { kind: 'cone_slash' }, { kind: 'team_heal_aoe' }, { kind: 'frost_nova' }, { kind: 'fire_wall' }];
    return kinds.map(k => SampleBank.skillFamily(k));
  });
  check('familias de habilidad: 14 casos clasifican (no todo cae en "magic")', new Set(fam).size >= 7, fam);
  // habilidades REALES de todos los campeones: cada una produce familia y suena sin error
  const real = await ev(async () => {
    const res = { total: 0, fam: {}, err: [], noEl: 0 }; const iv = window.inView; window.inView = () => true; const orig = AudioBufferSourceNode.prototype.start; let n = 0;
    AudioBufferSourceNode.prototype.start = function () { n++; return orig.apply(this, arguments); };
    for (const [key, cls] of Object.entries(CLASSES)) {
      const sks = [...(cls.skills || []), cls.ultimate].filter(Boolean);
      for (const sk of sks) {
        res.total++; const f = SampleBank.skillFamily(sk); res.fam[f] = (res.fam[f] || 0) + 1;
        const before = n; try { SampleBank.abilityAudio({ x: 0, y: 0, classKey: key, alive: true }, sk, sk === cls.ultimate); } catch (e) { res.err.push(key + ':' + e); }
        if (n === before) res.noEl++;
      }
    }
    AudioBufferSourceNode.prototype.start = orig; window.inView = iv; return res;
  });
  console.log('INFO habilidades reales: ' + JSON.stringify(real.fam));
  check('habilidades de CLASSES sin excepciones (' + real.total + ')', real.err.length === 0, real.err);
  check('cada habilidad real produce al menos una muestra (' + real.total + ')', real.noEl === 0, real.noEl);
  check('las familias se reparten (magia por defecto < 45 %)', (real.fam.magic || 0) < real.total * 0.45, real.fam);

  // ---- 5) voces: todos los campeones, topes ----
  const voices = await ev(() => {
    const keys = Object.keys(CLASSES), res = { missing: [], keys: keys.length, profile: {} };
    for (const k of keys) { const p = SampleBank.profile(k), fem = /,\s*la\s/i.test(CLASSES[k].name || ''); res.profile[k] = p.v; if (!p || !(p.p > 0.55 && p.p < 1.3) || (!SampleBank.VOICES[k] && (p.v === 'm') === fem)) res.missing.push(k); } // las entradas explícitas (p. ej. Kael, "la Daga") mandan sobre el título
    return res;
  });
  check('cada campeón tiene voz coherente con su título y tono razonable (' + voices.keys + ')', voices.missing.length === 0, voices.missing);
  await ev(() => ['m', 'f1', 'f2', 'f3'].forEach(b => SampleBank.ensureBank(b))); await sleep(1500);
  await sleep(3000); // que se vacíen las voces de las pruebas anteriores (el reloj de audio es real)
  const vcap = await ev(async () => {
    const orig = AudioBufferSourceNode.prototype.start; let n = 0; AudioBufferSourceNode.prototype.start = function () { n++; return orig.apply(this, arguments); };
    const names = Object.keys(CLASSES).slice(0, 8); let spoke = 0, tries = 0;
    const base = performance.now; let off = 0; performance.now = () => base.call(performance) + off;
    for (let i = 0; i < 10; i++) { off += 3000; for (const k of names) { const b = n; SampleBank.voice({ classKey: k, x: 0, y: 0 }, 'ult'); tries++; spoke += n > b ? 1 : 0; } }
    performance.now = base; AudioBufferSourceNode.prototype.start = orig; return { spoke, tries };
  });
  check('tope: 8 campeones gritando a la vez → hablan como máximo 2 (' + JSON.stringify(vcap) + ')', vcap.spoke >= 1 && vcap.spoke <= 2);

  // ---- 6) sin errores de consola ----
  check('sin errores de consola/página', errs.filter(e => !/favicon|net::ERR|Failed to load resource/.test(e)).length === 0, errs.slice(0, 5));
  await browser.close(); if (server) server.kill();
  console.log(fails ? '\n' + fails + ' FALLAS' : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
