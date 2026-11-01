# Build Evolution 2.0 — Ramas de evolución (Agente G · Beta)

Rama: `feature/beta-build-evolution` · Estado: **BETA, pendiente de evaluador independiente y de S0C**. Nada se fusionó a `main`.

## 1. Auditoría de lo existente (no se duplica)
| Sistema | Qué hace hoy | Qué hace Build Evolution 2.0 |
|---|---|---|
| `js/systems/skill-evolution.js` | Hitos Nv.3 Firma · Nv.5 Ímpetu · Nv.7 Resonancia · Nv.10 Forma final (lineales, iguales para todos los jugadores de un campeón) | **No se toca.** Las ramas se montan encima: leen la Firma (marca/ralentización) y solo corren en la ventana de lanzamiento de la habilidad |
| `js/systems/boons.js` + `js/data/boons.js` | Refuerzos que transforman una habilidad (zonas, rebotes…), dúos, cartas en cada subida de nivel | **No se toca.** Se reutiliza su canal de cartas (`boonBuildOffers`, `buffOptHTML`, `buffApplyOpt`) por envoltura |
| Sets (`champion-sets.js`, `set-effects.js`) | Bonus de set y transformaciones | Cada rama declara su set; con 2 piezas rinde +20 % (tope ×1,3) |
| Talentos / equipamiento | Escalan números | Sin cambios |

Hueco que cubre: hasta ahora a Nv.5 **todos** los jugadores del mismo campeón evolucionaban igual. Ahora cada habilidad ofrece una **decisión excluyente** (dos ramas de arquetipo distinto) durante la partida.

## 2. Diseño
- 3 campeones de estilos distintos: **Aldric/tanque** (primera línea), **Thalen/mago** (distancia, condicional), **Sylva/cazadora** (presa marcada).
- 12 ramas = 2 habilidades × 2 ramas × 3 campeones. Arquetipos: ofensiva (5), defensiva (3), control (4).
- Cada rama tiene **costo** (`cdMult` 1,0–1,2 sobre el enfriamiento de esa habilidad), set vinculado, texto ≤ 22 palabras y exclusión explícita en la carta.
- Anti-dominancia: tope de daño extra por segundo (6× daño base), enfriamientos internos por enemigo, topes por lanzamiento de escudo/cura, control reducido a la mitad en jefes y sin aturdir/acercar a élites/jefes, potencia con tope ×1,3.
- Visual: anillo y chispas propias del color de la rama en cada impacto (tope 5 por 100 ms) + onda al lanzar; el panel de habilidades lista la rama; el botón muestra la rama en su tooltip.
- Información: la carta muestra arquetipo, habilidad que evoluciona, requisito (Nv.5), efecto, costo, bonus de set y la rama que se pierde.

## 3. Evaluación (evidencia reproducible)
| Medida | Herramienta | Resultado |
|---|---|---|
| Integridad de datos, arquetipos, texto, aislamiento | `node tools/build-evolution/t_synergy_static.js` | PASS (12 ramas) |
| Efecto real de cada rama en el juego real + oferta/exclusividad/jefes/set/cooperativo | `node tools/build-evolution/t_synergy_runtime.js` | PASS (100 comprobaciones) |
| Balance (piloto automático real, Bosque, nv.20, 16 semillas × 150 s (datos de la tabla)) | `node tools/build-evolution/sim-balance.js docs/build-evolution/sim-results.json` | rango de daño vs base **−5,8 % … +13,2 %**, todas bajo el techo por rol, 0 errores, 8/8 sobreviven |
| Rendimiento | mismo sim, ms de CPU por partida simulada | sin sobrecosto medible (−4,2 %, ruido) |
| Tiempo de comprensión | estimación por palabras (3 pal/s) | carta ≤ 10,3 s, media 9,1 s (estimación, no prueba con jugadores) |

El hash de los datos va dentro de `sim-results.json`: si cambiás el balance, `t_synergy_static.js` falla hasta que repitas la simulación.

