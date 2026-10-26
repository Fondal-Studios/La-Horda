from pathlib import Path
from PIL import Image,ImageDraw
D=Path('art-source/entregas/libertador-kit-20261025/cierre-03')
for v in ['desktop','mobile']:
 sheet=Image.new('RGB',(1280,1260),'#1e272c');dr=ImageDraw.Draw(sheet)
 for row,arena in enumerate(['bosque','hielo','infernal','laberinto','acuatica','minas']):
  for col,(look,slot,t) in enumerate([('base',0,80),('tier4',0,80),('base',2,480),('tier4',2,480)]):
   im=Image.open(D/('contact-'+v)/f'{arena}-{look}-dense-h{slot}-{t}-before.png');x,y=im.width//2,im.height//2
   sheet.paste(im.crop((x-80,y-120,x+240,y+65)),(col*320,row*210+25));dr.text((col*320+4,row*210+5),f'{v} {arena} {look} H{slot+1}',fill='white')
 sheet.save(D/f'review-{v}.png')
 sheet=Image.new('RGB',(1280,840),'#1e272c');dr=ImageDraw.Draw(sheet)
 for row,(look,slot) in enumerate([('base',0),('tier4',0),('base',2),('tier4',2)]):
  for col,t in enumerate([48,80,144,224] if slot==0 else [160,400,480,640]):
   im=Image.open(D/('contact-'+v)/f'bosque-{look}-sparse-h{slot}-{t}-before.png');x,y=im.width//2,im.height//2
   sheet.paste(im.crop((x-80,y-120,x+240,y+65)),(col*320,row*210+25));dr.text((col*320+4,row*210+5),f'{v} {look} H{slot+1} {t}ms',fill='white')
 sheet.save(D/f'temporal-{v}.png')
