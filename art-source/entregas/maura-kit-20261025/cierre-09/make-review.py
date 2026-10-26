from PIL import Image,ImageDraw
from pathlib import Path
D=Path(__file__).resolve().parent

def sheet(paths,name):
 out=Image.new('RGB',(960,200*((len(paths)+2)//3)),'#171717');dr=ImageDraw.Draw(out)
 for i,p in enumerate(paths):
  im=Image.open(p);w,h=im.size;x=i%3*320;y=i//3*200;out.paste(im.crop((w//2-160,h//2-120,w//2+160,h//2+60)),(x,y+20));dr.text((x+3,y+3),p.stem.replace('-before',''),fill='white')
 out.save(D/name)
for v in ['desktop','mobile']:
 for arena in ['bosque','hielo','infernal','laberinto','acuatica','minas']:
  paths=[D/v/f'{arena}-{look}-dense-h{slot}-{350 if slot==1 else 300}-before.png' for look in ['base','tier4','gear','set','skin'] for slot in range(3)]
  if all(p.exists() for p in paths):sheet(paths,f'{v}-{arena}-review.png')
for v,arena,look in [('desktop','infernal','tier4'),('mobile','bosque','base'),('mobile','hielo','skin'),('desktop','minas','gear')]:
 paths=[D/v/f'{arena}-{look}-{density}-h{slot}-{t}-before.png' for density in ['sparse','dense'] for slot in range(3) for t in ([120,350,1500,3750] if slot==1 else [120,300,500,650])]
 if all(p.exists() for p in paths):sheet(paths,f'{v}-{arena}-{look}-sequence.png')
paths=[]
for arena in ['bosque','infernal']:
 for slot in range(3):
  t=350 if slot==1 else 300
  for suffix in ['parent','before']:paths.append(D/'paired-exact'/f'{arena}-base-dense-h{slot}-{t}-{suffix}.png')
if all(p.exists() for p in paths):sheet(paths,'paired-exact-review.png')
# Exact main/candidate comparisons: frozen boot, matching pre-cast hashes.
import json
comparisons=[]
for label,left,right in [('desktop','main-exact','candidate-exact'),('mobile','main-mobile','candidate-mobile')]:
 if not all((D/n/'capture.json').exists() for n in [left,right]):continue
 a=json.loads((D/left/'capture.json').read_text());b=json.loads((D/right/'capture.json').read_text());pairs=[]
 im=Image.new('RGB',(640,1200),'#171717');draw=ImageDraw.Draw(im)
 for i,(r,s) in enumerate(zip(a['rows'],b['rows'])):
  pairs.append({**{k:r[k] for k in ['arena','look','density','slot']},'samePrecast':r['sceneHash']==s['sceneHash'],'mainDraws':r['cupDraws'],'candidateDraws':s['cupDraws']})
  t=350 if r['slot']==1 else 300
  for col,(folder,title) in enumerate([(left,'MAIN'),(right,'CANDIDATE')]):
   p=D/folder/f"{r['arena']}-base-dense-h{r['slot']}-{t}-before.png";pic=Image.open(p);w,h=pic.size
   im.paste(pic.crop((w//2-160,h//2-120,w//2+160,h//2+60)),(col*320,i*200+20));draw.text((col*320+3,i*200+3),f"{title} {r['arena']} H{r['slot']+1}",fill='white')
 im.save(D/f'main-pair-{label}.png');comparisons.append({'viewport':label,'pairs':pairs})
if comparisons:(D/'MAIN_COMPARISON.json').write_text(json.dumps(comparisons,indent=2))
