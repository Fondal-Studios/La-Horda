#!/usr/bin/env python3
"""Herramientas por cuadro para el lazo de repintado.
  prep    CHAMP FRAME_IDX OUTDIR   → cur.png, ref.png (1024², fondo verde #00FF00) + cur_cell.png + meta.json
  post    OUTDIR RESULT.png ROUND  → candidate_cell_N.png (clave de croma, ajuste al cuadro, suelo alineado, paleta del Códice)
  critic  OUTDIR ROUND             → feedback_N.json (qué falla y qué repintar)
Un cuadro 'actual' es siempre el del juego; el resultado solo reemplaza pixeles si el arquitecto lo acepta."""
import sys,os,json,base64,io,numpy as np
from PIL import Image
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..','audit'))
from codex_figures import figures
from fidelity import bbox_crop,hist
SRC=os.environ.get('PACKS','packs_full.json')
def cellof(p,i):
    at=Image.open(p['src']).convert('RGBA');fw,fh,c=p['fw'],p['fh'],p['cols']
    return at.crop(((i%c)*fw,(i//c)*fh,(i%c+1)*fw,(i//c+1)*fh))
def canvas(im,n=1024):
    s=min(n*.8/im.width,n*.8/im.height);im=im.resize((int(im.width*s),int(im.height*s)),Image.NEAREST)
    c=Image.new('RGB',(n,n),(0,255,0));c.paste(im,((n-im.width)//2,(n-im.height)//2),im);return c
def b64(im):
    b=io.BytesIO();im.save(b,'PNG');return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def prep(champ,idx,out):
    os.makedirs(out,exist_ok=True);p=json.load(open(SRC))[champ];cell=cellof(p,int(idx))
    cur=bbox_crop(cell);ref=bbox_crop(figures(f'assets/ui/codex/champions/{champ}.png')[0])
    for n,im in (('cur',cur),('ref',ref)):
        c=canvas(im);c.save(f'{out}/{n}.png');open(f'{out}/{n}.b64','w').write(b64(c))
    cell.save(f'{out}/cur_cell.png')
    a=np.asarray(cell)[:,:,3]>40;ys,xs=np.where(a)
    json.dump({'champ':champ,'frame':int(idx),'cell':[p['fw'],p['fh']],'bbox':[int(xs.min()),int(ys.min()),int(xs.max())+1,int(ys.max())+1]},open(f'{out}/meta.json','w'))
def palette_of(champ,k=64):
    """Paleta del Códice por corte mediano sobre los píxeles de las tres vistas (conserva matices minoritarios como rosas o acentos)."""
    f=figures(f'assets/ui/codex/champions/{champ}.png');px=np.concatenate([np.asarray(x.convert('RGBA')).reshape(-1,4) for x in f]);px=px[px[:,3]>200][:,:3]
    side=int(np.ceil(np.sqrt(len(px))));pad=np.zeros((side*side,3),np.uint8);pad[:len(px)]=px;pad[len(px):]=px[0]
    q=Image.fromarray(pad.reshape(side,side,3)).quantize(colors=k,method=Image.MEDIANCUT);pal=np.array(q.getpalette()[:3*k]).reshape(-1,3);return pal.astype(int)
def post(out,res,rnd):
    meta=json.load(open(f'{out}/meta.json'));fw,fh=meta['cell'];x0,y0,x1,y1=meta['bbox']
    im=Image.open(res).convert('RGB');a=np.asarray(im).astype(int)
    key=(a[:,:,1]>150)&(a[:,:,0]<110+40)&(a[:,:,2]<110+40)&(a[:,:,1]-np.maximum(a[:,:,0],a[:,:,2])>60)
    rgba=np.dstack([np.asarray(im),np.where(key,0,255).astype(np.uint8)]);g=Image.fromarray(rgba.astype(np.uint8),'RGBA')
    bb=g.split()[3].point(lambda v:255 if v>128 else 0).getbbox();g=g.crop(bb)
    tw,th=x1-x0,y1-y0;s=th/g.height;g=g.resize((max(1,round(g.width*s)),th),Image.BOX)       # misma altura que el cuadro actual
    ga=np.asarray(g).copy();ga[:,:,3]=np.where(ga[:,:,3]>110,255,0)                              # alfa duro
    pal=palette_of(meta['champ']);rgb=ga[:,:,:3].astype(int);d=((rgb[:,:,None,:]-pal[None,None])**2).sum(3);ga[:,:,:3]=pal[d.argmin(2)].astype(np.uint8)  # paleta del Códice
    ga=Image.fromarray(ga,'RGBA');cell=Image.new('RGBA',(fw,fh));cx=(x0+x1)//2
    cell.alpha_composite(ga,(cx-ga.width//2,y1-th));cell.save(f'{out}/candidate_cell_{rnd}.png')
def critic(out,rnd):
    meta=json.load(open(f'{out}/meta.json'));fw,fh=meta['cell']
    cur=np.asarray(Image.open(f'{out}/cur_cell.png'));cand=np.asarray(Image.open(f'{out}/candidate_cell_{rnd}.png'))
    ma,mb=cur[:,:,3]>40,cand[:,:,3]>40;iou=float((ma&mb).sum()/max((ma|mb).sum(),1))
    ref=figures(f"assets/ui/codex/champions/{meta['champ']}.png");rh=sum(hist(x) for x in ref)/len(ref)
    pal_new=float(np.minimum(hist(Image.fromarray(cand)),rh).sum());pal_old=float(np.minimum(hist(Image.fromarray(cur)),rh).sum())
    bot=lambda m:int(np.where(m.any(1))[0].max());fails=[];fix=[]
    if iou<0.55: fails.append(f'pose/silueta distinta del cuadro actual (IoU {iou:.2f}<0.55)');fix.append('Mantén exactamente la pose, proporciones y posición del cuadro @cur; solo cambia el diseño.')
    if abs(bot(ma)-bot(mb))>1: fails.append('línea de suelo distinta');fix.append('Los pies deben quedar en la misma línea de suelo que @cur.')
    if mb[0].any() or mb[-1].any() or mb[:,0].any() or mb[:,-1].any(): fails.append('toca el borde');fix.append('Deja margen alrededor de todo el personaje.')
    # La paleta NO veta: las métricas de color no distinguen un diseño distinto con colores parecidos (verificado con Ynara). La identidad
    # (vestuario, arma, peinado) la juzga el arquitecto visual; su devolución entra como architect_feedback.json (ver repaint-loop.js).
    warn=[] if pal_new>=0.30 else ['paleta lejana del Códice (<0.30)']
    fb={'round':rnd,'palette_new':round(pal_new,3),'palette_old':round(pal_old,3),'silhouette_iou':round(iou,3),'failures':fails,'warnings':warn,'prompt_fix':' '.join(fix),'verdict':'PASA_AUTOMATICO' if not fails else 'CORREGIR','visual_review_required':True}
    json.dump(fb,open(f'{out}/feedback_{rnd}.json','w'),indent=1,ensure_ascii=False);print(json.dumps(fb,ensure_ascii=False))
if __name__=='__main__':
    c=sys.argv[1]
    if c=='prep': prep(sys.argv[2],sys.argv[3],sys.argv[4])
    elif c=='post': post(sys.argv[2],sys.argv[3],sys.argv[4])
    elif c=='critic': critic(sys.argv[2],sys.argv[3])
