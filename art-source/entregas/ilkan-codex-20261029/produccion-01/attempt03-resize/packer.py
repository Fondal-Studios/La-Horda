"""Deterministic packing of preserved authored sources, not procedural drawing or art approval."""
from pathlib import Path
import json,hashlib
import numpy as np
from scipy import ndimage
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art-source/entregas/ilkan-codex-20261029/produccion-01'
W,H,FOOT,COLS=192,144,134,8
atlas=Image.new('RGBA',(W*COLS,H*8)); records=[]; diagnostics=[]
for source,ref in [('source-locomotion.png',204),('source-actions.png',204)]:
 im=np.array(Image.open(OUT/source).convert('RGBA'));a=im[:,:,3];labels,n=ndimage.label(a>127,np.ones((3,3)));sizes=np.bincount(labels.ravel());parts=[]
 for i,sl in enumerate(ndimage.find_objects(labels),1):
  if sizes[i]>=500:
   y,x=sl;parts.append((x.start,y.start,x.stop,y.stop,i,sl))
 parts.sort(key=lambda b:b[3]);assert len(parts)==32,(source,len(parts))
 diagnostics.append({'source':source,'sha256':hashlib.sha256((OUT/source).read_bytes()).hexdigest(),'size':[im.shape[1],im.shape[0]],'partialAlpha':int(((a>0)&(a<255)).sum()),'components':len(parts),'excludedSmallComponentPixels':int(sum(s for s in sizes[1:] if s<500))})
 contact=Image.new('RGBA',(W*4,H*8))
 for row in range(8):
  for col,part in enumerate(sorted(parts[row*4:row*4+4],key=lambda b:b[0])):
   x0,y0,x1,y1,label,sl=part;cut=im[sl].copy();mask=labels[sl]==label;cut[:,:,3]=np.where(mask,255,0);cut[~mask]=0
   factor=(.9564/.8429 if source=='source-locomotion.png' and row in [2,3,6,7] else 1.0149/.8429)
   crop=Image.fromarray(cut).resize((round((x1-x0)*84/ref*factor),round((y1-y0)*84/ref*factor)),Image.Resampling.NEAREST)
   aa=np.array(crop)[:,:,3]>0;anchor=float(np.median(np.where(aa[-8:])[1]))+.5
   if source=='source-actions.png' and ((row==1 and col==3) or row==4 or (row==3 and col==3)):anchor=crop.width/2
   dx=round(W/2-anchor);dy=FOOT-crop.height;assert min(dx,dy,W-dx-crop.width,H-dy-crop.height)>=4,(source,row,col)
   tile=Image.new('RGBA',(W,H));tile.paste(crop,(dx,dy));idx=len(records);atlas.paste(tile,((idx%COLS)*W,(idx//COLS)*H));contact.paste(tile,(col*W,row*H))
   records.append({'index':idx,'source':source,'sourceRow':row,'sourceColumn':col,'rect':[x0,y0,x1,y1],'scale':84/ref*factor,'bbox':tile.getbbox(),'rgbaSha256':hashlib.sha256(tile.tobytes()).hexdigest(),'approved':False})
 contact.save(OUT/source.replace('source-','candidate-'))
sets={}
for row,name in enumerate(['idle_down','walk_down','idle_side','walk_side','idle_up','walk_up','idle_left','walk_left']):sets[name]=list(range(row*4,row*4+4))
sets.update(attack_side=list(range(32,36)),hit_down=[36,37],death_down=[38,39],exhausted=list(range(40,44)),lance_prep=[44,45],lance_launch=[47],lance_fly=[48,49,50],lance_land=[51],lance_slash=[33,34],instinct=list(range(52,56)),advance=list(range(56,60)),invoke=list(range(60,64)),cast_side=[44,45,46],aim=[44,45],run=list(range(12,16)))
# Source pose50 failed canonical native material. Preserve original; use the two authored flight poses48/49.
oldatlas=atlas; atlas=Image.new('RGBA',oldatlas.size); kept=[]; remap={}
for rec in records:
 if rec['index']==50: continue
 old=rec['index']; new=len(kept); remap[old]=new;rec['sourceIndex']=old;rec['index']=new;kept.append(rec)
 atlas.paste(oldatlas.crop(((old%COLS)*W,(old//COLS)*H,(old%COLS+1)*W,(old//COLS+1)*H)),((new%COLS)*W,(new//COLS)*H))
records=kept;sets={k:[remap[i] for i in v if i in remap] for k,v in sets.items()}
meta={'frameCount':len(records),'w':W,'h':H,'cols':COLS,'refH':84,'anchor':FOOT/H,'sets':sets}
atlas.save(OUT/'candidate-atlas.png')
(OUT/'candidate-meta.json').write_text(json.dumps(meta,indent=2)+'\n');(OUT/'FRAME_INDEX.json').write_text(json.dumps(records,indent=2)+'\n')
(OUT/'EXTRACTION.json').write_text(json.dumps({'sources':diagnostics,'frames':len(records),'uniqueRGBA':len(set(r['rgbaSha256'] for r in records)),'binaryAlpha':set(atlas.getchannel('A').getdata())<={0,255},'paddingAtLeast4':True,'approved':False,'note':'32 locomotion +32 actions. Run reuses authored walk cycle with existing runtime cadence; slash reuses attack2/3. No invented source poses. Original images untouched.'},indent=2)+'\n')
print('Packed',len(records),'unique',len(set(r['rgbaSha256'] for r in records)))
