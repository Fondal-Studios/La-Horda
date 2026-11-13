# Checklist de TODO el arte: qué está hecho, qué falta y qué sigue

> Generado por `tools/art/art-checklist.py` desde las fuentes reales del repo (lista al final de la sección A). **No se edita a mano: se regenera** (`python3 tools/art/art-checklist.py`; `--check` lo corre `tools/art/test-runway-pack.py`). Regla: ANTES de generar o pintar algo, buscarlo acá y en el registro de su categoría; al terminar, actualizar el registro (`runway-ledger.py`, `champ-checklist.py`, `build-art-atlas.js`) y regenerar este archivo.

**Vocabulario de estados (fijo):** `hecho` (integrado y medido) · `parcial` (existe pero un ciclo sale con 1 cuadro o falta un estado) · `arte_viejo` (el juego dibuja arte anterior al Códice) · `falta` (no existe) · `hecho_sin_integrar` (generado/aceptado, ningún código lo carga) · `rechazado` (probado y descartado: no repetir igual) · `bloqueado` (espera algo externo o una decisión) · `codigo_en_curso` (el hueco es del código, no del arte; hay un cambio en marcha) · `sin_verificar` (no se pudo comprobar: se dice el motivo).

**Aviso sobre «estados que faltan».** La columna «Estados que faltan o están repetidos» de `runway-pack/CHECKLIST_CAMPEONES.md` mide **solo los `sets` del registro del atlas**, no lo que el motor dibuja. Varios «faltantes» (Nigromante, Ilkan, Libertador) NO son falta de arte sino despacho de dibujo en el código: **no pedir arte que el motor no dibujaría**; primero se confirma con captura del motor (`tools/art/capture-champion-states.js`). Detalle en la sección B.

## A) Resumen

| Categoría | Total | Estados | Fuente |
|---|---|---|---|
| Campeones (cuerpo base) | 46 | parcial 25 · hecho 12 · arte_viejo 9 | ATLAS_ARTE.json (medido en el motor) |
| Skins, cromas y formas de Ascensión | 104 | parcial 90 · hecho 9 · arte_viejo 5 | ATLAS_ARTE.json |
| Jefes y subjefes | 28 | hecho 14 · parcial 13 · arte_viejo 1 | ATLAS_ARTE.json |
| Enemigos (normales, subélites, élites) | 76 | hecho 63 · parcial 12 · arte_viejo 1 | ATLAS_ARTE.json + enemy-coverage.json |
| Mundo: pisos, centros, fachadas, props (trabajos Runway) | 29 | hecho 14 · falta 11 · rechazado 3 · hecho_sin_integrar 1 | estado-runway.json |
| Mundo: archivos de arenas cargados por el motor | 185 | hecho 183 · huerfano 2 | ATLAS_ARTE.json (files) |
| Mundo: cola de producción (bloques 03-mundo) | 227 | falta 227 | asset-blocks.json |
| Efectos y habilidades (bloques 02-combate) | 252 | falta 252 | asset-blocks.json (cola); lo integrado: sin_verificar |
| Interfaz, HUD e íconos (bloques 04-interfaz) | 76 | bloqueado 46 · falta 24 · hecho 6 | asset-blocks.json (cola); lo integrado: sin_verificar |
| Cosméticos (bloques 05-cosmeticos) | 48 | falta 37 · bloqueado 8 · hecho 3 | asset-blocks.json |
| Láminas del Códice de campeones | 46 | hecho 43 · falta 3 (ilsa, kora, vorn) | estado-runway.json + assets/ui/codex/champions |

**Campeones por clasificación de cuerpo (sección B):** estados propios completos 11 · completo salvo idle 1 cuadro 24 · arte_viejo 8 · depende de código (en curso) 3.

**Trabajo con Runway (todas las categorías):** 95 entradas · hecho 57 · falta 15 · rechazado 14 · hecho_sin_integrar 8 · bloqueado 1 · créditos registrados: 1415.

**Categorías o datos `sin_verificar` (y por qué):**

| Qué | Motivo |
|---|---|
| Interfaz / HUD / íconos: qué está realmente integrado | No hay un auditor del motor para UI como el de ATLAS_ARTE (campeones/enemigos). `asset-blocks.json` mide la cola, no lo integrado; `estado-runway.json` solo registra 2 retratos/HUD. Hay que auditarlo antes de afirmar cobertura. |
| Efectos (FX) y íconos de habilidades por campeón | `manifiestos/campeones_faltantes.json` los marca `BLOQUEADO_SIN_HOOK` (la auditoría del 18-oct no encontró dónde engancharlos); sin auditoría posterior del motor. |
| Idle de 1 cuadro (28 campeones) | ATLAS_ARTE lo mide como brecha, pero no se verificó si el motor ya anima el reposo por código (balanceo): no pedir hojas de idle sin esa comprobación. |
| Aprobación de arte humana de lo instalado | Ningún archivo registra una aprobación humana; STATUS.md la declara «pendiente» (Ynara lanzar/definitiva, Cazadora y Musashi definitiva). |
| Saldo de créditos de Runway actual | Solo hay la cifra escrita en STATUS.md (no se llamó a Runway); la cuenta es compartida y baja por consumo ajeno. Correr `node tools/art-world/runway-world.js status` (no gasta) antes de planificar. |

**Fuentes leídas:** `docs/art/ATLAS_ARTE.json` (huella `1965e2120f62`, 51 archivos), `runway-pack/estado-campeones.json`, `runway-pack/estado-runway.json` (auditado 2026-11-12), `docs/production/asset-blocks.json`, `docs/art-brief/enemy-coverage.json` (medido contra el atlas `42c3e6d9bc90` — **DESACTUALIZADO respecto de ATLAS_ARTE: regenerar con `python3 tools/art/art-checklist.py enemigos`**), `docs/beta-release/STATUS.md`, `ART_CREDITS.md`, `docs/steam/DECLARACION_IA.md`.

## B) Campeones (cuerpo base)

Detalle por campeón (láminas, atlas actual, auditoría vieja, skins y lo probado con Runway): **[`runway-pack/CHECKLIST_CAMPEONES.md`](runway-pack/CHECKLIST_CAMPEONES.md)**; medición del motor: [`docs/art/ATLAS_ARTE.md`](../art/ATLAS_ARTE.md). Antes de generar algo de un campeón se lee su fila y sus «intentos descartados».

- Con todos los estados propios (medidos y en registro): **11**. Completos salvo idle de 1 cuadro: **24**. Huecos de registro a verificar: **0**. Cuerpo pre-Códice: **8**. Dependen de código (en curso): **3**.
- Láminas del Códice que faltan: ilsa, kora, vorn (`estado-runway.json`: pendientes; sin lámina no hay referencia para el cuerpo).
- **Dependen de código, no de arte (`codigo_en_curso`):** otro agente implementa cambios de despacho retrocompatibles en `js/champions/{ilkan,libertador,nigromante}.js` y `js/rendering`. Hasta que aterricen, no se genera arte para ellos.

