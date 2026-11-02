#!/usr/bin/env python3
"""Hojas de revisión visual de la auditoría integral. Cada fila: [Códice frente (solo base) | preview de tienda | tira de cuadros reales: reposo, paso frente, paso perfil, paso espalda, acción, muerte].
Uso: asset-sheets.py DUMP_DIR OUT_DIR  → OUT_DIR/{base,croma,set}_N.png y index.json (ids por hoja)"""
import sys,os,json
sys.path.insert(0,os.path.dirname(__file__))
from PIL import Image,ImageDraw
from codex_figures import figures
D,O=sys.argv[1:3];os.makedirs(O,exist_ok=True);A=json.load(open(D+'/assets.json'))['assets'];H=150;idx={}
def fit(im,h=H):
    s=h/im.height;return im.resize((max(1,int(im.width*s)),h),Image.LANCZOS if im.height>h else Image.NEAREST)
for typ in ('base','croma','set'):
    L=[a for a in A if a['type']==typ];per=8
    for s in range(0,len(L),per):
        ch=L[s:s+per];rows=[]
        for a in ch:
            parts=[]
            if typ=='base':
                try:
                    f=figures(f"assets/ui/codex/champions/{a['id']}.png")[0];parts.append(fit(f))
                except Exception: parts.append(Image.new('RGBA',(60,H),(60,0,0,255)))
            pv=a.get('preview')
            if pv and os.path.exists(pv):
                p=Image.open(pv).convert('RGBA');parts.append(fit(p))
            elif typ!='base': parts.append(Image.new('RGBA',(120,H),(90,0,0,255)))
            if a.get('stripFile'):
                st=Image.open(f"{D}/{a['stripFile']}").convert('RGBA');parts.append(fit(st))
            W=sum(p.width for p in parts)+10*len(parts)+4;r=Image.new('RGB',(W,H+16),(26,26,26));x=4
            for p in parts: r.paste(p,(x,16),p);x+=p.width+10
            ImageDraw.Draw(r).text((4,2),f"{a['type']}:{a['id']}  champ={a['champ']}  '{a.get('name')}'",fill=(255,255,0));rows.append(r)
        sh=Image.new('RGB',(max(r.width for r in rows),sum(r.height for r in rows)),(0,0,0));y=0
        for r in rows: sh.paste(r,(0,y));y+=r.height
        n=f'{typ}_{s//per}';sh.save(f'{O}/{n}.png');idx[n]=[a['id'] for a in ch]
json.dump(idx,open(O+'/index.json','w'),indent=1);print({k:len(v) for k,v in idx.items()})
