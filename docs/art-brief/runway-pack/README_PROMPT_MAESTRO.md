# Paquete de instrucciones para hacer el arte de La Horda con Runway

Este paquete le da a otro Claude (o a ti) TODO lo necesario para dibujar cada personaje, cada enemigo y cada bloque de arte pendiente con Runway, sin tener que preguntar cómo.
Está generado de los datos reales del juego (`node tools/art/dump-game-data.js` → `python3 tools/art/build-runway-pack.py`), así que si cambia un kit, un enemigo o la cola de arte, se vuelve a generar.

## 0. Qué promete y qué NO promete (lee esto primero)

| Promesa | Realidad |
|---|---|
| «Runway lo deja perfecto» | **No.** `gen4_image` entrega una ilustración de 1024×1024 por imagen, no una hoja de sprites. Los descartes registrados (`docs/beta-release/ART_CREDITS.md`) son por orientación equivocada (de frente en vez de espaldas), vista isométrica, `BAD_OUTPUT` (cobrado sin imagen) y diseño distinto al Códice. Por eso cada imagen pasa por **criterio de aceptación + reducción determinista + gates automáticos** antes de entrar al juego. |
| «Todo terminado» | Depende de créditos, no de instrucciones. Con el supuesto explícito de `COSTOS.md` (imágenes y hojas Runway abiertas): **ver `COSTOS.md`: ≈ 7.400 créditos si todo sale a la primera, ≈ 18.500 con reintentos razonables (supuesto declarado)**. El saldo cambia: consultalo siempre (al 2026-11-12 era 0–2 créditos). |
| «Calidad perfecta» | Se verifica, no se declara: ningún arte entra a `main` sin pasar los chequeos de `RECETA.md` §5 y la revisión independiente del repo. Ojo humano de arte sigue siendo necesario (lo dice `AGENTS.md`). |

Lo que SÍ garantiza este paquete: que cada bloque tenga su descripción, su prompt, su formato, su ruta de entrega y su criterio de aceptación; que el gasto sea ordenado (P0 → P1 → P2) y registrado; y que cada intento fallido deje recibo para no repetir el mismo error.

## 1. Contenido

| Archivo | Para qué |
|---|---|
| `RECETA.md` | El método paso a paso (referencias, generación, evaluación, reducción a escala nativa, integración, pruebas, registro). **Es lo primero que lee Claude.** |
| `POSES_CAMPEON.md` | Las 36 poses del atlas de campeón y cómo se hace el movimiento dinámico (ciclos, anticipación, inercia). |
| `ENEMIGOS_GUIA.md` | Cómo es una hoja de enemigo/jefe, la cadena `gen_sheet` → `install` → `walk_batch` y cómo se crea el atlas que falta. |
| `campeones/<id>.md` (46) | Por campeón: identidad visual, kit, qué falta, y **las 36 poses con su prompt y su comando**. |
| `enemigos/<arena>.md` (11 archivos, 104 criaturas) | Por enemigo: qué es, cómo se mueve, tamaño, la **cadena de comandos Paso 0–5** y los 9 estados con su prompt de apoyo. |
| `bloques/<grupo>.md` + `bloques.json` (731 bloques, 1.244 items) | Por bloque de la cola de producción: descripción, método, formato, ruta de entrega, referencias y prompt. |
| `COSTOS.md` | Cuántas imágenes y créditos cuesta cada grupo y prioridad. |
| `data/game-data.json` | Los datos del juego de los que sale todo (campeones, enemigos, lore, arte actual). |

## 2. El prompt que le pegas a Claude

Copia esto en un chat nuevo (en el repo `Fondal-Studios/La-Horda`) y cambia solo la última línea:

```
Sos el pintor de arte de La Horda. Leé primero docs/art-brief/runway-pack/README_PROMPT_MAESTRO.md y docs/art-brief/runway-pack/RECETA.md
y seguilos al pie de la letra. Reglas duras: (1) antes de gastar un crédito corré `node tools/art-world/runway-world.js status` y verificá el saldo (el dueño autorizó gastar sin tope hasta agotarlo; si el saldo no alcanza, pará y avisá). Los scripts de campeón y mundo traen un seguro por omisión (GUARDIAN_RUNWAY_BUDGET=24, WORLD_RUNWAY_BUDGET=40): para una tanda grande subilo con la variable de entorno, a propósito
y registrá cada gasto en docs/beta-release/ART_CREDITS.md; (2) usá SIEMPRE los prompts y comandos del paquete, con la lámina del Códice
como @codex y el cuadro actual como @pose; si falta la lámina, el atlas o el diseño, corré primero el «Paso 0» de la ficha (crea lo que falta con runway-design.js); (3) cada imagen se evalúa con el criterio de RECETA §5 ANTES de reducirla; lo rechazado no se integra y se anota por qué en ART_CREDITS.md;
(4) integrá solo lo aprobado y pasá los gates de RECETA §6; (5) un bloque completo por vez, en orden de prioridad (P0 → P1 → P2); (6) no abras PR ni hagas merge sin pedirlo, y NO inventes
resultados: si algo falla, decilo con el error.
Tarea de esta sesión: <ELEGÍ UNA: «hacé el bloque B0xx» | «hacé el campeón <id>» | «hacé los enemigos de la arena <arena>» | «mostrame el plan de gasto para el grupo <grupo> prioridad P0»>
```

## 3. Orden recomendado (para que la plata de créditos rinda)

1. **P0 de `01-cuerpos`**: los cuerpos de campeón que faltan (lanzar, golpe, muerte). Se ven en TODAS las partidas. Cifras actuales en `COSTOS.md`.
2. **P0 de `03-mundo`**: enemigos y jefes que se ven en la campaña. Cifras en `COSTOS.md`.
3. **P1 de `01-cuerpos`**, luego **P1 de `03-mundo`** (el grupo más caro, ver `COSTOS.md`).
4. Lo demás (P2, cosméticos, interfaz) solo si sobra.
5. FX de habilidad, íconos 16×16, proyectiles y auras **no gastan Runway**: son código/pintor determinista.

## 4. Antes de la primera imagen

- Saldo: `node tools/art-world/runway-world.js status` (el dueño autorizó gastar sin tope; con saldo 0–2 no se puede generar nada hasta recargar).
- Datos de prueba de cada campeón nuevo en el juego: `AGENTS.md` (puntos 1–7: no tocar `knownChampions`, correr `entry-gate`, etc.). El arte no cambia estadísticas.
- Cada generación deja `receipt.json` (`GENERATED_NOT_APPROVED`); aprobar es un paso aparte y explícito.
