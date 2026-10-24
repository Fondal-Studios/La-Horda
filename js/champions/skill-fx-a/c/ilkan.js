'use strict';
/* ---- Ilkan: caminante de dunas (arena, pendones) ---- */
SFA_BIND.ilkan = {themes: ['sand'],
  0: c => { const L = ILKAN_CFG.hook.dashDist || 330; sfaP('beam', 'sand', c.h.x, c.h.y, 0, {bx: c.h.x + c.dir.x * L, by: c.h.y + c.dir.y * L, w: 40, dur: 600}); },
  1: sfaAura('sand'),
  2: sfaMulti(c => sfaP('nova', 'sand', c.h.x, c.h.y, ILKAN_CFG.advance.allyRadius || 220, {dur: 800}), sfaAura('sand', {allies: true, r: ILKAN_CFG.advance.allyRadius || 220, test: a => a.advAllyTimer > 0})),
  ult: c => sfaP('nova', 'sand', c.h.x, c.h.y, 230, {dur: 1000})
};


// B145/B146: native cached VFX; existing combat timers are the only source of visibility.
// No RNG, emitter suppression, protocol fields or gameplay updates.
const ILKAN_BUFF_SIGNS = Object.create(null);
function ilkanBuffSignAtlas(kind){
  if(kind !== 'dune' && kind !== 'caravan') return null;
  if(ILKAN_BUFF_SIGNS[kind]) return ILKAN_BUFF_SIGNS[kind];
  const canvas=document.createElement('canvas'); canvas.width=64*12; canvas.height=72;
  const g=canvas.getContext('2d'); if(!g) return null;
  const pal={edge:'#293136',rock:'#92703d',sand:'#d9b567',light:'#fff0c0',teal:'#217f7a',shine:'#64daca'};
  const poly=(pts,col)=>{g.fillStyle=col;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
  for(let f=0;f<12;f++){
    g.save();g.translate(f*64,0);
    if(kind==='dune'){
      // Four separated lamellar sand plates; open torso and feet.
      const bob=Math.round(Math.sin(f*Math.PI/6)*2);
      for(const side of [-1,1]) for(let tier=0;tier<2;tier++){
        const x=32+side*(21+tier), y=22+tier*19+bob*(tier?1:-1);
        poly([[x-7,y-7],[x+5,y-9],[x+8,y+3],[x+2,y+9],[x-6,y+6]],pal.edge);
        poly([[x-5,y-5],[x+3,y-7],[x+6,y+2],[x+1,y+6],[x-4,y+4]],pal.rock);
        poly([[x-4,y-5],[x+3,y-7],[x+4,y-2],[x-4,y+1]],pal.sand);
        g.fillStyle=pal.light;g.fillRect(x-3,y-4,4,1);
        g.fillStyle=pal.teal;g.fillRect(x-1,y+1,2,4);
      }
      for(let n=0;n<6;n++){
        const x=n%2?58:5, y=14+((n*9+f*3)%46);
        g.fillStyle=n%3?pal.sand:pal.shine;g.fillRect(x,y,2,2);
      }
    }else{
      // Paired forked pennants: a caravan marker distinct from an armor ring.
      const flutter=Math.round(Math.sin(f*Math.PI/6)*2);
      for(const side of [-1,1]){
        const x=32+side*16, y=12;
        g.fillStyle=pal.edge;g.fillRect(x-1,y-2,3,42);
        g.fillStyle=pal.sand;g.fillRect(x,y,1,38);
        poly([[x+side*2,y+1],[x+side*14,y+4+flutter],[x+side*10,y+12+flutter],[x+side*14,y+20+flutter],[x+side*2,y+17]],pal.edge);
        poly([[x+side*3,y+3],[x+side*12,y+5+flutter],[x+side*8,y+12+flutter],[x+side*11,y+17+flutter],[x+side*3,y+15]],pal.teal);
        g.fillStyle=pal.light;g.fillRect(x-1,y-3,3,2);
        g.fillStyle=pal.shine;g.fillRect(x+side*5-1,y+7+flutter,2,5);
      }
      for(let n=0;n<4;n++){
        const x=17+n*10,y=60+Math.round(Math.sin((f+n)*Math.PI/6)*2);
        g.fillStyle=pal.edge;g.fillRect(x-1,y-1,5,3);
        g.fillStyle=pal.sand;g.fillRect(x,y,3,1);
      }
    }
    g.restore();
  }
  // Integer polygon edges still rasterize diagonals with partial coverage; threshold is
  // the native code rasterizer, not a conversion of an imported illustration.
  const pixels=g.getImageData(0,0,canvas.width,canvas.height);
  for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>=128?255:0;
  g.putImageData(pixels,0,0);
  return ILKAN_BUFF_SIGNS[kind]=canvas;
}
function ilkanDrawBuffSigns(h){
  if(!h?.alive || h.ilkanColossus || !inView(h.x,h.y,90)) return;
  const draw=(kind,remaining)=>{
    if(!(remaining>0)) return;
    const atlas=ilkanBuffSignAtlas(kind);if(!atlas)return;
    const frame=Math.floor(remaining/100)%12;
    ctx.save();ctx.imageSmoothingEnabled=false;
    ctx.globalAlpha=Math.min(1,remaining/200);
    ctx.drawImage(atlas,frame*64,0,64,72,Math.round(h.x)-32,Math.round(h.y)-64,64,72);
    ctx.restore();
  };
  if(h.classKey==='ilkan')draw('dune',h.ilkanInstinctTimer);
  draw('caravan',Math.max(h.classKey==='ilkan'?(h.ilkanAdvanceTimer||0):0,h.advAllyTimer||0));
}
