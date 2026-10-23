# Arnés de pruebas y workflow `Integracion pruebas`

Estado: rama `claude/ci-pruebas-nuevas`. Nada de lo que sigue cambia el juego (`js/`, `css/`, `assets/`, `server/`): solo `tools/`, `.github/` y esta nota.

> **Antes de lanzar**: `node tools/quality/run-all.js` corre toda la batería con servidor propio y resume PASS/FAIL; el estado, las causas y lo que sigue rojo están en `docs/quality/ESTADO_DE_PRUEBAS.md`.

## Por qué

La auditoría técnica encontró que el CI no corría pruebas clave de lo integrado (`test-ult-forms`, `test-decal-legible` fuera de su filtro, `t_checkpoint`, `t_defeat_clear`, `t_shop_rotation`, `test-accessibility-prefs`, `test-sides`, `tools/identity/*`, `tools/items/*`), que el filtro `paths` no incluía `tools/vfx/**`, `tools/items/**`, `tools/regression/**` ni `tools/identity/**`, y que la mayoría de las pruebas con navegador asumen un servidor externo en un puerto fijo (8771, 8822, 8826, 8841, 8894, 8906, 8961...) y usan `page.goto` con 30 s fijos. Con el puerto ocupado por otra copia del repo el resultado es "connection refused" o, peor, se prueba **otro árbol** sin saberlo; con la máquina cargada, el `goto` agota los 30 s.

## Qué hay

| Archivo | Para qué |
|---|---|
| `tools/lib/serve.js` | Arnés: servidor estático propio en un **puerto libre** (verifica que `index.html` servido es el del disco), `H.launch()` (Chromium por `CHROMIUM_PATH`, `/opt/pw-browsers/chromium` o el de Playwright), `H.goto()` con reintentos, `H.waitFor()`, `H.timeout()`. |
| `tools/lib/with-site.js` | Corre **sin editarla** una prueba que ya acepta una URL por entorno (`SE_BASE_URL`, `BASE_URL`, `ABILITY_BASE_URL`) contra el servidor propio. Precarga `pw-tune.js`. |
| `tools/lib/pw-tune.js` | Preload de Node: las páginas de cualquier prueba con Playwright escalan sus tiempos, reintentan el `goto` y suben el tiempo de navegación por omisión de 30 s a 120 s. No cambia aserciones. |
| `tools/lib/test-serve.js` | Prueba del arnés sin navegador (15 comprobaciones: puertos libres distintos, árbol correcto, 404, Range, URL externa, escala de tiempos, reintento). |
| `tools/lib/classify-tests.js` | Inventario heurístico de pruebas con navegador y cómo consiguen su servidor (genera la lista del final). |
| `.github/actions/setup-playwright/action.yml` | Node 22 + Playwright 1.61.1 + Chromium (la misma receta que `champion-entry-balance.yml`) y `NODE_PATH`. |
| `.github/workflows/integracion-pruebas.yml` | Workflow nuevo, separado del principal. |

### Variables de entorno

- URL externa (uso manual; si está definida **no** se levanta nada y se comprueba que responde): `SE_BASE_URL`, `BASE_URL`, `ABILITY_BASE_URL` (según qué prueba). Ejemplo: `SE_BASE_URL=http://127.0.0.1:8771 node tools/items/t_codex_book.js`.
- `TEST_TIMEOUT_MS`: valor absoluto que reemplaza a las esperas largas (`goto`, `waitForFunction`, tiempo por omisión). `TEST_TIMEOUT_SCALE`: multiplicador (p. ej. `3` en un runner lento). `TEST_GOTO_RETRIES`: reintentos del `goto` (por omisión 2; reintenta solo timeouts y errores de red).
- `CHROMIUM_PATH`: ejecutable de Chromium. `WITH_SITE_TUNE=0` apaga el preload; `WITH_SITE_ENV=A,B` cambia qué variables recibe la URL.

