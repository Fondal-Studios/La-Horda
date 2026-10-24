"""Fail fast on source/atlas alpha and existing extraction cut evidence; no image mutation."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
P=Path(__file__).resolve().parent
v=json.loads((P/'VERIFICATION.json').read_text())
rows=[]
for name in ['sources/pose-sheet-raw.png','atlas-diagnostic.png']:
 a=np.array(Image.open(P/name).convert('RGBA'))[:,:,3]
 n=int(((a>0)&(a<255)).sum());rows.append({'file':name,'partialAlphaPixels':n,'pass':n==0})
contacts=[f['frame'] for f in v['frames'] if f['sourceOpaqueTouchesCell']]
r={'state':'EN_CORRECCION','gate':'FIX / NO_INTEGRAR','alpha':rows,'cutContactFrames':contacts,'pass':all(x['pass'] for x in rows) and not contacts,'scope':'Necessary technical checks only; cannot grant visual approval.'}
(P/'SOURCE_GATE.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r));raise SystemExit(0 if r['pass'] else 1)
