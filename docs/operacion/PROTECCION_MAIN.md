# Protección obligatoria de `main` y `beta/integracion`

> **Estado: NO verificada como activa.** El asistente no tiene permiso sobre los ajustes del repositorio. Este documento deja los pasos exactos; **hasta que una persona con permisos los aplique y lo confirme, no hay protección garantizada** (un check rojo se puede omitir).

## Qué debe exigir

| Regla | Por qué |
|---|---|
| Pull request obligatorio (sin push directo) y sin borrado ni *force-push* | que nada llegue sin pasar por los controles |
| Checks requeridos: `Clasificacion, contratos y servidor`, `Regresion del juego (rapida)`, `emoji-lint` | son los que corren la clasificación (falsos verdes), contratos, servidor y regresión |
| Rama al día antes de mezclar (`strict`) | que la prueba corra sobre lo que se va a mezclar |
| Revisión del propietario del código (`.github/CODEOWNERS`) | `contracts/`, `reviews/`, `ownership.json`, workflows, `server/relay.js`, `js/net/` y `deploy/` exigen a una persona |
| Descartar aprobaciones al subir commits nuevos | la revisión vale para ese SHA |
| Sin *bypass* | ni siquiera administradores |

## Pasos exactos (Settings → Rules → Rulesets → New branch ruleset → Import)

1. Entrá a `https://github.com/Fondal-Studios/La-Horda/settings/rules` con una cuenta de **administrador**.
2. **New ruleset → Import a ruleset** y elegí el archivo `.github/rulesets/proteccion-main-y-beta.json` de este repositorio.
3. Revisá que el *Enforcement status* sea **Active** y que el objetivo incluya `main` y `beta/integracion` (la segunda rama debe existir).
4. Guardá. Confirmá abriendo un PR de prueba: el botón de mezclar debe quedar bloqueado hasta que los checks pasen.

Alternativa por línea de comandos (si tenés `gh` autenticado como administrador): `gh api -X POST repos/Fondal-Studios/La-Horda/rulesets --input .github/rulesets/proteccion-main-y-beta.json`. **No se ejecutó** y no se verificó contra tu cuenta.

## Para verificar que quedó activa (cuando lo apliques)

- `gh api repos/Fondal-Studios/La-Horda/rulesets` debe listar `proteccion-main-y-beta` con `enforcement: active`.
- Un PR con un check en rojo no se puede mezclar.
- `git push origin main` desde una cuenta común es rechazado.

## Advertencias

- **Aprobaciones con un solo director:** GitHub no deja que el autor de un PR lo apruebe. Si el director es también quien abre los PR, `required_approving_review_count: 1` lo bloquearía. Opciones: que otra persona o cuenta humana sea revisora, o bajar a 0 aprobaciones y confiar en los checks (más débil). Hay que decidirlo.
- **Nombres de los checks:** deben coincidir con los de GitHub. Si se renombra un job de `qa-regresion.yml`, hay que actualizar el ruleset.
- El check «Regresion del juego (rapida)» tarda ~20 minutos en CI.