### Pruebas migradas al arnés (nuevas de la integración)

`tools/vfx/test-ult-forms.js`, `tools/vfx/test-decal-legible.js`, `tools/regression/t_checkpoint.js`, `tools/regression/t_defeat_clear.js`, `tools/collection/t_shop_rotation.js`, `tools/ux/test-accessibility-prefs.js`, `tools/ux/test-skill-glyphs.js`, `tools/lanes/test-sides.js`, `tools/identity/t_identity.js`, `tools/identity/t_objectives.js`, `tools/items/t_codex_book.js`, `tools/items/t_starter_gift.js`, `tools/art/check-skill-icons.js`, `tools/bible/ability-gate.js` y `tools/art/t_pixrig_bosses.js` (esta última ya estaba en el workflow principal).

Cambios de comportamiento a tener en cuenta:

- Ya no existen `A11Y_PORT`, `GLYPH_PORT`, `ICON_CHECK_PORT`, `ABILITY_GATE_PORT` ni `PW_EXE` (puerto libre propio; Chromium con `CHROMIUM_PATH`). Para un servidor propio de usted use la URL por entorno.
- `ability-gate.js` sigue aceptando `ABILITY_BASE_URL` (y ahora `BASE_URL`). `tools/vfx/*` siguen aceptando `BASE_URL`/`ABILITY_BASE_URL`; las demás, `SE_BASE_URL`.
- `t_identity_net.js` (necesita relay) y el resto **no** se migraron: ver el inventario.
- El servidor del arnés está `unref`ado: si una prueba falla antes de cerrarlo no deja el proceso colgado (lo detecté con `test-ult-forms` en una corrida local bajo carga).

## Workflow `Integracion pruebas`

- Dispara en `pull_request` y `push` (`main`, `chatgpt/**`) con `paths`: `tools/vfx/**`, `tools/regression/**`, `tools/items/**`, `tools/identity/**`, `tools/lanes/**`, `tools/ux/**`, `tools/art/**`, `tools/collection/**`, `tools/lib/**`, `js/**`, `css/**`, `index.html` y el propio workflow/acción. También `workflow_dispatch`.
- Seis jobs sin `needs` entre sí (no hay `fail-fast` que cancele a otro) y, dentro de cada job, cada paso lleva `if: ${{ !cancelled() }}`: un paso rojo no oculta a los siguientes.
- `continue-on-error: true` **solo** en pruebas que fallan hoy en la base o son intermitentes, con el motivo en un comentario al lado del paso. Se corren igual y se informan; nada se omite ni se desactiva. Los demás pasos (lo nuevo) fallan en rojo de verdad.
- No incluye nada que necesite relay (`server/relay.js`) ni dispositivos, ni las pruebas con comparación ANTES/DESPUÉS (`t_func`, `t_camera`, `t_det`, `t_snapshot`).
- No duplica lo que ya corre en `champion-entry-balance.yml` (p. ej. `ability-gate`, `t_pixrig_bosses`, `t_run_end`, `test-ability-inspector`) ni en `vfx-readability.yml` (control negativo, `verify-mechanics`, `parity-skill-fx`, `test-vfx-b`).

**No pude ejecutar GitHub Actions desde acá** (no hay `act` ni `actionlint`). El YAML se validó con `python3 -c "import yaml"` y cada comando de cada paso se corrió localmente (tabla siguiente). Lo que el CI haga en un runner de 2 núcleos sin carga puede diferir.

### Resultado local por paso

Máquina compartida con carga promedio 55-90 sobre 4 núcleos (otras sesiones corriendo navegadores), así que los tiempos locales (minutos) no representan al runner y algunas pruebas pueden haber salido peor de lo que saldrán en CI. `OK` = pasó con código 0; `FALLA` = código 1 reproducible o con la falla indicada.

