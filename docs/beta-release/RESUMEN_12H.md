# Resumen de las últimas ~12 horas (2026-11-06) — rama `claude/la-horda-beta-audit-exec-mwv8x0`

Todo es CANDIDATO: falta revisión independiente humana y CI remoto; nada se fusionó a main. Detalle y pruebas por bloque en `RESULTADOS_PR.md`; créditos en `ART_CREDITS.md`.

## Economía, ranking y pase
- Brasas solo compran cosméticos puros (`PIECES_FOR_BRASAS=false`); piezas y efectos de set no se venden; completar un set regala cosmético. Pruebas: wallet 65/65, piezas 35/35, `t_piezas_brasas`, `t_skins_brasas`.
- Ranking de Horda Infinita por ronda sobrevivida personalmente (ronda → puntaje → tiempo), en archivo y Postgres.
- Pase de batalla de 30 días: backend (free/premium, desafíos, XP solo desde partidas verificadas, reclamo idempotente), interfaz y pruebas de punta a punta; corregido un 500 en `run.finish`.
- Alcance de la beta: Convergencia y Coliseo ocultos y bloqueados con `BETA_PUBLIC=1`.
- Compra con referencia pendiente persistente (de #265).

## Pila de PR
- #271 reparado; #261 fusionado con main; #263 y #236 extraídos; #265 parcialmente; #241 descompuesto; #259 y #270 extraídos; **#90 (Ilsa, Vorn, Kora) integrado como TESTING**. 0 de 24 con disposición final; faltan revisión independiente y CI remoto.

## Arte de guardianes
- Auditoría corregida de los 43 contra el Códice (la primera estaba mal: comparaba un atlas que el juego no usa).
- Cuerpos del Códice integrados: **Guerrero, Tanque, Mago, Aelith, Morveth** (cromas recoloreando el cuerpo nuevo sin tocar gates), **Saelis, Aurelia, Maura, Ynara, Myla** (#259; Myla con revisión independiente, hash actualizado y prueba de fidelidad nueva; croma y caída nuevas).
- **Libertador** completo (a pie, combate, caballo, caída; revisión independiente con condiciones atendidas), **Profeta** repintada, **Coloso de Ilkan** como espíritu de arena, **Nigromante**: Plaga en pixel art nativo.
- Segunda pasada: poses extra (bayoneta, mando, ataque, conjuro, marcha, golpe, transformación del Coloso, caída de la Profeta).
- Resto de los guardianes: a ≈80 % o más del Códice, sin cambios.

## Arenas
- Ciudad Maldita (casas de pueblo), Fábrica (suelos), Laberinto/Infernal/Acuática (pisos pintados). Abismo: intento rechazado y registrado.

## Pruebas y QA
- Batería de red/cooperativo clasificada (PASS/FLAKY/FAIL; 4 humanos y `lanes/test-sides` son flaky también en HEAD limpio; e2e de 1 humano falla también en main). Campaign-gate adaptado.
- Galería de habilidades de los 43 revisada (solo la Plaga estaba rota); inventario de animación de 104 enemigos/jefes.

## Créditos Runway
- Saldo inicial de la jornada ≈ 1015; final **86**. Cerca de 100 se perdieron en tareas `BAD_OUTPUT` (se cobran). Todo registrado con task ID.

## Limitaciones honestas
- La animación nueva es procedural sobre una pose pintada por estado (no cuadro a cuadro).
- Berrinche de Myla conserva el diseño viejo (hash fijado). Skins autorales de Libertador/Profeta mantienen su diseño.
- Ilsa/Vorn/Kora derivan de donantes; necesitan revisión de arte/audio humana y pruebas reales de multijugador/performance.
- No hay builds nativos (Steam/Android/iOS); el token de partida del servidor para el ranking en archivo sigue pendiente.
