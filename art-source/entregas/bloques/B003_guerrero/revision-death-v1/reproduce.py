import hashlib,json,subprocess,tempfile
from pathlib import Path
from PIL import Image
P=Path(__file__).resolve().parent
recipe=json.loads((P/'recipe.json').read_text())
source=P/recipe['source'];base=Path(recipe['baseline']).resolve()
assert hashlib.sha256(source.read_bytes()).hexdigest()==recipe['sourceSha256']
assert hashlib.sha256(base.read_bytes()).hexdigest()==recipe['baselineSha256']
original=Image.open(base).convert('RGBA');im=Image.open(source)
with tempfile.TemporaryDirectory(prefix='tank-death-') as tmp:
 out=Path(tmp)
 for i,(frame,rect,height) in enumerate(zip(recipe['frames'],recipe['rects'],recipe['targetHeights'])):
  raw=out/f'pose-{i}.png';im.crop(rect).save(raw)
  manifest={'atlas':str(base),'atlasSha256':hashlib.sha256(base.read_bytes()).hexdigest(),'replacement':str(raw),'replacementSha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'frame':frame,'targetHeight':height}
  cfg=out/f'assembly-{i}.json';cfg.write_text(json.dumps(manifest));target=out/f'atlas-{i}.png'
  subprocess.run(['python3','tools/factory/replace-authored-frame.py',str(cfg),str(target)],check=True);base=target
 final=Image.open(base).convert('RGBA');assert final.tobytes()==Image.open(P/'atlas.png').convert('RGBA').tobytes()
 for i in range(32):
  x,y=i%4*112,i//4*112;box=(x,y,x+112,y+112)
  assert original.crop(box).tobytes()==final.crop(box).tobytes(),i
 cfg=out/'clip.json';cfg.write_text(json.dumps({'source':str(base),'sourceSha256':hashlib.sha256(base.read_bytes()).hexdigest(),'cell':112,'frames':recipe['frames']}))
 subprocess.run(['python3','tools/factory/extract-authored-clip.py',str(cfg),str(out/'death.png'),str(out/'receipt.json')],check=True)
 assert Image.open(out/'death.png').tobytes()==Image.open(P/'death.png').tobytes()
 print('PASS exact factory reproduction; 32 original frames preserved; four-frame clip identical')
