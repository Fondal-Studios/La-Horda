# Coliseo: arquitectura y cobertura real

Cuatro columnas y dos rocas dentro de cada foso; trazado simétrico e idéntico para ambos duelos. El anillo final de 110 unidades queda enteramente libre. Colisión de héroes mediante el sistema de sólidos, navegación de bots por campo de distancias hacia el rival (o el centro al cerrarse el anillo), bloqueo continuo de proyectiles terrestres por segmento. Tiros en arco y habilidades de área mantienen sus reglas; la cobertura no otorga inmunidad a toda magia.

Graderías de piedra en cuatro niveles, espectadores discretos, escaleras radiales, portones y estandartes. Piso de arena con textura determinista. Arquitectura y arena cacheadas; no se generan canvas cada cuadro. El público queda fuera del área de combate. Arte de columnas y rocas ya conservado en main, reutilizado con colisión.

Prueba reproducible: tools/art/check-coliseum-cover.js. Verifica 12 sólidos, simetría, colisión, disparos rápidos bloqueados, tiros en arco y corredor central libres, rutas desde los ocho puntos de salida, bot rodeando cobertura, simulación real de combate y limpieza al volver a campaña. Capturas reales de escritorio, móvil y panorámica con cámara alejada. No añade campeones ni cosméticos nuevos.

Estado de la colección Umbral: los seis originales y atlas de la sesión interrumpida no pudieron recuperarse tras perder el entorno antes de cerrar el commit. No se incluyen metadatos con referencias a imágenes inexistentes ni se declara publicada esa colección.
