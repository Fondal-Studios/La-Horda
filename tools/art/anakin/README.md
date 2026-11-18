# Anakin: arte faltante dibujado en la PC (0 créditos)

Anakin es el modelo de imágenes local del dueño (stable-diffusion.cpp + DreamShaper 8 LCM + IP-Adapter Plus, en la placa
de video). Esta carpeta lo usa para **completar animaciones de personajes que ya tienen arte**: muertes y ataques que hoy
el motor resuelve repitiendo el cuadro de caminar.

No inventa personajes nuevos. Parte de un cuadro real del personaje y lo devuelve a la grilla y paleta de ese mismo cuadro.
Por eso conserva el estilo (ART_BIBLE §1, §2 y §14).

## Cómo trabaja

1. **Prepose determinista.** Toma un cuadro real del personaje mirando a la derecha y arma la pose (retroceso,
   tambaleo, hundirse, caer, tendido; o preparación, embestida, golpe, recuperación) torciendo y aplastando el sprite.
2. **Repintado.** Anakin repinta cada pose (imagen a imagen, fuerza 0,42–0,50) con el cuadro original como
   referencia de estilo (IP-Adapter).
3. **Vuelta a píxel nativo.**
   - Recorta el fondo, sin salir de la silueta de la prepose agrandada.
   - Baja a la grilla nativa por mayoría de bloque.
   - Cuantiza a la paleta del cuadro original: exacta si tiene hasta 256 tonos, si no 96 tonos de corte medio.
   - Deja el alfa en 0/255 y repone el contorno de 1 px si el original lo tiene.
   - Apoya el cuadro en la misma línea de pies.
4. **Elección a ojo.** Elegir los mejores cuadros, guardarlos en `art-source/anakin/<clave>/<estado>_<i>.png` e
   instalar con `install.py`.

## Uso

```
set ANAKIN_IMG=C:\ruta\a\imagenes          (carpeta con motor\sd-cli.exe y modelos\; por defecto ~/neon-panel/pc/tools/imagenes)
python tools/art/anakin/anakin.py <clave> --fuente <atlas.png> --celda W H --indice N [--bloque 2] --estado death --tema "..."
python tools/art/anakin/install.py            instala todo lo elegido (idempotente)
python tools/art/anakin/install.py --check    verifica que lo instalado coincide con art-source (sirve para CI)
```

`targets.json` dice dónde va cada clave:

- `battlefield_death`: hoja `assets/sprites/battlefield/death/<clave>.png`. La lee `js/rendering/battlefield-art.js`.
- `death_pack`: entra en `DEATH_PACK_META` vía `js/assets/anakin-meta.js`, que es GENERADO.
- `atlas_celdas`: llena celdas libres de un atlas y apunta el set en su meta.
- `sueltos`: PNG sueltos.

Cada PNG lleva su gemelo WebP sin pérdida.

**Si se vuelve a correr** un generador de atlas (`hoja_bestias/build.py`, `pack_canon/build.py`, `build_micelial.py`,
`abismo/extract.py`), correr `install.py` después: esos generadores reconstruyen los atlas desde sus hojas originales.

## Límites conocidos

- Sirve para personajes con arte propio. Para íconos de 16×16 no sirve: a esa escala el modelo no controla píxeles
  sueltos, y conviene el pintor determinista.
- La cara o los colores pueden derivar un poco (más tierno, otro matiz). Por eso hay dos pasadas: una normal y otra
  "de fidelidad", y se elige cuadro por cuadro.
- No es arte aprobado. Todo entra como `instalado_sin_aprobar` hasta que el dueño lo vea en el ANTES/DESPUÉS del motor
  (ART_BIBLE §8).
- Es IA generativa: está declarada en `docs/steam/DECLARACION_IA.md` y registrada en `docs/beta-release/ART_CREDITS.md`.
