# Relay multijugador: cómo se conecta el cliente y qué se puede (y no se puede) verificar

Alcance: lectura del repositorio en `main` @ `e194910b` + una consulta de solo lectura a `GET /api/health` hecha el 31-oct. **No** se accedió al servidor del socio, **no** se asumió ninguna plataforma (ni Render ni Fly.io) y **no** se cambió ni se desplegó nada.

## 1. Cuatro entornos distintos (no mezclarlos)

| Entorno | Qué es | Evidencia |
|---|---|---|
| **Desarrollo local** | `python3 -m http.server` o el servidor de pruebas de `tools/lib/serve.js`; el cliente sin relay (el modo online queda desactivado) o con `?server=ws://127.0.0.1:PUERTO` apuntando a un `node server/relay.js` local | `js/net/net-config.js` (comentario), `tools/lib/serve.js`, `tools/release/relay-smoke.js --local` |
| **GitHub Pages / previews** | Solo archivos estáticos del juego. Su origen (`https://drmarianojimenez94-sudo.github.io`, githack) figura en `ALWAYS_ALLOWED` del relay, pero el cliente publicado ahí usa el mismo `serverUrl` oficial | `server/relay.js:65`, `js/net/net-config.js` |
| **Servidor del estudio** (`fondalstudios.com`) | Sirve el juego en `/la-horda/jugar/` y hace de proxy inverso del relay en `/la-horda/red`. El repositorio trae las plantillas de nginx/Apache, pero no prueba que ese sea el montaje real | `deploy/nginx/*`, `deploy/apache/la-horda.conf`, `docs/commercial/DESPLIEGUE_FONDAL.md` |
| **Relay multijugador** | Un proceso Node (`server/relay.js`) que atiende WebSocket **y** las cuentas/billetera/economía (`/api/*`) en el mismo puerto. Lo actualiza **a mano** el socio técnico | `server/relay.js:354` (`require("./accounts.js")`), `docs/production/operations.md` |

Consecuencia importante: **actualizar el relay también actualiza cuentas, billetera y economía**. No es solo «salas».

## 2. Cómo se comunica el cliente con el relay

- Dirección oficial: `NET_CONFIG.serverUrl = "wss://fondalstudios.com/la-horda/red"` (`js/net/net-config.js`). Vacía = modo online desactivado.
- Cambio manual: `?server=wss://…` en la URL o `horda_server` en `localStorage`; los servidores no oficiales pasan por una pantalla de confianza antes de enviar credenciales (`js/net/net-core.js:41-104`).
- Mensajes: JSON por WebSocket. `create` y `join` llevan `protocol` y `build` (`js/net/net-core.js:360,367`).
- HTTP de lectura: `GET /api/rooms?build=…` (lista de salas públicas), `GET /health` (línea de estado) y `GET /api/health` (cuentas: `store`, `persistent`).
- Un navegador automatizado sin `?server=` **no** sale a Internet (regla de `net-core.js`; desde S0B también en `net-rooms.js`).

## 3. Reglas de compatibilidad cliente-relay (lo que el código hace cumplir)

| Regla | Dónde | Efecto si no coincide |
|---|---|---|
| `protocol`: `NET_PROTOCOL` del cliente (`net-core.js:14`) = `PROTOCOL` del relay (`relay.js:44`) | `relay.js:182,201` | `error VERSION`: nadie crea ni se une a salas |
| `build`: el anfitrión y el invitado deben tener el **mismo** `NET_CONFIG.build` | `relay.js:206` | `error BUILD` al unirse; las salas públicas se filtran por build |
| Origen: si `ALLOWED_ORIGINS` tiene valores, el origen del navegador debe estar en la lista (+ `ALWAYS_ALLOWED`) | `relay.js:66-77,391` | WebSocket cerrado con `ORIGIN`; `/api/*` con 403 |
| El relay **no** publica qué versión de código corre ni su `build` | `/health` solo dice protocolo y salas | desde fuera no se puede saber si el relay está actualizado |

Hoy: protocolo `1`, build del cliente `B1-7-quality-five-originals`.

## 4. Cómo se actualiza hoy (hasta donde llega la evidencia)

- **Verificado:** el repositorio no contiene ningún workflow que despliegue (ningún `rsync`, `ssh` ni `flyctl` en `.github/workflows`), y `deploy/update.sh` no consulta el estado del CI.
- **No verificado:** cómo actualiza el socio (qué comando, qué máquina, qué gestor de procesos, de qué rama, con qué base de datos). `deploy/update.sh` y `deploy/rollback.sh` existen y están documentados para un servidor Linux con `systemd`/`pm2`, pero **no hay evidencia de que sea lo que usa el socio**.
- **Indicio:** el 31-oct `GET https://fondalstudios.com/la-horda/red/api/health` devolvió `store: "file"`, `persistent: false`: las cuentas no están en una base persistente.

## 5. Riesgos al actualizar sin romper partidas ni cuentas

1. **Reiniciar el proceso corta todas las salas activas** (el relay guarda las salas en memoria; solo hay una gracia de reconexión por jugador). Actualizar fuera de horario o avisar con el banner de mensajes del Game Master.
2. **Cuentas no persistentes** (`persistent:false`): un reinicio o un cambio de disco puede borrarlas. Hacer copia antes de tocar nada.
3. **Cambio de `PROTOCOL` o de `build`** deja afuera a los clientes viejos hasta que recarguen. Cambiarlos solo junto con la publicación del juego.
4. **Orígenes:** si se agrega o cambia el dominio del juego, actualizar `ALLOWED_ORIGINS` antes.
5. **Versión desconocida:** sin registro del SHA instalado, no hay vuelta atrás segura. Anotar el SHA antes y después de cada actualización.

## 6. Preguntas técnicas pendientes (no se inventó ninguna respuesta)

Ver `GUIA_SOCIO_RELAY.md`, sección «Preguntas para el socio».
