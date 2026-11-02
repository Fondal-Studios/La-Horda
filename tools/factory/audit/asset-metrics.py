#!/usr/bin/env python3
"""Métricas automáticas por activo (base, croma/skin, skin de set) sobre la tira de cuadros reales que dibuja el motor + el preview de tienda.
Misma vara para todos. Son señales para PRIORIZAR, no aprueban arte. Uso: asset-metrics.py DUMP_DIR OUT.json"""
import sys,os,json,numpy as np
from PIL import Image
sys.path.insert(0,os.path.dirname(__file__))
from fidelity import hist,bbox_crop
D,OUT=sys.argv[1:3];A=json.load(open(D+'/assets.json'))['assets'];res={}
def mask(im,H=64):
    w=max(1,round(im.width*H/im.height));m=np.asarray(im.resize((w,H),Image.NEAREST).convert('RGBA'))[:,:,3]>40
    c=np.zeros((H,H*2),bool);x=(H*2-min(w,H*2))//2;c[:,x:x+min(w,H*2)]=m[:,:H*2];return c
for a in A:
    r={'type':a['type'],'champ':a['champ'],'name':a.get('name'),'flags':[],'metrics':{}}
    pv=a.get('preview')
    if pv:
        r['metrics']['preview_exists']=os.path.exists(pv)
        if not os.path.exists(pv): r['flags'].append('preview_ausente')
    if not a.get('pack'):
        r['flags'].append('sin_atlas_de_heroe' if a['type']=='set' else 'sin_pack'); res[a['id']]=r; continue
    st=Image.open(f"{D}/{a['stripFile']}").convert('RGBA');n=6;w=st.width//n;cells=[st.crop((i*w,0,(i+1)*w,st.height)) for i in range(n)]
    ms=[np.asarray(c)[:,:,3]>40 for c in cells];names=['idle','walk_down','walk_side','walk_up','accion','muerte']
    cs=a.get('stripCells') or [None]*6
    for nm,m,ci in zip(names,ms,cs):
        if ci is None: r['flags'].append(f'estado_sin_cuadro:{nm}'); continue
        if m.sum()<160: r['flags'].append(f'cuadro_vacio:{nm}')
        elif m[0].any() or m[-1].any() or m[:,0].any() or m[:,-1].any(): r['flags'].append(f'recorte_borde:{nm}')
    live=[(nm,m) for nm,m in zip(names,ms) if m.sum()>=160]
    bots={nm:int(np.where(m.any(1))[0].max()) for nm,m in live if nm in('idle','walk_down','walk_side','walk_up')}
    if bots and max(bots.values())-min(bots.values())>4: r['flags'].append(f'linea_de_suelo_variable:{bots}')
    hs={nm:int(np.ptp(np.where(m.any(1))[0])) for nm,m in live if nm!='muerte'}
    if hs and max(hs.values())>1.3*min(hs.values()): r['flags'].append(f'escala_inconsistente:{hs}')
    idle=np.asarray(cells[0]).tobytes()
    same=[nm for nm,c in zip(names[1:4],cells[1:4]) if np.asarray(c).tobytes()==idle]
    if len(same)==3: r['flags'].append('caminata_igual_al_reposo')
    if cs[5] is not None and cs[5]==cs[0]: r['flags'].append('muerte_igual_al_reposo')
    if cs[4] is not None and cs[4]==cs[0]: r['flags'].append('accion_igual_al_reposo')
    r['metrics']['hs']=hs
    if pv and os.path.exists(pv):
        try:
            p=Image.open(pv).convert('RGBA');pb=bbox_crop(p);ib=bbox_crop(cells[0])
            if pb and ib:
                pal=float(np.minimum(hist(pb),hist(ib)).sum());a_,b_=mask(pb),mask(ib);iou=float((a_&b_).sum()/max((a_|b_).sum(),1))
                r['metrics'].update({'preview_vs_sprite_palette':round(pal,3),'preview_vs_sprite_iou':round(iou,3),'preview_size':list(p.size)})
                if pal<0.25: r['flags'].append('preview_no_coincide_con_el_sprite(paleta)')
        except Exception as e: r['flags'].append('preview_ilegible:'+str(e)[:40])
    res[a['id']]=r
json.dump(res,open(OUT,'w'),indent=1,ensure_ascii=False)
import collections;c=collections.Counter(f.split(':')[0] for r in res.values() for f in r['flags']);print(dict(c))