| Job | Paso | En el workflow | Resultado local |
|---|---|---|---|
| node-sin-navegador | test-serve | bloqueante | OK (15/15) |
| node-sin-navegador | t_codex_book_logic | bloqueante | OK |
| vfx-iconos | test-ult-forms | bloqueante | **solo parcial**: `ONLY=oriel,orsa,renko` OK; la corrida completa (dos páginas nuevas por definitiva) no terminó dentro de mi límite de 15 min, bajo carga ~70 |
| vfx-iconos | test-decal-legible | bloqueante | **solo parcial**: `ARENAS=bosque` OK; las seis arenas no terminaron en 15 min bajo carga (el README `quality-five/vfx-20261019` declara que pasan en CI) |
| vfx-iconos | check-skill-icons `--self-test` | bloqueante | OK |
| vfx-iconos | test-skill-glyphs | bloqueante | OK |
| regresion-ux-carriles | t_checkpoint, t_defeat_clear, t_juice, test-touch-targets, test-hub-legibility, test-arena-briefing-tutorial | bloqueantes | OK (una corrida cada una) |
| regresion-ux-carriles | test-accessibility-prefs | continue-on-error | 1ª corrida FALLA (`championShortName is not defined` en `shop-ui.js:97`, una sola vez), 2ª OK 32/32 |
| regresion-ux-carriles | test-sides | continue-on-error | 1ª FALLA (píxel de barra aliada, minion, Cristales 667x375), 2ª OK |
| regresion-ux-carriles | test-text-overflow | continue-on-error | OK una vez; intermitente según la auditoría |
| regresion-ux-carriles | test-tactical-panel | continue-on-error | FALLA (TimeoutError en `page.click('#pause-btn')`) |
| regresion-ux-carriles | t_hit_react | continue-on-error | FALLA (`CAM.*.hechicero_se_agacha_al_recibir_danio_y_vuelve`) |
| identidad | t_objectives, t_starter_gift, t_codex_book | bloqueantes | OK |
| identidad | t_identity | continue-on-error | FALLA (`TUT.empieza_con_moverse`, `TUT.moverse_atacar_habilidad_en_orden`) |
| items-economia-a | t_shop_rotation, t_boons, t_build_uniques, t_collision, t_endless, t_ground_loot, t_hechicero, t_hpbonus, t_nigromante, t_nigro_elements, t_pacing, t_perf_exploits, t_q4_economia, t_quests, t_reactions, t_roles, t_story | bloqueantes | OK (una corrida cada una) |
| items-economia-a | t_breakables | continue-on-error | 1ª FALLA (`BRK.bot_patea_cuando_la_horda_se_amontona`), 2ª OK |
| items-economia-b | t_abismo, t_camp, t_codex, t_cromas, t_crystals, t_difficulty (8 FAIL), t_evolution, t_itemization, t_items, t_nigro_golems, t_resonance, t_sets, t_synergies | continue-on-error | FALLAN, cada una con su motivo en el YAML. `t_itemization` y `t_nigro_golems` se reprodujeron también con un servidor `python3 -m http.server` (sin el arnés), así que no son un efecto del arnés |

Pruebas con arnés/`with-site` que probé y **dejé fuera** del workflow: `t_campaign` (no terminó dentro de mi límite de 15 min bajo carga), `t_drag_aim` (14 min bajo carga, pasó), `t_func`/`t_camera` (necesitan árboles ANTES/DESPUÉS: fallan con `.../undefined/index.html`, no son de este uso).

Criterio de bloqueante: pasó en todas las corridas locales que hice (entre 1 y 3). Con tan pocas corridas y una máquina tan cargada, una prueba bloqueante puede salir intermitente en CI; si pasa, la solución es marcarla `continue-on-error` con el motivo (no omitirla), y promover las intermitentes cuando acumulen corridas verdes.

## `t_pixrig_bosses.js`: 10 FAIL `dibuja_propio.cm_*`

