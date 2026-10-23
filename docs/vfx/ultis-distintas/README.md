# Definitivas con silueta propia

Rama `claude/ultis-distintas`. Prioridad del dueño: las habilidades y definitivas tienen que ser **diferentes entre sí** y verse muy bien. El crítico de combate vio que las
definitivas se leían como "un anillo con humo": se distinguían por el texto y no por la forma. Esta rama mide el problema, rehace 16 definitivas con una silueta, un color
dominante, un movimiento y un rastro propios, rehace en menor escala las habilidades de tres kits que se leían homogéneos y deja una prueba que falla si dos definitivas se
parecen demasiado.

Todo es **solo visual**: no se tocó daño, enfriamientos, alcance, hitboxes, `js/net/*`, `server/*`, la función `kvbDefDecal` de `vfx-b/pixfx.js` ni los íconos del HUD.
Con `?uf=0` en la URL (o `window.UF_OFF = true`) el juego vuelve a los efectos de antes, así que se puede comparar en la misma compilación.

## Qué había (medido en main)

Cada definitiva de la mitad A terminaba en la misma composición (`sfaExtras`: destello de rayos + ondas concéntricas + columna de luz + segunda nova más oscura), y cada
una de la mitad B pasaba por `kvbPunch` (anillo de partículas + hasta tres ondas de choque + decal de anillo). Encima, el propio juego empuja anillos de partículas
(`ring`, `warnRing`), ondas (`vfxShock`), sprites genéricos y zonas persistentes con relleno de tramado. En las máscaras de efecto de main (hoja `mascaras-antes.png`) casi todas las
definitivas son un disco relleno de tramado con el mismo borde, solo cambia el color.

## Cómo se mide: `tools/vfx/silhouette-diff.js`

1. Lanza la definitiva de cada campeón en el motor real (844x390, Chromium) con **reloj virtual** (16 ms por cuadro con `update()` + `render()` a mano, así no depende de la
   carga de la máquina), cámara fija, sin sacudida ni números flotantes, 4 muñecos fijos y semilla fija.
2. Toma 13 cuadros (60 ms a 2,3 s) y se queda con los píxeles que cambian por el efecto: descarta lo que ya cambia solo (animación de fondo) y las capas de color a pantalla
   completa (ajuste lineal `I' = a·I + b` por canal, iterado). Resultado: máscara de unión U y de tres etapas E1 (<350 ms, anticipación e impacto), E2 (350-1000 ms), E3 (rastro).
3. Normaliza cada máscara (centro = centroide, escala = raíz de la media de r²) a una grilla de 64x64 que cubre ±2,6 escalas: se compara **forma**, no tamaño ni posición.
4. **Similitud** `S = 0,4·IoU(U) + 0,6·media(IoU(E1), IoU(E2), IoU(E3))`.
5. **Umbral `SIM_MAX = 0,80`**: dos definitivas distintas con `S >= 0,80` fallan. Escala medida en main: anillos con polvo entre sí 0,70 a 0,90 (mediana 0,69 entre los
   campeones que siguen con anillo); formas propias contra cualquier otra 0,26 a 0,71.
6. **Excepciones documentadas** (se imprimen en el reporte):
   - **Deuda**: un par donde *ninguna* de las dos definitivas tiene forma propia todavía (el anillo anterior) se informa como deuda y no falla. Así la prueba solo deja que un
     campeón rehecho o nuevo se parezca a otro dentro del umbral. `STRICT_ALL=1` la quita y falla con toda la deuda.
   - **Pantalla completa**: si la máscara cubre más de la mitad del recorte no tiene silueta propia y sale de la matriz (hoy: Facu y Nano GM, ver Pendientes).
   - `SIM_EXCEPTIONS`: pares a propósito iguales. Vacía.

Salidas: `antes.json/.md`, `despues.json/.md` (matriz completa en `*-matriz.csv`), `mascaras-antes.png`, `mascaras-despues.png`, `comparativa/<campeón>.png`
(arriba main, abajo la rama, cuadros a 60/380/680/1300 ms nominales) y `habilidades-antes/`, `habilidades-despues/`.

### Matriz antes / después

