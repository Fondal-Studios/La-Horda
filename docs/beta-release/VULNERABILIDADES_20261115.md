# Vulnerabilidades de dependencias — 2026-11-15

Rama local `cierre-fase0` (commit base 76437c9a). Solo lectura: no se instaló, actualizó ni modificó ninguna dependencia.

## 1. Resumen honesto

**No pude obtener la lista real de las 105 alertas.** `gh api repos/Fondal-Studios/La-Horda/dependabot/alerts` devolvió `403 Resource not accessible by integration` (el token de la sesión no tiene permiso de seguridad). Por eso:

- Los conteos por severidad/paquete de las 105 alertas (5 críticas, 48 altas, 43 moderadas, 9 bajas) son **solo el aviso de GitHub; no están verificados** y no los reproduzco en tablas.
- Lo que sí medí: el único manifiesto con lockfile versionado es `server/` y su auditoría da **0 vulnerabilidades** (15 dependencias de producción + 1 opcional).
- Hipótesis más probable (no comprobada) sobre el origen de las 105: Dependabot resuelve `desktop/package.json`, que **no tiene lockfile** (`electron ^33.0.0`, `electron-builder ^25.1.8`, `steamworks.js ^0.4.0` opcional). `electron-builder` arrastra un árbol grande de transitivas (app-builder-lib, tar, cross-spawn, etc.) y `electron 33.x` está fuera de soporte; es compatible con un volumen de ~100 alertas, pero no tengo el dato. También puede haber alertas sobre `tools/factory/requirements-test.txt` (numpy 2.3.5, Pillow 12.0.0), que no audité (ver sección 7).
- Conteos medidos de alertas por severidad: **no medido** (0 medidas en server; resto no determinado).

## 2. Inventario de manifiestos

| Manifiesto | En git | Lockfile | Ámbito | Dependencias |
|---|---|---|---|---|
| `package.json` (raíz) | sí | no | desarrollo (solo scripts) | ninguna |
| `server/package.json` | sí | `server/package-lock.json` | PRODUCCIÓN (servidor) | `pg ^8.23.0`, `ws ^8.18.0` |
| `desktop/package.json` | sí | **no hay** | PRODUCCIÓN al jugador (runtime Electron) + build (electron-builder) | `electron ^33.0.0` (dev), `electron-builder ^25.1.8` (dev), `steamworks.js ^0.4.0` (opcional) |
| `tools/factory/requirements-test.txt` | sí | pins exactos | DESARROLLO/CI | `numpy==2.3.5`, `Pillow==12.0.0` |
| `js/vendor/*.js` (3 archivos propios) | sí | n/a | cliente | código propio del proyecto, no paquetes npm |
| Workflows CI | sí | n/a | DESARROLLO/CI | `npm install` ad hoc de `playwright` (1.56.1/1.58.2/1.61.1/«1»), `@napi-rs/canvas` (0.1.80/0.1.100); `actions/*@v4/v5` |

Notas: `.claude/worktrees/` contiene copias de package.json pero está ignorado por git (`git check-ignore` lo confirma), así que no cuenta para alertas. `tools/` no tiene package.json. No existe `.github/dependabot.yml` ni workflow de CodeQL en `.github/workflows` (CodeQL, si existe, es la configuración por defecto de GitHub; no determinado).

## 3. Server (producción) — medido

Versiones resueltas en `server/node_modules` / lock: `pg 8.23.0`, `ws 8.21.3`, y transitivas de pg (pg-pool 3.14.0, pg-protocol 1.16.0, pg-types 2.2.0, pg-connection-string 2.14.0, pgpass 1.0.5, split2 4.2.0, xtend 4.0.2, etc.). `npm audit` con y sin `--package-lock-only`: **0 vulnerabilidades (info 0, low 0, moderate 0, high 0, critical 0)**.

