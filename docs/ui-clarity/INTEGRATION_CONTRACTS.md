# Contratos de integración — UC-HUD v1 (esta rama)

**Propiedad:** `js/ui-clarity/**`, `css/ui-clarity/**`, `tools/ui-clarity/**`, `docs/ui-clarity/**`. No edita `js/ui/**`, `js/core/**`, `js/systems/**`, `js/champions/**`, `js/arenas/**`, `js/rendering/**`, ni `js/net/**` / `server/**` / relay.

**Consume (de la UI Factory, UF-HUD v1, sin modificarla):** evento `window "uf:reject" {id, reason: cooldown|resources|locked, input}`; ids `#btn-basic #btn-s1 #btn-s2 #btn-s3 #btn-ult #btn-emerg #btn-pact #btn-revive`; clases de `js/ui/hud.js` (`ready cd noen locked`). Lee `player`, `runLevel`, `ULT_MIN_ARENA_LEVEL` en solo lectura con `try/catch`; si el contrato cambia, el módulo degrada a no mostrar nada.

**Provee:** `window.UIClarity {version:1, contract:"UC-HUD-1"}`; evento `uc:reason {id, text, kind}` (uno por cambio de causa; útil para telemetría sin datos sensibles); clases `uc-reason`, `uc-badge`, `uc-noen`; `html.uc-off`.

**Interruptores:** `?uc=0`, `localStorage.uc_off="1"`. Respeta `body.reduce-motion`.

**Cambios en archivos compartidos (para aprobación del integrador):** `index.html` +2 líneas, ninguna existente modificada:
```html
<link rel="stylesheet" href="css/ui-clarity/hud-clarity.css">   <!-- después de css/ui-factory/menus-touch.css -->
<script src="js/ui-clarity/hud-reasons.js"></script>             <!-- después de js/ui-factory/hud-feedback.js, antes de js/main.js -->
```
`css/ui-clarity/hud-clarity.css` contiene además dos correcciones de **layout** que sobreescriben (por especificidad) a archivos ajenos: objetivo×aliados (`css/hud-mobile.css`) y el banner de rareza de `css/beta-visual.css` en pantallas ≤ 700 px. Si esos archivos cambian de clases, actualizar §UC-LAYOUT de `hud-clarity.css`.

**Madre Espora y otras ramas:** sin solapamiento de archivos con S0C/S0E, Build Evolution, Premium Skin Factory ni Art Factory (verificable con `git merge-tree`).
