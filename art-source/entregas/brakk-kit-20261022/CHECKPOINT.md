# Brakk — primera pasada B117/B118/B119

22/10/2026. Rama art/brakk-kit-first-pass-20261022, base main 6334ff40b6514808ef0fe00b50bec15e19f10c25. Retomado el cierre remoto de Veyra PR196 head0185b9d9a0dbed5d649371ba2d3302961800ce2b. No hubo interrupción sin cierre detectada. No había otra rama/PR de producción activa de Brakk en la consulta inicial.

## Producción y alcance real

Cinco atlas nativos / 53 cuadros: montaje11, despliegue12, clavos8, soldadura10 y refuerzo12. Cuadros incluyen disipación; no son53 assets aprobados. Las fuentes son recetas SFA editables (c/brakk.js), con receta, pivotes, celdas, fases y exportador en esta entrega. No se usó Pintor de cuerpos: los efectos ya son código nativo SFA y se extiende ese sistema. No se simula generación con servicios externos. Se conservan ladrillo/torreta existentes, cuerpos/skins y definitiva UF. Las fuentes previas están en el commit base, sin sobrescribir assets/.

B117 A-FX-brakk-h1: GENERADO, EN_CORRECCION por fase global del montaje. Usa el segmento real del muro, comprobado en cuatro direcciones, sin alterar colisiones.
B118 A-FX-brakk-h2: despliegue y ráfaga GENERADO; despliegue EN_CORRECCION porque los soportes parecen flechas. Los clavos usan los extremos del disparo real, no un destino estimado.
B119 A-FX-brakk-h3: GENERADO; soldadura sobre construcciones propias y refuerzo abierto sobre los receptores reales de armadura. Duración leída del temporizador resultante del kit. Pendiente revisión integral.
B011 definitiva: conservada, capturas iguales byte por byte; no cerrar este bloque ni S081 entero.

El runtime toca solo tres archivos SFA: engine.js acepta receta opcional por tema manteniendo caché/tinte; bind.js permite omitir ondas adicionales cuando la receta ya aporta impacto; c/brakk.js define arte y enlaces. Las recetas sin pintor propio mantienen la ruta anterior. No se altera gameplay, balance, cuentas, cobros o infraestructura. La copia del test online usa únicamente cuentas fixture del relay local.

## Evidencias y clasificación

- before/after y mobile-before/mobile-after: ocho sceneHash previos al cast idénticos, mismo escenario, semilla y escala. Definitiva idéntica en ambas comparaciones.
- Cinco atlas reexportados idénticos. Alfa0/255 de los cinco, celdas transparentes sin fondo, fuente reproducible.
- verify-brakk-kit.js:19 comprobaciones PASS (geometría, disparos reales, destinatarios, duración, rechazo desde useSkill en cooldown, replay de eventos, alpha, RNG y pools40/16); observación de fase del muro separada y reproducida.
- brakk-functional.js:81 PASS. Paridad SFA on/off: combate idéntico y29232 llamadas RNG en ambos.
- online.js:23 PASS en cinco parejas. brakk-online.js:14 PASS; los cuatro temas nuevos llegan por el relay real desde anfitrión al invitado táctil, con argumentos registrados de ambos. Esto no equivale a revisión visual en dispositivo físico.
- engine-off/ conserva fallback sin eventos SFA y sin errores.
- Legibilidad estricta general en seis arenas iniciada; resultado en cierre posterior. Su alcance cubre decales nova/zone/cone y KVB; no sustituye inspección visual de los nuevos burst/beam/aura.
- Revisión inicial: soldadura en X y clavos distinguibles; muro necesita sincronización de fase, soportes de torreta necesitan forma menos similar a flechas. Skins completas, contraste móvil final y coste de warmup pendientes. No marcar PASS visual integral.

Estado global EN_CORRECCION / NO_INTEGRAR. Ningún componente VALIDADO ni INTEGRADO_MAIN en esta entrega. Publicación pública NO_VERIFICADA. Mantener borrador aunque CI pase. No rebajar gates.

## Continuar

Siguiente primera pasada: **Morveth B166/B167/B168**, luego **Aelith normal B105/B106/B107**. Leer main y PR actuales; auditar js/champions/skill-fx-a/c/morveth.js y js/champions/quality-five/morveth.js y los objetos/hongos ya renderizados antes de crear fuentes. Conservar jardín UF y Aelith PR191. No retocar cuadros de Brakk/Veyra/Solciju ahora. CORRECTION_BATCH.json conserva13 entradas de fallos, con hashes y acciones.

```sh
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium node tools/vfx/verify-brakk-kit.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium OUT=/tmp/brakk-review node tools/vfx/capture-brakk-kit.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium MOBILE=1 OUT=/tmp/brakk-mobile node tools/vfx/capture-brakk-kit.js
NODE_PATH=/ruta/node_modules CHROMIUM_PATH=/ruta/chromium node tools/vfx/brakk-online.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium ONLY=brakk node tools/vfx/parity-skill-fx.js
```

No depender de este disco para reanudar: usar el checkpoint de la rama remota. Antes de integrar revisar diff real, skins/Art Gate, head SHA, checks/workflows aplicables y conflictos. Las ramas de Veyra/Solciju no se incorporan aquí.
