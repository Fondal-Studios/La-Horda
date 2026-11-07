# Multijugador local (fiesta en red local / LAN)

Cooperativo para hasta 4 personas por el WiFi de la casa, **sin internet ni cuenta**. Una compu hace de anfitriona
(corre el servidor de salas y el juego) y los demás entran desde el celular o la compu abriendo una dirección.
Modos: **Campaña** y **Horda Infinita** (los dos de la beta). Reutiliza el cooperativo B1 tal cual: la misma sala, el mismo
lobby y la misma sincronización (`js/net/net-game.js`, host autoritativo); el servidor solo hace de cartero.

## Modo pensado para la compu como pantalla única

Es un modo **distinto** del online: **máximo 4 jugadores** (la anfitriona + 3) y **una sola cámara compartida y alejada** en la
pantalla de la anfitriona, donde se ven los cuatro a la vez; los demás juegan desde su celular o compu por el WiFi.
- **Tope duro de 4**: lo hace cumplir el servidor (el 5.º recibe `SALA COMPLETA: en red local juegan 4 como máximo (la anfitriona y 3 más)`)
  y lo dice la pantalla «Jugar en red local». Los lugares sin humano los ocupan bots, hasta 4 héroes en total.
- **Cámara única** (`lanCamStep` en `js/net/net-lan.js`): mientras dura una partida local encuadra a todos los héroes vivos con un zoom
  alejado (por defecto 72 % del zoom normal, y se aleja más a medida que se separan, hasta la arena entera), con suavizado. Es una capa propia
  que solo corre en modo LAN: **no modifica `js/rendering/camera.js`**, se engancha a `updateArenaCameraZoom()` y usa `CAM_SUBJECT`/`CAM_ZOOM`/`CAM_Y_ANCHOR`.
- **Invitados**: controlan a su héroe con su mando de siempre (joystick y botones sin tocar). No tienen una cámara propia: calculan el mismo encuadre
  con los mismos datos, así que todas las pantallas muestran lo mismo. No hay un «modo mando» aparte (no se copió Fondal TV, que queda intacto).

## Cómo se usa

