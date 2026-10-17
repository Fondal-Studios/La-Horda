# App Store — preparación de publicación

Estado 16/10/2026: NO publicada, NO enviada a revisión, NO compilación iOS firmada. Se encontró una app web con manifest; no proyecto Xcode/Capacitor, IPA ni configuración de firma en el repositorio. App Store Connect solicita inicio de sesión en el navegador disponible.

## Material listo

`app-store-metadata.es-AR.json` contiene nombre, subtítulo, descripción, palabras clave y propuestas de categorías, SKU y bundle ID. Son borradores; no inventan URLs de privacidad/soporte ni identidad legal. Las capturas deben salir de la compilación iOS real, no del arte conceptual ni de un navegador presentado como aplicación nativa.

## Lo que falta para poder enviar

1. Apple Developer Program activo y acceso autorizado a App Store Connect. La tarifa publicada es USD 99/año o equivalente local; no se realizó inscripción ni pago. Confirmar si publica Mariano como persona o una entidad legal de Fondal Studios.
2. Crear proyecto iOS, empaquetar recursos del juego, probar WebView/audio/táctil/orientación/safe areas y conexiones HTTPS/WSS. Requiere compilación y firma con Xcode en macOS o CI macOS autorizado; este entorno Linux no generó un IPA.
3. Si hay compras de contenido digital dentro de la app, implementar StoreKit y validación del servidor conforme a las reglas aplicables. No reutilizar automáticamente el botón web de Mercado Pago dentro del contenedor iOS. Una primera app gratuita sin compras también es una opción, pero no genera ventas dentro de la app.
4. Implementar/verificar eliminación de cuenta desde la app cuando corresponde, política de privacidad publicada, datos de privacidad declarados, soporte y recuperación de cuenta. No seleccionar “no recolectamos datos” cuando el backend guarda cuentas, progreso o transacciones.
5. Revisar derechos de personajes/arte/audio y clasificación por edad, así como requisitos de moderación del chat. El catálogo contiene Eren; no se confirmó licencia.
6. Crear registro de aplicación y bundle ID definitivo. Subir compilación firmada, completar ficha, precio/territorios, privacidad y capturas exigidas para los dispositivos soportados. Dar a revisión una cuenta de jugador separada, nunca NanoGM ni credenciales administrativas.
7. Validar TestFlight, iniciar sesión, jugar una partida, reconectar, recuperar progreso, restaurar derechos de compra cuando corresponda y eliminar cuenta. Enviar a revisión únicamente cuando se cumplan los pasos anteriores.

## Cuenta administrativa solicitada

El repositorio ya configura `ownerAccount: NanoGM` y compara los usuarios sin distinguir mayúsculas. No hace falta crear un segundo dueño con otra capitalización. La contraseña indicada por el usuario no autenticó en el servidor público (401 BAD_CREDENTIALS). El registro público también rechazó el nombre (403 RESERVED_USER). No se creó la cuenta ni se guardó esa contraseña en los archivos.

El mecanismo existente `server/recover-owner.js` necesita acceso al volumen o base de producción y exige una contraseña de 12–128 caracteres. La indicada tiene 8 y no cumple ese control. No se debilitó el control ni se añadió una puerta administrativa por HTTP. Ejecutar la recuperación legítima en el servidor, luego reiniciar el relay y verificar `/api/admin/status`; no marcar la tarea completada sin ese resultado.

## Fuentes oficiales

- https://developer.apple.com/help/account/membership/program-enrollment/
- https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/
- https://developer.apple.com/app-store/review/guidelines/la/

No hay fecha garantizada de revisión ni de disponibilidad en la tienda.
