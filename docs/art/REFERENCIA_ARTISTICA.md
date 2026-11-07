# Atlas de referencia artístico (guardianes del Códice + enemigos, a la misma altura)

Objetivo: tener a la vista, en una sola escala, cómo se ven **todos los guardianes tal como aparecen en el Códice** y **todos los enemigos tal como los dibuja el juego**, para juzgar la coherencia artística. Todo está llevado a la **misma altura (128 px, vecino más cercano, pies sobre una línea común)**.

## Láminas (docs/art/referencia/)
- **Guardianes (43):** `guardianes_01.png` … `guardianes_06.png`. FRENTE / LADO / ESPALDA recortados de la hoja del Códice (`assets/ui/codex/champions/<id>.png`). Entre corchetes, el estado del atlas de juego (`ATLAS_ARTE.md`): CODEX_OK, FALTA_ANIMACION o ARTE_VIEJO.
- **Enemigos (100 de 104 tipos):** `enemigos_<arena>.png` (una por arena), ordenados por rango (normales, luego élites/subjefes/jefes marcados con `*`). Es el `idle` de frente que dibuja `drawEnemyBody` en el juego real. Sin render de idle: `madre_espora`, `ab_acechador`, `ab_tejedor`, `mn_insecto`.
- Datos: `guardianes.json`, `enemigos.json` (factor de escala aplicado a cada uno).

## Cómo se regenera
```
python3 tools/art/build-reference-atlas.py                     # guardianes (Códice)
NODE_PATH="server/node_modules:$(npm root -g)" node tools/art/build-reference-atlas-enemies.js   # recortes del juego real
python3 tools/art/build-reference-atlas-enemies.py             # láminas de enemigos
```
`--h N` cambia la altura común. Son herramientas de revisión: no modifican arte del juego.

## Lectura de coherencia (primera pasada, a ojo)
- Los guardianes del Códice comparten lenguaje: pixel art chibi de contorno oscuro, paleta limitada por personaje. Al normalizar la altura se ve que el cuerpo del Códice es la referencia estable.
- Entre enemigos la coherencia es **desigual**: conviven enemigos pixelados con contorno (Fortaleza: carcelero, autómata, verdugo) con piezas más pictóricas y suaves (p. ej. `dragon_forja`) y con sprites chicos/ruidosos. La lista priorizada de qué rehacer está en `docs/beta-release/NEXT_SESSION.md` y `ATLAS_ARTE.md`.
- Para decidir la altura relativa *en juego* de cada enemigo (no solo en esta lámina) hay que revisar `hMul` por tipo; esta lámina fuerza todos a la misma altura a propósito.

## Pendiente
- Pasar un criterio humano (dirección de arte) por las láminas y marcar qué enemigos salen del estilo.
- Una vez unificado el estilo, generar versión "mismo estilo" por arena y fijar un test de coherencia (altura, contorno de 1 px, alfa binario, paleta) como gate.
