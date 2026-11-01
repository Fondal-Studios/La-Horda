# Bloqueantes reales tras S0C

Los detalles técnicos de seguridad no figuran aquí: están en el anexo privado del estudio.

## Técnicos

| # | Bloqueante | Estado | Quién |
|---|---|---|---|
| 1 | **El workflow `QA regresion central` solo bloquea si es check requerido** | La protección de rama **no está verificada como activa** (sin permisos). Pasos exactos en `docs/operacion/PROTECCION_MAIN.md` | Director (administrador del repositorio) |
| 2 | **`pixel-density --strict` en rojo** (`world-v1`, ilustración) | Informativo; necesita arte nuevo o excepción firmada | Director (D-24) y Agente D |
| 3 | **Causa de `profeta cross:6` sin encontrar** | Hecha reproducible y con diagnóstico; no volvió a fallar | Agente C |
| 4 | **`lanes/test-sides` intermitente en CI** (color de un sprite) | Pasa en el reintento; pre-existente | Agente D / C |
| 5 | **Revisión independiente real pendiente** | Los PR #247, #248 y S0C los produjo la misma sesión: **no pueden aprobarse a sí mismos**. Falta una identidad de QA, una de arquitectura y la aprobación del director | Director |
| 6 | **Identidades de revisores verificables solo con protección de rama** | El registro de `reviews/` no prueba quién lo escribió | Director |
| 7 | **Aprobaciones con un solo director** | GitHub no deja aprobar el propio PR: decidir revisor humano o bajar el requisito | Director |
| 8 | **Postgres no probado localmente** | `server/test-postgres.js` solo corre en CI | Agente B |
| 9 | **Cobertura de líneas de código** | No se mide | Agente C |

## Negocio y producción (no se tocaron)

| # | Bloqueante | Quién |
|---|---|---|
| 10 | Cuentas sin persistencia en producción (`persistent:false`) y destino del servidor (D-02) | Director + socio |
| 11 | **Economía V2 apagada y sin cerrar** (detalle en el anexo privado de S0A); no activar (D-03/D-16) | Agente A |
| 12 | Telemetría opt-out y sin texto legal; consentimiento sin implementar (D-06/D-07/D-08) | Agente C |
| 13 | **Relay real:** no se tocó ni se probó; cualquier cambio de protocolo requiere coordinación con su responsable. `LobbyMessage` es solo lectura | Socio |
| 14 | Móvil real, carga y red real sin probar | Agente C |