Hallazgo: **en el `origin/main` actual no falla.** La prueba de la rama (con el arnés) dio `SUMMARY OK` en 6 corridas (90 PASS en la primera; cinco más lanzadas a la vez, bajo carga). Una séptima concurrente no llegó a correr por un defecto de mi arnés (el chequeo inicial del servidor usaba 5 s; ahora 15 s con reintentos). Además, la prueba **original sin tocar** (la de `origin/main`) contra un servidor `python3 -m http.server` limpio sobre este mismo árbol también dio `SUMMARY OK`.

Causa de los 10 FAIL reportados: el mismo diagnóstico ya documentado en el repo. El commit `c6a58569` ("Verify current boss artwork and strict Pixrig fallback after art unification", `docs/production/quality-five/vfx-20261019/README.md`, sección "Regresión de prueba heredada resuelta" y `boss-baseline-main.txt`) reescribió la prueba porque, tras la unificación de arte, `drawEnemyBody` da prioridad a las imágenes propias de battlefield (`BATTLEFIELD_IMAGES[t]`) y la versión anterior exigía exclusivamente el atlas Pixrig de respaldo (`used.includes(ENEMY_ATLAS_PACK[k].atlas)`). La salida que reportó la auditoría, `FAIL dibuja_propio.cm_presentador {"own":false,"n":2}`, es **literalmente la de esa versión anterior** (la actual imprime además `source`, `fallback` y `rejectsDonor`). Los diez fallos de ese baseline son de jefes con reemplazo battlefield (6 de `cm_*`, `ab_carcelero`, `mn_titan`, `mn_cerbero`, `golem_cuerpos`); no encontré relación con el Verdugo.

Conclusión: no hay bug del juego y no hacía falta actualizar la aserción; lo que la auditoría ejecutó fue una versión desactualizada de la prueba (o un servidor fijo en 8771 sirviendo otro árbol, que es precisamente el riesgo que el arnés elimina: ahora la prueba levanta su propio servidor y verifica el árbol). No pude ver el log del CI que falló; esta es la explicación que sostienen la evidencia del repo y las corridas locales. Si el CI sigue rojo en este paso con el árbol actual, hay que mirar su log, porque no se reproduce acá.

## Pendientes

- Migrar el resto de pruebas con puerto fijo (lista siguiente) en tandas, empezando por las que ya aceptan una URL por entorno (cubiertas hoy por `with-site.js` sin editar) y terminando por las que levantan su propio `python3` en un puerto escrito en el código y las que necesitan relay.
- `test-ult-forms` y `test-decal-legible` completas no se pudieron cerrar localmente; confirmar tiempos en el primer CI.
- Promover a bloqueantes las intermitentes cuando tengan corridas verdes; arreglar (en otra PR) las que fallan en la base.
- Branch protection: marcar `Integracion pruebas` como requerido en `main` si se quiere que bloquee merges.
- El filtro `paths` del workflow principal (`champion-entry-balance.yml`) sigue sin incluir `tools/vfx/**`, `tools/items/**`, `tools/regression/**`, `tools/identity/**`: no se tocó para no romperlo; este workflow cubre ese hueco.

## Inventario del resto (generado con `node tools/lib/classify-tests.js`)

Heurística por texto, no ejecuta nada: "prueba candidata" = `.js` de `tools/` con Playwright y nombre de prueba/chequeo/auditoría. El conteo difiere del "121 candidatas / 74 con puerto fijo" de la auditoría porque los criterios son otros (aquí: 140 candidatas, 115 con puerto escrito en el código). Orden de migración sugerido: (1) **PUERTO FIJO** con `SE_BASE_URL` etc.: ya funcionan con `tools/lib/with-site.js` y bastaría moverlas al arnés; (2) **PUERTO FIJO+SPAWN**: levantan su `python3 -m http.server` en un puerto escrito en el código; (3) las marcadas **Relay = sí**: necesitan `server/relay.js` y no corren en un runner sin él; (4) **SERVIDOR PROPIO** y **OTRO** revisar a mano.

