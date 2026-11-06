#!/usr/bin/env python3
"""Atlas de Libertador con el diseño del Códice (mismas grillas e índices que los atlas actuales: v2/atlas.png 103x98 x8 cols, v3/motion.png 112x112 x12,
v2/death.png 112x112 x4). Fuentes: art-source/runway-guardians/libertador/{ref_frente,ref_lado,ref_espalda,p_*}/master.png (Runway). Animación procedural.
Salida: art-source/runway-guardians/libertador/atlas-candidato/{atlas,motion,death}.png"""
import os,numpy as np
from PIL import Image
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))+'/'
exec(open(os.path.join(os.path.dirname(__file__),'_key.py')).read()); DUST=True
def get(n,th,maxw=None,flip=False):
    im=native(key(Image.open(R+f'art-source/runway-guardians/libertador/{n}/master.png')),th)
    if maxw and im.width>maxw: im=native(im,max(40,int(th*maxw/im.width)))
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im
def cell(sp,W,H,foot,dx=0,dy=0,rot=0,flash=0,sy=1.0,alpha=1.0):
    s=sp
    if alpha<1:
        a=np.asarray(s).copy(); a[:,:,3]=(a[:,:,3]*alpha).astype(np.uint8); s=Image.fromarray(a,'RGBA')
    if sy!=1: s=s.resize((s.width,max(1,int(s.height*sy))),Image.NEAREST)
    if rot: s=s.rotate(rot,expand=True,resample=Image.NEAREST)
    if flash:
        a=np.asarray(s).astype(int); m=a[:,:,3]>0; a[m,:3]=np.clip(a[m,:3]+flash,0,255); s=Image.fromarray(a.astype(np.uint8),'RGBA')
    c=Image.new('RGBA',(W,H),(0,0,0,0)); c.alpha_composite(s,((W-s.width)//2+dx,foot-s.height+dy)); return c
W,H,FOOT=103,98,92
CW=W-2
front=get('ref_frente',76,CW); side=get('ref_lado',76,CW); back=get('ref_espalda',76,CW)
P={'aim':get('p_aim',74,CW),'reload':get('p_reload',76,CW),'pre':get('p_bayo_pre',76,CW),'emb':get('p_bayo_emb',72,CW),'imp':get('p_bayo_imp',66,CW),
   'rem':get('p_bayo_rem',72,CW),'cmd':get('p_command',80,CW),'ult':get('p_ult_cast',82,CW)}
F={}
def put(i,sp,**k): F[i]=cell(sp,W,H,FOOT,**k)
for i,dy in enumerate([0,-1,0,-1]): put(i,P['aim'],dy=dy)
for i,dx in enumerate([0,2,4,2]): put(4+i,P['emb'],dx=dx)
for i,dx in enumerate([0,3,6,3]): put(8+i,P['imp'],dx=dx)
for i,dy in enumerate([0,-1,0,-1]): put(12+i,P['pre'],dy=dy)
for i,dx in enumerate([0,-1,-2,-1]): put(16+i,P['rem'],dx=dx)
for i,dy in enumerate([0,-2,-4,-2,0]): put(20+i,P['cmd'],dy=dy)
for i,dy in enumerate([0,-1,-2,-1,0]): put(25+i,P['cmd'],dy=dy)
for i,dx in enumerate([0,-4,-2,0]): put(30+i,P['aim'],dx=dx)
for i,dy in enumerate([0,-1,0,-1]): put(34+i,front,dy=dy)
for i,(dx,dy) in enumerate([(0,0),(1,-1),(0,-2),(-1,-1),(0,0),(1,-1)]): put(38+i,P['reload'],dx=dx,dy=dy)
put(44,P['ult'])
for i,dy in enumerate([0,-2,0,-2]): put(45+i,front,dy=dy)
sideL=side.transpose(Image.FLIP_LEFT_RIGHT)
for i,dy in enumerate([0,-2,0,-2]): put(49+i,sideL,dy=dy)
for i,dy in enumerate([0,-2,0,-2]): put(53+i,side,dy=dy)
for i,dy in enumerate([0,-2,0,-2]): put(57+i,back,dy=dy)
atlas=Image.new('RGBA',(W*8,H*8),(0,0,0,0))
for k,c in F.items(): atlas.alpha_composite(c,((k%8)*W,(k//8)*H))
out=R+'art-source/runway-guardians/libertador/atlas-candidato/'; os.makedirs(out,exist_ok=True); atlas.save(out+'atlas.png',optimize=True)
# motion (112x112, 12 cols, 1 fila): idle/walk down 0-3, side 4-7, up 8-11
MW=MH=112; M=Image.new('RGBA',(MW*12,MH),(0,0,0,0))
for base,sp in ((0,front),(4,side),(8,back)):
    for i,dy in enumerate([0,-2,0,-2]): M.alpha_composite(cell(sp,MW,MH,106,dy=dy),((base+i)*MW,0))
M.save(out+'motion.png',optimize=True)
# caída (112x112 x4)
D=Image.new('RGBA',(MW*4,MH),(0,0,0,0))
for i,(dy,rot) in enumerate([(0,0),(4,35),(10,65),(15,90)]): D.alpha_composite(cell(front,MW,MH,106,dy=dy,rot=rot),(i*MW,0))
D.save(out+'death.png',optimize=True); print('ok',atlas.size,M.size,D.size)
# ---- caballo con jinete (125x102, 8 cols): charge 0-4, dismount 5-8, mount 9-12, m_idle 13, m_atk 14-16, m_run 17(+1,2)
HW,HH,HF=125,102,96
def gh(n,th): return get(n,th,HW-2)
ch,mi,ma=gh('h_charge',88),gh('h_m_idle',90),gh('h_m_atk',90)
Hs={}
def hp(i,sp,**k): Hs[i]=cell(sp,HW,HH,HF,**k)
for i,dy in enumerate([0,-3,-5,-3,0]): hp(i,ch,dy=dy)
for i,a in enumerate([1.0,0.75,0.5,0.3]): hp(5+i,mi,alpha=a)          # desmontar: se desvanece
for i,a in enumerate([0.3,0.5,0.75,1.0]): hp(9+i,mi,alpha=a)                                 # montar
hp(13,mi)
for i,dx in enumerate([0,3,6]): hp(14+i,ma,dx=dx)
hp(17,ch,dy=-2)
HA=Image.new('RGBA',(HW*8,HH*3),(0,0,0,0))
for k,c in Hs.items(): HA.alpha_composite(c,((k%8)*HW,(k//8)*HH))
HA.save(out+'horse.png',optimize=True); print('horse',HA.size)
