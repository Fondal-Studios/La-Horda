#!/usr/bin/env python3
DUST=True
"""(base común) a partir de las 3 vistas generadas con Runway (art-source/runway-guardians/libertador/ref_*).
Quita el fondo (relleno desde los bordes), reduce a escala nativa y arma un atlas 112x112, 4 cols, con animación procedural
(vaivén de caminata, avance de ataque, destello de golpe, caída). Salida: art-source/runway-guardians/libertador/codex-v1-candidato/atlas.png (+ preview)."""
import os,numpy as np
from PIL import Image
from collections import deque
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))+'/'
CELL=148
def key(im):
    a=np.asarray(im.convert('RGB')).astype(int); h,w,_=a.shape
    bg=np.median(np.concatenate([a[:6].reshape(-1,3),a[-6:].reshape(-1,3)]),axis=0)
    near=(np.abs(a-bg).sum(2)<22); seen=np.zeros((h,w),bool); q=deque()
    for x in range(w):
        for y in (0,h-1):
            if near[y,x]: q.append((y,x)); seen[y,x]=True
    for y in range(h):
        for x in (0,w-1):
            if near[y,x] and not seen[y,x]: q.append((y,x)); seen[y,x]=True
    while q:
        y,x=q.popleft()
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+dy,x+dx
            if 0<=ny<h and 0<=nx<w and near[ny,nx] and not seen[ny,nx]: seen[ny,nx]=True; q.append((ny,nx))
    alpha=np.where(seen,0,255).astype(np.uint8)
    # quita el polvo del suelo (franja clara/tostada en el tercio inferior) y piezas sueltas chicas
    ys,xs=np.mgrid[0:h,0:w]; dust=DUST&(ys>h*0.84)&(a[:,:,0]>110)&(a[:,:,0]-a[:,:,2]>40)&(a[:,:,0]<230)
    lowest=np.where(((alpha>0)&~dust).any(1))[0]
    alpha[dust]=0
    out=np.dstack([a.astype(np.uint8),alpha]); im2=Image.fromarray(out,'RGBA')
    # componente mayor (8-conexo)
    m=np.asarray(im2.getchannel('A'))>0; lab=np.zeros((h,w),int); n=0; sizes={}
    for y in range(h):
        for x in range(w):
            if m[y,x] and not lab[y,x]:
                n+=1; lab[y,x]=n; qq=deque([(y,x)]); c=0
                while qq:
                    cy,cx=qq.popleft(); c+=1
                    for dy in (-1,0,1):
                        for dx in (-1,0,1):
                            ny,nx=cy+dy,cx+dx
                            if 0<=ny<h and 0<=nx<w and m[ny,nx] and not lab[ny,nx]: lab[ny,nx]=n; qq.append((ny,nx))
                sizes[n]=c
    keep=[k for k,v in sizes.items() if v>=0.01*max(sizes.values())]
    arr=np.asarray(im2).copy(); arr[~np.isin(lab,keep)]=0
    return Image.fromarray(arr,'RGBA')
def native(im,TARGET_H=84):
    bb=im.getbbox(); im=im.crop(bb); s=TARGET_H/im.height
    r=im.resize((max(1,round(im.width*s)),TARGET_H),Image.BOX)
    a=np.asarray(r).copy(); a[:,:,3]=np.where(a[:,:,3]>110,255,0); return Image.fromarray(a,'RGBA')
