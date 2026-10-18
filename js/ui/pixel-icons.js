"use strict";
/* ============================================================
   js/ui/pixel-icons.js
   ÍCONOS PIXEL 16×16 DIBUJADOS CON CÓDIGO en lugar de los emojis usados como íconos de interfaz
   (reseña §6.4 #2: "emojis como íconos (🏰 🌵 🎽)"). Cada ícono es una grilla de 16×16 con la paleta
   del juego (brasa, oro, piedra, cuero); el contorno oscuro de 1 px se calcula solo alrededor de lo
   pintado. Se dibujan una vez al cargar en un <canvas> y quedan como clases CSS (.pxi-moneda, …) con
   su imagen en data:URL: no hay archivos de arte nuevos.
   Uso:
     - Automático: en el DOM, cada emoji de PXI_EMOJI dentro de un texto se envuelve en
       <i class="pxi pxi-ID">emoji</i>. El emoji queda adentro (textContent / innerText / lectores de
       pantalla no cambian) pero no se ve: se ve el ícono pixel. Cubre textos fijos y los que arman los
       scripts (MutationObserver, como pixel-font-fix.js). No toca <option>, <title>, inputs ni el canvas.
     - A mano: pixelIconHTML("moneda").
   Los emojis que no están en PXI_EMOJI se quedan como están (ver la nota al final).
   ============================================================ */
