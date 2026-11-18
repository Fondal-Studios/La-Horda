#!/usr/bin/env node
'use strict';
/* Kit de beta cerrada en el navegador, contra el servidor de cuentas REAL en proceso (server/accounts.js + server/beta-kit.js,
 * almacenamiento en una carpeta temporal; sin red externa):
 *  - sin anuncio del servidor, el botón "Reportar un problema" no aparece;
 *  - con beta.reports, aparece en Opciones y en Pausa; el diálogo abre, valida (vacío, sin cuenta, tope de 1000) y envía;
 *  - el reporte llega con contexto técnico y los últimos errores, y el admin lo lee;
 *  - los errores de JavaScript se mandan agrupados y con tope de 20 por sesión;
 *  - el registro muestra "Código de invitación" solo con la puerta prendida y explica el rechazo en español;
 *  - el diálogo entra en 667x375 y Escape lo cierra.
 *   node tools/beta/report-dialog-browser.js         (levanta su propio servidor estático; o SITE=http://... para usar uno)
 */
const H = require('../lib/serve');
const http = require('node:http'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
process.env.REGISTER_MAX_IP = process.env.REGISTER_MAX_IP || '1000';
const accounts = require('../../server/accounts');
const fail = []; const ok = (c, m, extra) => { if(!c){ fail.push(m); console.log('FAIL ' + m + (extra === undefined ? '' : ' · ' + JSON.stringify(extra).slice(0, 400))); } else console.log('PASS ' + m); };

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'horda-beta-ui-'));
  const app = accounts.create({ dataDir: dir, databaseUrl: '', adminUsers: 'qaadmin', originAllowed: () => true, log: () => {}, beta: { inviteCodes: 'BETA-QA:5', errors: '1' } });
  await app.ready;
  const api = http.createServer((q, s) => app.handle(q, s) || (s.writeHead(404), s.end()));
  await new Promise(r => api.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + api.address().port;
  const call = async (method, url, body, token) => { const r = await fetch(base + url, { method, headers: Object.assign({ 'content-type': 'application/json' }, token ? { authorization: 'Bearer ' + token } : {}), body: body === undefined ? undefined : JSON.stringify(body) }); return { status: r.status, j: await r.json().catch(() => ({})) }; };
  const admin = (await call('POST', '/api/register', { user: 'qaadmin', pass: 'clave-qa-123', inviteCode: 'beta-qa' })).j.token;
  const player = await call('POST', '/api/register', { user: 'tester1', pass: 'clave-qa-123', inviteCode: 'BETA-QA' });
  ok(!!admin && player.status === 201, 'servidor: cuentas creadas con código de invitación');

  const site = process.env.SITE ? { url: process.env.SITE.replace(/\/$/, ''), close: async () => {} } : await H.startSite({ envUrl: [], quiet: true });
  const browser = await H.launch();
  try{
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 640 }, locale: 'es-AR' });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(site.url + '/index.html?lazy=0&api=' + encodeURIComponent(base));
    await page.waitForFunction(() => typeof BetaKit !== 'undefined' && document.getElementById('beta-report-opt') && document.getElementById('beta-report-pause-btn'), null, { timeout: 120000 });
    ok(await page.evaluate(() => document.getElementById('beta-report-opt').hidden && document.getElementById('beta-report-pause-btn').hidden), 'sin anuncio del servidor: el botón de reporte está oculto');
    ok(await page.evaluate(() => getComputedStyle(document.getElementById('beta-report-opt')).display === 'none'), 'oculto de verdad (display:none aunque .opt-row ponga display)');

    // conectar el juego con el servidor de prueba y leer /api/health (como hace el juego publicado)
    await page.evaluate(b => { window.__betaKitTest = true; if(accountApiBase() !== b) throw Error('?api= no tomó el servidor de prueba: ' + accountApiBase()); window.netCapsProbe = async () => {}; acct.warm = null; }, base);
    await page.evaluate(async () => { await accountWarmup(); BetaKit.refresh(); });
    const health = await page.evaluate(() => acct.health && acct.health.beta);
    ok(health && health.invite && health.reports && health.errors, 'health: el juego lee beta {invite, reports, errors}', health);
    ok(await page.evaluate(() => !document.getElementById('beta-report-opt').hidden && !document.getElementById('beta-report-pause-btn').hidden), 'con beta.reports: botón en Opciones y en Pausa');

    // abrir desde Opciones
    await page.evaluate(() => document.getElementById('hub-options').classList.remove('hidden'));
    await page.click('#beta-report-opt-btn');
    await page.waitForSelector('#beta-report[role=dialog]');
    ok(await page.evaluate(() => document.activeElement && document.activeElement.id === 'beta-report-text'), 'el diálogo abre con el foco en el texto');
    ok(await page.evaluate(() => [...document.querySelectorAll('#beta-report-category option')].map(o => o.value).join() === 'bug,balance,idea,otro'), 'categorías: bug, balance, idea, otro');
    await page.click('#beta-report-send');
    ok(/Contá qué pasó/.test(await page.textContent('#beta-report [data-status]')), 'validación: texto vacío');
    await page.fill('#beta-report-text', 'El jefe del bosque no aparece');
    await page.click('#beta-report-send');
    ok(/Entrá a tu cuenta/.test(await page.textContent('#beta-report [data-status]')), 'validación: con la puerta prendida pide cuenta');
    ok(await page.getAttribute('#beta-report-text', 'maxlength') === '1000', 'tope de 1000 caracteres en el campo');
    await page.evaluate(() => { const t = document.getElementById('beta-report-text'); t.value = 'x'.repeat(1001); t.dispatchEvent(new Event('input')); });
    await page.evaluate((s) => { acct.session = { token: s.token, user: 'tester1', name: 'tester1', apiBase: accountApiBase() }; }, player.j);
    await page.click('#beta-report-send');
    ok(/hasta 1000 caracteres/.test(await page.textContent('#beta-report [data-status]')) && /1001\/1000/.test(await page.textContent('#beta-report [data-count]')), 'validación: más de 1000 caracteres');

    // un error real del juego, para que viaje en el contexto del reporte y en los errores automáticos
    await page.evaluate(() => { setTimeout(() => { throw new Error('qa-boom beta'); }, 0); });
    await page.waitForFunction(() => BetaKit.state().recent.some(e => e.includes('qa-boom')));
    await page.fill('#beta-report-text', 'El jefe del bosque no aparece después de la ronda 9. Mi correo es nadie@ejemplo.com');
    await page.selectOption('#beta-report-category', 'balance');
    await page.click('#beta-report-send');
    await page.waitForFunction(() => /Gracias/.test(document.querySelector('#beta-report [data-status]')?.textContent || ''), null, { timeout: 15000 });
    ok(true, 'envío: "¡Gracias! Recibimos tu reporte."');
    await page.waitForSelector('#beta-report', { state: 'detached', timeout: 5000 });
    ok(true, 'el diálogo se cierra solo después de enviar');
    const reps = (await call('GET', '/api/gm/beta/reports', undefined, admin)).j.reports || [];
    const r0 = reps[0] || {};
    ok(reps.length === 1 && r0.category === 'balance' && r0.user === 'tester1', 'admin: el reporte llegó con su cuenta', reps);
    ok(r0.text && r0.text.includes('[correo]') && !r0.text.includes('nadie@ejemplo.com'), 'admin: el correo escrito en el texto se tapa');
    const c = r0.context || {};
    ok(/^\d+x\d+@/.test(c.viewport || '') && c.build && c.ua && typeof c.level === 'number' && c.state, 'contexto: build, estado, nivel, pantalla y navegador', c);
    ok((c.errors || []).some(e => e.includes('qa-boom')) && !(c.errors || []).some(e => /127\.0\.0\.1|https?:/.test(e)), 'contexto: últimos errores, sin URL completa', c.errors);

    // errores automáticos: agrupados y con tope de 20 por sesión
    await page.evaluate(() => { for(let i = 0; i < 3; i++) BetaKit.record('qa-repetido', location.origin + '/js/core/x.js?v=1', 10, 2); for(let i = 0; i < 40; i++) BetaKit.record('qa-distinto ' + i, '', 1, 1); });
    for(let i = 0; i < 4; i++) await page.evaluate(() => BetaKit.flush());
    const st = await page.evaluate(() => BetaKit.state());
    ok(st.sentCount === 20, 'errores: tope de 20 envíos por sesión', st);
    const errsSrv = (await call('GET', '/api/gm/beta/errors?limit=500', undefined, admin)).j.errors || [];
    const boom = errsSrv.find(e => e.message.includes('qa-boom')), rep = errsSrv.find(e => e.message === 'qa-repetido');
    ok(errsSrv.length === 20 && !!boom, 'errores: 20 firmas en el servidor, incluido el error real', errsSrv.length);
    ok(rep && rep.count === 3 && rep.src === 'js/core/x.js' && rep.line === 10, 'errores: repetidos agrupados con contador y ruta sin dominio', rep);

    // Escape y tamaño en pantalla chica (pausa)
    await page.setViewportSize({ width: 667, height: 375 });
    await page.evaluate(() => { document.getElementById('hub-options').classList.add('hidden'); window.__escToGame = 0; window.addEventListener('keydown', e => { if(e.key === 'Escape' || e.key === 'w') window.__escToGame++; }); BetaKit.open(); });
    await page.keyboard.type('wasd');
    const box = await page.locator('#beta-report').boundingBox();
    ok(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= 668 && box.y + box.height <= 376, 'el diálogo entra en 667x375', box);
    await page.keyboard.press('Escape');
    await page.waitForSelector('#beta-report', { state: 'detached', timeout: 5000 });
    ok(await page.evaluate(() => window.__escToGame === 0), 'Escape cierra el diálogo y ni Escape ni las teclas escritas llegan al juego (no despausa)');

    // registro: campo de invitación visible solo con la puerta prendida y error en español
    await page.setViewportSize({ width: 1100, height: 640 });
    await page.evaluate(() => { acct.session = null; accountOpen(); });
    await page.evaluate(() => document.querySelector('[data-acc-tab=register]').click());
    await page.waitForSelector('#acc-invite', { state: 'attached' });
    await page.waitForFunction(() => !document.querySelector('.acc-invite').hidden, null, { timeout: 15000 });
    ok(true, 'registro: aparece "Código de invitación"');
    await page.fill('#acc-user', 'tester2'); await page.fill('#acc-pass', 'clave-qa-123'); await page.fill('#acc-pass2', 'clave-qa-123'); await page.fill('#acc-invite', 'NO-ES'); await page.check('#legal-consent-cb');
    await page.click('#acc-submit');
    await page.waitForFunction(() => /no es válido/.test(document.querySelector('.acc-status')?.textContent || ''), null, { timeout: 15000 }).catch(async e => { console.log('estado:', await page.evaluate(() => document.querySelector('.acc-status')?.textContent + ' | ' + document.querySelector('#account-screen,.acc-body')?.innerText?.slice(0, 600))); throw e; });
    ok(await page.evaluate(() => document.activeElement && document.activeElement.id === 'acc-invite'), 'registro: código inválido, mensaje claro y foco en el código');
    await page.fill('#acc-invite', '  beta-qa ');
    await page.click('#acc-submit');
    await page.waitForFunction(() => acct.session && acct.session.user === 'tester2', null, { timeout: 30000 });
    ok(true, 'registro: con el código correcto se crea la cuenta');
    const unexpected = errs.filter(e => !/qa-boom/.test(e));
    ok(unexpected.length === 0, 'sin errores de página inesperados', unexpected);
  }finally{
    await browser.close(); await site.close();
    await new Promise(r => api.close(r)); await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
  console.log(fail.length ? `\nFALLA ${fail.length}` : '\nPASS beta-kit navegador: botón oculto por defecto, diálogo, validación, envío, contexto, errores agrupados, invitación');
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e && e.stack || e); process.exit(1); });
