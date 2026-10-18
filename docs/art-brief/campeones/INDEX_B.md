# INDEX_B — resumen de briefs de habilidades, segunda mitad del roster (`myla` … `zahra`)

> Cada campeón tiene su ficha en `docs/art-brief/campeones/<clave>.md`. Este índice resume forma, color dominante, frames y tamaño, y lista las **colisiones de silueta y de color** que el dibujante debe evitar. Formato técnico: `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (no se duplica). Todo número mecánico sale del código y está citado archivo:línea en cada ficha.

## Alcance (verificado)

- Claves del roster actual (`CLASSES`, 43): ordenadas alfabéticamente, la segunda mitad empieza en `myla`; `musashi` (posición 22) e `ilkan` los cubre el agente de la mitad A y **no** se duplican. Lista y cuenta coinciden con `docs/vfx/vfx-audit-b.md`.
- **21 campeones** × (ataque básico + habilidades 1, 2, 3 + definitiva) = **105 habilidades**, más **11 pasivas** con elemento visible (116 fichas en total). Las pasivas sin efecto visible no llevan ficha: figuran como nota en la sección Identidad de cada brief.
- Campeones: `myla`, `nahir`, `nano_gm`, `nigromante`, `oriel`, `orsa`, `profeta`, `renko`, `saelis`, `segador`, `sira`, `solciju`, `soporte`, `tanque`, `tibor`, `velmira`, `vesper`, `veyra`, `vhal`, `ynara`, `zahra`.
- Nombres visibles: `tanque` = Aldric, `soporte` = Elyra, `profeta` = Ismara, `nigromante` = Ilvar (`docs/bible/generated/CHAMPION_REFERENCE.md`).

## Cómo leer los tamaños

- Se muestran en **px nativos** a la escala supuesta en cada brief (suelo y efectos de más de 160 u de lado 2,0 u/px; proyectiles, auras y cuerpo hasta 160 u: 1,0 u/px; ART_BIBLE §14) y entre paréntesis las **unidades de mundo reales** del código (a nivel base, antes de maestría y talentos). Si `00_ESPECIFICACION_TECNICA.md` fija otra escala, convertir con `px = u ÷ escala`.
- "Frames" = anticipación/impacto/disipación y, tras el `+`, el bucle (si lo hay).
- Color dominante = el primer color (que no sea blanco puro) del campo "Color dominante" de la ficha. La definición completa (cada habilidad con su paleta de 4–6 colores) está en la ficha.

## Tabla resumen (campeón × habilidad)

| Campeón | Hab. | Nombre en el juego | Forma | Color dom. | Frames a/i/d | Tamaño principal |
|---|---|---|---|---|---|---|
| Myla | Básico | Disparo de cuchara | proyectil cuchara | `#fff1e1` | 1/5/3 +4 | 16×16 px (16×16 u) |
| Myla | H1 | Torre de Yogur | torre 3 pisos | `#e99abb` | 6/3/5 +4 | 56×80 px (56×80 u) |
| Myla | H2 | Yogurazo | charco 95 u | `#e99abb` | 2/5/4 +8 | 95×95 px (190×190 u) |
| Myla | H3 | Burbuja Cremosa | esfera yogur | `#fff1e1` | 3/2/4 +6 | 68×68 px (68×68 u) |
| Myla | Ult | BERRINCHE | ondas de llanto 180 u | `#e99abb` | 4/6/4 +8 | 180×180 px (360×360 u) |
| Myla | Pasiva | Yogur Pegajoso | gota pegajosa | `#e99abb` | 0/1/3 | 12×12 px (12×12 u) |
| Nahir | Básico | Ataque básico (hojas de espejo) | tajo doble espejo | `#68c6c2` | 1/3/3 | 40×28 px (40×28 u) |
| Nahir | H1 | Astillas errantes | abanico de vidrio 97° | `#68c6c2` | 2/4/4 | 120×180 px (240×360,6 u) |
| Nahir | H2 | Reflejo fugitivo | espejo oval de pie | `#8a9ba0` | 1/4/5 +6 | 50×64 px (50×64 u) |
| Nahir | H3 | Corte cruzado | línea + ecos cruzados | `#68c6c2` | 2/3/4 | 120×24 px (240×48 u) |
| Nahir | Ult | Galería de nadie | triángulo de 3 espejos 200 u | `#68c6c2` | 4/5/5 +8 | 100×100 px (200×200 u) |
| Nano GM | Básico | Ataque básico (media luna) | media luna bicolor | `#fff4d6` | 1/3/3 +4 | 20×20 px (20×20 u) |
| Nano GM | H1 | Sentencia Umbría | línea negra 330 u | `#15122a` | 2/4/4 | 165×30 px (330×60 u) |
| Nano GM | H2 | Edicto de Luz | círculo de runas 135 u | `#e8c56a` | 3/3/4 +8 | 135×135 px (270×270 u) |
| Nano GM | H3 | Inversión | salto bicolor + runa | `#fff4d6` | 2/4/4 | 110×110 px (220×220 u) |
| Nano GM | Ult | Juicio del GM | arena partida 880 u | `#fff4d6` | 6/6/6 +8 | 440×440 px (880×880 u) |
| Nano GM | Pasiva | Autoridad del GM — Forma del Regente | alas luz/sombra | `#fff4d6` | 3/2/3 +6 | 84×64 px (84×64 u) |
| Ilvar | Básico | Proyectil de Hueso (y Garras del Abismo) | cráneo-alma verde | `#8ef0c8` | 1/3/3 +4 | 18×18 px (18×18 u) |
| Ilvar | H1 | Cosecha de Almas | cono de almas 210 u | `#4ab88a` | 2/4/4 | 105×182 px (210×364,3 u) |
| Ilvar | H2 | Gólem de Carne | gólem + onda 110 u | `#2a7a5a` | 5/5/5 | 120×120 px (120×120 u) |
| Ilvar | H3 | Plaga de los Condenados | niebla verde 150 u | `#50e68c` | 3/3/6 +8 | 150×150 px (300×300 u) |
| Ilvar | Ult | Encarnación del Abismo | transformación demonio | `#50e68c` | 6/8/6 +8 | 90×90 px (180×180 u) |
| Ilvar | Pasiva | Necromancia (almas y esqueletos) | alma→esqueleto | `#8ef0c8` | 2/3/0 | 10×10 px (10×10 u) |
| Oriel | Básico | Ataque básico (llave) | llave rosa | `#ffd0dc` | 1/3/3 +4 | 18×18 px (18×18 u) |
| Oriel | H1 | Abrir Cicatriz | dos aros ⌀76 u | `#e05a7a` | 3/5/5 +8 | 38×38 px (76×76 u) |
| Oriel | H2 | Eco de la Cicatriz | 8 fisuras radiales 120 u | `#ffd0dc` | 2/4/4 | 120×120 px (240×240 u) |
| Oriel | H3 | Paso entre Mundos | grieta 140 u + salto | `#e05a7a` | 2/4/5 +6 | 70×70 px (140×140 u) |
| Oriel | Ult | La Gran Cicatriz | fisura gigante 400 u | `#2a0a16` | 5/6/7 +10 | 200×200 px (400×400 u) |
| Oriel | Pasiva | Paso entre Cicatrices | halo de salida | `#ffd0dc` | 0/2/2 | 48×48 px (48×48 u) |
| Orsa | Básico | Ataque básico (perno de ballesta) | perno corto | `#2b3d5c` | 1/3/3 +4 | 20×8 px (20×8 u) |
| Orsa | H1 | Perno conductor | línea 340 u con cable | `#dfa352` | 2/3/4 | 60×12 px (60×12 u) |
| Orsa | H2 | Apoyar la culata | bípode + aro 60 u | `#2b3d5c` | 3/2/4 +6 | 30×30 px (60×60 u) |
| Orsa | H3 | Cerrar el circuito | circuito 175 u | `#dfa352` | 2/4/5 | 175×175 px (350×350 u) |
| Orsa | Ult | Tormenta de rescate | nube de rayos 420 u | `#1b2438` | 4/6/6 +8 | 210×210 px (420×420 u) |
| Ismara | Básico | Hoja del Augurio | tajo fino blanco | `#f2fbf6` | 1/3/3 | 55×36 px (55×36 u) |
| Ismara | H1 | Destino Restaurado | reloj que rebobina | `#bffff0` | 3/4/5 | 60×60 px (60×60 u) |
| Ismara | H2 | Visión del Inmortal | ojo + burbuja 64 u | `#bffff0` | 3/2/4 +6 | 64×64 px (64×64 u) |
| Ismara | H3 | Danza del Augurio | giro de hoja 112 u | `#f2fbf6` | 2/4/4 | 112×112 px (224×224 u) |
| Ismara | Ult | Ascensión del Elegido | fusión con aliado | `#bffff0` | 4/4/5 +8 | 90×160 px (90×160 u) |
| Ismara | Pasiva | Presagio — Giro del Presagio | giro fino 105 u | `#f2fbf6` | 1/2/3 | 105×105 px (210×210 u) |
| Renko | Básico | Ataque básico (pala) | golpe de pala | `#e0cfa8` | 1/3/3 | 44×44 px (44×44 u) |
| Renko | H1 | Surco de contención | surco 235 u + parche | `#7a5a3a` | 2/3/4 +6 | 118×30 px (235×60 u) |
| Renko | H2 | Montículo | túmulo 200 u | `#5a4128` | 2/3/5 +8 | 100×100 px (200×200 u) |
| Renko | H3 | Devolver a la tierra | anillo de grietas 120 u | `#b08a5a` | 2/4/5 | 120×120 px (240×240 u) |
| Renko | Ult | Aquí siguen los nombres | 3 sacudidas 180 u | `#7a5a3a` | 4/6/6 +6 | 180×180 px (360×360 u) |
| Saelis | Básico | Ataque básico (pluma) | pluma blanca | `#9cd0f0` | 1/3/4 +4 | 20×10 px (20×10 u) |
| Saelis | H1 | Abanico de Plumas | abanico de 5 plumas | `#9cd0f0` | 2/4/3 | 36×14 px (36×14 u) |
| Saelis | H2 | Ráfaga Ascendente | ráfaga circular 150 u | `#d6ecfa` | 3/4/4 | 150×150 px (300×300 u) |
| Saelis | H3 | Llamado del Plumaje | estelas de retorno | `#fff4cc` | 2/3/4 | 150×13 px (300×26 u) |
| Saelis | Ult | Cielo de Plumas | nube de plumas 440 u | `#d6ecfa` | 5/4/6 +8 | 220×220 px (440×440 u) |
| Saelis | Pasiva | Muda Celeste (Plumas en el suelo y Bendición del Plumaje) | pluma clavada | `#fff4cc` | 2/3/4 +6 | 18×36 px (18×36 u) |
| Segador | Básico | Siega | arco ancho de sangre | `#ff8a7a` | 1/4/3 | 76×56 px (76×56 u) |
| Segador | H1 | Tajo del Segador | arco de guadaña 77° | `#c62828` | 2/3/4 | 65×81 px (130×162,5 u) |
| Segador | H2 | Armadura de la Furia | aro de pinchos 46 u | `#7a1620` | 3/3/5 +8 | 92×92 px (92×92 u) |
| Segador | H3 | Último Aliento | corazón que late | `#8a1414` | 1/4/4 +6 | 36×36 px (36×36 u) |
| Segador | Ult | Segador de Almas | aura roja + calavera de almas | `#c62828` | 6/6/6 +8 | 150×150 px (150×150 u) |
| Sira | Básico | Ataque básico (brújula) | brújula | `#e8d9b0` | 1/3/3 +4 | 18×18 px (18×18 u) |
| Sira | H1 | Línea de tinta | trazo de tinta 290 u | `#3b5a9a` | 2/3/5 | 145×24 px (290×48 u) |
| Sira | H2 | Volver sobre los pasos | trazo con chevrones | `#8aa7da` | 2/4/4 | 85×12 px (170×24 u) |
| Sira | H3 | Borrar el camino | cinta de goma sobre la ruta | `#e8d9b0` | 2/3/4 | 120×56 px (120×56 u) |
| Sira | Ult | Atlas de los ausentes | mapa pergamino sobre la ruta | `#e8d9b0` | 6/3/6 +8 | 80×80 px (160×160 u) |
| Sira | Pasiva | Trazado reciente (rastro de tinta) | huellas de tinta | `#3b5a9a` | 0/2/5 | 10×10 px (10×10 u) |
| Solciju | Básico | Ataque básico (sacacorchos) | sacacorchos con gota | `#f0d3a0` | 1/3/3 +4 | 20×10 px (20×10 u) |
| Solciju | H1 | Vino maldito | corona de vino 85 u | `#923951` | 2/5/5 | 85×85 px (170×170 u) |
| Solciju | H2 | Barrica añeja | barrica 100 u | `#623c2b` | 4/5/6 +8 | 24×30 px (24×30 u) |
| Solciju | H3 | Brindis a solas | copa + aro 70 u | `#f0d3a0` | 2/2/4 +6 | 24×28 px (24×28 u) |
| Solciju | Ult | Gran Reserva | lago de vino 160 u | `#6b1f38` | 4/4/6 +8 | 160×160 px (320×320 u) |
| Elyra | Básico | Rayo de Alba | orbe de luz | `#a9f0c9` | 1/3/3 +4 | 18×18 px (18×18 u) |
| Elyra | H1 | Alba Purificadora | sol + anillo 260 u | `#5fc48c` | 2/4/5 | 160×160 px (320×320 u) |
| Elyra | H2 | Bendición de Guerra | sello de espadas rojas | `#ff4a3d` | 2/3/5 +6 | 156×156 px (312×312 u) |
| Elyra | H3 | Escudo Sagrado | sello de escudos azules | `#5fb0ff` | 2/3/5 +6 | 156×156 px (312×312 u) |
| Elyra | Ult | Bendición Suprema | sello coronado violeta-oro | `#c88cff` | 4/5/6 +8 | 154×154 px (308×308 u) |
| Aldric | Básico | Golpe de Escudo | onda de escudo | `#a9cdf0` | 1/3/3 | 56×40 px (56×40 u) |
| Aldric | H1 | Torbellino | aro de hojas 115 u | `#5f8fc4` | 2/3/4 +8 | 115×115 px (230×230 u) |
| Aldric | H2 | Embestida | estela azul 230 u | `#a9cdf0` | 1/3/5 | 115×20 px (230×40 u) |
| Aldric | H3 | Grito de Guerra | sello + estandarte 46 u | `#8fd0ff` | 2/3/4 +6 | 46×46 px (92×92 u) |
| Aldric | Ult | Grito Provocador | sello rojo 230 u + "!" | `#ff5a3d` | 4/5/6 +8 | 115×115 px (230×230 u) |
| Tibor | Básico | Ataque básico (abejas) | 3 abejas | `#f5df8a` | 1/3/3 +4 | 20×20 px (20×20 u) |
| Tibor | H1 | Nube obrera | nube de abejas 110 u | `#c9b365` | 4/2/4 +8 | 110×110 px (220×220 u) |
| Tibor | H2 | Volvé a casa | cinta de abejas de retorno | `#c9b365` | 2/3/4 +6 | 130×15 px (260×30 u) |
| Tibor | H3 | Polen de aviso | nube de polen 90 u | `#f5df8a` | 1/3/5 | 90×90 px (180×180 u) |
| Tibor | Ult | El cielo zumba | panal gigante 155 u | `#c9b365` | 6/4/6 +8 | 155×155 px (310×310 u) |
| Tibor | Pasiva | Colonia viva (indicador) | colmena a la espalda | `#c9b365` | 0/1/0 +4 | 28×28 px (28×28 u) |
| Velmira | Básico | Ataque básico (máscara) | mini máscara | `#2a1038` | 1/3/4 +4 | 18×18 px (18×18 u) |
| Velmira | H1 | Máscara Arrojada | máscara lanzada 320 u | `#f3d1ff` | 2/3/4 +6 | 50×50 px (50×50 u) |
| Velmira | H2 | Coro de Rostros | aro de 4 máscaras 170 u | `#c06bd8` | 3/4/4 | 170×170 px (340×340 u) |
| Velmira | H3 | Cambio de Rostro | salto con cortina 140 u | degradé de máscaras | 1/3/4 | 140×40 px (140×40 u) |
| Velmira | Ult | El Gran Teatro | 4 máscaras gigantes 260 u | `#8a3aa6` | 6/5/6 +8 | 260×260 px (520×520 u) |
| Velmira | Pasiva | Mil Rostros (máscara activa) | 4 máscaras en la cabeza | `#f3d1ff` | 0/2/0 +6 | 14×14 px (14×14 u) |
| Vesper | Básico | Ataque básico (tijeras de luto) | tijeretazo X | `#efe6d0` | 1/2/3 | 40×28 px (40×28 u) |
| Vesper | H1 | Agujas de penumbra | abanico de agujas 97° | `#aa75bd` | 2/3/4 | 118×177 px (235×353,1 u) |
| Vesper | H2 | Costura de fuga | costura 120 u | `#efe6d0` | 1/3/4 +8 | 120×48 px (120×48 u) |
| Vesper | H3 | Deshilachar | corte circular 150 u | `#9aa0b0` | 2/4/5 | 150×150 px (300×300 u) |
| Vesper | Ult | La última puntada | bordado 4 cortes 155 u | `#aa75bd` | 6/5/6 +8 | 155×155 px (310×310 u) |
| Veyra | Básico | Ataque básico (daga) | tajo fino diagonal | `#ff7d8e` | 1/2/3 | 44×20 px (44×20 u) |
| Veyra | H1 | Abrir la herida | garra de 3 tajos 97° | `#ff7d8e` | 2/3/4 | 65×98 px (130×195,3 u) |
| Veyra | H2 | Paso escarlata | estela carmesí 145 u | `#ab3459` | 1/3/5 | 145×40 px (145×40 u) |
| Veyra | H3 | Pacto de dolor | sello de latido 100 u | `#ab3459` | 2/3/4 +6 | 50×50 px (100×100 u) |
| Veyra | Ult | La última herida | herida circular 145 u | `#ff7d8e` | 6/5/6 +6 | 145×145 px (290×290 u) |
| Vhal | Básico | Ataque básico (cometa) | cometa | `#d9e1ff` | 1/3/3 +4 | 20×12 px (20×12 u) |
| Vhal | H1 | Estrella Errante | cometa lineal 360 u | `#d9e1ff` | 2/3/4 | 180×20 px (360×40 u) |
| Vhal | H2 | Pozo Gravitatorio | disco espiral 130 u | `#3a44b0` | 3/2/5 +8 | 130×130 px (260×260 u) |
| Vhal | H3 | Órbita | arco de estrellas 180° | `#d9e1ff` | 1/4/5 | 160×80 px (320×160 u) |
| Vhal | Ult | Colapso | singularidad 190 u | `#ffe9a0` | 8/5/6 +8 | 120×120 px (240×240 u) |
| Ynara | Básico | Ataque básico (vial) | frasquito rosa | `#fff0f7` | 1/3/3 +4 | 18×18 px (18×18 u) |
| Ynara | H1 | Mirada fulminante | abanico de luz 97° | `#ed8db5` | 2/3/4 | 95×143 px (190×285,5 u) |
| Ynara | H2 | Estrogonof reparador | plato con vapor 115 u | `#f2d9a8` | 2/2/5 +8 | 115×115 px (230×230 u) |
| Ynara | H3 | No quiero seguir esta conversación | cortina de agua 130 u | `#a9dcf0` | 1/3/5 +8 | 130×64 px (130×64 u) |
| Ynara | Ult | Santa Paciencia | santuario 170 u | `#fff0f7` | 6/5/6 +8 | 170×170 px (340×340 u) |
| Ynara | Pasiva | Impecable (escudo y destello) | escudo nacarado | `#fff0f7` | 2/3/3 +6 | 50×50 px (50×50 u) |
| Zahra | Básico | Ataque básico (vapor) | bocanada de vapor | `#cfe0ee` | 1/3/4 +4 | 20×20 px (20×20 u) |
| Zahra | H1 | Boca de horno | llamarada 97° 190 u | `#ed8858` | 2/3/4 | 95×143 px (190×285,5 u) |
| Zahra | H2 | Enfriar | nube de vapor 140 u | `#cfe0ee` | 2/4/6 +6 | 140×140 px (280×280 u) |
| Zahra | H3 | Paso de ceniza | estela de ceniza 120 u | `#6a6560` | 1/3/5 +8 | 120×56 px (120×56 u) |
| Zahra | Ult | Abrir todas las válvulas | 6 válvulas 155 u | `#eef6fc` | 6/4/6 +8 | 155×155 px (310×310 u) |
| Zahra | Pasiva | Calor prestado (indicador) | guante que se calienta | `#6a6560` | 0/2/0 +4 | 30×30 px (30×30 u) |

