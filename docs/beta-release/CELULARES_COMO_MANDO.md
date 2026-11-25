# Celulares como mando (sala en la compu)

La partida se ve en la pantalla de la compu (o en la tele conectada a la compu). Cada celular de la misma WiFi
hace de joystick y maneja a un guardián. El celular no corre el juego: solo manda el joystick y los toques.

## Cómo se juega
1. Doble clic en `sala.bat` (necesita Node.js 18 o más; la primera vez instala `ws` con internet).
   Se abre el juego en la compu. Si Windows pregunta por el firewall, permitir en **red privada**.
2. En cada celular: escanear el QR del panel de abajo a la izquierda (o el de la terminal). Ponerlo horizontal.
3. El primer celular maneja al jugador 1; los siguientes toman a los aliados que hoy maneja la IA (hasta 4).
   Si un celular se desconecta, su aliado vuelve a la IA. El teclado o un mando USB siguen andando para el jugador 1.
4. En el celular: «Héroe» para poner tu nombre y elegir guardián (vale para la próxima partida). «II» pausa.

Teclas en la compu: **V** vista de sala (la cámara sigue al grupo y se abre hasta casi toda la arena; se prende sola
cuando se conecta un celular), **M** mostrar el QR durante la partida.

## Cómo está hecho
- `tools/lan/mandos.js`: API privada en el puerto del juego + 1 (8081). Clave al azar en cada arranque, va dentro del QR;
  sin clave no entra nadie. Solo red local; solo viaja el nombre que cada uno escribe.
- `tools/lan/mando.html`: la página del celular (joystick flotante, Atacar mantenido, 3 habilidades, Ulti, vibración al recibir daño).
- `js/net/mandos.js`: en la compu, maneja a cada héroe con el mismo código que al jugador (`updateControlledHero` con
  `joyVec`/`basicHeld` prestados, como `netWithHero` en cooperativo) y la vista de sala (`mandosCamara`, en `camera.js`).
- No se usa con las salas en red (si hay `netMatch`, los mandos quedan quietos). El progreso es el guardado normal de la compu.

## Límites conocidos (25/11/2026)
- Las habilidades salen con autoapuntado (como un toque), no con apuntado manual.
- Los aliados que maneja un celular conservan los ajustes de bot del héroe.
- El Coliseo y la Guerra de Cristales no usan la vista de sala.
