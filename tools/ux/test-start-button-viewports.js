'use strict';
// FASE 1 (cierre): el botón de comenzar partida SIEMPRE visible y funcional, medido con rects reales en el juego real (no HTML recortado).
//   Por viewport: 844x390, 667x375, 932x430, 1280x720 (horizontal) y 390x844 (vertical, táctil).
//   A) la ficha de arena de la primera partida: «Entrar» (#run-intro .ri-go) dentro del viewport, sin tapar, y un toque real arranca la partida.
//   B) la Sala (#prep-screen, desde la segunda partida): #prep-start-btn dentro del viewport, con el contenido en el tope y al fondo,
//      sin que lo cubra otro elemento, y un toque real arranca (ficha o partida).
//   En vertical el juego pide girar (#rotate-overlay): se mide el estado real y se informa si el botón queda tapado por el aviso.
//   node tools/ux/test-start-button-viewports.js   (servidor propio en puerto libre; SB_BASE_URL para usar otro)
const H = require('../lib/serve');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 500) : '')); if (!ok) fails++; };
const VIEWPORTS = [[844, 390], [667, 375], [932, 430], [1280, 720], [390, 844]];

async function profile(browser, BASE, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await ctx.addInitScript(() => { window.__firstRun = true; window.__campaignMode = true; try { if (!sessionStorage.getItem('__sb')) { localStorage.clear(); sessionStorage.setItem('__sb', '1'); } } catch (e) {} });
  await page.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 180000 }); await sleep(1200);
  const vis = sel => page.evaluate(s => { const e = document.querySelector(s); return !!(e && !e.classList.contains('hidden') && !e.closest('.hidden') && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0); }, sel);
  const rect = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    const ro = document.getElementById('rotate-overlay'); return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom, hit: !!top && (top === e || e.contains(top)), cover: top ? (top.id || top.className || top.tagName) : null, vw: innerWidth, vh: innerHeight, rotate: !!ro && getComputedStyle(ro).display !== 'none' }; }, sel);
  const tap = async sel => { const el = await page.waitForSelector(sel, { state: 'visible', timeout: 15000 }); await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120); const b = await el.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450); };
  const ro = await page.evaluate(() => { const o = document.getElementById('rotate-overlay'); if (o && innerHeight > innerWidth) return 'vertical'; return 'horizontal'; });
  // el aviso de girar se oculta solo para poder armar el perfil; la medición del paso A/B lo vuelve a mostrar si la orientación lo exige
  await page.evaluate(() => { const o = document.getElementById('rotate-overlay'); if (o) o.dataset.sbHide = '1'; });
  await page.addStyleTag({ content: '#rotate-overlay[data-sb-hide]{display:none !important}' });
  await tap('#title-continue-btn'); await page.waitForSelector('#starter-step-champ', { state: 'visible' });
  const card = '.starter-card[data-champ="guerrero"]'; // primer guardián: solo los 4 fundadores (sin "Ver todos")
  await tap(card); await tap('#starter-yes-btn'); await sleep(400); if (await vis('#starter-skin-later-btn')) await tap('#starter-skin-later-btn'); await sleep(700);
  await page.waitForSelector('#first-story-skip', { state: 'visible', timeout: 15000 }); await tap('#first-story-skip'); await sleep(400);
  return { ctx, page, errors, vis, rect, tap, orientation: ro };
}
const state = B => B.page.evaluate(() => ({ state, intro: !!document.querySelector('#run-intro:not(.hidden)') }));
async function showRotate(B, on) { await B.page.evaluate(on => { const o = document.getElementById('rotate-overlay'); if (o) { if (on) delete o.dataset.sbHide; else o.dataset.sbHide = '1'; } }, on); }
const inView = g => g && g.x >= -0.5 && g.y >= -0.5 && g.right <= g.vw + 0.5 && g.bottom <= g.vh + 0.5;

