# Arquitectura Beta (S0C)

Sin rediseñar el motor: se agrega una capa de **coordinación** sobre el juego existente. El juego sigue siendo JavaScript sin build; el servidor Node (`server/`) y el relay del socio no cambian.

```
                    ┌────────────────────── contracts/v1 + registry.json ──────────────────────┐
                    │ GameResult · EconomyTransaction · PlayerProfile · TelemetryEvent          │
                    │ TelemetryConsent · SkillEvent · ChampionSelection · ArtAsset · LobbyMessage│
                    └───────────────▲───────────────▲───────────────▲───────────────▲───────────┘
   Agente A ───────────────────────┘               │               │               └─────────── Agente D
   Economía y seguridad      Agente B ─────────────┘               └──── Agente C         Fábrica de UI y arte
   server/item-economy*, wallet…    Persistencia y cuentas                 Telemetría, retención y QA
                                    server/accounts.js, js/storage/**      game-master (telemetría), legal, CI
        ▲                                   ▲                                    ▲                    ▲
        └────── puerta de propiedad (check-diff) · detector de conflictos (contract-conflicts) ───────┘
                                                │
        PRODUCCIÓN → QA → REVISIÓN ARQUITECTÓNICA → STAGING (beta/integracion) → APROBACIÓN (director)
                                                │
                       relay real (socio) ◄──── solo LECTURA: LobbyMessage + relay-smoke.js
```

Diagrama generado y verificado: [`DEPENDENCIAS.md`](DEPENDENCIAS.md).

## Piezas

| Pieza | Para qué | Dónde | Verificación |
|---|---|---|---|
| Contratos versionados (9) | Interfaces entre agentes y con el relay | `contracts/v1/`, `contracts/registry.json` | `t_contract_*` (schemas, registry, beta, economy, save_compat, telemetry, independence) |
| Propiedad de archivos (agentes A, B, C, D) | Que dos agentes no editen lo mismo | `docs/arquitectura-compartida/ownership.json` | `t_contract_independence`, `tools/agents/test-agents.js` |
| Puerta por PR | Rechaza archivos ajenos, prohibidos o del contrato | `tools/agents/check-diff.js` | corre en cada PR |
| Detector de conflictos | Retiene **solo** el contrato en disputa | `tools/agents/contract-conflicts.js` | `tools/agents/test-conflicts.js` |
| Especificaciones ejecutables | Puertas de entrada y aceptación por agente | `agents/<A|B|C|D>.spec.json`, `tools/agents/accept.js` | PENDIENTE = falta la prueba |
| Revisión independiente | Nadie aprueba su trabajo | `reviews/`, `tools/review/check.js` | `tools/review/test-review.js` |
| Pipeline de QA | Regresión única | `tools/quality/qa.js`, `qa-manifest.json` | `qa-regresion.yml` |
| Rama Beta | Integración aislada de `main` | `beta/integracion` | ver `ORDEN_INTEGRACION_BETA.md` |

## Cómo se detiene solo lo necesario

Si dos ramas cambian el mismo contrato (su esquema o su productor), `contract-conflicts.js` marca **HOLD solo de ese contrato** y deja seguir a las demás ramas; si dos ramas tocan el mismo archivo, marca **CHOQUE** y solo esas dos esperan. El arquitecto decide el orden. No hay un freno global.

## Lo que no cambia

El motor, el combate, la progresión, la economía activa (la V2 sigue **apagada**), el multijugador y el relay del socio. `LobbyMessage` es solo lectura.
