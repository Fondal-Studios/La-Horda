# Guardianes Códice — bloque 1

Base c0a025016e0315b93870f2f4c86abb846619d30e. Tres cuerpos base VALIDADO_LOCAL_PENDING_CI: Musashi, Sylva y Ilvar. 126 poses nuevas seleccionadas + cuatro cuadros UF previos Ilvar. Dos tablas JS cambian sólo tres registros cada una; seis PNG de runtime. No balance, mecánicas, red ni engine cambiados.

Auditoría visual: 43 campeones +104 enemigos; 16 críticos iniciales y131 pendientes de revisión integral. Ver AUDIT.md y VISUAL_CLASSIFICATION.json. No confundir revisión de contacto con aprobación integral. PR232 propietario intacta, PR231/233 talleres intactos. Cola71 preserva68 anteriores, incluidos67 exactos del último cierre Veyra.

Pruebas finales:429 muestras nativas/143 cuadros,141 apariencias roster,72 escenas reales36 pares de estado resumido exactos,112 comparaciones skins,9 casts cooperativos reales/6 registros. Contrato3/3 compatible. Fallos y fuentes previos conservados.

Siguiente: comprobar CI completo del SHA exacto, merge normal con expected_head_sha, verificar PR/main, consultar bytes canónicos y guardar cierre remoto posterior. No afirmar INTEGRADO_MAIN antes del merge.
