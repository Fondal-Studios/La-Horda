"use strict";
// Cosmetic cast identities: no damage, random numbers, collision or gameplay timers.
// One compact network event per cast. Fixed pool, deterministic drawing, no blur.
const CHAMPION_SIGNATURES = {
  tanque:['shield','#89caff'], guerrero:['blades','#ff7971'], mago:['star','#d6a0ff'],
  soporte:['wings','#93ffc3'], segador:['scythe','#ff595e'], axiom:['glitch','#65ffe4'],
  profeta:['eye','#e3b0ff'], musashi:['blades','#f1dcab'], cazadora:['arrows','#b0ed78'],
  nigromante:['skull','#83efb5'], libertador:['sun','#9fe9ff'], ilkan:['blades','#6fe8d6'],
  myla:['drops','#ffc2dd'], brasa:['gear','#ffcb78'], eslabon:['chain','#d3dff5'],
  morwen:['drops','#cc99ff'], farolero:['sun','#ffe592'], iria:['triangle','#b9b3ff']
};
const SIGNATURE_MAX = 32;
const championSignatures = Array.from({length:SIGNATURE_MAX},()=>({on:false}));
function vfxChampionSignature(x,y,key,slot,ult,angle){
  if(!Number.isFinite(x)||!Number.isFinite(y)||!inView(x,y,140)) return;
  let s=championSignatures.find(s=>!s.on);
  if(!s){ if(!ult)return; s=championSignatures.find(s=>!s.ult); if(!s)return; }
  Object.assign(s,{on:true,x,y,key,slot,radius:0,ult:!!ult,angle:Number.isFinite(angle)?angle:0,t:0,dur:ult?850:460});
}
function championSignaturesUpdate(dt){for(const s of championSignatures)if(s.on){s.t+=dt;if(s.t>=s.dur)s.on=false;}}
function championSignaturesReset(){for(const s of championSignatures)s.on=false;}
// Normal Brakk casts: assembled masonry and nail turret.
// Pixel-native airborne identifiers; they do not describe a damage footprint.
// Keep the existing event key/slot/lifetime and the ultimate's original renderer.
let brakkSignatureAtlas=null;
function drawBrakkNormalSignature(s){
  const q=s.t/s.dur,calm=typeof JUICE!=='undefined'&&JUICE.reduceMotion;
  const gap=calm?0:Math.round(3*(1-Math.min(1,q*5)));
  if(!brakkSignatureAtlas){
    const cv=document.createElement('canvas');cv.width=192;cv.height=80;
    const real=ctx;ctx=cv.getContext('2d');
    try{for(let slot=0;slot<2;slot++)for(let g=0;g<4;g++){
      ctx.save();ctx.translate(g*48+24,slot*40+20);drawBrakkSignaturePixels(slot,g);ctx.restore();
    }}finally{ctx=real;}
    brakkSignatureAtlas=cv;
  }
  ctx.save();ctx.globalAlpha=Math.min(1,(1-q)*3)*.85;
  ctx.drawImage(brakkSignatureAtlas,gap*48,s.slot*40,48,40,Math.round(s.x)-24,Math.round(s.y-82)-20,48,40);
  ctx.restore();
}
function drawBrakkSignaturePixels(slot,gap){
  const plate=(x,y,w,h,color)=>{
    ctx.fillStyle='#171922';ctx.fillRect(x-1,y-1,w+2,h+2);
    ctx.clearRect(x,y,w,h);
    ctx.fillStyle=color;ctx.fillRect(x,y,1,h);ctx.fillRect(x+w-1,y,1,h);
    ctx.fillStyle='#f4e5ba';ctx.fillRect(x,y,w,1);
  };
  if(slot===0){
    // Three staggered courses and open crenels, never a radial seal.
    plate(-15-gap,-10,8,6,'#bea66c');plate(-4,-10,8,6,'#ddc88d');plate(7+gap,-10,8,6,'#bea66c');
    plate(-15,-3,14,6,'#99835c');plate(1,-3,14,6,'#bea66c');
    plate(-15,4,8,6,'#bea66c');plate(-6,4,12,6,'#ddc88d');plate(7,4,8,6,'#99835c');
  }else if(slot===1){
    // Side-facing barrel, receiver and split mechanical feet.
    plate(-3,0,5,9,'#a6b6bd');
    plate(-12-gap,8,10,3,'#99835c');plate(3+gap,8,10,3,'#99835c');
    plate(-9,-9,16,8,'#bea66c');plate(7+gap,-7,9,4,'#a6b6bd');
    plate(15+gap,-8,3,6,'#d1dfe2');plate(-7,-13,7,3,'#504637');
    ctx.fillStyle='#f4e5ba';ctx.fillRect(-7,-6,2,2);ctx.fillRect(2,-6,2,2);
  }
}
// Maura normal casts: root fork, split bark and pruning shears above the canopy.
// Same event, pool and 460ms lifetime; no owner state or gameplay footprint.
let mauraSignatureAtlas=null;
function drawMauraNormalSignature(s){
  const q=s.t/s.dur,calm=typeof JUICE!=='undefined'&&JUICE.reduceMotion;
  const frame=calm?3:Math.min(3,Math.floor(q*12));
  if(!mauraSignatureAtlas){
    const cv=document.createElement('canvas');cv.width=96;cv.height=72;
    const g=cv.getContext('2d');
    for(let slot=0;slot<3;slot++)for(let f=0;f<4;f++){
      const pixels=new Map(),put=(x,y,c)=>pixels.set(x+','+y,{x,y,c});
      const line=(x,y,bx,by,c)=>{const dx=Math.abs(bx-x),dy=-Math.abs(by-y),sx=x<bx?1:-1,sy=y<by?1:-1;let e=dx+dy;
        for(;;){put(x,y,c);if(x===bx&&y===by)break;const z=2*e;if(z>=dy){e+=dy;x+=sx;}if(z<=dx){e+=dx;y+=sy;}}};
      const leaf=(x,y)=>{line(x-2,y,x+2,y,'#879c60');line(x-1,y-1,x+1,y-1,'#cfe0a0');put(x,y+1,'#4a5a30');};
      const gap=3-f;
      if(slot===0){
        line(12,5,12,13,'#cfe0a0');line(12,12,8-gap,18,'#bba375');line(12,12,16+gap,18,'#bba375');line(12,13,12,20,'#6c5424');
        leaf(8,7);leaf(16,5);line(8-gap,18,5-gap,17,'#879c60');line(16+gap,18,18+gap,16,'#879c60');
      }else if(slot===1){
        for(const side of [-1,1]){const x=12+side*(5+gap);
          line(x,5,x-side,15,'#6c5424');line(x-side,15,x-side*3,18,'#bba375');
          line(x-side,6,x-side*2,13,'#cfe0a0');line(x,8,x+side,10,'#879c60');}
        leaf(12,4);
      }else{
        const open=3-Math.min(2,f);
        for(const side of [-1,1]){line(12,12,12+side*(5+open),4,'#acb9a4');line(12+side,11,12+side*(5+open),3,'#f3e8bb');
          const x=12-side*5;line(12,12,x,16,'#8b3a2a');line(x-2,16,x+2,16,'#8b3a2a');line(x-3,17,x-3,19,'#8b3a2a');line(x+3,17,x+3,19,'#8b3a2a');line(x-2,20,x+2,20,'#8b3a2a');}
        put(12,12,'#f3e8bb');
      }
      g.fillStyle='#1a2010';for(const {x,y}of pixels.values())for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])g.fillRect(f*24+x+dx,slot*24+y+dy,1,1);
      for(const {x,y,c}of pixels.values()){g.fillStyle=c;g.fillRect(f*24+x,slot*24+y,1,1);}
    }
    mauraSignatureAtlas=cv;
  }
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=Math.min(1,(1-q)*3)*.85;
  ctx.drawImage(mauraSignatureAtlas,frame*24,s.slot*24,24,24,Math.round(s.x)-12,Math.round(s.y)-112,24,24);
  ctx.restore();
}
// Morwen's normal cast identifiers: resin flask, salt crystals and a distilling retort.
// Cached native pixels; the crest is not a projectile, damage area or shield timer.
let morwenSignatureAtlas=null;
function drawMorwenNormalSignature(s){
  const q=s.t/s.dur,calm=typeof JUICE!=='undefined'&&JUICE.reduceMotion;
  const frame=calm?3:Math.min(5,Math.floor(q*6));
  if(!morwenSignatureAtlas){
    const cv=document.createElement('canvas');cv.width=192;cv.height=96;
    const g=cv.getContext('2d'),O='#24101e',D='#6e3a60',A='#a46191',B='#edd0a5',C='#f9eee0',E='#c9a0bd';
    for(let slot=0;slot<3;slot++)for(let f=0;f<6;f++){
      const pixels=new Map(),put=(x,y,c)=>pixels.set(x+','+y,{x,y,c});
      const line=(x,y,bx,by,c)=>{let dx=Math.abs(bx-x),dy=-Math.abs(by-y),sx=x<bx?1:-1,sy=y<by?1:-1,e=dx+dy;
        for(;;){put(x,y,c);if(x===bx&&y===by)break;const z=2*e;if(z>=dy){e+=dy;x+=sx;}if(z<=dx){e+=dx;y+=sy;}}};
      const drop=(x,y)=>{put(x,y,A);line(x-1,y+1,x+1,y+1,A);line(x-1,y+2,x+1,y+2,D);put(x-1,y+1,E);};
      if(slot===0){
        // Narrow neck and broad stoppered flask, liquid and two separating resin drops.
        const lift=f<2?2-f:0;
        line(12,5+lift,19,5+lift,B);line(13,6+lift,18,6+lift,D);
        line(14,7+lift,14,11+lift,E);line(17,7+lift,17,11+lift,B);
        line(14,11+lift,9,16+lift,E);line(17,11+lift,22,16+lift,B);
        line(9,16+lift,9,23+lift,E);line(22,16+lift,22,23+lift,B);
        line(10,24+lift,21,24+lift,B);line(12,13+lift,11,16+lift,C);
        for(let y=19;y<24;y++)line(10,y+lift,21,y+lift,y===19?A:D);
        put(12,20+lift,E);if(f>=2){drop(5,17+(f-2));drop(26,13+(f-2));}
      }else if(slot===1){
        // Three irregular salt grains, with facets; no snowflake or circular ice nova.
        const gap=f<2?2-f:0;
        for(const [cx,cy,h,w]of [[9-gap,20,5,3],[17,13,8,4],[25+gap,22,4,2]]){
          for(let y=-h;y<=h;y++){const ww=Math.max(0,Math.round(w*(1-Math.abs(y)/h)));line(cx-ww,cy+y,cx+ww,cy+y,y<0?B:E);}
          line(cx,cy-h,cx-w,cy,C);line(cx,cy-h,cx,cy+h,B);
        }
        if(f>=2){put(6,8+f,B);put(25,8+f,E);put(19,25,B);}
      }else{
        // Round retort, angled neck, descending condensate. No persistent shield claim.
        const lift=f<2?2-f:0;
        line(11,8+lift,16,8+lift,B);line(10,9+lift,8,12+lift,E);
        line(8,12+lift,8,19+lift,E);line(8,19+lift,11,22+lift,B);
        line(11,22+lift,17,22+lift,B);line(17,22+lift,20,19+lift,B);
        line(20,19+lift,20,13+lift,B);line(17,9+lift,20,12+lift,B);
        line(16,8+lift,23,5+lift,B);line(18,11+lift,24,8+lift,E);
        line(23,5+lift,27,10+lift,B);line(24,8+lift,27,12+lift,C);
        for(let y=17;y<21;y++)line(10,y+lift,18,y+lift,y===17?A:D);
        line(10,12+lift,10,15+lift,C);if(f>=2)drop(26,16+Math.min(5,f*2-4));
      }
      g.fillStyle=O;for(const {x,y}of pixels.values())for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])g.fillRect(f*32+x+dx,slot*32+y+dy,1,1);
      for(const {x,y,c}of pixels.values()){g.fillStyle=c;g.fillRect(f*32+x,slot*32+y,1,1);}
    }
    morwenSignatureAtlas=cv;
  }
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=Math.min(1,(1-q)*3)*.85;
  ctx.drawImage(morwenSignatureAtlas,frame*32,s.slot*32,32,32,Math.round(s.x)-16,Math.round(s.y)-112,32,32);
  ctx.restore();
}