## Producción por campeón

| Campeón | Fichas | Cuadros totales (a+i+d+bucle) | Assets listados |
|---|---|---|---|
| Myla | 6 | 91 | 14 |
| Nahir | 5 | 64 | 13 |
| Nano GM | 6 | 89 | 15 |
| Ilvar | 6 | 89 | 18 |
| Oriel | 6 | 91 | 14 |
| Orsa | 5 | 70 | 14 |
| Ismara | 6 | 71 | 12 |
| Renko | 5 | 73 | 12 |
| Saelis | 6 | 79 | 14 |
| Segador | 5 | 77 | 11 |
| Sira | 6 | 70 | 15 |
| Solciju | 5 | 82 | 14 |
| Elyra | 5 | 77 | 13 |
| Aldric | 5 | 71 | 14 |
| Tibor | 6 | 82 | 13 |
| Velmira | 6 | 79 | 15 |
| Vesper | 5 | 67 | 12 |
| Veyra | 5 | 62 | 11 |
| Vhal | 5 | 75 | 12 |
| Ynara | 6 | 93 | 15 |
| Zahra | 6 | 86 | 12 |
| **Total** | **116** | **1638** | **283** |

Los cuadros son una sugerencia de partida (cada ficha da el detalle por fase); los "assets listados" cuentan cada sprite/decal distinto que pide la ficha (variantes de color incluidas como un solo asset).

