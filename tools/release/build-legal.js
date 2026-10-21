"use strict";
// Genera las páginas legales estáticas (legal/*.html) desde los borradores de docs/legal/*.md y js/data/legal-config.js.
//   node tools/release/build-legal.js            -> escribe legal/index.html, privacidad.html, terminos.html, reembolsos.html
//   node tools/release/build-legal.js --check    -> no escribe; sale con error (1) si legal/ está desactualizado respecto de docs/ y la config
//   node tools/release/build-legal.js --out DIR  -> escribe en otra carpeta
// Sin dependencias. Lo que está entre [CORCHETES] en los borradores se resalta como "falta completar".
// La sección "Notas para quien revisa" de cada borrador es INTERNA y no se publica.
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "../..");
const argv = process.argv.slice(2);
const outDir = argv.includes("--out") ? path.resolve(argv[argv.indexOf("--out") + 1]) : path.join(ROOT, "legal");

const DOCS = [
  { slug: "privacidad", src: "POLITICA_DE_PRIVACIDAD.md", name: "Privacidad" },
  { slug: "terminos", src: "TERMINOS_Y_CONDICIONES.md", name: "Términos" },
  { slug: "reembolsos", src: "POLITICA_DE_REEMBOLSOS.md", name: "Reembolsos" }
];

function loadConfig(){
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/data/legal-config.js"), "utf8") + "\n;this.__L = HORDA_LEGAL;", ctx, { timeout: 1000 });
  return ctx.__L;
}
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(text, cfg){
  let t = esc(text);
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
  // datos que sí están en la configuración
  const mail = cfg.supportEmail && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(cfg.supportEmail) ? cfg.supportEmail : "";
  const pmail = (cfg.privacyEmail && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(cfg.privacyEmail)) ? cfg.privacyEmail : mail;
  const link = m => `<a href="mailto:${esc(m)}">${esc(m)}</a>`;
  if(mail) t = t.replace(/\[CORREO DE SOPORTE\]/g, link(mail));
  if(pmail) t = t.replace(/\[CORREO DE PRIVACIDAD\]/g, link(pmail));
  if(cfg.supportHours) t = t.replace(/\[HORARIO DE ATENCIÓN\]/g, esc(cfg.supportHours));
  if(cfg.minAge) t = t.replace(/\[EDAD MÍNIMA(?:, p\. ej\. \d+)?\]/g, String(cfg.minAge | 0));
  // lo que queda entre corchetes lo tiene que completar el titular: se marca bien visible
  t = t.replace(/\[([^\]<>]{1,200})\]/g, '<mark class="ph" title="Falta completar o revisar con el abogado">[$1]</mark>');
  return t;
}

