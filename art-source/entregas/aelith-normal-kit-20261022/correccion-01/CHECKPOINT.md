# Aelith — corrección agrupada de ciclo de vida01 (22/10/2026)

PR199 / rama art/aelith-normal-kit-first-pass-20261022. Continúa6ead42f01d0bc272d87d01e373e83d951b7a1de5; checkpoint inicial de recuperación6ca8b4e8e306ec8a6bc718ef3b55aae9a79c9ee8. Main6334ff40b6514808ef0fe00b50bec15e19f10c25. Checkpoint previo completo; no trabajo concurrente encontrado. Consultar REMOTE_CLOSURE.json para commit de producción y comprobación remota.

**EN_CORRECCION / NO_INTEGRAR.** No merge, no publicación. B105 y B107 tienen correcciones técnicas probadas; no se declara bloque aprobado. B106 y contraste siguen FIX. PR191 y fuentes originales conservados.

## Cambios

B105: retirado end genérico. El estallido se emite únicamente desde la llamada de impacto real de aelithUpdateObject. Cancelaciones por muerte/fusión/vacío/dueño ausente/límite2/reset/snapshot perdido no inventan segundo daño. Evento escalar SFA existente viaja a invitado.

B107: auraEventPhase/auraFamily optativos siguen t/dur, una secuencia por receptor; una vuelta en duración real del beneficio. Transición real a deuda emite aura gris800ms; tres snapshots del cuerpo equipado se recolorean y colapsan en220ms. Recasteo reemplaza fase solo del receptor. Nuevo candidato debt-sand40x56x12 reutiliza receta nativa. No arte externo/imagegen porque se modifica código SFA; cuatro atlas originales48cuadros reexportados idénticos.

Engine reconcilia beamEventPhase de PR197; pixfx reconcilia netHookEvents tardío de PR196. No importa sus dibujos/FIX. Solo fuentes SFA/KVB, arneses y evidencias; sin cambios mecánicos, cuentas, cobros, infraestructura o permisos.

## Validación local

- Ciclo de vida41/41; kit27/27; variantes11/11: eco diferido1600ms, aftershock, reprise, compartir, lentitud ajena.
- Relay real31/31: host/invitado táctil, muerte, límite2, fin/deuda800ms y receptores0/1, UF. Historial de intentos en TEST_ATTEMPTS.json; no ocultar cuatro fallos previos del fixture no aislado. Pruebas de variantes son locales, no afirmar que reprise se ejercitó online.
- Funcionales132/132 y online generales23/23. Paridad SFA combate/RNG29884 idéntica,0errores de página.
- Ocho sceneHash iguales; UF idéntica horizontal/móvil. Originales y hashes en comparison-checks.json. Inspección de contactos en VISUAL_REVIEW.md: gris/estela tenues, B106 pendiente; no Art Gate integral.
- CI remoto debe consultarse por head vigente. Checks de un head anterior no autorizan merge.

## Reanudar

Consultar primero main/heads y este cierre remoto. No repetir primera pasada ni temporizadores ya probados. Próximo lote grueso: Solciju manchas/strictfill/tintes, Brakk B118 soportes flecha, Morveth B166disipación/B167capasblancas/B168micelio, Aelith B106fractura/B107contraste. Conservar IDs/hash/historial en CORRECTION_BATCH.json (20entradas). KVB RNG heredado de Veyra sigue pendiente. Reconciliar extensiones engine/bind/pixfx al aislar componentes aprobados; no importar talleres completos.

Comandos desde raíz (Node+Playwright/Chromium disponibles):
```
node tools/vfx/verify-aelith-lifecycle.js
node tools/vfx/verify-aelith-variants.js
OUT=art-source/entregas/aelith-normal-kit-20261022/correccion-01/reexport node tools/vfx/verify-aelith-kit.js
node tools/vfx/aelith-lifecycle-online.js
ONLY=aelith node tools/vfx/parity-skill-fx.js
node tools/quality-five/functional.js
node tools/quality-five/online.js
TIMES=250,750,1600,3050,3300,3800 MOBILE=1 MOVE=1 OUT=art-source/entregas/aelith-normal-kit-20261022/correccion-01/mobile-after node tools/vfx/capture-aelith-lifecycle.js
```
Para antes: worktree del head6ead42f inicial con el mismo arnés capture-aelith-lifecycle.js, idénticos parámetros, OUT separado; comparación horizontal omite MOBILE/MOVE. Configurar CHROMIUM_PATH/NODE_PATH según entorno. Los arneses generales escriben su informe habitual: copiarlo al bloque y restaurar ese informe general antes de subir. No se necesita persistencia local para retomar.
