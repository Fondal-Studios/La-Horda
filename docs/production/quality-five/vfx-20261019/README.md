# Continuación del lote original — 19/10/2026

PR de integración: #146. Retoma #120, sin presentar los cinco originales como nuevos otra vez. Base auditada: main `b0d7003fa20ec2009b7cb22605bd141f607f122e`. Diecinueve PR abiertos al comenzar; #78 cerrado como taller sustituido por #87, sin borrar su rama ni sus fuentes. #90 conserva tres candidatos TESTING con contratos incompletos y arte sin aprobación: no se promueven.

## Cambio comprobado

Las novas/conos de skill-fx-a tapaban actores durante el impacto. En Bosque, la versión de #120 produjo 48 fallos de legibilidad, mínimo 59%. Mover únicamente esas huellas de área al suelo mantiene radio, duración, motivos y daño y permite ver los cuerpos. La primera corrida corregida dio mínimo 95%; la corrida extensa posterior dio mínimo 88% entre las seis arenas. Son escenas distintas de pruebas; no se presenta 95% como mínimo universal.

El gate ahora exige 80% por instante para los tres tipos de área, sin sustituir la medición por 1 cuando no se pide SFA_STRICT. Mantiene el umbral histórico del efecto completo (40% promedio, con avisos bajo80%): rayos y motivos aéreos siguen teniendo superposiciones. No se declara toda combinación de VFX perfectamente legible.

Al cambiar de arena se liberan los sprites teñidos de la anterior, conservando motivos/haces compartidos y referencias de efectos activos. El test visita seis arenas y verifica reutilización, caché limitada a la arena actual, mismos píxeles al regresar y validez de cuadros retenidos.

## Evidencia local

- `baseline-bosque.txt`: defecto reproducido, 48 fallos con el umbral80% original.
- `corrected-bosque.txt`, `six-arenas.txt`: 510 mediciones por arena, 3.060 filas de fase, tres posiciones por fila. Seis arenas sin incumplimientos de decales, sin errores de página. Esta corrida precede únicamente a la liberación de cachés; el CI vuelve a ejecutarla sobre el candidato completo.
- `arena-cache.txt`: cambio de arena, reutilización y equivalencia de píxeles PASS.
- `mechanics.txt`: 21 campeones, cinco acciones cada uno, estados iguales con/sin VFX. Tiempos son diagnóstico de máquina compartida; no certifican móvil real.
- `events.txt`: 98 recetas, cero llamadas de VFX a Math.random, pool acotado128, limpieza, argumentos hostiles, réplica de evento host/guest y3.792 sprites con alfa binaria. No sustituye sesiones públicas.
- `abilities.txt`: Ability Gate estricto43/43, sin fallos ni errores de página.
- Talent Gate niveles1/39/40/60/90/99, referencia intacta, fábrica27/27 y unidadesQ5 7/7 PASS.
- `area-before-after.png`: captura nueva y reproducible del motor, escena congelada. Revisión visual asistida: las siluetas quedan visibles y el perímetro sigue en el suelo; no es firma humana ni aprobación global de arte.

CI dedicado `VFX readability and combat parity`: seis arenas, control negativo que restablece la capa incorrecta, paridad de las dos familias y eventos. Los gates existentes de balance, runtimeQ5, fábrica, red, WebKit y carriles permanecen activos. Ver estado final en #146: un checkpoint no implica merge aprobado.

Para reproducir la captura, servir el checkout y ejecutar `BASE_URL=http://127.0.0.1:8961 node tools/vfx/capture-area-readability.js` con Playwright/Chromium. Para medir: `node tools/vfx/test-decal-legible.js`; `CANARY_SFA_TOP=1 ARENAS=bosque` debe terminar con fallo del decal SFA. No bajar umbrales para aprobarlo.

## Publicación y pendientes

`public-content.json` verifica doce archivos del sitio oficial Fondal contra main: configuraciónB1-7, registro de campeones, cinco atlas base y cinco skins originales. Todos HTTP200 e idénticos por SHA256. No equivale a desplegar el PR146. El health sigue `store:file`, `persistent:false`; no se reinició ni modificó infraestructura, cuentas, permisos, billeteras o cobros.

`public-smoke.json`: cinco inicios reales desde Fondal con un perfil anónimo aislado y desbloqueos locales de QA; identidad correcta, RELEASED, tres habilidades, definitiva y cinco skins decodificadas448×1008, cero errores de JavaScript. No se usó la cuenta NanoGM ni se probó multijugador público. Chromium necesitó ignorar el certificado del proxy de este entorno; la comprobación independiente de archivos en Python usó validación TLS normal.

Prioridad siguiente: finalizar validación/integración de #146; continuar las cinco skins adicionales para campeones anteriores sin contar otra vez las cinco skins de Set de Q5. Consultar el plan existente `art-source/entregas/bloques/plan_bloques.json` y sus fuentes antes de generar, porque hay encargos superpuestos. #90 requiere arte propio y contrato completo antes de release; #132/#142/#145 son otras tandas visuales con dependencias, no contenido ya publicado. Persistencia canónica, sesiones públicas de cuatro jugadores y teléfono físico continúan sin certificar.
