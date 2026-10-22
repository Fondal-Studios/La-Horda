# Veyra — primera pasada del kit normal

22/10/2026. Base main 6334ff40b6514808ef0fe00b50bec15e19f10c25. Rama art/veyra-kit-first-pass-20261022. B226/B227/B228, conservando IDs originales. Estado global EN_CORRECCION / NO_INTEGRAR; ninguna integración en main ni publicación verificada.

## Qué se produjo

Seis atlas nativos exportados del mismo código que dibuja en partida, 56 cuadros: vy_slash (10), vy_lance (8), vy_dash (8), vy_dash_end (8), vy_pact (10), vy_pact_idle (12). Incluyen disipación; no son 56 cuadros aprobados. Fuentes editables: js/champions/vfx-b/veyra.js; export reproducible: tools/vfx/verify-veyra-kit.js. recipe.json define dimensiones/pivotes/paleta/procedencia; los originales completos permanecen en main base. No se duplican cuerpos, skins, fuentes de Axiom/Aurelia ni Aelith PR191.

- B226 / A-FX-veyra-h1: GENERADO. Tres tajos carmesí separados. Incisión recta ahora recibe su trazo lineal con ancho/alcance efectivos, en vez del abanico incorrecto. También se corrige el ángulo vertical: fx=0 ya no se convierte en 1 al preparar el evento visual. No cambian impactos ni objetivos.
- B227 / A-FX-veyra-h2: GENERADO. Estela rasgada, centro abierto y pequeña herida de llegada. Usa el recorrido real del desplazamiento, incluso cuando lo acorta una pared.
- B228 / A-FX-veyra-h3: GENERADO en lanzamiento; EN_CORRECCION en persistencia. Corazón partido y latido visibles, pero la condición heredada del aura lee un temporizador de velocidad compartido: un buff ajeno activa también el corazón. Reproducido; va al lote común, sin modificar buffs ni balance.
- B046 / A-FX-veyra-ult: se conserva. Capturas de la definitiva idénticas byte por byte antes/después en las tres variantes de revisión. No se cierra B046 ni el kit entero.

## Auditoría y pruebas

No basta con el nombre del efecto: before/after, mobile-before/mobile-after y lance-before/lance-after contienen capturas del renderer real. 12 sceneHash previos al lanzamiento idénticos, misma escena/semilla/escala. Arnes adaptado del guardado en PR195, sin traer sus cambios de runtime. engine-off/ muestra el fallback KVB apagado.

- Prueba específica: 9 comprobaciones PASS, dirección hacia arriba, base y talento con área 1/1,6, ancho y alcance limitados, desplazamiento bloqueado por pared (36 u reales), replay de los cuatro eventos, RNG de combate sin consumo y pool normal/reducido.
- Observación de clasificación separada: el aura por buff ajeno se reproduce (verification.json). No se presenta como PASS visual.
- Regresión VFX B: PASS (149 recetas, alfa nítido, pool/limpieza/argumentos hostiles/eventos). Funcionales: 132 PASS. Cooperativo local: 23 PASS, cinco parejas, invitado táctil. Informes en tests/.
- Seis atlas reexportados idénticos byte por byte. Revisión visual inicial favorable de tajos, línea y trayectoria; la persistencia de Pacto bloquea integración.
- Gate estricto de legibilidad PASS en seis arenas (3.978 mediciones): sin incumplimientos de umbral, relleno/tinte correctos, alfa nítido y caché acotada. Log en tests/decal-legibility.txt. CI remoto pendiente para el head publicado. Nunca deducir PASS por la existencia de PNG ni por las pruebas funcionales.
- Matriz visual de todas las skins y aprobación integral aún pendientes. Capturas móviles son Chromium; no afirmar una prueba visual en iPhone físico.

## Continuidad

Siguiente primera pasada: **Brakk B117/B118/B119**, después Morveth B166/B167/B168 y Aelith normal B105/B106/B107. Conservar sus definitivas UF; no duplicar Aelith PR191. Auditar fuentes, PR y los consumidores SFA antes de producir. No quedarse corrigiendo el aura de Veyra mientras falten esos kits.

En el lote de corrección: asociar el aura de Pacto exclusivamente a su lanzamiento y dueño, incluyendo host/invitado y múltiples Veyra, y comprobar expiración/muerte/reset. Mantener el gameplay intacto. CORRECTION_BATCH.json conserva los fallos anteriores y agrega este hallazgo con hash.

PR195 Solciju permanece taller. Sus checks de legibilidad del head 7b89de24bdea58d5e5e321e18957d3b0c5715f05 fallaron: 7 incumplimientos, relleno so_splash 36% sobre límite 35% y tinte bosque/infernal idéntico. Registrado en la cola; no bajar umbrales ni reabrir su corrección antes de terminar primeras pasadas.

Antes de integrar: separar componentes realmente aprobados de Pacto FIX, completar skins y Art Gate, revisar diff/head/checks/workflows y conflictos. Esta rama parte de main: hooks.js puede requerir combinar cuidadosamente los cambios visuales independientes de PR195 cuando ambos se aprueben; no arrastrar Solciju FIX.

Reanudar desde la rama remota; no depender del disco local. Comandos:

```sh
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium node tools/vfx/verify-veyra-kit.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium OUT=/tmp/veyra-review node tools/vfx/capture-veyra-kit.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium MOBILE=1 OUT=/tmp/veyra-mobile node tools/vfx/capture-veyra-kit.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium LANCE=1 OUT=/tmp/veyra-lance node tools/vfx/capture-veyra-kit.js
NODE_PATH=/ruta/node_modules CHROMIUM_PATH=/ruta/chromium node tools/vfx/test-decal-legible.js
```