| Campeón | Estado | Qué pasa de verdad (verificado contra el motor) | Archivo a cambiar | Arte nuevo que habilita después |
|---|---|---|---|---|
| ilkan | codigo_en_curso | El ataque se dibuja SIEMPRE con `attack_side` espejado (`drawIlkan`); `attack_down`/`attack_up` no se leen nunca. La definitiva es `invoke` (cuadros 58-61, propios) y luego el Coloso. | js/champions/ilkan.js (existe) | 2 hojas de 4 poses: ataque de frente y ataque de espaldas (40 c). |
| libertador | codigo_en_curso | `ult_cast` se dibuja con `prog` fijo en 0 (un solo cuadro durante `castMs`) y el ataque usa el set `fire` de perfil en toda dirección; la muerte NO falta (`v2/death.png`). | js/champions/libertador.js (existe) | 1 hoja de 4 poses: definitiva (20 c). |
| nigromante | codigo_en_curso | Su definitiva YA tiene cuadros 32-35 propios, pero `nigromante.js` pone `nigroDemonForm` y el motor dibuja siempre la forma Demonio/Coloso encima (`drawNigromanteReal` no llega a ejecutarse). | js/champions/nigromante.js (existe) | Nada: el arte ya existe (cuadros 32-35); basta con que el despacho lo muestre. |

Costo de las hojas = 20 c por hoja de 4 poses (`gpt_image_2`). Fuente: `ART_CREDITS.md` «Libertador: revision…» y «Nigromante e Ilkan: revision…».

**Todos los campeones** (estado = ATLAS_ARTE; «medido» = cuadros distintos mínimos entre las 4 direcciones; «registro» = lo que dice el set del atlas, que **no** equivale a lo que el motor dibuja):

| Campeón | Estado | Clasificación | Medido en el motor | Registro (sets) |
|---|---|---|---|---|
| tanque | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | sin sets declarados (layout estándar; solo vale lo medido) |
| guerrero | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | sin sets declarados (layout estándar; solo vale lo medido) |
| mago | hecho | estados propios completos | idle 3 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| soporte | hecho | estados propios completos | idle 4 · walk 4 · atk 4 · cast 4 · ult 4 · hit 4 · death 4 | completo |
| segador | hecho | estados propios completos | idle 4 · walk 4 · atk 4 · cast 4 · ult 4 · hit 4 · death 4 | completo |
| axiom | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| profeta | hecho | estados propios completos | idle 4 · walk 4 · atk 4 · cast 4 · ult 4 · hit 4 · death 4 | completo |
| musashi | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 4 · death 6 | completo |
| cazadora | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 4 · death 6 | completo |
| nigromante | parcial | depende de código (en curso) | idle 1 · walk 4 · atk 3 · cast 4 · ult 4 · hit 4 · death 6 | faltan ultimate_down |
| libertador | arte_viejo | depende de código (en curso) | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | faltan attack_down,attack_up,ultimate_down,hit_down,death_down |
| ilkan | hecho | depende de código (en curso) | idle 4 · walk 3 · atk 3 · cast 3 · ult 3 · hit 2 · death 2 | faltan ultimate_down |
| ynara | arte_viejo | cuerpo pre-Códice | idle 3 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| myla | arte_viejo | cuerpo pre-Códice | idle 2 · walk 3 · atk 3 · cast 3 · ult 3 · hit 1 · death 4 | sin sets declarados (layout estándar; solo vale lo medido) |
| brasa | hecho | estados propios completos | idle 2 · walk 4 · atk 3 · cast 3 · ult 2 · hit 1 · death 3 | completo |
| eslabon | hecho | estados propios completos | idle 2 · walk 4 · atk 3 · cast 3 · ult 2 · hit 1 · death 3 | completo |
| morwen | hecho | estados propios completos | idle 2 · walk 4 · atk 3 · cast 3 · ult 2 · hit 1 · death 3 | completo |
| farolero | hecho | estados propios completos | idle 2 · walk 4 · atk 3 · cast 3 · ult 2 · hit 1 · death 3 | completo |
| iria | hecho | estados propios completos | idle 2 · walk 4 · atk 3 · cast 3 · ult 2 · hit 1 · death 3 | completo |
| vesper | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| nahir | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 3 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| baltra | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 3 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| maura | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| dariel | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| orsa | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| tibor | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| zahra | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| renko | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| sira | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| nano_gm | hecho | estados propios completos | idle 4 · walk 4 · atk 4 · cast 4 · ult 4 · hit 4 · death 4 | completo |
| facu_gm | arte_viejo | cuerpo pre-Códice | idle 1 · walk 3 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| aurelia | arte_viejo | cuerpo pre-Códice | idle 3 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| khepri | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 3 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| velmira | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| vhal | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| bront | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 3 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| oriel | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| saelis | arte_viejo | cuerpo pre-Códice | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| ilsa | arte_viejo | cuerpo pre-Códice | idle 3 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| vorn | arte_viejo | cuerpo pre-Códice | idle 3 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| kora | arte_viejo | cuerpo pre-Códice | idle 3 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| solciju | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| veyra | hecho | estados propios completos | idle 4 · walk 4 · atk 4 · cast 4 · ult 4 · hit 4 · death 4 | completo |
| brakk | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 3 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| morveth | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |
| aelith | parcial | completo salvo idle de 1 cuadro | idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4 | completo |

## C) Skins, cromas y formas de Ascensión

Fuente: `ATLAS_ARTE.json` → `champions.<id>.skins`. `croma` = **recolor** del cuerpo base (el atlas lo declara así: mismo dibujo, otra paleta); `set` = apariencia con **atlas propio**; `asc` = forma de Ascensión (atlas propio). Totales: croma 48 · set 34 · asc 22. Estados: parcial 90 · hecho 9 · arte_viejo 5.

| Tipo | Origen del arte | Cantidad | Estados | Cast de 1 cuadro | Definitiva de 1 cuadro | Ataque de 1 cuadro |
|---|---|---|---|---|---|---|
| set | atlas propio | 34 | parcial 23 · hecho 8 · arte_viejo 3 | 0 | 0 | 0 |
| asc | atlas propio (forma) | 22 | parcial 22 | 0 | 0 | 0 |
| croma | recolor | 48 | parcial 45 · arte_viejo 2 · hecho 1 | 2 | 2 | 2 |

Por campeón (solo se listan las apariencias; entre paréntesis el estado; `!` = algún ciclo de lanzar/definitiva/ataque con 1 cuadro; el detalle de cuadros está en `ATLAS_ARTE.md`):

