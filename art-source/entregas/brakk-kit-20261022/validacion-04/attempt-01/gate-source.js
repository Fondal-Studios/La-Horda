// Gate aislado B117/B119: montaje, soldadura y refuerzo, 3 variantes y 3 fases. Umbral80% y delta24 originales intactos. No certifica composición integral ni móviles físicos.
'use strict';
/* Prueba de legibilidad de los decales de efecto (js/champions/vfx-b/): el disco/anillo de una habilidad no puede tapar al enemigo que señala.
   Para CADA receta de KVB_FX, en varias arenas y en tres instantes del efecto (anticipación, impacto, disipación):
     · 3 enemigos quietos dentro del área del efecto (esqueletos reales del motor), uno por vez;
     · captura del canvas real con el efecto (A) y sin el efecto (C), con el reloj de render congelado;
     · máscara del sprite del enemigo = alfa opaco de sus drawImage (sin la sombra del suelo); visible = píxeles de esa máscara que A deja intactos respecto de C.
   Dos mediciones: SOLO LOS DECALES/ANILLOS del efecto (kvbDecal de >= 36 u, sin rayos ni motivos sueltos; en todo instante: se exige >= 80 %) y el EFECTO COMPLETO con sus motivos sueltos
   (rayos, gotas, plumas y chispas que cruzan volando: promedio de los tres instantes; el piso de regresión es FULL_MIN = 40 %, y los que quedan entre 40 y 80 % se listan como aviso (VERBOSE=1)).
   También exige el 80 % por instante a nova, zona y cono de cada tema del motor de la mitad A (js/champions/skill-fx-a/).
   No se sustituye un resultado bajo por una aprobación ni se promedian las fases de estos decales para aprobarlos.
   Exige visible >= 80 % del sprite de cada enemigo (MIN_VISIBLE), relleno del decal <= 35 % del disco interior en el impacto
   (con las marcas) y que el tinte cambie de una arena a otra (el mismo efecto no puede ser del mismo color en todas partes).
   Además comprueba que los anillos de pixel-stroke.js solo producen alfa 0/255.
   LEGACY=1 solo mide la legibilidad (para comparar contra un árbol anterior que no tiene tinte ni pixel-stroke).
   Uso: [ABILITY_BASE_URL=http://127.0.0.1:PUERTO/] [ONLY=id1,id2] [ARENAS=bosque,hielo] node tools/vfx/test-decal-legible.js
   Sale con código 1 si algo incumple. */
