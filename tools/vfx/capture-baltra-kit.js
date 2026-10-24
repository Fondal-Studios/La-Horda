'use strict';
/* Comparación reproducible del kit de Baltra; derivada del arnés de PR195, con el renderer real.
 * OUT=carpeta ONLY=baltra MOBILE=1 node tools/vfx/capture-baltra-kit.js
 * Seed/reloj antes de crear la partida; mismos enemigos, cámara y equipo.
 * No aprueba arte ni simula una conexión de red. Guarda trazas de los casts.
 */
const fs = require('node:fs'), path = require('node:path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), BASE = process.env.BASE_URL || 'http://127.0.0.1:9301/';
const WHO = Object.fromEntries(['baltra'].map(k=>[k,[0,1,2,3]]));
(async () => {
  const H = require('../lib/serve'); const site = await H.startSite();
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const viewport = process.env.MOBILE ? {width:390,height:844} : {width:844,height:390};
  const page = await browser.newPage({viewport}), errs = [], results = [];
  await page.addInitScript(()=>{let seed=123456; Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}; Date.now=()=>1792684800000;});
  page.on('pageerror', e => errs.push(e.message));
  if(process.env.BASELINE) await page.route('**/js/champions/skill-fx-a/**',async route=>{const rel=new URL(route.request().url()).pathname.slice(1);if(['js/champions/skill-fx-a/c/baltra.js','js/champions/skill-fx-a/engine.js','js/champions/skill-fx-a/bind.js'].includes(rel)){const body=require('node:child_process').execFileSync('git',['show','758aa2ff:'+rel],{cwd:ROOT});await route.fulfill({contentType:'application/javascript',body});}else await route.continue();});
  await page.goto(site.url + '/' + (process.env.QUERY || ''), {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => typeof startRun === 'function' && assetsAllReady(), null, {timeout: 120000});
  await page.waitForTimeout(1500);
  const only = process.env.ONLY ? process.env.ONLY.split(',') : Object.keys(WHO), out = process.env.OUT && path.resolve(ROOT, process.env.OUT);
  if (out) fs.mkdirSync(out, {recursive: true});
  for (const k of only) for (const slot of WHO[k] || []) {
    const times=(process.env.TIMES||'80,250,500,1100,2000').split(',').map(Number);
    const r = await page.evaluate(([k, slot, viewport, times, lance, off]) => {
      let vt = 1000; const pn = performance.now, rnd = Math.random; performance.now = () => vt; let sd = 777; Math.random = () => { sd ^= sd << 13; sd >>>= 0; sd ^= sd >> 17; sd ^= sd << 5; sd >>>= 0; return sd / 4294967296; };
      KVB.seed = 0x2545F491; window.SFA_OFF=!!off;
      netMatch = null; save.stash = []; for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; }
      selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte'].filter(x => x !== k); startRun(3); document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
      for (const [dx, dy] of [[100, 0], [118, -16], [118, 16], [140, 0]]) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 1e7, maxHp: 1e7, speed: 0, baseSpeed: 0, dmg: 0}); }
      for (const a of allies) { a.x = player.x - 40; a.y = player.y + 14; a.stunTimer = 1e9; }
      player.energy = 1e4; player.cds = [0, 0, 0]; player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
      const sk0 = window.vfxShake, ft0 = window.floatText; window.vfxShake = function () {}; window.floatText = function () {};

      const cam0 = CAM_SUBJECT; CAM_SUBJECT = {x: player.x, y: player.y};
      const step = () => { vt += 16; try { CAM_LEAD_X = 0; CAM_LEAD_Y = 0; } catch (e) {} update(16); render(); };
      for (let i = 0; i < 20; i++) step();
      const cv = document.getElementById('game'), sc = cv.width / viewport.width, W = 360, H = 260, X = viewport.width / 2 - 110, Y = viewport.height / 2 - 140;
      const sheet = document.createElement('canvas'); sheet.width = W * times.length / 2; sheet.height = H / 2; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false;
      const scene = cv.toDataURL(); let native500;
      const sk = slot === 3 ? player.cls.ultimate : player.cls.skills[slot]; const t0 = vt; runLevel = Math.max(runLevel, ULT_MIN_ARENA_LEVEL); player.ultCharge=player.ultMax; player.ultCd=0; const trace = [], oldFx=window.vfxSfaPlay; window.vfxSfaPlay=function(...a){trace.push(a.slice(0,11));return oldFx.apply(this,a);}; castAbility(player, sk, slot===3, slot);
      times.forEach((t, i) => { while (vt - t0 < t) step(); if(t===500)native500=cv.toDataURL(); const im = ctx.getImageData(Math.round(X * sc), Math.round(Y * sc), Math.round(W * sc), Math.round(H * sc)), c2 = document.createElement('canvas'); c2.width = im.width; c2.height = im.height; c2.getContext('2d').putImageData(im, 0, 0); sg.drawImage(c2, i * W / 2, 0, W / 2, H / 2); });
      window.vfxSfaPlay=oldFx; performance.now = pn; Math.random = rnd; window.vfxShake = sk0; window.floatText = ft0; CAM_SUBJECT = cam0; state = 'menu';
      return {native500,lance,scene,champion:k, slot, action:sk.action, trace, objects:portadorObjects.map(o=>o.kind), viewport, times, name: (slot===3?player.cls.ultimate:player.cls.skills[slot]).name, png: sheet.toDataURL('image/png')};
    }, [k, slot, viewport, times, !!process.env.LANCE,!!process.env.SFA_OFF]);
    console.log(k, slot, r.name, JSON.stringify(r.trace.map(a=>a.slice(0,2)))); results.push({...r,native500:undefined,png:undefined,scene:undefined,sceneHash:require('node:crypto').createHash('sha256').update(r.scene).digest('hex')});
    if(out&&r.native500)fs.writeFileSync(path.join(out,`${k}-${slot}-native500.png`),Buffer.from(r.native500.split(',')[1],'base64'));
    if (out) fs.writeFileSync(path.join(out, `${k}-${slot}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
  }
  if(out) fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify({results,errors:errs},null,2)+'\n');
  if (errs.length) console.log('errores de pagina:', errs.slice(0, 3));
  if(errs.length) process.exitCode=1;
  await browser.close(); await site.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
