# Registro único de trabajo con Runway (no repetir)

> Generado por `tools/art/runway-ledger.py` desde `estado-runway.json` (fuente de verdad). **No se edita a mano este .md.** Antes de generar algo con Runway: buscar su id en las tablas y en «NO REPETIR»; al terminar, `python3 tools/art/runway-ledger.py set <id> <estado> "nota"` o `add`.

> **`node tools/art-world/runway-world.js list` NO es fiable:** su «OK/pendiente» mira solo `art-source/runway-world/ciudad/<id>/master.png`, así que marca «pendiente» trabajos hechos de otras arenas (pisos, centros, fort_*). Los 17 trabajos de esa herramienta tienen master y recibo; manda este registro.

> Auditado el 2026-11-12 en la rama `wip/runway-video` contra el repo (archivos con `ls`, carga con `grep` en `js/`). Costo medido: 8 cr por imagen gen4_image 1024; hoja de enemigo 1280x720 observada a 5 cr; video gen4_turbo 2 s = 10 cr. Los créditos son los registrados por recibo/ART_CREDITS (hay gasto sin recibo: ver notas); el saldo de la cuenta es compartido.

**Entradas: 86** · ✔ integrado 51 · ◐ sin integrar 6 · ✘ rechazado 13 · · pendiente 15 · ⛔ bloqueado 1 · créditos registrados: 1233

## lamina_campeon (4)

| id | estado | fecha | cr | dónde está | nota |
|---|---|---|---:|---|---|
| `lamina_ilsa` | · pendiente |  |  | `docs/art-brief/runway-pack/campeones/ilsa.md`<br>`tools/art-world/runway-design.js` | Único faltante del Códice (43 de 46). 1 intento; si sale con texto o mal, reservar un 2.º (16). El Códice existente es de ChatGPT: esta lámina sería la excepción Runway. |
| `lamina_kora` | · pendiente |  |  | `docs/art-brief/runway-pack/campeones/kora.md`<br>`tools/art-world/runway-design.js` | Único faltante del Códice (43 de 46). 1 intento; si sale con texto o mal, reservar un 2.º (16). El Códice existente es de ChatGPT: esta lámina sería la excepción Runway. |
| `lamina_vorn` | · pendiente |  |  | `docs/art-brief/runway-pack/campeones/vorn.md`<br>`tools/art-world/runway-design.js` | Único faltante del Códice (43 de 46). 1 intento; si sale con texto o mal, reservar un 2.º (16). El Códice existente es de ChatGPT: esta lámina sería la excepción Runway. |
| `laminas_codex_existentes` | ✔ integrado |  |  | `assets/ui/codex/champions/tanque.png`<br>`js/ui/codex/codex.js` | Origen: ChatGPT según el dueño (ART_CREDITS 2026-11-11), NO Runway: declarar en la ficha de Steam. |

## prop_mundo (6)

| id | estado | fecha | cr | dónde está | nota |
|---|---|---|---:|---|---|
| `ciudad_estatua` | ✔ integrado | 2026-11-07 | 8 | `art-source/runway-world/ciudad/ciudad_estatua/master.png`<br>`art-source/runway-world/ciudad/ciudad_estatua/receipt.json`<br>`assets/vfx/ciudad/estatua_1.png` | Defecto menor aceptado: dos brazos en alto (el Códice tiene uno). Un primer intento con «armoured knight» (task 5401a6bd-2025-4b29-83fa-e10b5e0c39df) falló BAD_OUTPUT sin cobro. |
| `ciudad_farol` | ✔ integrado | 2026-11-07 | 8 | `art-source/runway-world/ciudad/ciudad_farol/master.png`<br>`art-source/runway-world/ciudad/ciudad_farol/receipt.json`<br>`assets/vfx/ciudad/farol_1.png` | archivo existe; cargado como farol_cx_0 (cm-render.js:320); commit 5896182a |
| `prox_props_infernal` | · pendiente |  |  |  | Mismo método que ciudad_estatua/farol (croma + BOX + alfa binario), 2 de 2 aceptados. |
| `prox_props_hielo` | · pendiente |  |  |  | Idem. |
| `prox_props_bosque` | · pendiente |  |  |  | Idem. |
| `prox_props_laberinto` | · pendiente |  |  |  | Idem. |

## piso_arena (9)

