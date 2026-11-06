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
};
for(const k in ENEMY_RUNWAY_SHEETS){
  const A = ENEMY_RUNWAY_SHEETS[k];
  enemyAtlasPackLoad(k, A.src, A.meta);
  ENEMY_ATLAS_PACK[k].hMul = A.hMul;
}
