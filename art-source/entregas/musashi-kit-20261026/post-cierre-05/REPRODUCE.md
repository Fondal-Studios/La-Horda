# Reproducción del componente validado

Checkout del commit de producción 514ca9b9ec475429965c27c6f389b26e2cbc710c. Mantener fuentes históricas; no usar source-before ni fuentes rechazadas como runtime. Requiere Node, Playwright/Chromium y dependencias locked del relay. Los comandos escriben evidencia nueva: usar un directorio aparte, sin sobrescribir la producción.

```bash
export CHROMIUM_PATH=/tmp/chromium
export NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules
export OUT=/tmp/musashi-reproduction
mkdir -p "$OUT"
node tools/vfx/export-musashi-area.js
node tools/vfx/musashi-reachable-area.js
node tools/vfx/musashi-viewport-edge.js
node tools/vfx/musashi-area-lifecycle.js
node tools/vfx/musashi-area-online.js
mkdir -p "$OUT/perf-base" "$OUT/perf-errante"
OUT="$OUT/perf-base" node tools/vfx/musashi-full-render-perf.js
OUT="$OUT/perf-errante" ERRANTE=1 node tools/vfx/musashi-full-render-perf.js
ONLY=musashi node tools/vfx/test-ult-forms.js
```

Cada comando de performance usa su propio OUT para conservar ambas corridas. Para matriz y secuencias, ejecutar cada viewport en directorio distinto:

```bash
OUT=/tmp/musashi-reproduction/mobile MOBILE=1 ALL_PHASES=1 TIMES=64,128,224,320,416,480 node tools/vfx/capture-musashi-area.js
OUT=/tmp/musashi-reproduction/desktop ALL_PHASES=1 TIMES=64,128,224,320,416,480 node tools/vfx/capture-musashi-area.js
OUT=/tmp/musashi-reproduction/errante-mobile MOBILE=1 LOOKS=set ALL_PHASES=1 TIMES=64,128,224,320,416,480,640,720 node tools/vfx/capture-musashi-area.js
OUT=/tmp/musashi-reproduction/errante-desktop LOOKS=set ALL_PHASES=1 TIMES=64,128,224,320,416,480,640,720 node tools/vfx/capture-musashi-area.js
OUT=/tmp/musashi-reproduction/extreme MOBILE=1 LOOKS=extreme ARENAS=bosque,infernal ALL_PHASES=1 TIMES=64,128,224,320,416,480 node tools/vfx/capture-musashi-area.js
OUT=/tmp/musashi-reproduction python tools/vfx/review-musashi-area.py
```

La corrida histórica final compone 96 escenas no Errante idénticas +24 Errante finales precargadas; no se presenta como una sola repetición de120 tras el ajuste de skin. El arnés actual precarga Errante siempre. Un nuevo rerun completo también usa ese arnés, por lo que no se exige identidad byte a byte con capturas históricas anteriores a dicha precarga. Las exportaciones nativas sí deben reproducir los PNG del manifest.

Pares contra main: mismas ARENAS/LOOKS/DENSITIES/TIMES y orden en ambos lados, FREEZE_BOOT=1. En el lado main agregar BASELINE_MAIN=1 y PARENT_SKIN_FX=art-source/entregas/musashi-kit-20261026/cierre-05/skin-fx-before.js. No usar eval sobre wrappers activos. Canary: CANARY=1 ARENAS=bosque LOOKS=base DENSITIES=dense TIMES=128,320, debe fallar con retención0%.

Paridad: preparar en OUT las tres fuentes before-* de area-01 y skin-fx-before.js de cierre-05; ejecutar parity-musashi-area.js, luego ERRANTE=1 con otro OUT. Estado resumido/RNG, no snapshot global. El campo observador skin fue añadido después de la segunda corrida histórica; el ID Errante está observado en performance final.

Los modos enabled/off de performance suprimen únicamente el canvas H3; los clips rojos siguen activos en ambos. Se mide tiempo de envío JS con limpieza real, no GPU/GC ni móvil físico. Las corridas independientes no prueban aceleración.

Prueba adicional de la evolución536.76, sin cambiar producción: `tools/vfx/musashi-evolved-composition-check.js` ejecuta dos useSkill previos y48steps cadauno, luego el tercer cast real con aserción estricta del radio. Ejecutar `LOOKS=extreme ARENAS=bosque,infernal TIMES=64,128,224,320,416,480 ALL_PHASES=1`, OUT distinto y MOBILE=1 para móvil. Se guardaron8escenas/48ABA y doshojas12vistas completas. Esta evidencia posterior amplía el cierre, no altera manifest ni fuentes de514ca.

Auditoría siguiente, sólo lectura de juego: `OUT=<dir> node tools/vfx/audit-myla-next.js`. Reutiliza todos los assets actuales, lanza3skills y aplica daño real; no genera ni instala arte.
