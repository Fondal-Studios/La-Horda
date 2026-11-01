'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const {prepareIntegration,stageIntegration}=require('./integration');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function fixture(t,skin=false){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'integration-')),runDir=path.join(root,'run');fs.mkdirSync(runDir);t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const put=(rel,data)=>{const f=path.join(root,rel);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,typeof data==='string'?data:JSON.stringify(data));return f;};
 const meta={w:4,h:4,cols:2,refH:3,anchor:0.75,fix:{left:'mirror'},sets:{idle_down:[1],walk_down:[0,1]}};
 const atlas='assets/sprites/champions/cazadora/'+(skin?'skins/cazadora_escarcha/':'')+'original.png',source='js/assets/'+(skin?'unique-skins-meta.js':'champion-sprites.js');
 put(source,skin?'Object.assign(CROMA_SKINS["cazadora_escarcha"],'+JSON.stringify({preview:'old-preview.png',authoredPacks:{cazadora:{src:atlas,meta}}})+');\n':'champPackLoadAtlas("cazadora", '+JSON.stringify(atlas)+', '+JSON.stringify(meta)+');\n');
 fs.mkdirSync(path.dirname(path.join(root,atlas)),{recursive:true});
 const py=spawnSync('python3',['-c',"from PIL import Image;import sys;a=Image.new('RGBA',(8,8),(0,0,0,0));a.paste((255,0,0,255),(0,0,4,4));a.paste((0,255,0,255),(4,0,8,4));a.save(sys.argv[1]);a.save(sys.argv[2])",path.join(root,atlas),path.join(runDir,'atlas.png')]);assert.equal(py.status,0,String(py.stderr));
 const c={id:'cazadora',...(skin?{skin:'cazadora_escarcha'}:{}),kind:'atlas',atlas,registeredIn:source,cell:{w:4,h:4},cols:2,rows:2,frames:4,refH:3,anchor:0.75,fix:{left:'mirror'},clips:{idle_down:{frames:[1]},walk_down:{frames:[0,1]}},registration:{kind:skin?'authored-skin':'base',key:skin?'cazadora_escarcha':'cazadora',baseKey:'cazadora',source,meta,sourceSha256:hash(path.join(root,source))}};
 put('run/contract.json',c);put('run/plan.json',{jobs:[{frames:[0,1]}]});put('run/assembly.json',{generated_frames:[0,1],failures:[]});put('run/state.json',{state:'APPROVED',complete_requested:true});put('run/evaluation.json',{score:100,critical:0,pass_threshold_90:true,checks:Object.fromEntries(['dimensiones','alfa_binario','sin_siluetas_cortadas','sin_cuadros_vacios','estilo_en_rango_del_roster','pies_estables','altura_constante_entre_poses','animacion_con_movimiento','sin_residuos_sueltos','escala_vs_sprite_actual','tiene_consumidor'].map(k=>[k,true]))});
 const sources=[atlas,source,'tools/factory/art_factory.py','tools/factory/s0f/contract.js','tools/factory/s0f/s0f.js'];for(const f of sources.slice(2))put(f,'// evaluator fixture, not production');
 function seal(){const files=['contract.json','plan.json','assembly.json','atlas.png'];put('run/validation.json',{pass:true,evaluation_sha256:hash(path.join(runDir,'evaluation.json')),proof:{files:Object.fromEntries(files.map(f=>[f,hash(path.join(runDir,f))])),sources:Object.fromEntries(sources.map(f=>[f,hash(path.join(root,f))]))}});put('run/approval.json',{reviewer:'test-only-record-not-real-art-approval',atlasSha256:hash(path.join(runDir,'atlas.png')),validationSha256:hash(path.join(runDir,'validation.json'))});}
 seal();return {root,runDir,c,put,seal};
}
test('base preparation is read-only and staging never modifies active registry',t=>{
 const f=fixture(t),original=fs.readFileSync(path.join(f.root,f.c.registeredIn),'utf8'),p=prepareIntegration(f);
 assert.equal(p.state,'REVIEW_ONLY');assert.equal(fs.existsSync(path.join(f.root,p.dest)),false);assert(p.dest.includes(p.atlasSha256));assert(p.registration.patch.includes('-champPackLoadAtlas'));
 const staged=stageIntegration(p);assert.equal(staged.state,'STAGED_REVIEW_ONLY');assert.equal(staged.runtimeActive,false);assert.equal(fs.readFileSync(path.join(f.root,f.c.registeredIn),'utf8'),original);assert.equal(hash(path.join(f.root,p.dest)),p.atlasSha256);assert.equal(stageIntegration(p).state,'STAGED_REVIEW_ONLY');
 const py=spawnSync('python3',['-c',"from PIL import Image;import sys;im=Image.open(sys.argv[1]);assert im.size==(4,4);assert im.getpixel((1,1))==(0,255,0,255)",path.join(f.root,p.preview)]);assert.equal(py.status,0,String(py.stderr));
});
test('skin registration remains cosmetic and targets own immutable namespace',t=>{const f=fixture(t,true),p=prepareIntegration(f);assert(p.dest.includes('/skins/cazadora_escarcha/factory-'));assert(p.registration.after.includes('CROMA_SKINS["cazadora_escarcha"]'));assert(p.registration.after.includes(p.preview));assert.equal(fs.existsSync(path.join(f.root,p.dest)),false);});
test('source and evaluator drift invalidate approval evidence',t=>{const f=fixture(t);f.put('tools/factory/art_factory.py','changed');assert.throws(()=>prepareIntegration(f),/fuente\/evaluador cambió/);});
test('changed evaluation cannot reuse approval',t=>{const f=fixture(t);f.put('run/evaluation.json',{score:91,critical:0,pass_threshold_90:true});assert.throws(()=>prepareIntegration(f),/obsoleta|validación incompleta/);});
test('partial plan is refused despite approval record',t=>{const f=fixture(t);f.put('run/assembly.json',{generated_frames:[0],failures:[]});f.seal();assert.throws(()=>prepareIntegration(f),/atlas parcial/);});
test('wrong skin owner, duplicate registry and missing registration fail closed',t=>{
 for(const mode of ['owner','duplicate','missing']){const f=fixture(t,true);if(mode==='owner')f.c.registration.baseKey='other';else {const old=fs.readFileSync(path.join(f.root,f.c.registeredIn),'utf8');f.put(f.c.registeredIn,mode==='duplicate'?old+old:'// no registration');f.c.registration.sourceSha256=hash(path.join(f.root,f.c.registeredIn));}f.put('run/contract.json',f.c);f.seal();assert.throws(()=>prepareIntegration(f),/propietario|ausente o duplicado/);}
});
test('malicious proof traversal and symbolic source paths fail closed',t=>{
 const f=fixture(t);const v=JSON.parse(fs.readFileSync(path.join(f.runDir,'validation.json')));v.proof.files['../outside']='a'.repeat(64);f.put('run/validation.json',v);f.put('run/approval.json',{reviewer:'test',atlasSha256:hash(path.join(f.runDir,'atlas.png')),validationSha256:hash(path.join(f.runDir,'validation.json'))});assert.throws(()=>prepareIntegration(f),/ruta no canónica/);
 const g=fixture(t);const src=path.join(g.root,g.c.atlas);fs.renameSync(src,src+'.original');fs.symlinkSync(src+'.original',src);assert.throws(()=>prepareIntegration(g),/simbólica/);
});
test('staging rejects modified dry-run destinations and changed registry',t=>{const f=fixture(t),p=prepareIntegration(f);assert.throws(()=>stageIntegration({...p,dest:'../../bad'}),/plan de integración cambió/);f.put(f.c.registeredIn,'// concurrent edit');assert.throws(()=>stageIntegration(p),/fuente\/evaluador cambió|registro cambió/);});
test('unused inherited atlas cells may not silently change',t=>{const f=fixture(t);const py=spawnSync('python3',['-c',"from PIL import Image;import sys;a=Image.open(sys.argv[1]);a.putpixel((1,5),(0,0,255,255));a.save(sys.argv[1])",path.join(f.runDir,'atlas.png')]);assert.equal(py.status,0);f.seal();assert.throws(()=>prepareIntegration(f),/heredado cambiado/);});

