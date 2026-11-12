# Costos de Runway del paquete (créditos)

> Generado por `tools/art/build-runway-pack.py`. **Sin tope de créditos por decisión del dueño (2026-11-12): se gasta hasta agotar el saldo; el saldo real hoy es 2, así que nada se puede generar hasta recargar.** **Supuestos explícitos:** 1 imagen `gen4_image` 1024:1024 = **8 créditos** (campeones, mundo, diseños); 1 hoja de enemigo 1280:720 = **5 créditos** (medido en `art-source/runway-enemies/*/receipt.json`). Un enemigo cuesta 3 hojas (15 créditos) si ya tiene atlas, y 23 si hay que crear primero su diseño. FX, íconos 16×16, proyectiles y auras NO usan Runway. Se cuentan solo bloques abiertos (no `INTEGRADO_MAIN` ni seguimientos). El factor de reintento es una SUPOSICIÓN (×1,0 = todo sale a la primera; ×2,5 = razonable según los descartes registrados): el repo no mide la tasa real de aceptación.

| Grupo | Prioridad | Bloques abiertos | Imágenes de 8 créditos | Créditos ×1,0 | Créditos ×2,5 |
|---|---|---:|---:|---:|---:|
| 01-cuerpos | P0 | 5 | 56 | 448 | 1.120 |
| 01-cuerpos | P1 | 10 | 80 | 640 | 1.600 |
| 01-cuerpos | P2 | 26 | 44 | 352 | 880 |
| 02-combate | P0 | 43 | 0 | 0 | 0 |
| 02-combate | P1 | 143 | 2 | 16 | 40 |
| 02-combate | P2 | 66 | 41 | 328 | 820 |
| 03-mundo | P0 | 39 | 38 | 304 | 760 |
| 03-mundo | P1 | 94 | 145 | 1.160 | 2.900 |
| 03-mundo | P2 | 94 | 176 | 1.408 | 3.520 |
| 04-interfaz | P0 | 8 | 3 | 24 | 60 |
| 04-interfaz | P1 | 45 | 15 | 120 | 300 |
| 04-interfaz | P2 | 17 | 41 | 328 | 820 |
| 05-cosmeticos | P1 | 14 | 14 | 112 | 280 |
| 05-cosmeticos | P2 | 31 | 31 | 248 | 620 |
| Enemigos (hojas) | todas | 91 criaturas (67 sin atlas) | 3 hojas c/u | 1.901 | 4.752 |
| **Total** | | | | **7.389** | **18.472** |

Saldo conocido al escribir esto: **2 créditos** (`node tools/art-world/runway-world.js status`). Orden de gasto: P0 → P1 → P2 de la cola, un bloque completo por vez, registrando cada gasto en `docs/beta-release/ART_CREDITS.md`.
