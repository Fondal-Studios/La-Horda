from pathlib import Path
import numpy as np,json
from PIL import Image
from scipy.ndimage import label,find_objects
root=Path(__file__).resolve().parents[2];out=root/'assets/sprites/battlefield';out.mkdir(parents=True,exist_ok=True)
meta={}
def save(key,im,ref=None):
 im.save(out/(key+'.tmp.png'));(out/(key+'.tmp.png')).replace(out/(key+'.png'));im.save(out/(key+'.tmp.webp'),lossless=True,method=4);(out/(key+'.tmp.webp')).replace(out/(key+'.webp'))
 a=np.array(im);b=np.array(Image.open(out/(key+'.webp')))
 assert np.array_equal(a[:,:,3],b[:,:,3]) and np.array_equal(a[a[:,:,3]>0],b[a[:,:,3]>0])
 meta[key]={'w':448 if ref else im.width,'h':384 if ref else im.height,'ref':ref or im.height}
for source,keys in [('bosses1',['golem_cuerpos','mn_titan','mn_cerbero','ab_carcelero']),('bosses2',['cm_maestro','cm_dama','cm_tramoyista','cm_presentador']),('bosses3',['minotauro','leviatan','dragon_forja','micelio']),('lanes',['stone-dragon','king-colossus','thornbeast','scavenger'])]:
 path=root/'art-source/battlefield'/f'{source}.png'
 if not path.exists():continue
 a=np.array(Image.open(path).convert('RGBA'));lab,n=label(a[:,:,3]>127);parts=[]
 for k,s in enumerate(find_objects(lab),1):
  if s:
   count=np.count_nonzero(lab[s]==k)
   if count>500:parts.append((count,k,s))
 parts=sorted(parts,reverse=True,key=lambda p:p[0])[:16]
 assert len(parts)==16
 parts.sort(key=lambda p:(p[2][0].start+p[2][0].stop)/2)
 for row,key in enumerate(keys):
  frames=sorted(parts[row*4:row*4+4],key=lambda p:p[2][1].start);atlas=Image.new('RGBA',(1792,384));ref=0
  for col,(_,k,s) in enumerate(frames):
   b=a[s].copy();b[:,:,3]=np.where(lab[s]==k,255,0);im=Image.fromarray(b)
   assert im.width<=448 and im.height<=376,(source,key,im.size)
   ref=max(ref,im.height);atlas.alpha_composite(im,(col*448+(448-im.width)//2,376-im.height))
  save(key,atlas,ref)
# Environment is a spacious 4x4 source grid; retain significant islands, trim transparent margins.
a=np.array(Image.open(root/'art-source/battlefield/environment.png').convert('RGBA'))
keys=['oak','pine','dead-tree','fern','moss-rock','slate','arch','column','bones','fallen','cart','mushrooms','tower-blue','tower-amber','brazier','altar']
for i,key in enumerate(keys):
 yb=[0,370,690,878,1226]; xb=([0,360,650,990,1283] if i//4==0 else [0,330,660,990,1283]); y0,y1=yb[i//4:i//4+2];x0,x1=xb[i%4:i%4+2]
 b=a[y0:y1,x0:x1].copy();lab,n=label(b[:,:,3]>127);counts=np.bincount(lab.ravel());counts[0]=0
 keep=counts>=max(4,counts.max()*.04);keep[0]=False;b[:,:,3]=np.where(keep[lab],255,0)
 im=Image.fromarray(b);box=im.getbbox();assert box;save(key,im.crop(box))
(out/'manifest.json').write_text(json.dumps(meta,indent=2));(root/'js/assets/battlefield-meta.js').write_text('const BATTLEFIELD_META = '+json.dumps(meta)+';\n');print('Imported',len(meta))
