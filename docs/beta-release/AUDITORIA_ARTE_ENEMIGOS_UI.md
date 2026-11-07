# Auditoría de arte: Bestiario, enemigos, arenas e interfaz (2026-11-07)

Auditor: director de arte pixel independiente. Rama `main` (HEAD `0b46f312`). **No se tocó código ni assets**; solo este documento y las capturas de `docs/beta-release/audit-art-enemigos/`.
Método: servidor `python3 -m http.server 8901`, Playwright (Chromium) con `?lazy=0&dev=1` y `assetsAllReady()`; Bestiario/Jefes abiertos por la UI real del Códice (`codexGo`) con todo desbloqueado; sprite de partida = `startRun` + `spawnEnemy` por arena (capturas `arenas/lineup_*.png`); trazado de qué atlas se dibuja (`drawImage` interceptado sobre `_cxDrawEnemy`) y cuántos cuadros distintos recorre al caminar.

## 1. Veredicto corto: por qué el dueño ve arte viejo en el Bestiario

1. **No es caché ni carga perezosa.** Verificado con `?lazy=0` y con la carga por defecto (`lazy_default_hielo_t600.png`): los 102 atlas quedan listos y las tarjetas muestran el arte nuevo en Hielo. Los atlas llevan `?v=20261107a`; el SW del repo no intercepta sin estampar.
2. **La ficha del Códice y la partida usan el MISMO dibujo** (`_cxDrawEnemy` -> `drawEnemyBody`, el mismo que usa la partida). Se comparó ficha vs `spawnEnemy` en las 10 arenas: **0 enemigos con sprite distinto entre ficha y partida**, 0 retratos faltantes (las 92 entradas dibujan; solo `cm_cometa`, `foco_*`, `lev_tentaculo` no tienen cuerpo y no están en el Códice).
3. **Causa principal: el arte "nuevo" (hoja Runway v2) solo cubre 26 tipos** (`js/assets/enemy-runway-sheets.js`) **+ 11 con hoja v2/v3 de otra tubería**. Quedan **44 de 92 entradas (48%) en atlas pre-v2** de 2-3 cuadros de caminata: *todo* Fortaleza (7 + Caballero), Micelial (6 + 3 procedurales), Abismo (6 + 2 procedurales), Minas (6), Ciudad (6 comunes) y piezas sueltas (Lobo Ártico, Gólem de Cristal, Guardián Ancestral, Kraken, Guardián del Laberinto, Demonio Mayor, Hechicero). Esas arenas nunca pasaron por `tools/art/runway`: su fuente es una hoja concepto única (`art-source/<arena>/enemigos*.png`).
4. **Los jefes** (11 de 22) son láminas pintadas de 2-3 poses fijas (`battlefield/*.webp`, `battlefieldDrawMonster`): buen retrato, pero sin ciclo de animación, y Leviatán/Madre Espora son ilustraciones no-pixel que rompen la densidad.
5. **Lo que más "grita" arte viejo no es el Bestiario sino las portadas**: `assets/ui/codex/arenas/*.png` son capturas de partida **viejas** (Bosque y Hielo anteriores a `world-v1`; Minas con texto de concepto superpuesto; Ciudad/Minas son mapas de concepto con marcas numeradas). Se ven en Arenas del Códice, en la pantalla de elegir arena y como panel gigante pixelado en cada ficha de arena.
6. Con cuenta nueva el Bestiario muestra **siluetas "???"** (0/70 descubiertas): el dueño no ve el arte hasta derrotar o encontrar la criatura.

## 2. Resumen de cifras

| Ítem | Total | Arte nuevo (>=75) | Mixto (65-74) | Viejo (50-64) | Crítico (<50) |
|---|---|---|---|---|---|
| Enemigos (comunes/subélites/élites/invocaciones) | 70 | 33 | 7 | 21 | 9 |
| Jefes y subjefes (22 entradas) | 22 | 4 | 6 | 10 | 2 |
| Arenas en partida | 11 | 2 | 1 | 4 | 4 |
| Pantallas/familias de UI auditadas | 22 | 2 | 5 | 7 | 8 |

Fuente de arte (92 entradas): Atlas pre-v2 por arena: 37, Runway v2 (hoja completa): 26, Lámina pintada battlefield: 11, Hoja v2/v3 otra tubería: 11, Procedural/partes: 5, Cuadros legacy: 2.

