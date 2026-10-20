'use strict';
// Prueba chica: Tiburón Joven y Tiburón Blanco (Arena Acuática) NUNCA pueden quedar sin cuadros dibujados.
// Dibuja cada uno con el código real del juego (spawnEnemy + drawEnemyBody) en un lienzo propio SIN parchar
// drawImage (el parche de tools/art/enemy_coverage.js ya dio un falso "vacío" por tocar `arguments`), en los 11
// estados, y exige píxeles reales, caminata con varios cuadros y estados distintos entre sí (no clones).
// Además arma la partida en la arena, los pone en su rango de aparición real (spawnPoolForAcuatica) y mira que no
// haya errores de consola, en escritorio y en celular apaisado 844x390 (captura en docs/art-gate/tiburones/).
//   node tools/art/check-tiburones.js [--shots]      (levanta su propio servidor estático; PLAYWRIGHT_MODULE opcional)
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.resolve(__dirname, '../..');
const SHOTS = process.argv.includes('--shots');
const OUT = path.join(ROOT, 'docs/art-gate/tiburones');
const MIME = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  let f; try { f = path.resolve(ROOT, '.' + decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0])); } catch { res.writeHead(400).end(); return; }
  if (!f.startsWith(ROOT + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(f, (err, data) => { if (err) { res.writeHead(404).end(); return; } res.setHeader('Content-Type', MIME[path.extname(f)] || 'application/octet-stream'); res.end(data); });
});
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 300) : '')); if (!ok) fails++; };

// en la página: mide un tipo en los 11 estados
function probe(type) {
  const S = 400, cv = document.createElement('canvas'); cv.width = S; cv.height = S;
  const g = cv.getContext('2d', { willReadFrequently: true });
  const e = spawnEnemy(type, false, false);
  enemies = enemies.filter(o => o !== e);
  const reset = () => {
    e.alive = true; e.fx = 1; e.fy = 0; e.animT = 0; e.attackAnim = 0; e._pkAtkLast = 0; e._pkAtkMax = 0; e.hitFlash = 0;
    e.stunTimer = 0; e.frozenTimer = 0; e.packSet = null; e.packTimer = 0; e._rdir = 0; e._pdir = 0; e.hover = 0;
    delete e._dyingP; delete e._diedAt;
  };
  const draw = setup => {
    reset(); setup(e); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S, S);
    const saved = ctx, savedNow = animNow; ctx = g; let err = null;
    try { g.imageSmoothingEnabled = false; g.save(); g.translate(S / 2, S * 0.78); e.x = 0; e.y = 0; animNow = 100000; drawEnemyBody(e); g.restore(); } catch (ex) { err = ex.message; try { g.restore(); } catch (_) {} }
    ctx = saved; animNow = savedNow;
    const d = g.getImageData(0, 0, S, S).data; let px = 0, h = 2166136261;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 40) { px++; h = Math.imul(h ^ (i >> 2) ^ d[i] ^ (d[i + 1] << 8) ^ (d[i + 2] << 16), 16777619); }
    return { px, hash: h >>> 0, err };
  };
  const st = {
    idle: draw(e => { e.stunTimer = 1; }), walk_R: draw(e => { e.animT = 200; }), walk_L: draw(e => { e.animT = 200; e.fx = -1; }),
    walk_D: draw(e => { e.animT = 200; e.fx = 0; e.fy = 1; }), walk_U: draw(e => { e.animT = 200; e.fx = 0; e.fy = -1; }),
    attack: draw(e => { e.attackAnim = 200; e._pkAtkMax = 400; e._pkAtkLast = 200; }),
    attack_D: draw(e => { e.attackAnim = 200; e._pkAtkMax = 400; e._pkAtkLast = 200; e.fx = 0; e.fy = 1; }),
    attack_U: draw(e => { e.attackAnim = 200; e._pkAtkMax = 400; e._pkAtkLast = 200; e.fx = 0; e.fy = -1; }),
    hit: draw(e => { e.hitFlash = 110; }), hit_D: draw(e => { e.hitFlash = 110; e.fx = 0; e.fy = 1; }),
    death: draw(e => { e.alive = false; e._dyingP = 0.9; }),
  };
  const walk = new Set(); for (let t = 0; t < 1500; t += 45) walk.add(draw(x => { x.animT = t; }).hash);
  return { st, walkFrames: walk.size, swapped: bodySwapped(type), swapKey: bodySwapKey(type), radius: e.radius };
}