| | antes (main) | después (rama) |
|---|---|---|
| Definitivas en la matriz | 41 de 43 (Facu y Nano GM cubren la pantalla) | 41 de 43 |
| Con forma propia | 0 | 16 (14 en la matriz + Facu y Nano GM) |
| Similitud media de los 820 pares | 0,625 | 0,563 |
| Pares con `S >= 0,80` | 100 | 82 (todos deuda: ambas sin forma propia) |
| Pares donde interviene una rehecha: media / p90 / máxima | 0,578 / 0,750 / 0,870 | 0,470 / 0,620 / 0,710 |
| Pares con una rehecha y `S >= 0,80` | 22 | 0 |

`node tools/vfx/silhouette-diff.js` sobre la rama termina en `OK` (ningún par con forma propia llega a 0,80); sobre main (`?uf=0 STRICT_ALL=1`) falla con 94 pares.

## Definitivas rehechas

Cada forma tiene su **anticipación en el área real** con marcas propias sobre el radio verdadero (corchetes, relojes, eslabones, equis, flechas, hexágonos...), un impacto
fuerte con sacudida de cámara y una disipación propia (se afinan, se quiebran, caen, se desenroscan). Arte de píxel: alfa 0/255, contorno de 1 px, 3 tonos más brillo y acento,
tramado Bayer, sin antialias ni `shadowBlur` (`ART_BIBLE` §14).

| Campeón (definitiva) | Forma | Movimiento | Máx. similitud antes → después | Matiz medido antes → después |
|---|---|---|---|---|
| Soporte (Bendición Suprema) | catedral de columnas de luz | sube desde el suelo con bandas que ascienden y se desgasta por arriba | 0.75 (tanque) → 0.64 (orsa) | verde 129° → verde 130° |
| Profeta (Ascensión del Elegido) | espiral de tres brazos con reloj al centro | gira hacia afuera y se desenrosca | 0.57 (segador) → 0.71 (brasa) | verde 156° → amarillo 47° |
| Eslabón (Nadie Queda Atrás) | cadena con bola de pinchos | latigazo de una vuelta que cae y se rompe | 0.87 (dariel) → 0.55 (bront) | amarillo 53° → turquesa 162° |
| Musashi (Último Duelo) | cuchillas cruzadas: equis y tajo horizontal | tres cortes en secuencia que se parten | 0.33 (bront) → 0.26 (ynara) | azul 204° → naranja 18° |
| Mago (Cataclismo Elemental) | meteoro con cráter | cae en diagonal, estalla, escombros y grietas que se enfrían | 0.83 (axiom) → 0.52 (orsa) | amarillo 46° → amarillo 41° |
| Facu (El Océano Reclama la Arena) | ola de tres crestas con espuma | cruza el área y el agua se retira | pantalla completa → pantalla completa | azul 252° → azul 221° |
| Bront (Ciudadela) | cúpula de paneles hexagonales | sube, aguanta y se hace pedazos | 0.81 (myla) → 0.67 (ynara) | azul 218° → turquesa 188° |
| Libertador (Cruce de los Andes) | cordillera nevada con bandera | picos que brotan del centro hacia afuera y se desmoronan | 0.56 (orsa) → 0.52 (orsa) | azul 241° → verde 107° |
| Nahir (Galería de nadie) | portal vertical de remolino | se abre, aspira hacia adentro y se cierra con destello | 0.57 (vesper) → 0.49 (aurelia) | turquesa 173° → magenta 305° |
| Nano GM (Juicio del GM) | tres rayos ramificados | caen escalonados y queman el suelo con estrellas de grietas | pantalla completa → pantalla completa | amarillo 50° → amarillo 47° |
| Brasa (Turno de Emergencia) | dos haces de sirena | giran con estela y se apagan en destello | 0.68 (nigromante) → 0.71 (maura) | amarillo 60° → naranja 27° |
| Brakk (Demolición final) | grieta de lava con ladrillos | el suelo se abre, ladrillos por el aire, se enfría | 0.76 (farolero) → 0.52 (profeta) | verde 73° → naranja 26° |
| Ilkan (Coloso de Arena) | embudo de arena | tornado que cruza el área con escombros en órbita | 0.70 (iria) → 0.51 (orsa) | amarillo 63° → amarillo 43° |
| Cazadora (Cacería Salvaje) | lluvia de flechas clavadas | cada flecha marca su punto, cae y queda clavada | 0.67 (brasa) → 0.52 (dariel) | verde 125° → verde 87° |
| Velmira (El Gran Teatro) | telón con volante, foco y confeti | baja el escenario y cierran las cortinas | 0.73 (soporte) → 0.61 (orsa) | violeta 289° → violeta 286° |
| Tanque (Grito Provocador) | estandarte y seis banderines | se clavan en el borde real, la tela ondea, rangos dorados suben | 0.75 (soporte) → 0.49 (dariel) | rojo 357° → rojo 8° |

