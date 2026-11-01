'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const {SpendGuard} = require('./spend-guard'), P = require('./providers-s0f');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'ps-'));
const png = Buffer.from('89504e470d0a1a0a', 'hex');
const mkJob = d => { const r = path.join(d, 'ref.png'); fs.writeFileSync(r, png); return {id: 'j1', label: 'x', prompt: 'p', references: [r]}; };
const resp = (status, json, bytes) => ({status, ok: status >= 200 && status < 300, headers: {get: () => null}, json: async () => json, arrayBuffer: async () => bytes});
test('sin clave => BLOCKED_CREDENTIAL y 0 gasto (OpenAI y BFL)', async () => {
  delete process.env.ART_GEN_API_KEY; delete process.env.OPENAI_API_KEY; delete process.env.BFL_API_KEY;
  const d = tmp(), g = new SpendGuard({ledgerPath: path.join(d, 'l.json')}); let calls = 0; const f = async () => { calls++; return resp(200, {}); };
  for (const Cls of [P.OpenAIImageProvider, P.BFLFlux2Provider]) await assert.rejects(new Cls({fetchImpl: f, guard: g}).generate(mkJob(d)), /BLOCKED_CREDENTIAL/);
  assert.equal(calls, 0); assert.equal(fs.existsSync(path.join(d, 'l.json')), false);
});
test('dry-run no usa red ni gasta', async () => {
  const d = tmp(), g = new SpendGuard({ledgerPath: path.join(d, 'l.json')}); let calls = 0;
  const r = await new P.OpenAIImageProvider({fetchImpl: async () => { calls++; }, guard: g, dryRun: true}).generate(mkJob(d)); assert.equal(r.status, 'DRY_RUN'); assert.equal(calls, 0);
});
test('OpenAI: genera, cobra, cachea y la segunda vez no gasta', async () => {
  process.env.ART_GEN_API_KEY = 'k'; const d = tmp(), g = new SpendGuard({ledgerPath: path.join(d, 'l.json')}); let calls = 0;
  const f = async (u, o) => { calls++; assert.match(u, /images\/edits/); assert.equal(o.headers.Authorization, 'Bearer k'); return resp(200, {data: [{b64_json: png.toString('base64')}]}); };
  const p = new P.OpenAIImageProvider({fetchImpl: f, guard: g}), job = mkJob(d);
  const a = await p.generate(job, {batch: 'b'}); assert.equal(a.cached, false); assert.equal(a.cost_cents, 25);
  const b = await p.generate(job, {batch: 'b'}); assert.equal(b.cached, true); assert.equal(calls, 1); assert.equal(g.spentTodayCents(), 25);
  delete process.env.ART_GEN_API_KEY;
});
test('HTTP 401 => BLOCKED_CREDENTIAL; 429 reintenta y luego procede', async () => {
  process.env.ART_GEN_API_KEY = 'k'; const d = tmp(); let n = 0;
  const f401 = async () => resp(401, {}); await assert.rejects(new P.OpenAIImageProvider({fetchImpl: f401, guard: new SpendGuard({ledgerPath: path.join(d, 'a.json')})}).generate(mkJob(d)), /BLOCKED_CREDENTIAL/);
  const f429 = async () => (++n < 2 ? resp(429, {}) : resp(200, {data: [{b64_json: png.toString('base64')}]}));
  const r = await new P.OpenAIImageProvider({fetchImpl: f429, guard: new SpendGuard({ledgerPath: path.join(d, 'b.json')})}).generate({...mkJob(d), id: 'j2'}); assert.equal(r.status, 'GENERATED'); assert.equal(n, 2);
  delete process.env.ART_GEN_API_KEY;
});
test('BFL: encola, sondea, descarga sin clave y registra el costo del proveedor', async () => {
  process.env.BFL_API_KEY = 'bk'; const d = tmp(), g = new SpendGuard({ledgerPath: path.join(d, 'l.json')}); const seen = [];
  const f = async (u, o = {}) => { seen.push([u, o.headers && o.headers['x-key']]);
    if (u.includes('/v1/flux-2')) return resp(200, {id: 't', polling_url: 'https://api.bfl.ai/v1/get_result?id=t', cost: 3});
    if (u.includes('get_result')) return resp(200, {status: 'Ready', result: {sample: 'https://delivery.bfl.ai/x.png'}});
    return resp(200, {}, png); };
  const r = await new P.BFLFlux2Provider({fetchImpl: f, guard: g, pollMs: 1}).generate(mkJob(d), {batch: 'b'});
  assert.equal(r.cost_cents, 3); assert.ok(fs.existsSync(r.file)); assert.equal(seen.at(-1)[1], undefined); // la descarga NO lleva la clave
  delete process.env.BFL_API_KEY;
});
test('BFL: HTTP 402 => BLOCKED_CREDIT; fallback pasa al siguiente proveedor', async () => {
  process.env.BFL_API_KEY = 'bk'; delete process.env.ART_GEN_API_KEY; const d = tmp(), g = new SpendGuard({ledgerPath: path.join(d, 'l.json')});
  const bfl = new P.BFLFlux2Provider({fetchImpl: async () => resp(402, {}), guard: g}), oa = new P.OpenAIImageProvider({fetchImpl: async () => resp(200, {}), guard: g});
  await assert.rejects(P.withFallback([bfl, oa], mkJob(d)), /BLOCKED_CREDENTIAL/); // BFL bloquea por crédito, OpenAI por falta de clave: queda BLOCKED, no éxito simulado
  delete process.env.BFL_API_KEY;
});