Total: 140 pruebas candidatas. ARNES: 15, OTRO: 2, PUERTO FIJO: 79, PUERTO FIJO+SPAWN: 36, SERVIDOR PROPIO: 8. Con relay/WebSocket: 28.

### ARNES (15)

| Prueba | Puertos en el código | Variables de entorno | Relay |
|---|---|---|---|
| `tools/art/check-skill-icons.js` | - | - |  |
| `tools/art/t_pixrig_bosses.js` | - | - |  |
| `tools/bible/ability-gate.js` | - | - |  |
| `tools/collection/t_shop_rotation.js` | - | - |  |
| `tools/identity/t_identity.js` | - | - |  |
| `tools/identity/t_objectives.js` | - | - |  |
| `tools/items/t_codex_book.js` | - | - |  |
| `tools/items/t_starter_gift.js` | - | - |  |
| `tools/lanes/test-sides.js` | - | - |  |
| `tools/regression/t_checkpoint.js` | - | - |  |
| `tools/regression/t_defeat_clear.js` | - | - |  |
| `tools/ux/test-accessibility-prefs.js` | - | - |  |
| `tools/ux/test-skill-glyphs.js` | - | - |  |
| `tools/vfx/test-decal-legible.js` | - | - |  |
| `tools/vfx/test-ult-forms.js` | - | - |  |

### OTRO (2)

| Prueba | Puertos en el código | Variables de entorno | Relay |
|---|---|---|---|
| `tools/factory/audit-roster.js` | - | FACTORY_BASE_URL |  |
| `tools/regression/t_ilkan_parity.js` | - | - |  |

### PUERTO FIJO (79)

