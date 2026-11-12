# Atlas de arte — qué carga el juego real

Generado por `node tools/art/build-art-atlas.js` (no editar a mano). Fuente de verdad: el runtime (Chromium, `index.html?dev=1&lazy=1`, webp activo); el detalle completo está en `ATLAS_ARTE.json`. Referencia única de calidad: el **Códice**. El atlas vigente de cada campeón se registra a mano en `ATLAS_VIGENTE.json`.

## Estados

| Estado | Significado |
|---|---|
| CODEX_OK | Arte vigente de la generación Códice (o validado contra el Códice en la auditoría) y todos sus ciclos animados. En archivos sueltos: cargado/referenciado por el juego. |
| ARTE_VIEJO | El juego dibuja arte anterior al Códice (o procedural/prestado). |
| FALTA_ANIMACION | Un clip que debería ser ciclo sale con 1 cuadro (o, en enemigos, caminata de 2 cuadros o menos). |
| HUERFANO | Archivo del repo que el juego ni carga ni referencia. |

## Resumen

- Campeones: FALTA_ANIMACION 25 · CODEX_OK 12 · ARTE_VIEJO 9
- Skins/cromas/formas de Ascensión: CODEX_OK 9 · FALTA_ANIMACION 90 · ARTE_VIEJO 5
- Enemigos: CODEX_OK 63 · FALTA_ANIMACION 12 · ARTE_VIEJO 1
- Jefes y subjefes: CODEX_OK 14 · FALTA_ANIMACION 13 · ARTE_VIEJO 1
- Archivos (arenas, props, battlefield, enemigos, jefes, campeones): CODEX_OK 871 · HUERFANO 104 · ARTE_VIEJO 30
- Fuentes del registro: 51 archivos, huella `2d46658008ed`

## Campeones (cuerpo base)

Cuadros DISTINTOS medidos al dibujar el cuerpo real, mínimo entre las 4 direcciones (down/side/left/up). `hit` es una pose: 1 cuadro es válido. Brechas = estados que deberían ser ciclo con 1 cuadro.

