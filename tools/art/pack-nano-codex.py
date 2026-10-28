"""Technical extraction of imagegen-authored Nano GM poses; no procedural drawing or recoloring.
Keep original sources. Clean extraction matte, snap alpha, align feet and pack explicit directions.
"""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'art-source/sprite-rework/nano_gm/2026-10-28'
OUT=ROOT/'assets/sprites/champions/nano_gm/codex-v2'
REPORT=ROOT/'docs/art-gate/nano-gm-codex-v2'
OUT.mkdir(parents=True,exist_ok=True);REPORT.mkdir(parents=True,exist_ok=True)
STATES=['idle','walk','attack','cast','ultimate','hit','death'];DIRS=['down','side','up','left']
SOURCES=[('front-source.png',[0,193,365,532,705,882,1055,1254],84/164),
 ('right-source.png',[0,200,384,563,740,915,1084,1254],84/185),
 ('back-source.png',[0,195,366,540,718,884,1060,1254],84/174),
 ('left-source.png',[0,197,373,543,722,887,1070,1254],84/173)]
W,H,COLS,BASELINE=192,128,8,120
atlas=Image.new('RGBA',(W*COLS,H*14));meta={'w':W,'h':H,'cols':COLS,'refH':84,'anchor':BASELINE/H,'fix':{'left':'authored'},'footX':{},'sets':{},'embeddedWings':True}
evidence=[];hashes=[]
for d,(filename,ys,scale) in zip(DIRS,SOURCES):
 rgba=np.array(Image.open(SRC/filename).convert('RGBA')); mask=rgba[:,:,3]>=180
 # The transparency extraction left saturated chroma-red flecks around the silhouettes.
 # This is matte removal, not a palette/style conversion; tattoo/skin/clothing colors remain.
 red=(rgba[:,:,0]>145)&(rgba[:,:,1]<65)&(rgba[:,:,2]<65)&(rgba[:,:,0]>rgba[:,:,1]*2.8)
 mask &= ~red
 for row,st in enumerate(STATES):
  arr=[];y0,y1=ys[row:row+2];band=mask[y0:y1].copy()
  # Split four characters by the gaps between their feet centers; ultimate wings can extend
  # beyond a regular source column. Connected components retain those extensions.
  labels,n=ndimage.label(band,np.ones((3,3)))
  sizes=np.bincount(labels.ravel());parts=[]
  for i,sl in enumerate(ndimage.find_objects(labels),1):
   if sizes[i]<2500:continue
   parts.append((sl[1].start,i,sl))
  parts.sort()
  if len(parts)!=4:raise ValueError((filename,st,'expected four isolated authored bodies',[(x,int(sizes[i])) for x,i,_ in parts]))
  for col,(_,lab,sl) in enumerate(parts):
   xx0,xx1=sl[1].start,sl[1].stop;yy0,yy1=sl[0].start+y0,sl[0].stop+y0
   cut=rgba[yy0:yy1,xx0:xx1].copy();keep=(labels[sl]==lab)
   cut[:,:,3]=np.where(keep,255,0);cut[~keep]=0
   src=Image.fromarray(cut);bb=src.getbbox()
   # One scale per facing, not per pose: crouches and corpses keep real height differences.
   frame=src.resize((round(src.width*scale),round(src.height*scale)),Image.Resampling.NEAREST)
   px=np.array(frame);alpha=px[:,:,3]>0
   if st=='death' and col>=2:anchorX=frame.width/2
   else:
    coords=np.where(alpha[max(0,frame.height-8):]);anchorX=float(np.median(coords[1]))+.5
   dx=round(W/2-anchorX);dy=BASELINE-frame.height
   if dx<4 or dx+frame.width>W-4 or dy<4:raise ValueError((d,st,col,'insufficient padding',dx,dy,frame.size))
   index=len(evidence);arr.append(index);tile=Image.new('RGBA',(W,H));tile.paste(frame,(dx,dy));atlas.paste(tile,((index%COLS)*W,(index//COLS)*H));meta['footX'][index]=.5
   digest=hashlib.sha256(str(frame.size).encode()+frame.tobytes()).hexdigest();hashes.append(digest)
   evidence.append({'index':index,'state':st,'direction':d,'frame':col,'source':str((SRC/filename).relative_to(ROOT)),'sourceRect':[xx0,yy0,xx1,yy1],'scale':scale,'pivot':[W/2,BASELINE],'bbox':list(tile.getbbox()),'sha256':digest})
  meta['sets'][st+'_'+d]=arr
atlas.save(OUT/'atlas.png',optimize=True)
atlas.save(OUT/'atlas.webp',lossless=True,quality=100,method=5,exact=True)
assert Image.open(OUT/'atlas.webp').convert('RGBA').tobytes()==atlas.tobytes(), 'WebP pixels differ'
webp=ROOT/'js/assets/asset-webp.js';entry='"assets/sprites/champions/nano_gm/codex-v2/atlas.png",'
text=webp.read_text()
if entry not in text:webp.write_text(text.replace('const ASSET_WEBP = new Set([','const ASSET_WEBP = new Set([\n'+entry))
(OUT/'meta.json').write_text(json.dumps(meta,indent=2)+'\n')
# The competitive adapter has its own metadata registry. Keep it on the same authored atlas.
cw=ROOT/'js/modes/crystal-wars/atlas.js';prefix,data=cw.read_text().split('const CW_ATLAS = ',1);registry,end=json.JSONDecoder().raw_decode(data);suffix=data[end:]
animations={k:{'frames':v,'fps':4 if k.startswith('idle_') else 8,'loop':k.startswith(('idle_','walk_')),'flip':False} for k,v in meta['sets'].items()}
for k,v in list(animations.items()):
 if k.endswith('_side'):animations[k[:-5]+'_right']=v
registry['nano_gm']={'image':'atlas.png','src':str((OUT/'atlas.png').relative_to(ROOT)),'imageSize':list(atlas.size),'referenceHeight':84,'frames':[{'x':i%COLS*W,'y':i//COLS*H,'w':W,'h':H,'pivotX':W/2,'pivotY':BASELINE} for i in range(112)],'animations':animations}
cw.write_text(prefix+'const CW_ATLAS = '+json.dumps(registry,separators=(',',':'),ensure_ascii=False)+suffix)
report={'status':'TECHNICAL_ONLY_REQUIRES_VISUAL_AND_RUNTIME_GATE','frames':len(evidence),'uniquePoseHashes':len(set(hashes)),'dimensions':list(atlas.size),'alphaValues':np.unique(np.array(atlas)[:,:,3]).tolist(),'sourceFiles':4,'records':evidence}
(REPORT/'packing.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='records'}))
