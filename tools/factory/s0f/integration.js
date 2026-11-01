'use strict';
// Review-only delivery: staging bytes is NOT applying a registry patch or publishing the game.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const json=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const ESSENTIAL=['dimensiones','alfa_binario','sin_siluetas_cortadas','sin_cuadros_vacios','estilo_en_rango_del_roster','pies_estables','altura_constante_entre_poses','animacion_con_movimiento','sin_residuos_sueltos','escala_vs_sprite_actual','tiene_consumidor'];
function safe(root,relative,{exists=true}={}){
 if(typeof relative!=='string'||relative.includes('\\')||relative.includes('\0')||path.posix.normalize(relative)!==relative||path.isAbsolute(relative)||relative==='..'||relative.startsWith('../'))throw Error('ruta no canónica');
 const f=path.resolve(root,relative);if(!f.startsWith(root+path.sep))throw Error('ruta fuera de raíz');
 let current=root;for(const part of relative.split('/')){current=path.join(current,part);if(fs.existsSync(current)&&fs.lstatSync(current).isSymbolicLink())throw Error('ruta simbólica prohibida');}
 if(exists&&(!fs.existsSync(f)||!fs.statSync(f).isFile()))throw Error('archivo ausente o irregular: '+relative);
 return f;
}
function metadata(c){return {w:c.cell.w,h:c.cell.h,cols:c.cols,refH:c.refH,anchor:c.anchor,...(c.fix?{fix:c.fix}:{}),sets:Object.fromEntries(Object.entries(c.clips).map(([k,v])=>[k,v.frames]))};}
function registryEdit(root,c,dest,preview){
 const r=c.registration;if(!r||r.source!==c.registeredIn||r.baseKey!==c.id||!['base','authored-skin'].includes(r.kind))throw Error('contrato de registro ausente o propietario incorrecto');
 if(!r.source.startsWith('js/assets/'))throw Error('registro fuera de js/assets');
 const file=safe(root,r.source),source=fs.readFileSync(file,'utf8');
 if(sha(source)!==r.sourceSha256)throw Error('registro cambió desde el contrato');
 const candidates=source.split('\n').filter(line=>r.kind==='base'?line.trimStart().startsWith('champPackLoadAtlas('+JSON.stringify(c.id)+','):line.trimStart().startsWith('Object.assign(CROMA_SKINS['+JSON.stringify(c.skin)+'],'));
 if(candidates.length!==1)throw Error('registro ausente o duplicado');
 const before=candidates[0];let after,currentMeta,currentSrc;
 if(r.kind==='base'){
  if(c.skin||r.key!==c.id)throw Error('identidad base inválida');
  const match=before.trim().match(/^champPackLoadAtlas\((.*)\);$/);if(!match)throw Error('registro base no literal');
  const args=JSON.parse('['+match[1]+']');if(args.length!==3||args[0]!==c.id)throw Error('registro base inválido');
  currentSrc=args[1];currentMeta=args[2];args[1]=dest;after='champPackLoadAtlas('+args.map(x=>JSON.stringify(x)).join(', ')+');';
 }else{
  if(c.id!=='cazadora'||c.skin!=='cazadora_escarcha'||r.key!==c.skin)throw Error('skin/propietario no soportado');
  const prefix='Object.assign(CROMA_SKINS['+JSON.stringify(c.skin)+'],';
  const trim=before.trim();if(!trim.endsWith(');'))throw Error('registro skin no literal');
  const data=JSON.parse(trim.slice(prefix.length,-2)),asset=data.authoredPacks?.[c.id];
  if(!asset||Object.keys(data.authoredPacks).length!==1)throw Error('skin sin contrato independiente');
  currentSrc=asset.src;currentMeta=asset.meta;asset.src=dest;data.preview=preview;after=prefix+JSON.stringify(data)+');';
 }
 if(currentSrc!==c.atlas||JSON.stringify(currentMeta)!==JSON.stringify(r.meta)||JSON.stringify(metadata(c))!==JSON.stringify(currentMeta))throw Error('fuente o metadatos cambiados');
 return {file:r.source,expectedFileSha256:sha(source),expectedSource:c.atlas,expectedMetadataSha256:sha(JSON.stringify(currentMeta)),before,after,patch:'--- a/'+r.source+'\n+++ b/'+r.source+'\n@@ -'+(source.split('\n').indexOf(before)+1)+',1 +'+(source.split('\n').indexOf(before)+1)+',1 @@\n-'+before+'\n+'+after+'\n'};
}
function prepareIntegration({root,runDir}){
 root=fs.realpathSync(root);runDir=fs.realpathSync(runDir);
 const c=json(safe(runDir,'contract.json')),s=json(safe(runDir,'state.json')),approval=json(safe(runDir,'approval.json')),v=json(safe(runDir,'validation.json')),ev=json(safe(runDir,'evaluation.json'));
 if(c.kind!=='atlas'||!/^([a-z][a-z0-9_]*)$/.test(c.id)||s.state!=='APPROVED'||typeof approval.reviewer!=='string'||!approval.reviewer.trim())throw Error('aprobación humana registrada obligatoria');
 if(s.complete_requested===false||v.pass!==true||ev.pass_threshold_90!==true||!Number.isFinite(ev.score)||ev.score<90||ev.critical!==0||ESSENTIAL.some(k=>ev.checks?.[k]!==true))throw Error('validación incompleta o rechazada');
 const hash=f=>sha(fs.readFileSync(f)),atlas=safe(runDir,'atlas.png'),atlasHash=hash(atlas);
 if(approval.atlasSha256!==atlasHash||approval.validationSha256!==hash(safe(runDir,'validation.json'))||v.evaluation_sha256!==hash(safe(runDir,'evaluation.json')))throw Error('aprobación/evaluación obsoleta');
 if(!v.proof?.files||!v.proof?.sources||v.proof.files['atlas.png']!==atlasHash||!v.proof.files['contract.json']||!v.proof.files['plan.json']||!v.proof.files['assembly.json']||!v.proof.sources[c.atlas]||!v.proof.sources[c.registeredIn])throw Error('prueba de evidencia incompleta');
 for(const f of ['tools/factory/art_factory.py','tools/factory/s0f/contract.js','tools/factory/s0f/s0f.js'])if(!v.proof.sources[f])throw Error('evaluador no fijado en evidencia');
 for(const [f,h]of Object.entries(v.proof.files))if(hash(safe(runDir,f))!==h)throw Error('evidencia cambió: '+f);
 for(const [f,h]of Object.entries(v.proof.sources))if(hash(safe(root,f))!==h)throw Error('fuente/evaluador cambió: '+f);
 const p=json(safe(runDir,'plan.json')),a=json(safe(runDir,'assembly.json'));
 const action=p.identity?.action||p.opts?.action;
 const names=action?[action]:Object.keys(c.clips);if(names.some(n=>!c.clips[n]))throw Error('clip planificado ajeno al contrato');
 const filter=p.identity?.frameIndices;
 if(filter!==null&&filter!==undefined&&(p.identity.generationMode!=='single-frame'||!action||!Array.isArray(filter)||!filter.length||new Set(filter).size!==filter.length||filter.some(i=>!Number.isInteger(i)||!c.clips[action].unique.includes(i))))throw Error('filtro de cuadros inválido');
 const contractFrames=[...new Set(names.flatMap(n=>c.clips[n].frames.map(i=>i<0?-i-1:i).filter(i=>!filter||filter.includes(i))))].sort((x,y)=>x-y);
 const expected=[...new Set(p.jobs.flatMap(j=>j.frames))].sort((x,y)=>x-y),actual=a.generated_frames;
 if(JSON.stringify(expected)!==JSON.stringify(contractFrames))throw Error('plan no corresponde al contrato');
 if(!expected.length||!Array.isArray(actual)||new Set(actual).size!==actual.length||JSON.stringify([...actual].sort((x,y)=>x-y))!==JSON.stringify(expected)||a.failures?.length)throw Error('atlas parcial: cuadros distintos del plan');
 for(const n of [c.cell?.w,c.cell?.h,c.cols,c.rows,c.frames])if(!Number.isSafeInteger(n)||n<=0||n>65536)throw Error('geometría inválida');
 if(c.cols*c.rows!==c.frames||c.cell.w*c.cols*c.cell.h*c.rows>67108864||expected.some(n=>!Number.isSafeInteger(n)||n<0||n>=c.frames))throw Error('geometría o índices inválidos');
 const frame=c.clips?.idle_down?.frames?.[0];if(!Number.isSafeInteger(frame)||(frame<0?-frame-1:frame)>=c.frames)throw Error('preview sin frame idle_down válido');
 const base='assets/sprites/champions/'+c.id+(c.skin?'/skins/'+c.skin:'')+'/factory-'+atlasHash;
 const dest=base+'/atlas.png',preview=base+'/preview.png';safe(root,dest,{exists:false});safe(root,preview,{exists:false});
 const registration=registryEdit(root,c,dest,preview);
 // Full decode, exact unchanged inherited cells, deterministic preview from the actual idle frame.
 const py=spawnSync(process.env.PYTHON||'python3',['-c',`import sys,json,base64,io\nfrom PIL import Image,ImageChops\nc=json.loads(sys.argv[3]); a=Image.open(sys.argv[1]).convert('RGBA'); old=Image.open(sys.argv[2]).convert('RGBA'); w,h=c['cell']['w'],c['cell']['h']; assert a.size==old.size==(w*c['cols'],h*c['rows']), 'dimensiones'; assert set(a.getchannel('A').getdata()) <= {0,255}, 'alfa'; generated=set(json.loads(sys.argv[4]))\nfor i in range(c['frames']):\n x=i%c['cols']*w; y=i//c['cols']*h; box=(x,y,x+w,y+h)\n if i not in generated: assert a.crop(box).tobytes()==old.crop(box).tobytes(), 'cuadro heredado cambiado'\ni=int(sys.argv[5]); flip=i<0; i=~i if flip else i; x=i%c['cols']*w; y=i//c['cols']*h; im=a.crop((x,y,x+w,y+h)); im=im.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if flip else im; out=io.BytesIO(); im.save(out,format='PNG',optimize=False); print(base64.b64encode(out.getvalue()).decode())`,atlas,safe(root,c.atlas),JSON.stringify(c),JSON.stringify(expected),String(frame)],{encoding:'utf8',maxBuffer:4*1024*1024});
 if(py.status!==0)throw Error('PNG/preview rechazado: '+String(py.stderr).slice(-300));
 const previewBytes=Buffer.from(py.stdout.trim(),'base64');
 return {schema:'fondal.integration-plan.v1',state:'REVIEW_ONLY',runtimeActive:false,root,runDir,champion:c.id,skin:c.skin||null,atlasSha256:atlasHash,approvalSha256:hash(safe(runDir,'approval.json')),validationSha256:hash(safe(runDir,'validation.json')),dest,preview,previewSha256:sha(previewBytes),registration,previewBase64:previewBytes.toString('base64'),note:'Staged bytes and this patch are not an installed, approved release. Apply only in a separately reviewed main-targeted asset PR.'};
}
function stageIntegration(plan){
 // Rebuild every guard immediately before staging; supplied paths/patches cannot redirect writes.
 const fresh=prepareIntegration({root:plan.root,runDir:plan.runDir});if(JSON.stringify(fresh)!==JSON.stringify(plan))throw Error('plan de integración cambió');
 for(const [relative,bytes]of [[plan.dest,fs.readFileSync(safe(plan.runDir,'atlas.png'))],[plan.preview,Buffer.from(plan.previewBase64,'base64')]]){
  const f=safe(plan.root,relative,{exists:false});fs.mkdirSync(path.dirname(f),{recursive:true});
  if(fs.existsSync(f)){if(sha(fs.readFileSync(f))!==sha(bytes))throw Error('destino inmutable ocupado');}else fs.writeFileSync(f,bytes,{flag:'wx'});
 }
 return {...plan,state:'STAGED_REVIEW_ONLY',runtimeActive:false};
}
module.exports={prepareIntegration,stageIntegration};
