# fix-ui — correcciones de interfaz para PC (auditoría UX)

Rama `claude/la-horda-beta-audit-exec-mwv8x0`. Sin git add/commit. Solo toqué mis archivos.

## Estado por tarea

| # | Tarea | Estado |
|---|---|---|
| 1 | Tutorial y ayuda con teclas reales | HECHO |
| 2 | Elegir guardián: grilla ancha + botón siempre visible | HECHO |
| 3 | Menú principal a 1600+/1080p | HECHO (menú). Escalado del HUD: NO HECHO (anotado) |
| 4 | Retrato de la Sala estirado | HECHO |
| 5 | "JUGAR AHORA" → callejón | HECHO en derrota y victoria; falta el camino "abandonar desde la pausa" (archivo ajeno) |
| 6 | Tildes en fuente pixel | NO HECHO a propósito: la fuente no tiene los glifos |
| 7 | Textos de desarrollo | HECHO (falta dato real del dueño) |
| 8 | Rangos de Cicatriz legibles + pestaña | HECHO |

## Archivos tocados

- `js/systems/alpha-training.js` (1, 7)
- `js/ui/how-to-play.js` (1)
- `js/ui/menus.js` (5)
- `js/ui/prep-sections.js` (8)
- `css/menus.css` (2, 7)
- `css/hub-scroll.css` (3)
- `css/duo-ux.css` (4)
- `css/endless.css` (8)
- `index.html` (7 + `<link>` a `css/pc-desktop.css`, línea 84)
- Nueva prueba: `tools/ux/test-pc-onboarding.js`

No toqué: `js/ui/first-minute.js`, `js/ui/pixel-font-fix.js`, `js/ui/hub.js`, `css/base.css`, `js/data/legal-config.js`.

## Detalle

### 1. Textos por dispositivo
- El encargo decía que el mecanismo estaba en `js/ui/first-minute.js`; en realidad está en `js/core/input-desk.js` (`DESK.device`, `ctlHint()`, `deskActionLabel()`). Reutilicé ese, sin tabla de teclas propia: respeta el esquema MOBA y las teclas reasignadas.
- `alpha-training.js`: nuevas `alphaTrainingDevice()`, `alphaTrainingDeskText()`, `alphaTrainingTarget()`, `alphaGuideText()`. Cambian los pasos mover, ataque, habilidades, consultar ficha, recarga, definitiva, reanimar y panel táctico, más la Guía nivel 1.
- `how-to-play.js`: `howtoSteps()` reemplaza los pasos de controles (Objetivo paso 2, pestaña Controles, Botín paso 1, Talentos paso 3, Pausa paso 1).
- En táctil se devuelven los textos originales, sin cambios (verificado en la prueba).
- El texto se fija al entrar al paso: si el jugador cambia de dispositivo a mitad de un paso, se actualiza recién en el siguiente.

### 2. Elegir guardián
- `css/menus.css`, `@media (min-width:1100px) and (min-height:521px)`: grilla `auto-fill minmax(168px,1fr)`, tarjetas compactas (se oculta la descripción larga; sigue en "Habilidades y estilo"), `#start-btn` pegado abajo.
- 1280x720: 7 columnas, página de 7.129 px → 1.814 px, botón visible arriba, a mitad y al final. Sin cambios de DOM.
- Celular: 844x390 sigue en 6 columnas; 390x844 sigue en 2.

### 3. Menú principal
- `css/hub-scroll.css`: `zoom` sobre `.hub-top` y `.hub-main` por tramos (1,25 desde 1600x900; 1,5 desde 1900x1000; 2 desde 2500x1400; 3 desde 3800x2100) y EXPLORAR en una fila de 5.
- 1920x1080: 1000 px → 1500 px, sin scroll, DESAFÍOS ya no cae solo. 1600x900: 1250 px, sin scroll. 1280x720: sigue en 1000 px.
- Usa la propiedad CSS `zoom` (Chromium/Electron la soporta; Firefox desde la 126). Los tramos 2560 y 4K no los probé.
- HUD: no lo toqué. `css/hud.css` no es mío y escalar el HUD cambia tamaños de botones que varias pruebas miden en px (por ejemplo `test-accessibility-prefs.js` espera el botón Ataque en 92 px). Recomiendo una opción "Escala de interfaz" con QA visual propia.

