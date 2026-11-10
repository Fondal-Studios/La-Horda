# PRODUCTO — fase de corrección (cliente)

Rama `claude/la-horda-beta-audit-exec-mwv8x0`. Sin commits. No se tocaron precios, ids de packs, contenido de packs ni `server/`.

## Etiquetas que hay que agregar a index.html (integrador)

```html
<link rel="stylesheet" href="css/next-unlock.css">            <!-- junto a css/battlepass.css (línea ~45) -->
<script src="js/ui/next-unlock.js"></script>                  <!-- después de js/systems/scar-ranks.js (línea ~1084) -->
```

Sin estas dos etiquetas el panel «Lo próximo que desbloqueás» y los botones del momento de orgullo NO aparecen en el juego (el resto de los arreglos sí funciona). La prueba inyecta el módulo si index.html todavía no lo carga.

## Estado por tarea

| Tarea | Estado | Dónde |
|---|---|---|
| 1a "undefined" en cromas y nota de desarrollo | HECHO | `js/ui/shop-ui.js`: `_shopCromaLabel` (nueva), `renderShopShowcase`, `renderShopSkins` |
| 1b textos falsos | HECHO | `js/ui/shop-ui.js` (`.shop-fair`), `js/data/cosmetics-catalog.js` (`COSMETIC_HOWTO.set`) |
| 1c marco `cicatriz` duplicado | HECHO (con traducción en el motor; falta 1 línea ajena opcional) | `js/data/quests.js` (`QUEST_FRAMES.cicatriz_v`), `js/systems/scar-ranks.js` (`scarFrameId`, `scarFrameSync`, `scarSave`, `scarOnRunEnd`) |
| 1d no ofrecer «Activar premium» sin arte | PARCIAL (bloqueado por una prueba existente) | `js/ui/battlepass-ui.js`: `_bpPremiumPending`, `BP_PREMIUM_HOLD`, `_bpRender`, `bpBuyPremium` |
| 1e insignia OFERTA siempre encendida | NO HECHO (archivo ajeno; cambio anotado abajo) | `js/ui/hub.js` |
| 2 callejones del minuto 0 | HECHO (Tienda › Brasas y Pase); el chip «✦ —» es ajeno | `js/ui/shop-ui.js` (`_shopFreeExitsHTML`, `_shopFreeExitsBind`, `renderShopBrasas`), `js/ui/battlepass-ui.js` (`_bpExitsHTML`, `_bpEl`, `_bpRender`) |
| 3 módulo «Lo próximo que desbloqueás» | HECHO (falta que el integrador agregue las etiquetas) | NUEVOS `js/ui/next-unlock.js`, `css/next-unlock.css`; `js/ui/quests-ui.js` (`_qClearRunSummary`) |
| 4 botones «Equipar título» / «Ver apariencias» | HECHO en la Horda; en Campaña no se agregó nada | `js/ui/next-unlock.js` (`nextUnlockPrideHTML`) |

### Detalle

**1a.** La causa: cromas cuyo `crystal` no existe en `CROMA_CRYSTALS` (sin cristal → "undefined"; las de expedición → el id interno "expedition"). Ahora el renglón muestra el cristal solo si existe; si no, queda «◆ Nombre del guardián». La nota «Sets sin skin todavía (arte pendiente, ver docs/…): lista» se reemplazó por una frase fija y solo si hay sets sin apariencia.

**1b.** Verificado en código: `js/systems/shop.js:168` rechaza comprar piezas de set con oro (`SHOP_NO_GOLD_PIECES`) y el reforjado existe (`reforgeSetDuplicates`, `js/systems/loot.js:284`). El texto del catálogo era falso y se corrigió.

**1c.** No se pudo renombrar ningún id "a secas": `tools/balance/test-scar-ranks.js:35` exige que el dato del Rango V diga `frame === 'cicatriz'` y `tools/net-test/leaderboard.js:160-164` exige `cicatriz` para el top 10. Solución sin tocar pruebas ni archivos ajenos: `QUEST_FRAMES` ahora tiene `cicatriz_v` («Cicatriz V», los colores del primer duplicado) y `cicatriz` («La Cicatriz», animado, ranking). El motor traduce con `scarFrameId("cicatriz") → "cicatriz_v"` al entregar el premio, y funciona igual si el dato pasa a decir `cicatriz_v`. Quien ya había completado el Rango V recibe `cicatriz_v` la próxima vez que se normaliza `scarSave()` (conserva el `cicatriz` que tenía: no se puede saber si lo ganó por ranking).

