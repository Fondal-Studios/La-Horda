# Definitivas con silueta propia, segunda tanda (13 de las 27 que seguian como anillo)

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
