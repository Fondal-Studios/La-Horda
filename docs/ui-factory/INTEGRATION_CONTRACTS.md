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
| `index.html` | Integrador. La fábrica pide **exactamente 2 líneas** (§4). |
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

`index.html` (+2 líneas, sin tocar ninguna existente):
```html
<link rel="stylesheet" href="css/ui-factory/hud-feedback.css">   <!-- tras css/item-economy.css: debe ir después de controls.css -->
<script src="js/ui-factory/hud-feedback.js"></script>            <!-- antes de js/main.js -->
```
Riesgo de merge: otras ramas que añaden líneas en el mismo bloque producirán un conflicto trivial de contexto, resoluble conservando ambas.

## 5. Adaptadores para sistemas en transición
- Si S0B/otros agentes renombran clases de estado del HUD, el único punto a actualizar es `blockedKind()/isReady()` en `hud-feedback.js`.
- Si se migra a un HUD basado en canvas, `uf:*` seguirá siendo el contrato; el adaptador DOM se reemplaza sin tocar a consumidores.
- Online/guest: el adaptador no envía nada a la red; en invitado la confirmación se infiere del cambio de estado visible, no del host.

## 6. Solicitud al arquitecto general
1. Registrar el paquete **UI** en `docs/arquitectura-compartida/ownership.json` (rutas de §2) — PR de contrato aparte, no editado aquí para no tocar archivos de S0A.
2. Aprobar las 2 líneas de `index.html`.
3. Decidir si la prueba `tools/ui-factory/test-hud-feedback.js` se registra en `tools/quality/run-all.js` (dueño: paquete C).

Gate 2 (aprobación de arquitectura) **no está concedido**; ver `FINAL_APPROVAL.md`.
