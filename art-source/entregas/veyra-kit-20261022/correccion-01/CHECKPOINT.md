# Corrección agrupada 01 — veyra — 22/10/2026

PR https://github.com/Fondal-Studios/La-Horda/pull/196; continúa el head 0185b9d9a0dbed5d649371ba2d3302961800ce2b. La revisión de este archivo queda identificada por su commit en GitHub. Base main6334ff40b6514808ef0fe00b50bec15e19f10c25.

Estado: EN_CORRECCION / NO_INTEGRAR. No se declara VALIDADO, INTEGRADO_MAIN ni publicación. No se crearon atlas nuevos: las recetas reexportan píxel por píxel los atlas de la primera pasada (hashes en comparison.json). Fuentes/IDs originales, definitiva UF y otras primeras pasadas conservados.

## Resultado técnico

14 controles de dueño/duración PASS; 9 controles del kit PASS; 132 funcionales PASS; 21 de relay específico PASS; 23 online generales PASS.

Pacto se vincula al lanzamiento, índice exacto del héroe y duración real (tope original5000ms); termina al morir/reiniciar/vencer, no revive con buffs ajenos ni se asigna al vecino. El pool visual existente administra el seguimiento. Registro tardío de kvbFx: faltaba llamar netHookEvents después de agregar el nombre; el relay real reproducía ausencia en invitado. Se agregó ese enganche, de alcance KVB compartido, sin cambiar protocolo ni permisos.

Se conservan dos fallos de ensayo: online-fixture-first-attempt.json usó por error la pareja Brakk heredada del arnés, corregido a Morveth/Veyra; online-network-before/diagnostic reproducen el defecto real previo del enganche. online-results.json es el ensayo final21/21 PASS. Una espera fija de3000ms resultó corta bajo carga en un ensayo; la corrida diagnóstica y final alcanzan expiración, la unidad comprueba 2999/3000ms del motor.

Bloqueo heredado: KVB activado/desactivado da28804/29969 llamadas Math.random. Reproducido en el head previo y después. Los snapshots completos con KVB activado antes/después son idénticos; eso no aprueba la paridad on/off. Ver parity-before/after/comparison.json y no bajar el gate.

## Evidencia visual y límites

comparison-horizontal.png y comparison-mobile.png comparan primera pasada/corrección con el mismo escenario y escala. Ocho sceneHash previos iguales por kit; UF byte idéntica en ambos tamaños. La referencia móvil es ../mobile-after de la primera pasada (sin regenerar); before/after locales corresponden a horizontal. Revisión visual inicial de ambas láminas: sin alteración de silueta por esta corrección; en Brakk cambia la secuencia de montaje y persiste el FIX de soportes; en Veyra persiste la necesidad de revisar corazón entre círculos del equipo. No constituye aprobación integral ni aprobación humana del Art Gate.

Pendientes: skins, seis arenas/contraste específico, carga en frío, reentrada en cámara/pool saturado, revisión visual integral y CI del nuevo head. Los gates estrictos de la primera pasada no sustituyen estos pendientes. No se tocaron gameplay, balance, cuentas, cobros, infraestructura ni permisos.

## Reanudar

Leer primero heads/checkpoints de PR196/197/199 y docs/production/CORRECTION_BATCH.json (20 entradas, conserva historial). Continuar lote de enlaces/tiempos con Aelith B105 (cancelación por muerte/reemplazo) y B107 (vuelta por buff/deuda gris800ms). Luego formas/contraste en lote conjunto. No repetir primeras pasadas ni tocar PR191. Antes de una integración seleccionar componentes aprobados y revalidar diff, head, todos los workflows/gates; ningún taller entero se cierra por esta parte.

Reproducir localmente con Chromium y Playwright disponibles:

```sh
node tools/vfx/verify-veyra-pact-owner.js
node tools/vfx/veyra-pact-online.js
PARITY_OUT=/tmp/veyra-parity.json node tools/vfx/parity-veyra-pact.js
```

## Cierre remoto verificado

Producción de esta corrección: fbe79306b46cc5829ba5b30ee06581da5cf2c6a5. Todos los blobs de la entrega fueron cotejados contra GitHub. Ver REMOTE_CLOSURE.json: 17 checks y7 workflows del SHA de producción pendientes/en curso al consultar; no es aprobación del nuevo commit de cierre. Rama y PR siguen abiertos como borrador.

Lote compañero: Brakk PR197 producción c4b3aaf754a9cd315ae214162a181ee8afa1210c; Veyra PR196 producción fbe79306b46cc5829ba5b30ee06581da5cf2c6a5. Retomar los heads frescos de ambos. No hay merge ni publicación verificada.