### 4. Retrato de la Sala
- `css/duo-ux.css`: `.duo-card>canvas{width:104px;height:104px}`. Pasa de 392x528 a 104x104 (tamaño nativo del lienzo, nítido). El celular apaisado sigue en 64 px.

### 5. "Volver al menú" sin guardián propio
- `js/ui/menus.js`: nueva `noGuardianToHub()`, llamada en `#menu-btn-1` (derrota) y `#menu-btn-2` (victoria). Si `needsStarterChampion()` es verdadero va al menú principal, donde JUGAR regala el primer guardián. No toca economía. Con guardianes propios el camino no cambia.
- Falta: abandonar desde la pausa (ver pedidos).

### 6. Tildes en fuente pixel
- Verificado en captura (`after-glyphs.png`): la fuente dibuja Á É Í Ó Ú con forma de minúscula ("ELEGí", "CóDICE"). No tiene mayúsculas acentuadas reales, así que `pixel-font-fix.js` queda como está.
- Arreglo real: reemplazar `assets/fonts/press-start-2p-latin.woff2` por un subconjunto con Á É Í Ó Ú Ü y recién ahí retirar el script.

### 7. Textos de desarrollo
- `index.html`: "LA HORDA — ALFA COOPERATIVA" → "LA HORDA"; quité `<span class="ui-tag">ALPHA</span>` de Guerra de Cristales y Coliseo; "GUERRA DE CRISTALES · ALPHA" → "GUERRA DE CRISTALES".
- `alpha-training.js`, Guía nivel 9: quité la frase "Durante Alpha las apariencias habilitadas para pruebas no requieren dinero real."
- `css/menus.css`: se ocultan la marca "borrador" y la fila "Soporte: correo sin configurar". Solo CSS: los nodos siguen en el DOM porque `tools/release/legal-test.js:37` lee esos textos exactos. `legal-config.js` no se tocó.
- "Instalar en mi dispositivo" se oculta con `@media (hover:hover) and (pointer:fine)`; en táctil sigue.
- **Falta del dueño:** correo real de soporte (`supportEmail`) y aprobación legal (`draft:false`). Las páginas `legal/*.html` siguen mostrando su aviso de borrador.

### 8. Rangos de Cicatriz
- `css/endless.css`: fichas a 14 px, rótulo a 17 px, texto informativo a 18 px (antes 9,6 y 10 px).
- `js/ui/prep-sections.js`: en la Horda sin sala online, la Sala abre en la pestaña "Horda Infinita". Al volver de "Cambiar campeón" queda donde estabas. Para distinguirlo envuelve `setState` (mismo patrón que `alpha-training.js` y `endless.js`). La campaña sigue abriendo en Equipo.

## Verificación real

`node tools/ux/test-pc-onboarding.js` → 29 PASS, 0 FAIL, "TODO PASS" (única suite que corrí). Cubre: título sin textos de desarrollo; textos en teclado, mando y táctil; panel del tutorial y ayuda en pantalla; grilla y botón a 1280x720, 844x390 y 390x844; hub a 1280, 1600 y 1920; retrato 104x104; pestaña y tamaños de Cicatriz; "Volver al menú" sin y con guardianes; sin errores de página.

`node --check` OK en los 4 JS y en la prueba.

Capturas en `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/fix-ui/` (miré las marcadas con *):

| Pantalla | Antes | Después |
|---|---|---|
| Menú 1920x1080 | `before-hub-1920.png` * | `after-hub-1920.png` * |
| Menú 1280x720 | `before-hub-1280.png` * | `after-hub-1280.png` |
| Menú 1600x900 | — | `after-hub-1600.png` |
| Elegir guardián 1280 | `before-champsel-1280.png` * | `after-champsel-1280.png` * |
| Sala, Equipo | `before-prep-equipo-1280.png` | `after-prep-equipo-1280.png` * |
| Sala de la Horda | `before-prep-1280.png` | `after-prep-1280.png` * |
| Tutorial 1920 | `before-tut-1920.png` | `after-tut-1920.png` * |
| Ayuda | `before-howto-1920.png` | `after-howto-1920.png` |
| Glifos de la fuente | — | `after-glyphs.png` * |
| Celular 844x390 | `before-hub-844.png`, `before-champsel-844.png` | `after-hub-844.png`, `after-champsel-844.png` |

