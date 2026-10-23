# Morveth — corrección agrupada de siluetas01

22/10/2026. PR198 / rama art/morveth-kit-first-pass-20261022. Base main6334ff40b6514808ef0fe00b50bec15e19f10c25; head anterior7ddcc511b7554495e933a70aafab94bdc1951c9b. Recuperación inicial5adb0cf117fa8c2a47e1b3447e380d42438b69e9. Commit de producción, hashes y comprobación remota en REMOTE_CLOSURE.json. Cierre anterior completo, main/PR consultados; no trabajo concurrente detectado.

## Alcance real

- B166 A-FX-morveth-h1: el borde del pulso aplica disolución nativa. Cuadro10 pasa de152 píxeles opacos a0; conserva radio85, duración520ms y pulsos mecánicos. Brote original idéntico.
- B167 A-FX-morveth-h2: exhalación raster idéntica. La auditoría halló cinco rayos blancos en drawChampionSignatures/__cone; ahora el perfil opcional morveth_spores mantiene borde/radio/ángulo y omite esos rayos. Parámetro escalar del evento vfxSkillCone existente, observado en pool real host/invitado. El resto de conos conserva raster y cinco rayos. No se eliminaron los impactos de material de enemigos ni se cambió daño/contagio.
- B168 A-FX-morveth-h3: micelio con raíces bifurcadas y sombreros laterales en vez de dos antenas. Cuatro atlas55cuadros reexportados; solo pulso11 y micelio18 cambiaron. Primer candidato tocaba bordes de celda; conservado con hashes, luego retraídos los centros de los sombreros. Alfa0/255, contorno con margen en tres variantes. Sigue FIX de lectura móvil en contacto con otros cuerpos y escudo genérico.

Solo dos runtime cambiados en esta corrección: c/morveth.js y js/skills/champion-signatures.js. Engine/bind se conservan exactamente como PR198 anterior. La futura reconciliación de extensiones comunes con PR197/199 sigue pendiente; no se importó arte FIX ajeno. Sin cambios de gameplay, balance, cuentas, cobros, permisos ni infraestructura. No generación raster externa: se corrigieron recetas nativas SFA existentes. Fuentes anteriores y entrega inicial preservadas.

## Evidencias y límites

-23 comprobaciones de kit PASS, incluyendo final transparente del pulso;30 específicas de silueta PASS: seis arenas/tres variantes, márgenes de micelio, renderer real sin rayos, cono genérico intacto, limpieza del perfil al reutilizar pool, SFA_OFF y restauración del hook incluso ante excepción.
-131 funcionales Morveth/Aelith PASS.16 relay específico PASS: perfil escalar en pool real de anfitrión e invitado táctil; eventos SFA/pulsos, autoridad de infección y muerte.23 online generales PASS. Paridad SFA combate/RNG30414/30414 idéntica.
- Gate específico para brote42, pulso85, cono210 y aura25; tres variantes; seis arenas horizontal/móvil:216 filas/648 colocaciones por viewport, peor visibilidad87%, umbral80% sin modificar. Las mediciones de relleno/tinte adicionales del arnés son KVB general, no nuevas afirmaciones sobre relleno/contraste específico del micelio.
-8 sceneHash previos iguales; UF byteidéntica horizontal/móvil. Brote y exhalación PNG idénticos por SHA256. before/after y mobile-before/mobile-after conservan las cuatro habilidades y seis tiempos. Se publican capturas móviles1:1 de cono250ms, aura500ms y pulso1500ms; el arnés FULL=1 reproduce todas.
- TEST_ATTEMPTS conserva primer fallo de instrumentación online (NET_ORIG evita wrapper window), error sintáctico del arnés adicional y candidato con contacto de borde. La corrección de observación de red pasó sin cambio runtime; la corrección del borde volvió a pasar exportador,30checks,legibilidad,capturas y relay/paridad. No ocultar intentos.

## Clasificación

GENERADO: recetas/atlas revisados. EN_CORRECCION / NO_INTEGRAR: revisión inicial favorable B166/B167, pero no aprobación integral; B168 sigue tenue en contacto móvil. Ningún componente VALIDADO ni INTEGRADO_MAIN. Publicación NO_VERIFICADA. Faltan matriz integral de skins equipadas, contraste en superposiciones, warmup/performance, reentrada/culling y Art Gate. CI del head final debe consultarse de nuevo; no hereda el estado de producción. No mergear el taller aunque CI pase.

## Continuar

Prioridad siguiente: **Aelith B106/B107** en PR199, head observado06116656179e90e15243f9aa505b2ec59750388d. Recuperar su correccion-01/CHECKPOINT.md y leer source/head frescos. Mejorar fractura/apertura/cierre/slow y contraste de estela/deuda, preservando41pruebas de ciclo de vida, reloj relativo, deuda800ms y UF/PR191. Después revisar RNG KVB heredado Solciju/Veyra y matriz integral. Cola común conserva21 entradas originales e historial; no representar estos kits como inventario completo.

Comandos de reproducción desde raíz, Node/Playwright/Chromium configurados por NODE_PATH y CHROMIUM_PATH:
```
OUT=art-source/entregas/morveth-kit-20261022/correccion-01 node tools/vfx/verify-morveth-kit.js
node tools/vfx/verify-morveth-silhouette.js
MOBILE=1 node tools/vfx/test-morveth-legible.js
node tools/vfx/morveth-silhouette-online.js
ONLY=morveth node tools/vfx/parity-skill-fx.js
node tools/quality-five/temporal-plague-functional.js
FULL=1 MOBILE=1 TIMES=80,250,500,1100,1500,2000 OUT=/tmp/mor-review node tools/vfx/capture-morveth-silhouette.js
```
El antes se reproduce con head7ddcc... y el mismo arnés de captura, fuente/signatures anteriores guardadas aquí. No depender de disco local; consultar cierre remoto y preservar fuentes/IDs.