**1d.** `tools/ux/test-battlepass-ui.js:55` hace clic en `.bp-buy` y compra el premium, y `:61` exige el texto «arte pendiente». Por la regla de no romper ni relajar pruebas, el botón sigue visible. Lo que quedó hecho:
- aviso neutro junto al botón cuando la ruta premium trae cosméticos `bp:*` y la misma aclaración dentro de la confirmación de compra;
- el comportamiento pedido ya está escrito detrás de `const BP_PREMIUM_HOLD = false` (`js/ui/battlepass-ui.js`): al pasarlo a `true` el botón se reemplaza por «El pase premium llega más adelante.», las celdas dicen «Más adelante» y `bpBuyPremium()` no hace nada. Requiere adaptar las líneas 53-58 de esa prueba (decisión del dueño de la prueba). Riesgo real hoy: bajo, porque con pagos apagados nadie puede tener Brasas.

**2.** Brasas sin cuenta: se sacó la fila de cinco candados sin nombre; ahora dice qué se compra (solo cosméticos) y ofrece «Probar apariencias» (`openGuardians('skins')`) y «Ver desafíos» (`questsOpen()`). Lo mismo con cuenta y pagos apagados («Muy pronto»). Pase sin cuenta o sin servidor: se sacaron los seis candados; mantiene «Iniciá sesión…» y ofrece «Ver el pase gratis» (`questsOpen('pase')`), «Probar apariencias» e «Iniciar sesión». No se tocó ningún flujo de pago.

**3.** `nextUnlockGoals()` calcula hasta 5 metas y muestra las 3 más cercanas: pase gratis (XP del nivel y premio del siguiente), racha (días al próximo hito), título por nivel de cuenta (XP acumulada), Rango de Cicatriz (mejor ronda en el rango abierto contra la ronda de cierre; en el V, su marco) y guardián más barato contra el oro actual. Cada meta: etiqueta, premio, «X / Y unidad» y barra. Sin metas devuelve `""` y no dibuja nada. Solo lectura (la prueba compara el guardado antes y después y cuenta llamadas a `persist`). Se monta envolviendo `endlessShowResults` (arriba de los botones) y `questsShowRunSummary` (victoria y derrota de Campaña, al pie, debajo de los botones). API para el menú: `window.nextUnlockHTML()`, `window.nextUnlockGoals()`, `window.nextUnlockMount(host, before)`.

**4.** En resultados de la Horda, si hubo récord, rango completado o título/marco ganado: botones secundarios debajo de «UNA MÁS» y «Volver»: «Equipar título» (o «Equipar marco») abre Desafíos › Perfil y «Volver» regresa a los resultados; «Ver apariencias» (solo fuera de sala online) cierra el modo y abre el probador. Sin compra directa ni urgencia. En Campaña ya existe el enlace «Ver apariencias de X» (`endSkinsLinkHTML`, ajeno) y no se duplicó.

## Verificación real

`node --check` en los 8 archivos: sin errores.

`node tools/ux/test-next-unlock.js` (Chromium, 1280x720 y 667x375) — 32 de 32:

