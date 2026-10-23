# Iconos propios del equipo

La prueba vigente encontraba281 objetos diseñados con solo266 imágenes distintas. Los cinco sets quality compartían insignias, vestiduras y botas; Maza de Presión, Sable de la Cicatriz y Hoz de Sal Dormida caían en la misma espada genérica. Los Guantes del Alquimista Loco también repetían otro objeto.

Se dibujaron19 grillas nativas de16×16 en `js/ui/quality-five-item-icons.js`, usando la paleta y el contorno PXI existentes. Copa, arco de mampostería, cicatriz, hongo y reloj fracturado distinguen las insignias. Delantal, placas, venda asimétrica, raíces y levita distinguen las vestiduras. Las tres armas ahora expresan su forma; los guantes llevan una ampolla. No se usan diferencias invisibles de hash ni cambios de estadísticas. No son skins nuevas.

`node tools/factory/export-authored-item-icons.js --write` exporta los19 PNG y el preview desde el motor real. Sin `--write` verifica fuente, recibo, píxeles RGBA guardados, UI64×64, botín32×32, paleta, alfa, identidad estable y conservación de los262 iconos ajenos. Compara píxeles decodificados; la compresión PNG no cuenta como diferencia visual.

Resultado:281/281 imágenes distintas,137 comprobaciones PASS. `t_itemization` pasó completo: cero fallos, incluida la identidad visual que antes fallaba. `check-pixel-icons` valida116 iconos y los106 mapeos de emojis. El canario de fábrica admite recompresión y rechaza un píxel alterado sin reescribir archivos.

Revisión visual asistida sobre `preview.png`: siluetas legibles, relación clara con los nombres, contorno duro y la misma imagen en tienda y botín. La primera versión de la corona del reloj llegaba al borde del marco; se corrigió el margen y se repitieron las comparaciones. No se atribuye aprobación al owner. Es evidencia de este componente, no de todos los assets pendientes ni del despliegue público.
