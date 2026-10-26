# Despliegue de La Horda en el servidor de Fondal (paso a paso)

Para quien maneja el servidor, aunque no sea técnico. Cada paso dice **qué escribir**, **qué tendrías que ver** y **qué hacer si no**.
Fecha: 21 de octubre de 2026. Este documento **no activa pagos**: todo queda con `MP_ENABLED=0` hasta que termines
`docs/commercial/CHECKLIST_ULTIMA_PRUEBA.md`.

> **Qué está probado y qué no.** Todo lo de acá (unidad systemd, nginx, Apache, proxy de WebSocket y del webhook, backup, restauración,
> actualización con vuelta atrás automática, preflight) se probó en un entorno **local equivalente** (Ubuntu, Postgres 16, nginx 1.24, Apache 2.4,
> Node 22). **No se probó en el servidor real de Fondal**: no tengo acceso. Por eso el paso 11 es correr el preflight allá y el checklist final
> existe. Si algo difiere de lo que ves (otro sistema operativo, panel de hosting en vez de consola), pedí ayuda antes de improvisar.

## 0. El mapa (leelo una vez)

```
 Jugador (navegador)
      │  https://fondalstudios.com/la-horda/jugar/      →  archivos del juego (estáticos)  ┐
      │  wss/https://fondalstudios.com/la-horda/red/…   →  programa "relay" (Node, :8787)   ├─ nginx o Apache (HTTPS, puerto 443)
      │                                                         │  salas + cuentas + guardado + tienda + webhook de pagos
      │                                                         ▼
 Mercado Pago ──── webhook ─────────────────────────────►  Postgres (cuentas, guardados, Brasas)  ← lo único que NO se puede perder
```

- **Salas multijugador, cuentas, guardado en la nube y pagos son UN solo programa** (`server/relay.js`). No se pueden mudar por separado sin
  tocar el código de red: o todo en el servidor nuevo, o nada.
- El **sitio del juego** son archivos estáticos que arma `tools/build-static.mjs` (lo corre `deploy/update.sh` por vos).
- **La base de datos Postgres es lo único valioso.** Todo lo demás se rehace en minutos. Perder la base es perder lo que pagaron los jugadores.

### Decisión previa: ¿en qué dirección va el servidor de salas?

| | **A. Misma dirección, ruta `/la-horda/red`** | **B. Subdominio `red.fondalstudios.com`** (recomendada para empezar) |
|---|---|---|
| Dirección del servidor | `wss://fondalstudios.com/la-horda/red` | `wss://red.fondalstudios.com` |
| Qué cambia | **Reemplaza** lo que hoy atienda esa ruta | No toca nada de lo que anda hoy |
| `GAME_RELAY_URL` | `wss://fondalstudios.com/la-horda/red` | `wss://red.fondalstudios.com` |
| Webhook de Mercado Pago | `https://fondalstudios.com/la-horda/red/api/payments/webhook` | `https://red.fondalstudios.com/api/payments/webhook` |
| Archivo de nginx | `deploy/nginx/la-horda-locations.inc` | `deploy/nginx/relay-subdominio.example.conf` |
| Hace falta | nada más | un registro DNS `red` hacia este servidor y su certificado |

**Importante, leé esto:** hoy la dirección `fondalstudios.com/la-horda/red` la atiende el relay de Fly.io (que "anda perfecto" y **no se toca**). Si
elegís **A** y esa ruta pasa a apuntar a este servidor, los jugadores dejan de usar Fly. Con **B** el relay de Fly queda intacto y vos ensayás todo
en paralelo. **Las cuentas y el progreso en la nube de Fly NO pasan al servidor nuevo** (es otra base): quienes ya tienen cuenta tendrían que crear
otra. Eso lo decidís vos (si querés migrar cuentas, hay que exportar desde Fly, y yo no tengo acceso). El juego guarda el progreso también en el
dispositivo, así que nadie pierde su avance local.

> ¿Cómo sé qué atiende hoy esa ruta? Abrí `https://fondalstudios.com/la-horda/red/health`. Si dice "LA HORDA relay OK" lo atiende algún relay (hoy Fly).
> Si no carga, la ruta está libre.