## Tamaños que superan el tope del motor actual

El generador procedural actual limita cada decal de suelo a **128 px** por lado (`kvbS`, `js/champions/vfx-b/pixfx.js:86`) con ≈4,4 u/px; el arte nuevo a 2 u/px (o a 1 u/px) de las zonas grandes lo supera. Es una decisión de integración (reducir la densidad de esas piezas, partirlas en cuadrantes o subir el tope), no de arte. Assets de este brief que lo superan (72 de 283):

| Campeón | Assets de más de 128 px por lado (habilidad — asset: px) |
|---|---|
| Myla | BERRINCHE — Onda de llanto (bucle): 180×180 |
| Nahir | Astillas errantes — Sector completo (largo × ancho en la punta): 120×180 |
| Nano GM | Sentencia Umbría — Franja del decreto: 165×30; Sentencia Umbría — Sello final: 140×140; Edicto de Luz — Círculo de ley: 135×135; Edicto de Luz — Destello de pulso: 135×135; Inversión — Estallido de llegada: 143×143; Inversión — Hebra del trayecto: 130×15; Juicio del GM — Disco de la arena (mitades, 4 cuadrantes de ≤220 px recomendados): 440×440; Juicio del GM — Grieta central: 20×440 |
| Ilvar | Cosecha de Almas — Sector del cono (largo × ancho en la punta): 105×182; Cosecha de Almas — Nova con Pacto (⌀): 231×231; Plaga de los Condenados — Niebla de la plaga: 150×150; Plaga de los Condenados — Hilo de contagio (largo máx.): 140×12; Encarnación del Abismo — Aura de llamas (capa detrás del demonio): 120×150 |
| Oriel | Abrir Cicatriz — Hilo que los une (opcional): 160×4; Paso entre Mundos — Hilo del trayecto: 150×12; La Gran Cicatriz — Fisura completa (bucle): 200×200 |
| Orsa | Perno conductor — Cable tendido (línea completa): 170×22; Cerrar el circuito — Circuito (anillo exterior): 175×175; Tormenta de rescate — Nube (bucle): 210×210; Tormenta de rescate — Barrido cónico (largo × ancho): 140×210; Tormenta de rescate — Descarga final (⌀): 210×210 |
| Ismara | Ascensión del Elegido — Columna de fusión: 90×160 |
| Renko | Aquí siguen los nombres — Sacudida (anillo): 180×180 |
| Saelis | Abanico de Plumas — Abanico completo (largo × ancho en la punta): 150×122; Ráfaga Ascendente — Ráfaga (anillo): 150×150; Ráfaga Ascendente — Línea de pluma disparada: 150×6; Llamado del Plumaje — Estela dorada (por pluma): 150×13; Cielo de Plumas — Nube (bucle): 220×220 |
| Segador | Armadura de la Furia — Tajo Final (nivel 6, ⌀): 130×130; Segador de Almas — Calavera de almas: 150×150 |
| Sira | Línea de tinta — Trazo: 145×24 |
| Solciju | Gran Reserva — Lago de vino (bucle): 160×160; Gran Reserva — Onda de pulso: 160×160 |
| Elyra | Alba Purificadora — Sol interior (daño): 160×160; Alba Purificadora — Anillo de curación: 260×260; Bendición de Guerra — Sello bajo Elyra: 156×156; Bendición de Guerra — Anillo de onda: 260×260; Escudo Sagrado — Sello bajo Elyra: 156×156; Bendición Suprema — Sello coronado: 154×154; Bendición Suprema — Anillo de onda: 280×280 |
| Aldric | Grito Provocador — Anillo de onda: 230×230 |
| Tibor | Volvé a casa — Cinta de abejas (largo variable ≤ 260 u): 130×15; El cielo zumba — Nube y panal (bucle): 155×155 |
| Velmira | Máscara Arrojada — Estela (línea completa): 160×20; Coro de Rostros — Aro de máscaras: 170×170; Cambio de Rostro — Cortina del salto: 140×40; El Gran Teatro — Escenario y telón (bucle): 260×260; El Gran Teatro — Onda de acto: 260×260 |
| Vesper | Agujas de penumbra — Sector del abanico (largo × ancho en la punta): 118×177; Deshilachar — Corte circular: 150×150; La última puntada — Bordado circular (bucle): 155×155; La última puntada — Estallido final: 155×155 |
| Veyra | Paso escarlata — Estela: 145×40; La última herida — Herida circular: 145×145; La última herida — Hilo de sangre a Veyra: 145×8 |
| Vhal | Estrella Errante — Estrella con cola (largo × ancho): 180×20; Pozo Gravitatorio — Disco espiral (bucle): 130×130; Órbita — Arco (radio máximo 160 u): 160×80; Colapso — Singularidad + disco de acreción (fase 2): 190×190; Colapso — Explosión (fase 3): 190×190; Colapso — Radio de succión (referencia): 320×320 |
| Ynara | Mirada fulminante — Sector del abanico (largo × ancho en la punta): 95×143; No quiero seguir esta conversación — Cortina de agua (largo × ancho): 130×64; No quiero seguir esta conversación — Velo de movimiento: 130×40; Santa Paciencia — Halo del santuario (bucle): 170×170; Santa Paciencia — Onda final: 170×170 |
| Zahra | Boca de horno — Sector de llama (largo × ancho en la punta): 95×143; Enfriar — Nube de vapor: 140×140; Abrir todas las válvulas — Anillo de válvulas y vapor (bucle): 155×155; Abrir todas las válvulas — Chorro de vapor: 155×40 |