// Paleta (colores del juego: css/base.css y el arte existente) — "." es transparente.
const PXI_PAL = {
  k:"#120806", // contorno (también se agrega solo)
  g:"#ffcf5c", G:"#b8742a", y:"#fff1b0",           // oro: medio, sombra, brillo
  s:"#8a8494", S:"#4e4a58", l:"#c8c2cc",           // piedra / acero
  b:"#8a5a2e", B:"#4a2c14", c:"#b88a52",           // cuero / madera
  r:"#c62828", R:"#6a1010", e:"#ff7a2e",           // sangre / brasa
  n:"#5aa845", N:"#2e5a24", m:"#9be07a",           // verde
  u:"#2f8fd6", U:"#173a52", i:"#8fd0ff",           // azul
  w:"#f2e3d3", W:"#b89a86"                          // pergamino
};
const PXI_ART = {
  moneda:[
    "................",
    "................",
    ".....GGGGGG.....",
    "...GGyyyyyyGG...",
    "..GyyggggggyyG..",
    "..GygGGGGGGgyG..",
    ".GygGggggggGgyG.",
    ".GygGgyyyygGgyG.",
    ".GygGgyyyygGgyG.",
    ".GygGggggggGgyG.",
    "..GygGGGGGGgyG..",
    "..GGyggggggyGG..",
    "...GGGyyyyGGG...",
    ".....GGGGGG.....",
    "................",
    "................"],
  libro:[
    "................",
    "...RRRRRRRRRRR..",
    "..RrrrrrrrrrrRw.",
    "..RgrrrrrrrrgRw.",
    "..RrrrrggrrrrRw.",
    "..RrrrgyygrrrRw.",
    "..RrrgyGGygrrRw.",
    "..RrrgyGGygrrRw.",
    "..RrrrgyygrrrRw.",
    "..RrrrrggrrrrRw.",
    "..RrrrrrrrrrrRw.",
    "..RgrrrrrrrrgRw.",
    "..RrrrrrrrrrrRw.",
    "..RRRRRRRRRRRRW.",
    "...WWWWWWWWWWW..",
    "................"],
  torre:[
    "................",
    "..s.s.s..s.s.s..",
    "..sssss..sssss..",
    "..slsls..slsls..",
    "..sSsSsssSsSsS..",
    "...sls.ss.sls...",
    "...sSs.sS.sSs...",
    "...slsssssssl...",
    "...sSsSSSSsSs...",
    "...sls.SS.sls...",
    "...sss.BB.sss...",
    "...sls.Bb.sls...",
    "...sSs.bB.sSs...",
    "..ssssssssssss..",
    "..SSSSSSSSSSSS..",
    "................"],
  cactus:[
    "................",
    "......nn........",
    ".....nmmn.......",
    ".....nmNn.......",
    ".n...nmNn...n...",
    "nmn..nmNn..nmn..",
    "nmn..nmNn..nmN..",
    "nmNnnnmNn..nmN..",
    ".nNNNnmNnnnmN...",
    "..nnnnmNNNNN....",
    ".....nmNnnn.....",
    ".....nmNn.......",
    "...bbnmNnbb.....",
    "..bcccccccccb...",
    "...BBBBBBBBB....",
    "................"],
  pechera:[
    "................",
    "...bbb....bbb...",
    "..bcccb..bcccb..",
    ".bccbbbbbbbbccb.",
    ".bcbcccccccccbcb",
    ".bcbcggccggcbcb.",
    "..bbcccccccccbb.",
    "...bccccgccccb..",
    "...bcBBBBBBBcb..",
    "...bcccccccccb..",
    "...bccccgccccb..",
    "...bcBBBBBBBcb..",
    "...bcccccccccb..",
    "...bbbbbbbbbbb..",
    "................",
    "................"],
  guantes:[
    "................",
    "....b.b.b.......",
    "...bcbcbcb......",
    "...bcbcbcb......",
    "...bcbcbcbb.....",
    "...bcccccbcb....",
    "...bcccccccb....",
    "...bccccccb.....",
    "...bccccccb.....",
    "...bcccccb......",
    "...BBBBBBB......",
    "...GgGgGgG......",
    "...bcccccb......",
    "...bbbbbbb......",
    "................",
    "................"],
  botas:[
    "................",
    "....bbbbb.......",
    "....GgGgG.......",
    "....bcccb.......",
    "....bcccb.......",
    "....bcccb.......",
    "....bcccb.......",
    "....bcccb.......",
    "....bccccb......",
    "....bcccccbb....",
    "....bcccccccb...",
    "....bccccccccb..",
    "....BBBBBBBBBB..",
    "....SSSSSSSSSS..",
    "................",
    "................"],
  copa:[
    "................",
    "..GGGGGGGGGGGG..",
    ".Gg.GyyyyyggG.gG",
    ".Gg.GyggggggG.gG",
    ".Gg.GyggggggG.gG",
    "..Gg.GyggggG.gG.",
    "...GgGyggggGgG..",
    ".....GyggggG....",
    "......GyggG.....",
    ".......GgG......",
    ".......GgG......",
    "......GgggG.....",
    ".....GyggggG....",
    "....BBBBBBBB....",
    "....BbbbbbbB....",
    "....BBBBBBBB...."],
  mochila:[
    "................",
    "......bbbb......",
    ".....b....b.....",
    "...bbbbbbbbbb...",
    "..bccccccccccb..",
    "..bcBBBBBBBBcb..",
    "..bcBccGccBBcb..",
    "..bcBccccccBcb..",
    "..bcBBBBBBBBcb..",
    "..bccccccccccb..",
    "..bcbbbbbbbbcb..",
    "..bcbccccccbcb..",
    "..bcbbbbbbbbcb..",
    "..bccccccccccb..",
    "...bbbbbbbbbb...",
    "................"],
  casco:[
    "................",
    "................",
    ".....SSSSSS.....",
    "....SllllssS....",
    "...SllssssssS...",
    "...SlsssssssS...",
    "...SlsssssssS...",
    "...SkkkkkkkkS...",
    "...SlssSsSssS...",
    "...SlssSsSssS...",
    "...SlsssssssS...",
    "...SSsssssssS...",
    "....SSSSSSSS....",
    "................",
    "................",
    "................"],
  mundo:[
    "................",
    ".....UUUUUU.....",
    "...UUuunuuuUU...",
    "..UunnnuuuuuuU..",
    "..UunnnnuuunuU..",
    ".UunnnnnuunnnuU.",
    ".UuunnnuuunnnuU.",
    ".UuuunuuuuunnuU.",
    ".UuuuuuunnuuuuU.",
    ".UuuuuunnnnuuuU.",
    ".UuuuuuunnnuuuU.",
    "..UuuuuuunnuuU..",
    "..UuuuuuuuuuuU..",
    "...UUuuuuuuUU...",
    ".....UUUUUU.....",
    "................"],
  fuego:[
    "................",
    ".......e........",
    "......ee........",
    "......eee...e...",
    ".....eeee..ee...",
    "....eeegee.ee...",
    "...eeegggeeee...",
    "...eeggyggeee...",
    "..eeggyyygge....",
    "..eegyyyyygge...",
    "..eegyywyyyge...",
    "..reegyyyyger...",
    "...reeggggerr...",
    "....rreeeerr....",
    "......rrrr......",
    "................"]
};
// emoji → ícono (con o sin el selector de variante U+FE0F)
const PXI_EMOJI = {"🪙":"moneda", "📖":"libro", "🏰":"torre", "🌵":"cactus", "🎽":"pechera", "🧤":"guantes",
  "👢":"botas", "🏆":"copa", "🎒":"mochila", "⛑":"casco", "🌐":"mundo", "🔥":"fuego"};

