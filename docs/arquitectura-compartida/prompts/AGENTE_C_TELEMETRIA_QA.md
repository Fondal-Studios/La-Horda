# Prompt — Agente C: Telemetría y QA

Actuá como ingeniero de datos y calidad de Fondal Studios. Tu misión: que se pueda **medir la retención y los errores sin datos personales** y que **las pruebas protejan de verdad**.

## Contexto común (leer primero)

- Repositorio `Fondal-Studios/La-Horda` (juego pixel-art en JavaScript sin build; servidor Node en `server/`). Partí de la rama de preparación `claude/s0a-arquitectura-compartida` (o de `main` una vez integrada).
- Leé `AGENTS.md`, `docs/arquitectura-compartida/README.md`, `CONTRATOS.md`, `PROPIEDAD_DE_ARCHIVOS.md`, `ownership.json` y tu sección de `PAQUETES_AGENTES.md`.
- Trabajás **solo** en tus archivos permitidos. Si necesitás algo de otro paquete, usá la interfaz congelada o pedilo en el PR; **no edites** archivos ajenos ni `contracts/v1/**` (un cambio de contrato se propone en un PR de contrato aparte).
- No toques multijugador (`server/relay.js`, `js/net/net-*.js`), combate, progresión ni `assets/**`. No despliegues, no mezcles a `main`, no borres ramas ni worktrees.
- **Seguridad:** los detalles de debilidades se mantienen en el entorno privado del estudio. En código, comentarios, commits y PR públicos describí el comportamiento correcto y las pruebas, nunca cómo explotar algo.
- Antes de empezar: `git fetch`, registrá el SHA de `main`, corré `node tools/contracts/t_contract_independence.js` y los `t_contract_*`. Antes de entregar: corré de nuevo todo, `git diff --stat origin/main` y comprobá que solo cambiaron tus archivos.
- Informá con honestidad: qué quedó hecho, qué pruebas corriste (comando y resultado real), qué no pudiste correr y por qué. No declares éxito si falta una prueba o un permiso.

## Alcance

Archivos permitidos: `server/game-master.js` (**solo** la ruta `POST /api/telemetry` y la constante `EVENTS`), `server/test-game-master.js`, `js/net/alpha-services.js`, `js/net/fondal-telemetry.js`, `js/ui/legal.js`, `js/data/legal-config.js`, `legal/**`, `docs/legal/**`, `tools/quality/run-all.js`, `.github/workflows/**`, `docs/quality/**`, `tools/lib/**`, `tools/alpha/**`, `tools/contracts/**`, `tools/telemetry/**`, `docs/telemetria-qa/**`.
Contrato que poseés: `TelemetryEvent`.

## Tareas

1. **Consentimiento:** la telemetría solo se envía con consentimiento previo (hoy se envía salvo que se apague). Agregar la sección correspondiente a la política de privacidad y actualizar el texto de ayuda. Decisiones previas: D-06, D-07, D-08.
2. **Eventos:** habilitar en el servidor, con tope por lote, los eventos propuestos `session_end`, `client_error`, `perf_sample` y `retention_day` (`PROPOSED_EVENT_NAMES` en `contracts/v1`) y moverlos a `ACCEPTED_EVENT_NAMES` mediante un PR de contrato con aprobación de A y B. Sin datos personales: lo impone el contrato y el servidor.
3. **Métricas:** calcular retención D1/D7 y tasa de error por compilación a partir de las métricas agregadas; mostrarlas en el panel existente. Sin identificadores de cuenta.
4. **Hermeticidad:** que el cliente de prueba no consulte producción (hoy `t_codex` y `lanes/postgame-test` fallan por una consulta a un servidor externo). Hacelo en `tools/lib/**` (servidor estático de pruebas), **no** en `js/net/**` (multijugador, prohibido).
5. **CI honesto:** quitar `continue-on-error: true` de los pasos cuyas pruebas hoy pasan; dejarlo solo en los rojos, cada uno con una issue y un dueño. Registrar en `run-all` y CI las pruebas `tools/contracts/t_contract_*.js` y los manifiestos `tools/economy/manifest.json` y `tools/persistence/manifest.json` cuando existan.
6. Regenerar `docs/quality/ESTADO_DE_PRUEBAS.md` desde una corrida real, con fecha y SHA.

## Pruebas

- `node tools/contracts/t_contract_telemetry.js` y `t_contract_schemas.js`; `cd server && npm test`; `node tools/alpha/services-browser.js`.
- `node tools/quality/run-all.js --jobs 2` completo con la red bloqueada: no debe haber fallos nuevos respecto de `RESULTADOS_DE_PRUEBAS.md`.
- Una prueba que demuestre que un cambio que rompe una prueba hoy tolerada pone el workflow en rojo.

## Criterios de aceptación

1. Sin consentimiento no se envía ningún evento.
2. Un evento con dato personal se rechaza en el contrato y en el servidor.
3. La prueba de deriva confirma que `ACCEPTED_EVENT_NAMES` y el servidor coinciden.
4. La batería completa corre sin consultar producción.
5. `git diff --stat origin/main` solo muestra tus archivos; 0 cambios en economía, persistencia, combate y multijugador.
6. Informe final con comandos y resultados reales y la lista de lo no probado.

## Herramientas de S0B (obligatorias)

1. **Antes de empezar:** `node tools/agents/accept.js --agent C --entry` debe dar todo PASS (clasificación de la batería, contratos y puerta de propiedad). Si falla, no empieces: informá cuál y por qué.
2. **Tu lista de aceptación ejecutable:** `docs/arquitectura-compartida/agents/C.spec.json`; `node tools/agents/accept.js --agent C` la corre. Los criterios PENDIENTE son pruebas que **vos** tenés que crear en las rutas indicadas; un PENDIENTE no cuenta como cumplido.
3. **Ramas:** `claude/s3-telemetria-<tema>`. La puerta `node tools/agents/check-diff.js --agent C` rechaza cualquier archivo fuera de tu propiedad y la desaparición de una interfaz congelada; corre también en cada PR.
4. **Regresión:** `node tools/quality/qa.js --fast` (local y en CI). Tu cambio no puede dejar la batería peor que `docs/quality/PIPELINE_QA.md` y el último informe de `qa-out/`. No edites archivos mientras corre (run-all restaura/borra lo que cambió durante su corrida).
5. **Clasificación:** toda prueba nueva se registra en `tools/quality/run-all.js` **y** en `tools/quality/qa-manifest.json` (nivel y categoría); si no, `qa-manifest-check` falla el PR. No agregues `continue-on-error`.
6. **Relay:** no despliegues ni toques el relay del socio. Para comprobar compatibilidad usá `node tools/release/relay-smoke.js --local` y, contra uno real, solo `--url` (lectura) con autorización del director.
