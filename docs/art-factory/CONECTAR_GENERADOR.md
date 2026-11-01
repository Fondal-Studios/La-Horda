# Conectar un generador de arte (lo único que hace falta de tu parte)

**Estado:** hay red hacia los proveedores (OpenAI, Stability, Replicate responden), pero **no hay ninguna clave en el entorno**, y yo no puedo
crear cuentas ni pagar. Con una clave, la conexión es automática: `tools/factory/art_generator.py` ya está hecho y probado (con la API simulada).

## Qué tenés que hacer (5 minutos, una sola vez)
1. Crear una cuenta en el proveedor (recomendado: **OpenAI**, API de imágenes `gpt-image-1`, que soporta fondo transparente) y **cargar crédito prepago** (con un tope; ej. US$ 20).
   Fijá un límite de gasto mensual en el panel del proveedor: es tu freno real.
2. Crear una **API key** (Settings → API keys). Usá una clave solo para este proyecto.
3. Ponerla como **variable secreta del entorno** donde corre esta sesión (nunca en el repo ni en el chat):
   `ART_GEN_API_KEY` (o `OPENAI_API_KEY`). Instrucciones del entorno: en la configuración del entorno de Claude Code on the web → *Environment secrets*.
4. Decirme «listo». Desde ahí lo hago yo en automático.

## Qué hago yo después (automático, con tope de gasto)
```
python3 tools/factory/art_generator.py plan --champion <id> --skins 3                 # muestra el plan y el costo máximo
python3 tools/factory/art_generator.py run  --champion <id> --skins 3 --budget-usd 5 --yes
python3 tools/factory/art_factory.py evaluate art-source/generated/<id>/...           # evaluador
```
* Por defecto es **dry-run**; solo gasta con `--yes` y nunca por encima de `--budget-usd`. Cada pedido queda en `art-source/generated/spend-ledger.json`.
* Lo generado es **candidato NO aprobado**: pasa por el evaluador (≥ 90, sin críticos), el importador de hojas, la revisión de estilo, la prueba en el juego y tu aprobación. No se instala solo.

## Advertencias honestas
* Una API de imágenes entrega **ilustraciones**, no pixel art de grilla exacta. Las reglas del repo (`ART_BIBLE.md`, gate de densidad) rechazan «ilustración reducida»:
  esperá que una parte de lo generado **no pase** y que se reconstruya (hasta 3 intentos, luego se escala). El arte final de calidad de campeón sigue dependiendo de revisión humana.
* Costo estimado: ~US$ 0,19 por imagen de alta calidad (estimación; confirmá en el panel). Las **50 skins** que faltan para la meta de 3 por campeón (`PREMIUM_SKINS_COVERAGE.md`)
  son ~US$ 10 en una pasada, pero cada skin necesita varios intentos y poses: contá 5-10 veces eso.
* No hay forma segura de conectarlo sin una clave tuya: no voy a buscar ni usar credenciales que no sean las que vos cargues.
