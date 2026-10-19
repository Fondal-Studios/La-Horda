# Definitivas con silueta propia — segunda tanda

Este directorio reúne dos tandas (A: 14 campeones; B: 13). Las matrices medidas quedan en archivos con sufijo -2a y -2b.

## Tanda A

Rama `claude/ultis-distintas-2a`, **apilada sobre `claude/ultis-distintas` (PR #132, todavía sin mergear)**: este PR depende de él (motor `js/champions/ult-forms/`, prueba de siluetas, bancos). Hasta que #132 entre a main, el diff contra main incluye también esos commits.
Otro agente rehace en paralelo las otras 13 (oriel, orsa, renko, saelis, segador, sira, solciju, tibor, vesper, veyra, vhal, ynara, zahra): no se tocaron sus archivos.

Prioridad del dueño: las habilidades y definitivas tienen que ser **diferentes entre sí** y muy impresionantes. Tras la primera tanda 27 definitivas seguían siendo "anillo con polvo". Esta tanda cubre aelith, aurelia, axiom, baltra, dariel, farolero, guerrero, iria, khepri, maura, morveth, morwen, myla y nigromante.

Todo es **solo visual**. No se tocó daño, enfriamientos, alcance, hitboxes, `js/net/*`, `server/*`, la mecánica de ningún campeón ni los íconos del HUD. Con `?uf=0` (o `window.UF_OFF = true`) vuelve el efecto anterior de cada uno.

## Archivos

- `js/champions/ult-forms/forms-2a-1.js` (aelith, aurelia, axiom, baltra, dariel, farolero, guerrero) y `forms-2a-2.js` (iria, khepri, maura, morveth, morwen, myla, nigromante): las 14 formas, mismo contrato que `forms-1/2/3.js`. Ayudas propias con prefijo `UA` (engranaje, llama, letras 3x5, aguja en perspectiva).
- `js/champions/ult-forms/bind-2a.js`: paleta de cada campeón (sale del brief de arte), geometría real y enganche a su mitad. Se carga después de `bind.js`.
- `index.html`: tres `<script>` nuevos después de `bind.js`.
- Sin cambios en el motor (`kit.js`) ni en las 16 formas de la primera tanda.

## Las 14 definitivas

Cada una tiene silueta, color dominante (del brief), movimiento y disipación propios, anticipación sobre el radio real con marcas propias, impacto con sacudida leve (`vfxShake` existente; respeta "Reducir movimiento" porque pasa por `kvbCalm`), pixel art de 3 tonos + brillo + acento, alfa 0/255, contorno de 1 px, tramado Bayer, sin `Math.random` (hash fijo `ufH`), un `drawImage` por entrada del pool.
Duración de la forma: 3,0 a 4,4 s (las mecánicas duran 2,4 a 11 s; el resto lo cubre el borde de trazos de la zona).

| Campeón (definitiva) | Forma | Silueta y movimiento | Color dominante | Máx. similitud antes → después |
|---|---|---|---|---|
| Aelith (La hora imposible) | `dial` | 13 numerales sobre el borde, dos agujas enormes que saltan 120° en cada pulso (cuña tramada del salto), engranajes que emergen del borde, vidrio que se quiebra y esquirlas que suben | violeta profundo, agujas ámbar | 0,87 (morveth) → 0,61 (renko) |
| Aurelia (Catedral del Sol) | `cathedral` | tres pilares en los vértices del triángulo, arcos ojivales, rosetón de 12 cuñas de vitral que gira; al final los pilares se desvanecen hacia arriba y el rosetón se parte | oro blanco, vitral cian y magenta solo en el rosetón | 0,72 (dariel) → 0,53 (zahra) |
| Axiom (Force Quit) | `window` | ventana de sistema gigante (barra de título, X, barra de progreso que es la cuenta atrás al golpe), desplazamiento RGB, parpadeo final, implosión y estallido de bloques cuadrados | turquesa y negro azulado, magenta de falla | 0,88 (khepri) → 0,50 (khepri) |
| Baltra (Que todos la escuchen) | `bell` | campana de bronce que baja entre cadenas, tres tañidos con ondas elípticas con huecos (la tercera con cresta), algas y burbujas, se alza al final | cobre rojizo con verdín | 0,89 (khepri) → 0,61 (khepri) |
| Dáriel (Todavía hay una salida) | `staff` | pentagrama ondulado que cruza el área, seis notas (vino = daño, oro = cura) que caen y estallan en brillos, reflector, puerta de SALIDA con cartel, telón que cierra | vino y ocre | 0,88 (myla) → 0,62 (bront) |
| Farolero (Vigilia) | `lanterns` | siete faroles de llama en órbita elíptica unidos por hilos de luz, farol grande arriba con polillas, gotas de luz que salen en cada pulso, se apagan en cadena | ámbar de llama | 0,88 (khepri) → 0,60 (dariel) |
| Guerrero (Pestilencia Sombría) | `toxin` | rombos de trampa marcan el área (el enemigo elegido), humo violeta que sube; a los ~2 s (la emboscada) tres cortes en cruz, nube tóxica en volutas y hilos de veneno en zigzag a los vecinos | violeta de sigilo a verde veneno | 0,49 (sira) → 0,54 (zahra) |
| Iria (Sello de los Tres Caminos) | `weave` | triángulo de hilos finos con arte de cuerdas entre los lados, triskel que gira, tres agujas de luz con vértice de oro; se deshilacha hacia los vértices | índigo, hilos blancos | 0,72 (morwen) → 0,47 (sira) |
| Khepri (Eclipse de Escarabajos) | `eclipse` | disco negro con corona de oro que pulsa sobre la zona, umbra, huracán de ~70 escarabajos que acelera; el disco se parte en tres y el enjambre estalla hacia afuera | negro verdoso, oro, esmeralda | 0,89 (baltra) → 0,61 (baltra) |
| Maura (El bosque camina) | `grove` | seis arbolitos espinosos que brotan y caminan, setos de zarzas que salen y vuelven en seis pulsos; se marchitan y caen hojas | oliva, espinas rojas, rosas | 0,80 (dariel) → 0,65 (bront) |
| Morveth (Jardín de la peste) | `garden` | hongos de sombrero púrpura que brotan del borde al centro, hongo gigante con láminas brillantes, micelio con olas de brillo y esporas, flores marchitas; reviente final y lluvia de esporas | verde enfermizo y púrpura | 0,87 (aelith) → 0,60 (bront) |
| Morwen (Alambique del Silencio) | `still` | alambique de cobre y vidrio que se ensambla (caldero, cabeza, serpentín de dos vueltas, matraz de menta); cada burbuja suelta un eco con rostro que sube; se enfría y el serpentín se rompe | ciruela y cobre-crema, menta | 0,72 (dariel) → 0,51 (zahra) |
| Myla (BERRINCHE) | `tears` | burbuja de llanto con tres lágrimas, tres lágrimas gigantes que caen con corona de salpicadura, charcos lobulados de yogur que se ensanchan y se evaporan | rosa yogur y celeste | 0,88 (dariel) → 0,61 (dariel) |
| Nigromante (Encarnación del Abismo) | `abyss` | almas en arcos que entran desde el borde, hélice de huesos que se cierra, estalla una columna de fuego verde con cráneo cornudo; al final las almas salen de vuelta | verde alma, hueso | 0,73 (segador) → 0,48 (sira) |

Similitud y matiz medidos con `tools/vfx/silhouette-diff.js` (`antes-matriz.csv`, `despues-matriz.csv`). El "matiz medido" del reporte incluye también lo que dibuja la mecánica del propio juego (por eso, p. ej., Iria mide naranja: el relleno del triángulo es del juego), la paleta de diseño es la de `bind-2a.js`.

## Enganche (qué se reemplaza y qué se conserva)

- **Mitad A** (aelith, aurelia, axiom, baltra, dariel, farolero, iria, khepri, maura, morveth, morwen): se envuelve `SFA_BIND[k].ult` con `ufSfa` de `bind.js`; la forma cae en la geometría que ya usaba la receta anterior (punto de la zona, radio real). Se silencian los anillos y ondas genéricos del lanzamiento (mecanismo de `bind.js`).
  Las zonas persistentes de la mecánica (`ael_hour`, `as_cathedral`, `ex_toll`, `ex_concert`, `as_eclipse`, `ex_forest`, `mor_garden` y las zonas de héroe de Axiom y Farolero) pasan a dibujarse como borde de trazos (`UF.lite`) y se les quitan la onda de cada pulso y la de cierre (`uaQuiet`, getters que vuelven al valor anterior con `?uf=0`).
- **Guerrero**: el sigilo conserva su aura; la forma cae sobre el enemigo más cercano a 280 u (el mismo que elegirá la emboscada) y dura hasta después del golpe; el anillo de partículas verde del golpe se quita (`performShadowStrike` envuelto, solo borra partículas de dibujo).
- **Nigromante** (mitad B): la receta clásica `abyss_incarnation_ult` pasa a la forma con `ufB`.
- **Myla** (mitad B): la forma se dispara cuando nace el objeto `tantrum` (local en cada cliente, sin red); se quitan las ondas en anillo (`my_cry_idle`), las lágrimas sueltas de la piel y los anillos `famRing` del motor de familia; queda el borde de trazos del área y la salpicadura sobre los enemigos.

## Costo (mediana, 200 cuadros de reloj virtual, 3 repeticiones; `costo.json`)

Primera medición: el costo propio subía de 0,25 a 0,98 ms/cuadro por la capa de suelo (`gpaint`) de formas largas (cada capa es otro `drawImage` del tamaño de toda la tira). Se **quitó la capa de suelo** de las 11 formas que la tenían: 

| | antes (efecto anterior) | después (formas) |
|---|---|---|
| update+render por cuadro (media de 14) | 5,38 ms | 4,78 ms |
| costo propio de los motores de efecto | 0,248 ms | 0,209 ms |
| drawImage por cuadro | 330,8 | 310,1 |
| horneado por tira | | 84 ms (idle, en cortes de 4 ms; con la máquina cargada midió 30 a 266 ms) |
| pool máximo | hasta 128 | 5 a 85 (con "Reducir efectos": 5 a 48) |

La máquina estaba muy cargada por otros procesos (load average 28 a 36 con 4 núcleos), así que el ms por cuadro total tiene ruido de varios ms; valen el costo propio y los `drawImage`, que bajan.

## Pruebas ejecutadas

Servidor propio en el puerto 9417 (se verificó con `ps` y `/proc/<pid>/cwd` que sirve este worktree). Chromium con `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`.

| Prueba | Resultado |
|---|---|
| `silhouette-diff.js` (41 definitivas en la matriz) | OK: 0 pares con forma propia sobre 0,80. Con las 14: máximo 0,65 (maura-bront); entre las 14 el máximo es 0,61; media de todos los pares 0,565 → 0,471; pares >= 0,80: 80 → 15 (los 15 restantes son deuda de la otra tanda: tibor, zahra, vesper, renko, ynara, solciju) |
| `test-ult-forms.js` | 6/6 OK en dos corridas: las 30 definitivas con forma (37 claves, 195 tiras, antes de quitar la capa de suelo) y solo las 14 de esta tanda (42 tiras, código final): sin `Math.random`, alfa 0/255 y <= 8 colores, pool acotado (128) y limpio, red, casillas reales, mecánica idéntica con y sin formas (150 cuadros, mismo azar), 0 errores de página |
| `verify-mechanics.js` (myla, nigromante) | 0 diferencias de mecánica, 0 errores de página |
| `parity-skill-fx.js` (los 12 de la mitad A) | 12 iguales (mismo estado y mismo consumo de `Math.random`), 0 errores |
| `ability-gate.js --strict` | 43 campeones, nuevos que no pasan: 0, 0 errores de página (el JSON generado se descartó, no se commitea) |
| `test-vfx-b.js` (`ABILITY_BASE_URL`) | PASS (135 recetas, 0 llamadas a `Math.random`, pool 128 y limpio, 0 vínculos inválidos) |

Aviso de orden: `verify-mechanics`, `parity-skill-fx` y `ability-gate` se corrieron **antes** de quitar la capa de suelo (cambio puramente de dibujo: borra funciones `gpaint`); `test-ult-forms` (incluye la comparación de mecánica con y sin formas), `silhouette-diff` y el banco de costo se corrieron después. Para certeza total, volver a correr esas tres en CI.

## Pendientes y lo que no cumple

- Revisión humana de arte, audio y pruebas reales de multiplayer y de rendimiento en móvil (`AGENTS.md` punto 7): las formas se miraron en hojas de contacto y capturas a 844x390, no en un teléfono.
- **Guerrero**: la emboscada ocurre 2 s después del lanzamiento; en la ventana de 2,3 s de la matriz solo se ve su principio, así que la matriz mide sobre todo la anticipación (rombos y humo). La forma se ancla en el enemigo elegido al lanzar, no se sigue si se mueve.
- **Myla**: el Berrinche sigue al héroe pero la forma queda anclada donde se lanzó; el borde del área (que sí sigue a Myla) lo dibuja `portadores.js` del juego (anillo base), que no se tocó.
- **Aelith, Baltra, Dáriel, Farolero**: sus zonas de pulso del juego (`exPulse`, anillos de partículas de la expedición) que ocurren después de los 3,2 s del lanzamiento no se silencian: siguen apareciendo como antes.
- Duración: 3 a 4,4 s por forma; las mecánicas de 6 a 11 s (Khepri, Nigromante, Aurelia, Farolero) quedan solo con su borde de trazos y sus objetos propios después.
- Axiom usa un radio mínimo de 200 u (la definitiva real mide 230 u).
- Facu y Nano GM siguen fuera de la matriz (pantalla completa), como en #132.
- Las 13 definitivas de la otra tanda siguen siendo anillo con polvo hasta que entre su PR; ahí están los 15 pares restantes con S >= 0,80 (deuda, no falla).
- La captura de `antes/` y `despues/` (hoja por campeón y máscaras) está en esta carpeta; `despues-matriz.csv` / `antes-matriz.csv` tienen la matriz completa.

## Tanda B

Rama `claude/ultis-distintas-2b`, **encima de `claude/ultis-distintas` (PR #132, todavia sin mergear)**: depende de su motor (`js/champions/ult-forms/kit.js`) y de `silhouette-diff.js`.
Esta tanda cubre las ultimas 13 en orden alfabetico: oriel, orsa, renko, saelis, segador, sira, solciju, tibor, vesper, veyra, vhal, ynara, zahra. Otro agente hace aelith ... nigromante
(no se tocaron sus archivos). Todo es **solo visual**: no se tocaron `js/net/*`, `server/*`, danio, enfriamientos, alcance, hitboxes ni los iconos del HUD. `?uf=0` sigue restableciendo
los efectos de antes.

Archivos nuevos (nombres `*-b*` para no chocar con la otra tanda): `forms-b1.js` (Oriel, Orsa, Renko, Saelis), `forms-b2.js` (Segador, Sira, Solciju), `forms-b3.js` (Tibor, Vesper, Veyra, Vhal,
Ynara, Zahra), `bind-b.js` (paleta, enganche, pieles). Unica edicion a un archivo existente: tres `<script>` en `index.html` y un caso nuevo (7) en `tools/vfx/test-ult-forms.js`.

## Formas

Cada una usa el color dominante, los motivos y la paleta del brief del campeon (`docs/art-brief/campeones/<clave>.md`, que esta en `main`), con silueta, movimiento y duracion propios.
Las zonas de 4 a 6 s dibujan la forma con el tiempo real de la mecanica (cada golpe de la zona tiene su momento). Anticipacion con marcas propias sobre el radio real, impacto con la
sacudida leve existente (se apaga con "Reducir movimiento"), disipacion propia. Pixel: alfa 0/255, contorno de 1 px, 6 colores por tira (contorno + 3 tonos + brillo + acento), tramado Bayer,
sin antialias, hash fijo (nada de `Math.random`).

| Campeon (definitiva) | Silueta | Movimiento | Duracion | Dominante | Max. similitud antes -> despues |
|---|---|---|---|---|---|
| Oriel (La Gran Cicatriz) | fisura en forma de ojo con dientes, vacio negro-vino con estrellas, haces de luz y ecos translucidos | se abre en 0,9 s, late cada 600 ms, un eco sale, tajea y se desvanece cada 760 ms, se cierra desde las puntas | 6 s | frambuesa/negro-vino | 0.77 (saelis) -> 0.57 (baltra) |
| Orsa (Tormenta de rescate) | nube azul-negra baja con tres abanicos de rayos de cobre que caen desde ella y una descarga final con rayo central | cada barrido en su momento (0,6/1,2/1,8 s), descarga a 2,4 s, la nube se deshace en llovizna | 2,8 s | azul-negro y cobre | 0.81 (axiom) -> 0.61 (baltra) |
| Renko (Aqui siguen los nombres) | cementerio: tres oleadas de lapidas con nombre sobre grietas, la ultima lanza piedras | brotan con polvo y se hunden | 3,3 s | tierra y marfil | 0.89 (vesper) -> 0.56 (bront) |
| Saelis (Cielo de Plumas) | nube blanca plana arriba, plumas en diagonal que se clavan con destello, hexagono de plumas al final | una tanda cada 400 ms, la nube gira y se deshace | 5 s | blanco/celeste y oro | 0.77 (oriel) -> 0.50 (velmira) |
| Segador (Segador de Almas) | calavera enorme sobre el heroe, torbellino de almas, llamas rojas a ras de suelo y guadana espectral | las almas suben en espiral y arman la calavera, que se rie; al final las almas caen | 3,4 s | rojo sangre y hueso | 0.72 (nigromante) -> 0.55 (maura) |
| Sira (Atlas de los ausentes) | pergamino rectangular con rosa de los vientos, ruta punteada, cruces rojas y montanas de garabato | se desenrolla, tres pulsos de luz azul recorren la ruta, se pliega y vuela en retazos | 2,9 s | pergamino y tinta azul | 0.62 (zahra) -> 0.59 (maura) |
| Solciju (Gran Reserva) | botella gigante que se vuelca, chorro, lago de vino irregular con luna dorada, coronas de salpicadura y uvas | cuatro pulsos (1 por segundo), el lago se drena | 4,2 s | burdeos | 0.87 (tibor) -> 0.52 (zahra) |
| Tibor (El cielo zumba) | panal de 19 hexagonos elevado, miel que gotea, haz de miel y enjambre de abejas | celda a celda, las abejas orbitan y vuelven a la colmena | 6 s | miel/ambar | 0.87 (solciju) -> 0.65 (ynara) |
| Vesper (La ultima puntada) | bordado (octogono, estrella {8/3}, aro, cruces) cosido en cuatro vueltas con tijeras gigantes | un corte por vuelta, el cuarto revienta en hilos y retazos | 3 s | violeta e hilo marfil | 0.90 (zahra) -> 0.60 (zahra) |
| Veyra (La ultima herida) | herida en forma de C (tajo circular) con corazon latiendo, hilos de sangre que convergen, puntos de sutura | el tajo recorre 360 grados, la herida se abre y se cierra de afuera hacia adentro | 2,2 s | carmesi/rosa sangre | 0.74 (zahra) -> 0.50 (sira) |
| Vhal (Colapso) | estrella de cinco puntas, agujero negro con disco de acrecion y estrellas succionadas, implosion con flash y rayos | las tres fases reales: 1,5 / 2,2 / 0,5 s | 4,3 s | indigo, oro estelar, blanco | 0.75 (renko) -> 0.47 (bront) |
| Ynara (Santa Paciencia) | alas nacaradas abiertas, halo de ocho muescas que se enciende por golpe y rayos del cielo | las alas respiran, el halo se enciende, onda final | 6,2 s | rosa y blanco nacarado | 0.89 (dariel) -> 0.65 (tibor) |
| Zahra (Abrir todas las valvulas) | seis valvulas de laton con volante unidas por tuberias a un guante al rojo blanco, chorros de vapor | cuatro pulsos (el cuarto mayor), el vapor sube | 3,1 s | vapor blanco-azulado, laton y horno | 0.90 (vesper) -> 0.60 (vesper) |

Segador: la herencia de `cataclysmVFX` (anillo naranja, giro celeste, brasas y cristales de hielo de Thalen) se retira: la funcion sigue corriendo (consume el mismo azar que antes, asi la mecanica
y la comparacion con `?uf=0` no cambian) y `bind-b.js` borra las particulas que dibujo; el sprite del lanzamiento ya lo silencia `bind.js`.

Zonas persistentes: las pieles de Orsa, Renko, Tibor, Vesper, Zahra y Solciju dejan de empujar el anillo con relleno y los decales de cada pulso; queda solo el borde del area real (`ufZoneEdge`). Se conservan
las abejas de Tibor, los numeros flotantes y los objetos de la mecanica. Oriel, Saelis y Vhal (Ascension) no tenian piel: se oculta el dibujo base (anillo + relleno) mientras la forma esta activa y se
sigue marcando el golpe de los ecos de Oriel. La piel de Sira deja de dibujar la banda; la ruta de tinta (overlay) sigue.

## Matriz antes / despues (`antes.*`, `despues.*`, `antes-matriz.csv`, `despues-matriz.csv`)

| | antes (rama del PR #132) | despues |
|---|---|---|
| Definitivas en la matriz | 41 de 43 | 41 de 43 |
| Con forma propia | 14 (+ Facu y Nano GM fuera de la matriz) | 27 (+ los 2) |
| Similitud media de los 820 pares | 0,564 | 0,478 |
| Pares con `S >= 0,80` (todos deuda: ninguna de las dos tiene forma propia) | 83 | 26 |
| Los 442 pares donde interviene una de las 13: media / p90 / maxima | 0,605 / 0,810 / 0,900 | 0,452 / 0,560 / 0,650 |
| Pares de esas 13 con `S >= 0,80` | 56 | 0 |

`node tools/vfx/silhouette-diff.js` termina en OK (`SIM_MAX = 0,80` intacto). Las 26 parejas que siguen sobre el umbral son de las 14 del otro agente (aelith ... nigromante), que aqui no
se tocaron. **Ojo**: esta matriz solo ve las 27 formas que existen en esta rama; las 14 formas del otro agente aun no estan, asi que la distincion de mis 13 contra ellas se
vuelve a medir al juntar las dos ramas (mis pares mas altos con las que aun son anillo: baltra 0,61, maura 0,59, zahra/vesper 0,60). Capturas: `antes/<campeon>.png` y `despues/<campeon>.png` (arriba/abajo
del PR #132 y de esta rama, cuadros a 60/380/680/1300 ms, con mascara `-mascara.png`) y `formas-hoja.png` (cada forma en 8 cuadros, suelo + arriba).

## Costo (`costo.json`, `node tools/vfx/bench-ult-forms.js`)

Pool adaptativo igual que la primera tanda (una entrada de arriba + una de suelo; con "Reducir efectos" o `vfxLoad < 0,6` baja a la mitad y el suelo no se crea). Media de las 13:
update+render por cuadro 6,41 -> 6,03 ms (ruido de varios ms: la maquina estaba muy cargada), drawImage por cuadro 387,9 -> 322,2, horneado 63,8 ms por tira (en tandas de 4 ms ociosas con
`ufPrebake`). Costo propio de los motores de efecto 0,46 -> 0,60 ms de media; **sube en Ynara (0,43 -> 2,23 ms), Vesper (0,31 -> 1,07) y Zahra (0,42 -> 0,85)** porque el banco lanza la definitiva cada 40 cuadros
(0,64 s) y estas formas duran 3 a 6 s: se apilan unas 5 a 10 a la vez, cosa que en juego no pasa (enfriamiento de 34 a 36 s). Con una sola definitiva en pantalla el costo es el de un sprite grande mas el borde
de zona. Pool maximo con "Reducir efectos": 35 a 53.

## Pruebas ejecutadas (servidor propio en el puerto 9431, se verifico con `ps` que sirve este worktree)

| Prueba | Resultado |
|---|---|
| `node tools/vfx/silhouette-diff.js` | OK, ningun par con forma propia llega a 0,80 (corrida final con el codigo final) |
| `node tools/vfx/test-ult-forms.js` | todos OK sobre las 29 definitivas con forma: sin `Math.random` (36 claves), 198 tiras con alfa 0/255 y <= 8 colores, pool acotado, red, casillas reales, **mecanica identica con y sin formas (29 de 29, 150 cuadros, mismo azar)**, caso 7 nuevo (las 13 registradas y reproducibles). Corrida completa antes del ajuste final de Segador; despues del ajuste se repitio con `ONLY=segador,oriel` |
| `node tools/vfx/verify-mechanics.js` (`ABILITY_BASE_URL`) | 21 campeones, 0 diferencias de mecanica, 0 errores de pagina (corrida antes del ajuste final de Segador) |
| `node tools/vfx/parity-skill-fx.js` (`BASE_URL`) | 22 campeones (mitad A), 0 difieren, 0 errores (corrida antes del ajuste final de Segador; no cubre a los 13) |
| `node tools/vfx/test-vfx-b.js` | PASS (corrida antes del ajuste final de Segador) |
| `node tools/bible/ability-gate.js --strict` | 43 campeones, nuevos que no pasan: 0, 0 errores de pagina. Los JSON generados NO se commitean (difieren de main por bichos de ambiente, igual que en el PR #132) |
| comprobacion manual en motor real | las 13 definitivas se reproducen una vez al lanzar (`UF.stats.played`), sin errores del motor de efectos (`KVB.err`) y sin particulas `ring/spin/crystal` en el Segador |

## Pendientes y lo que no cumple

- **Revision humana de arte**: formas miradas en capturas de 844x390, no en un telefono; falta la revision de arte/audio y las pruebas reales de multiplayer y de rendimiento en movil (`AGENTS.md` punto 7).
- **Distincion contra las 14 del otro agente**: se mide al juntar las ramas; pares a vigilar: Tibor/Ynara 0,65, Orsa/Baltra 0,61 y las parejas con Baltra, Maura y Khepri.
- **Aproximaciones de area**: Sira usa un pliego de 120 u minimo (la mecanica golpea la ruta real, que la forma no conoce: solo viajan x, y, r); Orsa usa 1,25 x el radio para alcanzar el alcance real del cono (280 u); la
  calavera del Segador mide 150 u de diametro a escala; los ecos de Oriel de la forma son cosmeticos (los reales siguen marcandose en la mecanica).
- **Duraciones largas**: las formas de 6 s corren a unos 6 cuadros por segundo (40 cuadros); con "Reducir efectos" se omite la capa de suelo.
- **Horneado**: Vhal y Ynara tardan 0,7 a 0,8 s en hornear todas sus tiras en frio (se hace en el tiempo ocioso al empezar la partida; si se lanzan antes se completa de una vez).
- Ninguna definitiva se bloqueo ni se quito.
