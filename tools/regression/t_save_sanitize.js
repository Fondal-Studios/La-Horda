// NORMALIZADOR DEL GUARDADO (js/storage/save-sanitize.js) con Playwright.
//   node tools/regression/t_save_sanitize.js
// Variables: SE_BASE_URL (si ya hay un servidor estático del repo), CHROMIUM_PATH (default /opt/pw-browsers/chromium),
//            PLAYWRIGHT_MODULE (ruta de playwright si no se resuelve con require).
// Sin SE_BASE_URL levanta su propio servidor (python3 http.server) en un puerto libre y mata solo ese PID.
//
// Fixtures (tools/regression/fixtures/*.json): guardados reales generados por el juego de cada commit, jugando con sus
// funciones (grantXP, makeItem, stash...): 0d870dd1 (2026-10-10, sin Libro/derrota por arena/checkpoints), 525ae27a
// (2026-10-17, con el guardián "eren" aún) y af87450f (actual). Un guardado legítimo NO debe producir ningún ajuste.
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path'), fs = require('fs'), net = require('net'), http = require('http'), { spawn } = require('child_process');
const FIX = path.join(__dirname, 'fixtures');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined && !ok ? '  ' + JSON.stringify(x) : '')); if (!ok) fails++; };
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
function ping(url) { return new Promise(res => { const r = http.get(url, x => { x.resume(); res(x.statusCode < 500); }); r.on('error', () => res(false)); r.setTimeout(1500, () => { r.destroy(); res(false); }); }); }

