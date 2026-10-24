#!/usr/bin/env python3
"""Empaqueta exportaciones nativas y evidencia del renderer sin alterar sus píxeles."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,subprocess,shutil
R=Path(__file__).resolve().parents[2]; D=R/'art-source/entregas/farolero-kit-20261023/primera-pasada-01';base='f62d181477adcb4607cc615411cc51bad769f681'
def dump(name,data): (D/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def sha(b):return hashlib.sha256(b).hexdigest()
v=json.loads((D/'VERIFICATION.json').read_text());specs=v['sources']; frames=[]
contact=Image.new('RGB',(768,600),'#20212b');cg=ImageDraw.Draw(contact);yy=0
for s in specs:
 name=s['theme']+'-'+s['art']+'.png';im=Image.open(D/name).convert('RGBA'); hashes=[]
 cg.text((4,yy),name,fill='white');yy+=18
 for f in range(s['n']):
  crop=im.crop((f*s['w'],0,(f+1)*s['w'],s['h']));hs=sha(crop.tobytes());hashes.append(hs)
  frames.append({'atlas':name,'frame':f,'rgbaSha256':hs,'opaquePixels':s['cells'][f],'intentionalTransparentClosure':s['cells'][f]==0})
  # Contact sheet samples 0, 3, 6, 9 at native scale; all frames remain in PNG strip.
  if f in [0,3,6,9]:
   x=5+[0,3,6,9].index(f)*190;contact.paste(crop,(x,yy),crop);cg.rectangle((x,yy,x+s['w'],yy+s['h']),outline='#494a55');cg.text((x,yy+s['h']+2),str(f),fill='white')
 s['distinctRgbaFrames']=len(set(hashes));s['pngSha256']=sha((D/name).read_bytes());s['rgbaSha256']=sha(im.tobytes());s['pivot']=[1,s['h']/2] if s['art']=='cone' else [s['w']/2,s['h']/2];s['phases']={'loop':list(range(s['n']))} if s['art']=='beam' else {'anticipation':[0,1],'impact':[2,3,4,5,6,7],'dissipation':[8,9,10,11]}
 yy+=s['h']+25
contact.crop((0,0,768,yy)).save(D/'contact-sheet.png')
dump('FRAME_INDEX.json',{'frames':frames,'totalPhases':len(frames),'nonEmpty':sum(x['opaquePixels']>0 for x in frames),'distinctSumWithinAtlases':sum(s['distinctRgbaFrames'] for s in specs),'note':'Repeated phases are counted honestly, not claimed unique poses.'})
comparison=[]
for orientation in ['horizontal','mobile']:
 a=json.loads((D/('before-'+orientation)/'capture.json').read_text());b=json.loads((D/('after-'+orientation)/'capture.json').read_text())
 for before,after in zip(a['results'],b['results']):
  i=before['slot'];comparison.append({'viewport':orientation,'slot':i,'sceneHashBefore':before['sceneHash'],'sceneHashAfter':after['sceneHash'],'samePrecastScene':before['sceneHash']==after['sceneHash'],'ufPngChecks':[{ 'file':n,'identical':(D/('before-'+orientation)/n).read_bytes()==(D/('after-'+orientation)/n).read_bytes()} for n in [f'farolero-{i}.png',f'farolero-{i}-native250.png',f'farolero-{i}-native500.png']] if i==3 else []})
 # All four native 256ms frames, before above after: actual resolution, no resize.
 ims=[Image.open(D/(stage+'-'+orientation)/f'farolero-{i}-native250.png').convert('RGB') for stage in ['before','after'] for i in range(4)]
 w,h=ims[0].size;sheet=Image.new('RGB',(w*4,h*2+40),'#20212b');dr=ImageDraw.Draw(sheet)
 for n,im in enumerate(ims):x=(n%4)*w;y=(n//4)*(h+20);dr.text((x+4,y+3),('ANTES ' if n<4 else 'DESPUES ')+str(n%4)+' 256ms',fill='white');sheet.paste(im,(x,y+20))
 sheet.save(D/('comparison-native-'+orientation+'.png'))
dump('COMPARISON.json',{'scenes':comparison,'sceneHashPass':all(x['samePrecastScene'] for x in comparison),'UFAllIdentical':all(y['identical'] for x in comparison for y in x['ufPngChecks']),'scope':'8 precast scenes; native comparison at 256ms. Complete before/after PNGs and all traces included. Not full Art Gate.'})
re=[]
for s in specs:
 n=s['theme']+'-'+s['art']+'.png';re.append({'file':n,'sha256':sha((D/n).read_bytes()),'same':(D/n).read_bytes()==(Path('/tmp/farolero-reexport')/n).read_bytes()})
dump('REEXPORT.json',{'checks':re,'allIdentical':all(x['same'] for x in re)})
source=R/'js/champions/skill-fx-a/c/farolero.js';(D/'sources').mkdir(exist_ok=True);shutil.copyfile(source,D/'sources/farolero-native.js')
prefix='NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules CHROMIUM_PATH=/tmp/chromium '
commands=[prefix+'node tools/vfx/verify-farolero-kit.js',prefix+'OUT=/tmp/farolero-reexport node tools/vfx/verify-farolero-kit.js']
for mobile in [False,True]:
 for before in [False,True]: commands.append(prefix+('MOBILE=1 ' if mobile else '')+('BASELINE=1 ' if before else '')+'OUT='+str(D.relative_to(R))+'/'+('before-' if before else 'after-')+('mobile' if mobile else 'horizontal')+' node tools/vfx/capture-farolero-kit.js')
commands +=[prefix+'ONLY=farolero node tools/vfx/parity-farolero-kit.js',prefix+'node tools/portadores/farolero-firstpass-check.js',prefix+'node tools/portadores/farolero-firstpass-online.js',prefix+'node tools/portadores/farolero-regression.js','python3 tools/vfx/package-farolero.py',prefix+'node tools/vfx/check-farolero-preview.js']
dump('recipe.json',{'schema':1,'base':base,'source':str(source.relative_to(R)),'sourceSha256':sha(source.read_bytes()),'approach':'Native SfaStrip pixel recipe; Painter body/donor forge not applicable to these geometric VFX. No new body, no imagegen source or third-party service required.','specs':specs,'commands':commands,'dependencies':['playwright','Chromium','Pillow','server dependencies using existing lockfile'],'timing':'Placement700ms, flash cone560ms/shutter480ms, path cast700ms; object path4500ms, beam8 phases global70ms inherited. Preview95ms diagnostic only. Captures80/256/512/1104/2000ms.'})
refs=['docs/ART_BIBLE.md','docs/production/PAINTER.md','docs/production/ASSET_BLOCKS.md','docs/art-brief/campeones/farolero.md','js/data/portadores.js','js/champions/portadores.js','js/rendering/portadores.js','js/champions/skill-fx-a/templates.js','js/champions/skill-fx-a/props.js','js/champions/skill-fx-a/motifs.js','js/champions/skill-fx-a/themes.js','js/champions/ult-forms/forms-2a-1.js','js/champions/ult-forms/bind-2a.js']
refs+= [str(p.relative_to(R)) for p in (R/'assets/sprites/champions/farolero').rglob('*.png')]
refs+= [str(p.relative_to(R)) for p in (R/'art-source/entregas/2026-10_mundo/iconos/habilidades').glob('farolero_*.png')]
refdata=[]
for f in refs:
 old=subprocess.check_output(['git','show',base+':'+f],cwd=R);new=(R/f).read_bytes();refdata.append({'path':f,'sha256':sha(new),'identicalToMain':old==new})
dump('SOURCE_REFERENCES.json',{'base':base,'references':refdata,'allPreserved':all(x['identicalToMain'] for x in refdata)})
js=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'js'],cwd=R,text=True).splitlines();changed=[f for f in js if f.endswith('.js') and (R/f).read_bytes()!=subprocess.check_output(['git','show',base+':'+f],cwd=R)]
dump('RUNTIME_DIFF.json',{'base':base,'javascriptCompared':sum(f.endswith('.js') for f in js),'changed':changed,'sharedExtensionsMatchPR207':all((R/'js/champions/skill-fx-a'/f).read_bytes()==(R.parent/'la-horda-facu/js/champions/skill-fx-a'/f).read_bytes() for f in ['engine.js','bind.js']),'noGameplayFilesChanged':set(changed)=={'js/champions/skill-fx-a/'+f for f in ['engine.js','bind.js','c/farolero.js']}})
html='<!doctype html><meta charset="utf-8"><title>Farolero · primera pasada</title><style>body{background:#171922;color:#e9e1cb;font:16px system-ui;margin:28px}img,canvas{image-rendering:pixelated;max-width:100%}section{border-top:1px solid #666;padding:16px}canvas{background:#30313a}</style><h1>Farolero · EN_CORRECCION / NO_INTEGRAR</h1><p>Cuatro atlas nativos. Animación de diagnóstico a 95 ms; no es el timing del juego. Fuentes, atlas y capturas reales conservadas. Definitiva y cuerpo existentes intactos.</p>'
for s in specs:
 name=s['theme']+'-'+s['art']+'.png';html+=f'<section><h2>{name}</h2><canvas width="{s["w"]}" height="{s["h"]}" data-src="{name}" data-n="{s["n"]}"></canvas><p>{s["n"]} fases, {s["distinctRgbaFrames"]} RGBA distintos</p><img src="{name}"></section>'
html+='<h2>Antes / después, mismo escenario y escala</h2>'
for ori in ['horizontal','mobile']:
 for i in range(4):
  html+=f'<section><h3>{ori} · habilidad {i}</h3><img src="before-{ori}/farolero-{i}.png"><img src="after-{ori}/farolero-{i}.png"></section>'
html+='<script>for(const c of document.querySelectorAll("canvas")){const im=new Image();im.src=c.dataset.src;let f=0;const g=c.getContext("2d");g.imageSmoothingEnabled=false;setInterval(()=>{if(!im.complete)return;g.clearRect(0,0,c.width,c.height);g.drawImage(im,f*c.width,0,c.width,c.height,0,0,c.width,c.height);f=(f+1)%Number(c.dataset.n)},95)}</script>'
(D/'preview.html').write_text(html)
print(json.dumps({'phases':len(frames),'nonEmpty':sum(x['opaquePixels']>0 for x in frames),'distinct':sum(s['distinctRgbaFrames'] for s in specs),'references':len(refdata),'sceneHash':all(x['samePrecastScene'] for x in comparison),'ufIdentical':all(y['identical'] for x in comparison for y in x['ufPngChecks']),'changed':changed}))
