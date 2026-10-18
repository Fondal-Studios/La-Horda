# Efectos de habilidad: auditoría y mejora (mitad A del roster)

Generado por `tools/vfx/build-skill-vfx-table.js` con mediciones de `tools/vfx/audit-ability-vfx.js` (motor real, Chromium, viewport 844x390). Rama `claude/vfx-habilidades-a`.

## Método y límites

- Cada habilidad (básico, 3 habilidades, definitiva) se lanza en el motor real contra 10 muñecos agrupados; se cuentan los sprites de efecto (`vfxSprite`), los `drawImage`, las ondas y las ráfagas que **añade** el lanzamiento respecto de una corrida de control sin lanzar (1,3 s a tiempo real). Las capturas se toman a ~0,1 s y ~0,4-0,6 s del lanzamiento (el tiempo real de la captura incluye su propio retraso).
- Las métricas no distinguen arte propio de arte reutilizado: la columna **tipo** y la **lectura** son valoración visual del autor sobre esas capturas a 844x390, no una medición. Hace falta revisión humana de arte (ver Pendientes).
- Pasivas: no se tocaron; sus indicadores visibles (contadores sobre la cabeza, auras de estado) quedan como estaban. Los ataques básicos usan la animación del propio personaje y no se modificaron.
- Los campeones se ordenan por clave y se parten en dos mitades: esta rama (A) cubre `aelith` … `musashi` (22); `myla` … `zahra` (21) los cubre otra rama y aquí solo se miden y se miran.

## Qué se hizo

- Motor de sprites procedurales `js/champions/skill-fx-a/` (arte de píxel horneado una vez: contorno de 1 px, 3 tonos, tramado ordenado). Seis artes base (nova, zona, cono, haz, estallido, aura) y tres capas de impacto (rayos de destello, ondas concéntricas, columna de luz), con anticipación (el área real, punteada), impacto y disipación.
- Cada habilidad de un campeón usa una **variante distinta** del tema (base, tono girado, pálida, oscura) con otra silueta de frente y otros motivos, y un arte distinto según su forma (área, línea, cono, desplazamiento, aura, zona persistente). El básico lleva un tajo/destello corto y pálido. La definitiva suma destello, ondas, columna, una segunda onda retrasada y la sacudida de pantalla que ya existe (`vfxShake`, respeta "Reducir movimiento").
- Objetos persistentes con sprite propio: muro y torreta de Brakk, anclas de Iria, farol de Tobías, alambique de Morwen, hongos de Morveth.
- Geometría fiel: el radio, punto y dirección salen de lo que registró el propio lanzamiento (aimPoint, vfxSkillCone, kitFx, objetos nuevos); el borde exterior punteado es la hitbox real. No se tocó ningún valor de daño, enfriamiento, alcance ni duración; el premarcado de apuntado queda igual.
- Costo: un `drawImage` por efecto, pool fijo de 40, horneado previo en tiempo ocioso. Modo ligero adaptativo: con "Reducir efectos intensos" o con `vfxLoad` < 0,6 se omiten las capas decorativas y el pool baja a 16.

## Pruebas ejecutadas (servidores en puertos propios)

- `node tools/bible/ability-gate.js --strict`: 43 campeones, **0 nuevos que no pasan**, 0 errores de página; categorías, daño por muñeco, estados y premarcado **idénticos a main** (comparación campo por campo).
- `node tools/vfx/parity-skill-fx.js` (200 cuadros, semilla fija, reloj virtual, páginas nuevas): los 22 campeones dejan **el mismo estado y el mismo consumo de Math.random** con y sin sprites.
- `tools/vfx/perf-skill-fx.js`: ver Costo por cuadro.
- Verdes: `tools/quality/test-vfx-pools.js`, `tests/competitive-*.test.js`, `tools/ascension/functional.js` (225 chequeos), `tools/expedition/functional.js` (254), `tools/quality-five/functional.js` (132), `brakk-functional.js` (81), `temporal-plague-functional.js` (131), `tools/regression/test-aim-hostiles.js`, `tools/quality/test-ability-resources.js`, `test-single-champion-revive.js`, `test-floating-text.js`, `tools/balance/check-entry-reference.js`, `tools/bible/champion-validator.js --strict`, `tools/ux/test-ability-inspector.js`, `test-touch-targets.js`, `test-text-overflow.js`, `node --test tools/factory/test.js` (27).
- `tools/regression/t_champs_se.js`: 35/42 en esta rama y 35/42 en main, con **los mismos 7 que fallan en ambas** (SM4.bayoneta, E15-E19, TEAM.boss); no los causa este cambio y no se tocaron.

## Campeones que no cumplen un gate (informativo; ninguno se bloqueó ni se quitó)