test('essential evaluator failure cannot be hidden behind numeric pass',t=>{const f=fixture(t);const e=JSON.parse(fs.readFileSync(path.join(f.runDir,'evaluation.json')));e.checks.animacion_con_movimiento=false;f.put('run/evaluation.json',e);f.seal();assert.throws(()=>prepareIntegration(f),/validación incompleta/);});
test('changed plan matching partial assembly cannot evade contract coverage',t=>{const f=fixture(t);f.put('run/plan.json',{jobs:[{frames:[0]}]});f.put('run/assembly.json',{generated_frames:[0],failures:[]});f.seal();assert.throws(()=>prepareIntegration(f),/plan no corresponde/);});
test('negative-only mirrored references preserve exact source frame coverage during staging',t=>{
 const f=fixture(t);f.c.clips.walk_down.frames=[-1,-2];f.c.registration.meta.sets.walk_down=[-1,-2];
 f.put(f.c.registeredIn,'champPackLoadAtlas("cazadora", '+JSON.stringify(f.c.atlas)+', '+JSON.stringify(f.c.registration.meta)+');\n');
 f.c.registration.sourceSha256=hash(path.join(f.root,f.c.registeredIn));f.put('run/contract.json',f.c);f.seal();
 assert.equal(prepareIntegration(f).state,'REVIEW_ONLY');
});
