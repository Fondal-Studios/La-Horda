# Operaciones

## Proveedores

- `pixrig`: ejecuta una receta explícita de `recipes.json`, produce PNG RGBA, WebP sin pérdida, hoja de contacto y procedencia/hash del código. API: USD 0. Usa CPU local. No interpreta prompts arbitrarios.
- `comfyui-local`: usa `POST /prompt`, `GET /history/{prompt_id}` y `GET /view`; contrato oficial: https://docs.comfy.org/development/comfyui-server/comms_routes. Solo loopback HTTP y nodos locales explícitos. Requiere servidor/modelo instalado, workflow exportado en formato API, metadatos del atlas, destino ya registrado y procedencia/licencia del modelo. No reintenta POST ambiguos para evitar duplicar generación. Guarda el prompt_id para diagnosticar trabajos que excedan el timeout. La normalización de formato no inventa transparencia ni poses: una hoja con fondo opaco se rechaza. API/modelo real pendientes de configurar y probar.
- `dry-run`: preservado para planificación, nunca se acepta como producción real.

Un job real tiene `id`, `provider`, y `recipe` para pixrig. ComfyUI requiere además `workflow`, `meta`, `target` y `provenance`. `target` contiene `png`, `meta_file`, `const`, `key`; actualmente solo se admiten registros de atlas JSON literales existentes en `js/assets/`. Los demás renderers requieren adaptadores adicionales, no edición automática por heurísticas.

## Corrección de clipping

```sh
python tools/fondal-art-engine/pixrig-stage.py --recipe angel_corrompido --padding 32 --out /tmp/fondal-angel-new
node tools/fondal-art-engine/production.js validate /tmp/fondal-angel-new
```

Overscan vuelve a rasterizar la geometría original fuera de los límites anteriores; no agrega bordes transparentes a una imagen ya cortada. Conserva `refH`, `hMul`, clips e índices, y compensa el ancla por el desplazamiento de la celda. Actualmente solo cualificado para Ángel Corrompido. En `pixrig`, padding 0 conserva el comportamiento existente. La revisión visual y runtime siguen siendo necesarias; que un candidato pase el gate no autoriza publicarlo.

## Validaciones

CRC de todos los chunks PNG, estructura y límites de memoria, RGBA8, dimensiones, grilla, alfa, presupuesto de bytes/colores, contenido y contacto con los bordes **por cada frame consumido**, clips ausentes/acortados/fuera de rango y clips completamente congelados. Los contactos son señales conservadoras de posible recorte, no un juicio artístico. Las métricas no certifican anatomía, originalidad ni consistencia estilística. La revisión debe cotejar el Caballero, los diseños originales y todos los estados.

`runtime-check.js` abre el juego real, espera atlas registrados, dibuja sus cuadros mediante `champPackDrawFrame` y mide render. No simula el generador. Es una prueba de carga/dibujo y costo de render, no certificación de todas las habilidades, multiplayer, FPS bajo carga ni iPhone físico.

## Promoción

```sh
node tools/fondal-art-engine/production.js promote CANDIDATE_DIRECTORY REVIEW_JSON
```

Solo después de review PASS y pruebas reales del candidato. El recibo requiere `status: PASS`, `reviewed_by`, `candidate_sha256`, `baseline_sha256`, `registry_sha256`, y `visual_evidence`/`runtime_evidence` como `{path, sha256}` dentro del repo. El JSON de runtime debe tener `status: PASS` y `candidate_sha256`. No fabricar estos recibos a partir de pruebas de otro atlas. El smoke test general no satisface por sí solo esa revisión de candidato.

Revalida los archivos, preserva atlas idénticos sin escribir, rechaza cambios arbitrarios de geometría, regenera el WebP compañero, conserva backups y manifiesto de rollback y restaura archivos si falla una publicación en el proceso. El bloqueo evita dos promociones simultáneas. Una terminación abrupta del sistema durante los renames puede requerir restaurar desde `rollback/`; la publicación remota siempre es un commit/PR, nunca estos archivos intermedios. Antes de merge, comprobar WebP/PNG, manifiesto de carga/cache, atlas a escala real, juego desplegado y pruebas del commit candidato.

## Automatización y límites

Workflow `Fondal Art Engine validation`: push/PR, ejecución manual y horario diario 09:30 UTC (06:30 Argentina) **que GitHub solo activa al llegar el workflow a main**. En `workflow_dispatch`, `production: true` regenera las 14 recetas y guarda artefactos 14 días. Sin secretos ni APIs pagas; GitHub Actions puede consumir la cuota de infraestructura de la cuenta. No se habilitan compras ni runners de pago.

El job de validación incluye un canario real rechazado; comprobar que el gate rechaza ese arte es PASS del software, **no PASS del asset**. El job de producción falla si algún candidato falla y siempre sube los reportes. No instala, crea merges ni despliega automáticamente. Ampliar la publicación automática exige completar cobertura, gates y evidencias de cada renderer; no desactivar guardas para obtener un pipeline verde.
