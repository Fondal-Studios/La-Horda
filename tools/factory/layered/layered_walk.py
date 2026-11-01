#!/usr/bin/env python3
"""Fábrica por capas: genera apoyos alternados de caminata a partir de los cuadros de
reposo de un atlas 112px/8 columnas/3 filas (down, side, up). No espeja el personaje:
solo separa las botas (capa) del resto y las desplaza. Conserva el atlas original,
agrega filas nuevas y emite los sets a registrar. Uso:
  layered_walk.py ATLAS_IN ATLAS_OUT [--report JSON]
"""
import sys, json, hashlib
from PIL import Image
import numpy as np
W=112; COLS=8
BASES={'down':8*0+0,'side':8,'up':16}   # índices de cuadro de reposo
def feet_split(a):
    """Devuelve (y0, xsplit): fila donde empiezan los pies y columna que separa ambos pies."""
    al=a[:,:,3]>0
    ys=np.where(al.any(1))[0]; yb=ys.max()
    y0=yb-9
    prof=al[yb-2:yb+1].any(0); xs=np.where(prof)[0]
    # mayor hueco entre columnas ocupadas dentro de la zona de pies
    best=(0,None)
    for x0,x1 in zip(xs[:-1],xs[1:]):
        if x1-x0>best[0]: best=(x1-x0,(x0+x1)//2+1)
    split=best[1] if best[0]>=2 else (xs.min()+xs.max())//2
    return y0,split,bool(best[0]>=2)
def build(atlas):
    out=[]; report={}
    for name,idx in BASES.items():
        r,c=divmod(idx,COLS)
        base=atlas.crop((c*W,r*W,c*W+W,r*W+W)); a=np.array(base)
        y0,sx,gap=feet_split(a)
        # el borde superior de la capa de pies: debajo del dobladillo
        Lm=np.zeros(a.shape[:2],bool); Rm=Lm.copy()
        Lm[y0:,:sx]=True; Rm[y0:,sx:]=True
        Lm&=a[:,:,3]>0; Rm&=a[:,:,3]>0
        def lay(m):
            l=np.zeros_like(a); l[m]=a[m]; return Image.fromarray(l)
        up=a.copy(); up[Lm|Rm]=0; upper=Image.fromarray(up)
        Lb,Rb=lay(Lm),lay(Rm)
        # lateral: pie delantero avanza/retrocede en x; frontal/espalda: levanta
        if name=='side':
            ph=[((0,0),(3,0),(-3,-2)),((0,0),(1,0),(-1,0)),((0,0),(-3,-2),(3,0)),((0,0),(1,0),(-1,0))]
        else:
            ph=[((0,0),(0,1),(-2,-3)),((0,0),(1,0),(-1,0)),((0,0),(2,-3),(0,1)),((0,0),(1,0),(-1,0))]
        if name=='up': ph=[((0,0),(-2,-3),(0,1)),((0,0),(1,0),(-1,0)),((0,0),(0,1),(2,-3)),((0,0),(1,0),(-1,0))]
        frames=[]
        for _,l,r_ in ph:
            f=Image.new('RGBA',(W,W),(0,0,0,0)); f.alpha_composite(upper)
            f.alpha_composite(Lb,(l[0],l[1])); f.alpha_composite(Rb,(r_[0],r_[1]))
            frames.append(f)
        out.append(frames)
        report[name]={'baseCell':idx,'feetTopRow':int(y0),'splitX':int(sx),'gapFound':gap}
    return out,report
def main():
    src,dst=sys.argv[1],sys.argv[2]
    atlas=Image.open(src).convert('RGBA')
    assert atlas.size==(W*COLS,W*3),('formato de atlas no soportado',atlas.size)
    frames,report=build(atlas)
    new=Image.new('RGBA',(W*COLS,W*5),(0,0,0,0)); new.paste(atlas,(0,0))
    # fila 3: down(0-3) + side(4-7); fila 4: up(0-3)
    cells={}
    for fi,f in enumerate(frames[0]): new.paste(f,(fi*W,3*W)); 
    for fi,f in enumerate(frames[1]): new.paste(f,((4+fi)*W,3*W))
    for fi,f in enumerate(frames[2]): new.paste(f,(fi*W,4*W))
    new.save(dst)
    sets={'walk_down':[24,25,26,27],'run_down':[24,25,26,27],'walk_side':[28,29,30,31],'run_side':[28,29,30,31],
          'walk_up':[32,33,34,35],'run_up':[32,33,34,35],'run':[28,29,30,31]}
    rep={'source':src,'sourceSha256':hashlib.sha256(open(src,'rb').read()).hexdigest(),
         'output':dst,'outputSha256':hashlib.sha256(open(dst,'rb').read()).hexdigest(),
         'method':'layered-feet-v1','parts':report,'sets':sets}
    if '--report' in sys.argv: json.dump(rep,open(sys.argv[sys.argv.index('--report')+1],'w'),indent=1)
    print(json.dumps(rep['parts']))
if __name__=='__main__': main()
