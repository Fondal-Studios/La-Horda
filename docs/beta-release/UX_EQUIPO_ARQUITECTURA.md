# UX equipo — Evaluador "Arquitectura de información y organización"

Meta del dueño: interfaz lo más simple e intuitiva posible SIN QUITAR OPCIONES (solo reorganizar / agrupar / renombrar / jerarquizar / mover a secundarios).
Método: Playwright (`?lazy=0`, 1280x720 y 844x390), lectura de `index.html`, `js/ui/*`, `js/ui/codex/codex.js`, `js/ui/item-economy-ui.js`, `js/ui/quests-ui.js`, `js/ui/battlepass-ui.js` y búsqueda de dependencias en `tools/`.
Capturas (52 PNG, ambos tamaños): `docs/beta-release/ux-arq-captures/` (`02-hub`, `03-opciones`, `07-codice`, `08-guardianes`, `09-tienda-*`, `10-modos`, `11-arenas`, `12-desafios`, `14-sala*`, `15-inventario`, `18-pausa`...). No se tocó código del repo.
Sesión de prueba: invitado, sin cuenta ni servidor (Pase, Forja y Subastas muestran "Iniciar sesión"; se leyeron del código).

## 1. Mapa de navegación (estado actual)

```
TÍTULO  [Tocá para continuar | ▶ JUGAR AHORA (partida rápida) | ES·EN·PT | Instalar | Privacidad·Términos·Reembolsos | Unirse a sala (si ?room=)]
 └─ HUB (mainmenu)
     ├─ Cabecera: Perfil/oro (→ Cuenta: Entrar/Crear/Invitado)  · ✦ Brasas (→ Tienda>Brasas) · [📺 Tele] · Botín · ? Cómo se juega · 🎖 Pase · ES (idioma) · ⚙ Opciones · ⏏ al título
     ├─ JUGAR (campaña, próxima arena) ──► SALA
     │     └─ + "ARENA DE ENTRENAMIENTO · 3 min" + "Guía · Nivel 1" (desplegable)
     ├─ ♾ HORDA INFINITA (bloqueada) · 🏆 RANKING
     ├─ "MODOS DE POSTGAME": 💠 Guerra de Cristales · ⚔ Coliseo (→ pantalla propia con su lobby / compuerta de entrenamiento)
     └─ "EXPLORAR":
         ├─ 📖 CÓDICE ─ Guardianes · Bestiario · Jefes · Arenas · El Libro · Crónicas · Guía · Reliquias Únicas (modal economía)
         │     └─ Guardianes ─► ficha: Ficha · Equipo · Talentos · Maestría · Apariencias (+ sección "Skins" dentro de Ficha)
         ├─ 🛡 GUARDIANES ─ (= Códice>Guardianes, otra entrada) · 🎒 Mi Inventario (Objetos · Recetas · Colección · [Forja de cuenta] · [Subastas]) · Reliquias Únicas
         ├─ 🪙 TIENDA ─ ★ Destacados · Guardianes · Objetos · Skins · ✦ Brasas
         ├─ 🌐 MULTIJUGADOR (= "Modos y multijugador") ─ Unirse con código · Crear sala · Salas abiertas · ⚡ Jugar ya · ⚔ Modo Campaña(→Arenas 01-10, Divina) · 💠 Convergencia · ⚔ Coliseo · ♾ Horda Infinita
         └─ 🏆 DESAFÍOS ─ Diarios · Logros · Pase (local) · Perfil
 SALA (prep) ─ pestañas Equipo · Arena · Sala online ─ desplegables "Equipo, talentos y progresión" (Equipamiento · Talentos · Habilidades) y "Equipo aliado" ─ Comenzar
 OPCIONES (modal único y largo) ─ Nombre · Idioma · Música · Estilo · Efectos · Controles(6) · Pantalla(8) · notas · Legal · Copiar/Restaurar código · [Arsenal·Forja·Subastas] · [Chat global]
 JUEGO ─ ❚❚ PAUSA ─ Música · Efectos · Reducir movimiento · Reducir efectos intensos · ⚙ Opciones · ? Cómo se juega · Continuar · Abandonar
 Otras: pantalla legada "Elegí tu guardián" (menu-screen, con Copiar/Restaurar código) · ficha legada champdetail-screen · Arena Divina (pantalla-puerta) · modal Economía (Inventario·Forja·Subastas·Colección·Reliquias·Temporada)
```

