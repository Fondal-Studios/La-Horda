# Ilkan, el Caminante de Dunas — rework a campeón original

**Estado:** implementado en la rama `claude/eren-original`. Revisión humana de arte **pendiente** (ver "Pendientes").

## Por qué

El campeón anterior (clave interna legada `eren`) era un personaje derivado de una obra de terceros: nombre,
identidad, silueta, paleta, arte, textos, habilidades nombradas y efectos remitían a esa obra. No se podía vender
(`docs/commercial/LAUNCH.md`, `docs/commercial/APP_STORE.md`). Cambiar solo el nombre no resolvía el arte ni la
identidad derivados, así que se rehízo **todo lo que el jugador ve y oye** y se conservó **exactamente** lo que
define el balance: las mecánicas.

## Concepto nuevo

| | |
|---|---|
| Nombre / título | **Ilkan**, el Caminante de Dunas (título de presentación: "El Errante del Simún") |
| Clave interna | `ilkan` (antes `eren`; migración de guardados abajo) |
| Origen | Las Dunas Quebradas |
| Fantasía | Caravanero del desierto que convierte el riesgo en **Tormenta** y, cuando no alcanza, llama al **Coloso de Arena** que duerme bajo las dunas |
| Lore | "Ilkan nació en las Dunas Quebradas, donde el viento borra los caminos y una caravana solo sobrevive si nunca deja de andar. Aprendió a leer el simún en la piel: cada golpe que recibe lo vuelve tormenta, y la tormenta lo hace correr más rápido. Cuando no alcanza, llama a algo que duerme bajo la arena: el Coloso." |
| Silueta humana | capucha de orejas largas de zorro del desierto (dos orejas con forro dorado), cola de pañuelo larga con franja dorada, rostro cubierto con tela ocre y rayas de pintura blanca, hombrera de tres placas de arenisca en un solo hombro, brazo derecho vendado, túnica ocre con faja diagonal, lanza-pendón enrollada a la espalda, dos hoces de filo claro |
| Silueta del Coloso | gigante de losas de arenisca apiladas, hombros de roca con púas, puños de bloque con vetas doradas, cabeza pequeña con tres cuernos curvos y ojos-ranura luminosos, núcleo de luz verde azulada en el pecho entre placas agrietadas, arena que cae de las juntas. Ancho y cuadrado; sin musculatura ni piel |
| Paleta | ocre, verde azulado, arenisca, dorado (humano) · umbra, ámbar y verde azulado luminoso (Coloso) |
| Skin de set | **Caravana de Medianoche**: capa índigo con vivo plateado, faroles de cristal, hombrera plateada; Coloso de cristal azul con núcleo violeta (reinterpretación real, no recolor) |

## Qué se cambió (y qué no)

Mecánica **idéntica** (daños, cooldowns, costos, duraciones, radios, áreas, estados, transformación, pasiva, IA,
definitivas, talentos, maestrías, refuerzos, bonus de set, límites de efectos): ver "Equivalencia de comportamiento".

