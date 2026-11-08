'use strict';
/* SETS (poder) vs APARIENCIAS (identidad): dos sistemas visibles y separados (decisión del dueño).
 *   - pestaña Sets: piezas, progreso y dónde se consiguen (botín/arena/Tienda por oro/Forja), nunca Brasas, sin botones ✦;
 *   - pestaña Apariencias: solo cosméticos con su origen; sin piezas de set ni bonificaciones;
 *   - catálogo único (js/data/cosmetics-catalog.js): ids intactos, origen coherente (cromas = Brasas, nunca "oro");
 *   - NINGÚN cosmético cambia estadísticas (héroe y CLASSES idénticos con cualquier skin/croma/ascensión/efecto equipado);
 *   - las Brasas no compran piezas de set (precio 0 y sin botón) y las apariencias de set tampoco otorgan piezas.
 *   node tools/collection/sets-vs-looks.js   (los tests existentes tools/items/t_skins_brasas.js y tools/quality-five/cosmetics-test.js siguen vigentes) */
const H = require('../lib/serve');
let fails = 0; const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 300))); if (!c) fails++; };
(async () => {
  const site = await H.startSite(), browser = await H.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } }), errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await H.goto(page, site.url + '/index.html');
    await page.waitForFunction(() => typeof openGuardians === 'function' && typeof cosmeticsCatalog === 'function' && typeof computePlayerStats === 'function', null, { timeout: 240000 });
    await page.waitForTimeout(2500);

    // --- catálogo único ---
    const cat = await page.evaluate(() => {
      const c = cosmeticsCatalog(), by = {}; for (const e of c) by[e.source] = (by[e.source] || 0) + 1;
      const ids = new Set(c.map(e => e.id));
      return { n: c.length, by, dup: c.length !== ids.size, bad: cosmeticsContract(),
        cromasAll: Object.keys(CROMA_SKINS).every(id => ids.has(id) && cosmeticEntry(id).source === 'brasas'),
        setSkinsAll: Object.keys(SET_SKINS).filter(id => !SET_SKINS[id].manifest && SET_DB[id]).every(id => ids.has(id) && cosmeticEntry(id).source === 'set'),
        manifests: Object.keys(SET_SKINS).filter(id => SET_SKINS[id].manifest).length, manifestsOk: Object.keys(SET_SKINS).filter(id => SET_SKINS[id].manifest).every(id => cosmeticEntry(id).kind === 'efecto' && cosmeticEntry(id).champ === null),
        oroEnBrasas: c.filter(e => e.source === 'brasas' && /\boro\b|🪙/i.test(e.howTo)).map(e => e.id),
        pieceIdsInCatalog: c.filter(e => Object.keys(DESIGNED_ITEMS).includes(e.id)).map(e => e.id),
        srcs: c.every(e => ['set', 'brasas', 'pase', 'logro', 'ascension'].includes(e.source)) };
    });
    ok(cat.n > 100 && !cat.dup && cat.bad.length === 0 && cat.srcs, 'catálogo único: sin ids repetidos, todo con origen y cómo conseguirlo', cat);
    ok(cat.cromasAll && cat.setSkinsAll && cat.manifests === 15 && cat.manifestsOk, 'cubre todas las cromas (Brasas), skins de set (set) y las 15 manifestaciones (efecto universal)', cat);
    ok(cat.oroEnBrasas.length === 0, 'ningún cosmético de Brasas dice "comprar con oro"', cat.oroEnBrasas);
    ok(cat.pieceIdsInCatalog.length === 0, 'las piezas de set no son cosméticos del catálogo', cat.pieceIdsInCatalog);

    // --- ningún cosmético afecta estadísticas ---
    const stat = await page.evaluate(() => {
      const snap = k => JSON.stringify([computePlayerStats(k), passiveSum(k, 'dmg_mult'), passiveSum(k, 'hp_mult'), passiveSum(k, 'skilldmg_mult'), CLASSES[k], (save.champions[k] || {}).equipment]);
      const bad = []; let n = 0; const ks = [...new Set(cosmeticsCatalog().filter(e => e.champ).map(e => e.champ))];
      for (const k of ks) {
        const rec = save.champions[k], base = snap(k), saved = JSON.stringify(rec);
        for (const e of cosmeticsForChampion(k)) {
          rec.unlocked = true;
          if (e.kind === 'ascension') rec.ascSkin = e.ascIndex;
          else if (e.kind === 'skin' || e.kind === 'croma') { save.cromas = Object.assign({}, save.cromas, { [e.id]: true }); rec.croma = e.id; rec.cosmeticSkin = ''; }
          else { save.cosmeticUnlocks = Object.assign({}, save.cosmeticUnlocks, { [e.id]: true }); rec.cosmeticSkin = e.id; rec.croma = null; }
          n++; if (snap(k) !== base) bad.push(e.id);
        }
        Object.assign(rec, JSON.parse(saved)); // sin dejar rastro
      }
      save.cromas = {}; save.cosmeticUnlocks = {};
      return { champs: ks.length, probados: n, bad };
    });
    ok(stat.probados > 100 && stat.bad.length === 0, `ningún cosmético cambia estadísticas (${stat.probados} apariencias en ${stat.champs} guardianes)`, stat.bad.slice(0, 5));

    // --- Brasas no compran piezas de set ---
    const br = await page.evaluate(() => {
      const piezas = []; for (const id of Object.keys(SET_DB)) piezas.push(...setPieceIds(id));
      return { flag: typeof PIECES_FOR_BRASAS === 'undefined' ? null : PIECES_FOR_BRASAS, n: piezas.length,
        precio: piezas.filter(p => premiumPiecePrice(p) > 0).length, boton: piezas.filter(p => premiumPieceButton(p, 'x')).length,
        regla: premiumRuleText() };
    });
    ok(br.flag === false && br.n > 50 && br.precio === 0 && br.boton === 0, 'PIECES_FOR_BRASAS=false: ninguna pieza de set tiene precio ni botón en Brasas', br);
    ok(/solo compran apariencia/i.test(br.regla), 'la regla pública dice que las Brasas solo compran apariencia', br.regla);

    // --- UI: Sets vs Apariencias ---
    await page.evaluate(() => { codexStack = [{ view: 'list', id: 'campeones', label: 'GUARDIANES' }, { view: 'champ', id: 'mago', label: 'Mago' }]; codexChampTab = 'sets'; setState('codex'); codexRender(true); });
    await page.waitForTimeout(800);
    const tabs = await page.evaluate(() => [...document.querySelectorAll('[data-ctab]')].map(b => b.textContent.trim()));
    ok(tabs.includes('Sets') && tabs.includes('Apariencias'), 'la ficha tiene pestañas Sets y Apariencias separadas', tabs);
    const sets = await page.evaluate(() => { const p = document.querySelector('.cx-panel-head')?.parentElement || document.body; const t = document.body.innerText;
      return { cards: document.querySelectorAll('[data-set-card]').length, donde: /Dónde se consigue/.test(t), piezas: document.querySelectorAll('.cx-set-pieces li').length, bonus: document.querySelectorAll('.cx-set-bonus li').length,
        premium: document.querySelectorAll('[data-skin-premium],[data-piece-premium]').length, sinBrasas: !!document.querySelector('[data-set-no-brasas]'), gx: document.querySelectorAll('.gx-skin').length, ember: /✦\s*\d/.test(t) }; });
    ok(sets.cards >= 1 && sets.donde && sets.piezas >= 4 && sets.bonus >= 2, 'Sets: piezas, progreso, bonificaciones y dónde se consigue', sets);
    ok(sets.premium === 0 && sets.sinBrasas && !sets.ember && sets.gx === 0, 'Sets: sin botones ni precios en Brasas y sin tarjetas de apariencia', sets);
    await page.click('[data-ctab="skins"]'); await page.waitForTimeout(800);
    const looks = await page.evaluate(() => ({ gx: document.querySelectorAll('.gx-skin').length, sets: document.querySelectorAll('[data-set-card],.cx-set-pieces,.cx-set-bonus').length, how: document.querySelectorAll('[data-appearance-how]').length }));
    ok(looks.gx > 1 && looks.sets === 0 && looks.how > 0, 'Apariencias: solo cosméticos con su origen (sin piezas ni bonificaciones de set)', looks);
    ok(errs.length === 0, 'sin errores de página', errs);
  } finally { await browser.close(); await site.close(); }
  console.log(fails ? `\n${fails} FALLA(S)` : '\nTodo en verde'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