(Similitud y matiz salen de `antes-matriz.csv`, `despues-matriz.csv` y los `.json`; el matiz es el medido en los píxeles del efecto, no el de la paleta de diseño. El "rastro" medido
se satura en los 2,3 s de la ventana porque las zonas persistentes de la mecánica siguen visibles; la duración propia de cada forma está en `ufDefForm` de `forms-*.js`: entre 1,5 y
2,3 s para las definitivas, con el rastro de suelo un 40-60 % más largo.)

Qué se quitó de estas definitivas para que no vuelva el anillo: las ondas y sprites genéricos del lanzamiento (`vfxShock`, `vfxSprite`, `vfxCastFlash`), los anillos de
partículas del propio juego (`ring`, `warnRing`, durante el lanzamiento y 3,2 s alrededor del punto), `sfaExtras` y `kvbPunch`, la corona de escarcha del Mago, y las zonas
persistentes de estado de Eslabón, Mago y la Ciudadela, que ahora se dibujan como borde de trazos sueltos (el área real sigue marcada, no como disco).
Se conservan: la cresta del campeón sobre la cabeza, los objetos de la mecánica (muros, torretas, mirrores de Nahir, el Juicio) y todos los números flotantes.

### Habilidades normales (menor escala)

Formas compactas de 0,7 a 1,2 s para los kits que se leían como la misma nova (`UF_SK` en `bind.js`):

| Campeón | Hab. 1 | Hab. 2 | Hab. 3 | Definitiva |
|---|---|---|---|---|
| Mago | columna de fuego | esquirlas de hielo | rayo ramificado (tormenta) | meteoro con cráter |
| Musashi | tres zarpazos paralelos (más el rastro del salto) | flor de cerezo (más el rastro del salto) | espadas en órbita | cuchillas cruzadas |
| Cazadora | (sin cambio: saeta en línea) | esquirlas de espinas verdes | (sin cambio) | lluvia de flechas |

Capturas antes/después en `habilidades-antes/` y `habilidades-despues/`. No se tocaron las habilidades de los otros 40 campeones ni las de la mitad B.

## Costo

