'use strict';
/* Capturas de la UI (título, hub, paneles, sala) con perfil recurrente. Uso: UI=new|old W=844 H=390 node tools/ui-rework/shots.js <carpeta> */
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs'), path = require('path');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8750/', UI = process.env.UI || 'new', W = +(process.env.W || 844), H = +(process.env.H || 390), OUT = process.argv[2] || '/tmp/claude-0/ui_new';
(async () => {
  fs.mkdirSync(OUT, {recursive: true});
  const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const p = await b.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 1});
  p.on('pageerror', e => console.log('pageerror', e.message, (e.stack||'').split('\n').slice(0,4).join(' | ')));
  await p.goto(BASE + '?ui=' + UI, {waitUntil: 'domcontentloaded', timeout: 120000});
  await p.waitForFunction(() => typeof save !== 'undefined' && typeof setState === 'function' && !/cargando/i.test(document.getElementById('title-continue-btn').innerText), null, {timeout: 120000});
  await p.evaluate(() => { save.starterChosen = true; save.firstRun = null; window.needsStarterChampion = () => false; window.needsStarterSkin = () => false; HordaOnboarding.ready = () => true; window.accountGate = () => false; });
  const shot = async n => { await p.waitForTimeout(700); await p.screenshot({path: path.join(OUT, `${n}.png`)}); };
  await shot('1_title');
  await p.click('#ur-info-btn').catch(() => {}); await shot('2_title_info'); await p.keyboard.press('Escape');
  await p.click('#title-continue-btn'); await p.waitForTimeout(1200); await shot('3_home');
  await p.click('#ur-modes-btn').catch(() => {}); await shot('4_modes'); await p.keyboard.press('Escape');
  await p.click('#ur-more-btn').catch(() => {}); await shot('5_more'); await p.keyboard.press('Escape');
  await p.evaluate(() => { setState('prep'); if (typeof renderPrepSummary === 'function') renderPrepSummary(); }); await shot('6_lobby');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
