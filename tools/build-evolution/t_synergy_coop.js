// LA HORDA — BUILD EVOLUTION 2.0 en cooperativo (2 clientes reales contra el relay local):
//   el invitado (mago) recibe la decisión de rama, la elige, el anfitrión la aplica y la replica, y la rama actúa.
// (basado en tools/net-test/boons_coop.js)
//   - al superar un nivel, el invitado recibe SUS cartas (armadas con su guardián) con 1-2 refuerzos
//   - elige un refuerzo de habilidad -> el ANFITRIÓN lo aplica a su héroe (y a nadie más)
//   - el refuerzo llega al invitado por el snapshot (tooltip/marca de su botón) y se dispara cuando
//     el invitado lanza esa habilidad (zona/efecto visible en los dos)
// uso: SITE=http://127.0.0.1:8771 RELAY=ws://127.0.0.1:8832 node tools/build-evolution/t_synergy_coop.js
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const SITE = process.env.SITE || 'http://127.0.0.1:8822';
const RELAY = process.env.RELAY || 'ws://127.0.0.1:8832';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 500) : '')); if (!ok) fails++; };
async function client(browser, name, champ) {
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 560 } });
  await ctx.addInitScript(([n]) => { try { if (!localStorage.getItem('__s')) { localStorage.clear(); localStorage.setItem('__s', '1'); localStorage.setItem('horda_name', n); } } catch (e) {} }, [name]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await page.goto(`${SITE}/index.html?server=${encodeURIComponent(RELAY)}`, { waitUntil: 'load', timeout: 240000 });
  for (let k = 0; k < 600; k++) { if (await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; })) break; await sleep(100); }
  const R = require('path').join(__dirname, '../..');
  if (!(await page.evaluate(() => typeof SYN_BRANCHES !== 'undefined'))) { await page.addScriptTag({ path: R + '/js/data/build-synergy.js' }); await page.addScriptTag({ path: R + '/js/systems/build-synergy.js' }); }
  await page.evaluate(() => { for (const k in save.champions) { const m = save.champions[k]; m.skillMastery = [0,1,2].map(() => ({ ...mkMastery(), alloc: 5 })); m.ultMastery = { ...mkMastery(), alloc: 5 }; } });
  await page.evaluate(([c]) => { for (const k in save.champions) save.champions[k].level = 20; save.champions[c].unlocked = true; save.starterChosen = true; save.tut = Object.assign(save.tut || {}, { training: 1 }); selectedClass = c; save.lastChamp = c; save.stash = []; persistNow(); }, [champ]);
  return { ctx, page, errors, name };
}
const ev = (c, fn, a) => c.page.evaluate(fn, a);
async function press(c, sel) { await c.page.evaluate(s => { if (typeof prepSecReveal === 'function') prepSecReveal(s); }, sel).catch(() => {}); await c.page.click(sel); await sleep(450); } // prepSecReveal: pestaña de la Sala que lo contiene
async function waitFor(c, fn, a, ms) { for (let k = 0; k < (ms || 20000)/150; k++) { if (await ev(c, fn, a)) return true; await sleep(150); } return false; }
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const A = await client(browser, 'Ana', 'guerrero');
  await press(A, '#title-continue-btn'); await press(A, '#mainmenu-jugar-btn'); await press(A, '#mode-arena-btn');
  await press(A, '.arena-card[data-arena="ciudad"]'); await press(A, '#start-btn');
  await press(A, '#net-create-btn');
  await waitFor(A, () => !!net.code);
  const code = await ev(A, () => net.code);
  const B = await client(browser, 'Beto', 'mago');
  await press(B, '#title-continue-btn'); await press(B, '#mainmenu-jugar-btn');
  await B.page.fill('#mode-join-code', code); await press(B, '#mode-join-btn');
  await waitFor(B, () => net.role === 'guest' && state === 'prep');
  await ev(B, () => { document.getElementById('net-ready-btn').click(); });
  await sleep(800);
  await ev(A, () => { document.getElementById('prep-start-btn').click(); });
  const both = await waitFor(A, () => state === 'playing', null, 60000) && await waitFor(B, () => state === 'playing', null, 60000);
  check('partida.arranca_para_los_dos', both);
  await sleep(2000);
  await ev(A, () => { for (const h of heroes) h.invulnTimer = 1e9; levelTimer = levelDuration + 1; });
  const gBuff = await waitFor(B, () => state === 'buff' && document.querySelectorAll('#buff-cards .buff-card').length === 3, null, 30000);
  const hBuff = await waitFor(A, () => state === 'buff');
  const gCards = await ev(B, () => [...document.querySelectorAll('#buff-cards .buff-card')].map(c => ({ syn: c.classList.contains('syn-branch'), excl: c.textContent.includes('Excluye'), t: c.textContent.replace(/\s+/g, ' ').trim().slice(0, 110) })));
  const synCards = gCards.filter(c => c.syn);
  check('invitado.recibe_las_dos_ramas_con_requisitos_y_exclusion', gBuff && hBuff && synCards.length === 2 && synCards.every(c => c.excl), gCards);
  const opts = await ev(A, () => { const o = (netMatch && netMatch.buffOpts1) || []; return o.filter(x => x.startsWith('syn:')).map(x => SYN_BY_ID[x.slice(4)]).map(b => ({ id: b.id, champ: b.champ, skill: b.skill, arch: b.arch })); });
  check('ramas_ofrecidas_son_de_SU_guardian_y_de_la_misma_habilidad', opts.length === 2 && opts.every(o => o.champ === 'mago') && opts[0].skill === opts[1].skill && opts[0].arch !== opts[1].arch, opts);
  await ev(A, () => { const c = [...document.querySelectorAll('#buff-cards .buff-card')].find(c => !c.classList.contains('syn-branch')) || document.querySelector('#buff-cards .buff-card'); c.click(); });
  // se elige SIEMPRE Nova Glacial (efecto propio medible: congela 450 ms a lo ya ralentizado; la nova base solo aturde ~110 ms)
  await ev(B, () => { const c = [...document.querySelectorAll('#buff-cards .buff-card.syn-branch')].find(c => (c.querySelector('.buff-name') || {}).textContent === 'Nova Glacial'); (c || document.querySelector('#buff-cards .buff-card.syn-branch')).click(); });
  const resumed = await waitFor(A, () => state === 'playing') && await waitFor(B, () => state === 'playing');
  const hostSide = await ev(A, () => ({ guest: heroes[1].synergy || {}, host: player.synergy || {}, champ: heroes[1].classKey }));
  const gk = Object.keys(hostSide.guest);
  check('anfitrion.aplica_UNA_rama_al_heroe_del_invitado_y_ninguna_al_suyo', resumed && gk.length === 1 && Object.keys(hostSide.host).length === 0 && hostSide.champ === 'mago', hostSide);
  const synced = await waitFor(B, () => Object.keys(player.synergy || {}).length === 1, null, 8000);
  const gHud = await ev(B, () => { updateAbilityButtons(); return { syn: player.synergy, title: [...document.querySelectorAll('.ability-btn')].map(b => b.title).join(' | ').includes('Rama') }; });
  check('invitado.recibe_su_rama_por_el_snapshot_y_la_ve_en_el_boton', synced && gHud.title, gHud);
  const leak = await ev(B, () => Object.keys(player).filter(k => k.indexOf('_syn') === 0));
  check('estado_interno_no_viaja_al_invitado', leak.length === 0, leak);
  // el invitado lanza la habilidad con rama: el anfitrión (que simula) aplica el efecto a enemigos reales
  const key = +gk[0], id = hostSide.guest[gk[0]];
  await ev(A, () => { const g = heroes[1]; g.energy = g.maxEnergy; g.cds = [0,0,0]; for (let i = 0; i < 6; i++){ const e = spawnEnemy('duende_bosque', false); e.x = g.x + 60 + i*25; e.y = g.y + (i%2?20:-20); e.hp = e.maxHp = 1e6; e.speed = 0; e.atkCd = 1e9; e.dmg = 0; } });
  // precondición de la rama: los enemigos ya están ralentizados cuando llega la nova
  await ev(A, () => { for (const e of enemies) if (e.maxHp === 1e6) { e.slowTimer = 6000; e.slowAmt = 0.3; e.stunTimer = 0; } });
  // sonda en el MISMO tick del impacto (sin depender de la velocidad de la máquina ni del sondeo): stun tras cada golpe del invitado
  await ev(A, () => { window.__synProbe = { max: 0, n: new Set() }; const o = skillEvoOnHit; skillEvoOnHit = function (src, e) { const r = o.apply(this, arguments); if (src === heroes[1]) { const st = e.stunTimer || 0; window.__synProbe.max = Math.max(window.__synProbe.max, st); if (st >= 445) window.__synProbe.n.add(enemies.indexOf(e)); } return r; }; });
  await sleep(400);
  await ev(B, ([k]) => { player.cds = [0,0,0]; player.energy = player.maxEnergy; useSkill(k); }, [key]);
  await sleep(1500);
  const probe = await ev(A, () => ({ max: window.__synProbe.max, n: window.__synProbe.n.size }));
  const maxStun = probe.max, stunnedN = probe.n;
  const fx = await ev(A, ([id]) => { const g = heroes[1]; const hit = enemies.filter(e => e.maxHp === 1e6 && e.hp < e.maxHp); return { id, hit: hit.length, castOk: !!g._evo }; }, [id]);
  check('rama_elegida_es_Nova_Glacial', id === 'mg_glacial', id);
  check('invitado_lanza_y_la_rama_ACTUA_en_el_anfitrion_congela_a_lo_ralentizado', fx.hit > 0 && fx.castOk && maxStun >= 445 && stunnedN >= 2, { ...fx, maxStun: Math.round(maxStun), stunnedN });
  if (process.env.SHOT) { await B.page.screenshot({ path: process.env.SHOT }); }
  check('sin_errores', A.errors.length === 0 && B.errors.length === 0, { A: A.errors.slice(0, 3), B: B.errors.slice(0, 3) });
  console.log(`SUMMARY ${fails === 0 ? 'OK' : 'FAIL'} fails=${fails}`);
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
