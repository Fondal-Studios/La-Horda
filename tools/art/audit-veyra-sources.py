"""Read-only source diagnostics; never convert technical measurements to Art PASS."""
from pathlib import Path
from PIL import Image
import hashlib, json
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art-source/entregas/veyra-codex-20261028/produccion-01'
states=['idle','walk','attack','cast','ultimate','hit','death']
rows=[]
for name in ['down','right','up','left']:
 p=OUT/f'source-{name}.png'; im=Image.open(p).convert('RGBA'); a=im.getchannel('A'); hist=a.histogram(); frames=[]
 for y,st in enumerate(states):
  for x in range(4):
   box=(round(x*im.width/4),round(y*im.height/7),round((x+1)*im.width/4),round((y+1)*im.height/7))
   crop=im.crop(box); ca=crop.getchannel('A'); h=ca.histogram()
   edge=sum(v>0 for v in list(ca.crop((0,0,crop.width,1)).getdata())+list(ca.crop((0,crop.height-1,crop.width,crop.height)).getdata())+list(ca.crop((0,1,1,crop.height-1)).getdata())+list(ca.crop((crop.width-1,1,crop.width,crop.height-1)).getdata()))
   frames.append({'id':f'veyra.cuerpo.{st}.{name}.{x}','nominalBox':box,'rgbaSha256':hashlib.sha256(crop.tobytes()).hexdigest(),'alphaPartial':sum(h[1:255]),'edgeAlphaPixels':edge,'bounds':ca.getbbox(),'extractionApproved':False})
 rows.append({'source':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'size':im.size,'alphaPartial':sum(hist[1:255]),'opaquePixels':hist[255],'transparentPixels':hist[0],'nominalCells':28,'nominalCellUniqueHashes':len(set(f['rgbaSha256'] for f in frames)),'frames':frames,'status':'FIX_NO_INTEGRAR'})
(OUT/'SOURCE_GATE.json').write_text(json.dumps({'mode':'analysis only; nominal cells are not approved extraction/unique animation frames','sources':rows,'nominalCells':112,'approvedFrames':0},indent=2)+'\n')
print(json.dumps({'sources':len(rows),'nominalCells':112,'approvedFrames':0,'partialAlpha':{r['source']:r['alphaPartial'] for r in rows}}))
