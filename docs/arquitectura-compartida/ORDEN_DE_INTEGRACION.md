# Orden de integración recomendado

Principio: **contratos primero, después los tres paquetes en paralelo, y la activación al final**. Cada paso exige que la batería quede igual o mejor que la línea base de `RESULTADOS_DE_PRUEBAS.md`.

| Paso | Qué | Quién | Depende de | Puerta (debe pasar antes de seguir) |
|---|---|---|---|---|
| 0 | Integrar **esta** rama (contratos, pruebas, documentación). No cambia producción | Integrador | revisión del director | los 5 `t_contract_*` verdes; `git diff --stat` solo muestra `contracts/`, `docs/arquitectura-compartida/` y `tools/contracts/` |
| 0b | Deuda de S0: `world-v1`, `t_save_sanitize`, estado de pruebas | B (`t_save_sanitize`), C (estado de pruebas), director (`world-v1`, D-24) | paso 0 | los gates en rojo bajan a los que tengan decisión documentada |
| 1a | **B** Persistencia | B | paso 0, decisión D-02 | `/api/health` → `persistent:true` en un entorno de prueba; ensayo de reinicio y restauración |
| 1b | **A** Economía y seguridad (V2 apagada) | A | paso 0 | batería de servidor verde con la bandera en 0 y en 1; `t_contract_economy` verde |
| 1c | **C** Telemetría y QA (sin registrar aún los manifiestos de A y B) | C | paso 0, D-06/D-07/D-08 | `t_contract_telemetry` verde; consentimiento comprobado |
| 2 | C registra en `run-all` y CI las pruebas y manifiestos de A y B | C | 1a y 1b mezclados | `run-all` completo igual o mejor que la línea base |
| 3 | Ensayo conjunto en un entorno de prueba: partida completa → acreditación → reinicio → verificación → telemetría | Integrador | 1a, 1b, 1c, 2 | informe con comandos y resultados |
| 4 | **Activación** de la Economía V2 y de los topes | A, con el director | paso 3, D-03, D-16 y persistencia confirmada | decisión escrita del director |

**Por qué ese orden.** A y B pueden avanzar a la vez porque se tocan solo por interfaces congeladas (`project`, `recordLogin`, `walletApply`, `gmUpdate`). C va en paralelo con la excepción de que registrar pruebas ajenas exige que A y B ya hayan entregado su manifiesto. La activación de la V2 depende de B: sin base persistente se pierde el libro de la economía en cada reinicio.

**Orden de mezcla entre A y B si chocan.** Primero B (cambia el almacén), después A (se apoya en él). Si ambos tocaron `server/package.json`, gana B (dueño único); A pide la dependencia a B.

**Qué detiene la cadena.** Cualquier cambio en `contracts/v1/**` fuera de un PR de contrato; un paquete que edita un archivo ajeno; una prueba de contrato en rojo; una decisión del director sin tomar para el paso que la necesita.
