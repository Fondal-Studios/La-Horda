# Economía e ítems V2 — estado real de integración

Repositorio: `Fondal-Studios/La-Horda`. PR #211, rama `feat/item-economy-v2`.
Actualizado: 24 de octubre de 2026 (UTC).

**No apto todavía para fusionar o activar en producción.** Se implementó el circuito principal y se probó por HTTP y navegador, pero la compatibilidad con fuentes económicas antiguas aún no está completa. La solicitud de fusionar a main está autorizada; no requiere otra confirmación. La fusión queda pendiente por defectos de integración, no por falta de permiso.

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

## Arquitectura implementada

El motor sigue siendo JavaScript/Canvas, con scripts globales. El relay Node.js mantiene la simulación del anfitrión. El registro económico vive en `operations.itemEconomy`; reutiliza la cola y escritura atómica del adaptador de archivos y la transacción con bloqueo de fila de PostgreSQL.

- `server/item-economy.js`: propiedad, saldos, recetas, subastas, reliquias, idempotencia, auditoría y permisos owner.
- `server/item-economy-live.js`: migración, proyección al formato de guardado existente, sesiones de combate, botín, reglas automáticas y temporadas.
- `js/net/item-economy.js`: conecta entradas/salidas reales de campaña y Horda Infinita, eventos de botín del anfitrión/invitado y operaciones de inventario.
- `js/ui/item-economy-ui.js`: Arsenal, Forja, Subastas, Colección, Reliquias y Temporada; extensión del panel Game Master.
- `js/data/mythic-sets-v2.js`: cinco conjuntos universales de seis ranuras, usando los efectos existentes.
- `js/assets/mythic-collection-meta.js`: manifestaciones cosméticas que reutilizan arte y VFX existentes.

No se añadió dependencia de ejecución. No se implementó metamorfosis. No se eliminaron sprites ni conjuntos anteriores.

## Migración y propiedad

La migración se realiza una sola vez desde el guardado ya almacenado en el servidor. Conserva una copia íntegra en `migrations[account].backup`, con fecha y versión. Cada UID anterior se transforma en un identificador determinístico por cuenta; se remapean las seis ranuras, favoritos, oro y materiales. Se conserva además una copia del estado local antes de aplicar la primera proyección, cuando localStorage lo permite.

Las piezas anteriores quedan marcadas `legacy`: se pueden usar, mejorar y vender al sistema, pero no publicar en subastas. Es una cuarentena necesaria porque su procedencia era editable en el navegador. Los únicos anteriores no se registran como las nuevas reliquias irrepetibles. Esta restricción comercial debe comunicarse antes de una migración pública.

Los PUT de guardado no pueden reemplazar el saldo o inventario autoritativo después de migrar. Un primer guardado de una cuenta nueva no puede inyectar oro o desbloqueos arbitrarios. El primer campeón se selecciona mediante una operación del servidor. Las compras anteriores de campeones del pack de bienvenida se reconcilian con el libro económico para conservar esos derechos.

**Límite:** no se importa automáticamente un inventario que solo exista offline. La copia local evita perder su evidencia, pero no constituye una conciliación aprobada de ese inventario con la cuenta.

## Combates y botín

`run.start`, `run.pulse`, `run.loot`, `run.finish` y `run.abandon` identifican una sesión y su propietario. El servidor elige el objeto, acredita recursos y registra el resultado una sola vez. Comprueba tiempos, pulsos, progresión de rondas y un límite de puntuación; rechaza reutilizaciones inconsistentes. No acepta un importe de oro ni una rareza elegidos por el cliente.

Los eventos de botín se recogen automáticamente. El límite defensivo es un objeto por cada veinte segundos transcurridos, máximo 120 por sesión. Se usa el multiplicador de rareza alta de la fuente normal ya existente. El cofre final usa la tabla de arena. Estos límites son provisionales y requieren medir partidas reales antes de activar la economía pública.

No hay interrupción por capacidad del inventario de cuenta: los objetos se conservan en el registro. Los materiales están fuera de las ranuras. La gestión automática, activada por defecto, solo fusiona tres duplicados idénticos comunes/raros; excluye favoritos, equipo usado, piezas diseñadas, fabricadas, antiguas y reliquias. El desmantelamiento adicional de duplicados requiere activación explícita. Nunca automatiza la destrucción de rarezas altas.

Durante una sesión se bloquean cambios de equipo, venta, fabricación y publicación. Las actualizaciones de cuenta respetan `loadoutItems`, el equipo temporal de los invitados. Pausa y selección de mejoras no abandonan la sesión. Los modos con equipamiento normalizado o exploración no se migraron al circuito de premios.

**Seguridad real:** el anfitrión todavía simula el combate. Los filtros de plausibilidad NO demuestran que una victoria o puntuación sea legítima. Falta una fuente autoritativa de resultados; por ello no se debe activar la entrega competitiva de reliquias en un servidor público con este estado.

## Forja, subastas y economía

