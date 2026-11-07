#!/usr/bin/env node
"use strict";
/* ============================================================
   tools/lan/host.js — JUGAR EN RED LOCAL (fiesta por WiFi, sin internet ni cuentas)

   Un solo comando en la compu anfitriona:
       node tools/lan/host.js            (o: npm run lan · lan.sh · lan.bat)
   levanta en UN puerto (default 8080):
     · el servidor de salas de siempre (server/relay.js) en modo LA_HORDA_LAN=1: sin /api de cuentas, sin nube,
       sin bandeja de recompensas;
     · el juego (archivos estáticos: solo index.html, js/, css/, assets/, legal/, manifest y sw.js);
     · /lan.json con las direcciones de la compu en la red local (la usa el juego para armar el enlace y el QR).
   Y muestra en la terminal la dirección para los celulares y su código QR (js/net/lan-qr.js, sin dependencias).

   Los invitados abren esa dirección en el navegador del celular/compu (misma WiFi). El index.html se sirve con
   `window.__HORDA_LAN__ = true`: el juego usa SIEMPRE el relay de este mismo origen y no habla con la nube.
   Opciones: --port N (default 8080; si está ocupado prueba los siguientes)  --host IP (donde escucha; default todas)
             --quiet (sin QR ni avisos)  --no-install (no instalar `ws` solo)
   Ver docs/beta-release/MULTIJUGADOR_LOCAL.md
   ============================================================ */
const fs = require("fs"), os = require("os"), path = require("path"), net = require("net"), cp = require("child_process");
const ROOT = path.resolve(__dirname, "..", "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const QUIET = args.includes("--quiet");
const say = (...a) => { if(!QUIET) console.log(...a); };

/* ---------------- direcciones de la red local ---------------- */
const VIRTUAL_IF = /^(docker|br-|veth|virbr|vboxnet|vmnet|vEthernet|utun|awdl|llw|lo|tun|tap|zt|tailscale|wg)/i;
function privateRank(ip){
  const p = ip.split(".").map(Number);
  if(p[0] === 192 && p[1] === 168) return 0;
  if(p[0] === 10) return 1;
  if(p[0] === 172 && p[1] >= 16 && p[1] <= 31) return 2;
  if(p[0] === 169 && p[1] === 254) return 9; // sin DHCP: casi nunca sirve
  return 5;
}
// [{iface, ip}] ordenadas: WiFi/ethernet de casa primero, redes virtuales al final.
function lanAddresses(){
  const out = [];
  const ifs = os.networkInterfaces();
  for(const name of Object.keys(ifs)) for(const a of ifs[name] || []){
    if(a.family !== "IPv4" && a.family !== 4) continue;
    if(a.internal) continue;
    out.push({ iface: name, ip: a.address, virtual: VIRTUAL_IF.test(name) });
  }
  out.sort((a, b) => (a.virtual - b.virtual) || (privateRank(a.ip) - privateRank(b.ip)));
  return out;
}

/* ---------------- servidor estático (solo lo que necesita el juego) ---------------- */
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav",
  ".m4a": "audio/mp4", ".mp4": "video/mp4", ".webm": "video/webm", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".txt": "text/plain; charset=utf-8" };
const PUBLIC_DIRS = ["assets", "css", "js", "legal"];
const PUBLIC_FILES = new Set(["index.html", "manifest.webmanifest", "sw.js", "favicon.ico"]);
function resolveStatic(urlPath){
  let rel;
  try{ rel = decodeURIComponent(urlPath); }catch(e){ return null; }
  if(rel.includes("\0") || rel.includes("\\")) return null;
  rel = rel.replace(/^\/+/, "") || "index.html";
  const parts = rel.split("/");
  if(parts.some(p => p === ".." || p.startsWith("."))) return null;
  if(!(PUBLIC_FILES.has(rel) || (parts.length > 1 && PUBLIC_DIRS.includes(parts[0])))) return null;
  const file = path.join(ROOT, rel);
  if(!file.startsWith(ROOT + path.sep)) return null;
  return file;
}
let _indexCache = { mtime: 0, body: null };
function indexBody(file){
  const st = fs.statSync(file);
  if(_indexCache.mtime !== st.mtimeMs || !_indexCache.body){
    let html = fs.readFileSync(file, "utf8");
    // el juego sabe que lo sirve la anfitriona de una red local (js/net/net-core.js: netLanPage)
    const tag = "<script>window.__HORDA_LAN__=true;</script>";
    html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + tag) : tag + html;
    _indexCache = { mtime: st.mtimeMs, body: Buffer.from(html, "utf8") };
  }
  return _indexCache.body;
}
function serveStatic(req, res, urlPath){
  const file = resolveStatic(urlPath);
  if(!file){ res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }); res.end("No encontrado"); return; }
  let st;
  try{ st = fs.statSync(file); if(st.isDirectory()){ res.writeHead(404); res.end(); return; } }catch(e){ res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }); res.end("No encontrado"); return; }
  const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
  const headers = { "content-type": type, "cache-control": "no-cache", "x-content-type-options": "nosniff", "accept-ranges": "bytes" };
  if(path.basename(file) === "index.html" && file === path.join(ROOT, "index.html")){
    const body = indexBody(file);
    res.writeHead(200, Object.assign(headers, { "content-length": body.length }));
    if(req.method === "HEAD") return res.end();
    return res.end(body);
  }
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
  if(range && (range[1] || range[2])){
    let start = range[1] ? parseInt(range[1], 10) : Math.max(0, st.size - parseInt(range[2], 10));
    let end = range[1] && range[2] ? parseInt(range[2], 10) : st.size - 1;
    end = Math.min(end, st.size - 1);
    if(start > end || start >= st.size){ res.writeHead(416, { "content-range": "bytes */" + st.size }); res.end(); return; }
    res.writeHead(206, Object.assign(headers, { "content-range": `bytes ${start}-${end}/${st.size}`, "content-length": end - start + 1 }));
    if(req.method === "HEAD") return res.end();
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, Object.assign(headers, { "content-length": st.size }));
  if(req.method === "HEAD") return res.end();
  fs.createReadStream(file).pipe(res);
}

