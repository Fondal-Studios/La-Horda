# Checklist de la última prueba (antes de cobrar con Mercado Pago)

Fecha: 21 de octubre de 2026. Para el dueño. **`MP_ENABLED` está en `0` y no se prende hasta cerrar esta lista.**
La guía técnica es `docs/commercial/DESPLIEGUE_FONDAL.md`; la de Mercado Pago, `docs/commercial/MERCADO_PAGO_PASO_A_PASO.md`;
la de seguridad, `docs/quality/SEGURIDAD_PRELANZAMIENTO.md`.

**Cómo usarla.** Hacé la Parte 2 en orden, tildando. Después de cada bloque corré el chequeo automático:

```bash
node /opt/la-horda/tools/release/preflight.js --env-file /etc/la-horda/la-horda.env \
  --url https://fondalstudios.com/la-horda/jugar/ --relay https://fondalstudios.com/la-horda/red --dist /var/www/la-horda/current
```

Antes de prender el cobro real, el mismo comando con **`--launch`**: lo que falta para cobrar pasa a rojo. **Verde no es "listo"**: hay cosas que solo vos podés comprobar (están acá).

Hay dos momentos de "prender":
- **Sandbox** (`MP_ENABLED=1` con `MP_MODE=sandbox`): se paga con usuarios de prueba, no se mueve plata. Necesita base persistente igual que el cobro real.
- **Real** (`MP_ENABLED=1` con `MP_MODE=live`): plata de verdad. Solo después de **todo** lo de abajo.

---

## PARTE 1 · Ya lo hizo Claude (con cómo se comprobó)

Todo esto está en la rama `claude/listo-para-cobrar` y se probó en un entorno local equivalente (Ubuntu, Postgres 16, nginx 1.24, Apache 2.4, Node 22). **Nada se probó en el servidor real.**

- [x] **Guía de despliegue** paso a paso para el servidor de Fondal: `docs/commercial/DESPLIEGUE_FONDAL.md`.
- [x] **Archivos listos en `deploy/`**: `la-horda.service` (systemd, verificado con `systemd-analyze`), `pm2.ecosystem.config.js`, `la-horda.env.example` (todas las variables, sin secretos),
      `nginx/*` y `apache/la-horda.conf` (verificados con `nginx -t` y `apachectl configtest` y **corriendo**: el WebSocket de salas conecta con y sin barra final, el webhook llega al programa con la
      **query y las cabeceras `x-signature`/`x-request-id` intactas**, `X-Forwarded-For` se pisa con la IP real y las cabeceras de CDN falsas se borran, HTTPS-headers y caché medidos), `update.sh`, `rollback.sh`.
- [x] **Backup y restauración** (`tools/release/backup.sh`, `restore.sh`) probados con un Postgres real: copia verificada, restauración en una base de prueba con los números correctos, restauración "a producción" con
      confirmación y copia previa, y rechazo si apuntás a producción sin `--production`. **No se pasan claves por línea de comandos** (no se ven en `ps`).
- [x] **Actualizar sin perder datos** (`deploy/update.sh`): probado con un origen Git local: copia → bajar → instalar → armar sitio → reiniciar → verificar; con una versión que **no arranca**, volvió **sola** a la anterior
      con los datos intactos; `rollback.sh` manual y `--list` probados.
- [x] **Preflight total** (`tools/release/preflight.js`): ~90 comprobaciones en una corrida (verde/amarillo/rojo), no imprime secretos, detecta credenciales en el repo (probado con un hallazgo falso), prueba WebSocket,
      CORS y webhook reales contra un servidor local detrás de nginx y de Apache.
- [x] **Legal y soporte dentro del juego** (`js/ui/legal.js`, `css/legal.css`, `js/data/legal-config.js`, `legal/*.html`): enlaces a Privacidad, Términos y Reembolsos en la portada, en Opciones y en la tienda de Brasas; casilla
      obligatoria al crear cuenta (edad y menores); aviso de aceptación antes de la **primera compra**; páginas `legal/*.html` generadas desde `docs/legal/` con el aviso **"BORRADOR, revisar con abogado"** bien visible. Probado en navegador
      a **844×390 y 667×375** (`node tools/release/legal-test.js`: 18 comprobaciones) y `tools/ux/test-text-overflow.js` sigue en PASS. No recolecta datos nuevos.
