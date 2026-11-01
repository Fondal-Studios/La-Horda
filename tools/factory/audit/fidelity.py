#!/usr/bin/env python3
"""Auditoría de fidelidad: idle frontal en juego vs figura frontal del Códice (BASE PARA SPRITES).
Mide paleta (intersección de histogramas 4 bits/canal), silueta (IoU a 64 px de alto, alineada abajo-centro),
relación de aspecto y déficit de resolución. Son señales automáticas para PRIORIZAR; no aprueban arte.
Uso: fidelity.py PACKS_JSON OUT_JSON"""
import sys,json,os,numpy as np
from PIL import Image
sys.path.insert(0,os.path.dirname(__file__))
from codex_figures import figures
H=64
def bbox_crop(im):
    a=np.asarray(im.convert('RGBA')); ys,xs=np.where(a[:,:,3]>40)
    if not len(ys): return None
    return im.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1)).convert('RGBA')
def hist(im):
    a=np.asarray(im.convert('RGBA')).reshape(-1,4); a=(a[a[:,3]>128][:,:3]>>4).astype(int)
    h=np.bincount((a[:,0]*256+a[:,1]*16+a[:,2]).astype(int),minlength=4096).astype(float); return h/max(h.sum(),1)
def mask(im):
    w=max(1,round(im.width*H/im.height)); m=np.asarray(im.resize((w,H),Image.NEAREST))[:,:,3]>40
    c=np.zeros((H,H*2),bool); x=(H*2-min(w,H*2))//2; c[:,x:x+min(w,H*2)]=m[:,:H*2]; return c
def main():
    packs=json.load(open(sys.argv[1])); res={}
    for k in sorted(f[:-4] for f in os.listdir('assets/ui/codex/champions')):
        p=packs.get(k)
        if not p: res[k]={'status':'sin_pack_estandar'}; continue
        try:
            ref=bbox_crop(figures(f'assets/ui/codex/champions/{k}.png')[0])
            at=Image.open(p['src']).convert('RGBA'); i=p['idle'][0]
            c,r=i%p['cols'],i//p['cols']; g=bbox_crop(at.crop((c*p['fw'],r*p['fh'],(c+1)*p['fw'],(r+1)*p['fh'])))
            hi=float(np.minimum(hist(ref),hist(g)).sum()); a,b=mask(ref),mask(g); iou=float((a&b).sum()/max((a|b).sum(),1))
            res[k]={'status':'ok','atlas':p['src'],'palette':round(hi,3),'silhouette_iou':round(iou,3),
                    'aspect_ref':round(ref.width/ref.height,2),'aspect_game':round(g.width/g.height,2),
                    'ref_px_h':ref.height,'game_px_h':g.height,'resolution_deficit':round(ref.height/g.height,2),
                    'score':round(0.5*hi+0.5*iou,3)}
        except Exception as e: res[k]={'status':'error','error':str(e)}
    json.dump(res,open(sys.argv[2],'w'),indent=1,ensure_ascii=False)
    ok=sorted((v['score'],k) for k,v in res.items() if v['status']=='ok')
    for s,k in ok: v=res[k]; print(f"{k:11s} score={s:.3f} pal={v['palette']:.2f} iou={v['silhouette_iou']:.2f} asp {v['aspect_game']}/{v['aspect_ref']} res x{v['resolution_deficit']}")
    print('sin evaluar:',[k for k,v in res.items() if v['status']!='ok'])
if __name__=='__main__': main()
