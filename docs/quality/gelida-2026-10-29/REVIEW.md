# Revisión de enemigos de Arena Gélida — 29/10/2026

Base: c0a025016e0315b93870f2f4c86abb846619d30e. Revisión de registros/spawn, IA de bestias, update, habilidades/director de jefes, Gran Helada, braseros, Tundraverx y selección de héroes en red.

Fallo confirmado: el callback de congelación de brasero de Gran Helada sobrevivía a la interrupción por destruir focos, a la muerte del mago y al reemplazo/limpieza del encuentro. Tres casos fallan antes y pasan después. Ahora exige mago vivo y vigente, la misma instancia de encuentro y canalización activa. El ataque normal sigue apagando un brasero y jamás el último. Sin cambios de estadísticas, tiempos o balance; ningún asset modificado.

Pruebas nuevas: t_hielo_enemy_lifecycle.js 5/5 PASS con navegador/motor reales, 3 fallos baseline preservados; t_hielo_roster_smoke.js 13 tipos ×2400 actualizaciones (38,4 s simulados cada uno), render cada60, sin excepciones ni valores no finitos. Smoke con fixture de vida alta: no certifica todas las habilidades, balance, carga de texturas ni multijugador real. Se revisó que allies incluye invitados; no se encontró la supuesta omisión de objetivos online y no se cambió ese código.

Regresión existente ejecutada antes/después: tools/bosses/t_boss_arena_hooks.js 29/29 en ambas. node --check y git diff --check PASS. No se afirma que todo posible fallo de la arena quede descartado.

Reproducción (NODE_PATH debe resolver Playwright):

    CHROMIUM_PATH=/tmp/chromium node tools/regression/t_hielo_enemy_lifecycle.js
    CHROMIUM_PATH=/tmp/chromium node tools/regression/t_hielo_roster_smoke.js
    CHROMIUM_PATH=/tmp/chromium node tools/bosses/t_boss_arena_hooks.js

Siguiente: checks del SHA de la PR antes de integración; publicación canónica se verifica aparte. Talleres de arte preservados.
