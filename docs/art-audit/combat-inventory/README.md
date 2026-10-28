# Inventario de arte de combate — 28 de octubre de 2026

Base examinada: `63cd6a3377cd5c55bf099d65e3d61400469dea76`.

**Inventario abierto. No hay todavía un total global verificable de faltantes.**
Este registro cruza archivos, metadatos de la aplicación cargada y dibujo real en Chromium.
Visibilidad y ausencia de errores no equivalen a aprobación artística.

| Alcance registrado | Cantidad | Evidencia |
|---|---:|---|
| Archivos multimedia versionados en assets | 3254 | files.json: ruta, SHA-256, tamaño y referencias literales |
| Héroes | 43 | registries.json: CLASSES, habilidades y hoja canónica |
| Apariencias adicionales | 113 | 98 específicas + 15 manifestaciones universales |
| Apariencias muestreadas con el motor | 141 | 43 originales + 98 específicas; 7 estados × 4 direcciones × 4 tiempos |
| Packs atlas comprobados | 154 | atlas-checks.json: grilla, índices, alfa, bordes, duplicados y sets |
| Tipos de enemigo | 104 | 32 normales, 21 subélites, 23 élites, 14 subjefes y 14 jefes |
| Enemigos muestreados con el motor | 104 | enemies/coverage.json y seis hojas de contacto |
| Formas procedurales registradas | 48 | UF.forms; no equivalen todas a transformaciones de cuerpo |
| Efectos del registro VFX_SPR_EXTRA | 315 | Incluye referencias reutilizadas; no es total de efectos únicos |
| Íconos de píxel por código | 116 | PXI_ART; arte procedural intencional, Biblia §15 |

## Qué se verificó

- Carga de aplicación y apariencias: cero errores de página y cero respuestas HTTP fallidas locales.
- 15 792 muestras de héroes/skins: cero errores de dibujo y cero muestras vacías.
- Todos los tipos de ENEMY_BASE: reposo, direcciones, ataque, daño, muerte y muestreo de caminata. El informe distingue espejos, clones y cuerpos procedurales.
- Las ausencias intencionales de cuerpo en el render individual (por ejemplo Madre Espora dibujada por la arena) se mantienen como excepciones identificadas, no como sprites faltantes.
- Los seis patrones con `*` en boss-blueprints son referencias documentales a grupos, no seis archivos rotos. Las expresiones dinámicas y rutas generadas requieren resolución adicional.

## Alcance pendiente antes de cerrar el inventario

1. Resolver expresiones dinámicas y exhaustividad de ramas por modo, incluida la entrada separada crystal-wars.html.
2. Las 15 manifestaciones universales combinadas con cada héroe.
3. Invocaciones, transformaciones, proyectiles, props y UI: hay archivos, registros y 80 superficies de código localizadas en supplemental-surfaces.json; falta cerrar correspondencia entidad/estado/uso y probar sus ramas.
4. Revisar visualmente cada animación contra su hoja de códice y la gramática del Caballero. Los defectos artísticos no se infieren de nombres, cantidad de PNG o detección de alfa.
5. Cobertura multiplayer y formas especiales, skins dentro de cada habilidad, pivotes y continuidad de todos los cuadros.

`summary.json` conserva `scopeComplete:false`, `globalMissingAssets:null` y `globalMissingFrames:null` hasta completar esos puntos. No se sustituye este desconocido por cero.

## Nano GM: primera entidad de producción

El atlas anterior contiene 36 celdas distintas referenciadas, alfa binaria y grilla válida. Esto **no** significa que cumpla la nueva identidad/calidad.

Defectos verificados en metadatos/código:

- Izquierda derivada por espejo: invierte las alas anatómicas.
- Reposo y daño reutilizan una única pose por dirección; daño toma la del ataque.
- Cast, definitiva y muerte reutilizan la misma secuencia frontal en otras orientaciones.
- Alas procedurales adicionales en ascension/render.js superpuestas al cuerpo con alas.
- Las siete hojas nuevas guardadas en art-source/sprite-rework/nano_gm son fuentes pendientes: 112 celdas nominales, **cero cuadros nuevos aprobados o integrados** al iniciar esta entrega. Grilla irregular, bordes recortados y densidad de detalle requieren revisión/redibujo.

Objetivo de producción: 7 animaciones × 4 direcciones propias, sin espejo anatómico. Se contabilizan clips completos aprobados; no se inventa un número de cuadros faltantes para todo el juego. Antes de esta entrega: **28 clips del rework pendientes**. Las habilidades conservan su lógica.

## Reproducción

```bash
CHROMIUM_PATH=/ruta/chromium node tools/art/combat-inventory.js
CHROMIUM_PATH=/ruta/chromium node tools/art/enemy_coverage.js docs/art-audit/combat-inventory/enemies
python3 tools/art/summarize-combat-inventory.py
```

Los scripts usan servidor propio del repositorio. `hero-runtime.json` contiene muestras de cobertura, no el conteo de cuadros únicos. `atlas-checks.json` deduplica poses exactas recortando padding, ignora RGB invisible y no cuenta espejos como arte nuevo.
