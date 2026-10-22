> Cierre posterior: [correccion-01/CHECKPOINT.md](correccion-01/CHECKPOINT.md). Historial de primera pasada debajo; el estado vigente sigue EN_CORRECCION / NO_INTEGRAR.

# Aelith normal — primera pasada B105/B106/B107

22/10/2026. Rama art/aelith-normal-kit-first-pass-20261022, base main6334ff40b6514808ef0fe00b50bec15e19f10c25. Repositorio canónico Fondal-Studios/La-Horda, ID1379488490. Retomado checkpoint remoto Morveth PR198 head7ddcc511b7554495e933a70aafab94bdc1951c9b y cola de16 hallazgos. No falta de cierre detectada; PR191 es solo definitiva y se preserva. Sin otro PR de habilidades normales de Aelith al comenzar.

## Producción y alcance

Cuatro atlas SFA nativos/48 cuadros: cuenta atrás12, estallido12, vidrio dentado12, arena/segundero12. Tres snapshots adicionales son reutilización dinámica del cuerpo del receptor, no arte nuevo ni reemplazos de skins. Fuente editable c/aelith.js; receta, atlas, preview, manifiesto y exportador junto a esta entrega. Se extiende código nativo SFA: Pintor/forja de cuerpos no corresponde a estos efectos; no se simula producción por imagegen. Se conservan todos los cuerpos/skins originales, gameplay y definitiva UF. PR191 intacto.

- B105 A-FX-aelith-h1 GENERADO/EN_CORRECCION: dial normal con12 marcas y tres grietas, cuenta atrás relativa a vida del eco (800/1600ms con talento), segundo estallido. FIX reproducido: eliminar eco por muerte activa estallido visual sin segundo golpe.
- B106 A-FX-aelith-h2 GENERADO/EN_CORRECCION: teja de grieta dentada sobre segmento real260u y ancho52; probada en cuatro direcciones. FIX: línea demasiado fina en móvil, falta apertura/cierre longitudinal y estado de arena lenta.
- B107 A-FX-aelith-h3 GENERADO/EN_CORRECCION: estela de tres snapshots del cuerpo equipado, actualizados cada60ms y separados por movimiento real, más segundero/arena; duración real3000ms y receptores con/sin share. FIX: falta colapso/deuda gris800ms; segundero sigue reloj global1,2s y no una vuelta por buff; contraste/skins pendientes.

Solo tres archivos runtime SFA: engine.js y bind.js tienen extensiones opcionales idénticas a PR197/198; c/aelith.js define las nuevas recetas, consumidores y estela local. No hay cambios de balance, mecánicas, cuentas, cobros o infraestructura. El arnés de relay crea cuentas fixture efímeras únicamente. No incorporar FIX de las otras ramas para obtener estas extensiones comunes.

## Evidencia y límites

- before/after, mobile-before/mobile-after, moving-before/moving-after:12 sceneHash iguales, misma semilla/escala/escenario. Definitiva idéntica byte por byte en las tres series. Movimiento comparativo es fixture determinista, no experiencia táctil física.
- Cuatro atlas reexportados idénticos; alfa0/255,48 cuadros. Tres snapshots de cuerpo no vacíos, sin clipping en apariencia base. No equivale a gate de todas las skins.
- verify-aelith-kit.js:27 comprobaciones PASS: timer eco/demora, geometría, receptores/duración, snapshots/limpieza, replay, cooldown, alpha, RNG y pools40/16. Dos fallos de clasificación separados, no ocultos por los PASS técnicos.
- quality-five/functional.js:132 PASS; paridad de combate on/off idéntica,29884 llamadas RNG en ambos.
- aelith-online.js:15 PASS, efectos reales entregados a invitado táctil y tres snapshots visibles en ambos clientes. Primer intento falló por variable keys del arnés inexistente; se conserva reporte y se corrigió solo entrada de prueba a keyboard.down/up, sin tocar el runtime.
- online general: primer intento22/23, fallo de snapshot de torreta de Brakk (solo muro observado). Resultado conservado, repetición idéntica sin cambios de umbral en curso al guardar producción. No declarar PASS hasta leer resultado.
- Legibilidad estricta general en curso al guardar producción; cierre posterior registrará resultado. No sustituye gate específico beam/aura, forma propia, contraste móvil ni skins.
- engine-off/ conserva fallback sin eventos SFA y sin errores. Sintaxis y git diff --check PASS.