| Prueba | Puertos en el código | Variables de entorno | Relay |
|---|---|---|---|
| `tools/alpha/services-browser.js` | 8805 | SITE |  |
| `tools/alpha/training-test.js` | 8805 | SITE |  |
| `tools/art/necro-colossus-test.js` | 8771 | - |  |
| `tools/art/t_body_swaps.js` | 8771 | SE_BASE_URL |  |
| `tools/art/test-brasa-abyssal.js` | 8775 | SE_BASE_URL |  |
| `tools/ascension/functional.js` | 8806 | ENTRY_BASE_URL |  |
| `tools/ascension/performance.js` | 8806 | ENTRY_BASE_URL |  |
| `tools/balance/perfsim.js` | 8000 | - |  |
| `tools/bugfix/t_arena_tables.js` | 8771 | SE_BASE_URL |  |
| `tools/bugfix/t_bg_pause.js` | 8771 | SE_BASE_URL, SITE |  |
| `tools/bugfix/t_buff_note.js` | 8771, 8799 | SE_BASE_URL, SITE | sí |
| `tools/bugfix/t_downed_banner.js` | 8771, 8799 | SE_BASE_URL, SITE | sí |
| `tools/bugfix/t_fort_valves_guest.js` | 8771, 8799 | SE_BASE_URL, SITE | sí |
| `tools/bugfix/t_guest_corpses.js` | 8771, 8799 | SE_BASE_URL, SITE | sí |
| `tools/bugfix/t_guest_crystal.js` | 8771, 8799 | SE_BASE_URL, SITE | sí |
| `tools/bugfix/t_guest_facing.js` | 8771, 8799 | SE_BASE_URL, SITE | sí |
| `tools/bugfix/t_guest_ult_xp.js` | 8771, 8799 | SE_BASE_URL, SITE | sí |
| `tools/bugfix/t_hud_stack.js` | 8771 | SE_BASE_URL, SITE |  |
| `tools/bugfix/t_net_events_keep.js` | 8771, 8799 | SE_BASE_URL, SITE | sí |
| `tools/bugfix/t_net_full_for_one.js` | 8771, 8799 | SE_BASE_URL, SITE | sí |
| `tools/bugfix/t_render_recover.js` | 8771 | SE_BASE_URL, SITE |  |
| `tools/ciudad/t_clamp.js` | 8771 | SE_BASE_URL |  |
| `tools/expedition/cosmetics-test.js` | 8806 | - |  |
| `tools/expedition/functional.js` | 8806 | ENTRY_BASE_URL |  |
| `tools/expedition/online.js` | 8806 | - | sí |
| `tools/expedition/performance.js` | 8806 | - |  |
| `tools/fortaleza/t_fortaleza_net.js` | 8771, 8799 | SITE | sí |
| `tools/fortaleza/t_fortaleza.js` | 8771 | SE_BASE_URL |  |
| `tools/identity/t_identity_net.js` | 8771, 8799 | SITE | sí |
| `tools/items/t_abismo.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_boons.js` | 8822 | SE_BASE_URL |  |
| `tools/items/t_breakables.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_build_uniques.js` | 8841 | SE_BASE_URL |  |
| `tools/items/t_camp.js` | 8826 | SE_BASE_URL |  |
| `tools/items/t_campaign.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_codex.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_collision.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_cromas.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_crystals.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_difficulty.js` | 8823 | SE_BASE_URL |  |
| `tools/items/t_endless.js` | 8808 | SE_BASE_URL |  |
| `tools/items/t_evolution.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_ground_loot.js` | 8821 | SE_BASE_URL |  |
| `tools/items/t_hechicero.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_hpbonus.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_itemization.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_items.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_nigro_elements.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_nigro_golems.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_nigromante.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_pacing.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_perf_exploits.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_q4_economia.js` | 8904 | SE_BASE_URL |  |
| `tools/items/t_quests.js` | 8806 | SE_BASE_URL |  |
| `tools/items/t_reactions.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_resonance.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_roles.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_sets.js` | 8771 | SE_BASE_URL |  |
| `tools/items/t_story.js` | 8821 | SE_BASE_URL |  |
| `tools/items/t_synergies.js` | 8822 | SE_BASE_URL |  |
| `tools/micelial/t_micelial_net.js` | 8771, 8799 | SITE | sí |
| `tools/micelial/t_micelial.js` | 8771 | SE_BASE_URL |  |
| `tools/minas/t_clamp.js` | 8771 | SE_BASE_URL |  |
| `tools/net-test/campaign-gate.js` | 8771, 8799 | SITE | sí |
| `tools/net-test/e2e.js` | 8771, 8799 | SITE | sí |
| `tools/perf/sw-test.js` | 9319 | - |  |
| `tools/quality-five/cosmetics-test.js` | 8771 | - |  |
| `tools/regression/t_bestias_net.js` | 8771, 8799 | SITE | sí |
| `tools/regression/t_bestias.js` | 8771 | SE_BASE_URL |  |
| `tools/regression/t_champs_se.js` | 8771 | SE_BASE_URL |  |
| `tools/regression/t_drag_aim.js` | 8771 | REGRESSION_BASE_URL, SE_BASE_URL |  |
| `tools/regression/t_hit_react_net.js` | 8824, 8834 | SE_BASE_URL, SITE | sí |
| `tools/regression/t_hit_react.js` | 8824 | REGRESSION_BASE_URL, SE_BASE_URL |  |
| `tools/regression/t_ilkan_migration.js` | 8981 | - |  |
| `tools/regression/t_juice.js` | 8771 | REGRESSION_BASE_URL, SE_BASE_URL |  |
| `tools/vfx/bench-cost.js` | 8961 | ABILITY_BASE_URL |  |
| `tools/vfx/bench-ult-forms.js` | 9301 | BASE_URL |  |
| `tools/vfx/test-vfx-b.js` | 8961 | ABILITY_BASE_URL |  |
| `tools/vfx/verify-mechanics.js` | 8961 | ABILITY_BASE_URL |  |

### PUERTO FIJO+SPAWN (36)