| Campeón | Estado | Gen. | Atlas cargado (dim.) | idle | walk | atk | cast | ult | hit | death | Brechas |
|---|---|---|---|--:|--:|--:|--:|--:|--:|--:|---|
| tanque | FALTA_ANIMACION | codex (92) | `tanque/codex-v1/atlas.png` (webp) 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| guerrero | FALTA_ANIMACION | codex (92) | `guerrero/codex-v1/atlas.png` (webp) 576x1296 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| mago | CODEX_OK | codex (74) | `mago/codex-v1/atlas.png` 448x1232 | 3 | 4 | 4 | 4 | 4 | 1 | 4 | - |
| soporte | CODEX_OK | codex (62) | `soporte/codex-v1/atlas.png` (webp) 448x1456 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | - |
| segador | CODEX_OK | codex (64) | `segador/codex-v1/atlas.png` (webp) 448x1456 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | - |
| axiom | FALTA_ANIMACION | codex (88) | `axiom/codex-v1/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| profeta | CODEX_OK | codex (66) | `profeta/codex-v1/atlas.png` (webp) 448x1456 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | - |
| musashi | FALTA_ANIMACION | codex (90) | `musashi/codex-v1/atlas.png` 768x2080 | 1 | 4 | 4 | 4 | 4 | 4 | 6 | idle |
| cazadora | FALTA_ANIMACION | codex (90) | `cazadora/codex-v1/atlas.png` 768x2080 | 1 | 4 | 4 | 4 | 4 | 4 | 6 | idle |
| nigromante | FALTA_ANIMACION | codex (90) | `nigromante/codex-v1/atlas.png` 768x2080 | 1 | 4 | 3 | 4 | 4 | 4 | 6 | idle |
| libertador | ARTE_VIEJO | viejo (60) | `libertador/v2/atlas.png` (webp) 824x784<br>`libertador/v2/death.png` 448x112<br>`libertador/v3/motion.png` 1344x112 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| ilkan | CODEX_OK | codex (62) | `ilkan/codex-v1/atlas.png` 1536x1024 | 4 | 3 | 3 | 3 | 3 | 2 | 2 | - |
| ynara | ARTE_VIEJO | viejo (70) | `ynara/atlas.png` 384x1056 | 3 | 4 | 4 | 4 | 4 | 1 | 4 | - |
| myla | ARTE_VIEJO | viejo (58) | `myla/atlas.png` 384x576<br>`myla/v2/death.png` 448x112 | 2 | 3 | 3 | 3 | 3 | 1 | 4 | - |
| brasa | CODEX_OK | audit-fiel (88) | `brasa/atlas.png` (webp) 576x864 | 2 | 4 | 3 | 3 | 2 | 1 | 3 | - |
| eslabon | CODEX_OK | audit-fiel (88) | `eslabon/atlas.png` (webp) 576x864 | 2 | 4 | 3 | 3 | 2 | 1 | 3 | - |
| morwen | CODEX_OK | audit-fiel (88) | `morwen/atlas.png` (webp) 576x864 | 2 | 4 | 3 | 3 | 2 | 1 | 3 | - |
| farolero | CODEX_OK | audit-fiel (86) | `farolero/atlas.png` (webp) 576x864 | 2 | 4 | 3 | 3 | 2 | 1 | 3 | - |
| iria | CODEX_OK | audit-fiel (86) | `iria/atlas.png` (webp) 576x864 | 2 | 4 | 3 | 3 | 2 | 1 | 3 | - |
| vesper | FALTA_ANIMACION | audit-fiel (86) | `vesper/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| nahir | FALTA_ANIMACION | audit-fiel (86) | `nahir/atlas.png` 448x1008 | 1 | 3 | 4 | 4 | 4 | 1 | 4 | idle |
| baltra | FALTA_ANIMACION | audit-fiel (86) | `baltra/atlas.png` 448x1008 | 1 | 4 | 3 | 4 | 4 | 1 | 4 | idle |
| maura | FALTA_ANIMACION | audit-fiel (84) | `maura/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| dariel | FALTA_ANIMACION | audit-fiel (86) | `dariel/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| orsa | FALTA_ANIMACION | audit-fiel (86) | `orsa/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| tibor | FALTA_ANIMACION | audit-fiel (86) | `tibor/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| zahra | FALTA_ANIMACION | audit-fiel (86) | `zahra/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| renko | FALTA_ANIMACION | audit-fiel (85) | `renko/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| sira | FALTA_ANIMACION | audit-fiel (85) | `sira/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| nano_gm | CODEX_OK | codex (88) | `nano_gm/codex-v2/atlas.png` (webp) 1536x1792 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | - |
| facu_gm | ARTE_VIEJO | viejo (56) | `facu_gm/atlas.png` 448x1008 | 1 | 3 | 4 | 4 | 4 | 1 | 4 | idle |
| aurelia | ARTE_VIEJO | viejo (66) | `aurelia/atlas.png` 448x1232 | 3 | 4 | 4 | 4 | 4 | 1 | 4 | - |
| khepri | FALTA_ANIMACION | audit-fiel (82) | `khepri/atlas.png` 448x1008 | 1 | 3 | 4 | 4 | 4 | 1 | 4 | idle |
| velmira | FALTA_ANIMACION | audit-fiel (84) | `velmira/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| vhal | FALTA_ANIMACION | audit-fiel (80) | `vhal/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| bront | FALTA_ANIMACION | audit-fiel (82) | `bront/atlas.png` 448x1008 | 1 | 4 | 3 | 4 | 4 | 1 | 4 | idle |
| oriel | FALTA_ANIMACION | audit-fiel (84) | `oriel/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| saelis | ARTE_VIEJO | viejo (64) | `saelis/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| ilsa | ARTE_VIEJO | viejo (76) | `ilsa/atlas.png` 448x1232 | 3 | 4 | 4 | 4 | 4 | 1 | 4 | - |
| vorn | ARTE_VIEJO | viejo (76) | `vorn/atlas.png` 448x1232 | 3 | 4 | 4 | 4 | 4 | 1 | 4 | - |
| kora | ARTE_VIEJO | viejo (70) | `kora/atlas.png` 448x1232 | 3 | 4 | 4 | 4 | 4 | 1 | 4 | - |
| solciju | FALTA_ANIMACION | audit-fiel (84) | `solciju/atlas.png` 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| veyra | CODEX_OK | codex (90) | `veyra/codex-v1/atlas.png` 1536x2016 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | - |
| brakk | FALTA_ANIMACION | audit-fiel (88) | `brakk/atlas.png` 448x1008 | 1 | 4 | 3 | 4 | 4 | 1 | 4 | idle |
| morveth | FALTA_ANIMACION | codex (90) | `morveth/codex-v1/atlas.png` (webp) 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |
| aelith | FALTA_ANIMACION | codex (90) | `aelith/codex-v1/atlas.png` (webp) 448x1008 | 1 | 4 | 4 | 4 | 4 | 1 | 4 | idle |

## Skins, cromas y formas de Ascensión

| Campeón | Apariencia | Tipo | Estado | Atlas | walk | atk | death | Brechas |
|---|---|---|---|---|--:|--:|--:|---|
| tanque | baluarte | set | CODEX_OK | `tanque/skins/baluarte/atlas.png` 576x864 | 4 | 3 | 3 | - |
| tanque | tanque_ancestral | croma | FALTA_ANIMACION | `tanque/skins/tanque_ancestral/atlas.png` 896x336 | 3 | 2 | 2 | idle |
| tanque | tanque_juicio | croma | FALTA_ANIMACION | `tanque/skins/tanque_juicio/atlas.png` 896x336 | 3 | 2 | 2 | idle |
| guerrero | nocturno | set | FALTA_ANIMACION | `guerrero/skins/nocturno/atlas.png` 448x342 | 4 | 2 | 3 | idle |
| mago | convergencia | set | ARTE_VIEJO | `mago/skins/convergencia/atlas.png` 736x375 | 3 | 2 | 6 | idle — skin Ángel Arcano del Mago: atlas 92x75 de 8 columnas anterior al Códice (idle de 1 cuadro, ataque de 2) |
| soporte | custodio | set | FALTA_ANIMACION | `soporte/skins/custodio/atlas.png` 712x370 | 3 | 2 | 6 | idle |
| segador | marea | set | FALTA_ANIMACION | `segador/skins/marea/atlas.png` 464x354 | 2 | 2 | 5 | idle |
| segador | segador_escarcha | croma | FALTA_ANIMACION | `segador/skins/segador_escarcha/atlas.png` 896x336 | 3 | 2 | 2 | idle |
| axiom | sistema | set | FALTA_ANIMACION | `axiom/skins/sistema/codex-v1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| axiom | axiom_piedra | croma | FALTA_ANIMACION | `axiom/skins/axiom_piedra/codex-v1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| profeta | profecia | set | FALTA_ANIMACION | `profeta/skins/profecia/atlas.png` 544x372 | 2 | 2 | 6 | idle |
| profeta | profeta_ancestral | croma | FALTA_ANIMACION | `profeta/skins/profeta_ancestral/atlas.png` 896x336 | 3 | 2 | 2 | idle |
| musashi | errante | set | FALTA_ANIMACION | `musashi/skins/errante/atlas.png` 608x396 | 3 | 2 | 6 | idle |
| musashi | musashi_ancestral | croma | FALTA_ANIMACION | `musashi/skins/musashi_ancestral/atlas.png` 896x336 | 3 | 2 | 2 | idle |
| cazadora | manada | set | FALTA_ANIMACION | `cazadora/skins/manada/atlas.png` 608x366 | 3 | 2 | 6 | idle |
| cazadora | cazadora_escarcha | croma | FALTA_ANIMACION | `cazadora/skins/cazadora_escarcha/atlas.png` 896x336 | 3 | 2 | 2 | idle |
| nigromante | requiem | set | CODEX_OK | `nigromante/skins/requiem/atlas.png` 576x864 | 4 | 3 | 3 | - |
| nigromante | nigromante_escarcha | croma | FALTA_ANIMACION | `nigromante/skins/nigromante_escarcha/atlas.png` 896x336 | 3 | 2 | 2 | idle |
| nigromante | nigromante_piedra | croma | FALTA_ANIMACION | `nigromante/skins/nigromante_piedra/atlas.png` 896x336 | 3 | 2 | 2 | idle |
| libertador | granadero | set | CODEX_OK | `libertador/skins/granadero/atlas.png` 576x864 | 4 | 3 | 3 | - |
| libertador | libertador_escarcha | croma | ARTE_VIEJO | `libertador/skins/libertador_escarcha/atlas.png` 896x336 | 3 | 1 | 2 | idle, attack, cast, ultimate — recolor del atlas v2 del Libertador, sin el motion v3: ataque de 1 cuadro |
| libertador | libertador_ancestral | croma | ARTE_VIEJO | `libertador/skins/libertador_ancestral/atlas.png` 896x336 | 3 | 1 | 2 | idle, attack, cast, ultimate — recolor del atlas v2 del Libertador, sin el motion v3: ataque de 1 cuadro |
| ilkan | legion | set | ARTE_VIEJO | `ilkan/skins/legion/atlas.png` 1536x1024 | 3 | 3 | 2 | - — skin Legión de Ilkan: atlas procedural violeta de 128x111 (tools/art/ilkan/build.py), sin repintar desde codex-v1 (AUDITORIA_ARTE_CAMPEONES.md) |
| ynara | santa_paciencia | set | FALTA_ANIMACION | `ynara/skins/santa_paciencia/atlas.png` 384x576 | 3 | 4 | 1 | idle, death |
| ynara | ynara_celeste | croma | FALTA_ANIMACION | `ynara/skins/ynara_celeste/atlas.png` 896x336 | 3 | 2 | 2 | idle |
| myla | merienda_magica | set | ARTE_VIEJO | `myla/skins/merienda_magica/atlas.png` 384x864 | 3 | 3 | 1 | death — skin Merienda Mágica de Myla: chef azul del 1 nov, sin repintar desde la base nueva; muerte de 1 cuadro (AUDITORIA_ARTE_CAMPEONES.md) |
| myla | myla_arandanos | croma | FALTA_ANIMACION | `myla/skins/myla_arandanos/atlas.png` 896x336 | 3 | 2 | 2 | idle |
| brasa | ultimo_turno | set | CODEX_OK | `brasa/skins/ultimo_turno/atlas.png` 576x864 | 4 | 3 | 3 | - |
| brasa | brasa_abisal | croma | FALTA_ANIMACION | `brasa/skins/brasa_abisal/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| eslabon | juramento_roto | set | CODEX_OK | `eslabon/skins/juramento_roto/atlas.png` 576x864 | 4 | 3 | 3 | - |
| eslabon | eslabon_porcelana | croma | FALTA_ANIMACION | `eslabon/skins/eslabon_porcelana/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| morwen | vidrio_negro | set | CODEX_OK | `morwen/skins/vidrio_negro/atlas.png` 576x864 | 4 | 3 | 3 | - |
| morwen | morwen_escarcha | croma | FALTA_ANIMACION | `morwen/skins/morwen_escarcha/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| farolero | lumbre_persistente | set | CODEX_OK | `farolero/skins/lumbre_persistente/atlas.png` 576x864 | 4 | 3 | 3 | - |
| farolero | farolero_guardavia | croma | FALTA_ANIMACION | `farolero/skins/farolero_guardavia/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| iria | hilo_umbral | set | CODEX_OK | `iria/skins/hilo_umbral/atlas.png` 576x864 | 4 | 3 | 3 | - |
| vesper | exp_vesper | set | FALTA_ANIMACION | `vesper/skins/vesper_set/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| vesper | vesper_skin | croma | FALTA_ANIMACION | `vesper/skins/vesper_skin/atlas.png` 448x896 | 4 | 2 | 4 | idle |
| vesper | vesper_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 4 | 4 | idle |
| nahir | exp_nahir | set | FALTA_ANIMACION | `nahir/skins/nahir_set/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| nahir | nahir_skin | croma | FALTA_ANIMACION | `nahir/skins/nahir_skin/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| nahir | nahir_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 3 | 4 | 4 | idle |
| baltra | exp_baltra | set | FALTA_ANIMACION | `baltra/skins/baltra_set/atlas.png` 448x1008 | 4 | 3 | 4 | idle |
| baltra | baltra_skin | croma | FALTA_ANIMACION | `baltra/skins/baltra_skin/atlas.png` 448x1008 | 4 | 3 | 4 | idle |
| baltra | baltra_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 3 | 4 | idle |
| maura | exp_maura | set | FALTA_ANIMACION | `maura/skins/maura_set/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| maura | maura_skin | croma | FALTA_ANIMACION | `maura/skins/maura_skin/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| maura | maura_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 4 | 4 | idle |
| dariel | exp_dariel | set | FALTA_ANIMACION | `dariel/skins/dariel_set/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| dariel | dariel_luthier | croma | FALTA_ANIMACION | `dariel/skins/dariel_luthier/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| dariel | dariel_skin | croma | FALTA_ANIMACION | `dariel/skins/dariel_skin/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| dariel | dariel_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 4 | 4 | idle |
| orsa | exp_orsa | set | FALTA_ANIMACION | `orsa/skins/orsa_set/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| orsa | orsa_skin | croma | FALTA_ANIMACION | `orsa/skins/orsa_skin/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| orsa | orsa_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 4 | 4 | idle |
| tibor | exp_tibor | set | FALTA_ANIMACION | `tibor/skins/tibor_set/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| tibor | tibor_skin | croma | FALTA_ANIMACION | `tibor/skins/tibor_skin/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| tibor | tibor_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 4 | 4 | idle |
| zahra | exp_zahra | set | FALTA_ANIMACION | `zahra/skins/zahra_set/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| zahra | zahra_skin | croma | FALTA_ANIMACION | `zahra/skins/zahra_skin/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| zahra | zahra_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 4 | 4 | idle |
| renko | exp_renko | set | FALTA_ANIMACION | `renko/skins/renko_set/atlas.png` 448x1120 | 4 | 4 | 4 | idle |
| renko | renko_skin | croma | FALTA_ANIMACION | `renko/skins/renko_skin/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| renko | renko_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 4 | 4 | idle |
| sira | exp_sira | set | FALTA_ANIMACION | `sira/skins/sira_set/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| sira | sira_skin | croma | FALTA_ANIMACION | `sira/skins/sira_skin/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| sira | sira_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 4 | 4 | idle |
| nano_gm | nano_gm_alt1 | asc | FALTA_ANIMACION | `nano_gm/skins/nano_gm_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| facu_gm | facu_gm_alt1 | asc | FALTA_ANIMACION | `facu_gm/atlas.png` 448x1008<br>`facu_gm/skins/facu_gm_alt1/atlas.png` 448x1008 | 3 | 4 | 4 | idle |
| aurelia | aurelia_alt1 | asc | FALTA_ANIMACION | `aurelia/atlas.png` 448x1232<br>`aurelia/skins/aurelia_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| aurelia | aurelia_alt2 | asc | FALTA_ANIMACION | `aurelia/atlas.png` 448x1232<br>`aurelia/skins/aurelia_alt2/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| khepri | khepri_alt1 | asc | FALTA_ANIMACION | `khepri/atlas.png` 448x1008<br>`khepri/skins/khepri_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| khepri | khepri_alt2 | asc | FALTA_ANIMACION | `khepri/atlas.png` 448x1008<br>`khepri/skins/khepri_alt2/atlas.png` 448x1008 | 3 | 4 | 4 | idle |
| velmira | velmira_alt1 | asc | FALTA_ANIMACION | `velmira/atlas.png` 448x1008<br>`velmira/skins/velmira_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| velmira | velmira_alt2 | asc | FALTA_ANIMACION | `velmira/atlas.png` 448x1008<br>`velmira/skins/velmira_alt2/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| vhal | vhal_alt1 | asc | FALTA_ANIMACION | `vhal/atlas.png` 448x1008<br>`vhal/skins/vhal_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| vhal | vhal_alt2 | asc | FALTA_ANIMACION | `vhal/atlas.png` 448x1008<br>`vhal/skins/vhal_alt2/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| bront | bront_alt1 | asc | FALTA_ANIMACION | `bront/atlas.png` 448x1008<br>`bront/skins/bront_alt1/atlas.png` 448x1008 | 4 | 3 | 4 | idle |
| bront | bront_alt2 | asc | FALTA_ANIMACION | `bront/atlas.png` 448x1008<br>`bront/skins/bront_alt2/atlas.png` 448x1008 | 4 | 3 | 4 | idle |
| oriel | oriel_alt1 | asc | FALTA_ANIMACION | `oriel/atlas.png` 448x1008<br>`oriel/skins/oriel_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| oriel | oriel_alt2 | asc | FALTA_ANIMACION | `oriel/atlas.png` 448x1008<br>`oriel/skins/oriel_alt2/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| saelis | saelis_alt1 | asc | FALTA_ANIMACION | `saelis/atlas.png` 448x1008<br>`saelis/skins/saelis_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| saelis | saelis_alt2 | asc | FALTA_ANIMACION | `saelis/atlas.png` 448x1008<br>`saelis/skins/saelis_alt2/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| ilsa | ilsa_alt1 | asc | FALTA_ANIMACION | `ilsa/atlas.png` 448x1232<br>`ilsa/skins/ilsa_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| ilsa | ilsa_alt2 | asc | FALTA_ANIMACION | `ilsa/atlas.png` 448x1232<br>`ilsa/skins/ilsa_alt2/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| vorn | vorn_alt1 | asc | FALTA_ANIMACION | `vorn/atlas.png` 448x1232<br>`vorn/skins/vorn_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| vorn | vorn_alt2 | asc | FALTA_ANIMACION | `vorn/atlas.png` 448x1232<br>`vorn/skins/vorn_alt2/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| kora | kora_alt1 | asc | FALTA_ANIMACION | `kora/atlas.png` 448x1232<br>`kora/skins/kora_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| kora | kora_alt2 | asc | FALTA_ANIMACION | `kora/atlas.png` 448x1232<br>`kora/skins/kora_alt2/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| solciju | quality_solciju | set | FALTA_ANIMACION | `solciju/skins/quality_solciju/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| solciju | solciju_alt1 | croma | FALTA_ANIMACION | `solciju/skins/solciju_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| solciju | solciju_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 4 | 4 | idle |
| veyra | quality_veyra | set | FALTA_ANIMACION | `veyra/skins/quality_veyra/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| veyra | veyra_alt1 | croma | FALTA_ANIMACION | `veyra/skins/veyra_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| veyra | veyra_croma | croma | CODEX_OK | (procedural/recolor en memoria) | 4 | 4 | 4 | - |
| brakk | quality_brakk | set | FALTA_ANIMACION | `brakk/skins/quality_brakk/atlas.png` 448x1008 | 4 | 3 | 4 | idle |
| brakk | brakk_alt1 | croma | FALTA_ANIMACION | `brakk/skins/brakk_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| brakk | brakk_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 3 | 4 | idle |
| morveth | quality_morveth | set | FALTA_ANIMACION | `morveth/skins/quality_morveth/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| morveth | morveth_alt1 | croma | FALTA_ANIMACION | `morveth/skins/morveth_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| morveth | morveth_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 4 | 4 | idle |
| aelith | quality_aelith | set | FALTA_ANIMACION | `aelith/skins/quality_aelith/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| aelith | aelith_alt1 | croma | FALTA_ANIMACION | `aelith/skins/aelith_alt1/atlas.png` 448x1008 | 4 | 4 | 4 | idle |
| aelith | aelith_croma | croma | FALTA_ANIMACION | (procedural/recolor en memoria) | 4 | 4 | 4 | idle |

