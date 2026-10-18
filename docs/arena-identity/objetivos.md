# Objetivos variados por arena

Motivo: casi todas las arenas de campaña mostraban `OBJETIVO: sobrevivir · 0:30`. Cada arena tiene ahora un
**verbo propio** con una regla real, un contador en el chip de objetivo y marcas en el mundo.
Código: `js/arenas/common/arena-objectives.js` (`OBJ_DEFS`). Prueba: `tools/identity/t_objectives.js`.
Capturas: `docs/arena-identity/objetivos/`.

| Arena | Verbo | Regla | Chip |
|---|---|---|---|
| Ruinas (`bosque`) | RECOGER | caminar sobre 3-5 semillas de luz repartidas por el piso | `recogé semillas de luz 1/3` |
| Acuática (`acuatica`) | ESCOLTAR | una tortuga sigue a quien juega hasta la meta; los enemigos pegados la desgastan | `escoltá a la tortuga guía · llegó 40% · salud 90%` |
| Gélida (`hielo`) | ENCENDER | quedarse 3,2 s dentro de 2-3 faros de escarcha (la barra baja si te vas) | `encendé faros de escarcha 1/2` |
| Laberinto (`laberinto`) | CAZAR | un enemigo común queda marcado (+40 % de vida); matarlo cumple | `cazá al centinela marcado ☠` |
| Infernal (`infernal`) | DEFENDER | un altar con integridad; cada enemigo pegado lo desgasta, quedarse cerca lo repara; se cumple al terminar el nivel en pie | `defendé el altar · integridad 80%` |
| Fortaleza (`fortaleza`) | APAGAR | igual que ENCENDER, 3,6 s en 2-3 generadores | `apagá generadores 0/2` |
| Abismo (`abismo`) | RECOGER | 3-5 esquirlas del vacío sobre plataformas firmes | `recogé esquirlas del vacío 0/3` |
| Reino Micelial (`micelial`) | CAZAR | como el Laberinto, con el portaesporas | `cazá al portaesporas marcado ☠` |
| Ciudad (`ciudad`) | (sin cambios) rescatar civiles y proteger la ciudad | | |
| Minas (`minas`) | (sin cambios) luces | | |

## Reglas comunes

- Niveles 1 a 9. El nivel 10 es del jefe (`¡derrotá al jefe!`). Un objetivo nuevo por nivel, con cartel al empezar.
- Es un **bonus**: cumplirlo cura al equipo el 20 % de su vida máxima. Fallarlo no castiga y el chip vuelve a
  `sobrevivir`. El nivel sigue cerrándose por tiempo, así que el avance de la campaña, los jefes, el desbloqueo
  de arenas y la economía no cambian. El único costo posible es el de CAZAR (+40 % de vida de un enemigo que ya
  iba a aparecer).
- Las marcas se colocan con la colisión real de la arena (`clampToArena` + `resolveWallCollision`), así que
  nunca quedan en una pared o fuera del mapa. Si no se encuentra lugar, el objetivo se omite (chip `sobrevivir`).
- Flechas en el borde de la pantalla señalan lo que falta cuando está fuera de cámara.
- Los bots no persiguen el objetivo; la criatura de la escolta sigue a quien juega, no a los bots.

## Cooperativo y salas (decisión)

El estado del objetivo vive solo en la partida local. Con una sala abierta (`netMatch != null`, anfitrión o invitado)
`objEnabled()` es falso: no hay objetivo propio y el chip dice `OBJETIVO: sobrevivir`, igual que antes.
Motivo: un objetivo compartido necesitaría estado sincronizado (posiciones, progreso, presa marcada) en el
snapshot de `js/net/*`, que esta tarea no toca. Para llevarlo a la sala hay que hacerlo host-autoritativo:
generar las marcas con una semilla por nivel, guardar `OBJ` en el `netState` y mandar la cura con un evento.
Queda como pendiente.

## Pendientes

- Ciudad y Minas ya tienen su mecánica pero su chip sigue diciendo `sobrevivir`; se puede mostrar allí su progreso (rescatados, luces).
- Arte propio de las marcas (hoy dibujadas con formas simples) y sonido propio.
- Sala cooperativa (ver arriba).
