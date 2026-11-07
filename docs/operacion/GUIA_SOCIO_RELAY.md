# Guía breve para el socio responsable del relay

Para actualizar el relay a mano **sin romper partidas ni cuentas**. Está escrita sin conocer tu montaje: lo que depende de él figura como pregunta, no como comando. Los scripts que se nombran existen en el repositorio y se pueden leer antes de usar. **Nada de esto despliega por sí solo.**

## Antes de actualizar (15 min)

1. **Elegí el momento.** Reiniciar corta las salas activas. Mirá cuántas hay: `node tools/release/relay-smoke.js --url wss://fondalstudios.com/la-horda/red` (solo lectura; muestra el número de salas). Con salas activas, avisá antes o esperá.
2. **Anotá la versión instalada** (el SHA del código que corre hoy) y la que vas a instalar. Sin eso no hay vuelta atrás segura.
3. **Copia de seguridad de las cuentas.** Si usás Postgres, hay un script documentado: `tools/release/backup.sh` (lee `docs/commercial/DESPLIEGUE_FONDAL.md`). Si el almacén es archivo (`persistent:false`), copiá el directorio que indique `DATA_DIR`. **Verificá que la copia abre antes de seguir.**
4. **Compatibilidad.** Con el código nuevo ya bajado: `node tools/release/relay-smoke.js --local --create-room` debe terminar en `OK`. Confirma que ese árbol de código arranca, responde y que `PROTOCOL` del relay coincide con `NET_PROTOCOL` del cliente.
5. **Variables.** Revisá que `ALLOWED_ORIGINS` incluya el dominio del juego y que `PORT`/`HOST` no cambien.

## Actualizar

Usá tu procedimiento habitual. Si tu servidor está montado como en `docs/commercial/DESPLIEGUE_FONDAL.md`, el repo ofrece `deploy/update.sh` (hace copia, actualiza, reinicia, verifica y vuelve atrás solo si falla). **Si no es tu montaje, no lo uses**: decime cuál es y lo documentamos.

## Después de actualizar (5 min)

1. `node tools/release/relay-smoke.js --url wss://fondalstudios.com/la-horda/red --create-room` → debe decir `OK`.
2. Revisá los avisos (`WARN`): `almacén de cuentas NO persistente` y `acepta cualquier origen` son advertencias reales, no errores del script.
3. Desde dos navegadores: crear una sala, unirse con el código, empezar una partida de 1 minuto.
4. Anotá el SHA instalado, la hora y quién lo hizo.

## Si algo sale mal (vuelta atrás)

1. Si cambió **solo el código**: volvé al SHA anotado y reiniciá (`deploy/rollback.sh` hace esto en el montaje documentado; en otro montaje, tu procedimiento).
2. Si el problema son **datos** (cuentas): restaurá la copia del paso 3 (`tools/release/restore.sh` en el montaje con Postgres; **ensayá la restauración antes en una base de prueba**).
3. Volvé a correr el humo y avisame el resultado completo.

## Diagnóstico rápido de desconexiones y errores

| Síntoma | Causa más probable | Cómo comprobarlo |
|---|---|---|
| «Versión distinta del servidor» al crear/unirse | `PROTOCOL` del relay ≠ `NET_PROTOCOL` del cliente | el humo marca `FAIL el protocolo ... NO coincide` |
| «El anfitrión usa otra versión del juego» | `build` distinto entre anfitrión e invitado | recargar ambos; el `build` sale de `js/net/net-config.js` |
| «Crear sala» no hace nada | origen no permitido (`ORIGIN`) | el humo: `FAIL el relay rechaza el origen`; revisar `ALLOWED_ORIGINS` |
| Las cuentas desaparecen tras reiniciar | almacén no persistente | `GET /api/health` → `persistent:false` |
| Salas que se cortan cada tanto | el proxy cierra conexiones largas | revisar el tiempo de espera del proxy (la plantilla `deploy/nginx/la-horda-proxy.inc` usa 3600 s) |
| Muchos 429 | límite por IP con un wifi compartido | variable `ROOMS_MAX_IP` / `API_MAX_IP` (ver `server/relay.js`, `server/accounts.js`) |

El relay escribe registros con etiquetas `NETWORK_ERROR`, `RATE_LIMIT`, `RATE_KICK`, `RELAY_LISTENING`; buscalas en el registro de tu gestor de procesos.

## Preguntas para el socio (sin respuesta en el repositorio)

1. ¿En qué plataforma y máquina corre el relay y cómo se reinicia (systemd, pm2, contenedor, otro)?
2. ¿De qué rama o SHA toma el código y cómo lo actualiza (git pull, copia manual, otro)?
3. ¿Qué almacén usan las cuentas (Postgres, archivo) y dónde están los datos? ¿Hay copias automáticas?
4. ¿Quién termina el TLS y hace el proxy hacia el relay (nginx, Apache, otro) y con qué tiempos de espera?
5. ¿Qué valor tienen hoy `ALLOWED_ORIGINS`, `ALLOWED_ORIGINS_STRICT`, `TRUST_PROXY`, `MAX_ROOMS`?
6. ¿Dónde se ven los registros y cuánto se conservan?
7. ¿Hay una ventana horaria de menor uso? ¿Cómo se avisa a los jugadores de un reinicio?
8. ¿Tiene un entorno de prueba donde ensayar la actualización y la restauración?
