# Reparación de campeones invisibles

Main e2953314 registra 43 campeones. Varios atlas tardíos no aparecen en el manifiesto estático. En producción `lazy-images.js` retiene esos atlas en grupos `ch:<id>` que el preloader nunca conoce/libera. `drawHeroBody` no dibuja un campeón cuyo pack siga pendiente. Webdriver desactiva por defecto esta carga diferida y ocultaba la regresión.

Los cargadores de packs y clones ahora registran sus fuentes con el preloader. Las altas tardías se suman al seguimiento y a la cola, incluso con un grupo iniciado. WebP conserva la espera de un reintento PNG y limpia el estado fallido al recuperar la imagen. No cambia propiedad, progresión, estadísticas ni los gates de arte.

Prueba: `NODE_PATH=<playwright> CHROMIUM_PATH=<chromium> node tools/art/roster-loading-test.js`. Fuerza carga diferida real, fallo WebP y renderiza bases/apariencias en cuatro direcciones y seis estados. Resultado en `loading-results.json`: 43 campeones, 143 packs, 3264 dibujos visibles, cero errores JS.

Esta corrección no incorpora los siete campeones ni las skins adicionales necesarias para cumplir el pedido de 50 con dos skins cada uno.