## 2. Hallazgos

### 2.1 Destinos duplicados (mismo lugar por varios caminos)
| Destino | Caminos hoy |
|---|---|
| Modo Campaña / elegir arena | Hub JUGAR · Multijugador>Modo Campaña · Sala>pestaña Arena |
| Horda Infinita | Hub (botón) · Multijugador>Horda Infinita |
| Guerra de Cristales / Coliseo | Hub "Modos de postgame" · Multijugador>Convergencia / Coliseo (con otro nombre: "Convergencia") |
| Crear / unirse a sala | Título (`?room=`) · Multijugador · Sala>Sala online · lobby propio de Guerra de Cristales (3.er formulario) |
| Lista de guardianes | Hub>Guardianes · Hub>Códice>Guardianes (misma vista) |
| Pase | Hub 🎖 (pase de batalla del servidor, `bpOpen`) **y** Desafíos>Pase (pase local de temporada): dos pases distintos con el mismo nombre; el tile Desafíos dice "Logros · pase" |
| Perfil / cuenta | Hub chip Perfil (`accountOpen`) · Desafíos>Perfil |
| Skins | Tienda>Skins · Guardián>Apariencias · Guardián>Ficha>"Skins" (2 veces en la misma ficha) |
| Equipo/talentos | Guardián>Equipo/Talentos/Maestría · Sala>"Equipo, talentos y progresión" (Equipamiento/Talentos/Habilidades) |
| Inventario | Guardianes>Mi Inventario · Economía>Inventario/Colección · Tienda>Objetos (compra) |
| Forja / Subastas | Mi Inventario (botones) · Opciones>"Arsenal·Forja·Subastas" |
| Reliquias Únicas | Botón en Códice y en Guardianes |
| Idioma | Título · Hub botón ES · Opciones>Idioma |
| Nombre del jugador | Opciones · Título (join) · Multijugador (join) · lobby Cristales |
| Volumen / reducir movimiento | Opciones · Pausa (con etiquetas distintas y sin "Estilo") |
| Código de guardado | Opciones · pantalla legada menu-screen |
| Cómo se juega | Hub `?` · Pausa · Códice>Guía · Hub>"Guía · Nivel 1" |
| Jugar rápido | Título "JUGAR AHORA" · Multijugador>Jugar ya · Hub JUGAR |

### 2.2 Escondido o profundo (> 3 niveles)
- Sala → editar talentos: Hub > Multijugador > Campaña > Arena > Sala > "Equipo, talentos y progresión" > Talentos (6-7 pasos).
- Forja/Subastas: Hub > Guardianes > Mi Inventario > Forja de cuenta (4) o Hub > ⚙ > Arsenal (3, y metido en "Opciones", donde nadie lo busca).
- Apariencias de un guardián: Hub > Códice > Guardianes > ficha > Apariencias (4-5).
- Configuración de daltonismo/contraste/texto grande: Opciones, 3.ª pantalla de scroll; en partida solo se llega vía Pausa > "Opciones: zurdo, texto, vibración…".
- Legal y "Chat global" viven al fondo del modal de Opciones; "Botín" (buzón de recompensas) es un icono de texto sin explicación en la cabecera.

