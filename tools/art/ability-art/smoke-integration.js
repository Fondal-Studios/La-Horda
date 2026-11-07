'use strict';
/* Prueba de humo del Arquitecto en el motor real: con ?ua=1 (por defecto) cada decal/rayo reemplazado
   (1) existe y se hornea sin excepciones a varios radios y en las 13 arenas, (2) tiene alfa 0/255,
   (3) conserva nº de cuadros y tamaño de baldosa, (4) la partida simulada no cambia (no consume Math.random),
   (5) ?ua=0 devuelve el arte anterior. Uso: BASE_URL=... node smoke-integration.js <guardian> <ids,separados> */
const fs = require('fs'), path = require('path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const guardian = process.argv[2], ids = (process.argv[3] || '').split(',').filter(Boolean);
const spec = JSON.parse(fs.readFileSync(path.join(__dirname, 'specs', guardian + '.json'), 'utf8'));
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8750/';
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const fails = [], errors = [];
  for (const flag of ['', '?ua=0']) {
    const page = await browser.newPage({viewport: {width: 844, height: 390}});
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE + flag, {waitUntil: 'domcontentloaded', timeout: 120000});
    await page.waitForFunction(() => typeof KVB !== 'undefined' && typeof ABA !== 'undefined' && typeof kvbDecalFrames === 'function', null, {timeout: 120000});
    await page.waitForTimeout(1200);
    const r = await page.evaluate(([specAbs, ids, off]) => {
      const out = {bad: [], n: 0}; const oRand = Math.random; let rnd = 0; Math.random = () => { rnd++; return .5; };
      for (const ab of specAbs.filter(a => ids.includes(a.id))) {
        const name = ab.replaces, beam = ab.kind === 'beam', replaced = !!ABA.done[name];
        if (off && replaced) out.bad.push(name + ': ?ua=0 no debe reemplazar');
        if (!off && !replaced) out.bad.push(name + ': no se reemplazó');
        const arenas = Object.keys(AID_INLAY_PALETTES).concat(['']), radii = beam ? [0] : [60, 150, 235, 400];
        for (const R of radii) for (const ak of arenas) {
          try {
            currentArena = ak; for (const k of Object.keys(KVB_CACHE)) delete KVB_CACHE[k];
            const fr = beam ? kvbBeamFrames(name) : kvbDecalFrames(name, kvbS(R || 100));
            const nExp = beam ? (ABA.orig[name] || KVB_BEAM[name]).N : (ABA.orig[name] || KVB_DEC[name]).N;
            if (!fr || fr.length !== nExp) out.bad.push(name + ': cuadros ' + (fr && fr.length) + ' ≠ ' + nExp);
            for (const c of fr || []) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i] !== 0 && d[i] !== 255){ out.bad.push(name + ': alfa ' + d[i]); break; } }
            out.n++;
          } catch (e) { out.bad.push(name + ' R' + R + ' ' + ak + ': ' + e.message); }
        }
      }
      Math.random = oRand; out.rnd = rnd; return out;
    }, [spec.abilities, ids, flag === '?ua=0']);
    if (r.rnd) r.bad.push('consumió Math.random ' + r.rnd + ' veces');
    r.bad.slice(0, 12).forEach(b => fails.push((flag || 'ua') + ' ' + b));
    console.log((flag || '?ua=1') + ': ' + r.n + ' hornos, ' + r.bad.length + ' fallos');
    await page.close();
  }
  await browser.close();
  if (errors.length) fails.push('errores de página: ' + errors.slice(0, 3).join(' | '));
  if (fails.length) { console.error(fails.join('\n')); process.exit(1); }
  console.log('SMOKE OK ' + guardian + ': ' + ids.join(','));
})().catch(e => { console.error(e); process.exit(1); });
