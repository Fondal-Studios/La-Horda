'use strict';
/* Preload (node --require) que afina Playwright en pruebas que NO usan tools/lib/serve.js: sus páginas escalan los tiempos con
 * TEST_TIMEOUT_MS / TEST_TIMEOUT_SCALE, el goto se reintenta (conexión rechazada, timeout bajo carga) y el tiempo de navegación
 * por omisión sube de 30 s a 120 s. No cambia ninguna aserción de las pruebas. Lo activa tools/lib/with-site.js.
 *   node --require ./tools/lib/pw-tune.js tools/items/t_sets.js */
const Module = require('node:module'), fs = require('node:fs'), H = require('./serve');
const load = Module._load, seen = new WeakSet();
Module._load = function (request, parent, isMain) {
  const m = load.apply(this, arguments);
  if (request === 'playwright' || /[\\/]playwright(-core)?([\\/]index(\.js)?)?$/.test(request)) {
    for (const k of ['chromium', 'firefox', 'webkit']) {
      const bt = m && m[k]; if (!bt || seen.has(bt) || typeof bt.launch !== 'function') continue;
      seen.add(bt);
      const launch = bt.launch.bind(bt);
      bt.launch = async (opts = {}) => {
        // 83 pruebas escriben executablePath: CHROMIUM_PATH || '/opt/pw-browsers/chromium'. Fuera de este entorno (p. ej. un runner de GitHub) esa ruta no existe y la prueba
        // moría al lanzar el navegador (t_save_sanitize en qa-regresion.yml). Si la ruta pedida no existe, se usa el Chromium localizado (H.chromiumPath) o el de Playwright.
        if (k === 'chromium' && opts.executablePath && !fs.existsSync(opts.executablePath)) { const { executablePath, ...rest } = opts; opts = rest; }
        return H.tuneBrowser(await launch(k === 'chromium' && !opts.executablePath && H.chromiumPath() ? {...opts, executablePath: H.chromiumPath()} : opts));
      };
    }
  }
  return m;
};
