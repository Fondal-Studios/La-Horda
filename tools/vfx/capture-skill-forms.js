'use strict';
/* Capturas de las habilidades normales con forma propia (js/champions/ult-forms/bind.js, UF_SK): para cada campeón y casilla lanza la habilidad con
   reloj virtual (16 ms por cuadro), cámara fija y sin sacudida, y guarda una tira de 5 cuadros (80, 250, 500, 800 y 1200 ms) recortada alrededor del héroe.
   Con ?uf=0 en BASE_URL se capturan las habilidades de antes. Uso: BASE_URL=http://127.0.0.1:9301/[?uf=0] ONLY=mago,musashi OUT=docs/vfx/ultis-distintas/habilidades-despues node tools/vfx/capture-skill-forms.js */
const fs = require('node:fs'), path = require('node:path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), BASE = process.env.BASE_URL || 'http://127.0.0.1:9301/';
const WHO = {mago: [0, 1, 2], musashi: [0, 1, 2], cazadora: [1]};
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 844, height: 390}}), errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => typeof startRun === 'function' && assetsAllReady(), null, {timeout: 120000});
  await page.waitForTimeout(1500);
  const only = process.env.ONLY ? process.env.ONLY.split(',') : Object.keys(WHO), out = process.env.OUT && path.resolve(ROOT, process.env.OUT);
  if (out) fs.mkdirSync(out, {recursive: true});
  for (const k of only) for (const slot of WHO[k] || []) {
    const r = await page.evaluate(([k, slot]) => {
      netMatch = null; save.stash = []; for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; }
      selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte'].filter(x => x !== k); startRun(3); document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
      for (const [dx, dy] of [[100, 0], [118, -16], [118, 16], [140, 0]]) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 1e7, maxHp: 1e7, speed: 0, baseSpeed: 0, dmg: 0}); }
      for (const a of allies) { a.x = player.x - 40; a.y = player.y + 14; a.stunTimer = 1e9; }
      player.energy = 1e4; player.cds = [0, 0, 0]; player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
      const sk0 = window.vfxShake, ft0 = window.floatText; window.vfxShake = function () {}; window.floatText = function () {};
      let vt = 1000; const pn = performance.now, rnd = Math.random; performance.now = () => vt; let sd = 777; Math.random = () => { sd ^= sd << 13; sd >>>= 0; sd ^= sd >> 17; sd ^= sd << 5; sd >>>= 0; return sd / 4294967296; };
      const cam0 = CAM_SUBJECT; CAM_SUBJECT = {x: player.x, y: player.y};
      const step = () => { vt += 16; try { CAM_LEAD_X = 0; CAM_LEAD_Y = 0; } catch (e) {} update(16); render(); };
      for (let i = 0; i < 20; i++) step();
      const cv = document.getElementById('game'), sc = cv.width / 844, W = 360, H = 260, X = 422 - 110, Y = 195 - 140;
      const sheet = document.createElement('canvas'); sheet.width = W * 5 / 2; sheet.height = H / 2; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false;
      const t0 = vt; castAbility(player, player.cls.skills[slot], false, slot);
      [80, 250, 500, 800, 1200].forEach((t, i) => { while (vt - t0 < t) step(); const im = ctx.getImageData(Math.round(X * sc), Math.round(Y * sc), Math.round(W * sc), Math.round(H * sc)), c2 = document.createElement('canvas'); c2.width = im.width; c2.height = im.height; c2.getContext('2d').putImageData(im, 0, 0); sg.drawImage(c2, i * W / 2, 0, W / 2, H / 2); });
      performance.now = pn; Math.random = rnd; window.vfxShake = sk0; window.floatText = ft0; CAM_SUBJECT = cam0; state = 'menu';
      return {name: player.cls.skills[slot].name, png: sheet.toDataURL('image/png')};
    }, [k, slot]);
    console.log(k, slot, r.name);
    if (out) fs.writeFileSync(path.join(out, `${k}-${slot}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
  }
  if (errs.length) console.log('errores de pagina:', errs.slice(0, 3));
  await browser.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