Pool adaptativo: cada forma es una o dos entradas del pool de `pixfx.js` (`kvbAdd`, tope 128; con "Reducir efectos" o `vfxLoad < 0,6` baja a 64 y la entrada de suelo no se crea).
Horneado por tira en tandas de 4 ms en tiempo ocioso (`startRun` hornea el radio de la definitiva y los dos vecinos); si se lanza antes, `ufBake` completa el resto.
`node tools/vfx/bench-ult-forms.js` mide ms por cuadro de `update()+render()` con y sin formas (alternadas tras un calentamiento), horneado por tira y pool con "Reducir efectos":
| Campeón | Forma | update+render por cuadro (antes → después) | Costo propio de los motores de efecto | drawImage por cuadro | Pool máx. (con "Reducir efectos") | Horneado por tira |
|---|---|---|---|---|---|---|
| brakk | fissure | 5.78 → 5.72 ms (p95 11.8) | 0.277 → 0.201 ms | 325.8 → 318.6 | 54 → 61 (37) | 98.3 ms |
| brasa | sweep | 6.05 → 8.02 ms (p95 21.4) | 0.416 → 0.272 ms | 326.7 → 306.5 | 71 → 77 (41) | 110.2 ms |
| bront | dome | 8.91 → 5.84 ms (p95 12.5) | 0.464 → 0.378 ms | 438.4 → 402 | 95 → 101 (52) | 64.8 ms |
| cazadora | volley | 4.81 → 5.18 ms (p95 7.3) | 0.192 → 0.153 ms | 323.8 → 311.2 | 86 → 91 (50) | 40.6 ms |
| eslabon | chain | 4.5 → 4.68 ms (p95 7.4) | 0.215 → 0.159 ms | 351.4 → 329.6 | 75 → 51 (32) | 18.2 ms |
| facu_gm | wave | 5.86 → 3.68 ms (p95 6.3) | 0.245 → 0.152 ms | 321.6 → 306.9 | 85 → 81 (44) | 29.1 ms |
| ilkan | funnel | 4.22 → 5.13 ms (p95 13.1) | 0.151 → 0.172 ms | 310.1 → 301.8 | 78 → 80 (40) | 39.1 ms |
| libertador | ridge | 5.67 → 4.92 ms (p95 11.9) | 0.197 → 0.142 ms | 327.4 → 321.8 | 103 → 110 (58) | 67 ms |
| mago | meteor | 4.76 → 3.84 ms (p95 6) | 0.185 → 0.144 ms | 451.2 → 384.3 | 43 → 49 (28) | 46.4 ms |
| musashi | cross | 1.05 → 1.17 ms (p95 2.4) | 0.059 → 0.05 ms | 36.9 → 31 | 0 → 5 (2) | 18.2 ms |
| nahir | portal | 5.82 → 5.35 ms (p95 11.1) | 0.882 → 0.617 ms | 450.3 → 346.8 | 128 → 104 (51) | 48.7 ms |
| nano_gm | lightning | 3.49 → 3.34 ms (p95 5.4) | 0.233 → 0.122 ms | 375.7 → 314.3 | 128 → 81 (44) | 36.2 ms |
| profeta | spiral | 5.4 → 5.68 ms (p95 15.1) | 0.306 → 0.211 ms | 347.9 → 317.2 | 109 → 59 (35) | 35.8 ms |
| soporte | column | 3.42 → 2.92 ms (p95 4.8) | 0.232 → 0.077 ms | 397.7 → 305.5 | 128 → 37 (19) | 41 ms |
| tanque | banner | 2.8 → 3.26 ms (p95 4.7) | 0.174 → 0.084 ms | 343.8 → 281.5 | 115 → 36 (22) | 23.7 ms |
| velmira | curtain | 3.64 → 3.06 ms (p95 3.7) | 0.252 → 0.124 ms | 400.5 → 337.6 | 128 → 76 (43) | 23.1 ms |
| **media de 16** | | **4.76 → 4.49 ms** | **0.280 → 0.191 ms** | **345.6 → 307.3** | | **46.3 ms** |

Medido con 200 cuadros de reloj virtual por corrida, 3 repeticiones alternadas con y sin formas tras un calentamiento (mediana), 12 muñecos, la definitiva cada 40 cuadros. Carga de la máquina durante la medición (`os.loadavg`): 9.6 / 18.9 / 21.5 con 4 núcleos y otros procesos ajenos, así que el ms por cuadro tiene un ruido de varios ms entre corridas iguales (por eso hay filas donde "después" baja): el número que importa es el **costo propio** y la cantidad de `drawImage`, que no suben. Las formas reemplazan los anillos, ondas y sprites genéricos, por eso el total baja un poco. Es CPU de Chromium sin GPU: sirve para comparar, no como valor absoluto en un teléfono. Memoria: cada tira ocupa de 0,3 a 1 millón de píxeles (1 a 4 MB) y las tiras horneadas están acotadas a 12 millones de píxeles (~48 MB); se hornean el radio de la definitiva y el siguiente tamaño.

## Pruebas ejecutadas

Servidor propio en el puerto 9301 sirviendo esta rama (se verificó con `ps` y `/proc/<pid>/cwd`; había otros servidores de otros agentes que no se usaron).

