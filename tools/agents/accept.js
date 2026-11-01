#!/usr/bin/env node
'use strict';
/* ESPECIFICACIÓN EJECUTABLE de un agente: corre sus puertas de entrada y su lista de aceptación.
 *   node tools/agents/accept.js --agent A [--entry] [--list]
 *   --entry  solo las puertas de entrada (lo que debe estar verde ANTES de empezar a trabajar)
 *   --list   solo muestra el estado de cada criterio sin ejecutar nada
 * Cada criterio de docs/arquitectura-compartida/agents/<A|B|C>.spec.json tiene un comando. Estados: PASS · FAIL ·
 * PENDIENTE (la prueba que lo demuestra todavía no existe: la debe crear el agente) · EXTERNO (necesita infraestructura que el repo no controla).
 * "Hecho" = todos PASS. Un criterio PENDIENTE no cuenta como cumplido. */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const a = process.argv.slice(2), val = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const id = val('--agent'); if (!['A', 'B', 'C'].includes(id)) { console.error('uso: accept.js --agent A|B|C [--entry] [--list]'); process.exit(2); }
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/arquitectura-compartida/agents/${id}.spec.json`), 'utf8'));
const sh = cmd => cp.spawnSync('bash', ['-c', cmd], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 27 });
let bad = 0;
console.log(`# Agente ${id} — ${spec.name}`);
console.log('\n## Puertas de entrada');
for (const c of spec.entryGates) {
  if (a.includes('--list')) { console.log('  ' + c); continue; }
  const r = sh(c); console.log(`${r.status === 0 ? 'PASS' : 'FAIL'}  ${c}`); if (r.status !== 0) bad++;
}
if (!a.includes('--entry')) {
  console.log('\n## Criterios de aceptación');
  for (const c of spec.acceptance) {
    const missing = c.pending && !fs.existsSync(path.join(ROOT, c.pending));
    let st;
    if (c.external) st = 'EXTERNO';
    else if (missing) st = 'PENDIENTE';
    else if (a.includes('--list')) st = '-';
    else { const r = sh(c.cmd); st = r.status === 0 ? 'PASS' : 'FAIL'; }
    if (st === 'FAIL') bad++;
    console.log(`${st.padEnd(9)} ${c.id}  ${c.text}`);
  }
}
console.log(bad ? `\n${bad} fallo(s)` : '\nSin fallos (los PENDIENTE y EXTERNO no cuentan como cumplidos)');
process.exit(bad ? 1 : 0);
