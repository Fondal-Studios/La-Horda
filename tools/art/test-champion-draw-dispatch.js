'use strict';
/* Despacho de dibujo de Ilkan, Libertador y Nigromante (drawHeroBody real, espiando champPackDrawFrame / drawNigromanteDemon).
 *   node tools/art/test-champion-draw-dispatch.js            (servidor propio, sin red)
 *   CAPTURE_DIR=art-source/captures node tools/art/test-champion-draw-dispatch.js   (ademas deja capturas antes/despues)
 * Cubre solo QUE sprite se elige: no toca logica, dano, duraciones ni balance.
 *  - Ilkan:      attack_down / attack_up (si el atlas los trae) segun el apuntado; sin ellos, attack_side espejado como siempre.
 *  - Libertador: ult_cast avanza con el progreso de la fase "ultcast" (set de >1 cuadros); attack_down/up si existen; con 1 cuadro, igual que siempre.
 *  - Nigromante: durante nigroTransformTimer se ve la pose propia (sets.ult 32-35) y recien despues el Demonio.
 * Los sets "nuevos" de Ilkan/Libertador se INYECTAN en memoria con cuadros reales del atlas (el arte nuevo aun no existe): demuestran el despacho. */
const fs = require('node:fs'), path = require('node:path'), H = require('../lib/serve');
const ROOT = path.resolve(__dirname, '../..'), CAP = process.env.CAPTURE_DIR ? path.resolve(ROOT, process.env.CAPTURE_DIR) : null;
(async () => {
  const site = await H.startSite({envUrl: ['SE_BASE_URL', 'BASE_URL']}), browser = await H.launch();
  const errors = [];
  try {
    const page = await browser.newPage({viewport: {width: 1000, height: 700}});
    page.on('pageerror', e => errors.push(e.message));
    await H.goto(page, site.url + '/index.html');
    await page.waitForFunction(() => typeof drawHeroBody === 'function' && typeof assetsAllReady === 'function' && assetsAllReady());
    await page.evaluate(() => { loop = function(){}; for (const g of ['ch:ilkan', 'ch:libertador', 'ch:nigromante']) { try { assetsStartGroup(g); } catch (e) {} } });
    await page.waitForFunction(() => ['ilkan', 'libertador', 'nigromante'].every(k => CHAMP_PACK[k] && CHAMP_PACK[k].ready), null, {timeout: 90000});
    const res = await page.evaluate(withCaps => {
      selectedClass = 'tanque'; currentArena = 'bosque'; startRun(1); state = 'paused'; window.ART_GATE_NO_VFX = true;
      const checks = [], check = (name, ok, extra) => checks.push({name, ok: !!ok, extra});
      const cv = document.createElement('canvas'); cv.width = cv.height = 220; const g = cv.getContext('2d');
      const V = {front: [0, 1], side: [1, 0], up: [0, -1], sideL: [-1, 0]};
      // dibuja un heroe con drawHeroBody y devuelve las llamadas a champPackDrawFrame y si se dibujo el Demonio
      function draw(key, set, view){
        const h = makeHero(key, true, 0, 0);
        Object.assign(h, {x: 0, y: 0, moving: false, animT: 0, attackAnim: 0, hurtTimer: 0, _packCastUntil: 0, _codexSkin: null, fx: V[view][0], fy: V[view][1], _pdir: undefined, _pleft: view === 'sideL'});
        animNow = 20000; set(h);
        const calls = [], origF = champPackDrawFrame, origD = drawNigromanteDemon, saved = ctx; let demon = 0;
        champPackDrawFrame = function(P, v, ...a){ calls.push({pack: Object.keys(CHAMP_PACK).find(k => CHAMP_PACK[k] === P), v: v < 0 ? ~v : v, flip: (v < 0) !== !!a[3]}); return origF.call(this, P, v, ...a); };
        drawNigromanteDemon = function(){ demon++; return origD.apply(this, arguments); };
        ctx = g; g.clearRect(0, 0, 220, 220); g.save(); g.translate(110, 160); g.imageSmoothingEnabled = false;
        try { drawHeroBody(h, h.scale, false, false); } finally { ctx = saved; champPackDrawFrame = origF; drawNigromanteDemon = origD; g.restore(); }
        return {calls, demon, h};
      }
      const frames = r => r.calls.map(c => c.v);
      // ---------- ILKAN ----------
      const IP = CHAMP_PACK.ilkan, atkI = h => { h.attackAnim = 190; h.ilkanAtkTotal = 380; h.ilkanAtkStep = 0; };
      const sideSet = IP.sets.attack_side.slice();
      // el atlas real ya trae attack_down/up: para probar el camino "sin set" se quitan en memoria y se restauran al final
      const realI = {attack_down: IP.sets.attack_down, attack_up: IP.sets.attack_up}; delete IP.sets.attack_down; delete IP.sets.attack_up;
      for (const view of ['front', 'up', 'side']) {
        const r = draw('ilkan', atkI, view);
        check('ilkan sin attack_' + view + ': dibuja attack_side como siempre', r.calls.length === 1 && sideSet.includes(r.calls[0].v) && r.calls[0].flip === false, JSON.stringify(r.calls));
      }
      const injI = {attack_down: [4, 5, 6, 7], attack_up: [19, 20, 21, 22]};
      Object.assign(IP.sets, injI);
      try {
        const f = draw('ilkan', atkI, 'front'), u = draw('ilkan', atkI, 'up'), s = draw('ilkan', atkI, 'side'), l = draw('ilkan', atkI, 'sideL');
        check('ilkan con attack_down: apuntando al frente usa attack_down', f.calls.length === 1 && injI.attack_down.includes(f.calls[0].v), JSON.stringify(f.calls));
        check('ilkan con attack_up: apuntando arriba usa attack_up', u.calls.length === 1 && injI.attack_up.includes(u.calls[0].v), JSON.stringify(u.calls));
        check('ilkan con sets nuevos: de perfil sigue usando attack_side', s.calls.length === 1 && sideSet.includes(s.calls[0].v) && l.calls.length === 1 && sideSet.includes(l.calls[0].v) && l.calls[0].flip === true, JSON.stringify([s.calls, l.calls]));
        const seen = new Set(); for (const a of [20, 80, 140, 190, 260, 320, 370]) seen.add(draw('ilkan', h => { h.attackAnim = a; h.ilkanAtkTotal = 380; h.ilkanAtkStep = 1; }, 'front').calls[0].v);
        check('ilkan: el golpe recorre varios cuadros del set de frente', seen.size >= 3 && [...seen].every(v => injI.attack_down.includes(v)), JSON.stringify([...seen]));
      } finally { delete IP.sets.attack_down; delete IP.sets.attack_up; if (realI.attack_down) IP.sets.attack_down = realI.attack_down; if (realI.attack_up) IP.sets.attack_up = realI.attack_up; }
      { const rf = draw('ilkan', atkI, 'front'), ru = draw('ilkan', atkI, 'up'); check('ilkan con el atlas real: frente/espalda usan sus hojas propias (cuadros 64-67 / 68-71)', !!realI.attack_down && rf.calls.length === 1 && realI.attack_down.includes(rf.calls[0].v) && !!realI.attack_up && ru.calls.length === 1 && realI.attack_up.includes(ru.calls[0].v), JSON.stringify([rf.calls, ru.calls])); }
      // ---------- LIBERTADOR ----------
      const LP = CHAMP_PACK.libertador, CAST = SM_CFG.andes.castMs;
      const ult = p => h => { h.smPhase = 'ultcast'; h.smPhaseTimer = CAST * (1 - p); };
      const realUlt = LP.sets.ult_cast; LP.sets.ult_cast = [44];
      const base = [0.05, 0.4, 0.6, 0.95].map(p => frames(draw('libertador', ult(p), 'front'))[0]);
      check('libertador ult_cast de 1 cuadro: todos los progresos dibujan el mismo cuadro (44)', base.every(v => v === 44), JSON.stringify(base));
      const origUlt = [44]; LP.sets.ult_cast = [44, 45, 46, 47];
      try {
        const adv = [0.05, 0.3, 0.55, 0.95].map(p => frames(draw('libertador', ult(p), 'front'))[0]);
        check('libertador ult_cast de 4 cuadros avanza con el progreso de la fase ultcast', JSON.stringify(adv) === '[44,45,46,47]', JSON.stringify(adv));
      } finally { LP.sets.ult_cast = realUlt; }
      const atkL = h => { h.attackAnim = 120; h.smAtkTotal = 240; };
      const fire = LP.sets.fire.slice();
      for (const view of ['front', 'up']) { const r = draw('libertador', atkL, view); check('libertador sin attack_' + view + ': dispara con el set fire como siempre', r.calls.length === 1 && fire.includes(r.calls[0].v), JSON.stringify(r.calls)); }
      const injL = {attack_down: [1, 2, 3, 12], attack_up: [13, 14, 15, 16]};
      Object.assign(LP.sets, injL);
      try {
        const f = draw('libertador', atkL, 'front'), u = draw('libertador', atkL, 'up'), s = draw('libertador', atkL, 'side');
        check('libertador con attack_down: de frente usa attack_down', f.calls.length === 1 && injL.attack_down.includes(f.calls[0].v), JSON.stringify(f.calls));
        check('libertador con attack_up: de espaldas usa attack_up', u.calls.length === 1 && injL.attack_up.includes(u.calls[0].v), JSON.stringify(u.calls));
        check('libertador con sets nuevos: de perfil sigue en fire', s.calls.length === 1 && fire.includes(s.calls[0].v), JSON.stringify(s.calls));
      } finally { delete LP.sets.attack_down; delete LP.sets.attack_up; }
      // ---------- NIGROMANTE ----------
      const NP = CHAMP_PACK.nigromante, ultSet = NP.sets.ult.slice(), T = NIGRO_TRANSFORM_MS;
      const tf = p => h => { h.nigroDemonForm = true; h.nigroTransformTimer = T * (1 - p); h.nigroDemonTimer = 5000; };
      const w = [0.05, 0.3, 0.55, 0.95].map(p => draw('nigromante', tf(p), 'front'));
      check('nigromante: en la ventana de transformacion se dibuja la pose propia sets.ult (32-35), en orden, sin Demonio',
        w.every(r => r.demon === 0 && r.calls.length === 1) && JSON.stringify(w.map(r => r.calls[0].v)) === JSON.stringify(ultSet), JSON.stringify(w.map(r => [r.demon, r.calls.map(c => c.v)])));
      const after = draw('nigromante', h => { h.nigroDemonForm = true; h.nigroTransformTimer = 0; h.nigroDemonTimer = 5000; }, 'front');
      check('nigromante: terminada la ventana (timer 0) se dibuja el Demonio, no la pose ult', after.demon >= 1 && !after.calls.some(c => c.pack === 'nigromante' && ultSet.includes(c.v)), JSON.stringify([after.demon, after.calls]));
      const origSets = NP.sets; NP.sets = Object.assign({}, origSets); delete NP.sets.ult;
      try { const r = draw('nigromante', tf(0.3), 'front'); check('nigromante sin set ult en el atlas: Demonio desde el primer cuadro (comportamiento anterior)', r.demon >= 1, JSON.stringify([r.demon, r.calls])); } finally { NP.sets = origSets; }
      const h0 = draw('nigromante', tf(0.3), 'front').h;
      check('nigromante: la logica no cambia (forma Demonio activa, temporizadores intactos)', h0.nigroDemonForm === true && h0.nigroDemonTimer === 5000 && Math.abs(h0.nigroTransformTimer - T * 0.7) < 1e-6);
      // ---------- CAPTURAS (antes / despues), solo si hay CAPTURE_DIR ----------
      const caps = {};
      if(!withCaps) return {checks, caps};
      function strip(rows, W, Hh, Z){
        const out = document.createElement('canvas'); out.width = W * 4 * Z; out.height = Hh * rows.length * Z; const o = out.getContext('2d'); o.fillStyle = '#3a4258'; o.fillRect(0, 0, out.width, out.height); o.imageSmoothingEnabled = false;
        rows.forEach((row, r) => row.forEach((fn, n) => {
          const c = document.createElement('canvas'); c.width = W; c.height = Hh; const gg = c.getContext('2d'), saved = ctx; ctx = gg; gg.translate(W / 2, Hh - 30); gg.imageSmoothingEnabled = false;
          try { fn(); } finally { ctx = saved; }
          o.drawImage(c, 0, 0, W, Hh, n * W * Z, r * Hh * Z, W * Z, Hh * Z);
        }));
        return out.toDataURL();
      }
      const mk = (key, set, view) => () => { const h = makeHero(key, true, 0, 0); Object.assign(h, {x: 0, y: 0, moving: false, animT: 0, attackAnim: 0, hurtTimer: 0, _packCastUntil: 0, _codexSkin: null, fx: V[view][0], fy: V[view][1], _pdir: undefined}); animNow = 20000; set(h); drawHeroBody(h, h.scale, false, false); };
      const ps = [0.1, 0.35, 0.6, 0.85];
      // Nigromante: antes = Demonio desde el primer cuadro (se anula la pose), despues = motor actual
      const origPose = nigroUltPoseActive;
      nigroUltPoseActive = () => false;
      const nb = ps.map(p => mk('nigromante', tf(p), 'front'));
      const nbShots = strip([nb], 140, 150, 3);
      nigroUltPoseActive = origPose;
      caps.nigromante = strip([nb.map((_, i) => mk('nigromante', tf(ps[i]), 'front'))], 140, 150, 3);
      caps.nigromante_before = nbShots;
      // Ilkan: antes = sin set nuevo (attack_side espejado), despues = set de prueba inyectado en memoria
      const atkIs = n => h => { h.attackAnim = 380 * (1 - (n + .5) / 4); h.ilkanAtkTotal = 380; h.ilkanAtkStep = 1; };
      const rowI = (view) => [0, 1, 2, 3].map(n => mk('ilkan', atkIs(n), view));
      const iBefore = strip([rowI('front'), rowI('up')], 140, 150, 3);
      Object.assign(IP.sets, injI); const iAfter = strip([rowI('front'), rowI('up')], 140, 150, 3); delete IP.sets.attack_down; delete IP.sets.attack_up;
      caps.ilkan_before = iBefore; caps.ilkan_after = iAfter;
      // Libertador: ult_cast 1 cuadro vs 4 cuadros inyectados; ataque de frente sin / con attack_down
      const rowU = [0.1, 0.35, 0.6, 0.85].map(p => mk('libertador', ult(p), 'front'));
      const rowA = [0, 1, 2, 3].map(n => mk('libertador', h => { h.attackAnim = 240 * (1 - (n + .5) / 4); h.smAtkTotal = 240; }, 'front'));
      const lBefore = strip([rowU, rowA], 140, 150, 3);
      LP.sets.ult_cast = [44, 45, 46, 47]; Object.assign(LP.sets, injL); const lAfter = strip([rowU, rowA], 140, 150, 3); LP.sets.ult_cast = origUlt; delete LP.sets.attack_down; delete LP.sets.attack_up;
      caps.libertador_before = lBefore; caps.libertador_after = lAfter;
      return {checks, caps};
    }, !!CAP);
    for (const c of res.checks) console.log((c.ok ? 'PASS ' : 'FAIL ') + c.name + (c.ok ? '' : '  -> ' + c.extra));
    if (CAP) {
      const put = (champ, name, url) => { const d = path.join(CAP, champ); fs.mkdirSync(d, {recursive: true}); fs.writeFileSync(path.join(d, name), Buffer.from(url.split(',')[1], 'base64')); console.log('captura', path.relative(ROOT, path.join(d, name))); };
      put('nigromante', 'ult-transformacion-antes.png', res.caps.nigromante_before); put('nigromante', 'ult-transformacion-despues.png', res.caps.nigromante);
      put('ilkan', 'ataque-frente-espalda-antes.png', res.caps.ilkan_before); put('ilkan', 'ataque-frente-espalda-despues-set-de-prueba.png', res.caps.ilkan_after);
      put('libertador', 'ult-ataque-antes.png', res.caps.libertador_before); put('libertador', 'ult-ataque-despues-set-de-prueba.png', res.caps.libertador_after);
    }
    const bad = res.checks.filter(c => !c.ok);
    console.log(`${res.checks.length - bad.length}/${res.checks.length} checks` + (errors.length ? ' | errores de pagina: ' + errors.join(' | ') : ''));
    if (bad.length || errors.length) process.exitCode = 1;
  } finally { await browser.close(); await site.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
