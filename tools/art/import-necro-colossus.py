from PIL import Image
import numpy as np
from scipy.ndimage import label, find_objects
from pathlib import Path
root=Path(__file__).resolve().parents[2]
a=np.array(Image.open(root/'art-source/nigromante-coloso/source.png').convert('RGBA'))
labels,n=label(a[:,:,3]>127)
parts=[]
for k,s in enumerate(find_objects(labels),1):
 if s and np.count_nonzero(labels[s]==k)>18000:
  y,x=s; parts.append((y.start,x.start,k,s))
assert len(parts)==12
# Sort by semantic row then horizontal position; raised fists reach into preceding gutter.
parts.sort(key=lambda p:(0 if p[0]<350 else 1 if p[0]<600 else 2,p[1]))
out=Image.new('RGBA',(448*4,384*3))
for i,(_,_,k,s) in enumerate(parts):
 b=a[s].copy(); b[:,:,3]=np.where(labels[s]==k,255,0)
 im=Image.fromarray(b); out.alpha_composite(im,((i%4)*448+(448-im.width)//2,(i//4)*384+376-im.height))
p=root/'assets/sprites/champions/nigromante/coloso'
out.save(p/'atlas.png'); out.save(p/'atlas.webp',lossless=True,method=4)
assert np.array_equal(np.array(Image.open(p/'atlas.webp')),np.array(out))
print('12 frames; 4 directions with left mirror; binary alpha; PNG/WebP identical')
