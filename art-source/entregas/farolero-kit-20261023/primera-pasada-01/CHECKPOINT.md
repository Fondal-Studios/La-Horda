# Farolero — primera pasada B138/B139/B140

Estado: **EN_CORRECCION / NO_INTEGRAR**. Producción GENERADO; VALIDADO no; INTEGRADO_MAIN no; publicación no verificada. Borrador, nunca mergear con FIX.

Base main `f62d181477adcb4607cc615411cc51bad769f681`. Recuperación remota `1fff15958d84d0280bacd116b0fd553a9ec6df47`. Cierre previo PR207 leído; sin pérdida de cierre. No taller Farolero previo entre 19 PR abiertos; PR208 ajeno conservado. Main no modificado.

## Producción real

Cuatro atlas nativos / 44 fases: 41 no vacías, 3 cierres transparentes intencionales; 38 RGBA distintos sumados dentro de los atlas. Encendido/polillas, haz direccional, tapas de farol y losetas/farolitos. PNG, fuente editable, receta, preview y mapa de cuadros guardados. El beam de senda también corresponde a A-PROP-sfa-path de B486; no cierra B486 completo.

Integración sólo en rama de taller: tres JS SFA (callback opcional en engine, opt-out de extras en bind, Farolero). Extensiones engine/bind idénticas a PR207/206/205; no otros FIX importados. La receta hornea directamente el canvas que dibuja el renderer; PNG es exportación exacta, no descarga externa. 25 referencias preservadas (cuerpo, set, Guardavía, iconos, farol/consumidores y UF). No cuerpo nuevo ni cambio de gameplay/azar/protocolo. No se consideran ausentes B018/B414/B439/B248/B638/B485 ni agregados S035/S036 por conteos.

## Verificación ejecutada

- 24 controles atlas/alfa/caché/fallback PASS; cuatro reexportaciones byteidénticas.
- 27 controles kit/lifecycle PASS: centro, radios, duraciones, escudo local, jefe, recasteo, fin/muerte del objeto senda y reset. 254 regresiones funcionales PASS.
- Relay real 5 PASS, anfitrión Solciju/invitado Farolero táctil con Lumbre Persistente equipada; IDs/dueños de farol/senda coinciden. Dibujos host/invitado: encendido18/41, cono16/29, tapa14/26, senda122/200. Variantes exactas.
- 360 cuadros main/candidato con SFA activo: 27925/27925 llamadas Math.random y estado **resumido** idéntico. No snapshots completos ni aislamiento global.
- 8 sceneHash precast iguales horizontal/móvil, 6 PNG UF idénticos. Capturas nativas y comparaciones antes/después mismo escenario/escala. Tiempos reales80/256/512/1104/2000ms.
- Preview20 imágenes/4canvases/0errores; 95ms diagnóstico, no timing real del juego.

## Clasificación

FIX agrupados: B138 polillas pequeñas/cruces bajo zona legada; B139 franjas/tapas finas dominadas por impactos blancos y firma solar; B140 senda lee riel/bloques, farolitos pequeños y reloj global. Beam cast conserva cierre burst genérico. Se conservan todos los emisores mecánicos y señales ajenas. REVIEW.json contiene hashes/cuadros/evidencia; cola43 conserva40 entradas anteriores.

Pendientes: Art Gate compuesto, skins/equipo/seis arenas, contrastes, extremos de lifecycle, saturación/reentrada/culling, warmup/performance sostenida y CI exacthead. Guardavía no certificada online. No aprobación de todas las capturas ni merge/publicación.

## Reanudar

Consultar head/PR/cierre frescos. Auditar **Guerrero B141/B142/B143**, preservar muerte PR187 ya integrada, cuerpo/UF/básico y cualquier arte existente. No repetir Farolero/Facu/Eslabón ni dedicar otro ciclo a un cuadro. Primero cobertura amplia, luego lote de corrección.

Comandos exactos en `recipe.json`; reproducción: `NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules CHROMIUM_PATH=/tmp/chromium node tools/vfx/verify-farolero-kit.js`. Sólo aislar/mergear un componente tras Art Gate y CI aplicables verdes, expected_head_sha y verificación main. Inventario global incompleto.

## Cierre remoto

PR209 borrador: https://github.com/Fondal-Studios/La-Horda/pull/209

Producción `18ff9cfadde6eabb1f792d71fb8b385c472d61b0`: 102 archivos verificados contra Git blob local, árbol remoto completo, ref y head del PR. Main continúa `f62d181477adcb4607cc615411cc51bad769f681`. Este commit de cierre agrega REMOTE_CLOSURE.json y actualiza checkpoint/manifiesto; el SHA final se registra en el cuerpo del PR después de cotejar el árbol. CI final pendiente, nunca aprobación por resultados de otro SHA. Sin merge ni publicación.