| Aspecto | Ahora |
|---|---|
| Básico | **Hoces Gemelas** (combo de tres cortes en arco; el tercero carga más Tormenta) |
| Recurso (barra de la definitiva) | **Tormenta** |
| Pasiva | **Sed de Horizonte** (<25% de vida: velocidad, daño y más Tormenta) |
| Habilidad 1 | **Lanza-Pendón**: arroja la lanza y vuela tras su pendón; segunda lanza en el aire; corta a los que pasan. VFX: pendón de dos telas que ondula + punta de lanza (ya no es un cable ni un gancho con humo) |
| Habilidad 2 | **Piel de Duna**: menos daño recibido y mucha más Tormenta por golpe |
| Habilidad 3 | **Grito de Caravana**: velocidad, daño y Tormenta; aliados cercanos reciben una parte |
| Definitiva I | **Coloso de Arena**: se invoca clavando las hoces en la arena (columna de arena y luz que da forma al Coloso) |
| Kit del Coloso | **Alud** (golpe al suelo) · **Hundimiento** (canalizada de 4 pulsos) · **Marcha de Dunas** (avance pisando) |
| Definitiva II (secreta) | **Los Tres Pasos** (tres pasos colosales con aviso; luego Ilkan queda agotado). Avisos ámbar con sombra de tierra; siluetas de colosos cornudos en pantalla |
| Talentos / maestrías | ramas **Pendón / Duna / Coloso**; maestrías Lanceros del Simún, Temple del Desierto, Coloso de Dunas; nodos renombrados |
| Refuerzos de habilidad | Hoces Giratorias, Arena Ardiente, Silbido Ensordecedor, Pacto de Caravana, Simún Rugiente |
| Set de 4 piezas | **Caravana de Medianoche** (Hoces de la Caravana, Arnés de Faroles, Empuñaduras de Cristal, Botas de Arena); transformación de 2 piezas "Estela de Arena" |
| Objeto del campeón | arma base "Hoces Gemelas" |
| Códice, lore, selección, diálogos del campamento, frases de victoria/derrota, guía, Crystal Wars | textos nuevos (`champion-identity`, `champion-presentation`, `codex-content`, `story-text`, `camp-text`, `champion-guide`, roster de Crystal Wars) |
| HUD | TORMENTA, SED DE HORIZONTE, "LOS TRES PASOS LISTOS", colores verde azulado/dorado (antes rojos/rosados) |
| VFX | partículas de arena y destellos verde azulado/dorado; pendón; pilar de arena y luz; remolinos de arena; grietas luminosas; pisadas de bloque; siluetas de colosos |
| Arte | **100 % nuevo y procedural** (ver "Arte"); se borraron las hojas, atlas, FX, previews y capturas anteriores |
| Audio | sin cambios (sonidos sintetizados genéricos de `js/audio/audio.js`) |

Identificadores internos renombrados (no visibles): `eren`→`ilkan`, `EREN_CFG`→`ILKAN_CFG`, `EREN_TITAN_CLS`→`ILKAN_COLOSSUS_CLS`,
`erenX`→`ilkanX`, `titan`→`colossus`, `retumbar`→`march`, `rumbling`→`finale`, `bite`→`invoke`, `kind` de habilidades
(`ilkan_lance`, `ilkan_temple`, `ilkan_caravan`, `ilkan_colossus_ult`, `colossus_slam`, `colossus_sinkhole`,
`colossus_march`, `ilkan_finale_ult`), claves del atlas (`ilkan`, `ilkan_colossus`), archivos
(`js/champions/ilkan.js`, `assets/sprites/champions/ilkan/`). El id del **set** (`legion`) y los nombres de *animación*
genéricos (`hook`, `instinct`, `advance`, `sismo`, `terremoto`) se conservaron: no identifican a la obra original y
evitan migrar datos que no hace falta tocar.

## Compatibilidad de guardados (nadie pierde nada)

`js/storage/legacy-champion-ids.js` (compartido por navegador y servidor, idempotente) migra todo lo que estaba bajo la
clave vieja a la nueva:

- `save.champions.eren` → `save.champions.ilkan` con nivel, XP, puntos de talento, maestrías de habilidad y definitiva,
  equipo, croma y estado de talentos. Si ya existe una fila nueva "recién creada", gana la de más progreso.
- Talentos: ids de nodos (`er_man_*`→`il_pen_*`, `er_ins_*`→`il_dun_*`, `er_tit_*`→`il_col_*`, maestrías `er_m_*`→`il_m_*`),
  ramas y maestría elegida (`maniobras`→`pendon`, `instinto`→`duna`, `titan`→`coloso`), conservando rangos.
- Inventario/alijo: `item.champion`, y los objetos del set (`legion_*`) refrescan nombre y descripción con el texto nuevo
  (conservan uid, nivel, tirada y valor).
