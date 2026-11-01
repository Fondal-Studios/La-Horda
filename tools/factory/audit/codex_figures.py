"""Extrae las tres figuras de la «BASE PARA SPRITES» (frente/lado/espalda) del Códice (solo numpy/PIL)."""
import numpy as np
from PIL import Image
def runs(mask,gap):
    idx=np.where(mask)[0]
    if not len(idx): return []
    out=[];s=p=idx[0]
    for i in idx[1:]:
        if i-p>gap: out.append((s,p+1)); s=i
        p=i
    out.append((s,p+1)); return out
def figures(path):
    im=Image.open(path).convert('RGB'); w,h=im.size
    x0,y0=int(w*.44),int(h*.30); panel=im.crop((x0,y0,w,int(h*.74))); a=np.asarray(panel).astype(int)
    bg=np.median(a.reshape(-1,3),axis=0); fg=np.abs(a-bg).sum(2)>70
    rows=fg.mean(1); fg[rows>0.55]=False                 # línea de suelo / separadores
    cols=fg.sum(0)>2; out=[]
    for xa,xb in runs(cols,14):
        if xb-xa<40: continue
        sub=fg[:,xa:xb]; ys=np.where(sub.sum(1)>0)[0]
        # el texto FRENTE/LADO queda debajo: cortar en el mayor hueco vertical
        rr=runs(sub.sum(1)>0,8); rr=max(rr,key=lambda r:(sub[r[0]:r[1]].sum()))
        ya,yb=rr
        if yb-ya<60: continue
        m=sub[ya:yb]; px=np.asarray(panel.crop((xa,ya,xb,yb)).convert('RGBA')).copy(); px[~m,3]=0
        out.append(Image.fromarray(px))
    return out[:3]
if __name__=='__main__':
    import sys
    for k in sys.argv[1:]:
        f=figures(f'assets/ui/codex/champions/{k}.png'); print(k,[x.size for x in f])
