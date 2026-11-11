#!/usr/bin/env node
// Arma la copia del juego que viaja en el paquete de Steam (por omisión desktop/game/). LISTA BLANCA: solo se copia lo que el
// juego carga en runtime. Nada fuera de la lista puede viajar, aunque mañana aparezca una carpeta nueva en la raíz del repo.
//
//   node desktop/stage.mjs [--out <carpeta>] [--repo <carpeta>] [--beta-public] [--quiet]
//
// Qué viaja:   index.html (reescrito, ver abajo) · css/ · js/ · assets/ · legal/ (la abre el juego: js/data/legal-config.js base "legal/")
//              + cualquier archivo local de la raíz que index.html siga referenciando después de la reescritura.
// Qué NO viaja: art-source/, docs/, tools/, server/, tests/, reviews/, .github/, deploy/, contracts/, desktop/, .git, .claude, los .md de
//              la raíz, lan.*, render.yaml, package.json, sw.js, manifest.webmanifest, instalar.html, crystal-wars.html, assets/og/
//              (imagen para redes), *.map, .DS_Store.
//
// PNG con gemelo .webp: SE COPIAN LOS DOS. Se revisó el código de carga (js/assets/lazy-images.js + js/assets/asset-webp.js): el
// cambio a .webp solo ocurre cuando la imagen se pide por la PROPIEDAD `img.src` desde JS. Hay rutas que piden el .png aunque exista
// el .webp: (1) <img src="..."> escrito como HTML (tienda y Códice: miniaturas `preview.png` de skins, js/ui/shop-ui.js,
// js/ui/codex/codex.js), (2) CSS url() (css/hud.css -> assets/sprites/bosses/infernal/hechicero/portrait.png), (3) el reintento
// onWebpErr y ?webp=0. Quitar los PNG gemelos (~65 MB) dejaría huecos de arte: no se hace hasta que esas rutas pasen por el selector.
//
// Reescritura de index.html (solo metadatos web; no se quita ni se reordena ningún <script>):
//   - fuera <link rel="manifest">, <link rel="canonical">, metas og:/twitter: y el enlace "Instalar en mi dispositivo" (PWA);
//   - se agrega window.__HORDA_DESKTOP_BUILD__ = true (marca inofensiva; hoy el juego no la lee);
//   - --beta-public agrega window.__BETA_PUBLIC__ = true (oculta Convergencia/Coliseo: decisión del dueño, apagado por omisión).
import {cp, rm, readFile, writeFile, readdir, stat, mkdir, copyFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOTS = ['index.html', 'css', 'js', 'assets', 'legal'];
export const NEVER = ['art-source', 'docs', 'tools', 'server', 'tests', 'reviews', '.github', '.git', '.claude', 'deploy', 'contracts', 'desktop', 'node_modules'];
const SKIP = [/^assets\/og(\/|$)/, /^assets\/ui\/codex\/champions\/[^/]+\.png$/, /(^|\/)\.DS_Store$/, /\.map$/, /(^|\/)Thumbs\.db$/i, /(^|\/)node_modules(\/|$)/];

// Referencias locales (src/href) de un HTML: sin esquema, sin "#", sin data:.
export function localRefs(html) {
  const out = new Set();
  for (const m of html.matchAll(/<(?:script|link|img|a|source|audio|video|iframe)\b[^>]*?\s(?:src|href)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    let u = (m[1] ?? m[2] ?? '').trim();
    if (!u || u.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(u) || u.startsWith('//')) continue;
    u = u.replace(/[?#].*$/, ''); if (u) out.add(u);
  }
  return [...out];
}
export function rewriteIndex(html, {betaPublic = false} = {}) {
  const notes = [];
  const drop = [
    ['manifest', /[ \t]*<link rel="manifest"[^>]*>\r?\n?/g],
    ['canonical', /[ \t]*<link rel="canonical"[^>]*>\r?\n?/g],
    ['og', /[ \t]*<meta property="og:[^>]*>\r?\n?/g],
    ['twitter', /[ \t]*<meta name="twitter:[^>]*>\r?\n?/g],
    ['instalar', /[ \t]*<a\b[^>]*href="instalar\.html"[^>]*>[\s\S]*?<\/a>/g]
  ];
  for (const [name, re] of drop) { const n = (html.match(re) || []).length; notes.push(name + ':' + n); html = html.replace(re, ''); }
  if (!html.includes('<head>')) throw new Error('index.html sin <head>');
  html = html.replace('<head>', '<head>\n<script>window.__HORDA_DESKTOP_BUILD__=true;' + (betaPublic ? 'window.__BETA_PUBLIC__=true;' : '') + '</script>');
  return {html, notes};
}
async function walk(dir, base = dir, acc = []) {
  for (const e of await readdir(dir, {withFileTypes: true})) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) await walk(f, base, acc); else if (e.isFile()) acc.push(path.relative(base, f).split(path.sep).join('/'));
  }
  return acc;
}
export async function stage({repo = path.resolve(HERE, '..'), out = path.join(HERE, 'game'), betaPublic = false, quiet = false} = {}) {
  repo = path.resolve(repo); out = path.resolve(out);
  if (out === repo || repo.startsWith(out + path.sep)) throw new Error('--out no puede ser el repo ni contenerlo');
  const rel = path.relative(repo, out).split(path.sep)[0];
  if (!path.relative(repo, out).startsWith('..') && rel !== 'desktop') throw new Error('--out dentro del repo solo puede ser desktop/game');
  if (!existsSync(path.join(repo, 'index.html')) || !existsSync(path.join(repo, 'js', 'main.js'))) throw new Error('no parece el repo del juego: ' + repo);
  await rm(out, {recursive: true, force: true}); await mkdir(out, {recursive: true});
  const keep = src => { const r = path.relative(repo, src).split(path.sep).join('/'); return !SKIP.some(re => re.test(r)); };
  for (const name of ROOTS) await cp(path.join(repo, name), path.join(out, name), {recursive: true, filter: keep, dereference: false});
  // index.html de escritorio + lo que siga referenciando
  const r = rewriteIndex(await readFile(path.join(repo, 'index.html'), 'utf8'), {betaPublic});
  await writeFile(path.join(out, 'index.html'), r.html);
  const extra = [], missing = [];
  for (const ref of localRefs(r.html)) {
    const norm = path.posix.normalize(ref);
    if (norm.startsWith('..') || path.posix.isAbsolute(norm)) { missing.push(ref + ' (fuera del juego)'); continue; }
    if (existsSync(path.join(out, norm))) continue;
    if (NEVER.includes(norm.split('/')[0])) { missing.push(ref + ' (carpeta excluida)'); continue; }
    if (!existsSync(path.join(repo, norm))) { missing.push(ref); continue; }
    await mkdir(path.dirname(path.join(out, norm)), {recursive: true}); await copyFile(path.join(repo, norm), path.join(out, norm)); extra.push(norm);
  }
  if (missing.length) throw new Error('index.html referencia archivos que no existen o no pueden viajar: ' + missing.join(', '));
  // resumen
  const files = await walk(out); let bytes = 0, png = 0, pngBytes = 0, twins = 0, twinBytes = 0; const set = new Set(files);
  for (const f of files) {
    const s = (await stat(path.join(out, f))).size; bytes += s;
    if (f.endsWith('.png')) { png++; pngBytes += s; if (set.has(f.slice(0, -4) + '.webp')) { twins++; twinBytes += s; } }
  }
  const info = {out, files: files.length, bytes, mb: +(bytes / 1048576).toFixed(1), png, pngMb: +(pngBytes / 1048576).toFixed(1),
    pngConGemeloWebp: twins, pngConGemeloWebpMb: +(twinBytes / 1048576).toFixed(1), extra, indexNotes: r.notes, betaPublic};
  if (!quiet) console.log('staging listo:', JSON.stringify(info, null, 1));
  return info;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), val = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  stage({repo: val('--repo'), out: val('--out'), betaPublic: a.includes('--beta-public'), quiet: a.includes('--quiet')}).catch(e => { console.error('ERROR', e.message); process.exit(1); });
}
