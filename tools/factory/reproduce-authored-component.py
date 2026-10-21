#!/usr/bin/env python3
"""Reproduce a staged component from a hash-pinned recipe using the existing factory."""
import hashlib,json,subprocess,tempfile,sys
from pathlib import Path
from PIL import Image
P=Path(sys.argv[1]);r=json.loads((P/'recipe.json').read_text());sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
source=P/r['source'];base=Path(r['baseline']).resolve()
assert sha(source)==r['sourceSha256'] and sha(base)==r['baselineSha256'], 'Source hash mismatch'
original=Image.open(base).convert('RGBA');im=Image.open(source)
with tempfile.TemporaryDirectory() as tmp:
 out=Path(tmp)
 for n,(frame,rect,height) in enumerate(zip(r['frames'],r['rects'],r['targetHeights'],strict=True)):
  raw=out/f'raw{n}.png';im.crop(rect).save(raw)
  cfg=out/f'cfg{n}.json';cfg.write_text(json.dumps({'atlas':str(base),'atlasSha256':sha(base),'replacement':str(raw),'replacementSha256':sha(raw),'frame':frame,'targetHeight':height}));target=out/f'a{n}.png'
  subprocess.run([sys.executable,'tools/factory/replace-authored-frame.py',str(cfg),str(target)],check=True,capture_output=True);base=target
 final=Image.open(base).convert('RGBA');assert final.tobytes()==Image.open(P/'atlas.png').convert('RGBA').tobytes(), 'Atlas reproduction differs'
 for i in set(range(36))-set(r['frames']):
  x,y=i%4*112,i//4*112;box=(x,y,x+112,y+112)
  assert original.crop(box).tobytes()==final.crop(box).tobytes(), 'Unrequested frame changed'
 cfg=json.loads((P/'clip.json').read_text());cfg.update(source=str(base),sourceSha256=sha(base));(out/'clip.json').write_text(json.dumps(cfg))
 subprocess.run([sys.executable,'tools/factory/extract-authored-clip.py',str(out/'clip.json'),str(out/'clip.png'),str(out/'receipt.json')],check=True,capture_output=True)
 assert Image.open(out/'clip.png').tobytes()==Image.open(P/'hurt.png').tobytes(), 'Clip reproduction differs'
print('PASS exact component reproduction and untouched frames:',P)
