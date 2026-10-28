"""Cross-check captured runtime registries with disk; never promote mechanical checks to art PASS."""
import hashlib,json,re
from collections import Counter
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/art-audit/combat-inventory'
def read(n): return json.loads((OUT/n).read_text())
def write(n,v): (OUT/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
r=read('registries.json'); regs=r['registries']; packs=[]
for key,p in regs['CHAMP_PACK'].items():
 if not isinstance(p,dict) or not isinstance(p.get('atlas'),dict): continue
 src=p['atlas'].get('image',''); f=ROOT/src
 row={'id':key,'source':src,'exists':f.is_file(),'rawSets':p.get('rawSets'), 'normalizedSets':p.get('sets'),'technicalFindings':[]}
 if f.is_file():
  im=Image.open(f).convert('RGBA'); w,h,cols=p['fw'],p['fh'],p['cols']; row['dimensions']=list(im.size)
  if im.width!=cols*w or im.height%h:row['technicalFindings'].append('grid-dimensions')
  indexes=sorted({~v if v<0 else v for a in p['sets'].values() if isinstance(a,list) for v in a if isinstance(v,int)})
  frames={}; hashes={}
  for i in indexes:
   x,y=(i%cols)*w,(i//cols)*h
   if x+w>im.width or y+h>im.height: row['technicalFindings'].append('out-of-bounds:'+str(i));continue
   fr=im.crop((x,y,x+w,y+h)); alpha=fr.getchannel('A'); box=alpha.getbbox(); hist=alpha.histogram()
   # Ignore invisible RGB and cell padding when checking exact duplicate poses.
   if box:
    crop=fr.crop(box); pixels=list(crop.getdata());crop.putdata([px if px[3] else (0,0,0,0) for px in pixels]);digest=hashlib.sha256(str(crop.size).encode()+crop.tobytes()).hexdigest()
   else:digest=None
   hashes[i]=digest
   frames[str(i)]={'bbox':list(box) if box else None,'partialAlphaPixels':sum(hist[1:255]),'edgeTouch':bool(box and (box[0]==0 or box[1]==0 or box[2]==w or box[3]==h)),'poseSha256':digest}
  row['frames']=frames;row['referencedCells']=len(indexes);row['distinctNonemptyPoses']=len(set(hashes.values())-{None})
  row['animationEvidence']={k:{'slots':len(a),'uniqueNonemptyPoses':len({hashes.get(~i if i<0 else i) for i in a}-{None}),'mirroredSlots':sum(i<0 for i in a)} for k,a in p['sets'].items() if isinstance(a,list) and all(isinstance(i,int) for i in a)}
 packs.append(row)
write('atlas-checks.json',packs)
probes=read('hero-runtime.json'); enemy=read('enemies/coverage.json')
if isinstance(enemy,dict): print('enemy root keys',list(enemy)); enemy=enemy.get('results',[])
summary=read('summary.json')
summary['completed']+=['all 104 enemy types sampled with actual drawEnemyBody (walk cycle, attack, hit, death)','registered CHAMP_PACK cells checked against image dimensions, alpha, edges and exact duplicate poses']
summary['pending']=[p for p in summary['pending'] if p!='full enemy renderer coverage']
summary['pending']+=['15 universal cosmetic manifestations: combinations with 43 heroes not yet sampled','separate Crystal Wars entry point and mode-specific NPC/structure branches not yet exhausted']
summary['counts']['enemyTypesProbed']=len(enemy)
summary['counts']['atlasPacksChecked']=len(packs)
summary['heroProbeErrors']=sum(bool(s['error']) for h in probes for a in h['records'] for s in a['samples'])
summary['emptyHeroSamples']=sum(not s['pixels'] for h in probes for a in h['records'] for s in a['samples'])
summary['enemyEmptyOrErrorStates']=sum(bool(s.get('err')) or (not s.get('px') and '(arena)' not in e.get('src',{}).get(st,'')) for e in enemy for st,s in e.get('states',{}).items())
summary['enemyIntentionalArenaDraws']=sum(not s.get('px') and '(arena)' in e.get('src',{}).get(st,'') for e in enemy for st,s in e.get('states',{}).items())
summary['globalMissingAssets']=None;summary['globalMissingFrames']=None
write('summary.json',summary)
surfaces=[]
patterns={
 'summons':r'function\s+((?:drawSkeletonMinion|drawGolemReal|drawSylvaWolf|.*Summon\w*))\s*\(',
 'transformations':r'function\s+((?:nanoMonster\w*|drawDemon\w*|.*Transform\w*))\s*\(',
 'projectiles':r'function\s+((?:_drawProjCore|drawProjectileFx|drawProjStyle|projStyleOf))\s*\(',
 'props':r'function\s+((?:draw\w*(?:Prop|Aid|Castle|Tower)\w*))\s*\(',
 'vfx':r'function\s+((?:vfx\w*|.*DrawFx\w*))\s*\(',
 'ui':r'function\s+((?:drawCanvasIcon|drawIconText|.*[Ii]con\w*))\s*\('
}
for f in sorted((ROOT/'js').rglob('*.js')):
 text=f.read_text()
 for category,pat in patterns.items():
  for m in re.finditer(pat,text):surfaces.append({'category':category,'symbol':m[1],'file':str(f.relative_to(ROOT)),'line':text[:m.start()].count('\n')+1,'status':'code-evidence-awaiting-branch-review'})
write('supplemental-surfaces.json',{'scopeComplete':False,'codeSurfaces':surfaces,'registeredProceduralForms':list(regs['UF']['forms']),'registeredVfx':list(regs['VFX_SPR_EXTRA']),'registeredPixelUiIcons':list(regs['PXI_ART']), 'evidence':'UF functions and PXI_ART authored grids are intentional code-native art per ART_BIBLE sections 7 and 15, not missing PNGs. Other surfaces require individual review.'})
for n in ['hero-runtime.json','registries.json','files.json','literal-references.json','atlas-checks.json']:
 # Machine evidence stays compact; README contains the human summary.
 (OUT/n).write_text(json.dumps(read(n),ensure_ascii=False,separators=(',',':'))+'\n')
print(json.dumps(summary['counts']));print('hero errors',summary['heroProbeErrors'],'empty',summary['emptyHeroSamples']);print('enemy empty/errors',summary['enemyEmptyOrErrorStates'])
