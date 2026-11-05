# Thalen Códice — cierre mínimo 01

Estado: **EN_VALIDACION / NO_INTEGRAR**.

## Alcance

- Cuerpo base de Thalen (`mago`) con 36 cuadros: caminata en tres direcciones, ataques en tres direcciones, lanzamiento, definitiva y caída.
- Fuente visual obligatoria: `assets/ui/codex/champions/mago.png`, blob Git `f07788b98aa635bf1587c73f6e0e243c38b3cf64`.
- Atlas candidato: `assets/sprites/champions/mago/codex-v1/atlas.png`, SHA-256 `1be3454246d9526b93bf9e218318915086311789ca204b0ffda3f7eaf8af01aa`.
- Consumidor real: pack independiente `mago_codex`; el atlas legado sigue como fallback durante carga o error.
- Apariencia Convergencia conserva prioridad y no queda reemplazada por el cuerpo base.

## Auditoría fresca

- Base: `main` `c66d6037c9eba34ec127a274a4eba37e6eaca764`.
- No apareció otro PR abierto con archivos de Thalen al iniciar este cierre.
- Se separó únicamente el componente Thalen del taller PR268; no se importaron assets FIX de otros campeones.
- PR231 Nano y sus fuentes no se modifican.

## Evidencia

- Reproducción local byte a byte: atlas, preview y `technical.json` estables en dos ejecuciones consecutivas.
- Contrato estático consumidor/fallback: PASS, 36/36 cuadros no vacíos, 21 mappings.
- Captura histórica sobre el mismo atlas/runtime: 96 escenas, 8 hojas, seis arenas, base/Convergencia, sparse/dense y escritorio/móvil; 0 errores de página. La revisión visual es `PASS_CAPTURE_SCOPE`.
- El nuevo gate de rendimiento usa `render()` completo y `clearRect` real en CI; no se ejecutó localmente porque el binario Chromium no está instalado.

## Pendiente para integrar

- CI completo del SHA exacto, incluido el nuevo gate de rendimiento.
- Resolver o aislar sin rebajar gates cualquier fallo heredado de lanes/servidor HTTP.
- Mantener el PR en borrador mientras falte un gate aplicable.
- No se verifica publicación canónica hasta que exista integración en `main`.
