# Integración progresiva en la rama Beta

La rama **`beta/integracion`** nace de `main` y vive aparte: nada llega a `main` sin autorización del director. Cada componente entra por PR hacia `beta/integracion`, con la regresión corrida después de cada integración.

## Orden recomendado

| Paso | Qué entra | Por qué en este lugar | Puerta antes de mezclar |
|---|---|---|---|
| 0 | Crear `beta/integracion` desde `main` (`e194910b`) | punto de partida limpio | — |
| 1 | **PR #247** (S0A: contratos y documentación; 1 commit) | es la base: #248 la contiene | CI verde del PR; 168 comprobaciones de contrato |
| 2 | **PR #248** (S0B: correcciones, QA, relay; solo el delta sobre #247) | se apoya en #247; al mezclar después, Git no repite el commit de S0A | `qa.js --fast` verde en CI + regresión completa local; revisión independiente |
| 3 | **PR de arquitectura (S0C)**: contratos Beta, agente D, revisión, protección | se apoya en #248 | todo lo anterior |
| 4 | **Agente B** (persistencia) y **Agente A** (economía, con V2 apagada) en paralelo | no comparten archivos; se tocan por interfaces congeladas | `check-diff` + `accept.js` + revisión independiente; si chocan: `contract-conflicts.js` |
| 5 | **Agente C** (telemetría y consentimiento) | depende de la decisión D-06/D-07/D-08 | idem |
| 6 | **Agente D** (UI/arte) | independiente de A/B; usa `SkillEvent`/`ChampionSelection` | idem + `pixel-density` sin desvíos nuevos |
| 7 | Relay: **solo con el socio** | el relay real no lo toca ningún agente | `relay-smoke.js --url` contra un entorno de prueba del socio |
| 8 | Pasada a `main` | requiere autorización escrita del director y la protección de rama activa | `docs/operacion/PROTECCION_MAIN.md` |

**Regla de oro:** después de cada integración se corre `node tools/quality/qa.js --fast --out <carpeta fuera del repo>`; si baja de 131/131 o aparece un fallo nuevo, la integración se revierte (revert del merge en `beta/integracion`) antes de seguir.

## Qué no se hace en esta etapa

No se activa la Economía V2, no se publica una beta abierta, no se despliega, no se toca ni se reemplaza el relay real.
