# Comprobación de archivos publicados

`python3 tools/release/check-canonical-publication.py --output reporte.json`
consulta por defecto **https://fondalstudios.com/la-horda/jugar/**. Solo hace GET públicos,
sin sesiones, compras, salas o datos de cuenta. Compara bytes SHA-256 de seis archivos
críticos del candidato: HTML, metadata/renderer/Códice y los atlas Soporte v3/caída de Libertador.
Devuelve código1 ante archivos viejos, faltantes o inaccesibles. Una respuesta200 con HTML
de error tampoco pasa. TLS usa la verificación normal del sistema.

`CHECKED_FILES_MATCH` significa exclusivamente que esos seis archivos coinciden; no prueba
el juego completo ni reemplaza gates, pruebas multijugador o revisión de infraestructura.
Si el build transforma HTML/scripts, pasar `--root dist` con el build exacto que se quiere
servir. No cambiar el origen a un servidor alternativo para declarar publicada la versión canónica.
`checkoutRevision` identifica el checkout de la comprobación, no acredita por sí solo un despliegue.

Pruebas HTTP locales: `python3 -m unittest tools/release/test_canonical_publication.py`.
El job `canonical-art` del workflow existente **Live check** conserva los chequeos alternativos
y añade esta lectura explícita de Fondal, con informe descargable. No despliega ni migra datos.

`node tools/release/probe-quality-five.js CARPETA` ejecuta una comprobación gráfica opcional en la web canónica, con navegador invitado efímero: cinco campeones RELEASED/listados, veinte lanzamientos internos con recursos finitos y preview de las cinco skins originales por su ID `_alt1`. Bloquea POST y WebSocket, no compra ni modifica cuentas. Genera `report.json` y `contact.png` a zoom2 para inspección. No es Ability Gate, no prueba propiedad de la skin ni transporte real. Requiere Playwright/Chromium; `CHROMIUM_PATH` permite elegir el instalado. TLS se verifica normalmente; `PUBLIC_SMOKE_ALLOW_PROXY_TLS=1` es una excepción explícita solo para diagnóstico aislado detrás de una CA de proxy no confiada por Chromium y queda anotada en el reporte. La comprobación de bytes separada conserva TLS normal. No configurar esta excepción en producción.

## Listo para cobrar (servidor propio)

Guía: `docs/commercial/DESPLIEGUE_FONDAL.md` · lista final: `docs/commercial/CHECKLIST_ULTIMA_PRUEBA.md` · seguridad: `docs/quality/SEGURIDAD_PRELANZAMIENTO.md`.

| Herramienta | Para qué |
|---|---|
| `node tools/release/preflight.js --env-file … --url … --relay … --dist …` | Chequeo total en verde/amarillo/rojo (entorno, Mercado Pago, base persistente, HTTPS, cabeceras, legal, WebSocket, webhook, secretos en el repo, peso de la portada). `--launch` = "voy a prender el cobro". No imprime secretos ni llama a Mercado Pago. `--help` lista las opciones. |
| `bash tools/release/backup.sh` | Copia de seguridad de Postgres (tablas `horda_*`) o de los archivos, verificada, con limpieza por antigüedad. |
| `bash tools/release/restore.sh ARCHIVO.dump [--production]` | Restaura en una base de prueba (por defecto) o en producción (pide confirmación y hace copia previa). |
| `node tools/release/metrics-report.js [--env-file …] [--json]` | Tablero de solo lectura: altas, activas, retención aproximada, compras, pagadores, conversión, ARPPU, telemetría opt-in. |
| `node tools/release/build-legal.js [--check]` | Genera `legal/*.html` desde `docs/legal/*.md` y `js/data/legal-config.js`. |
| `node tools/release/legal-test.js [--shots DIR]` | Prueba en navegador de la parte legal (enlaces, casilla de cuenta, aviso de primera compra, 844×390 y 667×375). |
| `sudo bash deploy/update.sh` / `deploy/rollback.sh` | Actualizar con copia previa y volver atrás sin perder datos. |
