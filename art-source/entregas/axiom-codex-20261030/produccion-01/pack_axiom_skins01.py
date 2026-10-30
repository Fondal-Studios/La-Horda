#!/usr/bin/env python3
from PIL import Image, ImageDraw
import numpy as np, json, hashlib
from scipy import ndimage
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ROW_BOUNDS = [0,143,286,434,583,720,866,1013,1163,1330]
COL_BOUNDS = [0,394,590,789,1182]
SOURCES = {
  'sistema': 'axiom-sistema-source-attempt01.png',
  'axiom_piedra': 'axiom-ambar-source-attempt01.png',
}

def pack(skin, source_name):
  src = Image.open(ROOT/'source'/source_name).convert('RGBA')
  if src.size != (1182,1330): raise SystemExit(f'{skin}: unexpected source size {src.size}')
  raw=[]
  for r in range(9):
    for c in range(4):
      im=src.crop((COL_BOUNDS[c],ROW_BOUNDS[r],COL_BOUNDS[c+1],ROW_BOUNDS[r+1]))
      a=np.array(im)
      mask=a[:,:,3]>=128
      labels,n=ndimage.label(mask,structure=np.ones((3,3)))
      total=max(1,int(mask.sum()))
      for lab,sl in enumerate(ndimage.find_objects(labels),1):
        if sl is None: continue
        ys0,xs0=sl; area=int((labels[sl]==lab).sum())
        if ys0.stop <= round(im.height*.18) and area < total*.15:
          mask[labels==lab]=False
      ys,xs=np.where(mask)
      if not len(xs): raise SystemExit(f'{skin}: empty {r},{c}')
      a[:,:,3]=np.where(mask,a[:,:,3],0)
      box=(max(0,int(xs.min())-2),max(0,int(ys.min())-2),min(im.width,int(xs.max())+3),min(im.height,int(ys.max())+3))
      raw.append(Image.fromarray(a).crop(box))
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
    atlas.alpha_composite(im,((i%4)*112+x,(i//4)*112+y))
    frames.append({'frame':i,'sourceBox':[raw[i].width,raw[i].height],'packed':[nw,nh],'scale':scale,'x':x,'y':y,'pixels':int((p[:,:,3]>0).sum())})
  out=ROOT/'candidate'/skin; out.mkdir(parents=True,exist_ok=True)
  atlas.save(out/'atlas.png')
  contact=Image.new('RGB',(560,1260),(26,24,31)); d=ImageDraw.Draw(contact)
  for i in range(36):
    cell=atlas.crop(((i%4)*112,(i//4)*112,(i%4+1)*112,(i//4+1)*112)).resize((140,140),Image.Resampling.NEAREST)
    contact.paste(cell,((i%4)*140,(i//4)*140),cell)
    d.text(((i%4)*140+3,(i//4)*140+3),str(i),fill=(220,220,220))
  contact.save(out/'contact.png')
  report={'status':'GENERATED_NOT_APPROVED','skin':skin,'source':f'source/{source_name}','sourceSize':list(src.size),'rowBounds':ROW_BOUNDS,'colBounds':COL_BOUNDS,'baseScale':base_scale,'frames':frames}
  (out/'pack-report.json').write_text(json.dumps(report,indent=2)+'\n')
  for name in ['atlas.png','contact.png','pack-report.json']:
    b=(out/name).read_bytes(); print(skin,name,len(b),hashlib.sha256(b).hexdigest())

for skin,source in SOURCES.items(): pack(skin,source)
