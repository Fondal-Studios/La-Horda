# Arenas: auditoría y primera tanda de mejora

Fecha: 29 de octubre de 2026. Base: `c0a025016e0315b93870f2f4c86abb846619d30e`.
Alcance: las diez arenas de campaña, su renderizado, objetos, eventos y carga de arte. Se iniciaron partidas locales en las diez, esperando los grupos de assets necesarios. No equivale a completar diez campañas ni a certificar rendimiento en un iPhone físico. Divina, Coliseo y Guerra de Cristales quedan fuera de esta tanda.

## Conclusiones

Las arenas ya tienen mecánicas propias; el siguiente trabajo debe darles cuerpos, materiales y animaciones que las hagan reconocibles. No hay que reconstruir esos sistemas. Hay dos familias de render: cinco arenas clásicas comparten escenario octogonal y arte procedural (`ARENA_EXT`); Ciudad, Fábrica, Fúngico, Abismo y Minas tienen escenario propio (`ARENA_DEFS`). Sustituir únicamente `arena-props.js` no mejora las diez.

La calidad actual es desigual dentro de una misma partida: árboles del paquete `battlefield`, menhires hechos con pocos rectángulos y efectos de resolución diferente. Las copas y rocas deben respetar la escala de los guardianes; el decorado no debe ocultar las señales de peligro. Los elementos de evento necesitan distinguir reposo, aviso, actividad y recuperación, además de conservar el texto, los límites y la interacción existentes.

Hallazgos concretos:

- Gélida: el brasero interactivo reutilizaba un cuerpo de 18×26 píxeles y llamas elípticas; las estatuas, el arco y los cristales eran dibujos procedurales muy básicos. Código: `hie-cold.js`, `arena-props.js`.
- Bosque: la maleza de las emboscadas se dibujaba con rectángulos; los estados de las runas eran principalmente glifos superpuestos. La ficha `arena-blueprints.js` describía la versión antigua de las runas como poderes activables, en contradicción con `bos-ruins.js`.
- El arco oriental del Bosque tenía sus dos colisiones escritas dentro de un comentario. Se restituyen las patas sólidas y se conserva el paso central.
- El filtro de luces secundarias estaba invertido: se ocultaban con carga baja y se conservaban con carga alta. Se corrige el condicional.
- Las capturas deben esperar la carga real: una imagen tomada inmediatamente después de `startRun()` puede mostrar dibujos de reserva y fondos ausentes, dando un diagnóstico visual falso. El arnés nuevo espera los assets también después de crear el equipo.

## Prioridad y plan por arena

| Arena | Evento/mecánica ya existente | Próxima mejora de arte y lectura |
|---|---|---|
| Ciudad Maldita | Rescate, refugios y estructuras atacadas | Fachadas y tejados por estados; incendios localizados, cascotes y derrumbe anticipado. Identificar mejor edificio atacado y ruta de escolta. |
| Fábrica Sin Fin | Ciclo de trampas, puentes y sectores | Sprites articulados para prensas y engranajes; vapor con preparación, descarga y disipación; puentes con movimiento y bloqueo coherentes. |
| Ruinas Élficas | Runas que se corrompen, contención y emboscadas | Árboles con identidad, roca estratificada y musgo; menhires por estado; maleza animada. Después: troncos, ruinas, suelo y follaje que cede visualmente ante los héroes. |
| Reino Fúngico | Germinación, colonia, núcleos y esporas | Conservar los fondos y assets propios existentes. Unificar tamaño/grano de hongos y mostrar crecimiento, floración y marchitez con secuencias propias. |
| Gélida | Frío, braseros con combustible y Gran Helada | Hielo facetado, carámbanos, árboles y estatuas congeladas; braseros encendido/bajo/apagado/reencendido. Después: suelo de nieve, grietas, ventisca y transición de deshielo. |
| Acuática | Corrientes y charcos conductores | Corales, algas y ruinas con volumen; dirección de corriente visible; avisos diferentes para corriente y descarga eléctrica. |
| Laberinto | Muros, sellos y derrumbes | Piedra erosionada y antorchas animadas; sellos por estado; polvo y desprendimientos antes del impacto. Mantener abiertas las entradas. |
| Abismo | Plataformas que se agrietan, colapsan y se reconstruyen | Conservar la geometría propia; representar cuatro estados de deterioro, fragmentos y bordes seguros sin ocultar el rescate. |
| Minas Profundas | Luces que se consumen, apagones y reencendido | Conservar rocas, objetos y texturas ya existentes; mejorar lectura de vetas y focos. Lámparas con carga alta/baja/apagada, chispas y recuperación visibles. |
| Infernal | Fisuras que abren portales y pueden cerrarse | Bocas de portal con abertura, actividad, sobrecarga y sellado; roca volcánica y braseros; erupciones anticipadas con radio claro. |

