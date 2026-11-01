# index.html — procedimiento del integrador

`index.html` tiene un único dueño: el **integrador**. Ningún paquete lo edita. Cada paquete agrega aquí su pedido y el integrador lo aplica en un PR propio.

| Paquete | Líneas pedidas (en este orden) | Debe cargar después de | Estado |
|---|---|---|---|
| G Build Evolution | `<script src="js/data/build-synergy.js"></script>` y `<script src="js/systems/build-synergy.js"></script>` | `js/systems/boons.js` y `js/systems/skill-evolution.js` | pendiente: falta evaluación independiente |
| I Premium Skins | `<script src="js/systems/cosmetic-catalog.js"></script>` | `js/assets/croma-skins-meta.js` y sus extensiones | pendiente: solo catálogo, sin assets terminados |
| UI Factory | `css/ui-factory/*.css` y `js/ui-factory/hud-feedback.js` | `css/ui-kit.css`, `js/ui/hud.js` | pendiente: Gate 2 |
| Visual Impact | 7 líneas (`css/beta-visual.css`, `js/beta/*.js`) | ver `docs/beta/VISUAL_IMPACT_SLICE.md` | pendiente: < 90/100 |

Reglas: un PR de integración por candidato; regresión completa antes y después; si el candidato falla se revierte solo esa línea.
