from pathlib import Path
from PIL import Image
import numpy as np,json
D=Path(__file__).resolve().parents[2]/'art-source/entregas/maura-kit-20261025/cierre-01';rows=[]
for view in ['desktop','mobile']:
 for arena in ['bosque','hielo','infernal','laberinto','acuatica','minas']:
  for look in ['base','gear','set','skin','tier4']:
   for slot in range(3):
    folder=D/(f'roots-final-{view}' if slot==0 else f'composite-{view}');t=350 if slot==1 else 300;counts={}
    for density in ['dense','sparse']:
     a=np.array(Image.open(folder/f'{arena}-{look}-{density}-h{slot}-{t}-before.png').convert('RGB')).astype(np.int16)
     b=np.array(Image.open(folder/f'{arena}-{look}-{density}-h{slot}-{t}-absent.png').convert('RGB')).astype(np.int16)
     d=np.max(np.abs(a-b),axis=2);counts[density]={'anyDifferencePixels':int((d>0).sum()),'delta24Pixels':int((d>24).sum())}
    rows.append({'view':view,'arena':arena,'look':look,'slot':slot,'pixels':counts,'denseToSparseDelta24':counts['dense']['delta24Pixels']/max(1,counts['sparse']['delta24Pixels'])})
summary={str(i):{'minRatio':min(r['denseToSparseDelta24'] for r in rows if r['slot']==i),'minDensePixels':min(r['pixels']['dense']['delta24Pixels'] for r in rows if r['slot']==i),'maxDensePixels':max(r['pixels']['dense']['delta24Pixels'] for r in rows if r['slot']==i)} for i in range(3)}
(D/'EFFECT_VISIBILITY_DIAGNOSTIC.json').write_text(json.dumps({'rows':rows,'summary':summary,'method':'Per-image same-state before/absent difference; compare counts between dense and sparse fixtures. RGB delta24 diagnostic only, no new acceptance threshold and not actor retention. Separate sparse/dense scenes differ in actors and RNG histories.','purpose':'Locate own-effect readability loss independently of the already-passing body-retention gate.'},indent=2))
print(summary)