| Prueba | Puertos en el código | Variables de entorno | Relay |
|---|---|---|---|
| `tools/art/battlefield-test.js` | 8874 | - |  |
| `tools/art/bosque-selva-bench.js` | 8841 | BENCH_PORT |  |
| `tools/art/check-coliseum-cover.js` | 8877 | - |  |
| `tools/art/check-presentation-browser.js` | 8771 | - |  |
| `tools/art/test-brasa-abyssal-online.js` | 8875, 8876 | - | sí |
| `tools/audio/test-combat-rng.js` | 8798 | - |  |
| `tools/balance/entry-gate.js` | 8796 | ENTRY_BASE_URL |  |
| `tools/bosses/t_boss_arena_hooks.js` | 8839 | BOSS_HOOKS_PORT |  |
| `tools/crystal-wars/hub-integration.js` | 8843 | CW_HUB_PORT | sí |
| `tools/portadores/online-myla.js` | 8795 | - | sí |
| `tools/portadores/online-ynara.js` | 8795 | - | sí |
| `tools/portadores/online.js` | 8783 | - | sí |
| `tools/portadores/test-elyra.js` | 8798 | - |  |
| `tools/portadores/test-myla.js` | 8792 | - |  |
| `tools/portadores/test-ynara.js` | 8793 | - |  |
| `tools/quality-five/online.js` | 8857, 8858 | - | sí |
| `tools/quality/test-ability-resources.js` | 8847 | RESOURCE_GATE_PORT |  |
| `tools/quality/test-classic-passives.js` | 8839 | PASSIVE_PORT |  |
| `tools/quality/test-floating-text-rate.js` | 47340 | TEXTRATE_PORT |  |
| `tools/quality/test-nano-render.js` | 8854 | NANO_RENDER_PORT |  |
| `tools/quality/test-projectile-identity.js` | 8841 | PROJ_PORT |  |
| `tools/regression/t_run_end.js` | 8771 | SE_BASE_URL |  |
| `tools/ux/functional.js` | 8805 | - |  |
| `tools/ux/online-tactical.js` | 8840 | - | sí |
| `tools/ux/online.js` | 8806 | - | sí |
| `tools/ux/test-ability-inspector.js` | 8834 | INSPECT_PORT |  |
| `tools/ux/test-arena-briefing-tutorial.js` | 8836 | BRIEF_PORT |  |
| `tools/ux/test-hub-legibility.js` | 8891 | HUB_PORT, SITE |  |
| `tools/ux/test-tactical-panel.js` | 8835 | TACTICAL_PORT |  |
| `tools/ux/test-text-overflow.js` | 8842 | OVERFLOW_PORT |  |
| `tools/ux/test-touch-targets.js` | 8838 | TOUCH_PORT |  |
| `tools/vfx/audit-abilities.js` | 8961 | ABILITY_BASE_URL |  |
| `tools/vfx/audit-ability-vfx.js` | 8941 | BASE_URL, PORT |  |
| `tools/vfx/audit-combat.js` | 8798 | - |  |
| `tools/vfx/parity-skill-fx.js` | 8995 | BASE_URL, PORT |  |
| `tools/vfx/perf-skill-fx.js` | 8975 | BASE_URL, PORT |  |

### SERVIDOR PROPIO (8)

| Prueba | Puertos en el código | Variables de entorno | Relay |
|---|---|---|---|
| `tools/art/bosque-selva-test.js` | - | - |  |
| `tools/art/roster-loading-test.js` | - | - |  |
| `tools/audio/t_audio_mix.js` | - | SE_BASE_URL |  |
| `tools/crystal-wars/browser-test.js` | - | - | sí |
| `tools/crystal-wars/competitive-integration-test.js` | - | - | sí |
| `tools/founders/online-presence.js` | - | - | sí |
| `tools/quality-five/functional.js` | - | - |  |
| `tools/ux/playtest.js` | - | - |  |