/* ---------------- puerto libre ---------------- */
function portFree(port, host){
  return new Promise(resolve => {
    const s = net.createServer();
    s.once("error", () => resolve(false));
    s.once("listening", () => s.close(() => resolve(true)));
    s.listen(port, host || undefined);
  });
}

function ensureWs(){
  const dir = path.join(ROOT, "server");
  try{ require.resolve("ws", { paths: [dir] }); return true; }catch(e){}
  if(args.includes("--no-install")){ console.error("Falta el módulo `ws`. Ejecutá: npm install --prefix server"); return false; }
  console.log("Primera vez: instalando el servidor de salas (npm install en server/, necesita internet una sola vez)…");
  const r = cp.spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["install", "--omit=dev", "--no-audit", "--no-fund", "--prefix", dir], { stdio: "inherit", shell: process.platform === "win32" });
  try{ require.resolve("ws", { paths: [dir] }); return true; }catch(e){}
  console.error("No se pudo instalar `ws` (" + (r.status) + "). Conectate a internet y ejecutá: npm install --prefix server");
  return false;
}

async function main(){
  if(!ensureWs()) process.exit(1);
  const host = String(opt("host", "") === true ? "" : opt("host", "")).trim();
  const want = parseInt(String(opt("port", process.env.PORT || "8080")), 10) || 8080;
  let port = want;
  for(let i = 0; i < 20 && !(await portFree(port, host)); i++) port = want + i + 1;
  if(!(await portFree(port, host))){ console.error("No encontré un puerto libre cerca de " + want + ". Probá con --port 9000"); process.exit(1); }
  if(port !== want) say(`(El puerto ${want} estaba ocupado: uso el ${port})`);

  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "la-horda-lan-"));
  process.env.PORT = String(port); process.env.LA_HORDA_LAN = "1"; process.env.DATA_DIR = dataDir;
  if(host) process.env.HOST = host; else delete process.env.HOST;
  delete process.env.DATABASE_URL; delete process.env.ALLOWED_ORIGINS; delete process.env.ALLOWED_ORIGINS_STRICT;
  const relay = require(path.join(ROOT, "server", "relay.js"));
  const server = relay.server;
  const original = server.listeners("request").slice();
  server.removeAllListeners("request");
  server.on("request", (req, res) => {
    const p = (req.url || "/").split("?")[0];
    if(p === "/lan.json"){
      const urls = lanAddresses().map(a => ({ iface: a.iface, ip: a.ip, url: `http://${a.ip}:${port}/`, virtual: a.virtual }));
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*" });
      res.end(JSON.stringify({ lan: true, port, protocol: 1, urls, primary: urls.length ? urls[0].url : "" }));
      return;
    }
    if(p === "/health" || p.startsWith("/api/")) return original.forEach(fn => fn.call(server, req, res));
    if(req.method !== "GET" && req.method !== "HEAD"){ res.writeHead(405); res.end(); return; }
    serveStatic(req, res, p);
  });

  const cleanup = () => { try{ fs.rmSync(dataDir, { recursive: true, force: true }); }catch(e){} };
  process.on("exit", cleanup);
  for(const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { say("\nLa fiesta terminó. ¡Hasta la próxima!"); cleanup(); process.exit(0); });

  const show = () => {
    const addrs = lanAddresses();
    say("");
    say("  ===========================================================");
    say("   LA HORDA · JUGAR EN RED LOCAL  (sin internet ni cuentas)");
    say("  ===========================================================");
    say(`   Esta compu (anfitriona):   http://localhost:${port}/`);
    if(!addrs.length){
      say("");
      say("   No encontré una red local. Conectá esta compu al WiFi de la casa");
      say("   (o activá el punto de acceso del celular) y volvé a ejecutar el comando.");
    } else {
      say("");
      say("   Invitados (celular o compu en la MISMA WiFi), abran:");
      for(const a of addrs) say(`      http://${a.ip}:${port}/` + (a.virtual ? `   (${a.iface}: red virtual, probablemente no sirva)` : `   (${a.iface})`));
      try{
        const qr = require(path.join(ROOT, "js", "net", "lan-qr.js"));
        say("");
        say("   Escaneá con la cámara del celular:");
        say(qr.ascii(`http://${addrs[0].ip}:${port}/`).split("\n").map(l => "     " + l).join("\n"));
      }catch(e){}
    }
    say("");
    say("   1) Abrí http://localhost:" + port + "/ en esta compu → JUGAR → MODOS Y MULTIJUGADOR → Jugar en red local.");
    say("   2) «Crear sala local»: la Sala muestra el código y el QR para los demás.");
    say("   Si los celulares no entran: firewall de Windows / «Red privada» (ver docs/beta-release/MULTIJUGADOR_LOCAL.md).");
    say("   Para terminar: Ctrl+C");
    say("");
  };
  const ready = () => { show(); if(args.includes("--json")) console.log(JSON.stringify({ lanReady: true, port })); };
  if(server.listening) ready(); else server.once("listening", ready);
}
if(require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { lanAddresses, resolveStatic, privateRank };