## Colisiones de silueta y de color a evitar

Criterio: dos habilidades colisionan si comparten forma de área (cono, línea, círculo, aura) **y** su color dominante está cerca. Las fichas dicen cómo se resuelve cada una; esta sección las junta. Prioridad cuando dos piden lo mismo: la habilidad con mayor frecuencia de uso (básico, H1) conserva su forma y la otra cambia de motivo, no de mecánica.

### 1. Mismo cono de 97° (semiángulo 0,85 rad) — cinco campeones de esta mitad

Geometría verificada: `js/champions/expedition/runtime.js:9` (Expedición, `cos(.85)`), `js/champions/quality-five/veyra.js:30` (Veyra), `js/champions/ynara.js:11` (Ynara, `portadorCone(...,.85,...)`). Alcances: Vesper 235 u, Nahir 240 u, Zahra 190 u, Ynara 190 u, Veyra 130 u. Fuera de esta mitad comparten el mismo cono Brasa (Purga de Vapor, 170 u), Baltra (Badajo de retorno), Dáriel (Nota discordante) y Farolero (Destello).

| Habilidad | Cómo debe leerse (obligatorio) | Evitar |
|---|---|---|
| Nahir — Astillas errantes | 7–9 **polígonos sólidos** aguamarina con brillo blanco | hilos finos, llama, rayos suaves |
| Vesper — Agujas de penumbra | 9–11 **agujas finísimas** violeta unidas por **hilo marfil** | polígonos anchos, vidrio |
| Zahra — Boca de horno | **masa continua de llama** naranja con brasas | objetos sueltos, vapor blanco (es de Brasa) |
| Veyra — Abrir la herida | **tres tajos curvos** rosa-carmesí que se cruzan | abanico de objetos, arco ancho (es del Segador) |
| Ynara — Mirada fulminante | **rayos suaves** rosa-blancos con bordes difuminados | cualquier arista dura |

