# INVENTARIO REAL DE PR Y RAMAS — corte 2026-11-15 (Fase 0 del plan de cierre)

Reemplaza como fuente de verdad a `INVENTARIO_PR.md` (corte 2026-11-06, 24 PR abiertos), que está **obsoleto**: hoy hay **4 PR abiertos**. Este documento es solo lectura: no se cerró, mergeó ni borró nada, no se comentó en GitHub.

## 0. Método y límites
- `origin/main` = `8a6ca075` (merge de #304, 2026-11-15). Verificado con `git fetch origin main`. El PR #305 sigue abierto.
- Fuente de PR/CI: API de GitHub (lectura) a 2026-11-15 ~15:10 UTC. Los PR son 305 en total (#1–#305): 4 abiertos, 282 mergeados, 19 cerrados sin merge.
- **El clon local es superficial** (`git rev-parse --is-shallow-repository` = true, 1105 commits). Por eso `git branch -r --merged` y `git merge-base --is-ancestor` dan falsos negativos para ramas antiguas (p. ej. el merge de #127, `88fdd79a`, figura «no ancestro» localmente, y `compare/main...88fdd79a` de GitHub dice `behind`, ahead_by 0). Todas las cifras de ramas de la sección 3 salen de `GET repos/Fondal-Studios/La-Horda/compare/main...<rama>` (ahead_by/behind_by), no de `git branch --merged`. Para los 4 PR abiertos se usó además `git merge-tree --write-tree`, `git cherry` y `git diff --stat origin/main...<rama>` (ramas recientes: la historia local alcanza).
- No determinado: protección de rama de `main` (la API devuelve 403 «Resource not accessible by integration») y si el check «Revisión independiente» es requerido. Sí se leyó que el repo tiene `delete_branch_on_merge = false` (explica la acumulación de ramas).
- «Autor» en ramas = nombre del autor del último commit (`Mariano`/`Claude`); en PR, la cuenta de GitHub (`drmarianojimenez94-sudo` abre 300 de 305; `cesarfacundoruizapple` 5).

## 1. PR abiertos (4)

| PR | Título | Autor | Base ← Head | Creado / actualizado | Tamaño | CI (head exacto) | mergeable_state |
|---|---|---|---|---|---|---|---|
| #305 | Guerrero (Kael): ronda de mitigación y esquiva (no concluyente), descripciones con la curación y reconciliación de checklists | drmarianojimenez94-sudo | main ← `claude/la-horda-beta-audit-exec-mwv8x0` (`76437c9a`) | 11-15 / 11-15 | 16 archivos, +247/−88, 3 commits | 26 OK, **1 fallo**, 1 en curso | `unstable` (GitHub); merge limpio (0 atrás, 3 adelante) |
| #297 | [FIX][NO_INTEGRAR] Myla B005 — lanzamiento base Códice conectado (borrador) | drmarianojimenez94-sudo | main ← `art/myla-cast-back-frame11-20261112` (`ce6b234e`) | 11-12 / 11-12 | 42 archivos, +1543/−15, 6 commits | 28 OK, **1 fallo**, 2 cancelados | `unknown`; `merge-tree`: **conflicto en 2 archivos** (`docs/art/ATLAS_ARTE.json`, `.md`); 57 commits atrás de main |
| #293 | [FIX][NO_INTEGRAR] Libertador skins Códice — cierre completo (borrador) | drmarianojimenez94-sudo | main ← `art/libertador-skins-codex-20261111` (`15790ce3`) | 11-11 / 11-12 | 106 archivos, +6811/−15533 (casi todo el −15490 es `ATLAS_ARTE.json` regenerado), 11 commits | solo 5 checks, todos OK; **sin runs del roster gate/workflows completos para este SHA exacto** (lo dice el propio PR) | `unknown`; `merge-tree`: **conflicto en 4 archivos** (`ATLAS_ARTE.json/.md`, `NEXT_SESSION.md`, `STATUS.md`) + auto-merge de `t_identity.js`; 81 atrás |
| #291 | [FIX][NO_INTEGRAR] Mago Convergencia — fuentes Códice y corrección de alfa (borrador) | drmarianojimenez94-sudo | main ← `art/mago-convergencia-codex-20261111` (`33444966`) | 11-11 / 11-12 | 44 archivos, +1478/0, 7 commits (todo en `art-source/entregas/`) | 9 OK, 2 cancelados (rápida y clasificación) | `unknown`; `merge-tree` **limpio**; 111 atrás |

Evidencia de los fallos de CI:
- **#305**: job «Clasificación, contratos y servidor», paso «Revisión independiente»: `Contenido revisado: ce3818ce…; cabeza actual: 76437c9a…; vínculo inválido` — `reviews/claude__la-horda-beta-audit-exec-mwv8x0.json` está sellado al PR #304 (SHA `ce3818ce`) y la regla R4 detecta cambios posteriores (`docs/art-brief/PRIORIDAD_ASSETS.md`). Es el comportamiento esperado de la regla «revisión independiente por SHA exacto»: falta un registro nuevo para `76437c9a`; no es un defecto de código. «Regresión del juego (completa)» seguía `in_progress`.
- **#297**: «Regresión, UX y carriles» falló en `t_hit_react` → `FAIL HIT.destello_blanco_en_todos_los_cuerpos` (1 caso oscuro: arena `acuatica`, `medusa_electrica`, lit 8). El PR solo toca el dibujo de Myla; no está en `INTERMITENCIAS_CI.md`. Causa: **no determinada** (no se re-ejecutó).

## 2. Clasificación de los PR abiertos (comparado con `origin/main` actual)

| PR | Clasificación | Evidencia | Riesgo | Esfuerzo | Orden / dependencias |
|---|---|---|---|---|---|
| #305 | **COMPATIBLE** (tal cual; sin rebase) | Base = main actual (`merge-base` = `8a6ca075`, 0 atrás). Toca `js/skills/abilities.js` y `js/systems/combat.js` (gancho en `damageHero` solo para `guerrero`; perillas `kaelBurstGuard`/`kaelHitGuard` **apagadas por defecto**; sin cambio de balance), descripciones EN/PT, docs y `prioridad-assets.json`. No toca economía ni Brasas. Docs de balance actualizados (AGENTS.md). Su único fallo es el sello de revisión independiente. | **Bajo** (código inerte con perillas apagadas; lo único a revisar es el gancho de combate) | **Bajo**: registro nuevo `reviews/…` sellado a `76437c9a` por un revisor independiente y esperar la regresión completa | 1.º. Su SHA coincide con la ref `beta/integracion-20261110` (duplicado de rama) |
| #297 | **COMPATIBLE con rebase** (condicionado) | Cambio de runtime pequeño y aislado: `js/rendering/portadores.js` (+5), `js/assets/portadores-meta.js` (+2), 2 chequeos nuevos en `tools/art/`, `assets/sprites/champions/myla/v2/cast.png`, +33 archivos de evidencia. Main no tiene `myla_cast` (`git grep` vacío). Los 2 conflictos son registros generados (`ATLAS_ARTE.*`), regenerables con `tools/art/build-art-atlas.js`. **Condiciones:** `t_hit_react` en rojo (causa no determinada), Art Gate visual y capturas de gameplay no ejecutados (Chromium del ejecutor bloqueado, según el PR), sin aprobación de arte del dueño, marcado FIX_NO_INTEGRAR. No toca habilidades ni economía. | **Medio** (arte sin aprobar; Myla ya figura «instalada sin aprobar» en las checklists) | **Medio**: rebase + regenerar atlas + repetir CI/`t_hit_react` + revisión de arte + revisión independiente | 2.º; independiente de #293/#291 (los tres tocan o regeneran `ATLAS_ARTE.json`: rebasar de a uno) |
| #293 | **BLOQUEADO** (decisión del dueño sobre arte + CI sin ejecutar) | Marcado NO_INTEGRAR/EN_CORRECCION por su autor. Reemplaza los atlas de `libertador_escarcha`/`libertador_ancestral` (en main tienen otra grilla: `cols:8`, 24 estados; el PR usa `cols:4`, 36 estados) después de que #303/#304 cambiaron Libertador (definitiva instalada y re-aprobada por el dueño). Modifica `roster_gate.js`, la normalización `champion-art-normalize`, `t_identity.js`, `test-i18n.js`. El roster gate **nunca corrió** para el SHA exacto (lo declara el PR); el fallo previo de Laberinto en «Integración run 603» sigue sin resolver. 4 conflictos textuales. | **Alto** (toca gates, normalización y arte aprobado) | **Alto**: rebase con 4 conflictos, regenerar atlas, correr roster gate + visual gate, aprobación del dueño, revisión independiente | 3.º; solo tras decisión explícita del dueño |
| #291 | **OBSOLETO** (sin valor de producto) | Solo `art-source/entregas/` (0 cambios de runtime ni de assets instalados). Su propio texto: «Corrección 02 … **REJECT**», FIX_NOT_APPROVED; la skin `convergencia` ya está integrada en main (`assets/sprites/champions/mago/skins/convergencia/`). Mergea limpio pero solo agregaría evidencia de intentos rechazados (incluye PNG truncados recuperados por fragmentos). | Bajo | Bajo (si se quisiera conservar la evidencia) | Ninguno |

No hay PR abiertos SUPERADOS, DUPLICADOS ni INCOMPATIBLES con las decisiones vigentes (economía «Brasas solo cosméticos», gates, balance): ninguno de los 4 toca economía. Las pilas apiladas A/B/C del inventario viejo **ya no existen** (todas sus piezas están mergeadas o cerradas).

### 2b. Cerrados sin merge (19) y mergeados recientes que afectan decisiones
Cerrados sin merge: #74, #78, #92, #231, #232, #233, #241, #242, #246, #249, #250, #253, #254, #255, #256, #257, #259, #263, #268. Disposición documentada en main (`RESULTADOS_PR.md`, commit `d64b1e2e`):
- #233 y #242 «obsoletos, superados por #244/#251 y #240»; #232/#256/#257 «mismos cuerpos de #241 (ya integrados)»; #268 «= Mago, ya integrado vía #270»; los cuerpos de #241 (Aldric/Kael/Aelith/Morveth) y los atlas de #259 (Saelis/Aurelia/Maura/Ynara/Myla) se extrajeron como candidatos y llegaron a main con #277/#284 (la integración final es #284, 2026-11-07). Las ramas de #241, #249, #250 y #254 están contenidas en main (ahead_by 0).
- #249/#250 (Build Evolution/Premium Skin Factory) y #263 (Brasas solo cosméticas): hay rastros en main (`docs/build-evolution/`, `.github/workflows/cosmetics-only.yml`, `css/ui-clarity/shop-clarity.css`); equivalencia línea a línea **no determinada**.
- #92, #246, #231 (NO_INTEGRAR), #253, #255, #74, #78: sin evidencia nueva en esta fase; tratarlos como SUPERADO/OBSOLETO según el registro previo; la causa exacta de cierre de #74/#78 **no determinada**. Muchos se cerraron el 2026-11-07 (~16:05 UTC).
Mergeados que cambian la decisión (2026-11-07 a hoy): #284 (integration/beta-20261101 → main), #285, #286, #287, #288 (retención, Sets/Apariencias, seguridad de red/CI), #289, #290, #292, #294 (Steam), #295, #296, #298, #299, #300, #301 (Runway/definitivas), #302, **#303 (Libertador, Plaga, Musashi, Abismo, primera sesión, dificultad, simulación alfa; 2026-11-15 10:11 UTC) y #304 (2026-11-15 13:25 UTC)**. De los 24 PR del inventario del 11-06: 9 se mergearon (#236, #239, #90, #252, #261, #265, #267, #270, #271) y 15 se cerraron sin merge (#92, #231, #232, #241, #246, #249, #250, #253, #254, #255, #256, #257, #259, #263, #268).

## 3. Ramas remotas (304 sin contar `main`; 305 refs)

Clasificación vía `compare/main...rama` de GitHub (ver sección 0):

| Categoría | Cantidad |
|---|---:|
| Con PR abierto (3 ramas de arte + la de #305) | 4 |
| Totalmente contenidas en `main` (ahead_by = 0), **con PR mergeado o cerrado** | 193 |
| Totalmente contenidas en `main`, **sin PR** | 26 |
| PR mergeado por squash (merge commit en main) pero la rama conserva commits que main no tiene | 33 |
| PR cerrado **sin merge** con commits únicos | 15 |
| **Sin PR** y con commits únicos | 33 |
| Total | 304 |

Detalle:
- **Contenidas en main sin PR (26)**: `claude/anim-atlas-pilot`, `codex/ynara-angel-silencio`, `claude/siete-pendientes`, `art/battlefield-recovery`, `codex/illustrated-grimoire-combat`, `feat/battlefield-sprites`, `art-workshop/libertador-back-v1-20261019`, `art-workshop/soporte-frame11-v3-20261019`, `chatgpt/soporte-frame11-v3-20261019`, `chatgpt/soporte-v3-production-evidence-20261019`, `claude/mercadopago-listo`, `claude/skins-brasas`, `claude/tiburones`, `claude/fallas-previas`, `claude/listo-para-cobrar`, `claude/piezas-brasas`, `claude/tiburones-png`, `claude/libro-unico`, `codex/art-bases-20261026`, `feat/curated-music-library`, `factory/runway-architects-20261101`, `recovery/beta-integracion-pre-s0d`, `claude/ability-art-circuit`, `claude/enemy-arena-art-hielo-pilot`, `integration/beta-20261101`, `beta/integracion-20261107`. Último commit entre 2026-09-24 y 2026-11-08.
- **Squash-mergeadas (33)**: 16 con la punta igual a la cabeza del PR (`claude/crystal-wars-audit`, `claude/crystal-wr2`, `claude/first-arena-clarity`, `claude/growth-loading`, `claude/modes-real-engine`, `claude/pricing-overhaul`, `claude/la-horda-beta-visual-impact-jze96f` (#251), `chatgpt/ability-gate-audit-20261009`, `chatgpt/talent-gate-level40-20261009`, `chatgpt/cloud-owner-recovery`, `chatgpt/elyra-rework-start-screen`, `chatgpt/visible-owner-entry`, `codex/duo-roster-ux`, `codex/skins-diseno-propio`, `codex/ynara-integracion-final`, `fix/champion-ability-inspector-null-guard`); las otras 17 (16 `art/*-202610xx` y `deploy/nano-independent`) tienen 1–6 commits **posteriores** a la cabeza del PR («docs: close … after merge», p. ej. `9bb99d54` en `art/arena-world-integration-20261030`). En los 33 se verificó con la API que el merge commit del PR está en main. Contenido de los commits extra: verificado solo en 1 caso (docs); el resto **no determinado**.
- **PR cerrado sin merge con commits únicos (15)**: ramas de #74, #78, #92, #231, #232, #233, #242, #246, #253, #255, #256, #257, #259, #263, #268 (1–43 commits únicos; 575–1443 commits atrás de main).
- **Sin PR con commits únicos (33; último commit 2026-09-23 → 2026-11-15)**: (a) ~12 ramas de pruebas/docs de art-workshop/qa/chatgpt del 19–20 oct (Mariano, 1–3 commits, p. ej. `art-workshop/offline-book-regressions-20261019`); (b) WIP de Claude abandonado («avance parcial guardado… sin verificar»: `claude/clanes`, `claude/coliseo-identidad`; `claude/pricing-overhaul-wip`); (c) documentos de auditoría/crítica (`claude/critica-monetizacion`, `claude/auditoria-adquisicion`, `claude/campeones-pendientes`, `claude/prompt-juego-shooter`); (d) trabajo de producto no integrado: **`claude/brasas-redefinicion` (6 commits, 2026-10-26, «t_sets_visuales… grandfathering», toca Brasas/sets: revisar contra «Brasas solo cosméticos» antes de decidir; contenido no verificado)**, `claude/musica-biblioteca`, `claude/ux-ficha-panel`, `claude/game-localization-three-languages-cecak6`, `claude/update-horda-github-3dt9ih` (Mago de Hielo y Cristal / Demonio de Hielo, 2026-09-23, 3 commits), `claude/siete-campeones-known`, `art/roster-expansion-candidates`, `feature/beta-ui-ux-factory` (19 commits, evidencia eval5), `feature/ui-factory-art`, `feature/s0e-art-factory`; (e) `beta/integracion` (1 commit único = merge de #252; 573 atrás; D3: no se fusiona) y **`beta/integracion-20261110` = mismo SHA `76437c9a` que la rama de #305 (referencia duplicada; no borrar hasta resolver #305)**. El agrupado (a)–(e) es aproximado por nombre y mensaje del último commit.

### 3b. Ramas seguras de borrar (propuesta; no se borró nada)
1. **Segura (23)**: contenidas en main y sin PR = las 26 de arriba **menos** `recovery/beta-integracion-pre-s0d`, `integration/beta-20261101` y `beta/integracion-20261107` (puntos de recuperación de la integración; conservarlos hasta que el dueño dé por cerrada la integración o los marque con tags).
2. **Segura, baja urgencia (193)**: contenidas en main con PR mergeado o cerrado (historia en main y en el PR).
3. **Segura tras confirmar (16)**: squash-mergeadas con la punta igual a la del PR.
4. **No borrar todavía (conservan trabajo único)**: 17 squash con commits posteriores, 15 de PR cerrado sin merge, 33 sin PR, 3 de PR abierto de arte, la de #305, `beta/integracion-20261110`, `beta/integracion`.
Complemento (acción hacia afuera, requiere confirmación): activar `delete_branch_on_merge` en el repositorio.

## 4. Propuesta para confirmar (nada se ejecutó; requiere confirmación del dueño)

| PR / ramas | Acción propuesta | Justificación |
|---|---|---|
| #305 | **Integrar** (tras sello de revisión independiente al SHA `76437c9a` y regresión completa verde) | Compatible, base actual, perillas apagadas, sin cambio de balance; solo falta el registro de revisión por SHA exacto. |
| #297 | **Rebasear** (regenerar `ATLAS_ARTE.*`, repetir CI y `t_hit_react`) y luego revisión de arte; **no integrar sin aprobación del dueño** | Runtime mínimo y aislado, pero con CI rojo (causa no determinada), sin Art Gate visual ni aprobación. |
| #293 | **Dejar** (borrador/NO_INTEGRAR) hasta decisión del dueño; alternativa: cerrar con motivo «Libertador cambió en #303/#304; reabrir tras roster gate» | Alto riesgo (gates, atlas aprobados), roster gate nunca corrido para este SHA, 4 conflictos. |
| #291 | **Cerrar con motivo** («producción rechazada FIX_NOT_APPROVED; la skin ya está integrada; evidencia preservada en la rama») | Sin cambios de runtime; solo evidencia de intentos rechazados; la rama queda como archivo. |
| 23 ramas contenidas en main sin PR | **Borrar** (previa confirmación) | ahead_by 0 en la API de GitHub. |
| 193 ramas contenidas en main con PR | **Borrar** (previa confirmación; por lote) | Contenidas en main; PR conserva la discusión. |
| 16 ramas squash con punta = PR | **Borrar tras confirmar** | El merge commit del PR está en main. |
| `recovery/beta-integracion-pre-s0d`, `integration/beta-20261101`, `beta/integracion-20261107`, `beta/integracion` | **Dejar** (o tag antes de borrar) | Referencias de recuperación de la integración (D3). |
| `beta/integracion-20261110` | **Dejar** hasta resolver #305; luego borrar | Mismo SHA que la rama de #305. |
| 17 ramas squash con commits posteriores | **Dejar**; revisar commits extra | Contenido extra no determinado. |
| 15 ramas de PR cerrado sin merge | **Dejar**; el dueño decide archivar con tag o borrar | Tienen commits únicos; varios documentados como superados. |
| 33 ramas sin PR con commits únicos | **Dejar**; revisión puntual (`claude/brasas-redefinicion` primero) | Posible trabajo valioso o contradictorio con «Brasas solo cosméticos»; no verificado. |

## 5. Resumen
- PR: 305 (4 abiertos, 282 mergeados, 19 cerrados sin merge). Abiertos por clasificación: COMPATIBLE 2 (#305; #297 con rebase), BLOQUEADO 1 (#293), OBSOLETO 1 (#291), SUPERADO 0, DUPLICADO 0, INCOMPATIBLE 0.
- Documentos viejos a actualizar luego (no se tocaron aquí): `INVENTARIO_PR.md`, `PLAN_INTEGRACION_PR.md`, `RIESGOS_BLOQUEOS.md` (K4 «3 pilas apiladas» ya no aplica).
