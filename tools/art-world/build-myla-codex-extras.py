#!/usr/bin/env python3
"""Myla con el diseño del Códice: (1) caída v2/death.png (4 cuadros 112x112) a partir de las poses Runway art-source/runway-guardians/myla/d1,d2 y el maestro #259;
(2) croma «Yogur de Arándanos» recoloreada (rosa -> lila) desde el atlas maestro nuevo. Salida: sobrescribe assets/sprites/champions/myla/v2/death.png y cromas/myla_arandanos/atlas.png"""
import os,colorsys,numpy as np
from PIL import Image
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))+'/'
exec(open(os.path.join(os.path.dirname(__file__),'_key.py')).read()); DUST=False
def spr(n,th):
    return native(key(Image.open(R+f'art-source/runway-guardians/myla/{n}/master.png')),th)
def place(s,W,H,foot,dx=0):
    c=Image.new('RGBA',(W,H),(0,0,0,0)); c.alpha_composite(s,((W-s.width)//2+dx,foot-s.height)); return c
M=Image.open(R+'assets/sprites/champions/myla/atlas.png').convert('RGBA'); idle=M.crop((0,0,96,96)); idle=idle.crop(idle.getbbox())
f0=idle.rotate(8,expand=True,resample=Image.NEAREST,fillcolor=(0,0,0,0)); f0=f0.crop(f0.getbbox())
sit=spr('d2',62); lie=spr('d1',46)
fr=[place(f0,112,112,106),place(sit,112,112,106),place(lie,112,112,106),place(lie,112,112,106)]
D=Image.new('RGBA',(448,112),(0,0,0,0))
for i,c in enumerate(fr): D.alpha_composite(c,(i*112,0))
D.save(R+'assets/sprites/champions/myla/v2/death.png',optimize=True)
# croma: rosa -> lila (el tono castaño de pelo/piel/botas no se toca)
a=np.asarray(M).astype(float)/255; out=a.copy()
for y in range(a.shape[0]):
    for x in range(a.shape[1]):
        r,g,b,al=a[y,x]
        if al<0.1: continue
        h,s,v=colorsys.rgb_to_hsv(r,g,b); hd=h*360
        if s>0.18 and (hd>=300 or hd<=12) and v>0.45:
            h2=(268+(hd-330 if hd>=300 else hd+30)*0.25)%360/360; r2,g2,b2=colorsys.hsv_to_rgb(h2,min(1,s*0.95),v); out[y,x,:3]=(r2,g2,b2)
Image.fromarray((out*255).astype(np.uint8),'RGBA').save(R+'assets/sprites/champions/myla/cromas/myla_arandanos/atlas.png',optimize=True); print('ok')
