#!/usr/bin/env node
"use strict";
/* ============================================================
   tools/lan/mandos.js — CELULARES COMO MANDO (API privada de la red local)

   La compu muestra la partida en la pantalla grande; cada celular de la misma WiFi abre una página
   liviana con joystick y botones y maneja a un guardián. El celular NO corre el juego: solo manda
   el joystick y los toques, 30 veces por segundo como mucho.

   Lo levanta tools/lan/host.js en el puerto siguiente al del juego (8080 -> 8081). Suelto también:
       node tools/lan/mandos.js [--port 8081]
   Rutas:
     GET  /            la página del mando (tools/lan/mando.html). Pide ?k=CLAVE.
     WS   /ws?rol=pantalla&k=CLAVE   la partida en la compu (una sola; la última que entra manda)
     WS   /ws?rol=mando&k=CLAVE&id=ID  cada celular (hasta 8; el id lo guarda el celular para reconectar)
   PRIVADA: sin la CLAVE (al azar en cada arranque, va dentro del QR) no entra nadie. Sin internet, sin datos
   personales: solo viaja el nombre que cada uno escribe en su celular.
   Mensajes mando -> pantalla: {t:"in", x, y, b} joystick (-1..1) y ataque mantenido · {t:"hab", i:0..2} ·
     {t:"ulti"} · {t:"nombre", n} · {t:"elegir", c} · {t:"pausa"}. El servidor les agrega {de:id}.
   Mensajes pantalla -> mando: {para:id, ...} (estado: héroe, color, vida, lista de campeones, vibrar).
   ============================================================ */
const fs = require("fs"), path = require("path"), http = require("http"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = path.join(__dirname, "mando.html");
const MAX_MANDOS = 8, MAX_BYTES = 2048, MAX_PANTALLA = 65536;

function crear(opts){
  opts = opts || {};
  const clave = opts.clave || crypto.randomBytes(4).toString("hex");
  let WebSocketServer;
  try{ ({ WebSocketServer } = require("ws")); }catch(e){ ({ WebSocketServer } = require(path.join(ROOT, "server", "node_modules", "ws"))); }
  const server = http.createServer((req, res) => {
    const u = new URL(req.url || "/", "http://x");
    if(u.pathname === "/" || u.pathname === "/mando" || u.pathname === "/mando.html"){
      if(u.searchParams.get("k") !== clave){ res.writeHead(403, { "content-type": "text/plain; charset=utf-8" }); res.end("Falta la clave: escaneá el QR que muestra la pantalla de la compu."); return; }
      const body = fs.readFileSync(PAGE);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
      res.end(body); return;
    }
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }); res.end("No encontrado");
  });
  const wss = new WebSocketServer({ server, path: "/ws", maxPayload: MAX_PANTALLA });
  wss.on("error", () => {});
  let pantalla = null;
  const mandos = new Map(); // id -> ws
  const aPantalla = obj => { if(pantalla && pantalla.readyState === 1) pantalla.send(JSON.stringify(obj)); };
  wss.on("connection", (ws, req) => {
    ws.on("error", () => { try{ ws.terminate(); }catch(e){} }); // una conexión rota no tumba el servidor
    const u = new URL(req.url || "/", "http://x");
    if(u.searchParams.get("k") !== clave){ ws.close(4003, "clave"); return; }
    const rol = u.searchParams.get("rol");
    if(rol === "pantalla"){
      if(pantalla && pantalla !== ws) try{ pantalla.close(4000, "otra pantalla"); }catch(e){}
      pantalla = ws;
      ws.send(JSON.stringify({ t: "hola", mandos: [...mandos.keys()] }));
      ws.on("message", raw => {
        let m; try{ m = JSON.parse(raw); }catch(e){ return; }
        if(!m || typeof m !== "object") return;
        const envia = (id, o) => { const c = mandos.get(id); if(c && c.readyState === 1) c.send(JSON.stringify(o)); };
        if(m.para === "*") for(const id of mandos.keys()) envia(id, m); else if(typeof m.para === "string") envia(m.para, m);
      });
      ws.on("close", () => { if(pantalla === ws) pantalla = null; for(const c of mandos.values()) try{ c.send(JSON.stringify({ t: "sinPantalla" })); }catch(e){} });
      return;
    }
    if(rol !== "mando"){ ws.close(4001, "rol"); return; }
    let id = String(u.searchParams.get("id") || "").replace(/[^a-z0-9]/gi, "").slice(0, 16) || crypto.randomBytes(4).toString("hex");
    if(!mandos.has(id) && mandos.size >= MAX_MANDOS){ ws.close(4002, "lleno"); return; }
    const viejo = mandos.get(id); if(viejo && viejo !== ws) try{ viejo.close(4000, "reconectado"); }catch(e){}
    mandos.set(id, ws);
    ws.send(JSON.stringify({ t: "id", id, pantalla: !!pantalla }));
    aPantalla({ t: "entra", de: id });
    let ultimo = 0;
    ws.on("message", raw => {
      if(raw.length > MAX_BYTES) return; // un mando solo manda joystick y toques
      let m; try{ m = JSON.parse(raw); }catch(e){ return; }
      if(!m || typeof m.t !== "string") return;
      if(m.t === "in"){ const ahora = Date.now(); if(ahora - ultimo < 25) return; ultimo = ahora; }
      m.de = id; aPantalla(m);
    });
    ws.on("close", () => { if(mandos.get(id) === ws){ mandos.delete(id); aPantalla({ t: "sale", de: id }); } });
  });
  return { server, wss, clave, cerrar(){ try{ wss.close(); server.close(); }catch(e){} } };
}

if(require.main === module){
  const i = process.argv.indexOf("--port"); const port = i > 0 ? +process.argv[i + 1] : 8081;
  const m = crear();
  m.server.listen(port, () => console.log(`Mandos en el puerto ${port} · clave ${m.clave}\nPantalla: abrí el juego con ?mandos=${port}:${m.clave}`));
}
module.exports = { crear };