| Campeón | Sets (arte propio) | Ascensión (forma) | Cromas (recolor) |
|---|---|---|---|
| tanque | baluarte (hecho) | — | tanque_ancestral (parcial), tanque_juicio (parcial) |
| guerrero | nocturno (parcial) | — | — |
| mago | convergencia (arte_viejo) | — | — |
| soporte | custodio (parcial) | — | — |
| segador | marea (parcial) | — | segador_escarcha (parcial) |
| axiom | sistema (parcial) | — | axiom_piedra (parcial) |
| profeta | profecia (parcial) | — | profeta_ancestral (parcial) |
| musashi | errante (parcial) | — | musashi_ancestral (parcial) |
| cazadora | manada (parcial) | — | cazadora_escarcha (parcial) |
| nigromante | requiem (hecho) | — | nigromante_escarcha (parcial), nigromante_piedra (parcial) |
| libertador | granadero (hecho) | — | libertador_escarcha (arte_viejo) !, libertador_ancestral (arte_viejo) ! |
| ilkan | legion (arte_viejo) | — | — |
| ynara | santa_paciencia (parcial) | — | ynara_celeste (parcial) |
| myla | merienda_magica (arte_viejo) | — | myla_arandanos (parcial) |
| brasa | ultimo_turno (hecho) | — | brasa_abisal (parcial) |
| eslabon | juramento_roto (hecho) | — | eslabon_porcelana (parcial) |
| morwen | vidrio_negro (hecho) | — | morwen_escarcha (parcial) |
| farolero | lumbre_persistente (hecho) | — | farolero_guardavia (parcial) |
| iria | hilo_umbral (hecho) | — | — |
| vesper | exp_vesper (parcial) | — | vesper_skin (parcial), vesper_croma (parcial) |
| nahir | exp_nahir (parcial) | — | nahir_skin (parcial), nahir_croma (parcial) |
| baltra | exp_baltra (parcial) | — | baltra_skin (parcial), baltra_croma (parcial) |
| maura | exp_maura (parcial) | — | maura_skin (parcial), maura_croma (parcial) |
| dariel | exp_dariel (parcial) | — | dariel_luthier (parcial), dariel_skin (parcial), dariel_croma (parcial) |
| orsa | exp_orsa (parcial) | — | orsa_skin (parcial), orsa_croma (parcial) |
| tibor | exp_tibor (parcial) | — | tibor_skin (parcial), tibor_croma (parcial) |
| zahra | exp_zahra (parcial) | — | zahra_skin (parcial), zahra_croma (parcial) |
| renko | exp_renko (parcial) | — | renko_skin (parcial), renko_croma (parcial) |
| sira | exp_sira (parcial) | — | sira_skin (parcial), sira_croma (parcial) |
| nano_gm | — | nano_gm_alt1 (parcial) | — |
| facu_gm | — | facu_gm_alt1 (parcial) | — |
| aurelia | — | aurelia_alt1 (parcial), aurelia_alt2 (parcial) | — |
| khepri | — | khepri_alt1 (parcial), khepri_alt2 (parcial) | — |
| velmira | — | velmira_alt1 (parcial), velmira_alt2 (parcial) | — |
| vhal | — | vhal_alt1 (parcial), vhal_alt2 (parcial) | — |
| bront | — | bront_alt1 (parcial), bront_alt2 (parcial) | — |
| oriel | — | oriel_alt1 (parcial), oriel_alt2 (parcial) | — |
| saelis | — | saelis_alt1 (parcial), saelis_alt2 (parcial) | — |
| ilsa | — | ilsa_alt1 (parcial), ilsa_alt2 (parcial) | — |
| vorn | — | vorn_alt1 (parcial), vorn_alt2 (parcial) | — |
| kora | — | kora_alt1 (parcial), kora_alt2 (parcial) | — |
| solciju | quality_solciju (parcial) | — | solciju_alt1 (parcial), solciju_croma (parcial) |
| veyra | quality_veyra (parcial) | — | veyra_alt1 (parcial), veyra_croma (hecho) |
| brakk | quality_brakk (parcial) | — | brakk_alt1 (parcial), brakk_croma (parcial) |
| morveth | quality_morveth (parcial) | — | morveth_alt1 (parcial), morveth_croma (parcial) |
| aelith | quality_aelith (parcial) | — | aelith_alt1 (parcial), aelith_croma (parcial) |

Auditoría vieja (`manifiestos/campeones_faltantes.json`, 2026-10-18; puede estar desactualizada): skins/formas skin falta 13 · skin recolor 11 · forma falta 6 · forma revisar 1 · skin placeholder 1. Se cita solo como historial; manda el atlas medido.

## D) Jefes y subjefes

Fuente: `ATLAS_ARTE.json` (`category: boss`) y `enemy-coverage.json`. Cuadros distintos: idle / caminar / ataque / muerte. «Ataque» y «muerte» en la última columna = arte real propio (R), clon de otro estado (C) o lo dibuja el código/la arena (P/X).

| Jefe | Rango | Arena | Estado | idle | walk | atk | death | ataque / muerte |
|---|---|---|---|---|---|---|---|---|
| ab_morador | jefe | abismo | parcial | 1 | 1 | 1 | 1 | C / C |
| angel_caido_hielo | jefe | hielo | hecho | 1 | 5 | 3 | 7 | R / R |
| angel_corrompido | jefe | infernal | hecho | 1 | 4 | 4 | 6 | R / R |
| caballero | jefe | fortaleza | hecho | 1 | 6 | 5 | 2 | R / R |
| cm_presentador | jefe | ciudad | parcial | 1 | 2 | 1 | 1 | R / C |
| demonio_mayor | jefe | infernal | hecho | 1 | 4 | 1 | 1 | R / C |
| golem_cuerpos | jefe | infernal | parcial | 1 | 2 | 1 | 1 | R / C |
| guardian_ancestral | jefe | bosque | hecho | 1 | 3 | 5 | 7 | R / R |
| jinete_sin_cabeza | jefe | bosque | hecho | 1 | 4 | 3 | 5 | R / R |
| leviatan | jefe | acuatica | parcial | 1 | 2 | 1 | 1 | R / C |
| madre_espora | jefe | micelial | arte_viejo | 0 | 0 | 0 | 0 | X / X |
| mago_hielo_cristal | jefe | hielo | hecho | 1 | 5 | 3 | 3 | R / R |
| minotauro | jefe | laberinto | parcial | 1 | 2 | 1 | 1 | R / C |
| mn_cerbero | jefe | minas | parcial | 1 | 2 | 1 | 1 | R / C |
| ab_carcelero | subjefe | abismo | parcial | 1 | 2 | 1 | 1 | R / C |
| cm_dama | subjefe | ciudad | parcial | 1 | 2 | 1 | 1 | R / C |
| cm_maestro | subjefe | ciudad | parcial | 1 | 2 | 1 | 1 | R / C |
| cm_tramoyista | subjefe | ciudad | parcial | 1 | 2 | 1 | 1 | R / C |
| doblador_arquera | subjefe | bosque | hecho | 1 | 4 | 4 | 4 | R / R |
| doblador_clerigo | subjefe | bosque | hecho | 1 | 4 | 4 | 4 | R / R |
| doblador_guerrero | subjefe | bosque | hecho | 1 | 4 | 4 | 4 | R / R |
| doblador_picaro | subjefe | bosque | hecho | 1 | 4 | 4 | 4 | R / R |
| dragon_forja | subjefe | fortaleza | parcial | 1 | 2 | 1 | 1 | R / C |
| guardian_laberinto | subjefe | laberinto | hecho | 1 | 4 | 5 | 5 | R / R |
| hechicero_supremo | subjefe | infernal | hecho | 1 | 3 | 4 | 6 | R / R |
| kraken_joven | subjefe | acuatica | hecho | 1 | 4 | 1 | 5 | C / R |
| micelio | subjefe | micelial | parcial | 1 | 2 | 1 | 1 | R / C |
| mn_titan | subjefe | minas | parcial | 1 | 2 | 1 | 1 | R / C |

