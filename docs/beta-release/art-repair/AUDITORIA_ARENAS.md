# Auditoría de arenas: arte viejo vs Códice (2026-11-07)

Referencia única: Códice (`assets/ui/codex/arenas/*`, `art-source/codex-covers/arena_*.jpg`). Método: Chromium, `index.html?dev=1&lazy=0`, `startRun` por `currentArena`, captura 1000x560 en el spawn (capturas locales; la de Ciudad está en esta carpeta). Divina no se pudo capturar en el tiempo del arnés (pendiente).

## Hecho en esta tanda
- **Ciudad Maldita: estatua central** rehecha (antes: pieza de 27x32 ampliada x6 sobre una elipse turquesa dibujada por código; ahora monumento completo del Códice: estatua encapuchada, pedestal escalonado octogonal y estanque turquesa, 81x106 nativo dibujado x2).
- **Ciudad Maldita: faroles** (12 por mapa; antes 34x32 ampliado x2,6 con un recuadro gris de halo; ahora farol de hierro forjado 22x46 x2 con linterna naranja).
- Antes/después: `ciudad-estatua-antes-despues.png`. Respaldo procedural/arte anterior intacto si el PNG no carga.

## Segunda tanda (2026-11-07)
- **Infernal: pentagrama central** y **Acuática: templo/espiral central** repintados (Runway, 16 cr; `infernal-acuatica-centro-antes-despues.png`). Filas 3 y 4 de abajo quedan resueltas en lo central; faltan sus props.
- **Ciudad: escombros** a escala nativa x1 (pintor determinista, 0 cr). `barril_0` ya se dibuja reduciendo (60x94 a 40-64 px), no se tocó; `fogata_0`, `fuente_0`, `columna_0`, `valla_0`, `arco_0` y `arbol_seco_0` NO se usan en el renderer de Ciudad (código muerto), así que repintarlos no cambia nada visible.
- Sin saldo en la tanda: disco solar de Laberinto y paneles/vetas de Fortaleza quedan pendientes.
- `tools/ciudad/smoke.js` también falla en `main` limpio (`1a2b4c3e`): ver ART_CREDITS/resumen.

## Pendiente, priorizado por visibilidad
| # | Arena | Qué no coincide con el Códice / se ve tosco | Dónde | Costo estimado |
|---|---|---|---|---|
| 1 | Ciudad | Piezas chicas ampliadas: `barril_0` (60x94), `escombros_0`, `fogata_0`, `fuente_0`, `reja_0`, `arco_0`, `columna_0`, `valla_0` (24-60 px a 2-6x); casas `casa_a/b` en `art-source` sin integrar (casa_b rechazada por vista isométrica); suelo de calle con tile repetido y «huellas» ámbar evidentes | `assets/vfx/ciudad/`, `cm-render.js` | 5-6 gen (≈48 cr) o pintor determinista |
| 2 | Fortaleza | Arena plana y vacía: pocos props (barriles, rejillas, 2 estandartes rojos lisos); el Códice tiene paneles de rejilla roja grandes y vetas de lava, ausentes | `js/arenas/fortaleza/fort-art.js` | 3-4 gen |
| 3 | Infernal | Pentagrama central 100 % procedural (líneas de trazo uniforme) sobre piso nuevo; el Códice trae vetas de lava y charcos naranjas | `arena.js`/decorado del hub | 2 gen o pintor |
| 4 | Acuática | Espiral central y círculos procedurales; faltan corales/ruinas del Códice como arte propio (hoy dibujo por código) | `arena-props.js` | 2-3 gen |
| 5 | Laberinto | Disco solar central procedural; obeliscos aceptables | `arena-props.js` | 1-2 gen |
| 6 | Divina | Sin pack propio, suelo plano de baldosas y un altar «+» (auditoría previa 35/100); sin captura en esta pasada | `arena.js` | 4+ gen |
| 7 | Micelial | Suelo posterizado y hongos de dibujo básico frente al Códice (más denso) | `arena.js` | 2-3 gen |
| 8 | Minas | Concepto del Códice es un mapa isométrico, el juego es cenital: no se puede igualar; props de cristal/vagonetas simples | `js/arenas/minas` | 2-3 gen |
| 9 | Abismo | Altar central correcto; piso `abismo_piso` rechazado (diagonal tipo papel tapiz) | `art-source/runway-world/abismo` | 1 gen |
| 10 | Bosque / Hielo | Ya con `world-v1`, coherentes con el Códice; solo piso e hitos menores | - | - |

Otros: las portadas `assets/ui/codex/arenas/*.png` de Ciudad y Minas siguen siendo mapas de concepto con marcas numeradas (la de Ciudad no muestra la estatua nueva).
