from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,gzip,shutil
P=Path('art-source/entregas/brakk-signatures-20261024/cierre-01');(P/'sheets').mkdir(exist_ok=True);(P/'evidence').mkdir(exist_ok=True)
summary={}
for mode in ['mobile','desktop','composite-mobile','composite-desktop']:
 d=json.load(open(P/mode/'capture.json'));aa=[a for r in d['results'] if r['slot']<2 for a in r['ab']]
 summary[mode]={'scenes':sum(r['slot']<2 for r in d['results'] if r['slot']<2),'samples':len(aa),'restored':sum(a['identicalRestoration'] for a in aa),'stateUnchanged':sum(a['stateUnchanged'] for a in aa),'minimumEnemyVisibility':min(a.get('enemyVisible',1)for a in aa),'failures':sum(not a['identicalRestoration']or not a['stateUnchanged']or a.get('enemyVisible',1)<.8 for a in aa),'errors':d['errors'],'signaturesDrawn':sum(sum(r['signatureDraws'])for r in d['results'] if r['slot']<2)}
 if mode.startswith('composite'):continue
 for arena in ['bosque','hielo','infernal','laberinto','acuatica','minas']:
  im=Image.new('RGB',(640,6*180),'#151a20');dr=ImageDraw.Draw(im)
  for row,look in enumerate(['main','base','gear','alt1','croma','set']):
   for slot in range(2):
    f=P/mode/f'{arena}-{"base" if look=="main" else look}-dense-h{slot+1}-t330-ab-{"without" if look=="main" else "before"}.png'
    a=Image.open(f);w,h=a.size;im.paste(a.crop((w//2-160,h//2-100,w//2+160,h//2+60)),(slot*320,row*180+20));dr.text((slot*320+4,row*180+3),f'{mode} {arena} {look} H{slot+1}',fill='white')
  im.save(P/'sheets'/f'{mode}-{arena}.png')
 # Three stages of the actual cast in native screenshot crops; paired before/after early & late.
 im=Image.new('RGB',(640,800),'#151a20');dr=ImageDraw.Draw(im)
 for row,(t,name) in enumerate([(80,'without'),(80,'before'),(330,'without'),(330,'before')]):
  for slot in range(2):
   a=Image.open(P/mode/f'infernal-set-dense-h{slot+1}-t{t}-ab-{name}.png');w,h=a.size;im.paste(a.crop((w//2-160,h//2-120,w//2+160,h//2+60)),(slot*320,row*200+20));dr.text((slot*320+4,row*200+3),f'{mode} Infernal set H{slot+1} {t}ms {name}',fill='white')
 im.save(P/'sheets'/f'{mode}-temporal.png')
# Compact complete traces and all raster hashes, while publishing representative native sheets.
index=[]
for f in sorted(P.rglob('*.png')):
 if '/evidence/' in str(f):continue
 b=f.read_bytes();index.append({'path':str(f.relative_to(P)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
with gzip.GzipFile(P/'evidence/CAPTURE_INDEX.json.gz','wb',mtime=0)as z:z.write(json.dumps(index).encode())
for f in sorted(P.rglob('capture.json'))+sorted(P.rglob('matrix.json')):
 target=P/'evidence'/('-'.join(f.relative_to(P).parts)+'.gz')
 with gzip.GzipFile(target,'wb',mtime=0)as z:z.write(f.read_bytes())
(P/'MATRIX_SUMMARY.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary));print('raster index',len(index))
