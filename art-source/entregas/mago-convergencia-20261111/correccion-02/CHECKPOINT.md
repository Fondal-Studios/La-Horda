# Mago / Convergencia — corrección 02

Fecha: 2026-11-12 UTC  
Base fresca auditada: `main` `a27c48b74344a090047deeaa77f2363243ef1d8c`  
PR: #291  
Parent remoto esperado: `00fc08dc5c4ad1f77a87afd37509a94b33212fb1`  
Estado: **EN_CORRECCION / FIX_NOT_APPROVED / NO_INTEGRAR**

## Auditoría fresca

Se releyeron `AGENTS.md`, `docs/ART_BIBLE.md`, `docs/production/PAINTER.md`, `docs/production/ASSET_BLOCKS.md`, control, plan y la corrección 01 completa. PR291 sigue siendo el único taller abierto de Convergencia; no se abrió un duplicado. El asset instalado y runtime permanecen intactos.

## Intento 03

Generación aislada de ocho fases frontales con transparencia solicitada, usando exactamente:

- `assets/ui/codex/champions/mago.png`;
- `assets/sprites/champions/mago/codex-v1/atlas.png`;
- `art-source/skins_sets/mago_angel_arcano.png`.

Resultado `source-front-row-03.png`: identidad reconocible y ocho poses distintas, pero la fuente falla antes de extracción:

- 448.678 píxeles con alfa parcial y sólo 262 opacos;
- 10.490 rojos y 13.053 amarillos sospechosos;
- las ocho regiones conceptuales contactan límites laterales;
- variación de escala/encuadre y séptima fase comprimida.

Decisión: **REJECT**. No se aplicó umbral, cuantización, filtro ni recorte destructivo. No se creó atlas candidato, consumidor ni claims de gameplay.

## Comparación

El intento 03 empeora la corrección 01 (`source-front-row-02.png`), que ya fallaba con 413.590 píxeles de alfa parcial pero sólo 155 rojos y 163 amarillos. `PREVIEW.png` conserva ambas fuentes sobre damero.

## Bloqueo y próximo paso

La capacidad disponible no produce alfa nativa binaria ni gutters seguros para esta fuente. Convergencia queda bloqueada por fuente, no por autorización. Preservar los tres intentos y no repetir el mismo prompt. Avanzar componente independiente mientras se mantenga este límite; antes de integrar Convergencia aún faltan cinco filas coherentes, atlas completo, consumidor, capturas de gameplay, apariencias, seis arenas, móvil/escritorio, multijugador, rendimiento, Art Gate y CI exacto.
