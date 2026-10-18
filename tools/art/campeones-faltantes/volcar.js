#!/usr/bin/env node
'use strict';
// LA HORDA - volcado del estado REAL de arte de campeones (solo lectura, no modifica el juego).
// Abre el juego en Chromium, espera a que carguen todos los atlas (CHAMP_PACK, cromas y skins de set) y escribe un
// JSON con: atlas registrados (archivo, celda, columnas, sets de animacion), kits, skins/cromas, categorias.
// Lo consume tools/art/campeones-faltantes/auditar.py. Uso:
//   python3 -m http.server 8933 --bind 127.0.0.1 &            (elegir un puerto libre; verificar con ps)
//   ART_BASE_URL=http://127.0.0.1:8933 node tools/art/campeones-faltantes/volcar.js [salida.json]
// Playwright: `require('playwright')` o PLAYWRIGHT_MODULE=/ruta/a/playwright ; PLAYWRIGHT_BROWSERS_PATH si hace falta.
const fs = require('node:fs'), path = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../../..');
const BASE = process.env.ART_BASE_URL || 'http://127.0.0.1:8933';
const OUT = process.argv[2] || path.join(ROOT, 'docs/art-brief/manifiestos/atlas_catalogo.json');
(async () => {
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(BASE).hostname)) throw Error('Solo servidor local');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    const errores = []; page.on('pageerror', e => errores.push(e.message));
    await page.goto(BASE + '/index.html');
    await page.waitForFunction(() => typeof CHAMP_PACK !== 'undefined' && typeof assetsAllReady === 'function' && assetsAllReady(), null, { timeout: 120000 });
    await page.evaluate(() => { if (typeof cromaLoadAll === 'function') cromaLoadAll(); for (const id in SET_SKINS) if (typeof skinDefOf === 'function') skinDefOf(id); });
    await page.waitForFunction(() => Object.values(CHAMP_PACK).every(P => P.ready || P.failed), null, { timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const d = await page.evaluate(() => {
      const o = { packs: {}, clases: {}, set_skins: {}, cromas: {}, ascension_skins: {}, grupos: {}, dir_atlas: {}, anim_atlas: {} };
      for (const k in CHAMP_PACK) {
        const P = CHAMP_PACK[k], src = P.atlas && P.atlas.src;
        o.packs[k] = { ready: !!P.ready, failed: !!P.failed, src: !src ? null : src.startsWith('data:') ? 'data:runtime-recolor' : src.replace(location.origin + '/', '').split('?')[0],
          nw: P.atlas && P.atlas.naturalWidth, nh: P.atlas && P.atlas.naturalHeight, fw: P.fw, fh: P.fh, cols: P.cols, refH: P.refH, anchor: P.anchor, fix: P.fix || {}, sets_crudos: P.rawSets || {}, sets_motor: P.sets || {} };
      }
      for (const k in CLASSES) {
        const c = CLASSES[k], m = championMeta(k);
        o.clases[k] = { nombre: c.name, rol: c.roleCategory, habilidades: (c.skills || []).map(s => s.name), definitiva: c.ultimate && c.ultimate.name,
          kinds: (c.skills || []).map(s => s.kind || s.action), kind_def: c.ultimate && (c.ultimate.kind || c.ultimate.action),
          ranged: !!c.ranged, basicRange: c.basicRange, categoria: m.category, estado: m.releaseState, artPending: !!m.artPending,
          skins_codex: typeof codexSkinIds === 'function' ? codexSkinIds(k) : [], cromas_ids: typeof cromaIdsFor === 'function' ? cromaIdsFor(k) : [] };
      }
      const pick = s => ({ champ: s.champ, nombre: s.name, tipo: s.appearanceType || null, rareza: s.rarity || null, preview: s.preview || s.src || null, packs: s.packs || null,
        authored: s.authoredPacks ? Object.fromEntries(Object.entries(s.authoredPacks).map(([k, v]) => [k, v.src])) : null, paleta_runtime: !!s.exPalette, tema: s.visualTheme || null });
      for (const k in SET_SKINS) o.set_skins[k] = pick(SET_SKINS[k]);
      for (const k in CROMA_SKINS) o.cromas[k] = pick(CROMA_SKINS[k]);
      for (const k in ASCENSION_SKINS) o.ascension_skins[k] = ASCENSION_SKINS[k].map(s => ({ id: s.id, nombre: s.name, estado: s.status, pack: s.pack, tema: s.visualTheme }));
      o.grupos = { portadores: Object.keys(PORTADORES), expedicion: Object.keys(EXPEDITION), ascension: Object.keys(ASCENSION) };
      for (const k of ['tanque', 'guerrero']) { const A = DIR_ATLASES[k].animAtlas; o.dir_atlas[k] = Object.fromEntries(Object.entries(A.def.clips).map(([n, c]) => [n, c.frames && c.frames.length])); }
      for (const [k, A] of [['mago', typeof MAGO_ANIM_ATLAS !== 'undefined' && MAGO_ANIM_ATLAS], ['profeta', PROFETA_ANIM_ATLAS]]) if (A) o.anim_atlas[k] = Object.fromEntries(Object.entries(A.def.clips).map(([n, c]) => [n, c.frames && c.frames.length]));
      o.n_clases = Object.keys(CLASSES).length;
      return o;
    });
    d.generado = { servidor: BASE, errores_pagina: errores, nota: 'Volcado de solo lectura del estado cargado; las rutas son relativas a la raiz del repo.' };
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(d));
    console.log(`clases=${d.n_clases} packs=${Object.keys(d.packs).length} fallidos=${Object.values(d.packs).filter(p => p.failed || !p.ready).length} errores=${errores.length} -> ${path.relative(ROOT, OUT)}`);
    if (errores.length) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
