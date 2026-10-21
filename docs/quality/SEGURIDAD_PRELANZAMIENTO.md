# Seguridad antes de cobrar: revisión del servidor y del cliente

Fecha: 21 de octubre de 2026. Rama `claude/listo-para-cobrar`. Revisión **manual** hecha por Claude sobre el código que sale a producción
(`server/*.js` y las partes del cliente que muestran texto ajeno). No es una auditoría externa ni un test de penetración: **no reemplaza** que
alguien de seguridad mire el servidor ya desplegado. La skill `security-review` revisa los cambios pendientes de una rama y los cambios de
esta rama son chicos (dos variables opcionales en `relay.js`); por eso la revisión se hizo sobre el código completo, a mano.

Cómo leer las severidades: **ALTA** = arreglar antes de prender `MP_ENABLED=1`. **MEDIA** = arreglar o decidir a propósito antes de abrir al
público. **BAJA** = riesgo chico o ya mitigado. **INFO** = para saber.

## 1. Lo que se probó (y qué dio)

Se levantó el servidor real (`server/relay.js`) contra un Postgres local de ensayo y se le tiraron 49 pedidos de ataque simples
(guion de prueba que no queda en el repositorio; los resultados están acá). **48 de 49 salieron como se esperaba** y el que parecía fallar
no era una falla (ver "usuario con <script>" más abajo):

| Qué se probó | Resultado |
|---|---|
| Registro con usuario corto, clave corta, clave igual al usuario, correo inválido | 400 en todos |
| Registro con JSON roto / cuerpo de 10 KB | 400 / 413 |
| Usuario repetido con otra capitalización | 409 |
| Registrar `NanoGM` (dueño) o `FacuGM` (fundador) sin código | 403 (reservados) |
| `/api/me` sin sesión y con un token falso | 401 |
| 8 rutas de administración (`/api/admin/*`, `/api/gm/*`) sin sesión y como jugador común | 401 y 403 |
| Comprar Brasas con los pagos apagados | 501 (no abre nada); sin sesión, 401 |
| Webhook de pagos sin firma, con firma falsa, por GET | 400, 400, 404 |
| Origen ajeno (`Origin: https://sitio-ajeno`) | 403; origen permitido: `Access-Control-Allow-Origin` exacto, nunca `*` |
| Guardado de 600 KB / formato inválido | 413 / 400 |
| Nombre visible con `<img onerror=...>` | los `<` y `>` se sacan al guardar |
| 8 contraseñas mal seguidas | 429 (y el ingreso correcto también queda frenado 15 min) |
| Telemetría con un evento inventado | 400; los campos extra (como un correo) no se guardan |
| `npm audit --omit=dev` en `server/` | 0 vulnerabilidades (dependencias: `pg`, `ws`) |

Pruebas automáticas existentes, comparadas con `origin/main` (corridas **antes** de mis cambios y **después**): `npm test` en `server/` (10 archivos
de prueba encadenados, incluido `test-payments-mp.js`): **189 comprobaciones `PASS` en ambos y código de salida 0**; `server/test-postgres.js` contra
un Postgres real local (**bien** antes y después; no corre dentro de `npm test` y conviene correrlo en cada cambio de base);
`node tools/release/mp-flow-test.js` (**27 comprobaciones, bien**); y de `tools/alpha/` los que no necesitan navegador (`rooms-unit`,
`event-receipts-test`, `public-defaults`, `account-environments`, `services-test`): **todos PASS**. Los `tools/alpha/*` con navegador no se corrieron
(esta rama no toca esos archivos).

## 2. Qué se corrigió en esta rama (chico y seguro)

