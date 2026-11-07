'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('./cli'),'utf8');
// Exercise the CLI boundary, without launching a ten-minute browser process.
function run(command,result){
  const process={argv:['node','cli.js',command,'list'],exitCode:0};
  const errors=[];
  vm.runInNewContext(source,{process,console:{log(){},error(x){errors.push(x);}},require(name){
    if(name==='node:child_process')return {spawnSync(){return result;}};
    if(name==='./contracts')return {ROOT:'.',GATES:{}};
    return require(name);
  }});
  return {code:process.exitCode,errors};
}
for(const command of ['duplicity','element']){
  test(`${command}: completed success remains success`,()=>assert.equal(run(command,{status:0}).code,0));
  test(`${command}: rejection preserves exit code`,()=>assert.equal(run(command,{status:2}).code,2));
  test(`${command}: signal without error cannot approve`,()=>{
    const r=run(command,{status:null,signal:'SIGTERM'});
    assert.equal(r.code,1);assert.match(r.errors.join(' '),/FAIL.*SIGTERM/);
  });
  test(`${command}: timeout cannot approve`,()=>{
    const r=run(command,{status:null,error:new Error('ETIMEDOUT'),signal:'SIGTERM'});
    assert.equal(r.code,1);assert.match(r.errors.join(' '),/FAIL.*ETIMEDOUT/);
  });
  test(`${command}: missing executable cannot approve`,()=>assert.equal(run(command,{status:null,error:new Error('ENOENT')}).code,1));
}
