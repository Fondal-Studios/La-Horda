# Prioridad de arte: CRÍTICOS, IMPORTANTES y SECUNDARIOS (checklist vivo)

> Generado por `tools/art/prioridad-assets.py` desde `docs/art-brief/prioridad-assets.json` (la fuente de verdad). **No se edita a mano este .md**: se marca con `python3 tools/art/prioridad-assets.py --set <id> <estado>` y se regenera. `--check` lo corre `tools/art/test-runway-pack.py`. Procedimiento de la tarea programada: [COMO_USAR_PRIORIDAD.md](COMO_USAR_PRIORIDAD.md). Complementa (no reemplaza) a [CHECKLIST_ARTE.md](CHECKLIST_ARTE.md) y a `docs/production/asset-blocks.json`.

**Regla:** antes de dibujar o generar algo, buscalo acá: si está `hecho`, `instalado_sin_aprobar` o `duplicado_de:` NO se vuelve a generar. Se trabaja de arriba abajo: críticos, después importantes, después secundarios.

## PRÓXIMA TAREA

Primer ítem crítico no terminado ni bloqueado (`python3 tools/art/prioridad-assets.py --next`):

```
campeon-poses-tanque_lanzar_gpt2  [campeon · prioridad critico · orden 1]
  Qué: Tanque (Aldric): integrar la hoja de 4 poses de LANZAR ya generada y aceptada con gpt_image_2 (sheet-to-cells.py + atlas-append-cells.py + comprobaciones derivadas).
  Estado: pendiente · método: pintor_determinista · costo estimado: 0 cr
  Registro Runway (estado-runway.json): tanque_lanzar_gpt2
  Docs: docs/beta-release/ART_CREDITS.md, docs/art-brief/runway-pack/REGISTRO_RUNWAY.md
  Evidencia: estado-runway.json tanque_lanzar_gpt2 = hecho_sin_integrar (20 cr ya gastados)
  Nota: Ya pagada (20 cr): NO regenerar. Falta integrarla (0 créditos) y la aprobación humana. Tanque es el guardián #1 recomendado al empezar.
```

Esta tarea no gasta créditos.

## Resumen

| Prioridad | Ítems | hecho | instalado sin aprobar | pendiente | en curso | bloqueado (decisión) | créditos estimados pendientes |
|---|---:|---:|---:|---:|---:|---:|---:|
| CRÍTICOS | 44 | 30 | 1 | 13 | 0 | 0 | 126 |
| IMPORTANTES | 127 | 45 | 5 | 70 | 2 | 5 | 1983 |
| SECUNDARIOS | 337 | 40 | 0 | 243 | 3 | 51 | 1717 |
| **Total** | **508** | 115 | 6 | 326 | 5 | 56 | 3826 |

**Duplicados (no regenerar): 198 ítems** (sección final). Créditos: solo los ítems con `gen4_image` o `gpt_image_2_codice_limpio` gastan Runway; el resto es 0 (pintor determinista / humano). Los costos son estimaciones del repo (hoja de 4 poses gpt_image_2 = 20, imagen gen4_image = 8, hoja de enemigo = 5), no medidas.

**Criterios** (detalle en el JSON, `_leyenda._criterios`):

- **CRÍTICOS**: Lo que el jugador nuevo ve en los primeros 10 minutos o en todas las partidas Y hoy está como placeholder visible, falta, está cortado o tiene el estilo equivocado: arena 01-02 (Ciudad, Fábrica) y su tutorial, guardián #1 recomendado, enemigos/jefes de esas arenas con estados propios faltantes.
- **IMPORTANTES**: Se ve en la mayor parte del juego y tiene sustituto aceptable (efectos procedurales, íconos ASCII legibles, arenas 03-07, resto de campeones y definitivas, jefes intermedios, tienda/colecciones, HUD transversal).
- **SECUNDARIOS**: Cosmético, profundidad o contenido tardío: skins, cromas, props decorativos, arenas 08-10 (Abismo, Minas, Infernal), cofres/íconos de objetos de rarezas altas, Libro/Códice, modos secundarios.

**Estados:** `hecho` · `instalado_sin_aprobar` · `pendiente` · `en_curso` · `bloqueado_decision` · `duplicado_de:<id>`. **Métodos:** `gpt_image_2_codice_limpio` · `gen4_image` · `pintor_determinista` · `humano`.

## CRÍTICOS

14 ítems abiertos y 30 hechos. Orden = orden de trabajo.

- [ ] **1. `campeon-poses-tanque_lanzar_gpt2`** · campeon · `pendiente` · `pintor_determinista` · 0 cr
  - Tanque (Aldric): integrar la hoja de 4 poses de LANZAR ya generada y aceptada con gpt_image_2 (sheet-to-cells.py + atlas-append-cells.py + comprobaciones derivadas).
  - Evidencia: estado-runway.json tanque_lanzar_gpt2 = hecho_sin_integrar (20 cr ya gastados)
  - Nota: Ya pagada (20 cr): NO regenerar. Falta integrarla (0 créditos) y la aprobación humana. Tanque es el guardián #1 recomendado al empezar.
  - Refs: runway tanque_lanzar_gpt2
- [ ] **2. `arena-ciudad-casa_a-integrar`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - Ciudad Maldita: integrar la fachada casa_a (ya generada y aceptada): recorte croma, caja a escala nativa y carga en cm-render.js con respaldo.
  - Evidencia: estado-runway.json casa_a = hecho_sin_integrar (8 cr gastados); ningún js/ la carga; arena 1 del recorrido
  - Nota: Ya pagada: NO regenerar. Seguir el patrón de tools/art-world/build-ciudad-estatua.py.
  - Refs: runway casa_a, prox_integrar_casa_a
- [ ] **3. `enemigo-cm_cometa`** · enemigo · `pendiente` · `gen4_image` · 13 cr
  - Gran Número (cm_cometa, normal, arena ciudad): falta arte propio de attack y death y sin atlas propio (dibujado por formas)
  - Evidencia: enemy-coverage.json: attack=formas+clon(caminar), death=formas+clon(caminar), hit=formas+clon(caminar); ATLAS_ARTE=ARTE_VIEJO; arena 1/10 (ciudad); altura 3.27× el campeón típico
- [ ] **4. `enemigo-cm_presentador`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - El Presentador (cm_presentador, jefe, arena ciudad): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 1/10 (ciudad); altura 3.33× el campeón típico
- [ ] **5. `enemigo-cm_dama`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - La Dama del Telón (cm_dama, subjefe, arena ciudad): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 1/10 (ciudad); altura 3.47× el campeón típico
- [ ] **6. `enemigo-cm_maestro`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - Maestro de Ceremonias (cm_maestro, subjefe, arena ciudad): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 1/10 (ciudad); altura 3.56× el campeón típico
- [ ] **7. `enemigo-cm_tramoyista`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - El Tramoyista (cm_tramoyista, subjefe, arena ciudad): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 1/10 (ciudad); altura 2.88× el campeón típico
- [ ] **8. `arena-ciudad-edificios-t06`** · arena · `pendiente` · `gen4_image` · 32 cr
  - CM-T06 Refugio / Capilla / Torre de Vigía / Campanario (edificios propios) / CM-T07 Puerta de Evacuación (reja arriba / abajo / rota) / CM-T09 Escenario de la catedral (tablas, telón, reflectores)
  - Evidencia: asset-blocks.json B062 P0 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Nota: La fila prox_fachadas_ciudad_t06 de estado-runway repite este bloque (ver su duplicado). casa_b se rechazó por isométrica: pedir vista oblicua, casa_a como @ref.
  - Refs: bloques B062
- [ ] **9. `arena-ciudad-civiles-c01-c02`** · arena · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - CM-C01 Aldeano / mujer / niño · caminata frente y espalda / CM-C02 Escondido (agachado, temblando)
  - Evidencia: asset-blocks.json B060 P0 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Refs: bloques B060
- [ ] **10. `efecto-ciudad-cometa-gran-numero`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - A-09 Cometa del Gran Número (vuelo 6, impacto 5; + versión "reflejado" dorada)
  - Evidencia: asset-blocks.json B368 P1 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Refs: bloques B368
- [ ] **11. `arena-ciudad-techos-t03-t04`** · arena · `pendiente` · `gen4_image` · 16 cr
  - CM-T01 Techos de tejas: tile + bordes + cumbrera + chimenea / CM-T02 Cara de pared exterior con ventanas y puerta abierta / CM-T03 Techo dañado / con agujeros / en llamas (3 estados) / CM-T04 Ruinas de edificio derrumbado
  - Evidencia: asset-blocks.json B061 P0 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Nota: T01/T02 YA existen (tex_techo_pizarra, tex_techo_roja, tex_pared_madera_piedra: ver arena-tex_*): solo faltan T03 (techo dañado/en llamas) y T04 (ruinas). No regenerar T01/T02.
  - Refs: bloques B061
- [ ] **12. `enemigo-dragon_forja`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - Dragón de la Forja (dragon_forja, subjefe, arena fortaleza): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 2/10 (fortaleza); altura 2.42× el campeón típico
  - Nota: Intento Runway rechazado (hoja_dragon_forja): NO repetir igual; leer REGISTRO_RUNWAY «NO REPETIR».
  - Refs: runway hoja_dragon_forja
- [ ] **13. `campeon-poses-cazadora_ult_poses_gpt2`** · campeon · `instalado_sin_aprobar` · `humano` · 0 cr
  - Cazadora (Sylva): definitiva (Cacería Salvaje) con 4 poses gpt_image_2, instalada en el motor sin aprobación humana.
  - Evidencia: estado-runway.json cazadora_ult_poses_gpt2 = hecho_integrado (40 cr ya gastados)
  - Nota: Revisión humana (el pintor no puede aprobarla).
  - Refs: runway cazadora_ult_poses_gpt2
- [ ] **14. `arena-ciudad-ovacion-final`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - CM-P02 Ovación final (canalización 3 s)
  - Evidencia: asset-blocks.json B063 P0 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Refs: bloques B063

<details><summary>Hechos (30): no repetir</summary>

- [x] `ui-titulo` — Pantalla de título (logo, escena de guardianes y jefe, botón JUGAR AHORA).
- [x] `ui-hud-combate` — HUD de partida (vida/energía, botones de habilidad con ícono, definitiva, minimapa, tarjetas de aliados).
- [x] `ui-arenas-seleccion` — Pantalla de selección de campaña con miniaturas de arena.
- [x] `ui-tanque-lanzar-igual-definitiva` — Tanque: las filas de LANZAR y DEFINITIVA del motor muestran los mismos 4 cuadros (pose de escudo); el candidato gpt_image_2 de lanzar ya existe. — NOTA: Solo evidencia: el trabajo es campeon-poses-tanque_lanzar_gpt2.
- [x] `enemigo-cm_espectro` — Espectro Ciudadano (cm_espectro, normal, arena ciudad)
- [x] `enemigo-cm_espejismo` — Espejismo de la Dama (cm_espejismo, normal, arena ciudad)
- [x] `enemigo-cm_perro` — Perro del Albañal (cm_perro, normal, arena ciudad)
- [x] `enemigo-cm_saqueador` — Saqueador Maldito (cm_saqueador, normal, arena ciudad)
- [x] `enemigo-cm_sectario` — Sectario Fanático (cm_sectario, normal, arena ciudad)
- [x] `enemigo-cm_acechante` — Acechante de los Tejados (cm_acechante, subelite, arena ciudad) — NOTA: Ya se pagaron 20 cr en hojas de esta criatura: no regenerar sin causa registrada.
- [x] `enemigo-cm_planidera` — Plañidera (cm_planidera, subelite, arena ciudad)
- [x] `enemigo-cm_raptor` — Raptor (cm_raptor, subelite, arena ciudad)
- [x] `enemigo-cm_campanero` — Campanero (cm_campanero, elite, arena ciudad)
- [x] `enemigo-cm_verdugo` — Verdugo (cm_verdugo, elite, arena ciudad)
- [x] `arena-ciudad_estatua` — Estatua encapuchada sobre pedestal octogonal en estanque turquesa del centro de Ciudad (81x106, x2).
- [x] `arena-ciudad_farol` — Farol de hierro forjado con linterna naranja (22x46, x2) de Ciudad.
- [x] `arena-tex_pared_madera_piedra` — Pared de entramado de madera y piedra → tex_pared_ext.png. Ciudad Maldita.
- [x] `arena-tex_techo_pizarra` — Textura de techo de pizarra azulada (tile 96 px) → tex_techo.png. Ciudad Maldita.
- [x] `arena-tex_techo_roja` — Textura de teja roja → tex_techo_roja.png. Ciudad Maldita.
- [x] `enemigo-carcelero` — Carcelero Deforme (carcelero, normal, arena fortaleza)
- [x] `enemigo-dragon_bronce` — Dragón de Bronce (dragon_bronce, normal, arena fortaleza)
- [x] `enemigo-engendro` — Engendro Encadenado (engendro, normal, arena fortaleza)
- [x] `enemigo-prisionero` — Prisionero Ensamblado (prisionero, normal, arena fortaleza)
- [x] `enemigo-arana` — Araña Mecánica (arana, subelite, arena fortaleza)
- [x] `enemigo-automata` — Autómata de Hierro (automata, elite, arena fortaleza)
- [x] `enemigo-verdugo` — Verdugo de Vapor (verdugo, elite, arena fortaleza)
- [x] `enemigo-caballero` — Caballero de la Armadura Oxidada (caballero, jefe, arena fortaleza)
- [x] `arena-fort_adoquin_patio` — Piso de adoquines del patio/puente/hub de la Fortaleza (96 px).
- [x] `arena-fort_planchas_hierro` — Piso de planchas de hierro remachadas de la Fábrica Sin Fin (128 px).
- [x] `arena-fort_rejilla_lava` — Rejilla de barras de hierro sobre lava (72x72 nativos) para el patio y el centro de la forja.

</details>

## IMPORTANTES

82 ítems abiertos y 45 hechos. Orden = orden de trabajo.

- [ ] **1. `campeon-tanque`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón tanque (Aldric, el Último Bastión): idle y hit de 1 cuadro; bloques abiertos B002 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4; guardián recomendado al empezar (starter-select.js)
  - Refs: bloques B002 · runway tanque_f24_diseno, tanque_lote_cuadros, tanque_video_caminatas, tanque_video_combate, tanque_lanzar_gpt2
- [ ] **2. `campeon-mago`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Campeón mago (Thalen, el Tejedor Elemental): hit de 1 cuadro; bloques abiertos B100 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: hecho; medido en el motor: idle 3 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4; guardián recomendado al empezar (starter-select.js)
  - Refs: bloques B100
- [ ] **3. `campeon-cazadora`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Campeón cazadora (Sylva, la Cazadora del Bosque): idle de 1 cuadro; bloques abiertos B098 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 4 · death 6; guardián recomendado al empezar (starter-select.js)
  - Refs: bloques B098 · runway cazadora_ult_poses_gpt2
- [ ] **4. `b057-icono-de-objeto-corona-del`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Corona del Invierno Sin Fin" (Mítico, Casco (casco)) / Ícono de objeto "Corazón del Averno" (Mítico, Pechera (pechera)) / Ícono de objeto "Martillo de la Tormenta Primigenia" (Mítico, Arma (arma)) / Ícono de objeto "Égida d
  - Evidencia: asset-blocks.json B057 P0 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B057
