'use strict';
// Persistent production queue in the existing transactional GM store. No image inference in the relay.
const crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const gameMaster=require('./game-master');
const RECENT=['aelith','morveth','brakk','veyra','solciju'];
const TERMINAL=new Set(['REUSED','REJECTED','FAILED','BLOCKED_MODEL','AWAITING_VISUAL_REVIEW']);
function catalog(){
 const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'js/ui/codex/codex.js'),'utf8');
 const match=source.match(/const CODEX_CHAMP_SHEETS = Object.freeze\((\{[\s\S]*?\})\);/);
 const champions=Object.keys(JSON.parse(match[1]));
 const recipes=JSON.parse(fs.readFileSync(path.join(root,'tools/fondal-art-engine/recipes.json'),'utf8')).jobs;
 const references=Object.fromEntries(champions.map(id=>{const file='assets/ui/codex/champions/'+id+'.png';return [id,{file,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')}];}));
 return {champions,recipes,recent:RECENT,references};
}
function plan(command,cat=catalog()){
 if(typeof command!=='string'||command.trim().length<5||command.length>2000)throw Error('Describí la orden entre 5 y 2000 caracteres.');
 const text=command.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/\b(repar|arreg|correg|mejor|regener)/.test(text)){
  let ids;
  if(/\b(recientes|ultimos|nuevos)\b/.test(text))ids=cat.recent;
  else if(/\b(todos|todo)\b/.test(text))ids=[...cat.champions,...cat.recipes.map(r=>r.id)];
  else ids=[...cat.champions,...cat.recipes.map(r=>r.id)].filter(id=>new RegExp('\\b'+id+'\\b').test(text));
  if(!ids.length)throw Error('Indicá el identificador del campeón, «los últimos campeones» o «todos los assets».');
  return [...new Set(ids)].map(target=>({kind:'repair',target,description:command,recipe:cat.recipes.find(r=>r.id===target)||null,reference:cat.champions.includes(target)?'assets/ui/codex/champions/'+target+'.png':null,referenceSha256:cat.references?.[target]?.sha256||null,priority:cat.recent.includes(target)?0:1}));
 }
 if(/\b(crea|crear|genera|generar|agrega|agregar)\b/.test(text))return [{kind:/campeon/.test(text)?'champion-art':'asset',target:'new_'+crypto.randomUUID().slice(0,8),description:command,recipe:null,reference:null}];
 throw Error('Usá «reparar…» o «crear…» seguido de la descripción.');
}
function state(raw){raw=Object.assign(gameMaster.stateOf(null),raw||{});raw.artFactory=raw.artFactory||{jobs:[],commands:[],worker:null};return raw;}
function enqueue(raw,{command,requestId,actor,at=Date.now()},cat){
 const s=state(raw),q=s.artFactory;
 if(!/^[\w-]{8,80}$/.test(requestId||''))throw Error('La orden necesita un identificador válido.');
 const digest=crypto.createHash('sha256').update(command||'').digest('hex');
 const old=q.commands.find(c=>c.requestId===requestId&&c.actor===actor);
 if(old){if(old.digest!==digest)throw Error('El identificador ya corresponde a otra orden.');return {state:s,value:{jobs:q.jobs.filter(j=>old.ids.includes(j.id)),duplicate:true}};}
 const jobs=plan(command,cat).sort((a,b)=>(a.priority??2)-(b.priority??2));
 if(q.jobs.filter(j=>!TERMINAL.has(j.status)).length+jobs.length>200)throw Error('La cola tiene 200 trabajos pendientes.');
 const added=jobs.map(j=>({...j,id:crypto.randomUUID(),actor,createdAt:at,updatedAt:at,status:'QUEUED',attempts:0}));
 q.jobs.push(...added);s.audit.push({at,actor,action:'art.enqueue',jobs:added.map(j=>j.id)});s.audit=s.audit.slice(-5000);q.commands.push({requestId,actor,digest,ids:added.map(j=>j.id)});
 q.commands=q.commands.slice(-1000);
 return {state:s,value:{jobs:added,duplicate:false}};
}
function claim(raw,worker,at=Date.now()){
 const s=state(raw),q=s.artFactory;q.worker={name:worker,lastSeen:at};
 // A crash may have happened after submission to a model. Never blindly generate twice.
 for(const j of q.jobs)if(j.status==='RUNNING'&&j.leaseUntil<at){j.status='FAILED';j.error='WORKER_INTERRUPTED: inspect persisted provider request before retrying';j.updatedAt=at;}
 const j=q.jobs.find(j=>j.status==='QUEUED');if(!j)return {state:s,value:{job:null}};
 Object.assign(j,{status:'RUNNING',lease:crypto.randomUUID(),leaseUntil:at+20*60*1000,worker,attempts:j.attempts+1,updatedAt:at});
 return {state:s,value:{job:j}};
}
function finish(raw,{id,lease,result},at=Date.now()){
 const s=state(raw),j=s.artFactory.jobs.find(j=>j.id===id);
 const receipt=crypto.createHash('sha256').update(String(lease)).digest('hex');
 if(j&&TERMINAL.has(j.status)&&j.receipt===receipt&&JSON.stringify(j.result)===JSON.stringify(result))return {state:s,value:{job:j,duplicate:true}};
 if(!j||j.status!=='RUNNING'||j.lease!==lease||j.leaseUntil<at)throw Error('STALE_LEASE');
 if(!result||!TERMINAL.has(result.status))throw Error('BAD_RESULT');
 if(['REUSED','AWAITING_VISUAL_REVIEW'].includes(result.status)&&(!/^[a-f0-9]{64}$/.test(result.sha256||'')||result.technicalPass!==true))throw Error('MISSING_IMAGE_EVIDENCE');
 const encoded=JSON.stringify(result);if(encoded.length>16000)throw Error('RESULT_TOO_LARGE');
 Object.assign(j,{status:result.status,result,receipt,updatedAt:at});delete j.lease;delete j.leaseUntil;
 return {state:s,value:{job:j}};
}
function routes({getStore,adminAuth,send,err,readBody,workerToken=()=>process.env.FONDAL_ART_WORKER_TOKEN}){
 const guarded=fn=>async(req,res)=>{if(!await adminAuth(req,res,'MANAGE_CHAMPIONS'))return;try{return await fn(req,res);}catch(e){return err(req,res,400,'ART_COMMAND',e.message);}};
 const worker=fn=>async(req,res)=>{const expected=workerToken()||'',actual=(req.headers.authorization||'').replace(/^Bearer /,'');if(expected.length<32||Buffer.byteLength(actual)!==Buffer.byteLength(expected)||!crypto.timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return err(req,res,403,'FORBIDDEN','Proceso de producción no autorizado.');try{return await fn(req,res);}catch(e){return err(req,res,409,'ART_WORKER',e.message);}};
 return {
  'GET /api/gm/art':guarded(async(req,res)=>{const q=state(await getStore().gmRead()).artFactory;return send(req,res,200,{jobs:q.jobs.slice(-200),worker:q.worker,workerOnline:!!q.worker&&Date.now()-q.worker.lastSeen<90000,recent:RECENT,publication:'Validated candidates require visual approval and a tested release; queue completion never means public deployment.'});}),
  'POST /api/gm/art/command':async(req,res)=>{const actor=await adminAuth(req,res,'MANAGE_CHAMPIONS');if(!actor)return;try{const b=await readBody(req,10000);const value=await getStore().gmUpdate(raw=>enqueue(raw,{command:b.command,requestId:b.requestId,actor:actor.id}));return send(req,res,202,value);}catch(e){return err(req,res,400,'ART_COMMAND',e.message);}},
  'POST /api/art-worker/claim':worker(async(req,res)=>{const b=await readBody(req,2000);const name=String(b.worker||'local').slice(0,80);const value=await getStore().gmUpdate(raw=>claim(raw,name));return send(req,res,200,value);}),
  'POST /api/art-worker/heartbeat':worker(async(req,res)=>{const b=await readBody(req,2000);const value=await getStore().gmUpdate(raw=>{const s=state(raw),j=s.artFactory.jobs.find(j=>j.id===b.id);if(!j||j.status!=='RUNNING'||j.lease!==b.lease||j.leaseUntil<Date.now())throw Error('STALE_LEASE');s.artFactory.worker={name:j.worker,lastSeen:Date.now()};return {state:s,value:{ok:true}};});return send(req,res,200,value);}),
  'POST /api/art-worker/finish':worker(async(req,res)=>{const b=await readBody(req,20000);const value=await getStore().gmUpdate(raw=>finish(raw,b));return send(req,res,200,value);})
 };
}
module.exports={catalog,plan,state,enqueue,claim,finish,routes};