- Selección: `save.lastChamp` (el guardián elegido la última vez) y cualquier otro campo con un id de campeón (`champion`, `champ`, `classKey`, `guardian`, `fav`...).
- Estadísticas y desafíos (`byChamp`, `champ`).
- Se aplica en `loadSave()` (localStorage, nube, código de guardado) y se reescribe el guardado ya migrado.
- **Servidor:** `server/accounts.js` migra al leer cada guardado del almacenamiento (archivos y Postgres) y en
  `sanitizeSave` (cada guardado que acepta o entrega); `ledgerChampions` lee concesiones del libro con el id viejo; el
  ranking semanal acepta/filtra/devuelve el id viejo como el nuevo (y Postgres consolida las filas viejas al iniciar
  conservando el mejor puntaje); la billetera lee elecciones del Pack de bienvenida con el id viejo.
  `docs/production/shop-catalog.json` lista `ilkan` en vez de `eren`. Los precios de campeón que el Game Master hubiera fijado para el id viejo no se migran (vuelve el precio por defecto).
- El id del set `legion` y los ids de skins de set/cromas no cambian, así que las apariencias compradas/equipadas siguen válidas.

Pruebas: `tools/regression/t_ilkan_migration.js` (navegador, guardado viejo real → migrado, jugable, idempotente) y
`server/test-legacy-champion-ids.js` (módulo, `sanitizeSave`, API de guardado y ranking, libro de concesiones).

## Equivalencia de comportamiento (antes ↔ ahora)

`tools/regression/t_ilkan_parity.js` compara el árbol anterior con el actual:

1. **Datos**: clase y kit humano/coloso, `ILKAN_CFG`, talentos y maestrías (efectos evaluados por rango), refuerzos, set,
   transformación de set, perfiles de apuntado y entrada de balance. Se descartan nombres/textos/colores y se mapean las claves
   renombradas.
2. **Comportamiento**: 4 partidas deterministas (semilla fija y reloj virtual): rotación completa del kit hasta Los Tres Pasos y
   agotamiento, vida baja, jefe, e IA del bot; traza del héroe y de 12 enemigos cada 15 cuadros (posición, vida, energía,
   cooldowns, Tormenta, fases y temporizadores internos, efectos de mundo).
3. El guardado que alimenta ambos árboles es el **mismo guardado con clave vieja** (el actual lo migra al cargar).

La "foto" del árbol anterior queda en `docs/balance/ilkan-parity-baseline.json` (se tomó de `origin/main` antes del rework:
`node tools/regression/t_ilkan_parity.js --record <sitio-anterior> --key eren`). Para repetir la comparación:
`node tools/regression/t_ilkan_parity.js <sitio-actual>` (los sitios se arman con `tools/regression/build_site.py`).

## Arte (procedural, sin recursos de terceros)

`python3 tools/art/ilkan/build.py` genera todo desde código (Python + PIL/numpy): máscaras a 4x, tres tonos planos,
contorno oscuro de 1 px, alfa 0/255.

| Archivo | Contenido |
|---|---|
| `tools/art/ilkan/rig.py` | primitivas (máscaras, sombreado, contorno) |
| `tools/art/ilkan/human.py` | figura humana: frente / perfil / espalda, paletas base y de la skin |
| `tools/art/ilkan/colossus.py` | Coloso de Arena: frente / perfil / espalda, paletas de roca y de cristal |
| `tools/art/ilkan/frames.py`, `frames_colossus.py` | poses de cada cuadro del atlas (misma grilla e índices que el atlas anterior) |
| `tools/art/ilkan/fx.py`, `fx_skin.py` | efectos sueltos y efectos de la skin |
| `tools/art/ilkan/build.py` | escribe `assets/sprites/champions/ilkan/{v2,skins/legion}/` y `assets/vfx/skins/legion/` |

La grilla (celda 128×111 humano / 148×136 Coloso, 8 columnas, ancla de pies) es la misma, por eso el motor, la Crystal
Wars y los sets de animación (`idle_*`, `walk_*`, `run`, `attack_side`, `lance_*`, `instinct`, `advance`, `invoke`, `exhausted`,
`hit_down`, `death_down`; `idle_down`, `walk_*`, `atk`, `sismo`, `terremoto`, `march`, `roar`, `tf`) no cambian. Se borraron las hojas
fuente, atlas, FX, previews y capturas del campeón anterior (`art-source/redraw/<anterior>.png`, la hoja de su skin, `docs/vfx/hud-*`,
`docs/playtest/evolucion/*`); el historial de git las conserva.

