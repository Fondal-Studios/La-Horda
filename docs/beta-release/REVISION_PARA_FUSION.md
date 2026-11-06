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

## Resultado del CI remoto del PR #277 y correcciones (19:50 UTC)
- **Entorno (no es del código):** el runner `ubuntu-latest` ahora es Ubuntu 26.04 y `playwright install --with-deps chromium` falla («Playwright does not support chromium on ubuntu26.04-x64»), de modo que todo flujo que instala Chromium falla antes de probar nada (quality-five, brasa-abyssal, oficios, soporte-v3, skill-icon-exports, art-presentation, vfx-readability, art-production-evidence, partes de «Integración pruebas»…). Habría que fijar `runs-on: ubuntu-24.04` o actualizar Playwright; no lo hice yo porque cambia la infraestructura de CI de todo el repositorio.
- **Corregido:** (1) `emoji-lint` (el 🎼 del selector de música que trajo `main` ya fallaba allí): ícono pixel `nota` mapeado y etiqueta partida en dos líneas; (2) `tests/competitive-roster.test.js`: el registro de Convergencia (`js/modes/crystal-wars/atlas.js`) declaraba el atlas de Ynara de 384×576 y ahora mide 384×672; (3) `cosmetics-only.yml` (mío) apuntaba a `tools/ui-clarity/test-shop-clarity.js`, que pertenece a #265 (no integrado): paso retirado; (4) caída de Myla: el flujo `myla-death.yml` exige los bytes de `art-source/entregas/bloques/B005_myla/revision-01/death.png` → se restauró la caída aprobada y la nueva queda como candidata en `art-source/runway-guardians/myla/death-candidato/`.
- **Libertador sacado de este PR:** `libertador-death.yml` y `libertador-motion.yml` reconstruyen `death.png`/`motion.png` desde el pipeline aprobado y comparan bytes; reemplazar esos archivos exige cambiar esas guardas y debe decidirlo su responsable. Los assets y las guardas JS vuelven a ser los de `main`; el diseño nuevo queda como candidato en `art-source/runway-guardians/libertador/atlas-candidato/` (con `tools/art/check-libertador-fidelity.py`) para un PR aparte.
- **Sin determinar (bloqueados por el entorno):** Guerrero/Tanque death, Soporte v3, etc.: no se puede saber si pasan hasta que Playwright vuelva a instalar en el runner.