| id | estado | fecha | cr | dónde está | nota |
|---|---|---|---:|---|---|
| `fort_planchas_hierro` | ✔ integrado | 2026-11-06 | 8 | `art-source/runway-world/fortaleza/fort_planchas_hierro/master.png`<br>`art-source/runway-world/fortaleza/fort_planchas_hierro/receipt.json`<br>`assets/vfx/fortaleza/tex_planchas_hierro.png` | archivo existe; cargado por js/arenas/fortaleza/fort-art.js:33,78 (fortTex + _fortTexFill); commit 7a1ac86c. OJO: `runway-world.js list` dice «pendiente» y es FALSO |
| `fort_adoquin_patio` | ✔ integrado | 2026-11-06 | 8 | `art-source/runway-world/fortaleza/fort_adoquin_patio/master.png`<br>`art-source/runway-world/fortaleza/fort_adoquin_patio/receipt.json`<br>`assets/vfx/fortaleza/tex_adoquin_patio.png` | archivo existe; cargado por js/arenas/fortaleza/fort-art.js:33,50; commit 7a1ac86c. OJO: `runway-world.js list` dice «pendiente» y es FALSO |
| `laberinto_piso` | ✔ integrado | 2026-11-06 | 8 | `art-source/runway-world/laberinto/laberinto_piso/master.png`<br>`art-source/runway-world/laberinto/laberinto_piso/receipt.json`<br>`assets/vfx/laberinto/tex_piso.png` | archivo existe; cargado por js/rendering/arena.js:27-32 (FLOOR_PAINTED.laberinto); commit 6ed5a504. `list` dice «pendiente» y es FALSO |
| `infernal_piso` | ✔ integrado | 2026-11-06 | 8 | `art-source/runway-world/infernal/infernal_piso/master.png`<br>`art-source/runway-world/infernal/infernal_piso/receipt.json`<br>`assets/vfx/infernal/tex_piso.png` | archivo existe; cargado por js/rendering/arena.js:27-32 (FLOOR_PAINTED.infernal); commit 6ed5a504. `list` dice «pendiente» y es FALSO |
| `acuatica_piso` | ✔ integrado | 2026-11-06 | 8 | `art-source/runway-world/acuatica/acuatica_piso/master.png`<br>`art-source/runway-world/acuatica/acuatica_piso/receipt.json`<br>`assets/vfx/acuatica/tex_piso.png` | archivo existe; cargado por js/rendering/arena.js:27-32 (FLOOR_PAINTED.acuatica); commit 6ed5a504. `list` dice «pendiente» y es FALSO |
| `abismo_piso` | ✘ rechazado | 2026-11-06 | 8 | `art-source/runway-world/abismo/abismo_piso/master.png`<br>`art-source/runway-world/abismo/abismo_piso/receipt.json`<br>`assets/vfx/abismo/tex_piso.png` | El maestro salió como UNA losa enmarcada con borde negro y una diagonal; recortando 2x2 losas y repitiendo, la diagonal forma un papel tapiz evidente (intento 1 de 3, ART_CREDITS 2026-11-06). El Abismo conserva su tex_piso del Códice (no es de Runway: sin cambios desde 34ac2852). |
| `prox_piso_bosque` | · pendiente |  |  | `js/rendering/arena.js` | Sigue siendo el piso procedural (FLOOR_THEME). Runway funcionó en 5 de 6 pisos (falló solo abismo por marco/diagonal). |
| `prox_piso_hielo` | · pendiente |  |  | `js/rendering/arena.js` | Sigue siendo el piso procedural (FLOOR_THEME). Runway funcionó en 5 de 6 pisos (falló solo abismo por marco/diagonal). |
| `prox_piso_divina` | · pendiente |  |  | `js/rendering/arena.js` | Último piso procedural sin pintar. |

## centro_arena (6)

| id | estado | fecha | cr | dónde está | nota |
|---|---|---|---:|---|---|
| `infernal_centro` | ✔ integrado | 2026-11-07 | 8 | `art-source/runway-world/infernal/infernal_centro/master.png`<br>`art-source/runway-world/infernal/infernal_centro/receipt.json`<br>`assets/vfx/infernal/centro_pentagrama.png` | archivo existe; cargado por js/rendering/arena.js:35-38 (DECAL_PAINTED.infPentagram); commits 2282df7b/2727486c. `list` dice «pendiente» y es FALSO |
| `acuatica_centro` | ✔ integrado | 2026-11-07 | 8 | `art-source/runway-world/acuatica/acuatica_centro/master.png`<br>`art-source/runway-world/acuatica/acuatica_centro/receipt.json`<br>`assets/vfx/acuatica/centro_templo.png` | archivo existe; cargado por js/rendering/arena.js:35-38 (DECAL_PAINTED.sunkTemple); commits 2282df7b/2727486c. `list` dice «pendiente» y es FALSO |
| `laberinto_centro` | ✔ integrado | 2026-11-07 | 8 | `art-source/runway-world/laberinto/laberinto_centro/master.png`<br>`art-source/runway-world/laberinto/laberinto_centro/receipt.json`<br>`assets/vfx/laberinto/centro_medallon.png` | archivo existe; cargado por js/rendering/arena.js:35-38 (DECAL_PAINTED.minoChamber); commits 2282df7b/2727486c. `list` dice «pendiente» y es FALSO |
| `fort_rejilla_lava` | ✔ integrado | 2026-11-07 | 8 | `art-source/runway-world/fortaleza/fort_rejilla_lava/master.png`<br>`art-source/runway-world/fortaleza/fort_rejilla_lava/receipt.json`<br>`assets/vfx/fortaleza/rejilla_lava.png` | archivo existe; cargado por js/arenas/fortaleza/fort-art.js:33,112 (_fortBigGrate); commit 2727486c. `list` dice «pendiente» y es FALSO |
| `prox_centro_bosque` | · pendiente |  |  | `tools/art-world/build-centro-arena.py` | Los 4 centros intentados (infernal, acuática, laberinto, rejilla de fortaleza) salieron aceptados. |
| `prox_centro_hielo` | · pendiente |  |  | `tools/art-world/build-centro-arena.py` | Los 4 centros intentados (infernal, acuática, laberinto, rejilla de fortaleza) salieron aceptados. |

## fachada (7)