| Campeón | Rama | Daño vs base (±EE) | Daño recibido vs base (ruidoso) |
|---|---|---|---|
| tanque | tq_ariete (def.) | +1,5 % (±3,7) | +16,2 % |
| tanque | tq_quiebre (ctrl) | +1,8 % (±3,9) | +11,1 % |
| tanque | tq_vortice (ctrl) | +4,4 % (±3,1) | +20,5 % |
| tanque | tq_filo (ofen.) | +6,4 % (±4,2) | +16,9 % |
| mago | mg_quebradiza (ofen.) | -5,6 % (±2,8) | +0,8 % |
| mago | mg_glacial (ctrl) | -6,6 % (±2,6) | -5 % |
| mago | mg_tormenta (ofen.) | -0,3 % (±3,1) | +14 % |
| mago | mg_tierra (def.) | -0,7 % (±2,5) | +38 % |
| cazadora | cz_caceria (ofen.) | -4,3 % (±2,6) | -9,9 % |
| cazadora | cz_rastro (ctrl) | -7,8 % (±2,3) | -13,2 % |
| cazadora | cz_cobertura (def.) | -5,9 % (±2,4) | -11,6 % |
| cazadora | cz_marca (ctrl) | -3,3 % (±2,5) | -29,8 % |

### Historial de rechazos propios (comparación con la versión anterior)
1. Primera versión: `cz_marca` salía −11,8 % y `cz_caceria` −8,7 % (costo de enfriamiento > beneficio) y `tq_quiebre`/`tq_vortice` +25 % (control dominante en el tanque). Se rebalancearon (costos, aturdimiento, arrastre) y se repitió la simulación completa.
2. La prueba de runtime descubrió un error real: la Firma renovaba la marca en cada golpe y pisaba la de `cz_marca` (3000 ms en vez de 3500). Corregido (la rama aplica `max`, sin enfriamiento).
3. El modelo de presupuesto a priori se descartó como puerta: la fuente de verdad es la simulación.

### Hallazgos abiertos (para el evaluador independiente)
- **El "daño recibido" es ruidoso** (valores absolutos pequeños, 8 semillas) y 8/8 partidas sobreviven: la sim de 150 s **no demuestra** el valor de las ramas defensivas. `tq_ariete` aparece sin beneficio medible → candidata a rediseño o a una sim con presión (jefe / nivel alto).
- Las ramas ofensivas condicionales (`mg_quebradiza`, `cz_caceria`) dependen de que el piloto automático cumpla la condición; un jugador humano puede rendir distinto. Requiere playtest.
- Solo 3 campeones y 2 habilidades cada uno; no se tocó la definitiva (`skill:"ult"` está soportado por el motor, sin datos).

## 4. Compatibilidad y dependencias
- **`index.html` tiene un solo dueño (el integrador, S0A)**: no se editó. Línea requerida, **después de `js/systems/boons.js` y `skill-evolution.js`** (p. ej. junto a `champion-entry-balance.js`):
  ```html
  <script src="js/data/build-synergy.js"></script>
  <script src="js/systems/build-synergy.js"></script>
  ```
  Las pruebas inyectan esos dos scripts; sin ellos el juego es idéntico al actual.
- **Cooperativo**: el anfitrión valida y aplica (`syn:` pasa `netHostBuffPicked` vía `boonParseOpt`). **Corregido en S0D:** `h.synergy` YA viaja en el snapshot (`_netDeltaOf` copia toda clave de héroe fuera de `NET_SKIP_KEYS`); la afirmación previa de que no se replicaba era una suposición sin verificar. Ahora hay prueba (`t_synergy_runtime.js`). Sigue sin probarse con dos clientes reales.
- **Horda Infinita**: usa el mismo `boonBuildOffers`; cubierto por la oferta, no por una corrida de modo completa.
- No toca relay, persistencia, economía ni `save`. La rama dura la incursión (como los refuerzos) y no se guarda.
- **S0C** (`claude/s0c-arquitectura-beta`) y la rama `beta/integracion` existen: este PR apunta a **`beta/integracion`**, nunca a `main`. S0C modifica `_evoActive` en `skill-evolution.js` (permite `opts.evoHit`); mi motor usa `fromProc:true` sin `evoHit`, por lo que sigue excluido y es compatible. **No se ejecutaron las pruebas sobre una base con S0C aplicado** (pendiente al integrar). `ownership.json` de S0C no define un paquete "G": estos archivos son nuevos (`js/data|systems/build-synergy.js`, `tools/build-evolution/**`, `docs/build-evolution/**`) y requieren dueño asignado por el arquitecto. `tools/agents/check-diff.js` no está en esta base: pendiente.
- La batería central (`tools/quality/run-all.js`, workflows) pertenece a C: las tres pruebas quedan listadas aquí para que C las registre. AGENTS.md exige además `check-entry-reference`/`entry-gate`/`ability-gate` solo para campeones nuevos: **no hay campeones nuevos** en este PR.

