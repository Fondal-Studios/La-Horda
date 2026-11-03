# ART RUN 05 — Thalen B100: recuperación parcial y fuentes rechazadas

Fecha: 2026-11-03, 08:40 ART  
Base de producción: `main` `54aa936fa254112044e29493179893dd0f8694d6`  
Rama de checkpoint: `art/production-checkpoint-20261103` (head anterior `f0d63c173a5addd2f7acac1121bb28530fbbab3f`).

## Referencias recuperadas

Se recuperaron en bytes y se inspeccionaron seis WebP pequeños del brief:

- `docs/art-brief/ejemplos/mago/00_actual_mago.webp` — blob `662644e71e611f6b19c6b8ebad0447d38fd4d93d`, 392,688 bytes. Es una hoja de contacto reducida del atlas runtime actual (1254×1254 → 0,72), con 16 poses. **No es el PNG exacto del Códice ni sustituye al atlas original.**
- `mago.cuerpo.caminar_abajo__ref.webp` — `df5a5ac8fdbeb8d76bb177f47a17709d8b1df05a`, 37,796 bytes.
- `mago.cuerpo.caminar_arriba__ref.webp` — `9d2dde150ada0b9c9dde660d327fc03881988abb`, 36,880 bytes.
- `mago.cuerpo.ataque_abajo__ref.webp` — `2809e96ef01506a094dcf69bedb84f4d7ee2bcf2`, 42,018 bytes.
- `mago.cuerpo.ataque_perfil__ref.webp` — `e29448bb6bd3b4d8dddb96633baccb1b2578d68b`, 40,158 bytes.
- `mago.cuerpo.ataque_arriba__ref.webp` — `7bc79ff6c78807d1c1dbf5747f911e9d39366a13`, 39,190 bytes.

Las cinco hojas de pose usan a Tibor como referencia de cadencia, dirección y apoyo de pies; **no** son referencia de identidad para Thalen. La identidad de Thalen sigue siendo el mago de sombrero violeta, túnica azul noche, bastón de madera y paleta arcana del brief.

## Binarios exactos que siguen bloqueados

- Códice: `assets/ui/codex/champions/mago.png`, blob `f07788b98aa635bf1587c73f6e0e243c38b3cf64`, 2,005,268 bytes.
- Atlas runtime: `assets/sprites/champions/mago/atlas.png`, blob `055fe843d5a9fc06ec64cf63ac6bdce7a7484e31`, 1,248,766 bytes.

Para ambos, `fetch_file(encoding=base64)` devolvió contenido vacío; `fetch_blob` no pudo decodificar el PNG como UTF-8. El WebP de contacto permite estudiar la identidad general y el atlas de 16 poses, pero no habilita la comparación exacta del Códice/atlas a resolución nativa. Los scratch paths de recuperación siguen ausentes.

## Contrato B100 confirmado

Atlas objetivo: 448×1008, grilla 4×9, celdas 112×112, pies en fila 106, altura de reposo 62–72 px, una silueta conectada por celda, alfa exclusivamente 0/255, contorno oscuro de 1 px y perfil hacia la derecha.

- Fila 1 / 0–3: caminar abajo.
- Fila 2 / 4–7: caminar perfil (existente).
- Fila 3 / 8–11: caminar arriba.
- Fila 4 / 12–15: ataque abajo.
- Fila 5 / 16–19: ataque perfil.
- Fila 6 / 20–23: ataque arriba.
- Fila 7 / 24–27: lanzar (existente).
- Fila 8 / 28–31: definitiva.
- Fila 9 / 32–35: muerte.

El runtime actual continúa usando 16 recortes legacy; el atlas B100 de 36 poses no tiene consumidor verificado. No se modificó el renderer ni se asumió que el atlas legacy satisface las cinco filas pendientes.

## Intentos originales de esta pasada — ambos rechazados

Se generaron dos hojas exploratorias 4×5 (20 poses cada una). Las dos pidieron fondo transparente, pero conservaron demasiados píxeles semitransparentes. No se umbralizó, cuantizó ni filtró la imagen para simular un PASS.

| Intento | Archivo / ID | Dimensiones | Alfa 0 | Alfa 255 | Alfa parcial | Resultado |
|---|---|---:|---:|---:|---:|---|
| 01 | `file_00000000181481f59c51f4e5b0997dc4` | 1122×1402 | 1,012,103 | 447 | 560,494 | REJECT |
| 02 | `file_00000000920081f59174f6aa53bb3709` | 1122×1402 | 961,123 | 1,173 | 610,748 | REJECT |

SHA-256 del intento 02: `6a91618938f1b3b7fbc933b0e604ced66eec9341cc54ef9351f16155650d193e`. El archivo del intento 01 fue reemplazado por el intento 02 con el mismo nombre local antes de calcular su hash; no se inventa una huella. Ambos quedan `GENERATED_NOT_APPROVED`, no se instalaron y no forman parte del atlas del juego. El intento histórico de 12 poses traseras sigue rechazado por el mismo gate de alfa y por no ser un atlas canónico de 36 poses.

## Resultado y próximo paso

- Ningún PNG original fue reemplazado.
- Ningún asset nuevo fue subido al set visual de producción.
- No se tocaron runtime, balance, mecánicas, cuentas, cobros, red ni infraestructura.
- No se ejecutaron gates de atlas, estilo, roster o gameplay sobre estos intentos porque ya fallan el requisito de alfa.

Siguiente paso seguro: recuperar los dos PNG exactos en un checkout con acceso binario; comparar Códice y atlas nativo; después producir las 20 poses faltantes con una fuente pixel-art nativa (preferentemente el flujo del Pintor/donantes y sus gates), conservar las 16 poses actuales hasta aprobar el atlas completo, implementar el mapeo real del consumidor y capturar antes/después en escritorio/móvil. La skin Convergencia queda después del cuerpo base.
