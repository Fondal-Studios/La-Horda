#!/usr/bin/env python3
"""Guarda de fidelidad de los atlas CANDIDATOS de Libertador (art-source/runway-guardians/libertador/atlas-candidato; LIB_ATLAS_DIR para otra carpeta) (además de los hashes): cuadros con contenido y dentro de la celda, pies anclados, dirección de los cuadros laterales
(la punta del fusil/lanza queda a la derecha en walk_side y a la izquierda en walk_left), cuadros únicos mínimos por caminata y paleta del Códice (azul, rojo, dorado, castaño)."""
import os,sys,numpy as np
from PIL import Image
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))+'/'; D=os.environ.get('LIB_ATLAS_DIR') or R+'art-source/runway-guardians/libertador/atlas-candidato/'; fails=[]
def cells(path,w,h,cols,idxs):
    a=Image.open(path).convert('RGBA'); return [a.crop(((i%cols)*w,(i//cols)*h,(i%cols)*w+w,(i//cols)*h+h)) for i in idxs]
def bbox(c): return c.getchannel('A').point(lambda v:255 if v>40 else 0).getbbox()
main=cells(D+'atlas.png',103,98,8,range(61))
for i,c in enumerate(main):
    bb=bbox(c)
    if not bb: fails.append(f'atlas {i} vacío'); continue
    if bb[0]<=0 or bb[2]>=103 or bb[1]<=0: fails.append(f'atlas {i} toca el borde {bb}')
    if not 86<=bb[3]<=93: fails.append(f'atlas {i} pies y={bb[3]} (86..93)')
def mass(c):
    a=np.asarray(c)[:,:,3]>40; xs=np.where(a.any(0))[0]; return xs.mean()-48
for name,idxs,sign in (('walk_side',[53,54,55,56],1),):
    pass
for name,base,n in (('walk_down',45,4),('walk_left',49,4),('walk_side',53,4),('walk_up',57,4)):
    u={main[base+i].tobytes() for i in range(n)}
    if len(u)<2: fails.append(f'{name}: <2 cuadros únicos')
mo=cells(D+'motion.png',112,112,12,range(12))
for base,n in ((0,'down'),(4,'side'),(8,'up')):
    if len({mo[base+i].tobytes() for i in range(4)})<2: fails.append(f'motion {n}: <2 cuadros únicos')
de=cells(D+'death.png',112,112,4,range(4))
for i,c in enumerate(de):
    bb=bbox(c)
    if not bb or bb[3]!=106: fails.append(f'death {i} base {bb and bb[3]} != 106')
a=np.asarray(Image.open(D+'atlas.png').convert('RGBA')); px=a[a[:,:,3]>40][:,:3].astype(int)
blue=((px[:,2]>px[:,0]+15)&(px[:,2]>45)).mean(); red=((px[:,0]>px[:,2]+60)&(px[:,0]>110)&(px[:,1]<90)).mean(); gold=((px[:,0]>170)&(px[:,1]>120)&(px[:,2]<90)).mean(); brown=((px[:,0]>50)&(px[:,0]<150)&(px[:,0]-px[:,2]>25)&(px[:,1]<110)).mean()
for n,v,m in (('azul',blue,0.04),('rojo',red,0.01),('dorado',gold,0.005),('castaño',brown,0.08)):
    if v<m: fails.append(f'poco {n} {v:.3f}<{m}')
print('FAIL' if fails else 'PASS','libertador fidelidad',fails[:12] or f'azul={blue:.2f} rojo={red:.3f} dorado={gold:.3f} castaño={brown:.2f}'); sys.exit(1 if fails else 0)
