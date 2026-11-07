# Thalen Códice — producción 01

Estado: **EN_CORRECCION / FIX_NOT_APPROVED / NO_INTEGRAR**

Se produjo un candidato completo de cuerpo de 36 cuadros para Thalen (`mago`) a partir de la plantilla exacta del Códice. El atlas no está instalado ni conectado al consumidor real. Main, PR abiertos y la rama de checkpoint se volvieron a consultar antes de guardar: no apareció un taller concurrente de cuerpo Thalen.

## Alcance producido

- 3 fuentes originales: 8 caminatas, 12 ataques y 16 cuadros restantes.
- Atlas candidato 448×1008, 4 columnas × 9 filas, celdas 112×112.
- 36/36 cuadros no vacíos; alfa binaria 0/255; cero píxeles alfa en el borde externo.
- Empaquetador reproducible con extracción cromática y escalado nearest-neighbor.
- Preview y reporte técnico con índice cuadro/estado/fuente.

## Referencia obligatoria

- Plantilla exacta: `assets/ui/codex/champions/mago.png` en main, Git blob `f07788b98aa635bf1587c73f6e0e243c38b3cf64`.
- URL consultada: `https://raw.githubusercontent.com/Fondal-Studios/La-Horda/main/assets/ui/codex/champions/mago.png`.
- Brief: `docs/art-brief/campeones/mago.md`, SHA-256 `5114b6...` (archivo exacto conservado durante la auditoría).
- Atlas runtime vigente: `assets/sprites/champions/mago/atlas.webp`, SHA-256 `4b0eb67e46e589b897fb3b1bb7add4636b9dfbc5b89ddfc5694e6effbd6973da`.

## Bloqueos de integración

- La fila `attack_side` todavía lee como tres cuartos/frontal y debe corregirse a perfil estricto.
- La extracción cromática pasa el gate técnico, pero requiere revisión final de bordes y continuidad después de corregir la fuente lateral.
- El consumidor vigente usa el atlas legado de 16 poses; este candidato de 36 cuadros no tiene enganche, fallback ni contrato de estados aprobado.
- Faltan capturas antes/después a escala real, escritorio/móvil, skins, animación completa, multijugador, rendimiento, Art Gate y CI del SHA exacto.

No se reemplazó ningún original, no se cambió runtime y no se atribuye integración a estas fuentes.

## Próxima acción

Corregir en una sola tanda la dirección lateral y la continuidad de ataque/caminata; reexportar el atlas sin cambiar el resto de las fuentes aprobables. Luego implementar el consumidor local con fallback legado y ejecutar capturas/gates completos antes de separar cualquier componente integrable.
