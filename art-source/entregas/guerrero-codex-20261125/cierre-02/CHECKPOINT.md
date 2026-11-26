# CHECKPOINT — Guerrero direccional cierre 02

Estado del lanzamiento: **SOURCE_TECHNICAL_PASS_PENDING_RUNTIME**. Estado del conjunto/PR: **FIX_NOT_APPROVED / NO_INTEGRAR**.

- Base y rama recuperadas del cierre remoto `886ab49110b96534a79a223f715e61e206c828bc`; `main` observado: `50589154cea02f255633aa1b88088b1c1f827332`.
- Referencia exacta: `assets/ui/codex/champions/guerrero.png`.
- Candidato: `cast-candidate.png`, 4×3 celdas de 144 px, 12/12 no vacías y alfa binaria.
- Fila frontal: cuadros 24–27 del atlas aprobado. Lado: cuadros 16–19. Espalda: cuadros 20–23.
- Transformaciones: sólo recorte y reordenamiento exacto; sin escala, filtro, paleta, espejo ni redibujo.
- Instalado: 0 assets. Runtime: 0 cambios. La caída permanece FIX en producción 01.
- `preview.png` es contacto diagnóstico, explícitamente no captura de renderer.
- Bloqueo: Chromium local incompleto; faltan consumidor real, antes/después a escala gameplay, seis arenas, apariencias, escritorio/móvil, relay y CI del SHA funcional.

Siguiente acción: cuando haya browser funcional, conectar este paquete únicamente al cuerpo base y validar su selección por dirección/timer sin cambiar mecánicas. Si la composición real no supera Art Gate, retirar el consumidor y conservar el candidato como fuente.
