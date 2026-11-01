"""Extrae las tres figuras de la «BASE PARA SPRITES» (frente/lado/espalda) del Códice (solo numpy/PIL).
Localiza cada figura con un umbral de contraste y recorta su alfa por inundación desde el borde de la caja, de modo que
el pelo/ropa OSCUROS del interior no se pierdan (un umbral simple los borraba)."""
import numpy as np
from PIL import Image
TOL=34
def runs(mask,gap):
    idx=np.where(mask)[0]
    if not len(idx): return []
    out=[];s=p=idx[0]
    for i in idx[1:]:
        if i-p>gap: out.append((s,p+1)); s=i
        p=i
    out.append((s,p+1)); return out
def flood_alpha(rgb,bg):
    near=np.abs(rgb-bg).sum(2)<=TOL; reach=np.zeros_like(near)
    reach[0,:]=near[0,:]; reach[-1,:]=near[-1,:]; reach[:,0]=near[:,0]; reach[:,-1]=near[:,-1]
    while True:
        n=reach.copy(); n[1:]|=reach[:-1]; n[:-1]|=reach[1:]; n[:,1:]|=reach[:,:-1]; n[:,:-1]|=reach[:,1:]; n&=near
        if (n==reach).all(): return ~reach
        reach=n
def figures(path):
    im=Image.open(path).convert('RGB'); w,h=im.size
    x0,y0=int(w*.44),int(h*.30); panel=im.crop((x0,y0,w,int(h*.74))); a=np.asarray(panel).astype(int)
    bg=np.median(a.reshape(-1,3),axis=0); fg=np.abs(a-bg).sum(2)>70
    rows=fg.mean(1); fg[rows>0.55]=False                 # línea de suelo / separadores
    cols=fg.sum(0)>2; out=[]
    for xa,xb in runs(cols,14):
        if xb-xa<40: continue
        sub=fg[:,xa:xb]
        rr=runs(sub.sum(1)>0,8); rr=max(rr,key=lambda r:(sub[r[0]:r[1]].sum()))
        ya,yb=rr
        if yb-ya<60: continue
        m=4; xa2,xb2,ya2,yb2=max(0,xa-m),min(a.shape[1],xb+m),max(0,ya-m),min(a.shape[0],yb+m)
        box=a[ya2:yb2,xa2:xb2]; alpha=flood_alpha(box,bg)
        # quitar la línea de suelo (filas muy anchas) conservando solo componentes que tocan la figura localizada
        alpha[:ya-ya2][:, :]&=alpha[:ya-ya2]
        px=np.asarray(panel.crop((xa2,ya2,xb2,yb2)).convert('RGBA')).copy(); px[~alpha,3]=0
        out.append(Image.fromarray(px))
    return out[:3]
if __name__=='__main__':
    import sys
    for k in sys.argv[1:]:
        f=figures(f'assets/ui/codex/champions/{k}.png'); print(k,[x.size for x in f])
