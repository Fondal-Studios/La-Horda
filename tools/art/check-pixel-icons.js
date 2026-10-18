#!/usr/bin/env node
"use strict";
/* tools/art/check-pixel-icons.js
   Contrato de los íconos de js/ui/pixel-icons.js: grilla de 16x16, hasta 6 colores (sin contar el contorno "k",
   que se calcula solo), solo letras de la paleta PXI_PAL, y cada emoji de PXI_EMOJI apunta a un ícono que existe y
   tiene nombre accesible en PXI_NAME. Uso: node tools/art/check-pixel-icons.js  (exit 1 si algo falla). */
const fs = require("fs"), path = require("path"), vm = require("vm");
const src = fs.readFileSync(path.resolve(__dirname, "../../js/ui/pixel-icons.js"), "utf8");
const ctx = {};
vm.createContext(ctx);
vm.runInContext(src + "\n;this.__r = {PXI_ART, PXI_PAL, PXI_EMOJI, PXI_NAME};", ctx);
const {PXI_ART, PXI_PAL, PXI_EMOJI, PXI_NAME} = ctx.__r;
const errs = [];
for(const [id, rows] of Object.entries(PXI_ART)){
  if(rows.length !== 16) errs.push(`${id}: ${rows.length} filas (deben ser 16)`);
  rows.forEach((r, i)=>{ if(r.length !== 16) errs.push(`${id}: fila ${i} mide ${r.length} (debe medir 16)`); });
  const cols = new Set(rows.join("").replace(/[.k]/g, ""));
  if(cols.size > 6) errs.push(`${id}: ${cols.size} colores (máximo 6): ${[...cols].join("")}`);
  for(const c of cols) if(!PXI_PAL[c]) errs.push(`${id}: letra "${c}" no está en PXI_PAL`);
  if(!PXI_NAME[id]) errs.push(`${id}: falta nombre accesible en PXI_NAME`);
}
for(const [e, id] of Object.entries(PXI_EMOJI)) if(!PXI_ART[id]) errs.push(`emoji ${e} apunta a "${id}", que no existe`);
if(errs.length){ console.error(errs.join("\n")); process.exit(1); }
console.log(`pixel-icons OK: ${Object.keys(PXI_ART).length} íconos 16x16 (<= 6 colores), ${Object.keys(PXI_EMOJI).length} emojis mapeados`);