### 2.3 Agrupaciones ilógicas
- Hub: 8-9 iconos en la cabecera mezclan cuenta, ayuda, pase, idioma, opciones, salida y utilidades ("Botín", tele). Todo al mismo peso.
- "MODOS DE POSTGAME" (jerga) separa dos modos del resto de modos; Horda Infinita está en otro grupo arriba; el Modo Campaña, en tercero (JUGAR). El jugador no tiene un solo lugar "Jugar".
- "EXPLORAR" mezcla colección (Códice, Guardianes), comercio (Tienda), social (Multijugador) y progreso (Desafíos).
- "Multijugador" es en realidad el selector de modos (también solo y con bots).
- Opciones mezcla preferencias, controles táctiles, accesibilidad, economía, chat, legal y respaldo de datos en una sola lista larga.
- Economía de cuenta (forja, subastas) colgada de Opciones e Inventario; "Reliquias Únicas" colgada del Códice y Guardianes.
- La Sala tiene tres pestañas Y dos desplegables "avanzados": dos mecanismos de ocultación en la misma pantalla; "Equipo aliado" (los 4 lugares) está plegado aunque es el centro de la Sala.
- Pausa: la nota larga explica dónde NO se puede hacer cosas; "Reducir efectos intensos" existe solo aquí.

### 2.4 Etiquetas inconsistentes (ES)
- Guerra de Cristales / **Convergencia** (mismo modo, 2 nombres en el mismo flujo); Coliseo / "Torneo".
- Guardianes (UI) / **campeones** (ids `data-shop-tab="campeones"`, textos de Brasas: "campeones de regalo", "Este campeon no se compra", cartel de la Tienda) / "héroe" (tutorial).
- Skins / **Apariencias** / Crómas (`shop-cromas.js`): 3 palabras para lo mismo.
- Habilidades (Sala) / **Maestría** (ficha) / "Equipamiento" vs "Equipo" (pestaña de ficha, de Sala y desplegable).
- Sala / lobby (`#lobby-title`) / "Sala online" / "Sala" de Cristales / "Salas abiertas".
- Menú vs Volver vs Modos como etiqueta del botón atrás (`‹ Menú`, `‹ Volver`, `‹ Modos`, `‹ LA HORDA`, `⏏`).
- Pase (2 significados), Perfil (2 significados), Inventario / Mi Inventario / Objetos.
- Modo Campaña / JUGAR / "Campaña" (kicker de la tarjeta) / "Arena de entrenamiento".
- Tuteo vs voseo mezclados ("Tocá", "Elegí" vs. "Elegir", "Reducir"): aceptable, pero "Desbloquear" (ficha) vs "Elegir para jugar" vs "¡Lo quiero!" no siguen un patrón.
- "Opciones: zurdo, texto, vibración…" (Pausa) no coincide con el contenido real de Opciones.
- "Iniciar sesión" (aviso) / "Entrar" (cuenta) / "Jugar como invitado".

## 3. Arquitectura propuesta (100 % de las funciones conservadas)

Principio: **5 verbos en el hub** y todo lo demás un nivel abajo. Los ids actuales se mantienen (solo cambia lo que se ve).

```
HUB
 ├─ Cabecera (3 grupos):  [Perfil+oro · ✦Brasas]    LA HORDA    [🎖 Pase(dentro de Desafíos) · ⚙ Menú]
 │        ⚙ pasa a ser "Ajustes y ayuda": Opciones, Idioma, Cómo se juega, Guía, Legal, Código de guardado, Salir al título, Tele, Botín (si hay).
 ├─ JUGAR (hero) ........ continúa campaña
 │     fila secundaria "Más modos": Horda Infinita · Guerra de Cristales · Coliseo · Entrenamiento · Jugar ya · Multijugador (código/crear/salas abiertas)
 ├─ GUARDIANES ......... lista + ficha (Ficha·Equipo·Talentos·Maestría·Apariencias) + Mi Inventario(+Forja+Subastas+Reliquias)
 ├─ TIENDA ............. Destacados · Guardianes · Objetos · Apariencias · Brasas
 ├─ DESAFÍOS ........... Diarios · Logros · Pase (único) · Perfil/Cuenta
 └─ CÓDICE ............. Bestiario · Jefes · Arenas · El Libro · Crónicas · Guía   (sin "Guardianes": va a su tile)
```

