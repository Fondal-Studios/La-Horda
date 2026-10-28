from pathlib import Path
from PIL import Image,ImageDraw
import json,gzip,hashlib,subprocess
D=Path('art-source/entregas/nano-gm-kit-20261026/cierre-02');P=D.parent/'cierre-01'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def put(n,d):(D/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
mat=[]
for side in ['mobile','desktop']:
 rows=[];errors=[]
 for sub in [side,'rest-'+side,'looks-'+side]:
  a=json.loads((D/sub/'capture.json').read_text());rows+=a['rows'];errors+=a['errors']
 mat.append({'viewport':side,'scenes':len(rows),'samples':sum(len(r['ab']) for r in rows),'minimumRetention':min(a['visible'] for r in rows for a in r['ab']),'ABAexact':all(a['restore'] and a['state'] for r in rows for a in r['ab']),'errors':errors})
put('MATRIX_SUMMARY.json',{'matrices':mat,'scenes':240,'ABA':1440,'threshold':.8,'delta':24,'scope':'Disjoint72+120+48 scene runs, same source. Six arenas, five looks, two densities, H1/H3, two viewports. Summarized state equality, not global snapshot.'})
evolved=[]
for side in ['mobile','desktop']:
 a=json.loads((D/('evolved-'+side)/'capture.json').read_text());evolved.append({'viewport':side,'scenes':len(a['rows']),'ABA':sum(len(r['ab']) for r in a['rows']),'minRetention':min(v['visible'] for r in a['rows'] for v in r['ab']),'ABAexact':all(v['restore'] and v['state'] and v['parentState'] for r in a['rows'] for v in r['ab']),'actual':[r['actual'] for r in a['rows']],'errors':a['errors']})
put('EVOLVED_COMPOSITION.json',{'results':evolved,'scope':'8 scenes48ABA: real third H3 cast after two casts and actual UF/updates. 12 validated talent purchases per scene, mastery alloc10 fixture. Initial KVB pool cleared before third cast; origin runes/other layers retained. Parent material replacement in same event geometry, not full old-main comparison. Camera stays anchored to origin, not guaranteed whole580 footprint fits screen.'})
current=json.loads((D/'native/NATIVE.json').read_text());again=json.loads((D/'reexport/NATIVE.json').read_text());before=json.loads((P/'native/NATIVE.json').read_text())
assert current==again
checks=[]
for a,b in zip(current['rows'],before['rows']):
 checks.append({'arena':a['arena'],'recipe':a['name'],'frames':len(a['frames']),'sameBefore':sum(x['sha256']==y['sha256'] for x,y in zip(a['frames'],b['frames'])),'rng':a['rng'],'partialAlpha':sum(f['partial'] for f in a['frames'])})
put('REEXPORT.json',{'groups':24,'frames':228,'allMetadataAndPNGSHAEqual':True,'pngFiles':38,'scope':'Fresh independent browser re-export. Decal size64 and beam20x18 only; not all buckets/borders proof.','comparison':checks})
formats=[]
for p in D.glob('review-*.png'):
 if 'CORRUPT' in p.name:continue
 im=Image.open(p).convert('RGBA');out=p.with_suffix('.webp');im.save(out,lossless=True,method=6);assert Image.open(out).convert('RGBA').tobytes()==im.tobytes();formats.append({'png':p.name,'webp':out.name,'rgbaSha256':hashlib.sha256(im.tobytes()).hexdigest(),'exact':True})
for p in [D/'coliseo/coliseo-local.png',D/'evolved-desktop/infernal-monster-dense-h2-256-before.png']:
 im=Image.open(p).convert('RGBA');out=D/('fullframe-'+p.name.replace('before','evolved')).with_suffix('.webp');im.save(out,lossless=True);assert Image.open(out).convert('RGBA').tobytes()==im.tobytes();formats.append({'png':str(p),'webp':out.name,'rgbaSha256':hashlib.sha256(im.tobytes()).hexdigest(),'exact':True})
put('FORMAT_VERIFICATION.json',formats)
for sub in ['mobile','desktop','rest-mobile','rest-desktop','looks-mobile','looks-desktop','evolved-mobile','evolved-desktop','temporal-mobile','native','reexport']:
 for p in (D/sub).glob('*.json'):
  if p.name=='progress.json':continue
  p.with_suffix('.json.gz').write_bytes(gzip.compress(p.read_bytes(),mtime=0))
p=D/'review-pair-temporal-mobile-h0-CORRUPT.png';p.with_suffix('.png.gz').write_bytes(gzip.compress(p.read_bytes(),mtime=0))
(D/'rejected-online-attempt01.js').write_bytes(Path('tools/vfx/nano-rejected-online.js').read_bytes())
(D/'rejected-online-attempt01.log').write_text(Path('/tmp/nano-rejected-online.log').read_text())
(D/'lifecycle-attempt01.log').write_text(Path('/tmp/nano-lifecycle.log').read_text())
images=['ng_decree-atlas.png','ng_burst_d-atlas.png','ng_verdict-atlas.png','ng_law-atlas.png','review-pair-temporal-mobile-h0.webp','review-pair-evolved-desktop-h2.webp']
(D/'preview.html').write_text('<!doctype html><meta charset="utf-8"><title>NanoGM cierre02 FIX</title><style>body{background:#181818;color:#eee;font:16px sans-serif}img{image-rendering:pixelated;max-width:100%}figure{margin:24px}</style><h1>NanoGM · cierre02 · EN_CORRECCION</h1><p>Evidencia nativa. No ArtPASS ni instalación de PNG.</p>'+''.join('<figure><figcaption>'+x+'</figcaption><img src="'+x+'"></figure>' for x in images))
print(json.dumps({'matrix':mat,'evolved':[(x['viewport'],x['minRetention']) for x in evolved],'files':len(formats),'source':sha(Path('js/champions/vfx-b/nano_gm.js'))}))
