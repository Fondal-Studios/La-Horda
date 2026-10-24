# Sistema de ítems V2 — entrega parcial verificable

Fecha de trabajo: 23 de octubre de 2026 (Argentina).
Repositorio: Fondal-Studios/La-Horda. Base: `f62d181477adcb4607cc615411cc51bad769f681`.

**No cumple todavía los criterios de aceptación integrales. No desplegar la economía V2 en producción.**
La rama contiene mejoras integradas de inventario, desactivación de equipo por Brasas y una API económica optativa.
La API aún no abastece el inventario usado durante la partida. No se migraron saldos ni se emitieron reliquias en producción.

## Auditoría inicial

Se inventarió el árbol completo del repositorio (6.967 archivos versionados en la base) y se inspeccionaron los módulos relevantes; esto no equivale a revisar visualmente cada asset ni a jugar todos los modos.

- Motor propio en JavaScript, navegador/Canvas, scripts ordenados en `index.html`; no hace falta introducir un framework.
- Servidor Node.js con `ws` y `pg`. Relay multijugador: la simulación de partida es del anfitrión, no autoritativa en el servidor.
- Seis ranuras existentes: arma, escudo, casco, pechera, guantes, botas. Se conservan.
- `RARITIES` ya contiene las seis categorías solicitadas. El botín también usa `set` como categoría adicional; queda pendiente separar esa categoría de las rarezas sin romper tablas y UI antiguas.
- Inventario compartido `save.stash`, equipamiento por campeón y loadouts para invitados. Capacidad ordinaria: 30 objetos no equipados.
- Fusión anterior comprobaba tipo/rareza pero no tres identificadores distintos. Se corrigió.
- Reciclaje anterior podía consumir piezas comunes/raras útiles. No existía protección coherente de favoritos.
- Sets universales y conjuntos por campeón, predominantemente de cuatro piezas; Lucifer ya tiene seis. Sus bonus, poderes y skins son reutilizables.
- `item-procs`, `mythic-powers`, `build-powers`, afijos y modificadores de habilidades ya ofrecen vías para builds sin nuevas animaciones.
- Oro, gemas de mejora, objetos y progreso se envían desde el cliente en el guardado. Validar formato no prueba que se hayan ganado legítimamente.
- La billetera de Brasas tiene registro del servidor e idempotencia. Se encontró `PIECES_FOR_BRASAS=true`: permitía comprar equipo con dinero premium. Esta rama lo cambia a **false**; las compras anteriores permanecen intactas.
- Subsiste un pack de bienvenida que regala desbloqueos de campeones. Debe revisarse separadamente para una política estricta de monetización exclusivamente cosmética, preservando derechos de compras ya realizadas.
- Los intercambios existentes son de sala y bloquean únicos/conjuntos; no equivalen a una casa de subastas persistente. Se añade protección de favoritos/reservados también en ese circuito.
- Códice actual: catálogo y descubrimientos del guardado; no consulta todavía el nuevo registro de reliquias.
- Horda Infinita: ranking **semanal**, resultados declarados por cliente y filtros de plausibilidad. No permite atribuir honestamente un premio único a un resultado probado por servidor.
- Game Master ya dispone de autenticación, permisos y almacenamiento de operaciones. `gmUpdate` serializa escrituras en archivo y usa transacción con bloqueo de fila en PostgreSQL.
- Las últimas cinco arenas canónicas son Acuática, Laberinto, Abismo, Minas e Infernal.

## Cambios integrados en el cliente

- Gestión de botín activada por defecto; preferencias en Mi Inventario.
- Favoritos visibles; venta, descarte, fusión, recetas, reforja y transferencias antiguas respetan la protección.
- Autofusión solo de tres copias exactamente idénticas: se comparan todos los campos salvo UID, fecha de obtención y marcas de favorito/reserva. Excluye equipo en uso, comprado, mejorado, reservado, diseñado y de conjunto.
- Común → Raro; Raro → Muy raro. No genera legendarios, míticos ni únicos.
- Reserva visible y equipable cuando la bolsa está llena, con tope defensivo de 150 objetos totales. No es almacenamiento ilimitado. Al alcanzar ese tope sigue siendo necesaria la gestión del jugador.
- Reciclaje automático conservador de duplicados idénticos comunes/raros cuando está habilitado y la autofusión está deshabilitada. Conserva las gemas existentes como material; no añade una moneda.
- Mensajes de reciclaje limitados en frecuencia; contador de fusiones en las preferencias.
- Validación adicional contra fusionar el mismo UID tres veces.
- Brasas ya no compran piezas de set por la configuración compartida cliente/servidor. Las skins siguen vendiéndose.

## API económica implementada, desactivada por defecto

`server/item-economy.js`, integrada en las rutas de cuentas, requiere `HORDA_ITEM_ECONOMY=1` **y almacenamiento persistente**.

El estado vive en `operations.itemEconomy`. Se reutiliza `gmUpdate`; cada operación comprende saldo, propiedad, custodia de subasta, historial e idempotencia dentro de una misma escritura/transacción. No se importa oro ni inventario procedentes del cliente.