## 1. Lo que necesitás antes de empezar

- Un servidor Linux con **Ubuntu 22.04 o 24.04** (o Debian 12), **2 GB de RAM** y **10 GB de disco libres** como mínimo (el juego pesa ~180 MB y se guardan 5 versiones).
- Acceso por **SSH** con un usuario que pueda usar `sudo`.
- El dominio `fondalstudios.com` (y, si elegís B, poder crear el registro DNS `red`).
- Los puertos **80 y 443** abiertos hacia internet. **El 8787 NO** (es interno).
- Una cuenta de GitHub con acceso de lectura al repositorio de La Horda.

Todos los comandos se escriben en la consola del servidor. Los que empiezan con `sudo` piden tu contraseña.

## 2. Instalar los programas

```bash
sudo apt-get update
sudo apt-get install -y git curl nginx postgresql-client ufw
# Node 22 (NO uses el "nodejs" que trae Ubuntu: es viejo y no sirve)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v      # tiene que decir v22.x
```

Si usás **Apache** en vez de nginx: `sudo apt-get install -y apache2` y los pasos de Apache de la sección 7.

## 3. Bajar el código

```bash
sudo useradd --system --user-group --no-create-home --shell /usr/sbin/nologin lahorda
sudo git clone https://github.com/drmarianojimenez94-sudo/La-Horda.git /opt/la-horda
cd /opt/la-horda
sudo git checkout main
```

- Usá **`main`** cuando esta rama ya esté fusionada. Mientras tanto, ensayá con `sudo git checkout claude/listo-para-cobrar` y poné `BRANCH=claude/listo-para-cobrar`
  cuando corras `deploy/update.sh`.
- **Si el repositorio es privado**, GitHub va a pedir usuario y clave. En vez de eso creá una **clave de solo lectura** del servidor:
  1. `sudo ssh-keygen -t ed25519 -f /root/.ssh/la_horda_deploy -N ""` y después `sudo cat /root/.ssh/la_horda_deploy.pub` (copiá esa línea).
  2. En GitHub: el repositorio → **Settings → Deploy keys → Add deploy key**, pegá la línea, dejá **sin** marcar "Allow write access".
  3. `sudo git clone git@github.com:drmarianojimenez94-sudo/La-Horda.git /opt/la-horda` con
     `sudo GIT_SSH_COMMAND="ssh -i /root/.ssh/la_horda_deploy -o IdentitiesOnly=yes" …`, y después
     `sudo git -C /opt/la-horda config core.sshCommand "ssh -i /root/.ssh/la_horda_deploy -o IdentitiesOnly=yes"` para que las actualizaciones funcionen solas.
- Hacé el clon **completo** (sin `--depth`): las actualizaciones lo necesitan.

## 4. La base de datos Postgres (lo más importante)

> **Fecha límite:** la base **gratuita** de Render que usa hoy el servidor independiente **vence el 28/10/2026** y reutilizarla no reinicia el plazo
> (`docs/commercial/INDEPENDENT_HOSTING.md`). Mientras no haya una base persistente, el servidor **se niega a cobrar**. Resolvelo antes.

Elegí **una**:

### 4A. Postgres en el mismo servidor (simple y barato; el backup lo hacés vos)

```bash
sudo apt-get install -y postgresql
CLAVE="$(openssl rand -hex 24)"; echo "Guardá esta clave en un lugar seguro: $CLAVE"
sudo -u postgres psql -c "CREATE ROLE lahorda LOGIN PASSWORD '$CLAVE';" -c "CREATE DATABASE lahorda OWNER lahorda;"
```

La dirección que vas a usar (paso 5) es `postgresql://lahorda:LA_CLAVE@127.0.0.1:5432/lahorda`. La clave es hexadecimal a propósito (sin símbolos que rompan la
dirección). Postgres escucha solo en el propio servidor por defecto: **no abras el 5432 al exterior**.

### 4B. Postgres administrado (Neon, Render de pago, Supabase, etc.)

