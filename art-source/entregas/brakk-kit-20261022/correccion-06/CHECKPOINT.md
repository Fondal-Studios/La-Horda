# Brakk — composición 06 y restauración de poses
Fecha: 23/10/2026. PR197 borrador. **EN_CORRECCION / NO_INTEGRAR**.
Parent: `f1af16282f024e430dee8eb138f17693ccff6425`. Recuperación: `0e4a24a90dae97648301aafda89b8b28627eef5e`.
Producción: `2c3b875217b76a6ba7e4433c193183b76b1587e9`.
Main observado: `758aa2ffacaae6542d31776e4a66ea7847a73b1b`. PR200 ya integrado; no repetirlo.

## Cambios efectivos
- B119: aura nativa 48×56×12; postes fuera del torso, columnas centrales12–35 vacías, alfa0/255. Se conservan radio24, cadencia100ms, dueño, duración real, paleta y emisores.
- Cuatro atlas/41cuadros byteidénticos a05. Firmas normales05, UF, engine/bind y mecánicas intactos. Solo `js/champions/skill-fx-a/c/brakk.js` cambia entre450JS runtime.
- B118: intento de bajar soportes6px nativos falló36 mediciones (mínimo redondeado71%). Fuente/atlas/log conservados en attempt-01; se restauró el despliegue anterior.
- Diagnóstico Acuática: el reloj congelado no congelaba `animPose`. Cada render mutaba `_an.spd` y `_an.ph`. A/A/A sin reemplazar firma reproduce14fallos. Restaurar pose previa para cada A/B/A y devolver pose posterior original al terminar da144/144 exactos. Cero llamadas RNG en esos redibujados fallidos. No se modificó el renderer del juego ni se certifica pureza global.
- La reproducción nueva registra90/91/195píxeles distintos; la horizontal se ejecutó después del candidato de aura. No afirmar que todos sus raster son byteidénticos al fallo05. ROOT_CAUSE.json conserva coordenadas, campos y límites.
- Canary de1píxel sigue FALLANDO: comparación exacta sin rebajar umbral.

## Verificación ejecutada
- 112 controles de atlas/renderer y19kit PASS.81funcionales PASS.
- Paridad parent/candidato360frames: snapshots idénticos y29232/29232 llamadas RNG. No afirmar aislamiento global.
- 96escenas finales:6arenas×base/set4×denso/escaso×B118/B119×2viewports.192/192 restauraciones exactas y estados pool/objetos iguales a330/1600ms.12hojas de recortes1:1 y selección PNG nativos publicados; no aprobación visual de toda la matriz.
- Gate B119 aislado: aura y burst,54filas/162colocaciones por tipo y viewport, todos PASS. Aura mínimo96.376%móvil/96.013%horizontal;80%/delta24 intactos.
- **Gate conjunto horizontal FAIL2**: B117 beam~h impacto Bosque/Hielo, mínimo79.886%. Fuente/atlas B117 sin cambios; causa no demostrada. Móvil conjunto PASS. No sustituir por el resultado parcial de B119.
- **Relay20/22 FAIL**: falta torreta en observación del invitado y faltan eventos de clavos. El atlas nuevo sí se dibuja en host27/invitado táctil38ocasiones. No afirmar relay PASS ni causa raíz; conservar intento.
- Sin nueva certificación de rendimiento sostenido móvil/GC ni matriz completa de skins/equipo.
- CI del SHA de cierre: consultar estado fresco; al subir producción estaba en curso/cola.

## Revisión y estado
Postes inicialmente más separados del cuerpo; aliado a la derecha y anillos de arena/set/armadura aún dominan contacto. **Art Gate integral no aprobado**. Sin merge de arte ni publicación verificada.
Cola común conserva22entradas históricas y agrega B119 explícito:23entradas.
80archivos de producción cotejados por Git blob remoto antes de cerrar. REMOTE_CLOSURE.json registra el procedimiento de cierre; verificar ref y archivos finales al reanudar si falta cierre.

## Próxima acción exacta
1. Leer este cierre y heads frescos; no repetir firmas05, primera pasada53cuadros, RNG Solciju/Veyra ni PR200.
2. Usar `tools/vfx/capture-brakk-composition.js` (recipe.json) para B118/B119 con pose idéntica; conservar intento rechazado. Evaluar capas legadas y contraste compuesto sin tocar emisores/azar/mecánicas.
3. Reproducir las dos filas B117 con estado/cuerpo idénticos antes de atribuirlas al arte. Instrumentar ciclo de vida de torreta host/invitado para resolver relay20/22.
4. Completar skins/equipo/seisarenas y rendimiento móvil; separar solo componente aprobado, nunca mergear taller FIX entero.
5. Mantener MorvethB168 y AelithB106/B107 en cola y guardar siguiente cierre remoto. Inventario global incompleto.

Comandos, fuentes, intentos y límites: recipe.json, TEST_ATTEMPTS.json, REVIEW.json, ROOT_CAUSE.json y manifest.json.
