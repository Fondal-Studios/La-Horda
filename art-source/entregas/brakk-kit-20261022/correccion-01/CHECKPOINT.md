# Corrección agrupada 01 — brakk — 22/10/2026

PR https://github.com/Fondal-Studios/La-Horda/pull/197; continúa el head 3b01d7613b6636ce8c717e13b96d0376830ad878. La revisión de este archivo queda identificada por su commit en GitHub. Base main6334ff40b6514808ef0fe00b50bec15e19f10c25.

Estado: EN_CORRECCION / NO_INTEGRAR. No se declara VALIDADO, INTEGRADO_MAIN ni publicación. No se crearon atlas nuevos: las recetas reexportan píxel por píxel los atlas de la primera pasada (hashes en comparison.json). Fuentes/IDs originales, definitiva UF y otras primeras pasadas conservados.

## Resultado técnico

20 controles de fase del renderer PASS; 19 del kit PASS; 132 funcionales PASS; 14 de relay específico PASS; combate/RNG29232 idéntico con/sin SFA.

El montaje brakk_build opta por beamEventPhase y recorre su atlas según t/dur del evento. brakk_nails, siege y consumidores sin esa opción conservan su bucle. Variantes~h/~p y fin del evento comprobados contra drawImage real a relojes distintos. El cambio común de engine deberá reconciliarse con PR198/199; no importar sus FIX. B118 aún dibuja soportes como flechas.

## Evidencia visual y límites

comparison-horizontal.png y comparison-mobile.png comparan primera pasada/corrección con el mismo escenario y escala. Ocho sceneHash previos iguales por kit; UF byte idéntica en ambos tamaños. La referencia móvil es ../mobile-after de la primera pasada (sin regenerar); before/after locales corresponden a horizontal. Revisión visual inicial de ambas láminas: sin alteración de silueta por esta corrección; en Brakk cambia la secuencia de montaje y persiste el FIX de soportes; en Veyra persiste la necesidad de revisar corazón entre círculos del equipo. No constituye aprobación integral ni aprobación humana del Art Gate.

Pendientes: skins, seis arenas/contraste específico, carga en frío, reentrada en cámara/pool saturado, revisión visual integral y CI del nuevo head. Los gates estrictos de la primera pasada no sustituyen estos pendientes. No se tocaron gameplay, balance, cuentas, cobros, infraestructura ni permisos.

## Reanudar

Leer primero heads/checkpoints de PR196/197/199 y docs/production/CORRECTION_BATCH.json (20 entradas, conserva historial). Continuar lote de enlaces/tiempos con Aelith B105 (cancelación por muerte/reemplazo) y B107 (vuelta por buff/deuda gris800ms). Luego formas/contraste en lote conjunto. No repetir primeras pasadas ni tocar PR191. Antes de una integración seleccionar componentes aprobados y revalidar diff, head, todos los workflows/gates; ningún taller entero se cierra por esta parte.

Reproducir localmente con Chromium y Playwright disponibles:

```sh
node tools/vfx/verify-brakk-build-phase.js
node tools/vfx/brakk-phase-online.js
ONLY=brakk node tools/vfx/parity-skill-fx.js
```

## Cierre remoto verificado

Producción de esta corrección: c4b3aaf754a9cd315ae214162a181ee8afa1210c. Todos los blobs de la entrega fueron cotejados contra GitHub. Ver REMOTE_CLOSURE.json: 17 checks y7 workflows del SHA de producción pendientes/en curso al consultar; no es aprobación del nuevo commit de cierre. Rama y PR siguen abiertos como borrador.

Lote compañero: Brakk PR197 producción c4b3aaf754a9cd315ae214162a181ee8afa1210c; Veyra PR196 producción fbe79306b46cc5829ba5b30ee06581da5cf2c6a5. Retomar los heads frescos de ambos. No hay merge ni publicación verificada.
