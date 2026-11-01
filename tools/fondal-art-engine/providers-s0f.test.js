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

test('Runway: sin clave BLOCKED; flujo POST→sondeo→descarga sin clave; 402 => BLOCKED_CREDIT', async () => {
  delete process.env.RUNWAYML_API_SECRET; delete process.env.RUNWAY_API_KEY; const d = tmp(), g = new SpendGuard({ledgerPath: path.join(d, 'l.json')});
  await assert.rejects(new P.RunwayProvider({fetchImpl: async () => { throw Error('no debe llamarse'); }, guard: g}).generate(mkJob(d)), /BLOCKED_CREDENTIAL/);
  process.env.RUNWAYML_API_SECRET = 'rk'; const seen = []; let n = 0;
  const f = async (u, o = {}) => { seen.push([u, o.headers && o.headers.authorization, o.headers && o.headers['x-runway-version'], o.body]);
    if (u.endsWith('/v1/text_to_image')) return resp(200, {id: 'tk'});
    if (u.includes('/v1/tasks/')) return resp(200, ++n < 2 ? {status: 'RUNNING'} : {status: 'SUCCEEDED', output: ['https://dnznrvs05pmza.cloudfront.net/o.png']});
    return resp(200, {}, png); };
  const r = await new P.RunwayProvider({fetchImpl: f, guard: g, pollMs: 1}).generate(mkJob(d), {batch: 'b'});
  assert.equal(r.status, 'GENERATED'); assert.equal(seen[0][2], '2024-11-06'); const body = JSON.parse(seen[0][3]); assert.equal(body.model, 'gen4_image'); assert.match(body.referenceImages[0].uri, /^data:image\/png;base64,/); assert.match(body.promptText, /@ref1/);
  assert.equal(seen.at(-1)[1], undefined); // la descarga NO lleva la clave
  const d2 = tmp(); await assert.rejects(new P.RunwayProvider({fetchImpl: async () => resp(402, {}), guard: new SpendGuard({ledgerPath: path.join(d2, 'l.json')})}).generate({...mkJob(d2), id: 'j9'}), /BLOCKED_CREDIT/);
  delete process.env.RUNWAYML_API_SECRET;
});

