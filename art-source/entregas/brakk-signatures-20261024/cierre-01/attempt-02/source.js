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
// Normal Brakk casts: assembled masonry, nail turret and riveted cross-brace.
// Pixel-native airborne identifiers; they do not describe a damage footprint.
// Keep the existing event key/slot/lifetime and the ultimate's original renderer.
let brakkSignatureAtlas=null;
function drawBrakkNormalSignature(s){
  const q=s.t/s.dur,calm=typeof JUICE!=='undefined'&&JUICE.reduceMotion;
  const gap=calm?0:Math.round(3*(1-Math.min(1,q*5)));
  if(!brakkSignatureAtlas){
    const cv=document.createElement('canvas');cv.width=192;cv.height=120;
    const real=ctx;ctx=cv.getContext('2d');
    try{for(let slot=0;slot<3;slot++)for(let g=0;g<4;g++){
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
    ctx.fillStyle=color;ctx.fillRect(x,y,w,h);
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
  }else{
    // Riveted X braces: stepped diagonals, central bolt, no generic shield.
    for(let i=-3;i<=3;i++){
      plate(i*3,-i*3,4,4,'#99835c');
    }
    for(let i=-3;i<=3;i++)plate(i*3,i*3,4,4,'#ddc88d');
    plate(-2-gap,-2,7,7,'#a6b6bd');
    ctx.fillStyle='#f4e5ba';ctx.fillRect(0-gap,0,3,3);
    ctx.fillRect(-9,-9,2,2);ctx.fillRect(10,-9,2,2);ctx.fillRect(-9,10,2,2);ctx.fillRect(10,10,2,2);
  }
}
function drawChampionSignatures(){
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.lineJoin='round';ctx.lineCap='round';
  for(const s of championSignatures){
    if(!s.on||!inView(s.x,s.y,s.radius?s.radius+40:140))continue;
    if(s.key==='__cone'){
      const q=s.t/s.dur;
      ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.angle);ctx.globalAlpha=(1-q)*.85;
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,s.radius,-s.arc,s.arc);ctx.closePath();
      ctx.strokeStyle='#141c2c';ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle=s.color;ctx.lineWidth=3;ctx.stroke();
      for(let i=-2;i<=2;i++){
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
    if(s.key==='brakk'&&!s.ult&&Number.isInteger(s.slot)&&s.slot>=0&&s.slot<=2){drawBrakkNormalSignature(s);continue;}
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
function vfxSkillCone(x,y,r,angle,arc,color){
  if(!Number.isFinite(r)||r<=0||!inView(x,y,r+40))return;
  const s=championSignatures.find(s=>!s.on);
  if(s)Object.assign(s,{on:true,x,y,key:'__cone',radius:r,angle,arc,color,ult:false,t:0,dur:420});
}
