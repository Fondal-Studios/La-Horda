# Localización — lote t375 (EN / PT-BR)

## Qué se hizo
- Archivo nuevo: `tools/i18n/tr/t375.py` (único archivo creado). Regenerados `js/i18n/en.js` y `js/i18n/pt.js` con `python3 tools/i18n/build.py`.
- **130 entradas nuevas** por idioma (diccionario: 12.440 → 12.570). Otras 15 piezas de `ctlHint()` ya estaban en t06/t105/t350/t361 con la misma traducción y no se duplicaron.
- Ninguna clave previa cambió ni se perdió (comparado contra copia de los diccionarios anteriores).

## Cobertura
- Tutorial, Guía (niveles 1 y 9) y «¿Cómo se juega?»: frases completas ya armadas para 6 dispositivos reales: teclado clásico, clásico con teclas de habilidad reasignadas, MOBA, MOBA reasignado, mando Xbox y mando PlayStation.
- Piezas de PlayStation de `ctlHint()` solas y con «▶ » (así las muestra el Hechicero), más las «▶ » que faltaban de teclado/Xbox.
- Tienda, catálogo (texto solo y combinado con la frase de Brasas), pase (incluida la confirmación con la frase agregada y los dos textos de `BP_PREMIUM_HOLD`), panel «Lo próximo que desbloqueás», «Sin conexión…», «Elegí con 1 2 3 o con clic.», avisos de guardado (un solo nodo con `\n`, clave = mensaje entero), título `Guardado`, aviso de inventario lleno de la Horda.
- Tarjetas `💠 GUERRA DE CRISTALES` y `⚔ COLISEO` (ahora el nodo es el título entero; no estaban).

## Verificación (sin navegador)
- `build.py` sin errores; script Node con `I18N` falso: las 130 claves están en EN y PT, no vacías, 0 errores.
- Iguales al español a propósito: `{n} / {n} XP` (EN y PT) y `Equipar título` (PT).
- Simulación en Node ejecutando el código real de `ctlHint`, `alphaTrainingText`, `alphaTrainingTarget`, `alphaGuideText` y `howtoSteps` en los 6 dispositivos: todos los textos nuevos encuentran su clave.

## Textos que NO quedaron traducibles (hace falta cambio de código o patrón)
1. `js/systems/alpha-training.js:45-46` — «Practicás con {nombre}, tu guardián. …» y «Tu guardián no se puede usar…: practicamos con {nombre}…»; `:32` — «{tecla}: {nombre} golpea al enemigo cercano…». El nombre es `CLASSES[cls].name` (nombre completo, p. ej. «Thalen, el Tejedor Elemental»). Solo quedó cubierto Thalen (el mago, que es además el reemplazo fijo). Para el resto de los guardianes sale en español. Cambio mínimo: agregar tres patrones en `tools/i18n/tr/patterns.py`, por ejemplo `^Practicás con (.+), tu guardián\. (.+)\.$`, o armar la frase con `I18N.tf`.
2. `js/systems/endless.js:387` — «COFRE DE LA CICATRIZ: {objeto} (a Recompensas pendientes)». El nombre del objeto es variable. La clave vieja `COFRE DE LA CICATRIZ: {n}` (t115) tampoco coincide nunca, porque `{n}` solo reemplaza números. Cambio mínimo: dos patrones en `patterns.py`: `^COFRE DE LA CICATRIZ: (.+) \(a Recompensas pendientes\)$` y `^COFRE DE LA CICATRIZ: (.+)$`.
3. `js/ui/next-unlock.js:83` — nombre del guardián más barato (`CLASSES[id].name`) como premio: depende de que cada nombre completo ya esté en el diccionario; no lo verifiqué uno por uno.
4. Teclas reasignadas fuera de las de fábrica: «MANTENÉ {tecla}» y «▶ Mantené {tecla} junto a Elyra…» solo están para E (clásico), F (MOBA) y LT. Con otra tecla asignada a revivir quedan en español.

## Hallazgos de código (no son de traducción)
- `js/systems/alpha-training.js:37, 38, 55` y `js/ui/how-to-play.js:95`: con mando de PlayStation el texto sigue diciendo `LT` y `Start` (fijos en el código) en vez de `L2` y `Options`. Traduje lo que realmente aparece (LT/Start). Arreglo: usar `padGlyph("LT")` y `padGlyph("START")`; después hay que sumar esas variantes al diccionario.
- Ya estaba roto antes de este lote: los objetivos del tutorial se escriben como un solo nodo `"▶ " + objetivo` (`alpha-training.js:156`) y el diccionario tiene las claves sin «▶ », así que 14 objetivos viejos («▶ Movete por la arena», «▶ Lanzá tu definitiva», etc.) salen en español. También faltan 6 textos largos viejos del tutorial y la Guía (niveles 2, 4, 5, 6; pasos «goal» y «xp»). No los toqué porque no son textos nuevos; son unas 20 entradas.
- Las claves viejas con `{n}` en lugar de un nombre («Practicás con {n}, tu guardián…», «Mantené el botón Ataque de la derecha: {n} golpea…») tampoco coinciden nunca.

## Dudas de terminología
- «Tu guardián le pega solo al enemigo más cercano»: lo traduje como ataque automático («automatically hits» / «bate sozinho»). La frase táctil anterior estaba traducida como «hits only the nearest enemy». Conviene unificar.
- `Guardado` (título del diálogo): «Save data» / «Salvamento». En PT el diccionario mezcla «salvamento» y «save»; usé «salvamento», que es el mayoritario.
- «apariencias»: usé «looks» / «aparências» (el diccionario mezcla «looks» y «appearance»).
- «Marco Cicatriz V»: «Scar V frame» / «Moldura Cicatriz V», siguiendo «Scar frame» de t374.
- Títulos: comillas “ ” en EN y PT, como t374 («Título «Veterano»» → «Title “Veteran”»).
- «Sola pausa» (Panel táctico): «Playing solo it pauses» / «Sozinho pausa».
- Los números del panel usan formato es-AR (1.234) también en inglés; es el comportamiento que ya tenía el juego.
