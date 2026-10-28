from pathlib import Path
from PIL import Image,ImageDraw
import json
D=Path('art-source/entregas/nano-gm-kit-20261026/cierre-04')
arenas=['bosque','hielo','infernal','laberinto','acuatica','minas'];looks=['base','gear','skin','regent','monster']
for view in ['mobile','desktop']:
 for slot in [0,2]:
  sheet=Image.new('RGB',(448*3,264*10),'#20202a');draw=ImageDraw.Draw(sheet)
  for i,(arena,look) in enumerate((a,l) for a in arenas for l in looks):
   im=Image.open(D/f'final-{view}'/f'{arena}-{look}-dense-h{slot}-256-before.png').convert('RGB')
   box=(300,92,748,332) if view=='mobile' else (560,220,1008,460)
   x=i%3*448;y=i//3*264;sheet.paste(im.crop(box),(x,y+24));draw.text((x+4,y+4),f'{view} {arena} {look} H{slot+1} 256ms',fill='white')
  sheet.save(D/f'review-{view}-h{slot}.webp',lossless=True)
for view in ['mobile','desktop']:
 sheet=Image.new('RGB',(448*3,264*4),'#20202a');draw=ImageDraw.Draw(sheet)
 for i,(slot,t) in enumerate((s,t) for s in [0,2] for t in [64,160,256,416,640,800]):
  im=Image.open(D/f'temporal-{view}'/f'infernal-monster-sparse-h{slot}-{t}-before.png').convert('RGB')
  box=(300,50,748,290) if view=='mobile' else (560,150,1008,390)
  x=i%3*448;y=i//3*264;sheet.paste(im.crop(box),(x,y+24));draw.text((x+4,y+4),f'{view} monster H{slot+1} {t}ms',fill='white')
 sheet.save(D/f'review-temporal-{view}.webp',lossless=True)