**Rúbrica (0-100)**: fuente de arte 0-40 (Runway v2=40 · v2 otra tubería=34 · lámina pintada=24 · atlas pre-v2=20 · legacy=16 · procedural=8) + animación 0-25 (cuadros distintos al caminar medidos en runtime) + calidad/coherencia visual 0-25 (juicio de ojo sobre las hojas de contacto; anotado por fila cuando se aparta del valor por defecto) + ficha/retrato 0-10. Los dos primeros ejes son medidos; el tercero es criterio de director de arte y puede discutirse. Un jefe con varias formas toma la peor forma.

## 3. Hojas de contacto (mirarlas, no solo la tabla)
- Fichas del Bestiario/Jefes en orden de arena: `contact_fichas_01..08.png`; tarjetas del Bestiario por arena: `bestiario_<arena>.png`; fichas sueltas: `fichas/`.
- Sprites en partida (lineup por arena): `arenas/lineup_<arena>.png`; arenas vacías: `arenas/arena_<arena>_vacia.png`, resumen `contact_arenas_1..3.png`.
- Portadas del Códice: `contact_codex_portadas.png`, `contact_codex_minas_retratos.png`.
- Interfaz: `ui/*.png`, resumen `contact_ui_1..4.png`.

## 4. Enemigos, subjefes y jefes: de PEOR a MEJOR

