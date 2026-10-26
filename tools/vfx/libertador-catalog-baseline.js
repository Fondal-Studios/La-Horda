'use strict';
const fs=require('fs'),H=require('../lib/serve');
const out=process.env.OUT||'art-source/entregas/libertador-kit-20261025/cierre-03';
(async()=>{fs.mkdirSync(out,{recursive:true});const site=await H.startSite(),b=await H.launch(),rows=[];try{
 for(const source of ['main','candidate']){const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 if(source==='main')await p.route('**/js/champions/skill-fx-a/c/libertador.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('art-source/entregas/libertador-kit-20261025/cierre-02/source-before.js','utf8')}));
 await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>typeof cosmeticCatalog==='function');
 const result=await p.evaluate(()=>{const added=Object.keys(EXPEDITION).length,qualityIds=Object.keys(QUALITY_FIVE_COLLECTION),extraIds=['brasa_abisal','eslabon_porcelana','morwen_escarcha','dariel_luthier','farolero_guardavia'];return{actual:cosmeticCatalog().length,expected:32+added*3+qualityIds.length*3+extraIds.length,added,qualityIds,extraIds,setIds:Object.keys(SET_SKINS),cromaIds:Object.keys(CROMA_SKINS),catalogIds:cosmeticCatalog().map(d=>d.id)};});rows.push({source,...result,errors});await p.close();
 }
 fs.writeFileSync(out+'/CATALOG_BASELINE.json',JSON.stringify({rows,sameCatalog:JSON.stringify(rows[0].catalogIds)===JSON.stringify(rows[1].catalogIds),scope:'Only the failing count expression reproduced. Not all 6441 skin checks or CI rerun.'},null,2));console.log(rows.map(r=>({source:r.source,actual:r.actual,expected:r.expected,errors:r.errors})));
 }finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