- [ ] **5. `b058-icono-de-objeto-guadana-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Guadaña de la Cosecha Roja" (Mítico, Arma (arma)) / Ícono de objeto "Báculo del Alba Eterna" (Mítico, Arma (arma)) / Ícono de objeto "Grimorio del Vacío Hambriento" (Mítico, Guantes (guantes)) / Ícono de objeto "Hoja del Ec
  - Evidencia: asset-blocks.json B058 P0 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B058
- [ ] **6. `b059-icono-de-objeto-corona-del`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Corona del Archimago Eclipsado" (Único, Casco (casco)) / Ícono de objeto "Yelmo del Coloso Errante" (Único, Casco (casco)) / Ícono de objeto "Arco de la Luna Roja" (Único, Arma (arma))
  - Evidencia: asset-blocks.json B059 P0 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B059
- [ ] **7. `b064-manchas-de-suelo-por-mater`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - GO-01 Manchas de suelo por material (sangre, icor, hueso, escarcha, ceniza, esporas)
  - Evidencia: asset-blocks.json B064 P0 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B064
- [ ] **8. `b067-cofre-del-final-de-arena-7`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - CH-01 Cofre del final de arena (7 rarezas: cerrado, temblando, abriéndose, abierto) / RO-01 9 insignias de rol (rombo) + anillo de suelo
  - Evidencia: asset-blocks.json B067 P0 PENDIENTE; transversal (todas las partidas)
  - Nota: Incluye RO-01 (insignias de rol): B068 lo repite.
  - Refs: bloques B067
- [ ] **9. `b311-trozos-desmembrados-por-ma`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - GO-02 Trozos desmembrados por material (6 × 4 piezas) / GO-03 Overlays de muerte: congelado (estatua), carbonizado, electrocutado / BR-01 7 objetos × (intacto, a punto de estallar, restos)
  - Evidencia: asset-blocks.json B311 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B311
- [ ] **10. `b322-carta-meteorito-cristales`** · ui · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Carta Meteorito (Cristales/Coliseo) / Carta Escarcha (Cristales/Coliseo)
  - Evidencia: asset-blocks.json B322 P1 BLOQUEADO_DECISION; transversal (todas las partidas)
  - Refs: bloques B322
- [ ] **11. `b327-ilustracion-de-ficha-del-j`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - CX-ILU Ilustración de ficha del jefe "Leviatán" / CX-ILU Ilustración de ficha del jefe "Minotauro" / CX-ILU Ilustración de ficha del jefe "El Que Mora Debajo" / CX-ILU Ilustración de ficha del jefe "Hechicero Supremo (velado)"
  - Evidencia: asset-blocks.json B327 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B327
- [ ] **12. `b328-ilustracion-de-ficha-del-j`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - CX-ILU Ilustración de ficha del jefe "Ángel Corrompido → Gólem → Rey de la Horda (tríptico)"
  - Evidencia: asset-blocks.json B328 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B328
- [ ] **13. `b329-ilustracion-del-libro-de-l`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - Ilustración del Libro de la Horda "tapa" / Ilustración del Libro de la Horda "guardianes" / Ilustración del Libro de la Horda "horda" / Ilustración del Libro de la Horda "hechicero"
  - Evidencia: asset-blocks.json B329 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B329
- [ ] **14. `b552-iconos-overlays-mojado-des`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - ST-01 Íconos/overlays: mojado, descarga, marca, marchitar, aturdido / UI-01 Botón de curación de emergencia (lista / urgente / gastada) / UI-02 Flecha de oleada en el borde
  - Evidencia: asset-blocks.json B552 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B552
- [ ] **15. `fx-tanque`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de tanque (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B042…B470 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B042, B214, B215, B216, B470
- [ ] **16. `iconos-tanque`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit tanque (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B269 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B269
- [ ] **17. `campeon-guerrero`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón guerrero (Kael, la Daga Carmesí): idle y hit de 1 cuadro; bloques abiertos B003 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4; en la lista de prioridad de estado-campeones.json (_prioridad_5)
  - Refs: bloques B003
- [ ] **18. `fx-mago`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de mago (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B024…B445 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B024, B160, B161, B162, B445
- [ ] **19. `iconos-mago`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit mago (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B052 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B052
- [ ] **20. `fx-soporte`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de soporte (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B041…B469 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B041, B211, B212, B213, B469
- [ ] **21. `iconos-soporte`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit soporte (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B268 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B268
- [ ] **22. `fx-cazadora`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de cazadora (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B014…B435 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B014, B126, B127, B128, B435
- [ ] **23. `iconos-cazadora`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit cazadora (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B050 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B050
- [ ] **24. `campeon-libertador`** · campeon · `en_curso` · `gpt_image_2_codice_limpio` · 20 cr
  - Campeón libertador (San Martín, el Libertador): cuerpo pre-Códice (estilo anterior al Códice); idle y hit de 1 cuadro; despacho de dibujo en js/champions/libertador.js (el arte no es el hueco); bloques abiertos B004 (auditoría 18-oct: puede
  - Evidencia: ATLAS_ARTE: arte_viejo; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4; en la lista de prioridad de estado-campeones.json (_prioridad_5)
  - Nota: No pedir arte que el motor no dibujaría: es despacho de código (CHECKLIST_ARTE §B).
  - Refs: bloques B004 · runway libertador_hoja_ref, libertador_poses_caminata_caida_caballo, libertador_ult_poses_gpt2
- [ ] **25. `campeon-ynara`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 200 cr
  - Campeón ynara (Ynara, la Médica de los Refugios): cuerpo pre-Códice (estilo anterior al Códice); hit de 1 cuadro; bloques abiertos B006 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: arte_viejo; medido en el motor: idle 3 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4; en la lista de prioridad de estado-campeones.json (_prioridad_5)
  - Refs: bloques B006 · runway ynara_ult_poses_gpt2, ynara_cast_poses_gpt2
- [ ] **26. `campeon-myla`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 200 cr
  - Campeón myla (Myla, la Niña de la Cuchara): cuerpo pre-Códice (estilo anterior al Códice); hit de 1 cuadro; bloques abiertos B005 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: arte_viejo; medido en el motor: idle 2 · walk 3 · atk 3 · cast 3 · ult 3 · hit 1 · death 4; en la lista de prioridad de estado-campeones.json (_prioridad_5)
  - Refs: bloques B005 · runway myla_caida
- [ ] **27. `campeon-poses-ilkan_ataque_espalda_gpt2`** · campeon · `instalado_sin_aprobar` · `humano` · 0 cr
  - Ilkan: ATAQUE DE ESPALDAS con 4 poses gpt_image_2, instalado sin aprobación humana.
  - Evidencia: estado-runway.json ilkan_ataque_espalda_gpt2 = hecho_integrado (20 cr ya gastados)
  - Nota: Revisión humana de arte (AGENTS.md: ningún gate la reemplaza).
  - Refs: runway ilkan_ataque_espalda_gpt2
- [ ] **28. `campeon-poses-ilkan_ataque_frente_gpt2`** · campeon · `instalado_sin_aprobar` · `humano` · 0 cr
  - Ilkan: ATAQUE DE FRENTE con 4 poses gpt_image_2, instalado sin aprobación humana.
  - Evidencia: estado-runway.json ilkan_ataque_frente_gpt2 = hecho_integrado (20 cr ya gastados)
  - Nota: Revisión humana de arte (AGENTS.md: ningún gate la reemplaza).
  - Refs: runway ilkan_ataque_frente_gpt2
- [ ] **29. `campeon-poses-musashi_ult_poses_gpt2`** · campeon · `instalado_sin_aprobar` · `humano` · 0 cr
  - Musashi: DEFINITIVA (Último Duelo) con 4 poses gpt_image_2, instalado sin aprobación humana.
  - Evidencia: estado-runway.json musashi_ult_poses_gpt2 = hecho_integrado (20 cr ya gastados)
  - Nota: Revisión humana de arte (AGENTS.md: ningún gate la reemplaza).
  - Refs: runway musashi_ult_poses_gpt2
- [ ] **30. `campeon-poses-ynara_cast_poses_gpt2`** · campeon · `instalado_sin_aprobar` · `humano` · 0 cr
  - Ynara: LANZAR con 4 poses gpt_image_2, instalado sin aprobación humana.
  - Evidencia: estado-runway.json ynara_cast_poses_gpt2 = hecho_integrado (20 cr ya gastados)
  - Nota: Revisión humana de arte (AGENTS.md: ningún gate la reemplaza).
  - Refs: runway ynara_cast_poses_gpt2
- [ ] **31. `campeon-poses-ynara_ult_poses_gpt2`** · campeon · `instalado_sin_aprobar` · `humano` · 0 cr
  - Ynara: DEFINITIVA con 4 poses gpt_image_2, instalado sin aprobación humana.
  - Evidencia: estado-runway.json ynara_ult_poses_gpt2 = hecho_integrado (20 cr ya gastados)
  - Nota: Revisión humana de arte (AGENTS.md: ningún gate la reemplaza).
  - Refs: runway ynara_ult_poses_gpt2
- [ ] **32. `campeon-poses-libertador_ult_poses_gpt2`** · campeon · `en_curso` · `pintor_determinista` · 0 cr
  - Libertador: hoja de 4 poses de la DEFINITIVA (ult_cast) generada y aceptada, no instalada.
  - Evidencia: estado-runway.json libertador_ult_poses_gpt2 = hecho_sin_integrar (20 cr ya gastados)
  - Nota: No se instala hasta que js/champions/libertador.js deje de fijar prog=0 (agente de código en curso). No regenerar.
  - Refs: runway libertador_ult_poses_gpt2
- [ ] **33. `ui-starter-retratos`** · ui · `pendiente` · `humano` · 0 cr
  - Selección del primer guardián: tarjetas con el sprite sobre cuadrado plano y la mitad superior de la pantalla vacía; existen láminas del Códice (assets/ui/codex/champions) que podrían usarse.
  - Evidencia: captura docs/art-brief/prioridad-capturas/03_starter.webp (primera pantalla tras JUGAR AHORA); es de layout/código más que de arte
  - Nota: Decisión de producto: usar la lámina del Códice como retrato (cambio de código, 0 cr).
- [ ] **34. `ui-hub-fondo`** · ui · `pendiente` · `humano` · 0 cr
  - Hub: fondo de degradé liso y módulos con íconos pequeños; sin ilustración de ambiente.
  - Evidencia: captura docs/art-brief/prioridad-capturas/02_hub.webp; funcional y limpio, pero es la pantalla más vista y la menos ilustrada
- [ ] **35. `arena-micelial-fondo-suavizado`** · arena · `pendiente` · `humano` · 0 cr
  - Reino Fúngico (arena 4): el fondo se ve suavizado/borroso frente al resto de arenas en píxel nativo.
  - Evidencia: captura docs/art-brief/prioridad-capturas/montaje_arenas_2.webp (arriba izquierda); densidad NO medida: medir con tools/art/arena_lineup.js antes de rehacer
- [ ] **36. `arena-fortaleza-lectura-enemigos`** · arena · `pendiente` · `humano` · 0 cr
  - Fábrica Sin Fin (arena 2): enemigos oscuros sobre suelo oscuro, lectura de combate floja.
  - Evidencia: captura docs/art-brief/prioridad-capturas/run_fortaleza.webp; impresión de una sola captura de 9 s: no medido (contraste)
- [ ] **37. `b307-cargado-por-el-raptor-pose`** · arena · `pendiente` · `gen4_image` · 16 cr
  - CM-C03 Cargado por el Raptor (pose colgando) / CM-C04 Pánico (brazos arriba, corriendo)
  - Evidencia: asset-blocks.json B307 P1 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Refs: bloques B307
- [ ] **38. `b308-muebles-de-interior-mesa-c`** · arena · `pendiente` · `gen4_image` · 24 cr
  - CM-T05 Muebles de interior (mesa, cama, alacena, chimenea, alfombra) / CM-T08 Estatua maldita con fuente (vista superior) / CM-T10 Rejilla de cloaca, campana en el piso, farol, barricada
  - Evidencia: asset-blocks.json B308 P1 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Refs: bloques B308
- [ ] **39. `b309-retrato-para-dialogos`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - CM-P03 Retrato para diálogos
  - Evidencia: asset-blocks.json B309 P1 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Refs: bloques B309
- [ ] **40. `b310-indicador-de-secuestro-fle`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - CM-V01 Indicador de secuestro (flecha / grillete sobre el Raptor) / CM-V02 Destello de rescate (escudo verde que sube) / CM-V03 Cono de reflector (Marca del espectáculo) / CM-V04 Telón a pantalla completa (apagón y final)
  - Evidencia: asset-blocks.json B310 P1 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Refs: bloques B310
- [ ] **41. `b323-iconos-rescatado-perdido-e`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - CM-U01 Íconos: rescatado, perdido, en peligro, te siguen / CM-U02 Íconos de estructura por estado (refugio, capilla, puerta, torre)
  - Evidencia: asset-blocks.json B323 P1 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Refs: bloques B323
- [ ] **42. `fx-guerrero`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de guerrero (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B019…B440 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B019, B141, B142, B143, B440
- [ ] **43. `fx-libertador`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de libertador (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B023…B444 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B023, B157, B158, B159, B444
- [ ] **44. `fx-ynara`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de ynara (6 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B048…B479 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B048, B232, B233, B234, B478, B479
- [ ] **45. `fx-myla`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de myla (6 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B029…B451 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B029, B175, B176, B177, B450, B451
- [ ] **46. `campeon-facu_gm`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 200 cr
  - Campeón facu_gm (Facu GM, el Soberano de las Mareas): cuerpo pre-Códice (estilo anterior al Códice); idle y hit de 1 cuadro; bloques abiertos B413 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: arte_viejo; medido en el motor: idle 1 · walk 3 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B413
- [ ] **47. `campeon-aurelia`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 200 cr
  - Campeón aurelia (Aurelia, la Arquitecta Solar): cuerpo pre-Códice (estilo anterior al Códice); hit de 1 cuadro; bloques abiertos B406 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: arte_viejo; medido en el motor: idle 3 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B406
- [ ] **48. `campeon-saelis`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 200 cr
  - Campeón saelis (Saelis, la Heraldo del Plumaje): cuerpo pre-Códice (estilo anterior al Códice); idle y hit de 1 cuadro; bloques abiertos B421 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: arte_viejo; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B421 · runway saelis_caida
- [ ] **49. `campeon-ilsa`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 200 cr · depende de `lamina-ilsa`
  - Campeón ilsa (Ilsa, la Esgrimista de Réplica): cuerpo pre-Códice (estilo anterior al Códice); hit de 1 cuadro
  - Evidencia: ATLAS_ARTE: arte_viejo; medido en el motor: idle 3 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
- [ ] **50. `campeon-vorn`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 200 cr · depende de `lamina-vorn`
  - Campeón vorn (Vorn, el Cambiapiel): cuerpo pre-Códice (estilo anterior al Códice); hit de 1 cuadro
  - Evidencia: ATLAS_ARTE: arte_viejo; medido en el motor: idle 3 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
- [ ] **51. `campeon-kora`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 200 cr · depende de `lamina-kora`
  - Campeón kora (Kora, la Ariete): cuerpo pre-Códice (estilo anterior al Códice); hit de 1 cuadro
  - Evidencia: ATLAS_ARTE: arte_viejo; medido en el motor: idle 3 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
- [ ] **52. `lamina-ilsa`** · campeon · `pendiente` · `gen4_image` · 8 cr
  - Lámina del Códice de ilsa (falta; sin ella no hay referencia para su cuerpo Códice).
  - Evidencia: estado-runway.json lamina_ilsa = pendiente; assets/ui/codex/champions/ilsa.png no existe
  - Refs: runway lamina_ilsa
- [ ] **53. `lamina-vorn`** · campeon · `pendiente` · `gen4_image` · 8 cr
  - Lámina del Códice de vorn (falta; sin ella no hay referencia para su cuerpo Códice).
  - Evidencia: estado-runway.json lamina_vorn = pendiente; assets/ui/codex/champions/vorn.png no existe
  - Refs: runway lamina_vorn
- [ ] **54. `lamina-kora`** · campeon · `pendiente` · `gen4_image` · 8 cr
  - Lámina del Códice de kora (falta; sin ella no hay referencia para su cuerpo Códice).
  - Evidencia: estado-runway.json lamina_kora = pendiente; assets/ui/codex/champions/kora.png no existe
  - Refs: runway lamina_kora
- [ ] **55. `proy-b277-arrow`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Proyectil "arrow" (cazadora) / Proyectil "dagger" (guerrero, musashi, ilkan) / Proyectil "orb" (mago) / Proyectil "wisp" (soporte)
  - Evidencia: asset-blocks.json B277 P1
  - Refs: bloques B277
- [ ] **56. `proy-b279-bullet`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Proyectil "bullet" (libertador) / Proyectil "slug" (tanque) / Proyectil "vial" (Ynara, la Médica) / Proyectil "spoon" (Myla)
  - Evidencia: asset-blocks.json B279 P1
  - Refs: bloques B279
- [ ] **57. `enemigo-bestia_bosque`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Bestia del Bosque (bestia_bosque, subelite, arena bosque): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 3/10 (bosque); altura 3.05× el campeón típico
  - Nota: Intento Runway rechazado (hoja_bestia_bosque): NO repetir igual; leer REGISTRO_RUNWAY «NO REPETIR».
  - Refs: bloques B351 · runway hoja_bestia_bosque
- [ ] **58. `enemigo-enjambre_hadas`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Enjambre de Hadas (enjambre_hadas, normal, arena bosque): falta arte propio de attack
  - Evidencia: enemy-coverage.json: attack=real+clon(caminar), death=real, hit=real+clon(caminar); ATLAS_ARTE=CODEX_OK; arena 3/10 (bosque); altura 2.81× el campeón típico
  - Refs: bloques B347
- [ ] **59. `b317-prop-de-decorado-ancienttr`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Prop de decorado "ancientTree+v" (bosque, canvas 100×130) / Prop de decorado "celticStatue" (bosque, canvas 30×64) / Prop de decorado "ruinArch" (bosque, canvas 96×80) / Prop de decorado "moss+v" (bosque, canvas 100×54)
  - Evidencia: asset-blocks.json B317 P1 PENDIENTE; arena bosque (3/10 del recorrido)
  - Refs: bloques B317
- [ ] **60. `b318-prop-de-decorado-roots-v-b`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Prop de decorado "roots+v" (bosque, canvas 160×80) / Prop de decorado "obelisk" (laberinto, canvas 26×90) / Prop de decorado "sandDrift+v" (laberinto, canvas 120×50) / Prop de decorado "brokenTiles+v" (laberinto, canvas 80×50)
  - Evidencia: asset-blocks.json B318 P1 PENDIENTE; arena bosque (3/10 del recorrido)
  - Refs: bloques B318
- [ ] **61. `b372-runa-del-menhir-y-maleza-d`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - A-14 Runa del menhir y maleza de emboscada
  - Evidencia: asset-blocks.json B372 P1 PENDIENTE; arena bosque (3/10 del recorrido)
  - Refs: bloques B372
- [ ] **62. `enemigo-hinchado`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Hinchado (hinchado, elite, arena micelial): falta arte propio de attack
  - Evidencia: enemy-coverage.json: attack=real+clon(caminar), death=real, hit=real; ATLAS_ARTE=CODEX_OK; arena 4/10 (micelial); altura 2.59× el campeón típico
  - Refs: bloques B339
- [ ] **63. `enemigo-madre_espora`** · jefe · `pendiente` · `gen4_image` · 13 cr
  - La Madre Espora (madre_espora, jefe, arena micelial): falta arte propio de attack y death y sin atlas propio (dibujado por formas)
  - Evidencia: enemy-coverage.json: attack=escenario(arena), death=escenario(arena), hit=escenario(arena); ATLAS_ARTE=ARTE_VIEJO; arena 4/10 (micelial); altura 0.00× el campeón típico
- [ ] **64. `enemigo-micelio`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - Micelio Primigenio (micelio, subjefe, arena micelial): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 4/10 (micelial); altura 2.55× el campeón típico
- [ ] **65. `enemigo-nucleo_micelial`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Núcleo Micelial (nucleo_micelial, subelite, arena micelial): falta arte propio de attack y death
  - Evidencia: enemy-coverage.json: attack=real+clon(caminar), death=propio(arena), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 4/10 (micelial); altura 1.93× el campeón típico
- [ ] **66. `enemigo-raiz_absorcion`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Raíz de Absorción (raiz_absorcion, subelite, arena micelial): falta arte propio de attack y death
  - Evidencia: enemy-coverage.json: attack=real+clon(caminar), death=propio(arena), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 4/10 (micelial); altura 3.18× el campeón típico
  - Refs: bloques B287 · también madre_espora, ab_tentaculo, cm_cometa
- [ ] **67. `enemigo-sabueso`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Sabueso Cordyceps (sabueso, normal, arena micelial): falta arte propio de attack
  - Evidencia: enemy-coverage.json: attack=real+clon(caminar), death=real, hit=real+clon(quieto); ATLAS_ARTE=CODEX_OK; arena 4/10 (micelial); altura 1.33× el campeón típico
  - Refs: bloques B590 · runway hoja_sabueso
- [ ] **68. `b367-red-micelial-raiz-tendon-t`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - A-08 Red micelial: raíz-tendón (tileable) y Corazón abierto
  - Evidencia: asset-blocks.json B367 P1 PENDIENTE; arena micelial (4/10 del recorrido)
  - Refs: bloques B367
- [ ] **69. `enemigo-foco_hielo`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Foco de Hielo (foco_hielo, subelite, arena hielo): falta arte propio de attack y death
  - Evidencia: enemy-coverage.json: attack=real+clon(caminar), death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 5/10 (hielo); altura 7.04× el campeón típico
- [ ] **70. `enemigo-lobo_artico`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Lobo Ártico (lobo_artico, normal, arena hielo): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=CODEX_OK; arena 5/10 (hielo); altura 2.11× el campeón típico
  - Refs: bloques B586
- [ ] **71. `b316-prop-de-decorado-icestatue`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Prop de decorado "iceStatue" (hielo, canvas 32×66) / Prop de decorado "snowDrift+v" (hielo, canvas 110×50) / Prop de decorado "iceCrack+v" (hielo, canvas 120×70) / Prop de decorado "menhir+v" (bosque, canvas 24×60)
  - Evidencia: asset-blocks.json B316 P1 PENDIENTE; arena hielo (5/10 del recorrido)
  - Refs: bloques B316
- [ ] **72. `b366-foco-de-hielo-idle-6-quieb`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - A-07 Foco de Hielo (idle 6 + quiebre 8)
  - Evidencia: asset-blocks.json B366 P1 PENDIENTE; arena hielo (5/10 del recorrido)
  - Refs: bloques B366
- [ ] **73. `b369-brasero-de-hielo-encendido`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - A-11 Brasero de hielo (encendido 6 loop, apagado 1, prendiéndose 4, congelado 3)
  - Evidencia: asset-blocks.json B369 P1 PENDIENTE; arena hielo (5/10 del recorrido)
  - Refs: bloques B369
- [ ] **74. `enemigo-kraken_joven`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - Kraken Joven (kraken_joven, subjefe, arena acuatica): falta arte propio de attack
  - Evidencia: enemy-coverage.json: attack=real+clon(caminar), death=real, hit=real; ATLAS_ARTE=CODEX_OK; arena 6/10 (acuatica); altura 2.20× el campeón típico
  - Refs: bloques B357
- [ ] **75. `enemigo-lev_tentaculo`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Tentáculo del Leviatán (lev_tentaculo, subelite, arena acuatica): falta arte propio de attack y death
  - Evidencia: enemy-coverage.json: attack=real+clon(caminar), death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 6/10 (acuatica); altura 4.10× el campeón típico
- [ ] **76. `enemigo-leviatan`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - Leviatán (leviatan, jefe, arena acuatica): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 6/10 (acuatica); altura 2.49× el campeón típico
  - Nota: Intento Runway rechazado (hoja_leviatan): NO repetir igual; leer REGISTRO_RUNWAY «NO REPETIR».
  - Refs: runway hoja_leviatan, leviatan_imagenes_15
- [ ] **77. `b365-tentaculos-del-leviatan-po`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - A-06 Tentáculos del Leviatán por función (GOLPE/AGARRE/CORRIENTE)
  - Evidencia: asset-blocks.json B365 P1 PENDIENTE; arena acuatica (6/10 del recorrido)
  - Refs: bloques B365
- [ ] **78. `b371-corriente-remolino-chorro`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - A-13 Corriente, remolino, chorro y charco conductor
  - Evidencia: asset-blocks.json B371 P1 PENDIENTE; arena acuatica (6/10 del recorrido)
  - Refs: bloques B371
- [ ] **79. `enemigo-golem_piedra`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Gólem de Piedra (golem_piedra, normal, arena laberinto): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=CODEX_OK; arena 7/10 (laberinto); altura 2.47× el campeón típico
  - Nota: Intento Runway rechazado (hoja_golem_piedra): NO repetir igual; leer REGISTRO_RUNWAY «NO REPETIR».
  - Refs: bloques B349 · runway hoja_golem_piedra
- [ ] **80. `enemigo-minotauro`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - Minotauro (minotauro, jefe, arena laberinto): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 7/10 (laberinto); altura 2.45× el campeón típico
  - Nota: Intento Runway rechazado (hoja_minotauro): NO repetir igual; leer REGISTRO_RUNWAY «NO REPETIR».
  - Refs: runway hoja_minotauro
- [ ] **81. `b088-pared-agrietada-del-laberi`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - A-02 Pared agrietada del Laberinto (intacta, agrietada ×3, derrumbe ×8, escombro)
  - Evidencia: asset-blocks.json B088 P0 PENDIENTE; arena laberinto (7/10 del recorrido)
  - Refs: bloques B088
- [ ] **82. `b370-sellos-de-piedra-i`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - A-12 Sellos de piedra I / II / III (apagado 1, encendido 4 loop, error 3)
  - Evidencia: asset-blocks.json B370 P1 PENDIENTE; arena laberinto (7/10 del recorrido)
  - Refs: bloques B370

<details><summary>Hechos (45): no repetir</summary>

- [x] `campeon-soporte` — Campeón soporte (Elyra, la Guardiana del Alba): todos los estados propios (sin faltantes medidos)
- [x] `b324-icono-ui-16-16-idolo-emoji` — Ícono UI 16×16 "idolo" (emoji 🗿) / Ícono UI 16×16 "figura" (emoji 🧍) / Ícono UI 16×16 "antena" (emoji 📡) / Ícono UI 16×16 "cuerno" (emoji 📯)
- [x] `b325-icono-ui-16-16-caballo-emo` — Ícono UI 16×16 "caballo" (emoji 🐎) / Ícono UI 16×16 "huellas" (emoji 👣) / Ícono UI 16×16 "silencio" (emoji 🔇) / Ícono UI 16×16 "ticket" (emoji 🎟)
- [x] `b326-icono-ui-16-16-agujero-emo` — Ícono UI 16×16 "agujero" (emoji 🕳)
- [x] `ui-tienda` — Tienda (destacados, skins, ofertas del día).
- [x] `enemigo-duende_bosque` — Duende del Bosque (duende_bosque, normal, arena bosque)
- [x] `enemigo-cu_sith` — Cù-Sìth (cu_sith, elite, arena bosque)
- [x] `enemigo-dama_bosque` — Dama del Bosque (dama_bosque, elite, arena bosque)
- [x] `enemigo-ent` — Ent (ent, elite, arena bosque)
- [x] `enemigo-doblador_arquera` — Doppelgänger — Arquera (doblador_arquera, subjefe, arena bosque)
- [x] `enemigo-doblador_clerigo` — Doppelgänger — Clérigo (doblador_clerigo, subjefe, arena bosque)
- [x] `enemigo-doblador_guerrero` — Doppelgänger — Guerrero (doblador_guerrero, subjefe, arena bosque)
- [x] `enemigo-doblador_picaro` — Doppelgänger — Pícaro (doblador_picaro, subjefe, arena bosque)
- [x] `enemigo-guardian_ancestral` — Guardián Ancestral Corrompido (guardian_ancestral, jefe, arena bosque)
- [x] `enemigo-jinete_sin_cabeza` — Jinete Sin Cabeza (jinete_sin_cabeza, jefe, arena bosque)
- [x] `enemigo-infectado` — Infectado Micelial (infectado, normal, arena micelial)
- [x] `enemigo-acechador` — Acechador de Esporas (acechador, subelite, arena micelial)
- [x] `enemigo-peregrino` — Peregrino Enraizado (peregrino, subelite, arena micelial)
- [x] `enemigo-chaman` — Chamán de la Colonia (chaman, elite, arena micelial) — NOTA: Intento Runway rechazado (hoja_chaman): NO repetir igual; leer REGISTRO_RUNWAY «NO REPETIR».
- [x] `enemigo-cristal_servo` — Servo de Cristal (cristal_servo, normal, arena hielo)
- [x] `enemigo-cristal_volador` — Cristal Volador (cristal_volador, normal, arena hielo)
- [x] `enemigo-golem_cristal` — Gólem de Cristal (golem_cristal, normal, arena hielo)
- [x] `enemigo-golem_hielo` — Gólem de Hielo (golem_hielo, normal, arena hielo) — NOTA: Ya se pagaron 10 cr en hojas de esta criatura: no regenerar sin causa registrada.
- [x] `enemigo-hada_escarcha` — Hada de Escarcha (hada_escarcha, normal, arena hielo)
- [x] `enemigo-angel_hielo` — Ángel de Hielo y Cristal (angel_hielo, elite, arena hielo)
- [x] `enemigo-demonio_hielo_fuego` — Demonio de Hielo y Fuego (demonio_hielo_fuego, elite, arena hielo)
- [x] `enemigo-dragon_hielo` — Tundraverx, Soberano de Hielo (dragon_hielo, elite, arena hielo)
- [x] `enemigo-dragoncito_hielo` — Dragoncito de Hielo (dragoncito_hielo, elite, arena hielo)
- [x] `enemigo-angel_caido_hielo` — Ángel Caído de Hielo (angel_caido_hielo, jefe, arena hielo)
- [x] `enemigo-mago_hielo_cristal` — El Mago Gélido (mago_hielo_cristal, jefe, arena hielo)
- [x] `enemigo-anguila_electrica` — Anguila Eléctrica (anguila_electrica, normal, arena acuatica)
- [x] `enemigo-cangrejo_acorazado` — Cangrejo Araña (cangrejo_acorazado, normal, arena acuatica) — NOTA: Ya se pagaron 10 cr en hojas de esta criatura: no regenerar sin causa registrada.
- [x] `enemigo-medusa_electrica` — Medusa Eléctrica (medusa_electrica, normal, arena acuatica) — NOTA: Ya se pagaron 10 cr en hojas de esta criatura: no regenerar sin causa registrada.
- [x] `enemigo-sirena_abisal` — Sirena Abisal (sirena_abisal, normal, arena acuatica) — NOTA: Ya se pagaron 10 cr en hojas de esta criatura: no regenerar sin causa registrada.
- [x] `enemigo-tiburon_joven` — Tiburón Joven (tiburon_joven, normal, arena acuatica) — NOTA: Ya se pagaron 20 cr en hojas de esta criatura: no regenerar sin causa registrada.
- [x] `enemigo-tiburon_blanco` — Tiburón Blanco (tiburon_blanco, elite, arena acuatica) — NOTA: Ya se pagaron 10 cr en hojas de esta criatura: no regenerar sin causa registrada.
- [x] `arena-acuatica_centro` — Mosaico circular del templo hundido de Acuática (306x207).
- [x] `arena-acuatica_piso` — Lecho marino de arena verdeazulada de Acuática.
- [x] `enemigo-escorpion_gigante` — Escorpión Gigante (escorpion_gigante, normal, arena laberinto) — NOTA: Ya se pagaron 10 cr en hojas de esta criatura: no regenerar sin causa registrada.
- [x] `enemigo-medusa` — Medusa (medusa, subelite, arena laberinto) — NOTA: Ya se pagaron 15 cr en hojas de esta criatura: no regenerar sin causa registrada.
- [x] `enemigo-druida_arena` — Druida de Arena (druida_arena, elite, arena laberinto)
- [x] `enemigo-esfinge` — Esfinge (esfinge, elite, arena laberinto) — NOTA: Ya se pagaron 20 cr en hojas de esta criatura: no regenerar sin causa registrada.
- [x] `enemigo-guardian_laberinto` — Guardián del Laberinto (guardian_laberinto, subjefe, arena laberinto)
- [x] `arena-laberinto_centro` — Medallón solar con sello de minotauro de Laberinto (357x246).
- [x] `arena-laberinto_piso` — Piso de losas doradas con jeroglíficos de Laberinto (se recortó el centro del maestro por viñeta).

</details>

## SECUNDARIOS

297 ítems abiertos y 40 hechos. Orden = orden de trabajo.

- [ ] **1. `b086-angel-corrompido-forma-1-d`** · jefe · `pendiente` · `gen4_image` · 8 cr
  - A-03 Ángel Corrompido (forma 1 del jefe final)
  - Evidencia: asset-blocks.json B086 P0 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B086
- [ ] **2. `b087-hechicero-supremo-angelica`** · jefe · `pendiente` · `gen4_image` · 8 cr
  - HS-01 Hechicero Supremo "angelical" con alas de luz (retrato grande, 4 cuadros de respiración)
  - Evidencia: asset-blocks.json B087 P0 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B087
- [ ] **3. `b288-silueta-base-hoja-arma-sab`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Silueta base "Hoja" (Arma): sable curvo y liviano, filo fino / Silueta base "Filo" (Arma): hoja recta ancha con el filo brillante, cargada / Silueta base "Colmillo" (Arma): daga curva como un colmillo, gotas en la punta / Silueta base "Espa
  - Evidencia: asset-blocks.json B288 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B288
- [ ] **4. `b289-silueta-base-hacha-arma-ha`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Silueta base "Hacha" (Arma): hacha de una mano con hoja pesada / Silueta base "Cetro" (Arma): cetro corto con una gema en la cabeza / Silueta base "Escudo" (Escudo): escudo de cometa con remaches / Silueta base "Rodela" (Escudo): rodela red
  - Evidencia: asset-blocks.json B289 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B289
- [ ] **5. `b290-silueta-base-egida-escudo`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Silueta base "Égida" (Escudo): escudo redondo con un emblema radiante / Silueta base "Pavés" (Escudo): escudo torre alto / Silueta base "Yelmo" (Casco): yelmo cerrado con visera / Silueta base "Capucha" (Casco): capucha de tela con sombra a
  - Evidencia: asset-blocks.json B290 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B290
- [ ] **6. `b291-silueta-base-corona-casco`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Silueta base "Corona" (Casco): corona de puntas con gemas / Silueta base "Máscara" (Casco): máscara de guerra con ojos rasgados / Silueta base "Coraza" (Pechera): coraza de placas / Silueta base "Pechera" (Pechera): peto acolchado con corre
  - Evidencia: asset-blocks.json B291 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B291
- [ ] **7. `b292-silueta-base-manto-pechera`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Silueta base "Manto" (Pechera): manto con capucha caída / Silueta base "Cota" (Pechera): cota de malla / Silueta base "Guanteletes" (Guantes): guanteletes de placas / Silueta base "Guantes" (Guantes): guantes de cuero ajustados
  - Evidencia: asset-blocks.json B292 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B292
- [ ] **8. `b293-silueta-base-brazales-guan`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Silueta base "Brazales" (Guantes): brazales con runas / Silueta base "Puños" (Guantes): puños con nudilleras / Silueta base "Botas" (Botas): botas de cuero altas / Silueta base "Grebas" (Botas): grebas de placas
  - Evidencia: asset-blocks.json B293 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B293
- [ ] **9. `b294-silueta-base-sandalias-bot`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Silueta base "Sandalias" (Botas): sandalias atadas / Silueta base "Pasos" (Botas): botas livianas con alas o plumas
  - Evidencia: asset-blocks.json B294 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B294
- [ ] **10. `b295-icono-de-objeto-esquirla-d`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Esquirla de Tundraverx" (Legendario con nombre, Arma (arma)) / Ícono de objeto "Manto del Glaciar Dormido" (Legendario con nombre, Pechera (pechera)) / Ícono de objeto "Ojo del Ventisquero" (Legendario con nombre, Guantes (
  - Evidencia: asset-blocks.json B295 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B295
- [ ] **11. `b296-icono-de-objeto-guantelete`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Guanteletes del Herrero Caído" (Legendario con nombre, Guantes (guantes)) / Ícono de objeto "Yelmo de Brasa Viva" (Legendario con nombre, Casco (casco)) / Ícono de objeto "Cadena de Ysolde" (Legendario con nombre, Arma (arm
  - Evidencia: asset-blocks.json B296 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B296
- [ ] **12. `b297-icono-de-objeto-brazal-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Brazal de la Descarga" (Legendario con nombre, Guantes (guantes)) / Ícono de objeto "Muro de Kaelen" (Legendario con nombre, Escudo (escudo)) / Ícono de objeto "Pechera del Juramento Roto" (Legendario con nombre, Pechera (p
  - Evidencia: asset-blocks.json B297 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B297
