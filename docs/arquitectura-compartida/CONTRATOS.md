# Contratos compartidos v1

Código y esquemas: [`contracts/v1/`](../../contracts/v1). Son **módulos de solo servidor y de solo lectura**: no se cargan en `index.html` y no alteran ninguna ruta. Los adaptadores leen los registros reales existentes (no los duplican).

## Reglas generales

1. **Versionado semántico por contrato.** `MAJOR` rompe, `MINOR` solo agrega campos opcionales, `PATCH` no cambia el esquema. Un consumidor acepta el mismo `MAJOR` y un `MINOR` igual o menor al suyo; **se actualiza primero al consumidor, después al productor**.
2. **Esquemas estrictos.** Todo objeto rechaza campos no declarados (`UNKNOWN_FIELD`), incluidos `__proto__`, `constructor` y `prototype`.
3. **El cliente declara, el servidor verifica.** Ninguna recompensa se acredita desde un dato declarado por el cliente (ver GameResult).
4. **Un solo propietario por contrato**; cualquier cambio exige un PR de contrato aprobado por los tres paquetes.

| Contrato | Versión | Propietario | Esquema | Adaptador sobre lo existente |
|---|---|---|---|---|
| GameResult | 1.0.0 | A | `game-result.schema.json` | `fromServerRun(run, result, known)` sobre `s.runs[id]` de `server/item-economy-live.js` |
| EconomyTransaction | 1.0.0 | A | `economy-transaction.schema.json` | `fromWalletEntry(e)` sobre el libro de `store.walletApply` |
| PlayerProfile | 1.0.0 | B | `player-profile.schema.json` | `fromSave(row, accountId)` sobre `store.getSave` / `GET /api/save` |
| TelemetryEvent | 1.0.0 | C | `telemetry-event.schema.json` | `toWire(event)` hacia la forma que acepta `POST /api/telemetry` |

## GameResult — resultados y evidencia de partidas

Separa tres cosas que hoy conviven en el mismo registro:

- `claimed`: lo que **declaró el cliente** (victoria, duración, ronda, puntaje). Informativo, nunca base de pago.
- `evidence`: lo que **observó el servidor** con su reloj (`startedAt`, `lastPulseAt`, `elapsedMs`, `pulses`, `closedBy`). `source` es `server_run` (partida abierta por el servidor) o `client_declared`.
- `verified`: lo ya contrastado por el servidor contra la evidencia.

Regla de acreditación (`credit.eligible: true`): exige `evidence.source = server_run`, `closedBy = finish`, `verified` presente, `outcome` conocido y `verified.durationMs ≤ evidence.elapsedMs + 5000`. Si falla, el error es `NOT_CREDITABLE`.

**Limitación conocida:** el registro actual de la partida no guarda si fue victoria ni lo que declaró el cliente. Por eso `fromServerRun` sin datos extra devuelve `outcome: unknown` y `credit.eligible: false`. El Agente A debe persistir esos dos datos para que el adaptador pueda acreditar.

## EconomyTransaction — acreditaciones, gastos e idempotencia

`txId` y `idempotencyKey` usan el mismo formato que las referencias de la billetera (`^[a-zA-Z0-9_.:-]{8,80}$`). `kind`: `credit` (>0), `debit` (<0), `refund` (>0), `adjust` (cualquiera, incluso 0 para los asientos de bienvenida). Monedas: `gold`, `materials` (gemas del juego) y `brasas`.

- `run_reward` y `chest` **exigen `evidenceRef`** (id de la partida) y `actor: server`.
- **Idempotencia:** misma clave y mismo contenido = repetición legítima (`compareReplay` → `replay: true`); misma clave y contenido distinto = `IDEMPOTENCY_MISMATCH`. Hoy lo cumplen el libro de la billetera (`ref` única) y los recibos de `POST /api/economy/action` (`IDEMPOTENCY_CONFLICT`, 409).

## PlayerProfile — identidad, progreso, campeones y migraciones

Es una **proyección de lectura**; el guardado sigue siendo el formato de persistencia. Incluye versión en la nube (`cloudVersion`, usada para control de conflictos), `itemSchemaV`, tamaño (máx. 512 KB), migraciones aplicadas y, por campeón, `level`, `xp` y `unlocked`. El registro declarativo de migraciones está en `contracts/v1/migrations.js` y **apunta** a quien las ejecuta hoy (`js/storage/save.js`, `js/storage/legacy-champion-ids.js`, `server/item-economy-live.js`); no migra nada por sí mismo.

## TelemetryEvent — eventos, errores, rendimiento y trazabilidad

