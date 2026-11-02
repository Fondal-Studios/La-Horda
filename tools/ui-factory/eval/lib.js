'use strict';
// Evaluador independiente (Módulo D). Utilidades comunes. No usa nada del productor salvo leer el juego.
const { spawn } = require('node:child_process'), path = require('node:path'), fs = require('node:fs');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
function serve(dir, port) { return spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: dir, stdio: 'ignore' }); }
async function launch() { return chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); }
const VPS = { '844x390': { w: 844, h: 390, mobile: true, dpr: 2 }, '667x375': { w: 667, h: 375, mobile: true, dpr: 2 }, '1280x800': { w: 1280, h: 800, mobile: false, dpr: 1 }, '932x430': { w: 932, h: 430, mobile: true, dpr: 3 }, '800x360': { w: 800, h: 360, mobile: true, dpr: 2 } };
async function newPage(browser, base, vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.mobile, hasTouch: process.env.HASTOUCH !== '0', deviceScaleFactor: opts.dpr || vp.dpr, serviceWorkers: 'block' });
  if (opts.init) await ctx.addInitScript(opts.init);
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text().slice(0, 200)); });
  await page.goto(base + '/index.html' + (opts.query || ''), { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.waitForFunction(() => typeof startRun === 'function' && (() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; })(), null, { timeout: 180000, polling: 50 });
  return { ctx, page, errors };
}
const PROFILE = () => {
  for (const k of ['mago', 'ilkan', 'nigromante']) { const s = save.champions[k]; if (!s) continue; s.unlocked = true; s.level = Math.max(s.level || 1, 5); }
  save.starterChosen = true; save.tut = save.tut || {};
  Object.assign(save.tut, { training: 1, basics: 1, b_move: 1, b_attack: 1, b_skill: 1, goalMission: 1, firstStory: 1, soloIntro: 1 });
  persistNow();
};
async function center(page, sel) {
  return page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    if (!r.width || cs.display === 'none' || cs.visibility === 'hidden' || e.closest('.hidden')) return null; return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, sel);
}
module.exports = { sleep, serve, launch, VPS, newPage, PROFILE, center, fs, path };