- [ ] **13. `b298-icono-de-objeto-hoja-sedie`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Hoja Sedienta de Morrah" (Legendario con nombre, Arma (arma)) / Ícono de objeto "Guantes del Carnicero" (Legendario con nombre, Guantes (guantes)) / Ícono de objeto "Botas de la Cacería Roja" (Legendario con nombre, Botas (
  - Evidencia: asset-blocks.json B298 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B298
- [ ] **14. `b299-icono-de-objeto-tunica-del`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Túnica del Peregrino" (Legendario con nombre, Pechera (pechera)) / Ícono de objeto "Sandalias del Primer Alba" (Legendario con nombre, Botas (botas)) / Ícono de objeto "Diadema de los Mil Sellos" (Legendario con nombre, Cas
  - Evidencia: asset-blocks.json B299 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B299
- [ ] **15. `b300-icono-de-objeto-pasos-del`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Pasos del Umbral" (Legendario con nombre, Botas (botas)) / Ícono de objeto "Filo de Medianoche" (Legendario con nombre, Arma (arma)) / Ícono de objeto "Máscara del Acecho Nocturno" (Legendario con nombre, Casco (casco)) / Í
  - Evidencia: asset-blocks.json B300 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B300
- [ ] **16. `b301-icono-de-objeto-escudo-del`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Escudo del Juggernaut" (Objeto de campeón, Escudo (escudo)) / Ícono de objeto "Corona del Paladín Eterno" (Objeto de campeón, Pechera (pechera)) / Ícono de objeto "Garra del Cazador" (Objeto de campeón, Botas (botas)) / Íco
  - Evidencia: asset-blocks.json B301 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B301
- [ ] **17. `b302-icono-de-objeto-cristal-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Cristal de Invierno Eterno" (Objeto de campeón, Casco (casco)) / Ícono de objeto "Corazón del Muro Eterno" (Objeto de campeón, Arma (arma)) / Ícono de objeto "Cáliz de Sobreabundancia" (Objeto de campeón, Pechera (pechera))
  - Evidencia: asset-blocks.json B302 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B302
- [ ] **18. `b303-icono-de-objeto-yugo-de-la`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Yugo de la Furia" (Objeto de campeón, Pechera (pechera)) / Ícono de objeto "Corazón Carmesí" (Objeto de campeón, Arma (arma)) / Ícono de objeto "Fragmento de Recarga" (Objeto de campeón, Botas (botas)) / Ícono de objeto "Nú
  - Evidencia: asset-blocks.json B303 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B303
- [ ] **19. `b304-icono-de-objeto-lagrima-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Lágrima del Augurio" (Objeto de campeón, Casco (casco)) / Ícono de objeto "Cáliz del Sacrificio Menor" (Objeto de campeón, Pechera (pechera))
  - Evidencia: asset-blocks.json B304 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B304
- [ ] **20. `b360-caballero-de-la-armadura-o`** · jefe · `pendiente` · `gen4_image` · 8 cr
  - A-10 Caballero de la Armadura Oxidada: 3 estados de calor + shock térmico
  - Evidencia: asset-blocks.json B360 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B360
- [ ] **21. `b361-cx-ani-01-dobladores-4-ani`** · jefe · `pendiente` · `gen4_image` · 8 cr
  - CX-ANI-01 Dobladores (4): animaciones de habilidad propias
  - Evidencia: asset-blocks.json B361 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B361
- [ ] **22. `b362-rey-de-la-horda-forma-fina`** · jefe · `pendiente` · `gen4_image` · 8 cr
  - A-04 Rey de la Horda (forma final)
  - Evidencia: asset-blocks.json B362 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B362
- [ ] **23. `b363-transformacion-hechicero-g`** · jefe · `pendiente` · `gen4_image` · 8 cr
  - HS-03 Transformación Hechicero → Gólem (8 cuadros) y Gólem → Demonio (6 cuadros)
  - Evidencia: asset-blocks.json B363 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B363
- [ ] **24. `b392-rediseno-de-la-skin-vitral`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Rediseño de la skin "Vitral del Mediodía" (aurelia_alt1): hoy es un recolor del cuerpo base
  - Evidencia: asset-blocks.json B392 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B392
- [ ] **25. `b393-rediseno-de-la-skin-catedr`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Rediseño de la skin "Catedral Corrupta" (aurelia_alt2): hoy es un recolor del cuerpo base
  - Evidencia: asset-blocks.json B393 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B393
- [ ] **26. `b394-rediseno-de-la-skin-sobera`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Rediseño de la skin "Soberano de la Fosa" (facu_gm_alt1): hoy es un recolor del cuerpo base
  - Evidencia: asset-blocks.json B394 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B394
- [ ] **27. `b395-rediseno-de-la-skin-plaga`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Rediseño de la skin "Plaga de Ceniza" (khepri_alt2): hoy es un recolor del cuerpo base
  - Evidencia: asset-blocks.json B395 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B395
- [ ] **28. `b396-skin-caravana-de-medianoch`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin "Caravana de Medianoche" (Ilkan): ataque abajo y arriba
  - Evidencia: asset-blocks.json B396 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B396
- [ ] **29. `b397-rediseno-de-la-skin-regent`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Rediseño de la skin "Regente del Eclipse Dorado" (nano_gm_alt1): hoy es un recolor del cuerpo base
  - Evidencia: asset-blocks.json B397 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B397
- [ ] **30. `b398-rediseno-de-la-skin-llaver`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Rediseño de la skin "Llavera del Alba" (oriel_alt1): hoy es un recolor del cuerpo base
  - Evidencia: asset-blocks.json B398 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B398
- [ ] **31. `b399-rediseno-de-la-skin-guardi`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Rediseño de la skin "Guardiana del Ojo Rojo" (oriel_alt2): hoy es un recolor del cuerpo base
  - Evidencia: asset-blocks.json B399 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B399
- [ ] **32. `b400-rediseno-de-la-skin-herald`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Rediseño de la skin "Heraldo del Ocaso" (saelis_alt1): hoy es un recolor del cuerpo base
  - Evidencia: asset-blocks.json B400 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B400
- [ ] **33. `b401-rediseno-de-la-skin-herald`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Rediseño de la skin "Heraldo de la Aurora Boreal" (saelis_alt2): hoy es un recolor del cuerpo base
  - Evidencia: asset-blocks.json B401 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B401
- [ ] **34. `b402-skin-sistema-axiom-pose-de`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin "Sistema" (Axiom): pose de lanzar
  - Evidencia: asset-blocks.json B402 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B402