- `/api/economy`: cuenta, catálogo, objetos propios, anuncios abiertos, reliquias y estado real de preparación.
- `/api/economy/action`: fabricación, mejora, refinado, ascenso, favorito, publicación, compra, cancelación y presencia.
- `/api/gm/economy`: auditoría, cuentas, anuncios y reliquias; acceso exclusivo de owner.
- `/api/gm/economy/action`: configuración, otorgamientos administrativos auditados, liberación de reliquias y reserva de premios para meses futuros.
- Mutaciones con `requestId`; repetir la misma solicitud devuelve el resultado original. Reutilizarla con otro contenido devuelve conflicto.
- Objetos publicados quedan en custodia; no se pueden mejorar ni vender dos veces. Comisión congelada al publicar.
- Registro de cinco reliquias, un UID fijo por reliquia, propietario e historial, recuperación y reintroducción de la misma instancia.
- El inicio de sesión y la renovación de sesión mediante `/api/me` cuentan como actividad; no hace falta jugar. La recuperación se evalúa al acceder a la API y en esos eventos, **no mediante un proceso programado autónomo**.
- Aviso a los diez días disponible en la respuesta de la API; **no hay envío de email ni notificación fuera del juego**.
- Rango y planos pertenecen a la cuenta. Mejoras básicas garantizadas; avanzadas fallan sin destruir ni bajar nivel. Refinado acotado y dos elecciones de atributos al llegar a Maestro, con un componente aleatorio adicional.
- No hay endpoint que acepte resultados de combate, oro ganado, planos obtenidos o puntuaciones enviados libremente por el cliente.

El libro de operaciones es una solución de alfa para un volumen reducido, no una arquitectura de mercado masivo: fila JSON compartida, máximo 100.000 recibos, lectura completa de anuncios y auditoría creciente. El adaptador de archivos requiere un solo proceso escritor. Para escalar deben separarse tablas/índices, paginación y archivado sin perder idempotencia.

## Catálogo nuevo de la API

Cinco conjuntos seleccionados: Lucifer, Pacto del Glaciar, Corazón del Coloso, Tempestad Eterna y Profecía del Alba. Cada uno tiene seis recetas míticas universales en el catálogo del servidor. Se reutilizan los nombres, historias y valores base existentes.

**Pendiente:** trasladar esos diseños al catálogo activo de combate, completar sus iconos faltantes, adaptar bonus a seis piezas, balancear contra builds mixtas y conectar los desbloqueos cosméticos. No se han eliminado otros conjuntos ni sobrescrito sprites. No se produjeron ilustraciones nuevas.

Reliquias registradas:

| Reliquia | Arena | Ranura | Efecto existente propuesto |
|---|---|---|---|
| Corazón de la Marea | Acuática | Escudo | Égida |
| Hilo sin Fin | Laberinto | Botas | Furia Creciente |
| Corona del Abismo | Abismo | Casco | Resonancia Arcana |
| Ascua de Cerbero | Minas | Guantes | Estallido Ígneo |
| Último Juramento | Infernal | Arma | Festín de Almas |

Son entradas del registro, no reliquias que ya caen en partidas. Ilustraciones ausentes (`image:null`), efectos exclusivos y balance de combate pendientes. No se reutilizan los antiguos objetos de rareza Único como si fueran exclusivos del servidor.

## Economía y balance

Se inspeccionaron tablas actuales y el informe previo de economía. Ese informe describe un orden antiguo de arenas y no reemplaza una nueva medición. **No se cambiaron probabilidades de drop ni se afirman probabilidades definitivas.**

Los costes de la API son valores de ensayo: básico 300 oro/4 materiales; pieza mítica 25.000 oro/150 materiales; ascensos 2.000/10.000/40.000/100.000 oro; comisión 5 %. El coste de forja tiene multiplicador administrativo y la comisión/plazos son configurables. Requieren simulación de ingresos y duración actual antes de activación. Los nombres de rango son Aprendiz, Oficial, Artesano, Experto y Maestro Forjador.

No existe conexión todavía entre recompensas verificadas de partida y estos recursos. Los otorgamientos de pruebas son administrativos, auditados e idempotentes. No son una fuente jugable ni un sistema de drops terminado.

## Pruebas y evidencia

