# INTEGRATION_CONTRACTS — UI Factory (Módulo F, arquitecto interno)

Rama: `feature/beta-ui-ux-factory` (base `e194910b`, main). Estado: **propuesta de contrato v1 — pendiente de aprobación del arquitecto general**.

## 1. Inspección previa (ramas y PR activos al 2026-11-01)

| PR | Rama | Relación con la fábrica UI |
|---|---|---|
| #247 S0A | `claude/s0a-arquitectura-compartida` | Define paquetes A/B/C y `ownership.json`. **No incluye un paquete de UI.** `index.html` pertenece al «Integrador». |
| #248 S0B | `claude/s0b-estabilizacion` | Toca `js/systems/*`, `js/net/net-rooms.js`, `js/storage/save-sanitize.js`, `tools/quality/*`. Ninguno lo toca esta fábrica. |
| #246 social-content-factory, #243 hero-collection, #239, #241 (arte/Códice), #232 art-engine, #228 factory | varias | Solo se solapan en `index.html` (líneas de `<script>`) y posiblemente `css/*` de menús; esta fábrica **no edita CSS/JS existentes**. |
| #92, #90 | antiguas (oct.) | `claude/cw-mapa-arte` toca el HUD de Cristales; riesgo de conflicto bajo porque no editamos `hud*.css`. |

Conclusión: la fábrica es **aditiva**. Es un paquete nuevo («UI») que no existe en `ownership.json`; se solicita añadirlo (§6).

## 2. Propiedad y límites

| Área | Dueño |
|---|---|
| `js/ui-factory/**`, `css/ui-factory/**`, `tools/ui-factory/**`, `docs/ui-factory/**` | **Paquete UI (esta fábrica)** |
| `index.html` | Integrador. La fábrica pide **exactamente 4 líneas** (§4). |
| `js/ui/**`, `css/*.css` existentes, `js/core/**`, `js/systems/**`, `js/champions/**`, `js/arenas/**` | Otros (solo lectura para la fábrica) |
| `contracts/v1/**` (S0A) | Arquitectura; la fábrica no lo toca ni depende de él |

Reglas: sin reglas de juego (daño, cooldown, costos), sin segundo motor de estado, sin escritura de `save`. La capa UI **observa** el DOM y emite eventos; no llama funciones del juego.

## 3. Contrato UF-HUD v1 (versionado)

**Consume (interfaz congelada que la fábrica asume del juego — si cambia, el adaptador degrada a «sin feedback extra», nunca rompe):**
- IDs: `#btn-basic #btn-s1 #btn-s2 #btn-s3 #btn-ult #btn-emerg #btn-pact #btn-revive`, contenedor `#controls`.
- Clases de estado puestas por `js/ui/hud.js`: `ready`, `cd`, `noen`, `active`, `locked`, `hidden`, `holding`; atributo `data-state`.
- Globales de solo lectura: `state` (=== `"playing"`), `player.basicCd`. Ambos se leen en `try/catch`.
- Eventos de entrada estándar (`pointerdown/up/cancel`, `keydown/up` con `event.code` de `js/core/input-desk.js`: Espacio/J, 1-3, R/4, Q, F).

**Provee:**
- Clases de presentación (solo CSS): `uf-press` · `uf-hold` · `uf-confirm` · `uf-reject` y atributo `data-uf-reject="cooldown|resources|locked"`.
- Elemento hijo decorativo `<i class="uf-fx" aria-hidden>` en cada botón (no es `div`, no interfiere con `hud.js`).
- Atributos ARIA: `role="button"`, `aria-label`, `aria-disabled`.
- Eventos en `window`: `uf:press {id,input,latencyMs,queueMs}`, `uf:confirm {id}`, `uf:reject {id,reason,input}`, `uf:release {id,input}`.
- `window.UIFactory = {version:1, contract:"UF-HUD-1", metrics, ids, keys}`.

**Interruptores de seguridad:** `?uf=0`, `localStorage.uf_off="1"` → no se instala nada (`html.uf-off`).

**Cambios de contrato:** se versionan como `UF-HUD-2` en este documento y requieren aprobación arquitectónica; v1 no se modifica en sitio.

## 4. Cambios en archivos compartidos (para aprobación)

`index.html` (+4 líneas, sin tocar ninguna existente):
```html
<link rel="stylesheet" href="css/ui-factory/hud-feedback.css">   <!-- tras css/item-economy.css: debe ir después de controls.css -->
<link rel="stylesheet" href="css/ui-factory/hud-layout.css">    <!-- contrato UF-LAYOUT v1 (§8) -->
<link rel="stylesheet" href="css/ui-factory/menus-touch.css">    <!-- contrato UF-MENU v1: mínimos de 44 px; usa .screen.screen para ganar a ui-kit/mobile/duo-ux -->
<script src="js/ui-factory/hud-feedback.js"></script>            <!-- antes de js/main.js -->
```
Riesgo de merge: otras ramas que añaden líneas en el mismo bloque producirán un conflicto trivial de contexto, resoluble conservando ambas.

## 5. Adaptadores para sistemas en transición
- Si S0B/otros agentes renombran clases de estado del HUD, el único punto a actualizar es `blockedKind()/isReady()` en `hud-feedback.js`.
- Si se migra a un HUD basado en canvas, `uf:*` seguirá siendo el contrato; el adaptador DOM se reemplaza sin tocar a consumidores.
- Online/guest: el adaptador no envía nada a la red; en invitado la confirmación se infiere del cambio de estado visible, no del host.

