#!/usr/bin/env python3
"""Compila tools/i18n/tr/t*.py -> js/i18n/en.js, pt.js. Claves: español exacto o prefijo único (>=40 chars)."""
import json,sys,glob,importlib,os,re
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0,ROOT+'/tools/i18n/tr')
ES=json.load(open(ROOT+'/docs/i18n/es-strings.json'))['strings']
ES=ES if isinstance(ES,list) else list(ES)
ES=[s if isinstance(s,str) else s.get('t','') for s in ES]
def resolve(k):
    if k in ES: return k
    w=lambda x:re.sub(r'\s+',' ',x).strip()
    c=[w(s) for s in ES]; kk=w(k)
    m=[ES[i] for i,s in enumerate(c) if s.startswith(kk)]
    return min(m,key=len) if m else k
en={};pt={}
for f in sorted(glob.glob(ROOT+'/tools/i18n/tr/t*.py')):
    mod=importlib.import_module(os.path.basename(f)[:-3])
    for es,e,p in mod.T:
        k=resolve(es); en[k]=e; pt[k]=p
pats=importlib.import_module('patterns') if os.path.exists(ROOT+'/tools/i18n/tr/patterns.py') else None
for lang,d,i in (('en',en,1),('pt',pt,2)):
    pp=[[a[0],a[i]] for a in (pats.P if pats else [])]
    js='"use strict"; /* js/i18n/%s.js — generado por tools/i18n/build.py (no editar a mano) */\nif(window.I18N) I18N.add(%s,%s,%s);\n'%(lang,json.dumps(lang),json.dumps(d,ensure_ascii=False,indent=0),json.dumps(pp,ensure_ascii=False))
    open(ROOT+'/js/i18n/%s.js'%lang,'w').write(js)
    print(lang,len(d),'entradas',len(pp),'patrones')
