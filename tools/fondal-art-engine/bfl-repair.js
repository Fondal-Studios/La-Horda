'use strict';
const fs=require('node:fs'),path=require('node:path');
const {sha,inspectSheet}=require('./sheet-gate');
const ROOT=path.resolve(__dirname,'../..');
function prepare(job){
 if(job.kind!=='repair'||!['morveth','brakk','veyra','solciju','aelith'].includes(job.target))throw Error('Trial is restricted to repairs of the five recent champions');
 const reference='assets/ui/codex/champions/'+job.target+'.png';
 if(job.reference!==reference||job.referenceSha256!==sha(fs.readFileSync(path.join(ROOT,reference))))throw Error('Missing or changed Codex reference');
 const text=fs.readFileSync(path.join(ROOT,'js/champions/ascension/art.js'),'utf8');
 const line=text.split('\n').find(l=>l.startsWith('champPackLoadAtlas("'+job.target+'",'));
 if(!line)throw Error('Existing champion atlas contract not found');
 const args=JSON.parse('['+line.slice('champPackLoadAtlas('.length,-2)+']');
 const original=args[2];
 if(original.w!==112||original.h!==112||original.cols!==4)throw Error('Unsupported existing atlas layout');
 const meta={...original,w:256,h:256,refH:original.refH*256/112};
 return {target:{id:job.target},references:[path.join(ROOT,reference),path.join(ROOT,args[1])],meta,
  prompt:'Repair the pixel-art sprites of '+job.target+'. Image 1 is the authoritative Codex: match its small pixel sprite examples, identity, costume, weapon and palette, not its page lettering or illustration background. Image 2 supplies the exact animation poses and order. Produce ONLY one complete spritesheet, 4 columns and 9 equal rows, 36 separate full-body poses, each centered with generous clear margins. Rows 1-3: walk front, side, back. Rows 4-6: attack front, side, back. Row 7: cast. Row 8: ultimate ability, not hurt. Row 9: death progression. Preserve the character across all frames. Sharp native pixel clusters, no painterly shading, no labels, no grid lines. Transparent background if supported; otherwise a perfectly flat #FF00FF background, no shadows. Never omit, duplicate or crop a pose.',
  baseline:{source:args[1],sha256:sha(fs.readFileSync(path.join(ROOT,args[1]))),meta:original},referenceSha256:job.referenceSha256};
}
async function repair(job,out,provider){
 const prepared=prepare(job);
 await provider.generate(prepared,{out});
 const gate=inspectSheet(fs.readFileSync(path.join(out,'atlas.png')),prepared.meta);
 // No chroma-key guess or synthetic animation is accepted as a successful repair.
 const result={status:gate.ok?'AWAITING_VISUAL_REVIEW':'REJECTED',sha256:gate.sha256,technicalPass:gate.ok,issues:gate.issues.length,artifactDirectory:job.id,provider:'bfl-klein-trial'};
 fs.writeFileSync(path.join(out,'delivery.json'),JSON.stringify({job,baseline:prepared.baseline,referenceSha256:prepared.referenceSha256,gate,result,installed:false},null,2)+'\n');return result;
}
module.exports={prepare,repair};