Intentos con Runway en jefes (`estado-runway.json`): rechazado 4 · hecho 1. Rechazados (no repetir igual): `hoja_leviatan`, `hoja_bestia_bosque`, `hoja_dragon_forja`, `hoja_minotauro`.

Resumen: hecho 14 · parcial 13 · arte_viejo 1. Con 1 cuadro de ataque o muerte (brecha real): `ab_carcelero`, `ab_morador`, `cm_dama`, `cm_maestro`, `cm_presentador`, `cm_tramoyista`, `demonio_mayor`, `dragon_forja`, `golem_cuerpos`, `kraken_joven`, `leviatan`, `madre_espora`, `micelio`, `minotauro`, `mn_cerbero`, `mn_titan`.

## E) Enemigos (104 criaturas medidas en el motor: normales, subélites, élites, subjefes y jefes)

Medición del motor (`tools/art/enemy_coverage.js`: arma la entidad con el código del juego y mira qué dibuja en cada estado). Código por estado: **R** arte real propio · **E** espejo del cuadro de la otra dirección (normal para caminar a la izquierda) · **C** clon (reutiliza el cuadro de otro estado) · **G** sin giro · **P** lo dibuja el código · **X** lo dibuja la arena. Columnas: `caminar` = der/izq/abajo/arriba; `ataque` = perfil + frente + espalda; `golpe` = perfil + frente; `muerte`. Que el ataque de frente/espalda sea C (clon del de perfil) es lo normal del motor; lo grave es que el ataque de **perfil** o la muerte sean clon de «caminar».

