# Enemigos con hoja completa de Runway

Estado: **GENERATED_NOT_APPROVED** (revisión de arte humana pendiente; no pasaron todavía `pixel-density.js` ni el gate de estilo).

Flujo: `tools/art/runway/gen_sheet.py` (hoja 3×6 sobre croma verde, referencia de diseño actual + estilo) → `tools/art/runway/install.py` (croma, recorte por huecos,
escala común, pies alineados, paleta de 28-32 colores, contorno 1 px, atlas de 8 columnas) → registro en `js/assets/enemy-runway-sheets.js`
(`ENEMY_ATLAS_PACK`, manda sobre recortes sueltos y cuerpos prestados). Fuentes y recibos: `art-source/runway-enemies/<arena>/<tipo>/`.

Reglas aprendidas: Runway rechaza palabras de combate violento (sin cobrar) y a veces cobra moderación; refs chicas necesitan `--nostyle`; las hojas con texto
o filas faltantes se rechazan (`rejected_*`), no se esconden. Una hoja nunca se aprueba sola: mirarla en el motor (8 estados) antes de integrar.

Instalados: ver las claves de `ENEMY_RUNWAY_SHEETS`. Fuera de este lote (ya tienen atlas v2/v3 con varios estados): lobo ártico, golem de cristal, dragón, dragoncito y ángel
de hielo, Cù-Sìth, Dama del Bosque, enjambre de hadas, gólem infernal, gólem de piedra, y todos los jefes (tienen sets propios de habilidades que la IA pide).

## Fondos y retratos (pasada de unificación)
- Retratos de campo de batalla (14 jefes): `tools/art/battlefield_pixelize.py` (factor 2, paleta de 40-48 colores); originales en `art-source/battlefield/`.
- Portadas de arena del Códice (11) y texturas del Abismo (2): `tools/art/native_pixelize.py` a PNG de paleta corta; originales en `art-source/codex-covers/` y `art-source/abismo/`.
  Referencias JPG→PNG actualizadas en `js/`. Props `world-v1` (bosque/hielo) también por `native_pixelize.py`.
- Enemigos de Ciudad (acechante, perro, campanero) y Minas (devoraluz) con hoja Runway; los sets extra de la IA (`leap`, `bell`, `drain`…) se mapean a cuadros de ataque/caminata con `install.py --alias`.
- Pendiente de arte humano: las 11 tarjetas del Códice de Minas (llevan el título dibujado dentro de la imagen; un filtro lo deforma), Leviatán (3,5 u/px), Minotauro v3 (2,7), Dragón de la Forja.
