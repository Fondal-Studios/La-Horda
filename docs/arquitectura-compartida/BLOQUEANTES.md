# Bloqueantes pendientes

Los detalles técnicos de seguridad no figuran aquí: están en el anexo privado del estudio.

## De este trabajo (S0A)

| # | Bloqueante | Efecto | Quién lo resuelve |
|---|---|---|---|
| 1 | **S0 no se ejecutó**: `pixel-density --strict`, `t_save_sanitize`, `t_evolution`, `t_codex`, `lanes/postgame-test` siguen en rojo en `main` (ver `RESULTADOS_DE_PRUEBAS.md`) | No se puede afirmar «base verde»; las pruebas de contrato son independientes de esas cinco | Director + C/B |
| 2 | El respaldo del trabajo sin commit de `claude/ciudad-mapa` está solo en esta máquina (copia de archivos y referencia local) | Si se pierde el entorno, se pierde el respaldo | Director: ¿subirlo a una rama remota? |
| 3 | `server/test-postgres.js` no se ejecutó (no hay Postgres local) | La rama Postgres de `accounts.js` y de las migraciones no está probada aquí | B, con una base de prueba |
| 4 | No hay acceso a los ajustes de GitHub (protección de `main`, checks requeridos) | No se sabe si un check rojo bloquea una mezcla | Director: exportar las reglas |
| 5 | Las pruebas de contrato **aún no** están en `run-all` ni en CI (`tools/quality/run-all.js` y `.github/workflows/**` son de C) | Hoy se ejecutan a mano | C, paso 2 del orden |

## Decisiones del director que condicionan a los paquetes

| ID | Decisión | Bloquea |
|---|---|---|
| D-02 | Destino canónico del servidor y base de datos de producción | B (persistencia), activación de A |
| D-03 / D-16 | Cuándo se activa la Economía V2 y qué política de confianza rige | A (paso 4) |
| D-04 | `PIECES_FOR_BRASAS`: vender piezas con estadísticas o no (y el texto de compra) | A (texto), C (`legal.js`) |
| D-06 / D-07 / D-08 | Consentimiento de telemetría, edad mínima y correo de contacto | C (telemetría) |
| D-24 | Excepción firmada o repixelado de `world-v1` | S0 (gate de arte) |
| D-29 | Autorización para tocar el multijugador | topes del relay (fuera de los tres paquetes) |

## Límites de las pruebas de contrato

- Se ejecutan contra el servidor real **en proceso, en una carpeta temporal y en modo archivo**; no prueban Postgres, el proxy de producción ni la latencia de red.
- «Recuperación tras desconexión» se prueba con reinicio del proceso del servidor y reintentos del cliente; no con cortes de red reales ni con relay/WebSocket.
- La compatibilidad con guardados usa los 3 guardados reales del repositorio (10, 17 y 19 de octubre); no hay guardados de jugadores reales.
- No se midió el rendimiento ni la carga.
