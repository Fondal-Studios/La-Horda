'use strict';
// Evaluador (iteración 8): barrido de los héroes (cara, borde, ícono de Ataque, marcos). BASE LABEL OUTDIR  [HEROES=a,b,c opcional]
const { sleep, launch, VPS, newPage, PROFILE, fs, path } = require('./lib');
const BASE = process.env.BASE, LABEL = process.env.LABEL, OUTDIR = process.env.OUTDIR; fs.mkdirSync(OUTDIR, { recursive: true });
(async () => {
  const browser = await launch(); const { ctx, page, errors } = await newPage(browser, BASE, VPS[process.env.VP || '844x390'], { init: () => { window.__seq = []; } });
  await page.evaluate(PROFILE);
  const keys = process.env.HEROES ? process.env.HEROES.split(',') : await page.evaluate(() => Object.keys(CLASSES));
  const out = { label: LABEL, n: keys.length, heroes: {}, errors: [] };
  await page.evaluate(() => { for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; } });
  for (const key of keys) {
    try {
      await page.evaluate(k => { window.__seq = []; const c = document.getElementById('controls'); window.__t0 = performance.now(); if (window.__mo) window.__mo.disconnect(); window.__mo = new MutationObserver(() => window.__seq.push([Math.round(performance.now() - window.__t0), c.getAttribute('data-uf-art') || '', c.getAttribute('data-uf-face') || '', (document.querySelector('#btn-basic .ico-img') || {}).getAttribute && document.querySelector('#btn-basic .ico-img') && document.querySelector('#btn-basic .ico-img').hasAttribute('data-uf-hero-icon') ? 'ico-hero' : 'ico-generico'])); window.__mo.observe(c, { attributes: true, subtree: true, attributeFilter: ['data-uf-art', 'data-uf-face', 'src', 'data-uf-hero-icon'] });
        selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; levelDuration = 1e9; player.hp = player.maxHp; player.energy = 1e4; updateHUD(); }, key);
      await sleep(1700);
      const r = await page.evaluate(() => { const c = document.getElementById('controls'), cs = getComputedStyle(c); const v = n => cs.getPropertyValue(n).trim(); const css = {}; for (const n of ['--uf-b-act', '--uf-s1-act', '--uf-s2-act', '--uf-s3-act', '--uf-b-p1', '--uf-s1-p1', '--uf-s2-p1', '--uf-s3-p1']) css[n] = v(n);
        const ico = document.querySelector('#btn-basic .ico-img'); const b = document.getElementById('btn-basic'), f = b.querySelector('.uf-frame'); const fr = f ? getComputedStyle(f) : null;
        return { key: player.classKey, art: c.getAttribute('data-uf-art'), face: c.getAttribute('data-uf-face'), atlas: (v('--uf-atlas') || '').slice(-40), css, color: (CLASSES[player.classKey] || {}).color, motif: window.UIFactory && UIFactory.hero ? UIFactory.hero.motifOf(player.classKey) : null, heroIcon: !!(ico && ico.hasAttribute('data-uf-hero-icon')), frameW: fr ? fr.width : null, frameBg: fr ? fr.backgroundImage.slice(-30) : null, seq: window.__seq.slice(0, 12) }; });
      out.heroes[key] = r;
      const clip = await page.evaluate(() => { const r = ['btn-basic','btn-s1','btn-s2','btn-s3','btn-ult'].map(i => document.getElementById(i).getBoundingClientRect()); const x = Math.min(...r.map(b => b.left)) - 30, y = Math.min(...r.map(b => b.top)) - 30; return { x: Math.max(0, x), y: Math.max(0, y), width: Math.min(innerWidth - Math.max(0, x), Math.max(...r.map(b => b.right)) - x + 30), height: Math.min(innerHeight - Math.max(0, y), Math.max(...r.map(b => b.bottom)) - y + 30) }; });
      await page.evaluate(() => { document.getElementById('game').style.visibility = 'hidden'; }); await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_${key}.png`), clip }); await page.evaluate(() => { document.getElementById('game').style.visibility = ''; });
    } catch (e) { out.heroes[key] = { error: String(e).slice(0, 200) }; }
    process.stdout.write('.');
  }
  out.errors = errors.filter(e => !/fondalstudios|CORS|ERR_FAILED/.test(e)).slice(0, 5);
  fs.writeFileSync(path.join(OUTDIR, `${LABEL}_heroes.json`), JSON.stringify(out, null, 1)); await browser.close(); console.log('\nlisto');
})().catch(e => { console.error(e); process.exit(1); });
