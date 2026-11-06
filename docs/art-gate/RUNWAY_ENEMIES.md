# Enemigos con hoja completa de Runway

Estado: **GENERATED_NOT_APPROVED** (revisión de arte humana pendiente; no pasaron todavía `pixel-density.js` ni el gate de estilo).

Flujo: `tools/art/runway/gen_sheet.py` (hoja 3×6 sobre croma verde, referencia de diseño actual + estilo) → `tools/art/runway/install.py` (croma, recorte por huecos,
escala común, pies alineados, paleta de 28-32 colores, contorno 1 px, atlas de 8 columnas) → registro en `js/assets/enemy-runway-sheets.js`
(`ENEMY_ATLAS_PACK`, manda sobre recortes sueltos y cuerpos prestados). Fuentes y recibos: `art-source/runway-enemies/<arena>/<tipo>/`.

Reglas aprendidas: Runway rechaza palabras de combate violento (sin cobrar) y a veces cobra moderación; refs chicas necesitan `--nostyle`; las hojas con texto
o filas faltantes se rechazan (`rejected_*`), no se esconden. Una hoja nunca se aprueba sola: mirarla en el motor (8 estados) antes de integrar.

Instalados: ver las claves de `ENEMY_RUNWAY_SHEETS`. Fuera de este lote (ya tienen atlas v2/v3 con varios estados): lobo ártico, golem de cristal, dragón, dragoncito y ángel
de hielo, Cù-Sìth, Dama del Bosque, enjambre de hadas, gólem infernal, gólem de piedra, y todos los jefes (tienen sets propios de habilidades que la IA pide).
