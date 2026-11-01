'use strict';
/* Cliente mínimo de la API de Runway para el lazo de repintado. La clave la inyecta el proxy (no se lee ni se guarda).
 * Seguridad de gasto: diario en disco con fsync ANTES de cada POST; un pedido con resultado incierto NO se reenvía
 * (queda 'uncertain' y requiere decisión explícita). Tope duro de créditos por ejecución (BUDGET). */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const BASE='https://api.dev.runwayml.com/v1',H={'X-Runway-Version':'2024-11-06','Content-Type':'application/json'};
const COST={gen4_image_turbo:2,gen4_image:5,gemini_2_5_flash:5};            // créditos por imagen (720p); se verifica con el saldo real
/* HTTP por curl: respeta el proxy del entorno (que inyecta la autenticación). Devuelve {status,json}. */
function req(method,url,body){return new Promise((res,rej)=>{const a=['-s','-m','120','-X',method,'-w','\n%{http_code}',url];for(const [k,v] of Object.entries(H))a.push('-H',k+': '+v);
  if(body!==undefined)a.push('--data-binary','@-');const c=cp.spawn('curl',a);let o='';c.stdout.on('data',d=>o+=d);c.on('error',rej);c.on('close',()=>{const i=o.lastIndexOf('\n');let j;try{j=JSON.parse(o.slice(0,i));}catch(e){j=null;}res({status:+o.slice(i+1),json:j});});
  if(body!==undefined)c.stdin.write(JSON.stringify(body));c.stdin.end();});}
async function balance(){const r=await req('GET',BASE+'/organization');return r.json&&r.json.creditBalance;}
function journalAppend(file,obj){fs.mkdirSync(path.dirname(file),{recursive:true});const fd=fs.openSync(file,'a');fs.writeSync(fd,JSON.stringify({t:new Date().toISOString(),...obj})+'\n');fs.fsyncSync(fd);fs.closeSync(fd);}
async function generate({model,prompt,ratio,refs,journal,key}){
  const prior=fs.existsSync(journal)?fs.readFileSync(journal,'utf8').split('\n').filter(Boolean).map(JSON.parse).filter(e=>e.key===key):[];
  const done=prior.find(e=>e.ev==='done'); if(done) return {cached:true,...done};
  const open=prior.find(e=>e.ev==='task'||e.ev==='posting'); let taskId=open&&open.taskId;
  if(open&&!taskId) throw new Error('resultado incierto para '+key+': no se reenvía (revisar el diario)');
  if(!taskId){
    journalAppend(journal,{ev:'posting',key,model});
    let r;try{r=await req('POST',BASE+'/text_to_image',{model,promptText:prompt,ratio,referenceImages:refs});}catch(e){journalAppend(journal,{ev:'uncertain',key,err:String(e)});throw e;}
    const j=r.json; if(r.status<200||r.status>=300||!j||!j.id){journalAppend(journal,{ev:r.status===0||!j?'uncertain':'rejected',key,status:r.status,body:j});throw new Error('Runway: estado '+r.status+' '+JSON.stringify(j));}
    taskId=j.id;journalAppend(journal,{ev:'task',key,taskId});
  }
  for(let i=0;i<90;i++){await new Promise(r=>setTimeout(r,3000));const t=(await req('GET',BASE+'/tasks/'+taskId)).json||{};
    if(t.status==='SUCCEEDED'){journalAppend(journal,{ev:'done',key,taskId,output:t.output});return {taskId,output:t.output};}
    if(t.status==='FAILED'||t.status==='CANCELLED'){journalAppend(journal,{ev:'failed',key,taskId,failure:t.failure});throw new Error('tarea '+t.status+': '+t.failure);}}
  throw new Error('tiempo agotado; tarea '+taskId+' queda en el diario para reanudar');
}
module.exports={balance,generate,COST,journalAppend};