function mdToHtml(md, cfg){
  const lines = md.replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0, title = "", para = [];
  const flush = () => { if(para.length){ out.push("<p>" + inline(para.join(" "), cfg) + "</p>"); para = []; } };
  while(i < lines.length){
    const ln = lines[i];
    if(/^## Notas para quien revisa/i.test(ln)) break;          // sección interna: no se publica
    if(!ln.trim()){ flush(); i++; continue; }
    let m;
    if((m = /^(#{1,3})\s+(.*)$/.exec(ln))){
      flush();
      if(m[1].length === 1){ if(!title) title = m[2]; i++; continue; }  // el título va en la cabecera de la página
      const lvl = m[1].length; const id = m[2].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      out.push(`<h${lvl} id="${id}">${inline(m[2], cfg)}</h${lvl}>`); i++; continue;
    }
    if(/^>\s?/.test(ln)){ flush(); const q = []; while(i < lines.length && /^>\s?/.test(lines[i])){ q.push(lines[i].replace(/^>\s?/, "")); i++; } out.push("<blockquote>" + inline(q.join(" "), cfg) + "</blockquote>"); continue; }
    if(/^\s*[-*]\s+/.test(ln)){ flush(); const items = []; while(i < lines.length && /^\s*[-*]\s+/.test(lines[i])){ items.push(lines[i].replace(/^\s*[-*]\s+/, "")); i++; } out.push("<ul>" + items.map(x => "<li>" + inline(x, cfg) + "</li>").join("") + "</ul>"); continue; }
    if(/^\s*\d+[.)]\s+/.test(ln)){ flush(); const items = []; while(i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])){ items.push(lines[i].replace(/^\s*\d+[.)]\s+/, "")); i++; } out.push("<ol>" + items.map(x => "<li>" + inline(x, cfg) + "</li>").join("") + "</ol>"); continue; }
    if(/^\|/.test(ln)){
      flush(); const rows = [];
      while(i < lines.length && /^\|/.test(lines[i])){ rows.push(lines[i].trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim())); i++; }
      const head = rows[0], body = rows.slice(/^[\s:|-]+$/.test((rows[1] || []).join("")) ? 2 : 1);
      out.push('<div class="tbl"><table><thead><tr>' + head.map(c => "<th>" + inline(c, cfg) + "</th>").join("") + "</tr></thead><tbody>" +
        body.map(r => "<tr>" + r.map(c => "<td>" + inline(c, cfg) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>");
      continue;
    }
    if(/^---+\s*$/.test(ln)){ flush(); out.push("<hr>"); i++; continue; }
    para.push(ln.trim()); i++;
  }
  flush();
  return { title, html: out.join("\n") };
}

const CSS = `
:root{--bg:#120c08;--panel:#1e130c;--line:#4a2a14;--text:#f3ead8;--dim:#c9b9a2;--gold:#f9c971;--ember:#ff7a2e;--warn-bg:#5a1d12;--warn-line:#ff9a6a}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font:17px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--gold)}
a:focus-visible,summary:focus-visible{outline:3px solid var(--ember);outline-offset:2px}
.draft{position:sticky;top:0;z-index:5;background:var(--warn-bg);border-bottom:3px solid var(--warn-line);color:#fff;padding:10px 16px;font-weight:700;text-align:center}
.wrap{max-width:46rem;margin:0 auto;padding:16px 16px 48px}
header.top{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between;margin:8px 0 18px}
.brand{font-weight:800;letter-spacing:.08em;color:var(--gold);text-decoration:none}
nav a{display:inline-block;padding:10px 8px;margin-right:4px;min-height:44px}
nav a[aria-current="page"]{color:#fff;text-decoration:none;border-bottom:3px solid var(--ember)}
h1{font-size:1.7rem;line-height:1.2;margin:.2em 0 .6em;color:var(--gold)}
h2{font-size:1.25rem;margin:1.8em 0 .5em;color:var(--gold);border-bottom:1px solid var(--line);padding-bottom:4px}
p,li{overflow-wrap:anywhere}
li{margin:.25em 0}
code{background:#000;padding:1px 5px;border-radius:3px}
blockquote{margin:1em 0;padding:10px 14px;background:var(--panel);border-left:5px solid var(--warn-line);color:var(--text)}
mark.ph{background:#fff3a8;color:#2b1d00;padding:0 3px;border-radius:3px}
.tbl{overflow-x:auto;margin:1em 0}
table{border-collapse:collapse;width:100%;min-width:30rem;font-size:.95rem}
th,td{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
th{background:var(--panel);color:var(--gold)}
.cards{display:grid;gap:12px;margin:16px 0}
.card{display:block;padding:14px 16px;background:var(--panel);border:2px solid var(--line);border-radius:8px;text-decoration:none;color:var(--text);min-height:44px}
.card b{display:block;color:var(--gold);font-size:1.1rem}
footer{margin-top:36px;color:var(--dim);font-size:.9rem;border-top:1px solid var(--line);padding-top:12px}
@media (max-width:520px){body{font-size:16px}h1{font-size:1.45rem}}
`;

function page(cfg, doc, bodyHtml, title){
  const nav = DOCS.map(d => `<a href="${d.slug}.html"${d.slug === doc ? ' aria-current="page"' : ""}>${d.name}</a>`).join("");
  const draft = cfg.draft ? `<div class="draft" role="note">BORRADOR, revisar con abogado. Este texto todavía no es válido ni definitivo.</div>` : "";
  const mail = cfg.supportEmail ? `<a href="mailto:${esc(cfg.supportEmail)}">${esc(cfg.supportEmail)}</a>` : "<mark class=\"ph\">[correo de soporte sin configurar]</mark>";
  return `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · La Horda</title>
<meta name="robots" content="${cfg.draft ? "noindex" : "index,follow"}">
<style>${CSS}</style>
</head>
<body>
${draft}
<div class="wrap">
<header class="top"><a class="brand" href="../">LA HORDA</a><nav aria-label="Documentos legales"><a href="./">Legal</a>${nav}</nav></header>
<main>
${bodyHtml}
</main>
<footer>Versión de los términos: ${esc(cfg.termsVersion)} · Soporte: ${mail}${cfg.supportHours ? " · " + esc(cfg.supportHours) : ""} · <a href="../">Volver al juego</a></footer>
</div>
</body>
</html>
`;
}

function buildAll(){
  const cfg = loadConfig(), files = {};
  const cards = [];
  for(const d of DOCS){
    const md = fs.readFileSync(path.join(ROOT, "docs/legal", d.src), "utf8");
    const r = mdToHtml(md, cfg);
    files[d.slug + ".html"] = page(cfg, d.slug, `<h1>${esc(r.title || d.name)}</h1>\n${r.html}`, r.title || d.name);
    cards.push(`<a class="card" href="${d.slug}.html"><b>${esc(r.title || d.name)}</b></a>`);
  }
  files["index.html"] = page(cfg, "", `<h1>Legal y soporte</h1>\n<p>Acá están las reglas del juego, cómo cuidamos tus datos y cómo pedir una devolución.</p>\n<div class="cards">${cards.join("")}</div>`, "Legal y soporte");
  return { files, cfg };
}

const { files, cfg } = buildAll();
if(argv.includes("--check")){
  let stale = 0;
  for(const [name, html] of Object.entries(files)){
    const f = path.join(outDir, name);
    if(!fs.existsSync(f) || fs.readFileSync(f, "utf8") !== html){ console.error("DESACTUALIZADO: " + path.relative(ROOT, f)); stale++; }
  }
  if(stale){ console.error("Corré: node tools/release/build-legal.js"); process.exit(1); }
  console.log("legal/ está al día con docs/legal/ y js/data/legal-config.js");
} else {
  fs.mkdirSync(outDir, { recursive: true });
  for(const [name, html] of Object.entries(files)) fs.writeFileSync(path.join(outDir, name), html);
  const left = Object.values(files).reduce((n, h) => n + (h.match(/class="ph"/g) || []).length, 0);
  console.log(`Escritas ${Object.keys(files).length} páginas en ${path.relative(ROOT, outDir) || "."}. Borrador: ${cfg.draft ? "SÍ" : "no"}. Marcas "falta completar" que quedan: ${left}.`);
}