- [x] **Seguridad**: revisión manual del servidor y partes del cliente, 49 sondeos de ataque contra el servidor real local (48 bien; el otro era una expectativa mía equivocada), dos mejoras opcionales (`ALLOWED_ORIGINS_STRICT`, `HOST`) con su prueba
      (`server/test-origins-strict.js`, ya dentro de `npm test`), `npm audit` sin vulnerabilidades. Resultados y pendientes con severidad en `docs/quality/SEGURIDAD_PRELANZAMIENTO.md`.
- [x] **Métricas**: `tools/release/metrics-report.js` (solo lectura) resume altas, activas, retención aproximada, compras, pagadores, conversión, ARPPU y telemetría opt-in. Probado con Postgres real y con archivos.
- [x] **Pruebas heredadas, antes y después de mis cambios, mismo resultado**: `npm test` en `server/` (189 comprobaciones `PASS`, salida 0), `server/test-postgres.js` (Postgres real), `tools/release/mp-flow-test.js` (27), y de `tools/alpha/` los que no necesitan navegador.

**Lo que Claude NO pudo ni quiso hacer:** cargar credenciales, llamar a la API real de Mercado Pago, activar pagos, tocar `js/net/*`, tocar el relay de Fly.io, ni probar nada en tu servidor. Tampoco redactó ni aprobó textos legales: son **borradores**.

---

## PARTE 2 · Lo hacés vos (en este orden)

### Bloque 1 · Servidor (guía `DESPLIEGUE_FONDAL.md`, pasos 1 a 8)
- [ ] Decidí la dirección del servidor de salas: **A** (`/la-horda/red`) o **B** (`red.fondalstudios.com`, recomendada para ensayar). Respondé: ¿hoy `https://fondalstudios.com/la-horda/red/health` lo atiende Fly?
- [ ] Instalados Node 22, nginx (o Apache), git, cliente de Postgres, ufw. `node -v` dice `v22.x`.
- [ ] Clon en `/opt/la-horda` en la rama correcta (`main` cuando se fusione).
- [ ] Archivo `/etc/la-horda/la-horda.env` creado desde `deploy/la-horda.env.example`, modo 640, **fuera** de Git. `MP_ENABLED=0`.
- [ ] Servicio `la-horda` activo y habilitado (`systemctl status la-horda`).
- [ ] nginx/Apache configurado, `nginx -t` OK, HTTPS con certificado válido y renovación automática.
- [ ] Firewall: solo 22, 80, 443. **Ni el 8787 ni el 5432 abiertos** (`sudo ufw status`).
- [ ] `sudo bash /opt/la-horda/deploy/update.sh --force` terminó en "LISTO".
- [ ] `https://fondalstudios.com/la-horda/jugar/` abre el juego y `…/red/health` dice "relay OK".
- [ ] **Preflight sin rojos** (los amarillos de Mercado Pago son normales todavía).

### Bloque 2 · Datos y copias de seguridad (**fecha límite 28/10/2026** si sigue la base gratuita de Render)
- [ ] Base **Postgres persistente** elegida (4A en el servidor o 4B administrada) y `DATABASE_URL` cargada. `…/api/health` dice `"persistent":true,"store":"postgres"`.
- [ ] Si hay cuentas en la base vieja: migradas con `backup.sh` + `restore.sh` y los números coinciden.
- [ ] Backup manual hecho (`sudo bash tools/release/backup.sh`) y backup **automático** programado (cron).
- [ ] Las copias se **sacan del servidor** a otro lugar todos los días (y están cifradas si salen).
- [ ] **Restauración probada** en una base de prueba con `restore.sh` y los números parecen reales. Anotá la fecha: ______
- [ ] Chequeo externo de disponibilidad (UptimeRobot o similar) sobre `…/red/health` con aviso por correo.

### Bloque 3 · Cuentas especiales
- [ ] Cuenta del dueño `NanoGM` creada con `recover-owner.js` (paso 9) y el servicio reiniciado; entrás al panel de administración.
- [ ] `FacuGM` creada con `FOUNDER_SIGNUP_CODE` (si corresponde) y la variable **borrada** después.
- [ ] `ADMIN_USERS`, `FOUNDERS_JSON`, `SIM_LATENCY_MS`, `MP_API_BASE` **no definidas** en el archivo de entorno (el preflight lo confirma).

