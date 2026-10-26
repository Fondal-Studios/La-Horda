from PIL import Image,ImageDraw
from pathlib import Path
D=Path(__file__).resolve().parent
for vp in ['mobile','desktop']:
 for arena in ['bosque','infernal']:
  out=Image.new('RGB',(960,800),'#171717');dr=ImageDraw.Draw(out)
  for row,(density,kind) in enumerate([('sparse','parent'),('sparse','before'),('dense','parent'),('dense','before')]):
   for slot in range(3):
    p=D/vp/f'{arena}-base-{density}-h{slot}-160-{kind}.png';im=Image.open(p);w,h=im.size
    out.paste(im.crop((w//2-160,h//2-120,w//2+160,h//2+60)),(slot*320,row*200+20));dr.text((slot*320+3,row*200+3),f'{vp} {arena} {density} H{slot+1} {kind}',fill='white')
  out.save(D/f'{vp}-{arena}-review.png')
 for density in ['sparse','dense']:
  out=Image.new('RGB',(960,800),'#171717');dr=ImageDraw.Draw(out)
  for row,t in enumerate([80,160,300,480]):
   for slot in range(3):
    p=D/vp/f'infernal-base-{density}-h{slot}-{t}-before.png';im=Image.open(p);w,h=im.size
    out.paste(im.crop((w//2-160,h//2-120,w//2+160,h//2+60)),(slot*320,row*200+20));dr.text((slot*320+3,row*200+3),f'{vp} infernal {density} H{slot+1} {t}ms',fill='white')
  out.save(D/f'{vp}-{density}-sequence.png')

for vp in ['desktop','mobile']:
 for arena in ['bosque','hielo','infernal','laberinto','acuatica','minas']:
  ps=[D/('final-'+vp)/f'{arena}-{look}-dense-h{slot}-160-before.png' for look in ['base','tier4','gear','set','skin'] for slot in range(3)]
  if not all(p.exists() for p in ps):continue
  out=Image.new('RGB',(960,1000),'#171717');dr=ImageDraw.Draw(out)
  for i,p in enumerate(ps):
   im=Image.open(p);w,h=im.size;x=i%3*320;y=i//3*200;out.paste(im.crop((w//2-160,h//2-120,w//2+160,h//2+60)),(x,y+20));dr.text((x+3,y+3),p.stem,fill='white')
  out.save(D/f'final-{vp}-{arena}-review.png')
for vp,arena,look in [('mobile','bosque','base'),('desktop','infernal','tier4'),('mobile','hielo','skin'),('desktop','minas','set')]:
 ps=[D/('final-'+vp)/f'{arena}-{look}-{density}-h{slot}-{t}-before.png' for density in ['sparse','dense'] for slot in range(3) for t in [80,160,300,480]]
 if not all(p.exists() for p in ps):continue
 out=Image.new('RGB',(1280,1200),'#171717');dr=ImageDraw.Draw(out)
 for i,p in enumerate(ps):
  im=Image.open(p);w,h=im.size;x=i%4*320;y=i//4*200;out.paste(im.crop((w//2-160,h//2-120,w//2+160,h//2+60)),(x,y+20));dr.text((x+3,y+3),p.stem,fill='white')
 out.save(D/f'final-{vp}-{arena}-{look}-sequence.png')

for vp in ['desktop','mobile']:
 out=Image.new('RGB',(640,1200),'#171717');dr=ImageDraw.Draw(out)
 for row,(arena,slot) in enumerate([(a,s) for a in ['bosque','infernal'] for s in range(3)]):
  for col,kind in enumerate(['parent','before']):
   p=D/('paired-'+vp)/f'{arena}-base-dense-h{slot}-160-{kind}.png';im=Image.open(p);w,h=im.size
   out.paste(im.crop((w//2-160,h//2-120,w//2+160,h//2+60)),(col*320,row*200+20));dr.text((col*320+3,row*200+3),f'{vp} {arena} H{slot+1} {kind}',fill='white')
 out.save(D/f'paired-{vp}-review.png')
