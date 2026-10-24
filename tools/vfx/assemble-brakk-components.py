# Reensambla capturas 1:1 y valida consumidores; no aprueba Art Gate.
from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
p=Path('art-source/entregas/brakk-kit-20261022/validacion-04');(p/'matrix').mkdir(exist_ok=True)
for vp in ['mobile','landscape']:
 for arena in ['bosque','hielo','infernal','laberinto','acuatica','minas']:
  for slot in [1,2,3]:
   im=Image.new('RGB',(1200,2660),(20,20,25));d=ImageDraw.Draw(im)
   for i,(look,density) in enumerate((l,de)for l in ['base','gear','alt1','croma','set']for de in ['dense','sparse']):
    im.paste(Image.open(p/vp/f'{arena}-{look}-{density}-h{slot}.png'),(0,i*266+26));d.text((6,i*266+7),f'{vp} {arena} {look} {density} H{slot} | 80 / 330 / 610 / 1600 ms | recorte 1:1',fill='white')
   im.save(p/'matrix'/f'{vp}-{arena}-h{slot}.png',optimize=True)
for arena in ['bosque','infernal','minas']:
 im=Image.new('RGB',(1170,4*870),(20,20,25));d=ImageDraw.Draw(im)
 for i,(look,density) in enumerate((l,de)for l in ['base','set']for de in ['dense','sparse']):
  for j,key in enumerate(['before','without','restored']):im.paste(Image.open(p/'signature-ab'/f'{arena}-{look}-{density}-h2-ab-{key}.png'),(j*390,i*870+26))
  d.text((6,i*870+7),f'{arena} {look} {density} H2 | original / sin firma / restaurado byte identico | 330 ms',fill='white')
 im.save(p/'matrix'/f'signature-ab-{arena}.png',optimize=True)
print('matrix PNGs',len(list((p/'matrix').glob('*.png'))),'MB',sum(f.stat().st_size for f in (p/'matrix').glob('*.png'))/1e6)
# Coverage assertions performed on saved actual-consumer traces, never approving art.
checks=[]
def check(name,ok,details=None):checks.append({'name':name,'pass':bool(ok),'details':details})
for vp in ['mobile','landscape']:
 j=json.load(open(p/vp/'capture.json'));check(vp+' scenes=180',len(j['results'])==180);check(vp+' no browser errors',not j['errors'])
 for slot in [0,1,2]:
  rows=[r for r in j['results']if r['slot']==slot];expected=['brakk_build','brakk_deploy','brakk_repair'][slot];check(vp+f' H{slot+1} all real casts',all(any(e[1].split('~')[0]==expected for e in r['trace'])for r in rows));check(vp+f' H{slot+1} actual atlas draws',all(any(k.split('|')[1].split('~')[0]==expected and n>0 for k,n in r['draws']['kit'].items())for r in rows));check(vp+f' H{slot+1} equipped body drawn',all(r['draws']['body']>0 for r in rows))
 check(vp+' skin equipment resolved',all(r['resolved']['equipment']==4 and (r['look']!='alt1' or r['resolved']['pack']=='croma_brakk_alt1') and (r['look']!='croma' or r['resolved']['skin']=='brakk_croma') and (r['look']!='set' or r['resolved']['pack']=='skin_quality_brakk')for r in j['results']if r['look']!='base'))
 check(vp+' repair burst and aura rendered',all(r['draws']['kit'].get('burst|brakk_repair~p',0)>0 and r['draws']['kit'].get('aura|brakk_repair~p',0)>0 for r in j['results']if r['slot']==2))
 check(vp+' nail volley rendered',all(r['draws']['kit'].get('beam|brakk_nails',0)>0 for r in j['results']if r['slot']==1))
 g=json.load(open(p/vp/'component-legibility.json'));check(vp+' isolated80 gate',not g['bad'] and not g['errors'],min(r['min']for a in g['measurements']for r in a['rows']))
base={(r['arena'],r['look'],r['density'],r['slot']):r for r in json.load(open(p/'mobile/capture.json'))['results']};diag=json.load(open(p/'signature-diagnostic/capture.json'))['results'];pairs=sum(r['sceneHash']==base[(r['arena'],r['look'],r['density'],r['slot'])]['sceneHash']for r in diag)
ab=json.load(open(p/'signature-ab/capture.json'))['results'];check('12 same-frame ABA restore',len(ab)==12 and all(a['identicalRestoration'] and a['beforeHash']!=a['withoutHash']for r in ab for a in r['ab']));check('12 ABA pool state identical',all(a['stateUnchanged']for r in ab for a in r['ab']))
for f in (p/'atlases').glob('*.png'):check('atlas identical '+f.name,f.read_bytes()==(p.parent/'validacion-03/atlases'/f.name).read_bytes())
neg=json.load(open(p/'negative-control/component-legibility.json'));check('opaque negative control fails',neg['bad']>0,neg['bad'])
report={'checks':checks,'failed':sum(not c['pass']for c in checks),'independentSessionDiagnostic':{'pairs':36,'sameInitialScene':pairs,'notCausalEvidence':36-pairs,'supersededBy':'12 same-frame ABA restores'},'state':'EN_CORRECCION','integralArtGate':False}
(p/'coverage.json').write_text(json.dumps(report,indent=2)+'\n');print('coverage',len(checks),'failed',report['failed'])
