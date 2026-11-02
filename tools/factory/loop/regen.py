#!/usr/bin/env python3
"""Aplica la devolución del arquitecto: regenera SOLO las celdas marcadas con su texto de corrección (el resto se conserva).
Uso: regen.py CHAMP LOOPROOT FIXES.json GEN   (FIXES: {"c2":"texto",...}; env PACKS). La vista de referencia sale del mapa de sets."""
import sys,os,json,subprocess
champ,root,fx,gen=sys.argv[1:5];P=json.load(open(os.environ['PACKS']))[champ];fixes=json.load(open(fx))
view={}
for name,idx in P['sets'].items():
    v=1 if name.endswith(('_side','_left')) else 2 if name.endswith('_up') else 0
    for i in idx:
        if i>=0 and (i not in view or (v and name.startswith('idle'))): view[i]=v
idle=P['sets']['idle_down'][0];tool=os.path.join(os.path.dirname(__file__),'repaint-loop.js')
GEN_RULE=' Keep the halo/signature items of the design visible in every view. Transparent flat green background only: NO ground, NO dirt, NO shadow, nothing drawn under the feet. Same proportions and the same boots as the idle frame.'
for c,t in fixes.items():
    i=int(c.lstrip('c'));d=f'{root}/{champ}/f{i}'
    json.dump({'verdict':'CORREGIR','negative_feedback':t+GEN_RULE,'source':'arquitecto independiente'},open(d+'/architect_feedback.json','w'))
    env=dict(os.environ,REFVIEW=str(view.get(i,0)),GEN=gen,BUDGET=os.environ.get('BUDGET','12'),MAXROUNDS=os.environ.get('MAXROUNDS','2'))
    if view.get(i,0)==0:
        a=f'{root}/{champ}/f{idle}/result_g1r1.png'
        if os.path.exists(a): env['ANCHOR']=a
    else:
        for f in ('anchor.b64','anchor.png'):
            try: os.remove(f'{d}/{f}')
            except OSError: pass
    r=subprocess.run(['node',tool,champ,str(i),root],env=env,capture_output=True,text=True);print(champ,c,(r.stdout.strip().splitlines() or ['?'])[-1],r.stderr.strip()[-100:],flush=True)
print('FIN regen',champ,gen)
