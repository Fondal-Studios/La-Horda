from PIL import Image
import numpy as np, sys
W=112
im=Image.open('assets/sprites/champions/cazadora/skins/cazadora_escarcha/atlas.png').convert('RGBA')
base=im.crop((0,0,W,W))
a=np.array(base)
Y0=97   # feet start row (below hem)
def region(x0,x1):
    m=np.zeros((W,W),bool); m[Y0:,x0:x1]=True; return m&(a[:,:,3]>0)
Lm=region(34,53); Rm=region(53,76)
def layer(mask):
    l=np.zeros_like(a); l[mask]=a[mask]; return Image.fromarray(l)
Lb,Rb=layer(Lm),layer(Rm)
up=a.copy(); up[Lm|Rm]=0; upper=Image.fromarray(up)
def comp(dyU,L,R):
    f=Image.new('RGBA',(W,W),(0,0,0,0))
    f.alpha_composite(upper,(0,dyU))
    for lay,(dx,dy) in ((Lb,L),(Rb,R)):
        f.alpha_composite(lay,(dx,dy))
    return f
# (upper dy, left foot (dx,dy), right foot (dx,dy)); lifted foot swings toward centre
phases=[
 (0,(0,1),(-2,-3)),   # A: L planted forward, R lifted
 (-1,(1,0),(-1,0)),   # pass (body high)
 (0,(2,-3),(0,1)),    # B: R planted, L lifted
 (-1,(1,0),(-1,0)),
]
frames=[comp(*p) for p in phases]
frames[1]=comp(0,(1,0),(-1,0)); frames[3]=comp(0,(1,0),(-1,0))
if __name__=='__main__':
    S=sys.argv[1]
    sc=4
    sheet=Image.new('RGBA',(W*sc*5,W*sc),(40,40,40,255))
    for i,f in enumerate([base]+frames):
        g=f.resize((W*sc,W*sc),Image.NEAREST); sheet.paste(g,(i*W*sc,0),g)
    sheet.save(S+'/layered_walk_sheet.png')
    bg=lambda f:(lambda c:(c.paste(f,(0,0),f),c)[1])(Image.new('RGBA',(W,W),(40,40,40,255)))
    seq=[frames[i] for i in (0,1,2,3)]
    gif=[bg(f).resize((W*3,W*3),Image.NEAREST).convert('P') for f in seq]
    gif[0].save(S+'/layered_walk.gif',save_all=True,append_images=gif[1:],duration=150,loop=0)
    # export 4 frames as strip atlas for later
    strip=Image.new('RGBA',(W*4,W))
    for i,f in enumerate(frames): strip.paste(f,(i*W,0))
    strip.save(S+'/layered_walk_strip.png')
