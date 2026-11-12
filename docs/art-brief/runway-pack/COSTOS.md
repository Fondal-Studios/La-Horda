# Costos de Runway del paquete (créditos)

> Generado por `tools/art/build-runway-pack.py`. **Supuestos explícitos:** 1 imagen `gen4_image` 1024:1024 con referencias = **8 créditos** (medido en `docs/beta-release/ART_CREDITS.md`); un enemigo pide **3 imágenes clave** (reposo, caminar, ataque) y el pintor determinista deriva el resto; FX, íconos 16×16, proyectiles y auras NO usan Runway. Se cuentan solo bloques abiertos (no `INTEGRADO_MAIN` ni seguimientos). El factor de reintento es una SUPOSICIÓN (×1,0 = todo sale a la primera; ×2,5 = lo razonable según los descartes registrados): el repo no mide la tasa real de aceptación.

| Grupo | Prioridad | Bloques abiertos | Imágenes Runway | Créditos ×1,0 | Créditos ×2,5 |
|---|---|---:|---:|---:|---:|
| 01-cuerpos | P0 | 5 | 56 | 448 | 1.120 |
| 01-cuerpos | P1 | 10 | 80 | 640 | 1.600 |
| 01-cuerpos | P2 | 26 | 44 | 352 | 880 |
| 02-combate | P0 | 43 | 0 | 0 | 0 |
| 02-combate | P1 | 143 | 2 | 16 | 40 |
| 02-combate | P2 | 66 | 41 | 328 | 820 |
| 03-mundo | P0 | 39 | 92 | 736 | 1.840 |
| 03-mundo | P1 | 94 | 250 | 2.000 | 5.000 |
| 03-mundo | P2 | 94 | 290 | 2.320 | 5.800 |
| 04-interfaz | P0 | 8 | 3 | 24 | 60 |
| 04-interfaz | P1 | 45 | 15 | 120 | 300 |
| 04-interfaz | P2 | 17 | 41 | 328 | 820 |
| 05-cosmeticos | P1 | 14 | 14 | 112 | 280 |
| 05-cosmeticos | P2 | 31 | 31 | 248 | 620 |
| **Total** | | | **959** | **7.672** | **19.180** |

Saldo conocido al escribir esto: **2 créditos** (consulta `GET /v1/organization` → `creditBalance`; `node tools/art-world/runway-world.js status`). Por eso la regla es: **no empezar nada nuevo sin saldo**, y gastar siempre en el orden P0 → P1 → P2 de la cola, un bloque completo por vez.