| id | estado | fecha | cr | dónde está | nota |
|---|---|---|---:|---|---|
| `casa_a` | ◐ sin integrar | 2026-11-06 | 8 | `art-source/runway-world/ciudad/casa_a/master.png`<br>`art-source/runway-world/ciudad/casa_a/receipt.json` | Dirección válida (GENERATED_NOT_APPROVED) pero ningún archivo de assets/ ni código la usa: solo se integraron las texturas de techo y pared, no la fachada completa. |
| `casa_b` | ✘ rechazado | 2026-11-06 | 8 | `art-source/runway-world/ciudad/casa_b/master.png`<br>`art-source/runway-world/ciudad/casa_b/receipt.json` | Salió en vista isométrica: no coincide con la vista oblicua frontal del juego. Queda solo como referencia (ART_CREDITS, 2026-11-06). |
| `tex_techo_pizarra` | ✔ integrado | 2026-11-06 | 8 | `art-source/runway-world/ciudad/tex_techo_pizarra/master.png`<br>`art-source/runway-world/ciudad/tex_techo_pizarra/receipt.json`<br>`assets/vfx/ciudad/tex_techo.png` | archivo existe; cargado por js/arenas/ciudad/cm-render.js:361 (_cmFillPat "tex_techo"); commit 6cf90786 (2026-11-06) |
| `tex_techo_roja` | ✔ integrado | 2026-11-06 | 8 | `art-source/runway-world/ciudad/tex_techo_roja/master.png`<br>`art-source/runway-world/ciudad/tex_techo_roja/receipt.json`<br>`assets/vfx/ciudad/tex_techo_roja.png` | archivo existe; cargado por js/arenas/ciudad/cm-render.js:372 (techos alternados por id de edificio); commit 6cf90786 (2026-11-06) |
| `tex_pared_madera_piedra` | ✔ integrado | 2026-11-06 | 8 | `art-source/runway-world/ciudad/tex_pared_madera_piedra/master.png`<br>`art-source/runway-world/ciudad/tex_pared_madera_piedra/receipt.json`<br>`assets/vfx/ciudad/tex_pared_ext.png` | archivo existe; cargado por js/arenas/ciudad/cm-render.js:335 (_cmFillPat "tex_pared_ext"); commit 6cf90786 (2026-11-06) |
| `prox_integrar_casa_a` | · pendiente |  |  | `art-source/runway-world/ciudad/casa_a/master.png` | Ya está pagada (8 cr) y aceptada como dirección; solo falta el pintor determinista. |
| `prox_fachadas_ciudad_t06` | · pendiente |  |  | `docs/art-brief/runway-pack/bloques` | Bloque P0 B062 (se nota en una partida). casa_a demostró la dirección (vista oblicua frontal); casa_b falló por isométrica: pedir oblicuo explícito. |

## enemigo_hoja (33)