### Matriz función → dónde vive hoy → dónde debería vivir
| Función | Hoy | Debería |
|---|---|---|
| Continuar campaña | Hub JUGAR | Hub JUGAR (igual) |
| Elegir arena de campaña | Multijugador>Campaña; Sala>Arena | Hub JUGAR > "Cambiar arena" (Sala>Arena ya existe) y alias en "Más modos" |
| Horda Infinita + Ranking | Hub + Multijugador | Hub fila "Más modos" (único) |
| Guerra de Cristales, Coliseo | Hub "postgame" + Multijugador | Hub fila "Más modos" (único; nombre "Guerra de Cristales") |
| Entrenamiento 3 min / Guía nivel 1 | Hub bajo JUGAR | Hub bajo JUGAR (igual, pero "Aprender" en Ajustes/Códice>Guía) |
| Jugar ya | Título; Multijugador | Multijugador (renombrar "Jugar con otros") |
| Unirse con código / crear sala / salas abiertas | Multijugador; Sala>online; Cristales | Multijugador (único formulario; Cristales reutiliza) |
| Guardianes (lista, ficha, elegir) | Hub>Guardianes y Códice>Guardianes | Hub>Guardianes (único); Códice enlaza |
| Equipo/talentos/maestría de un guardián | Ficha; Sala desplegable | Ficha (fuente única); Sala mantiene atajo "Editar equipo" que abre la ficha |
| Apariencias del guardián | Ficha>Apariencias + sección Skins + Tienda>Skins | Ficha>Apariencias (equipar) y Tienda>Apariencias (comprar); quitar sección duplicada de Ficha |
| Mi Inventario / Recetas / Colección | Guardianes>Mi Inventario; Economía>Inventario/Colección | Guardianes>Inventario (único) |
| Forja / Subastas / Reliquias / Temporada (cuenta) | Inventario; Opciones; Códice | Guardianes>Inventario>pestañas "Forja · Subastas · Reliquias"; quitar de Opciones |
| Tienda (oro, Brasas, ofertas) | Hub>Tienda; ✦ | Igual; ✦ sigue como atajo |
| Desafíos diarios/semanales, logros | Hub>Desafíos | Igual |
| Pase de batalla (servidor) / pase de temporada local | Hub 🎖 y Desafíos>Pase | Desafíos>Pase (un solo lugar, el 🎖 queda como atajo con badge); aclarar nombre |
| Perfil/cuenta/login | Chip perfil; Desafíos>Perfil | Chip perfil abre Cuenta; Desafíos>Perfil muestra progreso |
| Idioma | Título; hub ES; Opciones | Título + Opciones (quitar hub ES o plegarlo en ⚙) |
| Nombre | 4 lugares | Opciones (los otros formularios lo leen/prellenan) |
| Audio / controles / accesibilidad | Opciones; Pausa (parcial) | Opciones agrupado en 4 secciones plegables; Pausa = atajos (mismas etiquetas) |
| Legal y soporte | Título; Opciones fondo | Ajustes>Legal (+ título) |
| Código de guardado | Opciones; menu-screen | Opciones>Datos y respaldo |
| Cómo se juega / Guía | Hub ?; Pausa; Códice | Ajustes>Ayuda; Pausa; Códice>Guía |
| Chat global / Botín / Tele | Opciones / cabecera | Ajustes>Social / cabecera (solo con contenido) / Ajustes>Pantalla |

## 4. Cambios concretos priorizados (máx. 12)

Referencias de dependencia: los tests NO cambian por textos casi en ningún caso; dependen de **ids** (ver "Tests" por fila). Cambiar un texto ES exige actualizar `js/i18n/en.js`, `js/i18n/pt.js` y `tools/i18n/tr/*.py` (cobertura mínima 97 % en `tools/i18n/tour.js --check`).