```
index.html todavía no carga js/ui/next-unlock.js: la prueba lo inyecta
PASS [1] con todo por delante hay 5 metas posibles
PASS [1] pase: XP del nivel y premio del nivel siguiente
PASS [1] racha: 2 / 3 días y el premio del hito
PASS [1] cuenta: XP hasta el nivel 5 y su título
PASS [1] Cicatriz: rondas hasta abrir el rango I
PASS [1] guardián: tu oro contra el más barato
PASS [1] se muestran 3, primero lo más cercano
PASS [1] cada meta tiene premio, «X / Y» y barra
PASS [1] sin "undefined" ni "NaN" en el panel
PASS [2] no cambia el guardado ni llama a persist()
PASS [3] sin metas: HTML vacío y el panel viejo se quita
PASS [3] si una fuente falla, las otras metas siguen
PASS [3] con todo conseguido no queda ninguna meta
PASS [4] Horda: un panel, arriba de los botones
PASS [4] Horda: se ve y es compacto
PASS [4] la meta de Cicatriz usa el récord recién hecho (6 / 10 rondas)
PASS [4] volver a dibujar los resultados no duplica el panel
PASS [5] con rango completado: «Equipar título» y «Ver apariencias», debajo de los botones
PASS [5] «Equipar título» abre el Perfil y «Volver» regresa a los resultados
PASS [5] «Ver apariencias» cierra el modo y abre el probador
PASS [5] sin récord ni rango completado no hay botones extra
PASS [4] Campaña, derrota: panel debajo de los botones
PASS [4] Campaña, victoria: panel debajo de «Continuar»
PASS [4] al salir del fin de partida el panel se va
PASS [6] completar el Rango V da el marco `cicatriz_v` (no el del ranking)
PASS [6] son dos marcos distintos y el nombre no choca con un título
PASS [6] funciona con el dato viejo y con el nuevo; quien ya lo tenía cerrado lo recibe
PASS [7] Tienda: sin "undefined" en Destacados, Skins ni Brasas
PASS [7] «Todo el poder se consigue jugando»
PASS [7] Skins: sin nota de desarrollo
PASS [7] cómo conseguir un set: ya no dice que las piezas se compran con oro
PASS [7] Brasas sin cuenta: salidas útiles y sin candados mudos
PASS [7] las salidas abren Desafíos y el probador
PASS [8] pase sin cuenta: pide iniciar sesión y ofrece el pase gratis y el probador
PASS [8] «Ver el pase gratis» abre el Pase de temporada
PASS [8] premium con cosméticos sin arte: lo avisa; con arte, no
PASS [9] 667x375: el panel entra a lo ancho, sin desborde
PASS sin errores de página
TODO OK
```

- `node tools/balance/test-scar-ranks.js` → `OK todas`.
- `node tools/items/t_quests_streak.js` → `Todo en verde`.

Capturas miradas (carpeta `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/fix-producto-shots/`):
- `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/fix-producto-shots/horda-orgullo-1280.png` — resultados de la Horda con el panel (3 metas con barra) y los dos botones debajo de «Volver al menú».
- `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/fix-producto-shots/campana-derrota-1280.png` — derrota de Campaña con el panel debajo de los botones.
- `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/fix-producto-shots/tienda-brasas-sin-cuenta-1280.png` — Brasas sin cuenta con las dos salidas.
- `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/fix-producto-shots/pase-sin-cuenta-1280.png` — pase sin cuenta con tres salidas.

Esas capturas son anteriores a un último ajuste de CSS: el título del panel pasó de la fuente pixel a la de texto porque la pixel no dibuja mayúsculas con tilde (se veía «PRóXIMO» y «DESBLOQUEAS»). Ese ajuste no se volvió a capturar.

## Textos nuevos EXACTOS (para traducir)

Tienda (`js/ui/shop-ui.js`):
- `⚖ Todo el poder se consigue jugando, con el oro que ganás en las arenas.` (reemplaza «⚖ Casi todo el poder…»; el nodo completo sigue con la regla de Brasas y «Míticos y Únicos no se venden: se fabrican o se ganan peleando.»)
- `Más apariencias de set llegan más adelante. Con el set completo se ve su aura plena.`
- `Cromas, skins y efectos visuales. Solo apariencia.`
- `Mientras tanto, esto ya es tuyo sin pagar:`
- `Probar apariencias`
- `Ver desafíos`

Catálogo (`js/data/cosmetics-catalog.js`):
- `Reuní las piezas del set jugando: caen como botín o se reforjan con piezas repetidas.`

Pase (`js/ui/battlepass-ui.js`):
- `Sin cuenta también tenés un pase: el Pase de temporada es gratis y se juega desde Desafíos.`
- `Ver el pase gratis`
- `Probar apariencias`
- `Los cosméticos premium todavía no tienen el arte final. El pase gratis no cambia.`
- ` Sus cosméticos todavía no tienen el arte final.` (se agrega al final de la confirmación «¿Activar la ruta premium por ✦ N Brasas? …»)
- Solo con `BP_PREMIUM_HOLD = true`: `El pase premium llega más adelante.` y `Más adelante`

Marco (`js/data/quests.js`): `Cicatriz V` (nombre del marco; en resultados se lee `Marco Cicatriz V`).

