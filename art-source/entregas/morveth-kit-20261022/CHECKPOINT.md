# Morveth — primera pasada B166/B167/B168

22/10/2026. Rama art/morveth-kit-first-pass-20261022, base main6334ff40b6514808ef0fe00b50bec15e19f10c25. Retomado el cierre remoto de Brakk PR197 head3b01d7613b6636ce8c717e13b96d0376830ad878. No falta de cierre detectada. No había otro PR abierto de Morveth al auditar ni antes de subir.

## Repositorio canónico

El repositorio fue transferido a **Fondal-Studios/La-Horda**, conservando ID1379488490, main y PR históricos. El endpoint del propietario anterior devuelve Moved Permanently. Se confirmó acceso de escritura en el mismo repositorio; la autorización de Nano sigue vigente. Usar la URL canónica para la continuidad.

## Producción y alcance

Cuatro atlas nativos SFA /55 cuadros: brote12, pulso11, exhalación14, micelio18. Incluyen disipación; no representan55 assets aprobados. Receta editable: js/champions/skill-fx-a/c/morveth.js. recipe.json define tamaño/pivote/fases y verify-morveth-kit.js exporta el atlas real. La receta utiliza SFA nativo existente, no simulación de producción con Pintor/imagegen externo. No se genera cuerpo nuevo. Originales conservados en base, sin reemplazar assets/.

B166 A-FX-morveth-h1: GENERADO/EN_CORRECCION. Brote aparece en el objeto realmente plantado; pulso depende del contador real del hongo. FIX cuadro10 del pulso: borde no se disipa.
B167 A-FX-morveth-h2: GENERADO/EN_CORRECCION. Esporas recortadas al cono real, comprobado en cuatro direcciones. FIX visual del conjunto: rayos/impactos blancos legados siguen dominando la lectura; revisar capas compartidas antes de aprobar.
B168 A-FX-morveth-h3: GENERADO/EN_CORRECCION. Micelio sobre receptores reales, con/sin talento share y duración real de armadura. FIX: silueta demasiado fina, similar a ramas/antenas, poco identificable en móvil.
Definitiva Jardín de la peste: conservada UF y capturas idénticas. Props de hongo, cuerpos, skins y mecánicas conservados. No cerrar el campeón entero por estos tres componentes.

Solo tres archivos runtime SFA: engine.js ofrece pintor opcional de tema; bind.js permite extras:false; c/morveth.js contiene las recetas/enganches. Las dos extensiones comunes son idénticas a PR197: reconciliar sin duplicarlas al integrar; no importar sus FIX. No hay cambios de gameplay, balance, cuentas, cobros ni infraestructura. El test online usa relay local sin modificar y cuentas fixture efímeras.

## Evidencia

- before/after y mobile-before/mobile-after:8 sceneHash idénticos y definitiva idéntica byte a byte, mismo escenario y escala. Comparaciones agregadas y atlas-preview.png inspeccionados.
- Cuatro atlas reexportados idénticos;55 cuadros, alpha0/255, determinismo sin consumo de RNG de combate. Hashes en manifiesto y cola.
- verify-morveth-kit.js:22 comprobaciones PASS. Objeto real, pulso, eliminación, cono en cuatro direcciones, receptores de Simbiosis con/sin share, consumo de hongo, duración, cooldown, replay, alpha, RNG y pools40/16. Observación de152 píxeles persistentes en final del pulso separada.
- quality-five/functional.js:132 PASS. Paridad de combate SFA on/off idéntica y30414 llamadas RNG en ambas ejecuciones.
- quality-five/online.js:23 PASS; morveth-online.js:15 PASS. Brote, cono y micelio atraviesan relay host→invitado táctil; pulso derivado del objeto replicado aparece en ambos. Las infecciones siguen siendo autoridad del host; muerte limpia objetos.
- engine-off/: fallback conserva casts sin eventos SFA ni errores.
- Legibilidad estricta general:PASS en seis arenas,4176 mediciones y0 errores. Incluye SFA nova/zone/cone; no aprueba automáticamente burst/aura, forma del micelio ni las capas legadas. Umbrales originales, sin rebajarlos. Log tests/decal-legibility.txt.
- Pendientes: correcciones agrupadas, revisión visual integral/Art Gate, skins, contraste específico de burst/aura, warmup/rendimiento móvil real y CI del head vigente. Ningún componente VALIDADO/INTEGRADO_MAIN. Publicación NO_VERIFICADA.

## Continuar

Siguiente primera pasada **Aelith normal B105/B106/B107**. No duplicar ni integrar definitiva taller PR191. Leer main/PR más recientes, fuente SFA, quality-five/aelith.js, ecos/objetos reales y canon de relojes; capturar antes de editar. No volver a corregir Morveth, Brakk, Veyra ni Solciju antes de terminar esta tanda. CORRECTION_BATCH.json conserva los13 previos y agrega3 (16 entradas).

```sh
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium node tools/vfx/verify-morveth-kit.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium OUT=/tmp/morveth-review node tools/vfx/capture-morveth-kit.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium MOBILE=1 OUT=/tmp/morveth-mobile node tools/vfx/capture-morveth-kit.js
NODE_PATH=/ruta/node_modules CHROMIUM_PATH=/ruta/chromium node tools/vfx/morveth-online.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium ONLY=morveth node tools/vfx/parity-skill-fx.js
NODE_PATH=/ruta/node_modules CHROMIUM_PATH=/ruta/chromium node tools/vfx/test-decal-legible.js
```

Antes de merge exigir diff real, revisión visual integral, pruebas necesarias, head SHA vigente, todos los checks/workflows aplicables y base/conflictos. Mantener borrador NO_INTEGRAR mientras contenga FIX. No asumir aprobación de otro SHA ni despliegue por estar en GitHub. Recuperar este checkpoint remoto ante interrupción; no depender del disco.
