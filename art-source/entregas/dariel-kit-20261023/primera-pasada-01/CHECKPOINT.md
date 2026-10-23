# Dáriel — primera pasada del kit normal, 23/10/2026

Estado: GENERADO / EN_CORRECCION / NO_INTEGRAR. No VALIDADO integral, no INTEGRADO_MAIN, publicación no verificada.

Base main817610a78595e894995cec8032dd64149dbfe925. Rama art/dariel-kit-first-pass-20261023. Recuperación a5cffabc9d8830f876d9762c48369d528e8f1c08; cierre previo Cazadora completo antes de abrir este bloque.

B129/A-FX-dariel-h1, B130/A-FX-dariel-h2, B131/A-FX-dariel-h3: cinco atlas nativos/60 fases (57 no vacías, tres cierres transparentes intencionales), generados por receta SfaStrip y enlazados en renderer sólo taller. Ondas angulares de diapasón, marcha con compases y barras laterales, estribillo con signos de repetición hacia dentro y notas ascendentes. No cambiar mecánicas para resolver dibujo.

Cuerpo, tres skins, básico y UF pentagrama/ex_concert existentes preservados; no cerrar B015/B411/B436/B245/B484. 14 referencias originales verificadas. 484 JS fuera tools/art-source comparados: sólo engine/bind/c-dariel SFA cambian. Extensiones opcionales bake/extras coinciden con Brasa; ningún otro arte FIX importado.

29 controles de atlas/cache/fallback, 254 funcionales de Expedición y 6 relay real PASS. Host Solciju/invitado Dáriel táctil set equipado dariel_set: cone14/32, marcha nova30/42 y aura228/340, estribillo nova28/40 y aura176/272 dibujos. Variantes exactas base/~h/~p coinciden. No certifica todo ciclo de vida/receptores.

360 frames main/candidato: 27927/27927 RNG y estado RESUMIDO idéntico; no snapshot completo ni aislamiento global. Ocho sceneHash previos idénticos; seis PNG UF idénticos; cinco atlas reexportados exactos. Preview diagnóstico21 imágenes/5canvases, resultado en PREVIEW_TEST.json; no timing del juego. Capturas nativas390x844 y844x390, hojas recortadas a1/2 escala rotuladas, tiempos80/256/512/1104/2000ms. Intento parity sin filtro abortado explícitamente y log preservado, no PASS de otros campeones.

FIX agrupados, con IDs/fuentes/hashes en CORRECTION_BATCH.json (34 entradas, preserva31): B129 frentes parecen chevrones/flechas y trazos finos ante rayos; B130 barras pequeñas entre cuerpos/anillos, SFA aura heredada1600ms frente marcha2400ms y filtro shield/radio fijo; B131 estribillo tenue, selección heredada posterior a curar puede omitir aliados recién completos y radio fijo140. Diagnóstico de selección/duración por consumidores, no afirmar casos límite reproducidos online. Pendientes seis arenas/skins/equipo, contraste compuesto, lifecycle real, pool/performance y Art Gate integral.

Prioridad: continuar cobertura amplia. Siguiente candidato Eslabón B132/B133/B134: consultar main y PR frescos, inspeccionar consumidores/archivos y preservar cuerpo/básico/UF existentes. No repetir Dáriel ni corregir un cuadro mientras falten primeras pasadas. Recetas/comandos en recipe.json. Aislar sólo componentes aprobados y merge normal expected_head_sha tras CI exacto; taller completo NO_INTEGRAR.