(async () => {
  let srv = null, BASE = process.env.SE_BASE_URL;
  if (!BASE) {
    const port = await freePort(); BASE = `http://127.0.0.1:${port}`;
    srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: path.resolve(__dirname, '..', '..'), stdio: 'ignore' });
    console.log('servidor propio pid', srv.pid, BASE);
    for (let i = 0; i < 50 && !(await ping(BASE + '/index.html')); i++) await sleep(100);
  }
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  try {
    // Abre el juego con `raw` en localStorage (una sola vez por contexto) y, opcionalmente, horda_prefs.
    async function open(raw, prefsRaw) { for (let i = 0; ; i++) { try { return await open1(raw, prefsRaw); } catch (e) { if (i >= 2) throw e; console.log('reintento por', String(e.message).split('\n')[0]); } } }
    async function open1(raw, prefsRaw) {
      const ctx = await browser.newContext({ viewport: { width: 900, height: 500 } });
      await ctx.addInitScript(([r, p]) => { try { if (!sessionStorage.getItem('__seeded')) { sessionStorage.setItem('__seeded', '1'); if (r != null) localStorage.setItem('laHordaSave_v1', r); if (p != null) localStorage.setItem('horda_prefs', p); } } catch (e) {} window.__campaignMode = true; }, [raw, prefsRaw == null ? null : prefsRaw]);
      const page = await ctx.newPage(); const warns = [], errs = [];
      page.on('console', m => { if (/save-sanitize/.test(m.text())) warns.push(m.text()); });
      page.on('pageerror', e => errs.push(e.message));
      await page.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => typeof saveLoadStarted !== 'undefined' && saveLoadStarted && typeof saveSanitize === 'function', null, { timeout: 120000 });
      await sleep(600);
      return { ctx, page, warns, errs };
    }

    // La carga real suma a veces premios de pase/desafíos (questsOnLoad, ~+300 de oro): lo exacto se mide con saveSanitize puro.
    const sanGold = (page, raw) => page.evaluate(r => { const p = JSON.parse(r); saveSanitize(p, { defaults: defaultSave(), arenaKeys: ARENA_ORDER, championKeys: Object.keys(CLASSES) }); return p.gold; }, raw);
    const near = (loaded, want) => Number.isFinite(loaded) && loaded >= want && loaded - want <= 5000;

    // ---------- 1. guardados reales: sin ningún ajuste y sin perder nada ----------
    for (const f of fs.readdirSync(FIX).filter(x => x.endsWith('.json')).sort()) {
      const raw = fs.readFileSync(path.join(FIX, f), 'utf8'), ref = JSON.parse(raw);
      const { ctx, page, warns, errs } = await open(raw);
      const r = await page.evaluate(([rawIn]) => {
        const p = JSON.parse(rawIn), before = JSON.stringify(p);
        const rep = saveSanitize(p, { defaults: defaultSave(), arenaKeys: ARENA_ORDER, championKeys: Object.keys(CLASSES) });
        const loaded = {};
        for (const k in save.champions) { const c = save.champions[k]; loaded[k] = [c.level, c.xp, c.talentPoints, c.unlocked]; }
        return { count: rep.count, changes: rep.changes, same: JSON.stringify(p) === before, gold: save.gold, gems: save.gems, stash: save.stash.length, loaded,
          defeatCount: save.defeatCount, relics: save.relics, failed: saveLoadFailed, noCargo: localStorage.getItem('laHordaSave_v1_noCargo') != null };
      }, [raw]);
      check(`${f}: el normalizador no ajusta nada (guardado legítimo)`, r.count === 0 && r.same, r.changes);
      check(`${f}: la carga no avisó en consola ni falló`, warns.length === 0 && !r.failed && !r.noCargo && errs.length === 0, { warns, errs });
      check(`${f}: oro, gemas, contadores y reliquias intactos`, near(r.gold, ref.gold) && r.gems === ref.gems && r.defeatCount === ref.defeatCount && r.relics.hp === ref.relics.hp && r.relics.dmg === ref.relics.dmg, [r.gold, r.gems, r.defeatCount]);
      const lost = Object.keys(ref.champions).filter(k => r.loaded[k] && ref.champions[k].level !== r.loaded[k][0]);
      check(`${f}: nivel de los guardianes intacto (${Object.keys(ref.champions).length} filas)`, lost.length === 0, lost);
      check(`${f}: inventario completo (${ref.stash.length} objetos)`, r.stash === ref.stash.length, r.stash);
      await ctx.close();
    }

    // ---------- 2. guardado hostil ----------
    const base = JSON.parse(fs.readFileSync(path.join(FIX, 'save_2026-10-19_af87450f.json'), 'utf8'));
    const evil = JSON.parse(JSON.stringify(base));
    evil.gold = 'NaN'; evil.gems = 1; evil.defeatCount = {}; evil.defeatLegacy = [1, 2]; evil.skinVoucher = 1e99; evil.recycleDust = 'x';
    evil.relics = { hp: 'x', dmg: -5, def: 1e99, vel: 2 };
    evil.arenaDefeats = { bosque: 'NaN', fortaleza: { a: 1 }, acuatica: 4 };
    evil.stash = base.stash.slice(0, 3).concat(['x', null, 5, { uid: 'bad1', value: 'NaN', roll: 1 }, { uid: 'bad2', value: 1, roll: 1, level: 'hi' }]);
    evil.champions.tanque.level = '99999'; evil.champions.tanque.xp = -50; evil.champions.mago.talentPoints = 1e99; evil.champions.guerrero.talents = { nodes: 'abc', picks: [1], masteryNodes: 5 };
    evil.champions.soporte.skillMastery = 'oops'; evil.champions.segador.equipment = { arma: { x: 1 } };
    let rawEvil = JSON.stringify(evil);
    // 1e999 -> Infinity al parsear; "__proto__" propio (JSON.parse lo crea como clave propia)
    rawEvil = rawEvil.replace('"gems":1,', '"gems":1e999,').replace('"__x"', '"__x"');
    rawEvil = '{"__proto__":{"polluted":1,"isAdmin":true},"champions_x":{"constructor":{"prototype":{"p2":1}}},' + rawEvil.slice(1);
    rawEvil = rawEvil.replace('"checkpoints":{}', '"checkpoints":{"bosque":{"level":5,"champ":"mago","diff":"x","uses":99,"xp":1e999,"gold":"abc"},"evil":{"level":5,"champ":"mago"},"acuatica":{"level":5,"champ":"noExiste"},"fortaleza":"x"}');
    rawEvil = rawEvil.replace('"codexBook":{', '"codexBook":{"__proto__":{"q":1},"junk":1,').replace('"introAt":0', '"introAt":"zzz"').replace('"frag":{}', '"frag":{"bosque":1,"x":{"a":1},"y":"NaN"}');
    check('el JSON hostil trae los casos esperados', /"gems":1e999/.test(rawEvil) && /checkpoints":\{"bosque"/.test(rawEvil) && /"introAt":"zzz"/.test(rawEvil) && rawEvil.includes('"__proto__"'));
    {
      const { ctx, page, warns, errs } = await open(rawEvil);
      const r = await page.evaluate(() => {
        const c = save.champions;
        return { gold: save.gold, gems: save.gems, dc: save.defeatCount, dl: save.defeatLegacy, vo: save.skinVoucher, rd: save.recycleDust, relics: save.relics,
          ad: save.arenaDefeats, stash: save.stash.map(i => i.uid), lvl: c.tanque.level, xp: c.tanque.xp, tp: c.mago.talentPoints, tal: c.guerrero.talents, sm: c.soporte.skillMastery,
          eq: c.segador.equipment, cp: save.checkpoints, cb: save.codexBook, polluted: ({}).polluted, isAdmin: ({}).isAdmin, p2: ({}).p2,
          saveProto: Object.getPrototypeOf(save) === Object.prototype, savePolluted: save.polluted, failed: saveLoadFailed,
          allFinite: JSON.stringify(save).indexOf('null') >= 0 && !JSON.stringify(save, (k, v) => (typeof v === 'number' && !isFinite(v)) ? '__BAD__' : v).includes('__BAD__') };
      });
      const sg = await sanGold(page, rawEvil);
      check('gold "NaN" -> sin valor (default 0), no string', sg === undefined && near(r.gold, 0), [sg, r.gold]);
      check('gems Infinity -> 0; defeatCount {} -> 0; defeatLegacy lista -> default', r.gems === 0 && r.dc === 0 && typeof r.dl === 'number' && isFinite(r.dl), [r.gems, r.dc, r.dl]);
      check('skinVoucher 1e99 acotado a 1000; recycleDust "x" -> 0', r.vo === 1000 && r.rd === 0, [r.vo, r.rd]);
      check('reliquias: "x"->0, -5->0, 1e99->30, 2 intacto', r.relics.hp === 0 && r.relics.dmg === 0 && r.relics.def === 30 && r.relics.vel === 2, r.relics);
      check('arenaDefeats: solo números válidos', r.ad.acuatica === 4 && (r.ad.bosque | 0) === 0 && (r.ad.fortaleza | 0) === 0, r.ad);
      check('inventario: se quitan los inválidos, se conservan los 3 buenos + el de nivel inválido (level->1)', r.stash.length === 4 && r.stash.slice(0, 3).join() === base.stash.slice(0, 3).map(i => i.uid).join() && r.stash[3] === 'bad2', r.stash);
      check('guardián: level "99999" -> 99, xp -50 -> 0, talentPoints 1e99 -> 10000', r.lvl === 99 && r.xp === 0 && r.tp === 10000, [r.lvl, r.xp, r.tp]);
      check('talentos con tipos inválidos -> objetos vacíos', r.tal && typeof r.tal.nodes === 'object' && Object.keys(r.tal.nodes).length === 0 && !Array.isArray(r.tal.picks) && Object.keys(r.tal.masteryNodes).length === 0, r.tal);
      check('skillMastery inválida -> de fábrica (3 maestrías)', Array.isArray(r.sm) && r.sm.length === 3 && r.sm.every(m => m.useLvl === 1 && m.alloc === 0), r.sm);
      check('equipo con objeto -> ranura vacía', r.eq.arma === null, r.eq);
      check('checkpoints: solo queda el válido, con números finitos y usos acotados', Object.keys(r.cp).join() === 'bosque' && r.cp.bosque.uses === 3 && isFinite(r.cp.bosque.xp) && r.cp.bosque.gold === 0 && r.cp.bosque.diff === 'normal', r.cp);
      check('codexBook: introAt/frag saneados', r.cb && r.cb.introAt === 0 && r.cb.frag.bosque === 1 && !('x' in r.cb.frag) && !('y' in r.cb.frag) && r.cb.q === undefined, r.cb);
      check('sin contaminación de prototipos (Object.prototype, save, constructor.prototype)', r.polluted === undefined && r.isAdmin === undefined && r.p2 === undefined && r.saveProto && r.savePolluted === undefined);
      check('ningún número no finito en el guardado cargado', r.allFinite);
      check('la carga no falló, y avisó por consola (no al jugador)', !r.failed && warns.length >= 1 && warns.every(w => /ajuste/.test(w)) && errs.length === 0, { warns: warns.length, errs });
      // lo escrito de vuelta también es sano y el juego sigue funcionando
      const w = await page.evaluate(() => { persistNow(); const s = JSON.parse(localStorage.getItem('laHordaSave_v1')); return { gold: s.gold, gems: s.gems, ok: typeof grantGold === 'function' && (() => { const g0 = save.gold; grantGold(10); return save.gold === g0 + 10; })() }; });
      check('persistNow escribe un guardado sano y grantGold funciona', near(w.gold, 0) && w.gems === 0 && w.ok, w);
      await ctx.close();
    }

    // ---------- 3. cosas que NO deben ajustarse: oro grande legítimo ----------
    {
      const big = JSON.parse(JSON.stringify(base)); big.gold = 123456789; big.gems = 9999999;
      const { ctx, page, warns } = await open(JSON.stringify(big));
      const r = await page.evaluate(() => [save.gold, save.gems]);
      check('oro 123.456.789 y 9.999.999 gemas (muy por encima de la economía real) se conservan', near(r[0], 123456789) && r[1] === 9999999 && warns.length === 0, r);
      await ctx.close();
      const huge = JSON.parse(JSON.stringify(base)); huge.gold = 5e12;
      const o = await open(JSON.stringify(huge)); const g = await o.page.evaluate(() => save.gold);
      check('oro 5e12 se acota al tope documentado (1e9)', near(g, 1e9) && await sanGold(o.page, JSON.stringify(huge)) === 1e9, g); await o.ctx.close();
      const str = JSON.parse(JSON.stringify(base)); str.gold = '500';
      const s = await open(JSON.stringify(str)); const g2 = await s.page.evaluate(() => save.gold);
      check('oro "500" (texto numérico) se convierte a 500, no se pierde', near(g2, 500) && await sanGold(s.page, JSON.stringify(str)) === 500, g2); await s.ctx.close();
    }

    // ---------- 4. JSON que no es un objeto: no se pisa el guardado ----------
    for (const bad of ['[]', '"hola"', '5', 'null']) {
      const { ctx, page } = await open(bad);
      const r = await page.evaluate(() => ({ failed: saveLoadFailed, kept: localStorage.getItem('laHordaSave_v1'), backup: localStorage.getItem('laHordaSave_v1_noCargo'), gold: save.gold }));
      check(`guardado "${bad}": carga de fábrica, copia en _noCargo y el original no se pisa`, r.failed === true && r.kept === bad && r.backup === bad && r.gold === 0, r);
      await ctx.close();
    }

    // ---------- 5. preferencias (horda_prefs) hostiles ----------
    {
      const prefs = '{"__proto__":{"zz":1},"vibrate":"yes","shake":"<img src=x onerror=alert(1)>","textLg":1,"cvd":["rg"],"atkMode":{"a":1},"ctlSize":1e999,"ctlOp":"80","lefty":true}';
      const { ctx, page, errs } = await open(JSON.stringify(base), prefs);
      const r = await page.evaluate(() => ({ p: Object.assign({}, PREFS), polluted: ({}).zz, keys: Object.keys(PREFS).sort().join() === Object.keys(PREFS_DEFAULT).sort().join() }));
      check('prefs: valores inválidos -> de fábrica; solo lefty:true válido se acepta; sin contaminación',
        r.p.vibrate === true && r.p.shake === 'normal' && r.p.textLg === false && r.p.cvd === 'off' && r.p.atkMode === 'hold' && r.p.ctlSize === 100 && r.p.ctlOp === 100 && r.p.lefty === true && r.polluted === undefined && r.keys && errs.length === 0, r);
      await ctx.close();
    }
  } finally {
    await browser.close();
    if (srv) srv.kill();
  }
  console.log(fails ? `\n${fails} FALLO(S)` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
