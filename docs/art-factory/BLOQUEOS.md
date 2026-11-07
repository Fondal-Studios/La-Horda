# Bloqueos (no se finge producción)

1. **No hay generador de imágenes conectado.** No existe en el repo ni en el entorno (sin claves, sin servicio). El Pintor transforma hojas
   encargadas, no inventa trazos; `LA_HORDA_ASSETS_FALTANTES.md` y `docs/ART_REPLACEMENT_QUEUE.md` son pedidos de hojas completas a un autor externo.
   → Todo lo que exige arte **nuevo** queda en `FALTANTES_PRIORIZADOS.md` como pendiente. No se hicieron compras ni se simuló generación.
2. **«Tres skins premium»: no identificables.** Ningún documento del repo define cuáles son (se buscó por nombre). Necesito el nombre de las tres (campeón + skin) para auditarlas, evaluarlas y priorizarlas. Mientras tanto la auditoría cubre todas las skins del inventario.
3. **Arquitecto general / S0C / UI Factory / Premium Skins:** sin canal en esta sesión ni rastro en el repo. La integración queda `PENDIENTE` y la fábrica no instala.
4. **Prueba en juego de animaciones:** el evaluador mide estabilidad de pies y escala, pero ninguna animación se aprueba sin correrla en el motor (p. ej. interceptando la ruta del atlas con Playwright). No hay candidato aprobado que lo requiera aún.
5. **Cobertura del evaluador:** calibrado para sprites pixel art nativos (cuadros sueltos o grilla 4×9 de 112 px). Las hojas heredadas grandes con antialias y los VFX no tienen calibración propia; se informan, no se juzgan.