| # | Tipo | Clave | Nombre | Arena | Pts | Nivel | Fuente de arte | Cuad. | Causa probable / nota |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Enemigo | `ab_tentaculo` | Tentáculo del Abismo | abismo | **29** | CRÍTICO | Procedural/partes | 2 | Dibujo procedural/por partes; sin atlas de cuerpo · dos piezas desconectadas flotando (rayo + masa) |
| 2 | Jefe | `madre_espora` | La Madre Espora | micelial | **29** | CRÍTICO | Procedural/partes | 2 | Dibujo procedural/por partes; sin atlas de cuerpo · ilustración psicodélica no-pixel; silueta de "???" se rompe (rectángulo de ruido) |
| 3 | Enemigo | `nucleo_micelial` | Núcleo Micelial | micelial | **36** | CRÍTICO | Procedural/partes | 2 | Dibujo procedural/por partes; sin atlas de cuerpo · procedural, diminuto |
| 4 | Enemigo | `raiz_absorcion` | Raíz de Absorción | micelial | **37** | CRÍTICO | Procedural/partes | 2 | Dibujo procedural/por partes; sin atlas de cuerpo · procedural |
| 5 | Enemigo | `cm_sectario` | Sectario Fanático | ciudad | **46** | CRÍTICO | Atlas pre-v2 por arena | 2 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · recuadro gris artefacto detrás del sprite; diminuto |
| 6 | Enemigo | `cm_saqueador` | Saqueador Maldito | ciudad | **48** | CRÍTICO | Atlas pre-v2 por arena | 2 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · diminuto, ilegible en tarjeta |
| 7 | Enemigo | `cm_raptor` | Raptor | ciudad | **48** | CRÍTICO | Atlas pre-v2 por arena | 2 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · borroso, paleta apagada, sprite diminuto |
| 8 | Enemigo | `cm_planidera` | Plañidera | ciudad | **48** | CRÍTICO | Atlas pre-v2 por arena | 2 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · diminuto, casi sin detalle legible |
| 9 | Enemigo | `engendro` | Engendro Encadenado | fortaleza | **48** | CRÍTICO | Atlas pre-v2 por arena | 2 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · diminuto |
| 10 | Enemigo | `cm_espectro` | Espectro Ciudadano | ciudad | **49** | CRÍTICO | Atlas pre-v2 por arena | 2 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · azul plano, baja densidad |
| 11 | Jefe | `ab_morador` | El Que Mora Debajo | abismo | **49** | CRÍTICO | Procedural/partes | 4 | Dibujo procedural/por partes; sin atlas de cuerpo · disco procedural/ojo; sin cuerpo animado |
| 12 | Enemigo | `ab_acechador` | Acechador del Borde | abismo | **50** | VIEJO | Atlas pre-v2 por arena | 2 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 13 | Enemigo | `ab_heraldo` | Heraldo del Ojo | abismo | **50** | VIEJO | Atlas pre-v2 por arena | 2 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 14 | Enemigo | `ab_tejedor` | Tejedor del Vacío | abismo | **50** | VIEJO | Atlas pre-v2 por arena | 2 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · bloque borroso |
| 15 | Enemigo | `ab_devorador` | Devorador de Piedra | abismo | **51** | VIEJO | Atlas pre-v2 por arena | 2 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · bloque borroso sin lectura |
| 16 | Enemigo | `ab_errante` | Errante del Vacío | abismo | **52** | VIEJO | Atlas pre-v2 por arena | 2 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 17 | Enemigo | `sabueso` | Sabueso Cordyceps | micelial | **55** | VIEJO | Atlas pre-v2 por arena | 3 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · chico |
| 18 | Enemigo | `acechador` | Acechador de Esporas | micelial | **55** | VIEJO | Atlas pre-v2 por arena | 3 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · chico |
| 19 | Jefe | `leviatan` | Leviatán | acuatica | **55** | VIEJO | Lámina pintada battlefield | 2 | Lámina estática de 2-3 poses (battlefield); sin ciclo de caminar/atacar · ilustración pintada no-pixel: choca con la densidad del resto del Acuático |
| 20 | Enemigo | `prisionero` | Prisionero Ensamblado | fortaleza | **56** | VIEJO | Atlas pre-v2 por arena | 3 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · ruido de píxeles, silueta confusa |
| 21 | Enemigo | `infectado` | Infectado Micelial | micelial | **56** | VIEJO | Atlas pre-v2 por arena | 3 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 22 | Enemigo | `peregrino` | Peregrino Enraizado | micelial | **56** | VIEJO | Atlas pre-v2 por arena | 3 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 23 | Jefe | `guardian_ancestral` | Guardián Ancestral Corrompido / Guardián Ancestral Corrompido | bosque | **56** | VIEJO | Atlas pre-v2 por arena | 3 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · baja resolución/blocky, más tosco que sus vecinos; baja resolución/blocky, más tosco que sus vecinos |
| 24 | Enemigo | `carcelero` | Carcelero Deforme | fortaleza | **58** | VIEJO | Atlas pre-v2 por arena | 3 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 25 | Enemigo | `arana` | Araña Mecánica | fortaleza | **58** | VIEJO | Atlas pre-v2 por arena | 3 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 26 | Enemigo | `verdugo` | Verdugo de Vapor | fortaleza | **58** | VIEJO | Atlas pre-v2 por arena | 3 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 27 | Subjefe | `kraken_joven` | Kraken Joven | acuatica | **58** | VIEJO | Cuadros legacy | 4 | Cuadros sueltos legacy; no hay hoja v2 · bloques gruesos; cuadros legacy |
| 28 | Subjefe | `guardian_laberinto` | Guardián del Laberinto | laberinto | **58** | VIEJO | Cuadros legacy | 4 | Cuadros sueltos legacy; no hay hoja v2 · cuadros legacy ruidosos |
| 29 | Subjefe | `hechicero_supremo` | Hechicero Supremo | infernal | **59** | VIEJO | Atlas pre-v2 por arena | 3 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 30 | Enemigo | `bestia_bosque` | Bestia del Bosque | bosque | **60** | VIEJO | Lámina pintada battlefield | 2 | Lámina estática de 2-3 poses (battlefield); sin ciclo de caminar/atacar · lámina thornbeast; runway rechazado |
| 31 | Enemigo | `hinchado` | Hinchado | micelial | **60** | VIEJO | Atlas pre-v2 por arena | 3 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 32 | Enemigo | `chaman` | Chamán de la Colonia | micelial | **60** | VIEJO | Atlas pre-v2 por arena | 3 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 33 | Jefe | `hechicero_final` | Ángel Corrompido / Golem de Cuerpos / Demonio Mayor | infernal | **62** | VIEJO | Atlas pre-v2 por arena | 5 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · atlas Infernal viejo, jefe sin lámina |
| 34 | Enemigo | `automata` | Autómata de Hierro | fortaleza | **63** | VIEJO | Atlas pre-v2 por arena | 4 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 35 | Enemigo | `ab_jinete` | Jinete Sin Cabeza | abismo | **63** | VIEJO | Atlas pre-v2 por arena | 4 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 36 | Subjefe | `cm_funcion` | Maestro de Ceremonias / El Tramoyista | ciudad | **63** | VIEJO | Lámina pintada battlefield | 2 | Lámina estática de 2-3 poses (battlefield); sin ciclo de caminar/atacar |
| 37 | Enemigo | `dragon_bronce` | Dragón de Bronce | fortaleza | **64** | VIEJO | Atlas pre-v2 por arena | 4 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 38 | Enemigo | `mn_insecto` | Insecto de Cristal | minas | **64** | VIEJO | Atlas pre-v2 por arena | 8 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · diminuto |
| 39 | Enemigo | `mn_acechador` | Acechador Ciego | minas | **64** | VIEJO | Atlas pre-v2 por arena | 8 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · diminuto y casi negro |
| 40 | Subjefe | `cm_dama` | La Dama del Telón | ciudad | **64** | VIEJO | Lámina pintada battlefield | 2 | Lámina estática de 2-3 poses (battlefield); sin ciclo de caminar/atacar |
| 41 | Subjefe | `micelio` | Micelio Primigenio | micelial | **64** | VIEJO | Lámina pintada battlefield | 2 | Lámina estática de 2-3 poses (battlefield); sin ciclo de caminar/atacar |
| 42 | Subjefe | `ab_carcelero` | El Carcelero del Vacío | abismo | **64** | VIEJO | Lámina pintada battlefield | 2 | Lámina estática de 2-3 poses (battlefield); sin ciclo de caminar/atacar |
| 43 | Enemigo | `mn_esclavo` | Esclavo Enlazado | minas | **65** | MIXTO | Atlas pre-v2 por arena | 8 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · diminuto |
| 44 | Subjefe | `dragon_forja` | Dragón de la Forja | fortaleza | **65** | MIXTO | Lámina pintada battlefield | 2 | Lámina estática de 2-3 poses (battlefield); sin ciclo de caminar/atacar |
| 45 | Jefe | `minotauro` | Minotauro | laberinto | **65** | MIXTO | Lámina pintada battlefield | 2 | Lámina estática de 2-3 poses (battlefield); sin ciclo de caminar/atacar |
| 46 | Subjefe | `mn_titan` | Titán de Piedra | minas | **65** | MIXTO | Lámina pintada battlefield | 2 | Lámina estática de 2-3 poses (battlefield); sin ciclo de caminar/atacar |
| 47 | Jefe | `mn_cerbero` | Cerbero | minas | **65** | MIXTO | Lámina pintada battlefield | 2 | Lámina estática de 2-3 poses (battlefield); sin ciclo de caminar/atacar |
| 48 | Enemigo | `cm_verdugo` | Verdugo | ciudad | **66** | MIXTO | Atlas pre-v2 por arena | 6 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · sprite chico, poco detalle |
| 49 | Enemigo | `lobo_artico` | Lobo Ártico | hielo | **66** | MIXTO | Atlas pre-v2 por arena | 4 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · atlas pre-v2; realista, estilo distinto |
| 50 | Enemigo | `golem_cristal` | Gólem de Cristal | hielo | **66** | MIXTO | Atlas pre-v2 por arena | 4 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · atlas pre-v2 (invocación) |
| 51 | Enemigo | `mn_escupidor` | Escupidor de Oscuridad | minas | **66** | MIXTO | Atlas pre-v2 por arena | 8 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 52 | Jefe | `cm_presentador` | El Presentador / El Presentador / El Presentador | ciudad | **66** | MIXTO | Lámina pintada battlefield | 2 | Lámina estática de 2-3 poses (battlefield); sin ciclo de caminar/atacar |
| 53 | Enemigo | `mn_minero` | Minero Corrompido | minas | **67** | MIXTO | Atlas pre-v2 por arena | 6 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 54 | Enemigo | `mn_consumidor` | Consumidor Luminoso | minas | **68** | MIXTO | Atlas pre-v2 por arena | 8 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) |
| 55 | Jefe | `caballero` | Caballero de la Armadura Oxidada | fortaleza | **71** | MIXTO | Atlas pre-v2 por arena | 6 | Arena no pasó por tools/art/runway: sigue el atlas viejo (fuente: hoja concepto enemigos.png) · blocky, contorno dentado |
| 56 | Enemigo | `angel_hielo` | Ángel de Hielo y Cristal | hielo | **78** | NUEVO | Hoja v2/v3 otra tubería | 4 | Sin recibo Runway en art-source (verificar aprobación) · v2 delgado/chico en tarjeta |
| 57 | Enemigo | `golem_piedra` | Gólem de Piedra | laberinto | **78** | NUEVO | Hoja v2/v3 otra tubería | 5 | Sin recibo Runway en art-source (verificar aprobación) · v2 instalado pero en art-source solo hay rejected_v1 (sin aprobación); pose rara |
| 58 | Jefe | `jinete_sin_cabeza` | Jinete Sin Cabeza | divina | **80** | NUEVO | Hoja v2/v3 otra tubería | 4 | Sin recibo Runway en art-source (verificar aprobación) |
| 59 | Subjefe | `dragon_hielo` | Tundraverx, Soberano de Hielo | hielo | **81** | NUEVO | Hoja v2/v3 otra tubería | 4 | Sin recibo Runway en art-source (verificar aprobación) |
| 60 | Enemigo | `enjambre_hadas` | Enjambre de Hadas | bosque | **82** | NUEVO | Hoja v2/v3 otra tubería | 4 | Sin recibo Runway en art-source (verificar aprobación) |
| 61 | Enemigo | `cu_sith` | Cù-Sìth | bosque | **82** | NUEVO | Hoja v2/v3 otra tubería | 4 | Sin recibo Runway en art-source (verificar aprobación) |
| 62 | Enemigo | `dama_bosque` | Dama del Bosque | bosque | **82** | NUEVO | Hoja v2/v3 otra tubería | 4 | Sin recibo Runway en art-source (verificar aprobación) |
| 63 | Enemigo | `dragoncito_hielo` | Dragoncito de Hielo | hielo | **82** | NUEVO | Hoja v2/v3 otra tubería | 4 | Sin recibo Runway en art-source (verificar aprobación) |
| 64 | Enemigo | `golem` | Gólem | infernal | **82** | NUEVO | Hoja v2/v3 otra tubería | 4 | Sin recibo Runway en art-source (verificar aprobación) |
| 65 | Subjefe | `dobladores` | Doppelgänger — Guerrero / Doppelgänger — Arquera / Doppelgänger — Pícaro / Doppelgänger — Clérigo | bosque | **82** | NUEVO | Hoja v2/v3 otra tubería | 4 | Sin recibo Runway en art-source (verificar aprobación) |
| 66 | Enemigo | `cristal_servo` | Servo de Cristal | hielo | **85** | NUEVO | Runway v2 (hoja completa) | 3 | — |
| 67 | Enemigo | `tiburon_joven` | Tiburón Joven | acuatica | **85** | NUEVO | Runway v2 (hoja completa) | 3 | — |
| 68 | Enemigo | `cangrejo_acorazado` | Cangrejo Araña | acuatica | **85** | NUEVO | Runway v2 (hoja completa) | 3 | — |
| 69 | Enemigo | `demonio_mago` | Demonio Hechicero | infernal | **85** | NUEVO | Runway v2 (hoja completa) | 3 | — |
| 70 | Jefe | `mago_gelido` | El Mago Gélido / Ángel Caído de Hielo | hielo | **85** | NUEVO | Hoja v2/v3 otra tubería | 5 | Sin recibo Runway en art-source (verificar aprobación) |
| 71 | Enemigo | `ent` | Ent | bosque | **86** | NUEVO | Runway v2 (hoja completa) | 6 | — · naranja plano y bloques gruesos; no coincide con el resto del Bosque |
| 72 | Enemigo | `esfinge` | Esfinge | laberinto | **88** | NUEVO | Runway v2 (hoja completa) | 4 | — · naranja saturado |
| 73 | Enemigo | `cm_perro` | Perro del Albañal | ciudad | **90** | NUEVO | Runway v2 (hoja completa) | 4 | — |
| 74 | Enemigo | `demonio_hielo_fuego` | Demonio de Hielo y Fuego | hielo | **90** | NUEVO | Runway v2 (hoja completa) | 4 | — |
| 75 | Enemigo | `esqueleto_h` | Esqueleto Cornudo | infernal | **90** | NUEVO | Runway v2 (hoja completa) | 4 | — |
| 76 | Enemigo | `medusa` | Medusa | laberinto | **91** | NUEVO | Runway v2 (hoja completa) | 5 | — |
| 77 | Enemigo | `sirena_abisal` | Sirena Abisal | acuatica | **93** | NUEVO | Runway v2 (hoja completa) | 5 | — |
| 78 | Enemigo | `zombie` | Zombi | infernal | **93** | NUEVO | Runway v2 (hoja completa) | 5 | — |
| 79 | Enemigo | `demonio_menor` | Demonio Menor | infernal | **93** | NUEVO | Runway v2 (hoja completa) | 5 | — |
| 80 | Enemigo | `cm_acechante` | Acechante de los Tejados | ciudad | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |
| 81 | Enemigo | `cm_campanero` | Campanero | ciudad | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |
| 82 | Enemigo | `duende_bosque` | Duende del Bosque | bosque | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |
| 83 | Enemigo | `golem_hielo` | Gólem de Hielo | hielo | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |
| 84 | Enemigo | `hada_escarcha` | Hada de Escarcha | hielo | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |
| 85 | Enemigo | `cristal_volador` | Cristal Volador | hielo | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |
| 86 | Enemigo | `medusa_electrica` | Medusa Eléctrica | acuatica | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |
| 87 | Enemigo | `anguila_electrica` | Anguila Eléctrica | acuatica | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |
| 88 | Enemigo | `tiburon_blanco` | Tiburón Blanco | acuatica | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |
| 89 | Enemigo | `escorpion_gigante` | Escorpión Gigante | laberinto | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |
| 90 | Enemigo | `druida_arena` | Druida de Arena | laberinto | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |
| 91 | Enemigo | `mn_devoraluz` | Devoraluz | minas | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |
| 92 | Enemigo | `esqueleto` | Esqueleto | infernal | **96** | NUEVO | Runway v2 (hoja completa) | 6 | — |

