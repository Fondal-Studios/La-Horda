"""Reproduce first-pass VFX diagnostics, never install or approve clipped cells."""
from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
recipe = json.loads((HERE / 'recipe.json').read_text())
report = {'state':'EN_CORRECCION', 'scope':'diagnostic grid exports; not renderer approval', 'sheets':[]}
for sheet in recipe['sheets']:
    src = HERE / sheet['source']
    assert hashlib.sha256(src.read_bytes()).hexdigest() == sheet['sha256']
    im = Image.open(src).convert('RGBA')
    assert im.size == (6*229, 5*229)
    cells, rows = [], []
    for i in range(30):
        x, y = i%6*229, i//6*229
        a = np.array(im.crop((x,y,x+229,y+229)))
        mask = a[:,:,3] >= recipe['alphaThreshold']
        edge = np.zeros(mask.shape, dtype=bool)
        edge[:3,:] = edge[-3:,:] = edge[:,:3] = edge[:,-3:] = True
        opaque, border = int(mask.sum()), int((mask & edge).sum())
        flags = ([] if opaque else ['EMPTY_FRAME']) + (['CELL_EDGE_CONTACT'] if border else [])
        rows.append({'frame':i,'opaque':opaque,'semiSource':int(((a[:,:,3]>0)&(a[:,:,3]<255)).sum()),'borderPixels':border,'flags':flags})
        a[:,:,3] = np.where(mask,255,0)
        a[~mask] = 0
        cells.append(Image.fromarray(a).resize((232,232),Image.Resampling.NEAREST))
    preview = Image.new('RGBA',(1392,1160))
    for i, cell in enumerate(cells): preview.paste(cell,((i%6)*232,(i//6)*232))
    preview.save(HERE / ('preview-'+sheet['name']+'.png'))
    for clip in sheet['clips']:
        atlas = Image.new('RGBA',(232*clip['count'],232))
        for n in range(clip['count']): atlas.paste(cells[clip['start']+n],(n*232,0))
        out = HERE / (clip['name']+'-diagnostic.png')
        if out.exists(): assert Image.open(out).tobytes() == atlas.tobytes(), 'Non-reproducible output'
        else: atlas.save(out)
    report['sheets'].append({'name':sheet['name'],'frames':rows,'nonempty':sum(r['opaque']>0 for r in rows),'emptyFrames':[r['frame'] for r in rows if not r['opaque']],'edgeFrames':[r['frame'] for r in rows if r['borderPixels']]})
report['requestedSlots'] = 90
report['nonemptySlots'] = sum(s['nonempty'] for s in report['sheets'])
report['installed'] = False
(HERE / 'technical.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='sheets'}))
for s in report['sheets']: print(s['name'], 'empty',s['emptyFrames'],'edge',s['edgeFrames'])
