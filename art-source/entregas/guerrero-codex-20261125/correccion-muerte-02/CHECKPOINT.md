# CHECKPOINT — Guerrero Códice, corrección muerte 02

- Estado: `FIX_NOT_APPROVED / NO_INTEGRAR`.
- Main fresco: `50589154cea02f255633aa1b88088b1c1f827332`.
- Padre de rama: `f44e4e59e1873751cee35e3fb6b6d77bf590d6a0`; sus tres workflows aplicables terminaron SUCCESS, sólo para preservación.
- Fuente 05: `death-directions-source-05.png`, SHA-256 `47367b09663df18c6fc1cd90d171e199001f0a701a7778e284849d1df1ba1a22`, 871878 bytes, 1448×1086 RGBA, grilla 4×3.
- Cambio de método: edición directa de source04 pidiendo alfa exclusivo 0/255; no extracción ni filtro posterior.
- Resultado: FAIL técnico. Source04 tenía 372682 píxeles parciales; source05 tiene 388945 (+16263). Source05 conserva 256 niveles de alfa.
- Arte instalado: 0. Runtime: 0. Cuadros aprobados: 0.
- No se repite este prompt/método. No se umbraliza ni se simula calidad.
- Bloqueo: hace falta una capacidad de generación/pixel-art que produzca alfa binario desde origen. Chromium/Playwright continúa sin estar disponible para capturas gameplay; el candidato tampoco alcanzó el gate previo para instalarlas.
- Próximo paso: conservar 04/05 y avanzar sólo cuando exista un método que garantice alfa binario; antes de ello volver a auditar main/PR para evitar concurrencia.
