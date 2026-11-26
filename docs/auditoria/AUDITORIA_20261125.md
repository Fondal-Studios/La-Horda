# Auditoría de La Horda — 25/11/2026

Base: `origin/main` en `50589154`. Pedido del doctor: auditar el repo y mejorar, **con dibujos de Anakin**, la
identidad de las arenas y de los monstruos que no llegan a la calidad de los guardianes. Todo dibujo pasa por el
circuito de Anakin (API de proyectos → tabla `creaciones` → evaluación del doctor → lecciones → LoRA).

## 1. Hallazgos generales (por prioridad)

| # | Severidad | Hallazgo | Dónde |
|---|---|---|---|
| 1 | Alta | El inventario de arte en CI (`build-art-atlas.js --check`) hashea todo el arte; dos sesiones que suman PNG chocan siempre en `docs/art/ATLAS_ARTE.json/.md`. Regenerarlo al final, después de rebasar sobre la otra rama. | `.github/workflows/champion-entry-balance.yml:58`, `tools/art/build-art-atlas.js` |
| 2 | Alta (lanzamiento) | Legal en borrador: `draft:true`, `supportEmail:""`; textos sin revisión. | `js/data/legal-config.js`, `legal/*.html` |
| 3 | Media | El relay siempre acepta orígenes de githack (sirve cualquier repo) y Render no fija `ALLOWED_ORIGINS_STRICT=1`; plan free que se duerme. | `server/relay.js:68`, `render.yaml` |
| 4 | Media | 40 workflows, muchos de un campeón o de ramas viejas; `package.json` sin `test`; ~267 pruebas repartidas en `tools/**` (orquesta `tools/quality/qa.js`). | `.github/workflows/` |
| 5 | Media | `index.html` carga ~520 scripts globales en orden frágil. | `index.html` |
| 6 | Media | `drawEnemyBody` prueba ~10 capas de arte en cascada; difícil saber qué se ve. | `js/rendering/entities.js:321-360` |
| 7 | Baja | Body-swaps muertos (cangrejo, medusa eléctrica, sirena, esfinge ya tienen hoja propia) pero se arman igual. | `js/data/body-swaps.js:52-75` |
| 8 | Baja | Docs vencidos o que se contradicen: `ARENA_ASSET_REQUIREMENTS.md` (ver aviso), densidad 1 px = 2 u para personajes en la Review vs 1,0 u/px en `docs/ART_BIBLE.md` (manda la Biblia), cinco listas de faltantes distintas (la viva es `docs/art/ATLAS_ARTE.md`), `LA_HORDA_ALPHA_*` históricos. | raíz del repo |

## 2. Arte: dónde está el salto de calidad

**Arenas.** Hielo y Bosque tienen props pintados (`assets/sprites/arenas/world-v1`). Infernal, Laberinto y Acuática
siguen con columnas, altares, obeliscos, corales y naufragio dibujados por código (`js/rendering/arena-props.js`):
se ven de otra familia que los personajes.

**Monstruos más flojos frente a los guardianes** (según `docs/art/ATLAS_ARTE.md` y el gate de densidad):
- Abismo: errante, acechador, heraldo, devorador, tejedor — 50–60 px, caminata de 2 cuadros, oscuros y sin silueta.
- Jefes en tira de 4 cuadros (battlefield): golem de cuerpos, bestia del bosque, minotauro, leviatán, dragón de la forja,
  micelio, carcelero del abismo, jefes de Ciudad y Minas.
- Demonio Mayor (ilustración a 2,14 u/px), Lobo Ártico (sin ataque ni muerte).

## 3. Qué se hizo en esta rama (`claude/arte-arenas-monstruos`)

- `tools/art/anakin/`: receta para pedirle dibujos a Anakin por su API (`pedir_api.py`, de a uno, con boceto,
  referencia de estilo, semilla y LoRA PixelArtRedmond), conversión al canon (`pixelar.py`: fondo fuera, alfa binario,
  paleta limitada, contorno de 1 px) y empaquetado (`pack-anakin-world.py`).
- `art-source/arenas/anakin-20261125/`: bocetos (hechos desde los props pintados de hielo/bosque ya aprobados), lote y
  dibujos crudos de Anakin para Infernal, Laberinto y Acuática.
- `js/rendering/arena-world-art.js`: Infernal/Laberinto/Acuática usan el pack pintado si existe y cargó; si no, queda
  el prop por código (misma huella y colisión, nada de navegación cambia).
- `art-source/abismo/anakin-20261125/`: primer lote de cuadros clave de los monstruos del Abismo, con el guardián
  Tanque del Códice como referencia de calidad.

## 4. Pendiente

1. Evaluación del doctor de cada dibujo (aprobar / rechazar / modificar con motivo) → `/core/v1/dibujo_opinion`.
2. Empaquetar los aprobados, regenerar `ATLAS_ARTE` y pasar `pixel-density --strict`, `arena-validator --strict`,
   `test-arena-world.js` (necesitan Chromium).
3. Abismo: con el cuadro clave aprobado, redibujar todos los cuadros de cada atlas (boceto = cuadro actual, misma semilla).
4. Jefes battlefield y Demonio Mayor.
