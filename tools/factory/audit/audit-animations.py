#!/usr/bin/env python3
"""Auditoría de cuadros de animación de TODOS los campeones con las mismas métricas.
Por clip: cuadros vacíos, duplicados, línea de suelo, recorte de borde, saltos de tamaño, estatismo
(clip de varios cuadros con 1 pose), y deriva de identidad (paleta de cada cuadro vs unión de las tres vistas del Códice).
Uso: audit-animations.py PACKS_FULL.json OUT.json"""
import sys,os,json,hashlib,numpy as np
from PIL import Image
sys.path.insert(0,os.path.dirname(__file__))
from codex_figures import figures
from fidelity import hist
def ref_hist(k):
    f=figures(f'assets/ui/codex/champions/{k}.png')
    if len(f)<3: return None
    return sum(hist(x) for x in f)/len(f), f
def main():
    packs=json.load(open(sys.argv[1])); out={}
    for k in sorted(f[:-4] for f in os.listdir('assets/ui/codex/champions')):
        p=packs.get(k)
        if not p: out[k]={'status':'sin_pack_estandar'}; continue
        rh=ref_hist(k); at=Image.open(p['src']).convert('RGBA'); fw,fh,cols=p['fw'],p['fh'],p['cols']
        def cell(i):
            c,r=i%cols,i//cols; return np.asarray(at.crop((c*fw,r*fh,(c+1)*fw,(r+1)*fh)))
        cache={};clips={};issues={'empty':0,'static':0,'ground':0,'edge':0,'jitter':0,'identity':0};worst=[]
        for name,idx in p['sets'].items():
            idx=[i for i in idx if i>=0]
            if not idx: continue
            fr=[]
            for i in idx:
                if i not in cache: cache[i]=cell(i)
                fr.append(cache[i])
            probs=[]
            ops=[(f[:,:,3]>40) for f in fr]
            for i,m in zip(idx,ops):
                if m.sum()<80: probs.append(('empty',i))
            live=[(i,f,m) for i,f,m in zip(idx,fr,ops) if m.sum()>=80]
            hs=[hashlib.md5(f.tobytes()).hexdigest() for _,f,_ in live]
            if len(set(idx))>=2 and len(set(hs))==1 and name.split('_')[0] in('walk','run','attack','cast','ultimate','death'): probs.append(('static',idx[0]))
            bots=[int(np.where(m.any(1))[0].max()) for _,_,m in live]
            if name.split('_')[0] in('walk','run','idle') and bots and max(bots)-min(bots)>2: probs.append(('ground',idx[0]))
            for i,_,m in live:
                if m[0].any() or m[-1].any() or m[:,0].any() or m[:,-1].any(): probs.append(('edge',i))
            hts=[int(np.ptp(np.where(m.any(1))[0])) for _,_,m in live]
            if hts and max(hts)-min(hts)>0.25*max(hts) and name.split('_')[0] in('walk','run','idle'): probs.append(('jitter',idx[0]))
            if rh:
                for i,f,m in live:
                    h=hist(Image.fromarray(f)); inter=float(np.minimum(h,rh[0]).sum())
                    if inter<0.20: probs.append(('identity',i)); worst.append((round(inter,2),name,i))
            for t,_ in probs: issues[t]+=1
            clips[name]={'frames':idx,'problems':sorted(set(probs))}
        w={'empty':5,'static':3,'ground':2,'edge':1,'jitter':2,'identity':1}
        out[k]={'status':'ok','atlas':p['src'],'issues':issues,'severity':sum(w[t]*n for t,n in issues.items()),
                'clips':len(clips),'ref_extraction_ok':bool(rh),'worst_identity':sorted(worst)[:6],'detail':clips}
    json.dump(out,open(sys.argv[2],'w'),indent=1,ensure_ascii=False)
    for s,k in sorted(((v['severity'],k) for k,v in out.items() if v['status']=='ok'),reverse=True):
        print(f"{k:11s} sev={s:3d} {out[k]['issues']} clips={out[k]['clips']}")
    print('sin evaluar:',[k for k,v in out.items() if v['status']!='ok'],' ref sospechosa:',[k for k,v in out.items() if v.get('ref_extraction_ok') is False])
main()