### Bloque 4 · Legal y soporte (hay que hacerlo antes de cobrar; **no es asesoramiento legal**)
- [ ] **Correo de soporte real** activo, y alguien que lo lea. Cargado en `js/data/legal-config.js` (`supportEmail`). Probaste mandarte un correo y contestarlo.
- [ ] Textos de `docs/legal/*.md` revisados por un **abogado**; completados **todos** los `[CORCHETES]` (razón social, CUIT, domicilio, edad mínima, plazos, botón de arrepentimiento si corresponde, proveedores, fechas).
- [ ] Definida la **edad mínima** (hoy provisoria: 13) y la mecánica de autorización de adultos; actualizada en `legal-config.js` (`minAge`).
- [ ] Corriste `node tools/release/build-legal.js`, subiste el cambio y actualizaste el servidor (`update.sh`). Las páginas ya no dicen "borrador" (`draft: false` **solo después** de la aprobación del abogado).
- [ ] Decidido: ¿hace falta **guardar en el servidor** quién aceptó los términos y cuándo? (hoy solo queda en el navegador; hallazgo D de seguridad). Si sí: pedir ese cambio aparte.
- [ ] Decidido el **procedimiento para borrar o exportar una cuenta** (hoy no hay botón; procedimiento manual en `SEGURIDAD_PRELANZAMIENTO.md`, hallazgo E). Comunicalo en la política de privacidad.
- [ ] Contador consultado: facturación, impuestos, y cuánto tiempo guardar el registro de compras.
- [ ] Derechos del arte, música y personajes revisados (pendiente de revisión humana según `LAUNCH.md`).

### Bloque 5 · Mercado Pago en **sandbox** (guía `MERCADO_PAGO_PASO_A_PASO.md`, secciones 2 a 7)
- [ ] Cuenta vendedora de Mercado Pago con identidad validada; aplicación "La Horda" (Checkout Pro) creada.
- [ ] Usuarios de prueba (vendedor y comprador) creados.
- [ ] Variables de **prueba** cargadas en `/etc/la-horda/la-horda.env` (`MP_MODE=sandbox`, token, collector del vendedor de prueba, secretos de 32+ caracteres, `MP_ARS_PER_USD`, `PAYMENTS_NOTIFY_URL`/`SUCCESS_URL` con **tu** dirección) y servicio reiniciado.
- [ ] Webhook configurado en Mercado Pago con la **URL pública** y su clave secreta cargada como `MP_WEBHOOK_SECRET`.
- [ ] `node tools/release/mp-readiness.js` sin `[FALTA]`. Preflight: la fila "Webhook de pagos" en verde.
- [ ] `MP_ENABLED=1` (solo en sandbox) y probados, anotando el resultado de cada uno: [ ] aprobado acredita **una vez** · [ ] pendiente no acredita · [ ] rechazado no acredita · [ ] cerrar la ventana no pasa nada ·
      [ ] reenvío del aviso no acredita dos veces · [ ] devolución descuenta las Brasas.
- [ ] Al pagar, el juego muestra primero **el aviso de primera compra** (casilla) y después va a Mercado Pago; la segunda compra ya no pregunta.
- [ ] `MP_ENABLED=0` otra vez al terminar la prueba sandbox.

### Bloque 6 · Probar el juego en el servidor real (con tus propios dispositivos)
- [ ] **Celular horizontal** (el tamaño más chico, ~844×390): portada con enlaces legales visibles, Opciones con "Legal y soporte", tienda de Brasas con el aviso y los enlaces. Nada tapado ni cortado.
- [ ] Los tres enlaces legales abren, se leen bien en el celular y muestran el aviso de borrador mientras lo sean.
- [ ] **Crear cuenta**: sin marcar la casilla no deja; marcada, crea. Se guarda el progreso en la nube.
- [ ] Mismo usuario en **otro dispositivo**: aparece el mismo progreso.
- [ ] **Sala multijugador** con dos celulares: crear, unirse con el código, jugar una partida corta. (El WebSocket pasa por tu proxy: acá se ve de verdad.)
- [ ] "Jugar como invitado" sigue andando sin conexión.
- [ ] Mirar `journalctl -u la-horda -f` mientras tanto: sin errores nuevos.

