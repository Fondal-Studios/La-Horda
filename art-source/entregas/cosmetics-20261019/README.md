# Oficios del Fin — entrega parcial, 2026-10-19

Continúa Q5 y Brasa (#148). Son skins de campeones existentes, no campeones nuevos. Fuentes propias generadas con imagegen respetando cada identidad; no se usaron donantes ajenos. Las cuatro fuentes iniciales están en c1d3ec34. Importar no equivale a aprobar ni publicar.

## Candidatas integradas en esta rama

- Garren, Campanero de Porcelana (`eslabon_porcelana`, B636): porcelana marfil/cobalto, hombrera de campana, cadena cerámica.
- Morwen, Herbolaria de Escarcha (`morwen_escarcha`, B643): abrigo de boticaria, orejeras, frascos de vidrio, sin sombrero.

Tienda, colección Oficios del Fin, historia y descripciones en español, packs propios con36 poses. Cuatro direcciones: izquierda por espejo según contrato existente. Cast/ultimate/muerte comparten poses frontales según formato vigente. Reutilizan VFX/audio originales de forma explícita, sin estadísticas. Precio del nivel de autor existente:12000 oro /1200 Brasas. No se activan cobros reales.

Pruebas locales: importación reproducible y Style Gate; Roster Gate139 apariencias sin fallos; regresión de skins6181 comprobaciones sin fallos, incluyendo dos comprobaciones explícitas de exclusión del taller rechazado; precios29/29. Por candidata:13 comprobaciones de compra, equipamiento, coste exacto, campeón incorrecto, progreso, estadísticas, atlas, animaciones, densidad a escala medida del renderer y guardado;36 fotogramas sin excepciones. Por candidata:7 comprobaciones con relay descartable y dos clientes, host e invitado como portador; atlas correcto en ambos renderers y habilidad ejecutada, cero errores JS.

Revisión visual asistida por Codex, sin atribuir aprobación al owner ni a un artista humano: previews comparan Tanque y cuatro direcciones originales/nuevas a escala real; se revisaron cabeza/cuerpo, apoyo, contorno e identidad. Scanner: alfa binaria, cero fragmentos;4 y3 posibles píxeles claros respectivamente, por debajo del umbral15 existente. No se ocultaron datos ni aplicaron filtros para aprobar.

## Rechazadas, fuera de la tienda

- Farolero, Guardavía de Medianoche: densidad v1 falla por estilo de ilustración en13/36 frames. Redibujo v2 falla en9/36. Ambos resultados se conservan en runtime. La fuente principal/atlas siguen siendo v1; rejected-v2-source.png conserva el intento v2.
- Dáriel, Luthier de los Autómatas: v1 falla densidad en frame23. V2 falla fábrica:35 siluetas separadas en lugar de36. La fuente principal/atlas siguen siendo v1; se conserva el intento rechazado por separado.

No se registran las dos skins rechazadas. No bajar umbrales, agregar excepciones ni sustituir poses. Próximo paso: corrección artística focalizada y repetir todos los gates antes de registro.

## Recuperación e integración

El directorio local original dejó de estar disponible antes de subir el commit local5dbde1fc. Se recuperaron las fuentes desde GitHub c1d3ec34 y las pruebas desde los logs conservados. Esta rama reconstruye la integración, vuelve a probarla y conserva los resultados. No se afirma que el commit local perdido esté publicado.

PR #150 depende de #148. El CI dedicado reproduce y prueba sólo las dos candidatas; el catálogo exige que las rechazadas sigan ausentes. Las fuentes en art-source no cuentan como contenido jugable. Main y despliegue público se verifican aparte. No se modifican infraestructura, cuentas, permisos o billeteras. Rendimiento en teléfono físico y acceso NanoGM no se certifican.

Actualización GM: el catálogo owner incluye47 entradas previas más Brasa, Garren y Morwen (50). La prueba exige las tres identidades únicas y el total exacto.127 comprobaciones de integración/seguridad PASS. No se cambia código runtime GM.

Comprobación pública14:49 UTC: Fondal y el sitio independiente todavía sirven el catálogo anterior sin las tres skins. El health Fondal responde200 pero informa store=file y persistent=false. No se reinicia ni despliega el servidor. La consulta al relay independiente agotó25s; no se concluye pérdida de datos. Render MCP no tiene workspace seleccionado, por lo que esta sesión no certifica sus despliegues. Ver publication-check.json; los404 son sondas a rutas internas, no evidencia de un fallo de la aplicación pública.

## Continuación20/10: Dáriel

El único fallo nativo23 se redibujó en revision-v3 preservando35 cuadros exactos. La candidata corregida se integra en una rama y repite gates de fábrica, estilo, roster, precios, guardado y host/invitado. Ver dariel_luthier/revision-v3/README.md y runtime/. El rechazo v1/v2 anterior es histórico, no describe el atlas corregido. Farolero sigue fuera de la tienda. Publicación pendiente de verificar separadamente.
