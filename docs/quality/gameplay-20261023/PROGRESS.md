# La Horda — auditoría de jugabilidad, bloque crítico

Pedido: 23/10/2026. Evidencia actualizada: 24/10/2026 UTC.

## Estado vigente

- A1 terminado e integrado por PR210: merge `ee29c489cfec814b81fa63ee08f05a067df8e5bf`.
- A2 implementado; PR208, candidato `2d3bbca3bec9ba8597e605ecd723a759cbb1ea88`. Recuperación Chromium PASS; esperando cierre de todas las regresiones generales antes del merge.
- Producción no desplegada. El health oficial sigue informando disco sin DATABASE_URL. No reiniciar ni redeployar sin almacenamiento persistente y respaldo comprobado.
- B, C, D, E y F1 pendientes. F2 espera el segundo prompt maestro. No se realizaron pruebas humanas de dificultad ni auditoría de audio.

## Repositorio y trabajo paralelo

`drmarianojimenez94-sudo/La-Horda` redirige a `Fondal-Studios/La-Horda`; principal `main`. Base inicial: `f62d181477adcb4607cc615411cc51bad769f681` (PR204). Rama de implementación `fix/gameplay-critical-20261023`; A1 aislado en `fix/health-hud-isolated-20261023`. AGENTS.md leído; no se produjeron campeones.

Se revisaron issues y PR abiertas. No se incorporaron talleres NO_INTEGRAR: Facu GM207, Axiom194, Aurelia193, Myla192, Aelith191, Libertador166; tampoco las propuestas92/90. Revisar `fix/story-phase-observation-20261023` antes de narrativa. No se sobrescribió arte ni trabajo paralelo.

## Matriz

| Bloque | Archivos/módulos | Diagnóstico y dependencia | Estado |
|---|---|---|---|
| A1 | hero-stats.js, potions.js, hud.js, hud.css, index.html | HUD dividía HP por HP máximo + capacidad de escudo; curación usaba HP máximo | Terminado, PR210 integrada |
| A2 | loot.js, items.js, ground-loot.js, save.js, save-sanitize.js, end-screens.js, run.js, menus.js, screens.js, reward-mailbox.js, net-core.js, net-game.js; server/campaign-inbox.js, relay.js, accounts.js, presence.js | Inventario lleno descartaba recompensas; no había recibos ni recuperación durable del final; escrituras fallidas se ocultaban | Implementado y probado; integración final en curso |
| B | tutorial.js, campaign-story.js, story.js, codex-narrative.js, run-intro.js, arena-briefing.js, ui/codex | Exclusión parcial existente; falta reproducir superposición y revisar rama paralela | Pendiente |
| C | arenas/hielo/hie-cold.js, hie-boss.js, hie-tundraverx.js | Faltan mediciones con perfiles y parámetros configurables | Pendiente, sin cifras nuevas |
| D | data/loot.js, systems/loot.js, difficulty.js, difficulty-tiers.js, pacing.js | No se alteraron tablas, rarezas ni economía para corregir pérdidas | Pendiente |
| E | audio/audio.js, music-score.js, módulos de campeones | No se importaron sonidos ni se afirmó escucha | Pendiente |
| F1 | assets, art-source, docs/production, manifiestos y talleres | Producción con restricciones explícitas | Pendiente inventario global y Art Gate |
| F2 | items.js, affixes.js, recipes.js, gems.js | Falta especificación independiente | Bloqueado por especificación; sin migración |

## A1 — causa, solución y evidencia

Vida100/100 con capacidad100 de escudo agotado se dibujaba al50%. `heroVitals` ahora lee HP/maxHP real; HUD y elegibilidad de pociones comparten la lectura. Escudo separado en jugador y aliados. Se mantuvo la curación real de HP.

- Node/VM: HP completo/parcial, escudo temporal, cambios de máximo, muerte/reanimación, máximo cero, poción real50→78, poción conservada con vida llena: PASS.
- Chromium: HUD en844×390 y1280×720, geometría sin solapamiento, sin errores de página: PASS. Capturas revisadas, artifact12541244548, run40046910510.
- Todos los checks de PR210: PASS, incluido Safari tras repetir una instalación de dependencias cancelada. Merge confirmado por GitHub.

## A2 — causa, solución y evidencia

La entrega ya ocurría antes de abrir el cofre; omitir su animación no era por sí solo la causa demostrada. `grantEndOfRunLoot` interrumpía el lote con inventario lleno; el suelo se vaciaba aun sin conservar todos los objetos. Faltaban recibos idempotentes y propagación de errores de almacenamiento.

