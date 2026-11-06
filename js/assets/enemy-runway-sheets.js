"use strict";
/* ============================================================
   js/assets/enemy-runway-sheets.js
   Enemigos con hoja completa (idle, caminar, ataque, golpe, muerte) hecha con Runway y procesada por
   tools/art/runway/build_sheet.py (fuente y recibos en art-source/runway-enemies/<arena>/<tipo>/).
   Mismo motor que las hojas de jefes: ENEMY_ATLAS_PACK manda sobre los recortes sueltos de PACK_ANIM.
   Para sumar un enemigo: spec.json + build_sheet.py, copiar atlas.png a assets/sprites/... y agregar la línea acá
   con el meta.json generado. El arte anterior queda como respaldo si el atlas no carga.
   ============================================================ */
const ENEMY_RUNWAY_SHEETS = {
  golem_hielo: {src:"assets/sprites/enemies/hielo/golem_hielo/v2/atlas.png", hMul:2.6, meta:{"w":100,"h":98,"cols":8,"refH":84,"anchor":0.949,"sets":{"idle":[12,13,14,15],"walk":[0,1,4,5],"atk":[2,9,10,7],"hit":[8],"death":[8,16,17]}}},
  hada_escarcha: {src:"assets/sprites/enemies/hielo/hada_escarcha/v2/atlas.png", hMul:2.9, meta:{"w":69,"h":83,"cols":8,"refH":64,"anchor":0.9398,"sets":{"idle":[10,3,10,1],"walk":[0,1,2,3,4,5],"atk":[6,7,8,9],"hit":[12],"death":[11,13]}}},
  cristal_servo: {src:"assets/sprites/enemies/hielo/cristal_servo/v2/atlas.png", hMul:2.6, meta:{"w":93,"h":81,"cols":8,"refH":71,"anchor":0.9383,"sets":{"idle":[3,4,3],"walk":[0,1,2,1],"atk":[5,6,7],"hit":[6],"death":[7,8]}}},
  cristal_volador: {src:"assets/sprites/enemies/hielo/cristal_volador/v2/atlas.png", hMul:2.4, meta:{"w":103,"h":80,"cols":8,"refH":72,"anchor":0.9375,"sets":{"walk":[0,1,2,3,4,5],"atk":[6,7,8,9,10],"hit":[10],"death":[11,12,13],"idle":[0,1,0,2]}}},
  demonio_hielo_fuego: {src:"assets/sprites/enemies/hielo/demonio_hielo_fuego/v2/atlas.png", hMul:2.6, meta:{"w":120,"h":92,"cols":8,"refH":84,"anchor":0.9457,"sets":{"walk":[0,1,2,3],"atk":[4,5,6],"hit":[6],"death":[6,7],"idle":[0,1,0,2]}}},
  zombie: {src:"assets/sprites/enemies/infernal/zombie/v2/atlas.png", hMul:2.6, meta:{"w":98,"h":104,"cols":8,"refH":84,"anchor":0.9519,"sets":{"walk":[0,1,2,3,4],"atk":[5,6,7,8,9],"hit":[9],"death":[10,11,12],"idle":[0,1,0,2]}}},
  esqueleto: {src:"assets/sprites/enemies/infernal/esqueleto/v2/atlas.png", hMul:2.6, meta:{"w":86,"h":88,"cols":8,"refH":80,"anchor":0.9432,"sets":{"walk":[0,1,2,3,4,5],"atk":[6,7,8,9,10],"hit":[10],"death":[11,12,13],"idle":[0,1,0,2]}}},
  esqueleto_h: {src:"assets/sprites/enemies/infernal/esqueleto_h/v2/atlas.png", hMul:2.6, meta:{"w":145,"h":158,"cols":8,"refH":84,"anchor":0.9684,"sets":{"walk":[0,1,2,3,4,5],"atk":[6,7,8,9,10],"hit":[10],"death":[11,12,13],"idle":[0,1,0,2]}}},
  demonio_menor: {src:"assets/sprites/enemies/infernal/demonio_menor/v2/atlas.png", hMul:2.6, meta:{"w":96,"h":84,"cols":8,"refH":76,"anchor":0.9405,"sets":{"walk":[0,1,2,3,4],"atk":[5,6,7,8,9],"hit":[9],"death":[10,11,12],"idle":[0,1,0,2]}}},
  demonio_mago: {src:"assets/sprites/enemies/infernal/demonio_mago/v2/atlas.png", hMul:2.6, meta:{"w":127,"h":88,"cols":8,"refH":80,"anchor":0.9432,"sets":{"walk":[0,1,2],"atk":[3,4,5],"hit":[5],"death":[6,7,8],"idle":[0,1,0,2]}}},
  bestia_bosque: {src:"assets/sprites/enemies/bosque/bestia_bosque/v2/atlas.png", hMul:3.0, meta:{"w":87,"h":73,"cols":8,"refH":64,"anchor":0.9315,"sets":{"walk":[0,1,2,3,4],"atk":[5,6],"hit":[6],"death":[6,7],"idle":[0,1,0,2]}}},
  ent: {src:"assets/sprites/enemies/bosque/ent/v2/atlas.png", hMul:2.6, meta:{"w":79,"h":92,"cols":8,"refH":84,"anchor":0.9457,"sets":{"walk":[0,1,2,3,4,5],"atk":[6,7,8,9,10],"hit":[10],"death":[11,12,13],"idle":[0,1,0,2]}}},
  druida_arena: {src:"assets/sprites/enemies/laberinto/druida_arena/v2/atlas.png", hMul:2.6, meta:{"w":99,"h":98,"cols":8,"refH":84,"anchor":0.949,"sets":{"walk":[0,1,2,3,4,5],"atk":[6,7,8,9,10],"hit":[10],"death":[11,12,13],"idle":[0,1,0,2]}}},
  escorpion_gigante: {src:"assets/sprites/enemies/laberinto/escorpion_gigante/v2/atlas.png", hMul:2.2, meta:{"w":79,"h":69,"cols":8,"refH":56,"anchor":0.9275,"sets":{"walk":[0,1,2,3,4,5],"atk":[6,7,8,9,10],"hit":[10],"death":[11,12,13],"idle":[0,1,0,2]}}},
  tiburon_blanco: {src:"assets/sprites/enemies/acuatica/tiburon_blanco/v2/atlas.png", hMul:2.44, meta:{"w":139,"h":75,"cols":8,"refH":64,"anchor":0.9333,"sets":{"walk":[0,1,2],"atk":[3,4,5],"hit":[5],"death":[6,7,8],"idle":[0,1,0,2]}}},
  tiburon_joven: {src:"assets/sprites/enemies/acuatica/tiburon_joven/v2/atlas.png", hMul:2.4, meta:{"w":127,"h":69,"cols":8,"refH":56,"anchor":0.9275,"sets":{"walk":[0,1,2],"atk":[3,4,5],"hit":[5],"death":[6,7,8],"idle":[0,1,0,2]}}},
  cangrejo_acorazado: {src:"assets/sprites/enemies/acuatica/cangrejo_acorazado/v2/atlas.png", hMul:2.4, meta:{"w":130,"h":78,"cols":8,"refH":64,"anchor":0.9359,"sets":{"walk":[0,1,2],"atk":[3,4,5],"hit":[5],"death":[6,7,8],"idle":[0,1,0,2]}}},
  medusa_electrica: {src:"assets/sprites/enemies/acuatica/medusa_electrica/v2/atlas.png", hMul:2.6, meta:{"w":132,"h":93,"cols":8,"refH":84,"anchor":0.9462,"sets":{"walk":[0,1,2,3,4],"atk":[5,6],"hit":[7],"death":[7,8],"idle":[9,10,9,10]}}},
  esfinge: {src:"assets/sprites/enemies/laberinto/esfinge/v2/atlas.png", hMul:2.8, meta:{"w":123,"h":74,"cols":8,"refH":60,"anchor":0.9324,"sets":{"walk":[0,1,2,3],"atk":[4,5,6],"hit":[7],"death":[7,8],"idle":[0,3,0,1]}}},
  duende_bosque: {src:"assets/sprites/enemies/bosque/duende_bosque/v2/atlas.png", hMul:2.6, meta:{"w":114,"h":94,"cols":8,"refH":84,"anchor":0.9468,"sets":{"walk":[0,1,2],"atk":[3,4,5],"hit":[5],"death":[6,7,8],"idle":[0,1,0,2]}}},
  sirena_abisal: {src:"assets/sprites/enemies/acuatica/sirena_abisal/v2/atlas.png", hMul:2.6, meta:{"w":101,"h":103,"cols":8,"refH":84,"anchor":0.9515,"sets":{"walk":[0,1,2,3,4],"atk":[5,6,7],"hit":[7],"death":[8,9,10],"idle":[0,1,0,2]}}},
  medusa: {src:"assets/sprites/enemies/laberinto/medusa/v2/atlas.png", hMul:2.6, meta:{"w":94,"h":92,"cols":8,"refH":84,"anchor":0.9457,"sets":{"walk":[0,1,2,3,4],"atk":[5,6,7,8,9],"hit":[9],"death":[10,11,12],"idle":[0,1,0,2]}}},
  anguila_electrica: {src:"assets/sprites/enemies/acuatica/anguila_electrica/v2/atlas.png", hMul:2.0, meta:{"w":150,"h":50,"cols":8,"refH":34,"anchor":0.9,"sets":{"walk":[0,1,2],"atk":[3,4,5],"hit":[5],"death":[6,7,8],"idle":[0,1,0,2]}}},
  cm_acechante: {src:"assets/sprites/enemies/ciudad/cm_acechante/v2/atlas.png", hMul:2.65, meta:{"w":96,"h":69,"cols":8,"refH":60,"anchor":0.9275,"sets":{"walk":[0,1,2,3,4],"atk":[5,6,7,8,9],"hit":[9],"death":[10,11,12],"idle":[0,1,0,2],"walk_down":[0,1,2,3,4],"walk_up":[0,1,2,3,4],"run":[0,1,2,3,4],"leap":[5,6,7,8,9],"dive":[5,6,7,8,9],"climb":[0,1,2,3,4]}}},
  cm_perro: {src:"assets/sprites/enemies/ciudad/cm_perro/v2/atlas.png", hMul:2.25, meta:{"w":121,"h":70,"cols":8,"refH":50,"anchor":0.9286,"sets":{"walk":[0,1,2,3],"atk":[4,5,6,7],"hit":[7],"death":[8,9,10],"idle":[0,1,0,2],"walk_down":[0,1,2,3],"walk_up":[0,1,2,3],"run":[0,1,2,3],"leap":[4,5,6,7],"emerge":[8,9,10]}}},
  cm_campanero: {src:"assets/sprites/enemies/ciudad/cm_campanero/v2/atlas.png", hMul:2.6, meta:{"w":89,"h":98,"cols":8,"refH":80,"anchor":0.949,"sets":{"walk":[0,1,2,3,4,5],"atk":[6,7,8,9,10],"hit":[10],"death":[11,12],"idle":[0,1,0,2],"walk_down":[0,1,2,3,4,5],"walk_up":[0,1,2,3,4,5],"channel":[6,7,8,9,10],"bell":[6,7,8,9,10]}}},
  mn_devoraluz: {src:"assets/sprites/enemies/minas/mn_devoraluz/v2/atlas.png", hMul:3.25, meta:{"w":93,"h":102,"cols":8,"refH":80,"anchor":0.951,"sets":{"walk":[0,1,2,3,4,5],"atk":[6,7,8,9,10],"hit":[10],"death":[11,12,13],"idle":[0,1,0,2],"walk_down":[0,1,2,3,4,5],"walk_up":[0,1,2,3,4,5],"run":[0,1,2,3,4,5],"drain":[6,7,8,9,10]}}},
  minotauro: {src:"assets/sprites/bosses/laberinto/minotauro/v2/atlas.png", hMul:2.5, meta:{"w":140,"h":131,"cols":8,"refH":100,"anchor":0.9618,"sets":{"walk":[0,1,2,3,4,5],"atk":[6,7,8],"hit":[9],"death":[8,10,11],"idle":[12,13,12,5],"walk_down":[0,1,2,3,4,5],"walk_up":[0,1,2,3,4,5],"run":[0,1,2,3,4,5],"charge":[0,1,2,3,4,5],"heavy":[6,7,8],"seismic":[6,7,8]}}},
  dragon_forja: {src:"assets/sprites/arenas/fortaleza/dragon_forja/v2/atlas.png", hMul:2.9, meta:{"w":228,"h":110,"cols":8,"refH":90,"anchor":0.9545,"sets":{"walk":[0,1,2,3],"atk":[4,6,7],"hit":[6],"death":[7,8],"idle":[0,1,2,1],"flap":[5],"fly":[0,1,2,3],"breath":[4,6,7],"bomb":[4,6,7]}}},
};
for(const k in ENEMY_RUNWAY_SHEETS){
  const A = ENEMY_RUNWAY_SHEETS[k];
  enemyAtlasPackLoad(k, A.src, A.meta);
  ENEMY_ATLAS_PACK[k].hMul = A.hMul;
}
