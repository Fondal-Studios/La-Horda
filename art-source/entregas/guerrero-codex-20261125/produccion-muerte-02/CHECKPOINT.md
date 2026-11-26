# CHECKPOINT — Guerrero Códice, producción muerte 02

- Estado: `FIX_NOT_APPROVED / NO_INTEGRAR`.
- Base fresca: main `50589154cea02f255633aa1b88088b1c1f827332`.
- Taller: PR311, rama `art/guerrero-codex-directional-20261125`, padre remoto `e5232612069c323ec8e1b34abfd1dd54605c043e`.
- Referencia obligatoria: `assets/ui/codex/champions/guerrero.png`, registrada en `SOURCE_REFERENCES.json`.
- Fuente nueva: `death-directions-source-04.png`, SHA-256 `c1107b660b14c07d72f1505db7ad947a840718d2be18562539aafeae5b018acf`, 903725 bytes, RGBA 1448×1086, grilla exacta 4×3 de 362×362.
- Resultado visual: 12 poses coherentes, direccionales y fieles al Códice.
- Bloqueo técnico: 372682 píxeles con alfa parcial y sólo 745 opacos; no cumple alfa binario.
- Instalación: 0 assets, 0 atlas, 0 runtime, 0 frames aprobados.
- Pruebas nuevas: revisión visual fuente 04 y auditoría completa de alfa/celdas. Pruebas históricas no repetidas.
- Capturas gameplay: bloqueadas porque Chromium/Playwright no está disponible y la descarga del navegador respondió HTTP 403.
- Acción siguiente: corregir el alfa desde una fuente que lo produzca binario; después empaquetar, conectar al consumidor real y ejecutar desktop/móvil/multijugador/CI del SHA exacto.
- No mergear este taller mientras conserve FIX/NO_INTEGRAR.
