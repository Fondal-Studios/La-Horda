'use strict';
// Proveedores reales de generación/edición para la Art Factory (S0F). Complementan (no reemplazan) providers.js y el
// BFLProvider del ensayo de US$ 5. Todos: clave solo por variable de entorno; SpendGuard antes de cada POST facturable;
// caché por hash; sin reintento ciego de POST (solo ante 429, que significa «no procesado»); descarga sin enviar la clave;
// modo dry-run sin red; y estado BLOCKED_CREDENTIAL explícito cuando falta la clave.
const fs = require('node:fs'), path = require('node:path');
const {SpendGuard} = require('./spend-guard');
const {trustedURL} = require('./bfl-provider');
const sleep = ms => new Promise(r => setTimeout(r, ms));

class Blocked extends Error { constructor(code, msg) { super(code + ': ' + msg); this.code = code; } }

async function postWith429(fetchImpl, url, options, {retries = 3, baseMs = 1500} = {}) {
  for (let i = 0; ; i++) {
    const r = await fetchImpl(url, options);
    if (r.status === 429 && i < retries) { await sleep(Math.min(30000, (Number(r.headers?.get?.('retry-after')) || 0) * 1000 || baseMs * 2 ** i)); continue; } // 429 = no procesado: reintento seguro
    return r;
  }
}

class OpenAIImageProvider {
  constructor({fetchImpl = fetch, guard, model = process.env.FONDAL_OPENAI_IMAGE_MODEL || 'gpt-image-1.5', size = '1024x1024', reserveCents = 25, dryRun = false} = {}) {
    Object.assign(this, {name: 'openai-image', fetch: fetchImpl, guard, model, size, reserveCents, dryRun});
  }
  estimate(job) { return {provider: this.name, model: this.model, job_id: job.id, estimated_cents_max: this.reserveCents, note: 'tope conservador por llamada; el costo real se lee de la facturación del proveedor'}; }
  async generate(job, {batch = 'default'} = {}) {
    const key = process.env.ART_GEN_API_KEY || process.env.OPENAI_API_KEY;
    const params = {size: this.size, background: 'transparent', output_format: 'png'};
    const ck = SpendGuard.cacheKey({provider: this.name, model: this.model, prompt: job.prompt, refs: job.references, params});
    const hit = this.guard.cached(ck); if (hit) return {status: 'GENERATED', cached: true, file: hit, cost_cents: 0, cacheKey: ck};
    if (this.dryRun) return {status: 'DRY_RUN', estimate: this.estimate(job), cacheKey: ck};
    if (!key) throw new Blocked('BLOCKED_CREDENTIAL', 'definir ART_GEN_API_KEY (o OPENAI_API_KEY) como secreto del entorno');
    this.guard.reserve({batch, task: job.id, cents: this.reserveCents, provider: this.name, note: job.label});
    const form = new FormData(); form.append('model', this.model); form.append('prompt', job.prompt);
    for (const k of Object.keys(params)) form.append(k, params[k]);
    for (const r of job.references) form.append('image[]', new Blob([fs.readFileSync(r)], {type: 'image/png'}), path.basename(r));
    const res = await postWith429(this.fetch, 'https://api.openai.com/v1/images/edits', {method: 'POST', headers: {Authorization: 'Bearer ' + key}, body: form, redirect: 'error'});
    if (res.status === 401 || res.status === 403) throw new Blocked('BLOCKED_CREDENTIAL', 'la clave fue rechazada o la organización no está verificada (HTTP ' + res.status + ')');
    if (!res.ok) throw new Error('OpenAI HTTP ' + res.status);
    const data = await res.json(), b64 = data?.data?.[0]?.b64_json; if (!b64) throw new Error('OpenAI sin imagen');
    const bytes = Buffer.from(b64, 'base64'); if (bytes.length > 32 * 1024 * 1024) throw new Error('imagen > 32 MiB');
    return {status: 'GENERATED', cached: false, file: this.guard.store(ck, bytes), cost_cents: this.reserveCents, cacheKey: ck, usage: data.usage || null};
  }
}

