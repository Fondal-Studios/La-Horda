"use strict";
// Prueba en navegador de la parte legal del juego (js/ui/legal.js): enlaces en título / Opciones / tienda de Brasas,
// casilla obligatoria al crear cuenta, aviso de primera compra, páginas legal/*.html y que nada se salga de pantalla
// a 844x390 y 667x375. NO llama a ningún servidor de cuentas ni de pagos (bloquea toda red que no sea este servidor local).
//   node tools/release/legal-test.js [--shots DIR]      (usa un puerto libre; sirve ESTE árbol y lo verifica por /proc/<pid>/cwd)
const assert = require("node:assert/strict"), { spawn } = require("node:child_process"), fs = require("node:fs"), path = require("node:path"), net = require("node:net");
let chromium; try{ ({ chromium } = require("playwright")); }catch(e){ ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const ROOT = path.resolve(__dirname, "../..");
const shots = process.argv.includes("--shots") ? path.resolve(process.argv[process.argv.indexOf("--shots") + 1]) : "";
const freePort = () => new Promise((ok, ko) => { const s = net.createServer(); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => ok(p)); }); s.on("error", ko); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0;
const ok = m => { pass++; console.log("  ok  " + m); };

(async () => {
  const port = await freePort();
  const srv = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: ROOT, stdio: "ignore" });
  try{
    await sleep(600);
    assert.equal(fs.realpathSync("/proc/" + srv.pid + "/cwd"), fs.realpathSync(ROOT), "el servidor de prueba NO sirve este árbol");
    ok("servidor local en :" + port + " sirve este árbol (cwd verificado)");
    const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || chromium.executablePath(), args: ["--no-sandbox"] });
    try{
      for(const [w, h] of [[844, 390], [667, 375]]){
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
        const page = await ctx.newPage(), errs = [];
        page.on("pageerror", e => errs.push(e.message));
        await page.route(u => !u.href.startsWith("http://127.0.0.1:" + port), r => r.abort());   // nada sale a Internet
        await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => typeof startRun === "function" && !!window.HordaLegal, null, { timeout: 120000 });
        await sleep(800);
        const tag = `${w}x${h}`;
        // 1) título
        const t = await page.evaluate(() => { const b = document.getElementById("legal-title"); const r = b.getBoundingClientRect(); return { links: [...b.querySelectorAll("a")].map(a => a.getAttribute("href")), txt: b.textContent, inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, vis: r.width > 0 }; });
        assert.deepEqual(t.links.slice(0, 3), ["legal/privacidad.html", "legal/terminos.html", "legal/reembolsos.html"]);
        assert.ok(t.vis && t.inside, "enlaces del título dentro de la pantalla");
        assert.match(t.txt, /borrador/i); assert.match(t.txt, /Soporte: correo sin configurar/);
        ok(`${tag} título: 3 enlaces + marca de borrador + soporte sin configurar`);
        if(shots) { fs.mkdirSync(shots, { recursive: true }); await page.screenshot({ path: path.join(shots, `titulo-${tag}.png`) }); }
        // 2) Opciones
        await page.evaluate(() => { setState("mainmenu"); renderMainMenu(); document.getElementById("hub-options").classList.remove("hidden"); });
        await sleep(300);
        const o = await page.evaluate(() => { const b = document.getElementById("legal-opts"); b.scrollIntoView({ block: "center" }); return { n: b.querySelectorAll("a[href^='legal/']").length }; });
        assert.equal(o.n, 3); ok(`${tag} Opciones: sección Legal y soporte con 3 enlaces`);
        if(shots) await page.screenshot({ path: path.join(shots, `opciones-${tag}.png`) });
        await page.evaluate(() => document.getElementById("hub-options").classList.add("hidden"));
        // 3) tienda de Brasas
        await page.evaluate(() => { window.__premiumStub = true; setState("shop"); shopTab = "brasas"; renderShop(); });
        await sleep(400);
        const s = await page.evaluate(() => { const p = document.querySelector("#shop-panel .legal-shop"); return p ? { n: p.querySelectorAll("a[href^='legal/']").length, t: p.textContent } : null; });
        assert.ok(s && s.n === 3, "la tienda de Brasas muestra los enlaces legales"); assert.match(s.t, /Reembolsos/);
        ok(`${tag} tienda de Brasas: aviso + 3 enlaces`);
        if(shots) { await page.evaluate(() => document.querySelector("#shop-panel .legal-shop").scrollIntoView({ block: "center" })); await page.screenshot({ path: path.join(shots, `tienda-${tag}.png`) }); }
        // 4) crear cuenta: casilla obligatoria
        await page.evaluate(() => { _acctShow(); _acctRenderAuth("register"); });
        await sleep(300);
        const a0 = await page.evaluate(() => ({ cb: !!document.getElementById("legal-consent-cb"), checked: document.getElementById("legal-consent-cb")?.checked, txt: document.querySelector(".legal-consent")?.textContent || "" }));
        assert.ok(a0.cb && !a0.checked); assert.match(a0.txt, /13 años o más/); assert.match(a0.txt, /menor de 18/);
        ok(`${tag} crear cuenta: casilla (edad y menores) sin marcar`);
        await page.evaluate(() => { window.__submits = 0; document.querySelector(".acc-form").addEventListener("submit", () => { window.__submits++; }); });
        await page.fill("#acc-user", "probador"); await page.fill("#acc-pass", "secreto1"); await page.fill("#acc-pass2", "secreto1");
        await page.evaluate(() => { document.getElementById("acc-submit").scrollIntoView({ block: "center" }); });
        if(shots) await page.screenshot({ path: path.join(shots, `cuenta-${tag}.png`) });
        // sin marcar: el registro NO sigue (el formulario de account.js no recibe el envío) y se avisa
        await page.evaluate(() => { let called = 0; const orig = window.accountFetch; window.__fetchCalls = 0; window.accountFetch = function(){ window.__fetchCalls++; return Promise.reject(new Error("bloqueado en la prueba")); }; });
        await page.click("#acc-submit");
        await sleep(200);
        const a1 = await page.evaluate(() => ({ calls: window.__fetchCalls, msg: document.querySelector(".acc-status").textContent, focus: document.activeElement && document.activeElement.id }));
        assert.equal(a1.calls, 0, "sin la casilla no se llama al servidor"); assert.match(a1.msg, /aceptás los Términos/); assert.equal(a1.focus, "legal-consent-cb");
        ok(`${tag} crear cuenta sin aceptar: bloqueado, mensaje claro y foco en la casilla`);
        await page.check("#legal-consent-cb"); await page.click("#acc-submit"); await sleep(300);
        const a2 = await page.evaluate(() => ({ calls: window.__fetchCalls, rec: JSON.parse(localStorage.getItem("horda_legal_terms") || "null") }));
        assert.ok(a2.calls >= 1, "con la casilla marcada el registro sigue su camino"); assert.ok(a2.rec && a2.rec.via === "register" && a2.rec.v);
        ok(`${tag} crear cuenta aceptando: sigue, y se guarda solo versión + fecha en este navegador`);
        // 5) primera compra con dinero real
        await page.evaluate(() => { document.getElementById("account-screen").classList.add("hidden"); localStorage.removeItem("horda_legal_buy"); window.__buyClicks = 0;
          const b = document.createElement("button"); b.id = "fake-buy"; b.setAttribute("data-brasas-buy", "x"); b.textContent = "Comprar"; b.style.cssText = "position:fixed;left:10px;top:10px;z-index:99999;width:80px;height:44px";
          b.addEventListener("click", () => { window.__buyClicks++; }); document.body.append(b); });
        await page.click("#fake-buy"); await sleep(250);
        assert.equal(await page.evaluate(() => window.__buyClicks), 0, "el click NO llega a la compra antes de aceptar");
        assert.ok(await page.isVisible(".legal-modal"), "aparece el aviso de primera compra");
        if(shots) await page.screenshot({ path: path.join(shots, `compra-${tag}.png`) });
        const box = await page.evaluate(() => { const r = document.querySelector(".legal-modal .ui-modal-panel").getBoundingClientRect(); return r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1; });
        ok(`${tag} primera compra: bloquea el click y muestra el aviso` + (box ? "" : " (el panel scrollea)"));
        await page.click(".legal-modal .btn:not(.secondary)"); await sleep(150);
        assert.equal(await page.evaluate(() => window.__buyClicks), 0); assert.match(await page.textContent(".legal-err"), /Marcá la casilla/);
        await page.check("#legal-buy-cb"); await page.click(".legal-modal .btn:not(.secondary)"); await sleep(300);
        assert.equal(await page.evaluate(() => window.__buyClicks), 1, "tras aceptar, la compra sigue exactamente una vez");
        await page.click("#fake-buy"); await sleep(200);
        assert.equal(await page.evaluate(() => window.__buyClicks), 2); assert.ok(!(await page.isVisible(".legal-modal").catch(() => false)));
        ok(`${tag} primera compra: sin casilla no avanza; con casilla avanza una vez y no vuelve a preguntar`);
        assert.deepEqual(errs, [], "errores de JS: " + errs.join(" | "));
        await ctx.close();
      }
      // 6) páginas estáticas
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const page = await ctx.newPage();
      for(const f of ["index", "privacidad", "terminos", "reembolsos"]){
        const r = await page.goto(`http://127.0.0.1:${port}/legal/${f}.html`);
        assert.equal(r.status(), 200);
        const d = await page.evaluate(() => ({ draft: !!document.querySelector(".draft"), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h1: document.querySelector("h1")?.textContent }));
        assert.ok(d.draft, f + ": aviso de borrador visible"); assert.ok(d.sw <= d.cw + 1, f + ": sin scroll horizontal en móvil (" + d.sw + ">" + d.cw + ")");
        if(shots && f === "privacidad") await page.screenshot({ path: path.join(shots, "legal-privacidad-390x844.png") });
      }
      ok("legal/*.html: 200, aviso de borrador visible, sin scroll horizontal a 390px");
      await ctx.close();
    } finally { await browser.close(); }
  } finally { try{ process.kill(srv.pid); }catch(e){} }
  console.log(`\nLEGAL OK: ${pass} comprobaciones`);
})().catch(e => { console.error("FALLÓ:", e && e.stack || e); process.exitCode = 1; });
