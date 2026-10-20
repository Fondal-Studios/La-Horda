'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),http=require('node:http');
const {fetchReadyOk}=require('./http-ready');
test('readiness waits for large success/error bodies and safely closes sockets',async()=>{
 let delivered=0;
 const server=http.createServer((req,res)=>{
  res.writeHead(req.url==='/unavailable'?503:200,{'content-type':'text/html','connection':'close'});
  res.write(Buffer.alloc(512*1024,65));
  setTimeout(()=>{res.end(Buffer.alloc(128*1024,66));delivered++;},30);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  const base='http://127.0.0.1:'+server.address().port;
  for(let i=0;i<12;i++){
   assert.equal(await fetchReadyOk(base+(i%2?'/unavailable':'/ready')),i%2===0);
   assert.equal(delivered,i+1,'probe must consume the delayed body, including non-2xx');
  }
  await assert.rejects(fetchReadyOk(base+'/ready',{signal:AbortSignal.abort()}));
 }finally{await new Promise(r=>server.close(r));}
});
