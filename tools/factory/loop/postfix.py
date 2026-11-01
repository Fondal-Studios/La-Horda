#!/usr/bin/env python3
"""Correcciones deterministas por máscara/capa (sin gastar créditos), pedidas por el arquitecto:
  halo CHAMP ROOT SRC_CELL DST_CELL...   pega el halo (primera masa de píxeles, separada de la cabeza) de SRC sobre cada DST
  mask CHAMP ROOT CELL x0 y0 x1 y1       borra una región (p. ej. suelo dibujado)
Lee y escribe candidate_cell_<ronda>.png: el resultado se guarda como ronda 'pf' (original intacto). Env PICK=pick.json."""
import sys,os,json,numpy as np
from PIL import Image
cmd,champ,root=sys.argv[1:4];pick=json.load(open(os.environ['PICK']))['pick']
def path(i,r=None): return f'{root}/{champ}/f{i}/candidate_cell_{r or pick[str(i)]}.png'
def load(i): return np.array(Image.open(path(i)).convert('RGBA'))
def runs(a):
    rows=np.where((a[:,:,3]>40).any(1))[0];out=[];s=p=rows[0]
    for y in rows[1:]:
        if y!=p+1: out.append((s,p));s=y
        p=y
    out.append((s,p));return out
if cmd=='mask':
    i=int(sys.argv[4]);x0,y0,x1,y1=map(int,sys.argv[5:9]);a=load(i);a[y0:y1,x0:x1]=0;Image.fromarray(a).save(path(i,'pf'));print('mask',i)
elif cmd=='halo':
    # El halo es un aro fino claro sobre la cabeza que puede tocar el pelo: se separa por COLOR (claro) en las filas superiores,
    # no por una fila vacía. Se pega en cada destino a la misma distancia sobre la cabeza que en el origen.
    def lum(a): return a[:,:,:3].astype(int).sum(2)/3
    def hair_top(a):
        m=(a[:,:,3]>40)&(lum(a)<110); ys=np.where(m.any(1))[0]; return int(ys.min())
    s_=load(int(sys.argv[4]));ys=np.where((s_[:,:,3]>40).any(1))[0];top=int(ys.min());ht=hair_top(s_)
    zone=np.zeros(s_.shape[:2],bool);zone[top:ht+2]=True
    hm=zone&(s_[:,:,3]>40)&(lum(s_)>140);halo=np.zeros_like(s_);halo[hm]=s_[hm]
    hx=np.where(hm.any(0))[0];hc=(hx.min()+hx.max())/2;hy=np.where(hm.any(1))[0];h0=int(hy.min());gap=ht-h0
    for d in sys.argv[5:]:
        d=int(d);t=load(d);tht=hair_top(t);xs=np.where(((t[:,:,3]>40)&(lum(t)<110))[tht:tht+6].any(0))[0];tc=(xs.min()+xs.max())/2
        dy=(tht-gap)-h0;dx=int(round(tc-hc))
        if tht-gap<0: print('sin espacio para el halo en',d);continue
        for yy,xx in zip(*np.where(hm)):
            Y,X=yy+dy,xx+dx
            if 0<=Y<t.shape[0] and 0<=X<t.shape[1] and t[Y,X,3]<=40: t[Y,X]=halo[yy,xx]
        Image.fromarray(t).save(path(d,'pf'));print('halo',d,'dy',dy,'dx',dx)