## Enemigos, élites, subjefes y jefes

Cuadros distintos de idle / caminata (perfil) / ataque / muerte medidos con `drawEnemyBody`. Detalle de clones y espejos: `tools/art/enemy_coverage.js`.

| Tipo | Rango | Arena | Estado | Fuente | idle | walk | atk | death | Archivo(s) |
|---|---|---|---|---|--:|--:|--:|--:|---|
| esqueleto | normal | infernal | CODEX_OK | real | 1 | 6 | 5 | 3 | `enemies/infernal/esqueleto/v2/atlas.png` 1336x338 |
| zombie | normal | infernal | CODEX_OK | real | 1 | 5 | 5 | 3 | `enemies/infernal/zombie/v2/atlas.png` 1520x398 |
| esqueleto_h | subelite | infernal | CODEX_OK | real | 1 | 4 | 4 | 3 | `enemies/infernal/esqueleto_h/v2/atlas.png` 1288x354 |
| demonio_menor | subelite | infernal | CODEX_OK | real | 1 | 5 | 5 | 3 | `enemies/infernal/demonio_menor/v2/atlas.png` 1496x320 |
| golem | elite | infernal | CODEX_OK | real | 1 | 4 | 1 | 4 | `enemies/infernal/golem/v2/atlas.png` 688x168 |
| demonio_mago | elite | infernal | CODEX_OK | real | 1 | 3 | 3 | 3 | `enemies/infernal/demonio_mago/v2/atlas.png` 1992x336 |
| demonio_mayor | jefe | infernal | CODEX_OK | real | 1 | 4 | 1 | 1 | `bosses/infernal/demonio_mayor/atlas.png` 476x714 |
| hechicero_supremo | subjefe | infernal | CODEX_OK | real | 1 | 3 | 4 | 6 | `bosses/infernal/hechicero/atlas.png` 816x565 |
| golem_cuerpos | jefe | infernal | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/golem_cuerpos.png` 1792x384 |
| angel_corrompido | jefe | infernal | CODEX_OK | real | 1 | 4 | 4 | 6 | `bosses/infernal/hechicero/angel/atlas.png` 1024x640 |
| foco_convergencia | subelite | infernal | FALTA_ANIMACION | real | 1 | 1 | 1 | 1 | `assets/vfx/bosses/hielo/bsAngelPillar_1.png` 33x75 |
| lobo_artico | normal | hielo | CODEX_OK | real | 1 | 4 | 1 | 1 | `enemies/hielo/lobo_artico/atlas.png` 384x630 |
| hada_escarcha | normal | hielo | CODEX_OK | real | 1 | 6 | 4 | 2 | `enemies/hielo/hada_escarcha/v2/atlas.png` 1176x525 |
| golem_hielo | normal | hielo | CODEX_OK | real | 1 | 6 | 4 | 3 | `enemies/hielo/golem_hielo/v2/atlas.png` 1552x561 |
| dragoncito_hielo | elite | hielo | CODEX_OK | real | 1 | 4 | 2 | 4 | `enemies/hielo/dragoncito_hielo/v2/atlas.png` 752x312 |
| angel_hielo | elite | hielo | CODEX_OK | real | 1 | 4 | 2 | 4 | `enemies/hielo/angel_hielo/v2/atlas.png` 1000x366 |
| demonio_hielo_fuego | elite | hielo | CODEX_OK | real | 1 | 4 | 3 | 2 | `enemies/hielo/demonio_hielo_fuego/v2/atlas.png` 1880x177 |
| dragon_hielo | elite | hielo | CODEX_OK | real | 1 | 4 | 3 | 5 | `enemies/hielo/dragon_hielo/v2/atlas.png` 992x186 |
| mago_hielo_cristal | jefe | hielo | CODEX_OK | real | 1 | 5 | 3 | 3 | `bosses/hielo/mago_hielo_cristal/v2/atlas.png` 960x408 |
| golem_cristal | normal | hielo | CODEX_OK | real | 1 | 4 | 4 | 5 | `enemies/hielo/golem_cristal/atlas.png` 744x404 |
| cristal_servo | normal | hielo | CODEX_OK | real | 1 | 3 | 3 | 2 | `enemies/hielo/cristal_servo/v2/atlas.png` 1440x306 |
| cristal_volador | normal | hielo | CODEX_OK | real | 1 | 6 | 5 | 3 | `enemies/hielo/cristal_volador/v2/atlas.png` 1480x282 |
| angel_caido_hielo | jefe | hielo | CODEX_OK | real | 1 | 5 | 3 | 7 | `bosses/hielo/angel_caido_hielo/v2/atlas.png` 1272x910 |
| foco_hielo | subelite | hielo | FALTA_ANIMACION | real | 1 | 1 | 1 | 1 | `assets/vfx/bosses/hielo/bsAngelPillar_1.png` 33x75 |
| duende_bosque | normal | bosque | CODEX_OK | real | 1 | 6 | 3 | 3 | `enemies/bosque/duende_bosque/v2/atlas.png` 1784x360 |
| enjambre_hadas | normal | bosque | CODEX_OK | real | 1 | 4 | 2 | 4 | `enemies/bosque/enjambre_hadas/v3/atlas.png` 440x168 |
| bestia_bosque | subelite | bosque | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/thornbeast.png` 1792x384 |
| cu_sith | elite | bosque | CODEX_OK | real | 1 | 4 | 2 | 4 | `enemies/bosque/cu_sith/v3/atlas.png` 872x120 |
| ent | elite | bosque | CODEX_OK | real | 1 | 6 | 5 | 3 | `enemies/bosque/ent/v2/atlas.png` 1216x543 |
| dama_bosque | elite | bosque | CODEX_OK | real | 1 | 4 | 4 | 6 | `enemies/bosque/dama_bosque/v2/atlas.png` 960x336 |
| doblador_guerrero | subjefe | bosque | CODEX_OK | real | 1 | 4 | 4 | 4 | `bosses/bosque/doblador_guerrero/v2/atlas.png` 464x122 |
| doblador_arquera | subjefe | bosque | CODEX_OK | real | 1 | 4 | 4 | 4 | `bosses/bosque/doblador_arquera/v2/atlas.png` 440x120 |
| doblador_picaro | subjefe | bosque | CODEX_OK | real | 1 | 4 | 4 | 4 | `bosses/bosque/doblador_picaro/v2/atlas.png` 456x122 |
| doblador_clerigo | subjefe | bosque | CODEX_OK | real | 1 | 4 | 4 | 4 | `bosses/bosque/doblador_clerigo/v2/atlas.png` 440x126 |
| guardian_ancestral | jefe | bosque | CODEX_OK | real | 1 | 3 | 5 | 7 | `bosses/bosque/guardian_ancestral/atlas.png` 800x750 |
| jinete_sin_cabeza | jefe | bosque | CODEX_OK | real | 1 | 4 | 3 | 5 | `bosses/bosque/jinete_sin_cabeza/v2/atlas.png` 656x148 |
| escorpion_gigante | normal | laberinto | CODEX_OK | real | 1 | 6 | 5 | 3 | `enemies/laberinto/escorpion_gigante/v2/atlas.png` 1040x222 |
| golem_piedra | normal | laberinto | CODEX_OK | real | 1 | 5 | 2 | 1 | `enemies/laberinto/golem_piedra/v2/atlas.png` 768x72 |
| medusa | subelite | laberinto | CODEX_OK | real | 1 | 5 | 5 | 3 | `enemies/laberinto/medusa/v2/atlas.png` 1456x354 |
| druida_arena | elite | laberinto | CODEX_OK | real | 1 | 6 | 5 | 3 | `enemies/laberinto/druida_arena/v2/atlas.png` 1536x374 |
| esfinge | elite | laberinto | CODEX_OK | real | 1 | 4 | 3 | 2 | `enemies/laberinto/esfinge/v2/atlas.png` 2056x302 |
| guardian_laberinto | subjefe | laberinto | CODEX_OK | real | 1 | 4 | 5 | 5 | `bosses/laberinto/guardian_laberinto/idle1.png` 55x53<br>`bosses/laberinto/guardian_laberinto/walk1.png` 63x51<br>`bosses/laberinto/guardian_laberinto/atk1.png` 59x53<br>`bosses/laberinto/guardian_laberinto/death1.png` 55x48 |
| minotauro | jefe | laberinto | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/minotauro.png` 1792x384 |
| tiburon_joven | normal | acuatica | CODEX_OK | real | 1 | 3 | 3 | 3 | `enemies/acuatica/tiburon_joven/v2/atlas.png` 1832x242 |
| medusa_electrica | normal | acuatica | CODEX_OK | real | 1 | 6 | 2 | 2 | `enemies/acuatica/medusa_electrica/v2/atlas.png` 2072x573 |
| cangrejo_acorazado | normal | acuatica | CODEX_OK | real | 1 | 3 | 3 | 3 | `enemies/acuatica/cangrejo_acorazado/v2/atlas.png` 1880x276 |
| sirena_abisal | normal | acuatica | CODEX_OK | real | 1 | 5 | 3 | 3 | `enemies/acuatica/sirena_abisal/v2/atlas.png` 1560x396 |
| anguila_electrica | normal | acuatica | CODEX_OK | real | 1 | 6 | 3 | 3 | `enemies/acuatica/anguila_electrica/v2/atlas.png` 1816x144 |
| tiburon_blanco | elite | acuatica | CODEX_OK | real | 1 | 6 | 3 | 3 | `enemies/acuatica/tiburon_blanco/v2/atlas.png` 2048x266 |
| kraken_joven | subjefe | acuatica | CODEX_OK | real | 1 | 4 | 1 | 5 | `bosses/acuatica/kraken_joven/idle_01.png` 115x60<br>`bosses/acuatica/kraken_joven/death_01.png` 105x61 |
| leviatan | jefe | acuatica | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/leviatan.png` 1792x384 |
| lev_tentaculo | subelite | acuatica | FALTA_ANIMACION | real | 1 | 1 | 1 | 1 | `bosses/acuatica/kraken_joven/tent_01.png` 103x72 |
| carcelero | normal | fortaleza | CODEX_OK | real | 1 | 3 | 2 | 2 | `arenas/fortaleza/carcelero/atlas.png` 2160x216 |
| dragon_bronce | normal | fortaleza | CODEX_OK | real | 1 | 4 | 2 | 2 | `arenas/fortaleza/dragon_bronce/atlas.png` 1696x270 |
| automata | elite | fortaleza | CODEX_OK | real | 1 | 4 | 3 | 2 | `arenas/fortaleza/automata/atlas.png` 2464x270 |
| prisionero | normal | fortaleza | CODEX_OK | real | 1 | 3 | 2 | 2 | `arenas/fortaleza/prisionero/atlas.png` 2000x272 |
| engendro | normal | fortaleza | CODEX_OK | real | 1 | 6 | 5 | 4 | `enemies/fortaleza/engendro/v2/atlas.png` 960x240 |
| verdugo | elite | fortaleza | CODEX_OK | real | 1 | 3 | 2 | 2 | `arenas/fortaleza/verdugo/atlas.png` 2016x328 |
| arana | subelite | fortaleza | CODEX_OK | real | 1 | 3 | 2 | 2 | `arenas/fortaleza/arana/atlas.png` 1424x230 |
| dragon_forja | subjefe | fortaleza | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/dragon_forja.png` 1792x384 |
| caballero | jefe | fortaleza | CODEX_OK | real | 1 | 6 | 5 | 2 | `arenas/fortaleza/caballero/atlas.png` 1824x690 |
| infectado | normal | micelial | CODEX_OK | real | 1 | 6 | 2 | 2 | `arenas/micelial/infectado/atlas.png` 2072x426 |
| acechador | subelite | micelial | CODEX_OK | real | 1 | 6 | 2 | 2 | `arenas/micelial/acechador/atlas.png` 1688x414 |
| hinchado | elite | micelial | CODEX_OK | real | 1 | 3 | 2 | 2 | `arenas/micelial/hinchado/atlas.png` 1792x288 |
| peregrino | subelite | micelial | CODEX_OK | real | 1 | 3 | 2 | 2 | `arenas/micelial/peregrino/atlas.png` 1712x266 |
| sabueso | normal | micelial | CODEX_OK | real | 1 | 4 | 2 | 2 | `arenas/micelial/sabueso/atlas.png` 2176x342 |
| chaman | elite | micelial | CODEX_OK | real | 1 | 3 | 2 | 2 | `arenas/micelial/chaman/atlas.png` 1328x410 |
| nucleo_micelial | subelite | micelial | FALTA_ANIMACION | real | 1 | 1 | 1 | 0 | `arenas/micelial/fx/nucleo_3.png` 40x64 |
| raiz_absorcion | subelite | micelial | FALTA_ANIMACION | real | 1 | 1 | 1 | 0 | `arenas/micelial/fx/root_curl.png` 64x96 |
| micelio | subjefe | micelial | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/micelio.png` 1792x384 |
| madre_espora | jefe | micelial | ARTE_VIEJO | - | 0 | 0 | 0 | 0 | - |
| ab_errante | normal | abismo | FALTA_ANIMACION | real | 1 | 2 | 6 | 4 | `arenas/abismo/ab_errante/atlas.png` 448x300 |
| ab_acechador | subelite | abismo | FALTA_ANIMACION | real | 1 | 2 | 1 | 4 | `arenas/abismo/ab_acechador/atlas.png` 480x345 |
| ab_heraldo | subelite | abismo | FALTA_ANIMACION | real | 1 | 2 | 2 | 4 | `arenas/abismo/ab_heraldo/atlas.png` 432x308 |
| ab_devorador | elite | abismo | FALTA_ANIMACION | real | 1 | 2 | 6 | 3 | `arenas/abismo/ab_devorador/atlas.png` 480x288 |
| ab_tejedor | subelite | abismo | FALTA_ANIMACION | real | 1 | 2 | 2 | 4 | `arenas/abismo/ab_tejedor/atlas.png` 400x330 |
| ab_jinete | elite | abismo | CODEX_OK | real | 1 | 4 | 3 | 5 | `bosses/bosque/jinete_sin_cabeza/v2/atlas.png` 656x148 |
| ab_carcelero | subjefe | abismo | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/ab_carcelero.png` 1792x384 |
| ab_morador | jefe | abismo | FALTA_ANIMACION | real | 1 | 1 | 1 | 1 | `assets/vfx/abismo/tex_carne.png` 56x205 |
| ab_tentaculo | subelite | abismo | FALTA_ANIMACION | real | 1 | 1 | 1 | 1 | `assets/vfx/abismo/tent_grande_0.png` 105x143 |
| cm_saqueador | normal | ciudad | CODEX_OK | real | 1 | 6 | 5 | 4 | `enemies/ciudad/cm_saqueador/v2/atlas.png` 640x240 |
| cm_perro | normal | ciudad | CODEX_OK | real | 1 | 4 | 4 | 3 | `enemies/ciudad/cm_perro/v2/atlas.png` 1640x230 |
| cm_raptor | subelite | ciudad | CODEX_OK | real | 1 | 6 | 5 | 4 | `enemies/ciudad/cm_raptor/v2/atlas.png` 768x380 |
| cm_verdugo | elite | ciudad | CODEX_OK | real | 1 | 6 | 4 | 6 | `arenas/ciudad/cm_verdugo/atlas.png` 1024x768 |
| cm_planidera | subelite | ciudad | CODEX_OK | real | 1 | 4 | 4 | 4 | `enemies/ciudad/cm_planidera/v2/atlas.png` 576x440 |
| cm_acechante | subelite | ciudad | CODEX_OK | real | 1 | 6 | 5 | 3 | `enemies/ciudad/cm_acechante/v2/atlas.png` 1520x399 |
| cm_campanero | elite | ciudad | CODEX_OK | real | 1 | 6 | 5 | 2 | `enemies/ciudad/cm_campanero/v2/atlas.png` 1368x374 |
| cm_sectario | normal | ciudad | CODEX_OK | real | 1 | 6 | 5 | 4 | `enemies/ciudad/cm_sectario/v2/atlas.png` 576x336 |
| cm_espectro | normal | ciudad | CODEX_OK | real | 1 | 4 | 4 | 4 | `enemies/ciudad/cm_espectro/v2/atlas.png` 672x304 |
| cm_maestro | subjefe | ciudad | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/cm_maestro.png` 1792x384 |
| cm_tramoyista | subjefe | ciudad | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/cm_tramoyista.png` 1792x384 |
| cm_dama | subjefe | ciudad | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/cm_dama.png` 1792x384 |
| cm_cometa | normal | ciudad | ARTE_VIEJO | shapes | 1 | 1 | 1 | 1 | - |
| cm_espejismo | normal | ciudad | CODEX_OK | real | 1 | 6 | 6 | 6 | `arenas/ciudad/cm_dama/atlas.png` 768x768 |
| cm_presentador | jefe | ciudad | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/cm_presentador.png` 1792x384 |
| mn_esclavo | normal | minas | CODEX_OK | real | 1 | 8 | 8 | 4 | `arenas/minas/mn_esclavo/atlas.png` 392x210 |
| mn_insecto | normal | minas | CODEX_OK | real | 1 | 8 | 4 | 8 | `arenas/minas/mn_insecto/atlas.png` 368x285 |
| mn_acechador | subelite | minas | CODEX_OK | real | 1 | 8 | 8 | 5 | `arenas/minas/mn_acechador/atlas.png` 432x300 |
| mn_minero | elite | minas | CODEX_OK | real | 1 | 6 | 6 | 2 | `arenas/minas/mn_minero/atlas.png` 672x340 |
| mn_escupidor | subelite | minas | CODEX_OK | real | 1 | 8 | 6 | 7 | `arenas/minas/mn_escupidor/atlas.png` 304x184 |
| mn_consumidor | elite | minas | CODEX_OK | real | 1 | 8 | 6 | 6 | `arenas/minas/mn_consumidor/atlas.png` 320x270 |
| mn_devoraluz | elite | minas | CODEX_OK | real | 1 | 6 | 5 | 3 | `enemies/minas/mn_devoraluz/v2/atlas.png` 1792x484 |
| mn_titan | subjefe | minas | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/mn_titan.png` 1792x384 |
| mn_cerbero | jefe | minas | FALTA_ANIMACION | real | 1 | 2 | 1 | 1 | `battlefield/mn_cerbero.png` 1792x384 |

