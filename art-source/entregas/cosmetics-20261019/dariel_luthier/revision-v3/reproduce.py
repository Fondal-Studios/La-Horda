import subprocess,tempfile
from pathlib import Path
from PIL import Image
P=Path(__file__).resolve().parent
out=Path(tempfile.mkdtemp(prefix='dariel-authored-v3-'))
subprocess.run(['python3','tools/factory/import-authored-sheet.py',str(P.parent/'fuentes/importacion.json'),str(out/'original')],check=True)
assert Image.open(out/'original/atlas.png').tobytes()==Image.open(P.parent/'skin/atlas.png').tobytes()
subprocess.run(['python3','tools/factory/replace-authored-frame.py',str(P/'assembly.json'),str(out/'atlas.png')],check=True)
assert Image.open(out/'atlas.png').tobytes()==Image.open('assets/sprites/champions/dariel/skins/dariel_luthier/atlas.png').tobytes()
print('Original35 frames preserved, correction reproducible')
