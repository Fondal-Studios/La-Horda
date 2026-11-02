#!/usr/bin/env node
'use strict';
// Manifiesto de la versión candidata: identifica el build por commit + hash de contenido de cada familia de archivos
// que el jugador descarga. El service worker (tools/perf/stamp-sw.js) valida cada archivo contra su propio manifiesto
// estampado, de modo que código nuevo no se mezcla con assets viejos; este manifiesto es la identidad humana y auditable.
//   node tools/release/beta-manifest.js [--write]      (escribe docs/beta/release-manifest.json)
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), {execSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const sh = c => execSync(c, {cwd: ROOT, encoding: 'utf8'}).trim();
const GROUPS = {
  code: ['index.html', 'sw.js', 'js', 'css'], serverSource: ['server'], visualAtlases: ['assets/sprites'], visualPackages: ['assets/visual-packages'],
  audioMusic: ['assets/audio'], otherAssets: ['assets/fonts', 'assets/icons', 'assets/ui', 'assets/vfx', 'assets/og']
};
function walk(p, out) { const a = path.join(ROOT, p); if (!fs.existsSync(a)) return; const st = fs.statSync(a);
  if (st.isDirectory()) { for (const e of fs.readdirSync(a).sort()) if (e !== 'node_modules') walk(path.join(p, e), out); } else out.push(p); }
function group(paths) { const files = []; paths.forEach(p => walk(p, files)); const h = crypto.createHash('sha256'); let bytes = 0;
  for (const f of files) { const b = fs.readFileSync(path.join(ROOT, f)); bytes += b.length; h.update(f + '\0' + crypto.createHash('sha256').update(b).digest('hex') + '\n'); }
  return {files: files.length, bytes, sha256: h.digest('hex')}; }
const m = {contract: 'BetaReleaseManifest', version: 1, commit: sh('git rev-parse HEAD'), branch: sh('git rev-parse --abbrev-ref HEAD'), base: sh('git rev-parse origin/main'),
  netProtocol: Number((fs.readFileSync(path.join(ROOT, 'js/net/net-core.js'), 'utf8').match(/const NET_PROTOCOL = (\d+)/) || [])[1]),
  relayProtocol: Number((fs.readFileSync(path.join(ROOT, 'server/relay.js'), 'utf8').match(/const PROTOCOL = (\d+)/) || [])[1]),
  groups: Object.fromEntries(Object.entries(GROUPS).map(([k, v]) => [k, group(v)])),
  visualPackages: JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/visual-packages/manifest.v1.json'), 'utf8')).packages.length,
  musicTracksApproved: Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/audio/music/assignments.v1.json'), 'utf8')).tracks).length};
m.compatible = m.netProtocol === m.relayProtocol;
if (process.argv.includes('--write')) fs.writeFileSync(path.join(ROOT, 'docs/beta/release-manifest.json'), JSON.stringify(m, null, 1) + '\n');
else console.log(JSON.stringify(m, null, 1));
