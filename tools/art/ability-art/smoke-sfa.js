'use strict';
/* Prueba de humo del Arquitecto para skill-fx-a: cada (tipo|tema|tamaño) reemplazado se hornea sin excepciones en las 13 arenas
   y en las variantes de tema (~h ~p ~k), con alfa 0/255, 12 cuadros como el motor, sin consumir Math.random, y ?ua=0 vuelve al arte del motor.
   Uso: BASE_URL=... node smoke-sfa.js <ficha sfa_*> <ids> */
const fs = require('fs'), path = require('path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const guardian = process.argv[2], ids = (process.argv[3] || '').split(',').filter(Boolean);
const spec = JSON.parse(fs.readFileSync(guardian.endsWith('.json') && fs.existsSync(guardian) ? guardian : path.join(__dirname, 'specs', guardian + '.json'), 'utf8'));
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8750/';
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const fails = [], errors = [];
  for (const flag of ['', '?ua=0']) {
    const page = await browser.newPage({viewport: {width: 844, height: 390}});
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE + flag, {waitUntil: 'domcontentloaded', timeout: 120000});
    await page.waitForFunction(() => typeof ABS !== 'undefined' && typeof sfaBake === 'function', null, {timeout: 120000});
    await page.waitForTimeout(1200);
    const r = await page.evaluate(([abs, ids, off]) => {
      const out = {bad: [], n: 0}; const oRand = Math.random; let rnd = 0; Math.random = () => { rnd++; return .5; };
      for (const ab of abs.filter(a => ids.includes(a.id))) {
        const {art, theme, size} = ab.sfa;
        // muestreo: todas las piezas en 5 arenas con el tema y su variante ~h; las 13 arenas y las 4 variantes completas, en la primera pieza de cada tema
        const full = !window.__smokeSeen; window.__smokeSeen = window.__smokeSeen || {}; const firstOfTheme = !window.__smokeSeen[theme]; window.__smokeSeen[theme] = true;
        const arenasAll = Object.keys(AID_INLAY_PALETTES).concat(['']), arenasMin = ['', 'bosque', 'hielo', 'abismo', 'infernal'];
        for (const th of (firstOfTheme ? [theme, theme + '~h', theme + '~p', theme + '~k'] : [theme, theme + '~h'])) for (const ak of (firstOfTheme ? arenasAll : arenasMin))
          try {
            currentArena = ak; sfaCache.clear(); const h0 = ABS.hits; sfaBake(art, th, size); const b = sfaBake(art, th, size);
            if (!b || b.n !== (art === 'zone' ? 8 : 12) || b.w !== size || b.h !== size) { out.bad.push(`${art}|${th}|${size}: tira inválida ${b && b.n}`); continue; }
            if (off && ABS.hits !== h0) out.bad.push(`${art}|${th}|${size}: ?ua=0 no debe usar el arte nuevo`);
            if (!off && ABS.hits === h0) out.bad.push(`${art}|${th}|${size}: no usó el arte nuevo`);
            const d = b.cv.getContext('2d').getImageData(0, 0, b.cv.width, b.cv.height).data; for (let i = 3; i < d.length; i += 4) if (d[i] !== 0 && d[i] !== 255) { out.bad.push(`${art}|${th}|${size}: alfa ${d[i]}`); break; }
            out.n++;
          } catch (e) { out.bad.push(`${art}|${th}|${size} ${ak}: ${e.message}`); }
        // otro tamaño no pintado debe seguir con el arte del motor
        sfaCache.clear(); const h1 = ABS.hits; sfaBake(art, theme, 100); if (ABS.hits !== h1) out.bad.push('un tamaño sin capa (100) no debe reemplazarse');
      }
      Math.random = oRand; out.rnd = rnd; return out;
    }, [spec.abilities, ids, flag === '?ua=0']);
    if (r.rnd) r.bad.push('consumió Math.random ' + r.rnd + ' veces');
    r.bad.slice(0, 10).forEach(b => fails.push((flag || 'ua') + ' ' + b));
    console.log((flag || '?ua=1') + ': ' + r.n + ' hornos, ' + r.bad.length + ' fallos');
    await page.close();
  }
  await browser.close();
  if (errors.length) fails.push('errores de página: ' + errors.slice(0, 3).join(' | '));
  if (fails.length) { console.error(fails.join('\n')); process.exit(1); }
  console.log('SMOKE OK ' + guardian + ': ' + ids.join(','));
})().catch(e => { console.error(e); process.exit(1); });