- `node tools/items/test-auto-inventory-unit.js`: 16 comprobaciones de lógica, más protección de tres tipos de objeto en intercambios antiguos. Usa los módulos reales y el normalizador de guardado.
- `node server/test-item-economy.js`: 49 comprobaciones HTTP más invariantes de dominio. Incluye seis compras concurrentes con una sola venta, permisos, saldo, reintentos, rollback, aislamiento frente a guardados manipulados, desbloqueo de conjunto, fallo de mejora, recuperación/reentrega y reinicio de almacenamiento de archivo.
- `node server/test-wallet-pieces.js`: 31/31 comprobaciones tras apagar la venta de equipo. Conserva cobertura histórica con override exclusivo de prueba; al retirarlo la venta sigue bloqueada.
- `npm test --prefix server`: suite completa aprobada antes de los últimos cambios en la política premium y la protección de intercambios; esas áreas se vuelven a ejecutar individualmente después.
- `tools/items/t_auto_inventory.js`: prueba de navegador preparada, **no validada**. Chromium headless sufrió SIGSEGV; el ejecutable completo falló al crear sockets con `Operation not permitted`. Hubo una desconexión temporal del entorno, recuperada posteriormente. No hay captura móvil aprobada ni verificación real de esta nueva interfaz.
- PostgreSQL: se reutiliza el adaptador existente, pero no se levantó una base PostgreSQL para probar esta nueva API. Concurrencia de varios procesos no verificada.
- Las pruebas de relay/intercambios existentes no equivalen a una partida cooperativa real ni a validar el equipamiento V2 en red.

## Estado de aceptación

| Requisito | Estado real |
|---|---|
| Seis ranuras y seis rarezas base | Existentes; conservadas |
| Botín automático/favoritos/fusión/reserva | Implementado; lógica probada; navegador pendiente |
| Builds y combate V2 | No integrado |
| Cinco conjuntos de seis piezas | Catálogo de API; combate/arte/balance pendientes |
| Variantes premium y prestigio jugable | Pendientes |
| Forja de cinco rangos | API probada; UI y obtención jugable de recursos/planos pendientes |
| Subastas | API persistente probada en archivo; UI, filtros, migración y circuito jugable pendientes |
| Vendedores automáticos | No implementados; desactivados |
| Brasas sin compra directa de equipo | Desactivado y probado; revisar pack de campeones |
| Reliquias exclusivas | Registro transaccional probado; drops/efectos/arte no integrados |
| Códice de reliquias | Datos API; sección visual pendiente |
| Inactividad | Recuperación por actividad de API probada; proceso programado y avisos proactivos pendientes |
| Temporadas mensuales | Reserva de premio futuro; ranking actual sigue semanal; cierre y entrega no implementados |
| Game Master | API owner; interfaz de gestión pendiente |
| Persistencia y antidupe V2 | Probadas en archivo; juego sigue usando el guardado anterior |
| Validación antitrampa de resultados | Pendiente; no hay simulación autoritativa en el relay |
| QA móvil/multijugador de los cambios | Pendiente |

## Bloqueos y siguiente integración necesaria

Los pendientes principales son trabajo de implementación, no permisos faltantes:

1. Definir y ejecutar la migración no destructiva desde el guardado editable al inventario autoritativo. No confiar automáticamente en los saldos y únicos del navegador.
2. Implementar una fuente de resultados/recompensas verificable por servidor. Un token de partida o filtros de plausibilidad solos no prueban que se ganaron oro, planos o puntuaciones.
3. Conectar equipamiento, combate, recetas, progresión y todos los modos al mismo registro, eliminando la doble autoridad sin perder los objetos antiguos.
4. Integrar UI de forja/subastas/Códice/GM, bonus de conjuntos, arte reutilizable y variantes.
5. Sustituir el ranking semanal por mensual, reservar premios, cerrar temporadas una sola vez y preservar ganador original e historial. No premiar automáticamente resultados cliente actuales.
6. Completar pruebas PostgreSQL, pruebas de navegador móvil y partidas multijugador.

## Despliegue y recuperación

- Mantener `HORDA_ITEM_ECONOMY` sin definir en producción. Las rutas V2 responderán 503 y no modificarán cuentas existentes.
- Para QA aislado: `npm ci --prefix server`, almacenamiento persistente (`DATABASE_URL` o volumen real con `DATA_DIR` y `DATA_PERSISTENT=1`), `HORDA_ITEM_ECONOMY=1`, y el mecanismo OWNER ya existente. Nunca marcar como persistente un directorio efímero.
- No habilitar en el servicio público mientras no se conecten las recompensas y el equipamiento autoritativos.
- Respaldar la base/volumen antes del despliegue. La API guarda su ledger dentro de operaciones; ese archivo/tabla debe formar parte del backup.
- Apagar el flag detiene las rutas V2; conserva el registro. No borrar operaciones ni restaurar solamente una parte de una venta.
- La interfaz de inventario y la política de Brasas son cambios independientes del flag; requieren despliegue del cliente y servidor coherentes y prueba de navegador antes de integrar.

## Archivos

Cliente: `js/data/pricing.js`, `js/systems/items.js`, `js/systems/ground-loot.js`, `js/systems/loot.js`, `js/systems/recipes.js`, `js/ui/inventory-ui.js`, `js/net/net-trade.js`.
Servidor: `server/item-economy.js`, `server/accounts.js`, `server/trades.js`, `server/package.json`.
Pruebas: `server/test-item-economy.js`, `server/test-wallet-pieces.js`, `tools/items/test-auto-inventory-unit.js`, `tools/items/t_auto_inventory.js`, `.github/workflows/item-economy.yml`.

No se fusionó en main ni se modificó Render. Esta entrega debe permanecer como PR en borrador.