(async () => {
  const site = await H.startSite({ envUrl: ['SE_BASE_URL', 'SB_BASE_URL'] }); const BASE = site.url;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  try {
    for (const [w, h] of VIEWPORTS) {
      const tag = w + 'x' + h; const vertical = h > w;
      const B = await profile(browser, BASE, vertical ? h : w, vertical ? w : h); /* el perfil se arma en horizontal: en vertical el juego solo muestra el aviso de girar */
      if (vertical) { const lw = h, lh = w; B.land = [lw, lh]; }
      // A) ficha de arena de la primera partida
      await B.tap('#hub-play-btn'); await sleep(500);
      for (let k = 0; k < 40 && !(await B.vis('#run-intro .ri-go')); k++) { if (await B.vis('#run-intro')) { await B.tap('#run-intro'); } else await sleep(250); }
      const ficha = await B.vis('#run-intro .ri-go');
      if (!ficha) { check(`FICHA.${tag}.aparece`, false, await state(B)); }
      else {
        const g = await B.rect('#run-intro .ri-go');
        check(`FICHA.${tag}.Entrar_dentro_del_viewport`, inView(g), g);
        check(`FICHA.${tag}.Entrar_sin_nada_encima${vertical ? '' : ''}`, g.hit, g);
        check(`FICHA.${tag}.Entrar_tamaño_tactil_(>=40px)`, g.h >= 40 && g.w >= 40, { w: g.w, h: g.h });
        await B.tap('#run-intro .ri-go'); await sleep(900);
        check(`FICHA.${tag}.un_toque_arranca_la_partida`, (await state(B)).state === 'playing', await state(B));
      }
      // B) la Sala, desde la segunda partida
      await B.page.evaluate(() => { state = 'mainmenu'; setState('mainmenu'); renderMainMenu(); }); await sleep(500);
      await B.tap('#hub-play-btn'); await sleep(500);
      const sala = await B.vis('#prep-screen');
      check(`SALA.${tag}.JUGAR_abre_la_Sala`, sala);
      if (sala) {
        for (const bottom of [false, true]) {
          await B.page.evaluate(b => { for (const el of document.querySelectorAll('#prep-screen, #prep-content')) el.scrollTop = b ? el.scrollHeight : 0; }, bottom);
          const g = await B.rect('#prep-start-btn');
          check(`SALA.${tag}.${bottom ? 'fondo' : 'tope'}.Comenzar_dentro_del_viewport`, inView(g), g);
          check(`SALA.${tag}.${bottom ? 'fondo' : 'tope'}.Comenzar_sin_nada_encima${vertical ? '' : ''}`, g && g.hit, g);
          check(`SALA.${tag}.${bottom ? 'fondo' : 'tope'}.Comenzar_tamaño_tactil_(>=40px)`, g && g.h >= 40, g && { w: g.w, h: g.h });
        }
        if (vertical) {
          // girar el teléfono a vertical (390x844): el juego tapa TODO con el aviso de girar (no hay botón usable); al volver a horizontal el botón sigue ahí
          await showRotate(B, true); await B.page.setViewportSize({ width: w, height: h }); await sleep(500);
          const ov = await B.page.evaluate(() => { const o = document.getElementById('rotate-overlay'), r = o.getBoundingClientRect(), st = document.getElementById('stage'); return { shown: getComputedStyle(o).display !== 'none', cover: r.width >= innerWidth - 1 && r.height >= innerHeight - 1, stage: st ? getComputedStyle(st).visibility : null, text: (o.textContent || '').trim().slice(0, 60) }; });
          check(`VERTICAL.${tag}.aviso_de_girar_cubre_la_pantalla_(el_juego_es_horizontal)`, ov.shown && ov.cover && ov.stage === 'hidden' && ov.text.length > 0, ov);
          await B.page.setViewportSize({ width: h, height: w }); await sleep(600);
          const g2 = await B.rect('#prep-start-btn'); check(`VERTICAL.${tag}.al_girar_a_horizontal_Comenzar_vuelve_visible_y_usable`, inView(g2) && g2.hit && !g2.rotate, g2);
        }
        await B.tap('#prep-start-btn'); await B.page.waitForFunction(() => state === 'playing' || !!document.querySelector('#run-intro:not(.hidden)') || (document.getElementById('run-intro') && getComputedStyle(document.getElementById('run-intro')).display !== 'none'), null, { timeout: 8000 }).catch(() => {}); await sleep(300);
        const s = await state(B);
        check(`SALA.${tag}.un_toque_en_Comenzar_avanza_(ficha_o_partida)`, s.state === 'playing' || s.intro, s);
      }
      check(`ERRORES.${tag}.sin_errores_de_pagina`, B.errors.length === 0, B.errors);
      await B.ctx.close();
    }
  } finally { await browser.close(); await site.close(); }
  console.log(fails ? `\n${fails} FAIL` : '\nTODO OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
