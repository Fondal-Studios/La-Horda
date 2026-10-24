import hashlib,json,subprocess,tempfile
from pathlib import Path
from PIL import Image
P=Path(__file__).resolve().parent
spec=json.loads((P/'assembly.json').read_text())
out=Path(tempfile.mkdtemp(prefix='libertador-native-v6-'))
for name,sha in spec['sources'].items():
 assert hashlib.sha256((P/name).read_bytes()).hexdigest()==sha
base=Path(spec['baseline']).resolve()
for entry in spec['replacements']:
 frame=entry['frame'];im=Image.open(P/entry['source'])
 if 'rect' in entry:im=im.crop(tuple(entry['rect']))
 raw=out/f'pose-{frame}.png';im.save(raw)
 manifest={'atlas':str(base),'atlasSha256':hashlib.sha256(base.read_bytes()).hexdigest(),'replacement':str(raw),'replacementSha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'frame':frame,'targetHeight':spec['targetHeight']}
 config=out/f'assembly-{frame}.json';config.write_text(json.dumps(manifest))
 target=out/f'assembled-{frame}.png'
 subprocess.run(['python3','tools/factory/replace-authored-frame.py',str(config),str(target)],check=True)
 base=target
actual=Image.open(base).convert('RGBA')
assert actual.tobytes()==Image.open(P/'atlas.png').convert('RGBA').tobytes()
original=Image.open(P.parent/'revision-native-v2/preflight/atlas.png').convert('RGBA')
for frame in set(range(36))-{20,21,23}:
 x,y=frame%4*112,frame//4*112;box=(x,y,x+112,y+112)
 assert actual.crop(box).tobytes()==original.crop(box).tobytes(),frame
subprocess.run(['node','tools/art/check-authored-density.js',str(base),str(out/'native.json'),'1'],check=True)
assert json.loads((out/'native.json').read_text())['failedFrames']==[]
print('PASS exact reproduction, 33 original frames preserved, 36 native frames. Workshop only; no runtime installation.')
