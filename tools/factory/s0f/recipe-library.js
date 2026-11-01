'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const RECIPE='front-fixed-solid-green-v3';
const VERSIONS={'front-fixed-single-row-v2':2,'front-fixed-solid-green-v3':3,'controlled-walk-frame-v4':4};
function loadRecipe(id=RECIPE){
 if(!Object.hasOwn(VERSIONS,id))throw Error('Unsupported recipe; experimental evidence is not an executable recipe');
 const source='tools/factory/s0f/recipes/'+id+'.json',bytes=fs.readFileSync(path.join(__dirname,'recipes',id+'.json')),recipe=JSON.parse(bytes);
 if(recipe.schema!=='fondal.art-recipe.v1'||recipe.id!==id||recipe.version!==VERSIONS[id]||recipe.status!=='experimental'||recipe.proven!==false)throw Error('Recipe version/status requires explicit review');
 return {recipe,recipeSource:source,recipeSha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
function fill(template,values){return template.replace(/\{([A-Za-z]+)\}/g,(_,key)=>{if(!Object.hasOwn(values,key))throw Error('Unknown recipe parameter '+key);return values[key];});}
function recipePrompt(contract,job,{skin=null,recipeId=RECIPE}={}){
 if(job.clip!=='walk_down')return null;
 if(contract.kind!=='atlas'||!/^[a-z][a-z0-9_]*$/.test(contract.id)||skin!==(contract.skin||null)||!Array.isArray(job.frames)||job.frames.length<1||job.frames.length>4||job.frames.some(n=>!Number.isSafeInteger(n)||n<0||n>=contract.frames))throw Error('Recipe requires a matching existing atlas/frame contract');
 const {recipe,recipeSource,recipeSha256}=loadRecipe(recipeId);
 if(recipe.version===4&&job.frames.length!==1)throw Error('Controlled per-frame recipe requires exactly one frame');
 const order=contract.clips?.walk_down?.unique;
 if(!Array.isArray(order)||job.frames.some(n=>!order.includes(n)))throw Error('Frame is not in walk_down contract');
 const orderedPhases=job.frames.map(n=>recipe.orderedWalkPhases[order.indexOf(n)%4]).join(recipe.phaseSeparator||', ');
 const identityInstruction=skin?fill(recipe.identityInstructions.skin,{skin}):recipe.identityInstructions.base;
 const prompt=fill(recipe.template,{id:contract.id,identityInstruction,frameCount:String(job.frames.length),orderedPhases,weaponLabel:contract.id==='cazadora'?'arco':'arma'});
 if((prompt+' @ref1 @ref2 (referencias de identidad y de poses).').length>1000)throw Error('Recipe prompt exceeds provider limit; never truncate');
 return {prompt,recipeId:recipe.id,recipeVersion:recipe.version,recipeSha256,recipeSource,status:recipe.status};
}
module.exports={loadRecipe,recipePrompt};
