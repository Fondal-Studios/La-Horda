#!/usr/bin/env python3
"""Hoja de revisión: ACTUAL (arriba) vs CANDIDATO (abajo) por celda, y pick.json con el último candidato de cada celda.
Uso: review-sheet.py CHAMP LOOPROOT OUT_PREFIX  (env PACKS)"""
import os,re,sys,json
from PIL import Image,ImageDraw
champ,root,out=sys.argv[1:4];P=json.load(open(os.environ['PACKS']))[champ];at=Image.open(P['src']).convert('RGBA')
fw,fh,cols=P['fw'],P['fh'],P['cols'];cells=json.load(open(f'{root}/{champ}/run.json'))['cells'];pick={};miss=[]
for i in cells:
    d=f'{root}/{champ}/f{i}'
    cs=[f for f in (os.listdir(d) if os.path.isdir(d) else []) if re.match(r'candidate_cell_g\dr\d\.png',f)]
    if cs:
        pick[i]=max(cs,key=lambda f:(int(f[16]),int(f[18])))[len('candidate_cell_'):-4]
        pf=f'{d}/candidate_cell_pf.png'                         # retoque determinista (máscara/halo): vale solo si es más nuevo que la última generación
        if os.path.exists(pf) and os.path.getmtime(pf)>os.path.getmtime(f'{d}/candidate_cell_{pick[i]}.png'): pick[i]='pf'
    else: miss.append(i)
json.dump({'pick':pick,'missing':miss},open(out+'_pick.json','w'))
ok=sorted(pick);per=12;T=104
for s in range(0,len(ok),per):
    chunk=ok[s:s+per];sh=Image.new('RGB',(len(chunk)*(T+2),2*(T+2)+14),(36,36,36))
    for n,i in enumerate(chunk):
        cur=at.crop(((i%cols)*fw,(i//cols)*fh,(i%cols+1)*fw,(i//cols+1)*fh))
        new=Image.open(f'{root}/{champ}/f{i}/candidate_cell_{pick[i]}.png').convert('RGBA')
        for r,im in enumerate((cur,new)):
            k=min(T/fw,T/fh);im=im.resize((int(fw*k),int(fh*k)),Image.NEAREST);sh.paste(im,(n*(T+2),14+r*(T+2)),im)
        ImageDraw.Draw(sh).text((n*(T+2)+2,2),f'c{i}',fill=(255,255,0))
    sh.save(f'{out}_{s//per}.png')
print('celdas',len(ok),'faltan',miss,'hojas',(len(ok)+per-1)//per)
