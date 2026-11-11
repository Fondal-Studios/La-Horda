'use strict';
const fs = require('node:fs');
const path = require('node:path');
const H = require('../lib/serve');
const ROOT = path.resolve(__dirname, '../..');
const CLOSE = path.join(ROOT, 'art-source/entregas/libertador-skins-codex-20261111/cierre-01');
const OUT = path.join(CLOSE, 'gameplay-paired');
fs.mkdirSync(OUT, {recursive: true});

(async () => {
  const site = await H.startSite();
  const browser = await H.launch();
  const rows = [], errors = [];
  try {
    for (const [vp, viewport] of [['desktop', {width: 1280, height: 720}], ['mobile', {width: 844, height: 390}]]) {
      const context = await browser.newContext({viewport, serviceWorkers: 'block'});
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => { let s = 11011; Math.random = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); });
      await page.goto(site.url + '/?lazy=0');
      await page.waitForFunction(() => typeof startRun === 'function' && assetsAllReady());
      await page.evaluate(() => { loop = () => {}; });
      for (const skin of ['libertador_escarcha', 'libertador_ancestral']) {
        await page.evaluate(id => cromaEnsureLoaded(id), skin);
        await page.waitForFunction(id => { const d = skinDefOf(id), key = d?.packs?.libertador; return key && CHAMP_PACK[key]?.ready && !CHAMP_PACK[key]?.failed; }, skin);
        const original = fs.readFileSync(path.join(CLOSE, 'originals', skin, 'atlas.png')).toString('base64');
        for (const arena of ['bosque', 'hielo']) {
          const result = await page.evaluate(({skin, arena}) => {
            const champ = 'libertador';
            netMatch = null; divinaMode = false; lobbyAllies = [];
            save.champions[champ].unlocked = true; save.cromas[skin] = true;
            selectedClass = champ; currentArena = arena; state = 'paused'; cromaEquip(champ, skin); startRun(1);
            document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
            state = 'playing'; enemies = []; spawnTimer = arenaHazardTimer = 1e9;
            for (const [dx, dy] of [[90, 0], [-70, 30], [35, -85]]) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 1e6, maxHp: 1e6, speed: 0, baseSpeed: 0, dmg: 0}); }
            for (const a of allies) { a.x = player.x - 55; a.y = player.y + 25; a.stunTimer = 1e9; }
            Object.assign(player, {fx: 1, fy: 0, moving: true, animT: 260, attackAnim: 0, hurtTimer: 0});
            _arenaTitleUntil = 0; CAM_LEAD_X = CAM_LEAD_Y = 0;
            for (let i = 0; i < 100; i++) update(16);
            render();
            const key = setSkinPackKey(player, champ), pack = CHAMP_PACK[key], canvas = document.getElementById('game');
            return {skin, arena, key, ready: !!pack?.ready, failed: !!pack?.failed, canvas: [canvas.width, canvas.height]};
          }, {skin, arena});
          await page.locator('#game').screenshot({path: path.join(OUT, `${skin}-${arena}-${vp}-candidate.png`)});
          await page.evaluate(async ({skin, original}) => {
            const key = skinDefOf(skin).packs.libertador, pack = CHAMP_PACK[key];
            const image = new Image(); image.src = 'data:image/png;base64,' + original;
            await image.decode(); pack.__candidateAtlas = pack.atlas; pack.atlas = image; render();
          }, {skin, original});
          await page.locator('#game').screenshot({path: path.join(OUT, `${skin}-${arena}-${vp}-original.png`)});
          await page.evaluate(skin => { const pack = CHAMP_PACK[skinDefOf(skin).packs.libertador]; pack.atlas = pack.__candidateAtlas; delete pack.__candidateAtlas; }, skin);
          rows.push({...result, viewport: vp});
        }
      }
      await context.close();
    }
    const pass = !errors.length && rows.length === 8 && rows.every(r => r.ready && !r.failed && r.key.includes(r.skin));
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({status: pass ? 'PASS' : 'FAIL', rows, errors}, null, 2) + '\n');
    console.log(JSON.stringify({status: pass ? 'PASS' : 'FAIL', scenes: rows.length, pairs: 8, errors}, null, 2));
    if (!pass) process.exitCode = 1;
  } finally { await browser.close(); await site.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
