"""Native-scale comparison sheets from actual renderer captures; no art approval."""
from pathlib import Path
import json, hashlib
from PIL import Image, ImageDraw
root=Path('art-source/entregas/brakk-kit-20261022/correccion-09')
out=root/'previews';out.mkdir(exist_ok=True)
for view in ['mobile','landscape']:
    vw,vh=(390,844) if view=='mobile' else (844,390)
    x,y=round(vw/2-110),round(vh/2-140)
    for arena in ['bosque','hielo','infernal','laberinto','acuatica','minas']:
        sheet=Image.new('RGB',(600,2620),'#20232a');g=ImageDraw.Draw(sheet)
        g.text((6,4),f'{view} {arena}: parent08 izquierda / candidato09 derecha; 336 ms reales',fill='white')
        for j,(look,density) in enumerate((l,d) for l in ['base','gear','alt1','croma','set'] for d in ['dense','sparse']):
            yy=20+j*260;g.text((6,yy+3),f'{look} / {density} — 1:1',fill='white')
            for col,key in enumerate(['without','before']):
                p=root/('matrix-'+view)/f'{arena}-{look}-{density}-h2-330-ab-{key}.png'
                im=Image.open(p);assert im.size==(vw,vh)
                sheet.paste(im.crop((x,y,x+300,y+240)),(col*300,yy+20))
        sheet.save(out/f'{view}-{arena}-1to1.png',optimize=True)
a=Image.open(root/'atlases/turret-deploy.png');b=Image.open('art-source/entregas/brakk-kit-20261022/correccion-08/kit/atlases/turret-deploy.png')
s=Image.new('RGBA',(768,168),'#20232a');g=ImageDraw.Draw(s);g.text((4,2),'Parent08: 12 cuadros / 64x64',fill='white');s.alpha_composite(b,(0,20));g.text((4,86),'Candidato09: 12 cuadros / 64x64',fill='white');s.alpha_composite(a,(0,104));s.save(out/'atlas-before-after-1to1.png')
index=[]
for p in sorted(root.rglob('*.png')):
    data=p.read_bytes();index.append({'path':str(p.relative_to(root)),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
(root/'GENERATED_PNG_INDEX.json').write_text(json.dumps({'note':'All generated PNG hashes; only selected native images and sheets are committed. Recipe reproduces full raster matrix.','files':index},indent=2)+'\n')
