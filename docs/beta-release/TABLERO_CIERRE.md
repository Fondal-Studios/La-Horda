# Tablero de cierre La Horda 1.0 (actualizado 2026-11-15)

Estados: **IMPL** implementado · **AUTO** probado automáticamente · **HW** probado en hardware real · **HUM** validado por humanos · **DUEÑO** aprobado por el dueño · **PEND** pendiente · **BLOQ** bloqueado.

| Fase | Tema | Estado | Evidencia | Siguiente paso |
|---|---|---|---|---|
| 0 | Inventario de PR y ramas | AUTO | `INVENTARIO_PR_20261115.md` | Dueño: correr `borrar_ramas_integradas.sh` y activar «Automatically delete head branches» (el proxy bloquea ambas cosas) |
| 0 | Vulnerabilidades | IMPL (triaje) | `VULNERABILIDADES_20261115.md` | Fase 6: lockfile de `desktop/`, Electron 45, `pg` 8.23.1, `npm ci` en render.yaml; Dependabot sigue con 403 |
| 1 | Jugabilidad: botón de comenzar, cierre a mitad de partida, LAN | AUTO | `FASE1_JUGABILIDAD.md`, `test-start-button-viewports.js`, `t_reload_midrun.js` | Pruebas con humanos |
| 1b | Partidas que no terminan (jefe dormido matable, Caballero afuera de la cámara) | IMPL + AUTO | `FASE1B_PARTIDAS_SIN_TERMINAR.md`, `t_boss_dormant.js` | Una sola corrida por caso; repetir con más semillas |
| 2 | Medición de dificultad (480 partidas de bots) | AUTO | `FASE2_BALANCE.md` | — |
| 2b | A/B de escalones (Ciudad Pesadilla, Minas Infierno, Laberinto) | AUTO, sin cambios | `FASE2B_AB_DIFICULTAD.md` | Ciudad: probar ~2,0/1,9/1,2 con 25 semillas por rol y la regla escrita antes; Minas: ajustar los primeros niveles (no se puede con `tierMods`) |
| 3 | Arte crítico de 0 créditos (Tanque, cometa, casa_a) | IMPL + AUTO | `ART_CREDITS.md` «Fase 3 del cierre» | DUEÑO: aprobar a ojo |
| 3 | Skins del Libertador | IMPL + AUTO | PR #306 | DUEÑO: aprobar a ojo |
| 3 | Ovación final del Presentador | BLOQ | Necesita Runway (saldo 7) o un artista | Dueño: recargar Runway |
| 3 | Pantalla de título con el Demonio Mayor | PEND (decisión) | Variante local `cierre-fase3-titulo` | Dueño: confirmar aunque revele al jefe final |
| 4 | UX: aviso de núcleos en Micelial, barra de skins del inicio | PEND | — | Siguiente fase |
| 5 | Multijugador real (latencia, reconexión) | PEND | Solo LAN automática | Pruebas en hardware y red reales |
| 6 | Seguridad y dependencias | PEND | Triaje en Fase 0 | — |
| 7 | Electron y Steam (AppID, build, legales, tienda, declaración de IA) | PEND (dueño) | — | Dueño |
| — | Marca «La Horda» (clases 9 y 41) | PEND (dueño) | Steam, itch.io y App Store sin título igual | Dueño: consultar TMview/WIPO/INPI |
| — | Alfa con humanos | PEND | No hay resultados humanos | Dueño |

La rutina automática `trig_01GuPc2QF4Wuu5XdX7NFKJjb` está pausada; hay que actualizarla a este plan antes de reactivarla.