Es más cómodo (hace copias solo, según el plan) pero cuesta o tiene límites: **verificá el plan vigente y su política de respaldo**. Copiá la dirección
completa (`postgresql://…`, suele terminar en `?sslmode=require`). Región cercana a tu servidor.

### 4C. Migrar los datos que ya existen (si hay cuentas en la base de Render que vence)

Las tablas de La Horda empiezan con `horda_` y **se crean solas** al arrancar el programa (`CREATE TABLE IF NOT EXISTS`: solo agrega, **nunca borra**; no hay un
comando de migración aparte). Para llevarte lo que ya hay:

```bash
cd /opt/la-horda
# 1) copia de la base VIEJA (la dirección de la vieja va en la variable, no en el repositorio)
sudo DATABASE_URL='postgresql://…la_vieja…' BACKUP_DIR=/root/migracion bash tools/release/backup.sh
# 2) restaurar en la NUEVA (primero arrancá el programa una vez para que cree las tablas, paso 8; o restaurá directo: la copia trae las tablas)
sudo RESTORE_DATABASE_URL='postgresql://…la_nueva…' DATABASE_URL='' bash tools/release/restore.sh /root/migracion/la-horda-AAAA.dump
```

Comprobá los números que imprime (usuarios, guardados, movimientos de Brasas) contra la base vieja. Después **borrá `/root/migracion`**: tiene contraseñas con hash y correos.

## 5. El archivo de configuración (aquí van las claves)

```bash
sudo install -d -m 750 -o root -g lahorda /etc/la-horda
sudo install -m 640 -o root -g lahorda /opt/la-horda/deploy/la-horda.env.example /etc/la-horda/la-horda.env
sudo nano /etc/la-horda/la-horda.env
```

Completá, como mínimo: `DATABASE_URL` (paso 4), `ALLOWED_ORIGINS` (el **origen** de tu página: `https://fondalstudios.com`, sin barra ni ruta), y si elegiste B,
`GAME_RELAY_URL=wss://red.fondalstudios.com` y `PAYMENTS_NOTIFY_URL` con la dirección de B. **Dejá `MP_ENABLED=0`.** No cargues credenciales de Mercado Pago todavía.
Cada variable está explicada adentro del archivo. Reglas:

- **Nunca** pongas este archivo dentro de `/opt/la-horda` ni lo subas a Git. El preflight avisa en rojo si está en el repositorio o si cualquiera puede leerlo.
- `TRUST_PROXY=1` es obligatorio detrás de nginx/Apache (sin eso, todos los jugadores comparten una IP y se bloquean entre sí).
- **No definas** `ADMIN_USERS` ni `FOUNDERS_JSON` (ver `docs/quality/SEGURIDAD_PRELANZAMIENTO.md`, hallazgo B).

### Economía de ítems V2 (`HORDA_ITEM_ECONOMY`)

La economía de ítems V2 (inventario, oro y gemas de la cuenta en el servidor) se controla con **una sola variable**:

| Situación | Qué pasa |
|---|---|
| Sin `HORDA_ITEM_ECONOMY` y **con base persistente** (`DATABASE_URL`, o `DATA_DIR` + `DATA_PERSISTENT=1`) | **Encendida.** La primera vez que cada cuenta entra se migra su guardado al libro del servidor (con copia íntegra). |
| Sin `HORDA_ITEM_ECONOMY` y **sin base persistente** (servidor gratuito de hoy) | **No actúa.** Todo igual que antes: guardado en el cliente, ranking anterior, Recompensas pendientes. |
| `HORDA_ITEM_ECONOMY=0` | **Apagada** siempre. Contrato anterior. No deshace lo ya migrado: antes de apagarla con cuentas migradas, respaldá cuentas + guardados + operaciones. |
| `HORDA_ITEM_ECONOMY=1` | Igual que sin definir (solo actúa con base persistente). |

Antes del primer encendido con datos reales: respaldo completo (sección 10), prueba en un entorno aislado con una copia, y leer `docs/economy/ITEM_ECONOMY_V2_INTEGRACION.md`. El preflight (`node tools/release/preflight.js`) informa en qué estado queda.

