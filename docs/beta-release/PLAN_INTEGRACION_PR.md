# PLAN DE INTEGRACIÓN DE PR
Reglas: un PR a la vez en `main`; rebase/merge-tree antes; CI del SHA exacto; gate 85/100 + 0 críticos; sin merges de pilas sin orden.
Orden: (1) #271 · (2) #236 · (3) #261 → #263 → #265 (re-basar #265 sobre main; su base actual es `integration/beta-20261101`) · (4) arte: #241, #267, #270 con evaluador artístico · (5) extraer de #252/#254/#255 (contratos), #249, #250, #253 · (6) #232 tras resolver conflictos.
No integrar: #268, #231 (NO_INTEGRAR del autor), #256/#257 (credenciales), #92/#246 (fuera de alcance), #239 parte Cristales/Coliseo.
Pilas: A = 261←263←265 · B = 252←254←255 · C = 256←257. `beta/integracion` NO se fusiona entera.