function drawChampionSignatures(){
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.lineJoin='round';ctx.lineCap='round';
  for(const s of championSignatures){
    if(!s.on||!inView(s.x,s.y,s.radius?s.radius+40:140))continue;
    if(s.key==='__cone'){
      const q=s.t/s.dur;
      ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.angle);ctx.globalAlpha=(1-q)*.85;
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,s.radius,-s.arc,s.arc);ctx.closePath();
      const spores=s.style==='morveth_spores';
      ctx.strokeStyle='#141c2c';ctx.lineWidth=spores?3:7;ctx.stroke();ctx.strokeStyle=s.color;ctx.lineWidth=spores?1:3;ctx.stroke();
      for(let i=-2;!spores&&i<=2;i++){
        const a=i*s.arc/3;
        ctx.beginPath();ctx.moveTo(Math.cos(a)*s.radius*.2,Math.sin(a)*s.radius*.2);
        ctx.lineTo(Math.cos(a)*s.radius*.85,Math.sin(a)*s.radius*.85);
        ctx.strokeStyle=s.color;ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle='#fff9e8';ctx.lineWidth=1;ctx.stroke();
      }
      ctx.restore();continue;
    }
    if(s.key==='__frost'){
      const q=s.t/s.dur,r=s.radius;ctx.save();ctx.translate(s.x,s.y);ctx.globalAlpha=(1-q)*.9;
      ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);
      for(let i=0;i<6;i++){const a=i*Math.PI/3,dx=Math.cos(a),dy=Math.sin(a);ctx.moveTo(dx*r*.18,dy*r*.18);ctx.lineTo(dx*r*.9,dy*r*.9);for(const side of [-1,1]){ctx.moveTo(dx*r*.65,dy*r*.65);ctx.lineTo(dx*r*.48-dy*r*.16*side,dy*r*.48+dx*r*.16*side);}}
      ctx.strokeStyle='#152b45';ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle='#86d9ff';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#efffff';ctx.lineWidth=1;ctx.stroke();ctx.restore();continue;
    }
    if(s.key==='brakk'&&!s.ult&&Number.isInteger(s.slot)&&s.slot>=0&&s.slot<=1){drawBrakkNormalSignature(s);continue;}
    if(s.key==='maura'&&!s.ult&&Number.isInteger(s.slot)&&s.slot>=0&&s.slot<=2){drawMauraNormalSignature(s);continue;}
    if(s.key==='morwen'&&!s.ult&&Number.isInteger(s.slot)&&s.slot>=0&&s.slot<=2){drawMorwenNormalSignature(s);continue;}
    const [shape,color]=CHAMPION_SIGNATURES[s.key]||['star','#e6d6ff'];
    const q=s.t/s.dur,calm=typeof JUICE!=='undefined'&&JUICE.reduceMotion;
    const r=(s.ult?48:25)*(calm?1:0.8+0.2*Math.min(1,q*5));
    ctx.save();ctx.translate(s.x,s.y-(s.ult?84:62));
    ctx.globalAlpha=Math.min(1,(1-q)*3)*(s.ult?0.95:0.85);
    // A small airborne crest identifies the caster; it never pretends to be a damage radius.
    const path=()=>{
      ctx.beginPath();
      if(shape==='shield'){ctx.moveTo(-r*.7,-r*.7);ctx.lineTo(r*.7,-r*.7);ctx.lineTo(r*.6,r*.3);ctx.lineTo(0,r);ctx.lineTo(-r*.6,r*.3);ctx.closePath();}
      else if(shape==='triangle'){for(let i=0;i<3;i++){const a=-Math.PI/2+i*Math.PI*2/3;ctx[i?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();}
      else if(shape==='eye'){ctx.ellipse(0,0,r,r*.5,0,0,Math.PI*2);ctx.moveTo(r*.25,0);ctx.arc(0,0,r*.25,0,Math.PI*2);}
      else if(shape==='drops'){for(let i=-1;i<=1;i++){const x=i*r*.65,y=Math.abs(i)*r*.3;ctx.moveTo(x,y-r*.65);ctx.quadraticCurveTo(x+r*.5,y+r*.3,x,y+r*.5);ctx.quadraticCurveTo(x-r*.5,y+r*.3,x,y-r*.65);}}
      else if(shape==='chain'){for(let i=-1;i<=1;i++){ctx.moveTo(i*r*.65+r*.38,0);ctx.ellipse(i*r*.65,0,r*.38,r*.6,i*.35,0,Math.PI*2);}}
      else if(shape==='glitch'){for(let i=0;i<3;i++)ctx.rect(-r+i*r*.2,-r+i*r*.65,r*1.5,r*.35);}
      else if(shape==='blades'||shape==='arrows'){for(let i=-1;i<=1;i+=2){ctx.moveTo(i*r*.85,r*.8);ctx.lineTo(-i*r*.8,-r*.8);ctx.lineTo(-i*r*.25,-r*.7);}}
      else if(shape==='scythe'){ctx.moveTo(-r*.5,r);ctx.lineTo(r*.25,-r);ctx.quadraticCurveTo(r*1.4,-r*.7,r*.75,r*.6);ctx.quadraticCurveTo(r*.65,-r*.3,r*.25,-r*.6);}
      else if(shape==='wings'){for(let i of [-1,1]){ctx.moveTo(0,r*.5);ctx.quadraticCurveTo(i*r*1.2,r*.1,i*r,-r*.8);ctx.lineTo(i*r*.35,-r*.1);}ctx.moveTo(-r*.2,0);ctx.lineTo(r*.2,0);ctx.moveTo(0,-r*.25);ctx.lineTo(0,r*.5);}
      else if(shape==='skull'){ctx.arc(0,-r*.2,r*.65,Math.PI*.15,Math.PI*2.85);ctx.lineTo(-r*.35,r*.8);ctx.lineTo(r*.35,r*.8);ctx.closePath();ctx.moveTo(-r*.35,-r*.15);ctx.lineTo(-r*.1,0);ctx.moveTo(r*.35,-r*.15);ctx.lineTo(r*.1,0);}
      else {const n=shape==='gear'?24:shape==='sun'?16:8;for(let i=0;i<n;i++){const a=i*Math.PI*2/n-Math.PI/2,rr=r*(i%2?.55:1);ctx[i?'lineTo':'moveTo'](Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();}
    };
    path();ctx.strokeStyle='#171322';ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#fff5e9';ctx.lineWidth=1;ctx.stroke();
    // Three pips distinguish normal skill slots; an ultimate has a crown of five rays.
    ctx.strokeStyle=color;ctx.lineWidth=3;
    if(s.ult){for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*12,-r-9);ctx.lineTo(i*15,-r-19+Math.abs(i)*3);ctx.stroke();}}
    else for(let i=0;i<=Math.min(2,s.slot||0);i++)ctx.fillStyle=color,ctx.fillRect((i-(s.slot||0)/2)*8-2,r+9,4,4);
    ctx.restore();
  }ctx.restore();
}
// Frost nova's true circular footprint: six crystalline rays, readable at talent zero.
function vfxFrostCrown(x,y,r){
  if(!Number.isFinite(r)||r<=0||!inView(x,y,r+40))return;
  const s=championSignatures.find(s=>!s.on);
  if(s)Object.assign(s,{on:true,x,y,key:'__frost',radius:r,ult:false,t:0,dur:650});
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    vfxSprite('fxIceCrystal',0,x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8,42,650,null,.18,false,.8);
  }
}
function vfxSkillCone(x,y,r,angle,arc,color,style){
  if(!Number.isFinite(r)||r<=0||!inView(x,y,r+40))return;
  const s=championSignatures.find(s=>!s.on);
  if(s)Object.assign(s,{on:true,x,y,key:'__cone',radius:r,angle,arc,color,style:style==='morveth_spores'?style:null,ult:false,t:0,dur:420});
}
