"use strict";
// Prueba del relay en MODO RED LOCAL (LA_HORDA_LAN=1, tools/lan/host.js), sin navegador:
//   - /health avisa red local y no hay /api de cuentas (404) pero sí /api/rooms;
//   - la bandeja de recompensas de servidor queda apagada: "reward-*" se contesta vacío y la partida empieza y termina sin
//     escribir nada (ni siquiera con 4 jugadores y un "end" de victoria);
//   - lo demás (salas, reenvío, reconexión, host que se va) sigue idéntico al relay normal.
// Uso: node test-lan.js  (PORT=8797 para otro puerto)
process.env.PORT = process.env.PORT || "8797";
process.env.LA_HORDA_LAN = "1";
process.env.DATA_DIR = require("node:fs").mkdtempSync(require("node:path").join(require("node:os").tmpdir(), "la-horda-lan-test-"));
const { server, LAN, rooms } = require("./relay.js");
const WebSocket = require("ws");
const http = require("node:http");
const BUILD = require("node:vm").runInNewContext(require("node:fs").readFileSync(require("node:path").join(__dirname, "../js/net/net-config.js"), "utf8") + ";NET_CONFIG.build");
const URL = "ws://127.0.0.1:" + process.env.PORT;
let fails = 0;
const check = (name, ok, extra) => { console.log((ok ? "PASS " : "FAIL ") + name + (!ok && extra !== undefined ? "  " + JSON.stringify(extra) : "")); if(!ok) fails++; };
const get = p => new Promise(res => http.get({ host: "127.0.0.1", port: process.env.PORT, path: p }, r => { let b = ""; r.on("data", d => b += d); r.on("end", () => res({ status: r.statusCode, body: b })); }));
function client(){
  return new Promise(res => {
    const ws = new WebSocket(URL); const inbox = [];
    ws.on("message", b => inbox.push(JSON.parse(b.toString())));
    ws.on("open", () => res({ ws, inbox, send: o => ws.send(JSON.stringify(o)),
      wait: (pred, ms = 2500) => new Promise((ok, ko) => { const t0 = Date.now(); (function poll(){ const i = inbox.findIndex(pred); if(i >= 0) return ok(inbox.splice(i, 1)[0]); if(Date.now() - t0 > ms) return ko(new Error("timeout")); setTimeout(poll, 20); })(); }) }));
  });
}
(async () => {
  await new Promise(r => setTimeout(r, 300));
  check("lan.bandera_activa", LAN === true);
  const h = await get("/health"); check("lan.health", h.status === 200 && /red local/.test(h.body) && /cuentas: ninguna/.test(h.body), h.body);
  const a = await get("/api/account"); check("lan.sin_api_de_cuentas", a.status === 404 && /LAN/.test(a.body), a);
  const s = await get("/api/save"); check("lan.sin_guardado_en_la_nube", s.status === 404, s.status);
  const r0 = await get("/api/rooms"); check("lan.api_rooms_responde", r0.status === 200 && Array.isArray(JSON.parse(r0.body).rooms));

  const host = await client();
  host.send({ t: "create", protocol: 1, arena: "bosque", name: "Ana", champ: "guerrero", level: 5, clientId: "H", build: BUILD, public: true });
  const created = await host.wait(m => m.t === "joined"); const code = created.room.code;
  await new Promise(r => setTimeout(r, 1100)); // la lista pública se cachea 1 s
  check("lan.sala_publica_para_la_red", created.room.pub === true && JSON.parse((await get("/api/rooms")).body).rooms.some(x => x.code === code));
  host.send({ t: "reward-open", key: "a".repeat(64) });
  const rl = await host.wait(m => m.t === "reward-list"); check("lan.recompensas_de_servidor_apagadas", Array.isArray(rl.ids) && rl.ids.length === 0, rl);
  host.send({ t: "trade", op: "offer", to: 1 });
  const tr = await host.wait(m => m.t === "error"); check("lan.sin_intercambio", tr.code === "TRADE_OFF", tr);
  const guests = [];
  for(let i = 0; i < 3; i++){
    const g = await client();
    g.send({ t: "join", protocol: 1, code, name: "G" + i, champ: ["mago", "tanque", "soporte"][i], level: 3, clientId: "G" + i, build: BUILD });
    const j = await g.wait(m => m.t === "joined" || m.t === "error");
    check("lan.invitado" + (i + 1) + "_entra", j.t === "joined" && j.slot === i + 1, j);
    g.send({ t: "reward-open", key: String(i).repeat(64).slice(0, 64) }); await g.wait(m => m.t === "reward-list");
    guests.push(g);
  }
  const fifth = await client();
  fifth.send({ t: "join", protocol: 1, code, name: "Quinto", champ: "axiom", clientId: "X5", build: BUILD });
  const e5 = await fifth.wait(m => m.t === "error");
  check("lan.quinto_rechazado_tope_4", e5.code === "ROOM_FULL" && /4 como máximo/.test(e5.msg), e5);
  host.send({ t: "start" });
  const started = await guests[0].wait(m => m.t === "room" && m.room.state === "playing");
  check("lan.empieza_sin_bandeja", started.room.state === "playing");
  host.send({ t: "msg", d: { k: "start", arena: "bosque", seed: 7, slots: [] } });
  const m0 = await guests[1].wait(m => m.t === "msg"); check("lan.reenvio_anfitrion_a_invitados", m0.d.k === "start" && m0.from === 0);
  host.send({ t: "msg", d: { k: "end", victory: true } });
  const m1 = await guests[2].wait(m => m.t === "msg" && m.d.k === "end");
  check("lan.victoria_no_escribe_recompensas", m1.d.victory === true && !guests[2].inbox.some(m => m.t === "reward-committed") && !host.inbox.some(m => m.t === "reward-committed"), host.inbox);
  guests[0].send({ t: "msg", d: { k: "in", x: 1 } });
  check("lan.reenvio_invitado_a_anfitrion", (await host.wait(m => m.t === "msg")).from === 1);
  // reconexión con el mismo clientId (en partida conserva el lugar)
  guests[1].ws.close(); await new Promise(r => setTimeout(r, 200));
  const back = await client(); back.send({ t: "join", protocol: 1, code, name: "G1", champ: "tanque", level: 3, clientId: "G1", build: BUILD });
  const rj = await back.wait(m => m.t === "joined"); check("lan.reconexion_mismo_lugar", rj.slot === 2 && rj.reconnect === true, rj.slot);
  // el anfitrión se va: la sala se cierra
  host.ws.close();
  const closed = await guests[0].wait(m => m.t === "closed"); check("lan.anfitrion_se_va_cierra_la_sala", closed.reason === "host_left" && rooms.size === 0, closed);
  console.log(fails ? fails + " FALLAS" : "OK");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log("FAIL excepción", e.stack || e); process.exit(1); });