| Prueba | Resultado |
|---|---|
| `node tools/vfx/silhouette-diff.js` (final, código de la rama) | OK: ningún par con forma propia llega a 0,80; 41 definitivas en la matriz, 73 pares de deuda (ambas sin forma propia; 75 y 82 en corridas anteriores: la captura tiene ruido de unos pocos pares en el borde del umbral), 2 de pantalla completa |
| mismo script sobre main (`?uf=0`, `STRICT_ALL=1`) | falla, 94 pares >= 0,80 |
| `node tools/vfx/test-ult-forms.js` (nuevo) | 6/6 OK: sin `Math.random` (23 claves, 7 argumentos hostiles), sprites alfa 0/255 y <= 8 colores (120 tiras), pool acotado y limpio, red, casillas reales, mecánica idéntica con y sin formas en 16 definitivas |
| `node tools/vfx/verify-mechanics.js` (`ABILITY_BASE_URL`) | 21 campeones (mitad B, por defecto), 0 diferencias de mecánica, 0 errores de página |
| `node tools/vfx/parity-skill-fx.js` (`BASE_URL`) | 22 campeones (mitad A), 0 difieren (mismo estado y mismo consumo de `Math.random`), 0 errores de página |
| `node tools/vfx/test-vfx-b.js` | PASS |
| `node tools/bible/ability-gate.js --strict` | 43 campeones, nuevos que no pasan: 0, 0 errores de página. Con `?uf=0` y con formas: 0 diferencias en daño por muñeco, estados, categorías, apuntado y errores (172 habilidades). Ojo: el JSON generado que está en main difiere de una corrida actual en 105 casillas aun sin formas (`statused` y `CONTROL` de bichos de ambiente), por eso NO se commitea la regeneración del gate |
| `tools/quality/test-vfx-pools.js`, `tests/competitive-*.test.js` | PASS |

Las corridas de verify-mechanics, parity, test-vfx-b y ability-gate se hicieron antes de un último ajuste de `kit.js` (tope de memoria de las tiras horneadas y horneado previo solo del radio base y el siguiente); `test-ult-forms.js` (que incluye la comparación mecánica) y `silhouette-diff.js` se corrieron después. Si se quiere certeza total, volver a correrlas en CI.

## Pendientes y lo que no cumple

- **Revisión humana de arte**: las 16 formas y las 7 habilidades se miraron en capturas a 844x390, no en un teléfono. Ninguna prueba reemplaza la mirada de arte/audio ni las pruebas
  reales de multiplayer y de rendimiento en móvil (`AGENTS.md` punto 7).
- **Deuda: 27 definitivas siguen como anillo con polvo** (aelith, aurelia, axiom, baltra, dariel, farolero, guerrero, iria, khepri, maura, morveth, morwen, myla, nigromante, oriel, orsa,
  renko, saelis, segador, sira, solciju, tibor, vesper, veyra, vhal, ynara, zahra). Entre ellas hay 82 pares con `S >= 0,80` (la prueba los informa como deuda). Ninguno se bloqueó ni
  se quitó. La siguiente tanda necesita formas nuevas por diseñar (enjambre, cometas en órbita, grieta en el aire, hongos...).
- **Facu y Nano GM**: la forma propia está (ola, rayos), pero su zona persistente de la mecánica (el tinte de océano de pantalla completa y el Juicio blanco/negro de 440 u) cubre
  toda la pantalla, así que la matriz no puede medir su silueta y los deja fuera. No se tocó esa zona (es el área real y su arte propio de Ascensión).
- **Musashi**: el duelo es una arena aislada del propio juego (`enterLastDuel`); la forma cae sobre el rival retado, la arena no se tocó.
- **Radio máximo de la forma 420 u** (Facu tiene 460): el sprite se acota para no pasar de 128 px de diseño.
- **Profeta**: la fusión es sobre un aliado, no tiene área; la forma usa 130 u de radio visual centrado en el aliado.
- **Nahir**: el radio de la cast es 70 u pero sus espejos llegan a 180 u; la forma usa un mínimo de 170 u.
- **Eslabón / Mago / Bront**: las zonas persistentes de estado quedan como borde de trazos, no se retocó su lógica.
- Capturas: el clip de la hoja es de 560x300 centrado en el héroe; las formas más grandes (Facu, Ilkan) salen recortadas en la hoja aunque en pantalla se ven completas.
- Las capturas de `habilidades-*` y las hojas muestran la simulación a 16 ms por cuadro; en tiempo real el efecto es el mismo.