async function runViewport(browser, name, vp) {
  const ctxB = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const page = await ctxB.newPage(); const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?dev=1`, { waitUntil: 'load', timeout: 180000 });
  for (let i = 0; i < 300; i++) { if (await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; })) break; await sleep(100); }
  for (let i = 0; i < 200; i++) { if (await page.evaluate(() => bodySwapsReady())) break; await sleep(150); }
  await sleep(500);
  await page.evaluate(() => { selectedClass = 'guerrero'; currentArena = 'acuatica'; lobbyAllies = []; startRun(1); });
  await sleep(1200);
  await page.evaluate(() => { for (const h of heroes) h.invulnTimer = 1e9; });

  // rango real de aparición: Joven desde el nivel 1, Blanco desde el 7 (js/enemies/spawning.js)
  const pools = await page.evaluate(() => ({ l1: spawnPoolForAcuatica(1).map(p => p.t), l6: spawnPoolForAcuatica(6).map(p => p.t), l7: spawnPoolForAcuatica(7).map(p => p.t) }));
  check(`${name}: Joven aparece desde el nivel 1`, pools.l1.includes('tiburon_joven'));
  check(`${name}: Blanco no antes del nivel 7 y sí desde el 7`, !pools.l6.includes('tiburon_blanco') && pools.l7.includes('tiburon_blanco'));

  for (const type of ['tiburon_joven', 'tiburon_blanco']) {
    const r = await page.evaluate(probe, type);
    const S = r.st, keys = Object.keys(S);
    check(`${name}: ${type} sin errores de dibujo`, keys.every(k => !S[k].err), keys.filter(k => S[k].err));
    check(`${name}: ${type} sin cuadros vacíos (11 estados con píxeles)`, keys.every(k => S[k].px > 300), keys.map(k => k + ':' + S[k].px).join(' '));
    check(`${name}: ${type} caminata con varios cuadros`, r.walkFrames >= 3, r.walkFrames);
    const h = k => S[k].hash;
    check(`${name}: ${type} ataque, golpe y muerte distintos de caminar e idle`, new Set([h('idle'), h('walk_R'), h('attack'), h('hit'), h('death')]).size === 5);
    check(`${name}: ${type} dibuja con el cuerpo prestado (body-swaps) o arte propio`, !!r.swapKey || !r.swapped, r.swapKey);
  }

  // en partida: los dos juntos cerca del héroe, unos cuadros reales de juego, sin errores
  await page.evaluate(() => {
    enemies.length = 0; const h = heroes[0];
    const a = spawnEnemy('tiburon_joven', false, false), b = spawnEnemy('tiburon_blanco', false, false), c = spawnEnemy('tiburon_joven', false, false);
    a.x = h.x + 90; a.y = h.y - 20; b.x = h.x - 130; b.y = h.y + 10; c.x = h.x + 40; c.y = h.y + 80;
    for (const e of [a, b, c]) { e.hp = e.maxHp = 1e6; }
    window.__tib = [a, b, c];
  });
  await sleep(1500);
  const live = await page.evaluate(() => window.__tib.filter(e => e.alive && enemies.includes(e)).length);
  check(`${name}: tiburones vivos en la arena`, live === 3, live);
  if (SHOTS) { fs.mkdirSync(OUT, { recursive: true }); await page.screenshot({ path: path.join(OUT, `tiburones_${name}.png`) }); }
  check(`${name}: sin errores de consola/página`, errors.length === 0, errors.slice(0, 4));
  await ctxB.close();
}

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    await runViewport(browser, 'escritorio', { width: 1280, height: 720 });
    await runViewport(browser, 'movil-844x390', { width: 844, height: 390 });
  } finally { await browser.close(); server.close(); }
  console.log(fails ? `FALLÓ: ${fails} chequeos` : 'OK: los dos tiburones se dibujan completos');
  process.exit(fails ? 1 : 0);
})();
