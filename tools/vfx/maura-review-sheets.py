from pathlib import Path
from PIL import Image,ImageDraw
D=Path(__file__).resolve().parents[2]/'art-source/entregas/maura-kit-20261025/cierre-01';out=D/'review-sheets';out.mkdir(exist_ok=True)
for view in ['mobile','desktop']:
 for arena in ['bosque','hielo','infernal','laberinto','acuatica','minas']:
  sheet=Image.new('RGB',(960,1050),'#20271f');draw=ImageDraw.Draw(sheet);complete=True
  for j,look in enumerate(['base','gear','set','skin','tier4']):
   for slot in range(3):
    p=D/(f'roots-final-{view}' if slot==0 else f'composite-{view}')/f'{arena}-{look}-dense-h{slot}-{350 if slot==1 else 300}-before.png'
    if not p.exists():complete=False;continue
    im=Image.open(p);x,y=im.width//2,im.height//2;crop=im.crop((x-120,y-130,x+200,y+55));sheet.paste(crop,(slot*320,j*210+25));draw.text((slot*320+4,j*210+4),f'{arena} {look} H{slot+1} {view}',fill='white')
  if complete:sheet.save(out/f'{view}-{arena}.png')
print([p.name for p in out.glob('*.png')])
