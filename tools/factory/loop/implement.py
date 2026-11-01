#!/usr/bin/env python3
"""Implementador: reemplaza en el atlas del juego SOLO las celdas aprobadas por el arquitecto y deja el original respaldado.
Uso: implement.py CHAMP LOOPROOT APPROVALS.json [--dry]
APPROVALS.json: {"frames":{"<idx>":"<ronda, p.ej. g1r1>"}, "complete":true|false, "verdict_by":"..."}
Regla: si 'complete' es false (faltan cuadros) NO integra: un set mezclado de dos diseños se vería peor que el actual."""
import sys,os,json,shutil
from PIL import Image
champ,root,appr=sys.argv[1:4];dry='--dry' in sys.argv
packs=json.load(open(os.environ['PACKS']))[champ];a=json.load(open(appr))
if not a.get('complete'): sys.exit('no integra: aprobación incompleta (faltan cuadros)')
src=packs['src'];fw,fh,cols=packs['fw'],packs['fh'],packs['cols']
bak=f'art-source/originals/{champ}/'+os.path.basename(src);os.makedirs(os.path.dirname(bak),exist_ok=True)
if not os.path.exists(bak): shutil.copy(src,bak)           # el original se conserva (rollback)
at=Image.open(bak).convert('RGBA')
for i,rnd in a['frames'].items():
    i=int(i);c=Image.open(f'{root}/{champ}/f{i}/candidate_cell_{rnd}.png').convert('RGBA');assert c.size==(fw,fh),(i,c.size)
    box=((i%cols)*fw,(i//cols)*fh);at.paste((0,0,0,0),(box[0],box[1],box[0]+fw,box[1]+fh));at.alpha_composite(c,box)
if dry: print('dry ok',len(a['frames']),'cuadros');sys.exit()
at.save(src);w=src.rsplit('.',1)[0]+'.webp'
if os.path.exists(w): at.save(w,'WEBP',lossless=True)
json.dump({'champ':champ,'atlas':src,'backup':bak,'frames':a['frames'],'verdict_by':a.get('verdict_by')},open(f'art-source/originals/{champ}/integration.json','w'),indent=1)
print('integrado',champ,len(a['frames']),'cuadros; respaldo',bak)
