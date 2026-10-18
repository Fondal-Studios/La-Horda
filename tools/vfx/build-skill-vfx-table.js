'use strict';
/* Genera docs/vfx/HABILIDADES_VFX_MITAD_A.md a partir de las mediciones (docs/vfx/audit/*.json), de la valoración visual
   curada de abajo y de docs/vfx/perf-skill-fx.json. No inventa datos: las columnas "medido" salen del motor real.
   Uso: node tools/vfx/build-skill-vfx-table.js */
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '../..'), AUD = path.join(ROOT, 'docs/vfx/audit');
const J = f => JSON.parse(fs.readFileSync(path.join(AUD, f), 'utf8'));
const antes = J('antes.json').champions, segunda = J('segunda.json').champions, despues = J('despues.json').champions;
const perf = fs.existsSync(path.join(ROOT, 'docs/vfx/perf-skill-fx.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/vfx/perf-skill-fx.json'), 'utf8')) : null;

// Valoración visual del autor sobre capturas 844x390. Cada campeón: 5 códigos (básico, hab. 1, 2, 3, definitiva).
// Tipo: A animación del propio personaje (no es efecto de habilidad) · P sprite/atlas de efecto propio · G sprite genérico del motor reutilizado
//       · C solo círculos, líneas y partículas genéricas · S sprite procedural propio de skill-fx-a.  Lectura: B bien · R regular · M mal.
const RATE_ANTES = {
  aelith: 'AB CR GR GR CR', aurelia: 'AB GR GR GR GR', axiom: 'AB PR PR CM PB', baltra: 'AB GR GR GR GR', brakk: 'AB GM GM GR GM', brasa: 'AB CR CR CM CR',
  bront: 'AB GR GR GR GR', cazadora: 'AB CR PR CR CR', dariel: 'AB GR GR GR GR', eslabon: 'AB CR CR CM CR', facu_gm: 'AB GR GR GR GR', farolero: 'AB CR CR CR CR',
  guerrero: 'AB PB PB PR PR', ilkan: 'AB PB CR CR PR', iria: 'AB CR CR CR CR', khepri: 'AB GR GR GR GR', libertador: 'AB PB PB PR PB', mago: 'AB CR PB PB PB',
  maura: 'AB GR GR GR GR', morveth: 'AB GR GR GR GR', morwen: 'AB CR CR CM CR', musashi: 'AB PB CM CM PB'
};
const RATE_DESPUES = {   // S + lectura; el básico no se tocó
  aelith: 'AB SB SB SB SB', aurelia: 'AB SB SB SB SB', axiom: 'AB SB SB SB SB', baltra: 'AB SB SR SB SB', brakk: 'AB SB SB SB SB', brasa: 'AB SB SB SB SB',
  bront: 'AB SB SB SB SB', cazadora: 'AB SB SR SB SB', dariel: 'AB SB SB SB SB', eslabon: 'AB SB SB SR SB', facu_gm: 'AB SB SB SB SB', farolero: 'AB SB SB SB SB',
  guerrero: 'AB SR SR SB SB', ilkan: 'AB SB SB SB SB', iria: 'AB SB SB SB SB', khepri: 'AB SB SB SB SB', libertador: 'AB SB SB SB SB', mago: 'AB SB SB SB SB',
  maura: 'AB SB SB SB SB', morveth: 'AB SB SB SB SB', morwen: 'AB SB SB SB SB', musashi: 'AB SR SR SB SB'
};
const RATE_SEGUNDA = {   // no modificada en esta rama (la cubre otro agente): solo medida y vista
  myla: 'AB PB PB PB PB', nahir: 'AB CR CR CR CR', nano_gm: 'AB CR CR CR PB', nigromante: 'AB PB PB PB PB', oriel: 'AB CR CR CR CR', orsa: 'AB CR CR CR GR',
  profeta: 'AB CR CR GR CM', renko: 'AB GR GR GR GR', saelis: 'AB CR GR GR GR', segador: 'AB PB CR CR PR', sira: 'AB CR GR CR CR', solciju: 'AB CR CR CR PR',
  soporte: 'AB PR CR CR CR', tanque: 'AB CR CR CR CR', tibor: 'AB CR CR CR GR', velmira: 'AB CR CR CR PR', vesper: 'AB CR CR CR GR', veyra: 'AB CR CR CR CR',
  vhal: 'AB CR GR PB PB', ynara: 'AB CR PR CR PB', zahra: 'AB GR GR GR PB'
};
const TIPO = {A: 'animación del personaje', P: 'sprite/atlas propio', G: 'sprite genérico del motor', C: 'círculos/líneas/partículas', S: 'sprite procedural propio (skill-fx-a)'};
const LECT = {B: 'bien', R: 'regular', M: 'mal'};
const SLOT = ['Básico', 'Hab. 1', 'Hab. 2', 'Hab. 3', 'Definitiva'];
const cell = c => TIPO[c[0]].split(' ')[0] === 'animación' ? 'anim. personaje' : `${c[0]} · ${LECT[c[1]]}`;
const half = (title, data, rate, rateD, note) => {
  const L = [`## ${title}`, '', note, ''];
  L.push('| Campeón | Habilidad | Antes (tipo · lectura) | Después | Medido antes: sprites vfxSprite · dibujos/cuadro · ondas · ráfagas | Captura |', '|---|---|---|---|---|---|');
  for (const k of Object.keys(data)) {
    const R = rate[k].split(' '), D = rateD ? rateD[k].split(' ') : null;
    data[k].forEach((a, i) => {
      L.push(`| ${i === 0 ? k : ''} | ${SLOT[i]}: ${i === 0 ? 'ataque básico' : a.name} | ${cell(R[i])} | ${D ? cell(D[i]) : (i === 0 ? 'sin cambios' : 'sin cambios (otra rama)')} | ${a.sprites.join(', ') || '—'} · ${a.drawImage} · ${a.shocks} · ${a.bursts} | ${i === 0 ? `[antes](sheets/antes/${k}.jpg)${rateD ? ` · [después](sheets/despues/${k}.jpg)` : ''}` : ''} |`);
    });
  }
  return L.join('\n');
};
const count = (rate, side) => { const o = {A: 0, P: 0, G: 0, C: 0, S: 0, B: 0, R: 0, M: 0}; for (const k in rate) rate[k].split(' ').slice(1).forEach(c => { o[c[0]]++; o[c[1]]++; }); return o; };
const cA = count(RATE_ANTES), cD = count(RATE_DESPUES), cS = count(RATE_SEGUNDA);
const pf = perf ? (() => { const r = perf.rows.map(x => x.summary), m = f => +(r.reduce((a, x) => a + x[f], 0) / r.length).toFixed(2);
  return {n: r.length, off: m('renderMeanOff'), on: m('renderMeanOn'), p95off: m('renderP95Off'), p95on: m('renderP95On'), poolMax: Math.max(...r.map(x => x.poolMax)), worst: r.map((x, i) => [perf.rows[i].key, +(x.renderMeanOn - x.renderMeanOff).toFixed(2)]).sort((a, b) => b[1] - a[1]).slice(0, 3)}; })() : null;
