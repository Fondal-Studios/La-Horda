'use strict';
// Reproducible motor capture: identical frozen scene, only nova/cone layer differs.
// BASE_URL points at a local checkout; no real account or cloud writes.
const fs = require('node:fs'), path = require('node:path');
const {chromium} = require('playwright');
const OUT = path.resolve(__dirname, '../../docs/production/quality-five/vfx-20261019');
(async () => {
  fs.mkdirSync(OUT, {recursive: true});
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || chromium.executablePath(), args: ['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport: {width: 844, height: 390}}), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
    await page.goto(process.env.BASE_URL || 'http://127.0.0.1:8961/');
    await page.waitForFunction(() => typeof sfaPush === 'function' && assetsAllReady());
    await page.waitForTimeout(2000);
    const shots = await page.evaluate(() => {
      Math.random = () => .37; performance.now = () => 100000;
      netMatch = null; currentArena = 'bosque'; selectedClass = 'tanque'; lobbyAllies = []; startRun(3);
      state = 'playing'; enemies = []; spawnTimer = arenaHazardTimer = 1e9;
      for (const a of allies) a.stunTimer = 1e9;
      for (const [dx, dy] of [[70, -50], [114, 25], [26, 25]]) {
        const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 1e9, maxHp: 1e9, speed: 0, baseSpeed: 0, dmg: 0});
      }
      const out = [];
      for (const art of ['nova', 'cone']) for (const layer of ['top', 'ground']) {
        vfxResetRun(); sfaReset(); SFA_LAYER[art] = layer;
        sfaPush(art, 'time', player.x + 70, player.y, 120, 0, 900, 0, 0, 24, -1, .85);
        if (!sfaPool.length) throw Error('No effect captured');
        sfaPool[0].t = 320; sfaLastT = 100000; render();
        out.push({label: art + ' · ' + (layer === 'top' ? 'ANTES: sobre actores' : 'AHORA: suelo'), url: canvas.toDataURL()});
      }
      return out;
    });
    await page.setViewportSize({width: 1688, height: 860});
    await page.setContent('<body style="margin:0;background:#10131f;color:#eee;font:20px sans-serif"><main style="display:grid;grid-template-columns:1fr 1fr"></main></body>');
    await page.evaluate(shots => {
      for (const s of shots) {
        const box = document.createElement('section'), title = document.createElement('div'), img = document.createElement('img');
        title.textContent = s.label; title.style.cssText = 'height:36px;padding-left:16px';
        img.src = s.url; img.style.cssText = 'width:844px;height:390px;image-rendering:pixelated';
        box.append(title, img); document.querySelector('main').append(box);
      }
    }, shots);
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));
    await page.screenshot({path: path.join(OUT, 'area-before-after.png')});
    if (errors.length) throw Error(errors.join('\n'));
    console.log('Captured four frozen motor views; page errors: 0');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