Cambios:

- Recibo, oro, XP, gemas y objetos se escriben juntos antes de la demora visual. El mismo ID devuelve el recibo sin volver a pagar. Generación fallida revierte el estado; escritura fallida conserva el resultado en memoria para reintento.
- Buzón de excedentes en bloques100 separado del inventario. El sanitizador conserva excesos válidos de guardados antiguos en vez de truncarlos en5000. Reclamación respeta capacidad y UID; visualización paginada. Botón Botín en la barra superior del menú.
- Revisión del cofre antes de continuar; marcadores de recibos revisados preservan idempotencia. Continuar, repetir y volver al menú se bloquean si falla el guardado.
- El relay asigna ID de ronda y guarda el resultado antes de reenviar victoria, mediante el adaptador existente de cuentas. Propiedad por cuenta autenticada o capacidad privada aleatoria de navegador. Recuperación sin sala ni anfitrión. Acuses repetidos no borran el archivo.20resultados sin reclamar impiden iniciar otra ronda sin eliminar resultados.
- Se mantiene autoridad de combate del host: no es un sistema antitrampas. No se migraron reglas de ítems/forja. Se restauró una modificación accidental de refundición y se añadió una prueba específica.
- CI detectó y permitió corregir resumen de desafíos no visible y scroll extra en el menú móvil.

Pruebas reproducibles:

```sh
node tools/regression/test-critical-rewards.js
node server/test-campaign-inbox.js
node server/test-campaign-relay.js
npm test --prefix server
NODE_PATH=/tmp/horda-integracion/node_modules node tools/net-test/reward-recovery.js
```

Las primeras cuatro pasaron localmente. Chromium se ejecutó en CI: run40048709866 sobre el candidato final, PASS; artifact12542526783. Dos contextos reales: invitado cerrado antes de victoria, host cerrado, relay reiniciado con mismo almacenamiento, inventario lleno, recuperación a buzón, recarga con mismos oro/XP/objetos. Además se fuerza fallo de localStorage y las tres salidas siguen en victoria con aviso. Captura móvil revisada. No son sesiones con jugadores humanos ni dispositivos físicos.

La prueba6500objetos pasó tras JSON/sanitización y reclamación repetida. Los casos de servidor cubren cuenta en otro dispositivo, aislamiento de usuarios, claves privadas, acuses duplicados, reinicio real por WebSockets, acceso a propiedades heredadas y límite20sin eliminación.

## Límites y operación

- La cuota de localStorage y el límite actual512KB de nube siguen siendo finitos. La prueba6500 es de lógica local, no una demostración de sincronización de6500objetos a la nube. Fallar la persistencia no debe señalar éxito; liberar espacio/reintentar sigue siendo necesario.
- La recuperación de anónimos depende de conservar su clave privada en ese navegador. La recuperación por cuenta depende de autenticación y de la reconciliación existente del guardado. No se validó uso simultáneo de una misma cuenta en varios dispositivos.
- El archivo de resultados del relay depende de almacenamiento real persistente. `https://fondalstudios.com/la-horda/red/health` comprobado el24/10 informa ARCHIVO EN DISCO sin DATABASE_URL y advierte pérdidas al redeploy/reinicio. No se desplegó ni reinició producción; no confundir merge con publicación.
- El journal conserva resultados de victoria recibidos por el relay, no reconstruye una victoria que el host nunca logró enviar. No se afirmó recuperación histórica de partidas anteriores a este protocolo.

## Continuidad

1. Confirmar checks del candidato final de PR208 e integrar si todos pasan; anotar SHA de merge.
2. Verificar publicación del frontend por separado. Antes de publicar relay, comprobar respaldo y almacenamiento persistente del servicio correcto.
3. Continuar narrativa/hielo, drops/dificultad, audio, assets y sistema de ítems en el orden solicitado.

Los archivos baseline.txt, browser-blocked.txt y critical-results.txt conservan la evidencia inicial. El bloqueo local de Chromium quedó superado para estas pruebas mediante CI; no interpretar el registro inicial como estado actual.

### Corrección encontrada en la última regresión

`entry-reference` detectó una diferencia al recargar (`navigation-profiles.js`). El sanitizador añadía `rewardOverflow:[]` a un guardado nuevo que no lo incluía en defaultSave: no era pérdida de XP/objetos, pero cambiaba el JSON sin una acción del jugador. Se inicializa el buzón en defaultSave y se incorpora la prueba de navegación también al workflow corto de recuperación. El merge de PR208 se detuvo; hay que validar este nuevo candidato antes de integrarlo.
