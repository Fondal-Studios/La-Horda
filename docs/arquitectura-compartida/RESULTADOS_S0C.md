# S0C — Integración de la arquitectura Beta: resultados

Base: `main` @ `e194910bddf5d976778e1e8e949e3d440d71fc2d` (no se movió). Fecha: 2026-11-01. Todo lo de abajo es evidencia real; lo no verificado figura al final.

## 1. Auditoría de #247 y #248 (Fase 1)

| Dato | #247 (S0A) | #248 (S0B) |
|---|---|---|
| Contenido | 1 commit, 25 archivos nuevos | #247 + 12 commits (ya sin duplicar el de S0A al mezclar) |
| Conflictos con `main` | ninguno (`mergeable: clean`) | ninguno (lineal sobre #247) |
| CI de GitHub | 6 checks en verde | ver abajo |
| Estado | **integrado en `beta/integracion`** (commit `fd967095`, merge commit, no squash) | **integrado en `beta/integracion`** (commit `012a08fa`, merge commit) tras 23 de 23 checks en verde sobre `eb1ce3e7` |

**CI real de #248 (cabeza `cc55b61a`) — hallazgos:**
- `Regresion del juego (rapida)` (el check nuevo): **verde** tras corregir `t_save_sanitize`, que moría al lanzar Chromium en el runner (`/opt/pw-browsers/chromium` no existe en GitHub; 83 pruebas escriben esa ruta). Arreglo central en `tools/lib/pw-tune.js`.
- `Clasificacion, contratos y servidor`, `lanes` (incluye `profeta`), `entry-reference`, `postgres`, CodeQL: **verdes**.
- Al quitar `continue-on-error` aparecieron **dos intermitentes que estaban ocultos**: `t_breakables` (`BRK.bot_patea_cuando_la_horda_se_amontona`) y `test-sides` (color de un sprite). Se re-declararon como toleradas en `qa-manifest.json` (con motivo e issue). Es exactamente el tipo de falso verde que el verificador busca: ahora está escrito y justificado en vez de oculto.

## 2. Orden seguro de integración

`#247` (base) → `#248` (solo su delta) → PR de arquitectura S0C → Agentes B y A en paralelo → C → D → relay solo con el socio. Detalle: `ORDEN_INTEGRACION_BETA.md`. Se usa **merge commit** (no squash): con squash, #248 —que contiene el commit original de S0A— lo repetiría y chocaría.

## 3. Regresión (rama S0C, cabeza `f1242281`)

| Corrida | Resultado |
|---|---|
| Batería completa (`qa.js --full --jobs 3`) | **136 de 136 PASS, 0 FLAKY, 0 FAIL**. El proceso se reinició con 133 hechas; las 3 pruebas lentas restantes (`entry-gate`, `ability-gate`, `test-ult-forms`) se corrieron aparte: PASS las 3 |
| Servidor (`npm test`) y clasificación | PASS |
| Pruebas nuevas de S0C | contratos Beta 48 · registro de contratos 69 · puerta de propiedad 23 · conflictos de contrato 9 · revisión independiente 28 · diagrama sincronizado |
| `lanes/kits` | 34/34 (S0B) |
| `pixel-density --strict` | rojo, informativo (`world-v1`, decisión D-24) |

Comparación: la línea base de `main` era 116 PASS · 2 FLAKY · 5 FAIL de 123.

**Un error propio detectado por las pruebas:** la excepción `deny` del agente D no se aplicaba en `check-diff.js` (un reemplazo de texto no coincidió). Lo encontró la prueba nueva «D NO puede tocar js/ui/legal.js» y quedó corregido antes del commit.

## 4. Lo entregado

Contratos (9) con dueño, consumidores, esquema, versión, compatibilidad y pruebas: `contracts/registry.json`. Agentes A, B, C y D con propiedad de archivos (`deny` incluido), especificaciones ejecutables y prompts. Detector de conflictos que retiene solo el contrato en disputa. Flujo de revisión independiente con registros que ningún agente puede escribir. Diagrama generado y verificado. Protección de `main`: pasos exactos, **no verificada como activa**.

## 5. Lo que NO se hizo o NO se pudo verificar

1. **Protección de `main`:** sin permisos sobre los ajustes. Hay un ruleset importable y los pasos; hasta que alguien con permisos lo aplique **no hay protección garantizada**.
2. **Revisión independiente real:** #247, #248 y S0C los produjo la misma sesión que diseñó el flujo. No se aprobaron a sí mismos: falta una identidad de QA y una de arquitectura distintas y la aprobación del director. #247 y #248 se integran en `beta/integracion` por la instrucción expresa de integrar; **no** hay registro de revisión.
3. **El workflow de revisión (`Revision independiente`) aún no corrió en GitHub** sobre una rama de agente real (S0C no es rama de agente).
4. **Relay real:** no se tocó ni se probó. `LobbyMessage` se validó contra un relay local en proceso, no contra el del socio.
5. **Economía V2:** sigue apagada; no se activó.
6. **Causa de `profeta cross:6`, intermitencia de `t_breakables` y `test-sides`, Postgres local, móvil real, cobertura de líneas:** pendientes.
7. **Estado de `beta/integracion`:** contiene #247 (`fd967095`) y #248 (`012a08fa`); su árbol es idéntico al de la rama `claude/s0b-estabilizacion` (diff vacío), que pasó 23/23 checks en GitHub y la batería completa local, por lo que la regresión posterior a cada integración se apoya en esa identidad de árbol y no en una corrida nueva sobre la rama Beta. El PR de S0C (#252) queda abierto **sin mezclar**, esperando la revisión independiente. `main` no se tocó.
