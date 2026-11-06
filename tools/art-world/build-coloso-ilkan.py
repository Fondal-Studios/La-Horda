#!/usr/bin/env python3
"""Coloso de Arena de Ilkan como ESPÍRITU/AVATAR de arena (estilo Susanoo): 6 poses generadas con Runway (art-source/runway-guardians/ilkan_coloso/s_*) a partir del Códice de Ilkan.
Quita el fondo, reduce a escala nativa y arma el atlas 148x136 (8 cols) con los MISMOS índices de cuadros que el atlas anterior
(idle 20-21, walk_side 22-24, walk_up 25-27, atk 28-30, sismo 6-9, terremoto 10-13, march 0-4, roar 5, tf 14-19).
Salida: art-source/runway-guardians/ilkan_coloso/atlas-candidato/colossus.png"""
import os,sys,numpy as np
from PIL import Image
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))+'/'
exec(open(os.path.join(os.path.dirname(__file__),'_key.py')).read()); DUST=False
W,H=148,136; TH=120; FOOT=130
def get(n,flip=False):
    im=native(key(Image.open(R+f'art-source/runway-guardians/ilkan_coloso/{n}/master.png')),TH)
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im
def cell(sp,dx=0,dy=0,sy=1.0,sx=1.0,rot=0,crop=None,alpha=1.0):
    s=sp
    if crop is not None: s=s.crop((0,int(s.height*(1-crop)),s.width,s.height))
    if sx!=1 or sy!=1: s=s.resize((max(1,int(s.width*sx)),max(1,int(s.height*sy))),Image.NEAREST)
    if rot: s=s.rotate(rot,expand=True,resample=Image.NEAREST)
    if alpha<1: a=np.asarray(s).copy(); a[:,:,3]=(a[:,:,3]*alpha).astype(np.uint8); s=Image.fromarray(a,'RGBA')
    c=Image.new('RGBA',(W,H),(0,0,0,0)); c.alpha_composite(s,((W-s.width)//2+dx,FOOT-s.height+dy)); return c
front,side,back,golpe,roar,atk=get('s_frente4'),get('s_lado4',True),get('s_espalda4'),get('s_golpe'),get('s_rugido4'),get('s_ataque4')
side5,back5,atk5,golpe5=get('s_lado5',True),get('s_espalda5'),get('s_ataque5'),get('s_golpe5')
F={}
for i,(dy,sy) in enumerate([(0,1.0),(-3,1.0)]): F[20+i]=cell(front,dy=dy,sy=sy)
for i,(sp,dy) in enumerate([(side,0),(side5,-4),(side,0)]): F[22+i]=cell(sp,dy=dy)
for i,(sp,dy) in enumerate([(back,0),(back5,-4),(back,0)]): F[25+i]=cell(sp,dy=dy)
for i,(dx,dy,rot) in enumerate([(-4,0,0),(0,-3,0),(4,0,0)]): F[28+i]=cell(atk,dx=dx*(i==2) ,dy=dy,rot=0)
F[28]=cell(front,dy=0); F[29]=cell(atk,dy=-3); F[30]=cell(atk5,dx=2,dy=1)
for i,(sp,dy) in enumerate([(side,0),(side5,-3),(side,-5),(side5,-3),(side,0)]): F[i]=cell(sp,dy=dy)
F[5]=cell(roar)
for i,(sp,dy,sy) in enumerate([(golpe,0,1.0),(golpe5,-2,1.0),(golpe,2,0.96),(golpe5,4,0.93)]): F[6+i]=cell(sp,dy=dy,sy=sy)
for i,(sp,dx,dy) in enumerate([(golpe5,-2,3),(golpe,2,3),(golpe5,-3,4),(golpe,3,4)]): F[10+i]=cell(sp,dx=dx,dy=dy,sy=0.94)
for i,c in enumerate([0.18,0.36,0.55,0.75,0.9,1.0]): F[14+i]=cell(front,crop=c,dy=0) if c<1 else cell(front)
F[31]=cell(front)
atlas=Image.new('RGBA',(W*8,H*4),(0,0,0,0))
for k,c in F.items(): atlas.alpha_composite(c,((k%8)*W,(k//8)*H))
out=R+'art-source/runway-guardians/ilkan_coloso/atlas-candidato/'; os.makedirs(out,exist_ok=True); atlas.save(out+'colossus.png',optimize=True); print(atlas.size,len(F))