## Arenas, props y demás archivos

Un registro por imagen (PNG; el `.webp` es su copia sin pérdida) en `ATLAS_ARTE.json` → `files`: dimensiones, si se carga, quién la usa y estado. Resumen:

| Carpeta | Imágenes | MB | ARTE_VIEJO | HUERFANO |
|---|--:|--:|--:|--:|
| arenas | 185 | 23.2 | 0 | 2 |
| battlefield | 32 | 4.0 | 0 | 0 |
| bosses | 94 | 5.5 | 0 | 0 |
| champions | 488 | 71.1 | 30 | 102 |
| enemies | 206 | 9.4 | 0 | 0 |

### Huérfanos (no los carga ni los referencia el juego; candidatos a limpieza, NO se borran acá)

- `assets/sprites/arenas/micelial/mother/mp_body.png` 190x300
- `assets/sprites/arenas/micelial/mother/mp_roots.png` 395x155
- `assets/sprites/champions/aelith/atlas.png` 448x1008
- `assets/sprites/champions/aelith/codex-v1/preview.png` 112x112
- `assets/sprites/champions/aelith/preview.png` 112x112
- `assets/sprites/champions/aurelia/preview.png` 112x112
- `assets/sprites/champions/aurelia/skins/aurelia_alt1/preview.png` 112x112
- `assets/sprites/champions/aurelia/skins/aurelia_alt2/preview.png` 112x112
- `assets/sprites/champions/axiom/codex-v1/preview.png` 112x112
- `assets/sprites/champions/baltra/croma-preview.png` 112x112
- `assets/sprites/champions/baltra/preview.png` 112x112
- `assets/sprites/champions/brakk/preview.png` 112x112
- `assets/sprites/champions/bront/preview.png` 112x112
- `assets/sprites/champions/bront/skins/bront_alt1/preview.png` 112x112
- `assets/sprites/champions/bront/skins/bront_alt2/preview.png` 112x112
- `assets/sprites/champions/cazadora/codex-v1/preview.png` 192x160
- `assets/sprites/champions/dariel/croma-preview.png` 112x112
- `assets/sprites/champions/dariel/preview.png` 112x112
- `assets/sprites/champions/facu_gm/preview.png` 112x112
- `assets/sprites/champions/facu_gm/skins/facu_gm_alt1/preview.png` 112x112
- `assets/sprites/champions/guerrero/codex-v1/preview.png` 144x144
- `assets/sprites/champions/ilkan/v2/fx/fx_crack_01.png` 51x34
- `assets/sprites/champions/ilkan/v2/fx/fx_crack_02.png` 53x36
- `assets/sprites/champions/ilkan/v2/fx/fx_crack_03.png` 53x35
- `assets/sprites/champions/ilkan/v2/fx/fx_foot_01.png` 218x121
- `assets/sprites/champions/ilkan/v2/fx/fx_foot_02.png` 289x119
- `assets/sprites/champions/ilkan/v2/fx/fx_foot_03.png` 287x120
- `assets/sprites/champions/ilkan/v2/fx/fx_lance_01.png` 64x24
- `assets/sprites/champions/ilkan/v2/fx/fx_pillar_01.png` 48x83
- `assets/sprites/champions/ilkan/v2/fx/fx_pillar_02.png` 43x82
- `assets/sprites/champions/ilkan/v2/fx/fx_sand_01.png` 43x66
- `assets/sprites/champions/ilkan/v2/fx/fx_sand_02.png` 37x49
- `assets/sprites/champions/ilkan/v2/fx/fx_sand_03.png` 43x57
- `assets/sprites/champions/ilkan/v2/fx/fx_sand_04.png` 41x52
- `assets/sprites/champions/ilkan/v2/fx/silhouettes_01.png` 324x122
- `assets/sprites/champions/ilsa/preview.png` 112x112
- `assets/sprites/champions/ilsa/skins/ilsa_alt1/preview.png` 112x112
- `assets/sprites/champions/ilsa/skins/ilsa_alt2/preview.png` 112x112
- `assets/sprites/champions/khepri/preview.png` 112x112
- `assets/sprites/champions/khepri/skins/khepri_alt1/preview.png` 112x112
- `assets/sprites/champions/khepri/skins/khepri_alt2/preview.png` 112x112
- `assets/sprites/champions/kora/preview.png` 112x112
- `assets/sprites/champions/kora/skins/kora_alt1/preview.png` 112x112
- `assets/sprites/champions/kora/skins/kora_alt2/preview.png` 112x112
- `assets/sprites/champions/libertador/v2/fx/blood_01.png` 64x57
- `assets/sprites/champions/libertador/v2/fx/blood_02.png` 62x60
- `assets/sprites/champions/libertador/v2/fx/buff_icon_01.png` 46x70
- `assets/sprites/champions/libertador/v2/fx/buff_icon_02.png` 55x71
- `assets/sprites/champions/libertador/v2/fx/buff_icon_03.png` 52x69
- `assets/sprites/champions/libertador/v2/fx/buff_icon_04.png` 52x72
- `assets/sprites/champions/libertador/v2/fx/dust_01.png` 66x64
- `assets/sprites/champions/libertador/v2/fx/dust_02.png` 58x62
- `assets/sprites/champions/libertador/v2/fx/dust_03.png` 64x37
- `assets/sprites/champions/libertador/v2/fx/frost_01.png` 84x77
- `assets/sprites/champions/libertador/v2/fx/frost_02.png` 83x80
- `assets/sprites/champions/libertador/v2/fx/shot_01.png` 151x36
- `assets/sprites/champions/libertador/v2/fx/smoke_04.png` 44x46
- `assets/sprites/champions/libertador/v2/fx/spectral_01.png` 105x79
- `assets/sprites/champions/libertador/v2/fx/spectral_02.png` 99x86
- `assets/sprites/champions/libertador/v2/fx/spectral_03.png` 87x83
- `assets/sprites/champions/libertador/v2/fx/spectral_04.png` 101x82
- `assets/sprites/champions/libertador/v2/fx/spectral_05.png` 106x86
- `assets/sprites/champions/mago/codex-v1/preview.png` 448x1008
- `assets/sprites/champions/maura/croma-preview.png` 112x112
- `assets/sprites/champions/maura/preview.png` 112x112
- `assets/sprites/champions/morveth/codex-v1/preview.png` 112x112
- `assets/sprites/champions/morveth/preview.png` 112x112
- `assets/sprites/champions/musashi/codex-v1/preview.png` 192x160
- `assets/sprites/champions/nahir/croma-preview.png` 112x112
- `assets/sprites/champions/nahir/preview.png` 112x112
- `assets/sprites/champions/nano_gm/preview.png` 112x112
- `assets/sprites/champions/nano_gm/skins/nano_gm_alt1/preview.png` 112x112
- `assets/sprites/champions/nigromante/codex-v1/preview.png` 192x160
- `assets/sprites/champions/oriel/preview.png` 112x112
- `assets/sprites/champions/oriel/skins/oriel_alt1/preview.png` 112x112
- `assets/sprites/champions/oriel/skins/oriel_alt2/preview.png` 112x112
- `assets/sprites/champions/orsa/croma-preview.png` 112x112
- `assets/sprites/champions/orsa/preview.png` 112x112
- `assets/sprites/champions/renko/croma-preview.png` 112x112
- `assets/sprites/champions/renko/preview.png` 112x112
- `assets/sprites/champions/saelis/preview.png` 112x112
- `assets/sprites/champions/saelis/skins/saelis_alt1/preview.png` 112x112
- `assets/sprites/champions/saelis/skins/saelis_alt2/preview.png` 112x112
- `assets/sprites/champions/sira/croma-preview.png` 112x112
- `assets/sprites/champions/sira/preview.png` 112x112
- `assets/sprites/champions/solciju/preview.png` 112x112
- `assets/sprites/champions/soporte/v3/atlas.png` 448x1008
- `assets/sprites/champions/tanque/codex-v1/preview.png` 112x112
- `assets/sprites/champions/tibor/croma-preview.png` 112x112
- `assets/sprites/champions/tibor/preview.png` 112x112
- `assets/sprites/champions/velmira/preview.png` 112x112
- `assets/sprites/champions/velmira/skins/velmira_alt1/preview.png` 112x112
- `assets/sprites/champions/velmira/skins/velmira_alt2/preview.png` 112x112
- `assets/sprites/champions/vesper/croma-preview.png` 112x112
- `assets/sprites/champions/vesper/preview.png` 112x112
- `assets/sprites/champions/veyra/preview.png` 112x112
- `assets/sprites/champions/vhal/preview.png` 112x112
- `assets/sprites/champions/vhal/skins/vhal_alt1/preview.png` 112x112
- `assets/sprites/champions/vhal/skins/vhal_alt2/preview.png` 112x112
- `assets/sprites/champions/vorn/preview.png` 112x112
- `assets/sprites/champions/vorn/skins/vorn_alt1/preview.png` 112x112
- `assets/sprites/champions/vorn/skins/vorn_alt2/preview.png` 112x112
- `assets/sprites/champions/zahra/croma-preview.png` 112x112
- `assets/sprites/champions/zahra/preview.png` 112x112

