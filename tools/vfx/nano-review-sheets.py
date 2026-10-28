from pathlib import Path
from PIL import Image,ImageDraw
D=Path('art-source/entregas/nano-gm-kit-20261026/cierre-02')
for name in ['ng_decree','ng_burst_d','ng_verdict','ng_law']:
 ims=[Image.open(p).convert('RGBA') for p in sorted((D/'native').glob(name+'-*.png'))];w,h=ims[0].size;out=Image.new('RGBA',(w*len(ims),h))
 for i,im in enumerate(ims):out.paste(im,(i*w,0))
 out.save(D/(name+'-atlas.png'))
for side in ['mobile','desktop']:
 subs=[side,'rest-'+side,'looks-'+side]
 for group,arenas in enumerate([['bosque','infernal','hielo'],['laberinto','acuatica','minas']]):
  sheet=Image.new('RGB',(2000,1584),'#181818');dr=ImageDraw.Draw(sheet)
  for row,(arena,slot) in enumerate([(a,s) for a in arenas for s in [0,2]]):
   for col,look in enumerate(['base','gear','skin','regent','monster']):
    name=f'{arena}-{look}-dense-h{slot}-256-before.png';p=next(D/sub/name for sub in subs if (D/sub/name).exists());im=Image.open(p);w,h=im.size
    crop=im.crop((w//2-140,h//2-140,w//2+260,h//2+100));x=400*col;y=264*row;sheet.paste(crop,(x,y+24));dr.text((x+4,y+6),f'{arena} {look} H{slot+1} 256ms',fill='white')
  sheet.save(D/f'review-{side}-{group}.png')
for sub,look,slot in [('evolved-mobile','monster',2),('temporal-mobile','base',0),('temporal-mobile','monster',2)]:
 paths=[D/sub/f'infernal-{look}-sparse-h{slot}-{t}-before.png' for t in [64,160,256,416,640,800]]
 sheet=Image.new('RGB',(1688,1242),'#171717');dr=ImageDraw.Draw(sheet)
 for i,p in enumerate(paths):
  x=i%2*844;y=i//2*414;sheet.paste(Image.open(p),(x,y+24));dr.text((x+6,y+6),p.name,fill='white')
 sheet.save(D/f'review-{sub}-h{slot}.png')
for sub,look,slot in [('temporal-mobile','base',0),('evolved-desktop','monster',2)]:
 paths=[D/sub/f'infernal-{look}-sparse-h{slot}-{t}-{key}.png' for t in [64,256,416] for key in ['parent','before']]
 ims=[Image.open(p).convert('RGB') for p in paths];w,h=ims[0].size;sheet=Image.new('RGB',(w*2,(h+24)*3),'#181818');dr=ImageDraw.Draw(sheet)
 for i,(p,im) in enumerate(zip(paths,ims)):
  x=i%2*w;y=i//2*(h+24);sheet.paste(im,(x,y+24));dr.text((x+4,y+5),p.name,fill='white')
 # Old corrupt PNG is preserved as explicit attempt, never overwrite it.
 if sub=='temporal-mobile':sheet.save(D/f'review-pair-{sub}-h{slot}.webp',lossless=True)
 else:sheet.save(D/f'review-pair-{sub}-h{slot}.png')
