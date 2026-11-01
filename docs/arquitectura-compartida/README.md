# S0A — Arquitectura compartida y preparación multiagente

Estado: **preparación** (documentación, contratos de solo lectura y pruebas). No cambia el comportamiento de producción, la economía activa, el combate ni la progresión. Base: `main` @ `e194910bddf5d976778e1e8e949e3d440d71fc2d`.

| Documento | Contenido |
|---|---|
| [`CONTRATOS.md`](CONTRATOS.md) | Las cuatro interfaces versionadas, errores, compatibilidad |
| [`PROPIEDAD_DE_ARCHIVOS.md`](PROPIEDAD_DE_ARCHIVOS.md) + [`ownership.json`](ownership.json) | Quién puede tocar qué (el JSON lo verifica una prueba) |
| [`PAQUETES_AGENTES.md`](PAQUETES_AGENTES.md) | Paquetes A, B y C: archivos, interfaces, pruebas, aceptación |
| [`prompts/`](prompts) | Un prompt de implementación independiente por agente |
| [`ORDEN_DE_INTEGRACION.md`](ORDEN_DE_INTEGRACION.md) | Orden recomendado y puntos de control |
| [`RESULTADOS_DE_PRUEBAS.md`](RESULTADOS_DE_PRUEBAS.md) | Resultados reales y limitaciones |
| [`BLOQUEANTES.md`](BLOQUEANTES.md) | Lo que sigue pendiente |

## Mapa de la arquitectura

```
                         CLIENTE (navegador, sin build)
   js/storage/save*.js ─┐        js/net/item-economy.js        js/net/alpha-services.js
   js/net/account.js    │        (acciones de economía)        js/net/fondal-telemetry.js
            │           │                │                              │
   PUT/GET /api/save    │     POST /api/economy/action          POST /api/telemetry
            │           │      {op, args, requestId}            {session, build, events[]}
 ═══════════╪═══════════╪════════════════╪══════════════════════════════╪════════ SERVIDOR
            ▼           │                ▼                              ▼
   ┌────────────────┐   │      ┌──────────────────┐            ┌─────────────────┐
   │ B  accounts.js │◄──┘      │ A item-economy*  │            │ C game-master.js│
   │ cuentas, saves │ project()│   wallet.js      │ stateOf()  │  (ruta telemetría)
   │ store (archivo │◄─────────┤   entitlements   ├───────────►│                 │
   │ / Postgres)    │recordLogin│  payments, trades│  audit()   └─────────────────┘
   └───────┬────────┘          └────────┬─────────┘
           │ store.gmUpdate / walletApply / putSave (atómicos, propiedad de B)
           ▼
   horda_operations (fila única) · horda_saves · horda_wallet
 ─────────────────────────────────────────────────────────────────────────────
   contracts/v1  (puro, sin dependencias): GameResult · EconomyTransaction · PlayerProfile · TelemetryEvent
```

Las flechas entre cajas son **interfaces congeladas** (`ownership.json` → `frozenInterfaces`); un paquete nunca edita el archivo de otro.

## Verificación de S0

El plan de beta define S0 como «Triage de `main` y de las ramas en curso» (`docs/planificacion-beta/07_PLAN_MAESTRO_SPRINTS.md`). **S0 no se ejecutó**: se hizo un relevamiento de solo lectura, pero ninguna de sus tareas de corrección.

| Tarea de S0 | Estado verificado el 31-oct sobre `e194910b` |
|---|---|
| `pixel-density --strict` = 0 | **No hecho**: sigue saliendo con error (`world-v1` sin excepción) |
| Corregir `t_save_sanitize` y regenerar `ESTADO_DE_PRUEBAS.md` | **No hecho**: la prueba sigue fallando en 3 guardados reales; el estado de pruebas sigue citando `17c572a7` |
| Ramas en curso: actualizar, probar, decidir | **No hecho**: siguen 48 commits detrás de `main` |
| Respaldar el trabajo sin commit de `ciudad-mapa` | **Hecho solo en local** (ver abajo); no está en `origin` |
| Regenerar `control_produccion.json`, corregir `ARCHITECTURE.md` | **No hecho** |

Consecuencia: estos paquetes parten de una base con **5 pruebas rojas conocidas** (ver `RESULTADOS_DE_PRUEBAS.md`). Las pruebas de contrato de S0A no dependen de ellas.

## Protección del trabajo sin commit (`claude/ciudad-mapa`)

Antes de crear la rama se verificó que el árbol de trabajo de `claude/ciudad-mapa` tiene 28 entradas sin commit (4 modificadas, 24 nuevas) y que el respaldo previo coincide byte a byte con el estado actual. Se creó además un commit de respaldo **local** en la referencia `refs/backup/ciudad-mapa-wip-20261031` (28 archivos, 933 inserciones), sin tocar el árbol de trabajo. Ninguna operación de S0A modificó, limpió ni eliminó ramas ni worktrees. Falta subir ese respaldo a un lugar fuera de esta máquina (decisión pendiente, ver `BLOQUEANTES.md`).
