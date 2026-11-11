# Intentos y verificaciones

## Intento 01 — fuente completa guiada por Códice

- Generó 40 celdas nominales y mantuvo una identidad reconocible de Thalen/Ángel Arcano.
- Falló la compuerta nativa: dimensiones irregulares, alfa parcial y contaminación roja/amarilla.
- Se preserva íntegro como fuente fallida reproducible; no se aplicaron filtros para simular aprobación.
- No se extrajo atlas ni se ejecutaron pruebas de runtime porque no existe candidato instalable aprobado.

## Verificaciones nuevas

- Auditoría de `main`, PR y ramas: no se observó trabajo concurrente de Convergencia.
- Hashes SHA-256 de las tres referencias, el atlas instalado y la fuente nueva.
- Diagnóstico de alfa y grilla en `SOURCE_DIAGNOSTIC.json`.
- Preview sobre damero para revisión visual real de transparencia.

## Pruebas históricas no repetidas

- Carga de `skin_convergencia` y sus VFX ya está cubierta por main.
- Pruebas del cuerpo canónico de Thalen no se repitieron: este bloque no modifica cuerpo ni runtime.

