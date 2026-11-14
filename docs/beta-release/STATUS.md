# STATUS (2026-11-06, sesión 1, continúa por tarea programada horaria)
- H0 Fase Cero: hecha. main = ef415626.
- Entregado en la rama de trabajo (sin PR, sin evaluación independiente): casas de Ciudad Maldita; alcance de la beta (`BETA_PUBLIC=1`); ranking por ronda personal + orden ronda→puntaje→tiempo (archivo y Postgres real); Brasas solo cosméticos (`PIECES_FOR_BRASAS=false`, doc `docs/economy/BRASAS_SOLO_COSMETICOS.md`).
- PR: #271 parche empujado a su rama; #261 merge con main empujado a su rama; #263 evaluado. Ninguno fusionado a main (falta revisión independiente + CI remoto).
- Créditos Runway: saldo 935; gastados 80 en esta sesión (10 imágenes). Arenas con arte nuevo (candidatas, sin evaluación independiente): Ciudad Maldita (casas), Fábrica Sin Fin, Laberinto, Infernal y Acuática (suelos).
- Pase de batalla listo en backend y cliente (R10/R11, falta arte/precio final) y ranking personal también en el camino persistente. Pendiente: arte de Minas/Abismo/Fúngico/Ruinas/Gélida y campeones, pila PR (#263→#265→#236), builds nativas, QA E2E, roster verificado.
- Automatización real: tarea programada trig_01GuPc2QF4Wuu5XdX7NFKJjb (cada hora, minuto 23, en esta sesión).

- Ejecución 09:23 UTC: #265 evaluado (extracción) y compra segura incorporada; #236 evaluado e incorporado (fix verificado: falla sin él, pasa con él); #241 devuelto con defectos. Disposiciones finales (MERGEADO_Y_VERIFICADO etc.): **0 de 24** — ningún PR se cierra sin revisión independiente y CI remoto.

## Actualización 2026-11-06 (tarde)
- Cuerpos del Códice integrados (candidatos, sin revisión independiente): Guerrero, Tanque, Mago, **Aelith, Morveth** (cromas recoloreando el cuerpo nuevo, sin tocar gates) y atlas más fieles de **Saelis, Aurelia, Maura, Ynara** (#259). Myla excluida (hash aprobado en `check-myla-death`). Capturas en `evidence/guardianes/`.
- Brecha abierta: Libertador (sin PR con cuerpo fiel), Coloso de Ilkan (procedural).

## Actualización 2026-11-06 (noche)
- Integrados además: **Coloso de Ilkan** (espíritu de arena pintado), **Libertador** completo (a pie, combate, caballo, caída; revisión independiente con condiciones atendidas), **Myla** (maestro #259, croma y caída), **Profeta** (repintada), y **#90** (Ilsa/Vorn/Kora, TESTING). Auditoría visual de los 43: el resto está a ≈80 % o más del Códice.
- Saldo Runway: **238 créditos** (por debajo del umbral de 250 de la tarea programada: las ejecuciones programadas NO deben gastar hasta que el propietario cargue más). Gasto de la jornada ≈ 500 créditos, todos registrados en `ART_CREDITS.md` (incluye ≈ 100 en intentos fallidos `BAD_OUTPUT`, que se cobran).

### Ejecución programada 15:18 UTC
- Saldo Runway 238 (<250): no se gastó. Regla de economía reverificada sobre la rama (`PIECES_FOR_BRASAS=false`): `server/test-wallet.js` 65/65, `test-wallet-pieces.js` 35/35, `tools/items/t_piezas_brasas.js` y `t_skins_brasas.js` PASS.

### Idiomas ES · EN · PT (nuevo)
- Selector en pantalla de título, botón en el hub y lista en Opciones; persistencia + `?lang=`. Traductor en caliente (`js/i18n/i18n.js`), diccionarios generados (`tools/i18n/build.py`), CI `i18n.yml` (prueba funcional + cobertura ≥97 % en EN y PT sobre un recorrido de 1.205 textos de interfaz: EN 100 %, PT ≈99 %).
- **Pendiente (Fase 2)**: talentos, Códice/lore de jefes y enemigos, historia, misiones, bendiciones, textos de servidor y páginas legales siguen en español (fallback). Detalle en `docs/i18n/README.md`.

### Estado al 2026-11-07 (ejecución programada 02:23 UTC)
- Evaluaciones independientes de diseño: 71 → 75 → **76/100** (objetivo 85). Informes: `EVALUACION_DISENO*.md`, `UX_EQUIPO_*.md`.
- Hecho: idiomas ES/EN/PT con diccionarios de ~11.9k entradas; título rediseñado (5 héroes vs. jefe de hielo, CTA apilado, fondo de toda La Horda); pausa/opciones/hub simplificados sin quitar opciones.
- Bloqueo real: `compare-icons` fija «43 campeones, 301 íconos»; la rama tiene 46 (Ilsa, Vorn, Kora de #90). Actualizar ese número del gate requiere aprobación humana.
- Sin merge a `main`: falta puntaje ≥85, CI verde y decisión del propietario. Runway sigue <250 créditos: sin gasto.

### Ejecución programada 20:23 UTC (2026-11-10)
- PR #288 fusionada en `main` (eb0d0578) con revisión independiente (QA, arquitectura, integrador; reservas en `reviews/`). Rama de trabajo rehecha desde `main`.
- Flake `t_identity` BOS corregido en la prueba (causa dentro del test: `bossStrikes` pendientes; no se vio bug de juego; 10/10 corridas locales, sin log archivado); queda la firma INF y falta nombrar el emisor del golpe. Runway sin gasto (saldo <250).

### Ronda 2026-11-11 (autorizada por el dueño)
- Códice a WebP (−79 MB), paquete de escritorio sin PNG con gemelo WebP (210 → 152 MB), recorrido de tienda/Códice sin 404 (`desktop/test-stage.mjs`).
- i18n lote 376 (botones de compra con Brasas por patrón y restos visibles).
- **Pack de bienvenida sin campeones** (decisión del dueño): `brasas_bienvenida_v2` = 500 + 400 Brasas por US$ 6,99, solo apariencias; el pack original queda `retired` (no se vende; los pagos pendientes se acreditan y quien ya lo compró conserva sus 3 elecciones). `server/test-wallet.js` 67/67.
- **Guardado en la nube**: si `accountApplyCloud` falla al aplicar, ya no adelanta la versión: conserva lo local, marca `acct.needPull` y reintenta con espera creciente (`tools/regression/t_save_resilience.js` [G]).
- Runway: `creditBalance` = 2 (no alcanza para generar; 1 imagen = 8). Sin gasto.

- i18n lote 377 (2026-11-11): tooltips de talentos con «Sinergias» (cabeza «Nombre — descripción» + líneas de sinergia, formas «cada punto da» y «por punto en A, B y C») por patrones recursivos + 16 nombres de talentos; prueba en `tools/i18n/test-i18n.js`. Quedan nombres de piezas generadas y claves internas de enemigos sin traducir.

### Paquete de instrucciones de Runway (2026-11-12)
- `docs/art-brief/runway-pack/`: README con el prompt maestro, `RECETA.md` (método con referencias @codex/@pose, criterio de aceptación, reducción determinista, gates), `POSES_CAMPEON.md` (36 poses y movimiento), `ENEMIGOS_GUIA.md`, 46 fichas de campeón con sus 36 prompts, 104 criaturas en 12 arenas con 9 estados cada una, los 731 bloques / 1.244 items de la cola con descripción, método y prompt, y `COSTOS.md` (≈ 959 imágenes: ≈ 7.700 créditos si todo sale a la primera, ≈ 19.000 con reintentos razonables; saldo actual 2).
- Generado por `python3 tools/art/build-runway-pack.py` desde `node tools/art/dump-game-data.js`; cobertura y sincronía verificadas por `python3 tools/art/test-runway-pack.py` (CI: `art-production-evidence.yml`). Nuevo `tools/art/pose-ref.py` recorta el cuadro actual de un atlas como `@pose`.
- NO verificado: que Runway devuelva cada pose con la calidad pedida (hay descartes registrados); el paquete ordena el método y el gasto, no garantiza el resultado.
- **Mergeado en `main` (PR #296, a27c48b7)** con revisión independiente sellada a 878f57ed y 15/15 checks en verde. Unificación del 2026-11-12: cada enemigo/jefe sin atlas propio tiene un «Paso 0» (diseño con Runway, `tools/art-world/runway-design.js`) y la cadena `gen_sheet` → `install` → `walk_batch`; ilsa, kora y vorn tienen Paso 0 para crear su lámina del Códice; sin tope de créditos por decisión del dueño (2026-11-12). Costos recalculados (8 cr/imagen, 5 cr/hoja de enemigo; ×2,5 es supuesto). Saldo de Runway al 2026-11-12: 0–2 créditos: no se generó nada.

### Primer ciclo real de dibujo con Runway (2026-11-12, saldo 950 → 710)
- **Alcance de lo medido:** `gen4_image`, un campeón (Tanque) y 4 enemigos. Muestra chica: lo de abajo son hipótesis a confirmar, no reglas.
- **Campeón (Tanque):** 13 intentos en total (5 con imagen y recibo: f24_a1, f24_a2, f24_a5, f27, f12; 8 sin imagen: BAD_OUTPUT en f24_a3, f24_a4, f25, f26, f32–f35). El diseño se conserva con el recorte limpio de la lámina (`tools/art/codex-clean.py`); en los 2 cuadros que salieron para otras poses (12, 27) devolvió un personaje de pie. f24_a5 quedó aceptada **solo como diseño**; ningún cuadro se instaló.
- **Enemigos (tiburon_joven, cm_acechante, demonio_menor, esfinge):** 8 hojas, 0 aprobadas (caminatas casi idénticas, muertes fundidas o con cristales ajenos, orientación mezclada). Nada instalado; los atlas actuales no cambiaron. demonio_menor v3 es rescatable con un `spec` manual sin gastar más.
- **Créditos:** con recibo hay 5 imágenes de 8 (40) y 8 hojas de 5 (40) = 80 documentados; el saldo bajó 240. Los ~160 restantes son fallos BAD_OUTPUT que se habrían cobrado y/o consumo ajeno de la cuenta compartida: **no se pueden separar con los datos disponibles**. Detalle por task id en `docs/beta-release/ART_CREDITS.md`.
- Pendiente de decidir (del dueño): si se sigue gastando con este método o se cambia el enfoque (p. ej. probar otro modelo/entrada, o poses por pintor determinista); no hay evidencia suficiente para descartar Runway del todo.

### Runway: video, registro y bloqueo diario (2026-11-12, tarde)
- **#298 mergeada** (a main 352d09eb): recorte limpio de la lámina (`tools/art/codex-clean.py`) y resultados medidos.
- **Piloto de video (Tanque):** conversor `tools/art/video-to-atlas.py` + 11 clips de 2 s (gen4_turbo, 10 créditos c/u). El diseño se conserva, pero el atlas candidato queda por debajo del actual (poses rígidas, definitiva igual a lanzar; la muerte se arrodilla y se tiende, pero el último cuadro mide solo 23 px) y falla el `roster_gate`: **no se instaló**. Capturas antes/después en `art-source/captures/tanque/`. Con una sola muestra de campeón.
- **Registro único** de trabajo con Runway: `docs/art-brief/runway-pack/REGISTRO_RUNWAY.md` (+ `estado-runway.json`, `tools/art/runway-ledger.py`) y checklist de campeones `CHECKLIST_CAMPEONES.md`. `runway-world.js list` no es fiable (marca «pendiente» 12 de 17 trabajos ya hechos): manda el registro. Listos hoy: 0 de 5 campeones.
- **Bloqueo:** Runway rechaza todo con «daily task limit reached» (tope diario de la cuenta compartida; saldo ~295; entre 530 y 295 el saldo bajó ~235 sin generaciones nuestras: consumo ajeno, no atribuible). Pisos y centros de Bosque y Hielo preparados (JOBS, referencias, capturas «antes») y sin generar. Reintento: recordatorio de la sesión para las 00:30 UTC del 2026-11-13 (no está en el repo).
- `docs/steam/DECLARACION_IA.md` actualizado con los recuentos reales (159 recibos, 12 clips de video sin instalar).

### Mergeado: PRs #298 y #299 (2026-11-12) — estado de Runway para la próxima sesión
- `main` = 2e51ebdb. Registro único de trabajo con Runway en `docs/art-brief/runway-pack/REGISTRO_RUNWAY.md` y checklist de campeones `CHECKLIST_CAMPEONES.md`: **leerlos antes de generar nada** (evitan repetir trabajo; `runway-world.js list` no es fiable).
- Pendiente de generar (bloqueado por el límite diario de tareas de la cuenta de Runway, saldo ~295): pisos y centros de Bosque y Hielo (JOBS ya definidos en `runway-world.js`, referencias y capturas «antes» en `art-source/`). Para los pisos falta escribir el script de reducción; para los centros, agregar bosque/hielo a `tools/art-world/build-centro-arena.py` y las claves `ritualCircle`/`frozenLake` a `DECAL_PAINTED`.
- Medido: imágenes sueltas y video de Runway no superan los atlas actuales de los campeones (Tanque) ni las hojas de enemigos probadas; sí rindieron pisos, centros y fachadas de arenas.
- `docs/steam/DECLARACION_IA.md` ya tiene los recuentos reales (159 recibos de Runway); el dueño debe confirmar el resto.

### Ynara y gpt_image_2 (2026-11-12, noche)
- **Ynara: lanzar y definitiva propios instalados** (atlas 384×1056, cuadros 36–43 hechos con `gpt_image_2`; `js/assets/ynara-meta.js` y `imageSize` de Crystal Wars actualizados). Antes eran copias del ataque. Capturas antes/después en `art-source/captures/ynara/`. Gates: roster_gate 0 fallos; style_gate no aplica (celda de 96); aprobación de arte humana pendiente. Skins de Ynara conservan cast/ultimate = ataque (no se rehicieron).
- **Corrige la conclusión anterior:** el límite era `gen4_image`/video, no Runway. Con `gpt_image_2` en hoja de 4 poses el Tanque dio 4 poses de lanzar distintas (candidato, sin integrar) donde `gen4_image` daba una pose de pie. Muestra: 2 campeones; falta probar la muerte. Detalle en `ART_CREDITS.md` y `RECETA.md` §1.
- `docs/steam/DECLARACION_IA.md` ya declara `gpt_image_2` (9 generaciones, 168 recibos de Runway en total); **pendiente del dueño: confirmar los términos de uso comercial de ese modelo**.

### Cazadora y Musashi (2026-11-12, noche)
- **Definitiva propia instalada** en Cazadora y Musashi (`ultimate_*` → cuadros 52–55 de su atlas `codex-v1`; antes caían en el lanzar), con `gpt_image_2` (hojas de 4 poses). Aprobación de arte humana pendiente; `style_gate` no aplica (celdas 192×160). Musashi: proporciones algo más macizas y línea de 1 px bajo los pies; pies en la fila 113 (2 px sobre los cuadros viejos, fila 115). Muestra acumulada con `gpt_image_2`: 4 campeones, 6 hojas (5 aceptadas, 1 rechazada por escala).
- **Libertador sin cambios de arte:** su muerte ya existe y su definitiva/ataque frontal dependen de código (`js/champions/libertador.js`: `ult_cast` con prog=0; ataque por set `fire`), no de arte. Decisión del dueño pendiente.
- Preexistente (no de esta PR): `tools/vfx/musashi-afterimage-check.js` falla 9 checks también en `main`; `tools/lanes/test-sides.js` es intermitente (`Math.random`).

### Ilkan: ataques de frente y de espaldas (2026-11-12, local)
- **Instalados** `attack_down` (cuadros 64-67) y `attack_up` (68-71) en el atlas `codex-v1` de Ilkan, con `gpt_image_2` (2 hojas, 40 cr; saldo 99 -> 59). `drawIlkan` ya los despacha. Aprobacion de arte humana pendiente; `style_gate` no aplica. Gates y capturas en `ART_CREDITS.md` y `art-source/captures/ilkan/`.

### Libertador: definitiva generada, NO instalada (2026-11-12, local)
- Hoja de 4 poses de `ult_cast` aceptada (`gpt_image_2`, 20 cr; saldo 59 -> 39); candidato `art-source/libertador-runway/atlas.png` (824x882, cuadros 64-67). **Bloqueado por gates**: `tools/art/check-libertador-motion.js` y `check-libertador-death.js` fijan el sha256 del atlas v2 aprobado y fallan con el ampliado (probado y revertido). Decision del dueno: re-aprobar y actualizar el sha, o cargarla como paquete aparte. Captura: `art-source/captures/libertador/runway_ult_antes_despues.png`.

### Mergeado: PRs #300 y #301 (2026-11-12, noche) — campeones con gpt_image_2
- `main` = 88710d18. **Instalados** (aprobación de arte humana pendiente en todos): lanzar y definitiva de Ynara (#300); definitiva de Cazadora y de Musashi (#301). Candidato sin integrar: lanzar del Tanque (`art-source/runway-designs/tanque/g1`). Libertador: sin cambios de arte (su definitiva y su ataque de frente dependen de código: `js/champions/libertador.js`, `ult_cast` con prog=0; decisión del dueño pendiente).
- **Lista de comprobaciones derivadas del atlas** (la #300 falló dos veces por no correrlas): `js/modes/crystal-wars/atlas.js` (`imageSize` si el campeón tiene entrada), `node tools/visual-package/cli.js build --write` + `check` + `test.js`, `node tools/art/build-art-atlas.js` + `--check`, `tests/competitive-roster.test.js`, `tools/crystal-wars/test-competitive.js`, `tests/art-runtime-clips.test.js`, `tools/art/roster_gate.js`, `webp_convert.py --check`, y los `check-<campeón>-*` que haga grep de su nombre.
- **Pendiente de arte:** Ilkan (definitiva y ataques de frente/espaldas), Nigromante (definitiva), Tanque (integrar lanzar; probar muerte y definitiva con gpt_image_2), skins de Ynara (cast/ultimate = ataque), Libertador (requiere código). Saldo Runway ~125 (20 créditos por hoja de 4 poses; cuenta compartida: baja también por consumo ajeno).
- **Despacho de dibujo (2026-11-12, local):** Ilkan (`attack_down/up`), Libertador (`ult_cast` por progreso y `attack_down/up`) y Nigromante (pose `ult` durante la transformacion antes del Demonio) ya leen esos sets si existen; sin arte nuevo solo cambia Nigromante. Prueba `tools/art/test-champion-draw-dispatch.js`; arte que falta: Ilkan 2 hojas, Libertador 1 hoja, Nigromante ninguna. Detalle en ART_CREDITS.md.
- **Intermitencias del CI:** causas raíz y arreglos de `t_identity` BOS, `CARCELERO.cadenas…` y `test-sides` en `docs/beta-release/INTERMITENCIAS_CI.md` (medido antes/después). Pendiente: `LAB.los_bots_resuelven_en_orden` (flake nuevo, ~2/27) y cuelgues de `test-sides`. `tools/vfx/musashi-afterimage-check.js` falla porque exige `packKey` de estelas no integrado (entrega rechazada): decisión del dueño.
- **Entorno:** el disco del contenedor se llenó en esta sesión (capturas, worktrees y art-source); `art-source/runway-pose-refs/` y `art-source/runway-codex-clean/` son regenerables (ignorados por git).

### Mergeado: PR #302 (2026-11-13) y estado para la próxima sesión
- `main` = 64b189c3. Entró: checklist único de arte (`docs/art-brief/CHECKLIST_ARTE.md`, `python3 tools/art/art-checklist.py`), despachos de dibujo retrocompatibles (Ilkan y Libertador por dirección/progreso; **Nigromante muestra su pose propia `sets.ult` durante `nigroTransformTimer` antes del Demonio**), ataque de frente y de espaldas de Ilkan (cuadros 64–71, `gpt_image_2`) y pruebas del CI deterministas (`t_identity`, `t_abismo`/Carcelero, `test-sides`; ver `docs/beta-release/INTERMITENCIAS_CI.md`).
- **Decisiones/validaciones del dueño pendientes:** (1) validar con tus ojos la transición de Nigromante (único cambio visible sin arte nuevo; el Demonio ya no crece 0,78→1 en esa ventana); (2) Libertador: su definitiva de 4 cuadros está generada y aceptada (`art-source/libertador-runway/`) pero NO instalada porque `check-libertador-motion.js` y `check-libertador-death.js` fijan el sha256 del atlas aprobado: re-aprobar el atlas ampliado (actualizar el hash en esas dos pruebas) o cargarlo como paquete aparte; (3) aprobación de arte humana de todo lo instalado con gpt_image_2 (Ynara, Cazadora, Musashi, Ilkan) y términos comerciales de ese modelo para la declaración de IA de Steam; (4) `tools/vfx/musashi-afterimage-check.js` exige una función de una entrega rechazada: integrar `packKey` o retirar el check.
- **Runway:** saldo 37 (la cuenta es compartida y baja también por consumo ajeno). `gen4_image` 200/200 (tope móvil de 24 h, sin reiniciar al 2026-11-13 00:30 UTC); `gen4_image_turbo` cuesta 2 cr pero copia la composición de la referencia (piso de Bosque: rejilla, rechazado); `gpt_image_2` 20 cr por hoja de 4 poses. Pendiente de arte con créditos: pisos y centros de Bosque y Hielo (`runway-world.js`), definitiva y ataque de frente de Libertador (tras decidir), láminas de ilsa/kora/vorn, skins de Ynara. Detalle y costos en `CHECKLIST_ARTE.md`.
- **Intermitencias aún sin cerrar:** `LAB.los_bots_resuelven_en_orden` (t_identity, ~2/27 sin investigar) y cuelgues ocasionales de `test-sides` hasta el timeout.


### Ronda 2026-11-13 (mañana)
- **Nigromante, Plaga de los Condenados** (commit 1ffae190): marca visible del maldito (aro, calavera, pulso por tic), hilo de contagio y alma como orbe verde; solo dibujo, sin tocar balance. Captura: `art-source/captures/nigromante/plaga_antes_despues.png`. Sin revisión independiente ni merge todavía; el hilo y el orbe no se replican por red.
- **Nombre «La Horda»:** la búsqueda de Steam devuelve 0 resultados exactos; itch.io y App Store tampoco muestran un juego con ese título. No se pudieron consultar las bases de marcas (TMview/WIPO/EUIPO bloquean consultas automáticas): chequeo de marcas pendiente del dueño (clases 9 y 41).
- **Economía (verificada):** `PIECES_FOR_BRASAS=false`; `server/test-wallet-pieces.js` 35/35, `test-wallet.js` 67/67, `test-battlepass.js` PASS.
- **Runway:** saldo 37 créditos, por debajo del umbral de 250 de la rutina: no se generó nada.

### Aprobación del dueño (2026-11-13)
- El dueño aprobó a ojo el arte instalado con `gpt_image_2` (Ynara, Cazadora, Musashi, Ilkan y la transición del Nigromante) y pidió instalar la definitiva del Libertador (re-aprobación del atlas ampliado y del sha fijado en `check-libertador-motion/death`). Los términos comerciales de `gpt_image_2` para la declaración de IA de Steam siguen sin confirmar.
- Auditoría de diseño y monetización: `docs/beta-release/AUDITORIA_EQUIPO_DISENO.md`.

### Libertador y Musashi (2026-11-13, tarde)
- **Libertador:** definitiva de 4 cuadros instalada (atlas 824x882, cuadros 64-67). Re-aprobada por el dueño: sha fijado actualizado y `check-libertador-death.js` limita `ult_cast`/`ultimate` a exactamente 64-67 (el resto sigue `<61`). `check-libertador-motion` 261/261, `check-libertador-death` 127/127, checklists sincronizados, `test-runway-pack` 9945 OK. Captura: `art-source/captures/libertador/ult_instalada_antes_despues.png`. Multijugador y rendimiento no probados.
- **Musashi:** el check ya no falla: las estelas de Paso Fantasma guardan `packKey` (atlas del emisor) y el check deriva su línea base del árbol (commit 03c9c0d4; reemplaza la nota anterior de «packKey no integrado»). `musashi-afterimage-online.js` sigue con timeout (requiere relay real; no corre en CI).

### Primera sesión: fallos corregidos (2026-11-14)
- **`tools/alfa/q1_first_session.js` (21 PASS / 25 FAIL → 69 PASS / 0 FAIL, victoria de la Ciudad y primera recompensa incluidas):** la causa era la prueba desactualizada, no la UI. El paso de skin arranca sin carta marcada (principal «Seguir sin skin ›», «¡La quiero!» oculto hasta elegir) y tras el regalo aparece la historia `#first-story` («Empezar/Saltar la práctica») sobre el menú. La prueba ahora recorre ese flujo real, verifica la skin guardada y que ganar la Ciudad deje arena cumplida + recompensa; filtra el CORS a `fondalstudios.com/.../health` (ruido de `127.0.0.1`).
- **Solape real de 8 px (844×390):** barra sticky de confirmar sobre las cartas de skin. Arreglado en `css/onboarding.css` (arte 88 px, reseña a 2 renglones; ≤380 px de alto 72 px y 1 renglón). Nueva `tools/ux/test-starter-skin-layout.js` (en `run-all` y `qa-manifest`) mide 5 tamaños con/sin carta elegida. Captura: `art-source/captures/primera-sesion/solape_antes_despues.png` (generador `tools/ux/capture-starter-skin-overlap.js`).
- **`q4_econ.js` «Target crashed»:** no es de la GPU ni del `/dev/shm` (16 GB libres): la memoria de la página crece sin parar con los 12 guardianes (>9,6 GB a los ~100 s incluso con N=20) y el kernel la mata; con un solo guardián (`Q4_CHAMPS=tanque`) pico ~2,7 GB y termina. Es un defecto de la herramienta (acumula objetos entre guardianes en una sola evaluación); no se arregló la fuga. Alternativa usada: un proceso por guardián, N=400, 12/12 sin errores → `docs/alfa/q4_econ_2026-11-14.json`. Resultado: objetos por partida ≈12,5-13 en todas las arenas; muy raro o mejor por partida 1,85 (Ciudad) → 6,34 (Infernal); legendario o mejor 0,07 → 1,05; primera mejora en la partida 1 para los 12 guardianes (≈16-18 mejoras en las partidas 1-3); oro de la primera partida 1.858.
