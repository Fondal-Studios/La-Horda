#!/usr/bin/env python3
"""Atlas de Libertador con el diseño del Códice (mismas grillas e índices que los atlas actuales: v2/atlas.png 103x98 x8 cols, v3/motion.png 112x112 x12,
v2/death.png 112x112 x4). Fuentes: art-source/runway-guardians/libertador/{ref_frente,ref_lado,ref_espalda,p_*}/master.png (Runway). Animación procedural.
Salida: art-source/runway-guardians/libertador/atlas-candidato/{atlas,motion,death}.png"""
import os,numpy as np
from PIL import Image
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))+'/'
exec(open(os.path.join(os.path.dirname(__file__),'_key.py')).read()); DUST=True; OUTLINE=True
def get(n,th,maxw=None,flip=False):
    im=native(key(Image.open(R+f'art-source/runway-guardians/libertador/{n}/master.png')),th)
    if maxw and im.width>maxw: im=native(im,max(40,int(th*maxw/im.width)))
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im
def cell(sp,W,H,foot,dx=0,dy=0,rot=0,flash=0,sy=1.0,alpha=1.0):
    s=sp
    if alpha<1:   # desvanecido por tramado ordenado (alfa binario: sin semitransparencias)
        a=np.asarray(s).copy(); hh,ww=a.shape[:2]; yy,xx=np.mgrid[0:hh,0:ww]
        bay=np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16.0
        a[:,:,3]=np.where(bay[yy%4,xx%4]<alpha,a[:,:,3],0); s=Image.fromarray(a,'RGBA')
    if sy!=1: s=s.resize((s.width,max(1,int(s.height*sy))),Image.NEAREST)
    if rot: s=s.rotate(rot,expand=True,resample=Image.NEAREST); s=s.crop(s.getbbox())
    if flash:
        a=np.asarray(s).astype(int); m=a[:,:,3]>0; a[m,:3]=np.clip(a[m,:3]+flash,0,255); s=Image.fromarray(a.astype(np.uint8),'RGBA')
    c=Image.new('RGBA',(W,H),(0,0,0,0)); c.alpha_composite(s,((W-s.width)//2+dx,foot-s.height+dy)); return c
W,H,FOOT=103,98,92
CW=W-2
front=get('ref_frente',76,CW); side=get('ref_lado',76,CW); back=get('ref_espalda',76,CW)
WK={k:get('w_'+k,76,CW) for k in ('wd1','wd3','ws1','ws3','wu1','wu3')}; WK['wu3']=get('w_wu2',76,CW)
P={'aim':get('p_aim',74,CW),'reload':get('p_reload',76,CW),'pre':get('p_bayo_pre',76,CW),'emb':get('p_bayo_emb',72,CW),'imp':get('p_bayo_imp',66,CW),
   'rem':get('p_bayo_rem',72,CW),'emb2':get('q_emb2',72,CW),'imp2':get('q_imp2',66,CW),'cmd2':get('q_cmd2',80,CW),'cmd':get('p_command',80,CW),'ult':get('p_ult_cast',82,CW)}
F={}
def put(i,sp,**k): F[i]=cell(sp,W,H,FOOT,**k)
for i,dy in enumerate([0,-1,0,-1]): put(i,P['aim'],dy=dy)
for i,(sp,dx) in enumerate([(P['emb'],0),(P['emb2'],2),(P['emb'],4),(P['emb2'],2)]): put(4+i,sp,dx=dx)
for i,(sp,dx) in enumerate([(P['imp'],0),(P['imp2'],3),(P['imp'],6),(P['imp2'],3)]): put(8+i,sp,dx=dx)
for i,dy in enumerate([0,-1,0,-1]): put(12+i,P['pre'],dy=dy)
for i,dx in enumerate([0,-1,-2,-1]): put(16+i,P['rem'],dx=dx)
for i,(sp,dy) in enumerate([(P['cmd'],0),(P['cmd2'],-2),(P['cmd'],-4),(P['cmd2'],-2),(P['cmd'],0)]): put(20+i,sp,dy=dy)
for i,(sp,dy) in enumerate([(P['cmd'],0),(P['cmd2'],-1),(P['cmd'],-2),(P['cmd2'],-1),(P['cmd'],0)]): put(25+i,sp,dy=dy)
for i,dx in enumerate([0,-4,-2,0]): put(30+i,P['aim'],dx=dx)
for i,dy in enumerate([0,-1,0,-1]): put(34+i,front,dy=dy)
for i,(dx,dy) in enumerate([(0,0),(1,-1),(0,-2),(-1,-1),(0,0),(1,-1)]): put(38+i,P['reload'],dx=dx,dy=dy)
put(44,P['ult'])
for i,sp in enumerate([WK['wd1'],front,WK['wd3'],front]): put(45+i,sp)
WL={k:v.transpose(Image.FLIP_LEFT_RIGHT) for k,v in WK.items()}; sideL=side.transpose(Image.FLIP_LEFT_RIGHT)
for i,sp in enumerate([WL['ws1'],sideL,WL['ws3'],sideL]): put(49+i,sp)
for i,sp in enumerate([WK['ws1'],side,WK['ws3'],side]): put(53+i,sp)
for i,sp in enumerate([WK['wu1'],back,WK['wu3'],back]): put(57+i,sp)
atlas=Image.new('RGBA',(W*8,H*8),(0,0,0,0))
for k,c in F.items(): atlas.alpha_composite(c,((k%8)*W,(k//8)*H))
out=R+'art-source/runway-guardians/libertador/atlas-candidato/'; os.makedirs(out,exist_ok=True); qsave(atlas,out+'atlas.png')
# motion (112x112, 12 cols, 1 fila): idle/walk down 0-3, side 4-7, up 8-11
MW=MH=112; M=Image.new('RGBA',(MW*12,MH),(0,0,0,0))
for base,seq in ((0,[WK['wd1'],front,WK['wd3'],front]),(4,[WK['ws1'],side,WK['ws3'],side]),(8,[WK['wu1'],back,WK['wu3'],back])):
    for i,sp in enumerate(seq): M.alpha_composite(cell(sp,MW,MH,106),((base+i)*MW,0))
qsave(M,out+'motion.png')
# caída (112x112 x4)
D=Image.new('RGBA',(MW*4,MH),(0,0,0,0))
for i,rot in enumerate([0,35,65,90]): D.alpha_composite(cell(front,MW,MH,106,rot=rot),(i*MW,0))
qsave(D,out+'death.png'); print('ok',atlas.size,M.size,D.size)
# ---- caballo con jinete (125x102, 8 cols): charge 0-4, dismount 5-8, mount 9-12, m_idle 13, m_atk 14-16, m_run 17(+1,2)
HW,HH,HF=125,102,96
def gh(n,th): return get(n,th,HW-2)
ch,mi,ma=gh('h_charge',88),gh('h_m_idle',90),gh('h_m_atk',90)
Hs={}
def hp(i,sp,**k): Hs[i]=cell(sp,HW,HH,HF,**k)
for i,dy in enumerate([0,-3,-5,-3,0]): hp(i,ch,dy=dy)
for i,dy in enumerate([0,-1,-2,-1]): hp(5+i,mi,dy=dy)          # desmontar
for i,dy in enumerate([-1,-2,-1,0]): hp(9+i,mi,dy=dy)                                 # montar
hp(13,mi)
for i,dx in enumerate([0,3,6]): hp(14+i,ma,dx=dx)
hp(17,ch,dy=-2)
HA=Image.new('RGBA',(HW*8,HH*3),(0,0,0,0))
for k,c in Hs.items(): HA.alpha_composite(c,((k%8)*HW,(k//8)*HH))
qsave(HA,out+'horse.png'); print('horse',HA.size)
# ---- cromas de archivo (respaldo; las skins autorales las reemplazan): se recolorea la base nueva (casaca azul -> escarcha celeste / ancestral verde)
import colorsys
def recolor(img,hue,sat=1.0,val=1.0):
    a=np.asarray(img.convert('RGBA')).astype(float)/255; o=a.copy()
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            r,g,b,al=a[y,x]
            if al<0.1: continue
            h,s,v=colorsys.rgb_to_hsv(r,g,b)
            if 0.55<h<0.72 and s>0.25:
                r2,g2,b2=colorsys.hsv_to_rgb(hue/360,min(1,s*sat),min(1,v*val)); o[y,x,:3]=(r2,g2,b2)
    return Image.fromarray((o*255).astype(np.uint8),'RGBA')
QA,QH=Image.open(out+'atlas.png'),Image.open(out+'horse.png')
for name,hue,sat,val in (('escarcha',195,0.6,1.35),('ancestral',135,0.9,0.95)):
    d=out+f'cromas_{name}_'
    qsave(recolor(QA,hue,sat,val),d+'atlas.png'); qsave(recolor(QH,hue,sat,val),d+'horse.png')
print('cromas ok')