Cinco rangos: Aprendiz, Oficial, Artesano, Experto y Maestro Forjador. Hay seis recetas básicas y treinta piezas míticas. Los planos raros se aprenden sin ocupar inventario; las victorias habilitan desafíos de herrería. Mejorar hasta nivel 4 es seguro; los intentos avanzados pueden fallar, conservando objeto y mejoras. Maestro permite elegir hasta dos atributos y mantiene un atributo aleatorio. Los afijos usan el formato real del motor y valores acotados.

Subastas de compra inmediata: publicar, comprar, cancelar, filtrar por rareza/ranura/afijo, inspeccionar atributos y creador. Depósito de objetos publicados, cobro y transferencia atómicos, comisión congelada al publicar. Reintentos devuelven el mismo resultado. Se probaron seis compras simultáneas: una venta y cinco conflictos.

Parámetros iniciales de ensayo, no balance definitivo:

| Regla | Valor de ensayo |
|---|---|
| Oro de victoria | 1.200 + 40 por minuto, máximo 10.000 por sesión |
| Materiales de victoria | 3 |
| Receta básica | 300 oro / 4 materiales |
| Pieza mítica | 25.000 oro / 150 materiales |
| Ascensos | 2.000 / 10.000 / 40.000 / 100.000 oro |
| Comisión | 5 % |
| Plano especial | 5 % en victorias desde Acuática |

Se conservaron los pesos existentes por arena; el peso de conjunto se incorpora a Mítico. El Game Master puede editar tablas, costes y plazos. No se añadió una moneda: Gemas se reutilizan como materiales y Brasas permanecen en su billetera premium. La compra de equipo por Brasas está desactivada y probada. Los vendedores automáticos no están implementados y permanecen desactivados.

El libro JSON es una solución de alfa: lectura completa, auditoría creciente y máximo 100.000 recibos. Los pulsos no llenan el libro de recibos. El adaptador de archivos exige un único escritor. PostgreSQL, paginación y comportamiento a escala todavía necesitan pruebas específicas.

## Conjuntos, cosméticos y assets

| Conjunto | Piezas | Orientación / mecánica reutilizada | Arte y VFX reutilizados |
|---|---:|---|---|
| Lucifer | 6 | Ofensiva, quemadura, baja vida | Manada |
| Pacto del Glaciar | 6 | Ralentización y fragmentos | Convergencia |
| Corazón del Coloso | 6 | Mitigación, onda y escudos | Marea |
| Tempestad Eterna | 6 | Golpes y descarga encadenada | Sistema |
| Profecía del Alba | 6 | Curación y amanecer | Custodio |

Se redistribuyeron los umbrales de los antiguos conjuntos de cuatro piezas a 2/4/6; Lucifer conserva sus umbrales existentes. Las nuevas piezas utilizan las siluetas de ítems existentes con un sello de identidad propio. Se preservó el arte original de los demás objetos.

Completar la colección libera permanentemente la manifestación base, que no se vende por Brasas ni se entrega como regalo inicial. Hay una variante Astral general y una Consagrada que exige completar el conjunto; ambas cuestan el escalón cosmético existente. La base es una recompensa exclusiva de juego. Cambian los efectos visuales de habilidades, no las estadísticas ni el equipo. **No son treinta sprites nuevos ni nuevas animaciones:** las manifestaciones usan los VFX y las ilustraciones indicadas. Falta validar artísticamente su resultado en todos los campeones y medir el balance de builds mixtas frente a conjuntos completos.

## Reliquias, Códice y temporada mensual

Cinco reliquias iniciales: Corazón de la Marea (Acuática), Hilo sin Fin (Laberinto), Corona del Abismo (Abismo), Ascua de Cerbero (Minas) y Último Juramento (Infernal). Cada una tiene UID fijo, estado, propietario e historial. Los drops de victoria usan la probabilidad única ya existente y comprueban disponibilidad. No se pueden fabricar. Los efectos reutilizan procs existentes; no se afirma que sean cinco mecánicas exclusivas nuevas ni que su balance esté aprobado.

El Códice/Arsenal muestra estados, método de obtención, arena e historial. La ilustración actual de reliquias reutiliza un icono de habilidad: faltan cinco ilustraciones diferenciadas aprobadas.

La recuperación usa 14 días, con aviso almacenado desde el día 10; iniciar sesión basta. Hay barrido periódico cada diez minutos, además de comprobación al acceder. El aviso es dentro del juego, no email. La Bóveda reintroduce la misma instancia y conserva el historial. No se permite entregarla a una cuenta inexistente.

Las temporadas usan meses calendario UTC. Cada mes reserva una corona irrepetible; una configuración administrativa puede reservar otra reliquia para un mes futuro. El cierre ordena resultados, transfiere una única instancia y conserva el nombre del ganador original aunque se venda. Los campeones mensuales anteriores se muestran sin ranking acumulativo. Se rechazó la antigua ruta de envío directo de puntuaciones. Las pruebas cubren cambio de mes, doble cierre, venta y reinicio.

