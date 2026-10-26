from PIL import Image,ImageDraw
from pathlib import Path
D=Path(__file__).resolve().parent
for v in ['mobile','desktop','shears-desktop']:
 fs=sorted((D/v).glob('*dense-*-350-before.png' if v!='shears-desktop' else '*dense-*-300-before.png'))
 if not fs:continue
 out=Image.new('RGB',(1280,200*((len(fs)+3)//4)),'#171717');dr=ImageDraw.Draw(out)
 for i,p in enumerate(fs):
  im=Image.open(p);w,h=im.size;x=i%4*320;y=i//4*200;out.paste(im.crop((w//2-160,h//2-100,w//2+160,h//2+80)),(x,y+20));dr.text((x+3,y+3),p.stem.replace('-dense','').replace('-before',''),fill='white')
 out.save(D/(v+'-review.png'))
