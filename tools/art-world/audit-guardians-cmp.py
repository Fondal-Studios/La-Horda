import glob,os,sys,json
from PIL import Image, ImageDraw
import numpy as np
R='/home/user/La-Horda/'
S='/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/tx/'
ids=sorted(os.path.basename(f)[:-4] for f in glob.glob(R+'assets/ui/codex/champions/*.png'))
def atlas_for(c):
    for rel in ('codex-v2/atlas.png','v2/atlas.png','atlas.png'):
        p=R+f'assets/sprites/champions/{c}/{rel}'
        if os.path.exists(p): return p,rel
    cands=[p for p in glob.glob(R+f'assets/sprites/champions/{c}/**/atlas.png',recursive=True) if '/skins/' not in p]
    return (cands[0],os.path.relpath(cands[0],R+f'assets/sprites/champions/{c}')) if cands else (None,None)
def first_sprite(im):
    a=np.asarray(im.convert('RGBA'))[:,:,3]>40
    H,W=a.shape
    top=a[:min(H,300),:]
    cols=top.any(axis=0)
    xs=np.where(cols)[0]
    if len(xs)==0: return im.crop((0,0,128,128))
    x0=xs[0]; x1=x0
    gap=0
    for x in range(x0,W):
        if cols[x]: x1=x; gap=0
        else:
            gap+=1
            if gap>=6: break
    rows=a[:min(H,300),x0:x1+1].any(axis=1); ys=np.where(rows)[0]
    y0,y1=ys[0],ys[-1]
    return im.crop((max(0,x0-4),max(0,y0-4),min(W,x1+5),min(H,y1+5)))
rows=[]
for c in ids:
    cod=Image.open(R+f'assets/ui/codex/champions/{c}.png').convert('RGBA')
    f=cod.crop((880,270,1150,640))
    p,rel=atlas_for(c)
    if p:
        at=Image.open(p).convert('RGBA'); r=first_sprite(at)
    else: r=Image.new('RGBA',(64,64),(80,0,0,255)); rel='SIN ATLAS'
    rows.append((c,f,r,rel,Image.open(p).size if p else None))
def bg(im,h):
    b=Image.new('RGBA',im.size,(40,36,48,255)); b.alpha_composite(im); b=b.convert('RGB'); s=h/b.height; return b.resize((max(1,int(b.width*s)),h),Image.NEAREST)
H=150; per=int(sys.argv[1]) if len(sys.argv)>1 else 12
for k in range(0,len(rows),per):
    chunk=rows[k:k+per]; cols=4; cw=2*170+30
    rws=(len(chunk)+cols-1)//cols
    W=Image.new('RGB',(cols*cw,rws*(H+22)),(18,18,22)); d=ImageDraw.Draw(W)
    for i,(c,f,r,rel,sz) in enumerate(chunk):
        x=(i%cols)*cw; y=(i//cols)*(H+22)
        a=bg(f,H); b=bg(r,H)
        W.paste(a.crop((0,0,min(a.width,170),H)),(x,y+14)); W.paste(b.crop((0,0,min(b.width,170),H)),(x+180,y+14))
        d.text((x+2,y+1),f'{c}  [{rel}]',fill=(230,200,120))
    W.save(S+f'champs_{k//per+1}.png')
json.dump([(c,rel,sz) for c,_,_,rel,sz in rows],open(S+'champs_idx.json','w'))
print(len(rows),'campeones;',(len(rows)+per-1)//per,'láminas')
