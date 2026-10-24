# La Horda — auditoría de jugabilidad, bloque crítico

Fecha del pedido: 23/10/2026 (Argentina). Estado: **PARCIAL / NO MERGEAR TODAVÍA**.

## Punto de partida y continuidad

Repositorio pedido `drmarianojimenez94-sudo/La-Horda` redirige a `Fondal-Studios/La-Horda`.
Rama principal `main`, base inspeccionada `f62d181477adcb4607cc615411cc51bad769f681` (PR204, corrección de carga VFX Cazadora).
Rama de esta entrega: `fix/gameplay-critical-20261023`. Clon completo; AGENTS.md leído (único archivo de instrucciones encontrado).
Permisos del conector: push/pull, no admin. Rulesets públicos: lista vacía; esto NO certifica ausencia de protección clásica.

Se revisó la colección de issues abiertos y las PR abiertas: numerosos talleres NO_INTEGRAR, incluyendo Facu GM #207, Axiom #194, Aurelia #193, Myla #192, Aelith #191 y Libertador #166. No se incorporaron esos candidatos ni se modificaron fuentes de arte. También siguen abiertas propuestas #92 (carriles) y #90 (campeones). La rama remota `fix/story-phase-observation-20261023` debe revisarse antes del bloque narrativo.

## Matriz de diagnóstico

| Área | Módulos reales | Hallazgo / dependencia | Estado y riesgo |
|---|---|---|---|
| A1 vida | systems/hero-stats.js, systems/potions.js, ui/hud.js, index.html, css/hud.css | HUD dividía HP entre maxHp + itemMaxShield; pociones usan maxHp. Vida completa 100/100 y escudo equipado 100 agotado => barra al 50%. | Corrección implementada, lógica probada; visual y relay pendientes. |
| A2 botín | systems/loot.js, ground-loot.js, items.js, storage/save.js, ui/end-screens.js, core/run.js, net/net-game.js, ui/menus.js | Entrega previa al cofre ya existía. Inventario lleno interrumpía el lote y descartaba piso; persistNow ocultaba fallos; no había recibo durable. Recompensa tardía tras 0,9–3,4 s. | Implementación parcial; garantías distribuidas y recuperación completa pendientes. |
| B narrativa | systems/tutorial.js, campaign-story.js, story.js, codex-narrative.js; ui/run-intro.js, arena-briefing.js, codex/ | Existen mecanismos de exclusión probados por t_codex_book_logic, pero eso no reproduce la superposición reportada. | Pendiente reproducción y lectura de rama narrativa paralela. |
| C hielo | arenas/hielo/hie-cold.js, hie-boss.js, hie-tundraverx.js | Mecánica específica localizada; faltan mediciones de exposición/antorchas y perfiles. | No se cambiaron parámetros. |
| D drops/dificultad | data/loot.js, systems/loot.js, difficulty.js, difficulty-tiers.js, pacing.js | La corrección de pérdidas no cambia tablas, rarezas ni probabilidades. | Balance pendiente. |
| E audio | audio/audio.js, music-score.js, módulos de campeones | No se importó audio ni se afirmó escucha. | Auditoría/licencias pendientes. |
| F assets | assets/, art-source/, docs/production/, manifests y PR de talleres | Hay producción explícitamente no aprobada. | Inventario global y Art Gate pendientes. |
| F2 ítems | data/items.js, affixes.js; systems/items.js, recipes.js, gems.js | Falta el segundo prompt maestro. | Bloqueado por especificación; sin migración destructiva. |

## A1 — vida y curación

Causa reproducible en código: el HUD mezclaba dos recursos en un denominador único; el escudo temporal también podía recortar visualmente la vida sin daño.

Solución: `heroVitals` lee HP/maxHP del héroe real, sin añadir escudos. Tanto el HUD como la elegibilidad de pociones consumen ese estado. Escudos en una pista separada para jugador y aliados; porcentajes finitos y acotados, tooltips de vida/escudo. Las pociones siguen curando HP, sin restaurar escudos ni aumentar HP artificialmente.

Archivos: `js/systems/hero-stats.js`, `js/systems/potions.js`, `js/ui/hud.js`, `index.html`, `css/hud.css`.

Validado en Node/VM: HP completo con escudo agotado, HP parcial con escudo temporal grande, cambio de maxHP, muerte/reanimación, maxHP cero y recogida real de poción (50→78; escudo sigue en 0; vida llena conserva la poción). No se ejecutó navegador/relay ni dispositivo físico.

## A2 — recompensas