### 2. Líneas largas (240–360 u)

| Habilidad | Largo | Identidad |
|---|---|---|
| Vhal — Estrella Errante | 360 u | estrella de 5 puntas + polvo azul |
| Orsa — Perno conductor | 340 u | perno con cable de cobre y chispas angulosas |
| Nano GM — Sentencia Umbría | 330 u | franja negra con filo dorado y sellos |
| Velmira — Máscara Arrojada | 320 u | máscara grande de 4 colores posibles y listones |
| Sira — Línea de tinta | 290 u | pincelada azul con salpicaduras y cruz X |
| Nahir — Corte cruzado | 240 u | tajo blanco-aguamarina + ecos desde los espejos |
| Renko — Surco de contención | 235 u | franja de tierra marrón con estaca con nombre |

Fuera de esta mitad: Maura (Raíces de paso, 245 u), Aelith (Fractura de segundos, 330 u), Cazadora (Flecha Perforante, 420 u). Regla: **ninguna línea puede ser un rayo recto de un solo color** — cada una lleva su elemento firma (cable, estrella, pincelada, listones, tablilla, sellos).

### 3. Desplazamientos que dejan algo atrás

Nahir (Reflejo fugitivo, 110 u, espejo), Vesper (Costura de fuga, 120 u, costura marfil), Zahra (Paso de ceniza, 120 u, ceniza con brasas), Veyra (Paso escarlata, 145 u, estela carmesí), Ynara (No quiero seguir…, 130 u, cortina de agua), Aldric (Embestida, 230 u, estela azul con escudo), Oriel (Paso entre Mundos, teletransporte con grieta de 140 u), Nano GM (Inversión, runa bicolor), Velmira (Cambio de Rostro, cortina), Vhal (Órbita, arco de estrellas), Sira (Volver sobre los pasos, rebobinado). **Siete** (Nahir, Vesper, Zahra, Aldric, Oriel, Nano GM, Velmira) usan el mismo `dash` de 30 u de ancho en el premarcado (`js/skills/aim-targeting.js`); Veyra usa 28 u e Ynara una línea de 32 u; la identidad debe estar en lo que *dejan* (espejo / costura / ceniza / estela / agua), no en el salto.

