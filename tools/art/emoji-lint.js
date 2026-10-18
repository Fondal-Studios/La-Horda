#!/usr/bin/env node
"use strict";
/* ============================================================
   tools/art/emoji-lint.js
   Linter de EMOJIS DE COLOR visibles al jugador (ART_BIBLE §1 / §14: un solo lenguaje de píxel).
   Los emojis de color se dibujan con la fuente del sistema y cambian entre Android, iOS y Windows; la UI
   usa íconos pixel 16x16 (js/ui/pixel-icons.js). Este barrido lista, por archivo, lo que queda.

   Qué cuenta como emoji de COLOR (nivel "color"):
     - Emoji_Presentation (🪙 ⚡ ⏳ ⛩ ✅ …), cualquier pictograma seguido de U+FE0F,
     - pictogramas astrales (U+1F000+: 🗡 🛡 🕳 …) que todos los sistemas pintan en color,
     - la lista RIESGO: glifos "de texto" que Android/iOS suelen pintar en color (⚔ ⚠ ☠ ⚙ ❄ ☀ ☁ ♨ ⚗ ❤ …).
   Nivel "mono" (✦ ✔ ★ ✚ ◆ → ▸ …): dingbats monocromos. Las fuentes pixel del juego (Press Start 2P, VT323)
   NO traen ninguno (solo ↑ ↓), así que caen a la fuente del sistema: se informan pero no rompen --strict.

   Se ignoran: comentarios (JS, CSS, HTML) y líneas de consola (console.*).
   Un emoji de color "cubierto" (está en PXI_EMOJI de pixel-icons.js) se convierte solo en ícono pixel cuando va
   en un nodo de texto del DOM; deja de estar cubierto -y falla- en contextos que no son DOM: canvas
   (fillText/strokeText), <option>, placeholder, alert/confirm/prompt, document.title.

   Uso:
     node tools/art/emoji-lint.js                 # informe: color por archivo + totales
     node tools/art/emoji-lint.js --mono          # además lista los dingbats monocromos por archivo
     node tools/art/emoji-lint.js --json          # salida JSON
     node tools/art/emoji-lint.js --strict        # exit 1 si hay color sin cubrir ni excepción
     node tools/art/emoji-lint.js --self-test
   Excepciones: tools/art/emoji-lint-exceptions.json ("files": archivo → motivo; "glyphs": glifo → motivo).
   ============================================================ */
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "../..");
const args = new Set(process.argv.slice(2));

const RISK = new Set(Array.from("⚔⚠☠⚙❄☀☁♨⚗❤⚜☂⚒⚰⚱⛓⛰☘☄⛈✈✉✂✏☎♟⛏⌛⌚☢☣☮☯☸☹☺♀♂♻♿⚛✡✝✌☝✍"));
const RX_COLOR_CP = /\p{Emoji_Presentation}/u;
const RX_PICTO = /\p{Extended_Pictographic}/u;
const MONO_RANGES = [[0x2190, 0x21FF], [0x2300, 0x23FF], [0x25A0, 0x27BF], [0x2B00, 0x2BFF], [0x2600, 0x26FF], [0x2900, 0x297F], [0x1F700, 0x1F77F]];

/** Clasifica un carácter (code point). Devuelve "color" | "mono" | null. */
function classify(ch, nextIsVS16){
  const cp = ch.codePointAt(0);
  if(cp < 0x2190) return null;
  if(cp >= 0x1F3FB && cp <= 0x1F3FF) return null;          // modificadores de tono de piel
  if(RX_COLOR_CP.test(ch)) return "color";
  if(nextIsVS16 && RX_PICTO.test(ch)) return "color";
  if(cp >= 0x1F000 && RX_PICTO.test(ch)) return "color";
  if(RISK.has(ch)) return "color";
  if(MONO_RANGES.some(([a, b])=>cp >= a && cp <= b)) return "mono";
  return null;
}

const blank = s=>s.replace(/[^\n]/g, " ");

