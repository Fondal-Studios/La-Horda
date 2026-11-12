# CHECKPOINT — Libertador skins Códice, remediación CI 04

Fecha UTC: 2026-11-12
Estado: EN_CORRECCION / PENDING_CI / NO_INTEGRAR

## Alcance

- Referencia exacta: `assets/ui/codex/champions/libertador.png`.
- Componentes: `libertador_escarcha` y `libertador_ancestral`.
- 36 poses instaladas y consumidas por skin; cuerpo base, caballos y Granadero preservados.
- Parent remoto: `990a4498fb4534543485792c5a08026f44a5fff6`.
- Main auditado: `a27c48b74344a090047deeaa77f2363243ef1d8c`.

## Pruebas nuevas

- `node tools/art/build-art-atlas.js --check`: PASS tras actualizar la huella de 51 fuentes a `f40edcb34a337209336a1b7bb72e15a020bb67e7`.
- Auditoría de combinación de árboles contra main fresco: sin conflictos textuales.
- Consulta GitHub del parent exacto: cero workflow runs y cero statuses.
- Cierre/reapertura reversible del PR293: base actualizada a main fresco, pero cero runs/statuses.

## Evidencia histórica válida

- Locomoción/cuerpo especializado: 261 controles PASS.
- Catálogo, renderer, equipamiento y loadout: 6.638 controles PASS.
- Ocho pares antes/después: Bosque/Ruinas y Hielo/Gélida, escritorio/móvil, PASS.
- Head `fb9968f...`: QA central y diez workflows verdes; roster gate detectó cinco vistas corporales bajas.
- Head `a68447e...`: 14 workflows verdes; el registro de atlas bloqueó la huella vieja antes del roster gate.

## Corrección

Factores de normalización corregidos únicamente para las cinco vistas fallidas:

- Escarcha: front `1.0797`, side `1.1051`, up `1.1229`.
- Ancestral: front `0.9918`, side `1.0074`; up preservado `0.9672`.
- Anclajes de pies preservados en -2 px.
- Atlas, frames, mecánicas, red y demás apariencias intactos.

## Pendientes

1. Ejecutar roster gate y todos los workflows aplicables sobre el SHA exacto de este commit.
2. Reconciliar cualquier avance nuevo de main sin importar talleres FIX.
3. Sólo si CI exacto y Art Gate pasan: retirar FIX/NO_INTEGRAR, revisar diff y hacer merge normal secuencial con expected head SHA.
4. Verificar main posterior y publicación canónica por separado.

No hubo merge ni publicación. PR231 y talleres históricos se preservan.