class BFLFlux2Provider {
  constructor({fetchImpl = fetch, guard, model = 'flux-2-klein-4b', width = 1024, height = 1024, reserveCents = 25, pollMs = 1500, timeoutMs = 300000, dryRun = false} = {}) {
    Object.assign(this, {name: 'bfl-flux2', fetch: fetchImpl, guard, model, width, height, reserveCents, pollMs, timeoutMs, dryRun});
  }
  estimate(job) { return {provider: this.name, model: this.model, job_id: job.id, estimated_cents_max: this.reserveCents, note: '1 crédito BFL = US$ 0,01; el precio por megapíxel debe confirmarse en https://bfl.ai/pricing'}; }
  async generate(job, {batch = 'default'} = {}) {
    const key = process.env.BFL_API_KEY;
    if (job.references.length > 4) throw new Error('FLUX.2 klein admite hasta 4 imágenes de referencia');
    const params = {w: this.width, h: this.height, fmt: 'png'};
    const ck = SpendGuard.cacheKey({provider: this.name, model: this.model, prompt: job.prompt, refs: job.references, params});
    const hit = this.guard.cached(ck); if (hit) return {status: 'GENERATED', cached: true, file: hit, cost_cents: 0, cacheKey: ck};
    if (this.dryRun) return {status: 'DRY_RUN', estimate: this.estimate(job), cacheKey: ck};
    if (!key) throw new Blocked('BLOCKED_CREDENTIAL', 'definir BFL_API_KEY como secreto del entorno');
    this.guard.reserve({batch, task: job.id, cents: this.reserveCents, provider: this.name, note: job.label});
    const body = {prompt: job.prompt, width: this.width, height: this.height, output_format: 'png'};
    job.references.forEach((r, i) => { body[i === 0 ? 'input_image' : 'input_image_' + (i + 1)] = fs.readFileSync(r).toString('base64'); });
    const signal = AbortSignal.timeout(this.timeoutMs), headers = {'content-type': 'application/json', 'x-key': key};
    const post = await postWith429(this.fetch, 'https://api.bfl.ai/v1/' + this.model, {method: 'POST', headers, body: JSON.stringify(body), signal, redirect: 'error'});
    if (post.status === 401 || post.status === 403) throw new Blocked('BLOCKED_CREDENTIAL', 'clave rechazada (HTTP ' + post.status + ')');
    if (post.status === 402) throw new Blocked('BLOCKED_CREDIT', 'sin créditos en BFL (HTTP 402): cargar saldo');
    if (!post.ok) throw new Error('BFL HTTP ' + post.status);
    const task = await post.json(); if (!task.id || !task.polling_url) throw new Error('BFL sin tarea');
    const poll = trustedURL(task.polling_url, 'poll'); let result;
    while (!result) {
      signal.throwIfAborted(); const r = await (await this.fetch(poll, {headers: {'x-key': key}, signal, redirect: 'error'})).json();
      if (r.status === 'Ready') result = r.result; else if (['Error', 'Failed', 'Request Moderated', 'Content Moderated', 'Task not found'].includes(r.status)) throw new Error('BFL terminó: ' + r.status); else await sleep(this.pollMs);
    }
    const img = await this.fetch(trustedURL(result.sample, 'sample'), {signal, redirect: 'error'}); // sin enviar la clave al almacenamiento
    if (!img.ok) throw new Error('descarga BFL HTTP ' + img.status);
    const bytes = Buffer.from(await img.arrayBuffer()); if (bytes.length > 32 * 1024 * 1024) throw new Error('imagen > 32 MiB');
    return {status: 'GENERATED', cached: false, file: this.guard.store(ck, bytes), cost_cents: task.cost == null ? this.reserveCents : task.cost, cacheKey: ck, taskId: task.id};
  }
}


