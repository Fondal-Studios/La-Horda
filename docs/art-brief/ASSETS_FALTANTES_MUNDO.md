# La Horda — Assets faltantes del mundo (todo lo que NO es campeón ni audio)

> **Para el pintor.** Este documento es la lista auditada de los dibujos que faltan en el juego, salvo los campeones (los cubre otro documento del mismo lote) y el audio (fuera de alcance, sección 9). No hace falta conocer el repo: cada fila dice qué dibujar, con qué medidas, dónde dejarlo y **qué asset ya existente se parece a lo que hay que hacer**.
>
> - **Depende del PR #124** (`docs/art-brief/00_ESPECIFICACION_TECNICA.md`, rama `origin/claude/spec-arte-tecnica`): formato de PNG, alfa, escala, FX, íconos, entrega. Este documento **no lo duplica**: cuando una fila dice "según la especificación §2.2.2", se lee allí.
> - Lista legible por máquina con las mismas filas: `docs/art-brief/manifiestos/mundo_faltantes.json` (1061 filas; es la lista **exhaustiva**: este documento resume y agrupa).
> - Hojas de contacto con los ejemplos de referencia: `docs/art-brief/ejemplos/mundo/` (sección 11).
> - Generado el 2026-10-18 sobre `origin/main` (`d57cf5e`) + PR #124. No modifica código del juego.

**Marcas de confianza** (columna `Verif.` del JSON): **repo** = comprobado leyendo el código o ejecutando una herramienta del repo en este entorno · **pr** = leído en la rama de un PR abierto (no está en `main`) · **doc** = tomado de un documento del repo y **no** re-verificado · **[PROPUESTA]** = nombre/ruta nueva que se sugiere (no existe aún) · **[DECIDE EL DUEÑO]** = hay una contradicción que solo el dueño puede resolver.

---

## 0. Qué leer antes de pintar (5 minutos)

