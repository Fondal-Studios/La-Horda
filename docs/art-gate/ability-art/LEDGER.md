# Registro del circuito de arte de habilidades

Generado por `tools/art/ability-art/ledger.py` desde `docs/art-gate/ability-art/<guardián>/summary.json`. Umbrales: puntaje ≥ 85; mejora ≥ +6 sobre el arte actual (con techo: nunca más de la mitad del margen hasta 100); sin regresión de riqueza, presencia ni silueta.

## orsa

| habilidad | arte actual | arte nuevo | mejora | rondas | estado |
|---|---|---|---|---|---|
| pierce | 82.7 | 98.3 | +15.6 | 3 | PASS |
| discharge | 80.5 | 98.2 | +17.7 | 1 | PASS |
| brace | 67.1 | 94.2 | +27.1 | 2 | PASS |
| anchor_zone | 71.8 | 94.5 | +22.7 | 2 | PASS |
| storm_zone | 80.5 | 94.7 | +14.2 | 1 | PASS |
| sweep | 83.1 | 97.5 | +14.4 | 1 | PASS |

Integración: integradas ['pierce', 'discharge', 'brace', 'anchor_zone', 'storm_zone', 'sweep']; humo OK: SMOKE OK orsa: pierce,discharge,brace,anchor_zone,storm_zone,sweep

## sira

| habilidad | arte actual | arte nuevo | mejora | rondas | estado |
|---|---|---|---|---|---|
| ink_line | 76.5 | 98.9 | +22.4 | 1 | PASS |
| retrace | 79.1 | 97.2 | +18.1 | 1 | PASS |
| erase | 68.8 | 96.0 | +27.2 | 2 | PASS |
| atlas | 64.7 | 91.0 | +26.3 | 2 | PASS |
| atlas_zone | 75.8 | 97.5 | +21.7 | 3 | PASS |

Integración: integradas ['ink_line', 'retrace', 'erase', 'atlas', 'atlas_zone']; humo OK: SMOKE OK sira: ink_line,retrace,erase,atlas,atlas_zone

## tibor

| habilidad | arte actual | arte nuevo | mejora | rondas | estado |
|---|---|---|---|---|---|
| swarm | 69.8 | 91.6 | +21.8 | 1 | PASS |
| pollen | 67.2 | 90.7 | +23.5 | 1 | PASS |
| recall | 76.4 | 98.3 | +21.9 | 1 | PASS |
| hive_zone | 85.5 | 100.0 | +14.5 | 3 | PASS |

Integración: integradas ['swarm', 'pollen', 'recall', 'hive_zone']; humo OK: SMOKE OK tibor: swarm,pollen,recall,hive_zone

## vesper

| habilidad | arte actual | arte nuevo | mejora | rondas | estado |
|---|---|---|---|---|---|
| needles | 85.5 | 97.8 | +12.3 | 2 | PASS |
| seam | 92.5 | 98.3 | +5.8 | 1 | PASS |
| unpick | 77.2 | 95.6 | +18.4 | 1 | PASS |
| last_stitch | 77.4 | 96.9 | +19.5 | 3 | PASS |
| stitch_zone | 83.0 | 100.0 | +17.0 | 2 | PASS |

Integración: integradas ['needles', 'seam', 'unpick', 'last_stitch', 'stitch_zone']; humo OK: SMOKE OK vesper: needles,seam,unpick,last_stitch,stitch_zone

## zahra

| habilidad | arte actual | arte nuevo | mejora | rondas | estado |
|---|---|---|---|---|---|
| furnace | 68.2 | 97.5 | +29.3 | 4 | PASS |
| quench | 68.3 | 95.3 | +27.0 | 1 | PASS |
| ash_step | 76.7 | 100.0 | +23.3 | 1 | PASS |
| vent | 76.8 | 96.2 | +19.4 | 2 | PASS |
| vent_zone | 85.5 | 99.8 | +14.3 | 2 | PASS |

Integración: integradas ['furnace', 'quench', 'ash_step', 'vent', 'vent_zone']; humo OK: SMOKE OK zahra: furnace,quench,ash_step,vent,vent_zone

**Total: 25/25 piezas aprobadas por el Evaluador.**

Capturas antes/después en el motor real: `docs/art-gate/ability-art/<guardián>/ingame/` (arena bosque). Hoja de comparación: `<guardián>/compare.png`.

Estos puntajes los produce el Evaluador (contrato técnico, legibilidad, presencia y silueta frente al arte actual); **no son una aprobación de arte**. Limitación conocida: el Pintor usa familias de marcas genéricas, así que el arte nuevo es más nítido y unificado pero pierde parte del detalle temático del anterior (panal y polen de Tibor, circuitos de Orsa). La revisión humana de `docs/ART_BIBLE.md` §8 sigue pendiente.