Panel (`js/ui/next-unlock.js`), un nodo de texto por pieza:
- `Lo próximo que desbloqueás`
- Etiquetas: `Pase gratis · nivel {n}`, `Racha diaria`, `Cuenta · nivel {n}`, `Horda Infinita · Cicatriz I` (… con el nombre del rango), `Guardián nuevo`
- Premios armados: `Título «{nombre}»`, `Marco {nombre}`, `Un guardián a elección` (el resto sale de `questsRewardText`, ya existente)
- Progreso: `{n} / {n} XP`, `{n} / {n} días`, `{n} / {n} rondas`, `{n} / {n} de oro`
- Botones: `Equipar título`, `Equipar marco`, `Ver apariencias`

Textos que dejaron de usarse (sus traducciones quedan huérfanas): «Sets sin skin todavía (arte pendiente, …)», «Recompensas del pase», «…se compran con oro en la Tienda o se reforjan.», «⚖ Casi todo el poder…». Ninguno lo lee una prueba de `tools/`, `tests/` o `server/` (solo las tablas de i18n).

## Cambios que pido a archivos ajenos

1. **index.html** — las dos etiquetas de arriba.
2. **js/ui/hub.js:67-68 (insignia OFERTA, tarea 1e)** — hoy: `bo.classList.toggle("hidden", !deals);`. Cambiar a:
   `bo.classList.toggle("hidden", !deals || (typeof shopDayKey==="function" && save.shopDealsSeen === shopDayKey()));`
   (la misma condición que ya usa la insignia NUEVO una línea más arriba: se apaga cuando ya viste las ofertas del día).
3. **js/data/scar-ranks.js:16 (opcional, limpieza)** — `frame:"cicatriz"` → `frame:"cicatriz_v"`, junto con `tools/balance/test-scar-ranks.js:35` (`o.frame === 'cicatriz'` → `'cicatriz_v'`). No es necesario para que funcione.
4. **js/ui/battlepass-ui.js `BP_PREMIUM_HOLD`** (mío, pero depende de una prueba ajena) — pasar a `true` cuando se adapte `tools/ux/test-battlepass-ui.js:53-58`.
5. **js/ui/shop-cromas.js:14 y js/ui/codex/codex.js:525, 676, 779** — el mismo origen del "undefined": `CROMA_CRYSTALS[d.crystal] || {label:d.crystal}`. Mi prueba no encontró "undefined" en Tienda › Skins, pero el id interno puede asomar ahí y en el Códice; conviene `{label:""}` y no imprimir el separador si queda vacío.
6. **js/ui/codex/codex.js:624** — «Tienda: las piezas se compran con oro» contradice a la Tienda (hallazgo 20 de UX); no es mío.
7. **js/systems/scar-ranks.js** (mío, no cambiado) — los textos «para el marco Cicatriz» se dejaron igual porque ya están traducidos; el marco ahora se llama «Cicatriz V».
8. **Menú** — `window.nextUnlockHTML()` está listo para que `renderHub` lo use.

## Lo que NO verifiqué

- `tools/ux/test-battlepass-ui.js`, `tools/collection/brasas-store.js`, `tools/ui-clarity/test-brasas-flow.js`, `tools/net-test/leaderboard.js` y `tools/ux/test-scar-ranks.js` (con navegador): no se corrieron por la regla de CPU. Revisé a mano sus selectores y textos y los conservé (`.bp-buy`, «Iniciá sesión», «arte pendiente», «Iniciá sesión para comprar Brasas.», `[data-brasas-soon-note]`, «Muy pronto», marco `cicatriz` del ranking). Riesgo a mirar: en `test-battlepass-ui.js` el panel con sesión a 844x390 tiene un renglón más de aviso (a 568x320 `.bp-hint` ya está oculto por CSS).
- El pase con sesión contra un servidor real: solo se probó con datos simulados en el cliente.
- Victoria real de Campaña jugada de punta a punta: se probó dibujando el resumen en las pantallas de victoria y derrota, no ganando una arena. En victoria el panel queda al pie durante todos los pasos (resumen, cofre, etc.).
- EN/PT: ningún texto nuevo está traducido.
- Sala online: los botones del momento de orgullo y el panel no se probaron con invitado/anfitrión («Ver apariencias» se oculta en sala).
- El último ajuste de fuente del título del panel no tiene captura.