NO_INTEGRAR: ningún componente VALIDADO ni INTEGRADO_MAIN. Publicación NO_VERIFICADA. No mergear aunque CI pase mientras contenga FIX. Toda aprobación necesita head SHA vigente y workflows aplicables.

## Continuar

Esta primera tanda prioritaria tiene pasadas de Solciju, Veyra, Brakk, Morveth y Aelith normal:23 atlas/256 cuadros de animación candidatos, no256 assets aprobados. FIRST_PASS_RECONCILIATION.json mantiene PR/head por kit y excluye definitiva AelithPR191. No completa inventario global. CORRECTION_BATCH.json conserva16 hallazgos y suma3 (19 entradas).

Próxima acción: reconciliar heads/checkpoints remotos de estos cinco kits y comenzar un **lote grueso de corrección de habilidades recientes**, conservando fuentes y IDs. Agrupar enlaces/temporizadores/cancelaciones (Veyra pacto, Brakk montaje, Morveth pulso, Aelith eco/deuda), luego siluetas/contraste de todo el lote. Evitar cinco pasadas aisladas repetitivas por cuadro. No incorporar talleres completos con FIX; separar componentes aprobados y revisar skins/renderer/online/checks antes de merge secuencial con expected_head_sha. Sigue pendiente el resto del inventario; retomar primeros kits faltantes después de resolver la prioridad reciente, sin regenerar entregas existentes.

```sh
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium node tools/vfx/verify-aelith-kit.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium OUT=/tmp/aelith-review node tools/vfx/capture-aelith-kit.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium MOBILE=1 MOVE=1 OUT=/tmp/aelith-mobile node tools/vfx/capture-aelith-kit.js
NODE_PATH=/ruta/node_modules CHROMIUM_PATH=/ruta/chromium node tools/vfx/aelith-online.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium ONLY=aelith node tools/vfx/parity-skill-fx.js
NODE_PATH=/ruta/node_modules CHROMIUM_PATH=/ruta/chromium node tools/vfx/test-decal-legible.js
```

Para reproducir antes/después, usar worktrees independientes del commit base y candidato con el mismo arnés; no servir otra carpeta por error. El arnés usa servidor aislado. Ante interrupción recuperar cierre remoto, no este disco; si existe un cierre posterior, ese manda.

## Cierre remoto 22/10/2026

Producción0d6dee95e7e84335fe6b9a04e9ee9ad56bfcfd3d, [PR199 borrador](https://github.com/Fondal-Studios/La-Horda/pull/199). Se verificaron66 archivos del diff remoto contra hashes Git locales, sin diferencias; tres archivos runtime SFA. main permanece6334ff40b6514808ef0fe00b50bec15e19f10c25. No hubo merge ni publicación.

Legibilidad estricta final PASS:seis arenas,4122 mediciones,0 errores, umbrales originales. Log tests/decal-legibility.txt. Online general repetido sin modificar prueba/runtime:23/23 PASS; el primer22/23 se conserva en tests/online-general-first-attempt.json y el nuevo resultado en tests/online-general-retry.json. El fallo intermitente de snapshot de torreta Brakk no se reprodujo; no se afirma causa raíz resuelta. No afecta la clasificación NO_INTEGRAR ni habilita merge.

CI del head de producción:17 checks y siete workflows pendientes/en curso; registro tests/remote-production-audit.json. El cierre cambia el head documental: volver a consultar todo por el SHA vigente, sin heredar aprobaciones. Skins, contraste específico, coste de snapshots/warmup y Art Gate integral pendientes. UF conserva sus fuentes y capturas base; la maestría reprise reutiliza el eco normal, por lo que su combinación necesita revisión antes de integrar.

Próxima acción exacta: leer este cierre remoto y CORRECTION_BATCH.json (19 entradas), cotejar nuevos commits de PR195–199, mantener PR191 aparte y preparar lote grueso de corrección de habilidades recientes. Priorizar enlaces/temporizadores/cancelaciones de los cinco kits antes de una revisión visual conjunta. Conservar fuentes/IDs/hashes y registrar cada componente; no cerrar el juego ni todo un campeón por este lote. Si hay un cierre posterior, ese manda.
