#!/usr/bin/env python3
from pathlib import Path
import hashlib,json
from PIL import Image
ROOT=Path(__file__).resolve().parent;COLS,ROWS,CELL=4,9,112;GROUND_Y,TARGET_H=106,78;MIN_COMPONENT_PIXELS=8
SOURCES={'libertador_escarcha':ROOT/'sources/casaca-andes-36-source-corrected.png','libertador_ancestral':ROOT/'sources/guardia-monte-36-source-corrected.png'}
def chroma(p):
 r,g,b,_=p;return r>=120 and b>=100 and r>=g*1.45 and b>=g*1.45
def key(cell):
 im=cell.convert('RGBA');px=im.load();n=0
 for y in range(im.height):
  for x in range(im.width):
   if chroma(px[x,y]):px[x,y]=(0,0,0,0);n+=1
 return im,n
def prune(im):
 a=im.getchannel('A');px=a.load();seen=set();removed=0
 for y in range(im.height):
  for x in range(im.width):
   if px[x,y]==0 or (x,y) in seen:continue
   st=[(x,y)];seen.add((x,y));comp=[]
   while st:
    q=st.pop();comp.append(q)
    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
     nx,ny=q[0]+dx,q[1]+dy
     if 0<=nx<im.width and 0<=ny<im.height and px[nx,ny]>0 and (nx,ny) not in seen:seen.add((nx,ny));st.append((nx,ny))
   if len(comp)<MIN_COMPONENT_PIXELS:
    for q in comp:im.putpixel(q,(0,0,0,0))
    removed+=len(comp)
 return removed
def build(name,path):
 src=Image.open(path).convert('RGBA');sw,sh=src.size;cw,ch=sw//4,sh//9;frames=[];stats=[]
 for i in range(36):
  x,y=(i%4)*cw,(i//4)*ch;f,n=key(src.crop((x,y,x+cw,y+ch)));box=f.getbbox();frames.append(f.crop(box));stats.append({'index':i,'sourceBox':box,'removedBackground':n})
 scale=min(TARGET_H/max(f.height for f in frames),100/max(f.width for f in frames));atlas=Image.new('RGBA',(448,1008));hashes=[]
 for i,f in enumerate(frames):
  nw,nh=max(1,round(f.width*scale)),max(1,round(f.height*scale));native=f.resize((nw,nh),Image.Resampling.NEAREST);stats[i]['prunedIslandPixels']=prune(native);x=(i%4)*112+(112-nw)//2;y=(i//4)*112+GROUND_Y-nh;atlas.alpha_composite(native,(x,y));hashes.append(hashlib.sha256(native.tobytes()).hexdigest());stats[i]['nativeSize']=[nw,nh]
 out=ROOT/'candidates'/name/'atlas.png';atlas.save(out,optimize=True);alpha=list(atlas.getchannel('A').get_flattened_data());border=sum(atlas.getpixel((x,y))[3]>0 for x in range(atlas.width) for y in (0,atlas.height-1))+sum(atlas.getpixel((x,y))[3]>0 for y in range(atlas.height) for x in (0,atlas.width-1))
 return {'name':name,'source':str(path.relative_to(ROOT)),'sourceSize':[sw,sh],'sourceCell':[cw,ch],'atlas':str(out.relative_to(ROOT)),'atlasSize':list(atlas.size),'scale':scale,'frames':36,'uniqueFrames':len(set(hashes)),'alphaValues':sorted(set(alpha)),'partialAlphaPixels':sum(a not in(0,255) for a in alpha),'borderOpaquePixels':border,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'frameStats':stats}
reports=[build(n,p) for n,p in SOURCES.items()];(ROOT/'TECHNICAL.json').write_text(json.dumps({'status':'PASS_TECHNICAL_SOURCE_ONLY','reports':reports},indent=2)+'\n');print(json.dumps({r['name']:{k:r[k] for k in('frames','uniqueFrames','partialAlphaPixels','borderOpaquePixels','sha256')} for r in reports},indent=2))
