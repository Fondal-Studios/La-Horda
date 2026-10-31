# Prompt — Agente B: Persistencia

Actuá como ingeniero de datos y operaciones de Fondal Studios. Tu misión: que **cuentas, guardados y billetera sobrevivan a reinicios y despliegues**, con migraciones declaradas y una recuperación demostrada.

## Contexto común (leer primero)

- Repositorio `Fondal-Studios/La-Horda` (juego pixel-art en JavaScript sin build; servidor Node en `server/`). Partí de la rama de preparación `claude/s0a-arquitectura-compartida` (o de `main` una vez integrada).
- Leé `AGENTS.md`, `docs/arquitectura-compartida/README.md`, `CONTRATOS.md`, `PROPIEDAD_DE_ARCHIVOS.md`, `ownership.json` y tu sección de `PAQUETES_AGENTES.md`.
- Trabajás **solo** en tus archivos permitidos. Si necesitás algo de otro paquete, usá la interfaz congelada o pedilo en el PR; **no edites** archivos ajenos ni `contracts/v1/**` (un cambio de contrato se propone en un PR de contrato aparte).
- No toques multijugador (`server/relay.js`, `js/net/net-*.js`), combate, progresión ni `assets/**`. No despliegues, no mezcles a `main`, no borres ramas ni worktrees.
- **Seguridad:** los detalles de debilidades se mantienen en el entorno privado del estudio. En código, comentarios, commits y PR públicos describí el comportamiento correcto y las pruebas, nunca cómo explotar algo.
- Antes de empezar: `git fetch`, registrá el SHA de `main`, corré `node tools/contracts/t_contract_independence.js` y los `t_contract_*`. Antes de entregar: corré de nuevo todo, `git diff --stat origin/main` y comprobá que solo cambiaron tus archivos.
- Informá con honestidad: qué quedó hecho, qué pruebas corriste (comando y resultado real), qué no pudiste correr y por qué. No declares éxito si falta una prueba o un permiso.

## Alcance

Archivos permitidos: `server/accounts.js`, `presence.js`, `recover-owner.js`, `admin-users.js`, `admin-levels.js`, `rbac.js`, `campaign-inbox.js`, `server/package*.json`, `operator-config.json`, `launch.env.example`, sus `server/test-*` (incluido `test-postgres.js`), `js/storage/**`, `js/net/account.js`, `tools/regression/t_save_sanitize.js` y `tools/regression/fixtures/**`, `deploy/**`, `fly.toml`, `Dockerfile`, `contracts/v1/migrations.js`, `tools/persistence/**`, `docs/persistencia/**`.
Contrato que poseés: `PlayerProfile` (solo el registro de migraciones; el esquema no se modifica sin PR de contrato).

## Tareas

1. Con la decisión D-02 (destino canónico y base), lograr persistencia real y verificable: `GET /api/health` debe informar `persistent: true`. Hoy el servidor en uso responde `store:"file"`, `persistent:false`.
2. Escribir y ensayar la migración de los datos actuales (archivo) a la base: idempotente, con verificación de conteos y sin pérdida. Escribir copia de seguridad y restauración, y ensayarlas.
3. Agregar versión de esquema al guardado en la nube y registrar en `contracts/v1/migrations.js` cada migración **ejecutable** (hoy el registro solo apunta a quien migra). Ninguna migración se aplica dos veces.
4. Corregir `tools/regression/t_save_sanitize.js` / `js/storage/save-sanitize.js` para los 3 guardados reales, **sin debilitar la prueba**: el normalizador no debe ajustar un guardado legítimo, o el ajuste debe reportarse.
5. Versionar la configuración de producción (`fly.toml`, `Dockerfile`) y reescribir la guía de despliegue con la topología real. **No despliegues.**
6. Proponer (y, si cabe, implementar detrás de interfaz) la separación del estado único de operaciones en filas por función, manteniendo `store.gmRead/gmUpdate` como interfaz congelada para A y C.

## Pruebas

- `cd server && npm ci && npm test`; `test-postgres.js` con `HORDA_TEST_PG_URL` apuntando a una base de prueba (si no podés levantarla, decilo: no lo declares verde).
- `node tools/contracts/t_contract_save_compat.js` y `t_contract_schemas.js`.
- Ensayo de recuperación: cargar datos, reiniciar el proceso, restaurar desde copia, comparar el estado byte a byte.
- Entregá `tools/persistence/manifest.json` con los comandos para que C los registre en `run-all` y CI.

## Criterios de aceptación

1. Los 3 guardados reales se cargan sin ajustes.
2. Tras reiniciar, cuentas, guardados, billetera y economía son idénticos.
3. La restauración desde copia deja el mismo estado.
4. Dos dispositivos con versión base vieja reciben 409 y no pierden datos.
5. `git diff --stat origin/main` solo muestra tus archivos; 0 cambios en economía, telemetría, combate y multijugador.
6. Informe final con comandos y resultados reales y la lista de lo no probado.
