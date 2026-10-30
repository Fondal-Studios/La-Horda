# CHECKPOINT — Axiom Códice cierre 01

Estado: **VALIDADO_LOCAL / PENDIENTE_CI**. Componente: cuerpo completo de Axiom y sus dos apariencias runtime (`Sistema` y `Código Ámbar`), 36 cuadros por apariencia, instalados en rutas nuevas `codex-v1`; los atlas anteriores se conservan sin reemplazo destructivo.

Referencia obligatoria exacta: `assets/ui/codex/champions/axiom.png`, SHA-256 `1e68edc3414be5dcc3be771778aabf737345c0479666d3315e80e74e522f887b`. Sistema y Código Ámbar conservan la geometría del cuerpo del Códice y toman únicamente material/paleta de sus atlas runtime anteriores.

Validación nueva: 40 capturas del renderer real en seis arenas, tres apariencias y dos viewports; 63 celdas de estado (idle, walk, attack, cast, ultimate, hit, death; frente, lado y espalda); skin audit focal 3/3; contrato de serialización/red y saneamiento de cosméticos; `node --check`; revisión visual de hojas y antes/después. Base, Sistema y Ámbar pasan Art Gate del componente.

Límite explícito: el gate global reconstruido mostró 11 fallos ajenos en Musashi, Cazadora, Nigromante y Veyra por desfasaje de assets compartidos; Axiom tuvo cero fallos. No se realizó relay de dos clientes: el contrato de carga/red pasó y los archivos de red permanecen byte-idénticos. No hay afirmación de publicación canónica hasta consultar bytes después del merge.

PR239 (12 poses FIX_NOT_APPROVED), PR194 (habilidades) y PR231 (NanoGM) se preservan. Ningún archivo de balance, combate, cuentas, cobros o infraestructura cambia. Próximo paso: PR aislado desde `main` fresco, CI del SHA exacto, merge normal con `expected_head_sha`, verificación de `main` y publicación separada.
