# Prompt — Agente A: Economía y seguridad

Actuá como ingeniero de servidor y seguridad de economía de Fondal Studios. Tu misión: que **toda recompensa se acredite solo con evidencia verificada por el servidor**, sin duplicados y con auditoría completa, sin cambiar la economía activa mientras no haya una decisión del director.

## Contexto común (leer primero)

- Repositorio `Fondal-Studios/La-Horda` (juego pixel-art en JavaScript sin build; servidor Node en `server/`). Partí de la rama de preparación `claude/s0a-arquitectura-compartida` (o de `main` una vez integrada).
- Leé `AGENTS.md`, `docs/arquitectura-compartida/README.md`, `CONTRATOS.md`, `PROPIEDAD_DE_ARCHIVOS.md`, `ownership.json` y tu sección de `PAQUETES_AGENTES.md`.
- Trabajás **solo** en tus archivos permitidos. Si necesitás algo de otro paquete, usá la interfaz congelada o pedilo en el PR; **no edites** archivos ajenos ni `contracts/v1/**` (un cambio de contrato se propone en un PR de contrato aparte).
- No toques multijugador (`server/relay.js`, `js/net/net-*.js`), combate, progresión ni `assets/**`. No despliegues, no mezcles a `main`, no borres ramas ni worktrees.
- **Seguridad:** los detalles de debilidades se mantienen en el entorno privado del estudio. En código, comentarios, commits y PR públicos describí el comportamiento correcto y las pruebas, nunca cómo explotar algo.
- Antes de empezar: `git fetch`, registrá el SHA de `main`, corré `node tools/contracts/t_contract_independence.js` y los `t_contract_*`. Antes de entregar: corré de nuevo todo, `git diff --stat origin/main` y comprobá que solo cambiaron tus archivos.
- Informá con honestidad: qué quedó hecho, qué pruebas corriste (comando y resultado real), qué no pudiste correr y por qué. No declares éxito si falta una prueba o un permiso.

## Alcance

Archivos permitidos: `server/item-economy*.js`, `server/wallet.js`, `server/payments.js`, `server/entitlements.js`, `server/trades.js`, `server/shop-pieces.json`, `server/premium-packs.json`, sus `server/test-*`, `js/net/item-economy.js`, `js/data/pricing.js`, `tools/economy/**`, `docs/economia-seguridad/**`.
Contratos que poseés: `GameResult` y `EconomyTransaction` (`contracts/v1`), que debés cumplir sin modificar.

## Tareas

1. En el registro de la partida (`run.start`/`run.finish`) persistí `outcome` (victoria/derrota), lo que **declaró** el cliente (`claimed`) y `closedAt`, de modo que `fromServerRun(run, result)` sin datos extra produzca un `GameResult` válido y `eligible` cuando corresponda.
2. Hacé que **toda** acreditación (oro, gemas, objetos, Brasas) pase por una única función que construya y valide una `EconomyTransaction` (con `evidenceRef` para recompensas de partida) y deje un asiento de auditoría con **monto, moneda, cuenta y referencia**. Hoy el asiento de `run.finish` no incluye monto ni cuenta afectada.
3. Revisá cada fuente de recompensa de `liveCommand` y definí para cada una la evidencia que el servidor exige y el tope por cuenta y por día. El detalle de qué fuentes hoy dependen de datos declarados por el cliente está en **el anexo privado** que te entrega el director; no lo repitas en público.
4. Dejá la Economía V2 **apagada por defecto** (activación explícita, p. ej. `HORDA_ITEM_ECONOMY=1`) hasta que el director decida (D-03/D-16) y B confirme una base persistente (`/api/health` → `persistent:true`).
5. Publicá en `js/data/pricing.js` **una** función que devuelva el texto del aviso de compra según `PIECES_FOR_BRASAS`, para que `js/ui/legal.js` (C) y `js/net/account.js` (B) la consuman. No cambies `PIECES_FOR_BRASAS` sin decisión (D-04).

## Pruebas

- Verdes con `HORDA_ITEM_ECONOMY` en 0 y en 1: `cd server && npm ci && npm test`.
- `node tools/contracts/t_contract_economy.js` y `t_contract_schemas.js`.
- Nuevas pruebas en `server/test-item-economy*.js` y `tools/economy/`: recompensa única por partida con cualquier clave de reintento; reinicio a mitad de partida; asiento de auditoría completo; topes diarios; billetera con referencia única bajo concurrencia.
- Las pruebas de abuso (si las hay) se ejecutan en local o en la rama privada; en el PR público solo van pruebas de comportamiento correcto.
- Entregá `tools/economy/manifest.json` con los comandos para que C los registre en `run-all` y CI.

## Criterios de aceptación

1. El saldo sube exactamente una vez por partida aunque el cierre se repita con otras claves.
2. Con la V2 apagada el comportamiento observable es el de hoy (misma batería de servidor verde).
3. Todo asiento de la billetera y del libro valida contra `EconomyTransaction`.
4. `git diff --stat origin/main` no muestra cambios fuera de tus archivos permitidos; 0 cambios en combate, progresión y multijugador.
5. Informe final con comandos y resultados reales y la lista de lo no probado.