Anónimo por diseño: sin cuenta, nombre, texto, correo, IP, URL ni pila de errores (`PII_FIELD`). `name` debe estar en la lista cerrada de `POST /api/telemetry` (`ACCEPTED_EVENT_NAMES`, comprobada contra `server/game-master.js` por una prueba). Los eventos `session_end`, `client_error`, `perf_sample` y `retention_day` están **propuestos**: el servidor actual los rechaza (400) hasta que el Agente C los habilite. `traceId` permite correlacionar un evento con una partida sin identificar a la persona. `toWire` informa en `dropped` lo que el servidor actual no acepta (por ejemplo `fps`).

## Errores

Los códigos son estables; cambiar o quitar uno es un cambio `MAJOR`.

| Código | Significado |
|---|---|
| `BAD_TYPE` | tipo incorrecto |
| `MISSING_FIELD` | falta un campo obligatorio |
| `UNKNOWN_FIELD` | campo no declarado en el contrato |
| `OUT_OF_RANGE` | valor fuera de rango |
| `BAD_FORMAT` | formato inválido |
| `BAD_ENUM` | valor fuera de la lista cerrada |
| `TOO_LONG` | texto o lista demasiado largo |
| `BAD_VERSION` | versión ausente o mal formada |
| `UNSUPPORTED_VERSION` | versión mayor no soportada |
| `UNKNOWN_CONTRACT` | contrato desconocido |
| `PII_FIELD` | campo con datos personales no permitido |
| `NOT_CREDITABLE` | el resultado no tiene evidencia verificada por el servidor |
| `EVIDENCE_REQUIRED` | la acreditación exige una referencia de evidencia |
| `IDEMPOTENCY_MISMATCH` | misma clave de idempotencia con contenido distinto |
| `SIGN_MISMATCH` | el signo del monto no corresponde al tipo de asiento |
| `UNKNOWN_MESSAGE` | tipo de mensaje de sala no cubierto por el contrato |
| `NOT_CONSENTED` | la telemetría exige un consentimiento explícito del usuario |
| `DUPLICATE_CHAMPION` | campeón repetido en la selección |
| `NOT_UNLOCKED` | el campeón elegido no está desbloqueado |
| `INCOMPLETE_EVENT` | al evento le falta un dato que su tipo exige |

## Cómo se prueba

`node tools/contracts/t_contract_<schemas|independence|save_compat|economy|telemetry>.js` (ver `RESULTADOS_DE_PRUEBAS.md`). Cada documento de este directorio que cita un código o archivo lo verifica una prueba.

## Contratos de la arquitectura Beta (S0C)

Registro completo con dueño, consumidores, esquema, adaptadores, productor y pruebas: [`contracts/registry.json`](../../contracts/registry.json). Diagrama generado: [`DEPENDENCIAS.md`](DEPENDENCIAS.md).

| Contrato | Área | Dueño | Consumidores | Qué es |
|---|---|---|---|---|
| `TelemetryConsent` 1.0.0 | Telemetría y consentimiento | C | D, B | Estado de consentimiento de UN navegador (`granted`/`denied`/`unset`). `granted` exige `source=user_choice` y fecha; un navegador automatizado nunca consiente. **El cliente actual todavía envía salvo que valga `off` (opt-out)** y por eso `fromConsentStorage` lo modela como `unset`, no como consentido |
| `SkillEvent` 1.0.0 | HUD y eventos de habilidades | D | C | Estado de un botón de habilidad (`cast`, `ready`, `blocked`, `ult_ready`) de un campeón; `blocked` exige motivo, `cast` exige `cooldownMaxMs`. Es la única entrada del HUD y de la telemetría de habilidades |
| `ChampionSelection` 1.0.0 | Selección de campeones | D | A, B, C | Campeón elegido, hasta 3 aliados sin repetir y los desbloqueados; el elegido debe estar desbloqueado. Los derechos reales los decide el servidor |
| `ArtAsset` 1.0.0 | Fábrica artística y UI | D | C | Un archivo de arte con ruta bajo `assets/`, formato, tamaño, `sha256`, procedencia y resultado de `pixelDensity`/style gate/emoji-lint; una excepción de densidad exige su motivo. Un activo que falla la puerta se **registra como `fail`**, no se maquilla |
| `LobbyMessage` 1.0.0 | Lobby y multijugador | **ARQ (solo lectura)** | C, D | Mensajes del protocolo de salas del relay (`create`, `join`, `rooms`, `ping`, `leave` y las respuestas `joined`, `rooms`, `pong`, `error`), validados contra un relay real en proceso. Lo administra el responsable del relay: ningún agente lo modifica. No cubre `msg`, chat ni intercambios |

Los contratos de S0A cubren las áreas **Economía y transacciones** (`GameResult`, `EconomyTransaction`), **Persistencia de usuarios** (`PlayerProfile`) y **Telemetría** (`TelemetryEvent`).

`LobbyMessage` no lleva el campo `version`: versiona el **protocolo** del relay (`PROTOCOL = 1`, `NET_PROTOCOL` del cliente). Se valida con `validate('LobbyMessage', mensaje, { direction: 'c2s' | 's2c' })`.
