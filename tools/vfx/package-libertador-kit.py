from pathlib import Path
import json,hashlib,subprocess,shutil
from PIL import Image
D=Path('art-source/entregas/libertador-kit-20261025/primera-pasada-01');base=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
def sha(b):return hashlib.sha256(b).hexdigest()
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def write(n,v):(D/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
idx=json.load(open(D/'FRAME_INDEX.json'))
for s in idx:
 im=Image.open(D/s['file']).convert('RGBA')
 for f in s['frames']:f['rgbaSha256']=sha(im.crop((f['f']*s['w'],0,(f['f']+1)*s['w'],s['h'])).tobytes())
 s['uniqueRGBA']=len(set(f['rgbaSha256'] for f in s['frames']))
write('FRAME_INDEX.json',idx)
paths=subprocess.check_output(['git','ls-tree','-r','--name-only','HEAD','assets/sprites/champions/libertador','assets/sprites/champions/libertador_escarcha','assets/sprites/champions/libertador_ancestral'],text=True).splitlines()+['js/champions/libertador.js','js/assets/champion-sprites.js','js/rendering/champion-sprites.js','js/champions/ult-forms/bind.js','js/data/champion-tuning.js']
refs=[]
for p in paths:
 if not Path(p).is_file():continue
 b=Path(p).read_bytes();expected=subprocess.check_output(['git','rev-parse','HEAD:'+p],text=True).strip();refs.append({'path':p,'sha256':sha(b),'gitBlob':blob(b),'baseGitBlob':expected,'unchanged':blob(b)==expected})
write('SOURCE_REFERENCES.json',{'base':base,'references':refs,'allUnchanged':all(r['unchanged'] for r in refs)})
cap=json.load(open(D/'capture.json'));pairs=[]
for mobile in [False,True]:
 for slot in range(4):
  a,b=[r for r in cap['rows'] if r['mobile']==mobile and r['slot']==slot];pairs.append({'mobile':mobile,'slot':slot,'precastEqual':a['sceneHash']==b['sceneHash'],'frameEqual':[x['sha256']==y['sha256'] for x,y in zip(a['frames'],b['frames'])]})
write('COMPARISON.json',{'pairs':pairs,'precastEqual':sum(p['precastEqual'] for p in pairs),'ufEqual':sum(sum(p['frameEqual']) for p in pairs if p['slot']==3),'scope':'16 scenes,64 PNG, Bosque/base only; no integral matrix or compound gate'})
write('AUDIT.json',{'base':base,'openPRs':[90,92,211],'priorPR166':'closed/superseded by PR219; do not duplicate specialized61 body/horse/locomotion/death','freshAudit':'6 scenes/12 frames on main before edits, zero page errors; native captures in before index; existing H3 full band during mount and H2 large patterned nova over real spectral PNGs','existing':refs,'changedRuntime':['js/champions/skill-fx-a/c/libertador.js'],'diff':'+67/-6','notMissing':['body','horse','death','12 locomotion frames','spectral_01..05','buff_icon_01..04','basic','UF'],'scope':'B157/B158/B159 VFX sublayers only; not body or complete kit','limitations':['H2 radius inherited430, not new scaled-recipient certification','Travel projection derives from actual hero position; walls/knockback/recast/multiple casters not certified','Export tail frames can be unused when real motion finishes; no lifetime extension to gameplay']})
review={'state':'EN_CORRECCION','gate':'FIX/NO_INTEGRAR','integration':'WORKSHOP_ONLY','publication':'NOT_APPLICABLE_UNMERGED','visual':'Inspected native mobile H1 80ms, H2 480ms, H3 480ms and atlas contact. Travel tracks actual displacement and excludes mount; H2 exposes existing spectral sprites. Shapes still too thin for approval.','components':[
 {'block':'B157','component':'A-FX-libertador-h1','kind':'bayonet','frames':list(range(12)),'diagnosis':'Thin two-edged trace reads arrow near feet; hand/weapon anchoring and contact hierarchy unresolved; last phases can be skipped on impact stop.'},
 {'block':'B158','component':'A-FX-libertador-h2','kind':'command','frames':list(range(12)),'diagnosis':'Five open command arcs preserve spectral images, but become tiny ticks over arena; inherited radius430 not verified for modified area.'},
 {'block':'B159','component':'A-FX-libertador-h3','kind':'charge','frames':list(range(12)),'diagnosis':'Small bright hoof marks read sparkles at actual mobile scale; instantaneous removal when phase ends; interrupted/mounted/recast cases need grouped lifecycle review.'}],
 'tests':{'technical':25,'relay':11,'parityFrames':360,'rng':[27434,27434],'summaryEqual':True,'fullSnapshot':False,'capturePrecastEqual':8,'UFPNGEqual':8,'reexportPNGExact':3,'previewCanvases':3,'regression':'40/42; E17.tres_pisadas and E19.agotamiento FAIL, no root cause or main baseline established'},
 'pending':['six arenas','equipped skins/set','compound contrast','impacts/walls/knockback/recasteo','multiple recipients/casters','sustained mobile performance','final Art Gate','exact-head CI']}
write('REVIEW.json',review)
write('recipe.json',{'medium':'Native SfaStrip code; Pintor/forja/imagegen not used for code-native VFX','source':'source.js','base':base,'original':'source-before.js','atlas':[{k:s[k] for k in ['kind','theme','art','w','h','n','sha256','uniqueRGBA']} for s in idx],'renderer':'Only champion SFA module changes. Existing beamDraw callback; actual hero index and projection; mount/death/dismount return without pixels. H2 nova reuses existing spectral body; normal SFA extras opt-out; basic/UF use patria unchanged. No gameplay/protocol fields written.','commands':['node tools/vfx/produce-libertador-kit.js','EXPORT_ONLY=1 OUT=/tmp/libertador-reexport node tools/vfx/produce-libertador-kit.js','node tools/vfx/parity-libertador-kit.js','node tools/vfx/libertador-kit-online.js','SE_BASE_URL=<local server> node tools/regression/t_champs_se.js '+str(D/'regression'),'python tools/vfx/package-libertador-kit.py'],'environment':'Playwright via NODE_PATH, CHROMIUM_PATH valid Chromium138, npm ci server; disposable loopback relay only.'})
write('TEST_ATTEMPTS.json',{'attempts':[{'id':'browser','result':'npm pack @sparticuz/chromium138.0.2, tar --no-same-owner, Brotli extraction and chromium --version succeed'},{'id':'parity01','result':'Before browser launch, stale default output directory caused ENOENT source-before.js. Log preserved parity-attempt01.log; fixed test path only.'},{'id':'parity02','result':'360frames parent/candidate SFA active equal summary,27434/27434RNG,0page errors'},{'id':'technical-capture','result':'25PASS;16scenes64frames0errors;8precast pairs identical;8UF PNG identical'},{'id':'relay','result':'First attempt11PASS, host and actual touch guest, exactvariants; no new protocol/accounts edits'},{'id':'regression','result':'40/42, E17.tres_pisadas and E19.agotamiento fail; full JSON/log and failure images retained. No baseline equivalence or root cause claimed.'},{'id':'reexport-preview','result':'3PNG byte-identical; preview3paintedcanvases0errors,diagnostic90ms only'}]})
write('PNG_INDEX.json',[{'path':str(p.relative_to(D)),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size} for p in D.rglob('*.png')])
q=json.load(open('docs/production/CORRECTION_BATCH.json'));old=[e for e in q['entries'] if not str(e.get('id','')).startswith('libertador.') or not str(e.get('id','')).endswith('.first-pass-20261025')];q['entries']=old[:]
for c in review['components']:
 s=next(s for s in idx if s['kind']==c['kind']);q['entries'].append({'id':'libertador.'+c['kind']+'.first-pass-20261025','block':c['block'],'component':c['component'],'state':'EN_CORRECCION','integration':'NO_INTEGRAR','frames':c['frames'],'source':str(D/'source.js'),'sourceSha256':sha((D/'source.js').read_bytes()),'atlas':str(D/s['file']),'atlasSha256':s['sha256'],'frameHashes':str(D/'FRAME_INDEX.json'),'defects':[c['diagnosis']],'next':'Grouped kit correction, complete real-scale/skins/arenas/lifecycle/performance gates; preserve existing sources and mechanics.'})
assert q['entries'][:len(old)]==old
q['updated']='2026-10-25';q['policy']='Alternate production batches and complete closures; current-main integration is not visual approval.';q['next']='CIERRE Veyra B228 on current main: reconcile own Pacto/follower/RNG patches from PR219, then compound skins/arenas/lifecycle/performance Art Gate. Do not repeat Libertador production or reopen merged workshops.'
q['latestProduction']={'base':base,'block':['B157','B158','B159'],'path':str(D),'state':'EN_CORRECCION','entriesPreserved':len(old)}
Path('docs/production/CORRECTION_BATCH.json').write_text(json.dumps(q,ensure_ascii=False,indent=2)+'\n')
(D/'CHECKPOINT.md').write_text('''# Libertador — primera pasada 25/10/2026

GENERADO / EN_CORRECCION / NO_INTEGRAR. Base main9c0ac434b2cb80ae16e7220371f59944ac3e9613, PR219 reconciliado; no talleres activos de Libertador. Cierre remoto Solciju9d98fa6 confirmado, sin cierre perdido nuevo.

B157/B158/B159: tres atlas nativos,36fases (33no vacías,3cierres transparentes),31RGBA distintos sumados por atlas (12/12/7). Bayoneta128x32, mando192x192, huellas128x32;12fases cada uno. Un único runtime SFA cambia+67/-6. Enganche sólo taller: desplazamiento observado, sin franja durante montaje/muerte/desmontaje. Cuerpo/contrato61/caballo/espectrales/bufficons/básico/UF preservados. No cierra bloques enteros.

25técnicos,11relay real anfitriónSolciju/invitadoLibertador táctil PASS.360frames27434/27434RNG y estado resumido iguales, no snapshot completo ni aislamiento global.16escenas64capturas Bosque/base;8sceneHash precast iguales y8PNG UF idénticos.3reexportaciones byteidénticas;preview3canvases0errores. Regresión amplia40/42: E17.tres_pisadas yE19.agotamiento Ilkan FALLAN, sin raíz ni equivalencia main demostrada; logs/JSON/imágenes conservados. No declararla PASS.

FIX visual: bayoneta fina/tipo flecha junto a pies; mando se pierde en marcas pequeñas; herraduras parecen chispas. Falta composición integral, skins/equipo/seisarenas, extremos de lifecycle, rendimiento y Art Gate. Atlas completo no equivale a todas las fases consumidas: el fin real del movimiento puede cortar la cola. Cola54preserva51. No merge ni publicación de estos candidatos.

Siguiente: CIERRE Veyra B228 sobre main fresco, cotejando parches propios Pacto/seguimiento/RNG ya incorporados por PR219 y el historial correccion-rng-02; completar contraste compuesto/skins/seisarenas/lifecycle/performance y verificar CI del cambio exacto si lo hay. No reabrir PR196 ni remergear talleres. Comandos reproducibles en recipe.json. No repetir Libertador como nueva primera pasada. Inventario incompleto.
''')
selected=[]
for p in D.iterdir():
 if p.suffix in ['.json','.js','.html','.md','.log']:selected.append(p)
for n in ['bayonet.png','command.png','charge.png','atlas-contact.png','before-mobile-h1-80.png','candidate-mobile-h1-80.png','before-mobile-h2-480.png','candidate-mobile-h2-480.png','before-mobile-h3-480.png','candidate-mobile-h3-480.png','candidate-mobile-h3-160.png','before-desktop-h3-480.png','candidate-desktop-h3-480.png','online-host.png','online-touch-guest.png']:selected.append(D/n)
for n in ['champs_se.json','e17_step1.png','e17_step2.png','e17_step3.png','e19_exhausted.png']:selected.append(D/'regression'/n)
selected += [Path('js/champions/skill-fx-a/c/libertador.js'),Path('docs/production/CORRECTION_BATCH.json')]+[Path('tools/vfx')/n for n in ['produce-libertador-kit.js','parity-libertador-kit.js','libertador-kit-online.js','package-libertador-kit.py']]
selected=list(dict.fromkeys(p for p in selected if p.name not in ['manifest.json','REMOTE_CLOSURE.json']))
files=[{'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes()),'gitBlob':blob(p.read_bytes())} for p in selected]
write('manifest.json',{'schema':1,'base':base,'state':'EN_CORRECCION','integration':'WORKSHOP_ONLY','publication':'NOT_APPLICABLE_UNMERGED','files':files,'notAllRasterUploaded':True,'allGeneratedRasterIndex':'PNG_INDEX.json','runtimeChanged':['js/champions/skill-fx-a/c/libertador.js']})
Path('/tmp/libertador-upload-paths.json').write_text(json.dumps([f['path'] for f in files]+[str(D/'manifest.json')]))
print(json.dumps({'files':len(files)+1,'bytes':sum(f['bytes'] for f in files),'refs':len(refs),'queue':len(q['entries'])}))