## 6. El servicio (para que arranque solo y se reinicie si se cae)

```bash
cd /opt/la-horda/server && sudo npm ci --omit=dev          # instala las 2 dependencias (pg y ws)
sudo cp /opt/la-horda/deploy/la-horda.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now la-horda
systemctl status la-horda --no-pager     # tiene que decir "active (running)"
curl -s http://127.0.0.1:8787/health     # "LA HORDA relay OK …" y "cuentas: base de datos Postgres OK"
```

Si dice `cuentas: ERROR…` o `fallo`: mirá `journalctl -u la-horda -n 50 --no-pager`. Lo más común: `DATABASE_URL` mal copiada (si dice
`password authentication failed`, quedó mal la clave) o la base no está levantada.
(Alternativa con **pm2** en vez de systemd: `deploy/pm2.ecosystem.config.js`; los scripts de actualización se usan con `RESTART_CMD="pm2 restart la-horda"`.)

## 7. nginx (o Apache), HTTPS y seguridad

### nginx

```bash
sudo install -d /etc/nginx/la-horda
sudo cp /opt/la-horda/deploy/nginx/la-horda-*.inc /etc/nginx/la-horda/
sudo cp /opt/la-horda/deploy/nginx/la-horda-http.conf /etc/nginx/conf.d/
```

- **Si `fondalstudios.com` ya tiene su `server { … }` con HTTPS** (lo normal): abrilo (`/etc/nginx/sites-available/…`) y, **dentro del `server` del puerto 443**, agregá una línea:
  `include /etc/nginx/la-horda/la-horda-locations.inc;` (opción **A**). Para la opción **B** copiá `deploy/nginx/relay-subdominio.example.conf` a
  `/etc/nginx/sites-available/red.fondalstudios.com`, activalo con un enlace en `sites-enabled` y pedí su certificado (abajo).
