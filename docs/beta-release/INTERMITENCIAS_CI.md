# Intermitencias del CI: causa raíz, arreglo y medición

Medido en local (4 núcleos, 3-4 corridas en paralelo, Chromium de Playwright), sin tocar umbrales ni gates. Las simulaciones de las pruebas avanzan en tiempo simulado (`__step`/`__tick`), no en tiempo real: el runner lento del CI no es la causa, lo es el azar del juego (`Math.random`) y los tiempos fijos.

## 1. `tools/identity/t_identity.js` (BOS)
- **`BOS.contener_runa_manteniendo_el_boton` / `las_raices_atrapan…` / `la_runa_contenida_queda_sellada…`**: causa raíz = la regla creciente del bosque (`arenaRuleTimer`, `js/arenas/hazards.js:29`, «¡Raíces!», cada 9,5–12,5 s) lanza un golpe `bossStrike` con `stun:850` sobre el jugador. Si el golpe resuelve dentro de los 2,6 s de contención, `ctxCanUse` falla (`stunTimer>0`), el botón se suelta y la runa sigue «active» (firma: `ms:6400, st:"active"`). Traza de pila capturada: `bossHitHero < updateBossSkillWorld`. Comportamiento de juego legítimo (no es un bug); el vaciado de `bossStrikes` de la tanda anterior solo cubría los golpes ya en el aire.
  - Fix (prueba): `arenaRuleTimer = 1e12` durante la contención y restitución después. Verificado por mutación: con `arenaRuleTimer = 300` reaparece la firma exacta.
  - Antes: 2 de 12 corridas completas fallaron (1 trío BOS + 1 LAB); sumando corridas con instrumentación (misma lógica) 3 trío BOS en ~65. `ONLY=bos` no reproduce (0/12): hace falta la partida completa. Después: 24/24 corridas completas OK.
- **`BOS.la_jauria_sale_de_la_maleza`**: no se logró reproducir (0/150 iteraciones aisladas). Margen frágil: se medía 1,4 s tras el aviso fijo, a ~330 ms del salto, con las bestias (118 u/s) caminando; distancia máxima al punto 61 u contra radio 60. Fix: esperar a la condición (todas las matas saltaron) y medir en ese cuadro. Mejora de robustez, sin tasa «antes» demostrada.
- **Sin resolver (otra prueba, no tocada)**: `LAB.los_bots_resuelven_en_orden` falló 2 de ~27 corridas completas (`solved:false`, trazas de bots del tanque en el laberinto). Sin causa investigada. Pendiente.
- Sigue pendiente de la tanda anterior: nombrar al emisor del golpe (resuelto aquí: es la regla de arena, no emboscada ni runa corrupta).

## 2. `tools/items/t_abismo.js` `CARCELERO.cadenas_ancladas_y_se_rompen_por_fase`
- Causa raíz: tras `e.hp = 0.6*maxHp` la prueba esperaba 300 ms fijos a que la IA rompa la cadena. Un aliado (bots) aturde al subjefe al azar (stun 160–304 ms medido) y `update.js` salta la IA mientras `stunTimer>0` → `broken1:0`.
- Fix: esperar la condición (`abS.ca.broken & 1`, tope 4 s). La verificación sigue exigiendo que la cadena se rompa.
- Antes: 3 de 120 en el escenario aislado repetido; después 0/120. Archivo completo: 0/12 antes y 0/12 después (la tasa ~2,5 % no aparece en 12 corridas; la medida fiable es el escenario).
- Observación de diseño para el dueño: que los bots puedan aturdir al Carcelero (subjefe) es decisión de balance; no se tocó.

## 3. `tools/lanes/test-sides.js`
- **Brillo 0,21–0,24**: el muestreo elegía el píxel de mayor coseno; el marco oscuro de la barra (`--ally-dark #0b3a1a`, mismo tono, coseno ≈ 1) empataba con el relleno según el sub-píxel donde caía la barra (posición al azar, canvas reducido: barra de 2–3 px). Píxeles 15,52,23 / 13,48,22. Umbral (0,25) correcto, no se cambió. Fix: muestrear solo píxeles enteros dentro del relleno (debajo de la franja de brillo) y tomar el más claro de tono puro (coseno ≥ 0,99). Además posiciones con semilla fija (`window.__rnd`).
  - Antes: 3 de 12 corridas; después 0 fallos de brillo en 68 corridas.
- **Minimapa del Coliseo** (firma nueva, 3 de 36 corridas tras la primera mejora): marcadores de héroes solapados (el aro verde cubría el rombo rojo) y el aro aliado se muestreaba en su borde exterior (r 5,5; el trazo cubre 3,5–5,5 con centro en 4,5). Fix: muestrear en el centro del trazo y repartir a los luchadores del foso de forma determinista antes de dibujar el minimapa. Después: 19/20 OK; el fallo restante fue de infraestructura (`page.goto: Target page, context or browser has been closed`), no de la prueba.
- Cuelgues hasta el timeout: no reproducidos en ~70 corridas. Pendiente.

## 4. `tools/vfx/musashi-afterimage-check.js` (solo investigado)
Falla 9 checks por fila en `main` y no es flaky: la prueba exige que las estelas de Paso Fantasma lleven `packKey` (atlas de la skin) y que `NET_COLLS` lo serialice; `musashiSpawnAfterimage` (`js/champions/musashi.js:95`) no lo guarda. Esa implementación solo existe en `art-source/entregas/musashi-kit-20261026/integracion-01/rejected-owner-*.js` (entrega rechazada en auditoría). Es una prueba adelantada a una funcionalidad no integrada, no un bug de `main`. Decisión del dueño: integrar `packKey` o retirar/ajustar el check. Nota: cada corrida escribe `OWNERSHIP.json` en esa carpeta (efecto lateral en el repo).
