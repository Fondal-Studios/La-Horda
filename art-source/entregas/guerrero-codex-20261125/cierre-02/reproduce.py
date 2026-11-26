#!/usr/bin/env python3
from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json
ROOT=Path(__file__).resolve().parents[4]
SRC=ROOT/'assets/sprites/champions/guerrero/codex-v1/atlas.png'
OUT=Path(__file__).resolve().parent
im=Image.open(SRC).convert('RGBA')
assert im.size==(576,1296), im.size
W=H=144; rows={'cast_down':[24,25,26,27],'cast_side':[16,17,18,19],'cast_up':[20,21,22,23]}
atlas=Image.new('RGBA',(W*4,H*3))
evidence=[]
for row,(name,ids) in enumerate(rows.items()):
 for col,i in enumerate(ids):
  cell=im.crop(((i%4)*W,(i//4)*H,(i%4+1)*W,(i//4+1)*H))
  atlas.alpha_composite(cell,(col*W,row*H))
  evidence.append({'set':name,'target':[row,col],'sourceFrame':i,'sourceRect':[(i%4)*W,(i//4)*H,W,H],'sha256':hashlib.sha256(cell.tobytes()).hexdigest(),'alphaPixels':sum(v>40 for v in cell.getchannel('A').getdata())})
atlas.save(OUT/'cast-candidate.png',optimize=True)
# Review-only contact sheet at native and approximate gameplay scale; never called a renderer capture.
bg=(30,30,34,255); preview=Image.new('RGBA',(720,640),bg);d=ImageDraw.Draw(preview)
d.text((18,12),'CANDIDATO NATIVO — NO CAPTURA GAMEPLAY',fill='white')
preview.alpha_composite(atlas,(72,38))
d.text((18,488),'Vista diagnóstica ~70 px de alto (no renderer)',fill='white')
for j,i in enumerate([0,4,8]):
 cell=atlas.crop((0,i//4*H,W,(i//4+1)*H)); box=cell.getbbox(); crop=cell.crop(box); crop.thumbnail((130,70),Image.Resampling.NEAREST); preview.alpha_composite(crop,(110+j*200,525+(70-crop.height)))
preview.save(OUT/'preview.png',optimize=True)
report={'status':'SOURCE_TECHNICAL_PASS_PENDING_RUNTIME','source':str(SRC.relative_to(ROOT)),'sourceSha256':hashlib.sha256(SRC.read_bytes()).hexdigest(),'candidateSha256':hashlib.sha256((OUT/'cast-candidate.png').read_bytes()).hexdigest(),'grid':[4,3],'cell':[W,H],'sets':rows,'frames':evidence,'checks':{'dimensions':atlas.size==(576,432),'nonEmpty':all(x['alphaPixels']>=150 for x in evidence),'binaryAlpha':set(atlas.getchannel('A').getdata())<={0,255},'borderClear':all(not any(edge.getdata()) for r in range(3) for c in range(4) for edge in (atlas.getchannel('A').crop((c*W,r*H,(c+1)*W,(r+1)*H)).crop((0,0,W,1)),atlas.getchannel('A').crop((c*W,r*H,(c+1)*W,(r+1)*H)).crop((0,H-1,W,H)),atlas.getchannel('A').crop((c*W,r*H,(c+1)*W,(r+1)*H)).crop((0,0,1,H)),atlas.getchannel('A').crop((c*W,r*H,(c+1)*W,(r+1)*H)).crop((W-1,0,W,H))))}}
report['status']='SOURCE_TECHNICAL_PASS_PENDING_RUNTIME' if all(report['checks'].values()) else 'FIX'
(OUT/'TECHNICAL.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'status':report['status'],'candidateSha256':report['candidateSha256'],'frames':len(evidence)}))
