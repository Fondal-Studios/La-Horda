'use strict';
/* PROBADOR LIBRE (Códice → guardián → Apariencias). Con guardado VACÍO y un guardián BLOQUEADO:
 *   - ninguna pestaña lo expulsa a la Ficha ni muestra el aviso "está bloqueado";
 *   - openGuardians('skins') abre la vista del guardián aunque no esté desbloqueado;
 *   - Apariencias muestra TODO el catálogo del guardián (skins, cromas, set, efectos) con vista previa pintada;
 *   - cada tarjeta tiene "CÓMO CONSEGUIRLA" (origen) y, si el guardián no es tuyo, "Desbloqueá a X primero";
 *   - probar NO equipa nada ni escribe en el guardado (save.champions intacto);
 *   - los efectos (manifestaciones) no son skins con sprite prestado: se rotulan "Efecto de habilidades" y su prueba lanza la habilidad teñida.
 *   node tools/collection/free-tryon.js */
const H = require('../lib/serve');
let fails = 0; const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 300))); if (!c) fails++; };
(async () => {
  const site = await H.startSite(), browser = await H.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } }), errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await H.goto(page, site.url + '/index.html');
    await page.waitForFunction(() => typeof openGuardians === 'function' && typeof codexRender === 'function' && typeof save !== 'undefined', null, { timeout: 240000 });
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    await page.waitForTimeout(2500);
    const before = await page.evaluate(() => ({ k: DEFAULT_CHAMPION, own: !!save.champions[DEFAULT_CHAMPION].unlocked, champs: JSON.stringify(save.champions) }));
    ok(!before.own, 'guardado vacío: el guardián por defecto está bloqueado (' + before.k + ')');

    // hub → Apariencias con el seleccionado bloqueado
    const hub = await page.evaluate(() => { openGuardians('skins'); const top = codexStack[codexStack.length - 1]; return { view: top.view, id: top.id, tab: codexChampTab, state: state }; });
    ok(hub.view === 'champ' && hub.tab === 'skins' && hub.state === 'codex', 'openGuardians("skins") abre la vista del guardián bloqueado', hub);
    await page.waitForTimeout(1500);

    // ninguna pestaña expulsa a la Ficha
    for (const tab of ['ficha', 'equipo', 'talentos', 'habilidades', 'skins']) {
      await page.click(`[data-ctab="${tab}"]`); await page.waitForTimeout(150);
      const r = await page.evaluate(() => ({ tab: codexChampTab, locked: !!document.querySelector('.cx-sec')?.textContent.includes('bloqueado'), toast: /bloqueado: desbloquealo/.test(document.body.innerText) }));
      ok(r.tab === tab && !r.toast, `pestaña ${tab} abre sin toast de bloqueo`, r);
    }
    await page.click('[data-ctab="equipo"]'); await page.waitForTimeout(150);
    ok(await page.evaluate(() => /Guardián bloqueado/.test(document.querySelector('.cx-panel, .cx-entry')?.innerText || document.body.innerText)), 'Equipo de un guardián bloqueado explica por qué (no se esconde)');
    await page.click('[data-ctab="skins"]'); await page.waitForTimeout(2500);

    // catálogo completo con vistas pintadas
    const cat = await page.evaluate(() => {
      const k = codexStack[codexStack.length - 1].id, want = cosmeticsForChampion(k).map(e => e.id);
      const have = [...document.querySelectorAll('.gx-skin[data-skin-pv]')].map(c => c.dataset.skinPv).filter(Boolean);
      const painted = c => { const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true; return false; };
      const cvs = [...document.querySelectorAll('.gx-skin canvas.gx-skin-anim')];
      return { k, want: want.length, haveAll: want.every(id => have.includes(id)), canvases: cvs.length, paintedN: cvs.filter(painted).length, how: [...document.querySelectorAll('.gx-skin button')].filter(b => /cómo conseguirla/i.test(b.textContent)).length,
        cards: document.querySelectorAll('.gx-skin').length, banner: !!document.querySelector('[data-try-banner]'), useBtns: document.querySelectorAll('[data-skin-use],[data-croma-use],[data-asc-use],[data-appearance-original]').length,
        stage: painted(document.querySelector('.cx-stage-pv')), contract: cosmeticsContract() };
    });
    ok(cat.haveAll && cat.want > 0, 'Apariencias muestra todo el catálogo del guardián', cat);
    ok(cat.canvases >= 1 && cat.paintedN >= 1, '≥1 tarjeta con canvas pintado', cat);
    ok(cat.how === cat.cards - 1 && cat.how > 0, 'cada apariencia del catálogo (menos la base, que siempre se tiene) tiene "CÓMO CONSEGUIRLA"', cat);
    ok(cat.banner && cat.useBtns === 0, 'guardián bloqueado: aviso de prueba y ningún botón USAR', cat);
    ok(cat.contract.length === 0, 'el catálogo no trae campos de poder y todo tiene origen y cómo conseguirlo', cat.contract);

    // CÓMO CONSEGUIRLA → origen + "Desbloqueá a X primero"
    const sel = '.gx-skin[data-skin-pv]:not([data-skin-pv=""]):not([data-appearance-kind="efecto"]) [data-appearance-how]';
    await page.locator(sel).first().click(); await page.waitForTimeout(200);
    const how = await page.evaluate(() => { const h = document.querySelector('.cx-how'); return h ? { txt: h.innerText, lock: /Desbloqueá a/.test(h.innerText) && /primero/.test(h.innerText) } : null; });
    ok(how && how.lock && /conseguirla/i.test(how.txt), '"Cómo conseguirla" muestra origen y "Desbloqueá a X primero"', how);

    // PROBAR: cambia solo la vista
    const prev = await page.evaluate(() => {
      const k = codexStack[codexStack.length - 1].id, cv = document.querySelector('.cx-stage-pv'), id = cosmeticsForChampion(k).find(e => e.kind !== 'efecto' && e.kind !== 'ascension').id;
      document.querySelector(`[data-appearance-preview="${id}"]`).click();
      const p = CODEX_PV.get(cv); return { id, skin: p && p.spec.skin };
    });
    ok(prev.skin === prev.id, 'PROBAR APARIENCIA cambia la vista previa a la skin elegida', prev);
    await page.waitForTimeout(600);
    ok(await page.evaluate(() => { const c = document.querySelector('.cx-stage-pv'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true; return false; }), 'la vista grande sigue pintada con la skin de prueba');

    // efectos: honestos y con algo visible
    const fx = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.gx-skin[data-appearance-kind="efecto"]')], k = codexStack[codexStack.length - 1].id;
      const e = cosmeticsForChampion(k).find(x => x.kind === 'efecto');
      document.querySelector(`[data-appearance-preview="${e.id}"]`).click();
      const p = CODEX_PV.get(document.querySelector('.cx-stage-pv'));
      return { n: cards.length, noCanvas: cards.every(c => !c.querySelector('canvas')), label: cards.every(c => /Efecto de habilidades/.test(c.innerText)), anim: p.spec.anim, color: p.spec.skill && p.spec.skill.color, tint: e.tintRgb, skin: p.spec.skin };
    });
    ok(fx.n >= 15 && fx.noCanvas && fx.label, 'las 15 manifestaciones se rotulan "Efecto de habilidades" y no usan sprite prestado', fx);
    ok(fx.anim === 'skill' && fx.color === fx.tint && fx.skin === null, 'VER EFECTO lanza la habilidad con el color del efecto', fx);

    // nada se escribió
    const after = await page.evaluate(() => ({ champs: JSON.stringify(save.champions), cosm: JSON.stringify(save.cosmeticUnlocks || {}), cromas: JSON.stringify(save.cromas || {}) }));
    ok(after.champs === before.champs && after.cosm === '{}' && after.cromas === '{}', 'probar no cambia equipo, skin ni croma (save.champions idéntico)');
    ok(errs.length === 0, 'sin errores de página', errs);
  } finally { await browser.close(); await site.close(); }
  console.log(fails ? `\n${fails} FALLA(S)` : '\nTodo en verde'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
