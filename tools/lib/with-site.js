#!/usr/bin/env node
'use strict';
/* Corre una prueba existente (que acepta una URL por entorno) contra un servidor estático propio en un puerto LIBRE,
 * sin tocar la prueba. Sirve para las pruebas que todavía no usan tools/lib/serve.js y asumen un servidor externo
 * (SE_BASE_URL / BASE_URL / ABILITY_BASE_URL), ver docs/quality/ARNES_PRUEBAS.md.
 *
 *   node tools/lib/with-site.js tools/items/t_sets.js [args de la prueba]
 *
 * Define SE_BASE_URL, BASE_URL y ABILITY_BASE_URL (sin barra final) salvo las que ya estén definidas, y devuelve el código de salida
 * de la prueba. Precarga tools/lib/pw-tune.js (tiempos escalables y reintento del goto). WITH_SITE_ENV=NOMBRE1,NOMBRE2 cambia la lista de variables. No funciona con pruebas que fijan su puerto en el código. */
const {spawn} = require('node:child_process'), path = require('node:path'), H = require('./serve');
(async () => {
  const args = process.argv.slice(2).filter(a => a !== '--');
  if (!args.length) { console.error('uso: node tools/lib/with-site.js <prueba.js> [args...]'); process.exit(2); }
  const site = await H.startSite({envUrl: []});
  const env = {...process.env};
  for (const k of (process.env.WITH_SITE_ENV || 'SE_BASE_URL,BASE_URL,ABILITY_BASE_URL').split(',')) if (!env[k]) env[k] = site.url;
  // pw-tune.js: tiempos escalables y goto con reintentos también para pruebas que usan Playwright directamente (WITH_SITE_TUNE=0 lo apaga)
  const tune = process.env.WITH_SITE_TUNE === '0' ? [] : ['--require', path.join(__dirname, 'pw-tune.js')];
  const child = spawn(process.execPath, [...tune, ...args], {stdio: 'inherit', env});
  const stop = sig => () => { child.kill(sig); };
  process.on('SIGTERM', stop('SIGTERM')); process.on('SIGINT', stop('SIGINT'));
  child.on('exit', async (code, sig) => { await site.close(); process.exit(code === null ? (sig ? 128 : 1) : code); });
})().catch(e => { console.error(e); process.exit(1); });