### 4. Definitivas que siguen al héroe y pulsan en anillo

Myla (BERRINCHE, ≈10 ondas, 180 u), Orsa (Tormenta de rescate, 4 pulsos, 210 u), Renko (Aquí siguen los nombres, 3 sacudidas, 180 u), Vesper (La última puntada, 4 cortes, 155 u), Zahra (Abrir todas las válvulas, 4 pulsos, 155 u), Ynara (Santa Paciencia, ≈10 pulsos, 170 u), Aldric (Grito Provocador, 230 u), Elyra (Bendición Suprema, 280 u). Son **ocho** ultis con "anillo que sale del héroe": cada ficha fija su firma (lágrimas / nube de cobre con conos / estacas con nombres / bordado y tijeras / válvulas de latón / halo con muescas y alas / sello rojo con "!" / sello coronado violeta-oro). Si el dibujante resuelve una con un simple anillo, colisiona con las otras siete.

### 5. Zonas circulares persistentes en el suelo

| Habilidad | Radio | Color | Firma |
|---|---|---|---|
| Myla — Yogurazo | 95 u | rosa yogur `#e99abb` | charco lobulado con burbujas |
| Renko — Montículo | 100 u | tierra `#5a4128` | túmulo con brotes |
| Tibor — Nube obrera | 110 u | miel `#c9b365` | abejas en órbita + panal |
| Ynara — Estrogonof | 115 u | crema/rosa | plato con vapor y corazones |
| Vhal — Pozo Gravitatorio | 130 u | índigo `#6f7cf2` | disco espiral de estrellas |
| Nano GM — Edicto de Luz | 135 u | oro `#e8c56a` | círculo de escritura con balanza |
| Tibor — El cielo zumba | 155 u | miel | panal gigante |
| Solciju — Gran Reserva | 160 u | vino `#923951` | lago con ondas y uvas |
| Oriel — La Gran Cicatriz | 200 u | frambuesa `#e05a7a` | fisura con ecos |
| Saelis — Cielo de Plumas | 220 u | celeste `#d6ecfa` | nube con lluvia de plumas |

Regla: cada zona necesita un **elemento figurativo reconocible** (charco, plato, panal, lago, fisura, nube con plumas, disco de estrellas, escritura, túmulo). Un disco de color con borde no es aceptable.

### 6. Alas

Cinco campeones de esta mitad piden alas en sus efectos (las de Nano GM ya existen en el render; el resto son propuestas de los briefs): Nano GM (asimétricas luz/sombra, pasiva), Saelis (plumas azules, Ráfaga), Ynara (translúcidas rosa-blancas, Santa Paciencia), Ismara (translúcidas turquesa, Ascensión), Elyra (halo con alas pequeñas, Bendición Suprema). Se diferencian por **material** (plumas rígidas / cuchillas / luz líquida / hilos / alas pequeñas) y por **color**; no usar la misma silueta de ala dos veces.

### 7. Transformación o aura de definitiva sobre el cuerpo

Ilvar (Encarnación del Abismo, llamas verdes), Segador (Segador de Almas, aura roja + calavera), Ismara (Ascensión, columna turquesa + alas), Aldric (Grito Provocador, aura roja) y, fuera de esta mitad, Ilkan (Coloso de Arena). Colores en conflicto: Segador y Aldric rojos (separar por **forma**: calavera de almas vs sello con "!"); Ilvar verde (único); Ismara turquesa (único).

### 8. Escudos y burbujas redondas

Myla (Burbuja Cremosa), Ismara (Visión del Inmortal), Solciju (Brindis a solas), Ynara (Impecable), Tibor (escudo hexagonal de cera), Elyra (Escudo Sagrado). Identidad: yogur espeso / ojo con venas / copa con aro de vidrio / capa nacarada / hexágonos de cera / escudo heráldico. Prohibido repetir el "aro celeste con brillo" genérico de `kitFx` (`js/champions/kit-shared.js`, `fxHolyShieldBubble`).

### 9. Proyectiles básicos

Catorce básicos a distancia de esta mitad comparten velocidad 420 u/s (Ilvar: 440 u/s), radio 8 u (Ilvar: 7) y vida 900 ms (`js/skills/abilities.js`, ver cada ficha): cuchara (Myla), media luna (Nano GM), cráneo-alma (Ilvar), llave (Oriel), perno (Orsa), pluma (Saelis), brújula (Sira), sacacorchos (Solciju), orbe con cruz (Elyra), mini-enjambre (Tibor), máscara (Velmira), cometa (Vhal), frasquito (Ynara) y bocanada de vapor (Zahra). La silueta es lo único que los distingue a 16–20 u: no deben tener cola larga ni brillo envolvente que los iguale.

### 10. Colisiones de color de clase (calculadas)

ΔE CIE76 entre el color de clase (`CLASSES[k].color`) de cada campeón de esta mitad y el de todo el roster; se listan los pares con ΔE < 16 (menor = más parecidos; ~2 = casi indistinguibles):

