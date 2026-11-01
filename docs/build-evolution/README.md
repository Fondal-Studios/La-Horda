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
| Efecto real de cada rama en el juego real + oferta/exclusividad/jefes/set/cooperativo | `node tools/build-evolution/t_synergy_runtime.js` | PASS (83 comprobaciones) |
| Balance (piloto automático real, Bosque, nv.20, 8 semillas × 150 s) | `node tools/build-evolution/sim-balance.js docs/build-evolution/sim-results.json` | rango de daño vs base **−5,8 % … +13,2 %**, todas bajo el techo por rol, 0 errores, 8/8 sobreviven |
| Rendimiento | mismo sim, ms de CPU por partida simulada | sin sobrecosto medible (−4,2 %, ruido) |
| Tiempo de comprensión | estimación por palabras (3 pal/s) | carta ≤ 10,3 s, media 9,1 s (estimación, no prueba con jugadores) |

El hash de los datos va dentro de `sim-results.json`: si cambiás el balance, `t_synergy_static.js` falla hasta que repitas la simulación.

| Campeón | Rama | Daño vs base (±EE) | Daño recibido vs base |
|---|---|---|---|
| tanque | tq_ariete (def.) | −4,6 % (±8) | +19,9 % |
| tanque | tq_quiebre (ctrl) | +12,9 % (±6,3) | +43,6 % |
| tanque | tq_vortice (ctrl) | +13,2 % (±5,7) | +23,6 % |
| tanque | tq_filo (ofen.) | +9,6 % (±6,1) | +25,2 % |
| mago | mg_quebradiza | −2,0 % (±5) | +47,4 % |
| mago | mg_glacial | −4,4 % (±4,5) | +15,0 % |
| mago | mg_tormenta | +0,6 % (±4,5) | +10,5 % |
| mago | mg_tierra (def.) | +3,6 % (±5,2) | +21,1 % |
| cazadora | cz_caceria | −4,3 % (±2,4) | −30,3 % |
| cazadora | cz_rastro | +0,1 % (±2,5) | −40,1 % |
| cazadora | cz_cobertura (def.) | +6,0 % (±1,9) | −20,4 % |
| cazadora | cz_marca | −5,8 % (±3,5) | −31,0 % |

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
- **Cooperativo**: el anfitrión valida y aplica (`syn:` pasa `netHostBuffPicked` vía `boonParseOpt`). **Pendiente (dueño de `js/net/**`)**: replicar `h.synergy` en el snapshot; hoy el invitado no ve el pip/tooltip de su rama. No probado con dispositivos reales.
- **Horda Infinita**: usa el mismo `boonBuildOffers`; cubierto por la oferta, no por una corrida de modo completa.
- No toca relay, persistencia, economía ni `save`. La rama dura la incursión (como los refuerzos) y no se guarda.
- Contrato S0C: no existe rama `S0C` en el remoto; nada de este PR depende de él.
- La batería central (`tools/quality/run-all.js`, workflows) pertenece a C: las tres pruebas quedan listadas aquí para que C las registre. AGENTS.md exige además `check-entry-reference`/`entry-gate`/`ability-gate` solo para campeones nuevos: **no hay campeones nuevos** en este PR.
