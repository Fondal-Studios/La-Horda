#!/usr/bin/env python3
"""Valida tuplas (es,en,pt): mismos {n}, sin vacíos, sin saltos de marcador rotos. Uso: validate-tr.py tools/i18n/tr/t1xx.py ..."""
import sys,re,importlib.util
bad=0
for f in sys.argv[1:]:
    sp=importlib.util.spec_from_file_location('m',f);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
    seen=set()
    for t in m.T:
        if len(t)!=3 or not all(isinstance(x,str) and x.strip() for x in t): print(f,'tupla inválida',str(t)[:80]);bad+=1;continue
        es,en,pt=t
        if es in seen: print(f,'duplicada',es[:60]);bad+=1
        seen.add(es)
        for l,x in(('en',en),('pt',pt)):
            if es.count('{n}')!=x.count('{n}'): print(f,l,'{n} distinto:',es[:60]);bad+=1
            if re.search(r'[áéíóúñ¿¡]{1}',x) and l=='en' and re.search(r'\b(el|la|los|de|que|con)\b',x): print(f,'¿sin traducir en?',x[:60]);bad+=1
    print(f,len(m.T),'tuplas')
sys.exit(1 if bad else 0)
