# Thalen Códice — corrección 01

Estado: **EN_CORRECCION / FIX_NOT_APPROVED / NO_INTEGRAR**

Se hizo una corrección agrupada de la fuente de ataques para resolver la dirección lateral. La nueva fila lateral sí presenta cuatro perfiles derechos legibles con anticipación, golpe, impacto y recuperación. La identidad del Códice se mantiene visualmente.

La herramienta regeneró la hoja completa aunque el prompt pidió preservar filas 1 y 3 píxel por píxel. La comparación detectó cambios en 99.86%, 99.90% y 99.88% de los píxeles de las tres filas, respectivamente. Por eso esta hoja se conserva como nueva fuente candidata y **no** sustituye ni aprueba automáticamente la fuente de producción 01.

El atlas candidato recompuesto conserva 36/36 cuadros no vacíos, alfa 0/255 y cero píxeles alfa en su borde externo. El nuevo SHA-256 es `8b771d2a68b03d00eb55e704072a03963dabaca9c3d6a117b761217689e0667a`.

La revisión visual del preview confirma perfil lateral y continuidad básica. Sigue faltando revisión cuadro por cuadro de ataques frontal/trasero regenerados, bordes cromáticos, enganche al consumidor real, capturas a escala del juego, skins, escritorio/móvil, multijugador, rendimiento, Art Gate y CI del componente. No se instaló ningún asset ni se cambió runtime.

Próxima acción: revisar los 12 ataques como conjunto frente a la plantilla exacta del Códice. Si las filas frontal/trasera no superan la fuente anterior, componer una fuente híbrida determinista con filas 1/3 originales y fila 2 corregida; después ejecutar el consumidor local con fallback legado.
