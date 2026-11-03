# Thalen — recuperación de fuentes y bloque corporal B100

Fecha de verificación: 2026-11-03. Este documento es un inventario/checkpoint; no aprueba ni instala arte.

## Estado exacto de main

- Main: `54aa936fa254112044e29493179893dd0f8694d6`.
- Referencia del Códice: `assets/ui/codex/champions/mago.png`, blob Git `f07788b98aa635bf1587c73f6e0e243c38b3cf64`.
- Atlas runtime existente: `assets/sprites/champions/mago/atlas.png`, blob Git `055fe843d5a9fc06ec64cf63ac6bdce7a7484e31`, 1,248,766 bytes.
- Skin existente: `assets/sprites/champions/mago/skins/convergencia/atlas.png`, blob Git `e1ff104e860dcda22f55a0a5b8c9a76b6ce71621`, 301,583 bytes.
- La carpeta de skins de Mago contiene actualmente `convergencia`; no empezar trabajo de skins antes de cerrar el cuerpo base.
- En `js/rendering/pixel-sprites.js`, el fallback declara `BACK_HEAD.mago = "h"` y `FACE_LETTERS.mago = []`. Esto es una observación de código, no una aprobación visual de la espalda del atlas.

## Bloque corporal vigente

El plan histórico `art-source/entregas/bloques/plan_bloques.json` marca B100 P1 / PENDIENTE y `control_produccion.json` conserva los cinco ítems como PENDIENTE, sin versión reutilizable:

1. `mago.cuerpo.caminar_abajo` — fila 1, cuadros 0–3.
2. `mago.cuerpo.caminar_arriba` — fila 3, cuadros 8–11.
3. `mago.cuerpo.ataque_abajo` — fila 4, cuadros 12–15.
4. `mago.cuerpo.ataque_perfil` — fila 5, cuadros 16–19.
5. `mago.cuerpo.ataque_arriba` — fila 6, cuadros 20–23.

Contrato del entregable: fuente/hoja `448×1008`, 4×9 celdas de `112×112`; RGBA con alfa exclusivamente 0/255; pies en fila 106; reposo 62–72 px; una silueta por pose; perfil hacia la derecha; receta y procedencia; atlas y preview; revisión visual humana a escala real. El destino histórico previsto es `art-source/entregas/2026-10_campeones-faltantes/campeones/mago/hoja_36poses.png`, pero el plan no registra versión reutilizable y no se encontró esa entrega en main. No asumir que el atlas actual satisface esos cinco ítems por existir.

## Habilidades ya resueltas o con arte existente

- B160 / Muro de Fuego: PR #222 está mergeado en main (merge commit `7e4e653e83b958bb63534ea90cfc77400bf93545`). Su alcance fue la composición continua de H1 y el lanzamiento compacto; no cierra B100 ni el kit corporal.
- El brief histórico describe arte runtime existente para Nova de Escarcha y Cataclismo Elemental. No regenerar sus fuentes sin defecto concreto.
- No duplicar el trabajo de formación H1 ni alterar daño, duración, radio, talentos o combate.

## Procedencia del brief y límite de recuperación

El brief `docs/art-brief/campeones/mago.md` se recuperó como texto de la rama histórica `claude/kit-de-magos`, commit `46084475bfbea7e311a8e3bd1d1c43ca64f8fc9b`. Esa rama está 362 commits detrás de main y **no debe fusionarse ni usarse como base**. El brief es referencia histórica de identidad/paleta, no sustituto de la referencia exacta del Códice ni fuente de mecánicas actualizadas. La ruta del brief no aparece en el árbol actual de main.

La inspección visual requerida sigue bloqueada: el conector GitHub disponible devuelve texto UTF-8, no bytes PNG; el intento de lectura binaria de los blobs falló. Los scratch paths indicados en el checkpoint anterior no existen en este entorno. Por eso no fue posible abrir lado a lado el PNG exacto del Códice y el atlas runtime, ni verificar píxeles, alfa, silueta, densidad, animación o escala real. No se generó ni instaló una nueva fuente en esta pasada. La hoja exploratoria de 12 poses del checkpoint anterior permanece RECHAZADA/GENERATED_NOT_APPROVED.

## Próximo paso seguro

