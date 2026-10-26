# Morwen — cierre integrado PR224

INTEGRADO_MAIN sólo los tres lanzamientos normales H1/H2/H3 (frasco de resina, cristales de sal, retorta). No cierra B169/B170/B171 completos. Un runtime +55 líneas; 0 PNG instalados; 59 referencias existentes preservadas.

Head aprobado 63b051f30f6dbc4861b6a1c5a243e40a62e2d0de; merge/main fda6b2433d726f44080c91557fe2d27a0e218ed1, 26/10/2026 02:11:24 UTC. Árbol 0b12b9055c48c3c6c7761521f301a00a0d393a4a. Ready → merge normal con expected_head_sha. PR cerrado, main, padres y árbol idéntico a producción verificados. 19 checks y 8 workflows del SHA exacto SUCCESS. Este cierre posterior sólo agrega evidencia a la rama; NO remergear PR224.

Pruebas nuevas: 360 escenas/1440 ABA exactos, mínimo99.3336% retención de cuerpos (80%/delta24 intactos); 18 hojas/300 vistas revisadas, atlas y 3 capturas móviles completas; 12 pares main corregidos/48 muestras; 156 comparaciones de firmas seleccionadas y UF sin cambios; 18 celdas binarias sin recorte/RNG, caché frío/reduced motion/reexport/preview. 800 timings renderer completo con limpieza. Paridad360frames/35622RNG y8relay son de antes del último cambio sólo destino32→48: no rerun final afirmado. No snapshot global ni móvil físico.

Los parent PNG de la matriz inicial omiten wrapper KVB y no son comparación válida de main; los pares corregidos sí. Intento posterior de igualar precast entre sesiones distintas falló6 Infernal; se conserva, sin afirmar12 matches. Canary0% rechaza; intentos pequeños/sintaxis/conexión y etiquetas de alcance corregidas preservados. Ver SCOPE_EXTRACTION y MAIN_COMPARISON.

Publicación 26/10/2026 02:14:16 UTC: HTTP200/índice consumidor, pero JS público hash2bbe76162cac478de248ebbbfa7ff98e8cda17b672ef1bd9d83f2be46098a3ad frente esperadofa38468dfa5d614abc8502899a649819e1713843fe2e5eac8c86a73105ea0ae2. No contiene nuevo consumidor Morwen: NOT_CONFIRMED. Sin cambios de infraestructura.

Siguiente CIERRE: Libertador PR220 draft/FIX, head171f23cdf0e8c8ebfdb123fa5711d72b7ebde1b5. Auditar fuentes/checkpoint actuales y reconciliar sólo c/libertador.js desde main fresco: cinco otros runtime del PR son versiones anteriores que no deben restaurarse. Mando real base430/tier4 706.92, candidato fijo430 confirmado; corregir visual sin mecánicas. Baseline actual41/42: E17PASS/E19FAIL(fury6), origen no demostrado. No saltar gate ni cambiar balance. Leer NEXT_LIBERTADOR_* y BASELINE_RESULT. Reproducir auditoría: NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules CHROMIUM_PATH=/tmp/chromium node art-source/entregas/morwen-kit-20261025/post-cierre-01/audit-libertador-command.js (consultar argumentos del script/receta antes ejecutar). Conservar PR220 fuentes, Bront y fallos. Inventario global incompleto; tarea activa.