## Interfaces

Arsenal accesible desde Opciones; accesos desde Inventario a Forja/Subastas y desde Códice a Reliquias Únicas. Navegación por pestañas, controles táctiles, cierre por Escape, foco contenido en el modal y etiquetas accesibles. La UI usa respuestas reales de la API, no datos de demostración.

Game Master incluye configuración económica, tablas, Bóveda, reserva de premios, totales y registro. Las rutas nuevas restringen las operaciones a owner. No se implementaron dashboards de cohortes de retención ni detección automática de anomalías.

## Pruebas verificadas

- API: 49 comprobaciones HTTP de `test-item-economy.js`, más invariantes de dominio.
- Integración: 51 comprobaciones HTTP de `test-item-economy-live.js`: migración, snapshot, rechazo de guardado manipulado, sesiones, botín, equipamiento, subasta, premio mensual, historial, reinicio, compra cosmética restringida y autofusión protegida.
- Inventario: 16 comprobaciones de dominio más protección de intercambios antiguos.
- Billetera: 65/65 con V2 activado, después de reconciliar derechos de campeones. Venta premium de piezas: 31/31.
- Regresión histórica del servidor: `HORDA_ITEM_ECONOMY=0 npm test --prefix server`, completada. Esto prueba el contrato anterior desactivando V2; **no equivale a aprobar todos los flujos antiguos con V2 activado**.
- Análisis sintáctico: 454 scripts referenciados por index existen y compilan.
- GitHub Actions sobre `ebb2df5b`: `Item economy safety` aprobado, incluyendo inventario móvil y UI persistente con API real (fabricar, favorito, equipar, pestañas, ancho móvil y preservación de equipo invitado). `Health HUD visual regression` aprobado.
- La prueba de identidad de iconos pasó las comprobaciones de dibujo. La evidencia se actualizó con los conteos emitidos por GitHub en el run 40051508019: 289 objetos, 274 iconos distintos antes, 289 después y 270 preservados. La verificación final del recibo actualizado queda pendiente.
- Chromium local no pudo arrancar por restricciones del entorno. Las comprobaciones de navegador citadas fueron ejecutadas por GitHub Actions.
- No se validó una instancia PostgreSQL ni una partida completa con dos dispositivos humanos.

## Defectos de integración que bloquean main

1. **Misiones, pase y cofres antiguos:** todavía modifican `save.gold`, `save.gems` o agregan ítems localmente. La proyección del servidor puede reemplazar esas recompensas. Hace falta un adaptador que emita recibos validados, sin aceptar importes elegidos por el cliente. No se debe eliminar la funcionalidad ni simular que el premio se conservó.
2. **Game Master anterior y progresión especial:** algunos otorgamientos, ajustes de moneda y desbloqueos siguen escribiendo en el guardado antiguo. Deben integrarse con el registro y probarse con V2 activo. La pestaña económica nueva sí opera sobre el registro correcto.
3. **Resultados de combate:** la validación temporal no impide que un anfitrión modificado fabrique un resultado plausible. No es suficiente para premiar reliquias competitivas en producción.
4. **Conectividad y cuentas offline:** falta completar la conciliación de partidas iniciadas antes de cargar la economía y de inventarios que nunca se subieron a la nube.
5. **Regresión completa y balance:** falta cerrar toda la matriz de modos, PostgreSQL, balance y evidencia gráfica actualizada. Los checks de lógica/API aprobados no sustituyen esos controles.

Estos son pendientes de implementación y validación, no limitaciones inventadas de permisos. **No se ha fusionado a main ni desplegado en Render.**

## Despliegue de QA y recuperación

Solo en un entorno aislado con copia de los datos: `npm ci --prefix server`; configurar `DATABASE_URL` o un volumen persistente real con `DATA_DIR` y `DATA_PERSISTENT=1`; habilitar `HORDA_ITEM_ECONOMY=1`. En esta rama el valor por defecto también activa V2; usar `0` solo para probar el contrato anterior del servidor. No publicar esta rama con datos reales mientras existan los defectos anteriores.

Respaldar conjuntamente cuentas, guardados y operaciones antes de migrar. Las copias de migración están en el registro. Una recuperación debe restaurar cliente y servidor compatibles junto con el snapshot completo; no restaurar aisladamente el objeto, saldo o una sola parte de una venta. Apagar una bandera no sustituye una recuperación coordinada.

## Archivos y commits

Los cambios están organizados en commits de base económica, migración/combate/temporadas, UI/cosméticos, pruebas y correcciones. El diff de PR #211 enumera todos los archivos. Las incorporaciones principales son los seis módulos descritos en Arquitectura, `css/item-economy.css`, `server/test-item-economy-live.js` y `tools/items/t_economy_live.js`; también cambian los puntos de integración de cuentas, billetera, inventario, fin de combate, conjuntos y ranking.