### Bloque 7 · Operación el día del cobro
- [ ] Quién mira **cada compra** la primera semana (nombre y horario): ______
- [ ] Proceso de devolución ensayado una vez (`MERCADO_PAGO_PASO_A_PASO.md` §12) y de "pagué y no tengo las Brasas".
- [ ] Cómo **apagar** en una emergencia: `MP_ENABLED=0` + `sudo systemctl restart la-horda` (lo sabe quien esté de guardia).
- [ ] Moderación del chat: hoy la lista de palabras está vacía por defecto (`CHAT_BLOCKLIST`); decidir si cargarla (hay menores jugando).
- [ ] `node tools/release/metrics-report.js --env-file /etc/la-horda/la-horda.env` corre (ver Bloque 9).

### Bloque 8 · Pasar a producción (plata real)
- [ ] Cuenta de Mercado Pago **activada para cobrar** y credenciales de **producción** cargadas (`MP_MODE=live`, token, public key, tu ID de usuario real, clave secreta del webhook de producción). `MP_ENABLED` todavía `0`.
- [ ] `node tools/release/mp-readiness.js --strict` sin `[FALTA]`.
- [ ] **`node tools/release/preflight.js --launch …` sin rojos** y con los amarillos revisados a propósito (en especial: `SHOP_MODE` y `POSTGAME_GATE`, que **tenés que elegir**; hoy `demo` y `open`).
- [ ] Escaneo de secretos del preflight en verde (nada pegado en el repo).
- [ ] `MP_ENABLED=1` y **una compra real chica** con tu propia tarjeta: llegan las Brasas, y **devolvés** esa compra desde Mercado Pago: se descuentan. Los dos movimientos aparecen en el libro de la cuenta.
- [ ] Recién ahí: abierto al público (alfa abierta con cobro, `SALIDA_AL_MERCADO.md` §3 y §7).

### Bloque 9 · Métricas (qué hay y qué falta)
**Hay:** altas por día, cuentas activas, retención aproximada, compras, pagadores, conversión, ARPPU y reembolsos (`metrics-report.js`, desde la base, solo lectura) + telemetría opt-in del juego (arranques, tutorial, partidas, victorias/derrotas).
**Falta, exacto:**
- [ ] **D1/D7 reales.** El servidor guarda alta, último ingreso y última subida de guardado, no los días que jugó cada cuenta. El reporte da una cota alta ("volvió ≥ N días después"). Para el clásico hace falta una tabla chica `horda_activity(user_id, day)` que se anote al ingresar y al guardar (cambio en `server/accounts.js`).
- [ ] **Embudo de tienda.** No existen los eventos `shop_opened` ni `checkout_started`. Para agregarlos: **(1)** `js/net/alpha-services.js`, lista `knownEvents` (sumar los dos nombres; **es `js/net/*`, que esta tarea tenía prohibido tocar**); **(2)** `server/game-master.js`, conjunto `EVENTS` (sumar los dos); **(3)** `js/ui/shop-ui.js`: emitir `shop_opened` al mostrar la pestaña Brasas y `checkout_started` antes de `premiumCheckout`.
      Las **compras** no dependen de eso: salen del libro del servidor.
- [ ] La telemetría es anónima y opt-in, así que **no se cruza** con cuentas ni con pagadores. Los invitados no aparecen en nada del servidor.
- [ ] Los umbrales para decidir (D1 15%/25%, D7 5%/8–10%, conversión 1–3%) son **supuestos** de `SALIDA_AL_MERCADO.md` §6: reemplazalos con lo que midas.

### Bloque 10 · Decisiones tuyas que el código no toma
- [ ] `SHOP_MODE`: `demo` (catálogo completo siempre) o `live` (rotación diaria y precios altos). `POSTGAME_GATE`: `open` o `campaign`.
- [ ] Packs de lanzamiento sin límite de una vez por cuenta (ya lo decidiste dejar así; el informe de críticos lo ve como riesgo de percepción).
- [ ] Mercado Pago cobra en pesos: revisar `MP_ARS_PER_USD` seguido (si el dólar se mueve, cambiá la variable y reiniciá).
- [ ] Correo de comprobantes: hoy solo se exige que la cuenta tenga un correo cargado, **no se verifica** (hallazgo F). Decidir si se agrega confirmación antes de escalar.

---

## Cuando todo esté tildado

1. `node tools/release/preflight.js --launch …` → **sin rojos**.
2. Backup nuevo hecho hace menos de un día y restauración ya probada.
3. `MP_MODE=live`, credenciales de producción, `MP_ENABLED=1`, `sudo systemctl restart la-horda`.
4. Compra real chica + devolución (Bloque 8).
5. Mirá cada compra de la primera semana. Si algo raro pasa: `MP_ENABLED=0` y reiniciar.
