#!/usr/bin/env python3
"""Energía de movimiento por clip (mismas métricas para todos): fracción de píxeles de la silueta que cambia entre
cuadros consecutivos del ciclo, y en la zona de pies (18% inferior). Cuadros casi iguales = animación pobre.
Uso: motion-energy.py PACKS_FULL OUT.json"""
import sys,json,os,numpy as np
from PIL import Image
packs=json.load(open(sys.argv[1]));out={}
for k in sorted(f[:-4] for f in os.listdir('assets/ui/codex/champions')):
    p=packs.get(k)
    if not p: continue
    at=Image.open(p['src']).convert('RGBA');fw,fh,cols=p['fw'],p['fh'],p['cols'];res={}
    for name in ('walk_down','walk_side','walk_up','attack_down','attack_side'):
        idx=[i for i in p['sets'].get(name,[]) if i>=0]
        if len(idx)<2: continue
        fr=[np.asarray(at.crop(((i%cols)*fw,(i//cols)*fh,(i%cols+1)*fw,(i//cols+1)*fh)).convert('RGBA')) for i in idx]
        d=[];f=[]
        for a,b in zip(fr,fr[1:]+fr[:1]):
            ma,mb=a[:,:,3]>40,b[:,:,3]>40;u=(ma|mb).sum()
            if u==0: continue
            diff=(ma^mb)|((np.abs(a[:,:,:3].astype(int)-b[:,:,:3].astype(int)).sum(2)>60)&ma&mb)
            d.append(diff.sum()/u); ys=np.where((ma|mb).any(1))[0];y0=ys.max()-int(0.18*(ys.max()-ys.min()))
            fu=(ma|mb)[y0:].sum();f.append(diff[y0:].sum()/max(fu,1))
        res[name]={'unique':len(set(idx)),'energy':round(float(np.mean(d)),3),'feet':round(float(np.mean(f)),3)}
    out[k]=res
json.dump(out,open(sys.argv[2],'w'),indent=1)
rows=[(np.mean([v['energy'] for n,v in r.items() if n.startswith('walk')] or [9]),k) for k,r in out.items()]
for e,k in sorted(rows)[:15]: print(f"{k:11s} walk_energy={e:.3f}",{n:v['energy'] for n,v in out[k].items() if n.startswith('walk')})
print('mediana',round(float(np.median([e for e,_ in rows])),3))
