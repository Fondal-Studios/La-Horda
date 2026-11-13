# Auditoría del equipo de diseño: La Horda antes de Steam (2026-11-13)

Qué es: la lectura de un equipo de diseño que está por lanzar un ARPG 2D retro en Steam. Se basa en lo que documenta el repositorio (economía en `docs/economy/PRECIOS.md`, estado en `docs/beta-release/STATUS.md`, arte en `docs/art-brief/`) y en prácticas habituales del mercado. **No hay datos de jugadores reales todavía**: lo que sigue son hipótesis a validar con la beta, no hechos medidos.

## A. Correcciones antes de lanzar (orden de prioridad)

1. **Primeros 10 minutos.** Un jugador nuevo en Steam decide en minutos. Hay que medir (con alguien que no conozca el juego, grabado) cuánto tarda en: elegir campeón, entender qué hace cada habilidad, morir/ganar la primera partida y querer otra. Con 46 campeones, mostrar 3 recomendados al inicio y esconder el resto detrás de «Ver todos» evita parálisis.
2. **Claridad de combate.** Reglas de legibilidad ya existen (filtro de habilidades). Falta una pasada global con zoom de juego real: área marcada antes del golpe, daño continuo visible, enemigos en hordas grandes sin tapar al jugador. La Plaga del Nigromante era un ejemplo de efecto que dejaba de leerse a los 1,5 s.
3. **Rendimiento con hordas.** Probar con 200+ entidades y 4 jugadores en una PC modesta y en Steam Deck. Hoy no hay pruebas reales de rendimiento ni de multijugador (STATUS.md). Es el riesgo técnico más grande de reseñas negativas.
4. **Multijugador por red.** Varios efectos nuevos (hilo de contagio, orbes de alma) no se replican por red. Decidir si el invitado debe verlos o aceptar una versión simplificada, y probar latencia real.
5. **Arte consistente.** Hay campeones con arte regenerado por IA, otros con arte original, y enemigos sin atlas propio. Un jugador nota el cambio de estilo entre campeones o arenas. Fijar un estándar mínimo por campeón (estados de movimiento, ataque, definitiva, muerte) y no vender skins de un campeón que no lo cumple.
6. **Dependencias y seguridad.** GitHub avisa 105 vulnerabilidades en las dependencias de `main` (5 críticas). Revisarlas antes de abrir cuentas, pagos y ranking online.
7. **Nombre y marca.** «La Horda» no figura en Steam, iOS ni itch.io, pero el chequeo de marcas (clases 9 y 41, TMview/WIPO/INPI) sigue pendiente. Es barato hacerlo antes de pagar la cuota de Steam y la página de tienda.
8. **Accesibilidad.** Reducción de efectos (existe `reduceFx`), tamaños de texto, remapeo de teclas y mando, modo daltónico para las zonas de peligro. Steam Deck y mando son casi obligatorios para este género.
9. **Idiomas.** El juego está en español. Un lanzamiento global suele exigir inglés como mínimo; sin eso, la mayoría de las reseñas y de la audiencia queda fuera.
10. **Estabilidad del CI y de las pruebas.** Quedan intermitencias conocidas (`INTERMITENCIAS_CI.md`). No bloquean a jugadores, pero esconden regresiones.

## B. Qué lo haría más divertido