function _pxiCanvas(id){
  const art = PXI_ART[id]; if(!art || typeof document==="undefined") return null;
  const cv = document.createElement("canvas"); cv.width = 16; cv.height = 16;
  const g = cv.getContext("2d");
  const at = (x, y)=> (y >= 0 && y < 16 && x >= 0 && x < 16) ? (art[y].charAt(x) || ".") : ".";
  for(let y=0;y<16;y++) for(let x=0;x<16;x++){
    const ch = at(x, y);
    if(ch !== "." && PXI_PAL[ch]){ g.fillStyle = PXI_PAL[ch]; g.fillRect(x, y, 1, 1); continue; }
    // contorno de 1 px: un píxel vacío pegado (en cruz) a algo pintado
    if(ch === "." && [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{ const c = at(x+dx, y+dy); return c !== "." && c !== "k"; })){ g.fillStyle = PXI_PAL.k; g.fillRect(x, y, 1, 1); }
  }
  return cv;
}
const _pxiURL = {};
function pixelIconURL(id){
  if(_pxiURL[id] !== undefined) return _pxiURL[id];
  let u = null; try{ const cv = _pxiCanvas(id); u = cv ? cv.toDataURL("image/png") : null; }catch(e){ u = null; }
  return (_pxiURL[id] = u);
}
function pixelIconHTML(id, emoji){ return `<i class="pxi pxi-${id}" role="img" aria-label="${emoji||id}">${emoji||""}</i>`; }

