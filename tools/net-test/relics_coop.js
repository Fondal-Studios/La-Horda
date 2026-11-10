// LA HORDA — RELIQUIAS DE LA HORDA en cooperativo (2 clientes reales contra el relay; js/systems/horde-relics.js).
//   - tras la ronda 3 y el refuerzo normal, anfitrión e invitado ven la MISMA oferta (el anfitrión la decide; viaja en "buffs" y en la instantánea)
//   - cada jugador elige la suya: el anfitrión la aplica al héroe correcto (capa de runStats del invitado) y la partida sigue para los dos
//   - un mensaje repetido del invitado no duplica la reliquia; un id que no está en la oferta no se acepta
//   - el invitado ve su reliquia por la instantánea; al terminar la partida se limpian
// uso: NODE_PATH=server/node_modules node tools/net-test/relics_coop.js   (levanta su propio servidor estático y su relay)
const H = require('../lib/serve'), cp = require('node:child_process'), path = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
let SITE = process.env.SITE || '';
let RELAY = process.env.RELAY || '';
const OUT = process.argv[2];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const AID_COLISEO = ['bosque', 'hielo', 'laberinto', 'acuatica', 'infernal']; // arenas con trazado al azar
let fails = 0;
const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 500) : '')); if (!ok) fails++; };
const PHONE = { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const DESK = { viewport: { width: 1000, height: 560 } };
async function client(browser, mobile, name, champ) {
  const ctx = await browser.newContext(Object.assign({}, mobile ? PHONE : DESK));
  await ctx.addInitScript(([n]) => { try { if (!localStorage.getItem('__s')) { localStorage.clear(); localStorage.setItem('__s', '1'); localStorage.setItem('horda_name', n); } } catch (e) {} }, [name]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  page.on('console', m => { if (m.type() === 'error' && /loop del juego|Error al/.test(m.text())) errors.push(m.text().slice(0, 200)); });
  await page.goto(`${SITE}/index.html?server=${encodeURIComponent(RELAY)}`, { waitUntil: 'load', timeout: 240000 });
  for (let k = 0; k < 600; k++) { if (await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; })) break; await sleep(100); }
  await page.evaluate(([c]) => { for (const k in save.champions) save.champions[k].level = 20; save.champions[c].unlocked = true; save.starterChosen = true; save.tut = Object.assign(save.tut || {}, { training: 1 }); selectedClass = c; save.lastChamp = c;
    save.arenasCleared.ciudad = true; save.arenasCleared.fortaleza = true; save.stash = []; persistNow(); }, [champ]);
  return { ctx, page, errors, mobile, name };
}
const ev = (c, fn, a) => c.page.evaluate(fn, a);
async function press(c, sel) {
  await c.page.evaluate(s => { if (typeof prepSecReveal === 'function') prepSecReveal(s); }, sel).catch(() => {}); // pestaña de la Sala que lo contiene (js/ui/prep-sections.js)
  if (c.mobile) await c.page.tap(sel); else await c.page.click(sel); await sleep(450); }
async function waitFor(c, fn, a, ms) { for (let k = 0; k < (ms || 20000)/150; k++) { if (await ev(c, fn, a)) return true; await sleep(150); } return false; }

