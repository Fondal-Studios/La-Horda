# Aldric: candidato, FIX — no integrar

Se completó un candidato de 36 poses conservando el diseño de Aldric. No modifica código ni assets existentes. La aprobación del dueño sigue pendiente. No comenzar otro lote.

- [x] PNG RGBA 448×1008; 36 celdas 112×112; 294959 bytes.
- [x] Alfa 0/255: cero píxeles semitransparentes.
- [x] Una silueta conectada en cada una de las 36 celdas.
- [x] Muerte 32–35: borde inferior en 106; termina tendido.
- [x] Reposo frontal 69px, dentro de 62–72.
- [x] Seis familias de color solicitadas; variaciones tonales conservadas.
- [x] Importador real: IMPORTED_NOT_APPROVED, 36 poses.
- [x] Style Gate real: PASS. Mide las primeras 12 poses; no certifica todos los cuadros.
- [x] Nombre y carpeta de hoja según manifiesto.
- [ ] Perfil coherente: cuadro 18 aún demasiado frontal tras dos intentos de corrección.
- [ ] Consistencia de escala y apoyo: espalda 74–75px; algunos extremos inferiores en 107–108.
- [ ] Riqueza por cuadro: cuadro 30 tiene 3068 colores; no cubierto por el PASS de caminatas.
- [ ] Píxel nativo / sin aspecto de ilustración reducida: fuente generada más grande y remuestreada por NEAREST. No certificado.
- [ ] Animación fluida / diferenciación: requiere revisión humana animada.
- [ ] Roster gate, skin audit, iPhone y multijugador: no ejecutados, requieren integración.

El PSD es una exportación raster de una capa, no un documento con capas originales de pintura.

Comandos ejecutados: import-authored-sheet.py con SHA de fuente y targetHeight=70; style_gate.py con atlas explícito. Auditoría adicional de alfa, conectividad, colores y límites por cuadro mediante Pillow/SciPy, resultados completos en chequeos.json. No se ejecutó scan_sprites.py sobre este candidato porque escanea assets instalados; no se instaló allí.

Dirección del prompt utilizado: atlas 4×9 de Aldric fiel al original; caminar frontal/derecha/espalda; ataques en esas vistas; lanzar frontal; definitiva frontal; muerte progresiva. Fondo transparente, contorno oscuro, seis familias con variaciones, sin VFX incrustados. Iteraciones 2 y 3 pidieron corregir cuadro18 y ampliar márgenes. La tercera fuente superó el importador.
