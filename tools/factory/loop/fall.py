#!/usr/bin/env python3
"""Caída determinista a partir del reposo repintado (sin créditos): añade 3 cuadros de muerte al atlas (inclinación, caída, tendida).
Uso: fall.py ATLAS_IN ATLAS_OUT IDLE_CELL FW FH COLS NEW_FIRST_CELL → imprime los índices nuevos.
Gira el sprite sobre sus pies con vecino más cercano (pixel-art); conserva identidad y paleta. Es un recurso de producción mientras no se pinte una muerte real."""
import sys,numpy as np
from PIL import Image
src,dst,idle,fw,fh,cols,first=sys.argv[1],sys.argv[2],*map(int,sys.argv[3:8])
at=Image.open(src).convert('RGBA');cell=at.crop(((idle%cols)*fw,(idle//cols)*fh,(idle%cols)*fw+fw,(idle//cols)*fh+fh))
a=np.asarray(cell)[:,:,3]>40;ys,xs=np.where(a);bot=int(ys.max());cx=int((xs.min()+xs.max())/2)
rows=-(-(first+3)//cols);H=rows*fh;out=Image.new('RGBA',(at.width,max(at.height,H)));out.paste(at,(0,0))
def place(deg,dy,n,dim):
    r=cell.rotate(-deg,resample=Image.NEAREST,expand=True,center=(cx,bot))          # sentido horario: cae hacia la derecha
    bb=r.getbbox();r=r.crop(bb);cxr,bot_r=cx-bb[0],bot-bb[1]                       # recorta al contenido (conserva el pivote de los pies)
    sc=min(1.0,(fw-6)/r.width,(fh-6)/r.height)
    if sc<1: r=r.resize((max(1,round(r.width*sc)),max(1,round(r.height*sc))),Image.NEAREST)
    m=np.asarray(r)[:,:,3]>40;yy,xx=np.where(m);
    fr=Image.new('RGBA',(fw,fh));ox=min(max(1,fw//2-r.width//2),fw-r.width-1);oy=min(bot+dy-r.height+1,fh-r.height-1)
    fr.alpha_composite(r,(ox,max(1,oy)))
    if dim<1:
        p=np.asarray(fr).copy();p[:,:,:3]=(p[:,:,:3]*dim).astype(np.uint8);fr=Image.fromarray(p)
    out.paste(fr,((n%cols)*fw,(n//cols)*fh))
place(22,0,first,1.0);place(58,2,first+1,0.95);place(90,0,first+2,0.9)
out.save(dst);print(first,first+1,first+2)