/** Reemplaza comentarios por espacios (conserva saltos de línea). kind: js | css | html */
function stripComments(src, kind){
  if(kind === "html"){
    src = src.replace(/<!--[\s\S]*?-->/g, blank);
    src = src.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi, (m, a, b, c)=>a + (/\bsrc=/.test(a) ? b : stripComments(b, "js")) + c);
    src = src.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (m, a, b, c)=>a + stripComments(b, "css") + c);
    return src;
  }
  if(kind === "css") return src.replace(/\/\*[\s\S]*?\*\//g, blank);
  let out = "", i = 0, prev = "";                           // prev = último carácter significativo
  const n = src.length;
  while(i < n){
    const c = src[i], d = src[i + 1];
    if(c === "/" && d === "/"){ let j = src.indexOf("\n", i); if(j < 0) j = n; out += blank(src.slice(i, j)); i = j; continue; }
    if(c === "/" && d === "*"){ let j = src.indexOf("*/", i + 2); j = j < 0 ? n : j + 2; out += blank(src.slice(i, j)); i = j; continue; }
    if(c === "'" || c === '"'){
      let j = i + 1; while(j < n && src[j] !== c && src[j] !== "\n"){ if(src[j] === "\\") j++; j++; }
      out += src.slice(i, j + 1); i = j + 1; prev = c; continue;
    }
    if(c === "`"){
      let j = i + 1, from = i;
      while(j < n && src[j] !== "`"){
        if(src[j] === "\\"){ j += 2; continue; }
        if(src[j] === "$" && src[j + 1] === "{"){          // expresión: se procesa recursivamente hasta la llave que cierra
          let depth = 1, k = j + 2;
          while(k < n && depth){ if(src[k] === "{") depth++; else if(src[k] === "}") depth--; k++; }
          out += src.slice(from, j + 2) + stripComments(src.slice(j + 2, k - 1), "js") + "}";
          from = k; j = k; continue;
        }
        j++;
      }
      out += src.slice(from, j + 1); i = j + 1; prev = "`"; continue;
    }
    if(c === "/" && (prev === "" || "(,=:[!&|?{};+-*%<>~^".includes(prev))){  // literal de regex
      let j = i + 1, inCls = false;
      while(j < n && src[j] !== "\n"){ if(src[j] === "\\") j++; else if(src[j] === "[") inCls = true; else if(src[j] === "]") inCls = false; else if(src[j] === "/" && !inCls) break; j++; }
      out += src.slice(i, j + 1); i = j + 1; prev = "/"; continue;
    }
    out += c; if(!/\s/.test(c)) prev = c; i++;
  }
  return out;
}

