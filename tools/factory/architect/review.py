#!/usr/bin/env python3
"""Módulo del ARQUITECTO: revisa un candidato (atlas + clips) y devuelve una DEVOLUCIÓN estructurada
con lo que no pasa y qué debe repintar/rehacer el generador. Es el lazo productor↔revisor:
  generador → review.py → feedback.json (verdict, failures[], repaint[]) → generador corrige → review.py ...
Las comprobaciones automáticas NO aprueban arte: ACEPTAR exige además revisión visual humana/independiente
(campo visual_review_required). Uso:
  review.py --atlas A.png --fw 112 --fh 112 --cols 8 --clip walk_down=24,25,26,27 [--baseline-clip walk_down=1,0,2,0]
            [--ref codex.png] --out feedback.json
"""
import argparse,json,os,sys,hashlib
import numpy as np
from PIL import Image
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..','audit'))
def cell(at,i,fw,fh,cols):
    c,r=i%cols,i//cols; return at.crop((c*fw,r*fh,(c+1)*fw,(r+1)*fh))
def bottom(a):
    ys=np.where(a[:,:,3]>40)[0]; return int(ys.max()) if len(ys) else -1
def bbox(a):
    ys,xs=np.where(a[:,:,3]>40); return (int(xs.min()),int(ys.min()),int(xs.max())+1,int(ys.max())+1) if len(ys) else None
