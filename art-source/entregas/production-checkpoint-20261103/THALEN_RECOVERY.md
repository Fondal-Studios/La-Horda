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