const out = [`# Efectos de habilidad: auditoría y mejora (mitad A del roster)`, '',
  `Generado por \`tools/vfx/build-skill-vfx-table.js\` con mediciones de \`tools/vfx/audit-ability-vfx.js\` (motor real, Chromium, viewport 844x390). Rama \`claude/vfx-habilidades-a\`.`, '',
  '## Método y límites', '',
  '- Cada habilidad (básico, 3 habilidades, definitiva) se lanza en el motor real contra 10 muñecos agrupados; se cuentan los sprites de efecto (`vfxSprite`), los `drawImage`, las ondas y las ráfagas que **añade** el lanzamiento respecto de una corrida de control sin lanzar (1,3 s a tiempo real). Las capturas se toman a ~0,1 s y ~0,4-0,6 s del lanzamiento (el tiempo real de la captura incluye su propio retraso).',
  '- Las métricas no distinguen arte propio de arte reutilizado: la columna **tipo** y la **lectura** son valoración visual del autor sobre esas capturas a 844x390, no una medición. Hace falta revisión humana de arte (ver Pendientes).',
  '- Pasivas: no se tocaron; sus indicadores visibles (contadores sobre la cabeza, auras de estado) quedan como estaban. Los ataques básicos usan la animación del propio personaje y no se modificaron.',
  '- Los campeones se ordenan por clave y se parten en dos mitades: esta rama (A) cubre `aelith` … `musashi` (22); `myla` … `zahra` (21) los cubre otra rama y aquí solo se miden y se miran.', '',
  '## Qué se hizo', '',
  '- Motor de sprites procedurales `js/champions/skill-fx-a/` (arte de píxel horneado una vez: contorno de 1 px, 3 tonos, tramado ordenado). Seis artes base (nova, zona, cono, haz, estallido, aura) y tres capas de impacto (rayos de destello, ondas concéntricas, columna de luz), con anticipación (el área real, punteada), impacto y disipación.',
  '- Cada habilidad de un campeón usa una **variante distinta** del tema (base, tono girado, pálida, oscura) con otra silueta de frente y otros motivos, y un arte distinto según su forma (área, línea, cono, desplazamiento, aura, zona persistente). El básico lleva un tajo/destello corto y pálido. La definitiva suma destello, ondas, columna, una segunda onda retrasada y la sacudida de pantalla que ya existe (`vfxShake`, respeta "Reducir movimiento").',
  '- Objetos persistentes con sprite propio: muro y torreta de Brakk, anclas de Iria, farol de Tobías, alambique de Morwen, hongos de Morveth.',
  '- Geometría fiel: el radio, punto y dirección salen de lo que registró el propio lanzamiento (aimPoint, vfxSkillCone, kitFx, objetos nuevos); el borde exterior punteado es la hitbox real. No se tocó ningún valor de daño, enfriamiento, alcance ni duración; el premarcado de apuntado queda igual.',
  '- Costo: un `drawImage` por efecto, pool fijo de 40, horneado previo en tiempo ocioso. Modo ligero adaptativo: con "Reducir efectos intensos" o con `vfxLoad` < 0,6 se omiten las capas decorativas y el pool baja a 16.', '',
  '## Pruebas ejecutadas (servidores en puertos propios)', '',
  '- `node tools/bible/ability-gate.js --strict`: 43 campeones, **0 nuevos que no pasan**, 0 errores de página; categorías, daño por muñeco, estados y premarcado **idénticos a main** (comparación campo por campo).',
  '- `node tools/vfx/parity-skill-fx.js` (200 cuadros, semilla fija, reloj virtual, páginas nuevas): los 22 campeones dejan **el mismo estado y el mismo consumo de Math.random** con y sin sprites.',
  '- `tools/vfx/perf-skill-fx.js`: ver Costo por cuadro.',
  '- Verdes: `tools/quality/test-vfx-pools.js`, `tests/competitive-*.test.js`, `tools/ascension/functional.js` (225 chequeos), `tools/expedition/functional.js` (254), `tools/quality-five/functional.js` (132), `brakk-functional.js` (81), `temporal-plague-functional.js` (131), `tools/regression/test-aim-hostiles.js`, `tools/quality/test-ability-resources.js`, `test-single-champion-revive.js`, `test-floating-text.js`, `tools/balance/check-entry-reference.js`, `tools/bible/champion-validator.js --strict`, `tools/ux/test-ability-inspector.js`, `test-touch-targets.js`, `test-text-overflow.js`, `node --test tools/factory/test.js` (27).',
  '- `tools/regression/t_champs_se.js`: 35/42 en esta rama y 35/42 en main, con **los mismos 7 que fallan en ambas** (SM4.bayoneta, E15-E19, TEAM.boss); no los causa este cambio y no se tocaron.', '',
  '## Campeones que no cumplen un gate (informativo; ninguno se bloqueó ni se quitó)', '',
  'El ability-gate marca INFO (no bloquea: son clásicos anteriores) a `tanque, guerrero, mago, soporte, segador, axiom, profeta, musashi, cazadora, nigromante, libertador, ilkan, myla, brasa, eslabon, farolero, iria` por no cumplir alguna de sus reglas de composición (p. ej. definitiva con menos de 3 categorías o falta de una habilidad de potenciación). Es idéntico en main; este cambio no lo altera. El entry-gate de balance no se corrió porque no se incorpora ningún campeón nuevo. El dueño decide.', '',
  '## Resumen (sin contar el básico)', '',
  '| | Sprite propio (P/S) | Sprite genérico del motor (G) | Solo círculos/líneas/partículas (C) | Lectura bien | regular | mal |', '|---|---|---|---|---|---|---|',
  `| Mitad A antes (88 habilidades) | ${cA.P} | ${cA.G} | ${cA.C} | ${cA.B} | ${cA.R} | ${cA.M} |`,
  `| Mitad A después | ${cD.S + cD.P} | ${cD.G} | ${cD.C} | ${cD.B} | ${cD.R} | ${cD.M} |`,
  `| Mitad B (84 habilidades, sin cambios) | ${cS.P} | ${cS.G} | ${cS.C} | ${cS.B} | ${cS.R} | ${cS.M} |`, '',
  half('Mitad A: antes y después', antes, RATE_ANTES, RATE_DESPUES, 'Tipo: A animación del personaje · P sprite/atlas propio · G sprite genérico del motor · C círculos/líneas/partículas · S sprite procedural propio (nuevo). Lectura en 844x390: B bien · R regular · M mal.'),
  '', '## Costo por cuadro', '',
  pf ? `\`tools/vfx/perf-skill-fx.js\`: horda de 150 enemigos, las tres habilidades y la definitiva en bucle durante 5 s de render real, por campeón y alternando sin sprites (\`SFA_OFF\`) y con sprites, dos veces cada uno. Media entre los ${pf.n} campeones del tiempo de \`render()\` en CPU: **${pf.off} ms sin sprites, ${pf.on} ms con sprites** (p95 ${pf.p95off} ms y ${pf.p95on} ms); máximo de efectos simultáneos en el pool: ${pf.poolMax} de 40. Mayores diferencias por campeón (con menos sin): ${pf.worst.map(w => w[0] + ' ' + (w[1] >= 0 ? '+' : '') + w[1] + ' ms').join(', ')}. Chromium sin cabeza con varios procesos en la máquina: el ruido entre campeones es del orden de ±1 ms, así que es evidencia relativa y no certifica un teléfono. Detalle en \`docs/vfx/perf-skill-fx.json\`.` : 'Sin medición.',
  '', half('Mitad B: auditoría (sin cambios en esta rama)', segunda, RATE_SEGUNDA, null, 'Misma escala. Valoración visual rápida; no se modificó ningún archivo de estos campeones.')];
out.push('', '## Pendientes', '',
  '- **Revisión humana de arte**: todo es procedural y generado por script; la valoración de esta tabla es del autor, no un PASS del Visual Gate (docs/ART_BIBLE.md §8). Conviene mirar en un teléfono real el tamaño de los motivos y la densidad de las definitivas.',
  '- Las pasivas no se tocaron. Los básicos solo suman un destello corto; no se probó cada skin.',
  '- El kit genérico de los campeones Expedición/Ascensión sigue emitiendo sus partículas (sin sprites ni ondas) para no alterar el azar de la partida; los pulsos de zonas persistentes todavía llaman al kitFx genérico además del pulso propio.',
  '- La mitad B (`myla` … `zahra`) queda para la otra rama; su tabla de arriba es solo diagnóstico.',
  '- Las variantes de color de las habilidades persistentes que no son objeto del motor (listas de trampas, zonas con demora) se fijaron a mano por habilidad.');
fs.writeFileSync(path.join(ROOT, 'docs/vfx/HABILIDADES_VFX_MITAD_A.md'), out.join('\n') + '\n');
console.log('escrito docs/vfx/HABILIDADES_VFX_MITAD_A.md', JSON.stringify({cA, cD, cS}));
