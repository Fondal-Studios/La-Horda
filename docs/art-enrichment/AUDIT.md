# Auditoría de presentación de La Horda — 17 octubre 2026

## Alcance y criterio

Revisión del decorado de arenas, páginas de campeones, frases y presentación del Códice. No constituye una certificación de balance, seguridad, multiplayer, compras ni rendimiento en un iPhone físico. Se preservan sprites, kits, colisiones, progreso y canon existentes.

| Sistema | Diagnóstico | Cambio |
|---|---|---|
| Decorado de arenas | Bueno; mejorar. Los renderizadores personalizados no atraviesan todos el mismo constructor de decorado. | Capa común de detalles planos con paleta y motivo propios en 13 entornos. |
| Arte de campeones | Referencias existentes; preservar. El escáner técnico requiere revisión visual por candidato. | No se alteran los atlas ni se aplica limpieza masiva. |
| Fichas del Códice | Bueno; mejorar la exposición del arte y las frases. | Galería de tres animaciones reales y tarjetas de frases, controles táctiles de 44 px. |
| Voz de personaje | Había líneas escritas; no equivalen a doblaje. | Lectura optativa en español mediante el dispositivo. Sin autoplay, una sola frase, cancelación al navegar, ocultar o silenciar. |

## Arte nuevo

39 variantes procedurales cacheadas (tres por entorno). Pixel art nativo de 64×40, tres colores por motivo, alfa del asset binaria, escalado vecino más cercano a dos unidades de mundo por píxel. La capa se atenúa para no competir con telegraphs; esa transparencia de composición no modifica el alfa de los assets.

Ciudad: adoquines; Fortaleza: rejillas; Bosque: raíces; Micelial: hongos; Hielo: escarcha; Acuática: conchas; Laberinto: incrustaciones; Abismo: fragmentos; Minas: restos de vías; Infernal: ceniza y grietas; Divina: mosaicos; Coliseo: laureles; Convergencia: trazos geométricos.

Se comprueba la geometría de suelo y cuatro esquinas, se excluyen muros del laberinto, y se dibuja antes de peligros y actores. Máximo 64 motivos por frame; selección determinista sin consumir el RNG jugable. No se añaden objetos interactivos ni obstáculos.

## Auditoría técnica del arte existente

`python tools/art/scan_sprites.py --dir champions`: 549 PNG revisados, 225 con uno o más avisos. 203 con aviso de halo, 39 de semitransparencia, 40 de fragmentos; las categorías se solapan. Resultado completo: `champion-technical-scan.txt`.

Estos son indicadores heurísticos, no un veredicto visual: metal claro puede parecer halo, proyectiles separados pueden parecer fragmentos y efectos VFX permiten alfa. No se ejecutó `--apply`. Ejemplos para revisión individual: skin sistema de Axiom (4,2% semialfa), titán de skin legion de Ilkan (7,2%); los archivos `ilkan/v2/fx/` deben evaluarse como efectos y no como cuerpos de personaje.

## Validación

- PASS: 39 variantes no vacías; alfa binaria; reutilización de cache; rechazo de geometría; límite 64.
- PASS: español, reemplazo de frase, cancelación y mute mediante prueba aislada de voz.
- PASS navegador: 43/43 campeones con ficha, historia, tres frases y galería; 13/13 entornos con motivos visibles; sin excepciones JavaScript. Tres tamaños de viewport: 1280×720, 844×390 y 667×375. Galería verificada con buffers de personaje no vacíos tras aparecer en pantalla.
- CI definitivo: https://github.com/drmarianojimenez94-sudo/La-Horda/actions/runs/38998671953 (commit bec9c43e30f1b7abcafea92ed247716fa7bce672). `runtime-report.json` conserva los resultados.
- Coste de la capa nueva en Chromium del runner: media por entorno de 0,020 a 0,287 ms en 30 repeticiones. No equivale a FPS del juego completo ni prueba en teléfono físico.
- VISUAL GATE: PASS para los 39 motivos planos nuevos y la presentación de galería, tras inspeccionar la hoja de contacto y las capturas de todos los entornos. Paleta contenida, píxel a escala del decorado, sin bordes residuales ni geometría nueva; actores y señales conservan prioridad. No se otorga PASS retrospectivo a los 549 PNG existentes.
- Incidencias resueltas durante QA: directorio de evidencia ausente en checkout limpio; Abismo inicialmente sin motivos en la entrada (rejilla adaptada a 104 unidades); captura de galería antes de activarse IntersectionObserver; captura de modos competitivos sin su inicialización específica. Los tests definitivos usan sus entradas reales.
- Límite de audio: disponibilidad y timbre dependen de las voces del sistema. Si no hay español, se informa y se mantiene el texto. Esto no es doblaje original ni garantiza una voz exclusiva por campeón.