- [ ] **35. `b403-rediseno-de-la-skin-mascar`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Rediseño de la skin "Mascarada Veneciana" (velmira_alt1): hoy es un recolor del cuerpo base
  - Evidencia: asset-blocks.json B403 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B403
- [ ] **36. `b404-rediseno-de-la-skin-reina`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Rediseño de la skin "Reina del Réquiem Blanco" (velmira_alt2): hoy es un recolor del cuerpo base
  - Evidencia: asset-blocks.json B404 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B404
- [ ] **37. `b405-fila-8-definitiva-de-la-sk`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Fila 8 (definitiva) de la skin vesper_skin: el atlas mide 448x896 y la definitiva repite la fila de lanzar
  - Evidencia: asset-blocks.json B405 P1 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B405
- [ ] **38. `b495-icono-de-objeto-espada-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Espada de Lucifer" (Set, Arma (arma)) / Ícono de objeto "Escudo de Lucifer" (Set, Escudo (escudo)) / Ícono de objeto "Casco de Lucifer" (Set, Casco (casco)) / Ícono de objeto "Pechera de Lucifer" (Set, Pechera (pechera))
  - Evidencia: asset-blocks.json B495 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B495
- [ ] **39. `b496-icono-de-objeto-guantes-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Guantes de Lucifer" (Set, Guantes (guantes)) / Ícono de objeto "Botas de Lucifer" (Set, Botas (botas)) / Ícono de objeto "Colmillo del Glaciar" (Set, Arma (arma)) / Ícono de objeto "Diadema de Escarcha" (Set, Casco (casco))
  - Evidencia: asset-blocks.json B496 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B496
- [ ] **40. `b497-icono-de-objeto-coraza-del`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Coraza del Invierno" (Set, Pechera (pechera)) / Ícono de objeto "Garras Gélidas" (Set, Guantes (guantes)) / Ícono de objeto "Bastión del Coloso" (Set, Escudo (escudo)) / Ícono de objeto "Yelmo del Coloso" (Set, Casco (casco
  - Evidencia: asset-blocks.json B497 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B497
- [ ] **41. `b498-icono-de-objeto-corazon-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Corazón de Piedra" (Set, Pechera (pechera)) / Ícono de objeto "Pisada del Coloso" (Set, Botas (botas)) / Ícono de objeto "Pala del Sepulturero" (Set, Arma (arma)) / Ícono de objeto "Capucha del Réquiem" (Set, Casco (casco))
  - Evidencia: asset-blocks.json B498 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B498
- [ ] **42. `b499-icono-de-objeto-mortaja-co`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Mortaja Cosida" (Set, Pechera (pechera)) / Ícono de objeto "Manos de Tierra" (Set, Guantes (guantes)) / Ícono de objeto "Cetro del Relámpago" (Set, Arma (arma)) / Ícono de objeto "Corona de Nubes" (Set, Casco (casco))
  - Evidencia: asset-blocks.json B499 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B499
- [ ] **43. `b500-icono-de-objeto-guantes-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Guantes de Descarga" (Set, Guantes (guantes)) / Ícono de objeto "Botas del Rayo" (Set, Botas (botas)) / Ícono de objeto "Hacha Sedienta" (Set, Arma (arma)) / Ícono de objeto "Piel del Berserker" (Set, Pechera (pechera))
  - Evidencia: asset-blocks.json B500 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B500
- [ ] **44. `b501-icono-de-objeto-punos-de-s`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Puños de Sangre" (Set, Guantes (guantes)) / Ícono de objeto "Botas de la Carga" (Set, Botas (botas)) / Ícono de objeto "Égida del Juramento" (Set, Escudo (escudo)) / Ícono de objeto "Yelmo del Guardián" (Set, Casco (casco))
  - Evidencia: asset-blocks.json B501 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B501
- [ ] **45. `b502-icono-de-objeto-peto-juram`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Peto Juramentado" (Set, Pechera (pechera)) / Ícono de objeto "Guanteletes de la Promesa" (Set, Guantes (guantes)) / Ícono de objeto "Báculo del Alba" (Set, Arma (arma)) / Ícono de objeto "Aureola Profética" (Set, Casco (cas
  - Evidencia: asset-blocks.json B502 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B502
- [ ] **46. `b503-icono-de-objeto-tunica-del`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Túnica del Amanecer" (Set, Pechera (pechera)) / Ícono de objeto "Sandalias de Luz" (Set, Botas (botas)) / Ícono de objeto "Colmillo de la Sombra" (Set, Arma (arma)) / Ícono de objeto "Máscara del Acecho" (Set, Casco (casco)
  - Evidencia: asset-blocks.json B503 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B503
- [ ] **47. `b504-icono-de-objeto-guantes-si`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Guantes Silenciosos" (Set, Guantes (guantes)) / Ícono de objeto "Pasos de Sombra" (Set, Botas (botas)) / Ícono de objeto "Orbe del Arcano" (Set, Arma (arma)) / Ícono de objeto "Ojo Abierto" (Set, Casco (casco))
  - Evidencia: asset-blocks.json B504 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B504
- [ ] **48. `b505-icono-de-objeto-dedos-del`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Dedos del Sello" (Set, Guantes (guantes)) / Ícono de objeto "Pasos del Vacío" (Set, Botas (botas)) / Ícono de objeto "Corona del Rey Errante" (Set, Casco (casco)) / Ícono de objeto "Manto de los Pasillos" (Set, Pechera (pec
  - Evidencia: asset-blocks.json B505 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B505
- [ ] **49. `b506-icono-de-objeto-guantes-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Guantes del Cartógrafo" (Set, Guantes (guantes)) / Ícono de objeto "Botas del Rey" (Set, Botas (botas)) / Ícono de objeto "Pavés del Baluarte" (Set, Escudo (escudo)) / Ícono de objeto "Yelmo del Baluarte" (Set, Casco (casco
  - Evidencia: asset-blocks.json B506 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B506
- [ ] **50. `b507-icono-de-objeto-coraza-del`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Coraza del Baluarte" (Set, Pechera (pechera)) / Ícono de objeto "Grebas del Baluarte" (Set, Botas (botas)) / Ícono de objeto "Colmillo Nocturno" (Set, Arma (arma)) / Ícono de objeto "Capucha Nocturna" (Set, Casco (casco))
  - Evidencia: asset-blocks.json B507 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B507
- [ ] **51. `b508-icono-de-objeto-guantes-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Guantes del Degollador" (Set, Guantes (guantes)) / Ícono de objeto "Pasos Nocturnos" (Set, Botas (botas)) / Ícono de objeto "Bastón de la Convergencia" (Set, Arma (arma)) / Ícono de objeto "Capucha Tricolor" (Set, Casco (ca
  - Evidencia: asset-blocks.json B508 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B508
- [ ] **52. `b509-icono-de-objeto-tunica-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Túnica de los Tres Elementos" (Set, Pechera (pechera)) / Ícono de objeto "Sellos Elementales" (Set, Guantes (guantes)) / Ícono de objeto "Báculo del Custodio" (Set, Arma (arma)) / Ícono de objeto "Mitra del Custodio" (Set, 
  - Evidencia: asset-blocks.json B509 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B509
- [ ] **53. `b510-icono-de-objeto-habito-del`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Hábito del Custodio" (Set, Pechera (pechera)) / Ícono de objeto "Sandalias del Custodio" (Set, Botas (botas)) / Ícono de objeto "Guadaña de la Marea" (Set, Arma (arma)) / Ícono de objeto "Coraza Carmesí" (Set, Pechera (pech
  - Evidencia: asset-blocks.json B510 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B510
- [ ] **54. `b511-icono-de-objeto-garras-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Garras de la Marea" (Set, Guantes (guantes)) / Ícono de objeto "Botas del Olvido" (Set, Botas (botas)) / Ícono de objeto "Núcleo Raíz" (Set, Arma (arma)) / Ícono de objeto "Visor de Depuración" (Set, Casco (casco))
  - Evidencia: asset-blocks.json B511 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B511
- [ ] **55. `b512-icono-de-objeto-guantes-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Guantes de Compilación" (Set, Guantes (guantes)) / Ícono de objeto "Pasos Asíncronos" (Set, Botas (botas)) / Ícono de objeto "Velo de la Profecía" (Set, Casco (casco)) / Ícono de objeto "Manto del Augurio" (Set, Pechera (pe
  - Evidencia: asset-blocks.json B512 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B512
- [ ] **56. `b513-icono-de-objeto-brazales-d`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Brazales del Destino" (Set, Guantes (guantes)) / Ícono de objeto "Pasos del Presagio" (Set, Botas (botas)) / Ícono de objeto "Bokken del Errante" (Set, Arma (arma)) / Ícono de objeto "Kasa del Errante" (Set, Casco (casco))
  - Evidencia: asset-blocks.json B513 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B513
- [ ] **57. `b514-icono-de-objeto-tekko-del`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Tekko del Errante" (Set, Guantes (guantes)) / Ícono de objeto "Waraji del Errante" (Set, Botas (botas)) / Ícono de objeto "Arco de la Manada" (Set, Arma (arma)) / Ícono de objeto "Capucha del Rastreador" (Set, Casco (casco)
  - Evidencia: asset-blocks.json B514 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B514
- [ ] **58. `b515-icono-de-objeto-guantes-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Guantes de la Cuerda Tensa" (Set, Guantes (guantes)) / Ícono de objeto "Botas del Sendero" (Set, Botas (botas)) / Ícono de objeto "Fusil del Granadero" (Set, Arma (arma)) / Ícono de objeto "Morrión del Granadero" (Set, Casc
  - Evidencia: asset-blocks.json B515 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B515
- [ ] **59. `b516-icono-de-objeto-casaca-azu`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Casaca Azul" (Set, Pechera (pechera)) / Ícono de objeto "Botas de Caballería" (Set, Botas (botas)) / Ícono de objeto "Cetro del Réquiem" (Set, Arma (arma)) / Ícono de objeto "Corona de Huesos" (Set, Casco (casco))
  - Evidencia: asset-blocks.json B516 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B516
- [ ] **60. `b517-icono-de-objeto-mortaja-de`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Mortaja del Señor" (Set, Pechera (pechera)) / Ícono de objeto "Garras de la Tumba" (Set, Guantes (guantes)) / Ícono de objeto "Hoces de la Caravana" (Set, Arma (arma)) / Ícono de objeto "Arnés de Faroles" (Set, Pechera (pec
  - Evidencia: asset-blocks.json B517 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B517
- [ ] **61. `b518-icono-de-objeto-empunadura`** · otro · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de objeto "Empuñaduras de Cristal" (Set, Guantes (guantes)) / Ícono de objeto "Botas de Arena" (Set, Botas (botas))
  - Evidencia: asset-blocks.json B518 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B518
- [ ] **62. `b522-aura-de-set-set-de-lucifer`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Aura de set "Set de Lucifer" (Fuego · riesgo · agresión) / Aura de set "Pacto del Glaciar" (Hielo · control) / Aura de set "Corazón del Coloso" (Tanque · absorber) / Aura de set "Réquiem del Sepulturero" (Invocaciones · no-muertos)
  - Evidencia: asset-blocks.json B522 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B522
