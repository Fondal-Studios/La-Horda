"""Package reproducible native crops and evidence, preserving all original exports."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, hashlib, shutil
ROOT=Path(__file__).resolve().parents[2]
p=ROOT/'art-source/entregas/brakk-kit-20261022/correccion-08'
sha=lambda b:hashlib.sha256(b).hexdigest()
checks=[];differences=[];index=[]
for v in ['mobile','landscape']:
 j=json.loads((p/v/'capture.json').read_text());rs=j['results'];aa=[a for r in rs for a in r['ab']]
 checks.append(dict(name=v+' 60 equipped scenes and 120 exact restorations',pass_=len(rs)==60 and len(aa)==120 and not j['errors'] and all(a['identicalRestoration'] and a['stateUnchanged'] for a in aa)))
 for arena in ['bosque','hielo','infernal','laberinto','acuatica','minas']:
  sheet=Image.new('RGB',(600,1040),'#171719');d=ImageDraw.Draw(sheet)
  row=0
  for look in ['base','set']:
   for t in [330,1600]:
    y=row*260;d.text((5,y+4),f'{v} {arena} {look} dense {t} ms | 07 original / 08 candidato',fill='white')
    for col,kind in enumerate(['without','before']):
     im=Image.open(p/v/f'{arena}-{look}-dense-h3-{t}-ab-{kind}.png').convert('RGBA');w,h=im.size
     # Native 1:1 crop, no resizing. Same ROI as capture harness.
     box=(round(w/2-110),round(h/2-140),round(w/2-110)+300,round(h/2-140)+240)
     sheet.paste(im.crop(box),(col*300,y+20))
    row+=1
  (p/'previews').mkdir(exist_ok=True);sheet.save(p/'previews'/f'{v}-{arena}-1to1.png')
 for r in rs:
  for a in r['ab']:
   stem=f"{r['arena']}-{r['look']}-{r['density']}-h3-{a['t']}-ab-"
   before=Image.open(p/v/(stem+'before.png')).convert('RGBA');old=Image.open(p/v/(stem+'without.png')).convert('RGBA')
   n=sum(x!=y for x,y in zip(before.getdata(),old.getdata()));differences.append(dict(viewport=v,scene=stem,changedPixels=n))
   checks.append(dict(name=v+'/'+stem+' visible ring difference',pass_=n>0))
for f in sorted(p.rglob('*.png')):
 if 'previews' not in f.parts:index.append(dict(path=str(f.relative_to(p)),sha256=sha(f.read_bytes()),bytes=f.stat().st_size))
(p/'GENERATED_PNG_INDEX.json').write_text(json.dumps(index,indent=2)+'\n')
q=json.loads((p/'probe/capture.json').read_text());b118=[a for r in q['results'] if r['slot']==1 for a in r['ab']]
checks.append(dict(name='B118 eight same-frame controls pixel-identical',pass_=len(b118)==8 and all(a['beforeHash']==a['withoutHash'] and a['identicalRestoration'] and a['stateUnchanged'] for a in b118)))
atlases=[]
for f in sorted((p/'kit/atlases').glob('*.png')):
 old=ROOT/'art-source/entregas/brakk-kit-20261022/correccion-06/atlases'/f.name;a=Image.open(f).convert('RGBA');b=Image.open(old).convert('RGBA')
 same=a.size==b.size and a.tobytes()==b.tobytes();checks.append(dict(name=f.name+' RGBA identical to06',pass_=same))
 atlases.append(dict(name=f.name,size=a.size,rgbaSha256=sha(a.tobytes()),parentRgbaSha256=sha(b.tobytes()),pngSha256=sha(f.read_bytes()),parentPngSha256=sha(old.read_bytes()),samePixels=same,samePngBytes=f.read_bytes()==old.read_bytes()))
result=dict(checks=checks,atlasComparison=atlases,differences=differences,note='Encoding bytes differ; all five atlas RGBA buffers identical. 1:1 sheets contain selected base/set dense scenes, not every equipped raster. No compound Art Gate certification.')
(p/'matrix-verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(dict(checks=len(checks),failed=[x for x in checks if not x['pass_']],changedPixels=[min(x['changedPixels'] for x in differences),max(x['changedPixels'] for x in differences)],generatedPngs=len(index))))
if any(not x['pass_'] for x in checks):raise SystemExit(1)
