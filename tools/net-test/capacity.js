"use strict";
// Synthetic relay test; does NOT certify FPS, actual snapshots, database load or global latency.
// Defaults to a local disposable relay. Remote targets require an explicit RELAY URL.
const WebSocket = require('../../server/node_modules/ws');
const fs = require('fs'), os = require('os'), path = require('path');
const { performance } = require('perf_hooks');
const count = Number(process.env.PLAYERS || 50), seconds = Number(process.env.SECONDS || 60);
const hz = Number(process.env.HZ || 20), bytes = Number(process.env.SNAPSHOT_BYTES || 16384);
if(!Number.isInteger(count) || count < 2 || count > 100 || seconds < 5 || seconds > 300 || hz < 1 || hz > 40 || bytes < 128 || bytes > 131072) throw Error('Invalid load parameters');
let local, temp;
if(!process.env.RELAY){
  temp = fs.mkdtempSync(path.join(os.tmpdir(),'horda-capacity-'));
  process.env.DATA_DIR = temp; process.env.DATABASE_URL = ''; process.env.PORT = '8897';
  local = require('../../server/relay');
}
const relay = process.env.RELAY || 'ws://127.0.0.1:8897';
let agent;
if(process.env.LOAD_PROXY){ const {HttpsProxyAgent} = require('https-proxy-agent'); agent = new HttpsProxyAgent(process.env.LOAD_PROXY); }
const clients = [], groups = [], latencies = [], errors = [];
let sent = 0, received = 0, expected = 0, unexpectedCloses = 0, measuring = false, timer;
const sleep = ms => new Promise(r=>setTimeout(r,ms));
async function connect(){
  const ws = new WebSocket(relay,{origin:'https://fondalstudios.com',agent,handshakeTimeout:15000});
  const c = {ws,control:[],received:0}; clients.push(c);
  ws.on('error',e=>errors.push(e.message));
  ws.on('close',()=>{if(measuring) unexpectedCloses++;});
  ws.on('message',raw=>{
    const m=JSON.parse(raw);
    if(m.t==='msg' && m.d && m.d.load){received++;c.received++;return;}
    if(m.t==='pong'){latencies.push(performance.now()-m.c);return;}
    if(m.t==='error') errors.push(m.code);
    c.control.push(m); if(c.control.length>30)c.control.shift();
  });
  await new Promise((ok,ko)=>{ws.once('open',ok);ws.once('error',ko);});
  c.send = m=>ws.send(JSON.stringify(m));
  c.wait = async type=>{const until=Date.now()+15000;while(Date.now()<until){const i=c.control.findIndex(m=>m.t===type);if(i>=0)return c.control.splice(i,1)[0];await sleep(10);}throw Error('Timeout '+type);};
  return c;
}
(async()=>{
  try{
    if(local)await local.accounts.ready;
    for(let i=0;i<count;i++){
      const c=await connect(), meta={protocol:1,build:'capacity-private-v1',champ:'tanque',level:1,name:'Capacity test',clientId:'capacity-'+Date.now()+'-'+i};
      if(i%4===0){c.send({t:'create',...meta,public:false,arena:'bosque'});const j=await c.wait('joined');groups.push({code:j.room.code,members:[c]});}
      else{const g=groups.at(-1);c.send({t:'join',...meta,code:g.code});await c.wait('joined');g.members.push(c);}
    }
    for(const g of groups){g.members[0].send({t:'start'});}
    const payload='x'.repeat(bytes), started=performance.now(); measuring=true;
    timer=setInterval(()=>{
      for(const g of groups){
        g.members[0].send({t:'msg',d:{load:true,payload}});sent++;expected+=g.members.length-1;
        for(const c of g.members.slice(1)){c.send({t:'msg',d:{load:true,input:[0.1,0.2,1]}});sent++;expected++;}
      }
    },1000/hz);
    for(let i=0;i<seconds;i++){await sleep(1000);for(const c of clients)c.send({t:'ping',c:performance.now()});}
    clearInterval(timer);await sleep(2000);measuring=false;
    latencies.sort((a,b)=>a-b);
    const report={at:new Date().toISOString(),kind:'synthetic-relay-only',relay,players:count,rooms:groups.length,seconds,hz,snapshotPayloadBytes:bytes,
      sent,expectedDeliveries:expected,received,deliveryRatio:expected?received/expected:0,pingSamples:latencies.length,
      pingP95Ms:latencies[Math.floor(latencies.length*.95)]||null,unexpectedCloses,errors,
      elapsedMs:Math.round(performance.now()-started),pass:received===expected&&errors.length===0&&unexpectedCloses===0&&latencies.length>0};
    console.log(JSON.stringify(report,null,2));
    if(process.env.REPORT)fs.writeFileSync(process.env.REPORT,JSON.stringify(report,null,2)+'\n');
    if(!report.pass)process.exitCode=1;
  }catch(e){console.error(e);process.exitCode=1;}
  finally{
    measuring=false;clearInterval(timer);
    for(const c of clients){if(c.ws.readyState===WebSocket.OPEN)c.send({t:'leave'});}
    await sleep(200);for(const c of clients)c.ws.terminate();
    if(local)await new Promise(r=>local.server.close(r));
    if(temp)fs.rmSync(temp,{recursive:true,force:true});
    process.exit(process.exitCode || 0);
  }
})();