### La anfitriona (una compu)
1. Necesita **Node.js 18 o más** (https://nodejs.org). Abrir una terminal en la carpeta del juego y ejecutar uno de:
   - `npm run lan`
   - `node tools/lan/host.js`
   - Windows: doble clic en `lan.bat` · Mac/Linux: `./lan.sh`
   La primera vez instala sola el módulo `ws` del servidor (`npm install` dentro de `server/`; **necesita internet esa única vez**).
2. La terminal muestra la dirección de la compu en la red (ej. `http://192.168.1.25:8080/`) y un **código QR**.
3. En la misma compu abrir `http://localhost:8080/` → entra solo a **JUGAR EN RED LOCAL** (también está en *Modos y multijugador*).
4. **Crear sala local** → elegir **Campaña** (se elige arena) o **Horda Infinita** → elegir guardián → la Sala se arma sola y
   muestra el **código** y el **QR** con el enlace para los demás.
5. Cuando todos marquen LISTO, **Comenzar** (los lugares libres los ocupan bots, siempre rotulados).

### Los invitados (celulares o compus en el mismo WiFi)
- Escanear el QR de la terminal o de la Sala, o abrir la dirección en el navegador. Con el enlace de la Sala (`?room=CÓDIGO`)
  aparece el botón **Unirse a la sala CÓDIGO**; con la dirección sola entran directo a la pantalla **Jugar en red local**.
- **Unirme a sala local**: tocar la sala de la lista (las salas locales se listan solas para la red), o escribir/pegar el
  código o el enlace.

### Opciones de `tools/lan/host.js`
`--port N` (default 8080; si está ocupado usa el siguiente libre) · `--host IP` (en qué interfaz escucha; default todas) ·
`--quiet` (sin QR ni avisos) · `--no-install` (no instala `ws` solo). Se termina con Ctrl+C.

## Qué hace y qué NO hace

| Hace | No hace |
|---|---|
| Un puerto sirve el juego + el relay de salas (mismo origen: sin CORS, sin `wss`, sin Internet). | No usa cuentas, nube, guardado remoto, ranking, Brasas ni economía de servidor. |
| Sala pública solo para la red (se lista sola; sin botón «Pública/Privada»). | No hay intercambio de objetos en la Sala ni bandeja de recompensas de servidor. |
| Reconexión del invitado al mismo lugar; si se va la anfitriona, la sala se cierra y los invitados vuelven al menú con aviso. | No hay partida de Convergencia/Coliseo ni otros modos fuera de Campaña e Infinita en este flujo. |
| QR y enlace con la IP de la compu (no `localhost`). | No sirve desde la página publicada por https (ver Límites). |

**Sin progreso.** Al entrar a la red local el juego trabaja sobre una **copia** del guardado de ese dispositivo
(`lanEnter`, `js/net/net-lan.js`) y `persistNow` no escribe nada mientras dura (`lanNoPersist`, `js/storage/save.js`); al volver al
menú se descarta la copia (`lanLeave`) y queda el guardado real intacto. Todo lo ganado (oro, XP, botín, récord) vale solo durante
la fiesta; por eso, y porque no hay cuentas, **no cuenta para ranking, economía ni Brasas**. En la copia las arenas de la
campaña quedan abiertas y la Horda Infinita disponible, para que cualquier perfil nuevo pueda hostear.

**Dos capas contra la nube.** (1) El servidor LAN corre el relay con `LA_HORDA_LAN=1`: `/api/*` responde 404 (salvo `/api/rooms`),
`reward-*` se contesta vacío, la partida no escribe la bandeja de recompensas y `trade` se rechaza (`TRADE_OFF`). (2) El cliente
detecta la página servida por la anfitriona (`window.__HORDA_LAN__`, inyectado por `host.js` solo en `index.html`) y, **solo si el host
es de la máquina o de una red privada y el protocolo es `http`** (`netLanPage`, `js/net/net-core.js`, usa `laHordaPrivateHost`), usa el
relay del mismo origen y `js/net/account.js` no se conecta a ningún lado. El modo dev (`?dev=1`) sigue limitado a redes privadas.

**Qué se sirve.** `host.js` expone únicamente `index.html`, `manifest.webmanifest`, `sw.js`, `assets/`, `css/`, `js/` y `legal/`
(sin `..`, sin archivos con punto, sin `server/`, `tools/`, `docs/`).

## Firewall, Windows y red

- **Windows**: la primera vez Defender pregunta si permite `node.exe` en redes: marcar **Redes privadas**. Si no apareció el
  aviso, o el celular no entra: *Configuración → Red → Propiedades del WiFi → Perfil de red = Privada*, y permitir `node.exe` en
  el Firewall de Windows Defender para redes privadas (o crear una regla de entrada TCP al puerto 8080).
- **macOS**: aceptar «¿Querés que Node acepte conexiones entrantes?».
- **Linux**: abrir el puerto si hay firewall (`sudo ufw allow 8080/tcp`).
- El router no puede tener **aislamiento de clientes / AP isolation** (algunos WiFi de invitados y de oficinas lo traen): los
  dispositivos no se ven entre sí. Todos en la misma red (2,4 y 5 GHz suelen ser la misma LAN, pero no siempre).
- Un **punto de acceso del celular** sirve como red (la compu se conecta a él).
- Si hay varias redes (VPN, Docker, VirtualBox) la terminal lista todas las direcciones; usar la de la WiFi/ethernet de casa.
- Todos deben tener la misma versión del juego (la sirve la anfitriona, así que coincide sola).

## Límites conocidos

- **Solo `http` en red privada.** Desde `https://` (la página publicada) un navegador no deja abrir `ws://` hacia la LAN (contenido
  mixto): hay que abrir la dirección de la anfitriona. «Instalar» como PWA no aplica por la misma razón (no hay https).
- **Rendimiento**: la anfitriona simula toda la partida (host autoritativo); los invitados en celulares viejos o WiFi cargado
  pueden notar tirones. Máximo 4 humanos por sala.
- **Guardados separados por origen**: `localhost:8080` y `192.168.x.x:8080` son sitios distintos para el navegador, cada uno con
  su propio guardado (un invitado nuevo en su celular empieza como perfil nuevo y elige su guardián de regalo).
- **Fondal TV** (`js/net/fondal-tv.js`, intocable por D4) intenta bajar su pieza común desde `fondalstudios.com` también acá: sin internet
  falla en silencio; con internet, solo agrega el ícono de «Jugar en la tele». No es parte de la red local.
- La dirección elegida para el QR es la primera de una lista ordenada (192.168.x, 10.x, 172.16-31.x; las redes virtuales al final):
  en máquinas con varias interfaces puede no ser la correcta (la terminal muestra todas).
- Los IPv6 y el descubrimiento automático (mDNS/Bonjour) no están: siempre se entra por IP o QR.

## Pruebas

| Comando | Qué cubre |
|---|---|
| `node tools/lan/test-lan.js` (o `npm run test:lan`) | Levanta `tools/lan/host.js` y hasta 5 navegadores a la vez (4 jugadores + un 5.º rechazado; luego Campaña) Chromium (127.0.0.1…5: orígenes y guardados independientes). Servidor: `/lan.json`, 404 en `/api` y en rutas fuera de la lista, QR en la terminal. Cliente: entrada al lobby local, solo Campaña e Infinita, crear sala local (se arma sola, código + QR + enlace con IP), unirse por enlace y por la lista de la red, código inválido, 4 humanos juegan Horda Infinita, **se ven y se mueven entre sí** y los 4 caen en el mismo encuadre de la cámara única (también separados al máximo), el 5.º es rechazado con mensaje claro, guardado real intacto, sin ranking, sin salir a Internet, **reconexión** de un invitado, **salida de la anfitriona**, y una partida de Campaña de 2 jugadores. |
| `node server/test-lan.js` | Relay en modo LAN sin navegador: `/health`, sin `/api` de cuentas, recompensas apagadas, sin intercambio, sala pública, reenvío, reconexión, cierre por salida de la anfitriona. |
| `python3 tools/i18n/build.py` + `node tools/i18n/tour.js --check en` / `pt` | Traducciones (EN/PT en `tools/i18n/tr/t360.py`). |
| `node tools/alpha/public-defaults.js`, `node tools/alpha/account-environments.js`, `node server/test-relay.js` | No se relajó nada de lo existente. |

Para correr los de navegador: `NODE_PATH="server/node_modules:$(npm root -g)" node tools/lan/test-lan.js` (hace falta `npm install --prefix server`).
Las dos pruebas se enganchan en el workflow `.github/workflows/lan-local-multiplayer.yml` (liviano: solo cuando cambian los archivos del modo).

## Qué falta probar en dispositivos reales

Probado solo en una máquina (Chromium + loopback). Pendiente en hardware real:
1. **Celular real (iPhone Safari / Android Chrome)** abriendo `http://192.168.x.x:8080/` y el enlace del QR; escaneo del QR de la Sala y
   de la terminal con la cámara nativa (el QR se verificó con un decodificador, no con cámaras).
2. **WiFi real**: latencia y tirones con 3-4 dispositivos, router con AP isolation, 2,4 vs 5 GHz, hotspot del celular como red.
3. **Firewall de Windows** (Defender, perfil Privada/Pública) y macOS: que el aviso aparezca y el puerto quede abierto.
4. **Selección de IP** con VPN/Docker/WSL/VirtualBox activos (la lista ordenada y la elección del QR).
5. **Rendimiento de la anfitriona** en una compu modesta con 4 humanos y la Horda Infinita en rondas altas.
6. **Controles táctiles y cámara** en los invitados durante la partida (no se tocaron; solo se verificó que la partida arranca y se sincroniza).
7. Rotación/bloqueo de pantalla y pérdida de WiFi en el celular (la reconexión se probó cerrando el socket, no cortando la red).
8. Perfil nuevo real en el celular invitado: elección del guardián de regalo al unirse por enlace (flujo existente, no probado en LAN).