Cada encargo debe especificar estados, duración, punto de apoyo, escala, colisión, orden de profundidad, consumo de memoria y estado compartido por el anfitrión. Evitar sumar peligros o recompensas sin una decisión jugable propia y sin revisar su balance.

## Primera tanda implementada en la rama

32 cuadros en dos atlas de 512×512:

- Gélida: ocho objetos de entorno (pilar, agujas, roca, cristal, árbol, pino, estatua y portal macizo congelado); cuatro cuadros de fuego; apagado, brasa baja y dos etapas de encendido.
- Bosque: tres árboles y una roca; ocho representaciones de runas y sus pulsos; cuatro cuadros de maleza.
- El juego selecciona las imágenes según los estados existentes de `HIE` y `BOS`; no añade daño, botín, temporizadores de eventos ni mensajes de red. El combustible bajo también tiene una barra breve para no depender sólo del color.
- Se carga sólo el atlas del bioma usado y se mantiene el render anterior si no se puede decodificar. Las copas altas se atenúan ante un héroe situado detrás. Se conservan proporciones y puntos de apoyo.
- Fuentes y prompts: `art-source/arenas/world-20261029/`. Exportador reproducible: `tools/art/pack-arena-world.py`. Integración: `js/rendering/arena-world-art.js`.

## Validación y estado de entrega

**Estado: borrador funcional, pendiente de aprobación del estilo. No mergear este lote visual como producción todavía.**

La primera generación fue demasiado pictórica. Se hicieron dos redibujos con la herramienta de imágenes y se exportaron a resolución nativa por vecino más cercano, sin filtros de paleta ni suavizado. El escáner técnico no marca halos, alfa parcial ni fragmentos en los dos atlas finales. Aun así, el detector informativo de estilo del repositorio marca `ILUSTRACION` en 26/32 cuadros por transiciones suaves. Esto no se oculta ni se transforma en un PASS: requiere otra revisión de paleta y agrupación de píxeles frente a las referencias del Códice. Los PNG fuente se conservan para continuar sin perder identidad.

Evidencia en [`art-gate/arena-world-20261029/`](art-gate/arena-world-20261029/):

- `audit.json`: diez partidas iniciadas con sus grupos de assets cargados, sin excepciones JavaScript.
- `runtime-tests.json`: carga por bioma, 32 cuadros no vacíos, animaciones distintas, ausencia de mutación del estado por dibujar, ida y vuelta de estado anfitrión/invitado, arco con patas sólidas y centro libre, y reserva ante error de carga. La prueba de estado no reemplaza una sesión de red real.
- `geometry-tests.txt`: exploración y geometría de Bosque/Gélida con el validador existente.
- `density.json`: resultados completos del detector, incluidas las señales pendientes.
- `before-*`, `after-*`, `events-*`, `mobile-*`, `sprites-*`: capturas y comparación a escala. El antes/después de las dos arenas nuevas usa la misma escena ya cargada y deshabilita solamente el render nuevo para la captura anterior.

Reproducción (Playwright/Chromium y Pillow/NumPy/SciPy):

```sh
python3 tools/art/pack-arena-world.py
python3 tools/art/scan_sprites.py --dir arenas/world-v1
node tools/art/test-arena-world.js
node tools/art/audit-arena-world.js
node tools/art/check-arena-world-density.js
ARENAS=hielo,bosque node tools/bible/arena-validator.js --strict
python3 tools/art/compress-arena-evidence.py
```

Siguiente cierre: ajustar el estilo de los cuadros señalados, revisar movimiento/contorno en bucle y repetir capturas. Después continuar con antorchas y sellos del Laberinto, corrientes de Acuática y portales de Infernal; finalmente los paquetes específicos de las otras cinco arenas.