Uso real: `server/relay.js:44` (`WebSocketServer` con `maxPayload`), `server/accounts.js:401` (`pg.Pool`). Despliegue con `npm ci --omit=dev` (deploy/update.sh, rollback.sh), por lo que el lockfile manda. Observación: `render.yaml` usa `npm install` (no `npm ci`), así que en Render las versiones podrían derivar dentro del rango semver; riesgo bajo, mejora recomendada.

Conclusión: las alertas del server, si existen, ya están corregidas por el lock actual (el lock podría haberse actualizado después del aviso). Esto es una **medición de hoy**, no de lo que GitHub tenía indexado cuando emitió el aviso.

## 4. Desktop (producción al jugador) — parcialmente determinado

Medido (solo lectura, `npm view`): rango `electron@^33` resuelve hoy a **33.4.11**; última estable de Electron **45.3.2**. `electron-builder@^25.1.8` resuelve a **25.1.8**; última 26.18.0. `steamworks.js` 0.4.0 (última).

No pude auditar el árbol porque no hay lockfile y generar uno requeriría `npm install --package-lock-only` (prohibido por el encargo). Por tanto **no hay conteo ni CVE concretos para desktop**.

Alcanzabilidad (evidencia de código):
- `desktop/main.js` usa `electron` (app, BrowserWindow, protocol, net, shell, ipcMain, Menu, session). `webPreferences`: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` (líneas 58 y 73). Eso mitiga muchas clases de CVE de Electron (las que requieren Node en el renderer), pero **no** las del propio Chromium/V8 embebido, que se alcanzan al cargar contenido (el juego carga su propio contenido; si abre URLs externas vía `shell`/ventanas, hay superficie adicional; existe `desktop/url-policy.js`, no auditado en profundidad).
- `electron` es devDependency pero **se distribuye empaquetado** al jugador (`dist:win`/`dist:linux`): el runtime de Electron SÍ es producción. Un Electron 33.x sin parches de Chromium es el riesgo real aquí. `desktop/LEEME.md` declara que "no se construyó ni se probó en este repositorio": hoy no hay build desplegado verificable, lo cual reduce la urgencia inmediata si no se ha publicado a jugadores (dato a confirmar por el dueño).
- `electron-builder` y su árbol: **solo build** (máquina del desarrollador/CI), no viaja al jugador. Alcanzable solo si se construye con entradas no confiables; explotabilidad real baja.
- `steamworks.js`: `main.js:34` `require('steamworks.js')` dentro de try, opcional.

Clasificación provisoria (hipótesis, no medida):
- Alertas sobre `electron` -> PRODUCCIÓN, alcanzable en general (Chromium embebido), mitigadas parcialmente por sandbox/contextIsolation.
- Alertas sobre `electron-builder` y transitivas (`tar`, `cross-spawn`, `glob`, `minimatch`, etc.) -> DESARROLLO (build), mayormente no alcanzables.

## 5. Tools/CI (desarrollo) — no determinado

- `playwright` y `@napi-rs/canvas` se instalan efímeramente en CI con `--no-save`; Dependabot no los ve como alertas (no hay manifiesto). Sin riesgo para el jugador.
- `numpy 2.3.5` / `Pillow 12.0.0` (`tools/factory/requirements-test.txt`): no auditados (no hay `pip-audit` verificado aquí). Son solo CI. Pillow tuvo CVEs de parseo de imágenes en versiones anteriores; no consta que 12.0.0 esté afectada: **no determinado**.
- Las alertas de GitHub Actions (`actions/*@v4`) no suelen aparecer como Dependabot alerts.

## 6. Tabla priorizada (lo que se puede afirmar)

No hay tabla por CVE porque no se obtuvo la lista. Priorización por paquete raíz:

| # | Paquete raíz | Ámbito | Versión actual (rango/resuelta) | Alcanzable | Alertas medidas | Corrección mínima | Salto |
|---|---|---|---|---|---|---|---|
| 1 | `electron` | PRODUCCIÓN (runtime jugador) | ^33.0.0 / 33.4.11 | probable (Chromium), mitigado por sandbox | no medido | no determinada; la rama 33 ya no recibe parches: hace falta una rama soportada (hoy 45.x) | **major** (33 -> 45; ~12 majors) |
| 2 | `electron-builder` + transitivas | DESARROLLO (build) | ^25.1.8 / 25.1.8 | no alcanzable en runtime | no medido | probablemente 26.x | major (25 -> 26) |
| 3 | `steamworks.js` | PRODUCCIÓN opcional | ^0.4.0 / 0.4.0 | sí, opcional | no medido | ya es la última | n/a |
| 4 | `ws` | PRODUCCIÓN servidor | ^8.18.0 / 8.21.3 | sí | 0 | ya corregida | n/a |
| 5 | `pg` | PRODUCCIÓN servidor | ^8.23.0 / 8.23.0 (hay 8.23.1) | sí | 0 | opcional 8.23.1 (patch) | patch |
| 6 | `numpy`, `Pillow` | DESARROLLO (CI) | 2.3.5 / 12.0.0 | no | no medido | n/a | n/a |

## 7. Plan de actualización por lotes (con rollback)

Antes de cada lote: rama nueva desde `main`; ningún lote se hace en esta rama de cierre.

**Lote 0 — Obtener los datos reales (sin cambiar código).** Dar permiso de lectura de Dependabot al token o que el dueño exporte `Security -> Dependabot` en CSV/JSON. Con eso se rehace la tabla por CVE. Alternativa local: en copia temporal de `desktop/` ejecutar `npm install --package-lock-only` y `npm audit --json` (fuera del repo). Rollback: nada que revertir.

**Lote 1 — Lockfile para desktop.** Commitear `desktop/package-lock.json` generado con el rango actual para que las alertas sean reproducibles y se pueda usar `npm ci`. Prueba: `node desktop/test-stage.mjs`. Rollback: `git revert` del commit (solo agrega un archivo).

**Lote 2 — Server patch (opcional): `pg` 8.23.1 y `render.yaml` a `npm ci`.** Riesgo: muy bajo. Pruebas: `cd server && npm test` (incluye test-relay, test-accounts, test-wallet, test-payments-mp...). Rollback: `git revert` y `npm ci --omit=dev` (deploy/rollback.sh ya hace `git reset` + `npm ci`).

**Lote 3 — electron-builder 26.x (dev).** Cambia solo el empaquetado. Prueba: `npm run test:stage` y un `dist:linux` de humo en CI/máquina de dev (ver riesgos). Rollback: revertir package.json + lock.

**Lote 4 — Electron major (decisión del dueño).** Subir a una rama soportada. Riesgo de ruptura para este código: `protocol`, `net`, `session`, `shell` y `ipcMain` en `main.js` y `preload.js` pueden cambiar de API entre majors; hay que revisar notas de ruptura de cada major, la política de CSP/`protocol.handle`, y reprobar guardado (`save-mirror.js`) y Steam. Cobertura de pruebas: `test-stage.mjs` solo cubre el staging, **no** el arranque real de Electron; hace falta prueba manual en Windows/Linux. Rollback: volver a `electron@33.4.11` con el lock previo (`git revert`); los datos de usuario son del juego, no de Electron.

Orden: 0 -> 1 -> 2 -> 3 -> 4. Tras cada lote correr `node tools/quality/run-all.js` y `cd server && npm test` (el primero cubre el cliente; no mide Electron).

## 8. Qué NO conviene actualizar todavía

- **Electron a la última (45.x) de golpe**: salto de ~12 majors sin pruebas automáticas de arranque; mejor decidir el objetivo y probar en una rama aparte.
- **`ws`/`pg` a majors futuros**: ya hay 0 alertas; no hay beneficio.
- **`npm audit fix --force`** sobre desktop: arrastra majors sin control.
- **Cualquier cambio en `js/vendor`**: son archivos propios del juego, no dependencias; las "alertas" no aplican.

## 9. Decisiones que requiere el dueño

1. Si hay builds de escritorio ya publicados a jugadores (Steam). Si no, la urgencia de Electron baja y se puede planificar con el lanzamiento.
2. Rama objetivo de Electron (la soportada más reciente vs. una intermedia) y presupuesto de pruebas manuales Windows/Linux/Steam.
3. Dar permiso de lectura de Dependabot (`security_events` / "Dependabot alerts: read") al token, o exportar las alertas.
4. Si se activa `dependabot.yml` (agrupado por paquete) y CodeQL explícito.
5. Si se acepta cerrar como "descartada: solo build" las alertas de herramientas de empaquetado una vez verificadas.

## 10. Los 5 hallazgos más urgentes

1. No se pudo leer la lista de 105 alertas (403): las cifras del aviso son **no verificadas**; hay que dar acceso o exportarlas.
2. `desktop/` no tiene lockfile: las alertas no son reproducibles ni auditables localmente y `npm ci` no es posible.
3. `electron ^33` resuelve a 33.4.11, rama fuera de parches (última estable: 45.3.2): riesgo real de Chromium en producción si se publica.
4. `render.yaml` usa `npm install` (no `npm ci`): el servidor en Render puede divergir del lock.
5. `electron-builder ^25` (hoy 26.18.0) y su árbol transitivo son la fuente probable del grueso de alertas, aunque solo de ámbito build (no medido).

Alertas solo de desarrollo: **no medido**. Lo medido: 0 alertas en server (producción); desktop sin datos; hipótesis: la mayoría de las 105 vendrían del árbol de `electron-builder` (desarrollo), sin cifra.

## 11. Comandos ejecutados y salida real (resumen)

- `git branch --show-current` -> `cierre-fase0`
- `git ls-files | grep (package|lock|requirements)` -> `desktop/package.json`, `package.json`, `server/package-lock.json`, `server/package.json`, `tools/factory/requirements-test.txt`
- `gh api -X GET repos/Fondal-Studios/La-Horda/dependabot/alerts --paginate` -> `{"message":"Resource not accessible by integration","status":"403"}`
- `cd server && npm audit --json` y `npm audit --package-lock-only --json` -> `"vulnerabilities": {}`, `info 0, low 0, moderate 0, high 0, critical 0, total 0`; dependencias `prod 15, dev 0, optional 1, total 15`
- `cd server && npm ls --all` -> `pg@8.23.0` (+ pg-cloudflare 1.4.0, pg-connection-string 2.14.0, pg-pool 3.14.0, pg-protocol 1.16.0, pg-types 2.2.0, pgpass 1.0.5, split2 4.2.0, xtend 4.0.2...), `ws@8.21.3`; opcionales sin instalar: pg-native, bufferutil, utf-8-validate
- `npm view electron@^33 version` -> última `33.4.11`; `npm view electron version` -> `45.3.2`; `npm view electron-builder@^25.1.8 version` -> `25.1.8`; `npm view electron-builder version` -> `26.18.0`; `npm view steamworks.js version` -> `0.4.0`; `npm view pg version` -> `8.23.1`. Node v22.23.4, npm 10.9.9
- `grep` de uso: `server/accounts.js:401` (pg), `server/relay.js:44` y `:393` (ws), `desktop/main.js:12,34`, `desktop/preload.js:12`

## 12. Lo que no pude determinar

- Lista, severidades, paquetes y CVE de las 105 alertas (403).
- Auditoría de `desktop/` (sin lockfile; no se permitió generarlo).
- Auditoría de `numpy`/`Pillow` (sin herramienta pip-audit verificada).
- Si existe CodeQL activado por configuración por defecto y qué alertas de código tiene.
- Alcanzabilidad por CVE de Electron (depende de la lista).
- Si hay builds de escritorio ya distribuidos.