El ability-gate marca INFO (no bloquea: son clásicos anteriores) a `tanque, guerrero, mago, soporte, segador, axiom, profeta, musashi, cazadora, nigromante, libertador, ilkan, myla, brasa, eslabon, farolero, iria` por no cumplir alguna de sus reglas de composición (p. ej. definitiva con menos de 3 categorías o falta de una habilidad de potenciación). Es idéntico en main; este cambio no lo altera. El entry-gate de balance no se corrió porque no se incorpora ningún campeón nuevo. El dueño decide.

## Resumen (sin contar el básico)

| | Sprite propio (P/S) | Sprite genérico del motor (G) | Solo círculos/líneas/partículas (C) | Lectura bien | regular | mal |
|---|---|---|---|---|---|---|
| Mitad A antes (88 habilidades) | 19 | 38 | 31 | 12 | 67 | 9 |
| Mitad A después | 88 | 0 | 0 | 81 | 7 | 0 |
| Mitad B (84 habilidades, sin cambios) | 19 | 16 | 49 | 14 | 69 | 1 |

## Mitad A: antes y después

Tipo: A animación del personaje · P sprite/atlas propio · G sprite genérico del motor · C círculos/líneas/partículas · S sprite procedural propio (nuevo). Lectura en 844x390: B bien · R regular · M mal.