- **Si es un servidor sin sitio todavía:** `deploy/nginx/fondalstudios.example.conf` es un ejemplo completo (puerto 80 + 443 + juego + servidor).
- Certificado gratis (Let's Encrypt): `sudo apt-get install -y certbot python3-certbot-nginx && sudo certbot --nginx -d fondalstudios.com` (y `-d red.fondalstudios.com` para B).
  El renovador queda programado solo (`systemctl list-timers | grep certbot`).
- Probar y recargar: `sudo nginx -t && sudo systemctl reload nginx`. El `-t` tiene que decir "test is successful".

**Qué hace esta configuración (por si alguien la revisa):** pasa el WebSocket de las salas (`Upgrade`/`Connection`), conserva la **query y las cabeceras
`x-signature` y `x-request-id`** del webhook de Mercado Pago (se comprobó que llegan idénticas al programa), **pisa** `X-Forwarded-For` con la IP real y
**borra** las cabeceras de CDN que un cliente podría falsificar, agrega HSTS/`nosniff`/`Referrer-Policy`/CSP mínima, comprime, y cachea el juego
(portada y service worker sin caché; código 5 min con revalidación; arte 1 día). **Ojo con una cosa que ya me mordió:** el juego conecta el WebSocket a `…/la-horda/red`
**sin barra final** y un WebSocket **no sigue redirecciones**; por eso esa ruta va directo al programa y **no** redirige (probado).

### Apache (alternativa)

```bash
sudo a2enmod ssl proxy proxy_http proxy_wstunnel rewrite headers deflate http2 expires
sudo cp /opt/la-horda/deploy/apache/la-horda.conf /etc/apache2/conf-available/la-horda.conf
# y dentro del <VirtualHost *:443> de fondalstudios.com agregá:   Include /etc/apache2/conf-available/la-horda.conf
sudo apachectl configtest && sudo systemctl reload apache2
```

### Firewall (no te lo saltees)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status      # NO tiene que aparecer el 8787 ni el 5432
```

## 8. Armar el sitio y arrancar (primera vez)

```bash
sudo install -d /var/www/la-horda
sudo bash /opt/la-horda/deploy/update.sh --force
```

Hace, en orden: copia de seguridad (si ya hay datos) → baja el código → instala dependencias → arma el sitio en `/var/www/la-horda/releases/<fecha>-<versión>` →
apunta `/var/www/la-horda/current` ahí → reinicia el servicio → espera que `/health` diga "relay OK". Si algo falla, **vuelve solo a la versión anterior**.
Con `GAME_PERF=1` (viene así) los ~450 scripts pasan a ~25 pedidos y se activa el caché por hash (la carga inicial baja muchísimo).

Probá en el navegador: `https://fondalstudios.com/la-horda/jugar/` (el juego) y `https://fondalstudios.com/la-horda/red/health` (o `https://red.fondalstudios.com/health`).

## 9. Crear la cuenta del dueño (si la base es nueva)

El registro público **no deja** crear `NanoGM` (es el dueño) a propósito. Hay que crearla desde la consola, una sola vez, con una contraseña de **12 a 128 caracteres**
(no queda escrita en ningún archivo ni en el historial):

```bash
cd /opt/la-horda/server
sudo bash -c 'read -rsp "Contraseña nueva para NanoGM (12+ caracteres): " P; echo; printf "%s" "$P" | node --env-file=/etc/la-horda/la-horda.env recover-owner.js'
sudo systemctl restart la-horda      # el dueño se enlaza al arrancar
```

La cuenta de Facu (`FacuGM`) se crea una vez con `FOUNDER_SIGNUP_CODE` (ver `docs/founders/OPERACION.md`) y **se borra esa variable después**.
Si ya migraste la base (4C) y las cuentas existen, **no hace falta**.

## 10. Copias de seguridad y restauración

**Backup manual** (hacelo ahora para ver que anda):

```bash
sudo bash /opt/la-horda/tools/release/backup.sh
ls -lh /var/backups/la-horda
```

Genera `la-horda-AAAAMMDD-HHMMSS.dump`, **lo verifica** (lo lee de vuelta) y recién ahí lo publica; conserva 14 días (`KEEP_DAYS`). Con `BACKUP_ONLY_HORDA=1` (por defecto) copia solo
las tablas `horda_*`, por si la base se comparte con otra aplicación.

**Backup automático (todas las noches)**:

```bash
echo '17 3 * * * root /opt/la-horda/tools/release/backup.sh >> /var/log/la-horda-backup.log 2>&1' | sudo tee /etc/cron.d/la-horda-backup
```

**Sacala del servidor.** Una copia en el mismo disco no sirve si el disco se rompe o te borran el servidor. Copiá `/var/backups/la-horda` a **otro lugar** todos los días
(otro servidor con `rsync`, almacenamiento en la nube con `rclone`, el servicio de snapshots del hosting). Las copias contienen correos y contraseñas con hash:
permisos 600 (el script ya los pone) y, si salen del servidor, **cifradas**.

**Restaurar (probalo ANTES de cobrar, en una base de prueba, no en la real):**

```bash
sudo -u postgres psql -c "CREATE DATABASE lahorda_prueba OWNER lahorda;"
sudo RESTORE_DATABASE_URL='postgresql://lahorda:LA_CLAVE@127.0.0.1:5432/lahorda_prueba' bash /opt/la-horda/tools/release/restore.sh /var/backups/la-horda/la-horda-AAAA.dump
sudo -u postgres psql -c "DROP DATABASE lahorda_prueba;"      # cuando termines de mirar, se borra la de prueba
```

(Con Postgres administrado, creá una base de prueba aparte desde su panel y usá su dirección en `RESTORE_DATABASE_URL`. El script **se niega** a restaurar sobre la base de producción si no le pasás `--production`.)

Muestra cuántos usuarios, guardados y movimientos de Brasas quedaron: tienen que parecerse a los de producción ese día. Para restaurar en **producción** (algo se rompió):
`sudo systemctl stop la-horda` → `sudo bash tools/release/restore.sh ARCHIVO.dump --production` (pide escribir la palabra `RESTAURAR`, y antes hace una copia de lo que hay) →
`sudo systemctl start la-horda`. Se pierde lo ocurrido **después** de la copia: por eso la frecuencia importa.
Si usás **pg_dump/pg_restore** a mano: la versión del cliente tiene que ser igual o mayor que la de la base.

## 11. El preflight (todo junto, verde/amarillo/rojo)

```bash
cd /opt/la-horda
node tools/release/preflight.js \
  --env-file /etc/la-horda/la-horda.env \
  --url https://fondalstudios.com/la-horda/jugar/ \
  --relay https://fondalstudios.com/la-horda/red \
  --dist /var/www/la-horda/current
```

(Con la opción **B**, `--relay https://red.fondalstudios.com`.) Revisa: versión del juego; variables de entorno (**solo dice si están, nunca el valor**);
permisos del archivo de entorno; Mercado Pago (reutiliza `mp-readiness.js` y corre el ensayo con un Mercado Pago **falso**); base persistente
(`persistent:true`); HTTPS, certificado y días para que venza; cabeceras de seguridad, compresión y caché; interruptores `SHOP_MODE` y `POSTGAME_GATE`;
que existan los textos legales, estén al día, enlazados en el juego y publicados; salud del servidor y de la API; CORS; **WebSocket real**; que el webhook llegue
(y rechace lo no firmado); copia de seguridad reciente y espacio en disco; que **no haya credenciales** (patrones `APP_USR-`, `TEST-`, claves privadas,
direcciones de base con contraseña) en los archivos del repositorio; y el peso de la carga inicial.

- **Verde** = bien. **Amarillo** = falta o conviene revisar, pero todavía no bloquea. **Rojo** = bloquea.
- Antes del lanzamiento verás amarillos (por ejemplo "falta el token de Mercado Pago"). Cuando estés por prender el cobro, corrélo con **`--launch`**: lo que falta para
  cobrar pasa a **rojo** y el veredicto dice si podés seguir con el checklist.
- Opciones: `--json` (para otro programa), `--strict` (sale con error también con amarillos), `--offline`, `--skip-rehearsal`, `--no-color`, `--help`. Códigos de salida: 0 sin rojos, 1 con rojos.
- **Verde no significa "listo para cobrar"**: no prueba tu cuenta real de Mercado Pago, ni que la restauración funcione, ni que un abogado aprobó los textos. Eso está en el checklist.

## 12. Actualizar el juego sin perder datos

```bash
sudo bash /opt/la-horda/deploy/update.sh
```

Es seguro repetirlo y avisa "ya está al día" si no hay nada nuevo. Hace: **1)** verifica que el clon no tenga cambios locales; **2)** busca la versión nueva en GitHub y te
muestra qué entra; **3) copia de seguridad (si falla, no sigue)**; **4)** baja el código (solo avance limpio, nunca pisa nada); **5)** instala dependencias; **6)** arma el sitio nuevo en
una carpeta aparte (el sitio que está andando no se toca); **7)** cambia el sitio, reinicia y **verifica**; **8)** registra la actualización y borra sitios viejos (queda el actual y los 4 anteriores).
**Si el servidor no queda sano, vuelve solo a la versión anterior** y te lo dice. Las salas abiertas se cierran al reiniciar: **no actualices con gente jugando** (avisá antes en el evento).

