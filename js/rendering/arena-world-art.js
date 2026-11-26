"use strict";
// Arena art is presentation only. Geometry, event clocks and host authority remain
// in their existing modules. Load only the active biome; retain the old renderer
// until decoding succeeds, including offline / missing-file cases.
const ARENA_WORLD_PACKS = {};
function arenaWorldPack(arena){
  const m = ARENA_WORLD_MANIFEST[arena];
  if(!m) return null;
  if(!ARENA_WORLD_PACKS[arena]){
    const p = ARENA_WORLD_PACKS[arena] = {img:new Image(), ready:false, failed:false};
    p.img.onload = ()=>{ p.ready = p.img.naturalWidth>0; };
    p.img.onerror = ()=>{ p.failed = true; p.ready = false; };
    p.img.src = m.src;
  }
  return ARENA_WORLD_PACKS[arena];
}
function arenaWorldReady(arena){ const p = arenaWorldPack(arena); return !!(p && p.ready); }
function arenaWorldDraw(arena,key,x,y,height,opts){
  const p = arenaWorldPack(arena), m = ARENA_WORLD_MANIFEST[arena];
  const f = m && m.frames[key];
  if(!p || !p.ready || !f) return false;
  opts = opts || {};
  const h = height, w = h*f.w/f.h;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha *= opts.alpha==null ? 1 : opts.alpha;
  ctx.translate(Math.round(x),Math.round(y));
  if(opts.flip) ctx.scale(-1,1);
  ctx.drawImage(p.img,f.x,f.y,f.w,f.h,Math.round(-w/2),Math.round(-h*f.foot),w,h);
  ctx.restore();
  return true;
}
function arenaWorldRuneFrame(r,now){
  if(!r) return 'ctrl';
  if(r.st==='finale') return 'pulse'+(Math.floor(now*7)%3);
  if(r.st==='active') return ['active','pulse0','pulse1','pulse2'][Math.floor(now*5)%4];
  return ['ctrl','arming','corrupt','sealed'].includes(r.st) ? r.st : 'ctrl';
}
function arenaWorldBrazierFrame(b,now){
  if(!b.lit) return b.prog>0 ? (b.prog/Math.max(1,b.dur||1400)<0.6 ? 'ignite0' : 'ignite1') : 'off';
  return b.fuel<8000 ? (Math.floor(now*5)%2 ? 'low' : 'ignite0') : 'fire'+(Math.floor(now*7+b.x*0.01)%4+4)%4;
}
function arenaWorldAnakinFrame(key,p,now){
  const n=Number(key.replace(/^\D+/,''))||0, alt=((p.x>0)!==(p.y>0))?1:0;
  if(currentArena==='infernal'){
    if(key.startsWith('infColumn')) return 'columna'+(n%4);
    if(key==='infAltar') return 'altar';
    if(key==='infStatue') return 'estatua';
    if(key==='infBrazier') return 'brasero'+((Math.floor(now*7+p.x*0.01)%4+4)%4);
  } else if(currentArena==='laberinto'){
    if(key==='obelisk') return 'obelisco'+alt;
  } else if(currentArena==='acuatica'){
    if(key.startsWith('sunkColumn')) return 'columna'+(n%4);
    if(key==='tomb') return 'tumba';
    if(key.startsWith('coral')) return 'coral'+(n%4);
    if(key==='shipwreck') return 'naufragio';
  }
  return null;
}
function arenaWorldDrawProp(p,now){
  const key = p.img && p.img._arenaArtKey;
  if(!key) return false;
  let frame=null, height=p.h;
  if(currentArena==='hielo'){
    if(key.startsWith('icePillar')) frame=Number(key.slice(9))%2 ? 'shards' : 'pillar';
    else if(key.startsWith('iceCluster')) frame=Number(key.slice(10))%2 ? 'rock' : 'cluster';
    else if(key==='iceStatue') frame='statue';
    else if(key==='iceArch') frame='gate';
  } else if(currentArena==='bosque'){
    if(key.startsWith('menhir')){
      const r = typeof BOS!=='undefined' && BOS.runes.find(r=>Math.hypot(r.mx-p.x,r.my-p.y)<2);
      frame=arenaWorldRuneFrame(r,now);
    } else if(key.startsWith('ancientTree')) frame=['oak','magic','ancient'][Number(key.slice(11))%3];
    else if(key.startsWith('bsvBoulder')) frame='rock';
    else if(key.startsWith('bsvThicket')) frame='bush0';
  } else if(ARENA_WORLD_MANIFEST[currentArena]){
    // Infernal / Laberinto / Acuatica: props redrawn by Anakin (art-source/arenas/anakin-20261125).
    frame=arenaWorldAnakinFrame(key,p,now);
    if(frame && !ARENA_WORLD_MANIFEST[currentArena].frames[frame]) frame=null;
  }
  if(!frame) return false;
  const f=ARENA_WORLD_MANIFEST[currentArena].frames[frame];
  // Retain the existing footprint envelope and aspect ratio. Tree canopies may
  // overhang; they fade when a living hero stands behind them.
  const tree=key.startsWith('ancientTree');
  // Anakin's props carry a wider rubble/plinth base than the slim procedural
  // shapes; allow a wider envelope so landmarks (obelisks, columns) keep their height.
  const wide=currentArena!=='hielo' && currentArena!=='bosque';
  height=Math.min(height,p.w*(tree?1.2:wide?2.4:1.35)*f.h/f.w);
  let alpha=p.alpha==null?1:p.alpha;
  if(height>110 && heroes.some(h=>h.alive && Math.abs(h.x-p.x)<height*f.w/f.h*.45 && h.y<p.y && h.y>p.y-height*.9)) alpha*=.38;
  return arenaWorldDraw(currentArena,frame,p.x,p.y,height,{flip:p.flip,alpha});
}