| Criatura | Rango | Arena | Estado atlas | idle | caminar | ataque | golpe | muerte | Alertas |
|---|---|---|---|---|---|---|---|---|---|
| ab_errante | normal | abismo | parcial | C | RERR | RRR | RR | R | — |
| anguila_electrica | normal | acuatica | hecho | R | RECC | RCC | RC | R | — |
| cangrejo_acorazado | normal | acuatica | hecho | C | RECC | RCC | RC | R | — |
| medusa_electrica | normal | acuatica | hecho | R | RECC | RCC | RC | R | — |
| sirena_abisal | normal | acuatica | hecho | C | RECC | RCC | RC | R | — |
| tiburon_joven | normal | acuatica | hecho | C | RECC | RCC | RC | R | — |
| duende_bosque | normal | bosque | hecho | R | RECC | RCC | RC | R | — |
| enjambre_hadas | normal | bosque | hecho | C | RECC | CCC | CC | R | SIN ARTE PROPIO DE ATAQUE |
| cm_cometa | normal | ciudad | arte_viejo | C | PGCC | CCC | CC | C | SIN ARTE PROPIO DE ATAQUE; SIN ARTE PROPIO DE MUERTE |
| cm_espectro | normal | ciudad | hecho | R | RECC | RCC | RC | R | — |
| cm_espejismo | normal | ciudad | hecho | R | RECC | RCC | RC | R | — |
| cm_perro | normal | ciudad | hecho | C | RECC | RCC | RC | R | — |
| cm_saqueador | normal | ciudad | hecho | R | RECC | RCC | RC | R | — |
| cm_sectario | normal | ciudad | hecho | R | RECC | RCC | RC | R | — |
| carcelero | normal | fortaleza | hecho | R | RECC | RCC | RC | R | — |
| dragon_bronce | normal | fortaleza | hecho | C | RECC | RCC | RC | R | — |
| engendro | normal | fortaleza | hecho | R | RECC | RCC | RC | R | — |
| prisionero | normal | fortaleza | hecho | R | RECC | RCC | RC | R | — |
| cristal_servo | normal | hielo | hecho | R | RECC | RCC | RC | R | — |
| cristal_volador | normal | hielo | hecho | C | RECC | RCC | RC | R | — |
| golem_cristal | normal | hielo | hecho | R | RECC | RCC | RC | R | — |
| golem_hielo | normal | hielo | hecho | R | RECC | RCC | RC | R | — |
| hada_escarcha | normal | hielo | hecho | R | RECC | RCC | RC | R | — |
| lobo_artico | normal | hielo | hecho | C | RERR | RRR | CC | C | SIN ARTE PROPIO DE MUERTE |
| esqueleto | normal | infernal | hecho | C | RECC | RCC | RC | R | — |
| zombie | normal | infernal | hecho | C | RECC | RCC | RC | R | — |
| escorpion_gigante | normal | laberinto | hecho | C | RECC | RCC | RC | R | — |
| golem_piedra | normal | laberinto | hecho | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| infectado | normal | micelial | hecho | R | RECC | RCC | RC | R | — |
| sabueso | normal | micelial | hecho | R | RECC | CCC | CC | R | SIN ARTE PROPIO DE ATAQUE |
| mn_esclavo | normal | minas | hecho | R | RECC | RCC | RC | R | — |
| mn_insecto | normal | minas | hecho | R | RECC | RCC | RC | R | — |
| ab_acechador | subelite | abismo | parcial | C | RERR | CCC | RR | R | SIN ARTE PROPIO DE ATAQUE |
| ab_heraldo | subelite | abismo | parcial | C | RERR | RRR | RR | R | — |
| ab_tejedor | subelite | abismo | parcial | C | RERR | RRR | RR | R | — |
| ab_tentaculo | subelite | abismo | parcial | C | RECC | CCC | CC | C | SIN ARTE PROPIO DE ATAQUE; SIN ARTE PROPIO DE MUERTE |
| lev_tentaculo | subelite | acuatica | parcial | C | RGCC | CCC | CC | C | SIN ARTE PROPIO DE ATAQUE; SIN ARTE PROPIO DE MUERTE |
| bestia_bosque | subelite | bosque | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| cm_acechante | subelite | ciudad | hecho | R | RECC | RCC | RC | R | — |
| cm_planidera | subelite | ciudad | hecho | R | RECC | RCC | RC | R | — |
| cm_raptor | subelite | ciudad | hecho | R | RECC | RCC | RC | R | — |
| arana | subelite | fortaleza | hecho | R | RECC | RCC | RC | R | — |
| foco_hielo | subelite | hielo | parcial | C | RGCC | CCC | CC | C | SIN ARTE PROPIO DE ATAQUE; SIN ARTE PROPIO DE MUERTE |
| demonio_menor | subelite | infernal | hecho | C | RECC | RCC | RC | R | — |
| esqueleto_h | subelite | infernal | hecho | C | RECC | RCC | RC | R | — |
| foco_convergencia | subelite | infernal | parcial | C | RGCC | CCC | CC | C | SIN ARTE PROPIO DE ATAQUE; SIN ARTE PROPIO DE MUERTE |
| medusa | subelite | laberinto | hecho | C | RECC | RCC | RC | R | — |
| acechador | subelite | micelial | hecho | R | RECC | RCC | RC | R | — |
| nucleo_micelial | subelite | micelial | parcial | C | RGCC | CCC | CC | P | SIN ARTE PROPIO DE ATAQUE |
| peregrino | subelite | micelial | hecho | R | RECC | RCC | RC | R | — |
| raiz_absorcion | subelite | micelial | parcial | C | RGCC | CCC | CC | P | SIN ARTE PROPIO DE ATAQUE |
| mn_acechador | subelite | minas | hecho | R | RECC | RCC | RC | R | — |
| mn_escupidor | subelite | minas | hecho | R | RECC | RCC | RC | R | — |
| ab_devorador | elite | abismo | parcial | C | RERR | RRR | RR | R | — |
| ab_jinete | elite | abismo | hecho | C | RECC | RCC | CC | R | — |
| tiburon_blanco | elite | acuatica | hecho | R | RECC | RCC | RC | R | — |
| cu_sith | elite | bosque | hecho | C | RECC | RCC | RC | R | — |
| dama_bosque | elite | bosque | hecho | R | RECC | RCC | RC | R | — |
| ent | elite | bosque | hecho | R | RECC | RCC | RC | R | — |
| cm_campanero | elite | ciudad | hecho | C | RECC | RCC | RC | R | — |
| cm_verdugo | elite | ciudad | hecho | R | RECC | RCC | RC | R | — |
| automata | elite | fortaleza | hecho | R | RECC | RCC | RC | R | — |
| verdugo | elite | fortaleza | hecho | R | RECC | RCC | RC | R | — |
| angel_hielo | elite | hielo | hecho | C | RERR | RCC | RC | R | — |
| demonio_hielo_fuego | elite | hielo | hecho | C | RECC | RCC | RC | R | — |
| dragon_hielo | elite | hielo | hecho | C | RECC | RCC | CC | R | — |
| dragoncito_hielo | elite | hielo | hecho | C | RERR | RCC | RC | R | — |
| demonio_mago | elite | infernal | hecho | C | RECC | RCC | RC | R | — |
| golem | elite | infernal | hecho | C | RECC | RCC | CC | R | — |
| druida_arena | elite | laberinto | hecho | C | RECC | RCC | RC | R | — |
| esfinge | elite | laberinto | hecho | C | RECC | RCC | RC | R | — |
| chaman | elite | micelial | hecho | R | RECC | RCC | RC | R | — |
| hinchado | elite | micelial | hecho | C | RECC | CCC | RC | R | SIN ARTE PROPIO DE ATAQUE |
| mn_consumidor | elite | minas | hecho | R | RECC | RCC | RC | R | — |
| mn_devoraluz | elite | minas | hecho | C | RECC | RCC | RC | R | — |
| mn_minero | elite | minas | hecho | R | RECC | RCC | RC | R | — |
| ab_carcelero | subjefe | abismo | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| kraken_joven | subjefe | acuatica | hecho | C | RGCC | CCC | RC | R | SIN ARTE PROPIO DE ATAQUE |
| doblador_arquera | subjefe | bosque | hecho | R | RECC | RCC | CC | R | — |
| doblador_clerigo | subjefe | bosque | hecho | R | RECC | RCC | CC | R | — |
| doblador_guerrero | subjefe | bosque | hecho | R | RECC | RCC | CC | R | — |
| doblador_picaro | subjefe | bosque | hecho | R | RECC | RCC | CC | R | — |
| cm_dama | subjefe | ciudad | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| cm_maestro | subjefe | ciudad | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| cm_tramoyista | subjefe | ciudad | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| dragon_forja | subjefe | fortaleza | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| hechicero_supremo | subjefe | infernal | hecho | R | RERC | RCC | RC | R | — |
| guardian_laberinto | subjefe | laberinto | hecho | R | RECC | RCC | RC | R | — |
| micelio | subjefe | micelial | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| mn_titan | subjefe | minas | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| ab_morador | jefe | abismo | parcial | C | RGCC | CCC | CC | C | SIN ARTE PROPIO DE ATAQUE; SIN ARTE PROPIO DE MUERTE |
| leviatan | jefe | acuatica | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| guardian_ancestral | jefe | bosque | hecho | R | RERR | RCC | RC | R | — |
| jinete_sin_cabeza | jefe | bosque | hecho | C | RECC | RCC | CC | R | — |
| cm_presentador | jefe | ciudad | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| caballero | jefe | fortaleza | hecho | R | RECC | RCC | RC | R | — |
| angel_caido_hielo | jefe | hielo | hecho | R | RECC | RCC | RC | R | — |
| mago_hielo_cristal | jefe | hielo | hecho | R | RECC | RCC | RC | R | — |
| angel_corrompido | jefe | infernal | hecho | R | RECC | RCC | RC | R | — |
| demonio_mayor | jefe | infernal | hecho | C | RERR | RRR | CC | C | SIN ARTE PROPIO DE MUERTE |
| golem_cuerpos | jefe | infernal | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| minotauro | jefe | laberinto | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |
| madre_espora | jefe | micelial | arte_viejo | X | XXXX | XXX | XX | X | — |
| mn_cerbero | jefe | minas | parcial | C | RECC | RCC | CC | C | SIN ARTE PROPIO DE MUERTE |

**Resumen.** Ataque de perfil: R 90 · C 13 · X 1. Muerte: R 79 · C 22 · P 2 · X 1.

**Sin arte propio de ataque (clonan «caminar» o lo arma el código), 13:** `ab_acechador`, `ab_morador`, `ab_tentaculo`, `cm_cometa`, `enjambre_hadas`, `foco_convergencia`, `foco_hielo`, `hinchado`, `kraken_joven`, `lev_tentaculo`, `nucleo_micelial`, `raiz_absorcion`, `sabueso`.

**Sin arte propio de muerte (clonan «caminar» o lo arma el código), 22:** `ab_carcelero`, `ab_morador`, `ab_tentaculo`, `bestia_bosque`, `cm_cometa`, `cm_dama`, `cm_maestro`, `cm_presentador`, `cm_tramoyista`, `demonio_mayor`, `dragon_forja`, `foco_convergencia`, `foco_hielo`, `golem_cuerpos`, `golem_piedra`, `lev_tentaculo`, `leviatan`, `lobo_artico`, `micelio`, `minotauro`, `mn_cerbero`, `mn_titan`.