Los datos no se tocan: las tablas se amplían sin borrar nada (probado con Postgres real). Variables útiles: `BRANCH=…` (otra rama), `KEEP_RELEASES=…`, `RESTART_CMD=…` (pm2).

## 13. Volver atrás (rollback)

```bash
sudo bash /opt/la-horda/deploy/rollback.sh --list     # historial de actualizaciones
sudo bash /opt/la-horda/deploy/rollback.sh            # vuelve a la versión anterior a la última actualización
sudo bash /opt/la-horda/deploy/rollback.sh --to abc1234   # a un commit puntual (git log --oneline)
```

Vuelve el **código y el sitio** (reutiliza el sitio anterior si todavía está; si no, lo reconstruye), reinicia y verifica. **No toca la base de datos**: la versión vieja convive con las
tablas que haya creado la nueva (solo se agregan). Si el problema son los **datos**, usá `tools/release/restore.sh` con una copia (paso 10).
Una pantalla del juego rota **no** hace falta resolverla con rollback de base: es solo el sitio.

## 14. Cómo ver si anda (health check) y los registros (logs)

| Qué | Comando | Qué tendrías que ver |
|---|---|---|
| El servicio | `systemctl status la-horda --no-pager` | `active (running)` |
| Salud del programa | `curl -s http://127.0.0.1:8787/health` | `LA HORDA relay OK · protocolo 1 · salas N` y `cuentas: base de datos Postgres OK` |
| Salud de la API (máquinas) | `curl -s http://127.0.0.1:8787/api/health` | `"ok":true,"store":"postgres","persistent":true,"status":"ready"` |
| Desde afuera | `curl -s https://fondalstudios.com/la-horda/red/health` | lo mismo (si no, el problema es nginx/DNS/certificado) |
| Registros en vivo | `journalctl -u la-horda -f` | una línea por evento; `Ctrl+C` para salir |
| Últimos 100 | `journalctl -u la-horda -n 100 --no-pager` | |
| Errores del proxy | `sudo tail -n 50 /var/log/nginx/error.log` | |

