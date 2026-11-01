#!/usr/bin/env python3
from PIL import Image
import numpy as np, json, hashlib
from scipy import ndimage
from pathlib import Path
ROOT=Path(__file__).resolve().parent
src=Image.open(ROOT/'source/axiom-36-source.png').convert('RGBA')
W,H=src.size
row_bounds=[round(i*H/9) for i in range(10)]
col_bounds=[round(i*W/4) for i in range(5)]
raw=[]
for r in range(9):
  for c in range(4):
    im=src.crop((col_bounds[c],row_bounds[r],col_bounds[c+1],row_bounds[r+1]))
    a=np.array(im)
    mask=a[:,:,3]>=128
    labels,n=ndimage.label(mask,structure=np.ones((3,3)))
    total=max(1,int(mask.sum()))
    for lab,sl in enumerate(ndimage.find_objects(labels),1):
      if sl is None: continue
      ys0,xs0=sl; area=int((labels[sl]==lab).sum())
      # Image generation can bleed a thin fragment from the previous row into
      # the next cell. Remove only disconnected fragments wholly inside the
      # top 18% and smaller than 15% of the current cell's authored ink.
      if ys0.stop <= round(im.height*.18) and area < total*.15:
        mask[labels==lab]=False
    ys,xs=np.where(mask)
    a[:,:,3]=np.where(mask,a[:,:,3],0)
    if not len(xs): raise SystemExit(f'empty {r},{c}')
    # keep the authored cell content together, including detached orbit/particles
    box=(max(0,xs.min()-2),max(0,ys.min()-2),min(im.width,xs.max()+3),min(im.height,ys.max()+3))
    raw.append(im.crop(box))
move_h=np.median([f.height for f in raw[:12]])
base_scale=86/move_h
atlas=Image.new('RGBA',(448,1008))
frames=[]
for i,im in enumerate(raw):
  scale=base_scale
  if im.width*scale>108 or im.height*scale>108:
    scale=min(scale,108/im.width,108/im.height)
  nw=max(1,round(im.width*scale)); nh=max(1,round(im.height*scale))
  im=im.resize((nw,nh),Image.Resampling.NEAREST)
  p=np.array(im)
  p[:,:,3]=np.where(p[:,:,3]>=128,255,0).astype(np.uint8)
  p[p[:,:,3]==0]=0
  im=Image.fromarray(p)
  x=(112-nw)//2; y=106-(nh-1)
  if i>=32: y=106-(nh-1)
  atlas.alpha_composite(im,((i%4)*112+x,(i//4)*112+y))
  frames.append({'frame':i,'row':i//4,'col':i%4,'sourceBox':[raw[i].width,raw[i].height],'packed':[nw,nh],'scale':scale,'x':x,'y':y,'pixels':int((p[:,:,3]>0).sum())})
out=ROOT/'candidate'; out.mkdir(exist_ok=True)
atlas.save(out/'atlas.png')
atlas.crop((0,0,112,112)).save(out/'preview.png')
report={'status':'GENERATED_NOT_APPROVED','sourceSize':[W,H],'rowBounds':row_bounds,'colBounds':col_bounds,'baseScale':base_scale,'frames':frames}
(out/'pack-report.json').write_text(json.dumps(report,indent=2)+'\n')
for name in ['atlas.png','preview.png','pack-report.json']:
 b=(out/name).read_bytes(); print(name,len(b),hashlib.sha256(b).hexdigest())