**Con ambos huecos (prioridad de hoja nueva), 6:** `ab_morador`, `ab_tentaculo`, `cm_cometa`, `foco_convergencia`, `foco_hielo`, `lev_tentaculo`.

Intentos con Runway en hojas de enemigos (`estado-runway.json`): hecho 29 · rechazado 3 · falta 1. Los rechazados (no repetir igual): `hoja_golem_piedra`, `hoja_chaman`, `regla_animacion_hojas_enemigos`.

## F) Mundo: pisos, centros, fachadas, props y arenas

Fuentes: `estado-runway.json` (lo hecho/probado, manda sobre `runway-world.js list`, que no es fiable), `ATLAS_ARTE.json` (archivos que carga el motor por arena) y `asset-blocks.json` (cola).

| Categoría Runway | Entradas | Estados |
|---|---|---|
| piso_arena | 10 | hecho 5 · falta 3 · rechazado 2 |
| centro_arena | 6 | hecho 4 · falta 2 |
| fachada | 7 | hecho 3 · falta 2 · hecho_sin_integrar 1 · rechazado 1 |
| prop_mundo | 6 | falta 4 · hecho 2 |
| lamina_campeon | 4 | falta 3 · hecho 1 |

| Id | Categoría | Estado | Créditos gastados | Siguiente paso / nota |
|---|---|---|---|---|
| casa_a | fachada | hecho_sin_integrar | 8 | Integrar como fachada con el pintor determinista (0 créditos): recorte croma, BOX a escala nativa, cargarla en cm-render.js con respaldo. |
| casa_b | fachada | rechazado | 8 | NO repetir con el mismo prompt. Si se necesita otra casa: pedir «front-on oblique view, no isometric» y usar casa_a como @ref. |
| tex_techo_pizarra | fachada | hecho | 8 |  |
| tex_techo_roja | fachada | hecho | 8 |  |
| tex_pared_madera_piedra | fachada | hecho | 8 |  |
| fort_planchas_hierro | piso_arena | hecho | 8 |  |
| fort_adoquin_patio | piso_arena | hecho | 8 |  |
| laberinto_piso | piso_arena | hecho | 8 |  |
| infernal_piso | piso_arena | hecho | 8 |  |
| acuatica_piso | piso_arena | hecho | 8 |  |
| abismo_piso | piso_arena | rechazado | 8 | NO repetir el prompt. Solo si el dueño lo pide: prompt sin marco, sin diagonales, losas uniformes. No hay faltante real: el Abismo ya tiene piso. |
| infernal_centro | centro_arena | hecho | 8 |  |
| acuatica_centro | centro_arena | hecho | 8 |  |
| laberinto_centro | centro_arena | hecho | 8 |  |
| fort_rejilla_lava | centro_arena | hecho | 8 |  |
| ciudad_estatua | prop_mundo | hecho | 8 | Defecto menor aceptado: dos brazos en alto (el Códice tiene uno). Un primer intento con «armoured knight» (task 5401a6bd-2025-4b29-83fa-e10b5e0c39df)  |
| ciudad_farol | prop_mundo | hecho | 8 |  |
| prox_integrar_casa_a | fachada | falta | — | Seguir el patrón de tools/art-world/build-ciudad-estatua.py. |
| prox_piso_bosque | piso_arena | falta | — | Copiar el prompt de laberinto_piso/infernal_piso (TEX) y añadir la clave a FLOOR_PAINTED en js/rendering/arena.js. Reserva 16 (reintento). |
| prox_centro_bosque | centro_arena | falta | — | Prompt DECAL de runway-world.js sobre croma verde; build-centro-arena.py; agregar clave a DECAL_PAINTED. |
| prox_piso_hielo | piso_arena | falta | — | Copiar el prompt de laberinto_piso/infernal_piso (TEX) y añadir la clave a FLOOR_PAINTED en js/rendering/arena.js. Reserva 16 (reintento). |
| prox_centro_hielo | centro_arena | falta | — | Prompt DECAL de runway-world.js sobre croma verde; build-centro-arena.py; agregar clave a DECAL_PAINTED. |
| prox_fachadas_ciudad_t06 | fachada | falta | — | Una imagen por edificio con @ref = casa_a; integrar como fachada. |
| prox_props_infernal | prop_mundo | falta | — | Un prop por imagen con @ref recorte del Códice de Infernal. |
| prox_props_hielo | prop_mundo | falta | — | Idem con la portada de Hielo. |
| prox_props_bosque | prop_mundo | falta | — | Idem con la portada de Bosque. |
| prox_props_laberinto | prop_mundo | falta | — | Idem con la portada de Laberinto. |
| prox_piso_divina | piso_arena | falta | — | Prompt TEX violeta con vetas doradas; clave en FLOOR_PAINTED. |
| prox_bosque_piso_turbo | piso_arena | rechazado | 2 | Probar con una referencia que sea solo textura (recorte de piedra sin paneles) o esperar el reinicio del tope de gen4_image (200/día) y repetir el tra |

**Archivos de arte por arena que carga el motor** (`assets/sprites/arenas/<arena>/…`; atlas de criaturas/props de la arena):

| Arena | Archivos | Estados |
|---|---|---|
| abismo | 7 | hecho 7 |
| ciudad | 18 | hecho 18 |
| divina | 16 | hecho 16 |
| fortaleza | 35 | hecho 35 |
| micelial | 98 | hecho 96 · huerfano 2 |
| minas | 9 | hecho 9 |
| world-v1 | 2 | hecho 2 |

Battlefield (campo de batalla): 32 archivos, hecho 32.

**Cola de producción del mundo** (`asset-blocks.json`, grupo `03-mundo`): 227 bloques (falta 227), 473 tareas pendientes. La cola cuenta kits y puede solaparse con las entradas de arriba ("Tasks are not individual PNGs"). Bloque activo: `B002`; siguientes: `B003`, `B004`, `B005`.

Lista de faltantes del mundo para producción: [`ASSETS_FALTANTES_MUNDO.md`](ASSETS_FALTANTES_MUNDO.md).

## G) Interfaz, HUD, íconos y FX

`sin_verificar` en cuanto a **qué está integrado en el juego**: no existe un auditor del motor para esta categoría (el equivalente de `build-art-atlas.js` cubre campeones, enemigos, jefes y arenas). Lo que sí consta en el repo:

