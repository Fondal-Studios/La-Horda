"use strict";
// ALLOWED_ORIGINS_STRICT=1 y HOST: con la variable, solo vale la lista; sin ella, todo sigue igual que siempre (se suman los de ALWAYS_ALLOWED).
// Levanta el relay real como proceso aparte en un puerto libre y lo apaga por PID.
const assert = require("node:assert/strict"), { spawn } = require("node:child_process"), net = require("node:net"), os = require("node:os"), fs = require("node:fs"), path = require("node:path");
const free = () => new Promise(r => { const s = net.createServer(); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(extra, fn){
  const port = await free(), dir = fs.mkdtempSync(path.join(os.tmpdir(), "horda-origins-"));
  const env = Object.assign({}, process.env, { PORT: String(port), DATA_DIR: dir, DATABASE_URL: "", ALLOWED_ORIGINS: "https://propio.example" }, extra);
  delete env.REQUIRE_PERSISTENT_ACCOUNTS;
  const child = spawn(process.execPath, [path.join(__dirname, "relay.js")], { env, stdio: ["ignore", "pipe", "pipe"] });
  let log = ""; child.stdout.on("data", d => log += d); child.stderr.on("data", d => log += d);
  try{
    for(let i = 0; i < 50 && !/RELAY_LISTENING/.test(log); i++) await sleep(100);
    assert.match(log, /RELAY_LISTENING/, "el relay no arrancó: " + log.slice(0, 300));
    await fn(port, log);
  } finally { try{ process.kill(child.pid); }catch(e){} await sleep(100); fs.rmSync(dir, { recursive: true, force: true }); }
}
const status = (port, origin) => fetch(`http://127.0.0.1:${port}/api/health`, { headers: { origin } }).then(r => r.status);
(async () => {
  await run({ ALLOWED_ORIGINS_STRICT: "1", HOST: "127.0.0.1" }, async (port, log) => {
    assert.equal(await status(port, "https://propio.example"), 200);
    assert.equal(await status(port, "https://fondalstudios.com"), 403, "estricto: fondalstudios.com NO está en la lista");
    assert.equal(await status(port, "https://raw.githack.com"), 403, "estricto: githack fuera");
    assert.equal(await status(port, "https://drmarianojimenez94-sudo.github.io"), 403, "estricto: GitHub Pages fuera");
    assert.match(log, /"host":"127\.0\.0\.1"/, "escucha solo en 127.0.0.1");
    console.log("PASS ALLOWED_ORIGINS_STRICT=1: solo la lista; HOST=127.0.0.1 escucha en el loopback");
  });
  await run({}, async (port, log) => {
    assert.equal(await status(port, "https://propio.example"), 200);
    assert.equal(await status(port, "https://fondalstudios.com"), 200, "sin la variable: ALWAYS_ALLOWED sigue sumándose");
    assert.equal(await status(port, "https://raw.githack.com"), 200);
    assert.equal(await status(port, "https://sitio-ajeno.invalid"), 403);
    assert.match(log, /"host":"\*"/, "sin HOST escucha en todas las interfaces, como siempre");
    console.log("PASS sin ALLOWED_ORIGINS_STRICT ni HOST: comportamiento de siempre");
  });
  console.log("OK 2 comprobaciones");
})().catch(e => { console.error("FAIL", e && e.stack || e); process.exitCode = 1; });