| id | estado | fecha | cr | dónde está | nota |
|---|---|---|---:|---|---|
| `hoja_anguila_electrica` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/acuatica/anguila_electrica/v2/atlas.png`<br>`art-source/runway-enemies/acuatica/anguila_electrica/out/atlas.png`<br>`art-source/runway-enemies/acuatica/anguila_electrica/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.anguila_electrica) |
| `hoja_cangrejo_acorazado` | ✔ integrado | 2026-11-07 | 10 | `assets/sprites/enemies/acuatica/cangrejo_acorazado/v2/atlas.png`<br>`art-source/runway-enemies/acuatica/cangrejo_acorazado/out/atlas.png`<br>`art-source/runway-enemies/acuatica/cangrejo_acorazado/spec.json` | Hay una hoja rejected_v1 además de la instalada. |
| `hoja_medusa_electrica` | ✔ integrado | 2026-11-07 | 10 | `assets/sprites/enemies/acuatica/medusa_electrica/v2/atlas.png`<br>`art-source/runway-enemies/acuatica/medusa_electrica/out/atlas.png`<br>`art-source/runway-enemies/acuatica/medusa_electrica/spec.json` | Hay una hoja rejected_v1 además de la instalada. |
| `hoja_sirena_abisal` | ✔ integrado | 2026-11-07 | 10 | `assets/sprites/enemies/acuatica/sirena_abisal/v2/atlas.png`<br>`art-source/runway-enemies/acuatica/sirena_abisal/out/atlas.png`<br>`art-source/runway-enemies/acuatica/sirena_abisal/spec.json` | Dos hojas. |
| `hoja_tiburon_blanco` | ✔ integrado | 2026-11-07 | 10 | `assets/sprites/enemies/acuatica/tiburon_blanco/v2/atlas.png`<br>`art-source/runway-enemies/acuatica/tiburon_blanco/out/atlas.png`<br>`art-source/runway-enemies/acuatica/tiburon_blanco/spec.json` | Dos hojas. |
| `hoja_tiburon_joven` | ✔ integrado | 2026-11-12 | 20 | `assets/sprites/enemies/acuatica/tiburon_joven/v2/atlas.png`<br>`art-source/runway-enemies/acuatica/tiburon_joven/out/atlas.png`<br>`art-source/runway-enemies/acuatica/tiburon_joven/spec.json` | Rehechos 2026-11-12: v2 (patas de zapato), v3 (3 cuadros idénticos, ataque fundido): rechazados, revertidos. |
| `hoja_duende_bosque` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/bosque/duende_bosque/v2/atlas.png`<br>`art-source/runway-enemies/bosque/duende_bosque/out/atlas.png`<br>`art-source/runway-enemies/bosque/duende_bosque/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.duende_bosque) |
| `hoja_ent` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/bosque/ent/v2/atlas.png`<br>`art-source/runway-enemies/bosque/ent/out/atlas.png`<br>`art-source/runway-enemies/bosque/ent/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.ent) |
| `hoja_cm_acechante` | ✔ integrado | 2026-11-12 | 20 | `assets/sprites/enemies/ciudad/cm_acechante/v2/atlas.png`<br>`art-source/runway-enemies/ciudad/cm_acechante/out/atlas.png`<br>`art-source/runway-enemies/ciudad/cm_acechante/spec.json` | Rehechos 2026-11-12: v2 (otra criatura, ref fragmento) y v3 (3 puños, proporción distinta): rechazados. |
| `hoja_cm_campanero` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/ciudad/cm_campanero/v2/atlas.png`<br>`art-source/runway-enemies/ciudad/cm_campanero/out/atlas.png`<br>`art-source/runway-enemies/ciudad/cm_campanero/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.cm_campanero) |
| `hoja_cm_perro` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/ciudad/cm_perro/v2/atlas.png`<br>`art-source/runway-enemies/ciudad/cm_perro/out/atlas.png`<br>`art-source/runway-enemies/ciudad/cm_perro/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.cm_perro) |
| `hoja_cristal_servo` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/hielo/cristal_servo/v2/atlas.png`<br>`art-source/runway-enemies/hielo/cristal_servo/out/atlas.png`<br>`art-source/runway-enemies/hielo/cristal_servo/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.cristal_servo) |
| `hoja_cristal_volador` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/hielo/cristal_volador/v2/atlas.png`<br>`art-source/runway-enemies/hielo/cristal_volador/out/atlas.png`<br>`art-source/runway-enemies/hielo/cristal_volador/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.cristal_volador) |
| `hoja_demonio_hielo_fuego` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/hielo/demonio_hielo_fuego/v2/atlas.png`<br>`art-source/runway-enemies/hielo/demonio_hielo_fuego/out/atlas.png`<br>`art-source/runway-enemies/hielo/demonio_hielo_fuego/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.demonio_hielo_fuego) |
| `hoja_golem_hielo` | ✔ integrado | 2026-11-07 | 10 | `assets/sprites/enemies/hielo/golem_hielo/v2/atlas.png`<br>`art-source/runway-enemies/hielo/golem_hielo/out/atlas.png`<br>`art-source/runway-enemies/hielo/golem_hielo/spec.json` | Segunda pasada de caminata (walk_v1) devolvió cuadros casi idénticos: se reemplazó por ciclo procedural. |
| `hoja_hada_escarcha` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/hielo/hada_escarcha/v2/atlas.png`<br>`art-source/runway-enemies/hielo/hada_escarcha/out/atlas.png`<br>`art-source/runway-enemies/hielo/hada_escarcha/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.hada_escarcha) |
| `hoja_demonio_mago` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/infernal/demonio_mago/v2/atlas.png`<br>`art-source/runway-enemies/infernal/demonio_mago/out/atlas.png`<br>`art-source/runway-enemies/infernal/demonio_mago/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.demonio_mago) |
| `hoja_demonio_menor` | ✔ integrado | 2026-11-12 | 15 | `assets/sprites/enemies/infernal/demonio_menor/v2/atlas.png`<br>`art-source/runway-enemies/infernal/demonio_menor/out/atlas.png`<br>`art-source/runway-enemies/infernal/demonio_menor/spec.json` | Rehechos 2026-11-12: v2 (restos pegados, muerte de dos cuerpos) y v3 (la muerte regresa): rechazados. |
| `hoja_esqueleto` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/infernal/esqueleto/v2/atlas.png`<br>`art-source/runway-enemies/infernal/esqueleto/out/atlas.png`<br>`art-source/runway-enemies/infernal/esqueleto/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.esqueleto) |
| `hoja_esqueleto_h` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/infernal/esqueleto_h/v2/atlas.png`<br>`art-source/runway-enemies/infernal/esqueleto_h/out/atlas.png`<br>`art-source/runway-enemies/infernal/esqueleto_h/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.esqueleto_h) |
| `hoja_zombie` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/infernal/zombie/v2/atlas.png`<br>`art-source/runway-enemies/infernal/zombie/out/atlas.png`<br>`art-source/runway-enemies/infernal/zombie/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.zombie) |
| `hoja_druida_arena` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/laberinto/druida_arena/v2/atlas.png`<br>`art-source/runway-enemies/laberinto/druida_arena/out/atlas.png`<br>`art-source/runway-enemies/laberinto/druida_arena/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.druida_arena) |
| `hoja_escorpion_gigante` | ✔ integrado | 2026-11-07 | 10 | `assets/sprites/enemies/laberinto/escorpion_gigante/v2/atlas.png`<br>`art-source/runway-enemies/laberinto/escorpion_gigante/out/atlas.png`<br>`art-source/runway-enemies/laberinto/escorpion_gigante/spec.json` | Dos hojas (v1, v2). |
| `hoja_esfinge` | ✔ integrado | 2026-11-12 | 20 | `assets/sprites/enemies/laberinto/esfinge/v2/atlas.png`<br>`art-source/runway-enemies/laberinto/esfinge/out/atlas.png`<br>`art-source/runway-enemies/laberinto/esfinge/spec.json` | Rehechos 2026-11-12: v3 (orientación mezclada) y v4 (cuadros casi idénticos, muerte fundida): rechazados. |
| `hoja_golem_piedra` | ✘ rechazado | 2026-11-06 | 5 | `art-source/runway-enemies/laberinto/golem_piedra` | Rechazada; el MOTIVO no está documentado en el repo (solo el recibo con nota genérica). |
| `hoja_medusa` | ✔ integrado | 2026-11-07 | 15 | `assets/sprites/enemies/laberinto/medusa/v2/atlas.png`<br>`art-source/runway-enemies/laberinto/medusa/out/atlas.png`<br>`art-source/runway-enemies/laberinto/medusa/spec.json` | Tres hojas (v1-v3); la instalada es la vigente. |
| `hoja_acechador` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/arenas/micelial/acechador/atlas.png`<br>`art-source/runway-enemies/micelial/acechador/out/atlas.png`<br>`art-source/runway-enemies/micelial/acechador/spec.json` | atlas instalado byte-igual a out/atlas.png; cargado por js/arenas/micelial/mic-arena.js:44 (enemyAtlasPackLoad); commit aacb2bd6. OJO: las fichas del pack dicen «SIN ATLAS PROPIO» y es viejo |
| `hoja_chaman` | ✘ rechazado | 2026-11-07 | 5 | `art-source/runway-enemies/micelial/chaman` | La hoja salió con texto dentro de la imagen (docs/art-gate/MICELIAL_RUNWAY_20261107.md); sigue el atlas viejo. |
| `hoja_infectado` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/arenas/micelial/infectado/atlas.png`<br>`art-source/runway-enemies/micelial/infectado/out/atlas.png`<br>`art-source/runway-enemies/micelial/infectado/spec.json` | atlas instalado byte-igual a out/atlas.png; cargado por js/arenas/micelial/mic-arena.js:44 (enemyAtlasPackLoad); commit aacb2bd6. OJO: las fichas del pack dicen «SIN ATLAS PROPIO» y es viejo |
| `hoja_sabueso` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/arenas/micelial/sabueso/atlas.png`<br>`art-source/runway-enemies/micelial/sabueso/out/atlas.png`<br>`art-source/runway-enemies/micelial/sabueso/spec.json` | atlas instalado byte-igual a out/atlas.png; cargado por js/arenas/micelial/mic-arena.js:44 (enemyAtlasPackLoad); commit aacb2bd6. OJO: las fichas del pack dicen «SIN ATLAS PROPIO» y es viejo |
| `hoja_mn_devoraluz` | ✔ integrado | 2026-11-07 | 5 | `assets/sprites/enemies/minas/mn_devoraluz/v2/atlas.png`<br>`art-source/runway-enemies/minas/mn_devoraluz/out/atlas.png`<br>`art-source/runway-enemies/minas/mn_devoraluz/spec.json` | atlas instalado byte-igual a out/atlas.png; registrado en js/assets/enemy-runway-sheets.js (ENEMY_RUNWAY_SHEETS.mn_devoraluz) |
| `regla_animacion_hojas_enemigos` | ✘ rechazado | 2026-11-12 |  | `docs/beta-release/ART_CREDITS.md`<br>`docs/art-gate/RUNWAY_ENEMIES.md` | Los 4 rehechos del 2026-11-12 (8 hojas, 40 cr): 0 mejoran el atlas vigente. Runway no da ciclos de caminata distintos (cuadros casi idénticos) ni muerte limpia (funde dos cuerpos o agrega cristales). El camino válido fue SOLO enemigos sin hoja o con hoja pobre. |
| `prox_hojas_fortaleza` | · pendiente |  |  | `docs/art-brief/runway-pack/enemigos/fortaleza.md` | En enemigos SIN hoja Runway el método rindió: 29 de 35 criaturas con hoja Runway instaladas (las 6 restantes: jefes/bestia retirados, golem_piedra, chamán). NO aplica a rehacer hojas existentes. |

## jefe (5)

| id | estado | fecha | cr | dónde está | nota |
|---|---|---|---:|---|---|
| `hoja_leviatan` | ✘ rechazado | 2026-11-06 | 5 | `art-source/runway-enemies/acuatica/leviatan` | La hoja salió plana y casi sin variación, peor que el arte vigente (RUNWAY_ENEMIES.md). |
| `hoja_bestia_bosque` | ✘ rechazado | 2026-11-06 | 5 | `art-source/runway-enemies/bosque/bestia_bosque` | La hoja Runway era otra criatura: peor que el retrato de campo de batalla; se retiró (docs/art-gate/RUNWAY_ENEMIES.md). |
| `hoja_dragon_forja` | ✘ rechazado | 2026-11-06 | 5 | `art-source/runway-enemies/fortaleza/dragon_forja` | Hoja peor que el retrato de campo de batalla; retirada (RUNWAY_ENEMIES.md); imágenes en rejected/. |
| `hoja_minotauro` | ✘ rechazado | 2026-11-06 | 5 | `art-source/runway-enemies/laberinto/minotauro` | Hoja peor que el retrato de campo de batalla; retirada (RUNWAY_ENEMIES.md). |
| `leviatan_imagenes_15` | ✔ integrado | 2026-11-06 |  | `assets/sprites/bosses/acuatica/leviatan/head_01.png`<br>`art-source/runway-redraw/sprites/bosses/acuatica/leviatan/orig/head_01.png` | Solo se usan si el retrato de campo de batalla no carga (el retrato manda). Sin recibos: 15 imágenes gen4_image, créditos no registrados (sin_verificar). |

## campeon_cuerpo (11)

| id | estado | fecha | cr | dónde está | nota |
|---|---|---|---:|---|---|
| `libertador_hoja_ref` | ◐ sin integrar | 2026-11-06 | 24 | `art-source/runway-guardians/libertador/ref_frente/master.png`<br>`art-source/runway-guardians/libertador/codex-v1-candidato/atlas.png` | Es referencia para animar: un cuadro por vista. El candidato derivado (build-libertador-codex.py) NO está cargado por el motor. |
| `libertador_poses_caminata_caida_caballo` | ✔ integrado | 2026-11-07 | 200 | `assets/sprites/champions/libertador/v2/atlas.png`<br>`assets/sprites/champions/libertador/v3/motion.png`<br>`assets/sprites/champions/libertador/v2/death.png` … | Descartadas: q_fire (fusil hacia el lado contrario) y q_rem2; q_reload2 duplica reload. El gasto incluye 3 duplicadas. |
| `profeta_poses` | ✔ integrado | 2026-11-06 | 128 | `assets/sprites/champions/profeta/v2/atlas.png`<br>`art-source/runway-guardians/profeta/atlas-candidato/atlas.png`<br>`assets/sprites/champions/profeta/codex-v1/atlas.png` | PARCIAL: el juego principal carga codex-v1 (pintor determinista, js/assets/champion-sprites.js:406), no este atlas. El atlas Runway (profeta/v2) solo lo usa Crystal Wars (js/modes/crystal-wars/atlas.js). Descartadas pf_up y pg_wu2 (salen de frente, no de espaldas). |
| `ilkan_idle_prueba` | ◐ sin integrar | 2026-11-06 | 8 | `art-source/runway-guardians/ilkan/intento1_idle_frente/master.png` | Aceptado solo como prueba; el atlas humano de Ilkan ya es fiel al Códice. |
| `ilkan_coloso_ronda1_golem` | ✘ rechazado | 2026-11-06 | 56 | `art-source/runway-guardians/ilkan_coloso/c_frente/master.png` | Rechazada por el dueño («parece con esteroides»). Además 6 tareas fallaron BAD_OUTPUT (cobradas, ≈8 cr c/u, sin recibo) cuando el prompt pedía «skull-like/hollow ribcage» sin @pose. |
| `ilkan_coloso_espiritu` | ✔ integrado | 2026-11-06 | 104 | `assets/sprites/champions/ilkan/v2/colossus.png`<br>`assets/sprites/champions/ilkan/skins/legion/colossus.png`<br>`art-source/runway-guardians/ilkan_coloso/atlas-candidato/colossus.png` | Descartada s_ataque (texto en la imagen). El atlas instalado es el candidato reducido a ≤48 colores (difiere por bytes del candidato). |
| `myla_caida` | ✔ integrado | 2026-11-06 | 24 | `assets/sprites/champions/myla/v2/death.png`<br>`art-source/runway-guardians/myla/death-candidato/death.png` | d3 FALLÓ 3 veces con BAD_OUTPUT (cobradas, sin recibo): no volver a intentarla; se usan d1/d2 + el maestro inclinado. |
| `saelis_caida` | ✔ integrado | 2026-11-07 | 8 | `art-source/runway-guardians/saelis/s_death1/master.png`<br>`assets/sprites/champions/saelis/atlas.png` | Evidencia indirecta: el master y assets/sprites/champions/saelis/atlas.png entran en el mismo commit 843353a0 y ART_CREDITS lo declara integrado; no comparé píxel a píxel (el atlas se reescaló después en 1fa7ccc8). |
| `tanque_f24_diseno` | ◐ sin integrar | 2026-11-12 | 24 | `art-source/runway-guardians/tanque/f24_a5/master.png`<br>`tools/art/codex-clean.py` | a1 rechazada (texto del título en la imagen, sin espada); a2 descartada (prompt «test»); a3/a4 BAD_OUTPUT (el saldo bajó ~5 y ~20, no atribuible). Solo a5 sirve como DISEÑO; no demuestra poses. |
| `tanque_lote_cuadros` | ✘ rechazado | 2026-11-12 | 86 | `art-source/runway-guardians/tanque/f12_a1/master.png`<br>`art-source/runway-guardians/tanque/f27_a1/master.png` | gen4_image ignora la pose pedida y devuelve siempre un personaje de pie (golpe y recuperar salieron idénticos a una pose de pie); las poses agachadas o tendidas dan BAD_OUTPUT con cobro (86 cr por saldo 856→770 para 2 imágenes y 6 fallos; sin recibo). Medido: 0 aprobados. |
| `regla_campeon_cuerpo_imagenes_sueltas` | ✘ rechazado | 2026-11-12 |  | `docs/beta-release/ART_CREDITS.md`<br>`docs/art-brief/runway-pack/RECETA.md` | Medido: 0 aprobados en 13+ imágenes del Tanque; mismo límite visto en Profeta pf_up y Myla d3. Solo sirvió con @pose de una imagen aceptada de la misma serie y poses de pie (Libertador/Profeta/Coloso). |

## campeon_video (2)

| id | estado | fecha | cr | dónde está | nota |
|---|---|---|---:|---|---|
| `tanque_video_caminatas` | ◐ sin integrar | 2026-11-12 | 65 | `art-source/runway-video/tanque/ws1/clip.mp4`<br>`art-source/runway-video/tanque/wd3/clip.mp4`<br>`art-source/runway-video/tanque/candidate/atlas.png` … | Aceptados a ojo: ws1 y wd3. Rechazados: w1 y wd2 (cuadros casi iguales); wu1 débil. El atlas candidato NO está instalado: el atlas dibujado actual tiene más pose y roster_gate con el candidato da scaleFailures 4 (base 0). Muestra de 1 campeón. |
| `tanque_video_combate` | ✘ rechazado | 2026-11-12 | 70 | `art-source/runway-video/tanque/ad1/clip.mp4`<br>`art-source/runway-video/tanque/ul1/clip.mp4` | La definitiva (ul1, ul2 con salto) sale igual a lanzar; ataque/lanzar/muerte dan menos pose que el atlas actual; el último cuadro de la muerte mide 23 px. Hallazgo: el video sirve para variar caminata, no para ataque/definitiva/muerte. |

## otro (3)

| id | estado | fecha | cr | dónde está | nota |
|---|---|---|---:|---|---|
| `hud_marcos_arcano` | ✔ integrado | 2026-11-02 | 30 | `art-source/runway-hud/arcano_ring/master.png`<br>`art-source/runway-hud/arcano_ult/master.png`<br>`css/ui-factory/fx/hero/atlas.json` … | Gasto real 30 cr (6 imágenes a 5 cr); solo 2 tienen recibo (10 cr). Las otras 4 imágenes y sus task ids NO están en el repo (sin_verificar). |
| `referencias_codex_limpias` | ◐ sin integrar | 2026-11-12 |  | `tools/art/codex-clean.py`<br>`art-source/runway-pose-refs/tanque` | 0 créditos. art-source/runway-codex-clean/ está en .gitignore (se regenera con tools/art/codex-clean.py): no esperar que exista en un checkout limpio. |
| `saldo_runway` | ⛔ bloqueado | 2026-11-12 |  | `docs/beta-release/ART_CREDITS.md`<br>`docs/art-brief/runway-pack/COSTOS.md` | sin_verificar: no se llamó a la API en esta auditoría. Último dato en ART_CREDITS: 530 al terminar el piloto de video (2026-11-12), con 2 el 2026-11-11 antes de recargar. Cuenta compartida: baja sin que se genere nada. |

## NO REPETIR (rechazados y su motivo)

- ✘ **`casa_b`** (fachada, 2026-11-06, 8 cr): Salió en vista isométrica: no coincide con la vista oblicua frontal del juego. Queda solo como referencia (ART_CREDITS, 2026-11-06). **Siguiente:** NO repetir con el mismo prompt. Si se necesita otra casa: pedir «front-on oblique view, no isometric» y usar casa_a como @ref.
- ✘ **`abismo_piso`** (piso_arena, 2026-11-06, 8 cr): El maestro salió como UNA losa enmarcada con borde negro y una diagonal; recortando 2x2 losas y repitiendo, la diagonal forma un papel tapiz evidente (intento 1 de 3, ART_CREDITS 2026-11-06). El Abismo conserva su tex_piso del Códice (no es de Runway: sin cambios desde 34ac2852). **Siguiente:** NO repetir el prompt. Solo si el dueño lo pide: prompt sin marco, sin diagonales, losas uniformes. No hay faltante real: el Abismo ya tiene piso.
- ✘ **`ilkan_coloso_ronda1_golem`** (campeon_cuerpo, 2026-11-06, 56 cr): Rechazada por el dueño («parece con esteroides»). Además 6 tareas fallaron BAD_OUTPUT (cobradas, ≈8 cr c/u, sin recibo) cuando el prompt pedía «skull-like/hollow ribcage» sin @pose. **Siguiente:** NO repetir. Regla: sin @pose de una imagen aceptada de la misma serie, las poses raras dan BAD_OUTPUT cobrado.
- ✘ **`tanque_lote_cuadros`** (campeon_cuerpo, 2026-11-12, 86 cr): gen4_image ignora la pose pedida y devuelve siempre un personaje de pie (golpe y recuperar salieron idénticos a una pose de pie); las poses agachadas o tendidas dan BAD_OUTPUT con cobro (86 cr por saldo 856→770 para 2 imágenes y 6 fallos; sin recibo). Medido: 0 aprobados. **Siguiente:** NO repetir: no pedir poses de campeón con imágenes sueltas.
- ✘ **`tanque_video_combate`** (campeon_video, 2026-11-12, 70 cr): La definitiva (ul1, ul2 con salto) sale igual a lanzar; ataque/lanzar/muerte dan menos pose que el atlas actual; el último cuadro de la muerte mide 23 px. Hallazgo: el video sirve para variar caminata, no para ataque/definitiva/muerte. **Siguiente:** NO repetir.
- ✘ **`regla_campeon_cuerpo_imagenes_sueltas`** (campeon_cuerpo, 2026-11-12, 0 cr): Medido: 0 aprobados en 13+ imágenes del Tanque; mismo límite visto en Profeta pf_up y Myla d3. Solo sirvió con @pose de una imagen aceptada de la misma serie y poses de pie (Libertador/Profeta/Coloso). **Siguiente:** NO invertir créditos en campeon_cuerpo por imágenes sueltas ni en animación de campeones con hojas.
- ✘ **`hoja_leviatan`** (jefe, 2026-11-06, 5 cr): La hoja salió plana y casi sin variación, peor que el arte vigente (RUNWAY_ENEMIES.md). **Siguiente:** NO repetir tal cual (hoja/animación de enemigos con Runway: medido, ver regla).
- ✘ **`hoja_bestia_bosque`** (jefe, 2026-11-06, 5 cr): La hoja Runway era otra criatura: peor que el retrato de campo de batalla; se retiró (docs/art-gate/RUNWAY_ENEMIES.md). **Siguiente:** NO repetir tal cual (hoja/animación de enemigos con Runway: medido, ver regla).
- ✘ **`hoja_dragon_forja`** (jefe, 2026-11-06, 5 cr): Hoja peor que el retrato de campo de batalla; retirada (RUNWAY_ENEMIES.md); imágenes en rejected/. **Siguiente:** NO repetir tal cual (hoja/animación de enemigos con Runway: medido, ver regla).
- ✘ **`hoja_golem_piedra`** (enemigo_hoja, 2026-11-06, 5 cr): Rechazada; el MOTIVO no está documentado en el repo (solo el recibo con nota genérica). **Siguiente:** NO repetir tal cual (hoja/animación de enemigos con Runway: medido, ver regla).
- ✘ **`hoja_minotauro`** (jefe, 2026-11-06, 5 cr): Hoja peor que el retrato de campo de batalla; retirada (RUNWAY_ENEMIES.md). **Siguiente:** NO repetir tal cual (hoja/animación de enemigos con Runway: medido, ver regla).
- ✘ **`hoja_chaman`** (enemigo_hoja, 2026-11-07, 5 cr): La hoja salió con texto dentro de la imagen (docs/art-gate/MICELIAL_RUNWAY_20261107.md); sigue el atlas viejo. **Siguiente:** NO repetir tal cual (hoja/animación de enemigos con Runway: medido, ver regla).
- ✘ **`regla_animacion_hojas_enemigos`** (enemigo_hoja, 2026-11-12, 0 cr): Los 4 rehechos del 2026-11-12 (8 hojas, 40 cr): 0 mejoran el atlas vigente. Runway no da ciclos de caminata distintos (cuadros casi idénticos) ni muerte limpia (funde dos cuerpos o agrega cristales). El camino válido fue SOLO enemigos sin hoja o con hoja pobre. **Siguiente:** NO rehacer hojas de enemigos ya instaladas; NO pedir ciclos de caminata a Runway (usar proc_walk).

También medido (sin entrada propia): Runway ignora la pose pedida y cobra los `BAD_OUTPUT` (~8 cr c/u); los prompts largos con anatomía rara fallan sin `@pose`; un prompt con texto genera texto dentro de la imagen; los ciclos de caminata salen con cuadros casi idénticos. Un fallo seguido de otro igual = parar.

## Sin verificar (lo que NO se pudo comprobar)

- ? `saelis_caida`: sin_verificar a nivel de píxel; atlas cargado por js/champions/ascension/art.js:27
- ? `leviatan_imagenes_15`: Solo se usan si el retrato de campo de batalla no carga (el retrato manda). Sin recibos: 15 imágenes gen4_image, créditos no registrados (sin_verificar).
- ? `hud_marcos_arcano`: Gasto real 30 cr (6 imágenes a 5 cr); solo 2 tienen recibo (10 cr). Las otras 4 imágenes y sus task ids NO están en el repo (sin_verificar).
- ? `saldo_runway`: sin_verificar

## PRÓXIMOS TRABAJOS (ordenados por valor/costo; solo donde Runway ya funcionó)

Excluido a propósito: `campeon_cuerpo` por imágenes sueltas y animación de campeones/enemigos con hojas o video (medido: 0 aprobados). Valor 1-5; costo en créditos a 8 por imagen (reservar un 2.º intento si dice «reserva»).

| # | id | categoría | valor | costo (cr) | por qué falta de verdad | siguiente paso |
|---:|---|---|---:|---:|---|---|
| 1 | `prox_integrar_casa_a` | fachada | 4 | 0 | Ya está pagada (8 cr) y aceptada como dirección; solo falta el pintor determinista. | Seguir el patrón de tools/art-world/build-ciudad-estatua.py. |
| 2 | `lamina_ilsa` | lamina_campeon | 5 | 8 | Único faltante del Códice (43 de 46). 1 intento; si sale con texto o mal, reservar un 2.º (16). El Códice existente es de ChatGPT: esta lámina sería la excepción Runway. | Paso 0 de la ficha: node tools/art-world/runway-design.js ilsa codex1 "<prompt>" (--dry-run primero). Sin recibo en art-source/runway-designs/ (esa carpeta ni existe: nunca se corrió). |
| 3 | `lamina_kora` | lamina_campeon | 5 | 8 | Único faltante del Códice (43 de 46). 1 intento; si sale con texto o mal, reservar un 2.º (16). El Códice existente es de ChatGPT: esta lámina sería la excepción Runway. | Paso 0 de la ficha: node tools/art-world/runway-design.js kora codex1 "<prompt>" (--dry-run primero). Sin recibo en art-source/runway-designs/ (esa carpeta ni existe: nunca se corrió). |
| 4 | `lamina_vorn` | lamina_campeon | 5 | 8 | Único faltante del Códice (43 de 46). 1 intento; si sale con texto o mal, reservar un 2.º (16). El Códice existente es de ChatGPT: esta lámina sería la excepción Runway. | Paso 0 de la ficha: node tools/art-world/runway-design.js vorn codex1 "<prompt>" (--dry-run primero). Sin recibo en art-source/runway-designs/ (esa carpeta ni existe: nunca se corrió). |
| 5 | `prox_piso_bosque` | piso_arena | 4 | 8 | Sigue siendo el piso procedural (FLOOR_THEME). Runway funcionó en 5 de 6 pisos (falló solo abismo por marco/diagonal). | Copiar el prompt de laberinto_piso/infernal_piso (TEX) y añadir la clave a FLOOR_PAINTED en js/rendering/arena.js. Reserva 16 (reintento). |
| 6 | `prox_piso_hielo` | piso_arena | 4 | 8 | Sigue siendo el piso procedural (FLOOR_THEME). Runway funcionó en 5 de 6 pisos (falló solo abismo por marco/diagonal). | Copiar el prompt de laberinto_piso/infernal_piso (TEX) y añadir la clave a FLOOR_PAINTED en js/rendering/arena.js. Reserva 16 (reintento). |
| 7 | `prox_centro_bosque` | centro_arena | 3 | 8 | Los 4 centros intentados (infernal, acuática, laberinto, rejilla de fortaleza) salieron aceptados. | Prompt DECAL de runway-world.js sobre croma verde; build-centro-arena.py; agregar clave a DECAL_PAINTED. |
| 8 | `prox_centro_hielo` | centro_arena | 3 | 8 | Los 4 centros intentados (infernal, acuática, laberinto, rejilla de fortaleza) salieron aceptados. | Prompt DECAL de runway-world.js sobre croma verde; build-centro-arena.py; agregar clave a DECAL_PAINTED. |
| 9 | `prox_piso_divina` | piso_arena | 2 | 8 | Último piso procedural sin pintar. | Prompt TEX violeta con vetas doradas; clave en FLOOR_PAINTED. |
| 10 | `prox_fachadas_ciudad_t06` | fachada | 5 | 32 | Bloque P0 B062 (se nota en una partida). casa_a demostró la dirección (vista oblicua frontal); casa_b falló por isométrica: pedir oblicuo explícito. | Una imagen por edificio con @ref = casa_a; integrar como fachada. |
| 11 | `prox_props_infernal` | prop_mundo | 4 | 32 | Mismo método que ciudad_estatua/farol (croma + BOX + alfa binario), 2 de 2 aceptados. | Un prop por imagen con @ref recorte del Códice de Infernal. |
| 12 | `prox_props_hielo` | prop_mundo | 4 | 32 | Idem. | Idem con la portada de Hielo. |
| 13 | `prox_props_bosque` | prop_mundo | 4 | 32 | Idem. | Idem con la portada de Bosque. |
| 14 | `prox_props_laberinto` | prop_mundo | 3 | 24 | Idem. | Idem con la portada de Laberinto. |
| 15 | `prox_hojas_fortaleza` | enemigo_hoja | 3 | 24 | En enemigos SIN hoja Runway el método rindió: 29 de 35 criaturas con hoja Runway instaladas (las 6 restantes: jefes/bestia retirados, golem_piedra, chamán). NO aplica a rehacer hojas existentes. | gen_sheet.py <arena> <id> según su ficha enemigos/fortaleza.md; 1 hoja = 1 imagen 1280x720 (observado 5 cr; se presupuesta 8). |

**Costo total de la lista: 240 cr** (30 imágenes a 8 cr; sin reintentos).

