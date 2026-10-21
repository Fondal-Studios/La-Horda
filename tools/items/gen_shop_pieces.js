// Genera (o con --check verifica) server/shop-pieces.json: las piezas de set que vende la Tienda y el "pozo" de la rotación diaria,
// leídos de la tienda REAL del cliente (shopCatalog). El servidor (server/wallet.js, /api/wallet/buy-piece) usa este archivo para
// saber qué piezas existen, a qué set pertenecen y cuáles salen hoy en modo "live". Si cambia el catálogo de piezas o legendarios,
// regenerarlo:  (python3 -m http.server 8771 &) ; SE_BASE_URL=http://127.0.0.1:8771 node tools/items/gen_shop_pieces.js
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs'), path = require('path');
const BASE = process.env.SE_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:8771';
const FILE = path.join(__dirname, '../../server/shop-pieces.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ['--no-sandbox'] });
  const page = await (await browser.newContext()).newPage();
  await page.addInitScript(() => { window.__campaignMode = true; });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 180000 });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => typeof shopCatalog === 'function' && typeof DESIGNED_ITEMS !== 'undefined')) break; await sleep(100); }
  const data = await page.evaluate(() => {
    const pieces = {}, sets = {};
    const set = shopCatalog().filter(e => e.kind === 'designed' && e.cat === 'set').sort((a, b) => a.key < b.key ? -1 : 1);
    for (const e of set) { const d = DESIGNED_ITEMS[e.id]; pieces[e.id] = { set: d.set, type: d.type, rarity: d.rarity, champion: d.champion || null, name: d.name }; }
    for (const sid of Object.keys(SET_DB)) sets[sid] = setPieceIds(sid);
    const pool = shopRotationPoolEntries().map(e => ({ key: e.key, cat: e.cat, group: e.cat === 'legendario' ? '' : ((DESIGNED_ITEMS[e.id] && DESIGNED_ITEMS[e.id].set) || e.id) }));
    return { pieces, sets, pool };
  });
  await browser.close();
  const out = { _comment: 'GENERADO por tools/items/gen_shop_pieces.js desde la tienda del cliente. No editar a mano.', version: 1, ...data };
  const text = JSON.stringify(out, null, 1) + '\n';
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8') : '';
    if (cur !== text) { console.error('server/shop-pieces.json está desactualizado: regenerar con tools/items/gen_shop_pieces.js'); process.exit(1); }
    console.log('shop-pieces.json al día:', Object.keys(out.pieces).length, 'piezas,', out.pool.length, 'en la rotación'); return;
  }
  fs.writeFileSync(FILE, text);
  console.log('escrito', FILE, Object.keys(out.pieces).length, 'piezas,', out.pool.length, 'en la rotación');
})().catch(e => { console.error(e); process.exit(1); });
