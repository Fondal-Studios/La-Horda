# Las 36 poses del atlas de campeón y cómo se hace el movimiento dinámico

Fuente del formato: `docs/art-brief/00_ESPECIFICACION_TECNICA.md` §2.1 (verificado en el código). Este documento lo traduce a instrucciones de dibujo. Los prompts listos para cada campeón están en `campeones/<id>.md`.

## 1. El atlas

- PNG RGBA `448 × 1008` = **4 columnas × 9 filas de 112 px**, sin separación. (Algunos atlas del juego tienen otra celda, p. ej. `nano_gm` 192×128 con 8 columnas, o filas extra: la medida manda la línea `champPackLoadAtlas` del atlas; `tools/art/pose-ref.py` la lee.)
- Cada celda = **una pose = una sola silueta conectada**. Pies en la fila **106**. Perfil mirando a la **derecha** (la izquierda la genera el juego espejando: no se dibuja).
- Altura del cuerpo en reposo (cuadro 0): **62–72 px**. Alfa 0/255, contorno 1 px oscuro, 4–6 colores base.

| Fila | Cuadros | Estado | Para qué lo usa el motor |
|---|---|---|---|
| 1 | 0–3 | Caminar de **frente** (abajo) | `walk_down`; el reposo de frente es el cuadro 0 |
| 2 | 4–7 | Caminar de **perfil derecha** | `walk_side`; reposo de perfil = cuadro 4 |
| 3 | 8–11 | Caminar de **espaldas** (arriba) | `walk_up`; reposo de espaldas = cuadro 8 |
| 4 | 12–15 | Ataque básico de frente | `attack_down`; golpe recibido = cuadro 12 |
| 5 | 16–19 | Ataque básico de perfil | `attack_side`; golpe recibido = cuadro 16 |
| 6 | 20–23 | Ataque básico de espaldas | `attack_up`; golpe recibido = cuadro 20 |
| 7 | 24–27 | **Lanzar habilidad** (de frente, sirve para las 3 direcciones y las 3 habilidades) | `cast_*` |
| 8 | 28–31 | **Definitiva** (de frente) | `ultimate_*` |
| 9 | 32–35 | **Muerte** (termina tendido) | `death_*` |

## 2. Tiempos reales del motor (para dibujar el ritmo correcto)

| Estado | Reproducción |
|---|---|
| Caminar | un cuadro cada 130 ms (≈ 7,7 cuadros/s); el ciclo de 4 cuadros dura 520 ms |
| Reposo | un solo cuadro (no respira: la quietud tiene que verse bien en 1 cuadro) |
| Ataque / lanzar | el progreso real del ataque se reparte entre los 4 cuadros; lanzar ≈ 420 ms (≈ 105 ms por cuadro) |
| Definitiva | ≈ 650 ms (≈ 160 ms por cuadro) |
| Golpe recibido | 1 cuadro durante 160 ms |
| Muerte | 170 ms por cuadro; después queda el último cuadro tendido (alfa 0,55) |

## 3. Cómo se logra movimiento dinámico con 4 cuadros

Cada animación es un ciclo corto: **cada cuadro tiene un trabajo distinto** y la diferencia entre cuadros contiguos tiene que verse en 130 ms.

**Caminar (4 cuadros, bucle)**
1. *Contacto*: un pie apoyado adelante, cuerpo en su punto más bajo, brazos opuestos a las piernas.
2. *Paso*: la pierna de atrás pasa al frente, cuerpo en su punto MÁS ALTO (rebote de 1–2 px), ropa y pelo suben un poco.
3. *Contacto del otro lado*: espejo del 1 con piernas y brazos cambiados.
4. *Paso del otro lado*: cuerpo alto; el cuadro 4 debe empalmar con el 1 sin salto.
Reglas: la cabeza sube y baja 1–2 px, nunca más; pies siempre en la fila 106 en el contacto; el arma o el escudo se desplazan en dirección contraria al paso (inercia). Un caminar con 4 cuadros casi iguales («cuadros repetidos») es un defecto registrado: se rehace.

