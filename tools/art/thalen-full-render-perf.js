'use strict';
const fs=require('node:fs'),path=require('node:path');

module.exports=async function thalenFullRenderPerf({page,root}){
  const out=path.join(root,'docs/art-gate/thalen-codex/close-01');
  fs.mkdirSync(out,{recursive:true});
  const rows=[];
  for(const view of [{id:'desktop',width:1280,height:720},{id:'mobile',width:844,height:390}]){
    await page.setViewportSize({width:view.width,height:view.height});
    for(const mode of ['legacy','candidate']){
      const result=await page.evaluate(({mode})=>{
        const P=CHAMP_PACK.mago,ready=P.ready;const setReady=v=>{P.ready=v;P.failed=!v;}; // "legacy" = el atlas Códice falló: sin failed, champPackPending no dibuja nada
        setReady(mode==='candidate'?ready:false);
        netMatch=null;window.ART_GATE_NO_VFX=false;
        const rec=save.champions.mago;rec.unlocked=true;rec.level=20;rec.equipment={};rec.croma=null;rec.cosmeticSkin='';
        selectedClass='mago';currentArena='bosque';lobbyAllies=['tanque','soporte'];startRun(1);
        document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
        state='playing';spawnTimer=arenaHazardTimer=1e9;player.invulnTimer=1e9;
        for(const [dx,dy] of [[-150,-110],[0,-130],[150,-110],[-180,0],[180,0],[-150,110],[0,130],[150,110],[230,-70],[-230,-70],[230,70],[-230,70]]){
          const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+dx,y:player.y+dy,hp:1e8,maxHp:1e8,speed:0,baseSpeed:0,dmg:0});
        }
        const times=[];let clears=0;
        for(let i=0;i<360;i++){
          player.moving=(i%80)<50;player.fx=(i%120)<60?1:0;player.fy=player.fx?0:1;player.animT=i*16;
          if(i%90===0){player.attackAnim=220;player._packCastUntil=performance.now()+220;}
          const t=performance.now();render();times.push(performance.now()-t);ctx.clearRect(0,0,canvas.width,canvas.height);clears++;
        }
        setReady(ready);state='menu';
        times.sort((a,b)=>a-b);const q=p=>times[Math.min(times.length-1,Math.floor(times.length*p))];
        return{mode,samples:times.length,clears,p50:q(.50),p95:q(.95),max:times[times.length-1],candidateReady:ready,legacyReady:MAGO_IMG_READY,enemies:12,allies:allies.length};
      },{mode});
      rows.push({view:view.id,...result});
    }
  }
  const result={status:rows.every(r=>r.candidateReady&&r.legacyReady&&r.samples===360&&r.clears===360)?'PASS':'FAIL',rows,scope:'Full render() with real clearRect after every sample; 12 enemies and two allies; desktop and mobile viewport; candidate and legacy runs measured separately. Local CI Chromium, not a physical mobile device, GPU profile or GC attribution; no speedup claim.'};
  fs.writeFileSync(path.join(out,'PERFORMANCE.json'),JSON.stringify(result,null,2)+'\n');
  return result;
};
