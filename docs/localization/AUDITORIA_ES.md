# Auditoría del español actual

**Estado:** §2 (fichas de arena) APLICADO con etiquetas "Peligros / Ayudas" (aprobado por el dueño). §1 (tuteo) pendiente de confirmar. Códice (`codex.js`) sigue leyendo `kill`/`help` como texto; pasa a listas al final de la oleada, cuando se libere ese archivo.

Estado: **pendiente de aprobación del dueño**. Regla del proyecto: el español de hoy no se cambia sin preguntar.
Decisión del dueño: el juego usa **voseo** también para el Hechicero (no se pasa a "usted" en esta primera versión).

## 1. Tuteo suelto (1 caso)
- `js/modes/crystal-wars/roster.js`: "Mientras **tienes** escudo te mueves un 8% más lento." → "Mientras **tenés** escudo te movés un 8% más lento." (aparece en 7 campeones)

## 2. Fichas de arena: textos largos y poco naturales
Hoy (`js/data/arena-brief.js`, `index.html` líneas 581-583): tres frases largas con las etiquetas
"Objetivo", "Lo que te mata", "Lo que te ayuda". Se propone resumir en **Objetivo / Contras / Pros**:
objetivo en una línea y 2-3 ítems cortos por lista. Solo se reordena y acorta lo que ya dicen; no se agrega ninguna mecánica nueva.

Etiquetas elegidas por el dueño: `🎯 Objetivo` · `☠ Peligros` · `✚ Ayudas`. Excepción a la tabla: en Minas el objetivo conserva "Recién ahí termina la arena" (dato de juego).

| Arena | Objetivo | Contras | Pros |
|---|---|---|---|
| Ciudad | Aguantá 10 niveles y derrotá a El Presentador. | Si caen las estructuras críticas, perdés · La horda las derriba · Subjefes en el nivel 9 | Rescatá civiles (mantené RESCATAR) y llevalos al refugio: dan oro y XP |
| Fábrica | Cruzá la Fábrica Sin Fin y derrotá al Caballero de la Armadura Oxidada. | Trampas de vapor, rejillas, prensas y cadenas · Puentes móviles · Dragón de la Forja y Caballero | Las marcas del piso avisan cada trampa · Contraatacá al Caballero cuando brilla azul |
| Bosque | Aguantá 10 niveles, vencé al Guardián de la Niebla y recuperá el primer cristal. | Enemigos que se regeneran · Emboscadas en la maleza · El Guardián se transforma en la Bestia del Bosque | Quedate junto a una runa que brilla y mantené la acción: las raíces atrapan a la horda |
| Micelial | Frená la colonia y derrotá a la Madre Espora. | Esporas y zonas infectadas que te debilitan · Micelio Primigenio y Madre Espora | Rompé los núcleos: cada uno limpia la infección de su zona |
| Hielo | Derrotá al Mago Gélido en sus dos formas y recuperá el segundo cristal. | El frío sube si te quedás quieto · Novas de hielo · Forma demoníaca del Mago | Los braseros encendidos bajan el frío (prendé uno apagado con fuego) · Moverte también ayuda |
| Acuática | Llegá al nivel 10 y vencé al Leviatán. | Charcos que brillan antes de descargar · Kraken Joven en el nivel 6 · El Leviatán ataca desde el borde | Las corrientes te mueven rápido o arrastran a la horda lejos |
| Laberinto | Activá los sellos, derrotá al Minotauro y recuperá el tercer cristal. | Muros que se cierran · Sismos · Guardián del Laberinto en el nivel 6 | Sellos I, II, III en orden: aturden a la horda y curan · Hacé chocar al Minotauro contra un muro |
| Abismo | Sobreviví en las ruinas, vencé al Carcelero del Vacío y enfrentá a El Que Mora Debajo. | Si caés del borde, quedás colgado hasta que un compañero te suba · El Jinete carga en línea · Cadenas del Carcelero | Una plataforma que tiembla está por caer: empujá a la horda al vacío · Usá la carga del Jinete en su contra |
| Minas | Derrotá a Cerbero y cruzá el Portal Infernal. | En la oscuridad recibís más daño y te emboscan · El Devoraluz apaga las lámparas · Titán de Piedra en el nivel 8 | Encendé las luces apagadas (mantené la acción) · Cerbero se expone a la luz y se enfurece a oscuras |
| Infernal | Llegá al corazón del Infierno. | Fisuras que sueltan horda sin parar · Fuego en el suelo · Algo te espera en el nivel 9 | Cerrá las fisuras (mantené la acción cerca): queman un poco, pero cortan la horda |

Lugares que cambian: `js/data/arena-brief.js` (datos: pasan de texto largo a listas), `js/ui/run-intro.js`,
`js/ui/tactical-panel.js`, `js/ui/codex/codex.js` (**en conflicto con otro trabajo: va al final**) y `index.html` (**tres etiquetas**; un único cambio mínimo).

## 3. Pendiente del dueño
- (resuelto) Etiquetas: Peligros / Ayudas.
- Otros ejemplos de texto poco natural: el dueño los irá indicando mientras juega.
- ¿Otros lugares con el mismo problema (textos de ítems, sets, bendiciones, tutorial)? Indicarlos o pedir que se auditen.
