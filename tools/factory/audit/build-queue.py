#!/usr/bin/env python3
"""Fusiona dump (assets.json), métricas automáticas y reseñas visuales independientes en la COLA DE PRIORIDADES legible por máquina.
Uso: build-queue.py DUMP_DIR METRICS.json REVIEW_base.json REVIEW_croma.json REVIEW_set.json OUT.json"""
import sys,os,json,hashlib,subprocess,datetime
D,MET,RB,RC,RS,OUT=sys.argv[1:7]
A={a['id']+'|'+a['type']:a for a in json.load(open(D+'/assets.json'))['assets']}
met=json.load(open(MET));rev={}
for f,t in ((RB,'base'),(RC,'croma'),(RS,'set')):
    if os.path.exists(f):
        for k,v in json.load(open(f)).items(): rev[k+'|'+t]=v
def sha(p):
    try: return hashlib.sha256(open(p,'rb').read()).hexdigest()
    except Exception: return None
DONE={'myla':'art-source/originals/myla/approval.json','ynara':'art-source/originals/ynara/approval.json','saelis':'art-source/originals/saelis/approval.json','aurelia':'art-source/originals/aurelia/approval.json','maura':'art-source/originals/maura/approval.json'}
PARTIAL={'renko':'22/36 celdas generadas sin revisar (art-source/repaint-loop-20261102/renko)','profeta':'6/37 celdas generadas sin revisar (art-source/repaint-loop-20261102/profeta)'}
ORDER={'P0':0,'P1':1,'P2':2,'P3':3,'P4':4,'OK':5,'SIN_REVISAR':6}
items=[]
for key,a in A.items():
    t=a['type'];r=rev.get(key,{});m=met.get(a['id'],{})
    P=a.get('pack') or {};cells=len({i for v in (P.get('setsMap') or {}).values() for i in v if i>=0})
    pri=r.get('priority','SIN_REVISAR')
    for fl in m.get('flags',[]):
        if fl.startswith(('cuadro_vacio','preview_ausente','sin_pack')) and ORDER[pri]>0: pri='P0'
    it={'id':a['id'],'type':t,'champ':a['champ'],'name':a.get('name'),'priority':pri,'status':'pendiente',
        'surfaces':{'in_game':{'atlas':P.get('src'),'frame':[P.get('fw'),P.get('fh')],'unique_cells':cells,'atlas_sha256':sha(P.get('src') or ''),'strip_evidence':a.get('stripFile')},
                    'store':{'preview':a.get('preview'),'preview_sha256':sha(a.get('preview') or '')}},
        'auto_flags':m.get('flags',[]),'auto_metrics':m.get('metrics',{}),
        'review':{'defects':r.get('defects',[]),'recommended_fix':r.get('recommended_fix'),'effort':r.get('effort'),'fidelity_0_100':r.get('fidelity_0_100')},
        'production':{'est_credits_gen4_image_720p':int(cells*5*1.5) if P and r.get('recommended_fix','').startswith('repintar') else 0,'method':'tools/factory/loop (repaint-loop → arquitecto → implement)' if P else 'preview/otra familia: ver defects'}}
    if t=='base' and a['id'] in DONE:
        it['status']='integrado_en_rama_pr259';it['integration']={'approval':DONE[a['id']],'note':'ver approval.json: puntaje y pulido pendiente'}
    elif t=='base' and a['id'] in PARTIAL: it['status']='en_produccion_parcial';it['integration']={'note':PARTIAL[a['id']]}
    if t=='set':
        it['economy']={'current':'Se vende por separado (Brasas 800 / oro 9000, solo apariencia; js/data/pricing.js) pero completar el set todavía la regala (js/ui/shop-ui.js, js/systems/shop.js: skinAutoEquip).',
                       'proposed_category':'skin_comun','proposed':'Tratarla como skin común (catálogo de apariencias); el set queda solo como ítems con mejoras no cosméticas. Decisión de diseño del dueño: NO implementada aquí (toca economía y progreso).'}
    items.append(it)
items.sort(key=lambda x:(ORDER.get(x['priority'],9),0 if x['status']=='pendiente' else 1,x['champ'],x['type']))
cnt={}
for i in items: cnt.setdefault(i['priority'],{}).setdefault(i['type'],0);cnt[i['priority']][i['type']]+=1
commit=subprocess.run(['git','rev-parse','HEAD'],capture_output=True,text=True).stdout.strip()
q={'schema':'asset-priority-queue/v1','generated_utc':datetime.datetime.utcnow().isoformat()+'Z','commit':commit,
   'how_to_read':'items ordenados por prioridad. Un verificador posterior (tools/factory/audit/verify-queue.js) recalcula hashes/flags y marca qué cambió, qué sigue pendiente y qué costo falta.',
   'priority_legend':{'P0':'CRÍTICO: roto/ausente/ilegible; bloquea o confunde al jugar','P1':'ALTO: identidad muy distinta del Códice o preview≠sprite','P2':'MEDIO: jugable con diferencias notables','P3':'BAJO: pulido','P4':'MEJORA opcional','OK':'sin acción','SIN_REVISAR':'sin reseña visual'},
   'method_note':'Las prioridades P* salen de reseñas visuales de agentes revisores independientes de esta sesión + métricas automáticas ruidosas; no sustituyen la revisión humana ni el visual gate de docs/ART_BIBLE.md.',
   'economy_note':'Decisión de diseño pendiente (dueño, 2026-11-02): las skins de set deberían pasar a ser skins comunes y los sets, ítems con mejoras no cosméticas. Hoy se venden por separado pero completar el set las regala; ver items[type=set].economy.','summary':cnt,'estimated_credits_total':sum(i['production']['est_credits_gen4_image_720p'] for i in items),'items':items}
json.dump(q,open(OUT,'w'),indent=1,ensure_ascii=False);print(cnt,'créditos estimados',q['estimated_credits_total'])
