# Paquete de revisión para fusionar `claude/la-horda-beta-audit-exec-mwv8x0` → `main`

Estado verificado en el commit de cabeza de la rama (ver PR). Incluye `main` (música lo-fi CC0, voces) ya fusionado sin conflictos.

## Revisión independiente (agente separado, solo lectura) — APROBAR CON CONDICIONES
Condiciones bloqueantes y su resolución:
1. **XP del pase salía de `args` del cliente** → ahora `afterRun` ignora `args` y lee solo `run.xpInfo` (validado y guardado por el servidor al cerrar), y solo se ejecuta en la transición abierta→cerrada (`server/item-economy.js`). `victory` exige `=== true`; `survived` entero acotado a la ronda.
2. **Granja con partidas de duración cero** → el XP exige ≥ 60 s y ≥ 1 pulso de progreso.
3. **Bloqueo de modos solo en cliente** → con `BETA_PUBLIC=1` el servidor rechaza `run.start` en `coliseum`, `crystal_wars` y `divina` (403 `MODE_NOT_IN_BETA`); la Arena Divina además queda oculta/bloqueada en cliente (`isDivinaUnlocked()` falso con la bandera).
Recomendadas: plausibilidad de ronda endurecida a 20 s/ronda (+2) ✔; `if(!B.atlas)` en `cosmetics.js` ✔. **Pendientes (seguimiento):** el `GET /api/battlepass` reescribe el documento; `goldOwed` sin liquidación; filas de ranking previas a la beta conservan la ronda del grupo (reiniciar la semana/temporada abierta al lanzar); cosméticos `bp:` aún sin vínculo con el equipo del jugador.
Pruebas nuevas: `server/test-battlepass.js` (64 aserciones: duración cero, `victory:1`, replay con `survived` inflado sin `xpInfo`, guardas de modos con `BETA_PUBLIC`).

## Evidencia (archivo y Postgres 16 local)
- Servidor: `npm test` completo exit 0; `test-battlepass`, `test-item-economy-live`, `test-leaderboard-order`, `test-item-economy-compat` también contra Postgres (base limpia).
- Cliente (Chromium): `tools/ux/test-*.js` (incluye `test-skill-glyphs`, `test-beta-scope`, `test-battlepass-ui`, `test-hub-legibility`), `roster-loading-test` (46 campeones), `t_cromas`, `t_sets`, `t_piezas_brasas`, `t_skins_brasas`, colección, coliseo, `lanes/test-sides` (flaky conocido), audio (`t_sample_bank`, `t_audio_mix`), guardas de Myla/Libertador, `check-codex-body` (Guerrero, Tanque, Aelith, Morveth), `check-thalen-codex-consumer`, `siete/functional` (100), `ability-gate --strict`, `check-entry-reference`, `entry-gate` (46 campeones).
- Defecto hallado por esta batería y corregido: Ilsa, Vorn y Kora (de #90) no tenían glifos de habilidad propios (12 habilidades) → agregados.
- `pixel-density --strict`: única marca = `assets/sprites/arenas/world-v1` (preexistente).

## Limitaciones conocidas (no bloquean la fusión, sí la salida pública)
Multijugador de 4 humanos flaky y e2e de 1 humano falla también en `main`; sin pruebas de reconexión/soak; token de partida del ranking en archivo pendiente; arte nuevo = candidato (animación procedural); Ilsa/Vorn/Kora derivan de donantes; sin builds nativos.

## Qué falta para fusionar (no lo puede hacer quien produjo el código)
Revisión humana del PR + CI remoto en verde (workflows en `.github/workflows`). Después de fusionar: reiniciar el ranking abierto y desplegar con `BETA_PUBLIC=1`.
