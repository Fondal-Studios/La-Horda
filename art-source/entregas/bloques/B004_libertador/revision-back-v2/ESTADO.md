# B004 v2: reparación selectiva, no aprobada

La v1 conserva28 cuadros pero falla nativo8,10,11,22,23 y reduce cuerpo20 a54px frente63px previo. Se reutilizan9 y21 que sí pasan, se conserva22 original válido y se escala20 uniformemente a76px de silueta para recuperar cuerpo. Nueva fuente solo8,10,11,23. Sin filtros ni reducción de requisitos.

Falta comprobar este ensamblado, orientación13, escala/animaciones/runtime y compatibilidad. No instalar hasta completar gates. Fábrica targetHeight idéntica a PR163 (cuatro pruebas); no es un umbral nuevo de aprobación.
