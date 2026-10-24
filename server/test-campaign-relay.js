'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawn}=require('node:child_process'),WS=require('ws');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'horda-result-ws-'));let cp,port=0;const clients=[];
async function start(){cp=spawn(process.execPath,['-e',`const r=require('./relay');r.server.on('listening',()=>console.log('TESTPORT:'+r.server.address().port))`],{cwd:__dirname,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',DATA_DIR:dir,DATABASE_URL:''},stdio:['ignore','pipe','pipe']});await new Promise((r,j)=>{const t=setTimeout(()=>j(Error('startup')),10000);cp.stdout.on('data',b=>{const m=String(b).match(/TESTPORT:(\d+)/);if(m){port=+m[1];clearTimeout(t);r();}});});}
async function stop(){if(cp){const p=cp;cp=null;await new Promise(r=>{p.once('exit',r);p.kill();});}}
async function client(){const ws=new WS('ws://127.0.0.1:'+port),q=[];clients.push(ws);ws.on('message',b=>q.push(JSON.parse(String(b))));await new Promise(r=>ws.once('open',r));return {ws,send:x=>ws.send(JSON.stringify(x)),async next(t){const until=Date.now()+8000;while(Date.now()<until){const i=q.findIndex(x=>x.t===t);if(i>=0)return q.splice(i,1)[0];await new Promise(r=>setTimeout(r,20));}throw Error('missing '+t);}};}
(async()=>{try{
 await start();const h=await client(),g=await client();
 h.send({t:'reward-open',key:'a'.repeat(64)});await h.next('reward-list');g.send({t:'reward-open',key:'b'.repeat(64)});await g.next('reward-list');
 h.send({t:'create',protocol:1,clientId:'host',arena:'bosque',champ:'tanque'});const code=(await h.next('joined')).room.code;
 g.send({t:'join',protocol:1,clientId:'guest',code,champ:'mago'});await g.next('joined');
 h.send({t:'start'});h.send({t:'msg',d:{k:'start',arena:'bosque',seed:5,slots:[{champ:'tanque',kind:'human'},{champ:'mago',kind:'human'}],snap:{}}});
 const startMessage=await g.next('msg');const id=startMessage.d.rewardRunId;assert.ok(id);
 g.ws.close();await new Promise(r=>g.ws.once('close',r));
 h.send({t:'msg',d:{k:'end',victory:true,snap:{h:[{hp:100},{hp:45}],g:{}}}});await h.next('reward-committed');
 h.ws.close();await new Promise(r=>h.ws.once('close',r));await stop();await start();
 const back=await client();back.send({t:'reward-open',key:'b'.repeat(64)});assert.deepEqual((await back.next('reward-list')).ids,[id]);
 back.send({t:'reward-get',id});const result=(await back.next('reward-result')).result;assert.equal(result.slot,1);assert.equal(result.end.snap.h[1].hp,45);
 back.send({t:'reward-ack',id});await back.next('reward-list');
 console.log('PASS real WebSockets: disconnected guest, durable end ack, host closure, relay restart, private recovery and acknowledgement');
 }finally{for(const c of clients)c.terminate();await stop();fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
