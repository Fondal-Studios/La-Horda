# Bront B410 — corrección agrupada02

Estado: GENERADO / EN_CORRECCION / FIX / NO_INTEGRAR. No VALIDADO, no INTEGRADO_MAIN, publicación en juego no verificada.

Dirección autorizada por Nano: «Si autorizo. Deben ser claramente diferentes identidades visuales». Baltra conserva escafandra; Bront fortaleza vacía angular. No volver a pedir autorización. Pareja Bront/Baltra inferida de canon/previews; no nombres confirmados por Nano.

## Continuidad

Main758aa2ffacaae6542d31776e4a66ea7847a73b1b; PR201 borrador, rama art/bront-redesign-first-pass-20261023. Parentfc7d6214e289456f374e9cc555f953cbb64cd80e, recuperacióna186453f2f29691c9c3880b9fac19b8ba62b9b41.26archivos del manifiesto previo cotejados;15referencias canónicas exactas. Sin cierre perdido. Producción51286908988e89838aa180630dbd5e0f4cb41c7a:28archivos cotejados por Git blob remoto. REMOTE_CLOSURE registra cierre; head final consultar fresco. CI producción10checks/5workflows en curso al consultar; no aprobación de arte.

## Producción

Una edición imagegen del lote36 guardado, con referencia canónica Tanque. Casco almenado dominante, cuerpo compacto, placas laterales y cristal; halo del cuadro26 ausente en candidato. Fuente original02 y prompt preservados, sin reemplazar fuente01. Atlas diagnóstico448x1008, preview/contacto36 y comparación nativa Baltra/Brontmain/01/02 con siluetas. Preview.html reproduce índices del contrato actual para revisión, no el renderer del juego ni sus tiempos.

36celdas no vacías,36RGBA distintos;0contactos opacos con límites fuente finales. Primer corte tocaba8celdas y está conservado en attempt-01. Cuatro métricas Pintor PASS con tolerancia15% intacta. Cinco salidas reproducidas exactamente. Nearest es reducción diagnóstica, NO certificación de pixel-art nativo.123423píxeles alfa parcial en atlas,860617 en fuente: FAIL de alfa0/255.

Identidad más diferenciada por casco/negativos de silueta, pero revisión aún FIX: casco cercano a mitad de altura en frente (estimación visual, meta40–45%); hueco de placas estrecho/inconsistente, pecho puede parecer paño con gema; anclaje de torso cambia por centrado del boundingbox. No declarar36poses aprobadas. REVIEW.json conserva IDs, cuadros, hashes y acciones.

Todos los archivos previamente versionados salvo CORRECTION_BATCH quedan idénticos;483JS revisados (incluye JS fuera de tools/art-source). Atlas instalados, skins, Baltra y fuentes01 intactos. Cola24 conserva las23entradas históricas y B410. No gameplay ni nuevas pruebas online/RNG/renderer de partida. Preview final carga4imágenes,66índices PASS y0errores de página; intento conexión rechazada conservado. No equivaler tests de preview con pruebas de juego.

## Reanudar

1. Consultar head/CI/REMOTE_CLOSURE frescos del mismo PR201. No generar concepto de nuevo.
2. Abrir sources/pose-sheet-raw.png, comparison-native.png, contact-36.png y preview.html. Conservar hash9ef650cbc7454b4d4a4100918dd33f718f2481e4c3e61b5c4a2086836623a0ef de fuente02.
3. Corregir acabado nativo y negativos/anclajes en lote completo36: casco40–45%, placas separadas, cavidad real, alpha0/255 sin halos. No endurecer alfa y declarar aprobación automática. Registrar polígonos de casco/torso/pies por vistas para medir proporciones y no centrar por extensión de puño.
4. Luego dos skins canónicas Bronce Ritual/Hielo Negro; probar carga/fallback/contrato real, equipo, arenas, móvil, multijugador y Art Gate antes de instalar conjunto completo. Preservar originales.
5. Mantener Brakk11 y residuales MorvethB168/AelithB106B107. No reabrir PR200 ni RNG ya corregido. Inventario global incompleto.

Reproducción: `PYTHONPATH=/tmp/la-horda-python-deps python art-source/entregas/bront-redesign-20261023/correccion-02/extract.py`. Dependencias exactas en recipe.json. Servir raíz con `python -m http.server 8768` y abrir `/art-source/entregas/bront-redesign-20261023/correccion-02/preview.html`.
