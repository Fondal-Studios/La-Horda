# Definitivas con silueta propia, segunda tanda (mitad alfabética A: 14 campeones)

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
