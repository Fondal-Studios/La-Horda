'use strict';
const { sleep, launch, VPS, newPage, PROFILE, fs, path } = require('./lib');
const BASE = process.env.BASE, OUTDIR = process.env.OUTDIR; fs.mkdirSync(OUTDIR, { recursive: true });
(async () => { const b = await launch(); const out = {};
 for (const [key, extra] of [['ilkan', ''], ['nigromante', ''], ['cazadora', ''], ['mago', 'zurdo'], ['mago', 'texto-grande'], ['soporte', '']]) {
  const { ctx, page } = await newPage(b, BASE, VPS['844x390']); await page.evaluate(PROFILE);
  await page.evaluate(([k, e]) => { if (e === 'zurdo') { PREFS.lefty = true; prefsApply(); } if (e === 'texto-grande') { PREFS.textLg = true; prefsApply(); } for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; } selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; levelDuration = 1e9; player.energy = 1e4; player.ultCharge = player.ultMax; runLevel = Math.max(runLevel, ULT_MIN_ARENA_LEVEL); player.nigroSouls = 5; updateHUD(); }, [key, extra]);
  await sleep(1800);
  const st = () => page.evaluate(() => { const c = document.getElementById('controls'); const ico = document.querySelector('#btn-basic .ico-img'); return { art: c.getAttribute('data-uf-art'), face: c.getAttribute('data-uf-face'), heroIcon: !!(ico && ico.hasAttribute('data-uf-hero-icon')), cls: player.classKey, ult: document.getElementById('btn-ult').className, basicW: Math.round(document.getElementById('btn-basic').getBoundingClientRect().width), frames: document.querySelectorAll('.uf-frame').length, pact: !!document.getElementById('btn-pact') && !document.getElementById('btn-pact').classList.contains('hidden') }; });
  const r = { antes: await st() }; const name = key + (extra ? '_' + extra : '');
  await page.screenshot({ path: path.join(OUTDIR, `${name}_antes.png`) });
  if (key === 'ilkan' || key === 'nigromante') { await page.keyboard.down('r'); await sleep(200); await page.keyboard.up('r'); await sleep(1500); r.tras_ult = await st(); await page.screenshot({ path: path.join(OUTDIR, `${name}_tras_ult.png`) }); }
  out[name] = r; await ctx.close(); process.stdout.write('.'); }
 fs.writeFileSync(path.join(OUTDIR, 'special.json'), JSON.stringify(out, null, 1)); await b.close(); console.log('\n' + JSON.stringify(out).slice(0, 1500)); })();
