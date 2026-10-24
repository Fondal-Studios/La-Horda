# Morveth B168 — contacto02

23/10/2026. PR198 / art/morveth-kit-first-pass-20261022. Parent20d65cf2c0b11e200aa785c64b6e1b16627810a0; recuperación2608745aee1be1a2231973da1fd14c6cccbaccd6. Main6334ff40b6514808ef0fe00b50bec15e19f10c25. Heads/cierres remotos leídos;450 JS locales cotejados contra parent antes de editar, sin diferencias. Sin concurrencia detectada. Producción y cierre verificados en REMOTE_CLOSURE.json.

## Cambio real

B168 A-FX-morveth-h3 conserva18cuadros y la animación100ms por cuadro. Celda48x56 en lugar de40x56: cuatro sombreros laterales violetas con contorno oscuro cerrado y láminas claras; raíces bifurcadas, centro superior abierto y dos esporas laterales. Tinte común conservado en raíces; el sombrero mezcla80% violeta canónico y20% acento de arena. Ancho cosmético60unidades al radio visual25; radio mecánico intacto.

Solo js/champions/skill-fx-a/c/morveth.js cambia entre450JS runtime. Engine/bind, champion-signatures, dueños, duración real de armadura, protocolo y UF intactos. Tres atlas37cuadros de brote/pulso/exhalación reexportados idénticos; solo micelio18cuadros revisado. Fuentes originales preservadas. Receta nativa SFA, sin generación raster externa ni nuevos cuadros de cuerpo.

## Evidencia

-43 controles específicos PASS:18configuraciones arena/variante con alfa0/255, márgenes y centro superior libre; caché; atlas real dibujado; seguimiento vivo del dueño; muerte/fin/reduced/reset.23kit y131funcionales Morveth/Aelith PASS.
-17 relay real PASS, atlas48x56x18 observado45dibujos en anfitrión y78en invitado táctil. Eventos de habilidades/UF y autoridad de infección preservados.
-Paridad combate/RNG30414/30414 idéntica360frames. No afirmación global sobre todo RNG visual.
-Gate de protección de enemigo:2268colocaciones por viewport (6arenas×3variantes×18cuadros×7cruces). Mínimo81.155%móvil y80.997%horizontal; umbral80% y deltaRGB24 intactos. Usa sprite real del esqueleto. Aísla aura completa; no certifica contraste compuesto de todos los efectos.
-9sceneHash iniciales iguales: cuatro habilidades horizontal/móvil y B168 skin morveth_alt1 móvil. UF byteidéntica en cuatro tiempos por viewport. Capturas250/500/1100/2000ms; hojas de contacto de todos los tiempos y PNG nativos500ms seleccionados publicados. FULL=1 reproduce todos.
-Matriz raster18filas (6arenas×3variantes),18frames cada una. Caché caliente500consultas retiene1entrada; máximo.1ms, horneado frío máximo3.8ms. Medición local informativa, no performance móvil certificada.

TEST_ATTEMPTS conserva primer candidato: la espora central cruzaba21píxeles del torso en18cuadros;18checks fallaron. Se movieron esporas a los lados, sin rebajar la condición de centro libre. Atlas/fuente/resultados iniciales guardados. Pruebas finales y capturas repetidas; luego solo comentario9x6→9x5 corregido sin cambio ejecutable.

## Clasificación y continuación

GENERADO / EN_CORRECCION / NO_INTEGRAR. Ningún componente VALIDADO ni INTEGRADO_MAIN; publicación no verificada. Revisión visual inicial: sombreros más separados del cuerpo, pero anillos verdes legados siguen dominando en contacto denso. Base y skin móvil examinadas; falta matriz de escena integral con equipo/seis arenas, contraste compuesto, performance sostenida y Art Gate. No mergear taller aunque CI pase.

SIGUIENTE: gates integrales por componente, empezando Brakk PR197 (head observado d411b331324095b61def28454cf04feb3ac6e441): investigar check fallido «Objetos, economía y tienda (parte A)» en ese SHA y completar skins/equipo/arenas/performance de soportes ya corregidos. Separar componente aprobado sin importar FIX de otro taller. Conservar residual B168 y Aelith B106/B107 en cola común22entradas con historial; no repetir primeras pasadas ni RNG compartido ya corregido. Inventario global incompleto.

Consultar heads frescos. Reproducción en recipe.json; ejecutar desde raíz con NODE_PATH/CHROMIUM_PATH configurados. Antes de otro componente, recuperar este cierre remoto y cotejar hashes.
