# Reporte: ¿cada habilidad se distingue del autoataque al lanzarse?

Generado por `node tools/quality/cast-diff-report.js` (sin ONLY). **Es solo un reporte**: no bloquea nada, porque los efectos visuales se están rehaciendo en otros frentes; sirve para medir antes/después.

## Método

- Misma escena en el motor real para cada acción: 10 muñecos quietos agrupados a ~100 u, aliados detenidos, azar sembrado, pantalla 844x390.
- Se detiene el bucle de `requestAnimationFrame` y se avanza a mano (`update(16)` + `render()`); se lee el canvas del juego (sin HUD) a los 64, 192, 480 y 960 ms.
- **vs autoataque** = máximo, entre esos instantes, del % de píxeles que cambian (suma |dR|+|dG|+|dB| > 48) entre el frame de la habilidad y el del autoataque. **vs nada** = igual contra la escena sin hacer nada.
- Umbral: una habilidad **no se distingue** si su "vs autoataque" es menor que **max(1,5 %, ruido del campeón + 1 punto)** del frame (`--threshold=1.5`). Piso de ruido máximo medido (escena sin acción repetida): **1,4 %**.
- Limitaciones: mide cambio de imagen, no calidad ni lectura del efecto; habilidades con retardo largo o efecto fuera de los 960 ms pueden salir bajas; un efecto idéntico al del autoataque pero con otro daño tampoco se distingue (es lo que se quiere detectar).

## Campeones que hoy no se distinguen (24 de 43)

| Campeón | Habilidades bajo el umbral | Detalle (vs autoataque / vs nada) |
|---|---|---|
| segador | 3 de 4 | H1 Tajo del Segador: 1,4 % / 1,3 %<br>H2 Armadura de la Furia: 0,8 % / 0,8 %<br>H3 Último Aliento: 1,2 % / 1,2 % |
| brasa | 2 de 4 | H1 Centinela de Latón: 1,1 % / 1,9 %<br>H3 Desmontaje Rápido: 0,9 % / 1,9 % |
| cazadora | 2 de 4 | H1 Flecha Perforante: 1,2 % / 1,1 %<br>H2 Trampa del Bosque: 1,2 % / 1,0 % |
| eslabon | 2 de 4 | H1 Cadena de Retorno: 1,0 % / 1,0 %<br>H3 Custodia: 0,8 % / 0,5 % |
| farolero | 2 de 4 | H1 Farol de Guardia: 1,3 % / 1,3 %<br>H3 Paso Seguro: 1,2 % / 1,0 % |
| guerrero | 2 de 4 | H1 Corte Sangrante: 1,1 % / 1,1 %<br>H3 Trampa de Área: 0,9 % / 0,9 % |
| ilkan | 2 de 4 | H2 Piel de Duna: 0,7 % / 0,6 %<br>H3 Grito de Caravana: 0,8 % / 0,8 % |
| iria | 2 de 4 | H1 Ancla: 1,0 % / 0,6 %<br>H2 Tensión: 1,3 % / 1,2 % |
| profeta | 2 de 4 | H1 Destino Restaurado: 1,0 % / 1,0 %<br>H3 Danza del Augurio: 1,4 % / 1,3 % |
| tanque | 2 de 4 | H1 Torbellino: 1,5 % / 2,5 %<br>H3 Grito de Guerra: 1,5 % / 2,5 % |
| baltra | 1 de 4 | H2 Bajo la campana: 1,0 % / 1,0 % |
| brakk | 1 de 4 | H2 Torreta de clavos: 1,0 % / 1,0 % |
| khepri | 1 de 4 | H2 Caparazón Vivo: 1,0 % / 1,0 % |
| mago | 1 de 4 | H3 Cadena de Relámpago: 1,4 % / 1,3 % |
| maura | 1 de 4 | H2 Corteza prestada: 1,3 % / 1,2 % |
| morveth | 1 de 4 | H1 Huerto maldito: 1,5 % / 1,2 % |
| morwen | 1 de 4 | H3 Destilación: 0,9 % / 0,5 % |
| myla | 1 de 4 | H1 Torre de Yogur: 1,2 % / 0,7 % |
| orsa | 1 de 4 | H2 Apoyar la culata: 1,3 % / 0,9 % |
| saelis | 1 de 4 | H3 Llamado del Plumaje: 1,3 % / 0,9 % |
| sira | 1 de 4 | H3 Borrar el camino: 1,2 % / 1,1 % |
| soporte | 1 de 4 | H2 Bendición de Guerra: 1,4 % / 1,4 % |
| tibor | 1 de 4 | H2 Volvé a casa: 1,2 % / 0,9 % |
| veyra | 1 de 4 | H3 Pacto de dolor: 1,1 % / 0,9 % |