## 6. Solicitud al arquitecto general
1. Registrar el paquete **UI** en `docs/arquitectura-compartida/ownership.json` (rutas de §2) — PR de contrato aparte, no editado aquí para no tocar archivos de S0A.
2. Aprobar las 4 líneas de `index.html`.
3. Decidir si la prueba `tools/ui-factory/test-hud-feedback.js` se registra en `tools/quality/run-all.js` (dueño: paquete C).

Gate 2 (aprobación de arquitectura) **no está concedido**; ver `FINAL_APPROVAL.md`.

## 7. Contrato UF-MENU v1
Solo CSS (`css/ui-factory/menus-touch.css`): `min-height/min-width: 44px` en `button, select, summary, input de texto, [role=button|tab], a[href]` dentro de `.screen`, casillas de verificación pixel-art de 44 px y `label:has(> checkbox)`. Riesgo conocido: selectores amplios sobre `.screen`; si otra rama añade controles compactos deliberados (p. ej. HUD de Cristales no es `.screen`), pueden verse más altos. Retirar el `<link>` revierte todo.

## 8. Contrato UF-LAYOUT v1 (iteración 3–5)
Solo CSS + hojas de sprites propias (`css/ui-factory/fx/*.png`, generadas por `tools/ui-factory/make-fx.py`; no se usa `assets/**`).
- **Ataque 92 px** (antes 72) y vecinos desplazados 20–40 px; también modo zurdo. Consecuencia sobre pruebas ajenas: `tools/ux/test-accessibility-prefs.js` esperaba 72/108 px y se actualizó a 92/138 (único archivo existente fuera del paquete UI que se modifica, además de `index.html`).
- **Cooldown de la Definitiva** (`.uf-cd`): lectura de `player.ultCd`; sin escritura.
- **Pantalla limpia en `body.lanes-on`** (Guerra de Cristales y Coliseo): se ocultan `#goal-chip`, `#ult-meter`, `#mute-btn` y `.ln-horde`; minimapa rival reducido; en ≤ 900 px el chip VOLVER se apila sobre el de suministros. Decisión de diseño a confirmar por el arquitecto/GM: se pierde el cartel OBJETIVO en esos modos (el marcador y la ficha de arena lo siguen comunicando). Revertir = quitar el `<link>` de `hud-layout.css`.
- Si `css/lanes.css` o `js/arenas/lanes/lanes-hud.js` cambian clases (`ln-recall`, `ln-chip`, `ln-rival`), actualizar §8 de `hud-layout.css`.

## 9. Contrato UF-ART v1 (marcos de botones, iteración 7)
- Hojas `css/ui-factory/fx/frame-{basic,s1,s2,s3,ult,sec}.png`, generadas por `tools/ui-factory/make-hud-frames.py` (grilla de píxel única de 2 px CSS, 5 tonos + contorno de 1 px, luz arriba-izquierda, tramado ordenado). Están **fuera de `assets/**`** y de los gates de densidad por entidad.
- Elemento decorativo `<i class="uf-frame" aria-hidden>` creado por `hud-feedback.js` (primer hijo del botón); el marco queda FUERA del botón y no tapa los colores de estado de `css/hud.css`. Estados: apagado en cooldown/bloqueado, desaturado sin energía, brillante al presionar, halo cuando está listo.
- **Estado de revisión: IMPORTED_NOT_APPROVED.** Es un primer pase generado por código con las reglas de la fábrica de arte (esta no genera imágenes: `tools/factory/README.md`); no iguala la calidad ilustrada del Códice y requiere revisión de arte humana. Retirar los `.uf-frame` (o `?uf=0`) lo revierte sin tocar nada más.

## 10. Contratos UF-ART v2 y UF-HERO v1 (iteración 8–9, por héroe)
- **UF-ART v2**: atlas de marcos por héroe `css/ui-factory/fx/hero/<héroe>.png` (43 + `atlas.json`), generados por `tools/ui-factory/build-hero-frames.py` desde **maestros grises de Runway** (`art-source/runway-hud/*/master.png` con recibo `GENERATED_NOT_APPROVED`, 6 imágenes gen4_image = 30 créditos). Color de cada héroe por mapa de degradado. Generación: `tools/ui-factory/runway-hud-masters.js` (cliente propio: el de `factory/runway-architects-20261101` falla en POST con Node 22; cuando esa rama se arregle e integre, este archivo debe pasar a usarla). **Dependencia externa**: saldo de créditos compartido con la fábrica de arte.
- **UF-HERO v1** (`js/ui-factory/hero-buttons.js`, +1 `<script>` en `index.html`): lee `CLASSES[clave].color` y `player.classKey`; fija variables `--uf-*` en `#controls` (cara y borde de Ataque/Habilidades 1-3 con el color del héroe, ranuras con ±26° de tono), desplaza el tono de los íconos de habilidad con CSS (`hue-rotate`) y sustituye SOLO el `src` del `<img>` del Ataque por un ícono propio (orbe, haz, flecha, bala, tajo o golpe según `MOTIF_OF`), dibujado con `pxiIconCompose/pxiIconColors/pxiIconDataURL` (contrato de pixel-icons.js). No reemplaza `hudSetIcon` ni toca `hud.js`.
- Si un héroe nuevo no está en `MOTIF_OF`, usa orbe (a distancia) o tajo (cuerpo a cuerpo); si no tiene atlas, conserva los marcos genéricos.
- Estado de revisión de arte: IMPORTED_NOT_APPROVED.
