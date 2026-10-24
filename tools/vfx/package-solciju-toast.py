from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,shutil
D=Path('art-source/entregas/solciju-toast-20261024/cierre-01');(D/'review').mkdir(exist_ok=True)
summary={'threshold':.8,'delta':24,'viewports':{}}
for mode in ['mobile','desktop']:
 src=Path('/tmp/sol-matrix-'+mode);data=json.loads((src/'capture.json').read_text());shutil.copy(src/'capture.json',D/('matrix-'+mode+'.json'))
 rows=data['rows'];abs=[a for r in rows for a in r['ab']]
 assert len(rows)==60 and not data['errors'] and all(a['restore'] and a['state'] and a['visible']>=.8 for a in abs)
 for r in rows:
  assert r['cupDraws']>0
  assert r['resolved']['equipment']==(0 if r['look']=='base' else 4)
  if r['look']=='alt1':assert r['resolved']['pack']=='croma_solciju_alt1'
  if r['look']=='croma':assert r['resolved']['pack']=='croma_solciju_croma'
  if r['look']=='set':assert r['resolved']['pack']=='skin_quality_solciju' and r['resolved']['setPieces']==4
 summary['viewports'][mode]={'scenes':len(rows),'ABA':len(abs),'minEnemyRetention':min(a['visible'] for a in abs),'actualCupDraws':sum(r['cupDraws'] for r in rows),'resolvedLooks':{r['look']:r['resolved'] for r in rows}}
 index=[]
 for f in sorted(src.glob('*.png')):index.append({'file':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
 (D/('raster-index-'+mode+'.json')).write_text(json.dumps(index,indent=2)+'\n')
 for arena in ['bosque','hielo','infernal','laberinto','acuatica','minas']:
  sheet=Image.new('RGB',(880,925),'#11131b');draw=ImageDraw.Draw(sheet)
  for ri,look in enumerate(['base','gear','alt1','croma','set']):
   for ci,(density,kind)in enumerate([('sparse','parent'),('sparse','before'),('dense','parent'),('dense','before')]):
    f=src/f'{arena}-{look}-{density}-330-{kind}.png';im=Image.open(f);w,h=im.size;crop=im.crop((w//2-105,h//2-105,w//2+105,h//2+55))
    sheet.paste(crop,(ci*220,ri*185+22));draw.text((ci*220+3,ri*185+3),f'{look} {density} {"main" if kind=="parent" else "copa"}',fill='white')
  sheet.save(D/'review'/f'{mode}-{arena}.png')
 # Temporal native 4 frames; same scale, no resized artwork.
 sheet=Image.new('RGB',(880,390),'#11131b');draw=ImageDraw.Draw(sheet)
 for ri,arena in enumerate(['bosque','infernal']):
  for ci,t in enumerate([80,330,610,950]):
   im=Image.open(src/f'{arena}-set-dense-{t}-before.png');w,h=im.size;sheet.paste(im.crop((w//2-105,h//2-105,w//2+105,h//2+55)),(ci*220,ri*190+24));draw.text((ci*220+3,ri*190+4),f'{arena} set {t}ms',fill='white')
 sheet.save(D/'review'/f'{mode}-temporal.png')
 for arena in ['bosque','infernal']:
  for kind in ['before','parent']:shutil.copy(src/f'{arena}-set-dense-330-{kind}.png',D/'review'/f'{mode}-{arena}-native-{kind}.png')
(D/'MATRIX_SUMMARY.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary))
