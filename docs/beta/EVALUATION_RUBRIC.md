# Sistema de calidad — rúbrica del evaluador independiente

**Umbral de aprobación: 90/100 global y cero regresiones críticas.** Si no se alcanza, se ordena reparación o
reconstrucción parcial y se vuelve a evaluar (cada ronda se archiva en `docs/beta/evaluation/`).

## Independencia
* El evaluador **no escribió el código** y recibe solo evidencia: capturas, secuencias de video, métricas y esta rúbrica.
* Las dos versiones se entregan **a ciegas** como `A` y `B` (la asignación a main/rama está en un archivo sellado que el
  evaluador no ve y se revela recién al archivar el resultado).
* Califica cada versión por separado (0–100 por criterio) y luego dice cuál es mejor y por cuánto.

## Criterios (peso)

| Criterio | Peso | Qué se mira |
|---|---|---|
| Coherencia artística | 20 | Paleta, escala de píxel y lenguaje de luz consistentes entre título, arena, efectos, UI y botín; nada "pegado"; respeta el pixel art. |
| Calidad de animación | 15 | El campeón del título y las transiciones se mueven con intención; aparición, ulti y caída tienen anticipación y cierre; sin saltos. |
| Claridad del combate | 20 | Se distingue al héroe, a los enemigos, los peligros y los avisos aun con muchos efectos; el peligro no depende solo del color; el HUD sigue legible. |
| Sensación de impacto | 20 | Golpes, daño, muerte y definitiva se *sienten* distintos y proporcionales; jerarquía clara (básico < habilidad < pesado < ulti). |
| Rendimiento | 10 | Costo de `render()` y cuadros reales vs `main`; sin picos nuevos; presupuesto de partículas. (Se evalúa con `perf.json`.) |
| Facilidad para comenzar | 15 | Toques y pantallas de título a primer movimiento; legibilidad del botón principal; no hay callejones sin salida. (Se evalúa con `taps.json` y capturas.) |

Puntaje global = suma ponderada.

## Regresiones críticas (cualquiera de estas = no aprueba, aunque el puntaje sea ≥ 90)
1. Error de JavaScript en la consola/página durante el guion.
2. La partida no arranca o se traba (cualquier camino de arranque).
3. El HUD o un botón de habilidad queda tapado, ilegible o inalcanzable.
4. Un efecto oculta al héroe, a un enemigo o a un peligro letal en un momento de decisión.
5. Cuadros: p95 de `render()` o de cuadro reales claramente peor que `main` (> +25 %) en la escena densa.
6. La partida (daño, vida, bajas, RNG) cambia por tener la capa activa (`test-rng-isolation.js`).
7. Se rompe una puerta existente (`t_juice`, `t_ground_loot`, `test-touch-targets`, …).
8. Se rompe el camino clásico del título ("Tocá para continuar").
9. La opción *Reducir movimiento* no apaga lo que dice apagar.

## Formato de entrega del evaluador (JSON)
```json
{
  "round": 1,
  "scores": {"A": {"coherencia":0,"animacion":0,"claridad":0,"impacto":0,"rendimiento":0,"inicio":0,"global":0},
             "B": {...}},
  "better": "A|B", "margin": 0,
  "criticalRegressions": [{"id":1,"version":"A|B","evidence":"archivo/captura + qué se ve"}],
  "findings": [{"severity":"critical|major|minor","version":"A|B","area":"...","evidence":"...","fix":"..."}],
  "verdict": "PASS|FAIL"
}
```