| Fuente | Dato verificable |
|---|---|
| `asset-blocks.json` grupo `04-interfaz` | 76 bloques (bloqueado 46 · falta 24 · hecho 6), 238 tareas pendientes. `bloqueado` = BLOQUEADO_DECISION: espera una decisión, no arte. |
| `asset-blocks.json` grupo `02-combate` (efectos y habilidades) | 252 bloques (falta 252), 308 tareas pendientes. |
| `manifiestos/campeones_faltantes.json` (2026-10-18) | fx: 43 · íconos: 43, todos `BLOQUEADO_SIN_HOOK` (no había dónde engancharlos). Puede estar vieja. |
| Archivos de interfaz en `assets/ui/` | 12 íconos de habilidades (`assets/ui/skill-icons`), 86 láminas del Códice de campeones (`assets/ui/codex/champions`). Existencia de archivos; no prueba que el motor los use todos. |
| `estado-runway.json` (retratos/otros) | `hud_marcos_arcano` hecho; `referencias_codex_limpias` hecho_sin_integrar; `saldo_runway` bloqueado |

Para saber qué UI está pintada de verdad hace falta una auditoría del motor (capturas por pantalla); hasta entonces no afirmar cobertura. Detalle por bloque: `docs/art-brief/runway-pack/bloques/04-interfaz.md` y `02-combate.md`.

## H) Cómo se hace cada cosa

| Tipo | Cómo se hace (método medido) | Dónde leer |
|---|---|---|
| Campeón (poses de un estado) | Hoja de 4 poses con `gpt_image_2` (20 c por hoja, ~1 hoja por estado) sobre verde croma, con la lámina limpia del Códice como referencia (`runway-design.js … --model gpt_image_2`) → `tools/art/sheet-to-cells.py` (croma → celdas a la escala del campeón) → `tools/art/atlas-append-cells.py` → registro/meta del campeón → capturas del motor antes/después → comprobaciones derivadas del atlas (lista en STATUS.md: `imageSize` de Crystal Wars, `visual-package build/check`, `build-art-atlas.js` + `--check`, `roster_gate.js`, `webp_convert.py --check`, `check-<campeón>-*`). **`gen4_image` (8 c) NO sirve para poses** y el video `gen4_turbo` tampoco superó al atlas actual. | [RECETA.md](runway-pack/RECETA.md) §1/§4, [STATUS.md](../beta-release/STATUS.md), [CHECKLIST_CAMPEONES.md](runway-pack/CHECKLIST_CAMPEONES.md) |
| Antes de pedir arte a un campeón | Comprobar con captura del motor que el estado se dibuja de verdad (no es despacho de código). Ver sección B. | [ART_CREDITS.md](../beta-release/ART_CREDITS.md) |
| Mundo (pisos, centros, fachadas, props) | `tools/art-world/runway-world.js` (gen4_image, 8 c por imagen) → croma/BOX/alfa binario con el pintor determinista (p. ej. `build-centro-arena.py`) → cargar en el código de la arena con respaldo. Resultados: 5 de 6 pisos aceptados; el piso de Abismo se rechazó (marco y diagonal): no repetir igual. `runway-world.js list` NO es fiable: manda el registro. | [REGISTRO_RUNWAY.md](runway-pack/REGISTRO_RUNWAY.md), [RECETA.md](runway-pack/RECETA.md) |
| Enemigos y jefes | Hoja 1280x720 con `gen_sheet.py <arena> <id>` (~5 c) → `install.py` → `walk_batch.py` → `scan_sprites.py`; sin atlas propio, «Paso 0» con `runway-design.js`. El pintor procedural para enemigos viejos se DESCARTÓ (ver ART_CREDITS). Medir antes y después con `node tools/art/enemy_coverage.js` y no repetir los intentos rechazados del registro. | [ENEMIGOS_GUIA.md](runway-pack/ENEMIGOS_GUIA.md), [REGISTRO_RUNWAY.md](runway-pack/REGISTRO_RUNWAY.md), [PAINTER.md](../production/PAINTER.md) |
| Skins y cromas | Cromas = recolor determinista del cuerpo base (0 créditos). Sets con arte propio = mismo flujo que un campeón. Las skins son cosméticas: no alteran estadísticas (AGENTS.md, regla 6). | [RECETA.md](runway-pack/RECETA.md) §9, `docs/ART_BIBLE.md` |
| Láminas del Códice | Existentes: hechas con ChatGPT (según el dueño; declarar en Steam). Las que faltan: `runway-design.js <id> codex1` (gen4_image, 8 c, 1 intento + 1 de reserva). | [REGISTRO_RUNWAY.md](runway-pack/REGISTRO_RUNWAY.md) (`lamina_*`), [DECLARACION_IA.md](../steam/DECLARACION_IA.md) |
| Interfaz / HUD / íconos | Sin método medido ni auditor del motor (`sin_verificar`). Los bloques 04-interfaz llevan su descripción y prompt en el paquete. | `runway-pack/bloques/04-interfaz.md`, [asset-blocks.json](../production/asset-blocks.json) |
| Registrar y no repetir | Cada trabajo con Runway se anota el mismo día: `python3 tools/art/runway-ledger.py set\|add …`; campeones: `champ-checklist.py set\|descartado`; atlas: `node tools/art/build-art-atlas.js`; enemigos: `python3 tools/art/art-checklist.py enemigos`; luego regenerar este archivo. | [REGISTRO_RUNWAY.md](runway-pack/REGISTRO_RUNWAY.md) |
| Aprobación y declaración | Todo lo generado entra como candidato: la aprobación de arte es humana (`style_gate`/visual gate no la reemplazan). Lo generado con IA se declara en Steam. | [DECLARACION_IA.md](../steam/DECLARACION_IA.md), `docs/production/PRODUCTION_BIBLES.md` |

## I) Próximos pasos (ordenados por valor / costo)

**Criterio:** `puntaje = valor × 10 / (costo + 10)`; el valor (1-5) es el de `estado-runway.json` cuando la entrada lo tiene y, si no, criterio del auditor (marcado `a`). **Costo en créditos de Runway**: `gpt_image_2` = 20 c por hoja de 4 poses (~1 hoja por estado); `gen4_image` = 8 c por imagen (no sirve para poses); hoja de enemigo = ~5 c. Los costos «est.» son estimaciones, no medidas. Clases: **arte (Runway)** · **arte sin créditos (pintor determinista/recolor)** · **requiere cambio de código (en curso)** · **requiere decisión/aprobación humana**.