(async () => {
  const site = await H.startSite(); SITE = site.url;
  const port = 18900 + Math.floor(Math.random() * 90);
  const relay = cp.spawn(process.execPath, ['relay.js'], { cwd: path.resolve(__dirname, '../../server'), env: Object.assign({}, process.env, { PORT: String(port) }), stdio: 'ignore' });
  RELAY = 'ws://127.0.0.1:' + port; await sleep(1500);
  const browser = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  try {
  const A = await client(browser, false, 'Ana', 'guerrero');
  await press(A, '#title-continue-btn'); await press(A, '#mainmenu-jugar-btn');
  await press(A, '#mode-endless-btn'); await press(A, '#start-btn');
  await press(A, '#net-create-btn'); await waitFor(A, () => !!net.code);
  const code = await ev(A, () => net.code);
  const B = await client(browser, true, 'Beto', 'mago');
  await press(B, '#title-continue-btn'); await press(B, '#mainmenu-jugar-btn');
  await B.page.fill('#mode-join-code', code); await press(B, '#mode-join-btn');
  await waitFor(B, () => net.role === 'guest' && state === 'prep');
  await ev(B, () => { document.getElementById('net-ready-btn').click(); });
  await sleep(800);
  await ev(A, () => { document.getElementById('prep-start-btn').click(); });
  const both = await waitFor(A, () => state === 'playing') && await waitFor(B, () => state === 'playing', null, 60000);
  check('red.los_dos_juegan', both);
  await sleep(1500);
  await ev(A, () => { for (const h of heroes) h.invulnTimer = 1e9; });
  const pickNormal = async (c) => ev(c, () => { if (state === 'buff' && !(typeof hrelPhaseVisible === 'function' && hrelPhaseVisible())) { const k = document.querySelector('#buff-cards .buff-card'); if (k) k.click(); } });
  const advanceTo = async (round) => {
    for (let step = 0; step < 400; step++) {
      const st = await ev(A, () => ({ r: EN.round, st: state, vis: hrelPhaseVisible() }));
      if (st.r >= round && st.st === 'buff' && st.vis) break;
      await ev(A, () => { if (state === 'playing') { levelTimer = Math.max(levelTimer, levelDuration + 1); for (const e of enemies) if (e.alive && (e.rank === 'subjefe' || e.rank === 'jefe')) damageEnemy(e, 1e12, { src: player }); } });
      await pickNormal(A); await pickNormal(B); await sleep(250);
    }
  };
  await advanceTo(3);
  const hv = await waitFor(A, () => state === 'buff' && hrelPhaseVisible() && EN.round === 3);
  const gv = await waitFor(B, () => state === 'buff' && hrelPhaseVisible(), null, 15000);
  check('reliquias.las_dos_pantallas_aparecen_en_la_ronda_3', hv && gv, { hv, gv });
  const offA = await ev(A, () => [...document.querySelectorAll('#buff-cards button.hrel-card')].map(b => b.dataset.hr));
  const offB = await ev(B, () => [...document.querySelectorAll('#buff-cards button.hrel-card')].map(b => b.dataset.hr));
  const snapB = await ev(B, () => EN.hrelOffer.map(x => x.slice(3)));
  const hostOffer = await ev(A, () => EN.hrelOffer.map(x => x.slice(3)));
  check('reliquias.misma_oferta_en_los_dos', offA.length === 3 && offA.join() === offB.join() && offA.join() === hostOffer.join() && snapB.join() === hostOffer.join(), { offA, offB, hostOffer, snapB });
  const exp = await ev(A, () => hrelBuildOffer(EN.id, EN.round, [{}, {}]).map(x => x.slice(3)));
  check('reliquias.oferta_es_la_determinista_de_la_semilla', exp.join() === offA.join(), { exp, offA });
  // un id que no está en la oferta del invitado no se acepta como suyo (el anfitrión lo reemplaza por la primera carta de SU oferta)
  const outside = await ev(A, (o) => HRELICS.map(r => r.id).find(id => !o.includes(id)), offA);
  await ev(A, () => { document.querySelector('#buff-cards button.hrel-card').click(); });
  await sleep(300);
  const stillBuff = await ev(A, () => state);
  const gBefore = await ev(A, () => heroes[1].hrel || null);
  check('reliquias.el_anfitrion_espera_al_invitado', stillBuff === 'buff' && !gBefore, { stillBuff, gBefore });
  await ev(B, (id) => { netSendToHost({ k: 'buff', id: 'hr:' + id }); }, outside);
  const adv = await waitFor(A, () => state === 'playing' && EN.round === 4) && await waitFor(B, () => state === 'playing' && EN.round === 4, null, 15000);
  const hh = await ev(A, () => ({ h0: heroes[0].hrel, h1: heroes[1].hrel, l0: HR_APPLIED.has(runStats), l1: HR_APPLIED.has(heroes[1]._net.runStats), buffPicks: netMatch.buffPicks, phase: EN.hrelPhase }));
  check('reliquias.id_ajeno_a_la_oferta_se_reemplaza_por_una_carta_de_la_oferta', adv && hh.h1 && Object.keys(hh.h1).length === 1 && offA.includes(Object.keys(hh.h1)[0]) && Object.keys(hh.h1)[0] !== outside, { hh, outside });
  check('reliquias.cada_jugador_aplica_su_eleccion', hh.h0 && hh.h0[offA[0]] === 1 && Object.keys(hh.h0).length === 1, hh);
  check('reliquias.capa_de_cada_heroe_en_su_propio_runStats', hh.l0 && hh.l1 && hh.phase === 0 && hh.buffPicks === null, hh);
  const picked1 = Object.keys(hh.h1)[0];
  const gg = await ev(B, () => ({ mine: player.hrel || null, host: heroes[0].hrel || null, st: state }));
  check('reliquias.el_invitado_ve_la_suya_en_la_instantanea', gg.mine && gg.mine[picked1] === 1 && gg.host && gg.host[offA[0]] === 1, gg);
  // mensaje repetido del invitado fuera de fase: no duplica
  await ev(B, (id) => { netSendToHost({ k: 'buff', id: 'hr:' + id }); netSendToHost({ k: 'buff', id: 'hr:' + id }); }, picked1);
  await sleep(600);
  const dup = await ev(A, (id) => ({ n: heroes[1].hrel[id], tot: Object.keys(heroes[1].hrel).length }), picked1);
  check('reliquias.mensaje_repetido_no_duplica', dup.n === 1 && dup.tot === 1, dup);
  // ronda 5 (subjefe): vuelve a ofrecer
  await advanceTo(5);
  const g5 = await waitFor(B, () => state === 'buff' && hrelPhaseVisible() && EN.round === 5, null, 15000);
  const o5A = await ev(A, () => [...document.querySelectorAll('#buff-cards button.hrel-card')].map(b => b.dataset.hr));
  const o5B = await ev(B, () => [...document.querySelectorAll('#buff-cards button.hrel-card')].map(b => b.dataset.hr));
  check('reliquias.ronda_5_misma_oferta_y_distinta_de_la_3', g5 && o5A.length === 3 && o5A.join() === o5B.join() && o5A.join() !== offA.join(), { o5A, o5B });
  await ev(A, () => { document.querySelectorAll('#buff-cards button.hrel-card')[1].click(); });
  await sleep(1500);
  const waiting = await ev(A, () => ({ st: state, r: EN.round }));
  check('reliquias.la_ronda_espera_hasta_que_elige_el_invitado', waiting.st === 'buff' && waiting.r === 5, waiting);
  await ev(B, () => { document.querySelectorAll('#buff-cards button.hrel-card')[0].click(); });
  const adv5 = await waitFor(A, () => state === 'playing' && EN.round === 6) && await waitFor(B, () => state === 'playing' && EN.round === 6, null, 15000);
  const fin = await ev(A, () => ({ a: hrelTotal(heroes[0].hrel), b: hrelTotal(heroes[1].hrel), h0: heroes[0].hrel, h1: heroes[1].hrel }));
  check('reliquias.ronda_6_los_dos_con_2_reliquias', adv5 && fin.a === 2 && fin.b === 2, fin);
  check('reliquias.elecciones_distintas_cada_una_en_su_heroe', fin.h0[o5A[1]] === 1 && fin.h1[o5A[0]] === 1 && !fin.h0[o5A[0]] && !fin.h1[o5A[1]], { fin, o5A });
  // fin de la partida: resultados con reliquias y limpieza en los dos
  await ev(A, () => { for (const h of heroes) { h.invulnTimer = 0; h.hp = 0; h.alive = false; } });
  const endA = await waitFor(A, () => state === 'endless', null, 20000), endB = await waitFor(B, () => state === 'endless', null, 20000);
  const txtA = await ev(A, () => document.getElementById('endless-screen').innerText.includes('Reliquias de la Horda'));
  const txtB = await ev(B, () => document.getElementById('endless-screen').innerText.includes('Reliquias de la Horda'));
  check('reliquias.resultados_con_reliquias_en_los_dos', endA && endB && txtA && txtB, { endA, endB, txtA, txtB });
  await ev(A, () => { document.getElementById('en-back-btn').click(); }); await ev(B, () => { document.getElementById('en-back-btn').click(); }); await sleep(800);
  const clean = { a: await ev(A, () => heroes.some(h => h.hrel) || EN.hrelOffer.length), b: await ev(B, () => heroes.some(h => h.hrel) || EN.hrelOffer.length) };
  check('reliquias.se_limpian_al_terminar', !clean.a && !clean.b, clean);
  check('sin_errores_de_pagina', A.errors.length === 0 && B.errors.length === 0, { a: A.errors.slice(0, 2), b: B.errors.slice(0, 2) });
  } catch (e) { console.error(e); fails++; }
  finally { await browser.close(); relay.kill(); await site.close(); }
  console.log(fails ? '\n' + fails + ' FALLAS' : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})();
