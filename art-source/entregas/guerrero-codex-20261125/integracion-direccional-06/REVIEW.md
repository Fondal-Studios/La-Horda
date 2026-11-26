# Kael: caída lateral y trasera — candidato 06

Fuente nueva creada con image_gen usando el atlas aprobado y el Códice como referencias de identidad, y source04 como referencia de fases. Se pidió una grilla de cuatro fases por dos direcciones, fondo verde opaco, capucha negra con costuras rojas, máscara, capa carmesí, cuero/bronce y dos dagas. Sin sombra de suelo, VFX ni texto. No se retocan ni umbralizan los alfas de los intentos 01–05.

Cambio de método: fuente RGB con chroma deliberado → extracción por color, como `pack-thalen-codex.py` → escala constante por secuencia con vecino más cercano → atlas. El fondo se separa por color; no se intenta convertir una ilustración a pixel-art con un filtro. La fuente 06 conserva ocho poses dibujadas nuevas. `pack-guerrero-directional.py` reproduce el resultado.

## Revisión visual del candidato

- Comparación con cuerpo aprobado: capucha, máscara, capa, cuero/bronce y dagas conservados. Proporción y altura compatibles al tamaño final. La nueva fuente interpreta detalles pequeños; no se declara reproducción exacta de esos detalles.
- Perfil derecho y espalda se distinguen. La espalda no muestra el rostro. La izquierda usa el espejo previsto por el contrato del atlas.
- Cuatro fases: tambaleo, rodillas, contacto y cuerpo tendido. La altura cae progresivamente; se usa la misma escala en toda la fila. Las armas y brazos no se multiplican.
- Alfa final 0/255; sin velo ni fondo verde en la comparación. El scanner de halos es heurístico: también cuenta filos blancos de las dagas del atlas aprobado. Se conserva su informe antes/después y no se borran esos detalles para obtener un cero artificial.
- Los 36 cuadros anteriores permanecen idénticos por píxel, incluida muerte frontal. Nocturno y muerte histórica no se reemplazan. La croma dinámica puede heredar las nuevas filas al recolorear el cuerpo del Códice.
- Lanzamiento: conserva el comportamiento existente; no se contabilizan cuadros duplicados como producción nueva.

## Validación

La validación estática aprueba los ocho cuadros nuevos con el detector canónico de densidad sin cambiar umbrales. Las pruebas de navegador y la inspección de sus capturas deben completarse antes del merge. En este entorno Chromium no está instalado y su descarga devuelve HTTP 403; el workflow dedicado ejecuta esos controles en GitHub.

Estado de esta entrega: **CANDIDATO; integración pendiente de pruebas de runtime**. Los estados NO_INTEGRAR de entregas anteriores describen aquellas fuentes, no una aprobación de esta.
