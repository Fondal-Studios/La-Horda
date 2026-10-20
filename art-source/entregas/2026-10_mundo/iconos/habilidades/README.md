# Íconos de habilidades:179 PNG del HUD real

Exportaciones de diseños YA EXISTENTES, no179 diseños nuevos. Se conservan colores, contorno, categoría y píxeles del juego. No cambia el HUD ni las habilidades. Incluye43 campeones×4,4 de Ilkan Coloso y3 genéricos (básico/cura/pacto). Cada archivo corresponde al destino y tarea del control de producción; entrega.json guarda hashes PNG/RGBA y fuentes del renderer.

Producción/verificación: `node tools/factory/export-skill-icons.js --write` / sin argumento para verificar. Usa navegador aislado y servidor local propio. Comprueba contrato16×16, hasta6 colores, alfa binaria y marco. Antes de escribir valida TODAS las exportaciones existentes; nunca sobrescribe PNG divergentes ni modifica el inventario.

QA: `node tools/art/check-skill-icons.js --self-test` valida HUD real de43 campeones y Coloso, diferenciación de definitivas y cinco canarios inválidos. Revisión visual del arte existente no se reemplaza por un recibo; no se reclama aprobación del owner ni despliegue público. Las tareas de rediseño visual que sigan siendo necesarias permanecen abiertas.
