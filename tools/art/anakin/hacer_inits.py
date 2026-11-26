import json,sys
from PIL import Image
S=sys.argv[1]
man=json.load(open(S+'/ref/world_manifest.json'))
BG=(150,150,150,255)
def cell(arena,name):
    im=Image.open(S+'/ref/assets_sprites_arenas_world-v1_%s.png'%arena).convert('RGBA')
    f=man[arena]['frames'][name]; c=im.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']))
    return c.crop(c.getbbox())
def init(arena,name,out,W=512,H=512,fill=0.78):
    c=cell(arena,name); k=min(W*fill/c.width,H*fill/c.height)
    c=c.resize((max(1,round(c.width*k)),max(1,round(c.height*k))),Image.NEAREST)
    b=Image.new('RGBA',(W,H),BG); b.alpha_composite(c,((W-c.width)//2,H-c.height-int(H*0.08)))
    b.convert('RGB').save(out); return out
# referencia de estilo: un cuadro limpio del pack hielo (pixel craft aprobado), sobre gris
ref=Image.new('RGBA',(512,512),BG); r=Image.open(S+'/ref/assets_sprites_arenas_world-v1_hielo.png').convert('RGBA'); ref.alpha_composite(r)
ref.convert('RGB').save(S+'/anakin/init/ref_world_hielo.png')
pares={'pillar':('hielo','pillar'),'shards':('hielo','shards'),'rock':('hielo','rock'),'cluster':('hielo','cluster'),'tree':('hielo','tree'),
 'pine':('hielo','pine'),'statue':('hielo','statue'),'gate':('hielo','gate'),'fire0':('hielo','fire0'),'fire1':('hielo','fire1'),'fire2':('hielo','fire2'),'fire3':('hielo','fire3'),
 'oak':('bosque','oak'),'ctrl':('bosque','ctrl'),'brock':('bosque','rock'),'bush0':('bosque','bush0')}
for k,(a,n) in pares.items(): init(a,n,S+'/anakin/init/%s.png'%k)
print('ok')
