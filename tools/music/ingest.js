#!/usr/bin/env node
'use strict';
// Ingesta de música con PUERTA DE LICENCIA. Solo OpenGameArt, solo fichas cuya licencia declarada sea EXACTAMENTE CC0.
// Las demás (CC-BY, SA, NC, GPL, vacías o ambiguas) se rechazan y quedan registradas con el motivo.
// Descarga reanudable (curl -C -), deduplicación por sha256, validación con ffprobe, límites de ritmo y tamaño.
// Los originales viven en music-work/ (fuera de Git). Los metadatos y la evidencia de licencia van a docs/audio/library-catalog.json.
//   node tools/music/ingest.js discover [--pages=3] [--query=boss]
//   node tools/music/ingest.js fetch [--max-tracks=40] [--max-mb=300]
//   node tools/music/ingest.js status
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const WORK = path.join(ROOT, 'music-work');
const CATALOG = path.join(ROOT, 'docs/audio/library-catalog.json');
const BASE = 'https://opengameart.org';
const UA = 'LaHordaMusicIngest/1.0 (+https://github.com/Fondal-Studios/La-Horda; respetuoso: 1 pedido cada ~2 s)';
const DELAY_MS = 2000;
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const arg = (n, d) => { const a = process.argv.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=')[1] : d; };
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
let last = 0;
function curl(args, opts = {}) {
  const wait = DELAY_MS - (Date.now() - last); if (wait > 0) sleep(wait); last = Date.now();
  const r = spawnSync('curl', ['-sS', '-L', '-A', UA, '-m', String(opts.timeout || 120), ...args], {encoding: 'buffer', maxBuffer: 64 << 20});
  if (r.status !== 0) throw Error('curl: ' + r.stderr.toString().trim());
  return r.stdout;
}
const load = () => fs.existsSync(CATALOG) ? JSON.parse(fs.readFileSync(CATALOG, 'utf8')) : {contract: 'MusicLibraryCatalog', version: 1, queue: [], tracks: [], rejected: []};
const save = c => { fs.mkdirSync(path.dirname(CATALOG), {recursive: true}); fs.writeFileSync(CATALOG, JSON.stringify(c, null, 1) + '\n'); };
const text = h => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#039;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

// CC0 + tipo Music (tid 12 = audio/music en OGA). El filtro de la búsqueda NO es la prueba: la prueba es la ficha.
function discover(pages, query) {
  const c = load(); const known = new Set([...c.queue, ...c.tracks.map(t => t.slug), ...c.rejected.map(t => t.slug)]);
  let added = 0;
  for (let p = 0; p < pages; p++) {
    const url = `${BASE}/art-search-advanced?keys=${encodeURIComponent(query)}&field_art_type_tid%5B%5D=12&field_art_licenses_tid%5B%5D=4&sort_by=count&sort_order=DESC&page=${p}`;
    const html = curl([url]).toString();
    // Solo filas de tipo "art" (no desafíos ni foros); la licencia se vuelve a comprobar en la ficha.
    for (const row of html.split('<div class="views-row ').slice(1)) {
      if (!/node node-art view-mode/.test(row)) continue;
      const m = row.match(/href="\/content\/([a-z0-9][a-z0-9-]*)"/);
      if (m && !known.has(m[1])) { known.add(m[1]); c.queue.push(m[1]); added++; }
    }
  }
  save(c); console.log(JSON.stringify({queued: added, queue: c.queue.length}));
}
function parseItem(html, slug) {
  const lic = (html.match(/field-name-field-art-licenses[\s\S]*?field-name-collect|field-name-field-art-licenses[\s\S]{0,1500}/) || [''])[0];
  const names = [...lic.matchAll(/class=['"]license-name['"]>([^<]+)</g)].map(m => text(m[1]));
  const licenses = names.join(' + ');
  const title = text((html.match(/<title>([^|<]*)/) || [, slug])[1]);
  const author = text((html.match(/field-name-author-submitter[\s\S]*?class=['"]username['"][^>]*>\s*<a [^>]*>([^<]+)</) || [, ''])[1]);
  const files = [...html.matchAll(/href="(https:\/\/opengameart\.org\/sites\/default\/files\/[^"?]+\.(?:ogg|mp3|wav|flac))"/gi)].map(m => m[1]);
  const tagBlock = (html.match(/field-name-field-art-tags[\s\S]*?field-name-field-art-licenses|field-name-field-art-tags[\s\S]{0,1500}/) || [''])[0];
  const tags = [...tagBlock.matchAll(/<a [^>]*>([^<]+)<\/a>/g)].map(m => text(m[1]).toLowerCase()).filter(Boolean).slice(0, 12);
  return {title, author, licenses, files: [...new Set(files)], tags, licenseText: text(lic.split('field-name-collect')[0]).slice(0, 300)};
}
const ext = u => path.extname(new URL(u).pathname).toLowerCase();
function probe(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file], {encoding: 'utf8'});
  if (r.status !== 0) return {ok: false, error: (r.stderr || '').slice(0, 120)};
  const j = JSON.parse(r.stdout), a = (j.streams || []).find(s => s.codec_type === 'audio');
  if (!a) return {ok: false, error: 'sin pista de audio'};
  const dur = Number(j.format.duration);
  return {ok: dur >= 20 && dur <= 900, error: dur < 20 || dur > 900 ? `duración fuera de rango (${dur.toFixed(1)} s)` : null, durationSec: +dur.toFixed(2), codec: a.codec_name, sampleRate: Number(a.sample_rate), channels: a.channels, bitRate: Number(j.format.bit_rate) || null};
}
function fetchOne(slug, c, budget) {
  const page = curl([`${BASE}/content/${slug}`]);
  const item = parseItem(page.toString(), slug);
  const reject = reason => { c.rejected.push({slug, title: item.title, licenses: item.licenses, reason}); };
  if (item.licenses.trim() !== 'CC0') return reject(`licencia no es exclusivamente CC0: "${item.licenses}"`);
  const pick = item.files.find(f => ext(f) === '.ogg') || item.files.find(f => ext(f) === '.mp3') || item.files.find(f => ext(f) === '.flac') || item.files.find(f => ext(f) === '.wav');
  if (!pick) return reject('sin archivo de audio descargable');
  const dir = path.join(WORK, 'originals'); fs.mkdirSync(dir, {recursive: true}); fs.mkdirSync(path.join(WORK, 'evidence'), {recursive: true});
  const dest = path.join(dir, `${slug}${ext(pick)}`);
  curl(['-C', '-', '-o', dest, pick], {timeout: 300}); // reanudable
  const size = fs.statSync(dest).size;
  if (budget.bytes + size > budget.max) { fs.rmSync(dest); budget.stop = true; return; }
  const hash = sha(fs.readFileSync(dest)), dup = c.tracks.find(t => t.sha256 === hash);
  if (dup) { fs.rmSync(dest); return reject(`duplicado por hash de ${dup.slug}`); }
  const pr = probe(dest);
  if (!pr.ok) { fs.rmSync(dest); return reject('archivo inválido: ' + pr.error); }
  fs.writeFileSync(path.join(WORK, 'evidence', `${slug}.html`), page);
  budget.bytes += size;
  c.tracks.push({slug, title: item.title, author: item.author || null, source: `${BASE}/content/${slug}`, downloadUrl: pick,
    license: 'CC0-1.0', licenseEvidence: {declared: item.licenses, pageExcerpt: item.licenseText, pageSha256: sha(page), retrievedAt: new Date().toISOString()},
    attributionRequired: false, redistributionInGame: true, commercialUse: true, tags: item.tags,
    file: path.relative(ROOT, dest), bytes: size, sha256: hash, format: ext(pick).slice(1), ...pr});
}
function fetchAll(maxTracks, maxMb) {
  const c = load(), budget = {bytes: 0, max: maxMb * 1048576, stop: false}; let n = 0;
  while (c.queue.length && n < maxTracks && !budget.stop) {
    const slug = c.queue.shift();
    try { fetchOne(slug, c, budget); } catch (e) { c.queue.push(slug); console.error(`${slug}: ${e.message}`); if (++c.failures > 5) break; }
    n++; save(c);
  }
  save(c); console.log(JSON.stringify({tracks: c.tracks.length, rejected: c.rejected.length, queue: c.queue.length, downloadedMB: +(budget.bytes / 1048576).toFixed(1)}));
}
module.exports = {parseItem, probe};
if (require.main === module) {
  const cmd = process.argv[2];
  try {
    if (cmd === 'discover') discover(Number(arg('pages', 3)), arg('query', ''));
    else if (cmd === 'fetch') { const c = load(); c.failures = 0; save(c); fetchAll(Number(arg('max-tracks', 40)), Number(arg('max-mb', 300))); }
    else if (cmd === 'status') { const c = load(); console.log(JSON.stringify({tracks: c.tracks.length, rejected: c.rejected.length, queue: c.queue.length})); }
    else throw Error('Uso: ingest.js discover [--pages=N --query=q] | fetch [--max-tracks=N --max-mb=N] | status');
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
