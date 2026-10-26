from PIL import Image,ImageDraw
from pathlib import Path
import json,gzip,os
D=Path(os.environ.get('OUT','art-source/entregas/musashi-kit-20261026/cierre-03'))
arenas=['bosque','hielo','infernal','laberinto','acuatica','minas'];rows=[]
for vp in ['mobile','desktop']:
 data=json.loads((D/vp/'capture.json').read_text());rows+=data['rows']
 (D/(vp+'.json.gz')).write_bytes(gzip.compress(json.dumps(data).encode(),mtime=0))
 cw,ch=(400,320) if vp=='mobile' else (600,500)
 def sheet(files,name,cols):
  canvas=Image.new('RGB',(cw*cols,(ch+20)*((len(files)+cols-1)//cols)),'#202020');draw=ImageDraw.Draw(canvas)
  for i,p in enumerate(files):
   im=Image.open(p);w,h=im.size;x=(i%cols)*cw;y=(i//cols)*(ch+20)
   box=(w//2-cw//2,h//2+20-ch//2,w//2+cw//2,h//2+20+ch//2)
   canvas.paste(im.crop(box),(x,y+20));draw.text((x+4,y+4),p.name,fill='white')
  canvas.save(D/name)
 for looks in [['base','tier4'],['gear','set','skin']]:
  sheet([D/vp/f'{a}-{look}-dense-h2-224-before.png' for a in arenas for look in looks],f'review-{vp}-'+('-'.join(looks))+'.png',len(looks))
 for arena,look in [('bosque','base'),('infernal','tier4')]:
  sheet([D/vp/f'{arena}-{look}-sparse-h2-{t}-before.png' for t in [64,128,224,320,416,480]],f'review-{vp}-{arena}-{look}-sequence.png',3)
 for arena,look,t in [('bosque','base',128),('infernal','tier4',320)]:
  import shutil
  shutil.copyfile(D/vp/f'{arena}-{look}-dense-h2-{t}-before.png',D/f'full-{vp}-{arena}-{look}-{t}.png')
(D/'MATRIX_SUMMARY.json').write_text(json.dumps({'scenes':len(rows),'ABA':sum(len(r['ab']) for r in rows),'exact':all(a['restore'] and a['state'] for r in rows for a in r['ab']),'minVisible':min(a['visible'] for r in rows for a in r['ab']),'threshold':.8,'delta':24,'times':[64,128,224,320,416,480],'scope':'Only candidate canvases suppressed; summarized state. Review sheets are unscaled native crops; four full frames also preserved.'},indent=2))
print((D/'MATRIX_SUMMARY.json').read_text())