Causas: `grantEndOfRunLoot` hacía break si no había lugar; `groundLootCollectAll` vaciaba el suelo aun cuando no entraban objetos; `persistNow` ocultaba excepciones; repetir buildVictoryData volvía a conceder el lote. Omitir la animación por sí solo NO se demostró como causa.

Implementado:

- Botín de victoria ganado se conserva en stash aun sobre el límite normal. Compras/recogidas normales mantienen el límite; no se recicla automáticamente el cofre ganado.
- Generación de objetos, gemas, oro, XP y recibo `lastVictoryReward` se agrupa en una escritura local. Los persist internos no escriben estados intermedios.
- El mismo ID de partida devuelve el mismo recibo, también si se recarga el guardado. El host envía un ID al invitado; compatibilidad de lectura con host antiguo por sala+seed.
- Se prepara el botín antes de la espera de la pantalla final. Guard propio de cierre para no bloquear arenas que ya ponen runEnding durante la muerte del jefe.
- Error de escritura retorna false y no comunica éxito a la nube. El resultado permanece en memoria para reintentar sin volver a sortear. Continuar/Repetir reintentan y avisan si falla.
- Al adelantar el cofre se muestra primero el contenido completo; el siguiente toque confirma revisión.

Archivos: `js/core/run.js`, `js/net/net-game.js`, `js/storage/save.js`, `js/systems/{ground-loot,items,loot}.js`, `js/ui/{end-screens,menus}.js`; test nuevo y workflow.

Validado en VM, con funciones reales de persistencia, inventario, entrega y construcción de resultados; generador y servicios externos controlados: inventario lleno, un solo write completo, doble cierre, recarga con mismo ID, fallo de cuota, reintento sin reroll, no notificación falsa a nube, rollback de save ante error del generador.

**Límites que impiden cerrar A2 o mergear:**

1. Un invitado desconectado antes del mensaje final todavía no tiene recuperación durable del resultado desde servidor. `netHostOnRoom` deja de atender al terminar. Hace falta acuse/recuperación por partida y cuenta, incluso si se va el host.
2. Se conserva el recibo de la última victoria, no un libro histórico de todas las transacciones; validar retención y replays antes de considerarlo garantía general.
3. Con almacenamiento realmente indisponible y cierre forzado, ningún resultado exclusivamente en memoria puede recuperarse. Falta respaldo durable en servidor; el aviso no equivale a persistencia.
4. Sanitizador actual limita stash a 5000. El overflow respeta objetos normales, pero falta diseñar buzón durable para acumulación extrema; no cambiar ese límite a ciegas. No probar ni publicar como garantía ilimitada.
5. Tras recarga los objetos están guardados, pero falta acceso dedicado a revisar/confirmar el último cofre pendiente desde el menú.
6. La migración/carga real, cambios de cuenta y sincronización de nube necesitan pruebas de navegador y relay. El rollback de generación cubre save/suelo, no todos los efectos secundarios de módulos externos (por ejemplo estado runtime de quests).

## Pruebas y evidencia

- Base antes de editar gameplay: `node tools/quality/test-single-champion-revive.js` PASS; `node tools/items/t_codex_book_logic.js` PASS; `node tools/balance/check-entry-reference.js` PASS. Salida en baseline.txt.
- `node tools/regression/t_checkpoint.js`: BLOQUEADA al iniciar Chromium, sin llegar a ejecutar aserciones. browser-blocked.txt conserva error.
- Instalación de Chromium con CLI del runtime intentada: descarga inválida/truncada; no hay prueba visual ni screenshots de esta entrega.
- `node tools/regression/test-critical-rewards.js`: PASS (critical-results.txt). Pruebas automatizadas de lógica con VM, NO partidas humanas ni prueba de red real.
- Se repitieron las tres regresiones iniciales: PASS.
- `node --check js/ui/end-screens.js` y `git diff --check`: PASS.
- Workflow Integracion pruebas incorpora la regresión crítica al job de lógica pura. Estado remoto debe revisarse en la PR; no inferir PASS del commit anterior.

## Reanudar

1. Revisar head remoto y PR de esta rama; no editar main ni mezclar talleres.
2. Ejecutar regresión crítica y pruebas de navegador existentes: checkpoint, derrota, next_arena, ground_loot_coop. Revisar HUD 844×390 y escritorio, sombras/solapamientos y skins.
3. Completar los seis límites de A2, especialmente recuperación del invitado y buzón de excedentes; añadir pruebas de pérdida del mensaje final, host caído y cuentas distintas.
4. Sólo después de validación completa integrar. No hay publicación en esta entrega.
5. Continuar B/C, D, E, F1 en el orden pedido; F2 espera prompt independiente. No declarar alfa humana simulada como test real.
