# Conexión de la cola a Runway (revisión, no despliegue)

## Qué hace la fábrica interna
La fábrica organiza y abarata trabajo repetible: inventario, referencia del Códice,
contrato del motor, planificación por tiras, límites, caché, descarga, recorte y
ensamblado determinista, comparación y evaluación, y entrega para revisión. Las
recetas nativas existentes pueden producir localmente sin inferencia externa.
Runway es el dibujante externo de imágenes nuevas: conectarlo **no elimina** su
costo ni convierte una imagen en campeón jugable. No hay ahorro garantizado de
precio/calidad; se evita regenerar trabajo idéntico y se permite reparar un clip.

## Recorrido conectado
`UI administrador -> /api/gm/art/command -> cola persistente -> worker independiente
-> queue-s0f -> S0F -> Runway -> descarga local -> atlas/evaluación/preview
-> AWAITING_VISUAL_REVIEW`. Nada aprueba, cambia registros o publica automáticamente.
La API key queda exclusivamente en el worker, nunca en UI, relay ni artifacts.

Soportado con este perfil: `Reparar cazadora` (todos los clips de su contrato) y
`Reparar cazadora animación walk_down` (solo ese clip; los demás cuadros se heredan
y la cobertura se declara). Solo campeones con contrato literal de atlas y la skin explícita
`Reparar cazadora skin cazadora_escarcha` (con `allowedSkins` autorizada), también
con `animación walk_down`. Crear
un campeón nuevo, un escenario arbitrario o otra skin sin contrato identificable
NO se simula: `BLOCKED_CONTRACT`. No se extiende esa compatibilidad a todas las skins del juego.

## Preparación de runtime — requiere autorización del dueño
1. Revisar e integrar la rama, sus dependencias y CI antes de desplegar. Este
   documento NO demuestra despliegue, clave válida, saldo o worker activo.
2. Instalar Node 22 y dependencias Python de `tools/factory/requirements-test.txt`.
3. Copiar `deploy/art-factory/runway-s0f.example.json` fuera del repositorio.
   Está deshabilitado por defecto. Aprobar topes y allowedTargets (lista explícita
   del piloto) y recién entonces habilitarlo. Otros campeones quedan bloqueados
   aunque existan órdenes antiguas en cola; ampliar solo tras cerrar el piloto.
4. Configurar nombres `FONDAL_ART_API`, `FONDAL_ART_WORKER_TOKEN` (mismo secreto
   privado que el relay), `FONDAL_ART_OUTPUT` (disco persistente),
   `FONDAL_ART_PROFILE` (archivo del perfil), `RUNWAYML_API_SECRET` o `RUNWAY_API_KEY`.
   El conector Runway del chat no instala estas variables en el servidor.
5. Arrancar el servicio existente `deploy/art-factory/fondal-art-worker.service`.
   El panel distingue proceso vivo de proveedor localmente configurado; no dice
   que se comprobó autenticación/saldo con una llamada remota.

El ejemplo limita 10¢ por solicitud, 180¢ por orden y 500¢ por día UTC; **son
techos de reserva, no facturas ni autorización de gasto**. Una orden completa de
Sylva planifica 13 solicitudes (42 cuadros usados de 52 celdas); Escarcha
planifica 18 (24 cuadros usados). La reserva conservadora de una pasada de
ambas es 310¢ API. Una animación como walk_down usa una. La reserva
se hace antes del POST; errores inciertos no se reembolsan en el registro local.
El costo real se confirma con el proveedor. Para compartir tope diario todos
los jobs deben usar el mismo `FONDAL_SPEND_LEDGER` absoluto en CLI y worker
(default del worker: root/spend-ledger.json). No dividir libros entre servidores.

## Revisión de una entrega exacta
El job guarda `input.json`, `delivery.json`, `s0f/contract.json`, `plan.json`,
`estimate.json`, `state.json`, tiras, atlas, `assembly.json`, `evaluation.json` y
`preview.png` bajo `$FONDAL_ART_OUTPUT/<job-id>/`. Ninguno contiene credenciales.
Las tareas remotas y la caché con hash viven en `cache/`; el ledger es compartido.

