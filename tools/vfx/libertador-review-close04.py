from pathlib import Path
from PIL import Image,ImageDraw
D=Path('art-source/entregas/libertador-kit-20261025/cierre-04')
arenas=['bosque','hielo','infernal','laberinto','acuatica','minas']
def sheet(name,view,items):
 out=Image.new('RGB',(960,220*((len(items)+2)//3)),'#1e272c');dr=ImageDraw.Draw(out)
 for n,(arena,look,density,slot,t) in enumerate(items):
  im=Image.open(D/('contact-'+view)/f'{arena}-{look}-{density}-h{slot}-{t}-before.png');x,y=im.width//2,im.height//2;cx=(n%3)*320;cy=(n//3)*220
  out.paste(im.crop((x-80,y-150,x+240,y+45)),(cx,cy+25));dr.text((cx+4,cy+5),f'{view} {arena} {look} {density} H{slot+1} {t}',fill='white')
 tmp=D/(name+'.tmp');out.save(tmp,format='PNG');Image.open(tmp).verify();tmp.replace(D/name)
for v in ['desktop','mobile']:
 for arena in arenas:
  sheet(f'review-{v}-{arena}.png',v,[(arena,l,'dense',s,t) for l in ['base','gear','set','skin','tier4'] for s,t in [(0,80),(1,224),(2,480)]])
 for arena in ['bosque','infernal']:
  sheet(f'temporal-{v}-{arena}.png',v,[(arena,l,'sparse',s,t) for l in ['base','tier4'] for s,ts in [(0,[48,80,144,224]),(1,[80,224,480,896]),(2,[160,400,480,640])] for t in ts])
