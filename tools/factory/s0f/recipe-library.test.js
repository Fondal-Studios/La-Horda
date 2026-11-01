'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {loadRecipe,recipePrompt}=require('./recipe-library'),{readContract,ROOT}=require('./contract');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
test('versioned experimental recipe keeps frozen four-phase Sylva prompt byte-for-byte',()=>{
 const c=readContract('cazadora'),r=recipePrompt(c,{clip:'walk_down',frames:[0,1,2,3]},{recipeId:'front-fixed-single-row-v2'});
 assert.equal(hash(r.prompt),'b6cba36283bbe8e4828dc15152b3882e515bd79df8ce3ba9226eab81b90f54cf');assert.equal(r.recipeId,'front-fixed-single-row-v2');assert.equal(r.status,'experimental');assert.equal(r.recipeSha256,hash(fs.readFileSync(path.join(ROOT,r.recipeSource))));assert.equal(loadRecipe().recipe.proven,false);
});
test('one through four requested poses receive exactly their existing-contract phases, not an invented full cycle',()=>{
 const c=readContract('cazadora'),phases=loadRecipe().recipe.orderedWalkPhases;
 for(const frames of [[0],[1],[2],[3],[1,2],[1,2,3],[0,1,2,3]]){
  const r=recipePrompt(c,{clip:'walk_down',frames}),phaseText=r.prompt.match(/Orden de izquierda a derecha: (.*?)\./)[1];
  assert.equal(phaseText,frames.map(i=>phases[c.clips.walk_down.unique.indexOf(i)%4]).join(loadRecipe().recipe.phaseSeparator||', '));assert.match(r.prompt,new RegExp('Crear '+frames.length+' poses'));
 }
 const skin=readContract('cazadora',{skin:'cazadora_escarcha'}),r=recipePrompt(skin,{clip:'walk_down',frames:skin.clips.walk_down.unique},{skin:'cazadora_escarcha'});assert.match(r.prompt,/skin EXISTENTE «cazadora_escarcha»/);assert.match(r.prompt,/Crear 3 poses/);
});
test('recipes do not invent unknown contracts, clips or skins',()=>{
 const c=readContract('cazadora');assert.equal(recipePrompt(c,{clip:'death_down',frames:[1]}),null);
 assert.throws(()=>recipePrompt(c,{clip:'walk_down',frames:[40]}),/walk_down contract/);
 assert.throws(()=>recipePrompt(c,{clip:'walk_down',frames:[0]},{skin:'imagined'}),/matching/);
 assert.throws(()=>loadRecipe('sylva-walk-attempt3-v1'),/Unsupported recipe/);
});
test('rejected pilot evidence is hashed and cannot be mistaken for approved/proven art',()=>{
 const e=JSON.parse(fs.readFileSync(path.join(__dirname,'recipes/sylva-walk-attempt3-v1.json')));
 assert.equal(e.status,'visual-rejected');assert.equal(e.technical.score,100);assert.equal(e.cost.observed,7);assert.equal(e.model,'nano-banana-2');assert.equal(e.approved,false);assert.equal(e.integrated,false);assert.equal(e.proven,false);
 for(const p of Object.values(e.evidence))assert.equal(hash(fs.readFileSync(path.join(ROOT,p.path))),p.sha256);
});
test('active v3 mandates flat green and screen-space ordered legs without mutating v2',()=>{
 const c=readContract('cazadora'),r=recipePrompt(c,{clip:'walk_down',frames:[0,1,2,3]});
 assert.equal(r.recipeId,'front-fixed-solid-green-v3');assert.equal(r.recipeVersion,3);
 assert.match(r.prompt,/Fondo verde #00FF00 uniforme OBLIGATORIO; sin transparencia ni damero/);
 assert.match(r.prompt,/Izquierda\/derecha son lados de la PANTALLA/);
 assert.equal(r.prompt.includes('Fondo transparente o'),false);
 assert.equal(r.prompt.match(/Orden de izquierda a derecha: (.*?)\./)[1],['bota izquierda en pantalla abajo/adelante, derecha atrás','apoyo izquierdo bajo cadera, rodilla derecha levantada','bota derecha en pantalla abajo/adelante, izquierda atrás','apoyo derecho bajo cadera, rodilla izquierda levantada'].join('; '));
 assert.ok((r.prompt+' @ref1 @ref2 (referencias de identidad y de poses).').length<=1000);
 assert.equal(loadRecipe('front-fixed-single-row-v2').recipe.version,2);
});
test('controlled V4 is explicit single-frame only; camera and upper body cannot flip',()=>{
 const c=readContract('cazadora'),r=recipePrompt(c,{clip:'walk_down',frames:[3]},{recipeId:'controlled-walk-frame-v4'});
 assert.equal(r.recipeVersion,4);assert.match(r.prompt,/Un SOLO sprite/);assert.match(r.prompt,/Congelar cabeza, torso, brazos y mano del arco/);assert.match(r.prompt,/NO voltear el personaje/);assert.match(r.prompt,/margen vacío mínimo20% en los CUATRO lados/);
 assert.match(r.prompt,/apoyo DERECHO de PANTALLA.*rodilla IZQUIERDA de PANTALLA levantada/);
 assert.ok((r.prompt+' @ref1 @ref2 (referencias de identidad y de poses).').length<=1000);
 assert.throws(()=>recipePrompt(c,{clip:'walk_down',frames:[0,1]},{recipeId:'controlled-walk-frame-v4'}),/exactly one/);
 assert.equal(loadRecipe().recipe.version,3); // no silent broad switch of existing strip pipeline
});
test('V4 weapon wording is bow-specific only for Sylva and generic for other contracts',()=>{
 const c=readContract('cazadora'),j={clip:'walk_down',frames:[3]},opts={recipeId:'controlled-walk-frame-v4'};
 assert.match(recipePrompt(c,j,opts).prompt,/mano del arco/);
 const generic=recipePrompt({...c,id:'other_existing'},j,opts).prompt;
 assert.match(generic,/mano del arma/);assert.equal(generic.includes('arco'),false);
});