| # | Cambio | Dónde (archivo / selector) | Tamaño | Riesgo tests |
|---|---|---|---|---|
| 1 | **Unificar el nombre del modo**: usar "Guerra de Cristales" en el hub, Modos y pantalla propia; "Convergencia" solo como subtítulo/marca. Renombrar "MODOS DE POSTGAME" a "MÁS MODOS" y agrupar ahí Horda Infinita + Ranking + Cristales + Coliseo (una sola fila). | `index.html` (`#hub-postgame-title`, `#mode-crystal-wars-btn`, `#competitive-title`), `js/ui/hub.js` | S | Bajo-medio: `tools/ux/test-hub-legibility.js` exige que el título de `hub-crystal-btn` matchee /GUERRA DE CRISTALES/ y `hub-coliseum-btn` /COLISEO/ (se mantienen); ids intactos |
| 2 | **Un solo Pase**: renombrar el de Desafíos a "Temporada" (o fusionar con `bpOpen`); el 🎖 del hub pasa a mostrarse con etiqueta "Pase" y badge; subtítulo del tile Desafíos: "Diarios · logros · pase". | `js/ui/quests-ui.js` (`data-qtab="pase"`, línea ~117), `js/ui/battlepass-ui.js` (`#hub-pass-btn`), `index.html` tile `#mainmenu-quests-btn` | M | Bajo: `tools/alfa/q1_first_session.js` y `ui-spec.json` usan los ids de tiles, no el texto "Pase" |
| 3 | **Cabecera del hub en 2 grupos**: dejar Perfil, Brasas y un solo `⚙` visible; mover `?`, `ES`, `⏏`, Tele y Botín a un menú/sección "Ajustes y ayuda" dentro de Opciones (o desplegable del ⚙). Conservar ids. | `index.html` `.hub-top` (líneas 183-197), `js/ui/hub.js`, `js/systems/reward-mailbox.js` (inserta `#reward-mailbox-btn` antes de `#hub-howto-btn`), `js/i18n/i18n.js` (`#hub-lang-btn`) | M | Medio: `tools/alpha/howto.js` y `tools/ui-rework/spec/ui-spec.json` hacen click en `#hub-howto-btn`/`#hub-options-btn`; `tools/alfa/q7_controls.js` en `#hub-options-btn`. Si los botones siguen en el DOM (ocultos/colapsados), ajustar esas pruebas para abrir primero el menú |
| 4 | **Ordenar el hub en 5 verbos**: quitar la duplicación de Multijugador (renombrar tile `#mainmenu-jugar-btn` a "JUGAR CON OTROS"; sub: "Código · salas · Jugar ya"); la pantalla de Modos se subtitula igual y deja de repetir Campaña/Cristales/Coliseo/Infinita (o los marca "también en el hub") — y conservar `#mode-arena-btn` para no romper flujos. | `index.html` líneas 230, 382-436; `js/ui/hub.js`, `js/ui/menus.js` | M | Alto: `#mainmenu-jugar-btn` aparece en 21 archivos de `tools/` y `#mode-arena-btn` en 18 (`tools/audit/menu_taps.js`, `tools/regression/t_func.js`, `tools/net-test/*`). Solo cambiar textos y orden, NO ids ni el flujo hub>Modos>Campaña |
| 5 | **Guardianes: una sola entrada**: el tile Guardianes sigue; la tarjeta "Guardianes" del Códice pasa a "Ir a Guardianes" (mismo destino) o se oculta para no repetir; mover "Reliquias Únicas" y "Mi Inventario" a una barra común "Colección y objetos" en esa pantalla. | `js/ui/codex/codex.js` (`.cx-home-card`, `#codex-inv-btn`), `js/ui/item-economy-ui.js` línea 83 (inyecta botón Reliquias en `#codex-crumbs`) | M | Medio: `tools/items/t_codex.js`, `tools/items/t_story.js`, `tools/regression/t_func.js` cuentan `.cx-home-card` |
| 6 | **Opciones agrupado**: secciones plegables "Sonido", "Controles", "Pantalla y accesibilidad", "Cuenta y datos" (nombre, idioma, código de guardado), "Ayuda y legal"; mover "Arsenal·Forja·Subastas" y "Chat global" fuera de Opciones (ver 7) o a "Cuenta y datos". Reordenar para que lo más usado (sonido, idioma) quede arriba y el daltonismo/texto grande tengan resumen visible. | `index.html` líneas 263-300 (`#hub-options`, `.opt-sec`), `css/` (pantalla de opciones), `js/core/prefs.js` | M | Bajo: ids de prefs intactos (`tools/alfa/q7_controls.js` usa `#hub-options-btn`, `#pause-opts-btn`); revisar `tools/ui-factory/eval/eval-pause.js` |
| 7 | **Economía de cuenta en un solo hogar**: pestañas "Forja · Subastas · Reliquias · Temporada" dentro de Mi Inventario (no botones sueltos ni entrada en Opciones). Es la causa de profundidad 3-4. | `js/ui/item-economy-ui.js` (líneas 79-85: `economyOpen`, botones inyectados en `#myinv-tabs` y `#hub-options`), `js/ui/inventory-ui.js` (`#myinv-tabs`) | L | Medio: texto "Forja de cuenta" solo en i18n; `#myinv-tabs` sin tests. `economyOpen` lo usa `tools/items/*` (2 archivos) |
| 8 | **Ficha de guardián sin duplicados**: quitar la sección "Skins" de la pestaña Ficha (ya existe "Apariencias") y unificar vocabulario "Apariencias"; renombrar "Maestría" a "Habilidades" (como la Sala) o viceversa. En la Sala, el desplegable "Equipo, talentos y progresión" pasa a ser un botón "Editar equipo y talentos" que abre la ficha del guardián (sin duplicar paneles). | `js/ui/codex/codex.js` líneas ~455-490 (`tabs`, `codexChampSkinsHtml`), `js/ui/prep-sections.js`, `index.html` `#prep-tabs`/`.prep-advanced` | M-L | Medio: `tools/ui-factory/eval/eval-menus.js`, `tools/audit/ui_layout.js` tocan `champdetail`/`hub-tab`; `tools/items/t_starter_gift.js` |
| 9 | **Sala sin doble ocultación**: "Equipo aliado" (los 4 lugares) visible y sin `<details>` (es el núcleo de la Sala); `<details>` solo para lo avanzado (equipo/talentos). Renombrar `#lobby-title` "Sala" y pestaña "Sala online" → "Online". | `index.html` líneas 496-528 (`.prep-advanced`, `#prep-secs`), `js/ui/prep-sections.js` | S | Medio: `tools/net-test/*` (lobby_cromas, trade, public_rooms) leen `#lobby-slots`, `#net-bar`; mantener ids y `data-part` |
| 10 | **Pausa = atajos de Opciones**: mismas etiquetas y mismo orden que Opciones (Música/Efectos/Reducir movimiento/Reducir efectos intensos); botón "⚙ Más opciones" (sin lista que no coincide); quitar o acortar la nota larga a un icono "i". Mover "Reducir efectos intensos" también a Opciones (hoy solo está en Pausa). | `index.html` líneas 575-593 (`#pause-screen`), `js/core/prefs.js` | S | Bajo: `tools/ui-factory/eval/eval-pause.js`, `tools/alfa/q7_controls.js` usan `#pause-opts-btn` (se mantiene) |
| 11 | **Nombre del jugador en un solo sitio**: en Título/Multijugador/Cristales el campo "Tu nombre" se prellena de Opciones y el resto queda como "Cambiar nombre" (enlace). Quitar el "Cuenta" duplicado de Desafíos>Perfil (enlazar a la cuenta del hub). | `index.html` líneas 169, 417-419 (`#mode-join-name`, `#opt-name`, `#title-join-name`), `js/net/net-lobby.js` | S-M | Medio: `tools/net/quick-play.js`, `tools/net-test/lobby_code_skins.js`, `tools/net-test/public_rooms.js` rellenan esos inputs; no borrarlos, solo prellenar y colapsar |
| 12 | **Una guía de etiquetas ES + botón atrás consistente**: glosario (Guardián, Apariencia, Sala, Guerra de Cristales, Pase, Horda Infinita, Inventario); botón atrás único "‹ Volver" con destino en el `title`/aria ("Volver al Menú"), y el título "LA HORDA" visible en la cabecera de cada pantalla. Quitar "Convergencia/Crómas/campeón" de textos visibles. | `index.html` (`.ui-back`, líneas 330-540), `js/ui/shop-ui.js` (`data-shop-tab="campeones"` solo el texto), `js/ui/shop-cromas.js`, `js/i18n/*.js`, `tools/i18n/tr/*.py` | M | Medio por i18n: cada renombre toca `en.js`/`pt.js`/`tr/*.py` y la cobertura `tools/i18n/tour.js --check en|pt` (≥ 97 %). Los ids `data-shop-tab` no se cambian (`tools/collection/brasas-store.js`, `tools/regression/t_func.js`) |