- [ ] **63. `b523-aura-de-set-tempestad-eter`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Aura de set "Tempestad Eterna" (Electricidad · cadena · movilidad) / Aura de set "Sangre del Berserker" (Riesgo · recompensa) / Aura de set "Juramento del Guardián" (Protección cooperativa) / Aura de set "Profecía del Alba" (Soporte · curac
  - Evidencia: asset-blocks.json B523 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B523
- [ ] **64. `b524-aura-de-set-sombra-del-caz`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Aura de set "Sombra del Cazador" (Asesino · objetivo único) / Aura de set "Ojo del Arcano" (Mago · rotación) / Aura de set "Rey del Laberinto" (Movimiento · posicionamiento) / Aura de set "Baluarte Inquebrantable" (Tanque · masa · control)
  - Evidencia: asset-blocks.json B524 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B524
- [ ] **65. `b526-aura-de-set-acceso-raiz-ax`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Aura de set "Acceso Raíz" (Axiom · reglas rotas) / Aura de set "La Última Profecía" (Profeta · destino · salvar) / Aura de set "El Rōnin Errante" (Musashi · paciencia · un solo corte) / Aura de set "La Manada" (Cazadora · marca → presa → lo
  - Evidencia: asset-blocks.json B526 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B526
- [ ] **66. `b527-aura-de-set-uniforme-del-g`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Aura de set "Uniforme del Granadero" (Libertador · disparo pesado) / Aura de set "Réquiem del Señor de la Muerte" (Nigromante · legión · almas) / Aura de set "Legión de Reconocimiento" (Eren · maniobras · el Portador)
  - Evidencia: asset-blocks.json B527 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B527
- [ ] **67. `b528-vfx-de-proc-estallido-igne`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - VFX de proc "Estallido Ígneo" (kill_explode) / VFX de proc "Tormenta Encadenada" (basic_chain) / VFX de proc "Resonancia Arcana" (skill_nova) / VFX de proc "Festín de Almas" (kill_heal)
  - Evidencia: asset-blocks.json B528 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B528
- [ ] **68. `b529-vfx-de-proc-egida-hit-shie`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - VFX de proc "Égida" (hit_shield) / VFX de proc "Escarcha Viva" (basic_freeze) / VFX de proc "Furia Creciente" (combo_ramp) / VFX de proc "Golpe Sísmico" (crit_quake)
  - Evidencia: asset-blocks.json B529 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B529
- [ ] **69. `b530-vfx-de-proc-aliento-glacia`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - VFX de proc "Aliento Glacial" (frost_aura) / VFX de proc "Brasa Viva" (ignite_basic) / VFX de proc "Filo Sediento" (bleed_basic) / VFX de proc "Paso del Cazador" (haste_on_kill)
  - Evidencia: asset-blocks.json B530 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B530
- [ ] **70. `b531-vfx-de-proc-guardia-jurame`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - VFX de proc "Guardia Juramentada" (ally_ward) / VFX de proc "Represalia" (retaliate) / VFX de proc "Gracia Veloz" (heal_haste) / VFX de proc "Filo del Verdugo" (execute_edge)
  - Evidencia: asset-blocks.json B531 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B531
- [ ] **71. `b532-vfx-de-proc-descarga-arcan`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - VFX de proc "Descarga Arcana" (shock_skill) / VFX de proc "Avivar las Llamas" (burn_vs) / VFX de proc "Frío que Quiebra" (cold_crit) / VFX de proc "Esporas Pútridas" (spore_rot)
  - Evidencia: asset-blocks.json B532 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B532
- [ ] **72. `b533-vfx-de-proc-invierno-sin-f`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - VFX de proc "Invierno Sin Fin" (myth_winter) / VFX de proc "Combustión Perpetua" (myth_inferno) / VFX de proc "Tormenta Viva" (myth_storm) / VFX de proc "Último Bastión" (myth_bastion)
  - Evidencia: asset-blocks.json B533 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B533
- [ ] **73. `b534-vfx-de-proc-cosecha-roja-m`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - VFX de proc "Cosecha Roja" (myth_harvest) / VFX de proc "Alba Eterna" (myth_dawn) / VFX de proc "Eco del Vacío" (myth_echo) / VFX de proc "Eclipse" (myth_eclipse)
  - Evidencia: asset-blocks.json B534 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B534
- [ ] **74. `b535-vfx-de-proc-fuego-del-vaci`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - VFX de proc "Fuego del Vacío" (uniq_archimago) / VFX de proc "Paso del Coloso" (uniq_juggernaut) / VFX de proc "Luna Roja" (uniq_lunaroja)
  - Evidencia: asset-blocks.json B535 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B535
- [ ] **75. `b546-incrustacion-de-suelo-inla`** · arena · `pendiente` · `gen4_image` · 8 cr
  - Incrustación de suelo "inlay-convergencia" (64×40, 3 variantes)
  - Evidencia: asset-blocks.json B546 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B546
- [ ] **76. `b549-icono-de-tienda-reparar-18`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de tienda "Reparar +180" (Cristales/Coliseo) / Ícono de tienda "Daño de equipo +12%" (Cristales/Coliseo) / Ícono de tienda "Enviar 5 acechadores" (Cristales/Coliseo) / Ícono de tienda "Enviar un coloso" (Cristales/Coliseo)
  - Evidencia: asset-blocks.json B549 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B549
- [ ] **77. `b550-icono-de-tienda-barrera-12`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - Ícono de tienda "Barrera +125" (Cristales/Coliseo) / Ícono de tienda "Furia 20 s" (Cristales/Coliseo)
  - Evidencia: asset-blocks.json B550 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B550
- [ ] **78. `b553-iconos-de-accion-contextua`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - A-16 Íconos de acción contextual (RESCATAR, ENCENDER, ATRAVESAR, sello, cerrar, activar)
  - Evidencia: asset-blocks.json B553 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B553
- [ ] **79. `b557-ilustracion-de-ficha-del-j`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - CX-ILU Ilustración de ficha del jefe "Dragón de la Forja" / CX-ILU Ilustración de ficha del jefe "Caballero de la Armadura Oxidada" / CX-ILU Ilustración de ficha del jefe "Los Cuatro Reflejos" / CX-ILU Ilustración de ficha del jefe "Guardiá
  - Evidencia: asset-blocks.json B557 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B557
- [ ] **80. `b558-ilustracion-de-ficha-del-j`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - CX-ILU Ilustración de ficha del jefe "Micelio Primigenio" / CX-ILU Ilustración de ficha del jefe "Madre Espora" / CX-ILU Ilustración de ficha del jefe "Tundraverx" / CX-ILU Ilustración de ficha del jefe "Mago Gélido"
  - Evidencia: asset-blocks.json B558 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B558
- [ ] **81. `b559-ilustracion-de-ficha-del-j`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - CX-ILU Ilustración de ficha del jefe "Kraken Joven" / CX-ILU Ilustración de ficha del jefe "Guardián del Laberinto" / CX-ILU Ilustración de ficha del jefe "Carcelero del Vacío" / CX-ILU Ilustración de ficha del jefe "Jinete Sin Cabeza (Divi
  - Evidencia: asset-blocks.json B559 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B559
- [ ] **82. `b560-ilustracion-del-libro-de-l`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - Ilustración del Libro de la Horda "cicatriz" / Ilustración del Libro de la Horda "mision" / Ilustración del Libro de la Horda "libro" / Ilustración del Libro de la Horda "modos"
  - Evidencia: asset-blocks.json B560 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B560
- [ ] **83. `b561-ilustracion-del-libro-de-l`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - Ilustración del Libro de la Horda "progreso" / Ilustración del Libro de la Horda "equipo" / Ilustración del Libro de la Horda "maestria" / Ilustración del Libro de la Horda "talentos"
  - Evidencia: asset-blocks.json B561 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B561
- [ ] **84. `b562-ilustracion-del-libro-de-l`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - Ilustración del Libro de la Horda "dificultad" / Ilustración del Libro de la Horda "cooperativo" / Ilustración del Libro de la Horda "tienda" / Ilustración del Libro de la Horda "brasas"
  - Evidencia: asset-blocks.json B562 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B562
- [ ] **85. `b563-ilustracion-del-libro-de-l`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - Ilustración del Libro de la Horda "postgame" / Ilustración del Libro de la Horda "recap"
  - Evidencia: asset-blocks.json B563 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B563
- [ ] **86. `b564-marcos-de-interfaz-panel-b`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - Marcos de interfaz (panel, botón, ranura, rareza de ítem)
  - Evidencia: asset-blocks.json B564 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B564
- [ ] **87. `b565-retratos-de-tarjeta-de-cam`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - A-17 Retratos de tarjeta de campeones (104×104)
  - Evidencia: asset-blocks.json B565 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B565
- [ ] **88. `b566-retrato-del-hechicero-con`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - HS-04 Retrato del Hechicero con 3 expresiones (neutral, advertencia, sonrisa torcida)
  - Evidencia: asset-blocks.json B566 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B566
- [ ] **89. `b609-dragon-de-la-forja-huyendo`** · jefe · `pendiente` · `gen4_image` · 8 cr
  - A-20 Dragón de la Forja huyendo herido
  - Evidencia: asset-blocks.json B609 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B609
- [ ] **90. `b610-escudo-de-raices-del-guard`** · jefe · `pendiente` · `gen4_image` · 8 cr
  - A-19 Escudo de raíces del Guardián Ancestral
  - Evidencia: asset-blocks.json B610 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B610
- [ ] **91. `b612-skin-de-set-acceso-raiz-ax`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Acceso Raíz" (Axiom, atlas del campeón)
  - Evidencia: asset-blocks.json B612 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B612
- [ ] **92. `b613-skin-de-set-baluarte-inque`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Baluarte Inquebrantable" (Tanque, atlas del campeón)
  - Evidencia: asset-blocks.json B613 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B613
- [ ] **93. `b614-skin-de-set-bendicion-del`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Bendición del Custodio" (Soporte, atlas del campeón)
  - Evidencia: asset-blocks.json B614 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B614
- [ ] **94. `b615-skin-de-set-convergencia-e`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Convergencia Elemental" (Mago, atlas del campeón)
  - Evidencia: asset-blocks.json B615 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B615
- [ ] **95. `b616-skin-de-set-corazon-del-co`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Corazón del Coloso" (cualquiera, capa superpuesta)
  - Evidencia: asset-blocks.json B616 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B616
- [ ] **96. `b617-skin-de-set-el-r-nin-erran`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "El Rōnin Errante" (Musashi, atlas del campeón)
  - Evidencia: asset-blocks.json B617 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B617
- [ ] **97. `b618-skin-de-set-juramento-del`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Juramento del Guardián" (cualquiera, capa superpuesta)
  - Evidencia: asset-blocks.json B618 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B618
- [ ] **98. `b619-skin-de-set-la-manada-la-c`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "La Manada" (La Cazadora, atlas del campeón)
  - Evidencia: asset-blocks.json B619 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B619
- [ ] **99. `b620-skin-de-set-la-ultima-prof`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "La Última Profecía" (La Profeta, atlas del campeón)
  - Evidencia: asset-blocks.json B620 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B620
- [ ] **100. `b621-skin-de-set-legion-de-reco`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Legión de Reconocimiento" (Eren, atlas del campeón)
  - Evidencia: asset-blocks.json B621 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B621
- [ ] **101. `b622-skin-de-set-marea-roja-seg`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Marea Roja" (Segador Olvidado, atlas del campeón)
  - Evidencia: asset-blocks.json B622 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B622
- [ ] **102. `b623-skin-de-set-ojo-del-arcano`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Ojo del Arcano" (cualquiera, capa superpuesta)
  - Evidencia: asset-blocks.json B623 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B623
- [ ] **103. `b624-skin-de-set-pacto-del-glac`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Pacto del Glaciar" (cualquiera, capa superpuesta)
  - Evidencia: asset-blocks.json B624 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B624
- [ ] **104. `b625-skin-de-set-profecia-del-a`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Profecía del Alba" (cualquiera, capa superpuesta)
  - Evidencia: asset-blocks.json B625 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B625
- [ ] **105. `b626-skin-de-set-requiem-del-se`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Réquiem del Señor de la Muerte" (Nigromante, atlas del campeón)
  - Evidencia: asset-blocks.json B626 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B626
- [ ] **106. `b627-skin-de-set-requiem-del-se`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Réquiem del Sepulturero" (cualquiera, capa superpuesta)
  - Evidencia: asset-blocks.json B627 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B627
- [ ] **107. `b628-skin-de-set-rey-del-laberi`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Rey del Laberinto" (cualquiera, capa superpuesta)
  - Evidencia: asset-blocks.json B628 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B628
- [ ] **108. `b629-skin-de-set-sangre-del-ber`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Sangre del Berserker" (cualquiera, capa superpuesta)
  - Evidencia: asset-blocks.json B629 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B629
- [ ] **109. `b630-skin-de-set-set-de-lucifer`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Set de Lucifer" (cualquiera, capa superpuesta)
  - Evidencia: asset-blocks.json B630 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B630
- [ ] **110. `b631-skin-de-set-sombra-del-caz`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Sombra del Cazador" (cualquiera, capa superpuesta)
  - Evidencia: asset-blocks.json B631 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B631
- [ ] **111. `b632-skin-de-set-sombra-nocturn`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Sombra Nocturna" (Asesino, atlas del campeón)
  - Evidencia: asset-blocks.json B632 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B632
- [ ] **112. `b633-skin-de-set-tempestad-eter`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Tempestad Eterna" (cualquiera, capa superpuesta)
  - Evidencia: asset-blocks.json B633 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B633
- [ ] **113. `b634-skin-de-set-uniforme-del-g`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin de set "Uniforme del Granadero" (El Libertador, atlas del campeón)
  - Evidencia: asset-blocks.json B634 P2 PENDIENTE; transversal (todas las partidas)
  - Refs: bloques B634
- [ ] **114. `b637-skin-nueva-1-concepto-a-de`** · skin · `bloqueado_decision` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin nueva #1 (concepto a definir con el dueño): el campeón tiene 0 skins de diseño propio y el objetivo es 2
  - Evidencia: asset-blocks.json B637 P2 BLOQUEADO_DECISION; transversal (todas las partidas)
  - Refs: bloques B637
- [ ] **115. `b638-skin-nueva-1-concepto-a-de`** · skin · `bloqueado_decision` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin nueva #1 (concepto a definir con el dueño): el campeón tiene 1 skins de diseño propio y el objetivo es 2
  - Evidencia: asset-blocks.json B638 P2 BLOQUEADO_DECISION; transversal (todas las partidas)
  - Refs: bloques B638
- [ ] **116. `b639-skin-nueva-1-concepto-a-de`** · skin · `bloqueado_decision` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin nueva #1 (concepto a definir con el dueño): el campeón tiene 1 skins de diseño propio y el objetivo es 2
  - Evidencia: asset-blocks.json B639 P2 BLOQUEADO_DECISION; transversal (todas las partidas)
  - Refs: bloques B639
- [ ] **117. `b640-skin-nueva-1-concepto-a-de`** · skin · `bloqueado_decision` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin nueva #1 (concepto a definir con el dueño): el campeón tiene 1 skins de diseño propio y el objetivo es 2
  - Evidencia: asset-blocks.json B640 P2 BLOQUEADO_DECISION; transversal (todas las partidas)
  - Refs: bloques B640
- [ ] **118. `b641-skin-nueva-1-concepto-a-de`** · skin · `bloqueado_decision` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin nueva #1 (concepto a definir con el dueño): el campeón tiene 1 skins de diseño propio y el objetivo es 2
  - Evidencia: asset-blocks.json B641 P2 BLOQUEADO_DECISION; transversal (todas las partidas)
  - Refs: bloques B641
- [ ] **119. `b642-skin-nueva-1-concepto-a-de`** · skin · `bloqueado_decision` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin nueva #1 (concepto a definir con el dueño): el campeón tiene 1 skins de diseño propio y el objetivo es 2
  - Evidencia: asset-blocks.json B642 P2 BLOQUEADO_DECISION; transversal (todas las partidas)
  - Refs: bloques B642
- [ ] **120. `b644-skin-nueva-1-concepto-a-de`** · skin · `bloqueado_decision` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin nueva #1 (concepto a definir con el dueño): el campeón tiene 0 skins de diseño propio y el objetivo es 2
  - Evidencia: asset-blocks.json B644 P2 BLOQUEADO_DECISION; transversal (todas las partidas)
  - Refs: bloques B644
- [ ] **121. `b645-skin-nueva-1-concepto-a-de`** · skin · `bloqueado_decision` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skin nueva #1 (concepto a definir con el dueño): el campeón tiene 1 skins de diseño propio y el objetivo es 2
  - Evidencia: asset-blocks.json B645 P2 BLOQUEADO_DECISION; transversal (todas las partidas)
  - Refs: bloques B645
- [ ] **122. `b538-entrando-al-refugio-de-esp`** · arena · `pendiente` · `gen4_image` · 16 cr
  - CM-C05 Entrando al refugio (de espaldas, se desvanece) / CM-C06 Variantes extra (anciano, herrero, monja)
  - Evidencia: asset-blocks.json B538 P2 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Refs: bloques B538
- [ ] **123. `b539-zona-segura-en-el-piso-ani`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - CM-V05 Zona segura en el piso (anillo verde con runas)
  - Evidencia: asset-blocks.json B539 P2 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Refs: bloques B539
- [ ] **124. `b543-incrustacion-de-suelo-inla`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Incrustación de suelo "inlay-ciudad" (64×40, 3 variantes) / Incrustación de suelo "inlay-fortaleza" (64×40, 3 variantes) / Incrustación de suelo "inlay-bosque" (64×40, 3 variantes) / Incrustación de suelo "inlay-micelial" (64×40, 3 variante
  - Evidencia: asset-blocks.json B543 P2 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Refs: bloques B543
- [ ] **125. `b551-boton-rescatar-icono-de-ma`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - CM-U03 Botón RESCATAR (ícono de mano / persona)
  - Evidencia: asset-blocks.json B551 P2 PENDIENTE; arena ciudad (1/10 del recorrido)
  - Refs: bloques B551
- [ ] **126. `proy-b278-crescent`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Proyectil "crescent" (segador) / Proyectil "glyph" (axiom) / Proyectil "rune" (profeta) / Proyectil "soul" (nigromante)
  - Evidencia: asset-blocks.json B278 P1
  - Refs: bloques B278
- [ ] **127. `proy-b280-nut`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Proyectil "nut" (Brasa, la Mecánica) / Proyectil "droplet" (Morwen, la Destiladora) / Proyectil "needle" (Iria, la Tejedora) / Proyectil "note" (Dáriel, el Último Compás)
  - Evidencia: asset-blocks.json B280 P1
  - Refs: bloques B280
- [ ] **128. `proy-b281-bolt`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Proyectil "bolt" (Orsa, la Guardacables) / Proyectil "swarm" (Tibor, el Rey sin Corona) / Proyectil "steam" (Zahra, la Mano de la Válvula) / Proyectil "compass" (Sira, la Cartógrafa)
  - Evidencia: asset-blocks.json B281 P1
  - Refs: bloques B281
- [ ] **129. `proy-b282-officer`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Proyectil "officer" (San Martín, Disparo de Oficial) / Proyectil "arrow_heavy" (Sylva, Flecha Perforante) / Proyectil "halfmoon" (Nano GM, el Regente del Umbral) / Proyectil "wave" (Facu GM, el Soberano de las Mareas)
  - Evidencia: asset-blocks.json B282 P1
  - Refs: bloques B282
- [ ] **130. `proy-b283-prism`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Proyectil "prism" (Aurelia, la Arquitecta Solar) / Proyectil "scarab" (Khepri, el Portador del Enjambre) / Proyectil "mask" (Velmira, la Reina de las Máscaras) / Proyectil "comet" (Vhal, el Astrónomo Caído)
  - Evidencia: asset-blocks.json B283 P1
  - Refs: bloques B283
- [ ] **131. `proy-b284-fist`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Proyectil "fist" (Bront, la Fortaleza Viviente) / Proyectil "key" (Oriel, la Portera de las Cicatrices) / Proyectil "feather" (Saelis, la Heraldo del Plumaje) / Proyectil "wine_corkscrew" (Solciju)
  - Evidencia: asset-blocks.json B284 P1
  - Refs: bloques B284
- [ ] **132. `proy-b285-plague-spore`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Proyectil "plague_spore" (Morveth) / Proyectil "fractured_clock" (Aelith)
  - Evidencia: asset-blocks.json B285 P1
  - Refs: bloques B285
- [ ] **133. `campeon-segador`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Campeón segador (Segador, el Olvidado): bloques abiertos B104 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: hecho; medido en el motor: idle 4 · walk 4 · atk 4 · cast 4 · ult 4 · hit 4 · death 4
  - Refs: bloques B104
- [ ] **134. `campeon-axiom`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón axiom (Axiom, el Reescritor): idle y hit de 1 cuadro; bloques abiertos B097 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B097
- [ ] **135. `campeon-profeta`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Campeón profeta (Ismara, la Profeta Ciega): bloques abiertos B103 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: hecho; medido en el motor: idle 4 · walk 4 · atk 4 · cast 4 · ult 4 · hit 4 · death 4
  - Refs: bloques B103 · runway profeta_poses
- [ ] **136. `campeon-musashi`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Campeón musashi (Musashi, el Rōnin del Bokken): idle de 1 cuadro; bloques abiertos B101 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 4 · death 6
  - Refs: bloques B101 · runway musashi_ult_poses_gpt2
- [ ] **137. `campeon-nigromante`** · campeon · `en_curso` · `gpt_image_2_codice_limpio` · 0 cr
  - Campeón nigromante (Ilvar, el Señor de las Criptas): idle de 1 cuadro; despacho de dibujo en js/champions/nigromante.js (el arte no es el hueco); bloques abiertos B102 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 3 · cast 4 · ult 4 · hit 4 · death 6
  - Nota: No pedir arte que el motor no dibujaría: es despacho de código (CHECKLIST_ARTE §B).
  - Refs: bloques B102
- [ ] **138. `campeon-ilkan`** · campeon · `en_curso` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón ilkan (Ilkan, el Caminante de Dunas): despacho de dibujo en js/champions/ilkan.js (el arte no es el hueco); bloques abiertos B099 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: hecho; medido en el motor: idle 4 · walk 3 · atk 3 · cast 3 · ult 3 · hit 2 · death 2
  - Nota: No pedir arte que el motor no dibujaría: es despacho de código (CHECKLIST_ARTE §B).
  - Refs: bloques B099 · runway ilkan_idle_prueba, ilkan_coloso_ronda1_golem, ilkan_coloso_espiritu, ilkan_ataque_frente_gpt2, ilkan_ataque_espalda_gpt2
- [ ] **139. `campeon-brasa`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Campeón brasa (Brasa, la Mecánica Fugitiva): hit de 1 cuadro; bloques abiertos B409 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: hecho; medido en el motor: idle 2 · walk 4 · atk 3 · cast 3 · ult 2 · hit 1 · death 3
  - Refs: bloques B409
- [ ] **140. `campeon-eslabon`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Campeón eslabon (Garren, el Eslabón): hit de 1 cuadro; bloques abiertos B412 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: hecho; medido en el motor: idle 2 · walk 4 · atk 3 · cast 3 · ult 2 · hit 1 · death 3
  - Refs: bloques B412
- [ ] **141. `campeon-morwen`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Campeón morwen (Morwen, la Destiladora de Ecos): hit de 1 cuadro; bloques abiertos B417 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: hecho; medido en el motor: idle 2 · walk 4 · atk 3 · cast 3 · ult 2 · hit 1 · death 3
  - Refs: bloques B417
- [ ] **142. `campeon-farolero`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Campeón farolero (Tobías, el Farolero): hit de 1 cuadro; bloques abiertos B414 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: hecho; medido en el motor: idle 2 · walk 4 · atk 3 · cast 3 · ult 2 · hit 1 · death 3
  - Refs: bloques B414
- [ ] **143. `campeon-iria`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Campeón iria (Iria, la Tejedora de Límites): hit de 1 cuadro; bloques abiertos B415 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: hecho; medido en el motor: idle 2 · walk 4 · atk 3 · cast 3 · ult 2 · hit 1 · death 3
  - Refs: bloques B415
- [ ] **144. `campeon-vesper`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón vesper (Vesper, la Costurera de Sombras): idle y hit de 1 cuadro; bloques abiertos B425 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B425
- [ ] **145. `campeon-nahir`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón nahir (Nahir, el Restaurador de Espejos): idle y hit de 1 cuadro; bloques abiertos B418 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 3 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B418
- [ ] **146. `campeon-baltra`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón baltra (Baltra, la Campana Sumergida): idle y hit de 1 cuadro; bloques abiertos B407 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 3 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B407
- [ ] **147. `campeon-maura`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón maura (Maura, la Pastora de Espinas): idle y hit de 1 cuadro
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
- [ ] **148. `campeon-dariel`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón dariel (Dáriel, el Último Compás): idle y hit de 1 cuadro; bloques abiertos B411 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B411
- [ ] **149. `campeon-orsa`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón orsa (Orsa, la Guardacables): idle y hit de 1 cuadro
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
- [ ] **150. `campeon-tibor`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón tibor (Tibor, el Rey sin Corona): idle y hit de 1 cuadro; bloques abiertos B423 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B423
- [ ] **151. `campeon-zahra`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón zahra (Zahra, la Mano de la Válvula): idle y hit de 1 cuadro; bloques abiertos B427 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B427
- [ ] **152. `campeon-renko`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón renko (Renko, el Jardinero de Nombres): idle y hit de 1 cuadro; bloques abiertos B420 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B420
- [ ] **153. `campeon-sira`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón sira (Sira, la Cartógrafa del Regreso): idle y hit de 1 cuadro; bloques abiertos B422 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B422
- [ ] **154. `campeon-khepri`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón khepri (Khepri, el Portador del Enjambre): idle y hit de 1 cuadro; bloques abiertos B416 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 3 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B416
- [ ] **155. `campeon-velmira`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón velmira (Velmira, la Reina de las Máscaras): idle y hit de 1 cuadro; bloques abiertos B424 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B424
- [ ] **156. `campeon-vhal`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón vhal (Vhal, el Astrónomo Caído): idle y hit de 1 cuadro; bloques abiertos B426 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B426
- [ ] **157. `campeon-bront`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón bront (Bront, la Fortaleza Viviente): idle y hit de 1 cuadro; bloques abiertos B410 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 3 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B410
- [ ] **158. `campeon-oriel`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón oriel (Oriel, la Portera de las Cicatrices): idle y hit de 1 cuadro; bloques abiertos B419 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B419
- [ ] **159. `campeon-solciju`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón solciju (Solciju, la Enóloga): idle y hit de 1 cuadro
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
- [ ] **160. `campeon-brakk`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón brakk (Brakk, el Arquitecto del Fin): idle y hit de 1 cuadro; bloques abiertos B408 (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 3 · cast 4 · ult 4 · hit 1 · death 4
  - Refs: bloques B408
- [ ] **161. `campeon-morveth`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón morveth (Morveth, el Jardinero de la Peste): idle y hit de 1 cuadro
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
- [ ] **162. `campeon-aelith`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 40 cr
  - Campeón aelith (Aelith, la Ladrona de Segundos): idle y hit de 1 cuadro
  - Evidencia: ATLAS_ARTE: parcial; medido en el motor: idle 1 · walk 4 · atk 4 · cast 4 · ult 4 · hit 1 · death 4
- [ ] **163. `b541-prop-de-decorado-stream-bo`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Prop de decorado "stream" (bosque, canvas 420×90) / Prop de decorado "minoChamber" (laberinto, canvas 420×290) / Prop de decorado "sunkColumn+v" (acuatica, canvas 30×76) / Prop de decorado "tomb" (acuatica, canvas 56×36)
  - Evidencia: asset-blocks.json B541 P2 PENDIENTE; arena bosque (3/10 del recorrido)
  - Nota: Ya instalados y NO repetir: infPentagram (infernal_centro), minoChamber (laberinto_centro), sunkTemple (acuatica_centro). Las filas prox_centro_* de estado-runway repiten ritualCircle/frozenLake.
  - Refs: bloques B541
- [ ] **164. `iconos-guerrero`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit guerrero (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B249 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B249
- [ ] **165. `fx-segador`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de segador (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B038…B465 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B038, B202, B203, B204, B465
- [ ] **166. `iconos-segador`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit segador (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B265 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B265
- [ ] **167. `fx-axiom`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de axiom (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B009…B430 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B009, B111, B112, B113, B430
- [ ] **168. `iconos-axiom`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit axiom (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B240 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B240
- [ ] **169. `fx-profeta`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de profeta (6 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B035…B461 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B035, B193, B194, B195, B460, B461
- [ ] **170. `iconos-profeta`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit profeta (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B262 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B262
- [ ] **171. `fx-musashi`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de musashi (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B028…B449 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B028, B172, B173, B174, B449
- [ ] **172. `iconos-musashi`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit musashi (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B053 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B053
- [ ] **173. `fx-nigromante`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de nigromante (6 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B032…B456 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B032, B184, B185, B186, B455, B456
- [ ] **174. `iconos-nigromante`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit nigromante (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B260 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B260
- [ ] **175. `iconos-libertador`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit libertador (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B253 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B253
- [ ] **176. `fx-ilkan`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de ilkan (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B020…B441 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B020, B144, B145, B146, B441
- [ ] **177. `iconos-ilkan`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit ilkan (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B250 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B250
- [ ] **178. `iconos-ynara`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit ynara (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B274 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B274
- [ ] **179. `iconos-myla`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit myla (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B257 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B257
- [ ] **180. `fx-brasa`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de brasa (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B012…B433 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B012, B120, B121, B122, B433
- [ ] **181. `iconos-brasa`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit brasa (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B243 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B243
- [ ] **182. `fx-eslabon`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de eslabon (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B016…B437 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B016, B132, B133, B134, B437
- [ ] **183. `iconos-eslabon`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit eslabon (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B246 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B246
- [ ] **184. `fx-morwen`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de morwen (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B027…B448 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B027, B169, B170, B171, B448
- [ ] **185. `iconos-morwen`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit morwen (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B256 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B256
- [ ] **186. `fx-farolero`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de farolero (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B018…B439 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B018, B138, B139, B140, B439
- [ ] **187. `iconos-farolero`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit farolero (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B248 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B248
- [ ] **188. `fx-iria`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de iria (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B021…B442 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B021, B151, B152, B153, B442
- [ ] **189. `iconos-iria`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit iria (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B251 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B251
- [ ] **190. `fx-vesper`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de vesper (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B045…B475 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B045, B223, B224, B225, B475
- [ ] **191. `iconos-vesper`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit vesper (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B272 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B272
- [ ] **192. `fx-nahir`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de nahir (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B030…B452 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B030, B178, B179, B180, B452
- [ ] **193. `iconos-nahir`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit nahir (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B258 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B258
- [ ] **194. `fx-baltra`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de baltra (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B010…B431 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B010, B114, B115, B116, B431
- [ ] **195. `iconos-baltra`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit baltra (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B241 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B241
- [ ] **196. `fx-maura`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de maura (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B025…B446 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B025, B163, B164, B165, B446
- [ ] **197. `iconos-maura`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit maura (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B254 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B254
- [ ] **198. `fx-dariel`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de dariel (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B015…B436 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B015, B129, B130, B131, B436
- [ ] **199. `iconos-dariel`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit dariel (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B245 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B245
- [ ] **200. `fx-orsa`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de orsa (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B034…B459 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B034, B190, B191, B192, B459
- [ ] **201. `iconos-orsa`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit orsa (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B054 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B054
- [ ] **202. `fx-tibor`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de tibor (6 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B043…B472 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B043, B217, B218, B219, B471, B472
- [ ] **203. `iconos-tibor`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit tibor (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B270 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B270
- [ ] **204. `fx-zahra`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de zahra (6 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B049…B481 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B049, B235, B236, B237, B480, B481
- [ ] **205. `iconos-zahra`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit zahra (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B275 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B275
- [ ] **206. `fx-renko`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de renko (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B036…B462 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B036, B196, B197, B198, B462
- [ ] **207. `iconos-renko`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit renko (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B263 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B263
- [ ] **208. `fx-sira`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de sira (6 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B039…B467 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B039, B205, B206, B207, B466, B467
- [ ] **209. `iconos-sira`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit sira (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B266 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B266
- [ ] **210. `fx-nano_gm`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de nano_gm (6 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B031…B454 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B031, B181, B182, B183, B453, B454
- [ ] **211. `iconos-nano_gm`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit nano_gm (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B259 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B259
- [ ] **212. `fx-facu_gm`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de facu_gm (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B017…B438 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B017, B135, B136, B137, B438
- [ ] **213. `iconos-facu_gm`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit facu_gm (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B247 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B247
- [ ] **214. `fx-aurelia`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de aurelia (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B008…B429 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B008, B108, B109, B110, B429
- [ ] **215. `iconos-aurelia`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit aurelia (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B239 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B239
- [ ] **216. `fx-khepri`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de khepri (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B022…B443 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B022, B154, B155, B156, B443
- [ ] **217. `iconos-khepri`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit khepri (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B252 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B252
- [ ] **218. `fx-velmira`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de velmira (6 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B044…B474 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B044, B220, B221, B222, B473, B474
- [ ] **219. `iconos-velmira`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit velmira (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B271 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B271
- [ ] **220. `fx-vhal`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de vhal (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B047…B477 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B047, B229, B230, B231, B477
- [ ] **221. `iconos-vhal`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit vhal (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B055 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B055
- [ ] **222. `fx-bront`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de bront (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B013…B434 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B013, B123, B124, B125, B434
- [ ] **223. `iconos-bront`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit bront (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B244 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B244
- [ ] **224. `fx-oriel`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de oriel (6 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B033…B458 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B033, B187, B188, B189, B457, B458
- [ ] **225. `iconos-oriel`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit oriel (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B261 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B261
- [ ] **226. `fx-saelis`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de saelis (6 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B037…B464 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B037, B199, B200, B201, B463, B464
- [ ] **227. `iconos-saelis`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit saelis (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B264 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B264
- [ ] **228. `fx-solciju`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de solciju (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B040…B468 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B040, B208, B209, B210, B468
- [ ] **229. `iconos-solciju`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit solciju (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B267 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B267
- [ ] **230. `fx-veyra`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de veyra (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B046…B476 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B046, B226, B227, B228, B476
- [ ] **231. `iconos-veyra`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit veyra (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B273 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B273
- [ ] **232. `fx-brakk`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de brakk (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B011…B432 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B011, B117, B118, B119, B432
- [ ] **233. `iconos-brakk`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit brakk (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B242 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B242
- [ ] **234. `fx-morveth`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de morveth (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B026…B447 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B026, B166, B167, B168, B447
- [ ] **235. `iconos-morveth`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit morveth (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B255 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B255
- [ ] **236. `fx-aelith`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de aelith (5 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B007…B428 (1 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B007, B105, B106, B107, B428
- [ ] **237. `iconos-aelith`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit aelith (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B238 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B238
- [ ] **238. `fx-ilkan_colossus`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Efectos de habilidad de ilkan_colossus (4 bloques: básico, habilidades, definitiva, pasiva). Hoy 100% procedurales (funcionan).
  - Evidencia: asset-blocks.json B147…B150 (0 P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md
  - Nota: Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).
  - Refs: bloques B147, B148, B149, B150
- [ ] **239. `iconos-generico`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit generico (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B482 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B482
- [ ] **240. `iconos-ilkan_colossus`** · icono · `bloqueado_decision` · `pintor_determinista` · 0 cr
  - Íconos 16×16 del kit ilkan_colossus (habilidades 1-3, definitiva; 1 bloque). Hoy motivo ASCII 12×12: legible en el HUD.
  - Evidencia: asset-blocks.json B051 BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)
  - Nota: Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).
  - Refs: bloques B051
- [ ] **241. `forma-b358-coloso-de-arena-forma-de`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Coloso de Arena (forma de la definitiva): golpe recibido y muerte/disolucion / Coloso de Arena: reposo de perfil y de espalda
  - Evidencia: asset-blocks.json B358 PENDIENTE (forma de ilkan, no del cuerpo base)
  - Refs: bloques B358
- [ ] **242. `forma-b359-forma-berrinche-de-myla`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Forma Berrinche de Myla: golpe recibido, muerte y definitiva
  - Evidencia: asset-blocks.json B359 PENDIENTE (forma de myla, no del cuerpo base)
  - Refs: bloques B359
- [ ] **243. `proy-b494-bone-arrow`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Proyectil "bone_arrow" (esqueletos arqueros del Nigromante)
  - Evidencia: asset-blocks.json B494 P2
  - Refs: bloques B494
- [ ] **244. `b525-aura-de-set-sombra-nocturn`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Aura de set "Sombra Nocturna" (Asesino · sangrado · desaparecer) / Aura de set "Convergencia Elemental" (Mago · fuego + hielo + rayo) / Aura de set "Bendición del Custodio" (Soporte · salvar a tiempo) / Aura de set "Marea Roja" (Berserker ·
  - Evidencia: asset-blocks.json B525 P2 PENDIENTE; arena hielo (5/10 del recorrido)
  - Refs: bloques B525
- [ ] **245. `forma-b605-lobo-espectral-de-la-caz`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Lobo espectral de la Cazadora: ciclo de carrera y mordida
  - Evidencia: asset-blocks.json B605 PENDIENTE (forma de cazadora, no del cuerpo base)
  - Refs: bloques B605
- [ ] **246. `forma-b606-libertador-a-caballo-gol`** · campeon · `en_curso` · `gpt_image_2_codice_limpio` · 20 cr
  - Libertador a caballo: golpe recibido y muerte montado
  - Evidencia: asset-blocks.json B606 EN_CORRECCION (forma de libertador, no del cuerpo base)
  - Refs: bloques B606
- [ ] **247. `forma-b607-encarnacion-del-abismo-c`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Encarnacion del Abismo (coloso de carne cosida): lanzar, golpe y muerte
  - Evidencia: asset-blocks.json B607 PENDIENTE (forma de nigromante, no del cuerpo base)
  - Refs: bloques B607
- [ ] **248. `forma-b608-golem-de-fuego-y-de-hiel`** · campeon · `pendiente` · `gpt_image_2_codice_limpio` · 20 cr
  - Gólem de fuego y de hielo: ataque de más de 1 cuadro
  - Evidencia: asset-blocks.json B608 PENDIENTE (forma de nigromante, no del cuerpo base)
  - Refs: bloques B608
- [ ] **249. `objeto-b276-brk-wall`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Objeto persistente "brk_wall" (brakk, tema siege) / Objeto persistente "brk_turret" (brakk, tema siege)
  - Evidencia: asset-blocks.json B276 P1
  - Refs: bloques B276
- [ ] **250. `objeto-b483-ael-echo`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Objeto persistente "ael_echo" (aelith, tema time) / Objeto persistente "ael_hour" (aelith, tema time) / Objeto persistente "as_cathedral" (aurelia, tema prism) / Objeto persistente "ex_toll" (baltra, tema bell)
  - Evidencia: asset-blocks.json B483 P2
  - Refs: bloques B483
- [ ] **251. `objeto-b484-steam`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Objeto persistente "steam" (brasa, tema steam) / Objeto persistente "as_keep" (bront, tema crystal) / Objeto persistente "as_wall" (bront, tema crystal) / Objeto persistente "ex_concert" (dariel, tema music)
  - Evidencia: asset-blocks.json B484 P2
  - Refs: bloques B484
- [ ] **252. `objeto-b485-chain`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Objeto persistente "chain" (eslabon, tema chain) / Objeto persistente "as_current" (facu_gm, tema tide) / Objeto persistente "as_ocean" (facu_gm, tema tide) / Objeto persistente "lantern" (farolero, tema lantern)
  - Evidencia: asset-blocks.json B485 P2
  - Refs: bloques B485
- [ ] **253. `objeto-b486-path`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Objeto persistente "path" (farolero, tema lantern) / Objeto persistente "anchor" (iria, tema thread) / Objeto persistente "triangle" (iria, tema thread) / Objeto persistente "as_eclipse" (khepri, tema scarab)
  - Evidencia: asset-blocks.json B486 P2
  - Refs: bloques B486
- [ ] **254. `objeto-b487-ex-thorns`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Objeto persistente "ex_thorns" (maura, tema thorn) / Objeto persistente "ex_bark" (maura, tema thorn) / Objeto persistente "ex_forest" (maura, tema thorn) / Objeto persistente "mor_mushroom" (morveth, tema plague)
  - Evidencia: asset-blocks.json B487 P2
  - Refs: bloques B487
- [ ] **255. `objeto-b488-mor-garden`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Objeto persistente "mor_garden" (morveth, tema plague) / Objeto persistente "alembic" (morwen, tema alchemy) / Objeto persistente "yogurt" (myla, motor B) / Objeto persistente "tantrum" (myla, motor B)
  - Evidencia: asset-blocks.json B488 P2
  - Refs: bloques B488
- [ ] **256. `objeto-b489-ex-reflection`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Objeto persistente "ex_reflection" (nahir, motor B) / Objeto persistente "ex_storm" (orsa, motor B) / Objeto persistente "ex_soil" (renko, motor B) / Objeto persistente "ex_mound" (renko, motor B)
  - Evidencia: asset-blocks.json B489 P2
  - Refs: bloques B489
- [ ] **257. `objeto-b490-ex-faults`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Objeto persistente "ex_faults" (renko, motor B) / Objeto persistente "ex_atlas" (sira, motor B) / Objeto persistente "sol_cask" (solciju, motor B) / Objeto persistente "sol_reserve" (solciju, motor B)
  - Evidencia: asset-blocks.json B490 P2
  - Refs: bloques B490
- [ ] **258. `objeto-b491-sol-lees`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Objeto persistente "sol_lees" (solciju, motor B) / Objeto persistente "ex_swarm" (tibor, motor B) / Objeto persistente "ex_line" (vesper, motor B) / Objeto persistente "ex_stitch" (vesper, motor B)
  - Evidencia: asset-blocks.json B491 P2
  - Refs: bloques B491
- [ ] **259. `objeto-b492-stroganoff`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Objeto persistente "stroganoff" (ynara, motor B) / Objeto persistente "watercurtain" (ynara, motor B) / Objeto persistente "patience" (ynara, motor B) / Objeto persistente "ex_line" (zahra, motor B)
  - Evidencia: asset-blocks.json B492 P2
  - Refs: bloques B492
- [ ] **260. `objeto-b493-ex-vent`** · efecto · `pendiente` · `pintor_determinista` · 0 cr
  - Objeto persistente "ex_vent" (zahra, motor B)
  - Evidencia: asset-blocks.json B493 P2
  - Refs: bloques B493
- [ ] **261. `b542-prop-de-decorado-coral-v-a`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Prop de decorado "coral+v" (acuatica, canvas 44×40) / Prop de decorado "shipwreck" (acuatica, canvas 150×80) / Prop de decorado "sunkTemple" (acuatica, canvas 340×230) / Prop de decorado "angelStatue" (divina, canvas 40×70)
  - Evidencia: asset-blocks.json B542 P2 PENDIENTE; arena acuatica (6/10 del recorrido)
  - Nota: Ya instalados y NO repetir: infPentagram (infernal_centro), minoChamber (laberinto_centro), sunkTemple (acuatica_centro). Las filas prox_centro_* de estado-runway repiten ritualCircle/frozenLake.
  - Refs: bloques B542
- [ ] **262. `enemigo-ab_acechador`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Acechador del Borde (ab_acechador, subelite, arena abismo): falta arte propio de attack
  - Evidencia: enemy-coverage.json: attack=real+clon(caminar), death=real, hit=real; ATLAS_ARTE=FALTA_ANIMACION; arena 8/10 (abismo); altura 2.45× el campeón típico
  - Refs: bloques B592
- [ ] **263. `enemigo-ab_carcelero`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - El Carcelero del Vacío (ab_carcelero, subjefe, arena abismo): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 8/10 (abismo); altura 2.47× el campeón típico
- [ ] **264. `enemigo-ab_morador`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - El Que Mora Debajo (ab_morador, jefe, arena abismo): falta arte propio de attack y death
  - Evidencia: enemy-coverage.json: attack=real+clon(caminar), death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 8/10 (abismo); altura 1.37× el campeón típico
  - Refs: bloques B056
- [ ] **265. `enemigo-ab_tentaculo`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Tentáculo del Abismo (ab_tentaculo, subelite, arena abismo): falta arte propio de attack y death
  - Evidencia: enemy-coverage.json: attack=real+clon(caminar), death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 8/10 (abismo); altura 3.67× el campeón típico
- [ ] **266. `b305-ab-sb-02-pieza-de-cadena-e`** · arena · `pendiente` · `gen4_image` · 32 cr
  - AB-SB-02 Pieza de cadena (eslabón, tramo, cadena rota, gancho) / AB-BO-04 Siluetas gigantes para el fondo de la fase 3 (cuerpo, tentáculos lejanos) / AB-FX-01 Derrumbe de plataforma (polvo y piedras que caen, 8 frames) / AB-FX-02 Reconstruc
  - Evidencia: asset-blocks.json B305 P1 PENDIENTE; arena abismo (8/10 del recorrido)
  - Refs: bloques B305
- [ ] **267. `b306-ab-pr-01-orbe-del-heraldo`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - AB-PR-01 Orbe del Heraldo (vuelo 6, estallido 6) a 64 px
  - Evidencia: asset-blocks.json B306 P1 PENDIENTE; arena abismo (8/10 del recorrido)
  - Refs: bloques B306
- [ ] **268. `b321-ab-ui-01-icono-rescatar-ma`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - AB-UI-01 Ícono RESCATAR (manos) 64 px, 2 estados
  - Evidencia: asset-blocks.json B321 P1 PENDIENTE; arena abismo (8/10 del recorrido)
  - Refs: bloques B321
- [ ] **269. `b536-ab-fx-03-caida-al-vacio-es`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - AB-FX-03 Caída al vacío (estela violeta hacia abajo, 6 frames) / AB-FX-04 Rescate (destello de manos que suben, 6 frames) / AB-TG-01 Runa de derrumbe (borde de plataforma que se agrieta en rojo, loop 6) / AB-TG-02 Aviso de mandíbula (anillo
  - Evidencia: asset-blocks.json B536 P2 PENDIENTE; arena abismo (8/10 del recorrido)
  - Refs: bloques B536
- [ ] **270. `b537-ab-pr-02-fragmento-del-jef`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - AB-PR-02 Fragmento del jefe (caída 4, impacto 4)
  - Evidencia: asset-blocks.json B537 P2 PENDIENTE; arena abismo (8/10 del recorrido)
  - Refs: bloques B537
- [ ] **271. `b544-incrustacion-de-suelo-inla`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Incrustación de suelo "inlay-hielo" (64×40, 3 variantes) / Incrustación de suelo "inlay-acuatica" (64×40, 3 variantes) / Incrustación de suelo "inlay-laberinto" (64×40, 3 variantes) / Incrustación de suelo "inlay-abismo" (64×40, 3 variantes
  - Evidencia: asset-blocks.json B544 P2 PENDIENTE; arena abismo (8/10 del recorrido)
  - Refs: bloques B544
- [ ] **272. `b547-suelo-tile-de-la-arena-div`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Suelo/tile de la arena "divina" / Suelo/tile de la arena "acuatica" / Textura del Abismo "tex_carne" (PALETA_EXCESIVA) / Textura del Abismo "tex_tentaculo" (PALETA_EXCESIVA)
  - Evidencia: asset-blocks.json B547 P2 PENDIENTE; arena abismo (8/10 del recorrido)
  - Nota: Suelo divina (prox_piso_divina lo repite). tex_carne/tex_tentaculo del Abismo: PALETA_EXCESIVA.
  - Refs: bloques B547
- [ ] **273. `b548-ab-ui-02-iconos-de-minimap`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - AB-UI-02 Íconos de minimapa (portal, ancla, jefe) 16 px
  - Evidencia: asset-blocks.json B548 P2 PENDIENTE; arena abismo (8/10 del recorrido)
  - Refs: bloques B548
- [ ] **274. `enemigo-mn_cerbero`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - Cerbero (mn_cerbero, jefe, arena minas): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 9/10 (minas); altura 2.74× el campeón típico
- [ ] **275. `enemigo-mn_titan`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - Titán de Piedra (mn_titan, subjefe, arena minas): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 9/10 (minas); altura 3.07× el campeón típico
- [ ] **276. `arena-ciudad-casa_b-rechazada`** · arena · `bloqueado_decision` · `gen4_image` · 8 cr
  - Ciudad Maldita: cabaña casa_b (rechazada: salió isométrica).
  - Evidencia: estado-runway.json casa_b = rechazado
  - Nota: NO repetir con el mismo prompt. Si hace falta otra casa: «front-on oblique view, no isometric» con casa_a como @ref.
  - Refs: runway casa_b
- [ ] **277. `otro-saldo-runway`** · otro · `bloqueado_decision` · `humano` · 0 cr
  - Saldo de créditos de Runway (cuenta compartida): comprobar con `node tools/art-world/runway-world.js status`; regla de la rutina: no gastar con saldo < 250.
  - Evidencia: estado-runway.json saldo_runway = bloqueado; saldo no verificado en esta sesión (no medido)
  - Refs: runway saldo_runway
- [ ] **278. `skins-estados-parcial`** · skin · `pendiente` · `gpt_image_2_codice_limpio` · costo no estimado
  - Skins de set y formas de Ascensión con estados repetidos (ataque/lanzar = mismo cuadro): 95 de 104 skins medidas en FALTA_ANIMACION/ARTE_VIEJO.
  - Evidencia: ATLAS_ARTE skins: asc/FALTA_ANIMACION 22, croma/ARTE_VIEJO 2, croma/CODEX_OK 1, croma/FALTA_ANIMACION 45, set/ARTE_VIEJO 3, set/CODEX_OK 8, set/FALTA_ANIMACION 23
- [ ] **279. `b065-portal-infernal-cruce-dest`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - MN-A03 Portal Infernal · cruce (destello al atravesar) / MN-A04 Puerta del Umbral · cerrada / quebrándose / abierta / MN-A06 Lanzallamas de Cerbero · cono / MN-A07 Brasero · encendido / parpadeo / apagado
  - Evidencia: asset-blocks.json B065 P0 PENDIENTE; arena minas (9/10 del recorrido)
  - Refs: bloques B065
- [ ] **280. `b066-farol-parpadeo`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - MN-A08 Farol · parpadeo
  - Evidencia: asset-blocks.json B066 P0 PENDIENTE; arena minas (9/10 del recorrido)
  - Refs: bloques B066
- [ ] **281. `b312-antorcha-personal-del-guar`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - MN-B04 Antorcha personal del guardián / MN-B05 Jaula del montacargas + cable / MN-B06 Escombros del Titán / MN-B09 Retrato de Cerbero para carteles
  - Evidencia: asset-blocks.json B312 P1 PENDIENTE; arena minas (9/10 del recorrido)
  - Refs: bloques B312
- [ ] **282. `b313-carteles-de-sector`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - MN-B10 Carteles de sector
  - Evidencia: asset-blocks.json B313 P1 PENDIENTE; arena minas (9/10 del recorrido)
  - Refs: bloques B313
- [ ] **283. `b330-iconos-del-hud-de-luz`** · ui · `pendiente` · `pintor_determinista` · 0 cr
  - MN-B08 Íconos del HUD de luz
  - Evidencia: asset-blocks.json B330 P1 PENDIENTE; arena minas (9/10 del recorrido)
  - Refs: bloques B330
- [ ] **284. `b519-retrato-del-codice-de-mina`** · ui · `pendiente` · `gen4_image` · 32 cr
  - Retrato del Códice de Minas "titan" (JPG 192×208) / Retrato del Códice de Minas "titan_full" (JPG 314×286) / Retrato del Códice de Minas "cerbero" (JPG 420×357) / Retrato del Códice de Minas "devoraluz" (JPG 192×319)
  - Evidencia: asset-blocks.json B519 P2 PENDIENTE; arena minas (9/10 del recorrido)
  - Refs: bloques B519
- [ ] **285. `b520-retrato-del-codice-de-mina`** · ui · `pendiente` · `gen4_image` · 32 cr
  - Retrato del Códice de Minas "devoraluz_full" (JPG 252×320) / Retrato del Códice de Minas "esclavo" (JPG 222×198) / Retrato del Códice de Minas "insecto" (JPG 222×194) / Retrato del Códice de Minas "acechador" (JPG 222×190)
  - Evidencia: asset-blocks.json B520 P2 PENDIENTE; arena minas (9/10 del recorrido)
  - Refs: bloques B520
- [ ] **286. `b521-retrato-del-codice-de-mina`** · ui · `pendiente` · `gen4_image` · 24 cr
  - Retrato del Códice de Minas "minero" (JPG 222×205) / Retrato del Códice de Minas "escupidor" (JPG 222×253) / Retrato del Códice de Minas "consumidor" (JPG 222×270)
  - Evidencia: asset-blocks.json B521 P2 PENDIENTE; arena minas (9/10 del recorrido)
  - Refs: bloques B521
- [ ] **287. `b545-incrustacion-de-suelo-inla`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Incrustación de suelo "inlay-minas" (64×40, 3 variantes) / Incrustación de suelo "inlay-infernal" (64×40, 3 variantes) / Incrustación de suelo "inlay-divina" (64×40, 3 variantes) / Incrustación de suelo "inlay-coliseo" (64×40, 3 variantes)
  - Evidencia: asset-blocks.json B545 P2 PENDIENTE; arena minas (9/10 del recorrido)
  - Refs: bloques B545
- [ ] **288. `enemigo-demonio_mayor`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - Demonio Mayor (demonio_mayor, jefe, arena infernal): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=CODEX_OK; arena 10/10 (infernal); altura 2.33× el campeón típico
  - Refs: bloques B077
- [ ] **289. `enemigo-foco_convergencia`** · enemigo · `pendiente` · `gen4_image` · 5 cr
  - Foco de Convergencia (foco_convergencia, subelite, arena infernal): falta arte propio de attack y death
  - Evidencia: enemy-coverage.json: attack=real+clon(caminar), death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 10/10 (infernal); altura 7.27× el campeón típico
  - Refs: bloques B286 · también foco_hielo, lev_tentaculo, nucleo_micelial
- [ ] **290. `enemigo-golem_cuerpos`** · jefe · `pendiente` · `gen4_image` · 5 cr
  - Golem de Cuerpos (golem_cuerpos, jefe, arena infernal): falta arte propio de death
  - Evidencia: enemy-coverage.json: attack=real, death=real+clon(caminar), hit=real+clon(caminar); ATLAS_ARTE=FALTA_ANIMACION; arena 10/10 (infernal); altura 2.82× el campeón típico
- [ ] **291. `b314-prop-de-decorado-infcolumn`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Prop de decorado "infColumn+v" (infernal, canvas 30×70) / Prop de decorado "infAltar" (infernal, canvas 64×44) / Prop de decorado "infStatue" (infernal, canvas 34×62) / Prop de decorado "infBrazier" (infernal, canvas 18×26)
  - Evidencia: asset-blocks.json B314 P1 PENDIENTE; arena infernal (10/10 del recorrido)
  - Refs: bloques B314
- [ ] **292. `b315-prop-de-decorado-inffissur`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Prop de decorado "infFissure+v" (infernal, canvas 150×60) / Prop de decorado "icePillar+v" (hielo, canvas 30×80) / Prop de decorado "iceCluster+v" (hielo, canvas 44×36) / Prop de decorado "iceArch" (hielo, canvas 110×80)
  - Evidencia: asset-blocks.json B315 P1 PENDIENTE; arena infernal (10/10 del recorrido)
  - Refs: bloques B315
- [ ] **293. `b319-prop-de-decorado-sandrippl`** · arena · `pendiente` · `gen4_image` · 16 cr
  - Prop de decorado "sandRipples+v" (laberinto, canvas 130×60) / Prop de decorado "infSpike+v" (infernal, canvas 30×64)
  - Evidencia: asset-blocks.json B319 P1 PENDIENTE; arena infernal (10/10 del recorrido)
  - Refs: bloques B319
- [ ] **294. `b320-suelo-tile-de-la-arena-bos`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Suelo/tile de la arena "bosque" / Suelo/tile de la arena "hielo" / Suelo/tile de la arena "laberinto" / Suelo/tile de la arena "infernal"
  - Evidencia: asset-blocks.json B320 P1 PENDIENTE; arena infernal (10/10 del recorrido)
  - Nota: bosque y hielo: pendientes (prox_piso_bosque/prox_piso_hielo lo repiten). laberinto e infernal YA tienen piso pintado (laberinto_piso, infernal_piso): no regenerar.
  - Refs: bloques B320
- [ ] **295. `b364-focos-de-convergencia-4-id`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - A-05 Focos de Convergencia ×4 (idle 6 + quiebre 8; 4 colores)
  - Evidencia: asset-blocks.json B364 P1 PENDIENTE; arena infernal (10/10 del recorrido)
  - Refs: bloques B364
- [ ] **296. `b540-prop-de-decorado-infpentag`** · arena · `pendiente` · `gen4_image` · 32 cr
  - Prop de decorado "infPentagram" (infernal, canvas 280×200) / Prop de decorado "scorch+v" (varias, canvas 90×50) / Prop de decorado "frozenLake" (hielo, canvas 300×200) / Prop de decorado "ritualCircle" (bosque, canvas 300×210)
  - Evidencia: asset-blocks.json B540 P2 PENDIENTE; arena infernal (10/10 del recorrido)
  - Nota: Ya instalados y NO repetir: infPentagram (infernal_centro), minoChamber (laberinto_centro), sunkTemple (acuatica_centro). Las filas prox_centro_* de estado-runway repiten ritualCircle/frozenLake.
  - Refs: bloques B540
- [ ] **297. `b611-fisura-de-la-horda-abrir-6`** · arena · `pendiente` · `pintor_determinista` · 0 cr
  - A-15 Fisura de la Horda (abrir 6, 3 etapas ×4, sellada) y sigilos HORDA/VIDA/PIEL
  - Evidencia: asset-blocks.json B611 P2 PENDIENTE; arena infernal (10/10 del recorrido)
  - Refs: bloques B611

<details><summary>Hechos (40): no repetir</summary>

- [x] `b554-icono-ui-16-16-enlace-emoj` — Ícono UI 16×16 "enlace" (emoji 🔗) / Ícono UI 16×16 "cadena" (emoji ⛓ 🕸) / Ícono UI 16×16 "chispa" (emoji 🌸 ✨) / Ícono UI 16×16 "estrella" (emoji ★)
- [x] `b555-icono-ui-16-16-murcielago` — Ícono UI 16×16 "murcielago" (emoji 🦇) / Ícono UI 16×16 "orbe" (emoji 🔮) / Ícono UI 16×16 "carrito" (emoji 🛒) / Ícono UI 16×16 "pechera" (emoji 🎽)
- [x] `b556-icono-ui-16-16-vapor-emoji` — Ícono UI 16×16 "vapor" (emoji ♨) / Ícono UI 16×16 "intercambio" (emoji 🤝)
- [x] `b635-brasa-calderera-de-las-pro` — Brasa, Calderera de las Profundidades: skin original en PR #148
- [x] `b636-skin-nueva-1-concepto-a-de` — Skin nueva #1 (concepto a definir con el dueño): el campeón tiene 1 skins de diseño propio y el objetivo es 2
- [x] `b643-skin-nueva-1-concepto-a-de` — Skin nueva #1 (concepto a definir con el dueño): el campeón tiene 1 skins de diseño propio y el objetivo es 2
- [x] `campeon-nano_gm` — Campeón nano_gm (Nano GM, el Regente del Umbral): todos los estados propios (sin faltantes medidos)
- [x] `campeon-veyra` — Campeón veyra (Veyra, la Última Herida): todos los estados propios (sin faltantes medidos)
- [x] `enemigo-ab_errante` — Errante del Vacío (ab_errante, normal, arena abismo)
- [x] `enemigo-ab_heraldo` — Heraldo del Ojo (ab_heraldo, subelite, arena abismo)
- [x] `enemigo-ab_tejedor` — Tejedor del Vacío (ab_tejedor, subelite, arena abismo)
- [x] `enemigo-ab_devorador` — Devorador de Piedra (ab_devorador, elite, arena abismo)
- [x] `enemigo-ab_jinete` — Jinete Sin Cabeza (ab_jinete, elite, arena abismo)
- [x] `arena-abismo_piso` — Losas violeta con runas azules para el piso del Abismo. — NOTA: Rechazado: no hay faltante real (el Abismo ya tiene piso); no repetir el prompt.
- [x] `lamina-codex-existentes` — Las 43 láminas del Códice existentes (PNG+WEBP).
- [x] `enemigo-mn_esclavo` — Esclavo Enlazado (mn_esclavo, normal, arena minas)
- [x] `enemigo-mn_insecto` — Insecto de Cristal (mn_insecto, normal, arena minas)
- [x] `enemigo-mn_acechador` — Acechador Ciego (mn_acechador, subelite, arena minas)
- [x] `enemigo-mn_escupidor` — Escupidor de Oscuridad (mn_escupidor, subelite, arena minas)
- [x] `enemigo-mn_consumidor` — Consumidor Luminoso (mn_consumidor, elite, arena minas)
- [x] `enemigo-mn_devoraluz` — Devoraluz (mn_devoraluz, elite, arena minas)
- [x] `enemigo-mn_minero` — Minero Corrompido (mn_minero, elite, arena minas)
- [x] `otro-regla_animacion_hojas_enemigos` — Regla medida: rehacer o animar con hojas Runway enemigos que ya tienen atlas.
- [x] `otro-regla_campeon_cuerpo_imagenes_sueltas` — Regla medida: cuerpos de campeón por imágenes sueltas gen4_image para poses de acción/suelo.
- [x] `otro-hud-marcos-arcano` — Anillo fino y anillo de definitiva grises (arcano_ring, arcano_ult) para los marcos de botones por héroe (43 héroes, color por héroe).
- [x] `otro-referencias-codex-limpias` — Recortes @codex sin texto (43 láminas) y refs de pose usadas como entrada de Runway (codex-clean.py, pose-ref.py).
- [x] `arte-battlefield-retratos` — Retratos/hojas de campo de batalla (32 archivos en assets/sprites/battlefield, todos cargados por el motor).
- [x] `arte-portadas-arena` — Portadas de arena existentes (assets/ui/codex/arenas/*.png, 11 arenas, 1440×630).
- [x] `arte-piso-bosque-turbo-rechazado` — Piso de Bosque con gen4_image_turbo (piso_t1, 2 créditos): rejilla regular con vigas y rombos copiada de la referencia; no es un piso de piedras irreg — NOTA: Rechazado: NO repetir. El piso de Bosque se hace por b320-suelo-bosque (gen4_image con referencia solo-textura).
- [x] `skins-cromas-recolor` — Cromas de catálogo (recolor determinista del cuerpo base): 48. — NOTA: Los cromas son recolor (0 cr): no se piden a Runway.
- [x] `enemigo-esqueleto` — Esqueleto (esqueleto, normal, arena infernal)
- [x] `enemigo-zombie` — Zombi (zombie, normal, arena infernal)
- [x] `enemigo-demonio_menor` — Demonio Menor (demonio_menor, subelite, arena infernal) — NOTA: Ya se pagaron 15 cr en hojas de esta criatura: no regenerar sin causa registrada.
- [x] `enemigo-esqueleto_h` — Esqueleto Cornudo (esqueleto_h, subelite, arena infernal)
- [x] `enemigo-demonio_mago` — Demonio Hechicero (demonio_mago, elite, arena infernal)
- [x] `enemigo-golem` — Gólem (golem, elite, arena infernal)
- [x] `enemigo-hechicero_supremo` — Hechicero Supremo (hechicero_supremo, subjefe, arena infernal)
- [x] `enemigo-angel_corrompido` — Ángel Corrompido (angel_corrompido, jefe, arena infernal)
- [x] `arena-infernal_centro` — Pentagrama ritual de Infernal (266x190).
- [x] `arena-infernal_piso` — Piso de obsidiana agrietada con vetas de lava de Infernal.

</details>

## DUPLICADOS (NO regenerar)

Arte que figura más de una vez en los documentos (el mismo asset en otro bloque o fila, o un agregado de seguimiento) o que ya existe en el juego. El ítem canónico es el que lleva el trabajo; estos no se dibujan.

| id | duplicado de | bloques / runway | qué NO hay que regenerar |
|---|---|---|---|
| `dup-b070-cm-campanero` | `enemigo-cm_campanero` | B070 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b080-cm-perro` | `enemigo-cm_perro` | B080 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b084-cm-acechante` | `enemigo-cm_acechante` | B084 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-runway-prox_fachadas_ciudad_t06` | `arena-ciudad-edificios-t06` | prox_fachadas_ciudad_t06 | Mismo trabajo que arena-ciudad-edificios-t06: se hace UNA vez (el ítem canónico lleva el costo). |
| `dup-runway-prox_hojas_fortaleza` | `enemigo-carcelero` | prox_hojas_fortaleza | Obsoleta: las tres criaturas ya tienen arte propio instalado; no gastar 24 cr. |
| `dup-b331-automata` | `enemigo-automata` | B331 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b333-cm-verdugo` | `enemigo-cm_verdugo` | B333 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b342-verdugo` | `enemigo-verdugo` | B342 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b344-caballero` | `enemigo-caballero` | B344 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b346-engendro` | `enemigo-engendro` | B346 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b573-carcelero` | `enemigo-carcelero` | B573 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b574-cm-espectro` | `enemigo-cm_espectro` | B574 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b575-cm-espejismo` | `enemigo-cm_espejismo` | B575 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b576-cm-saqueador` | `enemigo-cm_saqueador` | B576 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b577-cm-sectario` | `enemigo-cm_sectario` | B577 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b580-dragon-bronce` | `enemigo-dragon_bronce` | B580 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b589-prisionero` | `enemigo-prisionero` | B589 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b596-arana` | `enemigo-arana` | B596 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b597-cm-planidera` | `enemigo-cm_planidera` | B597 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b598-cm-raptor` | `enemigo-cm_raptor` | B598 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-s001-fx` | `fx-tanque` | S001 | Es el MISMO arte que fx-tanque: no dibujar dos veces. |
| `dup-s002-iconos` | `iconos-tanque` | S002 | Es el MISMO arte que iconos-tanque: no dibujar dos veces. |
| `dup-s003-fx` | `fx-guerrero` | S003 | Es el MISMO arte que fx-guerrero: no dibujar dos veces. |
| `dup-s005-fx` | `fx-mago` | S005 | Es el MISMO arte que fx-mago: no dibujar dos veces. |
| `dup-s006-iconos` | `iconos-mago` | S006 | Es el MISMO arte que iconos-mago: no dibujar dos veces. |
| `dup-s007-fx` | `fx-soporte` | S007 | Es el MISMO arte que fx-soporte: no dibujar dos veces. |
| `dup-s008-iconos` | `iconos-soporte` | S008 | Es el MISMO arte que iconos-soporte: no dibujar dos veces. |
| `dup-s017-fx` | `fx-cazadora` | S017 | Es el MISMO arte que fx-cazadora: no dibujar dos veces. |
| `dup-s018-iconos` | `iconos-cazadora` | S018 | Es el MISMO arte que iconos-cazadora: no dibujar dos veces. |
| `dup-s021-fx` | `fx-libertador` | S021 | Es el MISMO arte que fx-libertador: no dibujar dos veces. |
| `dup-s025-fx` | `fx-ynara` | S025 | Es el MISMO arte que fx-ynara: no dibujar dos veces. |
| `dup-s027-fx` | `fx-myla` | S027 | Es el MISMO arte que fx-myla: no dibujar dos veces. |
| `dup-b068-ro-01-insignias-de-rol` | `b067-cofre-del-final-de-arena-7` | B068 | RO-01 ya está en B067: no dibujar dos veces. |
| `dup-b071-dama-bosque` | `enemigo-dama_bosque` | B071 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b073-esfinge` | `enemigo-esfinge` | B073 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b076-tiburon-blanco` | `enemigo-tiburon_blanco` | B076 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b078-jinete-sin-cabeza` | `enemigo-jinete_sin_cabeza` | B078 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b079-cangrejo-acorazado` | `enemigo-cangrejo_acorazado` | B079 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b081-medusa-electrica` | `enemigo-medusa_electrica` | B081 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b082-sirena-abisal` | `enemigo-sirena_abisal` | B082 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b083-tiburon-joven` | `enemigo-tiburon_joven` | B083 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-runway-prox_props_bosque` | `b317-prop-de-decorado-ancienttr` | prox_props_bosque | Mismo trabajo que b317-prop-de-decorado-ancienttr: se hace UNA vez (el ítem canónico lleva el costo). |
| `dup-runway-prox_props_laberinto` | `b318-prop-de-decorado-roots-v-b` | prox_props_laberinto | Mismo trabajo que b318-prop-de-decorado-roots-v-b: se hace UNA vez (el ítem canónico lleva el costo). |
| `dup-b332-chaman` | `enemigo-chaman` | B332 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b334-cu-sith` | `enemigo-cu_sith` | B334 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b335-demonio-hielo-fuego` | `enemigo-demonio_hielo_fuego` | B335 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b336-dragon-hielo` | `enemigo-dragon_hielo` | B336 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b337-druida-arena` | `enemigo-druida_arena` | B337 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b338-ent` | `enemigo-ent` | B338 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b343-angel-caido-hielo` | `enemigo-angel_caido_hielo` | B343 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b345-mago-hielo-cristal` | `enemigo-mago_hielo_cristal` | B345 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b348-escorpion-gigante` | `enemigo-escorpion_gigante` | B348 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b350-hada-escarcha` | `enemigo-hada_escarcha` | B350 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b352-doblador-arquera` | `enemigo-doblador_arquera` | B352 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b353-doblador-clerigo` | `enemigo-doblador_clerigo` | B353 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b354-doblador-guerrero` | `enemigo-doblador_guerrero` | B354 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b355-doblador-picaro` | `enemigo-doblador_picaro` | B355 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b356-guardian-laberinto` | `enemigo-guardian_laberinto` | B356 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b568-angel-hielo` | `enemigo-angel_hielo` | B568 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b569-dragoncito-hielo` | `enemigo-dragoncito_hielo` | B569 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b570-guardian-ancestral` | `enemigo-guardian_ancestral` | B570 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b572-anguila-electrica` | `enemigo-anguila_electrica` | B572 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b578-cristal-servo` | `enemigo-cristal_servo` | B578 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b579-cristal-volador` | `enemigo-cristal_volador` | B579 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b581-duende-bosque` | `enemigo-duende_bosque` | B581 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b583-golem-cristal` | `enemigo-golem_cristal` | B583 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b584-golem-hielo` | `enemigo-golem_hielo` | B584 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b585-infectado` | `enemigo-infectado` | B585 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b595-acechador` | `enemigo-acechador` | B595 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b600-medusa` | `enemigo-medusa` | B600 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b603-peregrino` | `enemigo-peregrino` | B603 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-s004-iconos` | `iconos-guerrero` | S004 | Es el MISMO arte que iconos-guerrero: no dibujar dos veces. |
| `dup-s009-fx` | `fx-segador` | S009 | Es el MISMO arte que fx-segador: no dibujar dos veces. |
| `dup-s010-iconos` | `iconos-segador` | S010 | Es el MISMO arte que iconos-segador: no dibujar dos veces. |
| `dup-s011-fx` | `fx-axiom` | S011 | Es el MISMO arte que fx-axiom: no dibujar dos veces. |
| `dup-s012-iconos` | `iconos-axiom` | S012 | Es el MISMO arte que iconos-axiom: no dibujar dos veces. |
| `dup-s013-fx` | `fx-profeta` | S013 | Es el MISMO arte que fx-profeta: no dibujar dos veces. |
| `dup-s014-iconos` | `iconos-profeta` | S014 | Es el MISMO arte que iconos-profeta: no dibujar dos veces. |
| `dup-s015-fx` | `fx-musashi` | S015 | Es el MISMO arte que fx-musashi: no dibujar dos veces. |
| `dup-s016-iconos` | `iconos-musashi` | S016 | Es el MISMO arte que iconos-musashi: no dibujar dos veces. |
| `dup-s019-fx` | `fx-nigromante` | S019 | Es el MISMO arte que fx-nigromante: no dibujar dos veces. |
| `dup-s020-iconos` | `iconos-nigromante` | S020 | Es el MISMO arte que iconos-nigromante: no dibujar dos veces. |
| `dup-s022-iconos` | `iconos-libertador` | S022 | Es el MISMO arte que iconos-libertador: no dibujar dos veces. |
| `dup-s023-fx` | `fx-ilkan` | S023 | Es el MISMO arte que fx-ilkan: no dibujar dos veces. |
| `dup-s024-iconos` | `iconos-ilkan` | S024 | Es el MISMO arte que iconos-ilkan: no dibujar dos veces. |
| `dup-s026-iconos` | `iconos-ynara` | S026 | Es el MISMO arte que iconos-ynara: no dibujar dos veces. |
| `dup-s028-iconos` | `iconos-myla` | S028 | Es el MISMO arte que iconos-myla: no dibujar dos veces. |
| `dup-s029-fx` | `fx-brasa` | S029 | Es el MISMO arte que fx-brasa: no dibujar dos veces. |
| `dup-s030-iconos` | `iconos-brasa` | S030 | Es el MISMO arte que iconos-brasa: no dibujar dos veces. |
| `dup-s031-fx` | `fx-eslabon` | S031 | Es el MISMO arte que fx-eslabon: no dibujar dos veces. |
| `dup-s032-iconos` | `iconos-eslabon` | S032 | Es el MISMO arte que iconos-eslabon: no dibujar dos veces. |
| `dup-s033-fx` | `fx-morwen` | S033 | Es el MISMO arte que fx-morwen: no dibujar dos veces. |
| `dup-s034-iconos` | `iconos-morwen` | S034 | Es el MISMO arte que iconos-morwen: no dibujar dos veces. |
| `dup-s035-fx` | `fx-farolero` | S035 | Es el MISMO arte que fx-farolero: no dibujar dos veces. |
| `dup-s036-iconos` | `iconos-farolero` | S036 | Es el MISMO arte que iconos-farolero: no dibujar dos veces. |
| `dup-s037-fx` | `fx-iria` | S037 | Es el MISMO arte que fx-iria: no dibujar dos veces. |
| `dup-s038-iconos` | `iconos-iria` | S038 | Es el MISMO arte que iconos-iria: no dibujar dos veces. |
| `dup-s039-fx` | `fx-vesper` | S039 | Es el MISMO arte que fx-vesper: no dibujar dos veces. |
| `dup-s040-iconos` | `iconos-vesper` | S040 | Es el MISMO arte que iconos-vesper: no dibujar dos veces. |
| `dup-s041-fx` | `fx-nahir` | S041 | Es el MISMO arte que fx-nahir: no dibujar dos veces. |
| `dup-s042-iconos` | `iconos-nahir` | S042 | Es el MISMO arte que iconos-nahir: no dibujar dos veces. |
| `dup-s043-fx` | `fx-baltra` | S043 | Es el MISMO arte que fx-baltra: no dibujar dos veces. |
| `dup-s044-iconos` | `iconos-baltra` | S044 | Es el MISMO arte que iconos-baltra: no dibujar dos veces. |
| `dup-s045-fx` | `fx-maura` | S045 | Es el MISMO arte que fx-maura: no dibujar dos veces. |
| `dup-s046-iconos` | `iconos-maura` | S046 | Es el MISMO arte que iconos-maura: no dibujar dos veces. |
| `dup-s047-fx` | `fx-dariel` | S047 | Es el MISMO arte que fx-dariel: no dibujar dos veces. |
| `dup-s048-iconos` | `iconos-dariel` | S048 | Es el MISMO arte que iconos-dariel: no dibujar dos veces. |
| `dup-s049-fx` | `fx-orsa` | S049 | Es el MISMO arte que fx-orsa: no dibujar dos veces. |
| `dup-s050-iconos` | `iconos-orsa` | S050 | Es el MISMO arte que iconos-orsa: no dibujar dos veces. |
| `dup-s051-fx` | `fx-tibor` | S051 | Es el MISMO arte que fx-tibor: no dibujar dos veces. |
| `dup-s052-iconos` | `iconos-tibor` | S052 | Es el MISMO arte que iconos-tibor: no dibujar dos veces. |
| `dup-s053-fx` | `fx-zahra` | S053 | Es el MISMO arte que fx-zahra: no dibujar dos veces. |
| `dup-s054-iconos` | `iconos-zahra` | S054 | Es el MISMO arte que iconos-zahra: no dibujar dos veces. |
| `dup-s055-fx` | `fx-renko` | S055 | Es el MISMO arte que fx-renko: no dibujar dos veces. |
| `dup-s056-iconos` | `iconos-renko` | S056 | Es el MISMO arte que iconos-renko: no dibujar dos veces. |
| `dup-s057-fx` | `fx-sira` | S057 | Es el MISMO arte que fx-sira: no dibujar dos veces. |
| `dup-s058-iconos` | `iconos-sira` | S058 | Es el MISMO arte que iconos-sira: no dibujar dos veces. |
| `dup-s059-fx` | `fx-nano_gm` | S059 | Es el MISMO arte que fx-nano_gm: no dibujar dos veces. |
| `dup-s060-iconos` | `iconos-nano_gm` | S060 | Es el MISMO arte que iconos-nano_gm: no dibujar dos veces. |
| `dup-s061-fx` | `fx-facu_gm` | S061 | Es el MISMO arte que fx-facu_gm: no dibujar dos veces. |
| `dup-s062-iconos` | `iconos-facu_gm` | S062 | Es el MISMO arte que iconos-facu_gm: no dibujar dos veces. |
| `dup-s063-fx` | `fx-aurelia` | S063 | Es el MISMO arte que fx-aurelia: no dibujar dos veces. |
| `dup-s064-iconos` | `iconos-aurelia` | S064 | Es el MISMO arte que iconos-aurelia: no dibujar dos veces. |
| `dup-s065-fx` | `fx-khepri` | S065 | Es el MISMO arte que fx-khepri: no dibujar dos veces. |
| `dup-s066-iconos` | `iconos-khepri` | S066 | Es el MISMO arte que iconos-khepri: no dibujar dos veces. |
| `dup-s067-fx` | `fx-velmira` | S067 | Es el MISMO arte que fx-velmira: no dibujar dos veces. |
| `dup-s068-iconos` | `iconos-velmira` | S068 | Es el MISMO arte que iconos-velmira: no dibujar dos veces. |
| `dup-b069-ab-jinete` | `enemigo-ab_jinete` | B069 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-s069-fx` | `fx-vhal` | S069 | Es el MISMO arte que fx-vhal: no dibujar dos veces. |
| `dup-s070-iconos` | `iconos-vhal` | S070 | Es el MISMO arte que iconos-vhal: no dibujar dos veces. |
| `dup-s071-fx` | `fx-bront` | S071 | Es el MISMO arte que fx-bront: no dibujar dos veces. |
| `dup-b072-demonio-mago` | `enemigo-demonio_mago` | B072 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-s072-iconos` | `iconos-bront` | S072 | Es el MISMO arte que iconos-bront: no dibujar dos veces. |
| `dup-s073-fx` | `fx-oriel` | S073 | Es el MISMO arte que fx-oriel: no dibujar dos veces. |
| `dup-b074-golem` | `enemigo-golem` | B074 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-s074-iconos` | `iconos-oriel` | S074 | Es el MISMO arte que iconos-oriel: no dibujar dos veces. |
| `dup-b075-mn-devoraluz` | `enemigo-mn_devoraluz` | B075 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-s075-fx` | `fx-saelis` | S075 | Es el MISMO arte que fx-saelis: no dibujar dos veces. |
| `dup-s076-iconos` | `iconos-saelis` | S076 | Es el MISMO arte que iconos-saelis: no dibujar dos veces. |
| `dup-s077-fx` | `fx-solciju` | S077 | Es el MISMO arte que fx-solciju: no dibujar dos veces. |
| `dup-s078-iconos` | `iconos-solciju` | S078 | Es el MISMO arte que iconos-solciju: no dibujar dos veces. |
| `dup-s079-fx` | `fx-veyra` | S079 | Es el MISMO arte que fx-veyra: no dibujar dos veces. |
| `dup-s080-iconos` | `iconos-veyra` | S080 | Es el MISMO arte que iconos-veyra: no dibujar dos veces. |
| `dup-s081-fx` | `fx-brakk` | S081 | Es el MISMO arte que fx-brakk: no dibujar dos veces. |
| `dup-s082-iconos` | `iconos-brakk` | S082 | Es el MISMO arte que iconos-brakk: no dibujar dos veces. |
| `dup-s083-fx` | `fx-morveth` | S083 | Es el MISMO arte que fx-morveth: no dibujar dos veces. |
| `dup-s084-iconos` | `iconos-morveth` | S084 | Es el MISMO arte que iconos-morveth: no dibujar dos veces. |
| `dup-b085-demonio-menor` | `enemigo-demonio_menor` | B085 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-s085-fx` | `fx-aelith` | S085 | Es el MISMO arte que fx-aelith: no dibujar dos veces. |
| `dup-s086-iconos` | `iconos-aelith` | S086 | Es el MISMO arte que iconos-aelith: no dibujar dos veces. |
| `dup-b089-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B089 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b090-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B090 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b091-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B091 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b092-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B092 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b093-portada-de-arena-abism` | `arte-portadas-arena` | B093 | La portada ya existe; rehacerla a píxel nativo es una decisión del dueño (abrir ítem nuevo), no una falta. |
| `dup-b094-portada-de-arena-ciuda` | `arte-portadas-arena` | B094 | La portada ya existe; rehacerla a píxel nativo es una decisión del dueño (abrir ítem nuevo), no una falta. |
| `dup-b095-portada-de-arena-infer` | `arte-portadas-arena` | B095 | La portada ya existe; rehacerla a píxel nativo es una decisión del dueño (abrir ítem nuevo), no una falta. |
| `dup-b096-portada-de-arena-minas` | `arte-portadas-arena` | B096 | La portada ya existe; rehacerla a píxel nativo es una decisión del dueño (abrir ítem nuevo), no una falta. |
| `dup-runway-prox_centro_bosque` | `b540-prop-de-decorado-infpentag` | prox_centro_bosque | Mismo trabajo que b540-prop-de-decorado-infpentag: se hace UNA vez (el ítem canónico lleva el costo). |
| `dup-runway-prox_centro_hielo` | `b540-prop-de-decorado-infpentag` | prox_centro_hielo | Mismo trabajo que b540-prop-de-decorado-infpentag: se hace UNA vez (el ítem canónico lleva el costo). |
| `dup-runway-prox_piso_bosque` | `b320-suelo-tile-de-la-arena-bos` | prox_piso_bosque | Mismo trabajo que b320-suelo-tile-de-la-arena-bos: se hace UNA vez (el ítem canónico lleva el costo). |
| `dup-runway-prox_piso_divina` | `b547-suelo-tile-de-la-arena-div` | prox_piso_divina | Mismo trabajo que b547-suelo-tile-de-la-arena-div: se hace UNA vez (el ítem canónico lleva el costo). |
| `dup-runway-prox_piso_hielo` | `b320-suelo-tile-de-la-arena-bos` | prox_piso_hielo | Mismo trabajo que b320-suelo-tile-de-la-arena-bos: se hace UNA vez (el ítem canónico lleva el costo). |
| `dup-runway-prox_props_hielo` | `b315-prop-de-decorado-inffissur` | prox_props_hielo | Mismo trabajo que b315-prop-de-decorado-inffissur: se hace UNA vez (el ítem canónico lleva el costo). |
| `dup-runway-prox_props_infernal` | `b314-prop-de-decorado-infcolumn` | prox_props_infernal | Mismo trabajo que b314-prop-de-decorado-infcolumn: se hace UNA vez (el ítem canónico lleva el costo). |
| `dup-b340-mn-consumidor` | `enemigo-mn_consumidor` | B340 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b341-mn-minero` | `enemigo-mn_minero` | B341 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b373-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B373 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b374-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B374 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b375-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B375 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b376-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B376 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b377-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B377 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b378-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B378 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b379-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B379 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b380-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B380 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b381-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B381 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b382-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B382 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b383-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B383 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b384-retrato-hoja-de-campo` | `arte-battlefield-retratos` | B384 | El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar. |
| `dup-b385-portada-de-arena-acuat` | `arte-portadas-arena` | B385 | La portada ya existe; rehacerla a píxel nativo es una decisión del dueño (abrir ítem nuevo), no una falta. |
| `dup-b386-portada-de-arena-bosqu` | `arte-portadas-arena` | B386 | La portada ya existe; rehacerla a píxel nativo es una decisión del dueño (abrir ítem nuevo), no una falta. |
| `dup-b387-portada-de-arena-divin` | `arte-portadas-arena` | B387 | La portada ya existe; rehacerla a píxel nativo es una decisión del dueño (abrir ítem nuevo), no una falta. |
| `dup-b388-portada-de-arena-fabri` | `arte-portadas-arena` | B388 | La portada ya existe; rehacerla a píxel nativo es una decisión del dueño (abrir ítem nuevo), no una falta. |
| `dup-b389-portada-de-arena-gelid` | `arte-portadas-arena` | B389 | La portada ya existe; rehacerla a píxel nativo es una decisión del dueño (abrir ítem nuevo), no una falta. |
| `dup-b390-portada-de-arena-laber` | `arte-portadas-arena` | B390 | La portada ya existe; rehacerla a píxel nativo es una decisión del dueño (abrir ítem nuevo), no una falta. |
| `dup-b391-portada-de-arena-reino` | `arte-portadas-arena` | B391 | La portada ya existe; rehacerla a píxel nativo es una decisión del dueño (abrir ítem nuevo), no una falta. |
| `dup-b567-ab-devorador` | `enemigo-ab_devorador` | B567 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b571-ab-errante` | `enemigo-ab_errante` | B571 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b582-esqueleto` | `enemigo-esqueleto` | B582 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b587-mn-esclavo` | `enemigo-mn_esclavo` | B587 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b588-mn-insecto` | `enemigo-mn_insecto` | B588 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b591-zombie` | `enemigo-zombie` | B591 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b593-ab-heraldo` | `enemigo-ab_heraldo` | B593 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b594-ab-tejedor` | `enemigo-ab_tejedor` | B594 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b599-esqueleto-h` | `enemigo-esqueleto_h` | B599 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b601-mn-acechador` | `enemigo-mn_acechador` | B601 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b602-mn-escupidor` | `enemigo-mn_escupidor` | B602 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
| `dup-b604-hechicero-supremo` | `enemigo-hechicero_supremo` | B604 | El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar. |