## Reparaciones tras la evaluación independiente #1 (66/100, RECHAZAR → REPARAR)
Corregido y cubierto por pruebas (98 en `t_synergy_runtime.js`): enfriamientos por enemigo (antes `e.id` inexistente → enfriamiento global), sin segundo crítico en el daño extra, escudo previo > 50 % ya no se recorta, estado interno en `WeakMap` (no viaja en el snapshot), oferta de rama alternada (elegir la carta base pospone). Rebalanceo: `mg_tormenta` (cadena 45 % → 18 %, al arreglarse el enfriamiento por enemigo se disparó a +73 %), `mg_tierra` y `cz_cobertura` reforzadas, `cz_marca` pasa a control (marca + ralentización), `cz_rastro` suma +15 % contra frenados; costos de enfriamiento del mago reducidos.

### Ramas defensivas bajo presión (`sim-pressure.js`, 12 semillas, vida efectiva = vida + escudo; `pressure-L5.json`, `pressure-L7.json`)
| Rama | Nivel 5 | Nivel 7 |
|---|---|---|
| tq_ariete (def.) | +1,4 pp (EE 0,1–0,4) | +5,6 pp (EE 0,8–1,7) |
| mg_tierra (def.) | +2,8 pp (muertes 3→0) | +4,9 pp |
| cz_cobertura (def.) | +3,9 pp | +5,3 pp |
Las tres mejoran la vida efectiva en ambos niveles (la evaluación #1 las halló sin señal fiable). Aun así las diferencias son pequeñas (≤ 6 pp) y varias están dentro de 1–2 errores estándar: **mejora modesta, no un efecto grande demostrado**. Sin dos clientes reales ni playtest humano.

### Criterio estadístico de la banda de balance (corregido tras la evaluación #2)
La evaluación #2 (82/100) marcó el criterio de "1 error estándar" como falso verde parcial; **se revirtió**. Ahora: techo +15 % sobre el punto estimado; piso −10 % con una **prueba pareada por semilla** (misma partida con y sin rama): la rama falla solo si el IC 95 % de la diferencia pareada queda por debajo de −10 %. `mg_glacial` (punto estimado −10,3 %) pasa con cota superior +0,2 % y la prueba imprime un AVISO. Es decir: no se demuestra que esté bajo el piso, pero tampoco que esté sobre él; el ruido de 8 semillas es ±4 %. Las ramas del mago siguen levemente por debajo de la base en el autopiloto.

### Evaluaciones independientes y estado (S0E)
| Evaluación | Puntaje | Resultado |
|---|---|---|
| #1 (dbd27fdf~) | 66/100 | RECHAZAR → REPARAR (bug de claves por enemigo, doble crítico, etc.) |
| #2 (dbd27fdf) | 82/100 | Criterio de 1 EE = falso verde parcial → se revirtió |
| #3 (f7888754) | 85/100 | Sin críticos; pendientes: dos clientes reales (−2), Horda Infinita (−1), dueño de G en ownership (−2) |

Después de la #3: **prueba con dos clientes reales** (`t_synergy_coop.js`, relay local real, 8 comprobaciones), **Horda Infinita completa** (`t_synergy_endless.js`, 3 rondas con piloto automático, 6 comprobaciones), compuerta de balance reforzada (16 semillas, t de Student, cota inferior del IC95 % pareado ≥ −15 %), `cz_marca` con +15 % contra marcados. Con 16 semillas el rango de daño es −7,8 % … +6,4 %.
Sin valor medible demostrado: **`mg_tierra`** (cura; +3,3 pp de vida efectiva, no reduce muertes en niveles 7-8). `tq_ariete` es la única defensiva consistente, con efecto modesto; `cz_cobertura` no se distingue de las ramas ofensivas.
Pendiente: dueño de G en `ownership.json` (PR #254, depende de S0C) → los puntos de aislamiento no se recuperan hasta entonces. Líneas de `index.html` por el integrador (`docs/arquitectura-compartida/INDEX_HTML.md` en #254).

**Prueba de mutación (evaluación #4):** con todos los efectos de rama anulados, `t_synergy_coop.js` pasaba (no verificaba que la rama actuara). Corregido: ahora fuerza Nova Glacial y exige que los enemigos ya ralentizados queden aturdidos ≥ 400 ms (la nova base solo aturde ~110 ms); con el mutante la prueba FALLA, sin él PASA.