const NON_DOM = /\b(fillText|strokeText|alert|confirm|prompt)\s*\(|<option\b|\bplaceholder\s*[=:]|document\.title\s*=/;
const CONSOLE = /\bconsole\s*\.\s*\w+\s*\(/;

function loadCovered(){
  const t = fs.readFileSync(path.join(ROOT, "js/ui/pixel-icons.js"), "utf8");
  const m = t.match(/const PXI_EMOJI\s*=\s*\{([\s\S]*?)\};/);
  const set = new Set();
  if(m) for(const mm of m[1].matchAll(/"([^"]+)"\s*:/g)) set.add(mm[1].replace(/️/g, ""));
  return set;
}

/** Analiza un texto. Devuelve [{line, ch, tier, covered, nonDom, text}] */
function scanText(src, kind, covered){
  const clean = stripComments(src, kind), lines = clean.split("\n"), found = [];
  lines.forEach((ln, idx)=>{
    if(CONSOLE.test(ln)) return;
    const cps = Array.from(ln);
    for(let k = 0; k < cps.length; k++){
      const ch = cps[k], tier = classify(ch, cps[k + 1] === "️");
      if(!tier) continue;
      found.push({line: idx + 1, ch, tier, covered: covered.has(ch), nonDom: NON_DOM.test(ln), text: ln.trim().slice(0, 140)});
    }
  });
  return found;
}

function listFiles(){
  const out = [], walk = d=>{
    for(const e of fs.readdirSync(d, {withFileTypes: true})){
      const p = path.join(d, e.name);
      if(e.isDirectory()) walk(p);
      else if(/\.(js|css)$/.test(e.name)) out.push(p);
    }
  };
  walk(path.join(ROOT, "js")); walk(path.join(ROOT, "css")); out.push(path.join(ROOT, "index.html"));
  return out;
}

function loadExceptions(){
  const p = path.join(__dirname, "emoji-lint-exceptions.json");
  if(!fs.existsSync(p)) return {files: {}, glyphs: {}};
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  return {files: j.files || {}, glyphs: j.glyphs || {}};
}

function run(){
  const covered = loadCovered(), ex = loadExceptions();
  const rep = {color: {}, mono: {}, violations: [], excepted: 0};
  const tot = {color: 0, mono: 0, covered: 0, uncovered: 0};
  for(const f of listFiles()){
    const rel = path.relative(ROOT, f).replace(/\\/g, "/");
    const kind = f.endsWith(".html") ? "html" : f.endsWith(".css") ? "css" : "js";
    const hits = scanText(fs.readFileSync(f, "utf8"), kind, covered);
    for(const h of hits){
      (rep[h.tier][rel] = rep[h.tier][rel] || {})[h.ch] = (rep[h.tier][rel][h.ch] || 0) + 1;
      tot[h.tier]++;
      if(h.tier !== "color") continue;
      if(h.covered && !h.nonDom){ tot.covered++; continue; }
      tot.uncovered++;
      if(ex.files[rel] !== undefined || ex.glyphs[h.ch] !== undefined){ rep.excepted++; continue; }
      rep.violations.push({file: rel, line: h.line, ch: h.ch, why: h.covered ? "cubierto pero en contexto no-DOM" : "sin ícono pixel", text: h.text});
    }
  }
  return {rep, tot};
}

function selfTest(){
  const cov = new Set(["🪙"]);
  const t = (src, kind, exp, label)=>{
    const got = scanText(src, kind, cov).map(h=>h.ch + ":" + h.tier).join(",");
    if(got !== exp){ console.error("FALLA " + label + ": esperaba [" + exp + "] y dio [" + got + "]"); process.exitCode = 1; }
  };
  t("// 🔥 comentario\nconst a='🔑';", "js", "🔑:color", "comentario //");
  t("/* 🔥 */ const a=`x ${'⚡'} y`;", "js", "⚡:color", "comentario /* */ y plantilla");
  t("console.log('🔥 x');\nel.textContent='✦ ✔ ★';", "js", "✦:mono,✔:mono,★:mono", "consola y mono");
  t("x='⚔ ⚠ ❤';", "js", "⚔:color,⚠:color,❤:color", "riesgo");
  t("<!-- 🎨 --><b>🎨</b>", "html", "🎨:color", "comentario html");
  t("a{content:'🔒'} /* 🔒 */", "css", "🔒:color", "css");
  t("const r=/['\"]🔥/; const q='🏆';", "js", "🔥:color,🏆:color", "regex con comillas");
  const h = scanText("ctx.fillText('🪙',1,1)", "js", cov)[0];
  if(!h || !h.nonDom || !h.covered){ console.error("FALLA nonDom"); process.exitCode = 1; }
  if(!process.exitCode) console.log("emoji-lint self-test OK");
}

if(require.main === module){
  if(args.has("--self-test")) selfTest();
  else {
    const {rep, tot} = run();
    if(args.has("--json")) console.log(JSON.stringify({totals: tot, color: rep.color, violations: rep.violations}, null, 1));
    else {
      const dump = (title, obj)=>{
        const rows = Object.entries(obj).map(([f, m])=>[f, Object.values(m).reduce((a, b)=>a + b, 0), Object.entries(m).sort((a, b)=>b[1] - a[1]).map(([c, n])=>c + "x" + n).join(" ")]).sort((a, b)=>b[1] - a[1]);
        console.log("\n" + title + " (" + rows.reduce((a, r)=>a + r[1], 0) + ")");
        rows.forEach(r=>console.log(String(r[1]).padStart(4) + "  " + r[0] + "   " + r[2]));
      };
      dump("EMOJIS DE COLOR por archivo", rep.color);
      if(args.has("--mono")) dump("DINGBATS MONOCROMOS por archivo (informativo)", rep.mono);
      console.log("\nTotales: color=" + tot.color + " (cubiertos por pixel-icons=" + tot.covered + ", sin cubrir=" + tot.uncovered + ", con excepcion=" + rep.excepted + ") mono=" + tot.mono);
      if(rep.violations.length){
        console.log("\nVIOLACIONES (" + rep.violations.length + "):");
        rep.violations.slice(0, args.has("--all") ? 1e9 : 60).forEach(v=>console.log("  " + v.file + ":" + v.line + "  " + v.ch + "  [" + v.why + "]  " + v.text));
        if(rep.violations.length > 60 && !args.has("--all")) console.log("  ... (--all para ver todas)");
      } else console.log("\nSin violaciones.");
    }
    if(args.has("--strict") && rep.violations.length){ console.error("\nemoji-lint --strict: " + rep.violations.length + " emoji(s) de color sin icono pixel ni excepcion documentada."); process.exit(1); }
  }
}
module.exports = {classify, scanText, stripComments};
