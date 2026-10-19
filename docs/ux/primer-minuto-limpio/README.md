# Primer minuto limpio: de JUGAR a la arena

Capturas 844x390 táctil, perfil vacío, toques reales (Playwright). `antes_*` = `origin/main` previo a este cambio; `despues_*` = esta rama.
Cada nombre lleva el orden del paso (`NN_`). `skip` = el jugador saltó la práctica; `done` = la completó (marcas que deja `alphaTrainingRestore`).

Toques desde JUGAR hasta mover el joystick (`node tools/ux/test-first-minute-taps.js`, mismo script contra ambos árboles):

| Perfil | Antes | Después |
|---|---|---|
| Práctica saltada | 9 (Sala, Comenzar, 6 páginas, A LA BATALLA) | 2 (JUGAR, A LA BATALLA) |
| Práctica completada | 7 (Sala, Comenzar, prólogo x3, Acto I, ficha) | 2 |
| Sin práctica (nunca la hizo ni la saltó) | 9 | 9 (sin cambios a propósito) |

Lo que cambia para quien ya hizo o saltó la práctica:

- La ficha de la arena es la única pantalla previa. Prólogo, "tu misión" y "cómo se gana" quedan en Códice › El Libro (el prólogo se marca como pospuesto, `save.tut.prologueDeferred`, y el Libro lo cuenta entero).
- La misión SOBREVIVIR se enseña una vez (práctica, o la ficha si la saltó: marca `save.tut.goalMission`). El HUD pasa a `NIVEL n/10 · mm:ss` y el Hechicero no reenseña moverse/atacar/habilidad dentro de la arena.
- JUGAR en la primera partida en solitario va directo a la ficha (marca `save.tut.soloIntro`); desde la segunda abre la Sala. Crear sala, unirse por código y Partida rápida siguen pasando por la Sala.
- "Saltar ▸▸" está en todas las páginas, también en la ficha, desde el primer cuadro.
- Carteles con tilde: TU MISIÓN, PRÓLOGO, EL GUÍA (VT323 en lugar de Press Start 2P, que no trae ÁÉÍÓÚ).
- Derrota: solo se nombra lo que se perdió (nada de "0 de XP y 0 de oro").