// Runway API (gen4_image / gen4_image_turbo). Verificado en https://docs.dev.runwayml.com/guides/using-the-api, /assets/inputs, /assets/outputs, /usage/tiers:
// POST https://api.dev.runwayml.com/v1/text_to_image con `Authorization: Bearer`, `X-Runway-Version: 2024-11-06`, body {model, promptText, ratio, referenceImages:[{uri, tag}]};
// uri = URL https o data URI (≤ 5 MB codificado); las salidas expiran en 24-48 h (se descargan ya); GET /v1/tasks/{id} → {status, output:[urls]}.
// NO VERIFICADO en la documentación: valores válidos de `ratio` (solo se vio 1920:1080), máximo de referencias, estados distintos de SUCCEEDED/THROTTLED,
// y transparencia: la salida se asume SIN alfa -> el ensamblador recorta el fondo plano (ver assemble en art_factory.py).
class RunwayProvider {
  constructor({fetchImpl = fetch, guard, model = process.env.FONDAL_RUNWAY_MODEL || 'gen4_image', ratio = process.env.FONDAL_RUNWAY_RATIO || '1920:1080', reserveCents = 10, pollMs = 3000, timeoutMs = 600000, dryRun = false} = {}) {
    Object.assign(this, {name: 'runway', fetch: fetchImpl, guard, model, ratio, reserveCents, pollMs, timeoutMs, dryRun});
  }
  estimate(job) { return {provider: this.name, model: this.model, job_id: job.id, estimated_cents_max: this.reserveCents, note: 'gen4_image: 5 créditos (720p) u 8 (1080p) = US$ 0,05-0,08; turbo 2 créditos. 1 crédito = US$ 0,01 (https://docs.dev.runwayml.com/guides/pricing)'}; }
  async generate(job, {batch = 'default'} = {}) {
    const key = process.env.RUNWAYML_API_SECRET || process.env.RUNWAY_API_KEY;
    const params = {ratio: this.ratio};
    const ck = SpendGuard.cacheKey({provider: this.name, model: this.model, prompt: job.prompt, refs: job.references, params});
    const hit = this.guard.cached(ck); if (hit) return {status: 'GENERATED', cached: true, file: hit, cost_cents: 0, cacheKey: ck};
    if (this.dryRun) return {status: 'DRY_RUN', estimate: this.estimate(job), cacheKey: ck};
    if (!key) throw new Blocked('BLOCKED_CREDENTIAL', 'definir RUNWAYML_API_SECRET (o RUNWAY_API_KEY) como secreto del entorno');
    const refs = job.references.map((r, i) => { const uri = 'data:image/' + (r.endsWith('.jpg') ? 'jpeg' : 'png') + ';base64,' + fs.readFileSync(r).toString('base64');
      if (uri.length > 5 * 1024 * 1024) throw new Error('referencia > 5 MB como data URI (límite de Runway): reducirla antes de enviar'); return {uri, tag: 'ref' + (i + 1)}; });
    this.guard.reserve({batch, task: job.id, cents: this.reserveCents, provider: this.name, note: job.label});
    const prompt = job.prompt + ' ' + refs.map(r => '@' + r.tag).join(' ') + ' (referencias de identidad y de poses).';
    const signal = AbortSignal.timeout(this.timeoutMs), headers = {'content-type': 'application/json', authorization: 'Bearer ' + key, 'x-runway-version': '2024-11-06'};
    const post = await postWith429(this.fetch, 'https://api.dev.runwayml.com/v1/text_to_image', {method: 'POST', headers, body: JSON.stringify({model: this.model, promptText: prompt, ratio: this.ratio, referenceImages: refs}), signal, redirect: 'error'});
    if (post.status === 401 || post.status === 403) throw new Blocked('BLOCKED_CREDENTIAL', 'clave rechazada (HTTP ' + post.status + ')');
    if (post.status === 402) throw new Blocked('BLOCKED_CREDIT', 'sin créditos en Runway: cargar saldo en https://dev.runway.com');
    if (!post.ok) { let t = ''; try { t = (await post.text()).slice(0, 400); } catch (e) {} throw new Error('Runway HTTP ' + post.status + (t ? ': ' + t : '')); }
    const task = await post.json(); if (!task.id) throw new Error('Runway sin id de tarea');
    let out;
    while (!out) {
      signal.throwIfAborted(); const r = await (await this.fetch('https://api.dev.runwayml.com/v1/tasks/' + encodeURIComponent(task.id), {headers: {authorization: 'Bearer ' + key, 'x-runway-version': '2024-11-06'}, signal, redirect: 'error'})).json();
      if (r.status === 'SUCCEEDED') out = r.output; else if (['FAILED', 'CANCELLED', 'CANCELED'].includes(r.status)) throw new Error('Runway terminó: ' + r.status + (r.failure ? ' - ' + r.failure : '')); else await sleep(this.pollMs); // PENDING/RUNNING/THROTTLED
    }
    if (!Array.isArray(out) || !out[0]) throw new Error('Runway sin salida');
    const u = new URL(out[0]); if (u.protocol !== 'https:' || u.username || u.password) throw new Error('URL de salida no confiable');
    const img = await this.fetch(u.href, {signal, redirect: 'error'}); // sin enviar la clave; la URL expira en 24-48 h
    if (!img.ok) throw new Error('descarga Runway HTTP ' + img.status);
    const bytes = Buffer.from(await img.arrayBuffer()); if (bytes.length > 32 * 1024 * 1024) throw new Error('imagen > 32 MiB');
    return {status: 'GENERATED', cached: false, file: this.guard.store(ck, bytes), cost_cents: this.reserveCents, cacheKey: ck, taskId: task.id};
  }
}

// Fallback: el primero que no esté BLOCKED_*; si todos están bloqueados, relanza el último bloqueo (estado BLOCKED, sin fingir).
async function withFallback(providers, job, opts) {
  const why = [];
  for (const p of providers) { try { return {provider: p.name, ...await p.generate(job, opts)}; } catch (e) { if (!(e instanceof Blocked)) throw e; why.push(`${p.name}: ${e.message}`); } }
  throw new Blocked(why.length ? why[0].split(':')[1].trim() : 'BLOCKED_NO_PROVIDER', why.join(' | ') || 'ningún proveedor configurado');
}
module.exports = {OpenAIImageProvider, BFLFlux2Provider, RunwayProvider, withFallback, Blocked, postWith429};
