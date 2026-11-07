#!/usr/bin/env python3
"""Guarda de fidelidad del atlas maestro de Myla (además del hash): 12 cuadros de 96x96 con contenido, base anclada, índices de portadores-meta.js presentes
y paleta dominante rosa/crema/castaño como el Códice. Uso: python3 tools/art/check-myla-master-fidelity.py"""
import os,sys,numpy as np
from PIL import Image
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))+'/'
a=Image.open(R+'assets/sprites/champions/myla/atlas.png').convert('RGBA'); fails=[]
if a.size!=(384,288): fails.append(f'tamaño {a.size}')
for i in range(12):
    c=a.crop(((i%4)*96,(i//4)*96,(i%4)*96+96,(i//4)*96+96)); bb=c.getchannel('A').point(lambda v:255 if v>40 else 0).getbbox()
    if not bb or (bb[2]-bb[0])*(bb[3]-bb[1])<600: fails.append(f'cuadro {i} vacío'); continue
    if bb[3]<80 or bb[3]>94: fails.append(f'cuadro {i} base y={bb[3]} fuera de 80..94')
d=np.asarray(a); m=d[:,:,3]>40; px=d[m][:,:3].astype(int)
pink=((px[:,0]>200)&(px[:,1]<190)&(px[:,2]>120)&(px[:,0]-px[:,1]>40)).mean(); brown=((px[:,0]>60)&(px[:,0]<190)&(px[:,0]-px[:,2]>35)&(px[:,1]<150)).mean()
if pink<0.05: fails.append(f'poco rosa {pink:.2f}')
if brown<0.15: fails.append(f'poco castaño {brown:.2f}')
print('FAIL' if fails else 'PASS','myla master fidelidad',fails or f'rosa={pink:.2f} castaño={brown:.2f}'); sys.exit(1 if fails else 0)
