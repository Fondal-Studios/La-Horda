'use strict';
/* Composición B118/B119 06; mismos emisores, eventos y mecánicas. A/B/A: candidato/parent/candidato en mismo cuadro. ARENAS/LOOKS/SLOTS/DENSITIES/TIMES seleccionan matriz.
 * OMIT_SIGNATURE=1 desvía únicamente el dibujo de firmas a un canvas diagnóstico, ejecutando su función original.
 * Comparación reproducible del kit de Brakk; derivada del arnés de PR195, con el renderer real.
 * OUT=carpeta ONLY=brakk MOBILE=1 node tools/vfx/capture-brakk-components.js
 * Seed/reloj antes de crear la partida; mismos enemigos, cámara y equipo.
 * No aprueba arte ni simula una conexión de red. Guarda trazas de los casts.
 */
const fs = require('node:fs'), path = require('node:path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), BASE = process.env.BASE_URL || 'http://127.0.0.1:9301/';
const parentSource=fs.readFileSync(path.join(ROOT,'art-source/entregas/brakk-kit-20261022/correccion-06/kit-before.js'),'utf8');
const parentDraw=parentSource.slice(parentSource.indexOf('function brakkFxStrip('),parentSource.indexOf('for(const kind of '));
const livePose=!!process.env.LIVE_POSE,canaryRestore=!!process.env.CANARY_RESTORE;
const WHO = {brakk:(process.env.SLOTS||'0,1,2').split(',').map(Number)};
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
  for (const arena of (process.env.ARENAS||'bosque,hielo,infernal,laberinto,acuatica,minas').split(',')) for (const look of (process.env.LOOKS||'base,gear,alt1,croma,set').split(',')) for(const density of (process.env.DENSITIES||'dense,sparse').split(',')) for (const k of only) for (const slot of WHO[k] || []) {
    const times=(process.env.TIMES||'80,330,610,1600').split(',').map(Number);
    const r = await page.evaluate(([k, slot, viewport, times, lance, off, arena, look, density, omitSignature, abSignature, parentDraw, livePose, canaryRestore]) => {
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
      for (const [dx, dy] of (density==='sparse'?[[115,0]]:[[72,0],[90,-16],[90,16],[115,0],[130,-20],[130,20]])) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 1e7, maxHp: 1e7, speed: 0, baseSpeed: 0, dmg: 0}); }
      for (const a of allies) { a.x = player.x - 40; a.y = player.y + 14; a.stunTimer = 1e9; }
      player.energy = 1e4; player.cds = [0, 0, 0]; player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
      if(slot===2){brakkBuild(player,'brk_wall',{x:player.x+75,y:player.y+30},4500,{r:65,dx:0,dy:1});const w=brakkOwned(player)[0];w.hp=w.maxHp*.4;}
      const sk0 = window.vfxShake, ft0 = window.floatText; window.vfxShake = function () {}; window.floatText = function () {};

      const cam0 = CAM_SUBJECT; CAM_SUBJECT = {x: player.x, y: player.y};
      // animPose muta _an al dibujar: el reloj congelado no congela el cuerpo.
      // Cada A/B/A parte del MISMO estado previo al último render real.
      // LIVE_POSE reproduce el defecto anterior; no se modifica el renderer del juego.
      const render0=render;let lastPose;
      const poseSnapshot=()=>[...heroes,...enemies].map(e=>({e,an:e._an?JSON.parse(JSON.stringify(e._an)):null,cast:e._animCastKind}));
      const restorePose=ss=>{for(const s of ss){if(s.an)s.e._an=JSON.parse(JSON.stringify(s.an));else delete s.e._an;if(s.cast===undefined)delete s.e._animCastKind;else s.e._animCastKind=s.cast;}};
      render=function(){lastPose=poseSnapshot();return render0();};
      const step = () => { vt += 16; try { CAM_LEAD_X = 0; CAM_LEAD_Y = 0; } catch (e) {} update(16); render(); };
      for (let i = 0; i < 20; i++) step();
      const cv = document.getElementById('game'), sc = cv.width / viewport.width, W = 300, H = 240, X = viewport.width / 2 - 110, Y = viewport.height / 2 - 140;
      const sheet = document.createElement('canvas'); sheet.width = W * times.length; sheet.height = H; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false;
      _arenaTitleUntil=0; document.getElementById('center-banner').classList.remove('show'); render(); const scene = cv.toDataURL(), full=[], samples=[], ab=[];
      const parentSig=eval('('+parentDraw+')'),origFx=brakkFxStrip,origBrakk=drawBrakkNormalSignature;const signatureDraws=[0,0,0];drawBrakkNormalSignature=function(s){signatureDraws[s.slot]++;return origBrakk(s);};
      const origSig=drawChampionSignatures, discarded=document.createElement('canvas');discarded.width=cv.width;discarded.height=cv.height;
      if(omitSignature)drawChampionSignatures=function(){const real=ctx;ctx=discarded.getContext('2d');ctx.setTransform(real.getTransform());try{return origSig();}finally{ctx=real;}}; const mip=artMipDraw; const draws={kit:{},body:0}, di=CanvasRenderingContext2D.prototype.drawImage, body=CHAMP_PACK[setSkinPackKey(player,k)].atlas; CanvasRenderingContext2D.prototype.drawImage=function(im,...a){for(const [key,b]of sfaCache)if(key.split('|')[1].startsWith('brakk_')&&im===b.cv){const id=key.split('|').slice(0,2).join('|');draws.kit[id]=(draws.kit[id]||0)+1;break;}return di.call(this,im,...a);}; artMipDraw=function(im,...a){if(im===body)draws.body++;return mip(im,...a);}; const resolved={skin:activeSetSkinId(player),pack:setSkinPackKey(player,k),equipment:Object.values(save.champions[k].equipment).filter(Boolean).length,set:heroMainSet(player),setPieces:setN(player,'quality_brakk')};
      const sk = slot === 3 ? player.cls.ultimate : player.cls.skills[slot]; const t0 = vt; if(slot===3)runLevel = Math.max(runLevel, ULT_MIN_ARENA_LEVEL); player.aim={x:player.x+105,y:player.y,dx:1,dy:0}; player.ultCharge=player.ultMax; player.ultCd=0; const trace = [], oldFx=window.vfxSfaPlay; window.vfxSfaPlay=function(...a){trace.push(a.slice(0,11));return oldFx.apply(this,a);}; castAbility(player, sk, slot===3, slot);
      times.forEach((t, i) => { while (vt - t0 < t) step(); const im = ctx.getImageData(Math.round(X * sc), Math.round(Y * sc), Math.round(W * sc), Math.round(H * sc)), c2 = document.createElement('canvas'); c2.width = im.width; c2.height = im.height; c2.getContext('2d').putImageData(im, 0, 0); sg.drawImage(c2, i*W, 0, W, H); if(abSignature&&(t===330||t===1600)){const before=cv.toDataURL(),replayPose=lastPose,originalPostPose=poseSnapshot(),state0=JSON.stringify({pool:sfaPool,signatures:championSignatures,objects:portadorObjects.map(o=>[o.kind,o.x,o.y,o.life,o.hp])});brakkFxStrip=parentSig;sfaCache.clear();if(!livePose)restorePose(replayPose);render();const without=cv.toDataURL();brakkFxStrip=origFx;sfaCache.clear();if(!livePose)restorePose(replayPose);render();if(canaryRestore){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#ff00ff";ctx.fillRect(0,0,1,1);ctx.restore();}const restored=cv.toDataURL(),state1=JSON.stringify({pool:sfaPool,signatures:championSignatures,objects:portadorObjects.map(o=>[o.kind,o.x,o.y,o.life,o.hp])});if(!livePose)restorePose(originalPostPose);ab.push({t,before,without,restored,identicalRestoration:before===restored,stateUnchanged:state0===state1});}if(t===330||t===1600)full.push({t,png:cv.toDataURL()});samples.push({t,elapsed:vt-t0,objects:portadorObjects.map(o=>({kind:o.kind,x:o.x-player.x,y:o.y-player.y,life:o.life,hp:o.hp})),pool:sfaPool.map(s=>({art:s.art,theme:s.theme,t:s.t,dur:s.dur,fi:s.fi})),signatures:championSignatures.filter(s=>s.on).map(s=>({...s,shape:s.key==='brakk'&&!s.ult?['masonry','nail-turret','cross-brace'][s.slot]:(CHAMPION_SIGNATURES[s.key]||['star'])[0]}))}); });
      render=render0;brakkFxStrip=origFx;drawChampionSignatures=origSig;drawBrakkNormalSignature=origBrakk;artMipDraw=mip; CanvasRenderingContext2D.prototype.drawImage=di; window.vfxSfaPlay=oldFx; performance.now = pn; Math.random = rnd; window.vfxShake = sk0; window.floatText = ft0; CAM_SUBJECT = cam0; state = 'menu';
      return {livePose,canaryRestore,arena,look,density,omitSignature,signatureDraws,comparison:'candidate kit composition / preserved kit05 / restored candidate',resolved,draws,full,samples,ab,lance,scene,champion:k, slot, action:sk.action, trace, objects:portadorObjects.map(o=>({kind:o.kind,x:o.x-player.x,y:o.y-player.y,life:o.life})), viewport, times, name: (slot===3?player.cls.ultimate:player.cls.skills[slot]).name, png: sheet.toDataURL('image/png')};
    }, [k, slot, viewport, times, !!process.env.LANCE,!!process.env.SFA_OFF,arena,look,density,!!process.env.OMIT_SIGNATURE,true,parentDraw,livePose,canaryRestore]);
    console.log(arena,look,density,k, slot, r.name, JSON.stringify(r.trace.map(a=>a.slice(0,2)))); results.push({...r,png:undefined,scene:undefined,full:undefined,ab:r.ab.map(a=>({t:a.t,identicalRestoration:a.identicalRestoration,stateUnchanged:a.stateUnchanged,beforeHash:require('node:crypto').createHash('sha256').update(a.before).digest('hex'),withoutHash:require('node:crypto').createHash('sha256').update(a.without).digest('hex')})),sceneHash:require('node:crypto').createHash('sha256').update(r.scene).digest('hex')});
    if(out){for(const a of r.ab)for(const key of ['before','without','restored'])fs.writeFileSync(path.join(out,`${arena}-${look}-${density}-h${slot+1}-${a.t}-ab-${key}.png`),Buffer.from(a[key].split(',')[1],'base64'));fs.writeFileSync(path.join(out, `${arena}-${look}-${density}-h${slot+1}.png`),Buffer.from(r.png.split(',')[1],'base64'));for(const f of r.full)fs.writeFileSync(path.join(out,`${arena}-${look}-${density}-h${slot+1}-${f.t}-native.png`),Buffer.from(f.png.split(',')[1],'base64'));}
  }
  if(out) fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify({results,errors:errs},null,2)+'\n');
  if (errs.length) console.log('errores de pagina:', errs.slice(0, 3));
  if(results.some(r=>!r.signatureDraws[r.slot]||r.ab.some(a=>!a.identicalRestoration||!a.stateUnchanged)))process.exitCode=1;
  if(errs.length||results.some(r=>!Object.values(r.draws.kit).some(n=>n>0)||!r.draws.body||r.trace.every(a=>String(a[1]).split('~')[0]!==['brakk_build','brakk_deploy','brakk_repair'][r.slot])||(r.slot===2&&(!r.draws.kit['aura|brakk_repair~p']||!r.draws.kit['burst|brakk_repair~p']))||(r.look!=='base'&&r.resolved.equipment!==4)||(r.look==='alt1'&&r.resolved.pack!=='croma_brakk_alt1')||(r.look==='set'&&r.resolved.pack!=='skin_quality_brakk')||(r.look==='croma'&&r.resolved.skin!=='brakk_croma')))process.exitCode=1;
  await browser.close(); await site.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