```bash
# Solo lectura / procesamiento local; usar ID y directorio exactos del job.
node tools/factory/cli.js status cazadora --run-dir /var/lib/fondal-art/JOB_ID/s0f
node tools/factory/cli.js preview cazadora --run-dir /var/lib/fondal-art/JOB_ID/s0f
# SOLO después de una revisión humana real, nunca para saltarse el gate:
node tools/factory/cli.js approve cazadora --reviewer NOMBRE --run-dir /var/lib/fondal-art/JOB_ID/s0f
node tools/factory/cli.js integrate cazadora --run-dir /var/lib/fondal-art/JOB_ID/s0f
```
`integrate` prepara un staging con ruta inmutable por hash y parche exacto de
registro; estado STAGED_REVIEW_ONLY, runtimeActive=false. **No registra el atlas
activo ni despliega**.
Su snippet debe revisarse en un PR con contratos, pruebas de runtime/arte y
aprobación del arquitecto/director. Un nombre en JSON no autentica identidad
humana: la aprobación real es externa y el PR conserva sus controles S0C/#255.
Una entrega parcial nunca pasa como reparación completa. 90 automático mide
formato/proporciones, no fidelidad artística al Códice: exige revisión visual.

## Interrupciones sin duplicar cobros
- Se guarda la intención antes de enviar y el task ID antes de hacer polling.
- `PROVIDER_PENDING` con `resumable:true`: el administrador puede **Reanudar**;
  conserva el job y task ID, hace GET/download y no otro POST por esa tarea.
- `PROVIDER_UNCERTAIN`: respuesta del POST perdida/no hay task ID confirmado.
  No se reencola ni reenvía. Conciliar con el proveedor y diario antes de decidir.
- `BLOCKED_CREDENTIAL`, `BLOCKED_CREDIT`, `BLOCKED_BUDGET`, `BLOCKED_CONTRACT`:
  causa visible, nada de fallback silencioso. Corregir configuración/contrato
  con autorización; no borrar el diario para forzar regeneración.
- Un finish con respuesta perdida se reenvía idempotentemente desde receipt,
  nunca vuelve a generar. Un lease vencido deja evidencia para conciliación.
- Locks abandonados se inspeccionan contra el proceso antes de quitarlos;
  no hay borrado automático que pueda duplicar solicitudes.
- El mismo input/proveedor/config conserva hashes; cambios invalidan la
  reanudación. Caché íntegra se reutiliza y la revisión humana sigue pendiente.

## Verificación
Tests con APIs simuladas, sin cargos:
`node --test tools/fondal-art-engine/*.test.js tools/factory/s0f/*.test.js` y
`node server/test-art-factory.js`. El fixture devuelve píxeles existentes;
prueba conexiones/estados, **no** calidad de una nueva generación IA.

## Importar una entrega del conector Runway del chat
`tools/factory/s0f/external-import.js` ofrece `prepareExternalPlan` (solo local) e
`importExternal` (sin red): usa el MISMO plan, referencias preparadas, hashes,
ensamblador y evaluador. El manifiesto registra task ID, modelo realmente usado,
pool de créditos, evidencia del tool y costo/saldo observado (null si desconocido).
Requiere revisión explícita de procedencia; no autentica por sí solo un JSON ni
aprueba arte. Créditos del conector y centavos del proveedor API son libros
separados: nunca se convierten ni se confunden. Esta vía no demuestra que el
worker tenga instalada una credencial API. Ver pruebas `external-import.test.js`.

Capturas del renderer real: `node tools/fondal-art-engine/pilot-runtime.js --out DIR`
comprueba base+Escarcha existentes. Para candidato exacto añadir `--base-run-dir DIR`
y/o `--skin-run-dir DIR`: intercepta esos bytes solo en el navegador aislado,
registra sus SHA256 y produce contact sheet + capturas in-game. No instala nada.
CI conserva estas capturas; la ejecución baseline no prueba calidad de nuevos assets.

### Corrección de un falso rechazo de contraste (no aumento de umbrales)
`shade_sd` mide desviación de luminosidad global de los píxeles opacos, no cuántos
tonos ni cuán suave es el sombreado. La referencia legítima Escarcha (plumas
blancas sobre ropa azul oscura) da ≈74,75; su fixture ensamblado≈74,85, frente al
rango histórico≤74,52. Se conserva el valor/rango como diagnóstico visible, pero
no como veto universal de estilo. Siguen obligatorios contorno, suavidad local,
detalle, alfa, silueta, movimiento, anclaje/escala y revisión artística. Tests
negativos con desenfoque (incluso alfa endurecido) y celdas vacías siguen fallando.
No se elevó ningún umbral para hacer pasar una entrega de IA.