| # | Paso | Clase | Costo (c) | Valor | Puntaje | Fuente / nota |
|---|---|---|---|---|---|---|
| 1 | Revisión humana de lo instalado sin aprobar: Ynara (lanzar y definitiva), Cazadora (definitiva), Musashi (definitiva). | requiere decisión/aprobación humana | 0 | 5 a | 5.0 | bloquea declarar «aprobado» lo ya integrado |
| 2 | Confirmar que los términos de Runway para `gpt_image_2` permiten uso comercial y completar la declaración de IA de Steam. | requiere decisión/aprobación humana | 0 | 5 a | 5.0 | riesgo comercial/legal; sin esto no escalar su uso |
| 3 | Integrar la fachada `casa_a` (ya pagada y aceptada) con el pintor determinista: recorte croma, BOX a escala nativa, cargar en `cm-render.js` con respaldo. | arte sin créditos | 0 | 4 | 4.0 | ya pagada (8 c); entrada `prox_integrar_casa_a` |
| 4 | Integrar el lanzar del Tanque (candidato `gpt_image_2` aceptado, sin instalar): `sheet-to-cells.py` + `atlas-append-cells.py` + comprobaciones derivadas. | arte sin créditos | 0 | 3 a | 3.0 | ya pagada (20 c); entrada `tanque_lanzar_gpt2`; queda aprobación humana |
| 5 | Resolver los 46 bloques de interfaz en `BLOQUEADO_DECISION` (esperan decisión del dueño, no arte). | requiere decisión/aprobación humana | 0 | 3 a | 3.0 | asset-blocks.json grupo 04-interfaz |
| 6 | Nigromante: que el despacho muestre su definitiva propia (cuadros 32-35). **No se genera arte.** | requiere cambio de código (en curso) | 0 | 3 a | 3.0 | js/champions/nigromante.js; arte ya existe |
| 7 | Decidir qué hacer con 104 archivos huérfanos (el juego ni los carga ni los referencia): archivar o borrar. | requiere decisión/aprobación humana | 0 | 2 a | 2.0 | ATLAS_ARTE.json (HUERFANO) |
| 8 | Láminas del Códice que faltan (ilsa, kora, vorn): referencia previa para sus cuerpos Códice. | arte (Runway) | 24 | 5 | 1.5 | gen4_image, 1 intento cada una (+reserva); entradas `lamina_*` |
| 9 | Fachadas de Ciudad Maldita (bloque P0 B062): pedir vista oblicua explícita (casa_b salió isométrica y se rechazó). | arte (Runway) | 32 | 5 | 1.2 | `prox_fachadas_ciudad_t06` |
| 10 | Último piso procedural sin pintar (Divina). | arte (Runway) | 8 | 2 | 1.1 | `prox_piso_divina` |
| 11 | Libertador: 1 hoja de definitiva (`ult_cast` animada) cuando `prog` deje de ser fijo; el ataque de frente exige además despacho por dirección del set `fire`. | requiere cambio de código (en curso) | 20 | 3 a | 1.0 | js/champions/libertador.js; después arte (Runway) |
| 12 | Pisos y centros de Bosque y Hielo (JOBS ya definidos en `runway-world.js`); intento anterior BLOQUEADO por límite diario de tareas de la cuenta. | arte (Runway) | 32 | 4 | 1.0 | entradas `prox_piso_*`/`prox_centro_*` |
| 13 | Hojas de enemigos de Fortaleza (`gen_sheet.py`, 1 hoja por enemigo). | arte (Runway) | 24 | 3 | 0.9 | `prox_hojas_fortaleza` |
| 14 | Ilkan: 2 hojas de ataque (frente y espaldas) para cuando el despacho por dirección aterrice. | requiere cambio de código (en curso) | 40 | 3 a | 0.6 | js/champions/ilkan.js; después arte (Runway) |
| 15 | Jefes/subjefes con `FALTA_ANIMACION` (13: ab_carcelero, ab_morador, cm_dama, cm_maestro, cm_presentador, cm_tramoyista, dragon_forja, golem_cuerpos, leviatan, micelio, minotauro, mn_cerbero, mn_titan). | arte (Runway) | 65 | 3 a | 0.4 | est. 5 c por hoja (`--kind bosses`) |
| — | Props pintados de Infernal, Hielo, Bosque y Laberinto (mismo método que estatua/farol, 2 de 2 aceptados). | arte (Runway) | 120 | 4 | 0.3 | entradas `prox_props_*` |
| — | Skins de Ynara (2 apariencias) con lanzar y definitiva = ataque (STATUS.md): 1 hoja por estado y apariencia (2 estados). | arte (Runway) | 80 | 2 a | 0.2 | est.: 2 × 2 × 20 c; los cromas son recolor (0 c) si se recolorea el cuerpo base ya hecho |
| — | Enemigos sin arte propio de ataque o muerte (lista en la sección E): una hoja por criatura (29 con algún hueco). | arte (Runway) | 145 | 3 a | 0.2 | est. 5 c por hoja; medir con enemy_coverage.js antes y después |
| — | Cuerpo Códice completo para campeones con arte viejo, sin Libertador (8: aurelia, facu_gm, ilsa, kora, myla, saelis, vorn, ynara). | arte (Runway) | 1600 | 4 a | 0.0 | est.: ~10 estados × 20 c por campeón; necesita su lámina del Códice |
| — | Idle de 1 cuadro en 28 campeones (brecha medida). Verificar primero si el motor ya anima el reposo por código. | arte (Runway) | 560 | 1 a | 0.0 | est.; `sin_verificar` si hace falta |

**Costo de los 15 primeros por clase:** arte (Runway) 185 c · arte sin créditos 0 c · requiere cambio de código (en curso) 60 c · requiere decisión/aprobación humana 0 c. Los pasos 16 en adelante van marcados con «—». El saldo disponible no se verificó (ver A).

## J) Decisiones abiertas del dueño

| Decisión | Qué se necesita | Dónde consta |
|---|---|---|
| Libertador: definitiva animada y ataque de frente | Aprobar/priorizar el cambio de código en `js/champions/libertador.js` (`ult_cast` con `prog` fijo en 0; ataque por set `fire`). Hay un agente implementándolo (retrocompatible); después se piden 20 c de arte (1 hoja). | ART_CREDITS.md «Libertador: revision…», STATUS.md |
| Ilkan y Nigromante: despacho de dibujo | Aprobar los cambios en `ilkan.js` (ataque por dirección) y `nigromante.js` (mostrar la definitiva propia antes de la forma Demonio). Ilkan después pide 40 c (2 hojas); Nigromante 0. | ART_CREDITS.md «Nigromante e Ilkan: revision…» |
| Aprobación de arte humana de lo instalado | Revisar y aprobar (o rechazar) lo instalado: Ynara lanzar y definitiva, Cazadora y Musashi definitiva; y el candidato del Tanque antes de integrarlo. | STATUS.md |
| Términos comerciales de `gpt_image_2` | Confirmar que permiten uso comercial y completar la declaración de IA en Steamworks; las láminas del Códice existentes son de ChatGPT y también se declaran. | docs/steam/DECLARACION_IA.md |
| Seguir gastando con Runway o cambiar el enfoque | Decidir presupuesto y tope (cuenta compartida; límite diario de tareas ya bloqueó un lote); alternativas sin probar: otros modelos de imagen o pintor determinista. | STATUS.md, runway-pack/COSTOS.md |
| Bloques de interfaz en decisión | Resolver los 46 bloques `BLOQUEADO_DECISION` del grupo 04-interfaz (y los de 01-cuerpos/05-cosmeticos en ese estado). | asset-blocks.json |
| Huérfanos | Archivar o borrar los 104 archivos sin uso detectados por el atlas. | ATLAS_ARTE.json |

