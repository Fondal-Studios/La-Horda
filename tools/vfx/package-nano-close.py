from pathlib import Path
from PIL import Image,ImageDraw
import json,gzip,hashlib
D=Path('art-source/entregas/nano-gm-kit-20261026/cierre-01')
# Lossless review copies preserve decoded pixels; original full PNGs are reproducible by harness.
conversion=[]
for p in list(D.glob('review-*.png'))+list((D/'coverage').glob('*.png')):
 im=Image.open(p).convert('RGBA');out=p.with_suffix('.webp');im.save(out,lossless=True,method=6)
 assert Image.open(out).convert('RGBA').tobytes()==im.tobytes()
 conversion.append({'png':str(p),'webp':str(out),'rgbaSha256':hashlib.sha256(im.tobytes()).hexdigest(),'exact':True})
for name in ['ng_decree','ng_burst_d','ng_verdict','ng_law']:
 pp=sorted((D/'native').glob(name+'-*.png'));ims=[Image.open(p).convert('RGBA') for p in pp];w,h=ims[0].size;out=Image.new('RGBA',(w*len(ims),h));
 for i,im in enumerate(ims):out.paste(im,(i*w,0))
 out.save(D/(name+'-atlas.png'))
(D/'REVIEW_FORMAT_VERIFICATION.json').write_text(json.dumps(conversion,indent=2)+'\n')
rows=[];mat=[]
for side in ['mobile','desktop']:
 a=json.loads((D/f'composite-{side}/capture.json').read_text());b=json.loads((D/f'skin-{side}-final/capture.json').read_text());rr=[r for r in a['rows'] if r['look']!='skin']+b['rows'];mat.append({'side':side,'scenes':len(rr),'samples':sum(len(r['ab']) for r in rr),'minBodyRetention':min(v['visible'] for r in rr for v in r['ab']),'allABAExact':all(v['restore'] and v['state'] for r in rr for v in r['ab']),'errors':a['errors']+b['errors']});rows+=rr
summary={'matrices':mat,'scenes':len(rows),'samples':sum(len(r['ab']) for r in rows),'threshold':.8,'delta':24,'scope':'192 non-skin rows from full matrix +48 corrected ascSkin rows. Not single final rerun. Runtime before final radius>520 adapter; all these radii<=520, source paint/timing same. Does not certify580 composition. Rejected skin rows retained, not counted.'}
(D/'MATRIX_SUMMARY.json').write_text(json.dumps(summary,indent=2)+'\n')
for sub in ['native','native-parent','coverage','pilot-mobile','composite-mobile','composite-desktop','skin-mobile-final','skin-desktop-final','temporal-mobile','temporal-desktop']:
 for p in (D/sub).glob('*.json'):
  p.with_suffix('.json.gz').write_bytes(gzip.compress(p.read_bytes(),mtime=0))
print(json.dumps(summary))
