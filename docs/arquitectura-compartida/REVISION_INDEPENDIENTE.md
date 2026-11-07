# Revisión independiente

```
PRODUCCIÓN ──► QA ──► REVISIÓN ARQUITECTÓNICA ──► STAGING ──► APROBACIÓN
 (agente)    (otra     (aprueba · repara            (rama       (director,
              identidad)  parcialmente · reconstruye)  beta/…)     una persona)
```

Diagrama completo en [`DEPENDENCIAS.md`](DEPENDENCIAS.md). Verificador ejecutable: `node tools/review/check.js` (28 pruebas en `tools/review/test-review.js`).

## Etapas y quién las hace

| Etapa | Quién | Qué deja | Condición |
|---|---|---|---|
| 1. Producción | el agente (A/B/C/D) en su rama | commit en la rama | pasa `check-diff.js` y su lista de aceptación (`accept.js`) |
| 2. QA | un revisor de rol `qa` (no el autor) | `evidence`: SHA, informe de `qa.js`, `tests` y `failed` | `tests > 0` y `failed = 0` |
| 3. Revisión arquitectónica | un revisor de rol `arquitecto` (no el autor ni quien hizo QA) | veredicto | `aprobado` · `rechazado` · `reparacion_parcial` (con lista `repair`) · `reconstruccion` (con `reason`) |
| 4. Staging | `qa` o `integrador` | prueba en una rama `beta/…` | `tests > 0`, `failed = 0`, rama `beta/…` |
| 5. Aprobación | una persona de `reviews/DIRECTORES.json` | veredicto | **nunca un agente** |

## Reglas que el verificador hace cumplir

1. **R1** Las etapas van en orden; ninguna puede existir después de una etapa no aprobada.
2. **R2** **Nadie aprueba su propio trabajo:** quien revisa no es el autor de la producción ni el autor declarado, y QA y arquitectura son identidades distintas.
3. **R3** Cada etapa tiene su rol; la aprobación final es de una cuenta humana listada.
4. **R4** Toda evidencia cita el **SHA exacto** de la cabeza de la rama: un commit nuevo invalida la revisión y obliga a repetirla.
5. **R5** QA y staging aprobados exigen pruebas ejecutadas y sin fallos.
6. **R6** Solo la revisión arquitectónica ordena `reparacion_parcial` o `reconstruccion`; ambas reinician el ciclo.
7. **R7** Para mezclar (modo `merge`) las cinco etapas deben estar aprobadas; en borrador (`draft`) un registro parcial o ausente es válido.

## Dónde viven los registros y por qué un agente no puede falsificarlos

- Un archivo por rama en `reviews/` (`claude__s1-economia-x.json`). Plantilla: `reviews/TEMPLATE.json`.
- **Ningún agente puede escribir en `reviews/`:** `check-diff.js` lo rechaza (`reviews/**` es «prohibido para todos») y `CODEOWNERS` exige al director. Los revisores escriben desde ramas `review/…`, que solo pueden tocar `reviews/`.
- En CI (`qa-regresion.yml`) el paso «Revisión independiente» corre en cada PR: una rama de agente (`claude/s1..s4-…`) en **borrador** pasa aunque no tenga registro; en **listo para revisión** falla si no están las cinco etapas aprobadas para el SHA actual.

## Límites honestos

- Las **identidades** de los revisores son cadenas del registro: el control impide el autoaprobado *declarado* y el cruce de roles, pero **no puede probar quién escribió el registro**. Esa garantía la da la protección de ramas con revisión obligatoria del propietario del código (`docs/operacion/PROTECCION_MAIN.md`), que **no está verificada como activa**.
- Los roles de QA y arquitectura los cumplen sesiones o personas distintas; que sean realmente independientes (otra sesión, otro modelo o una persona) es una decisión operativa, no algo que el código pueda comprobar.
- Hoy no hay ningún registro real: los PR #247 y #248 los produjo la misma sesión que diseñó este flujo, por lo que **no pueden aprobarse a sí mismos**; falta una revisión de otra identidad y la aprobación del director.

### Cierre de escapes de ramas y transición de borrador

El gate aplica a **toda rama de PR**, no a un prefijo elegido por su autor. Cambiar a `s0e/`,
`fix/` o `review/` no elimina las cinco etapas. Un borrador puede reunir evidencia incompleta,
pero `ready_for_review` dispara de nuevo la CI en modo estricto; no hay filtro de rutas para PR.
El verificador rechaza modos desconocidos y registros de otra rama/SHA.
Esto verifica la estructura y coherencia de evidencia, **no autentica identidades declaradas**.
La revisión humana de CODEOWNERS y el ruleset remoto deben estar activos y verificados por
quien administre el repositorio. Este cambio no activa protecciones ni firma revisiones.

El SHA revisado identifica el commit de contenido. Para evitar una autorreferencia imposible,
el HEAD actual puede ser un descendiente de ese commit **solo si el único archivo cambiado
es el registro concreto que se está validando**. Cualquier cambio de código, directores,
plantillas u otro registro invalida la evidencia. Se verifica la ascendencia y el diff real
en Git; no se acepta simplemente una cadena declarada por el autor. Las etapas siguen
citando el SHA exacto del contenido revisado, y se informa también el HEAD actual.