Palabras que importan en los registros: `ACCOUNTS_READY` (base conectada), `WALLET_PURCHASE` (compra acreditada), `PAYMENT_STATUS_REVIEW` (un pago en estado raro, mirarlo en Mercado Pago),
`WALLET_REVERSAL` (reembolso o contracargo aplicado; `shortfall` > 0 = el jugador ya había gastado Brasas), `PAYMENT_REVERSAL_NOT_CREDITED`, `LOGIN_FAILED`, `RATE_LIMIT`, `ACCOUNTS_ERROR`.
**Los registros no guardan contraseñas, claves, correos ni el texto del chat** (solo identificadores numéricos y metadatos). Conviene que el diario del sistema sea persistente
(`sudo mkdir -p /var/log/journal && sudo systemctl restart systemd-journald`) y acotado (`SystemMaxUse=500M` en `/etc/systemd/journald.conf`).
Recomendado: un chequeo externo gratis (UptimeRobot, Better Stack…) que abra `…/la-horda/red/health` cada 5 minutos y te avise por correo si no dice "relay OK".

## 15. Direcciones, `?server=` y `NET_TRUSTED_HOSTS` (qué es cada cosa)

- **Página del juego** (`GAME_SITE_URL`): `https://fondalstudios.com/la-horda/jugar/`. Se usa en metadatos y vista previa al compartir. **`ALLOWED_ORIGINS`** es el **origen** de esa página
  (`https://fondalstudios.com`, sin ruta): es lo que el servidor compara con la cabecera `Origin` del navegador. Si el juego también se abre desde `www.`, sumalo (separado por coma).
- **Servidor de salas** (`GAME_RELAY_URL`): lo escribe el armado en `js/net/net-config.js` (`serverUrl`) del **sitio publicado** (no del repositorio). Las cuentas y la tienda usan esa misma
  dirección (`https://…` en vez de `wss://…`).
- **`?server=wss://otro-host`** en la dirección del juego: para probar otro servidor sin reconstruir. El juego **no usa** un servidor que no conozca hasta que el jugador acepte un aviso en pantalla
  (protege contra enlaces que mandan usuario y clave a un servidor ajeno). `?api=` hace lo mismo para la API.
- **`NET_TRUSTED_HOSTS`** vive en **`js/net/net-core.js` (línea 48)**: hoy `["fondalstudios.com", "la-horda-relay.onrender.com"]`. **No hay que editarlo**: `netHostOfficial()` también confía en el nombre de host del
  `serverUrl` del propio sitio, y `deploy/update.sh` lo reescribe con `GAME_RELAY_URL`. Resultado: con **A** (`fondalstudios.com`) ya está en la lista; con **B** (`red.fondalstudios.com`) lo confía
  el armado solo. Solo hace falta tocar esa lista si servís el repositorio **sin armarlo** (por ejemplo, con `python -m http.server`) contra un servidor de otro nombre: en ese caso
  se acepta el aviso en pantalla (vale para esa pestaña) o se agrega el host a esa lista **en un cambio aparte** (esta tarea no modifica `js/net/*`).
