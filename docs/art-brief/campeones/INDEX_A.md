# Índice de briefs de arte - mitad A del roster (`aelith` ... `musashi`)

> Formato técnico (canvas, paleta, export, nombres, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (otro agente; no se duplica aquí). Cada campeón tiene su brief en `docs/art-brief/campeones/<clave>.md`. La mitad B (`myla` ... `zahra`, 21 campeones) queda fuera de este índice.

## Cobertura

- **Campeones (22, verificado en `assets/sprites/champions/` y en los catálogos `js/data/champions.js`, `js/data/portadores.js`, `js/champions/ascension/catalog.js`, `js/champions/expedition/catalog.js`, `js/champions/quality-five/`):** `aelith`, `aurelia`, `axiom`, `baltra`, `brakk`, `brasa`, `bront`, `cazadora`, `dariel`, `eslabon`, `facu_gm`, `farolero`, `guerrero`, `ilkan`, `iria`, `khepri`, `libertador`, `mago`, `maura`, `morveth`, `morwen`, `musashi`. Coincide con la partición de `docs/vfx/HABILIDADES_VFX_MITAD_A.md` ("`aelith` ... `musashi` (22)").
- **Habilidades con brief: 114** = 22 básicos + 66 habilidades 1-3 + 22 definitivas (=110) + 4 habilidades de la forma Coloso de Ilkan (Alud, Hundimiento, Marcha de Dunas, Los Tres Pasos; botones propios mientras está transformado, `js/data/champions.js:224-232`). Además cada brief incluye la pasiva del campeón (22), indicando cuando el código no revela un indicador visible.
- **Qué es mecánica y qué es dirección:** radios, alcances, duraciones, ángulos y números de daño vienen del código con `archivo:línea`; colores, cuadros y tamaños de asset son sugerencias para el artista. Tamaños en px = unidades de mundo / (1,5 | 2 | 3 u/px según el tamaño), ver cabecera de cada brief. Los cuadros se dan como `anticipación + impacto + disipación` y `+L n` cuando hay un loop sostenido (n cuadros).

## Por qué hay colisiones hoy (verificado en el motor)

El motor procedural actual (`js/champions/skill-fx-a/engine.js`) dibuja TODAS las habilidades con seis arte base compartidos (nova, zona, cono, haz, estallido, aura; `SFA_NOVA_N=12`, `SFA_ZONE_N=8`, `SFA_CONE_N=10`, `SFA_BEAM_N=8`, `SFA_BURST_N=8`, `SFA_AURA_N=8`) más tres capas (rayos, ondas, columna). Lo único que cambia entre campeones es el tema (`themes.js`): paleta, "forma" del borde y 4 motivos. Por eso, hoy, la silueta de dos campeones coincide cuando comparten forma de tema:

| Forma de borde (`themes.js`) | Campeones de la mitad A que la comparten |
|---|---|
| `hex` | aurelia (prism), bront (crystal), eslabon (chain), mago-hielo (frost), morwen (alchemy) |
| `petal` | cazadora (hunt), khepri (scarab), maura (thorn) |
| `scallop` | baltra (bell), ilkan (sand), morveth (plague) |
| `wave` | dariel (music), facu_gm (tide) |
| `spike` | guerrero (blood), mago-fuego (fire), musashi (ink) |
| `sun` | aelith (time), farolero (lantern), libertador (patria) |
| `glitch` | axiom (glitch), mago-rayo (storm) |
| `square` / `gear` / `tri` | brakk / brasa / iria (únicos) |

Además, las novas de las definitivas son la misma pieza con otro color y otro radio. Los briefs piden arte propio por habilidad, no recolor de una pieza común.

## Tabla resumen (campeón x habilidad)

`Color` = color dominante propuesto. `Cuadros` = anticipación+impacto+disipación (+Ln de loop). `Tamaño` = px nativos sugeridos del asset principal (los objetos con varias piezas están desglosados en cada brief).

| Campeón | Habilidad | Nombre | Forma (silueta) | Color | Cuadros | Tamaño px |
|---|---|---|---|---|---|---|
| aelith | Básico | Segundo robado | gota de arena 36x36u | `#d9c9f5` | 2+3+3+L4 | 24x24 |
| aelith | Hab. 1 | Instante roto | dial roto con eco | `#bfa7dc` | 4+4+4+L8 | 104x104 |
| aelith | Hab. 2 | Fractura de segundos | grieta dentada blanca | `#d9c9f5` | 3+4+5+L4 | 224x40 |
| aelith | Hab. 3 | Tiempo prestado | estela de siluetas ámbar | `#f0c070` | 3+4+4+L8 | 64x80 |
| aelith | Definitiva | La hora imposible | dial colosal de 13 horas | `#5a4a8c` | 6+12+6+L6 | 232x232 |
| aurelia | Básico | Disparo de prisma | prisma rotando | `#ffe69a` | 2+3+3+L4 | 24x24 |
| aurelia | Hab. 1 | Prisma | nodo octaedro dorado | `#f2c14e` | 3+3+4+L8 | 32x48 |
| aurelia | Hab. 2 | Refracción | haz blanco con quiebres | `#fffbe8` | 2+4+4 | 232x32 |
| aurelia | Hab. 3 | Paso Luminal | scanlines doradas + halo hexagonal | `#e4b454` | 3+4+4+L6 | 120x120 |
| aurelia | Definitiva | Catedral del Sol | catedral de luz con rosetón | `#f2c14e` | 6+8+8+L8 | 232x232 |
| axiom | Básico | Paquete Corrupto | cubo de datos | `#9df5ea` | 2+3+3+L3 | 24x24 |
| axiom | Hab. 1 | Error 404 | ventana de error colapsando | `#3ad6c4` | 6+5+5+L6 | 176x176 |
| axiom | Hab. 2 | Sobrescribir | cadena magenta de bloques | `#ff4fd8` | 3+4+4+L4 | 16x148 |
| axiom | Hab. 3 | Teletransporte | pixelado azul origen-destino | `#4f8cff` | 2+3+3 | 48x48 |
| axiom | Definitiva | Force Quit | ventana gigante en negativo | `#ffffff` | 6+8+6+L8 | 232x232 |
| baltra | Básico | Golpe de badajo | arco corto con media luna | `#cc9c54` | 2+3+3 | 64x88 |
| baltra | Hab. 1 | Bronce vivo | anillo de bronce con muescas | `#9c4a2e` | 3+4+4 | 168x168 |
| baltra | Hab. 2 | Bajo la campana | media campana frontal | `#6fae9a` | 3+3+4+L8 | 80x144 |
| baltra | Hab. 3 | Badajo de retorno | abanico de ondas en V | `#cfeef0` | 3+4+4 | 120x184 |
| baltra | Definitiva | Que todos la escuchen | campana colosal con 3 tañidos | `#9c4a2e` | 6+12+6+L6 | 192x192 |
| brakk | Básico | Martillazo de obra | arco de martillo con polvo | `#cead7a` | 2+3+3 | 56x80 |
| brakk | Hab. 1 | Muro de asedio | muro de ladrillos | `#9a7a4e` | 3+3+5+L6 | 88x32 |
| brakk | Hab. 2 | Torreta de clavos | torreta de clavos | `#504637` | 4+3+5+L6 | 48x48 |
| brakk | Hab. 3 | Apuntalar | vigas en X con soldadura | `#b08a54` | 3+3+4+L6 | 216x216 |
| brakk | Definitiva | Demolición final | bola de demolición y escombros | `#cead7a` | 6+6+8+L6 | 240x240 |
| brasa | Básico | Remachadora | remache giratorio | `#e0a050` | 2+3+3+L4 | 24x24 |
| brasa | Hab. 1 | Centinela de Latón | torreta de latón con vapor | `#c58543` | 4+3+5+L6 | 48x48 |
| brasa | Hab. 2 | Purga de Vapor | cuña de vapor | `#fff4dc` | 3+5+5 | 120x176 |
| brasa | Hab. 3 | Desmontaje Rápido | desarme de torreta y estela | `#e0a050` | 3+4+4+L6 | 64x64 |
| brasa | Definitiva | Turno de Emergencia | sirena roja + torretas al rojo | `#b43c24` | 6+6+8+L6 | 96x96 |
| bront | Básico | Puño de bastión | puño blindado con onda | `#8aa4b8` | 3+3+3 | 64x88 |
| bront | Hab. 1 | Placa Arrojada | placa giratoria clavada | `#8aa4b8` | 3+4+4+L6 | 188x24 |
| bront | Hab. 2 | Muro de Placas | muralla de placas azules | `#5b7a94` | 3+4+5+L6 | 112x48 |
| bront | Hab. 3 | Pulso del Cristal | latido de cristal cian | `#5fd0ff` | 3+4+4+L6 | 160x160 |
| bront | Definitiva | Ciudadela | fortaleza de 4 muros y cúpula | `#8aa4b8` | 6+8+8+L6 | 232x232 |
| cazadora | Básico | Flecha | flecha con plumas | `#f4ffe0` | 2+3+3+L4 | 24x24 |
| cazadora | Hab. 1 | Flecha Perforante | saeta de 3 tiers | `#5c9a4a` | 6+4+4+L6 | 216x24 |
| cazadora | Hab. 2 | Trampa del Bosque | cepo de raíces circular | `#2f5a24` | 4+4+5+L6 | 96x96 |
| cazadora | Hab. 3 | Lluvia de la Cazadora | lluvia de 12 flechas | `#8fd45a` | 5+4+5+L4 | 240x240 |
| cazadora | Definitiva | Cacería Salvaje | lobo espectral | `#5ad0c8` | 6+9+6+L8 | 64x80 |
| dariel | Básico | Nota suelta | corchea ondulante | `#f6dba8` | 2+3+3+L4 | 24x24 |
| dariel | Hab. 1 | Nota discordante | abanico de notas rotas | `#7a1f35` | 3+4+4 | 144x208 |
| dariel | Hab. 2 | Marcha de salida | pentagrama en marcha | `#f6dba8` | 3+4+4+L8 | 200x200 |
| dariel | Hab. 3 | Volver al estribillo | onda de ida y vuelta violeta | `#c88aff` | 3+4+4 | 176x176 |
| dariel | Definitiva | Todavía hay una salida | telón, espiral y puerta de salida | `#7a1f35` | 6+18+8+L6 | 216x216 |
| eslabon | Básico | Cadena de Grilletes | latigazo de cadena | `#e4dfc8` | 2+3+3 | 64x88 |
| eslabon | Hab. 1 | Cadena de Retorno | cadena con garfio | `#9195a1` | 3+3+3 | 200x16 |
| eslabon | Hab. 2 | Línea Infranqueable | cadena tendida con estacas | `#5b606e` | 3+3+4+L6 | 136x16 |
| eslabon | Hab. 3 | Custodia | candado y cadena de unión | `#d8b868` | 3+3+3+L8 | 24x32 |
| eslabon | Definitiva | Nadie Queda Atrás | anillo de cadenas y celdas | `#9195a1` | 6+10+6+L8 | 192x192 |
| facu_gm | Básico | Quilla | tajo de agua | `#d4ecff` | 2+3+3 | 64x96 |
| facu_gm | Hab. 1 | Corriente de Resaca | río en línea | `#3c84cc` | 3+4+5+L8 | 200x48 |
| facu_gm | Hab. 2 | Presión Abisal | remolino hundido | `#0c3c6c` | 3+4+4 | 160x160 |
| facu_gm | Hab. 3 | Cabalgar la Ola | cresta de ola cabalgable | `#2f8fe0` | 3+4+5+L4 | 224x40 |
| facu_gm | Definitiva | El Océano Reclama la Arena | inundación de la arena | `#5aa8e4` | 8+10+8+L8 | 312x312 |
| farolero | Básico | Piqueta de guardia | arco de picota con chispa | `#bba56e` | 2+3+3 | 64x96 |
| farolero | Hab. 1 | Farol de Guardia | farol con llama y polillas | `#e8c060` | 4+3+4+L8 | 160x160 |
| farolero | Hab. 2 | Destello | haz de luz con rayos | `#ffe7a5` | 3+3+4 | 120x184 |
| farolero | Hab. 3 | Paso Seguro | senda de losetas con farolitos | `#8a6c30` | 3+4+4+L6 | 168x56 |
| farolero | Definitiva | Vigilia | anillo de velas en órbita | `#ffe7a5` | 6+5+6+L8 | 192x192 |
| guerrero | Básico | Puñalada | tajo corto | `#e4e4e4` | 2+2+3 | 48x48 |
| guerrero | Hab. 1 | Corte Sangrante | tajo profundo con goteo | `#c4544a` | 2+3+3+L4 | 64x64 |
| guerrero | Hab. 2 | Triple Golpe | combo azul-naranja-rojo | `#ff9a4d` | 2+5+3 | 64x64 |
| guerrero | Hab. 3 | Trampa de Área | rombo trampa con cadena | `#7dffa0` | 3+4+4+L6 | 88x88 |
| guerrero | Definitiva | Pestilencia Sombría | sigilo violeta + emboscada verde | `#5a3d7a` | 6+10+6+L6 | 200x200 |
| ilkan | Básico | Hoces Gemelas | combo de 3 hoces | `#f4d08a` | 2+3+3 | 56x88 |
| ilkan | Hab. 1 | Lanza-Pendón | lanza con pendón | `#d89a4a` | 2+4+5+L4 | 240x32 |
| ilkan | Hab. 2 | Piel de Duna | cúpula de arena compactada | `#b8793a` | 4+3+4+L8 | 64x80 |
| ilkan | Hab. 3 | Grito de Caravana | onda de viento con pendones | `#f4d08a` | 5+4+5+L8 | 304x304 |
| ilkan | Definitiva | Coloso de Arena | tromba y gólem de arena | `#d89a4a` | 10+6+8+L8 | 160x160 |
| ilkan | Coloso 1 | Alud | puñetazo al suelo con grietas | `#d89a4a` | 4+5+5 | 232x232 |
| ilkan | Coloso 2 | Hundimiento | cráter en 4 pulsos | `#8a5a2a` | 4+12+5+L4 | 256x256 |
| ilkan | Coloso 3 | Marcha de Dunas | huellas de coloso | `#d89a4a` | 3+3+4+L4 | 216x216 |
| ilkan | Coloso 4 | Los Tres Pasos | tres pisadas colosales | `#8a5a2a` | 10+18+10+L8 | 280x280 |
| iria | Básico | Aguja rúnica | aguja con hilo | `#e3e0ff` | 2+3+3+L3 | 24x24 |
| iria | Hab. 1 | Ancla | ancla de índigo con hilo | `#8889c1` | 3+3+4+L8 | 32x48 |
| iria | Hab. 2 | Tensión | hilos tensos que vibran | `#e3e0ff` | 3+3+4+L6 | 200x24 |
| iria | Hab. 3 | Corte de Hilo | tijera de luz cortando el ancla | `#ffffff` | 3+3+4 | 104x104 |
| iria | Definitiva | Sello de los Tres Caminos | triángulo de hilos con triskel | `#8889c1` | 6+10+6+L8 | 216x216 |
| khepri | Básico | Hoz de élitro | hoz con escarabajos | `#c8f27a` | 2+3+3 | 56x80 |
| khepri | Hab. 1 | Enjambre | bandada de escarabajos | `#3fae8a` | 4+4+5+L8 | 120x120 |
| khepri | Hab. 2 | Caparazón Vivo | armadura de escarabajos | `#1f6a50` | 4+3+5+L8 | 64x80 |
| khepri | Hab. 3 | Vuelo de Élitros | vuelo de élitros | `#c8f27a` | 3+4+4 | 152x56 |
| khepri | Definitiva | Eclipse de Escarabajos | eclipse de escarabajos | `#0a1a12` | 8+6+8+L8 | 216x216 |
| libertador | Básico | Fusil de Granadero | disparo de fusil con humo | `#fff1c2` | 2+6+6+L3 | 32x32 |
| libertador | Hab. 1 | Bayoneta | estocada de bayoneta | `#f4f8ff` | 2+3+4+L3 | 128x32 |
| libertador | Hab. 2 | ¡Granaderos, a la carga! | granaderos espectrales | `#2f4f9a` | 5+4+5+L8 | 288x288 |
| libertador | Hab. 3 | Carga de San Lorenzo | caballo blanco al galope | `#f4f8ff` | 3+4+4+L4 | 216x32 |
| libertador | Definitiva | Cruce de los Andes | cruce de los Andes | `#f4f8ff` | 8+8+8+L4 | 320x120 |
| mago | Básico | Proyectil Arcano | orbe arcano violeta | `#a15fc7` | 2+3+3+L4 | 24x24 |
| mago | Hab. 1 | Muro de Fuego | corona de llamas | `#ff6a3d` | 3+3+4+L8 | 112x112 |
| mago | Hab. 2 | Nova de Escarcha | flor de hielo | `#7ad0ff` | 3+4+5+L6 | 168x168 |
| mago | Hab. 3 | Cadena de Relámpago | relámpago en cadena | `#ffe36a` | 2+3+3+L4 | 232x32 |
| mago | Definitiva | Cataclismo Elemental | tormenta de tres elementos | `#a15fc7` | 6+12+6+L6 | 232x232 |
| maura | Básico | Cayado de zarza | arco de cayado con espinas | `#879c60` | 2+3+3 | 64x88 |
| maura | Hab. 1 | Raíces de paso | camino de raíces con espinas | `#4a5a30` | 3+4+5+L6 | 168x40 |
| maura | Hab. 2 | Corteza prestada | armadura de corteza | `#6c5424` | 4+2+4+L8 | 64x80 |
| maura | Hab. 3 | Poda necesaria | tijera de podar giratoria | `#cfe0a0` | 3+4+5 | 152x152 |
| maura | Definitiva | El bosque camina | bosque ambulante de espinas | `#4a5a30` | 6+18+6+L8 | 184x184 |
| morveth | Básico | Esporas de cultivo | cápsula de espora | `#c3d581` | 2+3+3+L4 | 24x24 |
| morveth | Hab. 1 | Huerto maldito | hongo que respira esporas | `#7c476b` | 3+3+5+L8 | 112x112 |
| morveth | Hab. 2 | Exhalación de peste | cuña de niebla con puntos | `#a4c56a` | 3+4+4+L3 | 144x216 |
| morveth | Hab. 3 | Simbiosis | envoltura de micelio | `#c3d581` | 3+3+4+L8 | 64x80 |
| morveth | Definitiva | Jardín de la peste | jardín de hongos que florece | `#a4c56a` | 6+16+8+L8 | 224x224 |
| morwen | Básico | Aguja de vidrio | aguja de vidrio con gota | `#a46191` | 2+3+3+L4 | 24x24 |
| morwen | Hab. 1 | Resina Amarga | charco de resina ciruela | `#a46191` | 3+4+5+L6 | 136x136 |
| morwen | Hab. 2 | Sal de Ruptura | abanico de cristales de sal | `#c8f0dc` | 3+4+4+L4 | 136x216 |
| morwen | Hab. 3 | Destilación | esfera de vidrio con gotas | `#c9a0bd` | 4+3+5+L8 | 64x80 |
| morwen | Definitiva | Alambique del Silencio | alambique con ecos | `#a46191` | 6+6+8+L8 | 232x232 |
| musashi | Básico | Combo del Bokken | combo de tres arcos blancos | `#ffffff` | 1+6+3 | 40x56 |
| musashi | Hab. 1 | Corte del Rōnin | pincelada horizontal | `#2a4a68` | 2+3+4 | 80x24 |
| musashi | Hab. 2 | Paso Fantasma | dos siluetas fantasma y línea de tinta | `#bfe4ff` | 2+3+4+L3 | 128x32 |
| musashi | Hab. 3 | Mil Cortes | ensō con 14 cortes | `#bfe4ff` | 3+6+4 | 184x184 |
| musashi | Definitiva | Último Duelo | dojo rojo bajo la luna | `#7a1f1f` | 8+14+8+L6 | 208x208 |

## Colisiones de color entre campeones (evitar)

Detectadas comparando el color dominante propuesto de las 114 habilidades (distancia RGB) y la paleta de los temas actuales; los pares casi idénticos (Δ<12) ya se corrigieron en los briefs (anotado abajo). Las reglas son para el artista: **una familia de color solo puede ser DOMINANTE en el campeón que la "posee"; en los demás es acento (≤20% del área del efecto).**

| # | Familia | Quién la posee | Quién la usa como acento / debe apartarse | Regla concreta |
|---|---|---|---|---|
| C1 | Oro, crema y ámbar claro | **Aurelia** (oro saturado frío `#f2c14e` + blanco dorado, siempre facetado) y **Farolero** (ámbar llama `#e8c060` + naranja `#ff9a3c`, siempre con parpadeo) | Dáriel (ocre `#d6af77` y crema solo en notas/pentagrama), Brakk (madera media `#b08a54`), Brasa (latón `#e0a050` con rojo), Ilkan (ocre arena `#d89a4a` con turquesa), Morwen (ciruela; el crema es vidrio), Aelith (ámbar solo como aguja/arena), Eslabón (oro viejo solo en candados) | Nada dorado "liso y brillante" fuera de Aurelia; nada de llama fuera del Farolero. Si un efecto de otro campeón lleva más del 20% de oro, bajarlo a ocre/ latón/ crema. Pares ya separados: Brakk Apuntalar (de `#f0dcae` a `#b08a54`), Brasa básico y Desmontaje (de `#ffd28a` a `#e0a050`). Vigilar: Aurelia Disparo `#ffe69a` / Farolero Destello `#ffe7a5` (Δ11): se distinguen por forma (prisma con filo vs haz con rayos) |
| C2 | Azul acero y cian frío | **Bront** (acero `#8aa4b8` + cristal `#5fd0ff`) y **Mago** (hielo `#7ad0ff`) | Baltra (verdín `#6fae9a`/cobre, NUNCA azul acero), Axiom (azul eléctrico `#4f8cff`), Facu GM (azul saturado `#2f8fe0`), Libertador (azul patria mate `#2f4f9a`), Musashi (azul tinta `#2a4a68`) | Antes: Baltra H2 `#8bb4bd` vs Bront `#8aa4b8` (Δ17), Axiom Teletransporte `#5ac8ff` vs Bront `#5fd0ff` (Δ9), Facu Cabalgar `#84ccfc` vs Mago Nova `#7ad0ff` (Δ11), Bront básico `#bfe8ff` vs Musashi `#bfe4ff` (Δ4): corregidos moviendo cada uno a su tono propio. Regla: el cian claro es del cristal de Bront y del hielo de Mago; el agua de Facu es azul profundo con espuma; el azul de Libertador es de tela, mate |
| C3 | Verdes | **Cazadora** (verde vivo bosque `#5c9a4a`), **Maura** (oliva `#879c60`), **Morveth** (verde-amarillo enfermizo `#a4c56a` + púrpura), **Khepri** (esmeralda iridiscente `#3fae8a`) | Axiom (turquesa digital), Guerrero (verde neón `#8dffa0` solo trampa/veneno), Morwen (menta solo en reacciones) | Cuatro verdes que no se pisan: vivo (Cazadora) / oliva apagado con rojo seco (Maura) / amarillento con púrpura (Morveth) / iridiscente con naranja (Khepri). Pares ya separados: Cazadora básico (de `#c8f0a8` a `#f4ffe0`), Morveth básico y Simbiosis (de `#dcf0a0` a `#c3d581`). Vigilar Maura Poda `#cfe0a0` / Morveth: distintos por forma |
| C4 | Violeta y lila | **Aelith** (lavanda pálido `#bfa7dc`), **Iria** (índigo `#8889c1`), **Mago** (arcano saturado `#a15fc7`, solo básico) | Dáriel (violeta solo en la habilidad 3), Guerrero (violeta oscuro en el sigilo `#5a3d7a`), Morwen (ciruela rosada, otro matiz) | Guerrero Pestilencia pasó de `#9a6ac7` (Δ13 de Mago) a `#5a3d7a`. Regla: Aelith = lavanda clara con ámbar; Iria = índigo con blanco; Mago = violeta saturado sin ámbar |
| C5 | Ocre, bronce, marrón | **Ilkan** (arena `#d89a4a`), **Brakk** (arena oscura/ladrillo `#9a7a4e`), **Baltra** (cobre rojizo `#9c4a2e` + verdín) | Maura (corteza `#6c5424`), Brasa (latón con rojo), Farolero (pardo solo de senda) | Pares ya separados: Baltra Bronce vivo/Tañidos (de `#b46c3c` a `#9c4a2e`, antes Δ14 de Ilkan Piel de Duna), Brakk Muro (de `#6d5636` a `#9a7a4e`, antes Δ18 de Maura Corteza). Regla: el marrón rojizo es de Baltra, el amarillento de Ilkan, el gris-arena de Brakk |
| C6 | Rojo y vino | **Guerrero** (carmesí `#c4544a`), **Musashi** (solo duelo: carmesí `#7a1f1f` y acento `#e04040`) | Dáriel (vino `#7a1f35`, solo habilidad 1 y definitiva), Mago (fuego naranja), Brasa (rojo caldera, solo definitiva), Khepri (naranja de élitro) | Dáriel `#7a1f35` y Musashi Duelo `#7a1f1f` están a Δ22: se distinguen por forma (abanico de notas / telón vs dojo con luna) y porque el vino de Dáriel siempre lleva ocre. Regla: la sangre es de Kael; el rojo de Musashi es de luna y duelo, no de herida |
| C7 | Blanco dominante | (todos como núcleo) | Musashi básico, Iria Corte de Hilo, Axiom Force Quit, Libertador Bayoneta/San Lorenzo/Andes, Morwen Sal, Aurelia Refracción, Facu básico | Hay 11 habilidades con blanco dominante. Cada una debe llevar SU borde propio: Musashi azul tinta, Iria lila, Axiom desplazamiento RGB cian/magenta, Libertador azul + oro, Morwen menta (`#c8f0dc`, antes `#f4fff8` a Δ10 de Libertador), Aurelia oro con dispersión |

## Colisiones de silueta entre campeones (evitar)

| # | Silueta | Habilidades implicadas | Cómo separarlas |
|---|---|---|---|
| S1 | **Triángulo** | Aurelia Catedral del Sol / Aurelia Convergencia (triángulo de 3 nodos) vs Iria Sello de los Tres Caminos y su Trama | Aurelia = volumen: columnas, arcos ojivales y rosetón, dorado con relleno de luz. Iria = líneas finas de 2-3 px sin relleno sólido, índigo, con triskel central. Nunca triángulo relleno en Iria, nunca triángulo de líneas finas en Aurelia |
| S2 | **Torreta** | Brakk Torreta de clavos vs Brasa Centinela de Latón (y Myla Torre de Yogur, mitad B) | Brakk = hierro oscuro cuadrado, cañón recto, clavos largos, fogonazo naranja. Brasa = latón redondo con cúpula, chimenea, manómetro y vapor, remache giratorio. Sin cañones compartidos |
| S3 | **Pared / muralla** | Brakk Muro de asedio, Bront Muro de Placas, Bront Ciudadela, Eslabón Línea Infranqueable, Mago Muro de Fuego (anillo) | Brakk = ladrillo con juntas desfasadas (marrón arena). Bront = placas verticales lisas de acero con juntas de luz y cristal. Eslabón = una cadena tendida entre estacas, sin cuerpo de muro. Mago = corona de llamas con centro libre |
| S4 | **Cono / abanico** (≥ 9 conos/arcos) | Baltra Badajo de retorno, Brasa Purga de Vapor, Dáriel Nota discordante, Farolero Destello, Morveth Exhalación, Morwen Sal de Ruptura, y todos los básicos cuerpo a cuerpo | Cada cono tiene textura interna propia: ondas lisas en V (Baltra), nube de vapor con perlas (Brasa), pentagrama con notas rotas (Dáriel), haz con rayos finos (Farolero), niebla con puntos (Morveth), cristales duros (Morwen). Prohibido el "abanico liso de color" |
| S5 | **Anillo / nova expansiva en el suelo** (≥ 12) | Baltra Bronce vivo, Bront Pulso del Cristal, Mago Nova de Escarcha, Aelith Instante roto, Dáriel Volver al estribillo, Ilkan Alud, Maura Poda necesaria, Aurelia Paso Luminal (llegada), y las definitivas de disco | Ningún anillo es una nova lisa: debe tener figura interior propia (muescas de campana, esquirlas de cristal, copos, dial con agujas, signo de repetición, grietas de arena, tijeras, hexágono) |
| S6 | **Línea larga** (≥ 13) | Aelith Fractura, Aurelia Refracción, Axiom Sobrescribir, Bront Placa, Cazadora Perforante, Eslabón Gancho/Línea, Facu Corriente, Farolero Paso Seguro, Ilkan Lanza-Pendón, Iria Tensión, Libertador Bayoneta/San Lorenzo, Maura Raíces, Mago Cadena | Distintas por ancho (16 a 80 u), cabeza y textura: grieta dentada (Aelith), haz con filamentos espectrales (Aurelia), cadena de bloques en escuadra (Axiom), placa giratoria (Bront), saeta con plumas (Cazadora), eslabones (Eslabón), río con vetas (Facu), senda con farolitos (Farolero), lanza con pendón (Ilkan), hilos vibrantes (Iria), estocada de acero / caballo (Libertador), raíces escalonadas (Maura), zigzag amarillo (Mago) |
| S7 | **Aura / envoltura corporal** (buffs sobre sí) | Aelith Tiempo prestado, Brakk Apuntalar, Khepri Caparazón Vivo, Ilkan Piel de Duna, Maura Corteza prestada, Morveth Simbiosis, Morwen Destilación, Baltra Bajo la campana, Bront Pulso (aliados) | Cada una de un MATERIAL distinto, no una burbuja: post-imágenes (Aelith), vigas clavadas (Brakk), placas de escarabajo (Khepri), arena compactada (Ilkan), corteza con savia (Maura), micelio blanco (Morveth), esfera de vidrio con gotas (Morwen), media campana frontal (Baltra). Prohibida la burbuja translúcida genérica (Elyra, Myla y Escudo Sagrado ya la usan) |
| S8 | **Objeto sembrado en el suelo** | Aurelia Prisma (nodo), Iria Ancla, Farolero Farol, Morveth Hongo, Brasa/Brakk torretas, Cazadora Trampa, Guerrero Trampa | Alturas y siluetas distintas: octaedro dorado flotante, rombo índigo clavado con hilo, farol con poste y llama, hongo púrpura que respira, torretas (ver S2), cepo circular de raíces, rombo metálico de 4 puntas con luz verde |
| S9 | **Definitivas de disco central** | Aelith, Baltra, Dáriel, Eslabón, Farolero, Iria, Morwen, Morveth, Mago, Facu | Cada una con una FIGURA central única, no un círculo coloreado: dial de 13 horas, campana colosal, telón y puerta de salida, anillo de eslabones y celdas, anillo de 7 velas, triángulo de hilos con triskel, alambique con rostros, jardín de hongos con hongo gigante, tormenta de tres elementos, inundación con siluetas abisales |
| S10 | **Indicadores de pasiva sobre la cabeza** | Baltra (vibración), Maura (semillas), Dáriel (notas): hoy son puntos "•" y "♪" de texto (`expedition/render.js:34`) | Cada uno su glifo y su paleta: anillitos de bronce (Baltra), semillas oliva→rojo (Maura), notas ocre→violeta (Dáriel) |
| S11 | **Efecto + criatura que corre** | Cazadora Lobo Espectral (turquesa translúcido), Libertador Granaderos espectrales (azul) y jinetes, Ilkan siluetas del Coloso | Lobo turquesa translúcido sobre cuatro patas; granaderos azules con gorro y fusil, en fila; colosos de arena ocre-turquesa de 2,7x. Sin fantasmas "verdes genéricos" |

### Cruces con la mitad B detectados por nombre (no verificados en detalle)

No se leyeron los kits de la mitad B para este índice (los hace otra rama). Por catálogo y paleta hay que revisar, cuando exista el `INDEX_B`: **Iria vs Vesper** (hilo y tijeras; Iria usa hilo recto geométrico y la tijera de luz de Corte de Hilo, Vesper costura ciruela), **Morwen vs Solciju** (vidrio/vino: `#923951` de Solciju, `quality-five/register.js:8`, contra la ciruela `#a46191` de Morwen), **Guerrero vs Veyra / Segador** (sangre), **Brakk vs Renko** (muros y túmulos), **Brasa vs Zahra** (vapor y horno), **Aelith vs Vhal/Sira** (tiempo y órbitas/ruta), **Facu vs Nano GM** (Regentes Fundadores de `ascension/catalog.js`).

## Pasivas con indicador visible verificado en código

Baltra (vibración), Maura (semillas) y Dáriel (notas) tienen indicador sobre la cabeza (`js/champions/expedition/render.js:34`); Bront suelta placas reales (`ascension/runtime.js:290`); Khepri tiene enjambre visible (`ascension/runtime.js:15`, `catalog.js:55-62`); Aurelia forma un triángulo con 3 nodos (`runtime.js:271`); Iria dibuja los hilos entre anclas (`skill-fx-a/c/iria.js:6`); Libertador muestra al Soldado Cabral (`libertador.js:244-256`). Las demás pasivas (Aelith, Brakk, Brasa, Eslabón, Farolero, Guerrero, Mago, Axiom, Morwen, Morveth) no tienen indicador propio verificado: en cada brief se marca como opcional.
