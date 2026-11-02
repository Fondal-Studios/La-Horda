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
# Correcciones de falsos positivos de la reseña visual: tanque, guerrero, libertador y myla dibujan la muerte desde un pack SUPLEMENTARIO
# (CHAMP_PACK.tanque_death / guerrero_death / libertador_death / myla_death; ver drawChampPackDeath), que la tira de la auditoría no muestra.
DEATH_SUPP={'tanque':'tanque_death','guerrero':'guerrero_death','libertador':'libertador_death','myla':'myla_death'}
ORDER={'P0':0,'P1':1,'P2':2,'P3':3,'P4':4,'OK':5,'SIN_REVISAR':6}
items=[]
for key,a in A.items():
    t=a['type'];r=rev.get(key,{});m=met.get(a['id'],{})
    P=dict(a.get('pack') or {});kind='archivo'
    if str(P.get('src','')).startswith('data:'): kind='recolor_runtime(data-url)';rsha=hashlib.sha256(P['src'].encode()).hexdigest();P['src']=None
    else: rsha=None
    cells=len({i for v in (P.get('setsMap') or {}).values() for i in v if i>=0})
    pri=r.get('priority','SIN_REVISAR')
    if t=='base' and a['id'] in DEATH_SUPP and r:
        fp=[d for d in r.get('defects',[]) if d.get('code')=='muerte' and 'No existe' in d.get('note','')]
        if fp:
            r=dict(r);r['defects']=[d for d in r['defects'] if d not in fp]+[{'code':'correccion_auditoria','where':'muerte','note':f"Falso positivo de la reseña: la muerte existe en el pack suplementario {DEATH_SUPP[a['id']]} (no aparece en la tira). Revisar su coherencia con el arte del set principal."}]
            codes={d['code'] for d in r['defects']}
            pri='P1' if 'identidad' in codes else ('P2' if a['id']=='myla' else 'P3')
            if a['id']=='myla': r['defects'].append({'code':'muerte','where':'muerte (pack myla_death)','note':'La muerte es del arte ANTERIOR de Myla y no coincide con el set repintado.'})
    for fl in m.get('flags',[]):
        if fl.startswith(('cuadro_vacio','preview_ausente','sin_pack')) and ORDER[pri]>0: pri='P0'
    it={'id':a['id'],'type':t,'champ':a['champ'],'name':a.get('name'),'priority':pri,'status':'pendiente',
        'surfaces':{'in_game':{'atlas':P.get('src'),'frame':[P.get('fw'),P.get('fh')],'unique_cells':cells,'atlas_kind':kind,'atlas_sha256':rsha or sha(P.get('src') or ''),'strip_evidence':a.get('stripFile')},
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
# Verificación objetiva (no depende de la reseña): previews de tienda idénticos byte a byte entre productos distintos
byhash={}
for i in items:
    h=i['surfaces']['store']['preview_sha256']
    if h: byhash.setdefault(h,[]).append(i['type']+':'+i['id'])
for i in items:
    h=i['surfaces']['store']['preview_sha256'];grp=byhash.get(h,[]) if h else []
    if len(grp)>1:
        i['auto_flags'].append('preview_duplicado_con:'+','.join(g for g in grp if g!=i['type']+':'+i['id']))
        if ORDER.get(i['priority'],9)>1: i['priority']='P1'
items.sort(key=lambda x:(ORDER.get(x['priority'],9),0 if x['status']=='pendiente' else 1,str(x['champ']),x['type']))
cnt={}
for i in items: cnt.setdefault(i['priority'],{}).setdefault(i['type'],0);cnt[i['priority']][i['type']]+=1
commit=subprocess.run(['git','rev-parse','HEAD'],capture_output=True,text=True).stdout.strip()
q={'schema':'asset-priority-queue/v1','generated_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'commit':commit,
   'how_to_read':'items ordenados por prioridad. Un verificador posterior (tools/factory/audit/verify-queue.js) recalcula hashes/flags y marca qué cambió, qué sigue pendiente y qué costo falta.',
   'priority_legend':{'P0':'CRÍTICO: roto/ausente/ilegible; bloquea o confunde al jugar','P1':'ALTO: identidad muy distinta del Códice o preview≠sprite','P2':'MEDIO: jugable con diferencias notables','P3':'BAJO: pulido','P4':'MEJORA opcional','OK':'sin acción','SIN_REVISAR':'sin reseña visual'},
   'method_note':'Las prioridades P* salen de reseñas visuales de agentes revisores independientes de esta sesión + métricas automáticas ruidosas; no sustituyen la revisión humana ni el visual gate de docs/ART_BIBLE.md.',
   'economy_note':'Ver docs/art-factory/ASSET_PRIORITY_QUEUE.json (economy_note): modelo del dueño aclarado el 2026-11-02; desajuste PIECES_FOR_BRASAS=true.','summary':cnt,'estimated_credits_total':sum(i['production']['est_credits_gen4_image_720p'] for i in items),'items':items}
json.dump(q,open(OUT,'w'),indent=1,ensure_ascii=False);print(cnt,'créditos estimados',q['estimated_credits_total'])