| Campeón | Habilidad | Antes (tipo · lectura) | Después | Medido antes: sprites vfxSprite · dibujos/cuadro · ondas · ráfagas | Captura |
|---|---|---|---|---|---|
| aelith | Básico: ataque básico | anim. personaje | anim. personaje | — · 16 · 1 · 3 | [antes](sheets/antes/aelith.jpg) · [después](sheets/despues/aelith.jpg) |
|  | Hab. 1: Instante roto | C · regular | S · bien | fxFrostRune · 0 · 5 · 27 |  |
|  | Hab. 2: Fractura de segundos | G · regular | S · bien | fxFrostRune · 13 · 2 · 22 |  |
|  | Hab. 3: Tiempo prestado | G · regular | S · bien | fxWhirl · 8 · 2 · 2 |  |
|  | Definitiva: La hora imposible | C · regular | S · bien | fxFrostRune · 0 · 4 · 13 |  |
| aurelia | Básico: ataque básico | anim. personaje | anim. personaje | — · 0 · 2 · 4 | [antes](sheets/antes/aurelia.jpg) · [después](sheets/despues/aurelia.jpg) |
|  | Hab. 1: Prisma | G · regular | S · bien | fxHolyHealBurst · 8 · 2 · 20 |  |
|  | Hab. 2: Refracción | G · regular | S · bien | fxHolyHealBurst · 12 · 2 · 22 |  |
|  | Hab. 3: Paso Luminal | G · regular | S · bien | fxHolyHealBurst · 13 · 2 · 22 |  |
|  | Definitiva: Catedral del Sol | G · regular | S · bien | fxHolyHealBurst · 11 · 3 · 42 |  |
| axiom | Básico: ataque básico | anim. personaje | anim. personaje | — · 0 · 1 · 3 | [antes](sheets/antes/axiom.jpg) · [después](sheets/despues/axiom.jpg) |
|  | Hab. 1: Error 404 | P · regular | S · bien | — · 32 · 1 · 21 |  |
|  | Hab. 2: Sobrescribir | P · regular | S · bien | — · 30 · 2 · 6 |  |
|  | Hab. 3: Teletransporte | C · mal | S · bien | — · 0 · 1 · 1 |  |
|  | Definitiva: Force Quit | P · bien | S · bien | — · 6 · 2 · 1 |  |
| baltra | Básico: ataque básico | anim. personaje | anim. personaje | — · 0 · 0 · 3 | [antes](sheets/antes/baltra.jpg) · [después](sheets/despues/baltra.jpg) |
|  | Hab. 1: Bronce vivo | G · regular | S · bien | fxWave · 7 · 4 · 22 |  |
|  | Hab. 2: Bajo la campana | G · regular | S · regular | fxHolyShieldBubble · 22 · 2 · 2 |  |
|  | Hab. 3: Badajo de retorno | G · regular | S · bien | fxWave · 7 · 2 · 22 |  |
|  | Definitiva: Que todos la escuchen | G · regular | S · bien | fxWave · 2 · 3 · 42 |  |
| brakk | Básico: ataque básico | anim. personaje | anim. personaje | — · 0 · 0 · 3 | [antes](sheets/antes/brakk.jpg) · [después](sheets/despues/brakk.jpg) |
|  | Hab. 1: Muro de asedio | G · mal | S · bien | fxSpike · 0 · 3 · 25 |  |
|  | Hab. 2: Torreta de clavos | G · mal | S · bien | fxSpike · 10 · 2 · 5 |  |
|  | Hab. 3: Apuntalar | G · regular | S · bien | fxHolyShieldBubble · 0 · 2 · 2 |  |
|  | Definitiva: Demolición final | G · mal | S · bien | fxSpike · 0 · 4 · 23 |  |
| brasa | Básico: ataque básico | anim. personaje | anim. personaje | — · 16 · 1 · 3 | [antes](sheets/antes/brasa.jpg) · [después](sheets/despues/brasa.jpg) |
|  | Hab. 1: Centinela de Latón | C · regular | S · bien | — · 4 · 2 · 3 |  |
|  | Hab. 2: Purga de Vapor | C · regular | S · bien | — · 15 · 2 · 64 |  |
|  | Hab. 3: Desmontaje Rápido | C · mal | S · bien | — · 13 · 1 · 1 |  |
|  | Definitiva: Turno de Emergencia | C · regular | S · bien | — · 2 · 2 · 5 |  |
| bront | Básico: ataque básico | anim. personaje | anim. personaje | — · 1 · 0 · 3 | [antes](sheets/antes/bront.jpg) · [después](sheets/despues/bront.jpg) |
|  | Hab. 1: Placa Arrojada | G · regular | S · bien | fxSpike · 8 · 1 · 21 |  |
|  | Hab. 2: Muro de Placas | G · regular | S · bien | fxSpike · 12 · 1 · 43 |  |
|  | Hab. 3: Pulso del Cristal | G · regular | S · bien | fxHolyShieldBubble · 14 · 2 · 58 |  |
|  | Definitiva: Ciudadela | G · regular | S · bien | fxHolyShieldBubble · 0 · 5 · 28 |  |
| cazadora | Básico: ataque básico | anim. personaje | anim. personaje | — · 16 · 1 · 3 | [antes](sheets/antes/cazadora.jpg) · [después](sheets/despues/cazadora.jpg) |
|  | Hab. 1: Flecha Perforante | C · regular | S · bien | — · 0 · 2 · 3 |  |
|  | Hab. 2: Trampa del Bosque | P · regular | S · regular | — · 17 · 1 · 1 |  |
|  | Hab. 3: Lluvia de la Cazadora | C · regular | S · bien | — · 7 · 2 · 26 |  |
|  | Definitiva: Cacería Salvaje | C · regular | S · bien | — · 0 · 2 · 5 |  |
| dariel | Básico: ataque básico | anim. personaje | anim. personaje | — · 0 · 1 · 3 | [antes](sheets/antes/dariel.jpg) · [después](sheets/despues/dariel.jpg) |
|  | Hab. 1: Nota discordante | G · regular | S · bien | fxFrostRune · 36 · 3 · 23 |  |
|  | Hab. 2: Marcha de salida | G · regular | S · bien | fxHolyShieldBubble · 0 · 2 · 2 |  |
|  | Hab. 3: Volver al estribillo | G · regular | S · bien | fxHolyHealBurst · 0 · 4 · 21 |  |
|  | Definitiva: Todavía hay una salida | G · regular | S · bien | fxFrostRune · 27 · 3 · 20 |  |
| eslabon | Básico: ataque básico | anim. personaje | anim. personaje | — · 0 · 1 · 4 | [antes](sheets/antes/eslabon.jpg) · [después](sheets/despues/eslabon.jpg) |
|  | Hab. 1: Cadena de Retorno | C · regular | S · bien | — · 51 · 1 · 6 |  |
|  | Hab. 2: Línea Infranqueable | C · regular | S · bien | — · 0 · 4 · 36 |  |
|  | Hab. 3: Custodia | C · mal | S · regular | — · 0 · 1 · 1 |  |
|  | Definitiva: Nadie Queda Atrás | C · regular | S · bien | — · 0 · 2 · 46 |  |
| facu_gm | Básico: ataque básico | anim. personaje | anim. personaje | — · 0 · 0 · 3 | [antes](sheets/antes/facu_gm.jpg) · [después](sheets/despues/facu_gm.jpg) |
|  | Hab. 1: Corriente de Resaca | G · regular | S · bien | fxWave · 0 · 2 · 42 |  |
|  | Hab. 2: Presión Abisal | G · regular | S · bien | fxVortex · 0 · 2 · 44 |  |
|  | Hab. 3: Cabalgar la Ola | G · regular | S · bien | fxSplash · 0 · 2 · 55 |  |
|  | Definitiva: El Océano Reclama la Arena | G · regular | S · bien | fxWave · 0 · 3 · 22 |  |
| farolero | Básico: ataque básico | anim. personaje | anim. personaje | — · 132 · 0 · 2 | [antes](sheets/antes/farolero.jpg) · [después](sheets/despues/farolero.jpg) |
|  | Hab. 1: Farol de Guardia | C · regular | S · bien | — · 56 · 1 · 1 |  |
|  | Hab. 2: Destello | C · regular | S · bien | — · 30 · 2 · 21 |  |
|  | Hab. 3: Paso Seguro | C · regular | S · bien | — · 86 · 1 · 1 |  |
|  | Definitiva: Vigilia | C · regular | S · bien | — · 9 · 2 · 1 |  |
| guerrero | Básico: ataque básico | anim. personaje | anim. personaje | — · 0 · 0 · 3 | [antes](sheets/antes/guerrero.jpg) · [después](sheets/despues/guerrero.jpg) |
|  | Hab. 1: Corte Sangrante | P · bien | S · regular | — · 88 · 2 · 4 |  |
|  | Hab. 2: Triple Golpe | P · bien | S · regular | — · 56 · 3 · 9 |  |
|  | Hab. 3: Trampa de Área | P · regular | S · bien | — · 45 · 2 · 10 |  |
|  | Definitiva: Pestilencia Sombría | P · regular | S · bien | — · 107 · 3 · 2 |  |
| ilkan | Básico: ataque básico | anim. personaje | anim. personaje | — · 64 · 1 · 4 | [antes](sheets/antes/ilkan.jpg) · [después](sheets/despues/ilkan.jpg) |
|  | Hab. 1: Lanza-Pendón | P · bien | S · bien | — · 88 · 2 · 47 |  |
|  | Hab. 2: Piel de Duna | C · regular | S · bien | — · 0 · 1 · 22 |  |
|  | Hab. 3: Grito de Caravana | C · regular | S · bien | — · 10 · 2 · 20 |  |
|  | Definitiva: Coloso de Arena | P · regular | S · bien | — · 0 · 2 · 2 |  |
| iria | Básico: ataque básico | anim. personaje | anim. personaje | — · 51 · 1 · 3 | [antes](sheets/antes/iria.jpg) · [después](sheets/despues/iria.jpg) |
|  | Hab. 1: Ancla | C · regular | S · bien | — · 87 · 1 · 1 |  |
|  | Hab. 2: Tensión | C · regular | S · bien | — · 92 · 1 · 9 |  |
|  | Hab. 3: Corte de Hilo | C · regular | S · bien | — · 54 · 2 · 21 |  |
|  | Definitiva: Sello de los Tres Caminos | C · regular | S · bien | — · 22 · 2 · 1 |  |
| khepri | Básico: ataque básico | anim. personaje | anim. personaje | — · 0 · 0 · 3 | [antes](sheets/antes/khepri.jpg) · [después](sheets/despues/khepri.jpg) |
|  | Hab. 1: Enjambre | G · regular | S · bien | fxSpark · 0 · 4 · 72 |  |
|  | Hab. 2: Caparazón Vivo | G · regular | S · bien | fxHolyShieldBubble · 68 · 2 · 2 |  |
|  | Hab. 3: Vuelo de Élitros | G · regular | S · bien | fxWhirl · 0 · 2 · 22 |  |
|  | Definitiva: Eclipse de Escarabajos | G · regular | S · bien | fxSoulReapBurst · 0 · 4 · 83 |  |
| libertador | Básico: ataque básico | anim. personaje | anim. personaje | — · 10 · 1 · 5 | [antes](sheets/antes/libertador.jpg) · [después](sheets/despues/libertador.jpg) |
|  | Hab. 1: Bayoneta | P · bien | S · bien | — · 0 · 1 · 5 |  |
|  | Hab. 2: ¡Granaderos, a la carga! | P · bien | S · bien | — · 60 · 1 · 1 |  |
|  | Hab. 3: Carga de San Lorenzo | P · regular | S · bien | — · 0 · 2 · 55 |  |
|  | Definitiva: Cruce de los Andes | P · bien | S · bien | — · 0 · 3 · 64 |  |
| mago | Básico: ataque básico | anim. personaje | anim. personaje | — · 0 · 1 · 3 | [antes](sheets/antes/mago.jpg) · [después](sheets/despues/mago.jpg) |
|  | Hab. 1: Muro de Fuego | C · regular | S · bien | — · 40 · 1 · 7 |  |
|  | Hab. 2: Nova de Escarcha | P · bien | S · bien | fxIceCrystal · 0 · 1 · 13 |  |
|  | Hab. 3: Cadena de Relámpago | P · bien | S · bien | — · 0 · 1 · 8 |  |
|  | Definitiva: Cataclismo Elemental | P · bien | S · bien | fxIceCrystal, fxFrostRune · 0 · 4 · 47 |  |
| maura | Básico: ataque básico | anim. personaje | anim. personaje | — · 1 · 0 · 2 | [antes](sheets/antes/maura.jpg) · [después](sheets/despues/maura.jpg) |
|  | Hab. 1: Raíces de paso | G · regular | S · bien | fxSpike · 0 · 2 · 22 |  |
|  | Hab. 2: Corteza prestada | G · regular | S · bien | fxHolyShieldBubble · 0 · 2 · 2 |  |
|  | Hab. 3: Poda necesaria | G · regular | S · bien | fxScytheSlash · 123 · 2 · 14 |  |
|  | Definitiva: El bosque camina | G · regular | S · bien | fxSpike · 0 · 4 · 21 |  |
| morveth | Básico: ataque básico | anim. personaje | anim. personaje | — · 0 · 1 · 2 | [antes](sheets/antes/morveth.jpg) · [después](sheets/despues/morveth.jpg) |
|  | Hab. 1: Huerto maldito | G · regular | S · bien | fxSoulReapBurst · 75 · 4 · 15 |  |
|  | Hab. 2: Exhalación de peste | G · regular | S · bien | fxSoulReapBurst · 6 · 3 · 33 |  |
|  | Hab. 3: Simbiosis | G · regular | S · bien | fxHolyShieldBubble · 1 · 2 · 2 |  |
|  | Definitiva: Jardín de la peste | G · regular | S · bien | fxSoulReapBurst · 15 · 5 · 15 |  |
| morwen | Básico: ataque básico | anim. personaje | anim. personaje | — · 2 · 1 · 3 | [antes](sheets/antes/morwen.jpg) · [después](sheets/despues/morwen.jpg) |
|  | Hab. 1: Resina Amarga | C · regular | S · bien | — · 0 · 2 · 21 |  |
|  | Hab. 2: Sal de Ruptura | C · regular | S · bien | — · 0 · 2 · 21 |  |
|  | Hab. 3: Destilación | C · mal | S · bien | — · 1 · 1 · 1 |  |
|  | Definitiva: Alambique del Silencio | C · regular | S · bien | — · 0 · 2 · 61 |  |
| musashi | Básico: ataque básico | anim. personaje | anim. personaje | — · 4 · 0 · 3 | [antes](sheets/antes/musashi.jpg) · [después](sheets/despues/musashi.jpg) |
|  | Hab. 1: Corte del Rōnin | P · bien | S · regular | musashiRoninImpact · 13 · 1 · 9 |  |
|  | Hab. 2: Paso Fantasma | C · mal | S · regular | — · 0 · 1 · 2 |  |
|  | Hab. 3: Mil Cortes | C · mal | S · bien | — · 0 · 1 · 29 |  |
|  | Definitiva: Último Duelo | P · bien | S · bien | musashiPortal · 0 · 2 · 1 |  |