1. **Bucle de partida corto con decisiones.** Partidas de 15–25 minutos con 3–4 momentos de elección (mejora de habilidad, reliquia, camino). Lo que más retiene en este género es «una más» y la sensación de construir algo distinto cada vez.
2. **Sinergias entre habilidades.** Que el Nigromante con Plaga + Cosecha de Almas, o los elementos de otros campeones, se combinen de forma visible. Las sinergias legibles generan clips y conversación.
3. **Jefes con mecánicas distintas.** Cada jefe debe obligar a cambiar de comportamiento (zonas, fases, invocaciones), no solo tener más vida. Se puede medir con una tabla jefe × mecánica y revisar duplicados.
4. **Desafíos diarios y semanales con semilla fija.** Misma arena y modificadores para todos, tabla de puntajes con el token de partida del servidor. Da razón para volver sin vender poder.
5. **Modificadores de dificultad opcionales** («Pesadilla», «Infierno» ya existen en los logros): reglas que cambian la partida (enemigos rápidos, sin curación, doble jefe) con recompensa cosmética.
6. **Modo cooperativo como producto estrella.** Un ARPG de hordas se vende por «jugar con amigos». Invitar por código/Steam, reconexión, y habilidades que se complementen entre campeones.
7. **Meta-progresión liviana.** Logros y ascensión ya existen. Falta un progreso entre partidas que no sea poder permanente desbalanceado: desbloqueo de variantes de habilidad, no de estadísticas.
8. **Retroalimentación en cada golpe.** Pausas de impacto, números de daño legibles, sonido propio por habilidad. Es el 50 % de la sensación de poder y es barato de mejorar.

## C. Monetización (sin romper la confianza)

Contexto: el repositorio ya fija reglas sanas: Brasas compran **solo cosméticos**, sin cajas sorpresa, sin temporizadores falsos, sin precios inflados. Conviene mantenerlas: en Steam las reseñas castigan el «pay to win» y las cajas.

1. **Modelo de precio base.** Dos caminos: (a) gratis con cosméticos (más alcance, depende de volumen y de retención), o (b) pago único bajo (US$ 8–15) con cosméticos opcionales (menos alcance, mejores reseñas y más ingreso por jugador). Con un equipo chico y arte muy trabajado, (b) suele ser más seguro; decisión del dueño según su presupuesto de marketing.
2. **Demo gratuita y Next Fest.** Una demo con 3–4 campeones y 2 arenas, más participar en un Next Fest de Steam, suele ser la mejor fuente de lista de deseos. La lista de deseos antes del lanzamiento determina el primer día.
3. **Pase de batalla de 30 días (ya existe el servidor).** Pista gratis + pista premium solo cosmética. Reglas: no caduca ni presiona (se puede terminar tarde), no vende saltos de nivel que parezcan engaño.
4. **Packs de campeón/cosméticos como DLC.** «Pack de bienvenida» ya está definido. Añadir packs temáticos por campeón o por arena con skins + efecto visual + música, y un «pack fundador» limitado en tiempo real (fecha fija, no contador falso).
5. **Efectos visuales y apodos** (trazas de movimiento, auras de definitiva, marcos de jugador). Son cosméticos puros, se ven en cooperativo y no tocan el balance. Prohibido que cambien daño, alcance o lectura de peligro.
6. **Banda sonora y coleccionables de Steam.** Cartas, fondos, insignias y emotes generan un ingreso pequeño y mejoran la visibilidad del perfil.
7. **Regalos entre jugadores.** Permitir regalar cosméticos a un amigo (comprándolos con Brasas o dinero) aumenta la conversión sin tocar el balance.
8. **Regionalización de precios.** Usar los precios regionales sugeridos por Steam; en LatAm el precio base de EE. UU. espanta compras.
9. **Transparencia.** Mostrar siempre qué incluye cada compra y que nada afecta el poder. Esto es un argumento de marketing, no solo una restricción.
10. **Lo que NO haría:** vender poder (equipo, estadísticas, desbloqueos de habilidad), cajas con probabilidad, monedas que ocultan el precio real, o temporizadores falsos. Rompe la confianza y atrae reseñas negativas que ningún cosmético compensa.

## D. Pendientes que son del dueño (no los puede cerrar el código)

Steamworks (AppID, ítems 1001–1006, sandbox), build de escritorio, textos legales, página de tienda, íconos, declaración de IA (confirmar términos comerciales de `gpt_image_2`), chequeo de marcas, pruebas reales de multijugador y rendimiento, y recarga de Runway (saldo 37).
