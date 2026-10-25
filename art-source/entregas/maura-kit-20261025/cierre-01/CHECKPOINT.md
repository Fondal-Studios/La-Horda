# Maura — cierre agrupado01, 25/10/2026

Estado: **EN_CORRECCION / NO_INTEGRAR**, Art Gate **FIX**. PR223 sigue borrador. No merge/publicación. Base main7e4e653e83b958bb63534ea90cfc77400bf93545; padre47c1a30cb95527693c4d93e75ca691ae05fbcacd. El commit de producción y su verificación remota quedan en REMOTE_CLOSURE posterior.

Un runtime `js/champions/skill-fx-a/c/maura.js`: raíces y poda ligadas a casts reales, corteza ligada a objeto vivo/owner/escudo positivo, raíz al suelo; originales y UF preservados. Tres atlas nativos de42fases exportados,0PNG instalados. Correcciones agrupadas: ramificación curva desigual, tijeras mayores, placas112x112 ancladas, duplicación SFA genérica reducida sin tocar motor compartido.

Nuevos:18lifecycle con daño real,11relayhostTanque/invitadoMaura táctil,254funcionales. Dos paridades360frames32292RNG/estado resumido iguales (antes del último cambio sólo raíz).360escenas/1440ABA finales100%retención cuerpos80%/delta24 intactos:120H1final +240H2/H3 sin cambios; no mide legibilidad propia del efecto. Canary0% falla.42fases39no vacías,alpha/bordesPASS; reexportación3PNG exacta. Ver TEST_ATTEMPTS para histórico vs final y límites.

FIX visual real: en densidad alta corteza y tijeras quedan parcialmente ocultas por cuerpos/capas; raíz más orgánica sigue tenue junto a anillos/endpoint. ContactoPASS no significa artePASS. Dos hojas móviles y temporal revisadas;12hojas generadas. No cambiar mecánicas para resolverlo.

Intentos preservados: raíz superior77.5/77.3%FAIL, reloj diagnóstico16ms inválido como224ms, const en arnés de paridad, dos falsas pruebas de energía usando castAbility, timeoutrelay sin causa demostrada, directorio salida funcional faltante, tres comparaciones Hielo desktop no idénticas (rerunaisladoseededPASS, causaoriginal no demostrada), performanceoutliers427.1ms y313.9ms en repetición local. No ocultar fallos ni atribuirlos sin prueba.

SIGUIENTE: corregir visibilidad compuesta de Maura por capas/contorno/anclaje manteniendo geometría real y cuerpos legibles; comparar secuencia sparse/dense, skins/equipo/seisarenas y explicar o resolver picos de rendimiento locales, y pasar ArtGate antes de CIexacto/ready/mergeexpectedSHA. No repetir primera pasada ni abrir otro kit. Cola58 preserva55históricas. Inventario global incompleto.

Comandos: `node tools/vfx/export-maura-close.js`; `node tools/vfx/capture-maura-contact.js`; `MOBILE=1 node tools/vfx/capture-maura-contact.js`; `node tools/vfx/maura-close-online.js`. Entorno Playwright/Chromium configurado en recipe. No asumir scratch persistente: reconstruir desde remoto antes de continuar.
