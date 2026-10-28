# Resultados — 28 de octubre de 2026

Estado: **EN DESARROLLO. No terminado, no desplegado.** Objetivo de siete días: 4 de noviembre de 2026.

## Recuperación y auditoría

Base recuperada: rama `feature/fondal-art-engine`, PR #232, commit `e0b823bb0edf56a0037ca5610ac271fc7fab0b2c`. El PR tenía 14 archivos y 16 pruebas, sin generación funcional. Se recuperó el checkout completo y se leyeron canon, Art Bible, contratos e infraestructura de render/generación. No se afirma revisión manual línea por línea de los 11 mil archivos.

Auditoría automática de 491 archivos JS/CSS/HTML: 1.744 referencias literales a arte, ninguna ruta ausente; 30 expresiones dinámicas necesitan cotejo runtime. 3.252 imágenes bajo assets. El inventario histórico tenía 1.061 filas que el escáner original dejaba sin verificar; con campos y rutas reales: 141 PATH_EXISTS, 478 PATH_MISSING y 442 UNVERIFIED. No son 478 diseños confirmados faltantes ni 141 aprobaciones.

## Producción real ejecutada

| Medida | Resultado |
|---|---:|
| Atlas nativos regenerados | 14 |
| Fotogramas regenerados | 656 |
| Atlas con píxeles idénticos a los actuales | 14 |
| Candidatos con contacto con borde y bloqueados | 14 |
| Atlas adicional corregido técnicamente (Ángel, 36 cuadros) | 1 |
| Diseños completamente nuevos | 0 |
| Assets integrados al juego durante esta ejecución | 0 |
| Costos de API incurridos | USD 0 |

El overscan de 32 px del Ángel elimina todos los contactos detectados en sus 36 cuadros, sin pérdida de píxeles opacos anteriores. Cambian 71 píxeles dentro de las celdas antiguas al recuperar contorno/sombreado alrededor de los límites. Mantiene escala de mundo mediante refH/hMul y compensa el ancla. PNG, WebP, contacto y recibo se conservan en `runs/2026-10-28/angel-overscan/`. Pendiente visual a escala runtime y prueba del renderer; **no aprobado para producción**.

## Verificación local

- 26 pruebas Node del Art Engine: PASS (incluyen corrupción, cuadros vacíos, clipping, animación congelada, falta/duplicación de entregas, rutas, aprobación caducada, publicación PNG/WebP y rollback en fixture).
- 3 pruebas Python de overscan: PASS.
- 8 pruebas del contrato de animación existente: PASS.
- `check-entry-reference.js`: PASS; estadísticas de referencia sin cambios.
- Suites competitivas: PASS, 38 campeones y 10 pruebas de especialidades.
- Generación pixrig completa: ejecutada, 14 salidas reales; producción REJECTED por defectos de bordes, no se instalaron.
- ComfyUI: protocolo HTTP probado con fixture; **no generación de IA demostrada**.
- Chromium local: BLOQUEADO. El ejecutable no está instalado y las descargas devolvieron archivos inválidos. Se guardó el error; no se afirma PASS visual, funcional completo ni rendimiento.
- CI remoto, publicación y juego desplegado: pendientes de ejecutar/verificar en el commit final.

## Cobertura pendiente y horizonte de siete días

Prioridad: día 1 pipeline/gates y receta piloto; días 2–3 proveedor de IA o ampliación de recetas y cierre visual/runtime del piloto; días 4–5 lotes priorizados P0 con generación y revisión por familia; día 6 integración y regresiones de gameplay/carga; día 7 publicación gradual, verificación desplegada y reporte final. Es una secuencia de trabajo, no una promesa de completar todo el catálogo.

No es defendible prometer en siete días todos los campeones/skins, enemigos, invocaciones, jefes, cinco estados, VFX/proyectiles, mapas/props, UI/Códice/narrativa y futuras expansiones partiendo de 14 recetas. Faltan un proveedor/modelo real disponible para diseños nuevos, contratos por familia, reconciliación dinámica, gates de estilo/consistencia, pruebas de candidatos y automatización de integración. El adaptador local necesita ComfyUI y un modelo licenciado; no se contrató ningún proveedor ni se añadió gasto.

El trabajo puede continuar desde los comandos, hashes y candidatos de este PR. Un schedule en una rama no constituye servicio autónomo activo: GitHub lo activa únicamente tras integrar el workflow en la rama predeterminada. No se ha configurado un agente que programe por su cuenta durante siete días.
