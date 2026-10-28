"""Technical source extraction only. Writes workshop candidates, never installed assets.
No recoloring, chroma-key removal, procedural art or runtime changes. Original files stay intact.
"""
from pathlib import Path
import json, hashlib
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'art-source/entregas/veyra-codex-20261028'
OUT=BASE/'cierre-03'; OUT.mkdir(exist_ok=True)
STATES=['idle','walk','attack','cast','ultimate','hit','death']
W,H,COLS,FOOT=192,144,8,132
sources={}; diagnostics=[]
def read_source(p,states,reference_height):
 rgba=np.array(Image.open(p).convert('RGBA')); a=rgba[:,:,3]
 labels,n=ndimage.label(a>127,np.ones((3,3)))
 sizes=np.bincount(labels.ravel()); parts=[]
 for i,sl in enumerate(ndimage.find_objects(labels),1):
  if sizes[i]<500: continue
  y,x=sl; parts.append({'label':i,'slice':sl,'box':[x.start,y.start,x.stop,y.stop]})
 # Sort by feet line, then four poses per authored action, never by nominal grid boundaries.
 parts.sort(key=lambda x:x['box'][3])
 if len(parts)!=len(states)*4: raise ValueError((p.name,'body count',len(parts)))
 frames={}
 for row,state in enumerate(states):
  group=sorted(parts[row*4:row*4+4],key=lambda x:x['box'][0])
  for col,part in enumerate(group):
   sl=part['slice']; cut=rgba[sl].copy(); mask=labels[sl]==part['label']
   cut[:,:,3]=np.where(mask,255,0); cut[~mask]=0
   frames[state,col]={'image':Image.fromarray(cut),'source':str(p.relative_to(ROOT)),
    'rect':part['box'],'scale':84/reference_height,'pixels':int(mask.sum())}
 diagnostics.append({'source':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),
  'size':list(Image.open(p).size),'alphaZero':int((a==0).sum()),'alphaPartial':int(((a>0)&(a<255)).sum()),
  'alphaOpaque':int((a==255).sum()),'componentsOver500':len(parts),
  'excludedThresholdPixels':int(sum(s for s in sizes[1:] if s<500)),
  'sourceBoundaryAlphaOver127':int((a[0]>127).sum()+(a[-1]>127).sum()+(a[:,0]>127).sum()+(a[:,-1]>127).sum())})
 return frames
for direction,refheight in [('down',204),('right',200),('up',149),('left',140)]:
 sources[direction]=read_source(BASE/'produccion-01'/f'source-{direction}.png',STATES,refheight)
for direction,filename,height in [('left','source-left-actions-03.png',310),('right','source-right-actions-attempt01.png',328)]:
 sources[direction].update(read_source((OUT if direction=='left' else BASE/'cierre-02')/filename,['cast','ultimate'],height))
sources['left'].update(read_source(OUT/'source-left-motion-03.png',['walk','attack','hit','death'],212))
sources['up'].update(read_source(OUT/'source-up-hit-fixed-03.png',['hit'],458))
atlas=Image.new('RGBA',(W*COLS,H*14)); frames=[];sets={}
for direction,source in sources.items():
 contact=Image.new('RGBA',(W*4,H*7))
 for row,state in enumerate(STATES):
  sets[state+'_'+direction]=[]
  for phase in range(4):
   f=source[state,phase]; raw=f['image'];scale=f['scale']
   crop=raw.resize((round(raw.width*scale),round(raw.height*scale)),Image.Resampling.NEAREST)
   a=np.array(crop)[:,:,3]>0
   anchor=float(np.median(np.where(a[max(0,crop.height-8):])[1]))+.5
   if state=='death' and phase>=2: anchor=crop.width/2
   dx=round(W/2-anchor);dy=FOOT-crop.height
   if min(dx,dy,W-dx-crop.width,H-dy-crop.height)<4:raise ValueError((direction,state,phase,'padding',dx,dy,crop.size))
   tile=Image.new('RGBA',(W,H));tile.paste(crop,(dx,dy));index=len(frames)
   atlas.paste(tile,((index%COLS)*W,(index//COLS)*H));contact.paste(tile,(phase*W,row*H))
   sets[state+'_'+direction].append(index)
   frames.append({'id':f'veyra.cuerpo.{state}.{direction}.{phase}','index':index,'source':f['source'],
    'sourceRect':f['rect'],'scale':scale,'sourceComponentPixels':f['pixels'],'bbox':list(tile.getbbox()),
    'rgbaSha256':hashlib.sha256(tile.tobytes()).hexdigest(),'approved':False})
 contact.save(OUT/f'candidate-{direction}.png')
atlas.save(OUT/'candidate-atlas.png')
(OUT/'candidate-meta.json').write_text(json.dumps({'state':'EN_CORRECCION','installed':False,'w':W,'h':H,'cols':COLS,'refH':84,'anchor':FOOT/H,'sets':{k.replace('_right','_side'):v for k,v in sets.items()}},indent=2)+'\n')
(OUT/'FRAME_INDEX.json').write_text(json.dumps(frames,indent=2)+'\n')
report={'scope':'Technical extraction candidate, not Art PASS; source components may omit detached authored details. No runtime installation.',
 'sources':diagnostics,'frames':len(frames),'rgbaUnique':len(set(f['rgbaSha256'] for f in frames)),
 'alphaBinary':set(atlas.getchannel('A').getdata())<={0,255},'approvedFrames':0,
 'paddingAtLeast4':True,'reference':'assets/ui/codex/champions/veyra.png'}
(OUT/'EXTRACTION.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='sources'}))