def review(at,fw,fh,cols,clips,ref=None,baseline=None):
    fails=[];repaint=[];info={}
    for name,idx in clips.items():
        fr=[np.asarray(cell(at,i,fw,fh,cols).convert('RGBA')) for i in idx]
        bots=[bottom(f) for f in fr]; bbs=[bbox(f) for f in fr]; hs=[hashlib.md5(f.tobytes()).hexdigest() for f in fr]
        info[name]={'frames':idx,'ground_y':bots,'unique_frames':len(set(hs))}
        # 1) línea de suelo: el borde inferior no debe variar más de 1 px (los pies no «flotan» ni se hunden)
        lo,hi=min(bots),max(bots)
        if hi-lo>1:
            odd=[idx[i] for i,b in enumerate(bots) if b!=max(set(bots),key=bots.count)]
            fails.append({'check':'ground_line','clip':name,'frames':odd,'detail':f'borde inferior {bots}; variación {hi-lo}px'})
            for i in odd: repaint.append({'frame':i,'clip':name,'region':'feet','issue':'ground_line',
              'instruction':'Rehacer los pies de este cuadro con la misma línea de suelo que el cuadro de reposo; si se levanta un pie, el otro mantiene el apoyo exacto en la línea base. Para dar peso, bajar el cuerpo 1 px, no el pie.','keep':['torso','arma','capa','cara']})
        # 2) cuadros idénticos consecutivos / poses repetidas dentro del ciclo
        for k in range(len(idx)):
            for j in range(k+1,len(idx)):
                if hs[k]==hs[j] and idx[k]!=idx[j]:
                    fails.append({'check':'duplicate_pose','clip':name,'frames':[idx[k],idx[j]],'detail':'dos cuadros distintos del ciclo son idénticos'})
                    repaint.append({'frame':idx[j],'clip':name,'region':'full','issue':'duplicate_pose','instruction':'Dibujar una pose de paso real (cadera/rodilla/pie en transición, vaivén de capa y arco), no un desplazamiento de 1 px.','keep':['identidad','paleta','arma']})
        # 3) alternancia de apoyos: masa de la mitad inferior (izq/der) debe cambiar de signo en el ciclo
        asym=[]
        for f in fr:
            b=bbox(f); 
            if not b: asym.append(0);continue
            y0=b[3]-int((b[3]-b[1])*0.18); low=f[y0:b[3],:,3]>40; mid=(b[0]+b[2])//2
            asym.append(int(low[:, :mid].sum())-int(low[:,mid:].sum()))
        info[name]['foot_mass_asym']=asym
        if len(idx)>=3 and not (min(asym)<-3 and max(asym)>3) and name.startswith(('walk','run')) and not name.endswith('_side'):  # lateral: la asimetría izq/der no mide apoyos (limitación conocida)
            fails.append({'check':'foot_alternation','clip':name,'frames':idx,'detail':f'asimetría de pies {asym}: no hay apoyos opuestos claros'})
            repaint.append({'frame':idx[0],'clip':name,'region':'legs','issue':'foot_alternation','instruction':'Repintar piernas: apoyo izquierdo en un cuadro, derecho en otro, con la pierna libre adelantada y flexionada. Sin espejar el personaje entero.','keep':['torso','arma','mano','capa']})
        # 4) recorte en el borde de la celda
        for i,f in zip(idx,fr):
            if (f[0,:,3]>40).any() or (f[-1,:,3]>40).any() or (f[:,0,3]>40).any() or (f[:,-1,3]>40).any():
                fails.append({'check':'edge_clip','clip':name,'frames':[i],'detail':'píxeles opacos tocan el borde de la celda'})
                repaint.append({'frame':i,'clip':name,'region':'edge','issue':'edge_clip','instruction':'Reducir/recolocar la pose para que no toque el borde de la celda.','keep':['identidad']})
        # 5) deriva de tamaño/posición del cuerpo dentro del ciclo
        hts=[b[3]-b[1] for b in bbs if b]; cx=[(b[0]+b[2])/2 for b in bbs if b]
        if hts and max(hts)-min(hts)>8: fails.append({'check':'height_jitter','clip':name,'frames':idx,'detail':f'altura {hts}'})
        if cx and max(cx)-min(cx)>10: fails.append({'check':'center_drift','clip':name,'frames':idx,'detail':f'centro x {cx}'})
        # 6) contra el clip base actual: no puede perder cuadros únicos (regresión)
        if baseline and name in baseline:
            bf=[hashlib.md5(np.asarray(cell(at,i,fw,fh,cols).convert('RGBA')).tobytes()).hexdigest() for i in baseline[name]]
            if len(set(bf))>len(set(hs)):
                fails.append({'check':'regression_unique_poses','clip':name,'frames':idx,'detail':f'candidato {len(set(hs))} poses únicas < actual {len(set(bf))}'})
    if ref is not None:
        from fidelity import hist
        h0=np.asarray(Image.open(ref).convert('RGBA'))
        allf=Image.new('RGBA',(fw*len(next(iter(clips.values()))),fh)); 
        for n,i in enumerate(next(iter(clips.values()))): allf.paste(cell(at,i,fw,fh,cols),(n*fw,0))
        a,b=hist(Image.open(ref)),hist(allf); inter=float(np.minimum(a,b).sum()); info['palette_intersection_vs_ref']=round(inter,3)
        if inter<0.30: fails.append({'check':'identity_palette','clip':'*','frames':[],'detail':f'intersección de paleta {inter:.2f} < 0.30'})
    return {'verdict':'CORREGIR' if fails else 'PASA_AUTOMATICO','failures':fails,'repaint':repaint,'info':info,
            'visual_review_required':True,'note':'Un PASA_AUTOMATICO no es ACEPTAR: falta revisión visual independiente en el renderer real.'}
def parse_clip(s):
    n,v=s.split('=');return n,[int(x) for x in v.split(',')]
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--atlas',required=True);ap.add_argument('--fw',type=int,required=True);ap.add_argument('--fh',type=int,required=True)
    ap.add_argument('--cols',type=int,required=True);ap.add_argument('--clip',action='append',required=True);ap.add_argument('--baseline-clip',action='append',default=[])
    ap.add_argument('--ref');ap.add_argument('--out',required=True);a=ap.parse_args()
    at=Image.open(a.atlas).convert('RGBA');fb=review(at,a.fw,a.fh,a.cols,dict(map(parse_clip,a.clip)),a.ref,dict(map(parse_clip,a.baseline_clip)))
    json.dump(fb,open(a.out,'w'),indent=1,ensure_ascii=False);print(fb['verdict'],[ (f['check'],f['clip']) for f in fb['failures']])
if __name__=='__main__': main()
