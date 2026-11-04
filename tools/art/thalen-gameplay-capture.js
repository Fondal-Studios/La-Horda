'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');

module.exports=async function captureThalenGameplay({page,root}){
  const out=path.join(root,'docs/art-gate/thalen-codex/gameplay-01');
  fs.mkdirSync(out,{recursive:true});
  const errors=[];
  const listener=e=>errors.push(e.message);
  page.on('pageerror',listener);
  const rows=[];
  for(const view of [{id:'desktop',width:1280,height:720},{id:'mobile',width:844,height:390}]){
    await page.setViewportSize({width:view.width,height:view.height});
    await page.waitForTimeout(80);
    const result=await page.evaluate(({view})=>{
      const arenas=['bosque','hielo','infernal','laberinto','acuatica','minas'];
      const states=[
        {id:'idle_down',fx:0,fy:1},
        {id:'walk_down',fx:0,fy:1,moving:true,animT:280},
        {id:'walk_side',fx:1,fy:0,moving:true,animT:420},
        {id:'walk_up',fx:0,fy:-1,moving:true,animT:560},
        {id:'attack_down',fx:0,fy:1,attackAnim:160},
        {id:'attack_side',fx:1,fy:0,attackAnim:160},
        {id:'attack_up',fx:0,fy:-1,attackAnim:160},
        {id:'cast_down',fx:0,fy:1,attackAnim:160,cast:true},
        {id:'ultimate_down',fx:0,fy:1,attackAnim:160,cast:true,ultimate:true},
        {id:'death_down',fx:0,fy:1,death:true}
      ];
      const P=CHAMP_PACK.mago_codex,realReady=P.ready;
      const setup=(arena,look)=>{
        netMatch=null;window.ART_GATE_NO_VFX=true;
        const rec=save.champions.mago;rec.unlocked=true;rec.level=20;rec.equipment={};rec.croma=null;rec.cosmeticSkin=look==='convergencia'?'convergencia':'';
        selectedClass='mago';currentArena=arena;lobbyAllies=['tanque','soporte'];startRun(1);
        document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
        state='playing';spawnTimer=arenaHazardTimer=1e9;enemies=[];CAM_SUBJECT=player;CAM_LEAD_X=CAM_LEAD_Y=CAM_LIFT=0;_arenaTitleUntil=0;
        for(const a of allies){a.x=player.x-70;a.y=player.y+42;a.stunTimer=1e9;}
        for(const [dx,dy] of [[62,0],[-62,0],[0,58],[0,-58]]){const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+dx,y:player.y+dy,hp:1e8,maxHp:1e8,speed:0,baseSpeed:0,dmg:0});}
        player.invulnTimer=1e9;
      };
      const pose=s=>{
        Object.assign(player,{alive:true,hp:player.maxHp,fx:s.fx,fy:s.fy,moving:!!s.moving,animT:s.animT||0,attackAnim:s.attackAnim||0,hurtTimer:0,_aDur:320,_packCastUntil:s.cast?Infinity:0,_animCastKind:s.ultimate?2:0});
        player._deadAt=0;
        if(s.death){player.alive=false;player.hp=0;player._deadAt=performance.now()-420;}
      };
      const cv=document.getElementById('game');
      const sceneHash=()=>{const d=ctx.getImageData(Math.max(0,(cv.width>>1)-120),Math.max(0,(cv.height>>1)-90),Math.min(240,cv.width),Math.min(180,cv.height)).data;let h=2166136261;for(let i=0;i<d.length;i+=17){h^=d[i];h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');};
      const makeSheet=(cols,rows)=>{const c=document.createElement('canvas');c.width=cols*180;c.height=rows*128;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#091018';g.fillRect(0,0,c.width,c.height);return[c,g];};
      const stamp=(sheet,index,label)=>{const [c,g]=sheet,col=index%(c.width/180|0),row=Math.floor(index/(c.width/180));const sw=Math.min(480,cv.width),sh=Math.min(290,cv.height),sx=Math.max(0,(cv.width-sw)/2),sy=Math.max(0,(cv.height-sh)/2);g.drawImage(cv,sx,sy,sw,sh,col*180,row*128,180,108);g.fillStyle='#091018';g.fillRect(col*180,row*128+108,180,20);g.fillStyle='#f3ead2';g.font='11px sans-serif';g.fillText(label,col*180+5,row*128+122);};
      const sequence=makeSheet(5,4);let n=0;
      for(const look of ['base','convergencia']){setup('bosque',look);P.ready=realReady;for(const s of states){pose(s);render();stamp(sequence,n++,look+' · '+s.id);}}
      const arenaSheet=makeSheet(6,2);n=0;
      for(const look of ['base','convergencia'])for(const arena of arenas){setup(arena,look);P.ready=realReady;pose(states[5]);render();stamp(arenaSheet,n++,look+' · '+arena);}
      const compare=makeSheet(6,2);n=0;
      for(const look of ['base','convergencia'])for(const mode of ['legacy','candidate'])for(const s of [states[2],states[5],states[9]]){setup('bosque',look);P.ready=mode==='candidate'?realReady:false;pose(s);render();stamp(compare,n++,look+' · '+mode+' · '+s.id);}
      const matrix=[];
      for(const mode of ['legacy','candidate'])for(const look of ['base','convergencia'])for(const arena of arenas){setup(arena,look);P.ready=mode==='candidate'?realReady:false;pose(states[5]);render();matrix.push({view:view.id,mode,look,arena,state:'attack_side',hash:sceneHash(),resolvedSkin:activeSetSkinId(player),candidateReady:P.ready,legacyReady:MAGO_IMG_READY,alive:player.alive});}
      P.ready=realReady;state='menu';
      return{sequence:sequence[0].toDataURL(),arenas:arenaSheet[0].toDataURL(),comparison:compare[0].toDataURL(),matrix,realReady,legacyReady:MAGO_IMG_READY};
    },{view});
    const savePng=(name,data)=>fs.writeFileSync(path.join(out,name),Buffer.from(data.split(',')[1],'base64'));
    savePng(view.id+'-sequence.png',result.sequence);
    savePng(view.id+'-six-arenas.png',result.arenas);
    savePng(view.id+'-legacy-vs-candidate.png',result.comparison);
    for(const key of ['sequence','arenas','comparison'])delete result[key];
    rows.push(...result.matrix);
  }
  page.off('pageerror',listener);
  const files=fs.readdirSync(out).filter(f=>f.endsWith('.png')).sort().map(name=>{const b=fs.readFileSync(path.join(out,name));return{name,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};});
  const summary={status:errors.length?'FAIL':'PASS',scope:'actual render() fixture; dense allies/enemies; six arenas; base and Convergencia; authored candidate and forced legacy fallback; browser mobile viewport is not a physical device; no two-client relay claim',reference:{path:'assets/ui/codex/champions/mago.png',gitBlob:'f07788b98aa635bf1587c73f6e0e243c38b3cf64'},rows,files,errors};
  fs.writeFileSync(path.join(out,'runtime.json'),JSON.stringify(summary,null,2)+'\n');
  return summary;
};