## Tabla completa (% de píxeles distintos vs autoataque)

| Campeón | Habilidad 1 | Habilidad 2 | Habilidad 3 | Definitiva | Autoataque vs nada |
|---|---|---|---|---|---|
| tanque | 1,5 ⚠ | 55,8 | 1,5 ⚠ | 75,2 | 1,7 |
| guerrero | 1,1 ⚠ | 1,8 | 0,9 ⚠ | 41,8 | 0,4 |
| mago | 2,4 | 2,7 | 1,4 ⚠ | 96,7 | 0,4 |
| soporte | 2,2 | 1,4 ⚠ | 1,7 | 71,6 | 0,4 |
| segador | 1,4 ⚠ | 0,8 ⚠ | 1,2 ⚠ | 17,4 | 0,6 |
| axiom | 2,0 | 1,6 | 51,8 | 79,8 | 0,5 |
| profeta | 1,0 ⚠ | 2,3 | 1,4 ⚠ | 75,5 | 0,6 |
| musashi | 43,1 | 43,0 | 2,1 | 68,0 | 0,5 |
| cazadora | 1,2 ⚠ | 1,2 ⚠ | 2,4 | 68,6 | 0,5 |
| nigromante | 2,1 | 2,3 | 6,1 | 55,0 | 0,5 |
| libertador | 24,3 | 3,6 | 63,5 | 99,7 | 0,5 |
| ilkan | 60,4 | 0,7 ⚠ | 0,8 ⚠ | 99,5 | 0,5 |
| ynara | 2,5 | 2,6 | 53,2 | 96,0 | 0,3 |
| myla | 1,2 ⚠ | 34,1 | 32,5 | 32,5 | 0,6 |
| brasa | 1,1 ⚠ | 2,7 | 0,9 ⚠ | 70,9 | 1,7 |
| eslabon | 1,0 ⚠ | 1,7 | 0,8 ⚠ | 85,7 | 0,5 |
| morwen | 1,9 | 2,5 | 0,9 ⚠ | 72,8 | 0,5 |
| farolero | 1,3 ⚠ | 2,6 | 1,2 ⚠ | 85,6 | 0,6 |
| iria | 1,0 ⚠ | 1,3 ⚠ | 1,8 | 92,6 | 0,5 |
| vesper | 2,6 | 52,5 | 2,5 | 5,1 | 0,5 |
| nahir | 2,7 | 51,1 | 2,0 | 96,9 | 0,5 |
| baltra | 3,0 | 1,0 ⚠ | 2,6 | 18,2 | 0,5 |
| maura | 2,2 | 1,3 ⚠ | 1,7 | 3,2 | 0,5 |
| dariel | 2,3 | 2,1 | 2,0 | 10,2 | 0,4 |
| orsa | 2,1 | 1,3 ⚠ | 2,7 | 6,1 | 0,4 |
| tibor | 2,3 | 1,2 ⚠ | 2,0 | 6,6 | 0,4 |
| zahra | 2,4 | 3,3 | 52,5 | 5,5 | 0,5 |
| renko | 2,2 | 1,7 | 2,1 | 5,1 | 0,6 |
| sira | 2,1 | 52,7 | 1,2 ⚠ | 23,5 | 0,4 |
| nano_gm | 2,3 | 5,8 | 52,0 | 82,6 | 0,4 |
| facu_gm | 3,5 | 3,2 | 59,6 | 83,7 | 0,5 |
| aurelia | 1,7 | 2,0 | 51,9 | 89,3 | 0,4 |
| khepri | 1,6 | 1,0 ⚠ | 55,6 | 43,5 | 0,5 |
| velmira | 2,1 | 2,8 | 54,4 | 86,1 | 0,5 |
| vhal | 2,1 | 3,6 | 57,5 | 90,6 | 0,5 |
| bront | 2,2 | 1,9 | 3,2 | 89,6 | 0,6 |
| oriel | 52,3 | 2,1 | 51,8 | 85,7 | 0,5 |
| saelis | 2,7 | 4,0 | 1,3 ⚠ | 92,7 | 0,5 |
| solciju | 1,7 | 1,6 | 1,7 | 2,8 | 0,5 |
| veyra | 1,8 | 54,7 | 1,1 ⚠ | 96,9 | 0,5 |
| brakk | 2,0 | 1,0 ⚠ | 1,9 | 97,2 | 0,6 |
| morveth | 1,5 ⚠ | 2,4 | 2,0 | 3,8 | 0,4 |
| aelith | 2,1 | 2,1 | 2,1 | 54,7 | 0,5 |

_Nota (medidos tras recargar la página porque el kit anterior dejó la escena congelada, estado global que no se limpia entre partidas): brasa._