1. **`ALLOWED_ORIGINS_STRICT=1`** (nuevo, opcional, apagado por defecto). Hoy el servidor, aunque configures `ALLOWED_ORIGINS`, **suma siempre** GitHub
   Pages y `raw.githack.com`. Este último sirve páginas de *cualquier* repositorio de GitHub: una página ajena podría usar la API (intentar
   registros o ingresos desde el navegador de una víctima). Con `ALLOWED_ORIGINS_STRICT=1` solo vale tu lista. La plantilla de `deploy/` ya lo trae en 1.
2. **`HOST=127.0.0.1`** (nuevo, opcional). Hace que el servidor escuche solo en el propio equipo, así nginx/Apache son la única puerta. Importa por el
   punto A de abajo. La plantilla de `deploy/` ya lo trae.
3. **Proxy** (`deploy/nginx`, `deploy/apache`): **pisa** `X-Forwarded-For` con la IP real y **borra** `CF-Connecting-IP`, `True-Client-IP` y
   `Fly-Client-IP` (ver punto A). Probado con los dos servidores web: el programa recibe la IP verdadera aunque el cliente mande cabeceras falsas.

## 3. Hallazgos

### A. IP falsificable si el servidor queda expuesto con `TRUST_PROXY=1` — ALTA (mitigada por la configuración de `deploy/`)

`clientIp()` (en `server/accounts.js`) con `TRUST_PROXY=1` toma la IP de `cf-connecting-ip`, `true-client-ip`, `fly-client-ip` o el **primer**
valor de `x-forwarded-for`. Todos los frenos de abuso (8 contraseñas mal por usuario y 30 por IP cada 15 min, 10 registros por hora por IP, 300
pedidos por minuto por IP) se miden por esa IP. Si alguien llega **directo** al programa (puerto 8787 abierto) o el proxy **agrega** a la cabecera
en vez de pisarla, puede cambiar su "IP" en cada pedido y saltearse el freno de registros y de contraseñas por IP.
*Mitigación hecha:* `HOST=127.0.0.1`, proxy que pisa y limpia cabeceras, y el preflight no puede verlo desde afuera: **hay que cerrar el puerto
8787 en el firewall** (`ufw allow 80,443/tcp` y nada más). Si ponés Cloudflare adelante, hay que permitir solo las IP de Cloudflare.
*Sin `TRUST_PROXY=1` detrás de un proxy pasa lo contrario:* todos los jugadores comparten una IP y se bloquean entre sí; el preflight lo avisa.
*Mejora de código posible (no hecha, no es chica):* leer solo la cabecera que fija el proxy y exigir que el pedido venga de `127.0.0.1`.

### B. `ADMIN_USERS` entrega el panel de dueño a quien registre ese nombre primero — ALTA si se usa, BAJA sin usarla

Con `ADMIN_USERS` definido, el dueño se decide **por nombre de usuario** (`isOwner` compara el nombre) y el registro público no reserva esos
nombres. Si el nombre todavía no existe, cualquiera puede crearlo y quedar como administrador. Con la configuración recomendada (variable sin
definir, dueño por `operator-config.json` y por **ID** de cuenta) no pasa. *Mitigación:* la plantilla de entorno dice "no la crees" y el
preflight lo marca (amarillo). *Arreglo de código sugerido:* con `ADMIN_USERS`, reservar esos nombres en el registro (pide ajustar `test-admin`
y los tests de cuentas: no es chico).

### C. Servidor nuevo: nadie es dueño hasta crear la cuenta de `NanoGM` — MEDIA (de operación)

El registro público bloquea el nombre `NanoGM`, y `FacuGM` exige `FOUNDER_SIGNUP_CODE`. En una base nueva hay que crear el dueño con
`server/recover-owner.js` (por consola, con la contraseña por entrada estándar, nunca por argumento). Está en la guía de despliegue (paso 9).
Es seguro por diseño (nadie más puede tomar el nombre), pero si se olvida, no hay panel.

### D. El consentimiento de términos no se guarda en el servidor — MEDIA (legal)