## Arte nuevo que falta (listado para producción)

- **tanque**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **guerrero**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **axiom**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **musashi**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **cazadora**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **nigromante**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **libertador**: arte de generación anterior al Códice (puntaje de auditoría 60); falta cuerpo Códice (`codex-v1`).
- **libertador**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **ynara**: arte de generación anterior al Códice (puntaje de auditoría 70); falta cuerpo Códice (`codex-v1`).
- **myla**: arte de generación anterior al Códice (puntaje de auditoría 58); falta cuerpo Códice (`codex-v1`).
- **vesper**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **nahir**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **baltra**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **maura**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **dariel**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **orsa**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **tibor**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **zahra**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **renko**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **sira**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **facu_gm**: arte de generación anterior al Códice (puntaje de auditoría 56); falta cuerpo Códice (`codex-v1`).
- **facu_gm**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **aurelia**: arte de generación anterior al Códice (puntaje de auditoría 66); falta cuerpo Códice (`codex-v1`).
- **khepri**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **velmira**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **vhal**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **bront**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **oriel**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **saelis**: arte de generación anterior al Códice (puntaje de auditoría 64); falta cuerpo Códice (`codex-v1`).
- **saelis**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **ilsa**: arte de generación anterior al Códice (puntaje de auditoría 76); falta cuerpo Códice (`codex-v1`).
- **vorn**: arte de generación anterior al Códice (puntaje de auditoría 76); falta cuerpo Códice (`codex-v1`).
- **kora**: arte de generación anterior al Códice (puntaje de auditoría 70); falta cuerpo Códice (`codex-v1`).
- **solciju**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **brakk**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **morveth**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **aelith**: sin ciclo propio en idle (1 cuadro); falta animación nueva.
- **libertador** / libertador_escarcha (croma): attack, cast, ultimate con 1 cuadro.
- **libertador** / libertador_ancestral (croma): attack, cast, ultimate con 1 cuadro.
- **ynara** / santa_paciencia (set): death con 1 cuadro.
- **myla** / merienda_magica (set): death con 1 cuadro.