Qué mide cada gate de arte sobre este arte, con honestidad: el gate de estilo (`tools/art/painter/style_gate.py`) solo evalúa
atlas de 448×1008 (formato del Pintor): este atlas está **fuera de formato** y no recibe PASS ni FAIL. La escala y los pies
(`tools/art/roster_gate.js`) se ajustan con `js/data/champion-art-normalize.js`. Ninguna medición automática sustituye una revisión
de dirección artística.

## Resultados de las verificaciones (corridas reales de esta rama)

Entorno: Chromium headless 844x390, `python3 -m http.server`, semillas fijas. Los fallos que ya existían en `origin/main` se
compararon contra una copia exacta de `main` servida aparte; no se tocaron.

| Verificación | Resultado |
|---|---|
| `check-entry-reference.js` | PASS |
| `entry-gate.js` sobre la rama (Ilkan registrado como conocido) | PASS, 75 simulaciones, 25 candidatos previos (igual que `main`) |
| `entry-gate.js` con Ilkan fuera de `knownChampions` (copia de trabajo: se simula como candidato nuevo, 3 partidas de 150 s) | PASS, 78 simulaciones, 26 candidatos |
| `ability-gate.js --strict` | 43 campeones, nuevos que no pasan: 0, errores de página: 0 |
| Paridad mecánica antes/ahora (`t_ilkan_parity.js`) | datos idénticos; trazas idénticas (440 muestras, 4 partidas); 0 errores |
| Migración de guardados en navegador (`t_ilkan_migration.js`) | PASS |
| Migración en servidor (`server/test-legacy-champion-ids.js`) | 26 comprobaciones OK |
| `t_champs_se.js` (42 chequeos del kit) | 37/42; `main` daba 36/42. Los 5 fallos (SM4.bayoneta, E15, E16, E17, E19) son los mismos de `main` |
| `tools/quality`: talent-gate, ability-resources, classic-passives | PASS |
| `tools/items`: t_boons, t_sets, t_starter_gift | PASS |
| `tools/items`: t_codex, t_synergies, t_items, t_evolution | mismos fallos que `main` (t_codex 2, t_synergies 9, t_items 2, t_evolution 1); ninguno es de Ilkan |
| `t_drag_aim.js`, `t_run_end.js` | PASS |
| `tools/ux`: test-text-overflow, test-touch-targets | PASS |
| Guerra de Cristales `balance-gate.js` | PASS |

No se ejecutó: `npm test` del servidor completo (falta el módulo `ws` en este entorno; solo se corrió el test de migración),
`tools/net-test/champs_se.js` (cooperativo con dos clientes, mismo motivo), ni Postgres real.

## Cómo probarlo

```bash
python3 -m http.server 8981 &                                              # repo servido tal cual
node tools/regression/t_ilkan_migration.js http://127.0.0.1:8981           # migración de guardados (navegador)
node server/test-legacy-champion-ids.js                                    # migración en el servidor
node tools/regression/t_champs_se.js /tmp/se_out                           # 42 chequeos del campeón (SE_BASE_URL=...)
node tools/balance/check-entry-reference.js && node tools/balance/entry-gate.js
node tools/bible/ability-gate.js --strict
```

## Pendientes

- **Revisión humana de arte** (dirección artística y animación): el arte es procedural y legible, pero no pasó por una mano
  humana; conviene un repintado manual o una revisión antes de publicarlo.
- Audio: sin grabaciones propias (sonidos sintetizados).
- Los reportes históricos generados (`docs/ux/*.json`, `docs/vfx/*-results.json`, etc.) conservan el nombre anterior porque describen
  corridas ya hechas; se regeneran con sus herramientas.
- Postgres: la migración de filas de ranking (`INSERT … ON CONFLICT` + `DELETE` al iniciar) y el `getSave` migrado no se
  ejecutaron contra una base real (solo contra el almacenamiento de archivos).
