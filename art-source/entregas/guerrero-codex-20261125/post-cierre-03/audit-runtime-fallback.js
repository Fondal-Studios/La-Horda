#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),path=require('path');
const root=path.resolve(__dirname,'../../../..');
const technical=JSON.parse(fs.readFileSync(process.argv[2]||path.join(__dirname,'../cierre-02/TECHNICAL.json'),'utf8'));
const metaPath=path.join(root,'js/assets/codex-champion-meta.js');
const rendererPath=path.join(root,'js/rendering/champion-sprites.js');
const atlasPath=path.join(root,'assets/sprites/champions/guerrero/codex-v1/atlas.png');
const sandbox={CHAMP_PACK:{},champPackLoadAtlas:(k,src,meta)=>{sandbox.CHAMP_PACK[k]={src,meta};}};
vm.runInNewContext(fs.readFileSync(metaPath,'utf8'),sandbox,{filename:metaPath});
const sets=sandbox.CHAMP_PACK.codex_guerrero.meta.sets;
const renderer=fs.readFileSync(rendererPath,'utf8');
const fallbackPresent=renderer.includes('(st==="cast" && champPackSet(P, "attack", dir, h))');
const dirs=['down','side','up'];
const effective={};
for(const dir of dirs) effective['cast_'+dir]=sets['cast_'+dir]||sets['attack_'+dir]||sets['idle_'+dir];
const expected={cast_down:technical.sets.cast_down,cast_side:technical.sets.cast_side,cast_up:technical.sets.cast_up};
const equal=Object.fromEntries(Object.keys(expected).map(k=>[k,JSON.stringify(effective[k])===JSON.stringify(expected[k])]));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const report={
 schemaVersion:1,status:fallbackPresent&&Object.values(equal).every(Boolean)?'PASS_ALREADY_CONSUMED_BY_FALLBACK':'FAIL',
 auditedMain:require('child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
 sourceAtlas:{path:path.relative(root,atlasPath),sha256:sha(fs.readFileSync(atlasPath))},
 candidateSha256:technical.candidateSha256,
 explicitSets:{cast_down:sets.cast_down||null,cast_side:sets.cast_side||null,cast_up:sets.cast_up||null},
 effectiveSets:effective,candidateSets:expected,equality:equal,
 rendererFallback:{path:path.relative(root,rendererPath),present:fallbackPresent,expression:'cast -> attack -> idle'},
 conclusion:'The candidate PNG would duplicate frames already selected by the live renderer; no asset or runtime change is required.',
 limits:['Static consumer reconciliation; no new gameplay capture.','Directional death remains outside this result and FIX_NOT_APPROVED.']
};
if(report.status!=='PASS_ALREADY_CONSUMED_BY_FALLBACK'){console.error(JSON.stringify(report,null,2));process.exit(1);}
fs.writeFileSync(path.join(__dirname,'RUNTIME_AUDIT.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,equality:report.equality,sourceAtlasSha256:report.sourceAtlas.sha256}));
