# Píxel unificado — resultados de la primera pasada

Canon: `docs/ART_BIBLE.md` §14. Medición: `node tools/art/pixel-density.js` (informe completo en
`docs/art-gate/PIXEL_DENSITY.md`, excepciones en `docs/art-gate/pixel-density-exceptions.json`).
Capturas con Playwright (Chromium, 1280×720) en `antes/` y `despues/`: `micelial_inicial`, `micelial_maduro`,
`ciudad_fuera_mapa`, `ciudad_fuera_mapa2`, `ciudad_plaza`, `portrait_verdugo_ciudad`, `portrait_dragon_forja` (el retrato
tipo Códice dibuja el sprite real con el mismo código de la ficha).

## Mediciones del gate (antes → después)

| Asset | Antes | Después |
|---|---|---|
| Verdugo de Ciudad (`cm_verdugo`) | bloque 1, 2,82 u/px (×3 el roster), 271 tonos — PIXEL_GRUESO | 0,99 u/px (×1,1), 44 tonos, 0 hallazgos. Medido también con `arena_lineup.js ciudad` (0,99 u/px) |
| Retrato Dragón de la Forja (`battlefield/dragon_forja`) | 0,76 u/px, 266 tonos, suave 0,238, ruido 20,6 — ILUSTRACION | bloque 2 → 1,51 u/px, 37 tonos, suave 0, 0 hallazgos |
| Mapa Micelial inicial | JPG, 898 tonos — PALETA_EXCESIVA, FORMATO_JPG | PNG, 68 tonos, ruido 8, 0 hallazgos |
| Mapa Micelial maduro | JPG, 287 tonos — PALETA_EXCESIVA, FORMATO_JPG | PNG, 59 tonos, ruido 7,1, 0 hallazgos |
| Total entidades con desvío | 55 de 191 | 51 de 191 (todas con excepción documentada y plan) |

## Qué se cambió (sin tocar hitboxes, estadísticas, `js/net/*`, `server/*`, VFX/íconos de habilidades)

- **Verdugo**: rehecho con `tools/art/pixrig/cm_verdugo.py` (celda 128×128, personaje de 95 px, mismo diseño: bruto encorvado de
  capucha carmesí, hombreras de hueso, hachón de ejecución). Mismos nombres de set (`idle`, `walk`, `atk`, `atk2`, `chop`,
  `sweep`, `smash`, `hit`, `hurt`, `death`, `walk_down`, `walk_up`), mismo `radius`/`CM_HMUL`: ocupa lo mismo en pantalla.
- **Dragón de la Forja**: `tools/art/battlefield_pixelize.py` (reducción ×2 a la grilla nativa, paleta propia de 40 colores,
  contorno de 1 px, ampliación por vecino más cercano). Mismo tamaño de celda y mismo `ref`: sin cambios de escala. El original
  queda en `art-source/battlefield/dragon_forja.png`.
- **Suelo Micelial**: `tools/art/micelial/pixel_floor.py` (mediana, paleta k-means propia, filtro de moda y limpieza de
  clústeres diminutos: desaparecen las motas y garabatos violetas/cian sobre la tierra). Se sirven como PNG y se dibujan con
  `imageSmoothingEnabled = false` (antes `true`). Los JPG originales quedan en `art-source/micelial/map/`.
- **Ciudad fuera del mapa**: ciudad lejana procedural (siluetas de techos casi negras con pocas ventanas, 2 u/px) y muralla de
  borde en lugar del ladrillo repetido; el héroe contrasta contra un fondo mucho más oscuro.

## Pendientes (revisión humana de arte)

- Aprobar o ajustar a ojo los cuatro cambios (el gate mide, no decide estilo; §8).
- El Verdugo nuevo en idle lleva el hachón apoyado adelante y su hoja se lee grande: valorar tamaño y pose; faltan tiempos de
  animación afinados (los cuadros de `smash`/`sweep` son una primera pasada) y la estela carmesí del barrido.
- Quedan 51 desvíos documentados: retratos del Códice (JPG ilustrados), 14 retratos de campo de batalla (`battlefield_pixelize.py`
  sirve de plantilla), `cm_perro`/`cm_acechante`/`cm_campanero`/`mn_devoraluz`/`leviatan`/`minotauro` por píxel grueso (candidatos a
  pixrig) y texturas del Abismo con paleta alta. El `fortaleza/dragon_forja` (atlas) figura por píxel grueso pero en partida se
  dibuja el retrato de campo de batalla.
- El umbral de "ilustración" (suave > 0,18 y ruido < 80) es una heurística: puede marcar sprites legítimos de baja textura.
- No se midieron el rendimiento ni multiplayer de estos cambios.