Rutas completas: anteponer `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/fix-ui/` a cada nombre.

## Textos nuevos EXACTOS (para traducir)

`{n}` = nombre del guardián. Las partes de teclas salen de `ctlHint()` (ya existentes en `input-desk.js`); abajo van las frases finales con el esquema clásico de teclado y con mando.

Tutorial, teclado:
1. `Practicás con {n}, tu guardián. Movete con WASD o las flechas.`
2. `Practicamos con Thalen; después volvés a tu campeón. Movete con WASD o las flechas.`
3. `Tu guardián no se puede usar en el entrenamiento: practicamos con {n} y después volvés a tu campeón. Movete con WASD o las flechas.`
4. `Mantené Espacio (o clic) para pelear: {n} golpea al enemigo cercano. Derrotá al esqueleto.`
5. `Mantené Espacio (o clic) para pelear: tu mago dispara al enemigo cercano. Derrotá al esqueleto.`
6. `Las habilidades pegan mucho más que el ataque. Apretá 1, 2 o 3 (apuntan al mouse).`
7. `¿Qué hace cada habilidad? MANTENÉ el clic sobre su botón sin arrastrar: aparece su ficha y NO se lanza. Soltá para cerrarla.`
8. `El barrido del botón y el número indican cuánto falta. Esperá a que se llene la MISMA habilidad que usaste recién (la que está resaltada) y volvé a apretar su tecla.`
9. `La definitiva (★) se carga peleando y se habilita avanzada la arena. Te la cargué: apretá R para usarla contra el grupo.`
10. `Elyra cayó. Parate a su lado y MANTENÉ E (unos 5 s). Un golpe no te corta; soltar o alejarte, sí.`
11. `Apretá Esc: el Panel táctico muestra tu kit, recargas, estados y equipo. Sola pausa; en multijugador la partida SIGUE. Cerralo con Continuar.`
12. Objetivo: `Mantené el clic sobre una habilidad para leer su ficha`
13. Objetivo: `Mantené E junto a Elyra hasta revivirla`

Tutorial, mando (mismas frases con estos cambios):
- `…Movete con el stick izquierdo.`
- `Mantené A para pelear: {n} golpea al enemigo cercano. Derrotá al esqueleto.` (y la variante `tu mago dispara`)
- `Las habilidades pegan mucho más que el ataque. Apretá X, Y o B (el stick derecho apunta).`
- `…y volvé a apretar su botón.`
- `…Te la cargué: apretá RB para usarla contra el grupo.`
- `Elyra cayó. Parate a su lado y MANTENÉ LT (unos 5 s). Un golpe no te corta; soltar o alejarte, sí.`
- `Apretá Start: el Panel táctico muestra tu kit, recargas, estados y equipo. Sola pausa; en multijugador la partida SIGUE. Cerralo con Continuar.`
- Objetivo: `Mantené LT junto a Elyra hasta revivirla`

Guía nivel 1 (teclado): `Movete con WASD o las flechas. Mantené Espacio (o clic) para pelear: tu guardián golpea al enemigo cercano. Las marcas del suelo avisan ataques: salí antes del impacto. La Arena de entrenamiento permite practicar sin perder progreso.` (mando: `Movete con el stick izquierdo. Mantené A para pelear: tu guardián…`)

Guía nivel 9 (frase quitada): `Visitá la galería para comparar skins y cromas. Revisá el origen de cada recompensa en el Códice.`

"¿Cómo se juega?", teclado:
- `Movete con WASD o las flechas. Mantené Espacio (o clic) para pelear. Habilidades: apretá 1, 2 o 3 (apuntan al mouse). La definitiva (ULT) se carga peleando: apretá R.`
- `Movete con WASD o las flechas.`
- `Mantené Espacio (o clic) para pelear. Tu guardián le pega solo al enemigo más cercano.`
- `Pegan mucho más fuerte que el ataque y tienen recarga. Apretá 1, 2 o 3 (apuntan al mouse).`
- `Se carga peleando y se habilita desde el nivel 5 de la arena. Cuando brilla, usala: apretá R.`
- `Los enemigos sueltan objetos en el piso, con un haz de luz según su rareza. Pasá por encima del botín o apretá E.`
- `Cuando ves un + sobre una habilidad, tenés un punto para hacerla más fuerte. Hacele clic.`
- `Apretá Esc. Con la partida pausada ves tu Resumen, la ayuda y las opciones. En partidas online no hay pausa.`

