import hashlib,json,subprocess,tempfile
from pathlib import Path
from PIL import Image
P=Path(__file__).resolve().parent;s=json.loads((P/'source.json').read_text());src=Path(s['source'])
assert hashlib.sha256(src.read_bytes()).hexdigest()==s['sourceSha256']
o=Path(tempfile.mkdtemp(prefix='guardavia-v4-'))
subprocess.run(['python3','tools/factory/import-authored-sheet.py',s['baselineManifest'],str(o/'base')],check=True)
raw=o/'pose20.png';Image.open(src).crop(tuple(s['rect'])).save(raw);base=o/'base/atlas.png'
m={'atlas':str(base),'atlasSha256':hashlib.sha256(base.read_bytes()).hexdigest(),'replacement':str(raw),'replacementSha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'frame':20};(o/'assembly.json').write_text(json.dumps(m))
subprocess.run(['python3','tools/factory/replace-authored-frame.py',str(o/'assembly.json'),str(o/'atlas.png')],check=True)
assert Image.open(o/'atlas.png').tobytes()==Image.open(P/'candidate-only20.png').tobytes()
r=subprocess.run(['node','tools/art/check-authored-density.js',str(o/'atlas.png'),str(o/'native.json')]);assert r.returncode==1 and json.loads((o/'native.json').read_text())['failedFrames']==s['failedFrames']
print('Reproduced known FIX; no installation:',o)
