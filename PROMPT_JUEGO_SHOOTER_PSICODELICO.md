# Prompt maestro: shooter survival psicodélico en 3D

> Copiá todo lo que está debajo de la línea y pegalo como primer mensaje en una sesión nueva (entorno recomendado: el más completo, "Entornonfull").

---

## Rol y libertad creativa

Sos el director técnico y creativo de un estudio de juegos. Tenés **total libertad creativa y técnica** para decidir el motor, las herramientas, la arquitectura y la estética, y para **contratar (lanzar) los subagentes que necesites**: diseño de juego, arte 3D, shaders/VFX, audio, IA de enemigos, networking, QA, performance. Decidí vos, justificá cada decisión importante en un documento corto y avanzá sin pedirme permiso por cada detalle. Solo frená y preguntame ante acciones irreversibles o externas (crear el repositorio público, publicar, gastar dinero).

## El juego

**Género:** shooter en primera persona de supervivencia por hordas, en 3D completo.
**Inspiración de la jugabilidad:** *Serious Sam* y *Halo* (combate rápido, arenas abiertas, armas muy distintas, oleadas masivas, movimiento ágil, escudo/salud con recarga). Si "Seven Cup" se refería a otro juego, elegí la referencia que mejor encaje con "sobrevivir a hordas enormes".
**Inspiración visual y conceptual:** el estilo surreal y cósmico de David OReilly (*Everything*, *Mountain*): formas simples y extrañas, escalas imposibles, belleza rara. Sumá psicodelia: colores saturados, fractales, caleidoscopios, distorsión de la realidad.
**Regla central:** la física y la gravedad se rompen y esa rotura es **mecánica de juego**, no solo decoración (gravedad que cambia de dirección, zonas sin gravedad, plataformas que flotan, caminar por paredes y techos, escalas que cambian, tiempo que se dilata).
**Historia:** el jugador queda atrapado entre dimensiones y debe sobrevivir a oleadas de criaturas extrañas. Escribí un guion breve con premisa, protagonista, antagonista y final, contado con ambiente y texto mínimo.

## Monstruos

Bestiario **psicodélico y extraño**, todo modelado en 3D. Mínimo 8 tipos, cada uno con un rol distinto (corredor, tanque, volador, a distancia, invocador, emboscador, jefe de mapa, etc.).
Pedido original del usuario: "monstruos los cristianos" — interpretalo como **criaturas cristalinas/de cristal** (cuerpos de prismas, vidrio, luz refractada). Si ves una lectura mejor, documentala. Evitá usar símbolos religiosos reales de forma ofensiva.
Cada monstruo necesita: modelo, animaciones, comportamiento (IA), sonido, debilidad o patrón legible, y pruebas.

## Mapas (por ahora, solo dos)

1. **Mapa 1 — Perdido en el espacio / otra dimensión:** islas flotantes, vacío estrellado, gravedad rota, portales, cielos imposibles. Es el mapa de mayor libertad física.
2. **Mapa 2 — Lo decidís vos**, con una identidad claramente distinta al primero (por ejemplo, un mundo orgánico/fractal o un laberinto cristalino). Justificá la elección.

Cada mapa tiene: arte propio, música, oleadas progresivas, un jefe, y al menos una mecánica de física rota exclusiva.

## Modos y multijugador

- **Un jugador completo y divertido** como prioridad.
- **Diseñado desde el día uno para multijugador cooperativo** (2 a 4 jugadores): arquitectura con servidor autoritativo, estado sincronizable, nada de lógica de juego atada a un solo cliente. En esta fase alcanza con que el diseño lo permita y haya un prototipo cooperativo mínimo en red local; documentá lo que falte.

## Motor y tecnología

Elegí el motor que mejor cumpla el objetivo y justificá la elección en `docs/DECISIONES.md`. Criterios: calidad 3D, shaders psicodélicos, networking, y que pueda ejecutarse y probarse en este entorno en la nube. Si un motor pesado (Unity, Unreal, Godot) no se puede compilar o probar acá, preferí una opción que sí (por ejemplo, web con Three.js o Babylon.js, o Godot en modo headless) y explicá por qué.

## Repositorio

Creá un **repositorio nuevo y propio para este juego** (nombre a tu criterio; pedime confirmación antes de crearlo si hace falta permiso). No mezcles el código con el repositorio `la-horda`. Incluí:
- `README.md` con cómo instalar, ejecutar y jugar.
- `docs/` con diseño del juego, historia, bestiario, mapas, decisiones técnicas y guía de arte/audio.
- Estructura clara de carpetas, licencias de assets documentadas y CI que ejecute las pruebas.

## Calidad: el trabajo no está terminado hasta que pase estas pruebas

1. **Pruebas automáticas** de lógica: armas, daño, vida, oleadas, IA de cada monstruo, física alterada, límites de entidades y limpieza de memoria.
2. **Pruebas de gameplay**: partidas simuladas (bots) de cada mapa de principio a fin, sin bloqueos ni caídas, con dificultad progresiva y jefe derrotable.
3. **Prueba de rendimiento**: medí FPS y memoria con la horda máxima y reportá los números reales.
4. **Prueba cooperativa**: al menos dos clientes simulados en la misma partida sin desincronización grave.
5. **Revisión visual**: capturas de pantalla reales de cada mapa y de cada monstruo (podés usar el Chromium con Playwright preinstalado). Mirá las imágenes y corregí lo que se vea mal.
6. **Informe honesto**: qué pasó, qué falló, qué quedó sin probar. No declares nada "terminado" ni "balanceado" sin evidencia.

## Forma de trabajo

1. Primero escribí un plan corto (visión, motor, hitos) y mostrámelo.
2. Dividí en hitos: prototipo jugable de movimiento y disparo → Mapa 1 con 3 monstruos → bestiario completo → Mapa 2 → cooperativo → pulido.
3. Hacé commits chicos y frecuentes. Pusheá a una rama, no a `main`, y no abras PR hasta que yo lo pida.
4. Al final de cada hito dame un resumen en lenguaje simple (no técnico) con cómo probarlo yo mismo, idealmente un link o comando para jugar.
5. Si algo es ambiguo, elegí la opción más ambiciosa y coherente, y anotala como decisión.

## Entrega mínima de esta primera fase

Un juego **jugable en solitario** con los **dos mapas**, el **bestiario completo**, el **jefe de cada mapa**, la historia, y **arquitectura lista para multijugador** con prototipo cooperativo, todo con pruebas pasando y un informe de calidad.
