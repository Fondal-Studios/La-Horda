'use strict';
// Captura lo que el juego dibuja de un guardián (drawChampFigure = mismo camino que en partida):
// 3 cuadros de idle, 3 de caminar, 3 de ataque, la caída y el retrato del Códice, ampliados x3.
//   node tools/art/capture-guardian-frames.js <classKey> <salida.png> [skinId|""] [pack]
// pack opcional (p. ej. ilkan_colossus) para dibujar un atlas alterno.
const fs = require('fs'), H = require('../lib/serve');
const [key, out, skin = '', pack = ''] = process.argv.slice(2);
(async () => {
  const site = await H.startSite({ envUrl: ['SE_BASE_URL'] }), browser = await H.launch();
  const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await H.goto(p, site.url + '/?lazy=0&dev=1');
  await p.waitForFunction(() => typeof drawChampFigure === 'function' && assetsAllReady(), null, { timeout: 90000 });
  await p.waitForTimeout(800);
  const url = await p.evaluate(async ({ key, skin, pack }) => {
    if (skin) { save.champions[key] = save.champions[key] || {}; save.champions[key].cosmeticSkin = skin; save.cosmeticUnlocks = Object.assign({}, save.cosmeticUnlocks, { [skin]: true }); }
    const S = 2, cols = 3, rows = 4, cw = 280, ch = 320;
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#4a4a5e'; c.fillRect(0, 0, cv.width, cv.height);
    const one = (st, i) => {
      const t = document.createElement('canvas'); t.width = cw / S; t.height = ch / S; const tc = t.getContext('2d'); tc.imageSmoothingEnabled = false;
      const ex = pack ? { _codexPack: pack } : {};
      const o = Object.assign({ _codexSkin: skin ? skin : '' }, ex);
      let fx = 1, animT = 0, moving = false;
      if (st === 'idle') { animNow = i * 260 + 10; }
      if (st === 'walk') { moving = true; animT = i * 130 + 5; }
      if (st === 'attack') { o.attackAnim = 400 * (1 - [0.05, 0.4, 0.75][i]); o._aDur = 400; o._aPrev = o.attackAnim; }
      drawChampFigure(tc, key, t.width / 2, t.height * 0.86, 2.0, fx, animT, moving, o);
      return t;
    };
    const sts = ['idle', 'walk', 'attack'];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) c.drawImage(one(sts[r], i), i * cw, r * ch, cw, ch);
    // caída
    const d = document.createElement('canvas'); d.width = cw / S; d.height = ch / S; const dc = d.getContext('2d'); dc.imageSmoothingEnabled = false;
    const saved = ctx; ctx = dc;
    try {
      for (let i = 0; i < 3; i++) {
        dc.clearRect(0, 0, d.width, d.height);
        const h = { x: d.width / 2, y: d.height * 0.86, fx: 1, fy: 0, classKey: key, cls: CLASSES[key], scale: 2.0, radius: 24, _pdir: 'down', _deadAt: animNow - [60, 250, 800][i], _codexSkin: skin || '' };
        if (typeof drawChampPackDeath === 'function') drawChampPackDeath(h);
        c.drawImage(d, i * cw, 3 * ch, cw, ch);
      }
    } finally { ctx = saved; }
    return cv.toDataURL();
  }, { key, skin, pack });
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log('ok', out, errs.join('|'));
  await browser.close(); await site.close();
})().catch(e => { console.error(e); process.exit(1); });
