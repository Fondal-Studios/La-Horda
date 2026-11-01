# Nano GM — combate basado en el códice, 28/10/2026

**Visual Gate: PASS para el cuerpo base y sus 28 clips.** No es una aprobación de todo el juego ni de todas sus skins/VFX.

Referencia obligatoria: [hoja de Nano GM](../../../assets/ui/codex/champions/nano_gm.png). Se generaron cuatro fuentes direccionales con imagegen y una corrección de espalda. Los prompts y originales quedan en `art-source/sprite-rework/nano_gm/2026-10-28/`. La primera versión de espalda se conserva como descartada.

## Entrega

- 112 cuadros distintos: reposo, caminar, ataque, cast, definitiva, daño y muerte; cuatro cuadros en cada una de cuatro direcciones propias.
- 3 archivos nuevos en assets: atlas PNG, copia WebP sin pérdida y JSON de metadatos. Son **un mismo atlas**, no dos juegos de cuadros. Cero archivos gráficos sobrescritos: se conserva el atlas anterior; los cargadores pasan a `codex-v2`.
- Pelo oscuro rizado, tatuajes, ropa negra/dorada y alas según el códice. Frente: violeta a la izquierda del observador; espalda: violeta a su derecha. Perfil derecho: ala violeta cercana; perfil izquierdo: dorada cercana. Sin espejo para generar direcciones.
- Cast/definitiva incluyen giro de torso y expansión de alas; muerte culmina con el cuerpo tendido. No se sustituyeron secuencias por una pose estática.
- Alas del cuerpo nuevo incluidas en el atlas: se suprime la segunda geometría de plumas procedurales. Se conservan halo del Regente, conductos, elevación y Forma del Juicio. La skin alternativa conserva su atlas y sus efectos; también su selección al morir.
- El adaptador competitivo usa el nuevo atlas y metadatos propios de izquierda. Sus controles/combate no cambian.

## Validación y límites

`packing.json`: 112 hashes de pose distintos, celdas 192×128, atlas 1536×1792, pivotes (96,120), alfa exclusivamente 0/255 y margen libre. No se contaron espejos, WebP ni fuentes como cuadros adicionales. Se extrajeron las siluetas conectadas y se retiraron residuos rojos de la máscara; no se repintó el personaje por código ni se aplicó un filtro para fingir pixel art.

`density.json`: los 112 cuadros pasan el detector canónico de densidad. `scan_sprites.py --dir champions/nano_gm/codex-v2`: cero archivos señalados. PNG y WebP decodifican a los mismos bytes RGBA.

`runtime.json`: **184 comprobaciones aprobadas**, cero errores. Incluye cada cuadro dibujado por el motor, direcciones sin espejo, siete estados de la skin alternativa, halo/alas, transformación, orientación de un snapshot de invitado y activación real del básico, habilidad y definitiva en combate. Altura de masa frente/derecha/espalda: 59 px, igual al Caballero; izquierda: 61 px (dentro del ±4%). Pies: −2 px en las cuatro vistas.

`competitive.json`: cuatro direcciones de caminata observadas en una partida local de práctica, sin espejo. No equivale a una sesión multiplayer real.

La inspección visual incluye [todos los cuadros dibujados por el motor](runtime-sheet.png), [animación](animations.gif), [combate](combat-idle.png), [cast](combat-cast.png), [definitiva](combat-ultimate.png) y [competitivo](competitive.png). El GIF es una previsualización a pasos iguales; los tiempos reales los gobierna cada estado del juego.

Presupuesto: una textura menor a 2048 en cada eje, sin asignación por cuadro de nuevas imágenes ni carga de 112 archivos individuales. Se registra un microbenchmark con lectura de píxeles, pero **no** se declara FPS de iPhone ni certificación de rendimiento de 50 jugadores.

Pendientes de la entidad antes de avanzar: revisión artística específica de su skin alternativa y revisión exhaustiva de transformaciones/VFX/proyectiles. Se probó su conservación funcional, no se declara ese alcance terminado. Pendiente global: cierre del inventario y revisión artística de otros héroes/enemigos.

## Reproducir

```bash
python3 tools/art/pack-nano-codex.py
CHROMIUM_PATH=/ruta/chromium node tools/art/check-nano-density.js
CHROMIUM_PATH=/ruta/chromium node tools/art/check-nano-codex.js
CHROMIUM_PATH=/ruta/chromium node tools/art/check-nano-competitive.js
python3 tools/art/scan_sprites.py --dir champions/nano_gm/codex-v2
```

Normalización medida con `roster_gate.js --write`; solamente se conservó el cambio de Nano GM en la tabla, manteniendo intactos los demás campeones y su skin alternativa.
