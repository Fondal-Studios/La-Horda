"""Reproducible evidence sheets. Native 1:1 crops, no rescaling or repainting."""
from pathlib import Path
from PIL import Image, ImageDraw
import json,hashlib,gzip
root=Path(__file__).resolve().parents[2]
b=root/'art-source/entregas/brakk-kit-20261022/correccion-06'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
index=[]
for p in sorted(b.rglob('*.png')):
 if 'previews' not in p.parts:index.append({'path':str(p.relative_to(b)),'sha256':sha(p),'bytes':p.stat().st_size})
(b/'CAPTURE_INDEX.json').write_text(json.dumps(index,indent=2)+'\n')
(b/'previews').mkdir(exist_ok=True)
for view,w,h in [('mobile',390,844),('landscape',844,390)]:
 for arena in ['bosque','hielo','infernal','laberinto','acuatica','minas']:
  rows=[(look,density,t)for look in ['base','set']for density in ['dense','sparse']for t in [330,1600]]
  sheet=Image.new('RGB',(600,len(rows)*262),(22,24,29));d=ImageDraw.Draw(sheet)
  for i,(look,density,t)in enumerate(rows):
   d.text((3,i*262+3),f'{arena} {look} {density} {t}ms | parent05 / candidato06',fill='white')
   for j,key in enumerate(['without','before']):
    p=b/view/f'{arena}-{look}-{density}-h3-{t}-ab-{key}.png'
    im=Image.open(p);x=round(w/2-110);y=round(h/2-140)
    sheet.paste(im.crop((x,y,x+300,y+240)),(j*300,i*262+22))
  sheet.save(b/'previews'/f'{view}-{arena}-b119-1to1.png')
# Native atlas: row contains four 48x56 cells; 12 phases at 1:1 and enlarged for inspection.
im=Image.open(b/'atlases/repair-brace.png');thumb=Image.new('RGBA',(48*4,56*3))
for f in range(12):thumb.paste(im.crop((f*48,0,(f+1)*48,56)),((f%4)*48,(f//4)*56))
thumb.save(b/'previews/brace-12-native.png')
# Diagnostic source traces retain every observation; gzip is lossless, mtime fixed.
for directory in ['diagnostic-trace','diagnostic-sequence','diagnostic-same','diagnostic-same-horizontal','diagnostic-pose','diagnostic-pose-horizontal']:
 p=b/directory/'capture.json';(p.parent/'capture.json.gz').write_bytes(gzip.compress(p.read_bytes(),mtime=0))
# Exact A/A/A pixel deltas, versus pose restored A/B/A. Original failed evidence remains unchanged.
import numpy as np
cases=[]
for view,old,new in [('mobile','diagnostic-same','diagnostic-pose'),('landscape','diagnostic-same-horizontal','diagnostic-pose-horizontal')]:
 for r in json.loads((b/old/'capture.json').read_text())['results']:
  if r['ab'][0]['identicalRestoration']:continue
  name=f"{r['arena']}-{r['look']}-{r['density']}-h{r['slot']+1}"
  a=np.array(Image.open(b/old/(name+'-ab-before.png')).convert('RGBA'));z=np.array(Image.open(b/old/(name+'-ab-restored.png')).convert('RGBA'));ys,xs=np.where(np.any(a!=z,axis=2))
  t=r['renderTrace'][-2];changes=[]
  for pre,post in zip(t['prePose'],t['postPose']):
   fields={k:[pre['an'].get(k),post['an'].get(k)]for k in pre['an'] if pre['an'][k]!=post['an'][k]}
   if fields:changes.append({'entity':pre['kind'],'fields':fields})
  cases.append({'view':view,'scene':name,'pixels':len(xs),'bbox':[int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())],'randomCalls':sum(len(x['calls'])for x in r['renderTrace'][-3:]),'poseChanges':changes})
report={'date':'2026-10-23','scope':'Harness A/B/A, not a change to gameplay renderer','rootCause':'animPose updates _an.spd and _an.ph on every draw using animDt, even at the same performance.now. Repeated render was not identical input.','control':'Same renderer A/A/A reproduces14 failures. Restoring pre-draw _an and _animCastKind for each diagnostic draw passes144/144. No RNG calls in failing redraws. Original post-draw pose restored after diagnostics.','nativePixelThreshold':'exact equality, unchanged','negativeCanary':'One intentionally changed pixel fails restoration','cases':cases,'limits':'Does not prove every renderer subsystem is pure, nor fix gameplay randomness. Applies to these captured scenes. Other branches need the same evidence discipline.'}
(b/'ROOT_CAUSE.json').write_text(json.dumps(report,indent=2)+'\n')
print('sheets',12,'root cases',len(cases),'pixel counts',sorted(set(x['pixels']for x in cases)))