| ΔE | Campeón (B) | Color | Otro campeón | Color | Cómo se separa |
|---|---|---|---|---|---|
| 2.8 | Ismara | `#4fd8c4` | Axiom | `#3ad6c4` | Ismara = hilos/relojes/ojo, blanco hueso; Axiom = glitch/píxeles/cuadrícula (mitad A) |
| 6.3 | Ilvar | `#4ab88a` | Khepri | `#3fae8a` | Ilvar = almas/cráneos/niebla; Khepri = escarabajos verde metálico (mitad A) |
| 6.8 | Ilvar | `#4ab88a` | Elyra | `#5fc48c` | Ilvar = verde sepulcral con negro-verde; Elyra = menta luminosa con oro y blanco |
| 7.7 | Myla | `#e99abb` | Ynara | `#ed8db5` | Myla = opaco, crema y charcos; Ynara = luz, vapor y blanco nacarado |
| 9.2 | Velmira | `#c06bd8` | Thalen | `#a15fc7` | Velmira = violeta teatral con máscaras y confeti; Thalen = arcano con fuego/hielo/rayo (mitad A) |
| 10.9 | Aldric | `#5f8fc4` | Facu GM | `#5aa8e4` | Aldric = acero con chispas y estandarte; Facu GM = agua/espuma (mitad A) |
| 11.1 | Nano GM | `#e8c56a` | Tibor | `#c9b365` | Nano GM = oro partido con negro; Tibor = miel apagada y hexágonos |
| 11.2 | Sira | `#8aa7da` | Aldric | `#5f8fc4` | Sira = tinta, pergamino y cruces; Aldric = acero, escudo y chispas |
| 11.9 | Solciju | `#923951` | Veyra | `#ab3459` | Solciju = vino oscuro translúcido, madera, vidrio; Veyra = carmesí vivo opaco con cortes y latidos |
| 11.9 | Aldric | `#5f8fc4` | Musashi | `#5aa8d8` | Aldric = pesado con escudo; Musashi = tajos finos (mitad A) |
| 12.3 | Sira | `#8aa7da` | Facu GM | `#5aa8e4` | Sira = tinta; Facu GM = agua (mitad A) |
| 12.3 | Tibor | `#c9b365` | Farolero | `#bba56e` | Tibor = abejas y panal; Farolero = farol y luz (mitad A) |
| 12.4 | Orsa | `#dfa352` | Brasa | `#c58543` | Orsa = pernos, cables y circuitos; Brasa = remaches, engranajes y vapor (mitad A) |
| 12.5 | Tibor | `#c9b365` | Dáriel | `#d6af77` | Tibor = abejas; Dáriel = notas musicales (mitad A) |
| 12.9 | Elyra | `#5fc48c` | Khepri | `#3fae8a` | Elyra = luz con símbolos; Khepri = insectos (mitad A) |
| 13.0 | Sira | `#8aa7da` | Musashi | `#5aa8d8` | Sira = tinta; Musashi = acero (mitad A) |
| 13.4 | Nano GM | `#e8c56a` | Aurelia | `#f2c14e` | Nano GM = oro + negro dividido; Aurelia = oro solar y prismas (mitad A) |
| 13.6 | Sira | `#8aa7da` | Iria | `#8889c1` | Sira = tinta/pergamino; Iria = hilos tensos y anclas (mitad A) |
| 13.9 | Tibor | `#c9b365` | Brakk | `#cead7a` | Tibor = abejas; Brakk = muros y torretas (mitad A) |
| 14.0 | Aldric | `#5f8fc4` | Iria | `#8889c1` | Aldric = acero; Iria = hilos (mitad A) |
| 14.6 | Nahir | `#68c6c2` | Ismara | `#4fd8c4` | Nahir = vidrio facetado y plata; Ismara = hilos, ojo y relojes |
| 15.7 | Nahir | `#68c6c2` | Axiom | `#3ad6c4` | Nahir = vidrio y espejo; Axiom = glitch (mitad A) |
| 15.7 | Nano GM | `#e8c56a` | Orsa | `#dfa352` | Nano GM = oro/negro con sellos; Orsa = cobre con cable |

Los pares con campeón de la mitad A dependen de lo que decida el otro brief (el índice equivalente de la mitad A, cuando exista): coordinar antes de cerrar paletas.

### 11. Colisiones de color a nivel de habilidad (calculadas)

Entre los colores dominantes de las fichas de esta mitad (ΔE < 9, sin blancos puros ni los básicos). Resultados relevantes:

| Par | Cómo se separan |
|---|---|
| Elyra — Bendición de Guerra (`#ff4a3d`) ↔ Aldric — Grito Provocador (`#ff5a3d`) | Casi el mismo rojo de sello (ΔE ≈ 6,8). Elyra: **espadas** sobre cada aliado; Aldric: **marcas "!"** sobre cada **enemigo** y rayos hacia Aldric. |
| Ilvar — Cosecha de Almas (`#4ab88a`) ↔ Elyra — Alba Purificadora (`#5fc48c`) | Verdes casi iguales (ΔE ≈ 6,8). Cono de manos y cadenas vs. anillo con sol: forma distinta; subir el negro-verde de Ilvar y el oro de Elyra. |
| Saelis — Ráfaga / Cielo (`#d6ecfa`) ↔ Zahra — Enfriar / válvulas (`#cfe0ee` / `#eef6fc`) | Aire pálido contra vapor pálido (ΔE ≈ 4–7). Saelis: **plumas y alas**; Zahra: **válvulas, volantes y vapor gris-azulado con brasas**. |
| Myla (`#e99abb`) ↔ Ynara — Mirada fulminante (`#ed8db5`) | Rosa vs rosa (ΔE ≈ 7,7). Myla: materia y contorno ciruela; Ynara: luz, blanco nacarado y rayos difuminados. |
| Tibor — Polen (`#f5df8a`) ↔ Vhal — Colapso fase 1 (`#ffe9a0`) | Amarillos pálidos (ΔE ≈ 7). Polen: granos y flores; Colapso: estrella de 5 puntas sobre fondo azul-negro. |
| Renko — Montículo (`#5a4128`) ↔ Solciju — Barrica (`#623c2b`) | Marrones (ΔE ≈ 7,5). Túmulo con brotes vs. barrica con aros y mecha. |
| Nahir — Reflejo (`#8a9ba0`) ↔ Vesper — Deshilachar (`#9aa0b0`) | Plata/gris de metal (ΔE ≈ 8). Espejo oval vs. tijeras gigantes. |
| Sira (`#e8d9b0`), Renko (`#e0cfa8`), Ynara (`#f2d9a8`), Solciju (`#f0d3a0`) — crema | Cuatro cremas casi iguales para papel / lápida / salsa / dorado: usar la crema **solo** como acento y siempre junto a la firma de su campeón (azul tinta / tierra / rosa / burdeos). |
| Velmira — Cambio de Rostro | Sin un hex único (degradé de la máscara saliente a la entrante): es la única habilidad cuyo dominante cambia con el estado. |