test('Runway resumes persisted task after polling/download failure without another POST or charge', async () => {
  process.env.RUNWAYML_API_SECRET = 'fixture-only';
  try {
    const d = tmp(), guard = new SpendGuard({ledgerPath: path.join(d, 'ledger.json')}), job = mkJob(d); let posts = 0, polls = 0;
    const f = async (url, options = {}) => {
      if (options.method === 'POST') { posts++; return resp(200, {id: 'persisted-task'}); }
      if (url.includes('/tasks/')) { polls++; return polls === 1 ? resp(503, {}) : resp(200, {status: 'SUCCEEDED', output: ['https://example.com/image.png']}); }
      return resp(200, {}, png);
    };
    const provider = new P.RunwayProvider({guard, fetchImpl: f, pollMs: 1});
    await assert.rejects(provider.generate(job, {batch: 'first'}), /BLOCKED_PROVIDER_PENDING/);
    assert.equal(guard.spentTodayCents(), 10);
    const restored = new P.RunwayProvider({guard: new SpendGuard({ledgerPath: guard.ledgerPath}), fetchImpl: f, pollMs: 1});
    const result = await restored.generate(job, {batch: 'resume'});
    assert.equal(result.taskId, 'persisted-task'); assert.equal(posts, 1); assert.equal(guard.spentTodayCents(), 10); assert.equal(result.cost_cents, 0);
    assert.equal((await restored.generate(job)).cached, true);
  } finally { delete process.env.RUNWAYML_API_SECRET; }
});
test('Runway lost POST response, 429 and 5xx never repeat billable submission, including a new batch', async () => {
  process.env.RUNWAYML_API_SECRET = 'fixture-only';
  try {
    for (const status of [null, 429, 500]) {
      const d = tmp(), guard = new SpendGuard({ledgerPath: path.join(d, 'ledger.json')}), job = mkJob(d); let calls = 0;
      const provider = new P.RunwayProvider({guard, fetchImpl: async () => { calls++; if (status === null) throw Error('lost response'); return resp(status, {}); }});
      await assert.rejects(provider.generate(job, {batch: 'first'}));
      await assert.rejects(provider.generate(job, {batch: 'second'}), /BLOCKED_REQUEST_UNCERTAIN/);
      assert.equal(calls, 1); assert.equal(guard.spentTodayCents(), 10);
    }
  } finally { delete process.env.RUNWAYML_API_SECRET; }
});
test('Runway rejects unknown status and preserves task for explicit resume', async () => {
  process.env.RUNWAYML_API_SECRET = 'fixture-only';
  try {
    const d = tmp(), guard = new SpendGuard({ledgerPath: path.join(d, 'ledger.json')}); let posts = 0;
    const provider = new P.RunwayProvider({guard, fetchImpl: async (url, o = {}) => o.method === 'POST' ? (posts++, resp(200, {id: 't'})) : resp(200, {status: 'SURPRISE'})});
    await assert.rejects(provider.generate(mkJob(d)), /BLOCKED_PROVIDER_PENDING/); await assert.rejects(provider.generate(mkJob(d)), /BLOCKED_PROVIDER_PENDING/); assert.equal(posts, 1);
  } finally { delete process.env.RUNWAYML_API_SECRET; }
});
test('Runway fails invalid model, ratio, under-reservation and nonfinite polling before network', () => {
  for (const options of [{model: 'unknown'}, {ratio: '9:99'}, {reserveCents: 0}, {pollMs: NaN}, {timeoutMs: Infinity}]) assert.throws(() => new P.RunwayProvider(options));
});
test('Runway simultaneous identical jobs submit once, second fails closed until task persisted', async () => {
  process.env.RUNWAYML_API_SECRET = 'fixture-only';
  try {
    const d = tmp(), guard = new SpendGuard({ledgerPath: path.join(d, 'ledger.json')}), job = mkJob(d); let resolvePost, posts = 0;
    const provider = new P.RunwayProvider({guard, fetchImpl: async (url, o = {}) => {
      if (o.method === 'POST') { posts++; return new Promise(resolve => { resolvePost = resolve; }); }
      if (url.includes('/tasks/')) return resp(200, {status: 'SUCCEEDED', output: ['https://example.com/o.png']});
      return resp(200, {}, png);
    }});
    const first = provider.generate(job, {batch: 'first'});
    await assert.rejects(provider.generate(job, {batch: 'second'}), /BLOCKED_REQUEST_UNCERTAIN/);
    resolvePost(resp(200, {id: 'task'})); await first;
    assert.equal(posts, 1); assert.equal(guard.spentTodayCents(), 10);
  } finally { delete process.env.RUNWAYML_API_SECRET; }
});
test('fallback never turns uncertain or pending request into another provider charge', async () => {
  let calls = 0;
  await assert.rejects(P.withFallback([{name: 'a', generate: async () => { throw new P.Blocked('BLOCKED_PROVIDER_PENDING', 'pending'); }}, {name: 'b', generate: async () => { calls++; }}], {}), /BLOCKED_PROVIDER_PENDING/);
  assert.equal(calls, 0);
});
test('Runway timeout with persisted task is resumable but lost submission is not', async () => {
  process.env.RUNWAYML_API_SECRET = 'fixture-only';
  try {
    const d = tmp(), guard = new SpendGuard({ledgerPath: path.join(d, 'ledger.json')});
    const provider = new P.RunwayProvider({guard, timeoutMs: 5, pollMs: 1, fetchImpl: async (url, o = {}) => o.method === 'POST' ? resp(200, {id: 't'}) : resp(200, {status: 'RUNNING'})});
    await assert.rejects(provider.generate(mkJob(d)), e => e.code === 'BLOCKED_PROVIDER_PENDING');
    const e = tmp(); const other = new P.RunwayProvider({guard: new SpendGuard({ledgerPath: path.join(e, 'ledger.json')}), fetchImpl: async () => { throw Error('transport'); }});
    await assert.rejects(other.generate(mkJob(e)), err => err.code === 'BLOCKED_REQUEST_UNCERTAIN');
  } finally { delete process.env.RUNWAYML_API_SECRET; }
});
test('Runway budget rejection before POST can safely retry after explicit cap correction', async () => {
  process.env.RUNWAYML_API_SECRET = 'fixture-only';
  try {
    const d = tmp(), ledgerPath = path.join(d, 'ledger.json'), job = mkJob(d); let posts = 0;
    const f = async (url, o = {}) => {
      if (o.method === 'POST') { posts++; return resp(200, {id: 't'}); }
      return url.includes('/tasks/') ? resp(200, {status: 'SUCCEEDED', output: ['https://example.com/a.png']}) : resp(200, {}, png);
    };
    await assert.rejects(new P.RunwayProvider({guard: new SpendGuard({ledgerPath, limits: {perTaskCents: 0}}), fetchImpl: f}).generate(job, {batch: 'b'}), /tope/);
    assert.equal(posts, 0);
    const guard = new SpendGuard({ledgerPath, limits: {perTaskCents: 10}});
    assert.equal((await new P.RunwayProvider({guard, fetchImpl: f}).generate(job, {batch: 'b'})).status, 'GENERATED');
    assert.equal(posts, 1); assert.equal(guard.spentTodayCents(), 10);
  } finally { delete process.env.RUNWAYML_API_SECRET; }
});
test('Runway preserves native JPEG/WebP bytes for deterministic assembler decoding and rejects nonimage output', async () => {
  process.env.RUNWAYML_API_SECRET = 'fixture-only';
  try {
    const formats = [Buffer.from('ffd8ffe000104a464946', 'hex'), Buffer.from('524946460400000057454250', 'hex'), Buffer.from('<html>not image')];
    for (const [i, bytes] of formats.entries()) {
      const d = tmp(), guard = new SpendGuard({ledgerPath: path.join(d, 'ledger.json')});
      const provider = new P.RunwayProvider({guard, fetchImpl: async (url, o = {}) => o.method === 'POST' ? resp(200, {id:'t'}) : url.includes('/tasks/') ? resp(200, {status:'SUCCEEDED',output:['https://example.com/image']}) : resp(200, {}, bytes)});
      if (i === 2) await assert.rejects(provider.generate(mkJob(d)), e => e.code === 'BLOCKED_PROVIDER_OUTPUT');
      else { const result = await provider.generate(mkJob(d)); assert.deepEqual(fs.readFileSync(result.file), bytes); }
    }
  } finally { delete process.env.RUNWAYML_API_SECRET; }
});
test('Runway rejects oversized UTF-16 prompt before reservation or network instead of truncating',async()=>{
 process.env.RUNWAYML_API_SECRET='fixture-only';const d=tmp(),g=new SpendGuard({ledgerPath:path.join(d,'l.json')});let calls=0;
 const provider=new P.RunwayProvider({guard:g,fetchImpl:async()=>{calls++;throw Error('must not call');}});
 await assert.rejects(provider.generate({...mkJob(d),prompt:'😀'.repeat(500)}),/1000 unidades UTF-16/);
 assert.equal(calls,0);assert.equal(fs.existsSync(path.join(d,'l.json')),false);
});
