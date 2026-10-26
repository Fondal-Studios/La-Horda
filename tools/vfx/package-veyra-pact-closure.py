import json,hashlib,subprocess,shutil
from pathlib import Path
from PIL import Image,ImageDraw
D=Path('art-source/entregas/veyra-pact-20261025/cierre-01')
def write(n,v): (D/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def blob(p):return subprocess.check_output(['git','hash-object',str(p)]).decode().strip()
main='9c0ac434b2cb80ae16e7220371f59944ac3e9613'
mat={}
for vp in ['mobile','desktop']:
 d=json.loads((D/('final-'+vp)/'capture.json').read_text());a=[a for r in d['rows'] for a in r['ab']]
 assert len(d['rows'])==60 and not d['errors'] and all(x['restore'] and x['state'] and x['visible']>=.8 for x in a)
 mat[vp]={'scenes':len(d['rows']),'samples':len(a),'minVisible':min(x['visible'] for x in a),'restored':sum(x['restore'] for x in a),'statesEqual':sum(x['state'] for x in a),'errors':d['errors'],'scope':'launch only; all other layers stay active'}
 for ar in ['bosque','hielo','infernal','laberinto','acuatica','minas']:
  fs=[D/('final-'+vp)/f'{ar}-{look}-dense-240-{key}.png' for key in ['parent','before'] for look in ['base','gear','alt1','croma','set']]
  out=Image.new('RGB',(1600,560),(20,20,20));dr=ImageDraw.Draw(out)
  for i,p in enumerate(fs):
   im=Image.open(p);x,y=im.width//2,im.height//2;ox=i%5*320;oy=i//5*280;out.paste(im.crop((x-160,y-190,x+160,y+70)),(ox,oy+20));dr.text((ox+3,oy+3),p.stem,fill='white')
  out.save(D/'review'/f'{vp}-{ar}.png')
write('MATRIX_SUMMARY.json',mat)
write('TEST_ATTEMPTS.json',{'attempts':[{'id':'main-full-pact','result':'FAIL 75.5102% dense mobile; initial full pact ablation. Launch overlaps enemy, ground heartbeat obscured. Not a component approval.'},{'id':'candidate01-harness','result':'FAIL before scene: full module eval tried getter-only vey_final binding. Restricted eval to pact painter; runtime untouched for this harness fix.'},{'id':'candidate02','result':'FAIL some sparse contacts below80%; preserved matrix-mobile/desktop JSON and source-attempt02.js. Final anchor y-126/r22; no threshold change.'},{'id':'final','result':'120 scenes /480 exact ABA and states PASS; launch only. Persistent effect not approved.'},{'id':'canary','result':'Opaque full-screen negative fails visibility/ABA as expected; no runtime change.'},{'id':'review-crop','result':'Initial desktop contact crop clipped high heart; expanded native crop to260px without scaling. Full PNG always intact.'}]})
shutil.copyfile('docs/production/quality-five/functional-results.json',D/'functional.json')
shutil.copyfile('js/champions/vfx-b/veyra.js',D/'source.js')
write('REVIEW.json',{'date':'2026-10-25','status':'PASS_COMPONENT','component':'A-FX-veyra-h3/launch-heart','block':'B228','wholeBlockClosed':False,'review':'Open heart with two lobes and split seam reads distinctly from generic shield; native mobile/desktop before/after same pose inspected, six arenas and five equipped appearances. Raised short launch marker clears combat bodies. Existing shield/arena/ally signals retained.','frames':'vy_pact 0-9; 24x24 native KVB','excluded':'vy_pact_idle persistent ground heartbeat remains visually obscured; no approval for entire H3/kit or other PR219 assets.','performance':'local isolated renderer only; no physical phone/thermal/GC certification'})
write('SCOPE_EXTRACTION.json',{'main':main,'runtime':['js/champions/vfx-b/veyra.js'],'diff':'+13/-2','changed':'Only vy_pact painter and launch radius/offset. Existing event760ms, priority/layer/owner/pact duration/particles unchanged.','preserved':['vy_pact_idle recipe/raster/lifecycle','H1/H2/UF','body/skins/sets','hooks.js','pixfx.js','combat/balance/network protocol'],'historicalTestsNotReusedAsCurrent':True})
write('recipe.json',{'medium':'Native KVB code; no raster illustration or imagegen needed','source':'js/champions/vfx-b/veyra.js','component':'A-FX-veyra-h3/launch-heart','frames':10,'size':[24,24],'eventMs':760,'radius':22,'offsetY':-126,'arenas':['bosque','hielo','infernal','laberinto','acuatica','minas'],'env':{'NODE_PATH':'runtime Playwright','CHROMIUM_PATH':'/tmp/chromium'},'commands':{'exportTechnical':'node tools/vfx/verify-veyra-pact-launch.js','owner':'node tools/vfx/verify-veyra-pact-current.js','follow':'OUT=/tmp/follow.json node tools/vfx/verify-kvb-follow-render.js','matrixDesktop':'OUT=/tmp/matrix-desktop node tools/vfx/capture-veyra-pact-closure.js','matrixMobile':'MOBILE=1 OUT=/tmp/matrix-mobile node tools/vfx/capture-veyra-pact-closure.js','negative':'MOBILE=1 ARENAS=bosque LOOKS=base DENSITIES=dense CANARY=1 OUT=/tmp/negative node tools/vfx/capture-veyra-pact-closure.js','relay':'node tools/vfx/veyra-pact-current-online.js','parity':'ONLY=veyra TRACE=0 PARITY_OUT=/tmp/parity.json node tools/vfx/trace-kvb-rng.js','functional':'node tools/quality-five/functional.js','legibility':'ONLY=veyra.pact node tools/vfx/test-decal-legible.js','package':'python tools/vfx/package-veyra-pact-closure.py'},'preview':'76ms diagnostic frames; renderer uses actual760ms event plus fade, preview is not gameplay test'})
(D/'preview.html').write_text('''<!doctype html><meta charset="utf-8"><title>Veyra — corazón de lanzamiento</title><style>body{background:#17151e;color:#eee;font:16px sans-serif}canvas{image-rendering:pixelated;border:1px solid #555;margin:10px}</style><h1>Pacto — lanzamiento</h1><p>10 fases nativas · diagnóstico 76 ms · el latido del suelo sigue pendiente.</p><div id="a"></div><script>for(const ar of ['bosque','hielo','infernal','laberinto','acuatica','minas']){const c=document.createElement('canvas');c.width=c.height=96;a.append(c);const im=new Image();im.src='vy_pact-'+ar+'.png';im.onload=()=>{let f=0;setInterval(()=>{const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,96,96);g.drawImage(im,f*24,0,24,24,0,0,96,96);f=(f+1)%10},76)}}<\/script>'''.replace('<\\/script>','</script>'))
(D/'CHECKPOINT.md').write_text('''# Veyra — cierre aislado del lanzamiento de Pacto

25/10/2026. Base main9c0ac434b2cb80ae16e7220371f59944ac3e9613. PR219 ya incorporó el taller; no se reabre PR196 ni se vuelve a integrar ese conjunto. Último cierre Libertador171f23c verificado, sin interrupción nueva.

VALIDADO / PASS_COMPONENT sólo A-FX-veyra-h3/launch-heart (B228). Corazón abierto con dos lóbulos y sutura;24x24x10, seis atlas de arena. Radio cosmético22/y-126, evento760ms original. Un runtime+13/-2; ninguna mecánica, cuerpo/skin, H1/H2/UF, aura persistente ni emisor cambia. El latido del suelo sigue EN_CORRECCION, no cerrar H3 ni kit.

Nuevos controles:14dueño/lifecycle y12follow sobre main;34raster/cache/renderer/pool/culling sobre candidato;23relay real final hostMorveth/invitadoVeyra táctil con dibujo del nuevo atlas.132funcionales PASS antes del último cambio sólo de radio/offset. Paridad actual360frames29969/29969 KVB on/off repetida dos veces; estado resumido igual, no snapshot completo ni aislamiento global.120escenas seis arenas×cinco apariencias×dos densidades×dos viewports:480restauraciones A/B/A y estados exactos, mínimo100%retención de cuerpos, umbral80%/delta24 intactos.18mediciones del gate existente con sólo veyra.pact PASS; no equivale a revisión del aura persistente. Cinco consumidores de apariencia observados con83dibujos cada uno en prueba móvil focalizada.

Primer conjunto75.51% y candidato anterior con fallos bajo80% conservados. Canary opaco falla como corresponde. Doce hojas nativas y capturas completas seleccionadas revisadas; índice completo de raster, no todos subidos. Performance aislado600renders×32eventos p95~0.1ms/max20.4ms local; no móvil físico/GC/frame completo.

CI exacthead pendiente; no merge/publicación todavía. Consultar REMOTE_CLOSURE posterior y PR. Publicación actual de Veyra difiere de main, documentada en PUBLICATION_PRE. No tocar infraestructura.

SIGUIENTE: seguir este cierre hasta CI aplicable verde, revisar diff/head frescos, listo→merge normal expected_head_sha y verificar PR/main/publicación. No abrir producción para evitar el cierre. Tras completar, alternar producción auditada del siguiente kit realmente faltante; la cola54 y los FIX de PR219 se conservan. Comandos en recipe.json.
''')
# Select all text evidence plus native sheets and a small set of full renders; original source and failed attempts preserved.
selected=[p for p in D.rglob('*') if p.is_file() and p.suffix in ['.json','.log','.js','.html','.md'] and p.name not in ['manifest.json','REMOTE_CLOSURE.json','PNG_INDEX.json']]
selected+=list((D/'review').glob('*.png'))+list(D.glob('vy_pact-*.png'))
for sub in ['final-mobile','final-desktop']:
 for ar in ['bosque','infernal']:
  for key in ['before','parent']:
   selected.append(D/sub/f'{ar}-base-dense-240-{key}.png')
selected += [D/'attempt-01-full-pact/bosque-base-dense-160-before.png',D/'matrix-mobile/infernal-gear-sparse-240-before.png']
idx=[{'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size} for p in D.rglob('*.png')]
write('PNG_INDEX.json',{'generated':idx,'notAllUploaded':True});selected.append(D/'PNG_INDEX.json')
selected += [Path('js/champions/vfx-b/veyra.js'),Path('docs/production/CORRECTION_BATCH.json')]+[Path('tools/vfx')/n for n in ['capture-veyra-pact-closure.js','verify-veyra-pact-current.js','verify-veyra-pact-launch.js','veyra-pact-current-online.js','package-veyra-pact-closure.py']]
selected=sorted(set(selected));files=[{'path':str(p),'sha256':sha(p),'gitBlob':blob(p),'bytes':p.stat().st_size} for p in selected]
write('manifest.json',{'schema':1,'state':'VALIDADO','integration':'PENDING_CI','component':'A-FX-veyra-h3/launch-heart','base':main,'files':files});selected.append(D/'manifest.json')
Path('/tmp/veyra-upload-paths.json').write_text(json.dumps([str(p) for p in selected]));print('files',len(selected),'bytes',sum(p.stat().st_size for p in selected))
