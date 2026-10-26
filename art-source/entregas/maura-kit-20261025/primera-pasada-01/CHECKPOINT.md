# Maura — primera pasada nativa, 25/10/2026

Base main: `7e4e653e83b958bb63534ea90cfc77400bf93545`.

GENERADO → EN_CORRECCION / NO_INTEGRAR. Tres candidatos nativos: B163 raíz de paso, B164 placas de corteza, B165 tijeras de poda. 42 cuadros, 39 no vacíos y tres cierres transparentes. No cierra los bloques completos. Cero runtime o assets instalados modificados; cuerpo, skins y definitiva existentes preservados.

Fuente `source-native.js`, receta y PNG reproducibles con `node tools/vfx/export-maura-candidates.js`. Preview animada y hoja de contacto incluidas. Tres reexportaciones byte idénticas. 464 archivos runtime/plan/cuerpo/cola cotejados con main fresco antes de producir.

Pruebas nuevas: alfa/bordes de las tres tiras; 6 escenas reales Bosque/base móvil-escritorio con drawImage candidato y cuerpo Maura verificados; 7 casos del ciclo de vida actual. Son diagnósticos; no A/B/A completo, absorción real de daño, paridad global, relay, matriz integral ni Art Gate. Las pruebas anteriores de Mago no certifican estos candidatos.

Correcciones agrupadas conservadas: intento01 recorta corteza; intento02 pasa técnico pero siluetas finas; fuente final refuerza las tres piezas. Revisión final sigue FIX: raíz regular/cable y superposición del haz, corteza discreta bajo emblemas/aura, tijeras pequeñas junto a pies. Corteza no puede seguir el objeto a ciegas: ex_bark sigue vivo con escudo cero. Cero cambios de combate para resolverlo.

Cola común: 58 entradas, conserva las 55 anteriores. PR borrador, sin merge ni consulta nueva de publicación. Consultar REMOTE_CLOSURE para commit/PR verificados.

Siguiente: CIERRE Maura agrupado. Reconciliar capas redundantes del mismo componente, vincular crecimiento/retirada a cast/escudo/objeto/semillas reales, conservar UF y fallback. Después contraste de cuerpos 80%/delta24, skins/equipo/seis arenas, lifecycle/frío/recuperación, relay/paridad/performance/Art Gate y CI exacto. No abrir otro kit para evitar este cierre.