**Ataque básico (4 cuadros, una vez)**
1. *Anticipación*: el arma o brazo se echa atrás, el cuerpo se agacha, el peso va atrás (la anticipación hace que el golpe se sienta).
2. *Golpe*: extensión MÁXIMA hacia el objetivo, cuerpo estirado, pie delantero adelantado. Este es el cuadro que coincide con el daño.
3. *Seguimiento*: el cuerpo sigue la inercia, el arma ya pasó, la ropa arrastra.
4. *Recuperación*: vuelve a guardia con el arma recogida.
Reglas: el golpe de frente y de espaldas se dibuja hacia/desde la cámara (acortamiento de la pose: el arma se ve más corta o más larga en pantalla); el de perfil usa toda la extensión horizontal.

**Lanzar habilidad (4 cuadros, de frente)**: reunir (energía contenida, SIN dibujar el efecto) → alzar (el cuerpo se estira) → liberar (la pose más abierta del atlas hasta aquí) → recuperar. El efecto lo pone el motor aparte; no se pinta pegado al cuerpo.

**Definitiva (4 cuadros)**: carga (postura baja, ropa y pelo ya reaccionan) → estallido (se levanta de golpe) → pico (la pose más grande y heroica de todo el atlas) → liberación (cae a guardia). Tiene que sentirse MÁS grande que el lanzar normal.

**Golpe recibido (1 cuadro)**: se echa hacia atrás, un ojo cerrado, arma baja. Se lee a 160 ms: la silueta debe cambiar claramente respecto del reposo.

**Muerte (4 cuadros)**: impacto (cabeza atrás, suelta el arma) → tambaleo (rodillas flojas) → caída (de costado, pies despegados) → tendido (cuerpo en el suelo; su borde inferior apoya en la fila 106 de la celda). El último cuadro se queda en pantalla: tiene que verse digno y legible.

## 4. Principios que valen en cualquier pose

1. **Silueta primero**: si en negro la pose no se entiende, no sirve.
2. **Un arco por movimiento**: brazos, armas y cabeza siguen curvas, no rectas.
3. **Inercia (superposición)**: ropa, pelo, capas y armas llegan UN cuadro tarde a cada cambio.
4. **Exageración mínima**: en 65 px de alto, 2 px de desplazamiento ya se ven; 6 px es un salto.
5. **Peso**: tanques = anticipación larga y cuerpo bajo; asesinos = cuerpo cargado hacia adelante; magos = gestos amplios y pies firmes; soportes = pose abierta y estable.
6. **Consistencia**: misma altura de cabeza, mismo ancho de hombros, mismo largo de arma en los 36 cuadros (tolerancia del juego: ±4 % de altura y ±2 px de pies).
7. **Nada flota**: toda pieza (espada, escudo, bufanda) tiene que tocar el cuerpo en el mismo cuadro (el importador cuenta siluetas y rechaza fragmentos).

## 5. Errores que ya costaron créditos (no repetir)

| Error | Ejemplo registrado | Qué hacer |
|---|---|---|
| Pedir espaldas y recibir frente | Profeta `pf_up` | Pedir «seen from behind, back to the camera, no face visible» y usar como `@pose` un cuadro de espaldas |
| Vista isométrica en vez de 3/4 | `casa_b` | Repetir «oblique top-down three-quarter view like the reference» y referenciar un asset ya aceptado |
| `BAD_OUTPUT` (cobrado) | Myla `d3` | Cambiar el planteo (otra `@pose` o prompt más simple); no reintentar igual |
| Diseño que se desvía del Códice | varios | Reforzar «keep the @codex design and palette exactly»; reducir el prompt a lo esencial |
| Silueta partida (pieza flotante) | 14 atlas con `siluetas_partidas` | Pedir «ONE connected silhouette», revisar a tamaño real |
| Cuadros repetidos en el ciclo | 6 atlas con `cuadros_repetidos` | Pedir cada cuadro con su `beat` distinto (ver `campeones/<id>.md`) |
