'use strict';
/* Comparación reproducible del kit de Brakk; derivada del arnés de PR195, con el renderer real.
 * OUT=carpeta ONLY=brakk MOBILE=1 node tools/vfx/capture-brakk-kit.js
 * Seed/reloj antes de crear la partida; mismos enemigos, cámara y equipo.
 * No aprueba arte ni simula una conexión de red. Guarda trazas de los casts.
 */
const fs = require('node:fs'), path = require('node:path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), BASE = process.env.BASE_URL || 'http://127.0.0.1:9301/';
const WHO = {brakk:[1]};
(async () => {
  const H = require('../lib/serve'); const site = await H.startSite();
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const viewport = process.env.MOBILE ? {width:390,height:844} : {width:844,height:390};
  const page = await browser.newPage({viewport}), errs = [], results = [];
  await page.addInitScript(()=>{let seed=123456; Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}; Date.now=()=>1792684800000;});
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(site.url + '/' + (process.env.QUERY || ''), {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => typeof startRun === 'function' && assetsAllReady(), null, {timeout: 120000});
  await page.waitForTimeout(1500);
  await page.evaluate(()=>{loop=()=>{};cromaEnsureLoaded('brakk_alt1');cromaEnsureLoaded('brakk_croma');});
  await page.waitForFunction(()=>CHAMP_PACK.croma_brakk_alt1?.ready && CHAMP_PACK.skin_quality_brakk?.ready);
  const only = process.env.ONLY ? process.env.ONLY.split(',') : Object.keys(WHO), out = process.env.OUT && path.resolve(ROOT, process.env.OUT);
  if (out) fs.mkdirSync(out, {recursive: true});
  for (const arena of ['bosque','hielo','infernal','laberinto','acuatica','minas']) for (const look of ['base','gear','alt1','croma','set']) for (const k of only) for (const slot of WHO[k] || []) {
    const times=(process.env.TIMES||'80,330,610').split(',').map(Number);
    const r = await page.evaluate(([k, slot, viewport, times, lance, off, arena, look]) => {
      let vt = 1000; const pn = performance.now, rnd = Math.random; performance.now = () => vt; let sd = 777; Math.random = () => { sd ^= sd << 13; sd >>>= 0; sd ^= sd >> 17; sd ^= sd << 5; sd >>>= 0; return sd / 4294967296; };
      KVB.seed = 0x2545F491; window.SFA_OFF=!!off;
      netMatch = null; save.stash = []; for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.croma=null; s.cosmeticSkin=''; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; }
      if(lance){save.champions.brakk.level=60;save.champions.brakk.talents.nodes.brakk_t0transform=1;save.champions.brakk.talents.nodes.brakk_t2transform=1;}
      if(look!=='base'){
        const ids=look==='set'?setPieceIds('quality_brakk'):[];
        if(ids.length)for(const id of ids){const it=makeDesignedItem(id);stashItems().push(it);equipItem(k,it.uid);}
        else for(const type of ['arma','casco','pechera','botas']){const it=makeItem(type,'legendario');stashItems().push(it);equipItem(k,it.uid);}
      }
      if(look==='set')delete save.champions[k].cosmeticSkin;
      if(look==='alt1')save.champions[k].croma='brakk_alt1';
      if(look==='croma')save.champions[k].croma='brakk_croma';
      invalidatePassiveCache();
      selectedClass = k; currentArena = arena; lobbyAllies = ['tanque', 'soporte'].filter(x => x !== k); startRun(1); document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
      for (const [dx, dy] of [[72,0],[90,-16],[90,16],[115,0],[130,-20],[130,20]]) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 1e7, maxHp: 1e7, speed: 0, baseSpeed: 0, dmg: 0}); }
      for (const a of allies) { a.x = player.x - 40; a.y = player.y + 14; a.stunTimer = 1e9; }
      player.energy = 1e4; player.cds = [0, 0, 0]; player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
      if(slot===2){brakkBuild(player,'brk_wall',{x:player.x+75,y:player.y+30},4500,{r:65,dx:0,dy:1});const w=brakkOwned(player)[0];w.hp=w.maxHp*.4;}
      const sk0 = window.vfxShake, ft0 = window.floatText; window.vfxShake = function () {}; window.floatText = function () {};

      const cam0 = CAM_SUBJECT; CAM_SUBJECT = {x: player.x, y: player.y};
      const step = () => { vt += 16; try { CAM_LEAD_X = 0; CAM_LEAD_Y = 0; } catch (e) {} update(16); render(); };
      for (let i = 0; i < 20; i++) step();
      const cv = document.getElementById('game'), sc = cv.width / viewport.width, W = 300, H = 240, X = viewport.width / 2 - 110, Y = viewport.height / 2 - 140;
      const sheet = document.createElement('canvas'); sheet.width = W * times.length; sheet.height = H; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false;
      _arenaTitleUntil=0; document.getElementById('center-banner').classList.remove('show'); render(); const scene = cv.toDataURL(), full=[]; const draws={deploy:0,body:0}, di=CanvasRenderingContext2D.prototype.drawImage, body=CHAMP_PACK[setSkinPackKey(player,k)].atlas; CanvasRenderingContext2D.prototype.drawImage=function(im,...a){if(im===body)draws.body++;for(const [key,b]of sfaCache)if(key.startsWith('burst|brakk_deploy')&&im===b.cv){draws.deploy++;break;}return di.call(this,im,...a);}; const resolved={skin:activeSetSkinId(player),pack:setSkinPackKey(player,k),equipment:Object.values(save.champions[k].equipment).filter(Boolean).length,set:heroMainSet(player),setPieces:setN(player,'quality_brakk')};
      const sk = slot === 3 ? player.cls.ultimate : player.cls.skills[slot]; const t0 = vt; if(slot===3)runLevel = Math.max(runLevel, ULT_MIN_ARENA_LEVEL); player.aim={x:player.x+105,y:player.y,dx:1,dy:0}; player.ultCharge=player.ultMax; player.ultCd=0; const trace = [], oldFx=window.vfxSfaPlay; window.vfxSfaPlay=function(...a){trace.push(a.slice(0,11));return oldFx.apply(this,a);}; castAbility(player, sk, slot===3, slot);
      times.forEach((t, i) => { while (vt - t0 < t) step(); const im = ctx.getImageData(Math.round(X * sc), Math.round(Y * sc), Math.round(W * sc), Math.round(H * sc)), c2 = document.createElement('canvas'); c2.width = im.width; c2.height = im.height; c2.getContext('2d').putImageData(im, 0, 0); sg.drawImage(c2, i*W, 0, W, H); if(t===330)full.push({t,png:cv.toDataURL()}); });
      CanvasRenderingContext2D.prototype.drawImage=di; window.vfxSfaPlay=oldFx; performance.now = pn; Math.random = rnd; window.vfxShake = sk0; window.floatText = ft0; CAM_SUBJECT = cam0; state = 'menu';
      return {arena,look,resolved,draws,full,lance,scene,champion:k, slot, action:sk.action, trace, objects:portadorObjects.map(o=>({kind:o.kind,x:o.x-player.x,y:o.y-player.y,life:o.life})), viewport, times, name: (slot===3?player.cls.ultimate:player.cls.skills[slot]).name, png: sheet.toDataURL('image/png')};
    }, [k, slot, viewport, times, !!process.env.LANCE,!!process.env.SFA_OFF,arena,look]);
    console.log(arena,look,k, slot, r.name, JSON.stringify(r.trace.map(a=>a.slice(0,2)))); results.push({...r,png:undefined,scene:undefined,full:undefined,sceneHash:require('node:crypto').createHash('sha256').update(r.scene).digest('hex')});
    if(out){fs.writeFileSync(path.join(out, `${arena}-${look}.png`),Buffer.from(r.png.split(',')[1],'base64'));for(const f of r.full)fs.writeFileSync(path.join(out,`${arena}-${look}-${f.t}-native.png`),Buffer.from(f.png.split(',')[1],'base64'));}
  }
  if(out) fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify({results,errors:errs},null,2)+'\n');
  if (errs.length) console.log('errores de pagina:', errs.slice(0, 3));
  if(errs.length||results.some(r=>!r.draws.deploy||!r.draws.body||r.trace.every(a=>String(a[1]).split('~')[0]!=='brakk_deploy')||(r.look!=='base'&&r.resolved.equipment!==4)||(r.look==='alt1'&&r.resolved.pack!=='croma_brakk_alt1')||(r.look==='set'&&r.resolved.pack!=='skin_quality_brakk')||(r.look==='croma'&&r.resolved.skin!=='brakk_croma')))process.exitCode=1;
  await browser.close(); await site.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