La casilla de aceptación al crear cuenta y el aviso de la primera compra (`js/ui/legal.js`) guardan solo versión y fecha **en el navegador**. No
hay constancia en el servidor de quién aceptó qué ni cuándo. Para que valga como prueba hay que mandar `{termsVersion, acceptedAt}` en
`POST /api/register` y guardarlo en la tabla de usuarios: el envío es del lado de `js/net/account.js` (que esta tarea tenía prohibido tocar) y la
columna es una migración chica en `server/accounts.js`. **Decisión tuya/del abogado:** si necesitás la constancia, se hace como un cambio aparte.

### E. No hay forma de borrar o exportar una cuenta — MEDIA (legal, Ley 25.326)

La política de privacidad borrador ofrece acceso, corrección y supresión de datos y dice "verificar que exista la función". **No existe** un
endpoint ni un botón. Hasta que exista, el procedimiento es manual y **con copia de seguridad previa**. Borrar al usuario arrastra (por
`ON DELETE CASCADE`) sesiones, guardado y ranking; el saldo y el libro de Brasas **no** se borran solos (conviene conservar el registro de
compras por obligaciones contables: consultalo con el contador):

```sql
-- 1) bash tools/release/backup.sh     2) psql "$DATABASE_URL"  (con el ID de la cuenta, no con el nombre)
BEGIN;
DELETE FROM horda_users WHERE id = 123;   -- sesiones, guardado y ranking se van con la cuenta
-- si hay que borrar también la billetera: DELETE FROM horda_wallet WHERE user_id = 123;  (el libro, solo si el contador lo permite)
COMMIT;
```

### F. Sin recuperación de contraseña ni correo verificado — MEDIA

Hoy "cuenta verificada" = sesión + correo cargado, sin confirmación por mail (ya lo dice `SALIDA_AL_MERCADO.md`). Quien olvida la contraseña pierde
la cuenta (puede crear otra). Un correo mal escrito recibe los comprobantes de otra persona. Antes de escalar conviene agregar mail de confirmación.

### G. Una sesión robada vale 60 días y no hay "cerrar todas las sesiones" — MEDIA

La sesión es un código aleatorio de 256 bits, se guarda solo su huella, vence a los 60 días sin uso (se renueva usándola) y `logout` borra solo la
sesión actual. No hay cambio de contraseña ni "cerrar sesión en todos lados". Un código robado del navegador (por ejemplo por un XSS futuro)
sirve hasta que venza. Las contraseñas se guardan con scrypt (N=16384) y sal única: bien.

### H. Bloqueo de cuenta por intentos fallidos se puede usar para molestar — BAJA

8 contraseñas equivocadas seguidas para un usuario lo bloquean 15 minutos, y **un atacante que sepa el nombre** puede repetirlo para dejar a esa
persona sin entrar. Es el costo de frenar la fuerza bruta; un freno por IP + usuario lo mejoraría. No es urgente.

### I. Seguridad de cabeceras y CSP — MEDIA/INFO

El juego usa scripts y estilos en línea, así que **no se puede** poner una CSP estricta sin romperlo. La plantilla de `deploy/` agrega una CSP mínima
(`frame-ancestors`, `base-uri`, `object-src`), HSTS, `nosniff`, `Referrer-Policy`, `X-Frame-Options` y `Permissions-Policy`. El código sí escapa los
textos ajenos que revisé (chat de sala, nombres en sala/ranking/intercambio: `_chatEsc`, `_lbEsc`, `_trEsc`, `guideEsc`), y el servidor saca `<` y
`>` de nombres y chat. **No se revisó línea por línea todo `innerHTML` del cliente** (hay cientos): un XSS en otra pantalla robaría el token de
`localStorage`. Recomendación: una pasada dedicada con un linter de `innerHTML` antes de abrir al público.

### J. Telemetría pública puede ensuciar las métricas — BAJA

