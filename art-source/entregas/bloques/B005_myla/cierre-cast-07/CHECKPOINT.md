# B005 Myla — cierre visual 07

Estado: **EN_CORRECCION / FIX_NO_INTEGRAR**. Se corrigió agrupadamente la composición de `my_bubble_idle` durante el lanzamiento Códice: fuera del cast conserva la capa superior, 68×68, ancla `-12` y alfa `.8`; durante el cast pasa detrás del cuerpo, abre el aro a 88×88, usa ancla `-8` y alfa `.64`. Escudo, TTL, duración, daño, balance, red, skins y Berrinche no cambian.

Referencia exacta: `assets/ui/codex/champions/myla.png`. Fuente preservada: `art-source/entregas/bloques/B005_myla/revision-cast-back-03/cast.png`, SHA-256 `1069b0085e3bae9854357869aaae4ebd875074623ccd6d0af4bd061a15d41110`.

El run `44382568998` validó la corrección en renderer real con 170/170 controles. El run exacto A/B `44384047812`, job `135083661830`, artifact `14465316911`, repitió la matriz y agregó 24 pares de la misma escena/instancia viva: **194/194 PASS**, cero errores. La revisión real de escritorio/móvil, doce fases, seis arenas y base/Merienda/Arándanos confirma que el aro abierto y detrás recupera cabeza, torso y cuchara; la identidad del Códice y la lectura del escudo se mantienen.

El workflow temporal se retira. Este cierre aprueba la corrección visual de capas como candidata, pero **no integra ni publica**: faltan multijugador, rendimiento y todos los checks/workflows aplicables del head final sin infraestructura temporal.

Próximo paso: ejecutar los gates pendientes sobre este candidato sin rehacer las pruebas visuales válidas; si pasan, separar el componente aprobado y recién entonces quitar FIX/NO_INTEGRAR y hacer merge normal con `expected_head_sha`.
