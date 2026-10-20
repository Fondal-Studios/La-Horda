# Fondal: comprobación pública del19/10/2026

Origen canónico observado: https://fondalstudios.com/la-horda/jugar/. Se usaron sesiones invitadas efímeras, GET públicos y bloqueo de POST/WebSocket; no se tocaron cuentas, billeteras o permisos. No se desplegó infraestructura.

## Cinco campeones y skins solicitadas

`original-five-smoke.json` y `original-five-contact.png`: Solciju, Brakk, Veyra, Morveth y Aelith aparecen listados como RELEASED, cargan sus atlas y se renderizan. Se ejecutaron veinte lanzamientos internos con recursos finitos, sin errores de página. Se cargaron sus skins solicitadas por ID `_alt1`: Viuda de Medianoche, Arquitecto Glacial, Verdugo Celestial, Micelio Abisal y Relojera del Vacío. La imagen es una captura del renderer público en vista frontal, zoom2; no una ilustración conceptual. La preview no demuestra propiedad de la skin o compra.

`original-skin-assets.json` comprueba que los cinco PNG de esas skins coinciden exactamente con main. `base-and-collection-assets.json` comprueba los cinco atlas base y otra colección adicional `quality_*`; `collection-smoke.json` la identifica por nombres distintos. No confundir ambas colecciones ni contar estos controles como nuevos campeones o skins producidos hoy.

`public-ability-gate.json` y su log documentan la ejecución del **Ability Gate existente** en modo estricto sobre el código público: los cinco PASS, canario negativo rechazado, cero errores de página. `public-ability-probe.cjs` solo adapta transporte y aislamiento; no modifica el filtro ni las habilidades. Es medición diferencial de efectos del cliente, no transporte multijugador en vivo ni prueba de dispositivos físicos.

Chromium necesitó una excepción explícita de TLS en este entorno por la CA del proxy (`PUBLIC_SMOKE_ALLOW_PROXY_TLS=1`); se registra en cada prueba y no certifica TLS. La comprobación de bytes por Python usó la verificación TLS normal del sistema. El probe portable usa TLS normal por defecto.

## Últimas actualizaciones aún sin confirmar en la web

`publication.json` aplica el nuevo control de archivos seleccionados: compara HTML, metadata de sprites, renderer, Códice y atlas Soporte v3/caída de Libertador contra el candidato. Cuatro archivos servidos difieren y los dos atlas nuevos responden404. Estado NOT_CONFIRMED; main y publicación siguen separados. Son seis archivos concretos, no una auditoría exhaustiva del despliegue. No hay conexión disponible que permita actualizar con garantías este hosting canónico; los controles anteriores de Render/GitHub Pages siguen siendo alternativos y no prueban publicación en Fondal.

## Validación de la herramienta de campaña

`campaign-harness-positive.jsonl`: piloto existente en Ciudad, victoria y datos finitos con cierre normal. Se declara su invulnerabilidad y remate de jefes a16min; no mide dificultad humana. La regresión negativa con Chromium confirmó dos reintentos y fallo explícito en el tercero. PR169 quedó integrado en6fe59ffa.

La caída de Libertador se integró en PR170/6f47511f con11 workflows exitosos,4 cuadros nativos,127 comprobaciones del renderer y139 apariencias. La comprobación focalizada se repitió después del merge junto al test de arranque de campaña. Las pruebas en cuarentena del repositorio conservan sus limitaciones; no se afirma que todas las pruebas o todos los sistemas del juego estén resueltos. El taller PR166/403a80c sigue FIX en20/21/23 y debe conservar el contrato especializado de61 cuadros más caballo.

## P0 externo: persistencia del servidor canónico

`health.json`: a las22:58:10 UTC del19/10/2026, el endpoint público https://fondalstudios.com/la-horda/red/api/health respondió200 con `ok:true`, `status:ready`, `store:file`, `persistent:false`. El servicio está respondiendo, pero su propia declaración no confirma almacenamiento durable. Falta comprobar montaje/configuración real y respaldos de cuentas, partidas, billeteras y permisos. El estado de NanoGM en una sesión autenticada sigue sin verificar.

Se preservó el servicio sin reinicios, despliegues ni cambios de almacenamiento. Antes de una intervención operativa, el responsable del hosting debe identificar el servicio y almacenamiento canónicos, verificar un respaldo recuperable y confirmar la durabilidad. La documentación del repositorio describe Fly.io como host principal y Render como alternativa; esta lectura HTTP no autentica al operador ni habilita migrar datos entre ambos. No subir archivos de cuentas, copias privadas, credenciales o cadenas de conexión a GitHub.

Este bloqueo P0 es independiente del avance de arte/código y de los cinco campeones ya comprobados en la web. El control de seis archivos estáticos tampoco certifica persistencia del backend.
