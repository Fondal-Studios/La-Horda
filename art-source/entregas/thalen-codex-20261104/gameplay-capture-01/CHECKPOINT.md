# Thalen Códice — captura gameplay 01

Estado: **EN_CORRECCION / NO_INTEGRAR**.

Base remota auditada: `0863712ee0b0da752ac37ebcd16774ac5812aae0` sobre main `54aa936fa254112044e29493179893dd0f8694d6`. PR268 permanece borrador.

## Avance de esta pasada

- Se agregó un arnés de captura que usa el `render()` real, no el canvas aislado del atlas.
- La selección de estado se induce con campos reales del héroe: dirección, movimiento, `attackAnim`, ventana de cast, definitiva y muerte.
- El mismo escenario fuerza el atlas legado y restaura el candidato Códice para obtener antes/después.
- Matriz prevista en CI: seis arenas, cuerpo base y Convergencia, escritorio y viewport móvil, candidato y fallback; 48 muestras.
- Hojas previstas: secuencia temporal, seis arenas y comparación legacy/candidato para ambos viewports.

## Referencia exacta

- Códice: `assets/ui/codex/champions/mago.png`, blob `f07788b98aa635bf1587c73f6e0e243c38b3cf64`.
- Atlas candidato: `assets/sprites/champions/mago/codex-v1/atlas.png`, SHA-256 `1be3454246d9526b93bf9e218318915086311789ca204b0ffda3f7eaf8af01aa`.

## Pruebas nuevas

- `node --check tools/art/thalen-gameplay-capture.js`: PASS local.
- SHA-256 del arnés: `ba60361c1fe3cf2db5f3f815b5dbfbea172900254777df944adfda9e28adfa88`.
- Capturas y revisión visual: PENDIENTES del CI del head exacto; no se anticipa aprobación.

## Límites

El viewport móvil del navegador no equivale a dispositivo físico. La escena densa no equivale a relay de dos clientes. No se modifica runtime, arte, balance, mecánicas, red ni infraestructura. El componente no se integra hasta revisar imágenes, Art Gate y gates restantes.
