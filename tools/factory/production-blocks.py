#!/usr/bin/env python3
"""Rebuild a work queue from existing task IDs; never approve or close artwork."""
import argparse, collections, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/production/asset-blocks.json'
LABELS = {'01-cuerpos': 'Cuerpos, animaciones y formas', '02-combate': 'Efectos y habilidades',
          '03-mundo': 'Enemigos, jefes, arenas y objetos del mundo', '04-interfaz': 'Iconos e interfaz',
          '05-cosmeticos': 'Skins y apariencias de sets', '06-seguimiento': 'Seguimientos agregados (no dibujar dos veces)'}
def category(b):
    t=b['tipo']
    if t=='seguimiento_agregado': return '06-seguimiento'
    if t in ['campeon','forma']: return '01-cuerpos'
    if t in ['fx','A']: return '02-combate'
    if t in ['iconos','E']: return '04-interfaz'
    if t in ['skin','set_skin']: return '05-cosmeticos'
    return '03-mundo'
def build():
    c=json.loads((ROOT/'art-source/entregas/control_produccion.json').read_text())
    p=json.loads((ROOT/'art-source/entregas/bloques/plan_bloques.json').read_text())
    items={i['id']:i for i in c['items']}; seen=set(); rows=[]
    assert len(items)==len(c['items']), 'Duplicate task IDs'
    for b in p['bloques']:
        assert not seen.intersection(b['items']), 'Task appears in multiple blocks'
        seen.update(b['items'])
        pending=[i for i in b['items'] if items[i]['estado'] not in ['INTEGRADO_MAIN','INTEGRADO_CLAUDE']]
        rows.append({'id':b['id'],'group':category(b),'title':b['titulo'],'priority':b['prioridad'],
                     'items':b['items'],'pending':pending,'state':b['estado'],
                     'dependencies':b.get('depende_de',[]),'closureCriteriaRef':'art-source/entregas/bloques/plan_bloques.json#'+b['id']})
    assert seen==set(items), 'Unassigned tasks'
    groups=[]
    for key,label in LABELS.items():
        bs=[b for b in rows if b['group']==key]
        groups.append({'id':key,'label':label,'blocks':len(bs),'openBlocks':sum(bool(b['pending']) for b in bs),
                       'pendingTasks':sum(len(b['pending']) for b in bs)})
    return {'schema':1,'counting':'Tasks are not individual PNGs. Aggregates track kits and may refer to the same art as detailed tasks. Exports without complete visual gates remain pending.',
            'active':'B002','next':['B003','B004','B005'], 'groups':groups,'blocks':rows,
            'unmappedMergedDeliveries':[{'pr':180,'scope':'12 Libertador locomotion frames; no corresponding missing locomotion task'},
                                      {'pr':183,'scope':'19 equipment icon designs; not part of the original task IDs'}]}
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--write',action='store_true');args=ap.parse_args()
    data=build();text=json.dumps(data,ensure_ascii=False,indent=2)+'\n'
    if args.write: OUT.write_text(text)
    elif not OUT.exists() or OUT.read_text()!=text: raise SystemExit('Queue is stale; run --write')
    print(json.dumps({'blocks':len(data['blocks']),'groups':data['groups']},ensure_ascii=False))
if __name__=='__main__': main()
