from pathlib import Path
from PIL import Image,ImageDraw
D=Path('art-source/entregas/morveth-kit-20261022/correccion-02')
for tag,a,b in [('mobile','mobile-before','mobile-after'),('skin-mobile','skin-mobile-before','skin-mobile-after'),('horizontal','before','after')]:
 images=[Image.open(D/x/'morveth-2-500-full.png').convert('RGB') for x in [a,b]]
 out=Image.new('RGB',(images[0].width*2,images[0].height+24),'#202028');draw=ImageDraw.Draw(out)
 for i,im in enumerate(images):out.paste(im,(i*im.width,24));draw.text((i*im.width+8,6),'ANTES' if i==0 else 'CANDIDATO - NO INTEGRAR',fill='white')
 out.save(D/(tag+'-comparison.png'))
atlas=Image.open(D/'atlases/mycelium-arena-variants.png');sheet=Image.new('RGBA',(420,18*64),'#252632');dr=ImageDraw.Draw(sheet)
import json
for row in json.loads((D/'matrix.json').read_text())['rows']:
 y=row['row']*64;dr.text((4,y+24),row['arena']+(row['variant'] or ' base'),fill='white')
 for i,f in enumerate([0,6,12]):
  im=atlas.crop((f*48,row['row']*56,(f+1)*48,(row['row']+1)*56));sheet.alpha_composite(im,(150+i*85,y+4))
sheet.convert('RGB').save(D/'atlas-preview.png')
