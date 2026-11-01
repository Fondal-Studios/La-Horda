#!/usr/bin/env python3
"""Corre el lazo de repintado para TODAS las celdas únicas de un campeón (en orden: reposo frontal = ancla, luego el resto).
Uso: champion-run.py CHAMP LOOPROOT [--budget N]   (env PACKS=packs_full.json). Vista de referencia por celda: *_side→1, *_up→2, resto→0."""
import sys,os,json,subprocess
champ,root=sys.argv[1:3];budget=sys.argv[sys.argv.index('--budget')+1] if '--budget' in sys.argv else '300'
P=json.load(open(os.environ['PACKS']))[champ];view={};order=[]
for name,idx in P['sets'].items():
    v=1 if name.endswith('_side') or name.endswith('_left') else 2 if name.endswith('_up') else 0
    for i in idx:
        if i<0: continue
        if i not in view or (v and name.startswith('idle')): view[i]=v
idle=P['sets']['idle_down'][0];cells=[idle]+sorted(i for i in view if i!=idle)
tool=os.path.join(os.path.dirname(__file__),'repaint-loop.js');spent=0;log=[]
for n,i in enumerate(cells):
    env=dict(os.environ,REFVIEW=str(view.get(i,0)),GEN='1',BUDGET='12',MAXROUNDS='2')
    if i!=idle and view.get(i,0)==0:
        a=f'{root}/{champ}/f{idle}/result_g1r1.png'
        if os.path.exists(a): env['ANCHOR']=a
    r=subprocess.run(['node',tool,champ,str(i),root],env=env,capture_output=True,text=True)
    tail=(r.stdout.strip().splitlines() or ['?'])[-1];log.append((i,view.get(i,0),tail,r.stderr.strip()[-120:]));print(champ,i,tail,flush=True)
    try: spent+=int(tail.split('gasto ')[1].split(' ')[0])
    except Exception: pass
    if spent>int(budget): print('PRESUPUESTO del campeón agotado',spent);break
json.dump({'cells':cells,'spent':spent,'log':log},open(f'{root}/{champ}/run.json','w'),indent=1);print('FIN',champ,len(cells),'celdas',spent,'créditos')
