"""Make native-scale before/after contact sheets from capture-guerrero-closure.js.
Full captures can be reproduced; every full PNG hash stays in matrix.json.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw
P=Path('art-source/entregas/guerrero-kit-20261023/cierre-02')
x=json.loads((P/'matrix.json').read_text())
for mobile in (False,True):
 for look in ('base','gear','set'):
  rows=[r for r in x['rows'] if r['mobile']==mobile and r['look']==look]
  sheet=Image.new('RGB',(880,6*200),'#171d22');d=ImageDraw.Draw(sheet)
  for n,r in enumerate(rows):
   s=r['samples'][0];row=n//2;col=(n%2)*2
   for k,mode in enumerate(('before','after')):
    img=Image.open(P/f"{r['id']}-5000-{mode}.png").convert('RGB');cx,cy=round(s['x']),round(s['y']);crop=img.crop((cx-110,cy-105,cx+110,cy+75));sheet.paste(crop,((col+k)*220,row*200+20));d.text(((col+k)*220+3,row*200+3),f"{r['arena']} {'dense' if r['dense'] else 'sparse'} {mode}",fill='white')
  sheet.save(P/f"contact-{'touch' if mobile else 'desktop'}-{look}.png")
# Fade overview: both viewports, base/set, six arenas, sparse; same scale, after only.
sheet=Image.new('RGB',(880,1200),'#171d22');d=ImageDraw.Draw(sheet)
for col,(mobile,look) in enumerate(((False,'base'),(False,'set'),(True,'base'),(True,'set'))):
 rows=[r for r in x['rows'] if r['mobile']==mobile and r['look']==look and not r['dense']]
 for row,r in enumerate(rows):
  s=r['samples'][1];img=Image.open(P/f"{r['id']}-600-after.png").convert('RGB');cx,cy=round(s['x']),round(s['y']);sheet.paste(img.crop((cx-110,cy-105,cx+110,cy+75)),(col*220,row*200+20));d.text((col*220+3,row*200+3),f"{r['arena']} {'touch' if mobile else 'desk'} {look} fade",fill='white')
sheet.save(P/'contact-fade.png')
print(x['checks'], 'minimum retained enemy fraction',min(s['enemyVisible'] for r in x['rows'] for s in r['samples']))
