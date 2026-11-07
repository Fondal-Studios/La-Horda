#!/usr/bin/env node
'use strict';
/* Genera docs/arquitectura-compartida/DEPENDENCIAS.md (diagrama Mermaid + tablas) desde contracts/registry.json y ownership.json.
 *   node tools/agents/gen-diagram.js            escribe el documento
 *   node tools/agents/gen-diagram.js --check    falla (exit 1) si el documento no coincide con las fuentes (lo corre run-all)
 * El diagrama no se dibuja a mano: si cambia un dueño o un consumidor y no se regenera, la batería falla. */
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');
const REG = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts/registry.json'), 'utf8'));
const OWN = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/arquitectura-compartida/ownership.json'), 'utf8'));
const OUT = path.join(ROOT, 'docs/arquitectura-compartida/DEPENDENCIAS.md');
function build(){
  const agents = Object.keys(OWN.packages);
  const L = ['# Dependencias entre agentes y contratos', '', '> Generado por `node tools/agents/gen-diagram.js` desde `contracts/registry.json` y `docs/arquitectura-compartida/ownership.json`. No editar a mano: `--check` falla si no coincide.', '',
    '## Contratos: quién los posee y quién los consume', '', '```mermaid', 'flowchart LR'];
  for(const a of agents) L.push(`  ${a}["Agente ${a}<br/>${OWN.packages[a].name}"]`);
  L.push('  ARQ["Arquitectura<br/>(solo lectura / relay)"]');
  for(const [n, c] of Object.entries(REG.contracts)) L.push(`  ${n}{{"${n} v1"}}`);
  for(const [n, c] of Object.entries(REG.contracts)){
    L.push(`  ${c.owner} ==>|posee| ${n}`);
    for(const k of c.consumers) L.push(`  ${n} -.->|consume| ${k}`);
  }
  L.push('```', '', '## Flujo de revisión independiente', '', '```mermaid', 'flowchart LR', '  P["PRODUCCIÓN<br/>agente A/B/C/D"] --> Q["QA<br/>(otra identidad)"] --> R["REVISIÓN ARQUITECTÓNICA<br/>aprueba · repara · reconstruye"] --> S["STAGING<br/>beta/integracion"] --> D["APROBACIÓN<br/>director (humano)"]', '  R -. reparación parcial .-> P', '  R -. reconstrucción .-> P', '  Q -. rechazo .-> P', '```', '',
    '## Áreas del proyecto', '', '| Área | Contratos | Dueños |', '|---|---|---|');
  for(const [area, cs] of Object.entries(REG.areas)) L.push(`| ${area} | ${cs.join(', ')} | ${[...new Set(cs.map(c => REG.contracts[c].owner))].join(', ')} |`);
  L.push('', '## Contratos', '', '| Contrato | Dueño | Consumidores | Productor | Esquema |', '|---|---|---|---|---|');
  for(const [n, c] of Object.entries(REG.contracts)) L.push(`| ${n} | ${c.owner} | ${c.consumers.join(', ')} | \`${c.producer}\` | \`${c.schema}\` |`);
  L.push('', '## Agentes', '', '| Agente | Rama | Contratos que posee | Depende de |', '|---|---|---|---|');
  for(const a of agents) L.push(`| ${a} — ${OWN.packages[a].name} | \`${OWN.packages[a].branchPrefix}…\` | ${(OWN.packages[a].ownsContracts || []).join(', ') || '—'} | ${OWN.packages[a].dependsOn.join(', ')} |`);
  L.push('');
  return L.join('\n');
}
module.exports = { build };
if(require.main === module){
  const txt = build();
  if(process.argv.includes('--check')){
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if(cur !== txt){ console.log('FAIL DEPENDENCIAS.md está desactualizado: corré node tools/agents/gen-diagram.js'); process.exit(1); }
    console.log('PASS DEPENDENCIAS.md coincide con el registro de contratos y la propiedad de archivos'); process.exit(0);
  }
  fs.writeFileSync(OUT, txt); console.log('escrito ' + path.relative(ROOT, OUT));
}
