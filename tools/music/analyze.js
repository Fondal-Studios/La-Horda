#!/usr/bin/env node
'use strict';
// Análisis objetivo de cada pista del catálogo: sonoridad (EBU R128 vía ffmpeg), pico verdadero, brillo espectral,
// densidad de ataques, tempo, energía/dinámica y costura de bucle. NO es escucha: mide; la aprobación final es humana.
//   node tools/music/analyze.js [--force]
const fs = require('node:fs'), path = require('node:path'), {spawnSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const CATALOG = path.join(ROOT, 'docs/audio/library-catalog.json'), OUT = path.join(ROOT, 'docs/audio/library-analysis.json');
const SR = 22050, N = 1024, HOP = 512;

function fft(re, im) { // radix-2 in place
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) { const u = i + k, v = i + k + len / 2, tr = re[v] * cr - im[v] * ci, ti = re[v] * ci + im[v] * cr;
        re[v] = re[u] - tr; im[v] = im[u] - ti; re[u] += tr; im[u] += ti; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } }
  }
}
function decode(file) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], {maxBuffer: 1 << 29});
  if (r.status !== 0) throw Error('ffmpeg decode: ' + String(r.stderr).slice(0, 100));
  return new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.length));
}
function loudness(file) {
  const r = spawnSync('ffmpeg', ['-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], {encoding: 'utf8', maxBuffer: 1 << 26});
  const t = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
  const g = re => { const m = t.match(re); return m ? Number(m[1]) : null; };
  return {integratedLUFS: g(/I:\s+(-?[\d.]+) LUFS/), loudnessRange: g(/LRA:\s+([\d.]+) LU/), truePeakDBTP: g(/Peak:\s+(-?[\d.]+) dBFS/)};
}
function features(x) {
  const win = new Float32Array(N).map((_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)));
  const frames = Math.floor((x.length - N) / HOP); let prev = null; const flux = [], cent = [], rms = [];
  const sum = new Float64Array(N / 2); // espectro medio por tramo (inicio/fin)
  const headF = Math.floor(3 * SR / HOP), tailStart = frames - headF, head = new Float64Array(N / 2), tail = new Float64Array(N / 2);
  for (let f = 0; f < frames; f++) {
    const re = new Float32Array(N), im = new Float32Array(N); let e = 0;
    for (let i = 0; i < N; i++) { const v = x[f * HOP + i] * win[i]; re[i] = v; e += x[f * HOP + i] ** 2; }
    fft(re, im); const mag = new Float32Array(N / 2); let num = 0, den = 0, fl = 0;
    for (let k = 0; k < N / 2; k++) { mag[k] = Math.hypot(re[k], im[k]); num += k * mag[k]; den += mag[k]; if (prev) fl += Math.max(0, mag[k] - prev[k]); }
    rms.push(Math.sqrt(e / N)); cent.push(den > 1e-9 ? (num / den) * (SR / N) : 0); flux.push(fl); prev = mag;
    if (f < headF) for (let k = 0; k < N / 2; k++) head[k] += mag[k];
    if (f >= tailStart) for (let k = 0; k < N / 2; k++) tail[k] += mag[k];
  }
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const fm = mean(flux), fs_ = Math.sqrt(mean(flux.map(v => (v - fm) ** 2)));
  let onsets = 0; for (let i = 1; i < flux.length - 1; i++) if (flux[i] > fm + 1.2 * fs_ && flux[i] > flux[i - 1] && flux[i] >= flux[i + 1]) onsets++;
  const secs = x.length / SR;
  // tempo: autocorrelación del flujo espectral entre 60 y 180 BPM
  const fps = SR / HOP, c = flux.map(v => v - fm); let best = 0, bestLag = 0;
  for (let bpm = 60; bpm <= 180; bpm++) { const lag = Math.round(fps * 60 / bpm); let s = 0; for (let i = 0; i + lag < c.length; i++) s += c[i] * c[i + lag]; s /= (c.length - lag); if (s > best) { best = s; bestLag = lag; } }
  const tempo = bestLag ? +(fps * 60 / bestLag).toFixed(0) : null;
  const perSec = []; for (let s = 0; s + fps <= rms.length; s += Math.round(fps)) perSec.push(mean(rms.slice(s, s + Math.round(fps))));
  const m = mean(perSec), sd = Math.sqrt(mean(perSec.map(v => (v - m) ** 2)));
  const cos = (a, b) => { let d = 0, na = 0, nb = 0; for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2; } return d / Math.sqrt(na * nb || 1); };
  const edge = n => mean(rms.slice(0, n)) , endRms = mean(rms.slice(-Math.round(fps * 2))), startRms = mean(rms.slice(0, Math.round(fps * 2)));
  return {durationSec: +secs.toFixed(1), rmsMean: +m.toFixed(4), dynamics: +(sd / (m || 1)).toFixed(3), centroidHz: Math.round(mean(cent)), onsetsPerSec: +(onsets / secs).toFixed(2), tempoBPM: tempo,
    loop: {headTailSimilarity: +cos(head, tail).toFixed(3), fadesOut: endRms < 0.35 * m, fadesIn: startRms < 0.35 * m, endRatio: +(endRms / (m || 1)).toFixed(2), startRatio: +(startRms / (m || 1)).toFixed(2)}};
}
module.exports = {features, decode, loudness};
if (require.main === module) {
  const cat = JSON.parse(fs.readFileSync(CATALOG, 'utf8')), force = process.argv.includes('--force');
  const out = fs.existsSync(OUT) && !force ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {contract: 'MusicLibraryAnalysis', version: 1, note: 'Medidas automáticas; no sustituyen la escucha.', tracks: {}};
  let n = 0;
  for (const t of cat.tracks) {
    if (out.tracks[t.sha256]) continue;
    try { out.tracks[t.sha256] = {slug: t.slug, ...features(decode(path.join(ROOT, t.file))), ...loudness(path.join(ROOT, t.file))}; n++; }
    catch (e) { console.error(t.slug, e.message); out.tracks[t.sha256] = {slug: t.slug, error: e.message}; }
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  }
  console.log(JSON.stringify({analyzed: n, total: Object.keys(out.tracks).length}));
}
