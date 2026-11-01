'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const {readContract, pngSize, ROOT} = require('./contract');
function fixture() {
 const root = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-'));
 fs.mkdirSync(path.join(root, 'js/assets'), {recursive:true}); fs.mkdirSync(path.join(root, 'assets/sprites/champions/test'), {recursive:true});
 const atlas = 'assets/sprites/champions/test/atlas.png';
 const bytes = Buffer.alloc(33); Buffer.from('89504e470d0a1a0a', 'hex').copy(bytes); bytes.writeUInt32BE(13,8); bytes.write('IHDR',12);bytes.writeUInt32BE(128,16);bytes.writeUInt32BE(64,20);fs.writeFileSync(path.join(root, atlas),bytes);
 const meta = {w:64,h:64,cols:2,refH:40,anchor:0.9,sets:{idle_down:[0],walk_side:[0,1],walk_left:[-1,-2]}};
 const write = (m=meta, src=atlas, file='a.js') => fs.writeFileSync(path.join(root,'js/assets',file),`champPackLoadAtlas("test", ${JSON.stringify(src)}, ${JSON.stringify(m)});\n`);
 write();return {root,meta,atlas,write};
}
test('existing Sylva/Libertador contracts remain supported; procedural contracts remain explicit unsupported', () => {
 assert.equal(readContract('cazadora').frames,52);assert.equal(readContract('libertador').kind,'atlas');assert.equal(readContract('tanque').kind,'unsupported');assert.match(readContract('tanque_death').reason,/JSON literal/);
});
test('duplicate registration is rejected within a file and across different files', () => {
 const f=fixture();f.write(f.meta,f.atlas,'z.js');assert.match(readContract('test',f).reason,/ambiguo/);
 fs.unlinkSync(path.join(f.root,'js/assets/z.js'));fs.appendFileSync(path.join(f.root,'js/assets/a.js'),fs.readFileSync(path.join(f.root,'js/assets/a.js')));assert.match(readContract('test',f).reason,/ambiguo/);
});
test('JSON only: expressions are never evaluated', () => {
 const f=fixture();fs.writeFileSync(path.join(f.root,'js/assets/a.js'),'champPackLoadAtlas("test", "'+f.atlas+'", {w:64,h:64,cols:2,refH:40,anchor:9/10,sets:{idle:[0]}});');
 assert.match(readContract('test',f).reason,/JSON literal/);
});
test('canonical atlas paths and symbolic escapes fail closed', () => {
 for (const bad of ['../outside.png','/tmp/out.png','assets/sprites/champions/test/../test/atlas.png','assets\\sprites\\champions\\test\\atlas.png','https://example.com/a.png']) {
  const f=fixture();f.write(f.meta,bad);assert.equal(readContract('test',f).kind,'unsupported',bad);
 }
 const f=fixture();fs.unlinkSync(path.join(f.root,f.atlas));fs.symlinkSync(path.join(ROOT,'assets/sprites/champions/cazadora/codex-v1/atlas.png'),path.join(f.root,f.atlas));assert.match(readContract('test',f).reason,/simbólica/);
});
test('positive finite geometry, bounded anchor and valid nonempty frame arrays are mandatory', () => {
 const cases=[{w:0},{h:-1},{cols:1.5},{refH:0},{refH:65},{anchor:1.1},{anchor:null},{sets:{}},{sets:{idle:[]}},{sets:{idle:[2]}},{sets:{idle:[-3]}},{sets:{idle:[0.5]}},{sets:{idle:'0'}},{frameCount:1},{fix:{left:'rotate'}},{footX:{}}];
 for (const change of cases) {const f=fixture();f.write({...f.meta,...change});assert.equal(readContract('test',f).kind,'unsupported',JSON.stringify(change));}
 const f=fixture();assert.equal(readContract('test',f).kind,'atlas');assert.deepEqual(readContract('test',f).clips.walk_left.frames,[-1,-2]);assert.deepEqual(readContract('test',f).clips.walk_left.unique,[0,1]);
});
test('truncated PNGs and invalid dimensions are rejected before header reads', () => {
 const f=fixture(), file=path.join(f.root,f.atlas);fs.writeFileSync(file,Buffer.from('PNG'));assert.throws(()=>pngSize(file),/PNG/);assert.equal(readContract('test',f).kind,'unsupported');
});
function skinFixture() {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'skin-contract-'));fs.mkdirSync(path.join(root,'js/assets'),{recursive:true});
 const line=fs.readFileSync(path.join(ROOT,'js/assets/unique-skins-meta.js'),'utf8').split('\n').find(x=>x.startsWith('Object.assign(CROMA_SKINS["cazadora_escarcha"]'));
 fs.writeFileSync(path.join(root,'js/assets/unique-skins-meta.js'),line+'\n');
 for(const file of ['assets/sprites/champions/cazadora/skins/cazadora_escarcha/atlas.png','assets/sprites/champions/cazadora/skins/cazadora_escarcha/preview.png','art-source/unique-skins/cazadora_escarcha.png']) {fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.copyFileSync(path.join(ROOT,file),path.join(root,file));}
 return {root,skin:'cazadora_escarcha',line};
}
test('exact authored skin has independent 24-frame geometry and source identity, never base fallback',()=>{
 const c=readContract('cazadora',{skin:'cazadora_escarcha'});
 assert.equal(c.kind,'atlas');assert.equal(c.frames,24);assert.equal(c.cell.w,112);assert.equal(c.cols,8);assert.equal(c.consumerType,'authored-skin');
 assert.equal(c.codexPage,'art-source/unique-skins/cazadora_escarcha.png');assert.equal(c.registration.key,'cazadora_escarcha');assert.equal(c.registration.baseKey,'cazadora');assert.match(c.registration.sourceSha256,/^[a-f0-9]{64}$/);
 for(const [id,skin] of [['cazadora','unknown'],['cazadora','escarcha'],['tanque','cazadora_escarcha']]) assert.equal(readContract(id,{skin}).kind,'unsupported');
});
test('authored skin duplicate definitions and missing source fail closed without mutating repo files',()=>{
 const f=skinFixture();assert.equal(readContract('cazadora',f).kind,'atlas');fs.writeFileSync(path.join(f.root,'js/assets/duplicate.js'),f.line);assert.match(readContract('cazadora',f).reason,/ambiguo/);
 fs.unlinkSync(path.join(f.root,'js/assets/duplicate.js'));fs.unlinkSync(path.join(f.root,'art-source/unique-skins/cazadora_escarcha.png'));assert.match(readContract('cazadora',f).reason,/referencia original/);
});
test('integrated skin immutable factory atlas stays readable only within the exact champion/skin namespace',()=>{
 const f=skinFixture(),registry=path.join(f.root,'js/assets/unique-skins-meta.js'),original='assets/sprites/champions/cazadora/skins/cazadora_escarcha/atlas.png';
 const updated='assets/sprites/champions/cazadora/skins/cazadora_escarcha/factory-'+ 'a'.repeat(64) +'/atlas.png';
 fs.mkdirSync(path.dirname(path.join(f.root,updated)),{recursive:true});fs.copyFileSync(path.join(f.root,original),path.join(f.root,updated));
 fs.writeFileSync(registry,f.line.replace(original,updated));const c=readContract('cazadora',f);assert.equal(c.kind,'atlas',c.reason);assert.equal(c.atlas,updated);
 for(const invalid of [updated.replace('/cazadora/','/tanque/'),updated.replace('/cazadora_escarcha/','/other_skin/'),updated.replace('factory-'+ 'a'.repeat(64),'factory-short')]){fs.writeFileSync(registry,f.line.replace(original,invalid));assert.equal(readContract('cazadora',f).kind,'unsupported');}
});