"¿Cómo se juega?", mando: las mismas con `Movete con el stick izquierdo`, `Mantené A para pelear`, `apretá X, Y o B (el stick derecho apunta)`, `apretá RB`, `Pasá por encima del botín o apretá LT`, `Apretá Start.`

Otros: `LA HORDA` (pie del título), `GUERRA DE CRISTALES` (título de esa pantalla y tarjeta), `COLISEO` (tarjeta).

Claves i18n que quedaron sin uso: `LA HORDA — ALFA COOPERATIVA`, `GUERRA DE CRISTALES · ALPHA`, `ALPHA`.

Ojo traducción: con esquema MOBA o teclas reasignadas `ctlHint()` da otras variantes (`Movete con clic derecho (o las flechas)`, `Apretá Q, W o E (apuntan al mouse)`, `Apretá las teclas de habilidad (apuntan al mouse)`), que generan más combinaciones de las frases de arriba.

## Cambios que pido en archivos ajenos

1. `js/core/input.js:314` (abandonar desde la pausa): después de `firstRunToHub()` agregar `if(typeof noGuardianToHub==="function" && noGuardianToHub()) return;` para cubrir el mismo callejón al abandonar la partida rápida.
2. `js/ui/ux-simplify-b.js` / `js/beta/beta-ui.js`: el título sigue diciendo "Tocá para continuar" en PC (visto en el DOM del título). Con `DESK.device` kb/pad debería decir "Menú principal".
3. `js/ui/run-intro.js:105`, `js/systems/horde-relics.js:326`, `js/assets/preload.js:58`, `index.html:341`: quedan "tocá" del hallazgo 1 fuera de mis dos archivos; no los revisé.
4. `js/net/net-debug.js:24`: sigue armando "LA HORDA — ALFA COOPERATIVA · build" (panel de depuración).
5. `js/ui/champion-select.js`: tarjetas con `role="button" tabindex="0"`, Enter/doble clic = entrar, y propios primero (parte del hallazgo 4 que no se resuelve con CSS).
6. Fuente: `assets/fonts/press-start-2p-latin.woff2` con mayúsculas acentuadas (tarea 6).
7. `js/data/legal-config.js`: correo real y `draft:false` cuando el dueño los tenga.
8. `tools/i18n` / `js/i18n`: traducir la lista de arriba.

## Lo que NO verifiqué

- Ninguna otra suite (por la regla de CPU). Las que podrían verse afectadas: `tools/alpha/training-test.js`, `tools/alpha/howto.js`, `tools/ux/test-screen-tips.js`, `tools/ux/test-scar-ranks.js`, `tools/release/legal-test.js`, `tools/alfa/q1_first_session.js`, `tools/ux/test-gamepad-menus.js`, `tools/ux/test-text-overflow.js`, `tools/ux/test-hub-legibility.js`. Busqué con grep que no dependan de los textos que cambié, pero no las corrí.
- Las capturas "after" de la Sala de la Horda son anteriores al último ajuste de tamaño (15 → 18 px); el tamaño final está verificado por valor calculado en la prueba, no en imagen. Tampoco hay captura del título posterior al arreglo del enlace "Instalar" (verificado por la prueba).
- Mando real: el paso "Consultar una habilidad" con mando conserva el texto táctil porque no encontré un gesto de mando que abra la ficha; puede no completarse con mando (ya pasaba antes).
- Inglés y portugués: los textos nuevos saldrán en español hasta que se traduzcan.
- 2560x1440 y 4K (tramos de zoom 2 y 3), Firefox, Steam Deck.
- Interacción del `zoom` del hub con la navegación por mando (`pad-nav.js`) no probada.
- `css/pc-desktop.css` del compañero ya existe (30 líneas) y no pisa mis reglas a la fecha de la revisión.
