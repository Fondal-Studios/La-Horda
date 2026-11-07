# Thalen Códice — corrección 02

Estado: **EN_CORRECCION / NO_INTEGRAR**

Se compuso una fuente híbrida determinista: ataques frontal y trasero provienen byte por byte de `produccion-01`; únicamente la fila lateral proviene de la corrección de perfil. La verificación por filas dio 0 píxeles cambiados frente al original en filas 1 y 3, y 0 frente a la fuente de perfil en fila 2.

El atlas resultante conserva 36/36 cuadros no vacíos, alfa binaria 0/255 y cero píxeles alfa en el borde externo. SHA-256: `1be3454246d9526b93bf9e218318915086311789ca204b0ffda3f7eaf8af01aa`.

La revisión del preview confirma la dirección lateral y conserva las mejores filas frontal/trasera previas. Esto cierra el defecto de preservación de fuente, pero todavía no aprueba ni integra el cuerpo: faltan consumidor real de 36 cuadros con fallback legado, animación a escala de gameplay, skins, escritorio/móvil, multijugador, rendimiento, Art Gate y CI del componente conectado.

No se cambió runtime, no se instaló el atlas y main permanece intacto.

Próxima acción: auditar y diseñar el contrato local del consumidor de 36 estados sin sustituir el atlas vigente; generar capturas antes/después en una rama separable y mantener fallback hasta que los gates visuales y funcionales pasen.