Obtener ambos PNG exactos en un entorno con acceso binario al repositorio; comparar Códice, atlas y skin a tamaño nativo y escala gameplay; inspeccionar las cinco celdas B100 y decidir si se reparan celdas puntuales o se rehace el atlas conservando originales. Solo entonces producir fuentes originales con receta reproducible, pasar Art Bible/Style/Native/Roster gates, validar renderer y capturas antes/después en escritorio/móvil, y crear PR limpio desde main fresco. No tocar balance, mecánicas, cuentas, pagos, red ni infraestructura.


## Runtime consumer audit (main, exact current source)

- `js/assets/champion-sprites.js` loads `MAGO_IMG.src = "assets/sprites/champions/mago/atlas.png"`.
- `js/rendering/champion-sprites.js` defines `MAGO_ATLAS` at 1254×1254 with 16 source rectangles. The current clips are `idle=[0,1,2,3]`, `walk=[4,5,6,7]`, `cast=[8,9,10,11]`, `hurt=[12]`, `death=[12,13,14,15]`. `MAGO_ANIM_DEF` is adapted from this legacy table and `drawMagoAtlas` consumes it.
- `js/rendering/entities.js` calls `drawMagoAtlas` for the Mago. This is the confirmed current runtime consumer.
- The B100 36-pose/4×9 sheet has no verified consumer in main. It must not be treated as integrated or installed without a separately validated mapping/migration that preserves the current fallback and gameplay behavior.
- The Convergencia atlas file exists, and `skin_convergencia` has a fix entry, but `js/assets/champion-sprites.js` contains no `champPackLoadAtlas("mago", ...)` or `champPackCloneAtlas("mago", ...)` call. This pass therefore does **not** count Convergencia as a verified runtime body-skin integration.


## Visual source recovery — 2026-11-03 08:40 ART

La limitación binaria anterior era demasiado amplia: sí se pudieron recuperar WebP pequeños del brief. Se inspeccionó `00_actual_mago.webp`, una hoja de contacto derivada del atlas actual de 16 poses, y las cinco hojas de pose de B100. Las cinco hojas de pose son de Tibor y se usan solo para ritmo, dirección y línea de pies. No son diseños de Thalen ni la plantilla exacta del Códice.

Los blobs grandes exactos siguen bloqueados:
- Códice `assets/ui/codex/champions/mago.png` — `f07788b98aa635bf1587c73f6e0e243c38b3cf64`, 2,005,268 bytes.
- Atlas runtime `assets/sprites/champions/mago/atlas.png` — `055fe843d5a9fc06ec64cf63ac6bdce7a7484e31`, 1,248,766 bytes.

La lectura base64 devuelve contenido vacío para ambos; la lectura de blob binario falla al decodificar PNG como UTF-8. No se considera que el contacto WebP sea equivalente a esos originales.

Se generaron dos hojas exploratorias de 20 poses; ambas fallan el contrato de alfa 0/255 y quedan rechazadas. Métricas, hashes disponibles, prompts y decisiones están en `ART_RUN_05.md`. No se aplicaron filtros ni umbralado para ocultar el fallo, y no se instaló ni subió ninguna de esas fuentes.

La especificación técnica confirma el mapa B100 4×9 y que el runtime sigue en 16 recortes legacy. La skin Convergencia sigue sin carga corporal CHAMP_PACK verificada y se difiere hasta cerrar el cuerpo base.


## Runtime atlas WebP — recuperación parcial (2026-11-03 08:55 ART)

Se recuperó el WebP `assets/sprites/champions/mago/atlas.webp` (blob `fd199b7eca167b81e27f582013a1e3cde8acd620`, 974,926 bytes) y se inspeccionó visualmente. Confirma el Mago actual: sombrero violeta flexible con hebilla dorada, túnica/capa azul noche, bastón de madera curvado y botas marrones. El sheet sigue siendo el atlas legacy de 16 poses; no contiene las cinco filas B100 faltantes.

También se pudo ver el WebP de Convergencia (blob `cfa9ffcf0e6618ef476a6eca66e5c2ab9c8cbbfc`, 229,026 bytes). La existencia del archivo no certifica el registro ni la carga en runtime; se difiere hasta cerrar el cuerpo base.

Esto reduce el bloqueo de identidad visual, pero no resuelve la comparación exacta con `assets/ui/codex/champions/mago.png` ni permite ejecutar el Pintor en este entorno: el PNG del Códice sigue devolviendo contenido vacío y los WebP recuperados no están materializados como archivos locales. No se sustituye la fuente exacta por una captura reducida.
