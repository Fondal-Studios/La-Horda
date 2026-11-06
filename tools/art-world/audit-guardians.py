import glob,os,json,subprocess,re
import numpy as np
from PIL import Image
R='/home/user/La-Horda/'
exec(open('/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/champ_cmp.py').read().split("rows=[]")[0])
def pal(arr,k=12):
    im=Image.fromarray(arr.reshape(1,-1,3).astype(np.uint8)).quantize(k,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
    p=np.array(im.getpalette()[:k*3]).reshape(-1,3); idx=np.asarray(im).ravel(); w=np.bincount(idx,minlength=k)[:len(p)]/len(idx)
    return p.astype(float),w
def cham(a,wa,b,wb):
    d=np.sqrt(((a[:,None,:]-b[None,:,:])**2).sum(-1))
    return float((wa*d.min(1)).sum()+(wb*d.min(0)).sum())/2
res=[]
for c in ids:
    cod=Image.open(R+f'assets/ui/codex/champions/{c}.png').convert('RGB').crop((880,270,1150,640))
    a=np.asarray(cod).reshape(-1,3).astype(int)
    bgc=np.array([36,32,30]); m=(np.abs(a-bgc).sum(1)>70)&(a.sum(1)>120)
    ca=a[m]
    p,rel=atlas_for(c)
    if p is None or len(ca)<200: res.append((c,rel,None,None,None)); continue
    rt=first_sprite(Image.open(p).convert('RGBA')); ra=np.asarray(rt); ma=ra[:,:,3]>40; rb=ra[:,:,:3][ma].astype(int)
    # contorno oscuro: excluir píxeles casi negros en ambos
    ca=ca[ca.sum(1)>150]; rb=rb[rb.sum(1)>150]
    pc,wc=pal(ca); pr,wr=pal(rb)
    d=cham(pc,wc,pr,wr)
    # tamaño en píxeles del sprite del juego
    res.append((c,rel,round(d,1),rt.size[1],int(ma.sum())))
# PR -> campeones
prs={271:'fix/campaign-start-visible',270:'art/thalen-codex-close-20261105',268:'art/production-checkpoint-20261103',267:'fix/aelith-recovered-cast-20261102',259:'art/sylva-layered-walk-prototype',241:'fix/recover-generated-art-20261029',232:'feature/fondal-art-engine',231:'art/nano-impact-contract-20261026',90:'claude/siete-campeones',239:'fix/codex-install-and-owned-roster-20261029',253:'claude/art-factory-2',249:'feature/beta-build-evolution',250:'feature/beta-premium-skins'}
touch={}
for n,br in prs.items():
    try: files=subprocess.run(['git','diff','--name-only',f'origin/main...origin/{br}'],cwd=R,capture_output=True,text=True).stdout.split('\n')
    except Exception: files=[]
    for c in ids:
        k=[f for f in files if re.search(r'(champions|art-source)[^ ]*/'+re.escape(c)+r'([/_.-]|$)',f) or ('/'+c+'-') in f or ('/'+c+'/') in f]
        if k: touch.setdefault(c,[]).append((n,len(k)))
out=[]
for c,rel,d,h,px in sorted(res,key=lambda x:-(x[2] if x[2] is not None else -1)):
    out.append(dict(champ=c,atlas=rel,paletteDist=d,spritePx=h,pixels=px,prs=touch.get(c,[])))
json.dump(out,open('/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/tx/champ_metric.json','w'),indent=1)
for o in out: print(f"{o['champ']:11} dist={o['paletteDist']}  alto={o['spritePx']}  px={o['pixels']}  PRs={o['prs']}")
