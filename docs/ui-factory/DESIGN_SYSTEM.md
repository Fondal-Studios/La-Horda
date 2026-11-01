# DESIGN_SYSTEM — UI Factory (Módulo B, director de diseño)

Fuentes: `docs/ui-factory/BASELINE.md`, tokens existentes en `css/ui-kit.css` (`--ui-*`), `docs/ART_BIBLE.md`. **Principio: no se crea un segundo sistema visual; se reutilizan los tokens `--ui-*` y se añaden solo contratos de interacción.** Dirección: Diablo IV (oscuro, materiales, jerarquía), Wild Rift (claridad y ergonomía), pixel art 16-bit propio.

## 1. Tokens (reutilizados, no redefinidos)
Superficies `--ui-bg-1/2`, `--ui-inset`; líneas `--ui-line(-hi)`; acento `--ui-accent`, oro `--ui-gold`; sombra dura `--ui-shadow(-sm)`; tipografías `--ui-font` (VT323), `--ui-font-brand` (Press Start 2P). Sombras duras y bordes cuadrados de 2–3 px; sin gradientes suaves ni sombras difusas en controles de menú.

## 2. Contratos de componente (criterios verificables)

| ID | Componente | Contrato | Verificación |
|---|---|---|---|
| UF-T1 | Blanco táctil | Todo control interactivo de menú ≥ 44×44 CSS px, también casillas | `tools/ui-factory/baseline.js` SECTIONS=a11y → `under44 = 0` (844×390 y 1280×800) |
| UF-T2 | Casilla | Pixel-art 44 px, marca dorada, foco visible | captura inventario/pausa |
| UF-B1 | Botón de combate — presión | Cambio visual perceptible en el mismo handler del evento de entrada (clase `uf-press`); objetivo < 50 ms desde la recepción | prueba funcional + captura reposo/presionado |
| UF-B2 | Presión mantenida | A los 150 ms `uf-hold` (anillo pulsante) | idem |
| UF-B3 | Activación confirmada | Solo si el juego realmente ejecutó (botón sale de `ready` o sube `basicCd`): `uf-confirm` (destello + anillo expansivo ≠ presión) | evento `uf:confirm`, ausente en cooldown |
| UF-B4 | Cooldown | El número/barrido de `hud.js` sigue visible durante la presión | captura |
| UF-B5 | Bloqueado / sin recursos | Al **presionar** (no al soltar) `uf-reject`: sacudida + anillo discontinuo (rojo = cooldown, azul = recursos); no emite `confirm` | evento `uf:reject` |
| UF-B6 | Entradas | Mouse, táctil y teclado producen los mismos estados | prueba funcional |
| UF-B7 | Movimiento reducido | Con `body.reduce-motion` o `prefers-reduced-motion`: sin escala ni sacudida | CSS |
| UF-A1 | Accesibilidad HUD | `role="button"`, `aria-label`, `aria-disabled` en botones de combate | DOM |

## 3. Lo que NO cambia
Reglas de juego, balance, posiciones y tamaños del HUD, assets, flujos de red/guardado.
