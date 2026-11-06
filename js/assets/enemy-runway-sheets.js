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
  tiburon_blanco: {src:"assets/sprites/enemies/acuatica/tiburon_blanco/v2/atlas.png", hMul:2.4, meta:{"w":184,"h":103,"cols":8,"refH":64,"anchor":0.9515,"sets":{"walk":[0,1,2],"atk":[3,4,5],"hit":[5],"death":[6,7,8],"idle":[0,1,0,2]}}},
  tiburon_joven: {src:"assets/sprites/enemies/acuatica/tiburon_joven/v2/atlas.png", hMul:2.4, meta:{"w":127,"h":69,"cols":8,"refH":56,"anchor":0.9275,"sets":{"walk":[0,1,2],"atk":[3,4,5],"hit":[5],"death":[6,7,8],"idle":[0,1,0,2]}}},
  cangrejo_acorazado: {src:"assets/sprites/enemies/acuatica/cangrejo_acorazado/v2/atlas.png", hMul:2.4, meta:{"w":130,"h":78,"cols":8,"refH":64,"anchor":0.9359,"sets":{"walk":[0,1,2],"atk":[3,4,5],"hit":[5],"death":[6,7,8],"idle":[0,1,0,2]}}},
  medusa_electrica: {src:"assets/sprites/enemies/acuatica/medusa_electrica/v2/atlas.png", hMul:2.6, meta:{"w":132,"h":93,"cols":8,"refH":84,"anchor":0.9462,"sets":{"walk":[0,1,2,3,4],"atk":[5,6],"hit":[7],"death":[7,8],"idle":[9,10,9,10]}}},
};
for(const k in ENEMY_RUNWAY_SHEETS){
  const A = ENEMY_RUNWAY_SHEETS[k];
  enemyAtlasPackLoad(k, A.src, A.meta);
  ENEMY_ATLAS_PACK[k].hMul = A.hMul;
}
