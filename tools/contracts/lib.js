'use strict';
// Utilidades de las pruebas de contrato: contador de comprobaciones y servidor en proceso (igual que server/test-item-economy-live.js).
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), http = require('node:http');
const ROOT = path.resolve(__dirname, '..', '..');
let passed = 0, failed = 0;
function check(name, ok, detail){
  if(ok){ passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (detail !== undefined ? '  ' + JSON.stringify(detail) : '')); process.exitCode = 1; }
}
const codes = r => (r.errors || []).map(e => e.code);
function summary(label){ console.log(`${failed ? 'FAIL' : 'PASS'} ${label}: ${passed} comprobaciones OK, ${failed} fallidas`); }
// Servidor real en proceso con un directorio temporal. Nunca toca datos reales ni red.
function harness(env = {}){
  Object.assign(process.env, { HORDA_ITEM_ECONOMY: '1', DATA_PERSISTENT: '1' }, env);
  const { create } = require(path.join(ROOT, 'server', 'accounts'));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'horda-contract-'));
  const h = { dir, now: Date.parse('2026-10-15T12:00:00Z'), app: null, server: null, url: '' , seq: 0 };
  h.start = async () => {
    h.app = create({ dataDir: dir, databaseUrl: '', now: () => h.now, log: () => {}, originAllowed: () => true });
    await h.app.ready;
    h.server = http.createServer((q, s) => h.app.handle(q, s) || s.end());
    await new Promise(r => h.server.listen(0, '127.0.0.1', r));
    h.url = 'http://127.0.0.1:' + h.server.address().port;
  };
  h.stop = async () => { await new Promise(r => h.server.close(r)); await h.app.close(); };
  h.api = async (method, p, body, token) => {
    const r = await fetch(h.url + p, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    let j = null; try{ j = await r.json(); }catch{}
    return { status: r.status, body: j };
  };
  h.action = (token, op, args = {}, id) => h.api('POST', '/api/economy/action', { op, args, requestId: id || 'ct_' + (++h.seq) + '_' + op.replace(/\W/g, '') }, token);
  h.cleanup = () => fs.rmSync(dir, { recursive: true, force: true });
  return h;
}
module.exports = { ROOT, check, codes, summary, harness };
