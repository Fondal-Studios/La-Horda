'use strict';
/* Convierte un atlas del cargador antiguo (tabla de rectángulos + pivotes + clips) al formato estándar de CHAMP_PACK:
 * celdas uniformes, pies en la misma línea (anchor), sets idle/walk/attack/cast/hit/death por dirección. No toca el arte:
 * recorta los mismos píxeles del original y los coloca en celdas. Uso: node legacy-to-pack.js CLASE OUT_DIR
 * Los datos del atlas viejo se leen de js/rendering/champion-sprites.js (fuente única; no se duplican a mano). */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const [cls,outDir]=process.argv.slice(2),ROOT=path.resolve(__dirname,'../../..');
const src=fs.readFileSync(path.join(ROOT,'js/rendering/champion-sprites.js'),'utf8').split('\n');
const NAME={tanque:'TANQUE_ATLAS',guerrero:'GUERRERO_ATLAS',mago:'MAGO_ATLAS'}[cls];
const line=src.find(l=>l.startsWith('const '+NAME+' '));if(!line)throw new Error('sin definición '+NAME);
const L=JSON.parse(line.slice(line.indexOf('=')+1).trim().replace(/;$/,''));
const IMG={tanque:'assets/sprites/champions/tanque/atlas.png',guerrero:'assets/sprites/champions/guerrero/atlas.png',mago:'assets/sprites/champions/mago/atlas.png'}[cls];
const SC=Math.min(1,(+process.env.BODY_PX||110)/L.referenceHeight);   // el juego dibuja ~66 px de alto: 110 px de cuerpo da margen sin gastar memoria móvil
const Sx=v=>Math.round(v*SC);
const maxL=Math.max(...L.frames.map(f=>Sx(f.pivotX))),maxR=Math.max(...L.frames.map(f=>Sx(f.w)-Sx(f.pivotX))),maxH=Math.max(...L.frames.map(f=>Sx(f.h)));
const W=2*Math.max(maxL,maxR)+4,H=maxH+8,COLS=8,rows=Math.ceil(L.frames.length/COLS);
fs.mkdirSync(outDir,{recursive:true});
const spec={SC,img:path.join(ROOT,IMG),frames:L.frames,W,H,COLS,rows,out:path.join(outDir,'atlas.png')};
fs.writeFileSync(path.join(outDir,'spec.json'),JSON.stringify(spec));
cp.execFileSync('python3',['-c',`
import json,sys
from PIL import Image
s=json.load(open(sys.argv[1]));im=Image.open(s['img']).convert('RGBA');W,H,C=s['W'],s['H'],s['COLS']
out=Image.new('RGBA',(W*C,H*s['rows']))
for i,f in enumerate(s['frames']):
    c=im.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']));k=s['SC']
    nw,nh,px=max(1,round(f['w']*k)),max(1,round(f['h']*k)),round(f['pivotX']*k)
    if k<1:c=c.resize((nw,nh),Image.LANCZOS)
    out.paste(c,((i%C)*W+W//2-px,(i//C)*H+H-4-nh),c)       # pivote en el centro; pies a 4 px del fondo
out.save(s['out'])`,path.join(outDir,'spec.json')]);
// sets estándar a partir de los clips viejos
const A=L.animations,sets={},dirs={down:'down',right:'side',up:'up'},ST={idle:'idle',walk:'walk',attack:'attack',cast:'cast',hurt:'hit',death:'death'};
if(A.idle_down){for(const [n,a] of Object.entries(A)){const m=n.match(/^(\w+)_(down|right|up)$/);if(m&&ST[m[1]])sets[ST[m[1]]+'_'+dirs[m[2]]]=a.frames;}}
else{for(const [n,a] of Object.entries(A))for(const d of ['down','side','up'])if(ST[n])sets[ST[n]+'_'+d]=a.frames;}   // atlas de una sola vista (frente): se reutiliza en las 3 direcciones hasta producir las reales
const meta={w:W,h:H,cols:COLS,refH:Math.round(L.referenceHeight*SC),anchor:+((H-4)/H).toFixed(4),fix:{left:'mirror'},sets,source:'legacy-to-pack',frontOnly:!A.idle_down};
fs.writeFileSync(path.join(outDir,'meta.json'),JSON.stringify(meta));console.log(cls,JSON.stringify(meta).slice(0,400));