## Costo por cuadro

`tools/vfx/perf-skill-fx.js`: horda de 150 enemigos, las tres habilidades y la definitiva en bucle durante 5 s de render real, por campeón y alternando sin sprites (`SFA_OFF`) y con sprites, dos veces cada uno. Media entre los 22 campeones del tiempo de `render()` en CPU: **3.92 ms sin sprites, 4.04 ms con sprites** (p95 5.76 ms y 6 ms); máximo de efectos simultáneos en el pool: 40 de 40. Mayores diferencias por campeón (con menos sin): farolero +0.66 ms, khepri +0.59 ms, ilkan +0.47 ms. Chromium sin cabeza con varios procesos en la máquina: el ruido entre campeones es del orden de ±1 ms, así que es evidencia relativa y no certifica un teléfono. Detalle en `docs/vfx/perf-skill-fx.json`.

## Mitad B: auditoría (sin cambios en esta rama)

Misma escala. Valoración visual rápida; no se modificó ningún archivo de estos campeones.

| Campeón | Habilidad | Antes (tipo · lectura) | Después | Medido antes: sprites vfxSprite · dibujos/cuadro · ondas · ráfagas | Captura |
|---|---|---|---|---|---|
| myla | Básico: ataque básico | anim. personaje | sin cambios | — · 40 · 1 · 3 | [antes](sheets/antes/myla.jpg) |
|  | Hab. 1: Torre de Yogur | P · bien | sin cambios (otra rama) | — · 0 · 1 · 3 |  |
|  | Hab. 2: Yogurazo | P · bien | sin cambios (otra rama) | — · 4 · 4 · 83 |  |
|  | Hab. 3: Burbuja Cremosa | P · bien | sin cambios (otra rama) | — · 0 · 2 · 1 |  |
|  | Definitiva: BERRINCHE | P · bien | sin cambios (otra rama) | — · 0 · 6 · 42 |  |
| nahir | Básico: ataque básico | anim. personaje | sin cambios | — · 0 · 0 · 2 | [antes](sheets/antes/nahir.jpg) |
|  | Hab. 1: Astillas errantes | C · regular | sin cambios (otra rama) | fxSpark · 5 · 2 · 22 |  |
|  | Hab. 2: Reflejo fugitivo | C · regular | sin cambios (otra rama) | fxSpark · 50 · 2 · 2 |  |
|  | Hab. 3: Corte cruzado | C · regular | sin cambios (otra rama) | fxSpark · 15 · 2 · 22 |  |
|  | Definitiva: Galería de nadie | C · regular | sin cambios (otra rama) | fxSpark · 0 · 3 · 22 |  |
| nano_gm | Básico: ataque básico | anim. personaje | sin cambios | — · 0 · 1 · 3 | [antes](sheets/antes/nano_gm.jpg) |
|  | Hab. 1: Sentencia Umbría | C · regular | sin cambios (otra rama) | fxSoulReapBurst · 3 · 2 · 22 |  |
|  | Hab. 2: Edicto de Luz | C · regular | sin cambios (otra rama) | fxHolyHealBurst · 12 · 2 · 2 |  |
|  | Hab. 3: Inversión | C · regular | sin cambios (otra rama) | fxFrostRune · 82 · 2 · 22 |  |
|  | Definitiva: Juicio del GM | P · bien | sin cambios (otra rama) | fxSoulReapBurst, fxHolyHealBurst · 0 · 5 · 24 |  |
| nigromante | Básico: ataque básico | anim. personaje | sin cambios | — · 105 · 1 · 3 | [antes](sheets/antes/nigromante.jpg) |
|  | Hab. 1: Cosecha de Almas | P · bien | sin cambios (otra rama) | — · 20 · 4 · 24 |  |
|  | Hab. 2: Gólem de Carne | P · bien | sin cambios (otra rama) | nigroGolemSpawn · 43 · 2 · 20 |  |
|  | Hab. 3: Plaga de los Condenados | P · bien | sin cambios (otra rama) | nigroPlagueBurst, nigroPlague · 0 · 1 · 1 |  |
|  | Definitiva: Encarnación del Abismo | P · bien | sin cambios (otra rama) | — · 0 · 2 · 1 |  |
| oriel | Básico: ataque básico | anim. personaje | sin cambios | — · 40 · 1 · 2 | [antes](sheets/antes/oriel.jpg) |
|  | Hab. 1: Abrir Cicatriz | C · regular | sin cambios (otra rama) | fxVortex · 0 · 3 · 53 |  |
|  | Hab. 2: Eco de la Cicatriz | C · regular | sin cambios (otra rama) | fxFrostRune · 33 · 2 · 16 |  |
|  | Hab. 3: Paso entre Mundos | C · regular | sin cambios (otra rama) | fxSoulReapBurst · 0 · 2 · 26 |  |
|  | Definitiva: La Gran Cicatriz | C · regular | sin cambios (otra rama) | fxSoulReapBurst · 0 · 3 · 66 |  |
| orsa | Básico: ataque básico | anim. personaje | sin cambios | — · 4 · 1 · 3 | [antes](sheets/antes/orsa.jpg) |
|  | Hab. 1: Perno conductor | C · regular | sin cambios (otra rama) | fxBolt · 7 · 2 · 22 |  |
|  | Hab. 2: Apoyar la culata | C · regular | sin cambios (otra rama) | fxSpark · 2 · 2 · 2 |  |
|  | Hab. 3: Cerrar el circuito | C · regular | sin cambios (otra rama) | fxBolt · 1 · 2 · 20 |  |
|  | Definitiva: Tormenta de rescate | G · regular | sin cambios (otra rama) | fxBolt · 5 · 4 · 63 |  |
| profeta | Básico: ataque básico | anim. personaje | sin cambios | — · 8 · 0 · 3 | [antes](sheets/antes/profeta.jpg) |
|  | Hab. 1: Destino Restaurado | C · regular | sin cambios (otra rama) | — · 6 · 2 · 2 |  |
|  | Hab. 2: Visión del Inmortal | C · regular | sin cambios (otra rama) | — · 0 · 6 · 24 |  |
|  | Hab. 3: Danza del Augurio | G · regular | sin cambios (otra rama) | — · 0 · 2 · 10 |  |
|  | Definitiva: Ascensión del Elegido | C · mal | sin cambios (otra rama) | — · 3 · 4 · 4 |  |
| renko | Básico: ataque básico | anim. personaje | sin cambios | — · 0 · 1 · 4 | [antes](sheets/antes/renko.jpg) |
|  | Hab. 1: Surco de contención | G · regular | sin cambios (otra rama) | fxSpike · 10 · 1 · 21 |  |
|  | Hab. 2: Montículo | G · regular | sin cambios (otra rama) | fxSpike · 0 · 2 · 2 |  |
|  | Hab. 3: Devolver a la tierra | G · regular | sin cambios (otra rama) | fxSpike · 11 · 2 · 16 |  |
|  | Definitiva: Aquí siguen los nombres | G · regular | sin cambios (otra rama) | fxSpike · 5 · 4 · 43 |  |
| saelis | Básico: ataque básico | anim. personaje | sin cambios | — · 0 · 1 · 3 | [antes](sheets/antes/saelis.jpg) |
|  | Hab. 1: Abanico de Plumas | C · regular | sin cambios (otra rama) | fxWhirl · 7 · 2 · 22 |  |
|  | Hab. 2: Ráfaga Ascendente | G · regular | sin cambios (otra rama) | fxWhirl · 0 · 2 · 20 |  |
|  | Hab. 3: Llamado del Plumaje | G · regular | sin cambios (otra rama) | fxWhirl · 4 · 2 · 2 |  |
|  | Definitiva: Cielo de Plumas | G · regular | sin cambios (otra rama) | fxWhirl · 0 · 3 · 34 |  |
| segador | Básico: ataque básico | anim. personaje | sin cambios | — · 0 · 0 · 3 | [antes](sheets/antes/segador.jpg) |
|  | Hab. 1: Tajo del Segador | P · bien | sin cambios (otra rama) | fxScytheSlash · 0 · 2 · 10 |  |
|  | Hab. 2: Armadura de la Furia | C · regular | sin cambios (otra rama) | — · 2 · 2 · 2 |  |
|  | Hab. 3: Último Aliento | C · regular | sin cambios (otra rama) | — · 1 · 2 · 2 |  |
|  | Definitiva: Segador de Almas | P · regular | sin cambios (otra rama) | fxSoulReapBurst · 43 · 2 · 1 |  |
| sira | Básico: ataque básico | anim. personaje | sin cambios | — · 74 · 1 · 3 | [antes](sheets/antes/sira.jpg) |
|  | Hab. 1: Línea de tinta | C · regular | sin cambios (otra rama) | fxFrostRune · 18 · 1 · 21 |  |
|  | Hab. 2: Volver sobre los pasos | G · regular | sin cambios (otra rama) | fxWhirl · 0 · 2 · 2 |  |
|  | Hab. 3: Borrar el camino | C · regular | sin cambios (otra rama) | fxFrostRune · 0 · 2 · 10 |  |
|  | Definitiva: Atlas de los ausentes | C · regular | sin cambios (otra rama) | fxFrostRune · 29 · 3 · 30 |  |
| solciju | Básico: ataque básico | anim. personaje | sin cambios | — · 4 · 1 · 3 | [antes](sheets/antes/solciju.jpg) |
|  | Hab. 1: Vino maldito | C · regular | sin cambios (otra rama) | fxSoulReapBurst · 30 · 2 · 12 |  |
|  | Hab. 2: Barrica añeja | C · regular | sin cambios (otra rama) | fxSoulReapBurst · 0 · 2 · 2 |  |
|  | Hab. 3: Brindis a solas | C · regular | sin cambios (otra rama) | fxHolyShieldBubble · 14 · 2 · 2 |  |
|  | Definitiva: Gran Reserva | P · regular | sin cambios (otra rama) | fxSoulReapBurst · 20 · 4 · 13 |  |
| soporte | Básico: ataque básico | anim. personaje | sin cambios | — · 4 · 1 · 3 | [antes](sheets/antes/soporte.jpg) |
|  | Hab. 1: Alba Purificadora | P · regular | sin cambios (otra rama) | fxHolyHealBurst · 6 · 3 · 21 |  |
|  | Hab. 2: Bendición de Guerra | C · regular | sin cambios (otra rama) | — · 0 · 2 · 2 |  |
|  | Hab. 3: Escudo Sagrado | C · regular | sin cambios (otra rama) | — · 14 · 2 · 2 |  |
|  | Definitiva: Bendición Suprema | C · regular | sin cambios (otra rama) | fxHolyHealBurst · 5 · 3 · 2 |  |
| tanque | Básico: ataque básico | anim. personaje | sin cambios | — · 0 · 0 · 3 | [antes](sheets/antes/tanque.jpg) |
|  | Hab. 1: Torbellino | C · regular | sin cambios (otra rama) | — · 25 · 3 · 43 |  |
|  | Hab. 2: Embestida | C · regular | sin cambios (otra rama) | — · 0 · 2 · 13 |  |
|  | Hab. 3: Grito de Guerra | C · regular | sin cambios (otra rama) | — · 0 · 2 · 2 |  |
|  | Definitiva: Grito Provocador | C · regular | sin cambios (otra rama) | — · 0 · 3 · 2 |  |
| tibor | Básico: ataque básico | anim. personaje | sin cambios | — · 0 · 1 · 3 | [antes](sheets/antes/tibor.jpg) |
|  | Hab. 1: Nube obrera | C · regular | sin cambios (otra rama) | fxSpark · 16 · 4 · 64 |  |
|  | Hab. 2: Volvé a casa | C · regular | sin cambios (otra rama) | fxHolyShieldBubble · 2 · 2 · 2 |  |
|  | Hab. 3: Polen de aviso | C · regular | sin cambios (otra rama) | fxSpark · 9 · 2 · 22 |  |
|  | Definitiva: El cielo zumba | G · regular | sin cambios (otra rama) | fxSpark · 0 · 4 · 63 |  |
| velmira | Básico: ataque básico | anim. personaje | sin cambios | — · 5 · 1 · 3 | [antes](sheets/antes/velmira.jpg) |
|  | Hab. 1: Máscara Arrojada | C · regular | sin cambios (otra rama) | fxSpark · 0 · 2 · 22 |  |
|  | Hab. 2: Coro de Rostros | C · regular | sin cambios (otra rama) | fxFrostRune · 7 · 2 · 20 |  |
|  | Hab. 3: Cambio de Rostro | C · regular | sin cambios (otra rama) | fxSpark · 0 · 2 · 22 |  |
|  | Definitiva: El Gran Teatro | P · regular | sin cambios (otra rama) | fxFrostRune · 4 · 3 · 22 |  |
| vesper | Básico: ataque básico | anim. personaje | sin cambios | — · 0 · 0 · 3 | [antes](sheets/antes/vesper.jpg) |
|  | Hab. 1: Agujas de penumbra | C · regular | sin cambios (otra rama) | fxSoulReapBurst · 9 · 2 · 22 |  |
|  | Hab. 2: Costura de fuga | C · regular | sin cambios (otra rama) | fxSoulReapBurst · 25 · 4 · 58 |  |
|  | Hab. 3: Deshilachar | C · regular | sin cambios (otra rama) | fxScytheSlash · 0 · 3 · 21 |  |
|  | Definitiva: La última puntada | G · regular | sin cambios (otra rama) | fxSoulReapBurst · 0 · 6 · 59 |  |
| veyra | Básico: ataque básico | anim. personaje | sin cambios | — · 3 · 0 · 3 | [antes](sheets/antes/veyra.jpg) |
|  | Hab. 1: Abrir la herida | C · regular | sin cambios (otra rama) | fxScytheSlash · 0 · 3 · 22 |  |
|  | Hab. 2: Paso escarlata | C · regular | sin cambios (otra rama) | fxScytheSlash · 0 · 2 · 21 |  |
|  | Hab. 3: Pacto de dolor | C · regular | sin cambios (otra rama) | fxHolyShieldBubble · 14 · 2 · 2 |  |
|  | Definitiva: La última herida | C · regular | sin cambios (otra rama) | fxScytheSlash · 13 · 4 · 21 |  |
| vhal | Básico: ataque básico | anim. personaje | sin cambios | — · 0 · 1 · 3 | [antes](sheets/antes/vhal.jpg) |
|  | Hab. 1: Estrella Errante | C · regular | sin cambios (otra rama) | fxBolt · 1 · 1 · 21 |  |
|  | Hab. 2: Pozo Gravitatorio | G · regular | sin cambios (otra rama) | fxVortex · 38 · 4 · 64 |  |
|  | Hab. 3: Órbita | P · bien | sin cambios (otra rama) | fxFrostRune · 0 · 2 · 6 |  |
|  | Definitiva: Colapso | P · bien | sin cambios (otra rama) | fxVortex · 35 · 4 · 63 |  |
| ynara | Básico: ataque básico | anim. personaje | sin cambios | — · 0 · 1 · 3 | [antes](sheets/antes/ynara.jpg) |
|  | Hab. 1: Mirada fulminante | C · regular | sin cambios (otra rama) | — · 1 · 3 · 34 |  |
|  | Hab. 2: Estrogonof reparador | P · regular | sin cambios (otra rama) | — · 52 · 4 · 64 |  |
|  | Hab. 3: No quiero seguir esta conversación | C · regular | sin cambios (otra rama) | — · 0 · 1 · 55 |  |
|  | Definitiva: Santa Paciencia | P · bien | sin cambios (otra rama) | — · 12 · 3 · 55 |  |
| zahra | Básico: ataque básico | anim. personaje | sin cambios | — · 4 · 1 · 3 | [antes](sheets/antes/zahra.jpg) |
|  | Hab. 1: Boca de horno | G · regular | sin cambios (otra rama) | fortFireBurst · 6 · 2 · 22 |  |
|  | Hab. 2: Enfriar | G · regular | sin cambios (otra rama) | fxSplash · 25 · 2 · 2 |  |
|  | Hab. 3: Paso de ceniza | G · regular | sin cambios (otra rama) | fortFireBurst · 0 · 2 · 56 |  |
|  | Definitiva: Abrir todas las válvulas | P · bien | sin cambios (otra rama) | fortFireBurst · 0 · 5 · 58 |  |

## Pendientes

- **Revisión humana de arte**: todo es procedural y generado por script; la valoración de esta tabla es del autor, no un PASS del Visual Gate (docs/ART_BIBLE.md §8). Conviene mirar en un teléfono real el tamaño de los motivos y la densidad de las definitivas.
- Las pasivas no se tocaron. Los básicos solo suman un destello corto; no se probó cada skin.
- El kit genérico de los campeones Expedición/Ascensión sigue emitiendo sus partículas (sin sprites ni ondas) para no alterar el azar de la partida; los pulsos de zonas persistentes todavía llaman al kitFx genérico además del pulso propio.
- La mitad B (`myla` … `zahra`) queda para la otra rama; su tabla de arriba es solo diagnóstico.
- Las variantes de color de las habilidades persistentes que no son objeto del motor (listas de trampas, zonas con demora) se fijaron a mano por habilidad.
