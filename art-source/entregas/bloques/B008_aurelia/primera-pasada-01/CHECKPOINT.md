# Aurelia — primera pasada gruesa del kit

22/10/2026. Rama `art/aurelia-kit-first-pass-20261022`. Base observada `80683b03de58286398ef47de828c39196542c14d`. Recuperar el commit/PR que contiene este archivo; no asumir archivos locales persistentes.

## Alcance real

Tres fuentes image_gen originales, cinco atlas diagnósticos y tres previews;90 posiciones solicitadas,87 con contenido,3 huecos en Catedral. Incluye básico B429(12), Prisma B108(18), Refracción B109(12), Paso Luminal B110(18) y Catedral B008(30 posiciones/27 con contenido). Son fotogramas candidatos, no90 assets finales aprobados ni cierre de cinco bloques.

Cuerpo, dos skins e iconos ya existen y se preservan. El renderer procedural actual YA tiene catedral propia en `ult-forms/forms-2a-1.js`; el brief que describe solo nova está desactualizado. Esta tanda crea fuentes raster para el kit, no repara una habilidad inexistente. No hay cambios en assets/ ni js/ ni gameplay.

## Reproducir

`python art-source/entregas/bloques/B008_aurelia/primera-pasada-01/build.py`

Verifica hashes; extrae grilla6×5 de celdas229px; exporta celdas diagnósticas232px por NEAREST con alfa0/255. Conserva fuentes originales con su alfa. No pinta, limpia halos ni recorta siluetas adaptativamente. Reejecutar debe conservar RGBA idéntico. `recipe.json` declara fases y tamaños finales propuestos; los atlas diagnósticos NO están listos para runtime.

## Clasificación de primera pasada

- Básico/Refracción/Paso: GENERADO; sin celdas vacías ni contacto con borde, aprobación visual/render pendiente. Separar rayo principal de refracción dependiente de nodos y las capas trayectoria/llegada/halo antes de integrar.
- Prisma: EN_CORRECCION, bordes detectados en celdas indicadas por technical.json; revisar bases y continuidad.
- Catedral: EN_CORRECCION: huecos23/24/29, bordes17–20, tercera conexión entre pilares y secuencia loop/disipación por corregir.
- Todos: sin integración en main ni publicación verificada. El relleno rojo/amarillo semitransparente de las fuentes no se instala; previews con alfa binaria permiten revisar contornos, conservando la fuente sin sobrescribir.

## Continuar con velocidad

Por instrucción de Nano, no detener primera pasada para perfeccionar cada cuadro. Los defectos están agrupados en `docs/production/CORRECTION_BATCH.json` junto a Myla PR192 y Aelith PR191, con IDs originales. Próximo campeón: Axiom B009, auditar faltantes reales y trabajo concurrente antes de generar. Volver después al lote de correcciones. Integrar solo componentes con gates completos y checks del SHA actual; guardar checkpoint antes de avanzar.