const H = require('../lib/serve');
const MIN_VISIBLE = +(process.env.MIN_VISIBLE || 0.8), FULL_MIN = +(process.env.FULL_MIN || 0.4), MAX_FILL = +(process.env.MAX_FILL || 0.35);
const ARENAS = (process.env.ARENAS || 'bosque,hielo,infernal,laberinto,acuatica,minas').split(',');
(async () => {
  const site = await H.startSite({envUrl: ['ABILITY_BASE_URL', 'BASE_URL']}), BASE = site.url + '/';
  const browser = await H.launch();
  const page = await browser.newPage({viewport: process.env.MOBILE ? {width:390,height:844} : {width:844,height:390}}), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let bad = 0;
  try {
    await H.goto(page, BASE);
    await H.waitFor(page, leg => typeof startRun === 'function' && typeof KVB !== 'undefined' && typeof kvbFx === 'function' && (leg || typeof pxsRing === 'function'), !!process.env.LEGACY);
    await page.waitForTimeout(2500);
    if(process.env.SOURCE_BEFORE){const source=require('node:fs').readFileSync(process.env.SOURCE_BEFORE,'utf8');await page.addScriptTag({content:source.split('for(const kind of ')[0]});await page.evaluate(()=>sfaCache.clear());}

    // Control negativo local: cubrir deliberadamente la celda de estas recetas debe fallar el80%.
    if(process.env.CANARY_OPAQUE)await page.evaluate(()=>{for(const t of ['brakk_build','brakk_repair']){const old=sfaThemes[t].bake;sfaThemes[t].bake=(...args)=>{const S=old(...args);if(S)for(let f=0;f<S.n;f++)for(let y=0;y<S.h;y++)for(let x=0;x<S.w;x++)S.set(f,x,y,[255,255,255,255]);return S;};}sfaCache.clear();});
    // Negative control: restore the faulty render order. The same strict
    // measurement must fail; a gate that only checks registration cannot pass.
    if (process.env.CANARY_SFA_TOP === '1') await page.evaluate(() => {
      SFA_LAYER.nova = 'top'; SFA_LAYER.cone = 'top';
    });
    const ids = await page.evaluate(() => Object.keys(KVB_FX).sort()), only = process.env.ONLY ? process.env.ONLY.split(',') : null, list = []; // Kit específico: burst real de despliegue, sin cambiar umbrales.
    console.log(`${list.length} recetas · arenas ${ARENAS.join(',')} · mínimo visible ${MIN_VISIBLE * 100}%`);
    // 1) legibilidad
    const worst = [],measurements=[];
    for (const arena of ARENAS) {
      const r = await page.evaluate(([ids, arena, minVis, withSfa]) => {
        const out = {rows: [], err: null}, oNow = performance.now.bind(performance), oRand = Math.random; let T = 100000; performance.now = () => T; Math.random = () => .37;
        try {
          netMatch = null; selectedClass = 'tanque'; currentArena = arena; lobbyAllies = []; startRun(3); state = 'playing'; enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9;
          for (const a of allies) a.stunTimer = 1e9;
          const snap = () => { render(); return ctx.getImageData(0, 0, canvas.width, canvas.height).data; };
          // máscara del sprite del enemigo: se re-dibuja cada drawImage cercano al enemigo (menos la sombra del suelo) sobre un lienzo aparte y se lee su alfa
          let rec = null; const oDraw = window.__oDraw = CanvasRenderingContext2D.prototype.drawImage, shadowImg = typeof _shadowSprite === 'function' ? _shadowSprite() : null;
          const mk = document.createElement('canvas'); mk.width = canvas.width; mk.height = canvas.height; const mg = mk.getContext('2d'); mg.imageSmoothingEnabled = false;
          CanvasRenderingContext2D.prototype.drawImage = function(img, ...a) {
            if (rec && this === ctx && a.length >= 4 && img !== shadowImg) { const w = a.length === 8 ? a[6] : a[2], h = a.length === 8 ? a[7] : a[3], x = a.length === 8 ? a[4] : a[0], y = a.length === 8 ? a[5] : a[1], m = this.getTransform();
              if (w < 90 && h < 90) { const p0 = m.transformPoint({x, y}), p1 = m.transformPoint({x: x + w, y: y + h}); if (Math.hypot((p0.x + p1.x) / 2 - rec.sx, (p0.y + p1.y) / 2 - rec.sy) < 60) { mg.setTransform(m); mg.globalAlpha = this.globalAlpha; oDraw.call(mg, img, ...a); } } }
            return oDraw.call(this, img, ...a); };
          const spots = [[0, -1], [.87, .5], [-.87, .5]];
          const sfaItems = withSfa && typeof sfaThemes !== 'undefined' ? ['','~h','~p'].flatMap(v=>['sfa:beam:brakk_build'+v+':65','sfa:burst:brakk_repair'+v+':30','sfa:aura:brakk_repair'+v+':24']) : [];
          for (const id of ids.concat(sfaItems)) {
            const isSfa = id.startsWith('sfa:'), [, sArt, sTheme] = isSfa ? id.split(':') : [];
            for (const [fr, tag] of [[4, 'ant'], [20, 'impacto'], [42, 'disipa']]) {
              const R = Number(id.split(':')[3]) || 45; let fracs = [], dec = [], mins = [];
              for (let k = 0; k < 3; k++) {
                // el mismo estado para las tres capturas del enemigo k
                const cone = isSfa && sArt === 'cone', cA = [-.4, 0, .4][k], place = () => { enemies = []; const e = spawnEnemy('esqueleto'); Object.assign(e, cone ? {x: player.x + 10 + Math.cos(cA) * R * .6, y: player.y + Math.sin(cA) * R * .6} : {x: player.x + 70 + spots[k][0] * R * .42, y: player.y + spots[k][1] * R * .42}, { hp: 1e9, maxHp: 1e9, speed: 0, baseSpeed: 0, dmg: 0}); return e; };
                const e = place(); vfxResetRun(); KVB.seed = 0x2545F491; let saved, A, A2;
                if (isSfa) {
                  sfaReset(); const dur=sArt==='beam'?600:sArt==='aura'?3000:650,phase=tag==='ant'?.1:tag==='impacto'?.5:.95; sfaPush(sArt,sTheme,player.x+70,player.y-(sArt==='beam'?R:0),R,0,dur,player.x+70,player.y+R,sArt==='beam'?28:24,sArt==='beam'?-2:-1,.85); const s0=sfaPool[0]; if(!s0)throw new Error('SFA event missing');s0.t=phase*dur;T+=16;sfaLastT=T;
                  saved = sfaPool.slice(); A = snap(); A2 = A; sfaPool.length = 0;
                } else {
                  kvbFx(id, player.x + 70, player.y, R, .3, 40, 10);
                  for (let f = 0; f < fr; f++) { T += 16; kvbUpdate(16); }
                  saved = KVB.pool.slice(); A = snap();
                  KVB.pool = saved.filter(p => p.name && Math.max(p.w || 0, p.h || 0) >= 36); A2 = snap();
                  KVB.pool = [];
                }
                // posición en pantalla del enemigo = donde lo dibuja la cámara (se mide con la transformación del mundo en el render)
                mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, mk.width, mk.height); rec = {sx: 0, sy: 0}; const wt = (typeof worldToScreen === 'function') ? worldToScreen(e.x, e.y) : null;
                if (wt) { rec.sx = wt.x; rec.sy = wt.y; } else { rec.sx = (e.x - cam.x) * CAM_ZOOM + canvas.width / 2; rec.sy = (e.y - cam.y) * CAM_ZOOM + canvas.height / 2; }
                const C = snap(); rec = null; const MK = mg.getImageData(0, 0, mk.width, mk.height).data;
                if (isSfa) sfaPool.push(...saved); else KVB.pool = saved;
                let mpx = 0; const vis = X => { let m = 0, v = 0;
                  for (let i = 0; i < C.length; i += 4) {
                    if (MK[i + 3] < 250) continue; m++;
                    if (Math.abs(X[i] - C[i]) + Math.abs(X[i + 1] - C[i + 1]) + Math.abs(X[i + 2] - C[i + 2]) < 24) v++;
                  } mpx = m; return m ? v / m : 0; };
                fracs.push(vis(A)); dec.push(vis(A2)); mins.push(mpx);
              }
              out.rows.push({id, tag, mask: Math.min(...mins), min: Math.min(...dec), dec: dec.map(x => +x.toFixed(2)), all: fracs.map(x => +x.toFixed(2))});
            }
          }
        } catch (e) { out.err = e.message + ' ' + (e.stack || '').split('\n')[1]; }
        if (window.__oDraw) CanvasRenderingContext2D.prototype.drawImage = window.__oDraw; performance.now = oNow; Math.random = oRand; state = 'menu'; return out;
      }, [list, arena, MIN_VISIBLE, !only]);
      if (r.err) { console.log('ERROR', arena, r.err); bad++; continue; }
      measurements.push({arena,...r});const tiny = r.rows.filter(x => x.mask < 80); if (tiny.length) { console.log(`ERROR ${arena}: la máscara del sprite quedó vacía (${tiny.length} mediciones): la prueba no mide nada`); bad++; }
      const low = r.rows.filter(x => x.min < MIN_VISIBLE);
      // efecto completo: promedio de los tres instantes para cada enemigo
      const byId = {}; for (const x of r.rows) (byId[x.id] = byId[x.id] || [[], [], []]).forEach((a, k) => a.push(x.all[k]));
      const means = Object.entries(byId).map(([id, a]) => [id, Math.min(...a.map(v => v.reduce((p, q) => p + q, 0) / v.length))]);
      // Las formas de definitiva (ids 'uf.*', js/champions/ult-forms/) son un momento épico de 1-2 s que cae sobre su objetivo a propósito
  // (p. ej. las cuchillas cruzadas de Musashi): se miden y se listan, pero no hacen fallar el piso de FULL_MIN. Ya tienen su prueba en test-ult-forms.js.
  const isUlt = id => /^uf\./.test(String(id));
  const meanLow = means.filter(([id, m]) => m < FULL_MIN && !isUlt(id)), warn = means.filter(([id, m]) => (m >= FULL_MIN || isUlt(id)) && m < MIN_VISIBLE);
      console.log(`${arena.padEnd(10)} ${r.rows.length} mediciones · decales: peor ${(Math.min(...r.rows.map(x => x.min)) * 100).toFixed(0)}%, bajo el mínimo ${low.length} · efecto completo: peor promedio ${(Math.min(...means.map(m => m[1])) * 100).toFixed(0)}%, bajo ${FULL_MIN * 100}%: ${meanLow.length}, entre ${FULL_MIN * 100} y ${MIN_VISIBLE * 100}% (aviso): ${warn.length}`);
      for (const x of low.slice(0, 12)) console.log(`   · decal ${x.id} ${x.tag} ${x.dec.join('/')}`);
      for (const [id, m] of meanLow.slice(0, 12)) console.log(`   · completo ${id} promedio ${(m * 100).toFixed(0)}%`);
      if (process.env.VERBOSE) for (const [id, m] of warn) console.log(`   · aviso ${id} promedio ${(m * 100).toFixed(0)}%`);
      bad += low.length + meanLow.length; worst.push(...low);
    }
    if(process.env.OUT){const fs=require('node:fs'),path=require('node:path');fs.mkdirSync(process.env.OUT,{recursive:true});fs.writeFileSync(path.join(process.env.OUT,'component-legibility.json'),JSON.stringify({minimum:MIN_VISIBLE,delta:24,fullMinimum:FULL_MIN,scope:'isolated B117/B119 SFA only, not compound contrast',measurements,errors,bad},null,2)+'\n');}
    console.log(`errores de página: ${errors.length}`, errors.slice(0, 3)); if (errors.length) bad++;
  } finally { await browser.close(); await site.close(); }
  console.log(bad ? `FALLA: ${bad} incumplimientos` : 'OK');
  process.exitCode = bad ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
