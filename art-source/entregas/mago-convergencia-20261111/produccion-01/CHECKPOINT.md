# Mago / Convergencia — producción 01

Fecha: 2026-11-11 UTC  
Base auditada: `main` `1981677d4a8bcab8c8864500a0f1eb0bb3e12953`  
Rama: `art/mago-convergencia-codex-20261111`  
Estado: **GENERADO → EN_CORRECCION / FIX_NOT_APPROVED / NO_INTEGRAR**

## Auditoría fresca

- No hay PR abierto ni rama de arte concurrente para Mago/Convergencia.
- PR231 continúa como taller Nano FIX/NO_INTEGRAR y no se tocó.
- El cuerpo base de Thalen ya está integrado en `assets/sprites/champions/mago/codex-v1/atlas.png` y registrado como `mago` canónico.
- La skin Convergencia sí tiene consumidor real (`skin_convergencia` en `js/assets/set-skins-meta.js`), pero `docs/art/ATLAS_VIGENTE.json` la marca como atlas anterior al Códice: reposo de un cuadro y ataque de dos.
- Las arenas prioritarias y Axiom ya figuran integrados en main; este bloque no reabre ni reemplaza esos componentes.

## Referencias exactas

1. Plantilla obligatoria del Códice: `assets/ui/codex/champions/mago.png` — SHA-256 `bc186752d4daf640003f708454a40c0ff886678052efc587c7a4ba7efc2556a9`.
2. Atlas canónico vigente: `assets/sprites/champions/mago/codex-v1/atlas.png` — SHA-256 `ae7a03065cae36e2aada7edc0a5435b2ba6b520d6c2f2b2dc0089fc7978f7cb9`.
3. Diseño autoral de la skin: `art-source/skins_sets/mago_angel_arcano.png` — SHA-256 `cb86e778ece00798753f7efe5145e56f9fd9e2a2256ac4ec229775108131c60a`.
4. Atlas instalado preservado: `assets/sprites/champions/mago/skins/convergencia/atlas.png` — SHA-256 `36e7a027c17e678ed07f764a4b22105a0af31bcc6cba064618e88f145329c77c`.

## Producción nueva

- `source-generated-01.png`: fuente original de 40 celdas nominales, generada con las tres referencias anteriores.
- `PREVIEW.png`: revisión sobre damero; no es asset de runtime.
- `SOURCE_DIAGNOSTIC.json`: alfa, grilla y contaminación cromática medidos.
- No se creó atlas de runtime, no se cambió el consumidor y no se sustituyó el atlas instalado.

## Resultado visual

La fuente conserva bien la identidad de Thalen y recupera la silueta de Ángel Arcano: sombrero grande, rostro juvenil, capa alada blanca, azul marino, oro y báculo circular. No pasa el Art Gate:

- 1586×992 no divide exactamente una grilla 8×5;
- 861777 píxeles tienen alfa parcial y sólo 213 son opacos;
- hay 51601 píxeles rojos y 40985 amarillos saturados de contaminación de borde;
- direcciones, línea de pies y continuidad deben corregirse antes de extraer cuadros.

## Próximo paso

CIERRE agrupado sobre esta misma fuente: eliminar contaminación y alfa parcial mediante edición de fuente, regularizar la grilla y corregir continuidad/direcciones. Después extraer un atlas candidato sin tocar el instalado, revisar a escala de gameplay en escritorio/móvil y sólo entonces ejecutar las pruebas de consumidor, skins, arenas, multijugador y CI del SHA exacto.