Notas de lectura: «Cuad.» = cuadros distintos que recorre el ciclo de caminar (los atlas Runway tienen 3-6, los viejos 2-3, las láminas pintadas 2). `Hielo`: el piloto está cumplido (9 de 11 entradas con hoja nueva); lo pendiente es Lobo Ártico y Gólem de Cristal (atlas pre-v2, calidad aceptable). `Acuática` y `Laberinto` están casi completas salvo Leviatán, Kraken y Guardián del Laberinto.

## 5. Arenas en partida (10 + Divina), de PEOR a MEJOR
Evidencia: `arenas/arena_<arena>_vacia.png` y `contact_arenas_*.png`. Referencia nueva: `assets/sprites/arenas/world-v1` (props de Hielo y Bosque, ya integrados) y `art-source/runway-world/*` (texturas maestras Fortaleza, Infernal, Acuática, Abismo, Laberinto, Ciudad: **solo en art-source, no instaladas** (sin referencias en `js/` ni `assets/`).

| # | Arena | Pts | Qué se ve | Causa probable |
|---|---|---|---|---|
| 1 | Divina | 35 | Suelo púrpura plano de baldosas repetidas, casi sin props (un altar "+") | Sin pack de arena propio |
| 2 | Fortaleza | 40 | Suelo gris oscuro liso, pocas piezas (estandartes rojos planos, cajas) | `runway-world/fortaleza` (adoquín, planchas de hierro) sin instalar |
| 3 | Minas | 45 | Marrón liso con rieles y faroles aislados; poca profundidad | Texturas Minas viejas (`assets/vfx/minas`) |
| 3 | Micelial | 45 | Suelo de ruido posterizado/borroso (parece JPG ampliado); legibilidad baja | Fondo reescalado; sin pase de limpieza |
| 5 | Ciudad | 55 | Adoquín oscuro correcto pero repetitivo, props escasos | `runway-world/ciudad` (casas, techos) sin instalar |
| 6 | Infernal | 58 | Pentagrama y lava legibles pero el piso se ve ampliado/pixelado grueso | `runway-world/infernal_piso` sin instalar |
| 7 | Acuática | 60 | Buena atmósfera; props de coral/algas pequeños y repetidos | `runway-world/acuatica_piso` sin instalar |
| 8 | Laberinto | 62 | Arena dorada con obeliscos y círculo solar: correcta, algo plana | `runway-world/laberinto_piso` sin instalar |
| 9 | Abismo | 70 | Plataforma de piedra con cristal, buena iluminación | `runway-world/abismo_piso` sin instalar |
| 10 | Bosque | 85 | `world-v1` integrado: árboles, runas y claro con volumen | Referencia nueva |
| 11 | Hielo | 85 | `world-v1` integrado: estatuas, cristales, braseros, lago helado | Referencia nueva |

Banderas/torres/estandartes: en Fortaleza son estandartes rojos planos de 1 color (40); Hielo y Bosque usan torres y braseros del pack nuevo (85).

## 6. Interfaz, de PEOR a MEJOR
Evidencia en `ui/` y `contact_ui_*.png`.

| # | Pantalla / elemento | Pts | Hallazgo | Causa probable |
|---|---|---|---|---|
| 1 | Victoria | 25 | Pantalla casi vacía: "¡Victoria!" + botón sobre muro | Sin arte propio (`victory-screen`) |
| 2 | Game over | 30 | Solo título rojo y dos botones | Sin arte propio |
| 3 | Códice > ficha de Arena | 30 | Panel enorme con captura vieja ampliada x3 y pixelada; Minas con texto de concepto; Ciudad con marcas numeradas | `assets/ui/codex/arenas/*.png` son capturas viejas/concepto |
| 4 | Pausa | 35 | Caja de texto plana con acordeones | Sin arte propio |
| 5 | Códice > Arenas (lista) y Elegir arena | 40 | Miniaturas = capturas viejas (Bosque/Hielo pre-world-v1) + emoji de ícono | Mismas portadas viejas |
| 6 | Ficha del Guardián (`champdetail`) | 40 | Muro de texto con ícono diminuto | Pantalla de texto; sin retrato grande |
| 7 | Inventario > Colección | 40 | Grilla de slots "???" sin arte | Sin íconos finales |
| 8 | Elegir refuerzo (buff-choice) | 40 | Tres cajas de texto con íconos mínimos | Íconos procedurales |
| 9 | Inventario > Objetos | 50 | Íconos procedurales 32x32 ("provisorios" según `item-icons.js`), todos de la misma familia de silueta | Falta pack de íconos de objeto (manifiesto `LA_HORDA_ITEM_ASSET_MANIFEST.md`) |
| 10 | Tienda > Objetos | 50 | Mismos íconos procedurales; sets legibles | Ídem |
| 11 | Modos y Multijugador | 55 | Solo texto y marcos; sin imagen | Pantalla funcional |
| 12 | Códice > Jefes (lista) | 55 | Siluetas bien, pero Madre Espora = rectángulo de ruido | Silueta sobre lámina rectangular |
| 13 | Iconos de habilidad (HUD y paneles) | 50 | 6 íconos PNG pintados (`assets/ui/skill-icons`) + ~247 glifos procedurales 16x16 con motivos genéricos | Solo 6 íconos pintados |
| 14 | Tienda > Guardianes | 55 | Retratos chicos + texto | Retratos de lista pequeños |
| 15 | Sala (prep) | 65 | Retrato grande del campeón correcto; barra de pestañas con emoji-ícono | Aceptable |
| 16 | HUD de partida | 65 | Coherente (marcos y botones de habilidad con arte), glifos de skill procedurales | Ver fila 13 |
| 17 | Códice > Bestiario | 62 | Tarjetas con sprites vivos; 48% de ellos en atlas viejos | Ver sección 4 |
| 18 | Tienda > Destacados | 68 | Arte de skins excelente; íconos de objeto procedurales | Ver fila 9 |
| 19 | Menú principal | 70 | Marcos y títulos consistentes; íconos pixel por código | Aceptable |
| 20 | Códice > Inicio | 70 | Tiles con siluetas y arte de guardianes | Aceptable |
| 21 | Títulos / portada | 78 | Arte clave con elenco y jefe de Hielo | Nuevo |
| 22 | Códice > Guardianes | 78 | Grilla de retratos pixel consistente | Nuevo |

Otros: estandartes y banderas de arenas dentro del Códice no existen como arte propio (se usan emoji/íconos pixel de `pixel-icons.js`). Marcos y botones: consistentes (`menu-stone-64`, `menu-embers-128`); no se detectó una familia vieja conviviendo con una nueva.

## 7. Top-20 prioridad para la beta
Orden por impacto visible para el jugador/dueño x costo. Esfuerzo: S <= 1 día, M = 2-4 días, L > 1 semana.

| # | Prioridad | Acción sugerida | Esfuerzo |
|---|---|---|---|
| 1 | Portadas del Códice (11) + miniaturas de Elegir arena | Regenerar `assets/ui/codex/arenas/*.png` capturando la partida actual (Playwright, como en esta auditoría) con recorte limpio, sin texto de concepto; quitar la ampliación x3 de la ficha | S |
| 2 | Madre Espora: silueta rota en lista de Jefes | Arreglar la silueta (máscara sobre la lámina) y repintar a densidad pixel | S |
| 3 | `ab_tentaculo`: dos piezas desconectadas | Corregir ensamblado (rayo + masa) | S |
| 4 | Fortaleza: 7 comunes + Caballero en atlas viejo (engendro, prisionero, carcelero...) | Regenerar con Runway (spec + `build_sheet.py`) y registrar en `ENEMY_RUNWAY_SHEETS` | L |
| 5 | Abismo: 5 enemigos + 3 procedurales (errante, acechador, heraldo, devorador, tejedor, tentáculo) | Regenerar con Runway / repintar con painter | L |
| 6 | Micelial: 6 en atlas viejo + núcleo/raíz procedurales | Regenerar con Runway; repintar núcleo/raíz con painter | L |
| 7 | Ciudad: 6 comunes diminutos (sectario, saqueador, raptor, planidera, espectro, verdugo) | Regenerar con Runway (3 ya están en v2 y sirven de referencia) | M |
| 8 | Minas: 6 enemigos (esclavo, insecto, acechador, escupidor, minero, consumidor) | Regenerar con Runway (Devoraluz v2 como referencia) | M |
| 9 | Texturas de piso `art-source/runway-world/*` sin instalar (Fortaleza, Infernal, Acuática, Abismo, Laberinto, Ciudad) | Instalar maestras como `assets/vfx/<arena>/` y referenciarlas | M |
| 10 | Arena Fortaleza (40) y Divina (35) planas | Pack de props + suelo (después del punto 9) | M |
| 11 | Arena Micelial: suelo posterizado | Rehacer textura/limpiar ruido | S |
| 12 | Arena Minas (45) | Repintar suelo y props | M |
| 13 | Leviatán: ilustración no-pixel | Repintar a la densidad del Acuático (painter) y sumar ciclo | M |
| 14 | Ent y Guardián Ancestral (Bosque): tosco/naranja plano | Repintar con painter | M |
| 15 | Golem de Piedra: v2 instalado con solo `rejected_v1` en art-source | Aprobar con QA o rehacer; reconciliar recibos | S |
| 16 | Lobo Ártico y Gólem de Cristal (pre-v2) | Re-hoja Runway para igualar el resto de Hielo | M |
| 17 | Íconos de objeto procedurales (inventario/tienda) | Pack de íconos finales (manifiesto ya escrito) o Runway por lotes | L |
| 18 | Íconos de habilidad: solo 6 pintados | Pintar los de ult/básico de los guardianes más usados primero | L |
| 19 | Victoria / Game over / Pausa / Elegir refuerzo planas | Fondo ilustrado + marco; reusar portadas nuevas | S |
| 20 | Jefes en lámina de 2 poses (11) | Hojas con ciclo de caminar/ataque (empezar por Presentador, Minotauro, Cerbero) | L |

Extras menores: ficha de criaturas pequeñas (tope `_cxMaxZoom` = 2.6 hace que bichos de ~40 px se vean chicos en la ficha de 496 px; subir el tope solo para sprites nativos nítidos) — S. 11 solicitudes 404 en carga: `assets/ui/codex/minas/*.jpg` (los PNG existen; origen de la referencia `.jpg` no localizado en `js/`) — S.

## 8. Limitaciones
- El juicio de "calidad visual" (25 pts) es de ojo sobre capturas 1280x800; no hay evaluación de audio ni de performance.
- La fuente de arte "nuevo" se tomó de `ENEMY_RUNWAY_SHEETS` y de los atlas `v2/v3` realmente dibujados en runtime (no de lo que sólo existe en `art-source`).
- `lineup_*` usa el motor real pero con enemigos congelados cerca del héroe (no representa tamaño relativo en oleadas).