### 12. Colisiones con habilidades de la mitad A (nombres verificados en el código)

| Mitad B | Mitad A | Riesgo | Separación |
|---|---|---|---|
| Zahra — Boca de horno (cono de llama) | Brasa — Purga de Vapor (cono, `portadores.js`) | mismo cono naranja-cobre/vapor | llama viva + brasas vs. vapor blanco-cobre con remaches |
| Myla — Torre de Yogur | Brasa — Centinela de Latón; Brakk — Torreta de clavos | torretas | blanda, rosa/crema, goteante vs. metal y engranajes |
| Tibor — Nube obrera / El cielo zumba | Khepri — Enjambre / Eclipse de Escarabajos | nube de insectos | abejas amarillas + panal hexagonal vs. escarabajos verde metálico |
| Renko — Surco de contención | Maura — Raíces de paso | línea + parche de suelo | tierra marrón y tablilla con nombre vs. raíces y zarzas verdes |
| Vesper — Costura / hilos; Sira — Línea de tinta | Iria — hilos, anclas y Corte de Hilo (tijeras) | hilo y tijeras | puntadas marfil sobre ciruela / tinta azul con pergamino vs. hilo tenso azulado con sellos |
| Ismara — Destino Restaurado (reloj turquesa) | Aelith — Instante roto (reloj, ícono `clock+x`) | reloj en ambas | reloj que **rebobina** sobre el aliado, turquesa, vs. reloj lila de Aelith |
| Ynara — cortina de agua; Saelis — Ráfaga | Facu GM — Corriente de Resaca / Cabalgar la Ola | agua/viento azul | cortina fina celeste con gotas / aire con plumas vs. ola y espuma azul intenso |
| Ilvar — Plaga de los Condenados | Morveth — Jardín de la peste / Exhalación | niebla verde con contagio | verde azulado sepulcral con calaveras vs. verde amarillento con hongos |
| Vhal — Estrella Errante | Aurelia — Prisma / Refracción | línea y nodos de luz | estrella de 5 puntas con polvo azul vs. rayo dorado con prismas |
| Nano GM — Juicio del GM | Axiom — Force Quit; Aurelia — Catedral del Sol | ulti de pantalla completa | arena partida blanca/negra vs. colores invertidos vs. catedral de luz |
| Aldric — Embestida | Libertador — Carga de San Lorenzo; Ilkan — Lanza-Pendón | dash con arrastre | estela azul con golpe de escudo vs. caballo blanco vs. pendón de arena |
| Ismara — Danza del Augurio; Aldric — Torbellino | Musashi — Mil Cortes; Kael — Triple Golpe | giro/corte circular | hoja fina turquesa / aro de hojas de acero azul vs. ráfaga de cortes de Musashi |
| Segador — Tajo / Armadura | Kael — Corte Sangrante; Libertador — Bayoneta | rojo y sangre | arco de guadaña ancho rojo ladrillo y pinchos vs. dagas y sangrado rojo anaranjado |
| Nahir — Astillas errantes | Thalen — Nova de Escarcha | cristales azules | polígonos de vidrio aguamarina con brillo blanco vs. cristales de hielo |
| Orsa — Perno conductor / circuito | Thalen — Cadena de Relámpago; Axiom | electricidad | chispas de cobre angulosas vs. relámpago azul/violeta |

## Observaciones de mecánica que el dibujante debe conocer

- **Instantáneas:** salvo la Barrica (2400 ms de mecha), la Torre de Yogur (500 ms de construcción), los 700 ms de aturdimiento de Juicio del GM y las 3 fases de Colapso (1500/2200/500 ms), el daño es inmediato; la "anticipación" se mide dentro de la pose de lanzamiento (420 ms; 650 ms en definitiva) y del premarcado.
- **Galería de nadie (Nahir):** `dmgMult` es 0 en el catálogo (`js/champions/expedition/catalog.js`), y el daño se calcula como `baseDmg × dmgMult` (`js/skills/abilities.js`): los estallidos de 80 u frenan pero **no dañan** tal como está el código. No se tocó (el brief es solo documentación); el dueño decide si es un error de balance.
- **Clásicos (Aldric, Elyra, Segador, Ismara, Ilvar):** sus efectos genéricos escalan por niveles de talento (`tierOf` en `js/skills/ability-vfx.js`: ≥3, ≥5, ≥7). El Segador comparte hoy `cataclysmVFX` con Thalen (anillo naranja, giro celeste y cristales de hielo); el brief pide romper esa herencia.
- **Aldric** ya tiene íconos PNG propios para Torbellino, Embestida y Grito de Guerra (`js/assets/ui-icons.js`); sus otras habilidades usan el glifo pixel de `js/ui/skill-pixel-glyphs.js`.
- **Zonas que dependen de datos del juego:** Sira (la ruta real, hasta 12 puntos), Vhal (Órbita: radio entre 60 y 160 u según la distancia al centro), Vesper/Zahra/Renko (líneas entre origen y destino) y Tibor/Sira/Zahra (contadores en pantalla) piden arte **modular/repetible**, no un único dibujo fijo.
- **Todos los valores** son a nivel base; maestría y talentos multiplican radio, alcance y duración (`masteryAreaMult`, `talentSkillMods`).

## Qué no se verificó

- No se corrió el juego ni se capturó pantalla: las referencias visuales "hoy" salen de leer `js/champions/vfx-b/*.js`, `skill-fx-a/`, `ascension/render.js`, `expedition/render.js` y `docs/vfx/vfx-audit-b.md`, no de capturas nuevas.
- Las paletas salen de `CLASSES[k].color/glow`, de las paletas ya usadas en `vfx-b` y de una cuantización de color del atlas de cada sprite (aproximada; el sprite final puede variar). Los hex de acento (cereza, lágrima, etc.) son propuestas del brief.
- La escala de píxel (2,0 y 1,0 u/px) es un supuesto explícito tomado de ART_BIBLE §14; `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (a cargo de otro agente) manda si dice otra cosa.
- Las comparaciones con habilidades de la mitad A se hicieron contra los kits en el código, no contra los briefs del otro agente (no existían al escribir esto).
