# B001 — Elyra / Soporte

**Técnico: VERIFICADO. Visual: PENDIENTE DEL DUEÑO. Integración: PENDIENTE DE CLAUDE.**

Se corrigió el reposo de 78 a 71 px reencuadrando las 24 poses originales y normalizando el contorno con la herramienta del repositorio. Se reutilizaron las 12 poses nuevas guardadas. Este bloque generó **cero imágenes adicionales**.

- [x] PNG RGBA 448×1008, 36 celdas de 112×112.
- [x] Alfa 0/255; 0 píxeles semitransparentes.
- [x] Una silueta conectada por cuadro; márgenes válidos.
- [x] Reposo 71 px; muerte con borde inferior en 106.
- [x] Importador: 36 poses, escala final 1.0.
- [x] Style Gate: PASS sobre las caminatas; no valida por sí solo las filas nuevas.
- [x] Escáner: 2 píxeles señalados, debajo del umbral de alerta de 15; 0 fragmentos.
- [x] Manifiesto, fuente PSD raster, receta de normalización y hoja de contacto guardados.
- [ ] Aprobación humana de identidad, poses, contorno y apariencia de píxel nativo.
- [ ] Integración, roster_gate, skin_audit y capturas dentro del juego.

## Para revisar

Abrir `campeones/soporte/hoja_contacto.png`. Mirar especialmente las filas 7–9: lanzamiento, definitiva y caída. Comprobar que el báculo se conserva y que el cambio de tamaño entre filas no se percibe como un cambio de personaje. El PSD tiene una capa raster; la fuente IA original de las 12 poses sigue guardada en la entrega del 19 de octubre.

## Para retomar

Leer `checkpoint.json`. No regenerar Elyra. Mantener este atlas como versión técnica preferida hasta recibir revisión visual. El siguiente bloque independiente es B002 (tanque).
