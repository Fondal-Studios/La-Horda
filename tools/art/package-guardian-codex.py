from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,gzip,subprocess,shutil
R=Path(__file__).resolve().parents[2];O=R/'art-source/entregas/guardianes-codex-20261029/produccion-01'
def put(n,d): (O/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for k in ['musashi','cazadora','nigromante']:
 for view in ['mobile','desktop']:
  cv=Image.new('RGB',(1920,1260),'#202923');dr=ImageDraw.Draw(cv)
  for row,a in enumerate(['bosque','infernal','hielo','minas','acuatica','fortaleza']):
   for slot in range(4):
    for side,label in enumerate(['before','after']):
     im=Image.open(O/f'{k}-{view}-{label}-{a}-sequence.png');idx=slot*3+1;x=(idx%4)*480;y=(idx//4)*300;crop=im.crop((x+120,y+40,x+360,y+230));xx=(slot*2+side)*240;yy=row*210;cv.paste(crop,(xx,yy+20));dr.text((xx+3,yy+2),f'{a} H{slot+1} {label}',fill='white')
  cv.save(O/f'review-{k}-{view}.webp',lossless=True)
for p in O.glob('*-mobile-after-bosque-full.png'):Image.open(p).save(p.with_suffix('.webp'),lossless=True)
for p in O.glob('GAME*.json'):
 with gzip.GzipFile(str(p)+'.gz','wb',mtime=0) as f:f.write(p.read_bytes())
for p in Path('/tmp/guardian-visual').glob('heroes-*.png'):shutil.copy2(p,O/p.name)
for p in Path('/tmp/guardian-enemy-coverage').glob('contact_*.png'):
 if not (O/(p.stem+'.webp')).exists():Image.open(p).save(O/(p.stem+'.webp'),lossless=True)
if Path('/tmp/guardian-enemy-coverage/coverage.json').exists():shutil.copy2('/tmp/guardian-enemy-coverage/coverage.json',O/'ENEMY_CONTACT_COVERAGE.json')
r=json.loads((O/'VISUAL_CLASSIFICATION.json').read_text());lines=['# Auditoría visual de guardianes y enemigos — 29/10/2026','',r['scope'],'','16 críticos visuales iniciales; 131 con revisión pendiente. Cero aprobaciones integrales por un contacto aislado. Musashi, Sylva e Ilvar son el bloque de corrección actual; ver REVIEW.json para el alcance aprobado.','', '| Grupo | ID / nombre | Categoría inicial | Diagnóstico |','|---|---|---|---|']
for x in r['rows']:lines.append('| '+ ' | '.join(str(x.get(k,'')).replace('|','/') for k in ['group','name','category','detail'])+' |')
(O/'AUDIT.md').write_text('\n'.join(lines)+'\n')
refs=[]
for k in ['musashi','cazadora','nigromante']:
 p=R/f'assets/ui/codex/champions/{k}.png';refs.append({'champion':k,'path':str(p.relative_to(R)),'sha256':sha(p),'base':'c0a025016e0315b93870f2f4c86abb846619d30e','used':'Small sprite references on Codex sheet; portrait secondary.'})
put('SOURCE_REFERENCES.json',refs)
put('recipe.json',{'generator':'built-in image_gen, original PNG preserved','reproduction':'python tools/art/pack-guardian-codex.py','scope':'Reproduces atlas bytes from saved authored sources, not deterministic AI generation. No palette filter or threshold relaxation.','frames':'48 authored poses each in atlas, 126 new unique poses actually selected across three packs, plus four old Ilvar transformation poses. Ilvar18 rejected; rear04 replaces8. Extra sources supply4 idle/4 hit/6 death and passing walk poses; explicit mirrored left clips preserve contract.','packing':'alpha>127 binary extraction, nearest resampling, 192x160 cell, 4cols13rows; source geometry and explicit Sylva feet anchors in script. Detached Ilvar recoil staff retained.','normalization':'Only base entries musashi/cazadora/nigromante measured against roster. Skins unchanged.','commands':['node tools/art/guardian-codex-native.js','node tools/art/guardian-codex-temporal.js','node tools/art/game-guardian-codex.js','node tools/art/guardian-codex-online.js','ROSTER_BASE_URL=<local server> node tools/art/roster_gate.js']})
put('TEST_ATTEMPTS.json',{'attempts':['Original Ilvar rear: six native ILUSTRACION failures; source and NATIVE_ATTEMPT01 preserved.','Rear02 and rear03: eight native failures each; preserved, not integrated.','Rear04 asymmetric cloak from Codex: native pass; initial roster up62px vs59 failed, normalization0.968 corrected to PASS.','Temporal01 fixture omitted _aPrev, attack clock reset: invalid static attack sequence, preserved attempt01-temporal. Corrected harness and rerun.','Sylva four front attacks initially anchored to arrow tip; source feet anchors corrected in packing.','Ilvar detached recoil staff initially omitted by component extraction; retained original component99 in final.','First online attempt lacked ws; root npmci had no root lock, failed. npmci in server restored locked dependencies; final relay passed.','First roster server in separate exec namespace refused connection; same-process server fixed.','Queue export first exceeded argument size before write; chunked exact content succeeded.'],'historical':'GAME_MATRIX covers final Musashi/Sylva; Ilvar initial body before rear04. REAR_MATRIX_FINAL supersedes its changed rear and normalization. ONLINE before rear04 covers identical loader/network; final temporal and native cover changed pixels. No global state equality claim.'})
# Immutable latest main queue already contains exact latest Veyra67 plus Ilkan.
q=json.loads((R/'docs/production/CORRECTION_BATCH.json').read_text());q['entries']=[x for x in q['entries'] if x.get('component') not in [k+'.cuerpo.codex' for k in ['musashi','cazadora','nigromante']]]
for k in ['musashi','cazadora','nigromante']:q['entries'].append({'component':k+'.cuerpo.codex','frames':'base motion/attack/cast/hurt/death','source':str(O.relative_to(R))+'/'+k+'-source.png','sourceSha256':sha(O/(k+'-source.png')),'state':'VALIDADO_LOCAL_PENDING_CI','diagnosis':'Initial body identity differs from Codex. Corrected source and real consumer; old atlas retained.','action':'Exact-head CI then normal expected-SHA merge and separate canonical publication verification.','checkpoint':str(O.relative_to(R))+'/CHECKPOINT.md'})
q['updated']='2026-10-29';q['latestClosure']=str(O.relative_to(R))+'/CHECKPOINT.md';(R/'docs/production/CORRECTION_BATCH.json').write_text(json.dumps(q,ensure_ascii=False,indent=2)+'\n')
print('packaged review and audit')
