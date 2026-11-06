#!/usr/bin/env python3
"""Atlas de la Profeta con el diseño del Códice (capucha dorada/azul con venda, túnica crema y azul marino, báculo de luna creciente). Misma grilla e índices que
assets/sprites/champions/profeta/v2/atlas.png (93x133, 8 cols, 5 filas). Fuentes: art-source/runway-guardians/profeta/pf_*/master.png (Runway, con las poses viejas como @pose).
Salida: art-source/runway-guardians/profeta/atlas-candidato/atlas.png"""
import os,numpy as np
from PIL import Image
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))+'/'
exec(open(os.path.join(os.path.dirname(__file__),'_key.py')).read()); DUST=True
W,H,FOOT=93,133,121
def get(n,th,maxw=89):
    im=native(key(Image.open(R+f'art-source/runway-guardians/profeta/{n}/master.png')),th)
    if im.width>maxw: im=native(im,max(40,int(th*maxw/im.width)))
    return im
def cell(sp,dx=0,dy=0,rot=0,alpha=1.0,flash=0):
    s=sp
    if rot: s=s.rotate(rot,expand=True,resample=Image.NEAREST); s=s.crop(s.getbbox())
    if alpha<1: a=np.asarray(s).copy(); a[:,:,3]=(a[:,:,3]*alpha).astype(np.uint8); s=Image.fromarray(a,'RGBA')
    if flash:
        a=np.asarray(s).astype(int); m=a[:,:,3]>0; a[m,:3]=np.clip(a[m,:3]+flash,0,255); s=Image.fromarray(a.astype(np.uint8),'RGBA')
    c=Image.new('RGBA',(W,H),(0,0,0,0)); c.alpha_composite(s,((W-s.width)//2+dx,FOOT-s.height+dy)); return c
idle=get('pf_idle',86); walk=get('pf_walk',86); side=get('pf_side',83); swalk=get('pf_sidewalk',83); up=get('pf_up2',86)
atk=get('pg_attack2',83); atk0=get('pf_attack',83); wd2=get('pg_wd2',86); cast2=get('pg_cast2',94); cast=get('pf_cast',86); hit=get('pf_hit',85); death=get('pf_death',48,89); kneel=get('pg_death1',66)
mir=lambda s:s.transpose(Image.FLIP_LEFT_RIGHT)
F={}
def put(i,sp,**k): F[i]=cell(sp,**k)
idle2=get('pg_idle2',86)
for i,(sp,dy) in enumerate([(idle,0),(idle,-1),(idle2,0),(idle2,-1)]): put(17+i,sp,dy=dy)
for i,sp in enumerate([walk,idle,wd2,idle]): put(21+i,sp)
for i,sp in enumerate([mir(swalk),mir(side),mir(swalk),mir(side)]): put(25+i,sp)
for i,sp in enumerate([swalk,side,swalk,side]): put(29+i,sp)
for i,dy in enumerate([0,-1,0,-1]): put(33+i,up,dy=dy)
for i,(sp,dx) in enumerate([(atk0,0),(atk,2),(atk,4),(atk0,2)]): put(0+i,sp,dx=dx)
for i,(sp,dy) in enumerate([(cast,0),(cast2,-2),(cast,-3)]): put(4+i,sp,dy=dy)
for i,(dx,fl) in enumerate([(-2,45),(-3,25),(-2,10),(0,0)]): put(13+i,hit,dx=dx,flash=fl)
for i,(sp,rot,dy) in enumerate([(hit,0,0),(kneel,0,0),(kneel,0,0),(kneel,28,0),(death,0,0),(death,0,0)]): put(7+i,sp,rot=rot,dy=dy)
atlas=Image.new('RGBA',(W*8,H*5),(0,0,0,0))
for k,c in F.items(): atlas.alpha_composite(c,((k%8)*W,(k//8)*H))
out=R+'art-source/runway-guardians/profeta/atlas-candidato/'; os.makedirs(out,exist_ok=True); atlas.save(out+'atlas.png',optimize=True); print(atlas.size,len(F))