`POST /api/telemetry` no pide sesión (es anónima a propósito): tiene tope de 60 por minuto por IP, eventos de una lista cerrada y valores
validados, y la tabla de "conectados ahora" tiene tope de 10.000. Alguien puede inflar contadores. Por eso las **compras** se miden del libro del
servidor, no de la telemetría.

### K. Webhook de pagos — BAJA (bien diseñado)

Firma HMAC de Mercado Pago comparada en tiempo constante; **no se acredita por lo que dice el webhook**: se consulta el pago a la API de Mercado Pago, se
exige cuenta vendedora, modo (`live_mode`), importe en pesos y paquete firmado por el servidor; acreditación idempotente (referencia única);
reembolso/contracargo revierten; tope de 40 consultas por minuto, aplicado **después** de verificar la firma. Detalles menores: no hay tolerancia
de tiempo en la firma (un reenvío del mismo aviso es inofensivo por la idempotencia), y una ráfaga de más de 40 avisos legítimos por minuto
recibe 503 y Mercado Pago reintenta. Los límites de tamaño y los códigos de error son correctos.

### L. `/health` y `/api/health` son públicos y muestran el último error de la base — BAJA

Sirve para diagnosticar, pero el texto del error de conexión (host, puerto) queda a la vista de cualquiera. No incluye contraseñas (el controlador de
Postgres no las imprime). Si te molesta, poné `/health` detrás de una regla de IP en nginx para tu casa y para el chequeo de uptime.

### M. Datos personales en la base — MEDIA (legal/operación)

Los correos están en texto claro en `horda_users`; el cifrado en disco depende del servidor/proveedor. Las copias de seguridad contienen contraseñas
con hash, correos y guardados: **guardalas con permisos 600/700, cifralas si salen del servidor** y ponele plazo de vida (`KEEP_DAYS`).

### N. Guardado editable por el cliente — INFO (ya conocido)

El oro y los objetos del guardado los controla el cliente; las **Brasas viven en el servidor** y se compran con dinero real solo por el webhook. La fuga
de skins de autor por oro quedó cerrada en `main` (`shopBuySkinGold` devuelve "solo con Brasas"). El servidor además corrige derechos de campeones
exclusivos al guardar (`entitlements`). No prometas antifraude completo en el marketing.

### O. Registro sin CAPTCHA — BAJA

10 registros por hora por IP (configurable). Una red de IP distintas puede crear cuentas en masa; el límite del ranking y el de pagos por cuenta
siguen valiendo. Mirá `metrics-report.js` (altas por día) los primeros días.

## 4. Lo que no se pudo revisar

- El servidor **real** de Fondal (firewall, versiones, permisos): se probó en un entorno local equivalente.
- El flujo con **Mercado Pago real** (sandbox y producción): solo el ensayo con un Mercado Pago falso.
- Carga con muchos jugadores (`tools/net-test/*` mide el relay; no hay prueba de carga de las cuentas con Postgres remoto).
- Toda la superficie `innerHTML` del cliente (ver I) y los `tools/alpha/*` que necesitan navegador.

## 5. Antes de prender `MP_ENABLED=1` (lo de seguridad)

- [ ] Firewall: solo 22 (con clave, no contraseña), 80 y 443. **El 8787 cerrado.**
- [ ] `ALLOWED_ORIGINS` con tu dominio y `ALLOWED_ORIGINS_STRICT=1`, `TRUST_PROXY=1`, `HOST=127.0.0.1`.
- [ ] `ADMIN_USERS`, `FOUNDERS_JSON`, `SIM_LATENCY_MS`, `MP_API_BASE` **sin definir**.
- [ ] Archivo de entorno en `/etc/la-horda/` con modo 640 y fuera de Git.
- [ ] El preflight en verde (`node tools/release/preflight.js --launch ...`) y el escaneo de secretos sin hallazgos.
- [ ] Decidido a propósito: consentimiento en servidor (D), borrado de cuentas (E) y correo verificado (F).
