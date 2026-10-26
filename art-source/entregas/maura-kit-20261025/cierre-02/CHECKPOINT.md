# Maura — cierre02: diagnóstico de rendimiento

25/10/2026. EN_CORRECCION / NO_INTEGRAR, Art Gate FIX. Runtime y arte inmutables desde producción2f5c8c37ea63c4cf67f020314efe6fe77d8c8ea7. Padre887af6da3c3cc60d3742621a788860224303d940. Main7e4e653e83b958bb63534ea90cfc77400bf93545 intacto. No merge/publicación.

Implementado tools/vfx/maura-perf-diagnosis.js: seis condiciones,200 muestras de32kits por condición,96draws/muestra, orden normal e inverso. Sin limpiar lienzo se reproducen máximos nativos348.6/410.2ms y control blit256.7/198ms. Limpiando entre muestras: nativo2.9/7.1ms; limpiando y pacing requestAnimationFrame:11.4/1.6ms. Cero rebakes en todas las condiciones. Cada condición final19200draws,230400draws total. El renderer real limpia el canvas en js/rendering/renderer.js:9.

Conclusión limitada: la acumulación sin limpieza del arnés anterior es una condición reproducible de los grandes picos, también en el control sin kit. Los máximos históricos se conservan; no se certifica rendimiento físico móvil, GPU/GC ni frame budget global. No cambiar runtime para esconder un problema del arnés. La primera instrumentación contó dibujos fuera de las muestras durante el pacing; intento conservado, corregido con bandera measuring.

Revisión adicional de hojas existentes mobile-infernal y desktop-minas: siguen FIX; corteza se confunde detrás de cuerpos y la tijera pierde identidad normal mientras tier4 resulta desproporcionada. No nuevas capturas ni aprobación visual.

CI padre: lanes FAIL en tools/lanes/kits.js 55, Profeta cross7; Maura cross0/errs[]. Causa/baseline no demostrados, no omitir gate. Se conserva extracto del log. Resto de checks consultar SHA fresco, no aprobación.

SIGUIENTE: seguir CIERRE Maura agrupado: composición/contornos/anclajes raíz+corteza+poda y escala tier4, preservar geometría de área/cuerpos80%delta24/escudo real/UF. Usar diagnóstico con limpieza para medir envío de dibujo y probar renderer completo después de cambios. No repetir primera pasada ni abrir kit. Antesmerge: artePASS y TODOS checks/workflows SHAexacto incluidos lanes. Receta y manifest producción anteriores siguen inmutables; cola58 intacta.

Comandos: NODE_PATH=<Playwright> CHROMIUM_PATH=<Chromium> node tools/vfx/maura-perf-diagnosis.js; REVERSE=1 mismo comando. No dependencias nuevas.