(function(){
  if(typeof document==="undefined") return;
  const keys = Object.keys(PXI_EMOJI);
  const RX = new RegExp("(" + keys.join("|") + ")\\uFE0F?", "u"), RXG = new RegExp(RX.source, "gu");
  const SKIP = {SCRIPT:1, STYLE:1, TEXTAREA:1, OPTION:1, SELECT:1, TITLE:1, CANVAS:1, INPUT:1, NOSCRIPT:1};
  function css(){
    let s = ".pxi{display:inline-block; width:1.05em; height:1.05em; vertical-align:-0.16em; overflow:hidden; white-space:nowrap;" +
      " text-indent:1.4em; color:transparent; background:center/contain no-repeat; image-rendering:pixelated; image-rendering:crisp-edges; font-style:normal; line-height:1;}";
    for(const id of Object.keys(PXI_ART)){ const u = pixelIconURL(id); if(u) s += `.pxi-${id}{background-image:url(${u});}`; }
    const st = document.createElement("style"); st.id = "pxi-style"; st.textContent = s; document.head.appendChild(st);
  }
  function fix(t){
    const s = t.nodeValue; if(!s || !RX.test(s)) return;
    const p = t.parentNode; if(!p || p.nodeType !== 1 || SKIP[p.nodeName] || (p.classList && p.classList.contains("pxi")) || p.closest("[data-no-pxi], svg")) return;
    const frag = document.createDocumentFragment(); let last = 0;
    s.replace(RXG, (m, e, i)=>{
      if(i > last) frag.appendChild(document.createTextNode(s.slice(last, i)));
      const el = document.createElement("i"); el.className = "pxi pxi-" + PXI_EMOJI[e]; el.setAttribute("role", "img"); el.setAttribute("aria-label", e); el.textContent = m;
      frag.appendChild(el); last = i + m.length; return m;
    });
    if(last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
    p.replaceChild(frag, t);
  }
  function walk(root){
    if(!root) return;
    if(root.nodeType === 3){ fix(root); return; }
    if(root.nodeType !== 1 || SKIP[root.nodeName] || !RX.test(root.textContent || "")) return;
    const list = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n; while((n = w.nextNode())) if(RX.test(n.nodeValue)) list.push(n);
    list.forEach(fix);
  }
  function start(){
    css(); walk(document.body);
    new MutationObserver(ms=>{
      for(const m of ms){
        if(m.type === "characterData") fix(m.target);
        else if(m.addedNodes.length) m.addedNodes.forEach(walk);
      }
    }).observe(document.body, {childList:true, subtree:true, characterData:true});
  }
  if(document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
/* Nota: quedan como emoji, a propósito, los que son parte de un texto largo o no tienen equivalente
   claro en 16×16 todavía (🧪 💥 🗡 👑 📜 🌪 🎯 🦇 🔮 🏹 💀 🎨 🔒): ver el reporte de la tarea V6. */

/* ============================================================
   CONTRATO ÚNICO DE ÍCONO DE HABILIDAD (críticas del director de arte; ART_BIBLE §14 "píxel nativo")
   Todos los íconos de habilidad del HUD, del panel de Habilidades, de la ficha, de los refuerzos y del modo Crystal
   Wars salen de acá. No hay ilustraciones, degradés ni recortes del sprite del héroe: un solo idioma.
     - Tamaño nativo 16x16 (se muestra a 2x = 32 px, píxeles enteros; sin suavizado).
     - Paleta máxima de 6 colores por ícono: contorno (k), marco (f), cuerpo en 3 tonos (# l d) y 1 acento (a).
     - Contorno de 1 px oscuro alrededor de toda la silueta del glifo (el glifo ocupa 14x14 dentro del marco).
     - Marco de 1 px por categoría: básico (cuadrado, cobre), habilidad (esquinas cortadas, acero), definitiva
       (cuadrado con tachones, oro). La forma del marco también distingue la categoría, no solo el color.
     - Alfa solo 0 o 255. El interior es transparente: la placa del botón se ve detrás.
   El chequeo tools/art/check-skill-icons.js renderiza el HUD de los 43 campeones y falla si algo lo incumple
   (usa pxiIconAudit de este mismo archivo, así contrato y verificación no se separan).
   ============================================================ */
const PXI_ICON_CONTRACT = Object.freeze({
  size: 16, maxColors: 6, glyph: 14, outline: "#0b0f18",
  frame: Object.freeze({basic: "#e0924f", skill: "#9fb4cc", ult: "#ffd35a"}),
  categories: Object.freeze(["basic", "skill", "ult"])
});
function pxiIconFrame(cat){
  const S = PXI_ICON_CONTRACT.size, g = Array.from({length: S}, ()=>Array(S).fill("."));
  for(let i=0;i<S;i++){ g[0][i] = g[S-1][i] = g[i][0] = g[i][S-1] = "f"; }
  if(cat === "skill"){ g[0][0] = g[0][S-1] = g[S-1][0] = g[S-1][S-1] = "."; }
  return g.map(r=>r.join(""));
}
// Tachones del marco de la definitiva (bajo el glifo: si el glifo los toca, gana el contorno del glifo).
const PXI_ULT_STUDS = [[1,1],[14,1],[1,14],[14,14],[7,1],[8,1],[7,14],[8,14],[1,7],[1,8],[14,7],[14,8]];
// Compone el ícono: glyph14 = 14 filas de 14 letras (. vacío, k contorno, # l d cuerpo, a acento). Devuelve 16 filas de letras.
function pxiIconCompose(glyph14, cat){
  const S = PXI_ICON_CONTRACT.size, g = pxiIconFrame(cat).map(r=>r.split(""));
  if(cat === "ult") for(const [x,y] of PXI_ULT_STUDS) g[y][x] = "f";
  const solid = (x,y)=> y>=0 && y<14 && x>=0 && x<14 && glyph14[y][x] !== ".";
  for(let y=0;y<14;y++) for(let x=0;x<14;x++){
    let ch = glyph14[y][x];
    if(ch === "."){ // contorno: vacío pegado (8 direcciones) a algo pintado
      let near = false; for(let dy=-1;dy<=1&&!near;dy++) for(let dx=-1;dx<=1;dx++) if((dx||dy) && solid(x+dx,y+dy)){ near = true; break; }
      if(!near) continue; ch = "k";
    }
    g[y+1][x+1] = ch;
  }
  return g.map(r=>r.join(""));
}
function pxiIconColors(cat, body, accent){ // body = {m,l,d} (3 tonos), accent = "#rrggbb"
  return {k: PXI_ICON_CONTRACT.outline, f: PXI_ICON_CONTRACT.frame[cat], "#": body.m, l: body.l, d: body.d, a: accent};
}
function pxiIconCanvas(rows, colors){
  if(typeof document === "undefined") return null;
  const S = PXI_ICON_CONTRACT.size, cv = document.createElement("canvas"); cv.width = S; cv.height = S;
  const g = cv.getContext("2d");
  for(let y=0;y<S;y++) for(let x=0;x<S;x++){ const c = colors[rows[y][x]]; if(rows[y][x] !== "." && c){ g.fillStyle = c; g.fillRect(x, y, 1, 1); } }
  return cv;
}
function pxiIconDataURL(rows, colors){ try{ const cv = pxiIconCanvas(rows, colors); return cv ? cv.toDataURL("image/png") : null; }catch(e){ return null; } }
// Verificador del contrato sobre píxeles reales (Uint8ClampedArray RGBA de 16x16). Devuelve la lista de incumplimientos.
function pxiIconAudit(data, w, h, cat){
  const C = PXI_ICON_CONTRACT, bad = [];
  if(w !== C.size || h !== C.size){ bad.push(`tamaño nativo ${w}x${h} (debe ser ${C.size}x${C.size})`); return bad; }
  const px = (x,y)=>{ const i = (y*w+x)*4; return {r:data[i], g:data[i+1], b:data[i+2], a:data[i+3]}; };
  const hex = p=>"#" + [p.r,p.g,p.b].map(v=>v.toString(16).padStart(2,"0")).join("");
  const cols = new Set(); let semi = 0;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const p = px(x,y); if(p.a !== 0 && p.a !== 255) semi++; if(p.a === 255) cols.add(hex(p)); }
  if(semi) bad.push(`${semi} píxeles con alfa distinto de 0/255`);
  if(cols.size > C.maxColors) bad.push(`${cols.size} colores (máximo ${C.maxColors})`);
  if(cols.size < 4) bad.push(`solo ${cols.size} colores: glifo plano`);
  const fr = pxiIconFrame(cat), fcol = C.frame[cat];
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    if(x>0 && x<w-1 && y>0 && y<h-1) continue;
    const p = px(x,y), want = fr[y][x] === "f";
    if(want && !(p.a === 255 && hex(p) === fcol)){ bad.push(`marco ${cat} incompleto en (${x},${y})`); return bad; }
    if(!want && p.a !== 0){ bad.push(`marco ${cat}: (${x},${y}) debería estar vacío`); return bad; }
  }
  let glyph = 0, ink = 0, edge = 0;
  for(let y=1;y<h-1;y++) for(let x=1;x<w-1;x++){
    const p = px(x,y); if(p.a === 0) continue;
    const c = hex(p); glyph++;
    if(c === C.outline){ ink++; continue; }
    if(c === fcol) continue; // tachón del marco
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if(px(x+dx,y+dy).a === 0){ edge++; break; }
  }
  if(glyph < 30) bad.push(`glifo casi vacío (${glyph} px)`);
  if(ink < 12) bad.push("sin contorno oscuro de 1 px");
  if(edge) bad.push(`${edge} píxeles del glifo tocan el vacío sin contorno de 1 px`);
  return bad;
}