Orden sugerido (valor/esfuerzo): **1, 2, 10, 9, 12** (S/M, bajo riesgo) → **3, 6, 8** → **5, 4, 7, 11**.

## 5. Mapa de riesgo para tests (qué depende de qué)
- **Ids del hub**: `mainmenu-jugar-btn` (21 archivos), `hub-crystal-btn` (9), `mainmenu-tienda-btn` (7), `mainmenu-codex-btn` (6), `hub-coliseum-btn` (5), `hub-options-btn`/`hub-howto-btn`/`hub-premium-btn`/`hub-profile-btn` (3 c/u), `mainmenu-guardianes-btn` (4), `mainmenu-quests-btn` (2), `hub-pass-btn`/`hub-lang-btn`/`hub-endless-btn` (1). Mantenerlos todos (aunque queden en menús plegados).
- **Ids de Modos**: `mode-arena-btn` (18), `modeselect` (15 archivos incl. `tools/ui-rework/crawl.js`, `tools/audit/menu_taps.js`).
- **Textos aserted**: solo `tools/ux/test-hub-legibility.js` (títulos /GUERRA DE CRISTALES/, /COLISEO/, /CÓDICE/ y tamaños ≥ 14/18 px y 44 px de alto, sin scroll en 844x390). Cualquier reorganización del hub debe seguir sin scroll en 844x390 y con botones ≥ 44 px.
- **Layout**: `tools/ui-rework/spec/ui-spec.json` y `tools/audit/ui_layout.js`/`menu_taps.js` listan pantallas e ids; revisar tras tocar #3/#4.
- **i18n**: dictionaries `js/i18n/en.js`, `pt.js`, `tools/i18n/tr/t*.py`; `tools/i18n/tour.js --check` falla bajo 97 %.
- **Pestañas**: `data-shop-tab` (2 archivos), `.cx-home-card` (3), `.hub-tab` (3), `data-prep-sec`/`prep-secs` (net-tests).

## 6. Lo que NO hay que tocar
El contenido (modos, tiendas, economía, accesibilidad, bots, Arena Divina) permanece íntegro; los ids actuales se conservan; ninguna función se elimina. Pantallas legadas (`menu-screen`, `champdetail-screen`) se pueden retirar de la navegación pero no del código hasta que `tools/items/t_starter_gift.js`, `tools/alfa/q1_first_session.js` y `tools/ui-factory/eval/*` se actualicen.
