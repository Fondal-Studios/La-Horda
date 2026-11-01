# Comparación de proveedores de imagen (verificada contra documentación oficial, 2026-11-01)

Regla: solo figuran datos leídos en la documentación oficial (con su URL). Lo que no se pudo verificar está marcado **NO VERIFICADO**; no se rellenó de memoria.

| Criterio | **BFL · FLUX.2 [klein]** (principal) | **OpenAI · gpt-image** (alternativo) | Stability AI | Runway API |
|---|---|---|---|---|
| Referencias visuales | klein: hasta **4**; pro/flex/max hasta 8 (API) — [flux2_overview](https://docs.bfl.ai/flux_2/flux2_overview) | La edición acepta varias imágenes (ejemplo con 4); máximo **no declarado** — [guía de imágenes](https://developers.openai.com/api/docs/guides/image-generation) | Control: Structure / Sketch / Style Guide 5 cr c/u — [pricing](https://docs.stability.ai/pricing) | `referenceImages` con etiquetas; máximo **NO VERIFICADO** — [uso de la API](https://docs.dev.runwayml.com/guides/using-the-api/) |
| Transparencia (alfa) | **NO VERIFICADO** en la documentación leída → el pipeline asume fondo plano + recorte propio | Sí: `background: "transparent"`, `output_format: png/webp` — guía de imágenes | «Remove Background» 5 cr; formato de salida **NO VERIFICADO** | **NO VERIFICADO** |
| Precio | 1 crédito = US$ 0,01; FLUX.2 cobra **por megapíxel**; los importes salen en blanco en la copia leída → **confirmar en la calculadora** https://bfl.ai/pricing. (El ensayo previo reservó US$ 0,25 por pedido como tope conservador; ver `docs/fondal-art-engine/BFL-TRIAL.md`.) | Por tokens (gpt-image-1.5: imagen entrada US$ 8 / salida US$ 32 por 1M; [pricing](https://developers.openai.com/api/docs/pricing)). Por imagen (resumen de la guía, **verificar**): 1.5 baja 0,009–0,013 · media 0,034–0,05 · alta 0,133–0,20 | 1 crédito = US$ 0,01; Core 3 cr, Ultra 8, SD3.5 Large 6,5 | 1 crédito = US$ 0,01; gen4_image 5 cr (720p) / 8 cr (1080p); gen4_image_turbo 2 cr |
| Licencia comercial de las salidas | klein **4B: Apache 2.0**; klein 9B: licencia **no comercial**; Pro/Flex/Max: términos de la API **NO LEÍDOS** (https://bfl.ai/legal/flux-api-service-terms) | **NO VERIFICADO** (la página de términos devolvió 403) | **NO VERIFICADO** (umbral de la Community License no leído) | **NO VERIFICADO** |
| Límites | Máx. **24 pedidos concurrentes** (6 en kontext-max); 429 → backoff; 402 = sin créditos; las imágenes expiran a los **10 min** — [integración](https://docs.bfl.ai/api_integration/integration_guidelines) | Por nivel de gasto (Build: US$ 5 acumulados, US$ 500/mes) — [rate limits](https://developers.openai.com/api/docs/guides/rate-limits); puede exigir **verificación de organización** | 150 pedidos por ventana de 10 s | sin dato leído |
| Cómo se paga | Prepago por Stripe, sin mínimo declarado («empezá con US$ 10-20»); auto-recarga opcional (mín. US$ 5) | Créditos prepagos por la consola (**NO VERIFICADO**: la página devolvió 403) | Créditos (25 gratis al empezar) | Créditos US$ 0,01; mínimo **NO VERIFICADO** |
| Clave | https://dashboard.bfl.ai → proyecto → **API → Keys → Add Key** (se muestra **una vez**) | https://platform.openai.com/api-keys (**no verificado**) | https://platform.stability.ai/dashboard/api-keys | https://dev.runway.com |
| Calidad pixel art 16-bit y consistencia de personaje | **No hay evidencia publicada**: se decide con el piloto (A/B con Sylva) | ídem | ídem | ídem |

## Recomendación
* **Principal: BFL FLUX.2 [klein] 4B.** Es el que ya está integrado en el Fondal Art Engine (PR #232) y autorizado por el dueño el 2026-10-28 como ensayo de **US$ 5 en total** (`BFL-TRIAL.md`), tiene licencia Apache 2.0 verificada para klein 4B, 4 referencias y precio por pedido bajo. Límite honesto: **la transparencia no está documentada**, así que el flujo pide fondo plano y lo recorta (y rechaza lo que no recorta limpio).
* **Alternativo: OpenAI gpt-image.** Mejor encaje si hace falta alfa nativo y edición guiada; cuesta más por imagen y puede pedir verificación de organización. Está implementado como respaldo (`openai,bfl` en `--provider`).
* Stability sirve como **herramienta auxiliar** (quitar fondo, 5 créditos = US$ 0,05) y Runway como opción de referencias etiquetadas; **no** se implementaron: sin datos de alfa/licencia verificados, no se justifica.
* **Ninguna calidad se afirma sin el piloto.** Un modelo de ilustración no garantiza hojas consistentes: por eso el pipeline pide tiras de ≤ 4 poses, ensambla por contrato, endurece alfa, valida y exige revisión humana.


## Actualización 2026-11-01 — Runway como proveedor principal alternativo (el dueño no puede pagar en BFL)
Adaptador implementado y probado con API simulada: `RunwayProvider` (`--provider runway`, ahora **primero** en el orden por defecto `runway,openai,bfl`).

**Verificado** (https://docs.dev.runwayml.com: `guides/using-the-api`, `assets/inputs`, `assets/outputs`, `usage/tiers`, `guides/pricing`, `usage/autobilling`):
* Endpoint `POST https://api.dev.runwayml.com/v1/text_to_image`, `Authorization: Bearer <secreto>`, `X-Runway-Version: 2024-11-06`; body `{model, promptText, ratio, referenceImages:[{uri, tag}]}`; las referencias se citan en el prompt con `@tag`; `uri` puede ser URL https o **data URI (≤ 5 MB)**; PNG/JPEG/WebP; no se recomiendan referencias < 640×640.
* Precio: **1 crédito = US$ 0,01**; `gen4_image` 5 créditos (720p) u 8 (1080p) = **US$ 0,05–0,08 por imagen**; `gen4_image_turbo` 2 créditos = US$ 0,02. El plan de Sylva (13 pedidos) cuesta ≈ **US$ 0,65–1,04** con gen4_image.
* Las URLs de salida **expiran en 24–48 h**: el adaptador las descarga de inmediato. Sin límite de pedidos por minuto; sí tope diario y concurrencia por nivel (nivel 1: 1–2 simultáneos, 50–200 generaciones/día, US$ 100/mes; sube a nivel 2 tras comprar US$ 50).
* Créditos prepagos por el portal https://dev.runway.com (por proyecto; puede sumar impuestos). La auto-recarga usa Stripe y exige un mínimo de US$ 10; el mínimo de compra manual **no figura**.
* Clave: portal de desarrolladores https://dev.runway.com (variable que usa su documentación: `RUNWAYML_API_SECRET`; el adaptador también acepta `RUNWAY_API_KEY`).

**NO verificado:** valores válidos de `ratio` (solo se vio `1920:1080`), máximo de imágenes de referencia, **transparencia** (no hay página que diga que una imagen salga con alfa), estados de tarea distintos de SUCCEEDED/THROTTLED, si `gen4_image_turbo` admite las mismas referencias, **qué medios de pago acepta** (la documentación solo nombra Stripe). **Comprobá en https://dev.runway.com que te deje cargar crédito antes de contar con él.**

**Consecuencia técnica:** como no hay alfa garantizado, el prompt pide fondo verde plano y el ensamblador lo **recorta solo si el fondo es plano** (conectado a los bordes); si no lo es, rechaza esa tira (`el fondo no es plano…`) y solo se reintenta esa tira. Probado con imágenes sintéticas.
