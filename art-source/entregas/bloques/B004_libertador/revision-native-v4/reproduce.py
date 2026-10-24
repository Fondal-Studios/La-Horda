import hashlib,json,subprocess,tempfile
from pathlib import Path
from PIL import Image
ROOT=Path.cwd()
P=Path(__file__).resolve().parent
spec=json.loads((P/'assembly.json').read_text())
assert hashlib.sha256((P/'source.png').read_bytes()).hexdigest()==spec['sourceSha256']
out=Path(tempfile.mkdtemp(prefix='libertador-native-v4-'))
im=Image.open(P/'source.png')
base=ROOT/'art-source/entregas/bloques/B004_libertador/revision-native-v2/preflight/atlas.png'
for i,frame in enumerate([20,21,23]):
 raw=out/f'pose-{frame}.png'
 im.crop((round(i*im.width/3),0,round((i+1)*im.width/3),im.height)).save(raw)
 manifest={'atlas':str(base),'atlasSha256':hashlib.sha256(base.read_bytes()).hexdigest(),'replacement':str(raw),'replacementSha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'frame':frame,'targetHeight':66}
 config=out/f'assembly-{frame}.json';config.write_text(json.dumps(manifest))
 target=out/f'assembled-{frame}.png'
 subprocess.run(['python3','tools/factory/replace-authored-frame.py',str(config),str(target)],check=True)
 base=target
assert Image.open(base).tobytes()==Image.open(P/'atlas.png').tobytes()
r=subprocess.run(['node','tools/art/check-authored-density.js',str(base),str(out/'native.json'),'1'])
assert r.returncode==1 and json.loads((out/'native.json').read_text())['failedFrames']==[20,23]
print('Reproduced known FIX; not approved:',out)