1. **Todo es píxel nativo.** Canon: **1,0 unidad de mundo por píxel** para personajes, enemigos y jefes (banda aceptable 0,45–2,4); suelos y fondos **2,0 u/px**; sin JPG, sin degradé de pintura, sin antialiasing, alfa solo 0 o 255, contorno oscuro de 1 px (`docs/ART_BIBLE.md` §2, §6, §14; especificación §1). "Más tamaño y más detalle, nunca píxeles más gruesos" (§9 de la Art Bible).
2. **Paleta (decisión del dueño, ya tomada).** La Art Bible pide 4–6 colores BASE por pieza y el Style Gate cuenta tonos: son compatibles porque **las variaciones tonales de cada color base (2–3 tonos por color, rampas con luz arriba-izquierda) llenan el rango del gate**. Excepción dura: **los íconos de 16×16 llevan como máximo 6 colores en total** (contrato del PR #119), allí no hay margen para variaciones.
3. **Hojas completas, nunca cuadros sueltos.** Un enemigo o jefe se entrega como un atlas con todos sus estados (`LA_HORDA_ASSETS_FALTANTES.md`: "no se puede pedir un cuadro suelto"). Una sola silueta por pose, pies alineados, perfil mirando a la derecha (la izquierda la espeja el juego).
4. **El arte nunca decide mecánica**: radio, hitbox, daño y cooldown son del código. El borde exterior de un efecto de área es el radio real.
5. **100 % original** (especificación §5, caso Eren → Ilkan): no calcar ni "inspirarse" de forma reconocible en obras ajenas. **Aviso legal W1**: `LA_HORDA_ITEM_ASSET_MANIFEST.md` todavía nombra a **Eren** y a la "Legión de Reconocimiento" en la skin y el aura de un set; el campeón vigente es **Ilkan** y su set en el código es **"Caravana de Medianoche"** (`js/data/champion-sets.js:99`). No uses ese prompt; parte del código.
6. **Estado de los PR de apoyo** (verificado en GitHub): **#124** especificación técnica; **#119** contrato de íconos de habilidad 16×16 (abierto, no está en `main`); **#118** emojis a íconos pixel (abierto, no está en `main`); fichas de FX por campeón en las ramas `origin/claude/briefs-habilidades-a` y `-b` (`docs/art-brief/campeones/*.md`, 43 campeones). Las filas que dependen de ellos están marcadas `pr`.

---

## 1. Resumen con conteos

1061 filas en el manifiesto. P0 = se nota en una partida normal, excepción del gate, cuerpo prestado o definitiva · P1 = mejora clara · P2 = pulido u opcional.

| Categoría | P0 | P1 | P2 | Filas |
|---|---|---|---|---|
| A · Efectos, proyectiles y props persistentes | 43 | 169 | 96 | 308 |
| B · Íconos de habilidad 16×16 | 10 | 41 | 128 | 179 |
| C · Enemigos, jefes, objetos y sets | 35 | 115 | 222 | 372 |
| D · Arenas | 21 | 65 | 38 | 124 |
| E · UI, Códice y Libro | 3 | 24 | 51 | 78 |
| **TOTAL** | **112** | **414** | **535** | **1061** |

Detalle por subcategoría:

| Cat. | Subcategoría | Filas | P0 | P1 | P2 |
|---|---|---|---|---|---|
| A | fx_habilidad | 230 | 43 | 133 | 54 |
| A | prop_persistente | 43 | 0 | 2 | 41 |
| A | proyectil | 35 | 0 | 34 | 1 |
| B | icono_habilidad | 179 | 10 | 41 | 128 |
| C | enemigo_elite | 23 | 8 | 12 | 3 |
| C | enemigo_jefe | 6 | 2 | 3 | 1 |
| C | enemigo_normal | 31 | 5 | 5 | 21 |
| C | enemigo_subelite | 15 | 2 | 1 | 12 |
| C | enemigo_subjefe | 7 | 0 | 6 | 1 |
| C | entidad_de_escenario | 9 | 1 | 8 | 0 |
| C | forma_de_jefe | 8 | 2 | 4 | 2 |
| C | item_arquetipo | 26 | 0 | 26 | 0 |
| C | item_legendario | 24 | 0 | 24 | 0 |
| C | item_mitico | 8 | 8 | 0 | 0 |
| C | item_objeto_de_campeon | 14 | 0 | 14 | 0 |
| C | item_pieza_de_set | 94 | 0 | 0 | 94 |
| C | item_unico | 3 | 3 | 0 | 0 |
| C | monstruo_campo_de_batalla | 16 | 4 | 12 | 0 |
| C | retrato_codice | 11 | 0 | 0 | 11 |
| C | set_aura | 23 | 0 | 0 | 23 |
| C | set_skin | 23 | 0 | 0 | 23 |
| C | vfx_proc_item | 31 | 0 | 0 | 31 |
| D | abismo | 10 | 0 | 5 | 5 |
| D | ciudad_civil | 6 | 2 | 2 | 2 |
| D | ciudad_escenario | 10 | 7 | 3 | 0 |
| D | ciudad_forma_de_jefe | 2 | 1 | 1 | 0 |
| D | ciudad_vfx_arena | 5 | 0 | 4 | 1 |
| D | combate_decal | 4 | 1 | 3 | 0 |
| D | mecanica_de_arena | 11 | 1 | 9 | 1 |
| D | minas | 10 | 5 | 5 | 0 |
| D | portada_arena | 11 | 4 | 7 | 0 |
| D | prop_decorado | 47 | 0 | 22 | 25 |
| D | suelo | 8 | 0 | 4 | 4 |
| E | abismo | 2 | 0 | 1 | 1 |
| E | carta_cristales_coliseo | 8 | 0 | 2 | 6 |
| E | ciudad_ui_arena | 3 | 0 | 2 | 1 |
| E | combate_ui | 5 | 2 | 0 | 3 |
| E | icono_ui | 2 | 1 | 0 | 1 |
| E | icono_ui_ambiguo | 19 | 0 | 9 | 10 |
| E | ilustracion_codice | 17 | 0 | 5 | 12 |
| E | ilustracion_libro | 18 | 0 | 4 | 14 |
| E | marco_ui | 1 | 0 | 0 | 1 |
| E | minas | 1 | 0 | 1 | 0 |
| E | retrato_campeon | 1 | 0 | 0 | 1 |
| E | retrato_dialogo | 1 | 0 | 0 | 1 |

Cifras que conviene tener presentes (todas comprobadas, ver sección 3):

- **230 fichas de efectos de habilidad** (114 de la mitad A del roster + 116 de la mitad B; incluye 22+21 definitivas = 43 P0) + **43 objetos persistentes** + **35 formas de proyectil**: hoy **ninguno es un PNG**, todos se dibujan por código.
- **179 íconos de habilidad** de 16×16 (44 kits × 4 + 3 genéricos), de los cuales **10 son "motivos débiles"** que ya pidió rehacer un artista.
- **Enemigos**: el juego tiene **104 tipos × 11 estados = 1144 celdas de arte; 588 (≈51 %) las rellena el motor clonando o espejando** otra pose porque no hay dibujo propio. **7 enemigos usan el cuerpo de otro** y **51 assets** están en la lista de excepciones del gate de densidad.
- **16 monstruos de campo de batalla** con arte de ilustración de solo 4 cuadros, **11 portadas de arena** y **11 retratos de Códice** en JPG ilustración.
- **169 íconos de objeto** (143 diseñados + 26 siluetas base) sin ningún PNG (`assets/items/` no existe), más 23 auras, 23 skins de set (12 ya existen) y 31 VFX de proc.
- **34 props de decorado** + 13 incrustaciones de suelo dibujados por código, y **suelo procedural en 6 arenas** (bosque, hielo, laberinto, infernal, divina, acuática).
- **18 escenas del Libro de la Horda** procedurales, **17 ilustraciones de jefe del Códice** que no existen, **19 íconos de UI** de primera pasada ambiguos.

---

## 2. Formatos comunes (resumen; manda la especificación del PR #124)

| Tipo | Formato | Dónde está definido |
|---|---|---|
| Atlas de enemigo/jefe | PNG RGBA, **8 columnas**, celdas iguales de tamaño fijo por entidad, pies en la fila `anchor × alto` de la celda (≈0,93–0,97), perfil a la derecha, estados `idle`, `walk` (+ `walk_down`, `walk_up`), `atk`, `hit`, `death` y poses propias. Ejemplo medido: `cm_verdugo` = celdas 128×128, `refH` 95, 8 col. × 6 filas = 1024×768 | `js/assets/ciudad-meta.js` (clave `cm_verdugo`), `tools/art/pixrig/build.py`; ART_BIBLE §10 |
| Tira de FX motor A / decal motor B / sprite suelto | según el arte (nova 12, zone 8, cone 10, beam 8, burst 8, aura 8, rays 8, rings 10, column 10 cuadros), celda por *bucket* de diámetro | especificación §2.2.2 y §2.2.4 |
| Proyectil | 1–4 cuadros, punta a +x | especificación §2.3 |
| Prop de decorado | PNG con ancla abajo-centro (0,5 ; 0,98), alto en u | especificación §2.4.2; `js/rendering/battlefield-art.js` |
| Ícono de habilidad | 16×16, ≤ 6 colores, glifo en [1,14] con contorno | especificación §2.6.2 |
| Ícono de UI | 16×16, ≤ 6 colores de `PXI_PAL` | PR #118 (`js/ui/pixel-icons.js`) |
| Ícono de objeto | 64×64, sin marco ni texto | `LA_HORDA_ITEM_ASSET_MANIFEST.md` |
| Portada / ilustración de ficha | PNG pixel nativo (no JPG), ≤ 250 tonos | `docs/art-gate/PIXEL_DENSITY.md` |
| Suelo | tile sin costuras a 2,0 u/px, ≤ 250 tonos | ART_BIBLE §14 |

**Gramática de los efectos existentes**: los FX pintados que ya hay (hoja 03) tienen glow y alfa suave porque el Art Bible deja los VFX "libres" (§7); **los efectos nuevos para el motor horneado deben seguir el contrato de la especificación (alfa 0/255, sin glow pintado, tramado en vez de translucidez)**. Úsalos como referencia de forma y movimiento, no de alfa.

---

## 3. Hallazgos verificados que cambian el pedido

Antes de pintar conviene saber esto: varios documentos del repo están desactualizados y hay hechos que no estaban escritos en ningún lado.

### 3.1 Cobertura real de los enemigos (medida ejecutando el juego)

Se ejecutó `node tools/art/enemy_coverage.js` (servidor propio, puerto 8957): arma cada tipo de `ENEMY_BASE` con el código del juego y mide qué dibuja en cada uno de los 11 estados (arte real, espejo, **clon de otro estado**, forma procedural, vacío). Resultado: **104 tipos, 1144 celdas, 588 celdas rellenadas por clon/forma/sin-giro, 22 celdas "vacías" (los dos tiburones: falso positivo de la herramienta, ya corregido)**. Lo que más falta son las **vistas de frente y de espalda**:

| Estado | Tipos que lo rellenan (de 104) |
|---|---|
| idle | 61 |
| walk_R | 3 |
| walk_L | 10 |
| walk_D | 77 |
| walk_U | 79 |
| attack | 17 |
| attack_D | 87 |
| attack_U | 87 |
| hit | 44 |
| hit_D | 91 |
| death | 32 |

(`idle` aparece alto porque muchos atlas no tienen cuadros de reposo propios y reutilizan la caminata; es el faltante menos visible.)

### 3.2 Doce jefes se dibujan con una tira de ilustración, no con su atlas

`drawEnemyBody` llama primero a `battlefieldDrawMonster` (`js/rendering/entities.js:309`, `js/rendering/battlefield-art.js:17-22`). Para estos tipos devuelve una tira de **4 cuadros de 448×384** (reposo, caminar ×2, ataque): `golem_cuerpos, mn_titan, mn_cerbero, ab_carcelero, cm_maestro, cm_dama, cm_tramoyista, cm_presentador, minotauro, leviatan, dragon_forja, micelio` (+ 4 monstruos de la arena `convergencia`: `stone-dragon, king-colossus, thornbeast, scavenger`; `battlefieldMonsterKey`, `battlefield-art.js:8-14`). **Verificado ejecutando `enemy_coverage.js`**: la fuente de `idle`/`walk` de `mn_titan`, `cm_maestro` y `micelio` es `assets/sprites/battlefield/<id>.png`. Son los "retratos de campo de batalla": 14 de los 16 están en la lista de excepciones por **ILUSTRACION** (degradé de pintura; `scavenger` y `thornbeast` además `PIXEL_FINO`). Consecuencias:
- **No tienen golpe ni muerte propios** y solo una pose de ataque.
- **Ocho de los doce ya tienen un atlas a densidad canon en `assets/`** (pixrig: `cm_maestro`, `cm_dama`, `cm_tramoyista`, `cm_presentador`, `mn_titan`, `mn_cerbero`, `ab_carcelero`, `golem_cuerpos`) que el juego ignora mientras la tira gane. **[DECIDE EL DUEÑO]**: ¿retirar la tira (arregla el gate sin pintar nada) o rehacer? Las filas `C-BF-*` de esos ocho quedan en P1 a la espera de esa decisión; las cuatro con ambos arte grueso (`minotauro`, `leviatan`, `dragon_forja`, `micelio`) son P0.

### 3.3 Cuerpos prestados y tiburones invisibles

`js/data/body-swaps.js` pinta **7 enemigos con el cuerpo de otro recoloreado** (`tiburon_joven`←`esqueleto_h`, `tiburon_blanco`←`demonio_hielo_fuego`, `cangrejo_acorazado`←`arana`, `medusa_electrica`←`acechador`, `sirena_abisal`←`medusa`, `ab_jinete`←`jinete_sin_cabeza`, `esfinge`←`cu_sith`). En la prueba, **`tiburon_joven` y `tiburon_blanco` dibujaron 0 píxeles** en los 11 estados (era un bug de `tools/art/enemy_coverage.js`, corregido: parchaba `drawImage` pisando `arguments[0]` y los cuerpos prestados de recortes sueltos salían vacíos; el juego los dibuja bien, guarda `tools/art/check-tiburones.js`). Son P0.

### 3.4 Documentos de arte desactualizados (no copies sus listas a ciegas)

- `LA_HORDA_CITY_MISSING_ASSETS.md`: los personajes `CM-A01…A13` figuran como "PARCIAL", pero la medición muestra que `cm_saqueador`, `cm_raptor`, `cm_planidera`, `cm_acechante`, `cm_campanero` y `cm_espectro` solo rellenan `idle`. **Los personajes se toman de la medición (3.1), no de ese documento.** Sí se conservan sus filas de escenario, VFX y civiles (los civiles se verificaron en `js/assets/ciudad-meta.js`: no tienen sets de escondido/cargado/pánico/refugiado y `walk_down/up` reutilizan `walk`).
- `LA_HORDA_MINES_MISSING_ASSETS.md`: varias piezas ya llegaron (✅); aquí solo se listan las `FALTA / SUSTITUTO / PARCIAL`.
- `LA_HORDA_ITEM_ASSET_MANIFEST.md`: dice que no existe ninguna skin de set, pero **los 12 sets de campeón tienen carpeta de skin** (`assets/sprites/champions/<campeón>/skins/<set>/atlas.png`: baluarte, nocturno, convergencia, custodio, marea, sistema, profecia, errante, manada, granadero, requiem, legion). Y nombra a Eren (W1).
- `LA_HORDA_MISSING_ASSETS.md` **A-01 (Cerbero en alta resolución)** quedó superado: `mn_cerbero` tiene atlas pixrig a 1,05 u/px y además la tira de campo de batalla (3.2).
- Especificación del PR #124 §2.7: dice que ningún `.js` carga los retratos de `assets/ui/codex/minas/`; en realidad **se precargan** (`js/assets/minas-meta.js` → `js/arenas/minas/mn-render.js:20`), aunque no encontré dónde se dibujan.
- Las 20 rutas destino de `LA_HORDA_MISSING_ASSETS.md` (A-02…A-20) **no existen en el repo** (verificada la ruta principal de cada ficha, una por una; solo existe la carpeta `caballero/`, que contiene el atlas actual, no los archivos pedidos).

### 3.5 Lo procedural más extendido

- Suelo por código en **bosque, hielo, laberinto, infernal, divina y acuática** (`FLOOR_THEME`, `js/rendering/arena.js:13,25`); solo **abismo, ciudad y minas** tienen `tex_*.png` (hoja 06).
- **34 props** `aidArt*` y 13 incrustaciones `inlay-*` dibujadas con `fillRect` (`js/rendering/arena-props.js`).
- **18 escenas del Libro** (`BOOK_SCENES`) y las **cartas de Cristales/Coliseo** (CSS con degradé + glifo genérico).
- Todos los **marcos de UI** son CSS (no hay `border-image` en `css/*.css`: 0 coincidencias).
- El gate de densidad solo ve lo que ya está en `assets/`: **no mide FX ni íconos** (especificación §1.3 C4).

---

## 4. Categoría A · Efectos, proyectiles y props persistentes

Cantidad: **308 filas** (P0 43 · P1 169 · P2 96).

### 4.1 Efectos de habilidad y definitivas (230 fichas)

**Qué es**: cada habilidad de cada campeón (básico, H1–H3, definitiva, pasiva con indicador visible, y las 4 de la forma Coloso de Ilkan) se dibuja hoy 100 % por código con dos motores (`js/champions/skill-fx-a/` los 22 primeros campeones; `js/champions/vfx-b/` los 21 últimos). **Una habilidad es un conjunto de varias tiras** (nova + rays + rings + zona + cierre; en las definitivas además `column` y una nova oscura): la ficha de cada campeón lista todas las capas.
**Detalle exacto** (nombre, forma, color, cuadros por fase, tamaño en px, partículas, loop, "se distingue de…", mecánica con `archivo:línea`): `docs/art-brief/campeones/<campeón>.md` (ramas `origin/claude/briefs-habilidades-a` y `-b`; índices `INDEX_A.md` / `INDEX_B.md` con las colisiones de silueta y color a evitar).
**Formato**: especificación §2.2 (tres tiempos: anticipación → impacto → disipación; el borde exterior del arte = radio real; legible sola con alfa 0,8 y sin `rays/rings/column`; alfa 0/255).
**Prioridad**: definitiva P0 (43), H1–H3 y Coloso P1, básico y pasiva P2.
**Nombre/carpeta de entrega**: `art-source/entregas/2026-10_mundo/fx/<campeón>/<slot>_<slug>_<capa>_<W>x<H>_<N>f.png` con `<slot>` ∈ `basico, h1, h2, h3, ult, pasiva, coloso1…4`. Ejemplo exacto: `fx/aelith/h1_instante_roto_nova_80x12f.png` (especificación §7.3).
**Ejemplo de referencia (cómo se hace un FX pintado)**: `assets/vfx/skills/ventisca.png` (tira ancha en bucle), `assets/vfx/abilities/soulReapBurst_01.png`…`_05.png` (estallido por cuadros), `assets/vfx/abilities/scytheSlash_01.png`…`_04.png` (tajo), `assets/vfx/minas/cadena_tension_0.png`… (cadena), `assets/vfx/skins/manada/*` (skins con proyectil, lluvia y sello). Cada fila del JSON elige la más parecida según la forma. Plantilla vacía y tira procedural actual: `docs/art-brief/plantillas/fx_nova_80x12f_960x80_PLANTILLA.png`, `docs/art-brief/ejemplos/nova_time_80_PROCEDURAL_referencia.png`. Hoja de contacto: `ejemplos/mundo/03_fx_pintados_existentes.webp`.
**Dependencia técnica** (no es trabajo del pintor): hoy no hay forma de cargar un PNG en lugar del FX procedural (especificación §2.2.7, H1/H2). Se puede entregar igual (§6 de la especificación): Claude construye el hook y lo integra.

| Campeón | Motor | Fichas | Definitiva (P0) | Pieza principal de la definitiva (sugerida) | Ficha con TODAS las capas | Carpeta de entrega |
|---|---|---|---|---|---|---|
| aelith | A | 5 | La hora imposible | 232x232 px | `docs/art-brief/campeones/aelith.md` | `art-source/entregas/2026-10_mundo/fx/aelith/` |
| aurelia | A | 5 | Catedral del Sol | 232x232 px | `docs/art-brief/campeones/aurelia.md` | `art-source/entregas/2026-10_mundo/fx/aurelia/` |
| axiom | A | 5 | Force Quit | 232x232 px | `docs/art-brief/campeones/axiom.md` | `art-source/entregas/2026-10_mundo/fx/axiom/` |
| baltra | A | 5 | Que todos la escuchen | 192x192 px | `docs/art-brief/campeones/baltra.md` | `art-source/entregas/2026-10_mundo/fx/baltra/` |
| brakk | A | 5 | Demolición final | 240x240 px | `docs/art-brief/campeones/brakk.md` | `art-source/entregas/2026-10_mundo/fx/brakk/` |
| brasa | A | 5 | Turno de Emergencia | 96x96 px | `docs/art-brief/campeones/brasa.md` | `art-source/entregas/2026-10_mundo/fx/brasa/` |
| bront | A | 5 | Ciudadela | 232x232 px | `docs/art-brief/campeones/bront.md` | `art-source/entregas/2026-10_mundo/fx/bront/` |
| cazadora | A | 5 | Cacería Salvaje | 64x80 px | `docs/art-brief/campeones/cazadora.md` | `art-source/entregas/2026-10_mundo/fx/cazadora/` |
| dariel | A | 5 | Todavía hay una salida | 216x216 px | `docs/art-brief/campeones/dariel.md` | `art-source/entregas/2026-10_mundo/fx/dariel/` |
| eslabon | A | 5 | Nadie Queda Atrás | 192x192 px | `docs/art-brief/campeones/eslabon.md` | `art-source/entregas/2026-10_mundo/fx/eslabon/` |
| facu_gm | A | 5 | El Océano Reclama la Arena | 312x312 px | `docs/art-brief/campeones/facu_gm.md` | `art-source/entregas/2026-10_mundo/fx/facu_gm/` |
| farolero | A | 5 | Vigilia | 192x192 px | `docs/art-brief/campeones/farolero.md` | `art-source/entregas/2026-10_mundo/fx/farolero/` |
| guerrero | A | 5 | Pestilencia Sombría | 200x200 px | `docs/art-brief/campeones/guerrero.md` | `art-source/entregas/2026-10_mundo/fx/guerrero/` |
| ilkan | A | 5 | Coloso de Arena | 160x160 px | `docs/art-brief/campeones/ilkan.md` | `art-source/entregas/2026-10_mundo/fx/ilkan/` |
| ilkan_colossus | A | 4 | Los Tres Pasos | 280x280 px | `docs/art-brief/campeones/ilkan.md` | `art-source/entregas/2026-10_mundo/fx/ilkan_colossus/` |
| iria | A | 5 | Sello de los Tres Caminos | 216x216 px | `docs/art-brief/campeones/iria.md` | `art-source/entregas/2026-10_mundo/fx/iria/` |
| khepri | A | 5 | Eclipse de Escarabajos | 216x216 px | `docs/art-brief/campeones/khepri.md` | `art-source/entregas/2026-10_mundo/fx/khepri/` |
| libertador | A | 5 | Cruce de los Andes | 320x120 px | `docs/art-brief/campeones/libertador.md` | `art-source/entregas/2026-10_mundo/fx/libertador/` |
| mago | A | 5 | Cataclismo Elemental | 232x232 px | `docs/art-brief/campeones/mago.md` | `art-source/entregas/2026-10_mundo/fx/mago/` |
| maura | A | 5 | El bosque camina | 184x184 px | `docs/art-brief/campeones/maura.md` | `art-source/entregas/2026-10_mundo/fx/maura/` |
| morveth | A | 5 | Jardín de la peste | 224x224 px | `docs/art-brief/campeones/morveth.md` | `art-source/entregas/2026-10_mundo/fx/morveth/` |
| morwen | A | 5 | Alambique del Silencio | 232x232 px | `docs/art-brief/campeones/morwen.md` | `art-source/entregas/2026-10_mundo/fx/morwen/` |
| musashi | A | 5 | Último Duelo | 208x208 px | `docs/art-brief/campeones/musashi.md` | `art-source/entregas/2026-10_mundo/fx/musashi/` |
| myla | B | 6 | BERRINCHE | 180×180 px | `docs/art-brief/campeones/myla.md` | `art-source/entregas/2026-10_mundo/fx/myla/` |
| nahir | B | 5 | Galería de nadie | 100×100 px | `docs/art-brief/campeones/nahir.md` | `art-source/entregas/2026-10_mundo/fx/nahir/` |
| nano_gm | B | 6 | Juicio del GM | 440×440 px | `docs/art-brief/campeones/nano_gm.md` | `art-source/entregas/2026-10_mundo/fx/nano_gm/` |
| nigromante | B | 6 | Encarnación del Abismo | 90×90 px | `docs/art-brief/campeones/nigromante.md` | `art-source/entregas/2026-10_mundo/fx/nigromante/` |
| oriel | B | 6 | La Gran Cicatriz | 200×200 px | `docs/art-brief/campeones/oriel.md` | `art-source/entregas/2026-10_mundo/fx/oriel/` |
| orsa | B | 5 | Tormenta de rescate | 210×210 px | `docs/art-brief/campeones/orsa.md` | `art-source/entregas/2026-10_mundo/fx/orsa/` |
| profeta | B | 6 | Ascensión del Elegido | 90×160 px | `docs/art-brief/campeones/profeta.md` | `art-source/entregas/2026-10_mundo/fx/profeta/` |
| renko | B | 5 | Aquí siguen los nombres | 180×180 px | `docs/art-brief/campeones/renko.md` | `art-source/entregas/2026-10_mundo/fx/renko/` |
| saelis | B | 6 | Cielo de Plumas | 220×220 px | `docs/art-brief/campeones/saelis.md` | `art-source/entregas/2026-10_mundo/fx/saelis/` |
| segador | B | 5 | Segador de Almas | 150×150 px | `docs/art-brief/campeones/segador.md` | `art-source/entregas/2026-10_mundo/fx/segador/` |
| sira | B | 6 | Atlas de los ausentes | 80×80 px | `docs/art-brief/campeones/sira.md` | `art-source/entregas/2026-10_mundo/fx/sira/` |
| solciju | B | 5 | Gran Reserva | 160×160 px | `docs/art-brief/campeones/solciju.md` | `art-source/entregas/2026-10_mundo/fx/solciju/` |
| soporte | B | 5 | Bendición Suprema | 154×154 px | `docs/art-brief/campeones/soporte.md` | `art-source/entregas/2026-10_mundo/fx/soporte/` |
| tanque | B | 5 | Grito Provocador | 115×115 px | `docs/art-brief/campeones/tanque.md` | `art-source/entregas/2026-10_mundo/fx/tanque/` |
| tibor | B | 6 | El cielo zumba | 155×155 px | `docs/art-brief/campeones/tibor.md` | `art-source/entregas/2026-10_mundo/fx/tibor/` |
| velmira | B | 6 | El Gran Teatro | 260×260 px | `docs/art-brief/campeones/velmira.md` | `art-source/entregas/2026-10_mundo/fx/velmira/` |
| vesper | B | 5 | La última puntada | 155×155 px | `docs/art-brief/campeones/vesper.md` | `art-source/entregas/2026-10_mundo/fx/vesper/` |
| veyra | B | 5 | La última herida | 145×145 px | `docs/art-brief/campeones/veyra.md` | `art-source/entregas/2026-10_mundo/fx/veyra/` |
| vhal | B | 5 | Colapso | 120×120 px | `docs/art-brief/campeones/vhal.md` | `art-source/entregas/2026-10_mundo/fx/vhal/` |
| ynara | B | 6 | Santa Paciencia | 170×170 px | `docs/art-brief/campeones/ynara.md` | `art-source/entregas/2026-10_mundo/fx/ynara/` |
| zahra | B | 6 | Abrir todas las válvulas | 155×155 px | `docs/art-brief/campeones/zahra.md` | `art-source/entregas/2026-10_mundo/fx/zahra/` |

### 4.2 Proyectiles (35 formas)

Cada campeón que dispara tiene una forma propia dibujada con `drawProjStyle` (`js/systems/skill-evolution.js:168`). Contrato en especificación §2.3. Prueba existente: `node tools/quality/test-projectile-identity.js`.

| ID | Forma / campeón | P | Tamaño y formato | Entrega | Referencia |
|---|---|---|---|---|---|
| A-PROJ-arrow | "arrow" (cazadora) — Proyectil con identidad propia dibujado por drawProjStyle (js/systems/skill-evolution.js:1 | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/arrow_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-dagger | "dagger" (guerrero, musashi, ilkan) — Proyectil con identidad propia dibujado por drawProjStyle (js/systems/skill-evolution.js:1 | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/dagger_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-orb | "orb" (mago) — Proyectil con identidad propia dibujado por drawProjStyle (js/systems/skill-evolution.js:1 | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/orb_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-wisp | "wisp" (soporte) — Proyectil con identidad propia dibujado por drawProjStyle (js/systems/skill-evolution.js:1 | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/wisp_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-crescent | "crescent" (segador) — Proyectil con identidad propia dibujado por drawProjStyle (js/systems/skill-evolution.js:1 | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/crescent_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-glyph | "glyph" (axiom) — Proyectil con identidad propia dibujado por drawProjStyle (js/systems/skill-evolution.js:1 | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/glyph_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-rune | "rune" (profeta) — Proyectil con identidad propia dibujado por drawProjStyle (js/systems/skill-evolution.js:2 | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/rune_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-soul | "soul" (nigromante) — Proyectil con identidad propia dibujado por drawProjStyle (js/systems/skill-evolution.js:2 | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/soul_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-bullet | "bullet" (libertador) — Proyectil con identidad propia dibujado por drawProjStyle (js/systems/skill-evolution.js:2 | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/bullet_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-slug | "slug" (tanque) — Proyectil con identidad propia dibujado por drawProjStyle (js/systems/skill-evolution.js:2 | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/slug_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-vial | "vial" (Ynara, la Médica) — frasco de remedio con tapón | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/vial_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-spoon | "spoon" (Myla) — cuchara con un copo de yogur | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/spoon_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-nut | "nut" (Brasa, la Mecánica) — tuerca que gira, con chispas | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/nut_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-droplet | "droplet" (Morwen, la Destiladora) — gota de resina en tres capas (resina, sal, eco) | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/droplet_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-needle | "needle" (Iria, la Tejedora) — aguja que arrastra su hilo | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/needle_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-note | "note" (Dáriel, el Último Compás) — corchea que rebota al compás | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/note_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-bolt | "bolt" (Orsa, la Guardacables) — virote de ballesta con descarga | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/bolt_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-swarm | "swarm" (Tibor, el Rey sin Corona) — tres abejas que giran alrededor del tiro | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/swarm_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-steam | "steam" (Zahra, la Mano de la Válvula) — bocanada de calor con anillos | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/steam_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-compass | "compass" (Sira, la Cartógrafa) — aguja de brújula y la ruta punteada detrás | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/compass_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-officer | "officer" (San Martín, Disparo de Oficial) — bala grande dorada con anillo de pólvora | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/officer_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-arrow_heavy | "arrow_heavy" (Sylva, Flecha Perforante) — flecha larga, punta que brilla según la carga | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/arrow_heavy_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-bone_arrow | "bone_arrow" (esqueletos arqueros del Nigromante) — flecha de hueso con llama verde | P2 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/bone_arrow_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-halfmoon | "halfmoon" (Nano GM, el Regente del Umbral) — esfera partida en Luz y Oscuridad | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/halfmoon_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-wave | "wave" (Facu GM, el Soberano de las Mareas) — cresta de ola con espuma | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/wave_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-prism | "prism" (Aurelia, la Arquitecta Solar) — esquirla de luz sólida con rayo central | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/prism_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-scarab | "scarab" (Khepri, el Portador del Enjambre) — escarabajo con élitros abiertos | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/scarab_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-mask | "mask" (Velmira, la Reina de las Máscaras) — máscara de teatro que gira | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/mask_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-comet | "comet" (Vhal, el Astrónomo Caído) — estrella de cuatro puntas con cola de polvo | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/comet_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-fist | "fist" (Bront, la Fortaleza Viviente) — guantelete de piedra | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/fist_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-key | "key" (Oriel, la Portera de las Cicatrices) — llave antigua con una costura de luz | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/key_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-feather | "feather" (Saelis, la Heraldo del Plumaje) — pluma con raquis dorado que gira suave al volar | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/feather_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-wine_corkscrew | "wine_corkscrew" (Solciju) — espiral de vino alrededor de un sacacorchos | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/wine_corkscrew_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-plague_spore | "plague_spore" (Morveth) — cápsula orgánica con raíces y esporas satélite | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/plague_spore_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |
| A-PROJ-fractured_clock | "fractured_clock" (Aelith) — esfera rota, agujas y fragmento separado | P1 | 1–4 cuadros, punta a +x, alto ≈ r×2,6 u (10–21 px) | `art-source/entregas/2026-10_mundo/proyectiles/fractured_clock_<NN>.png` | `assets/vfx/skins/manada/arrow_0.png` |

### 4.3 Props persistentes de habilidad (muros, torretas, zonas, trampas) — 43

24 objetos del motor A (`SFA_OBJ`) y 19 del motor B (`kvbSkin`). Los dos con medidas fijas son el **muro de Brakk** (teja 16×13) y la **torreta de Brakk** (28×28, base y cañón separados). La hitbox y la vida son del objeto, no del arte.

| ID | Objeto | P | Tamaño y formato | Entrega | Referencia | Fuente |
|---|---|---|---|---|---|---|
| A-PROP-sfa-ael_echo | Objeto persistente "ael_echo" (aelith, tema time) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema time. | `art-source/entregas/2026-10_mundo/props/aelith/ael_echo_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/aelith.js:3` |
| A-PROP-sfa-ael_hour | Objeto persistente "ael_hour" (aelith, tema time) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema time. | `art-source/entregas/2026-10_mundo/props/aelith/ael_hour_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/aelith.js:4` |
| A-PROP-sfa-as_cathedral | Objeto persistente "as_cathedral" (aurelia, tema prism) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema prism. | `art-source/entregas/2026-10_mundo/props/aurelia/as_cathedral_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/aurelia.js:3` |
| A-PROP-sfa-ex_toll | Objeto persistente "ex_toll" (baltra, tema bell) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema bell. | `art-source/entregas/2026-10_mundo/props/baltra/ex_toll_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/baltra.js:3` |
| A-PROP-sfa-brk_wall | Objeto persistente "brk_wall" (brakk, tema siege) | P1 | Teja repetible 16×13 px (hileras desfasadas, luz arriba-izquierda, sombra abajo), se estira a 28 u de alto y 34,5 u de largo por teja; más 1 tira de escombros de 6–8 cuadros (burst r=52). | `art-source/entregas/2026-10_mundo/props/brakk/brk_wall_<parte>.png` | `assets/vfx/minas/andamio_0.png` | `js/champions/skill-fx-a/c/brakk.js:3` |
| A-PROP-sfa-brk_turret | Objeto persistente "brk_turret" (brakk, tema siege) | P1 | Lienzo 28×28: base fija 22×11 en (3,16) + torreta/cañón 20×10 en (8,7) como pieza SEPARADA (gira hacia el enemigo; cañón apunta a +x), escala 2,3; más pulso de disparo (burst r=28). | `art-source/entregas/2026-10_mundo/props/brakk/brk_turret_<parte>.png` | `assets/sprites/battlefield/tower-amber.png` | `js/champions/skill-fx-a/c/brakk.js:4` |
| A-PROP-sfa-steam | Objeto persistente "steam" (brasa, tema steam) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema steam. | `art-source/entregas/2026-10_mundo/props/brasa/steam_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/brasa.js:3` |
| A-PROP-sfa-as_keep | Objeto persistente "as_keep" (bront, tema crystal) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema crystal. | `art-source/entregas/2026-10_mundo/props/bront/as_keep_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/bront.js:3` |
| A-PROP-sfa-as_wall | Objeto persistente "as_wall" (bront, tema crystal) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst" + motivo propio de 3–9 px; tema crystal. | `art-source/entregas/2026-10_mundo/props/bront/as_wall_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/bront.js:4` |
| A-PROP-sfa-ex_concert | Objeto persistente "ex_concert" (dariel, tema music) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema music. | `art-source/entregas/2026-10_mundo/props/dariel/ex_concert_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/dariel.js:3` |
| A-PROP-sfa-chain | Objeto persistente "chain" (eslabon, tema chain) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst" + motivo propio de 3–9 px; tema chain. | `art-source/entregas/2026-10_mundo/props/eslabon/chain_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/eslabon.js:3` |
| A-PROP-sfa-as_current | Objeto persistente "as_current" (facu_gm, tema tide) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst" + motivo propio de 3–9 px; tema tide. | `art-source/entregas/2026-10_mundo/props/facu_gm/as_current_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/facu_gm.js:3` |
| A-PROP-sfa-as_ocean | Objeto persistente "as_ocean" (facu_gm, tema tide) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema tide. | `art-source/entregas/2026-10_mundo/props/facu_gm/as_ocean_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/facu_gm.js:4` |
| A-PROP-sfa-lantern | Objeto persistente "lantern" (farolero, tema lantern) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst" + motivo propio de 3–9 px; tema lantern. | `art-source/entregas/2026-10_mundo/props/farolero/lantern_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/farolero.js:3` |
| A-PROP-sfa-path | Objeto persistente "path" (farolero, tema lantern) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst" + motivo propio de 3–9 px; tema lantern. | `art-source/entregas/2026-10_mundo/props/farolero/path_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/farolero.js:4` |
| A-PROP-sfa-anchor | Objeto persistente "anchor" (iria, tema thread) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst" + motivo propio de 3–9 px; tema thread. | `art-source/entregas/2026-10_mundo/props/iria/anchor_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/iria.js:3` |
| A-PROP-sfa-triangle | Objeto persistente "triangle" (iria, tema thread) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst" + motivo propio de 3–9 px; tema thread. | `art-source/entregas/2026-10_mundo/props/iria/triangle_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/iria.js:4` |
| A-PROP-sfa-as_eclipse | Objeto persistente "as_eclipse" (khepri, tema scarab) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema scarab. | `art-source/entregas/2026-10_mundo/props/khepri/as_eclipse_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/khepri.js:3` |
| A-PROP-sfa-ex_thorns | Objeto persistente "ex_thorns" (maura, tema thorn) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema thorn. | `art-source/entregas/2026-10_mundo/props/maura/ex_thorns_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/maura.js:3` |
| A-PROP-sfa-ex_bark | Objeto persistente "ex_bark" (maura, tema thorn) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema thorn. | `art-source/entregas/2026-10_mundo/props/maura/ex_bark_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/maura.js:4` |
| A-PROP-sfa-ex_forest | Objeto persistente "ex_forest" (maura, tema thorn) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema thorn. | `art-source/entregas/2026-10_mundo/props/maura/ex_forest_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/maura.js:5` |
| A-PROP-sfa-mor_mushroom | Objeto persistente "mor_mushroom" (morveth, tema plague) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst" + motivo propio de 3–9 px; tema plague. | `art-source/entregas/2026-10_mundo/props/morveth/mor_mushroom_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/morveth.js:3` |
| A-PROP-sfa-mor_garden | Objeto persistente "mor_garden" (morveth, tema plague) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst"; tema plague. | `art-source/entregas/2026-10_mundo/props/morveth/mor_garden_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/morveth.js:4` |
| A-PROP-sfa-alembic | Objeto persistente "alembic" (morwen, tema alchemy) | P2 | Zona persistente "zone": 8 cuadros S×S en bucle (S por bucket §2.2.2, borde exterior = radio) + cierre "nova/burst" + motivo propio de 3–9 px; tema alchemy. | `art-source/entregas/2026-10_mundo/props/morwen/alembic_<parte>.png` | `assets/vfx/skills/ventisca.png` | `js/champions/skill-fx-a/c/morwen.js:3` |
| A-PROP-kvb-myla-yogurt | Objeto persistente "yogurt" (myla, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/myla/yogurt_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/myla.js:15` |
| A-PROP-kvb-myla-tantrum | Objeto persistente "tantrum" (myla, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/myla/tantrum_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/myla.js:18` |
| A-PROP-kvb-nahir-ex_reflection | Objeto persistente "ex_reflection" (nahir, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/nahir/ex_reflection_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/nahir.js:58` |
| A-PROP-kvb-orsa-ex_storm | Objeto persistente "ex_storm" (orsa, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/orsa/ex_storm_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/orsa.js:44` |
| A-PROP-kvb-renko-ex_soil | Objeto persistente "ex_soil" (renko, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/renko/ex_soil_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/renko.js:65` |
| A-PROP-kvb-renko-ex_mound | Objeto persistente "ex_mound" (renko, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/renko/ex_mound_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/renko.js:67` |
| A-PROP-kvb-renko-ex_faults | Objeto persistente "ex_faults" (renko, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/renko/ex_faults_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/renko.js:68` |
| A-PROP-kvb-sira-ex_atlas | Objeto persistente "ex_atlas" (sira, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/sira/ex_atlas_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/sira.js:48` |
| A-PROP-kvb-solciju-sol_cask | Objeto persistente "sol_cask" (solciju, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/solciju/sol_cask_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/solciju.js:31` |
| A-PROP-kvb-solciju-sol_reserve | Objeto persistente "sol_reserve" (solciju, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/solciju/sol_reserve_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/solciju.js:40` |
| A-PROP-kvb-solciju-sol_lees | Objeto persistente "sol_lees" (solciju, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/solciju/sol_lees_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/solciju.js:43` |
| A-PROP-kvb-tibor-ex_swarm | Objeto persistente "ex_swarm" (tibor, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/tibor/ex_swarm_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/tibor.js:40` |
| A-PROP-kvb-vesper-ex_line | Objeto persistente "ex_line" (vesper, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/vesper/ex_line_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/vesper.js:54` |
| A-PROP-kvb-vesper-ex_stitch | Objeto persistente "ex_stitch" (vesper, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/vesper/ex_stitch_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/vesper.js:59` |
| A-PROP-kvb-ynara-stroganoff | Objeto persistente "stroganoff" (ynara, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/ynara/stroganoff_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/ynara.js:30` |
| A-PROP-kvb-ynara-watercurtain | Objeto persistente "watercurtain" (ynara, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/ynara/watercurtain_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/ynara.js:37` |
| A-PROP-kvb-ynara-patience | Objeto persistente "patience" (ynara, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/ynara/patience_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/ynara.js:43` |
| A-PROP-kvb-zahra-ex_line | Objeto persistente "ex_line" (zahra, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/zahra/ex_line_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/zahra.js:51` |
| A-PROP-kvb-zahra-ex_vent | Objeto persistente "ex_vent" (zahra, motor B) | P2 | Decal en bucle N cuadros S×S (S múltiplo de 4, 24–128 px, ≈4,4 u/px; borde exterior = radio) + motivos sueltos con contorno. | `art-source/entregas/2026-10_mundo/props/zahra/ex_vent_<parte>.png` | `assets/vfx/skins/manada/sigil_0.png` | `js/champions/vfx-b/zahra.js:55` |

---

## 5. Categoría B · Íconos de habilidad 16×16

Cantidad: **179 filas** (P0 10 · P1 41 · P2 128). Hoy son motivos ASCII de 12×12 dibujados por código (PR #119, abierto) sobre una grilla de 16×16 con marco por categoría. **Contrato** (especificación §2.6.2): PNG 16×16, glifo en x,y∈[1,14] con contorno de 1 px `#0b0f18`, 4–6 colores en roles tonales (medio/luz/sombra + 1 acento; el cuerpo toma el color de la ranura: `#8fe0ff` H1, `#cfc2ff` H2, `#97f0cc` H3, `#ffe9a8` definitiva), alfa 0/255, **marco lo pone el juego** (básico cuadrado cobre `#e0924f`; habilidad esquinas cortadas acero `#9fb4cc`; definitiva cuadrado con tachones oro `#ffd35a`), distinto del resto de su kit (< 85 % de píxeles iguales; dos definitivas no pueden parecerse > 85 %), legible a 32 px. Se entrega además la **hoja 14×14 sin marco** para convertirla a las letras del motor.
**Nombre**: `iconos/habilidades/<campeón>_<ranura>.png` con `_0` = Hab. 1, `_1` = Hab. 2, `_2` = Hab. 3, `_u` = definitiva (ej. `iconos/habilidades/aelith_0.png`; Coloso de Ilkan: `ilkan_colossus_0…_u`). Destino en el juego **[PROPUESTA]** `assets/ui/skill-icons16/`.
**Ejemplo de referencia**: `assets/ui/skill-icons/torbellino.png` (único estilo pintado en `main`, 6 íconos sueltos), la plantilla `docs/art-brief/plantillas/icono_16x16_ampliado_x16_PLANTILLA.png` y la hoja `ejemplos/mundo/04_iconos_habilidad_actuales.webp` (los 176 motivos actuales, marcados los débiles).
**Validación**: `node tools/art/check-skill-icons.js` (solo existe en la rama del PR #119), `node tools/ux/test-skill-glyphs.js`.

### 5.1 Motivos débiles (P0, 10)

Los siete que pidió rehacer el PR #119 (afterimage, arrowrain, snare, millcuts, threesteps, stock, implode "X") más los que sumó el dueño (avalanche, footprint, meteor). **Rehacer el concepto**: el motivo no se entiende, no es solo un problema de dibujo.

| ID | Habilidad | Motivo ASCII actual | Entrega |
|---|---|---|---|
| B-ICON-mago-ult | mago · Definitiva · Cataclismo Elemental | meteor | `art-source/entregas/2026-10_mundo/iconos/habilidades/mago_u.png` |
| B-ICON-musashi-h2 | musashi · Hab. 2 · Paso Fantasma | afterimage | `art-source/entregas/2026-10_mundo/iconos/habilidades/musashi_1.png` |
| B-ICON-musashi-h3 | musashi · Hab. 3 · Mil Cortes | millcuts | `art-source/entregas/2026-10_mundo/iconos/habilidades/musashi_2.png` |
| B-ICON-cazadora-h2 | cazadora · Hab. 2 · Trampa del Bosque | snare | `art-source/entregas/2026-10_mundo/iconos/habilidades/cazadora_1.png` |
| B-ICON-cazadora-h3 | cazadora · Hab. 3 · Lluvia de la Cazadora | arrowrain | `art-source/entregas/2026-10_mundo/iconos/habilidades/cazadora_2.png` |
| B-ICON-ilkan_colossus-h1 | ilkan_colossus · Hab. 1 · (ver ficha) | avalanche | `art-source/entregas/2026-10_mundo/iconos/habilidades/ilkan_colossus_0.png` |
| B-ICON-ilkan_colossus-h3 | ilkan_colossus · Hab. 3 · (ver ficha) | footprint | `art-source/entregas/2026-10_mundo/iconos/habilidades/ilkan_colossus_2.png` |
| B-ICON-ilkan_colossus-ult | ilkan_colossus · Definitiva · (ver ficha) | threesteps | `art-source/entregas/2026-10_mundo/iconos/habilidades/ilkan_colossus_u.png` |
| B-ICON-orsa-h2 | orsa · Hab. 2 · Apoyar la culata | stock | `art-source/entregas/2026-10_mundo/iconos/habilidades/orsa_1.png` |
| B-ICON-vhal-ult | vhal · Definitiva · Colapso | implode | `art-source/entregas/2026-10_mundo/iconos/habilidades/vhal_u.png` |

Dudosos que observé al revisar la hoja 04 (criterio visual propio, no medido; P2 salvo que el dueño los suba): `ilkan:u sandgiant` (se lee como campana), `libertador:u mountain` (se lee como sol), `tanque:u horn` (mancha), `libertador:2 horse` (se lee como anillo), `segador:1 chestplate` (se lee como copa).

### 5.2 Los 176 íconos (motivo actual; en **negrita** los P0)

| Kit | _0 (Hab. 1) | _1 (Hab. 2) | _2 (Hab. 3) | _u (Definitiva) | Entrega (dentro de la carpeta del lote) |
|---|---|---|---|---|---|
| tanque | tornado | shieldrush | raisedfist | horn | `iconos/habilidades/tanque_{0,1,2,u}.png` |
| guerrero | dagger | triple | beartrap | plaguemask | `iconos/habilidades/guerrero_{0,1,2,u}.png` |
| mago | flamewall | frost | chainbolt | **meteor** | `iconos/habilidades/mago_{0,1,2,u}.png` |
| soporte | sun | sword | shield | crown | `iconos/habilidades/soporte_{0,1,2,u}.png` |
| segador | scythe | chestplate | tombstone | reaper | `iconos/habilidades/segador_{0,1,2,u}.png` |
| axiom | glitch | cursor | portal | power | `iconos/habilidades/axiom_{0,1,2,u}.png` |
| profeta | ankh | eye | moon | wings | `iconos/habilidades/profeta_{0,1,2,u}.png` |
| musashi | katana | **afterimage** | **millcuts** | swords | `iconos/habilidades/musashi_{0,1,2,u}.png` |
| cazadora | arrow | **snare** | **arrowrain** | wolfhead | `iconos/habilidades/cazadora_{0,1,2,u}.png` |
| nigromante | wisp | golem | plaguecloud | demon | `iconos/habilidades/nigromante_{0,1,2,u}.png` |
| libertador | rifle | grenade | horse | mountain | `iconos/habilidades/libertador_{0,1,2,u}.png` |
| ilkan | banner | dunes | compass | sandgiant | `iconos/habilidades/ilkan_{0,1,2,u}.png` |
| ilkan_colossus | **avalanche** | sinkhole | **footprint** | **threesteps** | `iconos/habilidades/ilkan_colossus_{0,1,2,u}.png` |
| ynara | glare | bowl | stophand | pray | `iconos/habilidades/ynara_{0,1,2,u}.png` |
| myla | yogurtower | splat | bubble | tantrum | `iconos/habilidades/myla_{0,1,2,u}.png` |
| brasa | turret | steam | wrench | siren | `iconos/habilidades/brasa_{0,1,2,u}.png` |
| eslabon | hook | barrier | padlock | chainlinks | `iconos/habilidades/eslabon_{0,1,2,u}.png` |
| morwen | drop | saltcrystal | flask | alembic | `iconos/habilidades/morwen_{0,1,2,u}.png` |
| farolero | lantern | flash | steppingstone | candle | `iconos/habilidades/farolero_{0,1,2,u}.png` |
| iria | anchor | taut | scissors | triskele | `iconos/habilidades/iria_{0,1,2,u}.png` |
| vesper | needle | sew | frayed | spool | `iconos/habilidades/vesper_{0,1,2,u}.png` |
| nahir | shards | mirror | crosscut | gallery | `iconos/habilidades/nahir_{0,1,2,u}.png` |
| baltra | anvil | dome | clapper | ringing | `iconos/habilidades/baltra_{0,1,2,u}.png` |
| maura | roots | logshield | shears | walktree | `iconos/habilidades/maura_{0,1,2,u}.png` |
| dariel | note | drum | repeatsign | trumpet | `iconos/habilidades/dariel_{0,1,2,u}.png` |
| orsa | rod | **stock** | circuit | stormcloud | `iconos/habilidades/orsa_{0,1,2,u}.png` |
| tibor | beecloud | hive | flower | bee | `iconos/habilidades/tibor_{0,1,2,u}.png` |
| zahra | furnace | snowflame | ashstep | valve | `iconos/habilidades/zahra_{0,1,2,u}.png` |
| renko | furrow | mound | shovel | stele | `iconos/habilidades/renko_{0,1,2,u}.png` |
| sira | quill | backtrack | eraser | compassrose | `iconos/habilidades/sira_{0,1,2,u}.png` |
| nano_gm | gavel | scroll | invert | scales | `iconos/habilidades/nano_gm_{0,1,2,u}.png` |
| facu_gm | riptide | pressure | wave | whirlpool | `iconos/habilidades/facu_gm_{0,1,2,u}.png` |
| aurelia | prism | refract | lightstep | rosewindow | `iconos/habilidades/aurelia_{0,1,2,u}.png` |
| khepri | locusts | carapace | elytra | scarab | `iconos/habilidades/khepri_{0,1,2,u}.png` |
| velmira | mask | masks | twoface | curtain | `iconos/habilidades/velmira_{0,1,2,u}.png` |
| vhal | shootingstar | gravwell | orbit | **implode** | `iconos/habilidades/vhal_{0,1,2,u}.png` |
| bront | plate | platewall | pulsecrystal | citadel | `iconos/habilidades/bront_{0,1,2,u}.png` |
| oriel | tear | echo | worldstep | scar | `iconos/habilidades/oriel_{0,1,2,u}.png` |
| saelis | fan | updraft | feather | featherstorm | `iconos/habilidades/saelis_{0,1,2,u}.png` |
| solciju | goblet | cask | toast | bottle | `iconos/habilidades/solciju_{0,1,2,u}.png` |
| veyra | wound | slip | pact | stabbedheart | `iconos/habilidades/veyra_{0,1,2,u}.png` |
| brakk | siegewall | nails | brace | wreckball | `iconos/habilidades/brakk_{0,1,2,u}.png` |
| morveth | sprout | sporecloud | mushroom | rotflower | `iconos/habilidades/morveth_{0,1,2,u}.png` |
| aelith | brokenclock | splitseconds | pocketwatch | hourglass | `iconos/habilidades/aelith_{0,1,2,u}.png` |

Los íconos genéricos `Ataque básico`, `Cura` y `Pacto` (3) figuran en el JSON (`B-ICON-generico-*`).

---

## 6. Categoría C · Enemigos, jefes, objetos y sets

Cantidad: **372 filas** (P0 35 · P1 115 · P2 222).

### 6.1 Enemigos, élites y subjefes (91 tipos; los 12 de campo de batalla van en 6.2 y `angel_corrompido` en 6.4)

**Formato de entrega**: hoja completa por tipo (atlas PNG RGBA, 8 columnas, celdas iguales, pies alineados, perfil a la derecha, contorno 1 px, alfa 0/255) con idle 4, walk de perfil 4–6, **walk de frente y de espalda** 4–6 c/u, ataque de perfil/frente/espalda 3–4, golpe 2, muerte 4–6 y las poses de habilidad propias del tipo. Carpeta: `art-source/entregas/2026-10_mundo/enemigos/<arena>/<tipo>/atlas.png`. El nombre técnico es el del tipo (`ENEMY_BASE`), igual que el asset que reemplaza (ART_BIBLE §10); Claude lo registra (los enemigos se cargan con un `*-meta.js` por arena o `enemyAtlasPackLoad`).
**Prioridad** (regla): P0 = cuerpo prestado, estados vacíos, o excepción PIXEL_GRUESO/ILUSTRACION del gate; P1 = ≥ 7 estados clonados, o jefe/subjefe/élite con ≥ 5; P2 = el resto (solo vistas de frente/espalda y golpe).
**Ejemplos de referencia** (elegidos por parecido de anatomía y rango; la fila indica el más cercano): `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` (humanoide a 0,99 u/px, **el modelo a seguir**: hecho con `tools/art/pixrig/` a resolución nativa, y es lo que pide el propio gate para los de pixel grueso), `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png` (humanoide pintado a 1,28), `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png` (bestia), `assets/sprites/arenas/abismo/ab_errante/atlas.png` (criatura), `assets/sprites/enemies/bosque/enjambre_hadas/v3/atlas.png` (enjambre pequeño), `assets/sprites/enemies/laberinto/escorpion_gigante/walk-strip.png` (artrópodo), `assets/sprites/bosses/hielo/mago_hielo_cristal/v2/atlas.png` y `assets/sprites/arenas/minas/mn_titan/atlas.png` (jefes). Hoja `ejemplos/mundo/01_enemigos.webp`.
**Validación**: `python3 tools/art/scan_sprites.py --dir <enemies|bosses|arenas>/<carpeta>/<tipo>` y, con el atlas instalado por Claude, `node tools/art/enemy_coverage.js <salida> <tipo>` (los 11 estados deben salir `real`, no `clon`) y `node tools/art/pixel-density.js --group enemigos,jefes`.

**P0**

| Tipo | Nombre · rango | Estados rellenados por el motor | Objetivo de tamaño/densidad | Entrega | Referencia | Estado | Notas |
|---|---|---|---|---|---|---|---|
| demonio_menor | Demonio Menor · subelite | 4 de 11 (idle, hit, hit_D, death). | Rehacer a pixel art con contorno 1 px y 2–3 tonos por color (no degradé); resolución nativa ≈1,0 u/px. | `art-source/entregas/2026-10_mundo/enemigos/infernal/demonio_menor/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | rehacer | excepción ILUSTRACION en docs/art-gate/pixel-density-exceptions.json; upx medido 0.79 |
| golem | Gólem · elite | 7 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit, hit_D). | Rehacer a pixel art con contorno 1 px y 2–3 tonos por color (no degradé); resolución nativa ≈1,0 u/px. | `art-source/entregas/2026-10_mundo/enemigos/infernal/golem/atlas.png` | `assets/sprites/arenas/minas/mn_titan/atlas.png` | rehacer | excepción ILUSTRACION en docs/art-gate/pixel-density-exceptions.json |
| demonio_mago | Demonio Hechicero · elite | 4 de 11 (idle, hit, hit_D, death). | Rehacer a pixel art con contorno 1 px y 2–3 tonos por color (no degradé); resolución nativa ≈1,0 u/px. | `art-source/entregas/2026-10_mundo/enemigos/infernal/demonio_mago/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | rehacer | excepción ILUSTRACION en docs/art-gate/pixel-density-exceptions.json; upx medido 0.86 |
| demonio_mayor | Demonio Mayor · jefe | 4 de 11 (idle, hit, hit_D, death). | Rehacer a pixel art con contorno 1 px y 2–3 tonos por color (no degradé); resolución nativa ≈1,0 u/px. | `art-source/entregas/2026-10_mundo/enemigos/infernal/demonio_mayor/atlas.png` | `assets/sprites/arenas/minas/mn_titan/atlas.png` | rehacer | excepción ILUSTRACION en docs/art-gate/pixel-density-exceptions.json; upx medido 2.14 |
| dama_bosque | Dama del Bosque · elite | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Rehacer a pixel art con contorno 1 px y 2–3 tonos por color (no degradé); resolución nativa ≈1,0 u/px. | `art-source/entregas/2026-10_mundo/enemigos/bosque/dama_bosque/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | rehacer | excepción ILUSTRACION en docs/art-gate/pixel-density-exceptions.json |
| jinete_sin_cabeza | Jinete Sin Cabeza · jefe | 7 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit, hit_D). | Rehacer a pixel art con contorno 1 px y 2–3 tonos por color (no degradé); resolución nativa ≈1,0 u/px. | `art-source/entregas/2026-10_mundo/enemigos/bosque/jinete_sin_cabeza/atlas.png` | `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png` | rehacer | excepción ILUSTRACION en docs/art-gate/pixel-density-exceptions.json |
| esfinge | Esfinge · elite | 6 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/laberinto/esfinge/atlas.png` | `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png` | prestado | CUERPO PRESTADO de "cu_sith" (js/data/body-swaps.js, ficha P1-01 de docs/ART_COMMISSION_BRIEF.md) |
| tiburon_joven | Ahogado de las Ruinas · normal | 11 de 11 (idle, walk_R, walk_L, walk_D, walk_U, attack, attack_D, attack_U, hit, hit_D, death). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/acuatica/tiburon_joven/atlas.png` | `assets/sprites/enemies/acuatica/anguila_electrica/idle_01.png` | prestado | CUERPO PRESTADO de "esqueleto_h" (js/data/body-swaps.js, ficha P0-05 de docs/ART_COMMISSION_BRIEF.md); la prueba daba 0 píxeles por un bug de la herramienta `enemy_coverage.js` (ya corregido; el juego los dibujaba bien, ver `tools/art/check-tiburones.js`). Los PNG de tiburón real (`assets/sprites/enemies/acuatica/tiburon_*/`, 1-2 poses chicas) quedan sin uso porque el préstamo tiene prioridad; `?bodyswap=0` los muestra |
| medusa_electrica | Medusa Eléctrica · normal | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/acuatica/medusa_electrica/atlas.png` | `assets/sprites/enemies/laberinto/medusa/walk-strip.png` | prestado | CUERPO PRESTADO de "acechador" (js/data/body-swaps.js, ficha P0-08 de docs/ART_COMMISSION_BRIEF.md) |
| cangrejo_acorazado | Cangrejo Araña · normal | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/acuatica/cangrejo_acorazado/atlas.png` | `assets/sprites/enemies/laberinto/escorpion_gigante/walk-strip.png` | prestado | CUERPO PRESTADO de "arana" (js/data/body-swaps.js, ficha P0-07 de docs/ART_COMMISSION_BRIEF.md) |
| sirena_abisal | Sirena Abisal · normal | 5 de 11 (idle, attack_D, attack_U, hit_D, death). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/acuatica/sirena_abisal/atlas.png` | `assets/sprites/enemies/laberinto/medusa/walk-strip.png` | prestado | CUERPO PRESTADO de "medusa" (js/data/body-swaps.js, ficha P0-09 de docs/ART_COMMISSION_BRIEF.md) |
| tiburon_blanco | Tritón de las Fosas · elite | 11 de 11 (idle, walk_R, walk_L, walk_D, walk_U, attack, attack_D, attack_U, hit, hit_D, death). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/acuatica/tiburon_blanco/atlas.png` | `assets/sprites/enemies/acuatica/anguila_electrica/idle_01.png` | prestado | CUERPO PRESTADO de "demonio_hielo_fuego" (js/data/body-swaps.js, ficha P0-06 de docs/ART_COMMISSION_BRIEF.md); la prueba daba 0 píxeles por un bug de la herramienta `enemy_coverage.js` (ya corregido; el juego los dibujaba bien, ver `tools/art/check-tiburones.js`). Los PNG de tiburón real (`assets/sprites/enemies/acuatica/tiburon_*/`, 1-2 poses chicas) quedan sin uso porque el préstamo tiene prioridad; `?bodyswap=0` los muestra |
| ab_jinete | Jinete Sin Cabeza · elite | 7 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/abismo/ab_jinete/atlas.png` | `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png` | prestado | CUERPO PRESTADO de "jinete_sin_cabeza" (js/data/body-swaps.js, ficha P0-10 de docs/ART_COMMISSION_BRIEF.md) |
| cm_perro | Perro del Albañal · normal | 3 de 11 (idle, attack_D, attack_U). | Celda actual 37×29 (refH 16 px, 2.59 u/px): rehacer a ≈96×72 (refH ≈41 px) para llegar a ≈1,0 u/px. | `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_perro/atlas.png` | `assets/sprites/arenas/micelial/sabueso/atlas.png` | rehacer | excepción PIXEL_GRUESO en docs/art-gate/pixel-density-exceptions.json |
| cm_acechante | Acechante de los Tejados · subelite | 1 de 11 (idle). | Celda actual 30×41 (refH 21 px, 2.67 u/px): rehacer a ≈80×112 (refH ≈56 px) para llegar a ≈1,0 u/px. | `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_acechante/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | rehacer | excepción PIXEL_GRUESO en docs/art-gate/pixel-density-exceptions.json |
| cm_campanero | Campanero · elite | 1 de 11 (idle). | Celda actual 45×41 (refH 31 px, 2.95 u/px): rehacer a ≈136×120 (refH ≈91 px) para llegar a ≈1,0 u/px. | `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_campanero/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | rehacer | excepción PIXEL_GRUESO en docs/art-gate/pixel-density-exceptions.json |
| mn_devoraluz | Devoraluz · elite | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Celda actual 68×49 (refH 44 px, 2.63 u/px): rehacer a ≈176×128 (refH ≈116 px) para llegar a ≈1,0 u/px. | `art-source/entregas/2026-10_mundo/enemigos/minas/mn_devoraluz/atlas.png` | `assets/sprites/arenas/minas/mn_titan/atlas.png` | rehacer | excepción PIXEL_GRUESO en docs/art-gate/pixel-density-exceptions.json |

**P1**

| Tipo | Nombre · rango | Estados rellenados por el motor | Objetivo de tamaño/densidad | Entrega | Referencia | Estado | Notas |
|---|---|---|---|---|---|---|---|
| hada_escarcha | Hada de Escarcha · normal | 8 de 11 (idle, walk_D, walk_U, attack, attack_D, attack_U, hit, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/hielo/hada_escarcha/atlas.png` | `assets/sprites/enemies/bosque/enjambre_hadas/v3/atlas.png` | completar |  |
| demonio_hielo_fuego | Demonio de Hielo y Fuego · elite | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/hielo/demonio_hielo_fuego/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | completar |  |
| dragon_hielo | Tundraverx, Soberano de Hielo · elite | 7 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/hielo/dragon_hielo/atlas.png` | `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png` | completar |  |
| mago_hielo_cristal | El Mago Gélido · jefe | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/hielo/mago_hielo_cristal/atlas.png` | `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png` | completar |  |
| angel_caido_hielo | Ángel Caído de Hielo · jefe | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/hielo/angel_caido_hielo/atlas.png` | `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png` | completar |  |
| enjambre_hadas | Enjambre de Hadas · normal | 8 de 11 (idle, walk_D, walk_U, attack, attack_D, attack_U, hit, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/bosque/enjambre_hadas/atlas.png` | `assets/sprites/enemies/bosque/enjambre_hadas/v3/atlas.png` | completar |  |
| bestia_bosque | Bestia del Bosque · subelite | 8 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit, hit_D, death). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/bosque/bestia_bosque/atlas.png` | `assets/sprites/arenas/micelial/sabueso/atlas.png` | completar | se dibuja con la tira de campo de batalla |
| cu_sith | Cù-Sìth · elite | 6 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/bosque/cu_sith/atlas.png` | `assets/sprites/arenas/micelial/sabueso/atlas.png` | completar |  |
| ent | Ent · elite | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/bosque/ent/atlas.png` | `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png` | completar |  |
| doblador_guerrero | Doppelgänger — Guerrero · subjefe | 6 de 11 (walk_D, walk_U, attack_D, attack_U, hit, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/bosque/doblador_guerrero/atlas.png` | `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png` | completar |  |
| doblador_arquera | Doppelgänger — Arquera · subjefe | 6 de 11 (walk_D, walk_U, attack_D, attack_U, hit, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/bosque/doblador_arquera/atlas.png` | `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png` | completar |  |
| doblador_picaro | Doppelgänger — Pícaro · subjefe | 6 de 11 (walk_D, walk_U, attack_D, attack_U, hit, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/bosque/doblador_picaro/atlas.png` | `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png` | completar |  |
| doblador_clerigo | Doppelgänger — Clérigo · subjefe | 6 de 11 (walk_D, walk_U, attack_D, attack_U, hit, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/bosque/doblador_clerigo/atlas.png` | `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png` | completar |  |
| escorpion_gigante | Escorpión Gigante · normal | 7 de 11 (idle, walk_U, attack_D, attack_U, hit, hit_D, death). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/laberinto/escorpion_gigante/atlas.png` | `assets/sprites/enemies/laberinto/escorpion_gigante/walk-strip.png` | completar |  |
| golem_piedra | Gólem de Piedra · normal | 8 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit, hit_D, death). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/laberinto/golem_piedra/atlas.png` | `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png` | completar |  |
| druida_arena | Druida de Arena · elite | 6 de 11 (idle, attack_D, attack_U, hit, hit_D, death). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/laberinto/druida_arena/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | completar |  |
| guardian_laberinto | Guardián del Laberinto · subjefe | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/laberinto/guardian_laberinto/atlas.png` | `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png` | completar |  |
| kraken_joven | Kraken Joven · subjefe | 8 de 11 (idle, walk_L, walk_D, walk_U, attack, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/acuatica/kraken_joven/atlas.png` | `assets/sprites/arenas/minas/mn_titan/atlas.png` | completar |  |
| automata | Autómata de Hierro · elite | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/fortaleza/automata/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | completar |  |
| engendro | Engendro Encadenado · normal | 9 de 11 (idle, walk_D, walk_U, attack, attack_D, attack_U, hit, hit_D, death). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/fortaleza/engendro/atlas.png` | `assets/sprites/arenas/abismo/ab_errante/atlas.png` | completar |  |
| verdugo | Verdugo de Vapor · elite | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/fortaleza/verdugo/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | completar |  |
| caballero | Caballero de la Armadura Oxidada · jefe | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/fortaleza/caballero/atlas.png` | `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png` | completar |  |
| hinchado | Hinchado · elite | 7 de 11 (idle, walk_D, walk_U, attack, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/micelial/hinchado/atlas.png` | `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png` | completar |  |
| chaman | Chamán de la Colonia · elite | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/micelial/chaman/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | completar |  |
| cm_verdugo | Verdugo · elite | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_verdugo/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | completar |  |
| mn_minero | Minero Corrompido · elite | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/minas/mn_minero/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | completar |  |
| mn_consumidor | Consumidor Luminoso · elite | 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). | Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). | `art-source/entregas/2026-10_mundo/enemigos/minas/mn_consumidor/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | completar |  |

**P2** (misma regla de formato; solo faltan vistas de frente/espalda y golpe)

| Tipo | Rango | Arena | Estados rellenados | Entrega (bajo la carpeta del lote) | Referencia (bajo assets/sprites/) |
|---|---|---|---|---|---|
| esqueleto | normal | infernal | idle, hit, hit_D, death | `enemigos/infernal/esqueleto/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| zombie | normal | infernal | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/infernal/zombie/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| esqueleto_h | subelite | infernal | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/infernal/esqueleto_h/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| hechicero_supremo | subjefe | infernal | walk_U, attack_D, attack_U, hit_D | `enemigos/infernal/hechicero_supremo/atlas.png` | bosses/bosque/doblador_guerrero/v2/atlas.png |
| lobo_artico | normal | hielo | idle, hit, hit_D, death | `enemigos/hielo/lobo_artico/atlas.png` | arenas/micelial/sabueso/atlas.png |
| golem_hielo | normal | hielo | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/hielo/golem_hielo/atlas.png` | enemies/hielo/dragoncito_hielo/v2/atlas.png |
| dragoncito_hielo | elite | hielo | idle, attack_D, attack_U, hit_D | `enemigos/hielo/dragoncito_hielo/atlas.png` | arenas/abismo/ab_errante/atlas.png |
| angel_hielo | elite | hielo | idle, attack_D, attack_U, hit_D | `enemigos/hielo/angel_hielo/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| golem_cristal | normal | hielo | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/hielo/golem_cristal/atlas.png` | enemies/hielo/dragoncito_hielo/v2/atlas.png |
| cristal_servo | normal | hielo | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/hielo/cristal_servo/atlas.png` | enemies/bosque/enjambre_hadas/v3/atlas.png |
| cristal_volador | normal | hielo | walk_D, walk_U, attack_D, attack_U, hit, hit_D | `enemigos/hielo/cristal_volador/atlas.png` | enemies/bosque/enjambre_hadas/v3/atlas.png |
| duende_bosque | normal | bosque | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/bosque/duende_bosque/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| guardian_ancestral | jefe | bosque | attack_D, attack_U, hit_D | `enemigos/bosque/guardian_ancestral/atlas.png` | bosses/bosque/doblador_guerrero/v2/atlas.png |
| medusa | subelite | laberinto | idle, attack_D, attack_U, hit_D, death | `enemigos/laberinto/medusa/atlas.png` | enemies/laberinto/medusa/walk-strip.png |
| anguila_electrica | normal | acuatica | idle, walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/acuatica/anguila_electrica/atlas.png` | arenas/abismo/ab_errante/atlas.png |
| carcelero | normal | fortaleza | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/fortaleza/carcelero/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| dragon_bronce | normal | fortaleza | idle, walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/fortaleza/dragon_bronce/atlas.png` | arenas/abismo/ab_errante/atlas.png |
| prisionero | normal | fortaleza | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/fortaleza/prisionero/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| arana | subelite | fortaleza | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/fortaleza/arana/atlas.png` | enemies/laberinto/escorpion_gigante/walk-strip.png |
| infectado | normal | micelial | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/micelial/infectado/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| acechador | subelite | micelial | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/micelial/acechador/atlas.png` | arenas/abismo/ab_errante/atlas.png |
| peregrino | subelite | micelial | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/micelial/peregrino/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| sabueso | normal | micelial | walk_D, walk_U, attack, attack_D, attack_U, hit_D | `enemigos/micelial/sabueso/atlas.png` | arenas/micelial/sabueso/atlas.png |
| ab_errante | normal | abismo | idle | `enemigos/abismo/ab_errante/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| ab_acechador | subelite | abismo | idle, attack, attack_D, attack_U | `enemigos/abismo/ab_acechador/atlas.png` | arenas/abismo/ab_errante/atlas.png |
| ab_heraldo | subelite | abismo | idle | `enemigos/abismo/ab_heraldo/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| ab_devorador | elite | abismo | idle | `enemigos/abismo/ab_devorador/atlas.png` | arenas/abismo/ab_errante/atlas.png |
| ab_tejedor | subelite | abismo | idle | `enemigos/abismo/ab_tejedor/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| cm_saqueador | normal | ciudad | idle | `enemigos/ciudad/cm_saqueador/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| cm_raptor | subelite | ciudad | idle | `enemigos/ciudad/cm_raptor/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| cm_planidera | subelite | ciudad | idle | `enemigos/ciudad/cm_planidera/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| cm_sectario | normal | ciudad | idle, hit, hit_D | `enemigos/ciudad/cm_sectario/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| cm_espectro | normal | ciudad | idle | `enemigos/ciudad/cm_espectro/atlas.png` | arenas/abismo/ab_errante/atlas.png |
| cm_espejismo | normal | ciudad | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/ciudad/cm_espejismo/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| mn_esclavo | normal | minas | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/minas/mn_esclavo/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |
| mn_insecto | normal | minas | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/minas/mn_insecto/atlas.png` | arenas/abismo/ab_errante/atlas.png |
| mn_acechador | subelite | minas | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/minas/mn_acechador/atlas.png` | arenas/abismo/ab_errante/atlas.png |
| mn_escupidor | subelite | minas | walk_D, walk_U, attack_D, attack_U, hit_D | `enemigos/minas/mn_escupidor/atlas.png` | arenas/ciudad/cm_verdugo/atlas.png |

### 6.2 Monstruos de campo de batalla (16): "retratos" de ilustración a atlas de píxel nativo

Ver 3.2. Cada fila dice la altura de cuerpo objetivo a 1,0 u/px (el alto en u con que se dibuja hoy, `BATTLEFIELD_HEIGHTS`) y la banda aceptable. Herramienta que usó el repo para reducir a la grilla nativa: `tools/art/battlefield_pixelize.py`. Hoja `ejemplos/mundo/02_monstruos_campo_de_batalla.webp`.

| ID | P | Qué hay hoy | Qué entregar | Entrega | Referencia | Notas |
|---|---|---|---|---|---|---|
| C-BF-golem_cuerpos | P1 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈218 px de alto (1,0 u/px; banda aceptable 91–484 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/golem_cuerpos/atlas.png` | `assets/sprites/bosses/infernal/hechicero/golem/v2/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 218 u de alto (BATTLEFIELD_HEIGHTS), body 236 px de 384 (0.92 u/px). Sin golpe ni muerte propios. HS-02 pide además: caminar 6, aplastar 5, muerte que se abre 6; HS-03: transformaciones. YA EXISTE un atlas a densidad canon en assets/sprites/bosses/infernal/hechicero/golem/v2/atlas.png (el juego no lo usa mientras la tira gane): [DECIDE EL DUEÑO] retirar la tira antes de pedir arte nuevo. |
| C-BF-mn_titan | P1 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈174 px de alto (1,0 u/px; banda aceptable 72–387 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/mn_titan/atlas.png` | `assets/sprites/arenas/minas/mn_titan/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 174 u de alto (BATTLEFIELD_HEIGHTS), body 264 px de 384 (0.66 u/px). Sin golpe ni muerte propios. YA EXISTE un atlas a densidad canon en assets/sprites/arenas/minas/mn_titan/atlas.png (el juego no lo usa mientras la tira gane): [DECIDE EL DUEÑO] retirar la tira antes de pedir arte nuevo. |
| C-BF-mn_cerbero | P1 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈160 px de alto (1,0 u/px; banda aceptable 67–356 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/mn_cerbero/atlas.png` | `assets/sprites/arenas/minas/mn_cerbero/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 160 u de alto (BATTLEFIELD_HEIGHTS), body 224 px de 384 (0.71 u/px). Sin golpe ni muerte propios. YA EXISTE un atlas a densidad canon en assets/sprites/arenas/minas/mn_cerbero/atlas.png (el juego no lo usa mientras la tira gane): [DECIDE EL DUEÑO] retirar la tira antes de pedir arte nuevo. |
| C-BF-ab_carcelero | P1 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈170 px de alto (1,0 u/px; banda aceptable 71–378 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/ab_carcelero/atlas.png` | `assets/sprites/arenas/abismo/ab_carcelero/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 170 u de alto (BATTLEFIELD_HEIGHTS), body 274 px de 384 (0.62 u/px). Sin golpe ni muerte propios. YA EXISTE un atlas a densidad canon en assets/sprites/arenas/abismo/ab_carcelero/atlas.png (el juego no lo usa mientras la tira gane): [DECIDE EL DUEÑO] retirar la tira antes de pedir arte nuevo. |
| C-BF-cm_maestro | P1 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈112 px de alto (1,0 u/px; banda aceptable 47–249 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/cm_maestro/atlas.png` | `assets/sprites/arenas/ciudad/cm_maestro/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 112 u de alto (BATTLEFIELD_HEIGHTS), body 236 px de 384 (0.47 u/px). Sin golpe ni muerte propios. YA EXISTE un atlas a densidad canon en assets/sprites/arenas/ciudad/cm_maestro/atlas.png (el juego no lo usa mientras la tira gane): [DECIDE EL DUEÑO] retirar la tira antes de pedir arte nuevo. |
| C-BF-cm_dama | P1 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈125 px de alto (1,0 u/px; banda aceptable 52–278 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/cm_dama/atlas.png` | `assets/sprites/arenas/ciudad/cm_dama/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 125 u de alto (BATTLEFIELD_HEIGHTS), body 264 px de 384 (0.47 u/px). Sin golpe ni muerte propios. YA EXISTE un atlas a densidad canon en assets/sprites/arenas/ciudad/cm_dama/atlas.png (el juego no lo usa mientras la tira gane): [DECIDE EL DUEÑO] retirar la tira antes de pedir arte nuevo. |
| C-BF-cm_tramoyista | P1 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈138 px de alto (1,0 u/px; banda aceptable 58–307 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/cm_tramoyista/atlas.png` | `assets/sprites/arenas/ciudad/cm_tramoyista/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 138 u de alto (BATTLEFIELD_HEIGHTS), body 278 px de 384 (0.50 u/px). Sin golpe ni muerte propios. YA EXISTE un atlas a densidad canon en assets/sprites/arenas/ciudad/cm_tramoyista/atlas.png (el juego no lo usa mientras la tira gane): [DECIDE EL DUEÑO] retirar la tira antes de pedir arte nuevo. |
| C-BF-cm_presentador | P1 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈138 px de alto (1,0 u/px; banda aceptable 58–307 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/cm_presentador/atlas.png` | `assets/sprites/arenas/ciudad/cm_presentador/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 138 u de alto (BATTLEFIELD_HEIGHTS), body 301 px de 384 (0.46 u/px). Sin golpe ni muerte propios. YA EXISTE un atlas a densidad canon en assets/sprites/arenas/ciudad/cm_presentador/atlas.png (el juego no lo usa mientras la tira gane): [DECIDE EL DUEÑO] retirar la tira antes de pedir arte nuevo. |
| C-BF-minotauro | P0 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈196 px de alto (1,0 u/px; banda aceptable 82–436 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/minotauro/atlas.png` | `assets/sprites/arenas/minas/mn_titan/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 196 u de alto (BATTLEFIELD_HEIGHTS), body 300 px de 384 (0.65 u/px). Sin golpe ni muerte propios. Además el atlas propio assets/sprites/bosses/laberinto/minotauro/v3/atlas.png es PIXEL_GRUESO (2,70 u/px). |
| C-BF-leviatan | P0 | rehacer (sin excepción del gate; solo 4 cuadros) | Reentregar como atlas de píxel nativo: cuerpo ≈230 px de alto (1,0 u/px; banda aceptable 96–511 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/leviatan/atlas.png` | `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 230 u de alto (BATTLEFIELD_HEIGHTS), body 297 px de 384 (0.77 u/px). Sin golpe ni muerte propios. Además las 15 piezas de assets/sprites/bosses/acuatica/leviatan/ son PIXEL_GRUESO (3,54 u/px). |
| C-BF-dragon_forja | P0 | rehacer (sin excepción del gate; solo 4 cuadros) | Reentregar como atlas de píxel nativo: cuerpo ≈206 px de alto (1,0 u/px; banda aceptable 86–458 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/dragon_forja/atlas.png` | `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 206 u de alto (BATTLEFIELD_HEIGHTS), body 272 px de 384 (0.76 u/px). Sin golpe ni muerte propios. Además el atlas propio assets/sprites/arenas/fortaleza/dragon_forja/atlas.png es PIXEL_GRUESO (2,66 u/px). |
| C-BF-micelio | P0 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈185 px de alto (1,0 u/px; banda aceptable 77–411 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/micelio/atlas.png` | `assets/sprites/arenas/minas/mn_titan/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 185 u de alto (BATTLEFIELD_HEIGHTS), body 318 px de 384 (0.58 u/px). Sin golpe ni muerte propios. El atlas propio assets/sprites/arenas/micelial/micelio/atlas.png mide 2,38 u/px (dentro de banda, marcado "vigilar"). |
| C-BF-stone-dragon | P1 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈160 px de alto (1,0 u/px; banda aceptable 67–356 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/stone-dragon/atlas.png` | `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 160 u de alto (BATTLEFIELD_HEIGHTS). Sin golpe ni muerte propios. |
| C-BF-king-colossus | P1 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈174 px de alto (1,0 u/px; banda aceptable 72–387 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/king-colossus/atlas.png` | `assets/sprites/arenas/minas/mn_titan/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 174 u de alto (BATTLEFIELD_HEIGHTS). Sin golpe ni muerte propios. |
| C-BF-thornbeast | P1 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈66 px de alto (1,0 u/px; banda aceptable 28–147 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/thornbeast/atlas.png` | `assets/sprites/arenas/micelial/sabueso/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 66 u de alto (BATTLEFIELD_HEIGHTS). Sin golpe ni muerte propios. |
| C-BF-scavenger | P1 | rehacer (ILUSTRACION) | Reentregar como atlas de píxel nativo: cuerpo ≈58 px de alto (1,0 u/px; banda aceptable 24–129 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. | `art-source/entregas/2026-10_mundo/jefes/scavenger/atlas.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`<br>`tools/art/battlefield_pixelize.py (reduce a la grilla nativa)` | Hoy: tira de 4 cuadros 448×384 (reposo, caminar ×2, ataque) = ilustración; dibujada a 58 u de alto (BATTLEFIELD_HEIGHTS). Sin golpe ni muerte propios. |

### 6.3 Entidades de escenario y por partes (9)

Invocaciones, focos, núcleos y tentáculos que no caminan: se piden **piezas y estados**, no marcha en 4 direcciones.

| ID | Entidad | P | Qué pedir | Entrega | Estado actual |
|---|---|---|---|---|---|
| C-ENEMY-foco_convergencia | Foco de Convergencia (foco_convergencia, subelite) — piezas/estados propios | P1 | Según la ficha de origen: A-05 Focos de Convergencia (48×96; idle 6 + quiebre 8; 4 colores) | `art-source/entregas/2026-10_mundo/enemigos/infernal/foco_convergencia/atlas.png` | procedural / compuesto: assets/vfx/bosses/hielo/bsAngelPillar_1.png |
| C-ENEMY-foco_hielo | Foco de Hielo (foco_hielo, subelite) — piezas/estados propios | P1 | Según la ficha de origen: A-07 Foco de Hielo (48×96; idle 6 + quiebre 8) | `art-source/entregas/2026-10_mundo/enemigos/hielo/foco_hielo/atlas.png` | procedural / compuesto: assets/vfx/bosses/hielo/bsAngelPillar_1.png |
| C-ENEMY-lev_tentaculo | Tentáculo del Leviatán (lev_tentaculo, subelite) — piezas/estados propios | P1 | Según la ficha de origen: A-06 Tentáculos del Leviatán (64×128; emerger 4, idle 4, acción 6, hundirse 4; 3 variantes) | `art-source/entregas/2026-10_mundo/enemigos/acuatica/lev_tentaculo/atlas.png` | procedural / compuesto: assets/sprites/bosses/acuatica/kraken_joven/tent_01.png |
| C-ENEMY-nucleo_micelial | Núcleo Micelial (nucleo_micelial, subelite) — piezas/estados propios | P1 | Según la ficha de origen: A-08 Red micelial: núcleo/raíz-tendón (raíz 64×24 latido 4) | `art-source/entregas/2026-10_mundo/enemigos/micelial/nucleo_micelial/atlas.png` | procedural / compuesto: assets/sprites/arenas/micelial/fx/nucleo_3.png |
| C-ENEMY-raiz_absorcion | Raíz de Absorción (raiz_absorcion, subelite) — piezas/estados propios | P1 | Según la ficha de origen: A-08 Red micelial: raíz-tendón | `art-source/entregas/2026-10_mundo/enemigos/micelial/raiz_absorcion/atlas.png` | procedural / compuesto: assets/sprites/arenas/micelial/fx/root_curl.png |
| C-ENEMY-madre_espora | La Madre Espora (madre_espora, jefe) — piezas/estados propios | P1 | Según la ficha de origen: Madre Espora: frames completos del cuerpo (hoy retrato por partes en el escenario) | `art-source/entregas/2026-10_mundo/enemigos/micelial/madre_espora/atlas.png` | procedural / compuesto: sin archivo propio |
| C-ENEMY-ab_morador | El Que Mora Debajo (ab_morador, jefe) — piezas/estados propios | P0 | Según la ficha de origen: AB-BO-01/02 Ojo a escala de jefe (idle, parpadeo, daño, abierto/vulnerable, rayo, muerte; A-18: ojo abierto 128×128 dilatarse 6) y mandíbula con transparencia real | `art-source/entregas/2026-10_mundo/enemigos/abismo/ab_morador/atlas.png` | procedural / compuesto: assets/vfx/abismo/tex_carne.png |
| C-ENEMY-ab_tentaculo | Tentáculo del Abismo (ab_tentaculo, subelite) — piezas/estados propios | P1 | Según la ficha de origen: AB-BO-03 Tentáculo de combate (surgir, idle, preparación, aplastar, daño, hundirse) | `art-source/entregas/2026-10_mundo/enemigos/abismo/ab_tentaculo/atlas.png` | procedural / compuesto: assets/vfx/abismo/tent_grande_0.png |
| C-ENEMY-cm_cometa | Gran Número (cm_cometa, normal) — piezas/estados propios | P1 | Según la ficha de origen: A-09 Cometa del Gran Número (vuelo 6 + impacto 5, 48×48) | `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_cometa/atlas.png` | procedural / compuesto: sin archivo propio |

### 6.4 Formas de jefe y piezas nuevas (8)

Fuente: `LA_HORDA_MISSING_ASSETS.md`, `LA_HORDA_COMBAT_MISSING_ASSETS.md`, `LA_HORDA_CODEX_MISSING_ASSETS.md`. Las rutas destino de esas fichas se comprobaron contra el repo.

| ID | Asset | P | Tamaño / frames | Ruta destino en el juego | Estado verificado | Referencia |
|---|---|---|---|---|---|---|
| C-FORMA-angel_corrompido | A-03 Ángel Corrompido (forma 1 del jefe final) | P0 | Celda 128×128: idle 6, cast 8, ataque 8, daño 3, muerte 12 (+4 cristales orbitando aparte). Hoy es el Hechicero recoloreado con alas procedurales (TINTED en enemy_coverage.js). | `assets/sprites/bosses/infernal/angel_corrompido/atlas.png` | inexistente (ruta destino verificada ausente) | `assets/sprites/bosses/infernal/hechicero/angel/atlas.png` |
| C-FORMA-rey_horda | A-04 Rey de la Horda (forma final) | P1 | Celda 192×192: idle 6, ataque 10, rugido 8, muerte 14. Hoy usa el cuerpo del Demonio Mayor. | `assets/sprites/bosses/infernal/rey_horda/atlas.png` | inexistente (ruta destino verificada ausente) | `assets/sprites/bosses/infernal/demonio_mayor/atlas.png` |
| C-FORMA-caballero_calor | A-10 Caballero de la Armadura Oxidada: 3 estados de calor + shock térmico | P1 | Misma celda que su atlas actual ×3 estados (oscuro, rojo, incandescente) + shock térmico 8 cuadros. | `assets/sprites/arenas/fortaleza/caballero/heat_0.png` | inexistente (ruta destino verificada ausente) | `assets/sprites/arenas/fortaleza/caballero/atlas.png` |
| C-FORMA-dragon_huida | A-20 Dragón de la Forja huyendo herido | P2 | Celda del dragón, 6 cuadros. | `assets/sprites/arenas/fortaleza/dragon_forja/huida.png` | inexistente (ruta destino verificada ausente) | `assets/sprites/arenas/fortaleza/dragon_forja/atlas.png` |
| C-FORMA-escudo_raices | A-19 Escudo de raíces del Guardián Ancestral | P2 | 128×128, bucle 6. | `assets/vfx/bosque/escudo_raices.png` | inexistente (ruta destino verificada ausente) | `assets/sprites/bosses/hielo/mago_hielo_cristal/v2/atlas.png` |
| C-FORMA-transformaciones | HS-03 Transformación Hechicero → Gólem (8 cuadros) y Gólem → Demonio (6 cuadros) | P1 | Celdas del jefe final; hoy 3 fases de la hoja + partículas. | [a definir al integrar] | parcial | `assets/sprites/bosses/hielo/mago_hielo_cristal/v2/atlas.png` |
| C-FORMA-hechicero_alado | HS-01 Hechicero Supremo "angelical" con alas de luz (retrato grande, 4 cuadros de respiración) | P0 | Retrato de pantalla previa (run-intro): tamaño a definir con Claude (≥ canon 1,0 u/px); hoy sprite real + alas procedurales en canvas. | [a definir al integrar] | parcial | `assets/sprites/bosses/hielo/mago_hielo_cristal/v2/atlas.png` |
| C-FORMA-dobladores_habilidades | CX-ANI-01 Dobladores (4): animaciones de habilidad propias | P1 | Hoy solo idle, caminar, ataque, golpe y muerte (celdas ≈55–58×60–63, refH 53–54). Pedir las poses de cast/habilidad de cada uno. | [a definir al integrar] | parcial | `assets/sprites/bosses/hielo/mago_hielo_cristal/v2/atlas.png` |

### 6.5 Retratos del Códice de Minas (11 JPG ilustración)

Los JPG actuales traen **texto incrustado** ("TITÁN DE PIEDRA", "COMÚN – MELEE", "ÉLITE – SOPORTE / APAGA"…): los nuevos van sin texto. Hoja `08`.

| ID | Retrato | Tamaño | Entrega | Reemplaza |
|---|---|---|---|---|
| C-CODEX-minas-titan | Retrato del Códice de Minas "titan" (JPG 192×208) | 192×208 | `art-source/entregas/2026-10_mundo/codice/minas_titan.png` | `assets/ui/codex/minas/titan.jpg` |
| C-CODEX-minas-titan_full | Retrato del Códice de Minas "titan_full" (JPG 314×286) | 314×286 | `art-source/entregas/2026-10_mundo/codice/minas_titan_full.png` | `assets/ui/codex/minas/titan_full.jpg` |
| C-CODEX-minas-cerbero | Retrato del Códice de Minas "cerbero" (JPG 420×357) | 420×357 | `art-source/entregas/2026-10_mundo/codice/minas_cerbero.png` | `assets/ui/codex/minas/cerbero.jpg` |
| C-CODEX-minas-devoraluz | Retrato del Códice de Minas "devoraluz" (JPG 192×319) | 192×319 | `art-source/entregas/2026-10_mundo/codice/minas_devoraluz.png` | `assets/ui/codex/minas/devoraluz.jpg` |
| C-CODEX-minas-devoraluz_full | Retrato del Códice de Minas "devoraluz_full" (JPG 252×320) | 252×320 | `art-source/entregas/2026-10_mundo/codice/minas_devoraluz_full.png` | `assets/ui/codex/minas/devoraluz_full.jpg` |
| C-CODEX-minas-esclavo | Retrato del Códice de Minas "esclavo" (JPG 222×198) | 222×198 | `art-source/entregas/2026-10_mundo/codice/minas_esclavo.png` | `assets/ui/codex/minas/esclavo.jpg` |
| C-CODEX-minas-insecto | Retrato del Códice de Minas "insecto" (JPG 222×194) | 222×194 | `art-source/entregas/2026-10_mundo/codice/minas_insecto.png` | `assets/ui/codex/minas/insecto.jpg` |
| C-CODEX-minas-acechador | Retrato del Códice de Minas "acechador" (JPG 222×190) | 222×190 | `art-source/entregas/2026-10_mundo/codice/minas_acechador.png` | `assets/ui/codex/minas/acechador.jpg` |
| C-CODEX-minas-minero | Retrato del Códice de Minas "minero" (JPG 222×205) | 222×205 | `art-source/entregas/2026-10_mundo/codice/minas_minero.png` | `assets/ui/codex/minas/minero.jpg` |
| C-CODEX-minas-escupidor | Retrato del Códice de Minas "escupidor" (JPG 222×253) | 222×253 | `art-source/entregas/2026-10_mundo/codice/minas_escupidor.png` | `assets/ui/codex/minas/escupidor.jpg` |
| C-CODEX-minas-consumidor | Retrato del Códice de Minas "consumidor" (JPG 222×270) | 222×270 | `art-source/entregas/2026-10_mundo/codice/minas_consumidor.png` | `assets/ui/codex/minas/consumidor.jpg` |

### 6.6 Objetos, ítems y sets

Fuente: `LA_HORDA_ITEM_ASSET_MANIFEST.md` (generado con `node tools/items/gen_item_manifest.js`; cada ficha tiene descripción visual, efecto y prompt: **úsala, descartando cualquier mención a Eren**). **Hoy ningún objeto tiene PNG** (`assets/items/` no existe; `ITEM_ICON_ART` en `js/ui/item-icons.js:15` está vacío; hay un ícono procedural provisorio). Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, **sin marco de rareza ni texto** (los dibuja el juego; colores de marco: Común blanco, Raro azul, Muy Raro amarillo, Legendario naranja, Mítico rojo, Set verde, Único violeta). Prioridad de producción del propio manifiesto: Únicos y Míticos → 26 arquetipos (cubren ~90 % del botín) → Legendarios → piezas de set (un set completo por vez) → objetos de campeón → skins, auras, VFX.
**Ejemplo de referencia**: no existe ningún ícono de objeto pintado en el repo. Gramática a imitar: `assets/ui/skill-icons/embestida.png` (ícono pintado de 32×32 con contorno) y el Caballero (`docs/ART_BIBLE.md` §2); como contraste del estilo "provisorio", la hoja `ejemplos/mundo/05_iconos_ui_primera_pasada.webp` (16×16). Las siluetas base (arquetipos) van en **gris neutro**.

| Grupo | Cantidad | Prioridad |
|---|---|---|
| unico | 3 | P0 |
| mitico | 8 | P0 |
| legendario | 24 | P1 |
| objeto_de_campeon | 14 | P1 |
| pieza_de_set | 94 | P2 |
| arquetipo | 26 | P1 |
| **Total íconos** | 169 |  |

**Únicos (3, P0)**

| Id | Nombre | Categoría · slot | P | Archivo destino exacto (64×64 PNG) |
|---|---|---|---|---|
| uniq_corona_archimago | Corona del Archimago Eclipsado | casco | P0 | `assets/items/uniq_corona_archimago.png` |
| uniq_yelmo_coloso | Yelmo del Coloso Errante | casco | P0 | `assets/items/uniq_yelmo_coloso.png` |
| uniq_arco_lunaroja | Arco de la Luna Roja | arma | P0 | `assets/items/uniq_arco_lunaroja.png` |

**Míticos (8, P0)**

| Id | Nombre | Categoría · slot | P | Archivo destino exacto (64×64 PNG) |
|---|---|---|---|---|
| myth_corona_invierno | Corona del Invierno Sin Fin | casco | P0 | `assets/items/myth_corona_invierno.png` |
| myth_corazon_averno | Corazón del Averno | pechera | P0 | `assets/items/myth_corazon_averno.png` |
| myth_martillo_tormenta | Martillo de la Tormenta Primigenia | arma | P0 | `assets/items/myth_martillo_tormenta.png` |
| myth_egida_bastion | Égida del Último Bastión | escudo | P0 | `assets/items/myth_egida_bastion.png` |
| myth_guadana_roja | Guadaña de la Cosecha Roja | arma | P0 | `assets/items/myth_guadana_roja.png` |
| myth_baculo_alba | Báculo del Alba Eterna | arma | P0 | `assets/items/myth_baculo_alba.png` |
| myth_grimorio_vacio | Grimorio del Vacío Hambriento | guantes | P0 | `assets/items/myth_grimorio_vacio.png` |
| myth_hoja_eclipse | Hoja del Eclipse | arma | P0 | `assets/items/myth_hoja_eclipse.png` |

**Legendarios con nombre (24, P1)**

| Id | Nombre | Categoría · slot | P | Archivo destino exacto (64×64 PNG) |
|---|---|---|---|---|
| leg_tundraverx | Esquirla de Tundraverx | arma | P1 | `assets/items/leg_tundraverx.png` |
| leg_glaciar_manto | Manto del Glaciar Dormido | pechera | P1 | `assets/items/leg_glaciar_manto.png` |
| leg_ventisquero | Ojo del Ventisquero | guantes | P1 | `assets/items/leg_ventisquero.png` |
| leg_belial | Ascua de Belial | arma | P1 | `assets/items/leg_belial.png` |
| leg_herrero_caido | Guanteletes del Herrero Caído | guantes | P1 | `assets/items/leg_herrero_caido.png` |
| leg_brasa_viva | Yelmo de Brasa Viva | casco | P1 | `assets/items/leg_brasa_viva.png` |
| leg_ysolde | Cadena de Ysolde | arma | P1 | `assets/items/leg_ysolde.png` |
| leg_relampago_errante | Botas del Relámpago Errante | botas | P1 | `assets/items/leg_relampago_errante.png` |
| leg_descarga | Brazal de la Descarga | guantes | P1 | `assets/items/leg_descarga.png` |
| leg_kaelen | Muro de Kaelen | escudo | P1 | `assets/items/leg_kaelen.png` |
| leg_juramento_roto | Pechera del Juramento Roto | pechera | P1 | `assets/items/leg_juramento_roto.png` |
| leg_centinela | Yelmo del Centinela | casco | P1 | `assets/items/leg_centinela.png` |
| leg_morrah | Hoja Sedienta de Morrah | arma | P1 | `assets/items/leg_morrah.png` |
| leg_carnicero | Guantes del Carnicero | guantes | P1 | `assets/items/leg_carnicero.png` |
| leg_caceria_roja | Botas de la Cacería Roja | botas | P1 | `assets/items/leg_caceria_roja.png` |
| leg_seraphine | Lágrima de Seraphine | casco | P1 | `assets/items/leg_seraphine.png` |
| leg_peregrino | Túnica del Peregrino | pechera | P1 | `assets/items/leg_peregrino.png` |
| leg_alba_sandalias | Sandalias del Primer Alba | botas | P1 | `assets/items/leg_alba_sandalias.png` |
| leg_mil_sellos | Diadema de los Mil Sellos | casco | P1 | `assets/items/leg_mil_sellos.png` |
| leg_ceniza_arcana | Dedos de Ceniza Arcana | guantes | P1 | `assets/items/leg_ceniza_arcana.png` |
| leg_umbral | Pasos del Umbral | botas | P1 | `assets/items/leg_umbral.png` |
| leg_medianoche | Filo de Medianoche | arma | P1 | `assets/items/leg_medianoche.png` |
| leg_acecho | Máscara del Acecho Nocturno | casco | P1 | `assets/items/leg_acecho.png` |
| leg_duelista | Guantes del Duelista Silencioso | guantes | P1 | `assets/items/leg_duelista.png` |

**Objetos de campeón (14, P1)**

| Id | Nombre | Categoría · slot | P | Archivo destino exacto (64×64 PNG) |
|---|---|---|---|---|
| tanque_leg | Escudo del Juggernaut | escudo | P1 | `assets/items/tanque_leg.png` |
| tanque_mit | Corona del Paladín Eterno | pechera | P1 | `assets/items/tanque_mit.png` |
| guerrero_leg | Garra del Cazador | botas | P1 | `assets/items/guerrero_leg.png` |
| guerrero_mit | Colmillo del Verdugo | arma | P1 | `assets/items/guerrero_mit.png` |
| mago_leg | Cristal de Invierno Eterno | casco | P1 | `assets/items/mago_leg.png` |
| mago_mit | Corazón del Muro Eterno | arma | P1 | `assets/items/mago_mit.png` |
| soporte_leg | Cáliz de Sobreabundancia | pechera | P1 | `assets/items/soporte_leg.png` |
| soporte_mit | Aura de la Consagración | arma | P1 | `assets/items/soporte_mit.png` |
| segador_leg | Yugo de la Furia | pechera | P1 | `assets/items/segador_leg.png` |
| segador_mit | Corazón Carmesí | arma | P1 | `assets/items/segador_mit.png` |
| axiom_leg | Fragmento de Recarga | botas | P1 | `assets/items/axiom_leg.png` |
| axiom_mit | Núcleo de Ejecución Forzada | arma | P1 | `assets/items/axiom_mit.png` |
| profeta_leg | Lágrima del Augurio | casco | P1 | `assets/items/profeta_leg.png` |
| profeta_mit | Cáliz del Sacrificio Menor | pechera | P1 | `assets/items/profeta_mit.png` |

**Arquetipos procedurales: 26 siluetas base en gris (P1)**

| Id | Nombre | Slot | P | Archivo destino exacto (64×64 PNG) |
|---|---|---|---|---|
| base_arma_hoja | Hoja | Arma | P1 | `assets/items/base_arma_hoja.png` |
| base_arma_filo | Filo | Arma | P1 | `assets/items/base_arma_filo.png` |
| base_arma_colmillo | Colmillo | Arma | P1 | `assets/items/base_arma_colmillo.png` |
| base_arma_espada | Espada | Arma | P1 | `assets/items/base_arma_espada.png` |
| base_arma_hacha | Hacha | Arma | P1 | `assets/items/base_arma_hacha.png` |
| base_arma_cetro | Cetro | Arma | P1 | `assets/items/base_arma_cetro.png` |
| base_escudo_escudo | Escudo | Escudo | P1 | `assets/items/base_escudo_escudo.png` |
| base_escudo_rodela | Rodela | Escudo | P1 | `assets/items/base_escudo_rodela.png` |
| base_escudo_egida | Égida | Escudo | P1 | `assets/items/base_escudo_egida.png` |
| base_escudo_paves | Pavés | Escudo | P1 | `assets/items/base_escudo_paves.png` |
| base_casco_yelmo | Yelmo | Casco | P1 | `assets/items/base_casco_yelmo.png` |
| base_casco_capucha | Capucha | Casco | P1 | `assets/items/base_casco_capucha.png` |
| base_casco_corona | Corona | Casco | P1 | `assets/items/base_casco_corona.png` |
| base_casco_mascara | Máscara | Casco | P1 | `assets/items/base_casco_mascara.png` |
| base_pechera_coraza | Coraza | Pechera | P1 | `assets/items/base_pechera_coraza.png` |
| base_pechera_pechera | Pechera | Pechera | P1 | `assets/items/base_pechera_pechera.png` |
| base_pechera_manto | Manto | Pechera | P1 | `assets/items/base_pechera_manto.png` |
| base_pechera_cota | Cota | Pechera | P1 | `assets/items/base_pechera_cota.png` |
| base_guantes_guanteletes | Guanteletes | Guantes | P1 | `assets/items/base_guantes_guanteletes.png` |
| base_guantes_guantes | Guantes | Guantes | P1 | `assets/items/base_guantes_guantes.png` |
| base_guantes_brazales | Brazales | Guantes | P1 | `assets/items/base_guantes_brazales.png` |
| base_guantes_punos | Puños | Guantes | P1 | `assets/items/base_guantes_punos.png` |
| base_botas_botas | Botas | Botas | P1 | `assets/items/base_botas_botas.png` |
| base_botas_grebas | Grebas | Botas | P1 | `assets/items/base_botas_grebas.png` |
| base_botas_sandalias | Sandalias | Botas | P1 | `assets/items/base_botas_sandalias.png` |
| base_botas_pasos | Pasos | Botas | P1 | `assets/items/base_botas_pasos.png` |

**Piezas de set (94 en 23 sets, P2)**

| Id | Nombre | Categoría · slot | P | Archivo destino exacto (64×64 PNG) |
|---|---|---|---|---|
| lucifer_arma | Espada de Lucifer | arma | P2 | `assets/items/lucifer_arma.png` |
| lucifer_escudo | Escudo de Lucifer | escudo | P2 | `assets/items/lucifer_escudo.png` |
| lucifer_casco | Casco de Lucifer | casco | P2 | `assets/items/lucifer_casco.png` |
| lucifer_pechera | Pechera de Lucifer | pechera | P2 | `assets/items/lucifer_pechera.png` |
| lucifer_guantes | Guantes de Lucifer | guantes | P2 | `assets/items/lucifer_guantes.png` |
| lucifer_botas | Botas de Lucifer | botas | P2 | `assets/items/lucifer_botas.png` |
| glaciar_arma | Colmillo del Glaciar | arma | P2 | `assets/items/glaciar_arma.png` |
| glaciar_casco | Diadema de Escarcha | casco | P2 | `assets/items/glaciar_casco.png` |
| glaciar_pechera | Coraza del Invierno | pechera | P2 | `assets/items/glaciar_pechera.png` |
| glaciar_guantes | Garras Gélidas | guantes | P2 | `assets/items/glaciar_guantes.png` |
| coloso_escudo | Bastión del Coloso | escudo | P2 | `assets/items/coloso_escudo.png` |
| coloso_casco | Yelmo del Coloso | casco | P2 | `assets/items/coloso_casco.png` |
| coloso_pechera | Corazón de Piedra | pechera | P2 | `assets/items/coloso_pechera.png` |
| coloso_botas | Pisada del Coloso | botas | P2 | `assets/items/coloso_botas.png` |
| sepulturero_arma | Pala del Sepulturero | arma | P2 | `assets/items/sepulturero_arma.png` |
| sepulturero_casco | Capucha del Réquiem | casco | P2 | `assets/items/sepulturero_casco.png` |
| sepulturero_pechera | Mortaja Cosida | pechera | P2 | `assets/items/sepulturero_pechera.png` |
| sepulturero_guantes | Manos de Tierra | guantes | P2 | `assets/items/sepulturero_guantes.png` |
| tempestad_arma | Cetro del Relámpago | arma | P2 | `assets/items/tempestad_arma.png` |
| tempestad_casco | Corona de Nubes | casco | P2 | `assets/items/tempestad_casco.png` |
| tempestad_guantes | Guantes de Descarga | guantes | P2 | `assets/items/tempestad_guantes.png` |
| tempestad_botas | Botas del Rayo | botas | P2 | `assets/items/tempestad_botas.png` |
| berserker_arma | Hacha Sedienta | arma | P2 | `assets/items/berserker_arma.png` |
| berserker_pechera | Piel del Berserker | pechera | P2 | `assets/items/berserker_pechera.png` |
| berserker_guantes | Puños de Sangre | guantes | P2 | `assets/items/berserker_guantes.png` |
| berserker_botas | Botas de la Carga | botas | P2 | `assets/items/berserker_botas.png` |
| guardian_escudo | Égida del Juramento | escudo | P2 | `assets/items/guardian_escudo.png` |
| guardian_casco | Yelmo del Guardián | casco | P2 | `assets/items/guardian_casco.png` |
| guardian_pechera | Peto Juramentado | pechera | P2 | `assets/items/guardian_pechera.png` |
| guardian_guantes | Guanteletes de la Promesa | guantes | P2 | `assets/items/guardian_guantes.png` |
| alba_arma | Báculo del Alba | arma | P2 | `assets/items/alba_arma.png` |
| alba_casco | Aureola Profética | casco | P2 | `assets/items/alba_casco.png` |
| alba_pechera | Túnica del Amanecer | pechera | P2 | `assets/items/alba_pechera.png` |
| alba_botas | Sandalias de Luz | botas | P2 | `assets/items/alba_botas.png` |
| cazador_arma | Colmillo de la Sombra | arma | P2 | `assets/items/cazador_arma.png` |
| cazador_casco | Máscara del Acecho | casco | P2 | `assets/items/cazador_casco.png` |
| cazador_guantes | Guantes Silenciosos | guantes | P2 | `assets/items/cazador_guantes.png` |
| cazador_botas | Pasos de Sombra | botas | P2 | `assets/items/cazador_botas.png` |
| arcano_arma | Orbe del Arcano | arma | P2 | `assets/items/arcano_arma.png` |
| arcano_casco | Ojo Abierto | casco | P2 | `assets/items/arcano_casco.png` |
| arcano_guantes | Dedos del Sello | guantes | P2 | `assets/items/arcano_guantes.png` |
| arcano_botas | Pasos del Vacío | botas | P2 | `assets/items/arcano_botas.png` |
| laberinto_casco | Corona del Rey Errante | casco | P2 | `assets/items/laberinto_casco.png` |
| laberinto_pechera | Manto de los Pasillos | pechera | P2 | `assets/items/laberinto_pechera.png` |
| laberinto_guantes | Guantes del Cartógrafo | guantes | P2 | `assets/items/laberinto_guantes.png` |
| laberinto_botas | Botas del Rey | botas | P2 | `assets/items/laberinto_botas.png` |
| baluarte_escudo | Pavés del Baluarte | escudo | P2 | `assets/items/baluarte_escudo.png` |
| baluarte_casco | Yelmo del Baluarte | casco | P2 | `assets/items/baluarte_casco.png` |
| baluarte_pechera | Coraza del Baluarte | pechera | P2 | `assets/items/baluarte_pechera.png` |
| baluarte_botas | Grebas del Baluarte | botas | P2 | `assets/items/baluarte_botas.png` |
| nocturno_arma | Colmillo Nocturno | arma | P2 | `assets/items/nocturno_arma.png` |
| nocturno_casco | Capucha Nocturna | casco | P2 | `assets/items/nocturno_casco.png` |
| nocturno_guantes | Guantes del Degollador | guantes | P2 | `assets/items/nocturno_guantes.png` |
| nocturno_botas | Pasos Nocturnos | botas | P2 | `assets/items/nocturno_botas.png` |
| convergencia_arma | Bastón de la Convergencia | arma | P2 | `assets/items/convergencia_arma.png` |
| convergencia_casco | Capucha Tricolor | casco | P2 | `assets/items/convergencia_casco.png` |
| convergencia_pechera | Túnica de los Tres Elementos | pechera | P2 | `assets/items/convergencia_pechera.png` |
| convergencia_guantes | Sellos Elementales | guantes | P2 | `assets/items/convergencia_guantes.png` |
| custodio_arma | Báculo del Custodio | arma | P2 | `assets/items/custodio_arma.png` |
| custodio_casco | Mitra del Custodio | casco | P2 | `assets/items/custodio_casco.png` |
| custodio_pechera | Hábito del Custodio | pechera | P2 | `assets/items/custodio_pechera.png` |
| custodio_botas | Sandalias del Custodio | botas | P2 | `assets/items/custodio_botas.png` |
| marea_arma | Guadaña de la Marea | arma | P2 | `assets/items/marea_arma.png` |
| marea_pechera | Coraza Carmesí | pechera | P2 | `assets/items/marea_pechera.png` |
| marea_guantes | Garras de la Marea | guantes | P2 | `assets/items/marea_guantes.png` |
| marea_botas | Botas del Olvido | botas | P2 | `assets/items/marea_botas.png` |
| sistema_arma | Núcleo Raíz | arma | P2 | `assets/items/sistema_arma.png` |
| sistema_casco | Visor de Depuración | casco | P2 | `assets/items/sistema_casco.png` |
| sistema_guantes | Guantes de Compilación | guantes | P2 | `assets/items/sistema_guantes.png` |
| sistema_botas | Pasos Asíncronos | botas | P2 | `assets/items/sistema_botas.png` |
| profecia_casco | Velo de la Profecía | casco | P2 | `assets/items/profecia_casco.png` |
| profecia_pechera | Manto del Augurio | pechera | P2 | `assets/items/profecia_pechera.png` |
| profecia_guantes | Brazales del Destino | guantes | P2 | `assets/items/profecia_guantes.png` |
| profecia_botas | Pasos del Presagio | botas | P2 | `assets/items/profecia_botas.png` |
| errante_arma | Bokken del Errante | arma | P2 | `assets/items/errante_arma.png` |
| errante_casco | Kasa del Errante | casco | P2 | `assets/items/errante_casco.png` |
| errante_guantes | Tekko del Errante | guantes | P2 | `assets/items/errante_guantes.png` |
| errante_botas | Waraji del Errante | botas | P2 | `assets/items/errante_botas.png` |
| manada_arma | Arco de la Manada | arma | P2 | `assets/items/manada_arma.png` |
| manada_casco | Capucha del Rastreador | casco | P2 | `assets/items/manada_casco.png` |
| manada_guantes | Guantes de la Cuerda Tensa | guantes | P2 | `assets/items/manada_guantes.png` |
| manada_botas | Botas del Sendero | botas | P2 | `assets/items/manada_botas.png` |
| granadero_arma | Fusil del Granadero | arma | P2 | `assets/items/granadero_arma.png` |
| granadero_casco | Morrión del Granadero | casco | P2 | `assets/items/granadero_casco.png` |
| granadero_pechera | Casaca Azul | pechera | P2 | `assets/items/granadero_pechera.png` |
| granadero_botas | Botas de Caballería | botas | P2 | `assets/items/granadero_botas.png` |
| requiem_arma | Cetro del Réquiem | arma | P2 | `assets/items/requiem_arma.png` |
| requiem_casco | Corona de Huesos | casco | P2 | `assets/items/requiem_casco.png` |
| requiem_pechera | Mortaja del Señor | pechera | P2 | `assets/items/requiem_pechera.png` |
| requiem_guantes | Garras de la Tumba | guantes | P2 | `assets/items/requiem_guantes.png` |
| legion_arma | Hoces de la Caravana | arma | P2 | `assets/items/legion_arma.png` |
| legion_pechera | Arnés de Faroles | pechera | P2 | `assets/items/legion_pechera.png` |
| legion_guantes | Empuñaduras de Cristal | guantes | P2 | `assets/items/legion_guantes.png` |
| legion_botas | Botas de Arena | botas | P2 | `assets/items/legion_botas.png` |

**Auras de set (23, P2, opcional)** — tira de 8 cuadros de 128×64 (1024×64), anillo elíptico bajo los pies en bucle:

| ID | Aura | Formato | Entrega |
|---|---|---|---|
| C-SET-aura-set_de_lucifer | Aura de set "Set de Lucifer" (Fuego · riesgo · agresión) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(255,110,40), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_set_de_lucifer.png` |
| C-SET-aura-pacto_del_glaciar | Aura de set "Pacto del Glaciar" (Hielo · control) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(150,220,255), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_pacto_del_glaciar.png` |
| C-SET-aura-corazon_del_coloso | Aura de set "Corazón del Coloso" (Tanque · absorber) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(230,190,110), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_corazon_del_coloso.png` |
| C-SET-aura-requiem_del_sepulturero | Aura de set "Réquiem del Sepulturero" (Invocaciones · no-muertos) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(122,212,138), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_requiem_del_sepulturero.png` |
| C-SET-aura-tempestad_eterna | Aura de set "Tempestad Eterna" (Electricidad · cadena · movilidad) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(150,190,255), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_tempestad_eterna.png` |
| C-SET-aura-sangre_del_berserker | Aura de set "Sangre del Berserker" (Riesgo · recompensa) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(230,50,40), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_sangre_del_berserker.png` |
| C-SET-aura-juramento_del_guardian | Aura de set "Juramento del Guardián" (Protección cooperativa) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(143,208,255), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_juramento_del_guardian.png` |
| C-SET-aura-profecia_del_alba | Aura de set "Profecía del Alba" (Soporte · curación) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(255,230,140), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_profecia_del_alba.png` |
| C-SET-aura-sombra_del_cazador | Aura de set "Sombra del Cazador" (Asesino · objetivo único) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(190,120,255), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_sombra_del_cazador.png` |
| C-SET-aura-ojo_del_arcano | Aura de set "Ojo del Arcano" (Mago · rotación) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(200,140,255), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_ojo_del_arcano.png` |
| C-SET-aura-rey_del_laberinto | Aura de set "Rey del Laberinto" (Movimiento · posicionamiento) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(220,200,150), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_rey_del_laberinto.png` |
| C-SET-aura-baluarte_inquebrantable | Aura de set "Baluarte Inquebrantable" (Tanque · masa · control) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(170,200,235), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_baluarte_inquebrantable.png` |
| C-SET-aura-sombra_nocturna | Aura de set "Sombra Nocturna" (Asesino · sangrado · desaparecer) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(150,60,90), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_sombra_nocturna.png` |
| C-SET-aura-convergencia_elemental | Aura de set "Convergencia Elemental" (Mago · fuego + hielo + rayo) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(200,150,255), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_convergencia_elemental.png` |
| C-SET-aura-bendicion_del_custodio | Aura de set "Bendición del Custodio" (Soporte · salvar a tiempo) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(255,235,160), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_bendicion_del_custodio.png` |
| C-SET-aura-marea_roja | Aura de set "Marea Roja" (Berserker · riesgo · furia) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(220,40,40), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_marea_roja.png` |
| C-SET-aura-acceso_raiz | Aura de set "Acceso Raíz" (Axiom · reglas rotas) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(70,240,210), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_acceso_raiz.png` |
| C-SET-aura-la_ultima_profecia | Aura de set "La Última Profecía" (Profeta · destino · salvar) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(120,240,220), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_la_ultima_profecia.png` |
| C-SET-aura-el_ronin_errante | Aura de set "El Rōnin Errante" (Musashi · paciencia · un solo corte) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(160,210,255), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_el_ronin_errante.png` |
| C-SET-aura-la_manada | Aura de set "La Manada" (Cazadora · marca → presa → lobo) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(140,220,120), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_la_manada.png` |
| C-SET-aura-uniforme_del_granadero | Aura de set "Uniforme del Granadero" (Libertador · disparo pesado) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(90,130,220), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_uniforme_del_granadero.png` |
| C-SET-aura-requiem_del_senor_de_la_muerte | Aura de set "Réquiem del Señor de la Muerte" (Nigromante · legión · almas) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(90,230,140), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_requiem_del_senor_de_la_muerte.png` |
| C-SET-aura-legion_de_reconocimiento | Aura de set "Legión de Reconocimiento" (Eren · maniobras · el Portador) | Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(200,90,60), vista 3/4 cenital | `art-source/entregas/2026-10_mundo/sets/aura_legion_de_reconocimiento.png` |

**Skins de set (23, P2)** — 12 ya existen (carpeta verificada); aquí quedan los demás y la revisión de los existentes:

| ID | Skin de set | Entrega | Notas |
|---|---|---|---|
| C-SET-skin-set_de_lucifer | Skin de set "Set de Lucifer" (cualquiera, capa superpuesta) | `art-source/entregas/2026-10_mundo/sets/skin_set_de_lucifer.png` |  |
| C-SET-skin-pacto_del_glaciar | Skin de set "Pacto del Glaciar" (cualquiera, capa superpuesta) | `art-source/entregas/2026-10_mundo/sets/skin_pacto_del_glaciar.png` |  |
| C-SET-skin-corazon_del_coloso | Skin de set "Corazón del Coloso" (cualquiera, capa superpuesta) | `art-source/entregas/2026-10_mundo/sets/skin_corazon_del_coloso.png` |  |
| C-SET-skin-requiem_del_sepulturero | Skin de set "Réquiem del Sepulturero" (cualquiera, capa superpuesta) | `art-source/entregas/2026-10_mundo/sets/skin_requiem_del_sepulturero.png` |  |
| C-SET-skin-tempestad_eterna | Skin de set "Tempestad Eterna" (cualquiera, capa superpuesta) | `art-source/entregas/2026-10_mundo/sets/skin_tempestad_eterna.png` |  |
| C-SET-skin-sangre_del_berserker | Skin de set "Sangre del Berserker" (cualquiera, capa superpuesta) | `art-source/entregas/2026-10_mundo/sets/skin_sangre_del_berserker.png` |  |
| C-SET-skin-juramento_del_guardian | Skin de set "Juramento del Guardián" (cualquiera, capa superpuesta) | `art-source/entregas/2026-10_mundo/sets/skin_juramento_del_guardian.png` |  |
| C-SET-skin-profecia_del_alba | Skin de set "Profecía del Alba" (cualquiera, capa superpuesta) | `art-source/entregas/2026-10_mundo/sets/skin_profecia_del_alba.png` |  |
| C-SET-skin-sombra_del_cazador | Skin de set "Sombra del Cazador" (cualquiera, capa superpuesta) | `art-source/entregas/2026-10_mundo/sets/skin_sombra_del_cazador.png` |  |
| C-SET-skin-ojo_del_arcano | Skin de set "Ojo del Arcano" (cualquiera, capa superpuesta) | `art-source/entregas/2026-10_mundo/sets/skin_ojo_del_arcano.png` |  |
| C-SET-skin-rey_del_laberinto | Skin de set "Rey del Laberinto" (cualquiera, capa superpuesta) | `art-source/entregas/2026-10_mundo/sets/skin_rey_del_laberinto.png` |  |
| C-SET-skin-baluarte_inquebrantable | Skin de set "Baluarte Inquebrantable" (Tanque, atlas del campeón) | `art-source/entregas/2026-10_mundo/sets/skin_baluarte_inquebrantable.png` | Skin existente en el repo; ver docs/assets_faltantes/skins_sets/ para lo que aún se pide (caminata/idle de 4 cuadros por vista). |
| C-SET-skin-sombra_nocturna | Skin de set "Sombra Nocturna" (Asesino, atlas del campeón) | `art-source/entregas/2026-10_mundo/sets/skin_sombra_nocturna.png` | Skin existente en el repo; ver docs/assets_faltantes/skins_sets/ para lo que aún se pide (caminata/idle de 4 cuadros por vista). |
| C-SET-skin-convergencia_elemental | Skin de set "Convergencia Elemental" (Mago, atlas del campeón) | `art-source/entregas/2026-10_mundo/sets/skin_convergencia_elemental.png` | Skin existente en el repo; ver docs/assets_faltantes/skins_sets/ para lo que aún se pide (caminata/idle de 4 cuadros por vista). |
| C-SET-skin-bendicion_del_custodio | Skin de set "Bendición del Custodio" (Soporte, atlas del campeón) | `art-source/entregas/2026-10_mundo/sets/skin_bendicion_del_custodio.png` | Skin existente en el repo; ver docs/assets_faltantes/skins_sets/ para lo que aún se pide (caminata/idle de 4 cuadros por vista). |
| C-SET-skin-marea_roja | Skin de set "Marea Roja" (Segador Olvidado, atlas del campeón) | `art-source/entregas/2026-10_mundo/sets/skin_marea_roja.png` | Skin existente en el repo; ver docs/assets_faltantes/skins_sets/ para lo que aún se pide (caminata/idle de 4 cuadros por vista). |
| C-SET-skin-acceso_raiz | Skin de set "Acceso Raíz" (Axiom, atlas del campeón) | `art-source/entregas/2026-10_mundo/sets/skin_acceso_raiz.png` | Skin existente en el repo; ver docs/assets_faltantes/skins_sets/ para lo que aún se pide (caminata/idle de 4 cuadros por vista). |
| C-SET-skin-la_ultima_profecia | Skin de set "La Última Profecía" (La Profeta, atlas del campeón) | `art-source/entregas/2026-10_mundo/sets/skin_la_ultima_profecia.png` | Skin existente en el repo; ver docs/assets_faltantes/skins_sets/ para lo que aún se pide (caminata/idle de 4 cuadros por vista). |
| C-SET-skin-el_ronin_errante | Skin de set "El Rōnin Errante" (Musashi, atlas del campeón) | `art-source/entregas/2026-10_mundo/sets/skin_el_ronin_errante.png` | Skin existente en el repo; ver docs/assets_faltantes/skins_sets/ para lo que aún se pide (caminata/idle de 4 cuadros por vista). |
| C-SET-skin-la_manada | Skin de set "La Manada" (La Cazadora, atlas del campeón) | `art-source/entregas/2026-10_mundo/sets/skin_la_manada.png` | Skin existente en el repo; ver docs/assets_faltantes/skins_sets/ para lo que aún se pide (caminata/idle de 4 cuadros por vista). |
| C-SET-skin-uniforme_del_granadero | Skin de set "Uniforme del Granadero" (El Libertador, atlas del campeón) | `art-source/entregas/2026-10_mundo/sets/skin_uniforme_del_granadero.png` | Skin existente en el repo; ver docs/assets_faltantes/skins_sets/ para lo que aún se pide (caminata/idle de 4 cuadros por vista). |
| C-SET-skin-requiem_del_senor_de_la_muerte | Skin de set "Réquiem del Señor de la Muerte" (Nigromante, atlas del campeón) | `art-source/entregas/2026-10_mundo/sets/skin_requiem_del_senor_de_la_muerte.png` | Skin existente en el repo; ver docs/assets_faltantes/skins_sets/ para lo que aún se pide (caminata/idle de 4 cuadros por vista). |
| C-SET-skin-legion_de_reconocimiento | Skin de set "Legión de Reconocimiento" (Eren, atlas del campeón) | `art-source/entregas/2026-10_mundo/sets/skin_legion_de_reconocimiento.png` | AVISO LEGAL: el manifiesto aún dice "Eren"; el campeón vigente es Ilkan y su set en código es "Caravana de Medianoche" (champion-sets.js:99) |

**VFX de procs (31, P2)** — tira de 6 cuadros de 64×64, corta y chica:

| ID | Proc | Entrega |
|---|---|---|
| C-PROC-kill_explode | "Estallido Ígneo" (kill_explode) | `art-source/entregas/2026-10_mundo/vfx_items/kill_explode.png` |
| C-PROC-basic_chain | "Tormenta Encadenada" (basic_chain) | `art-source/entregas/2026-10_mundo/vfx_items/basic_chain.png` |
| C-PROC-skill_nova | "Resonancia Arcana" (skill_nova) | `art-source/entregas/2026-10_mundo/vfx_items/skill_nova.png` |
| C-PROC-kill_heal | "Festín de Almas" (kill_heal) | `art-source/entregas/2026-10_mundo/vfx_items/kill_heal.png` |
| C-PROC-hit_shield | "Égida" (hit_shield) | `art-source/entregas/2026-10_mundo/vfx_items/hit_shield.png` |
| C-PROC-basic_freeze | "Escarcha Viva" (basic_freeze) | `art-source/entregas/2026-10_mundo/vfx_items/basic_freeze.png` |
| C-PROC-combo_ramp | "Furia Creciente" (combo_ramp) | `art-source/entregas/2026-10_mundo/vfx_items/combo_ramp.png` |
| C-PROC-crit_quake | "Golpe Sísmico" (crit_quake) | `art-source/entregas/2026-10_mundo/vfx_items/crit_quake.png` |
| C-PROC-frost_aura | "Aliento Glacial" (frost_aura) | `art-source/entregas/2026-10_mundo/vfx_items/frost_aura.png` |
| C-PROC-ignite_basic | "Brasa Viva" (ignite_basic) | `art-source/entregas/2026-10_mundo/vfx_items/ignite_basic.png` |
| C-PROC-bleed_basic | "Filo Sediento" (bleed_basic) | `art-source/entregas/2026-10_mundo/vfx_items/bleed_basic.png` |
| C-PROC-haste_on_kill | "Paso del Cazador" (haste_on_kill) | `art-source/entregas/2026-10_mundo/vfx_items/haste_on_kill.png` |
| C-PROC-ally_ward | "Guardia Juramentada" (ally_ward) | `art-source/entregas/2026-10_mundo/vfx_items/ally_ward.png` |
| C-PROC-retaliate | "Represalia" (retaliate) | `art-source/entregas/2026-10_mundo/vfx_items/retaliate.png` |
| C-PROC-heal_haste | "Gracia Veloz" (heal_haste) | `art-source/entregas/2026-10_mundo/vfx_items/heal_haste.png` |
| C-PROC-execute_edge | "Filo del Verdugo" (execute_edge) | `art-source/entregas/2026-10_mundo/vfx_items/execute_edge.png` |
| C-PROC-shock_skill | "Descarga Arcana" (shock_skill) | `art-source/entregas/2026-10_mundo/vfx_items/shock_skill.png` |
| C-PROC-burn_vs | "Avivar las Llamas" (burn_vs) | `art-source/entregas/2026-10_mundo/vfx_items/burn_vs.png` |
| C-PROC-cold_crit | "Frío que Quiebra" (cold_crit) | `art-source/entregas/2026-10_mundo/vfx_items/cold_crit.png` |
| C-PROC-spore_rot | "Esporas Pútridas" (spore_rot) | `art-source/entregas/2026-10_mundo/vfx_items/spore_rot.png` |
| C-PROC-myth_winter | "Invierno Sin Fin" (myth_winter) | `art-source/entregas/2026-10_mundo/vfx_items/myth_winter.png` |
| C-PROC-myth_inferno | "Combustión Perpetua" (myth_inferno) | `art-source/entregas/2026-10_mundo/vfx_items/myth_inferno.png` |
| C-PROC-myth_storm | "Tormenta Viva" (myth_storm) | `art-source/entregas/2026-10_mundo/vfx_items/myth_storm.png` |
| C-PROC-myth_bastion | "Último Bastión" (myth_bastion) | `art-source/entregas/2026-10_mundo/vfx_items/myth_bastion.png` |
| C-PROC-myth_harvest | "Cosecha Roja" (myth_harvest) | `art-source/entregas/2026-10_mundo/vfx_items/myth_harvest.png` |
| C-PROC-myth_dawn | "Alba Eterna" (myth_dawn) | `art-source/entregas/2026-10_mundo/vfx_items/myth_dawn.png` |
| C-PROC-myth_echo | "Eco del Vacío" (myth_echo) | `art-source/entregas/2026-10_mundo/vfx_items/myth_echo.png` |
| C-PROC-myth_eclipse | "Eclipse" (myth_eclipse) | `art-source/entregas/2026-10_mundo/vfx_items/myth_eclipse.png` |
| C-PROC-uniq_archimago | "Fuego del Vacío" (uniq_archimago) | `art-source/entregas/2026-10_mundo/vfx_items/uniq_archimago.png` |
| C-PROC-uniq_juggernaut | "Paso del Coloso" (uniq_juggernaut) | `art-source/entregas/2026-10_mundo/vfx_items/uniq_juggernaut.png` |
| C-PROC-uniq_lunaroja | "Luna Roja" (uniq_lunaroja) | `art-source/entregas/2026-10_mundo/vfx_items/uniq_lunaroja.png` |

---

## 7. Categoría D · Arenas

Cantidad: **124 filas** (P0 21 · P1 65 · P2 38). Fuentes: `LA_HORDA_MISSING_ASSETS.md`, `LA_HORDA_*_MISSING_ASSETS.md`, `LA_HORDA_ABISMO_ASSETS.md`, `ARENA_ASSET_REQUIREMENTS.md`, `SPRITE_PRODUCTION_LIST.md` y los informes de `docs/art-gate/` (cada fila indica `verif.`: lo que viene solo de un documento está marcado `doc`).

### 7.1 Portadas de arena (11 JPG 960×420 → pixel nativo)

Se ven en el Códice (`js/ui/codex/codex.js:270`), el Libro (`codex-book-art.js:20`, teñidas de tinta), la ficha de arena (`js/ui/arena-briefing.js:58`), el campamento (`js/systems/camp.js:204,298`) y las pantallas de historia (`js/systems/story.js:340`). La extensión `.jpg` está fija en cinco sitios del código (H6 de la especificación): entregar PNG igual; Claude cambia el resolvedor. **Las actuales son capturas de partida** (héroes, hechizos y marcas de UI a la vista; la de `minas` trae marcas numeradas y texto): la nueva es una **ilustración de la arena sin personajes, sin marcas y sin texto**. Composición: el Libro recorta y panea el centro, mantener el motivo en el tercio central. Ejemplos de referencia: no existe ninguna portada pixel aún; usa como paleta y densidad el suelo y los props nativos de esa arena (hoja `06` y `07`) y como forma de pintura la hoja `08`.

| ID | Arena | P | Formato | Entrega | Reemplaza (hoy JPG) | Referencia |
|---|---|---|---|---|---|---|
| D-PORTADA-abismo | Abismo | P0 | 960×420 PNG pixel nativo, sin texto, ≤ 250 tonos, ≤ 170 KB | `art-source/entregas/2026-10_mundo/portadas/abismo.png` | `assets/ui/codex/arenas/abismo.jpg` | `assets/sprites/battlefield/oak.png`<br>`assets/vfx/ciudad/tex_calle.png` |
| D-PORTADA-acuatica | Acuática | P1 | 960×420 PNG pixel nativo, sin texto, ≤ 250 tonos, ≤ 170 KB | `art-source/entregas/2026-10_mundo/portadas/acuatica.png` | `assets/ui/codex/arenas/acuatica.jpg` | `assets/sprites/battlefield/oak.png`<br>`assets/vfx/ciudad/tex_calle.png` |
| D-PORTADA-bosque | Bosque/Ruinas | P1 | 960×420 PNG pixel nativo, sin texto, ≤ 250 tonos, ≤ 170 KB | `art-source/entregas/2026-10_mundo/portadas/bosque.png` | `assets/ui/codex/arenas/bosque.jpg` | `assets/sprites/battlefield/oak.png`<br>`assets/vfx/ciudad/tex_calle.png` |
| D-PORTADA-ciudad | Ciudad Maldita | P0 | 960×420 PNG pixel nativo, sin texto, ≤ 250 tonos, ≤ 170 KB | `art-source/entregas/2026-10_mundo/portadas/ciudad.png` | `assets/ui/codex/arenas/ciudad.jpg` | `assets/sprites/battlefield/oak.png`<br>`assets/vfx/ciudad/tex_calle.png` |
| D-PORTADA-divina | Divina | P1 | 960×420 PNG pixel nativo, sin texto, ≤ 250 tonos, ≤ 170 KB | `art-source/entregas/2026-10_mundo/portadas/divina.png` | `assets/ui/codex/arenas/divina.jpg` | `assets/sprites/battlefield/oak.png`<br>`assets/vfx/ciudad/tex_calle.png` |
| D-PORTADA-fortaleza | Fábrica/Fortaleza | P1 | 960×420 PNG pixel nativo, sin texto, ≤ 250 tonos, ≤ 170 KB | `art-source/entregas/2026-10_mundo/portadas/fortaleza.png` | `assets/ui/codex/arenas/fortaleza.jpg` | `assets/sprites/battlefield/oak.png`<br>`assets/vfx/ciudad/tex_calle.png` |
| D-PORTADA-hielo | Gélida | P1 | 960×420 PNG pixel nativo, sin texto, ≤ 250 tonos, ≤ 170 KB | `art-source/entregas/2026-10_mundo/portadas/hielo.png` | `assets/ui/codex/arenas/hielo.jpg` | `assets/sprites/battlefield/oak.png`<br>`assets/vfx/ciudad/tex_calle.png` |
| D-PORTADA-infernal | Infernal | P0 | 960×420 PNG pixel nativo, sin texto, ≤ 250 tonos, ≤ 170 KB | `art-source/entregas/2026-10_mundo/portadas/infernal.png` | `assets/ui/codex/arenas/infernal.jpg` | `assets/sprites/battlefield/oak.png`<br>`assets/vfx/ciudad/tex_calle.png` |
| D-PORTADA-laberinto | Laberinto | P1 | 960×420 PNG pixel nativo, sin texto, ≤ 250 tonos, ≤ 170 KB | `art-source/entregas/2026-10_mundo/portadas/laberinto.png` | `assets/ui/codex/arenas/laberinto.jpg` | `assets/sprites/battlefield/oak.png`<br>`assets/vfx/ciudad/tex_calle.png` |
| D-PORTADA-micelial | Reino Fúngico | P1 | 960×420 PNG pixel nativo, sin texto, ≤ 250 tonos, ≤ 170 KB | `art-source/entregas/2026-10_mundo/portadas/micelial.png` | `assets/ui/codex/arenas/micelial.jpg` | `assets/sprites/battlefield/oak.png`<br>`assets/vfx/ciudad/tex_calle.png` |
| D-PORTADA-minas | Minas Profundas | P0 | 960×420 PNG pixel nativo, sin texto, ≤ 250 tonos, ≤ 170 KB | `art-source/entregas/2026-10_mundo/portadas/minas.png` | `assets/ui/codex/arenas/minas.jpg` | `assets/sprites/battlefield/oak.png`<br>`assets/vfx/ciudad/tex_calle.png` |

### 7.2 Suelos y texturas

Canon: **2,0 u/px**, ≤ 250 tonos, sin JPG, sin degradé, vecino más cercano. Ejemplos de referencia (hoja `06_suelos_texturas.webp`): `assets/vfx/ciudad/tex_calle.png`, `assets/vfx/ciudad/tex_adoquin.png`, `assets/vfx/minas/tex_piso_galerias.png`, `assets/vfx/abismo/tex_piso.png`.

| ID | Asset | P | Formato | Entrega | Destino en el juego | Referencia | Estado |
|---|---|---|---|---|---|---|---|
| D-SUELO-bosque | Suelo/tile de la arena "bosque" | P1 | PNG sin costuras (tile repetible), 2,0 u/px (≈64×64 o 96×96 px nativos), ≤ 250 tonos, sin JPG ni degradé, 3–4 variantes de piedra/terreno + 1 de borde. Es FONDO: poco contraste (la horda debe leerse primero). | `art-source/entregas/2026-10_mundo/arenas/bosque/tex_piso.png` | [PROPUESTA] assets/vfx/bosque/tex_piso.png (mismo patrón que abismo/ciudad/minas) | `assets/vfx/ciudad/tex_calle.png`<br>`assets/vfx/minas/tex_piso_galerias.png` | procedural (código) |
| D-SUELO-hielo | Suelo/tile de la arena "hielo" | P1 | PNG sin costuras (tile repetible), 2,0 u/px (≈64×64 o 96×96 px nativos), ≤ 250 tonos, sin JPG ni degradé, 3–4 variantes de piedra/terreno + 1 de borde. Es FONDO: poco contraste (la horda debe leerse primero). | `art-source/entregas/2026-10_mundo/arenas/hielo/tex_piso.png` | [PROPUESTA] assets/vfx/hielo/tex_piso.png (mismo patrón que abismo/ciudad/minas) | `assets/vfx/ciudad/tex_calle.png`<br>`assets/vfx/minas/tex_piso_galerias.png` | procedural (código) |
| D-SUELO-laberinto | Suelo/tile de la arena "laberinto" | P1 | PNG sin costuras (tile repetible), 2,0 u/px (≈64×64 o 96×96 px nativos), ≤ 250 tonos, sin JPG ni degradé, 3–4 variantes de piedra/terreno + 1 de borde. Es FONDO: poco contraste (la horda debe leerse primero). | `art-source/entregas/2026-10_mundo/arenas/laberinto/tex_piso.png` | [PROPUESTA] assets/vfx/laberinto/tex_piso.png (mismo patrón que abismo/ciudad/minas) | `assets/vfx/ciudad/tex_calle.png`<br>`assets/vfx/minas/tex_piso_galerias.png` | procedural (código) |
| D-SUELO-infernal | Suelo/tile de la arena "infernal" | P1 | PNG sin costuras (tile repetible), 2,0 u/px (≈64×64 o 96×96 px nativos), ≤ 250 tonos, sin JPG ni degradé, 3–4 variantes de piedra/terreno + 1 de borde. Es FONDO: poco contraste (la horda debe leerse primero). | `art-source/entregas/2026-10_mundo/arenas/infernal/tex_piso.png` | [PROPUESTA] assets/vfx/infernal/tex_piso.png (mismo patrón que abismo/ciudad/minas) | `assets/vfx/ciudad/tex_calle.png`<br>`assets/vfx/minas/tex_piso_galerias.png` | procedural (código) |
| D-SUELO-divina | Suelo/tile de la arena "divina" | P2 | PNG sin costuras (tile repetible), 2,0 u/px (≈64×64 o 96×96 px nativos), ≤ 250 tonos, sin JPG ni degradé, 3–4 variantes de piedra/terreno + 1 de borde. Es FONDO: poco contraste (la horda debe leerse primero). | `art-source/entregas/2026-10_mundo/arenas/divina/tex_piso.png` | [PROPUESTA] assets/vfx/divina/tex_piso.png (mismo patrón que abismo/ciudad/minas) | `assets/vfx/ciudad/tex_calle.png`<br>`assets/vfx/minas/tex_piso_galerias.png` | procedural (código) |
| D-SUELO-acuatica | Suelo/tile de la arena "acuatica" | P2 | PNG sin costuras (tile repetible), 2,0 u/px (≈64×64 o 96×96 px nativos), ≤ 250 tonos, sin JPG ni degradé, 3–4 variantes de piedra/terreno + 1 de borde. Es FONDO: poco contraste (la horda debe leerse primero). | `art-source/entregas/2026-10_mundo/arenas/acuatica/tex_piso.png` | [PROPUESTA] assets/vfx/acuatica/tex_piso.png (mismo patrón que abismo/ciudad/minas) | `assets/vfx/ciudad/tex_calle.png`<br>`assets/vfx/minas/tex_piso_galerias.png` | procedural (código) |
| D-SUELO-abismo-tex_carne | Textura del Abismo "tex_carne" (PALETA_EXCESIVA) | P2 | PNG 56×205 mismo lienzo, ≤ 250 tonos (hoy 345), sin degradé. | `art-source/entregas/2026-10_mundo/arenas/abismo/tex_carne.png` | [REEMPLAZA] assets/vfx/abismo/tex_carne.png | `assets/vfx/abismo/tex_piso.png` | rehacer (PALETA_EXCESIVA) |
| D-SUELO-abismo-tex_tentaculo | Textura del Abismo "tex_tentaculo" (PALETA_EXCESIVA) | P2 | PNG 56×205 mismo lienzo, ≤ 250 tonos (hoy 549), sin degradé. | `art-source/entregas/2026-10_mundo/arenas/abismo/tex_tentaculo.png` | [REEMPLAZA] assets/vfx/abismo/tex_tentaculo.png | `assets/vfx/abismo/tex_piso.png` | rehacer (PALETA_EXCESIVA) |

### 7.3 Props de decorado dibujados por código (34) e incrustaciones (13)

Modelo a imitar: los 32 PNG de `assets/sprites/battlefield/` (hoja `07_props_decorado.webp`; se registran con `BATTLEFIELD_META[clave]` y `battlefieldProp(clave,x,y,alto,radio)`). Un prop pintado **no puede cambiar la colisión** (`aidSolids`).

| ID | Prop (canvas actual) | Arena | P | Entrega | Fuente |
|---|---|---|---|---|---|
| infcolumn | infColumn+v 30×70 | infernal | P1 | `art-source/entregas/2026-10_mundo/arenas/infernal/prop_infcolumn.png` | `js/rendering/arena-props.js:39` |
| infaltar | infAltar 64×44 | infernal | P1 | `art-source/entregas/2026-10_mundo/arenas/infernal/prop_infaltar.png` | `js/rendering/arena-props.js:64` |
| infstatue | infStatue 34×62 | infernal | P1 | `art-source/entregas/2026-10_mundo/arenas/infernal/prop_infstatue.png` | `js/rendering/arena-props.js:84` |
| infbrazier | infBrazier 18×26 | infernal | P1 | `art-source/entregas/2026-10_mundo/arenas/infernal/prop_infbrazier.png` | `js/rendering/arena-props.js:98` |
| infpentagram | infPentagram 280×200 | infernal | P2 | `art-source/entregas/2026-10_mundo/arenas/infernal/prop_infpentagram.png` | `js/rendering/arena-props.js:105` |
| inffissure | infFissure+v 150×60 | infernal | P1 | `art-source/entregas/2026-10_mundo/arenas/infernal/prop_inffissure.png` | `js/rendering/arena-props.js:121` |
| scorch | scorch+v 90×50 | varias | P2 | `art-source/entregas/2026-10_mundo/arenas/varias/prop_scorch.png` | `js/rendering/arena-props.js:132` |
| icepillar | icePillar+v 30×80 | hielo | P1 | `art-source/entregas/2026-10_mundo/arenas/hielo/prop_icepillar.png` | `js/rendering/arena-props.js:137` |
| icecluster | iceCluster+v 44×36 | hielo | P1 | `art-source/entregas/2026-10_mundo/arenas/hielo/prop_icecluster.png` | `js/rendering/arena-props.js:155` |
| icearch | iceArch 110×80 | hielo | P1 | `art-source/entregas/2026-10_mundo/arenas/hielo/prop_icearch.png` | `js/rendering/arena-props.js:165` |
| icestatue | iceStatue 32×66 | hielo | P1 | `art-source/entregas/2026-10_mundo/arenas/hielo/prop_icestatue.png` | `js/rendering/arena-props.js:182` |
| frozenlake | frozenLake 300×200 | hielo | P2 | `art-source/entregas/2026-10_mundo/arenas/hielo/prop_frozenlake.png` | `js/rendering/arena-props.js:193` |
| snowdrift | snowDrift+v 110×50 | hielo | P1 | `art-source/entregas/2026-10_mundo/arenas/hielo/prop_snowdrift.png` | `js/rendering/arena-props.js:211` |
| icecrack | iceCrack+v 120×70 | hielo | P1 | `art-source/entregas/2026-10_mundo/arenas/hielo/prop_icecrack.png` | `js/rendering/arena-props.js:214` |
| menhir | menhir+v 24×60 | bosque | P1 | `art-source/entregas/2026-10_mundo/arenas/bosque/prop_menhir.png` | `js/rendering/arena-props.js:225` |
| ancienttree | ancientTree+v 100×130 | bosque | P1 | `art-source/entregas/2026-10_mundo/arenas/bosque/prop_ancienttree.png` | `js/rendering/arena-props.js:244` |
| celticstatue | celticStatue 30×64 | bosque | P1 | `art-source/entregas/2026-10_mundo/arenas/bosque/prop_celticstatue.png` | `js/rendering/arena-props.js:264` |
| ruinarch | ruinArch 96×80 | bosque | P1 | `art-source/entregas/2026-10_mundo/arenas/bosque/prop_ruinarch.png` | `js/rendering/arena-props.js:274` |
| ritualcircle | ritualCircle 300×210 | bosque | P2 | `art-source/entregas/2026-10_mundo/arenas/bosque/prop_ritualcircle.png` | `js/rendering/arena-props.js:286` |
| moss | moss+v 100×54 | bosque | P1 | `art-source/entregas/2026-10_mundo/arenas/bosque/prop_moss.png` | `js/rendering/arena-props.js:303` |
| roots | roots+v 160×80 | bosque | P1 | `art-source/entregas/2026-10_mundo/arenas/bosque/prop_roots.png` | `js/rendering/arena-props.js:307` |
| stream | stream 420×90 | bosque | P2 | `art-source/entregas/2026-10_mundo/arenas/bosque/prop_stream.png` | `js/rendering/arena-props.js:319` |
| obelisk | obelisk 26×90 | laberinto | P1 | `art-source/entregas/2026-10_mundo/arenas/laberinto/prop_obelisk.png` | `js/rendering/arena-props.js:332` |
| minochamber | minoChamber 420×290 | laberinto | P2 | `art-source/entregas/2026-10_mundo/arenas/laberinto/prop_minochamber.png` | `js/rendering/arena-props.js:341` |
| sanddrift | sandDrift+v 120×50 | laberinto | P1 | `art-source/entregas/2026-10_mundo/arenas/laberinto/prop_sanddrift.png` | `js/rendering/arena-props.js:363` |
| brokentiles | brokenTiles+v 80×50 | laberinto | P1 | `art-source/entregas/2026-10_mundo/arenas/laberinto/prop_brokentiles.png` | `js/rendering/arena-props.js:367` |
| sunkcolumn | sunkColumn+v 30×76 | acuatica | P2 | `art-source/entregas/2026-10_mundo/arenas/acuatica/prop_sunkcolumn.png` | `js/rendering/arena-props.js:373` |
| tomb | tomb 56×36 | acuatica | P2 | `art-source/entregas/2026-10_mundo/arenas/acuatica/prop_tomb.png` | `js/rendering/arena-props.js:386` |
| coral | coral+v 44×40 | acuatica | P2 | `art-source/entregas/2026-10_mundo/arenas/acuatica/prop_coral.png` | `js/rendering/arena-props.js:396` |
| shipwreck | shipwreck 150×80 | acuatica | P2 | `art-source/entregas/2026-10_mundo/arenas/acuatica/prop_shipwreck.png` | `js/rendering/arena-props.js:404` |
| sunktemple | sunkTemple 340×230 | acuatica | P2 | `art-source/entregas/2026-10_mundo/arenas/acuatica/prop_sunktemple.png` | `js/rendering/arena-props.js:418` |
| sandripples | sandRipples+v 130×60 | laberinto | P1 | `art-source/entregas/2026-10_mundo/arenas/laberinto/prop_sandripples.png` | `js/rendering/arena-props.js:431` |
| angelstatue | angelStatue 40×70 | divina | P2 | `art-source/entregas/2026-10_mundo/arenas/divina/prop_angelstatue.png` | `js/rendering/arena-props.js:438` |
| infspike | infSpike+v 30×64 | infernal | P1 | `art-source/entregas/2026-10_mundo/arenas/infernal/prop_infspike.png` | `js/rendering/arena-props.js:448` |

Incrustaciones de suelo `inlay-<arena>` (64×40, 3 variantes cada una, `aidArtInlay`):

| ID | Arena | Entrega |
|---|---|---|
| D-PROP-inlay-ciudad | inlay-ciudad | `art-source/entregas/2026-10_mundo/arenas/ciudad/inlay_<v>.png` |
| D-PROP-inlay-fortaleza | inlay-fortaleza | `art-source/entregas/2026-10_mundo/arenas/fortaleza/inlay_<v>.png` |
| D-PROP-inlay-bosque | inlay-bosque | `art-source/entregas/2026-10_mundo/arenas/bosque/inlay_<v>.png` |
| D-PROP-inlay-micelial | inlay-micelial | `art-source/entregas/2026-10_mundo/arenas/micelial/inlay_<v>.png` |
| D-PROP-inlay-hielo | inlay-hielo | `art-source/entregas/2026-10_mundo/arenas/hielo/inlay_<v>.png` |
| D-PROP-inlay-acuatica | inlay-acuatica | `art-source/entregas/2026-10_mundo/arenas/acuatica/inlay_<v>.png` |
| D-PROP-inlay-laberinto | inlay-laberinto | `art-source/entregas/2026-10_mundo/arenas/laberinto/inlay_<v>.png` |
| D-PROP-inlay-abismo | inlay-abismo | `art-source/entregas/2026-10_mundo/arenas/abismo/inlay_<v>.png` |
| D-PROP-inlay-minas | inlay-minas | `art-source/entregas/2026-10_mundo/arenas/minas/inlay_<v>.png` |
| D-PROP-inlay-infernal | inlay-infernal | `art-source/entregas/2026-10_mundo/arenas/infernal/inlay_<v>.png` |
| D-PROP-inlay-divina | inlay-divina | `art-source/entregas/2026-10_mundo/arenas/divina/inlay_<v>.png` |
| D-PROP-inlay-coliseo | inlay-coliseo | `art-source/entregas/2026-10_mundo/arenas/coliseo/inlay_<v>.png` |
| D-PROP-inlay-convergencia | inlay-convergencia | `art-source/entregas/2026-10_mundo/arenas/convergencia/inlay_<v>.png` |

### 7.4 Mecánicas y reglas de jefe (A-xx de `LA_HORDA_MISSING_ASSETS.md`)

Todas las rutas destino están **verificadas como inexistentes**.

| ID | Asset | P | Tamaño / frames | Ruta destino | Estado verificado | Entrega | Referencia |
|---|---|---|---|---|---|---|---|
| D-MEC-A-02 | A-02 Pared agrietada del Laberinto (intacta, agrietada ×3, derrumbe ×8, escombro) | P0 | Tramo horizontal 64×32 y vertical 32×64 tileables; 2 direcciones. | `assets/sprites/arenas/laberinto/pared_agrietada.png` | inexistente (ruta destino verificada ausente) | `art-source/entregas/2026-10_mundo/arenas/laberinto/pared_agrietada.png` | `assets/vfx/skins/manada/sigil_0.png` |
| D-MEC-A-05 | A-05 Focos de Convergencia ×4 (idle 6 + quiebre 8; 4 colores) | P1 | 48×96 por cuadro. | `assets/sprites/bosses/infernal/focos/ancestral.png` | inexistente (ruta destino verificada ausente) | `art-source/entregas/2026-10_mundo/arenas/infernal/focos_convergencia.png` | `assets/vfx/skins/manada/sigil_0.png` |
| D-MEC-A-06 | A-06 Tentáculos del Leviatán por función (GOLPE/AGARRE/CORRIENTE) | P1 | 64×128; emerger 4, idle 4, acción 6, hundirse 4; 3 variantes + anillo de agarre 4. | `assets/sprites/bosses/acuatica/leviatan_tent/golpe.png` | inexistente (ruta destino verificada ausente) | `art-source/entregas/2026-10_mundo/arenas/acuatica/tentaculos_leviatan.png` | `assets/vfx/skins/manada/sigil_0.png` |
| D-MEC-A-07 | A-07 Foco de Hielo (idle 6 + quiebre 8) | P1 | 48×96. | `assets/sprites/bosses/hielo/foco_hielo.png` | inexistente (ruta destino verificada ausente) | `art-source/entregas/2026-10_mundo/arenas/hielo/foco_hielo.png` | `assets/vfx/skins/manada/sigil_0.png` |
| D-MEC-A-08 | A-08 Red micelial: raíz-tendón (tileable) y Corazón abierto | P1 | Raíz 64×24 latido 4; corazón 128×128 latido 6. | `assets/sprites/arenas/micelial/raiz_red.png` | inexistente (ruta destino verificada ausente) | `art-source/entregas/2026-10_mundo/arenas/micelial/red_micelial.png` | `assets/vfx/minas/cadena_tension_2.png` |
| D-MEC-A-09 | A-09 Cometa del Gran Número (vuelo 6, impacto 5; + versión "reflejado" dorada) | P1 | 48×48. | `assets/vfx/ciudad/cometa.png` | inexistente (ruta destino verificada ausente) | `art-source/entregas/2026-10_mundo/arenas/ciudad/cometa_gran_numero.png` | `assets/vfx/skins/manada/sigil_0.png` |
| D-MEC-A-11 | A-11 Brasero de hielo (encendido 6 loop, apagado 1, prendiéndose 4, congelado 3) | P1 | 48×64. | `assets/sprites/arenas/hielo/brasero.png` | inexistente (ruta destino verificada ausente) | `art-source/entregas/2026-10_mundo/arenas/hielo/brasero_hielo.png` | `assets/vfx/minas/lampara_apaga_0.png` |
| D-MEC-A-12 | A-12 Sellos de piedra I / II / III (apagado 1, encendido 4 loop, error 3) | P1 | 64×64, 3 variantes. | `assets/sprites/arenas/laberinto/sello_1.png` | inexistente (ruta destino verificada ausente) | `art-source/entregas/2026-10_mundo/arenas/laberinto/sellos_piedra.png` | `assets/vfx/skins/manada/sigil_0.png` |
| D-MEC-A-13 | A-13 Corriente, remolino, chorro y charco conductor | P1 | Corriente 64×32 tileable (6); remolino 96×96 (8); chorro 32×32 + columna 32×96 (6); charco 64×40 (1+4+5). | `assets/vfx/acuatica/corriente.png` | inexistente (ruta destino verificada ausente) | `art-source/entregas/2026-10_mundo/arenas/acuatica/corriente_chorro_charco.png` | `assets/vfx/skins/manada/sigil_0.png` |
| D-MEC-A-14 | A-14 Runa del menhir y maleza de emboscada | P1 | Runa 32×64 (cargando 4, lista 4 loop, disparo 5); maleza 48×40 (1+4+4+6). | `assets/sprites/arenas/bosque/runa.png` | inexistente (ruta destino verificada ausente) | `art-source/entregas/2026-10_mundo/arenas/bosque/runa_maleza.png` | `assets/vfx/skins/manada/sigil_0.png` |
| D-MEC-A-15 | A-15 Fisura de la Horda (abrir 6, 3 etapas ×4, sellada) y sigilos HORDA/VIDA/PIEL | P2 | Fisura 96×48; sigilo 32×32 ×3 (6 cuadros). | `assets/vfx/infernal/fisura.png` | inexistente (ruta destino verificada ausente) | `art-source/entregas/2026-10_mundo/arenas/infernal/fisura_sigilos.png` | `assets/vfx/skins/manada/sigil_0.png` |

### 7.5 Ciudad Maldita (escenario, VFX y civiles)

Los personajes `CM-A*` no se listan aquí (ver 3.4). Los civiles sí: verificados contra `js/assets/ciudad-meta.js`.

| ID | Asset | P | Tamaño / frames | Entrega | Referencia | Estado | Verif. |
|---|---|---|---|---|---|---|---|
| D-CIUDAD-CM-T01 | CM-T01 Techos de tejas: tile + bordes + cumbrera + chimenea | P0 | tiles 32×32, 9-slice. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t01_techos_de_tejas_tile_bordes.png` | `assets/vfx/ciudad/tex_adoquin.png` | parcial | doc |
| D-CIUDAD-CM-T02 | CM-T02 Cara de pared exterior con ventanas y puerta abierta | P0 | tiles 32×64. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t02_cara_de_pared_exterior_con.png` | `assets/vfx/ciudad/tex_adoquin.png` | parcial | doc |
| D-CIUDAD-CM-T03 | CM-T03 Techo dañado / con agujeros / en llamas (3 estados) | P0 | tiles 32×32 por estado. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t03_techo_danado_con_agujeros_en.png` | `assets/vfx/ciudad/tex_adoquin.png` | procedural/prestado | doc |
| D-CIUDAD-CM-T04 | CM-T04 Ruinas de edificio derrumbado | P0 | 256×160 · 2 variantes. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t04_ruinas_de_edificio_derrumbado.png` | `assets/vfx/ciudad/tex_adoquin.png` | procedural/prestado | doc |
| D-CIUDAD-CM-T05 | CM-T05 Muebles de interior (mesa, cama, alacena, chimenea, alfombra) | P1 | 32–64 px, 1 cuadro c/u. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t05_muebles_de_interior_mesa_cama.png` | `assets/vfx/ciudad/tex_adoquin.png` | procedural/prestado | doc |
| D-CIUDAD-CM-T06 | CM-T06 Refugio / Capilla / Torre de Vigía / Campanario (edificios propios) | P0 | 256×256 c/u · 4 estados. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t06_refugio_capilla_torre_de.png` | `assets/vfx/ciudad/tex_adoquin.png` | procedural/prestado | doc |
| D-CIUDAD-CM-T07 | CM-T07 Puerta de Evacuación (reja arriba / abajo / rota) | P0 | 340×150 · 3 estados. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t07_puerta_de_evacuacion_reja.png` | `assets/vfx/ciudad/tex_adoquin.png` | parcial | doc |
| D-CIUDAD-CM-T08 | CM-T08 Estatua maldita con fuente (vista superior) | P1 | 200×220 · 4 cuadros de agua. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t08_estatua_maldita_con_fuente.png` | `assets/vfx/ciudad/tex_adoquin.png` | parcial | doc |
| D-CIUDAD-CM-T09 | CM-T09 Escenario de la catedral (tablas, telón, reflectores) | P0 | 900×420. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t09_escenario_de_la_catedral.png` | `assets/vfx/ciudad/tex_adoquin.png` | procedural/prestado | doc |
| D-CIUDAD-CM-T10 | CM-T10 Rejilla de cloaca, campana en el piso, farol, barricada | P1 | 48–96 px. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t10_rejilla_de_cloaca_campana_en.png` | `assets/vfx/ciudad/tex_adoquin.png` | parcial | doc |
| D-CIUDAD-CM-V01 | CM-V01 Indicador de secuestro (flecha / grillete sobre el Raptor) | P1 | 32×32 · 4 cuadros. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-v01_indicador_de_secuestro_flecha.png` | `assets/vfx/abilities/soulReapBurst_04.png` | procedural/prestado | doc |
| D-CIUDAD-CM-V02 | CM-V02 Destello de rescate (escudo verde que sube) | P1 | 64×64 · 8 cuadros. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-v02_destello_de_rescate_escudo.png` | `assets/vfx/abilities/soulReapBurst_04.png` | procedural/prestado | doc |
| D-CIUDAD-CM-V03 | CM-V03 Cono de reflector (Marca del espectáculo) | P1 | 128×256 · 6 cuadros. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-v03_cono_de_reflector_marca_del.png` | `assets/vfx/abilities/soulReapBurst_04.png` | parcial | doc |
| D-CIUDAD-CM-V04 | CM-V04 Telón a pantalla completa (apagón y final) | P1 | 960×540 · 12 cuadros. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-v04_telon_a_pantalla_completa.png` | `assets/vfx/abilities/soulReapBurst_04.png` | procedural/prestado | doc |
| D-CIUDAD-CM-V05 | CM-V05 Zona segura en el piso (anillo verde con runas) | P2 | 256×180 · 8 cuadros en bucle. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-v05_zona_segura_en_el_piso_anillo.png` | `assets/vfx/abilities/soulReapBurst_04.png` | procedural/prestado | doc |
| D-CIUDAD-CM-C01 | CM-C01 Aldeano / mujer / niño · caminata frente y espalda | P0 | 32×48 · 8 cuadros × 2 vistas × 3 civiles. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-c01_aldeano_mujer_nino_caminata.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | parcial | doc+repo(meta) |
| D-CIUDAD-CM-C02 | CM-C02 Escondido (agachado, temblando) | P0 | 32×48 · 4 cuadros × 3 civiles. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-c02_escondido_agachado_temblando.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | procedural/prestado | doc+repo(meta) |
| D-CIUDAD-CM-C03 | CM-C03 Cargado por el Raptor (pose colgando) | P1 | 32×48 · 4 cuadros × 3 civiles. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-c03_cargado_por_el_raptor_pose.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | procedural/prestado | doc+repo(meta) |
| D-CIUDAD-CM-C04 | CM-C04 Pánico (brazos arriba, corriendo) | P1 | 32×48 · 6 cuadros × 3 civiles. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-c04_panico_brazos_arriba_corriendo.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | parcial | doc+repo(meta) |
| D-CIUDAD-CM-C05 | CM-C05 Entrando al refugio (de espaldas, se desvanece) | P2 | 32×48 · 6 cuadros × 3 civiles. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-c05_entrando_al_refugio_de.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | procedural/prestado | doc+repo(meta) |
| D-CIUDAD-CM-C06 | CM-C06 Variantes extra (anciano, herrero, monja) | P2 | 32×48 · set completo como la hoja. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-c06_variantes_extra_anciano.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | procedural/prestado | doc |
| D-CIUDAD-CM-P02 | CM-P02 Ovación final (canalización 3 s) | P0 | 128×160 · 8 cuadros en bucle. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-p02_ovacion_final_canalizacion_3_s.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | procedural/prestado | doc |
| D-CIUDAD-CM-P03 | CM-P03 Retrato para diálogos | P1 | 96×96 · 1 cuadro + 1 hablando. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-p03_retrato_para_dialogos.png` | `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png` | procedural/prestado | doc |

### 7.6 Minas Profundas

Solo lo que el documento marca como FALTA / SUSTITUTO / PARCIAL (los ✅ ya llegaron; los personajes los mide `enemy_coverage.js`).

| ID | Asset | P | Tamaño / frames | Entrega | Estado | Verif. |
|---|---|---|---|---|---|---|
| D-MINAS-MN-A03 | MN-A03 Portal Infernal · cruce (destello al atravesar) | P0 | 192×192 · 8 cuadros. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/minas/mn-a03_portal_infernal_cruce.png` | FALTA | doc |
| D-MINAS-MN-A04 | MN-A04 Puerta del Umbral · cerrada / quebrándose / abierta | P0 | 320×224 · 1 + 6 + 1 cuadros. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/minas/mn-a04_puerta_del_umbral_cerrada.png` | SUSTITUTO (arco dibujado + `puerta_mina` | doc |
| D-MINAS-MN-A06 | MN-A06 Lanzallamas de Cerbero · cono | P0 | 320×128 · inicio 3 + bucle 6 + fin 3 cuadros, apuntando a la derecha. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/minas/mn-a06_lanzallamas_de_cerbero_cono.png` | PARCIAL (se estira `mnFlame` de la hoja) | doc |
| D-MINAS-MN-A07 | MN-A07 Brasero · encendido / parpadeo / apagado | P0 | 48×64 · 4 + 4 + 1 cuadros. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/minas/mn-a07_brasero_encendido_parpadeo.png` | SUSTITUTO (`lampara_apaga_*`) | doc |
| D-MINAS-MN-A08 | MN-A08 Farol · parpadeo | P0 | 48×64 · 4 cuadros en bucle + 1 apagado. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/minas/mn-a08_farol_parpadeo.png` | PARCIAL (1 cuadro + oscurecido por códig | doc |
| D-MINAS-MN-B04 | MN-B04 Antorcha personal del guardián | P1 | 16×32 · 4 cuadros en bucle + 1 "sofocada" (Escupidor). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/minas/mn-b04_antorcha_personal_del_guardian.png` | SUSTITUTO (solo el círculo de luz) | doc |
| D-MINAS-MN-B05 | MN-B05 Jaula del montacargas + cable | P1 | 96×112 · 1 cuadro + 4 cuadros de bajada. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/minas/mn-b05_jaula_del_montacargas_cable.png` | SUSTITUTO (dibujada por código) | doc |
| D-MINAS-MN-B06 | MN-B06 Escombros del Titán | P1 | 3 variantes de 64×48. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/minas/mn-b06_escombros_del_titan.png` | SUSTITUTO (roca de la hoja recortada) | doc |
| D-MINAS-MN-B09 | MN-B09 Retrato de Cerbero para carteles | P1 | 96×96 · 1 quieto + 1 rugiendo. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/minas/mn-b09_retrato_de_cerbero_para.png` | PARCIAL (recorte del cuerpo) | doc |
| D-MINAS-MN-B10 | MN-B10 Carteles de sector | P1 | 480×96 · 6 placas de madera o hierro con el nombre del sector. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/minas/mn-b10_carteles_de_sector.png` | FALTA (texto sobre fondo) | doc |

### 7.7 Abismo

Los enemigos y jefes del Abismo (`AB-EN-*`, `AB-SB-01`, `AB-BO-01..03`) están cubiertos en 6.1/6.3. Aquí queda el entorno, VFX, telégrafos y proyectiles.

| ID | Asset | P | Entrega | Verif. |
|---|---|---|---|---|
| D-ABISMO-SB-02 | AB-SB-02 Pieza de cadena (eslabón, tramo, cadena rota, gancho) | P1 | `art-source/entregas/2026-10_mundo/arenas/abismo/ab_sb_02.png` | doc |
| D-ABISMO-BO-04 | AB-BO-04 Siluetas gigantes para el fondo de la fase 3 (cuerpo, tentáculos lejanos) | P1 | `art-source/entregas/2026-10_mundo/arenas/abismo/ab_bo_04.png` | doc |
| D-ABISMO-FX-01 | AB-FX-01 Derrumbe de plataforma (polvo y piedras que caen, 8 frames) | P1 | `art-source/entregas/2026-10_mundo/arenas/abismo/ab_fx_01.png` | doc |
| D-ABISMO-FX-02 | AB-FX-02 Reconstrucción (fragmentos que suben con luz arcana, 8 frames) | P1 | `art-source/entregas/2026-10_mundo/arenas/abismo/ab_fx_02.png` | doc |
| D-ABISMO-FX-03 | AB-FX-03 Caída al vacío (estela violeta hacia abajo, 6 frames) | P2 | `art-source/entregas/2026-10_mundo/arenas/abismo/ab_fx_03.png` | doc |
| D-ABISMO-FX-04 | AB-FX-04 Rescate (destello de manos que suben, 6 frames) | P2 | `art-source/entregas/2026-10_mundo/arenas/abismo/ab_fx_04.png` | doc |
| D-ABISMO-TG-01 | AB-TG-01 Runa de derrumbe (borde de plataforma que se agrieta en rojo, loop 6) | P2 | `art-source/entregas/2026-10_mundo/arenas/abismo/ab_tg_01.png` | doc |
| D-ABISMO-TG-02 | AB-TG-02 Aviso de mandíbula (anillo de dientes en el piso, 6) | P2 | `art-source/entregas/2026-10_mundo/arenas/abismo/ab_tg_02.png` | doc |
| D-ABISMO-PR-01 | AB-PR-01 Orbe del Heraldo (vuelo 6, estallido 6) a 64 px | P1 | `art-source/entregas/2026-10_mundo/arenas/abismo/ab_pr_01.png` | doc |
| D-ABISMO-PR-02 | AB-PR-02 Fragmento del jefe (caída 4, impacto 4) | P2 | `art-source/entregas/2026-10_mundo/arenas/abismo/ab_pr_02.png` | doc |

### 7.8 Gore, decales y destructibles

| ID | Asset | P | Tamaño / frames | Entrega | Referencia | Estado | Verif. |
|---|---|---|---|---|---|---|---|
| D-COMBATE-GO-01 | GO-01 Manchas de suelo por material (sangre, icor, hueso, escarcha, ceniza, esporas) | P0 | Ver ficha GO-01 en LA_HORDA_COMBAT_MISSING_ASSETS.md. | `art-source/entregas/2026-10_mundo/arenas/_comunes/go-01_manchas_de_suelo_por_material.png` | `assets/vfx/abilities/soulReapBurst_04.png` | procedural | doc+repo(archivo) |
| D-COMBATE-GO-02 | GO-02 Trozos desmembrados por material (6 × 4 piezas) | P1 | Ver ficha GO-02 en LA_HORDA_COMBAT_MISSING_ASSETS.md. | `art-source/entregas/2026-10_mundo/arenas/_comunes/go-02_trozos_desmembrados_por.png` | `assets/vfx/abilities/soulReapBurst_04.png` | procedural | doc+repo(archivo) |
| D-COMBATE-GO-03 | GO-03 Overlays de muerte: congelado (estatua), carbonizado, electrocutado | P1 | Ver ficha GO-03 en LA_HORDA_COMBAT_MISSING_ASSETS.md. | `art-source/entregas/2026-10_mundo/arenas/_comunes/go-03_overlays_de_muerte_congelado.png` | `assets/vfx/abilities/soulReapBurst_04.png` | procedural | doc+repo(archivo) |
| D-COMBATE-BR-01 | BR-01 7 objetos × (intacto, a punto de estallar, restos) | P1 | Ver ficha BR-01 en LA_HORDA_COMBAT_MISSING_ASSETS.md. | `art-source/entregas/2026-10_mundo/arenas/_comunes/br-01_7_objetos_intacto_a_punto_de.png` | `assets/vfx/abilities/soulReapBurst_04.png` | procedural | doc+repo(archivo) |

### 7.9 Pendiente de `ARENA_ASSET_REQUIREMENTS.md` (identidad de arenas)

El documento pide landmarks por arena (`infernal_columna_rota`, `infernal_brasero`, `hielo_glaciar_pilar`, `hielo_cristal_cluster`, `celtico_menhir`, `celtico_estatua`, `laberinto_columna`, `laberinto_estatua_esfinge`, partículas de hielo y luciérnagas). **Hoy esos landmarks ya existen como props procedurales** (`aidArtInfColumn`, `aidArtInfBrazier`, `aidArtIcePillar`/`aidArtIceCluster`, `aidArtMenhir`, `aidArtCelticStatue`, `aidArtObelisk`…, ver 7.3): su versión pintada está cubierta por las filas `D-PROP-*`. El documento es anterior a esos props; sus nombres de asset no se reutilizan. **No verifiqué** las partículas ambientales que pide (`hielo_viento`, `luciernaga`) ni la retextura de `labyrinthWalls`.

---

## 8. Categoría E · UI, Códice y Libro

Cantidad: **78 filas** (P0 3 · P1 24 · P2 51).

### 8.1 Íconos de UI de primera pasada que quedaron ambiguos (PR #118)

El PR #118 reemplazó emojis de color por **84 íconos pixel de 16×16** (105 emojis mapeados; `js/ui/pixel-icons.js`, rama `origin/claude/emojis-a-pixel`). Quedan **19 ambiguos** (criterio visual al revisar la hoja `05_iconos_ui_primera_pasada.webp`; ningún gate los mide). Incluyen los que pidió el dueño (caballo, antena, cuerno). Contrato: PNG 16×16, ≤ 6 colores de `PXI_PAL` (`#120806` contorno; oro `#ffcf5c/#b8742a/#fff1b0`; piedra/acero; cuero/madera; sangre/brasa; verdes; azules; pergamino), contorno 1 px, alfa 0/255. Validación: `node tools/art/check-pixel-icons.js` (rama del PR #118). Ejemplo de referencia: los íconos bien resueltos de la misma hoja (`moneda`, `libro`, `copa`, `corazon`, `llave`, `pocion`) y `assets/ui/skill-icons/torbellino.png`.

| ID | Ícono (emoji) | P | Por qué es ambiguo | Entrega |
|---|---|---|---|---|
| E-PXI-idolo | "idolo" (emoji 🗿) | P1 | la cara de piedra no se reconoce (parece un bloque gris). | `art-source/entregas/2026-10_mundo/ui/iconos/idolo.png` |
| E-PXI-figura | "figura" (emoji 🧍) | P1 | persona azul genérica; sin rasgos. | `art-source/entregas/2026-10_mundo/ui/iconos/figura.png` |
| E-PXI-antena | "antena" (emoji 📡) | P1 | se lee como lámpara/torre, no como señal (📡). | `art-source/entregas/2026-10_mundo/ui/iconos/antena.png` |
| E-PXI-cuerno | "cuerno" (emoji 📯) | P1 | se lee como pluma/banana, no como cuerno (📯). | `art-source/entregas/2026-10_mundo/ui/iconos/cuerno.png` |
| E-PXI-caballo | "caballo" (emoji 🐎) | P1 | silueta blanca de una sola masa; no se distingue la cabeza (🐎). | `art-source/entregas/2026-10_mundo/ui/iconos/caballo.png` |
| E-PXI-huellas | "huellas" (emoji 👣) | P1 | dos puntos marrones: no se leen como huellas (👣). | `art-source/entregas/2026-10_mundo/ui/iconos/huellas.png` |
| E-PXI-silencio | "silencio" (emoji 🔇) | P1 | nota tachada con una raya roja larga; ambiguo con "sin sonido" (🔇). | `art-source/entregas/2026-10_mundo/ui/iconos/silencio.png` |
| E-PXI-enlace | "enlace" (emoji 🔗) | P2 | casi idéntico a "cadena" (🔗 vs ⛓). | `art-source/entregas/2026-10_mundo/ui/iconos/enlace.png` |
| E-PXI-cadena | "cadena" (emoji ⛓ 🕸) | P2 | casi idéntico a "enlace"; además se usa para 🕸 (telaraña) que no se parece. | `art-source/entregas/2026-10_mundo/ui/iconos/cadena.png` |
| E-PXI-chispa | "chispa" (emoji 🌸 ✨) | P2 | también se usa para 🌸 (flor) y ✨; se confunde con "estrella"/"brasa". | `art-source/entregas/2026-10_mundo/ui/iconos/chispa.png` |
| E-PXI-estrella | "estrella" (emoji ★) | P2 | muy parecida a "chispa" y "brasa". | `art-source/entregas/2026-10_mundo/ui/iconos/estrella.png` |
| E-PXI-murcielago | "murcielago" (emoji 🦇) | P2 | muy oscuro sobre fondo oscuro; poco contraste (🦇). | `art-source/entregas/2026-10_mundo/ui/iconos/murcielago.png` |
| E-PXI-orbe | "orbe" (emoji 🔮) | P2 | esfera azul genérica (🔮) que se confunde con "luna"/"mundo". | `art-source/entregas/2026-10_mundo/ui/iconos/orbe.png` |
| E-PXI-ticket | "ticket" (emoji 🎟) | P1 | rectángulo dorado ilegible (🎟). | `art-source/entregas/2026-10_mundo/ui/iconos/ticket.png` |
| E-PXI-agujero | "agujero" (emoji 🕳) | P1 | óvalo oscuro: se lee como un plato (🕳). | `art-source/entregas/2026-10_mundo/ui/iconos/agujero.png` |
| E-PXI-carrito | "carrito" (emoji 🛒) | P2 | carrito marrón de forma poco clara (🛒). | `art-source/entregas/2026-10_mundo/ui/iconos/carrito.png` |
| E-PXI-pechera | "pechera" (emoji 🎽) | P2 | peto marrón con cara: se lee como cara/mochila (🎽). | `art-source/entregas/2026-10_mundo/ui/iconos/pechera.png` |
| E-PXI-vapor | "vapor" (emoji ♨) | P2 | taza con vapor: se lee como café, no como calor (♨). | `art-source/entregas/2026-10_mundo/ui/iconos/vapor.png` |
| E-PXI-intercambio | "intercambio" (emoji 🤝) | P2 | 🤝 (apretón de manos) se dibuja como dos flechas. | `art-source/entregas/2026-10_mundo/ui/iconos/intercambio.png` |

### 8.2 Ilustraciones de jefe del Códice (17 que no existen)

Pedido `CX-ILU-01…17` de `LA_HORDA_CODEX_MISSING_ASSETS.md`: ilustración de ficha de **320×200 px nativos entregada ×2 (640×400) sin suavizado**, sin texto, respetando los spoilers (formas `hidden`/`veil` solo si el jefe está derrotado). Se integran sumando un campo `art` a la ficha (código de Claude). Prompt de cada una en el documento fuente (descartar referencias a obras ajenas). Referencia: hoja `08_portadas_y_retratos_codice.webp` (ilustración actual) para la composición, y los sprites nativos del jefe para la densidad.

| ID | Jefe | P | Entrega | Destino |
|---|---|---|---|---|
| E-CODEX-jefe-dragon_forja | Dragón de la Forja | P2 | `art-source/entregas/2026-10_mundo/codice/jefes/dragon_forja.png` | `assets/ui/codex/bosses/dragon_forja.png` |
| E-CODEX-jefe-caballero | Caballero de la Armadura Oxidada | P2 | `art-source/entregas/2026-10_mundo/codice/jefes/caballero.png` | `assets/ui/codex/bosses/caballero.png` |
| E-CODEX-jefe-dobladores | Los Cuatro Reflejos | P2 | `art-source/entregas/2026-10_mundo/codice/jefes/dobladores.png` | `assets/ui/codex/bosses/dobladores.png` |
| E-CODEX-jefe-guardian_ancestral | Guardián Ancestral | P2 | `art-source/entregas/2026-10_mundo/codice/jefes/guardian_ancestral.png` | `assets/ui/codex/bosses/guardian_ancestral.png` |
| E-CODEX-jefe-micelio | Micelio Primigenio | P2 | `art-source/entregas/2026-10_mundo/codice/jefes/micelio.png` | `assets/ui/codex/bosses/micelio.png` |
| E-CODEX-jefe-madre_espora | Madre Espora | P2 | `art-source/entregas/2026-10_mundo/codice/jefes/madre_espora.png` | `assets/ui/codex/bosses/madre_espora.png` |
| E-CODEX-jefe-tundraverx | Tundraverx | P2 | `art-source/entregas/2026-10_mundo/codice/jefes/tundraverx.png` | `assets/ui/codex/bosses/tundraverx.png` |
| E-CODEX-jefe-mago_gelido | Mago Gélido | P2 | `art-source/entregas/2026-10_mundo/codice/jefes/mago_gelido.png` | `assets/ui/codex/bosses/mago_gelido.png` |
| E-CODEX-jefe-kraken_joven | Kraken Joven | P2 | `art-source/entregas/2026-10_mundo/codice/jefes/kraken_joven.png` | `assets/ui/codex/bosses/kraken_joven.png` |
| E-CODEX-jefe-leviatan | Leviatán | P1 | `art-source/entregas/2026-10_mundo/codice/jefes/leviatan.png` | `assets/ui/codex/bosses/leviatan.png` |
| E-CODEX-jefe-guardian_laberinto | Guardián del Laberinto | P2 | `art-source/entregas/2026-10_mundo/codice/jefes/guardian_laberinto.png` | `assets/ui/codex/bosses/guardian_laberinto.png` |
| E-CODEX-jefe-minotauro | Minotauro | P1 | `art-source/entregas/2026-10_mundo/codice/jefes/minotauro.png` | `assets/ui/codex/bosses/minotauro.png` |
| E-CODEX-jefe-carcelero_vacio | Carcelero del Vacío | P2 | `art-source/entregas/2026-10_mundo/codice/jefes/carcelero_vacio.png` | `assets/ui/codex/bosses/carcelero_vacio.png` |
| E-CODEX-jefe-que_mora_debajo | El Que Mora Debajo | P1 | `art-source/entregas/2026-10_mundo/codice/jefes/que_mora_debajo.png` | `assets/ui/codex/bosses/que_mora_debajo.png` |
| E-CODEX-jefe-hechicero_supremo | Hechicero Supremo (velado) | P1 | `art-source/entregas/2026-10_mundo/codice/jefes/hechicero_supremo.png` | `assets/ui/codex/bosses/hechicero_supremo.png` |
| E-CODEX-jefe-jefe_final_triptico | Ángel Corrompido → Gólem → Rey de la Horda (tríptico) | P1 | `art-source/entregas/2026-10_mundo/codice/jefes/jefe_final_triptico.png` | `assets/ui/codex/bosses/jefe_final_triptico.png` |
| E-CODEX-jefe-jinete_sin_cabeza | Jinete Sin Cabeza (Divina) | P2 | `art-source/entregas/2026-10_mundo/codice/jefes/jinete_sin_cabeza.png` | `assets/ui/codex/bosses/jinete_sin_cabeza.png` |

### 8.3 Ilustraciones del Libro de la Horda (18 escenas procedurales)

`js/ui/codex/codex-book-art.js`: 18 escenas dibujadas con canvas (`BOOK_ART_NAMES`), con paleta tinta `#2b1a0e`, pergamino `#e9d7ad`, oro `#e0b060`, brasa `#ff9a4a`. El código recibe un recuadro de **tamaño variable** (W×H) y usa `u = min(W,H)/200`: entregar **400×200 nativos** y confirmar con Claude la proporción de cada página. Además cada arena se muestra con su portada teñida (7.1). El marco grabado con esquinas lo dibuja el código.

| ID | Escena | P | Entrega |
|---|---|---|---|
| E-LIBRO-tapa | tapa | P1 | `art-source/entregas/2026-10_mundo/libro/tapa.png` |
| E-LIBRO-guardianes | guardianes | P1 | `art-source/entregas/2026-10_mundo/libro/guardianes.png` |
| E-LIBRO-horda | horda | P1 | `art-source/entregas/2026-10_mundo/libro/horda.png` |
| E-LIBRO-cicatriz | cicatriz | P2 | `art-source/entregas/2026-10_mundo/libro/cicatriz.png` |
| E-LIBRO-hechicero | hechicero | P1 | `art-source/entregas/2026-10_mundo/libro/hechicero.png` |
| E-LIBRO-mision | mision | P2 | `art-source/entregas/2026-10_mundo/libro/mision.png` |
| E-LIBRO-libro | libro | P2 | `art-source/entregas/2026-10_mundo/libro/libro.png` |
| E-LIBRO-modos | modos | P2 | `art-source/entregas/2026-10_mundo/libro/modos.png` |
| E-LIBRO-progreso | progreso | P2 | `art-source/entregas/2026-10_mundo/libro/progreso.png` |
| E-LIBRO-equipo | equipo | P2 | `art-source/entregas/2026-10_mundo/libro/equipo.png` |
| E-LIBRO-maestria | maestria | P2 | `art-source/entregas/2026-10_mundo/libro/maestria.png` |
| E-LIBRO-talentos | talentos | P2 | `art-source/entregas/2026-10_mundo/libro/talentos.png` |
| E-LIBRO-dificultad | dificultad | P2 | `art-source/entregas/2026-10_mundo/libro/dificultad.png` |
| E-LIBRO-cooperativo | cooperativo | P2 | `art-source/entregas/2026-10_mundo/libro/cooperativo.png` |
| E-LIBRO-tienda | tienda | P2 | `art-source/entregas/2026-10_mundo/libro/tienda.png` |
| E-LIBRO-brasas | brasas | P2 | `art-source/entregas/2026-10_mundo/libro/brasas.png` |
| E-LIBRO-postgame | postgame | P2 | `art-source/entregas/2026-10_mundo/libro/postgame.png` |
| E-LIBRO-recap | recap | P2 | `art-source/entregas/2026-10_mundo/libro/recap.png` |

### 8.4 Cartas e íconos de Cristales/Coliseo

Hoy las cartas son botones `.cw-card` con degradé CSS (`css/crystal-wars.css:150-167`) y un glifo genérico por palabras clave (`js/modes/crystal-wars/client.js:147-152`; `SHOP_GLYPH`). El juego tiene 2 cartas (`SHOP.meteor`, `SHOP.frost`, `card:true`) y 6 ítems de tienda (`js/modes/crystal-wars/simulation.js:13`). El repo **no define un tamaño de carta**: lo de abajo es propuesta.

| ID | Asset | P | Tamaño / frames | Entrega | Referencia | Estado | Verif. |
|---|---|---|---|---|---|---|---|
| E-CRISTALES-carta-meteor | Carta Meteorito (Cristales/Coliseo) | P1 | Ilustración de carta PNG ≈96×128 nativo (a acordar con Claude según css/crystal-wars.css) en colores ámbar/naranja, marco de carta aparte; ícono 16×16 propio para el botón. | `art-source/entregas/2026-10_mundo/ui/cartas/meteor.png` | `assets/ui/skill-icons/muro-de-fuego.png` | procedural/CSS | repo |
| E-CRISTALES-carta-frost | Carta Escarcha (Cristales/Coliseo) | P1 | Ilustración de carta PNG ≈96×128 nativo (a acordar con Claude según css/crystal-wars.css) en colores celeste, marco de carta aparte; ícono 16×16 propio para el botón. | `art-source/entregas/2026-10_mundo/ui/cartas/frost.png` | `assets/ui/skill-icons/muro-de-fuego.png` | procedural/CSS | repo |
| E-CRISTALES-tienda-repair | Ícono de tienda "Reparar +180" (Cristales/Coliseo) | P2 | PNG 16×16 (contrato de íconos de habilidad, marco de habilidad). | `art-source/entregas/2026-10_mundo/ui/cartas/tienda_repair.png` | `assets/ui/skill-icons/torbellino.png` | procedural | repo |
| E-CRISTALES-tienda-upgrade | Ícono de tienda "Daño de equipo +12%" (Cristales/Coliseo) | P2 | PNG 16×16 (contrato de íconos de habilidad, marco de habilidad). | `art-source/entregas/2026-10_mundo/ui/cartas/tienda_upgrade.png` | `assets/ui/skill-icons/torbellino.png` | procedural | repo |
| E-CRISTALES-tienda-swarm | Ícono de tienda "Enviar 5 acechadores" (Cristales/Coliseo) | P2 | PNG 16×16 (contrato de íconos de habilidad, marco de habilidad). | `art-source/entregas/2026-10_mundo/ui/cartas/tienda_swarm.png` | `assets/ui/skill-icons/torbellino.png` | procedural | repo |
| E-CRISTALES-tienda-brute | Ícono de tienda "Enviar un coloso" (Cristales/Coliseo) | P2 | PNG 16×16 (contrato de íconos de habilidad, marco de habilidad). | `art-source/entregas/2026-10_mundo/ui/cartas/tienda_brute.png` | `assets/ui/skill-icons/torbellino.png` | procedural | repo |
| E-CRISTALES-tienda-ward | Ícono de tienda "Barrera +125" (Cristales/Coliseo) | P2 | PNG 16×16 (contrato de íconos de habilidad, marco de habilidad). | `art-source/entregas/2026-10_mundo/ui/cartas/tienda_ward.png` | `assets/ui/skill-icons/torbellino.png` | procedural | repo |
| E-CRISTALES-tienda-surge | Ícono de tienda "Furia 20 s" (Cristales/Coliseo) | P2 | PNG 16×16 (contrato de íconos de habilidad, marco de habilidad). | `art-source/entregas/2026-10_mundo/ui/cartas/tienda_surge.png` | `assets/ui/skill-icons/torbellino.png` | procedural | repo |

### 8.5 Otros íconos, retratos y marcos

| ID | Asset | P | Tamaño / frames | Entrega | Estado | Verif. |
|---|---|---|---|---|---|---|
| E-UI-CIUDAD-CM-U01 | CM-U01 Íconos: rescatado, perdido, en peligro, te siguen | P1 | 24×24. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-u01_iconos_rescatado_perdido_en.png` | procedural/prestado | doc |
| E-UI-CIUDAD-CM-U02 | CM-U02 Íconos de estructura por estado (refugio, capilla, puerta, torre) | P1 | 24×24 × 4 estados. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-u02_iconos_de_estructura_por.png` | procedural/prestado | doc |
| E-UI-CIUDAD-CM-U03 | CM-U03 Botón RESCATAR (ícono de mano / persona) | P2 | 48×48. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-u03_boton_rescatar_icono_de_mano.png` | procedural/prestado | doc |
| E-UI-MINAS-MN-B08 | MN-B08 Íconos del HUD de luz | P1 | 16×16 · encendida, parpadeo, apagada, a oscuras. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/arenas/minas/mn-b08_iconos_del_hud_de_luz.png` | SUSTITUTO (emoji 🔥 / 🌑) | doc |
| E-UI-ABISMO-UI-01 | AB-UI-01 Ícono RESCATAR (manos) 64 px, 2 estados | P1 | Según el texto (Ícono RESCATAR (manos) 64 px, 2 estados). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo ≈2,0 u/px para suelo y plataformas, 1,0 u/px para personajes. | `art-source/entregas/2026-10_mundo/arenas/abismo/ab_ui_01.png` | procedural/recorte chico | doc |
| E-UI-ABISMO-UI-02 | AB-UI-02 Íconos de minimapa (portal, ancla, jefe) 16 px | P2 | Según el texto (Íconos de minimapa (portal, ancla, jefe) 16 px). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo ≈2,0 u/px para suelo y plataformas, 1,0 u/px para personajes. | `art-source/entregas/2026-10_mundo/arenas/abismo/ab_ui_02.png` | procedural/recorte chico | doc |
| E-UI-COMBATE-CH-01 | CH-01 Cofre del final de arena (7 rarezas: cerrado, temblando, abriéndose, abierto) | P0 | Ver ficha CH-01 en LA_HORDA_COMBAT_MISSING_ASSETS.md. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/ui/ch-01_cofre_del_final_de_arena_7.png` | procedural | doc+repo(archivo) |
| E-UI-COMBATE-RO-01 | RO-01 9 insignias de rol (rombo) + anillo de suelo | P0 | Ver ficha RO-01 en LA_HORDA_COMBAT_MISSING_ASSETS.md. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/ui/ro-01_9_insignias_de_rol_rombo.png` | procedural | doc+repo(archivo) |
| E-UI-COMBATE-ST-01 | ST-01 Íconos/overlays: mojado, descarga, marca, marchitar, aturdido | P2 | Ver ficha ST-01 en LA_HORDA_COMBAT_MISSING_ASSETS.md. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/ui/st-01_iconos_overlays_mojado.png` | procedural | doc+repo(archivo) |
| E-UI-COMBATE-UI-01 | UI-01 Botón de curación de emergencia (lista / urgente / gastada) | P2 | Ver ficha UI-01 en LA_HORDA_COMBAT_MISSING_ASSETS.md. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/ui/ui-01_boton_de_curacion_de.png` | procedural | doc+repo(archivo) |
| E-UI-COMBATE-UI-02 | UI-02 Flecha de oleada en el borde | P2 | Ver ficha UI-02 en LA_HORDA_COMBAT_MISSING_ASSETS.md. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo. | `art-source/entregas/2026-10_mundo/ui/ui-02_flecha_de_oleada_en_el_borde.png` | procedural | doc+repo(archivo) |
| E-UI-ctx-iconos | A-16 Íconos de acción contextual (RESCATAR, ENCENDER, ATRAVESAR, sello, cerrar, activar) | P2 | 6 PNG 32×32 (1 cuadro + brillo opcional 3), píxel nativo, contorno 1 px. | `art-source/entregas/2026-10_mundo/ui/ctx/{rescatar,encender,atravesar,sello,cerrar,activar}.png` | inexistente | doc+repo(ruta) |
| E-UI-guardianes-card | A-17 Retratos de tarjeta de campeones (104×104) | P2 | PNG 104×104 por campeón (busto 3/4 a la derecha, luz arriba-izquierda), píxel nativo, 1 cuadro (+2 de respiración opcionales). Para los 43 campeones o los 12 de la selección original. | `art-source/entregas/2026-10_mundo/ui/retratos/<campeon>_card.png` | inexistente | doc+repo(ruta) |
| E-UI-marcos | Marcos de interfaz (panel, botón, ranura, rareza de ítem) | P2 | [PROPUESTA, no es un faltante verificado] 9-slice PNG pixel art (16×16 por esquina) para panel y botón; 3 marcos de ranura de 16×16 (básico/habilidad/definitiva) ya definidos por el contrato del PR #119 (los di | `art-source/entregas/2026-10_mundo/ui/marcos/` | CSS (sin PNG) | repo |
| E-UI-tutorial-hechicero | HS-04 Retrato del Hechicero con 3 expresiones (neutral, advertencia, sonrisa torcida) | P2 | 3 PNG 96×96 (o la celda del retrato actual), píxel nativo. | `art-source/entregas/2026-10_mundo/ui/retratos/hechicero_<expresion>.png` | parcial | doc |
| E-UI-roles-insignias | RO-01 Insignias de rol enemigo (9 rombos) + anillo de suelo | P0 | 9 PNG 16×16 (insignia) + anillo de suelo en tira; el arte no puede quitar legibilidad del peligro. Píxel nativo. | `art-source/entregas/2026-10_mundo/ui/roles/` | procedural | doc |

---

## 9. Fuera de alcance: audio

Hoy **todo el audio es síntesis en vivo** (`js/audio/audio.js`, WebAudio); no hay archivos de audio. Las necesidades que listan los documentos del repo (campana del Campanero, grito de la Plañidera, aplausos y voz del Presentador, voces de civiles, rugidos de jefe, ambientes por arena, ganchos `mn*` de las Minas: `CM-S01…S06`, `AU-*`, sección Audio de `LA_HORDA_MISSING_ASSETS.md`) **no se tocan en este documento**.

---

## 10. Cómo auditar y entregar

### 10.1 Orden de trabajo sugerido

1. **Auditar** (media hora): leer la especificación del PR #124 y este documento; correr los comandos de 10.2 y confirmar los números de la sección 1; abrir las 8 hojas de `ejemplos/mundo/`. Si algún número no coincide, **el repo manda**: avisar y corregir el JSON.
2. **Muestra primero**: un enemigo (p. ej. `cm_perro`), un efecto (`aelith` H1), un ícono (`musashi_1`) y una portada. Claude corre los chequeos y devuelve qué falló antes de producir el lote (especificación §6.4).
3. **Producir por prioridad**: P0 (cuerpos prestados, píxel grueso/ilustración, definitivas, 10 íconos débiles, portadas de Ciudad/Minas/Infernal/Abismo, Únicos y Míticos), luego P1, luego P2. Dentro de cada grupo, de a una arena o un campeón por vez para que se lea como conjunto.
4. **Entregar**: todo bajo `art-source/entregas/2026-10_mundo/` con la subcarpeta y el nombre **exactos** de la columna `Entrega` (o `ruta_entrega` del JSON); en una rama `art/mundo-<lote>` o pasando la carpeta. **No tocar `js/`**: la integración (registrar en el motor, `*-meta.js`, `asset-manifest.js`, WebP, `roster_gate --write`) la hace Claude.
5. **Cada entrega lleva** `entrega.json` (especificación §6.2: autor, fecha, herramientas, **declaración de si hubo pasos asistidos por IA**, fuentes editables `.aseprite/.psd` conservadas, referencias con licencia) y **cero arte de terceros**. Si se pinta con IA, declararlo: la política es del dueño (especificación §5.6).
6. **Revisión humana** con el Visual Gate (PASS / FIX / REDRAW / REJECT, `docs/ART_BIBLE.md` §8) y, para lo que cambia mecánica visible, pruebas reales de multijugador y rendimiento (`AGENTS.md` punto 7). `STRUCTURAL_PASS` no es aprobación.

```
art-source/entregas/2026-10_mundo/
  entrega.json
  fx/<campeón>/…            proyectiles/…            props/<campeón>/…
  iconos/habilidades/…      iconos/…(ui)
  enemigos/<arena>/<tipo>/atlas.png     jefes/<id>/atlas.png
  objetos/…   sets/…   vfx_items/…
  arenas/<arena>/…          portadas/<arena>.png
  codice/…    libro/…       ui/…
  fuentes/…                 (.aseprite/.psd editables)
```

Nombres en minúsculas, `[a-z0-9_]`, sin espacios ni acentos; sufijo `_<W>x<H>_<N>f` en tiras de efecto.

### 10.2 Comandos de validación exactos (desde la raíz del repo)

Servidor propio en un puerto libre (comprobar antes con `ps aux | grep http.server` que el puerto esté libre; en el entorno donde se escribió este documento había servidores ajenos en 8871, 8881, 8933, 9217 y otros):

```bash
git fetch origin && git checkout claude/assets-faltantes-mundo   # este documento y el JSON
python3 -m http.server 8958 --bind 127.0.0.1 &                   # solo para las herramientas con navegador
```

| Qué se comprueba | Comando | Resultado esperado hoy |
|---|---|---|
| Que el manifiesto es coherente con el repo | `python3 -I -c "import json,os;m=json.load(open('docs/art-brief/manifiestos/mundo_faltantes.json'))['filas'];print(len(m),'filas;',sum(1 for r in m for p in r['referencia'] if p.endswith(('.png','.webp','.jpg')) and not os.path.exists(p)),'referencias rotas')"` | `1061 filas; 0 referencias rotas` |
| Densidad de píxel (enemigos, jefes, retratos, suelos) | `node tools/art/pixel-density.js --group enemigos,jefes,retratos,fondos` | `191 entidades analizadas; 51 con desvíos; 0 sin excepción documentada` |
| Autotest del detector | `node tools/art/pixel-density.js --self-test` | `OK` |
| Cobertura de los 11 estados por enemigo | `ENEMY_COV_BASE_URL=http://127.0.0.1:8958 node tools/art/enemy_coverage.js /tmp/cov [tipo,tipo]` | tras integrar un enemigo nuevo, sus estados deben salir `real` (no `clon`) |
| Defectos técnicos de PNG (halo, semialfa, islas) | `python3 tools/art/scan_sprites.py --dir enemies/<arena>/<tipo>` (o `bosses/…`, `arenas/…`; relativo a `assets/sprites/`) | `0/N files flagged` |
| Alfa y colores de un PNG antes de entregarlo | `python3 -I -W ignore -c "import sys;from PIL import Image;im=Image.open(sys.argv[1]).convert('RGBA');h=im.getchannel('A').histogram();print(sys.argv[1],im.size,'semitransparentes:',sum(h[1:255]),'colores:',len({p[:3] for p in im.getdata() if p[3]}))" ARCHIVO.png` | `semitransparentes: 0` y `colores` según el tipo (íconos ≤ 6) |
| FX: ability gate, paridad, motor B | `ABILITY_BASE_URL=http://127.0.0.1:8958/ ONLY=<id> node tools/bible/ability-gate.js --strict` · `BASE_URL=http://127.0.0.1:8958/ ONLY=<id> node tools/vfx/parity-skill-fx.js` · `ABILITY_BASE_URL=http://127.0.0.1:8958/ node tools/vfx/test-vfx-b.js` | `PASS`; `IGUAL`; `PASS` (especificación §3.3) |
| Proyectiles con identidad | `node tools/quality/test-projectile-identity.js` | pasa |
| Íconos de habilidad (rama del PR #119) | `node tools/art/check-skill-icons.js` · `node tools/ux/test-skill-glyphs.js` | pasa |
| Íconos de UI (rama del PR #118) | `node tools/art/check-pixel-icons.js` · `node tools/art/emoji-lint.js --strict` | pasa |
| Escenario del Coliseo | `node tools/art/check-coliseum-cover.js` | pasa |
| Hojas de referencia (regenerar) | `python3 tools/art/gen-referencias-mundo.py` | 8 hojas, total ≈ 3 MB (tope 30 MB) |

Los gates **no miden FX ni íconos pintados** (especificación §1.3 C4) y solo ven lo que ya está instalado en `assets/`: antes de la integración, la comprobación del pintor es el chequeo de alfa/colores de la fila "Alfa y colores" y la revisión visual contra la referencia de la fila. Un asset nuevo **no entra en la lista de excepciones**: tiene que entrar dentro del canon.

---

## 11. Hojas de contacto de referencia

`python3 tools/art/gen-referencias-mundo.py` (Pillow; sin red; `--solo 01,04`, `--formato png`, `--salida <carpeta>`) arma 8 hojas con rejilla y rótulo de ruta en `docs/art-brief/ejemplos/mundo/` (WebP sin pérdida, 3,2 MB en total). Las hojas 04 y 05 leen los motivos de las ramas de los PR #119 y #118 (con `git show`; si ya están mergeados leen el archivo local).

| Hoja | Contenido | Categorías que cubre |
|---|---|---|
| `01_enemigos.webp` | modelos a seguir, los 7 de pixel grueso, los 4 de ilustración y los 7 donantes de cuerpo prestado | C |
| `02_monstruos_campo_de_batalla.webp` | las 16 tiras de 4 cuadros (3.2/6.2) | C |
| `03_fx_pintados_existentes.webp` | precedentes de FX pintados (skins, jefes, Axiom, Minas) | A |
| `04_iconos_habilidad_actuales.webp` | los 176 motivos de íconos actuales, marcados los débiles | B |
| `05_iconos_ui_primera_pasada.webp` | los 84 íconos del PR #118, marcados los ambiguos | E |
| `06_suelos_texturas.webp` | los `tex_*.png` de abismo, ciudad y minas | D |
| `07_props_decorado.webp` | props PNG existentes (modelo de los 34 procedurales) | D |
| `08_portadas_y_retratos_codice.webp` | 11 portadas y 11 retratos de Minas (JPG ilustración) | D, C, E |

---

## 12. Lo que no se verificó y decisiones pendientes

**Decisiones del dueño** (no las tomé):
1. **Tiras de campo de batalla vs atlas existentes** (3.2): ¿retirar la tira de 8 jefes que ya tienen atlas nativo, o rehacerlas?
2. **Arte asistido por IA** (especificación §5.6): sin política escrita; cada entrega debe declararlo.
3. **Licencias de las fuentes** `Press Start 2P` y `VT323` (sin archivo de licencia en `assets/fonts/`).
4. **Alcance de retratos de tarjeta** (`A-17`: el documento pide 12 campeones; hay 43) y **tamaño de las cartas** de Cristales/Coliseo (no definido en el repo).
5. **Personas históricas** del roster (el Libertador, Musashi): revisar caso por caso antes de dibujar (`docs/SANMARTIN_LIBERTADOR.md`).

**No verificado** (honestidad):
- Lo marcado `doc` en el JSON viene de documentos del repo (Ciudad, Minas, Abismo, Combate, Códice) y **no se re-verificó pieza por pieza**; sí se comprobó que las rutas destino que citan no existen. Varias pueden estar resueltas (ver 3.4).
- La **ambigüedad de los íconos** (hojas 04 y 05) es criterio visual de quien armó el documento, no una medición.
- Se leyó en el código que los 12 tipos de jefe usan la tira de campo de batalla y se **ejecutó** `enemy_coverage.js` (fuente de `mn_titan`, `cm_maestro`, `micelio` = `battlefield/*.png`); no se jugó una partida para verlo.
- **Tiburones en 0 píxeles** (3.3): sin investigar la causa.
- No se ejecutaron `ability-gate`, `parity-skill-fx`, `verify-mechanics`, perfiles de rendimiento ni pruebas multijugador; no se probó nada en dispositivo real.
- No se auditó el piso Micelial ni el de Fortaleza (la Art Bible dice que el Micelial ya se pixelizó con `tools/art/micelial/pixel_floor.py`).
- Los tamaños de FX son los **sugeridos** de las fichas de los PR de briefs (otra escala por brief); el tamaño final de celda lo fija el *bucket* de la especificación §2.2.2 según el radio real.
- Las rutas `ruta_juego` marcadas **[PROPUESTA]** no existen: son el nombre que se sugiere para que Claude integre.
