# CHECKPOINT — Guerrero Códice post-cierre 03

Estado del subcomponente lanzamiento direccional: **RECONCILIADO_CON_RUNTIME_EXISTENTE / SIN CAMBIO / NO MERGE**.

La auditoría reproducible de `main` `50589154cea02f255633aa1b88088b1c1f827332` demuestra que el candidato de 12 celdas de `cierre-02` duplicaría exactamente lo que ya consume el renderer. Frente usa el set explícito `cast_down` `[24,25,26,27]`; lado y espalda no tienen sets explícitos, y `drawChampPack` aplica su fallback vigente `cast -> attack -> idle`, resolviendo `[16,17,18,19]` y `[20,21,22,23]`. Los tres resultados coinciden con el candidato.

No se instala el PNG candidato, no se cambia metadato ni runtime y no se atribuye integración a la fuente. El cuerpo activo del Códice SHA-256 `03b1f0c853f2ef49cc42654b05c4eac6c2e5f8ed66678a113230bc9860a8d77d` permanece intacto. La apariencia Nocturno conserva su atlas autoral y su propio fallback.

Límite: esta reconciliación cierra únicamente la duplicación del lanzamiento; la muerte direccional sigue **FIX_NOT_APPROVED** y el kit de Guerrero no está completo. Las capturas nuevas siguen bloqueadas por ausencia de Chromium.