- Un host oficial con **otro puerto** o `ws://` no cuenta como oficial: el servidor tiene que ir por 443.
- **Si el sitio estático se sirve desde otro lugar que el relay** (el hosting estático del proveedor, GitHub Pages, Render, un CDN): armalo con `GAME_RELAY_URL=wss://<dirección pública del relay>` y
  `GAME_SITE_URL=https://<dirección del sitio>/`, subí el contenido de `/var/www/la-horda/current` (o de `dist/`) a ese lugar, y en el relay poné `ALLOWED_ORIGINS=https://<origen del sitio>`.
  El relay no sirve archivos del juego (solo `/health`, `/api/*` y el WebSocket). El service worker y los enlaces `legal/…` son relativos a la página, así que funcionan bajo cualquier ruta.
- Este repositorio **no trae** `Dockerfile` ni `fly.toml`; sí `render.yaml` (para Render). El servicio propio se define con `deploy/la-horda.service` o `deploy/pm2.ecosystem.config.js`.

## 16. Si algo sale mal

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| El juego dice "servidor no disponible" / "Crear sala" no hace nada | WebSocket cortado por el proxy, o `ALLOWED_ORIGINS` sin tu dominio | `node tools/release/preflight.js --relay …` (mira WebSocket y CORS); `journalctl -u la-horda` busca `origin_rejected` |
| 502 Bad Gateway | el programa no está corriendo | `systemctl status la-horda`; `journalctl -u la-horda -n 50` |
| Los jugadores "se bloquean" entre sí al iniciar sesión | falta `TRUST_PROXY=1` (todos parecen la misma IP) | ponerlo en el archivo de entorno y `sudo systemctl restart la-horda` |
| "Cuentas temporalmente no disponibles" | sin base persistente (`REQUIRE_PERSISTENT_ACCOUNTS=1`) o base caída | revisá `DATABASE_URL`; `curl …/health` segunda línea |
| `deploy/update.sh` dice "Hay cambios locales" | alguien tocó archivos en `/opt/la-horda` | `git -C /opt/la-horda status`; descartá con `git -C /opt/la-horda checkout -- .` (ojo: pierde esos cambios) |
| La actualización "volvió sola" | el servidor nuevo no arrancó | mirá `journalctl -u la-horda` (el error está ahí) y avisá; los datos están intactos |
| Webhook de Mercado Pago "no llega" | HTTPS roto, ruta mal, o `MP_ENABLED=0` no afecta el webhook (igual se acredita) | preflight (fila "Webhook de pagos"); panel de Mercado Pago → Webhooks → ver entregas |
| Certificado vencido | falló la renovación | `sudo certbot renew`; `systemctl list-timers \| grep certbot` |
| Se llenó el disco | sitios viejos o copias | `KEEP_RELEASES` menor; `KEEP_DAYS` menor; `du -sh /var/www/la-horda /var/backups/la-horda` |

**Apagado de emergencia del cobro:** `sudo nano /etc/la-horda/la-horda.env` → `MP_ENABLED=0` → `sudo systemctl restart la-horda`. La tienda pasa a "Muy pronto" al instante; los pagos ya hechos se
siguen acreditando por el webhook (no lo apagues con pagos pendientes).

## 17. Lo que este documento NO resuelve (decisiones tuyas)

- Credenciales y cuenta de Mercado Pago; textos legales aprobados por un abogado; correo de soporte real; impuestos y facturación (ver el checklist).
- Capacidad: un solo proceso Node. La medición existente es de **50 conexiones y 13 salas en una máquina local** (`docs/commercial/capacity-local.json`); no hay medición en este servidor. Mirá `tools/net-test/capacity.js` y probalo antes de un evento.
- Migrar cuentas desde Fly (ver "Decisión previa").
- Monitoreo y alertas externas, y la copia de seguridad **fuera** del servidor.
