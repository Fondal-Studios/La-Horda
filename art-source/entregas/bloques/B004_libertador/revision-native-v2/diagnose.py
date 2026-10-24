"""B004 source-only diagnostic. Never installs assets or claims approval."""
import base64,hashlib,importlib.util,json,subprocess
from pathlib import Path
import numpy as np
from PIL import Image

ROOT=Path.cwd()
FOLDER=ROOT/'art-source/entregas/bloques/B004_libertador/revision-native-v2'
OUT=Path('/tmp/libertador-native-v2');OUT.mkdir(parents=True,exist_ok=True)
spec=json.loads((FOLDER/'source.json').read_text())
def git_sha(data):
    return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
assert git_sha((ROOT/spec['atlas']).read_bytes())==spec['atlasGitBlobSha'],'Original source changed'
summary={'schema':1,'status':'UNTESTED','approvalClaimed':False,'installed':False,'commit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'frames':spec['frames'],'assemblies':[],'sourceCells':[]}
current=ROOT/spec['atlas']
for repair in spec['replacements']:
    frame=repair['frame'];source=ROOT/repair['source']
    assert git_sha(source.read_bytes())==repair['sourceGitBlobSha'],'Repair source changed'
    image=Image.open(source);assert image.mode=='RGBA','Source must be RGBA'
    rect=tuple(repair.get('rect') or (0,0,image.width,image.height));assert 0<=rect[0]<rect[2]<=image.width and 0<=rect[1]<rect[3]<=image.height
    summary['sourceCells'].append({'frame':frame,'source':repair['source'],'dimensions':image.size,'rect':rect})
    raw=OUT/f'pose-{frame}.png';image.crop(rect).save(raw)
    manifest={'atlas':str(current),'atlasSha256':hashlib.sha256(current.read_bytes()).hexdigest(),'replacement':str(raw),'replacementSha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'frame':frame}
    if 'targetHeight' in repair:manifest['targetHeight']=repair['targetHeight']
    config=OUT/f'assembly-{frame}.json';config.write_text(json.dumps(manifest))
    target=OUT/f'assembled-{frame}.png'
    process=subprocess.run(['python3','tools/factory/replace-authored-frame.py',str(config),str(target)],text=True,capture_output=True)
    if process.returncode:
        summary.update(status='REJECTED_ASSEMBLY',failedFrame=frame,error=process.stderr[-2500:]);break
    summary['assemblies'].append(json.loads(target.with_suffix('.json').read_text()));current=target
else:
    result=OUT/'atlas.png';result.write_bytes(current.read_bytes())
    before=np.array(Image.open(ROOT/spec['atlas']));after=np.array(Image.open(result))
    for frame in range(36):
        if frame not in spec['frames']:
            x,y=frame%4*112,frame//4*112
            assert np.array_equal(before[y:y+112,x:x+112],after[y:y+112,x:x+112]),f'Unrequested change{frame}'
    def metrics(array,frame):
        x,y=frame%4*112,frame//4*112
        rows=(array[y:y+112,x:x+112,3]>40).sum(axis=1);full=np.flatnonzero(rows);body=np.flatnonzero(rows>=rows.max()*.22)
        return {'body':int(body[-1]-body[0]+1),'full':int(full[-1]-full[0]+1),'foot':int(full[-1])}
    summary['bodyComparison']=[{'frame':frame,'before':metrics(before,frame),'after':metrics(after,frame)} for frame in spec['frames']]
    native=subprocess.run(['node','tools/art/check-authored-density.js',str(result),str(OUT/'native.json'),'1'],text=True,capture_output=True)
    assert native.returncode in (0,1),native.stderr
    report=json.loads((OUT/'native.json').read_text())
    audit_spec=importlib.util.spec_from_file_location('candidate_audit',ROOT/'tools/factory/audit-authored-candidates.py')
    audit=importlib.util.module_from_spec(audit_spec);audit_spec.loader.exec_module(audit)
    failed=audit.validate_report(report,hashlib.sha256(result.read_bytes()).hexdigest(),native.returncode)
    style=subprocess.run(['python3','tools/art/painter/style_gate.py','--strict',str(result)],text=True,capture_output=True)
    assert style.returncode in (0,1) and any(line.startswith(('PASS ','FAIL ')) for line in style.stdout.splitlines()),style.stderr
    (OUT/'style.log').write_text(style.stdout+style.stderr)
    scan_spec=importlib.util.spec_from_file_location('candidate_scan',ROOT/'tools/art/scan_sprites.py')
    scanner=importlib.util.module_from_spec(scan_spec);scan_spec.loader.exec_module(scanner)
    (OUT/'scan.json').write_text(json.dumps(scanner.analyze(str(result)),indent=2,default=lambda v:v.item())+'\n')
    summary.update(status=report['status'],failedFrames=failed,retainedFrames=31,styleGate='PASS' if style.returncode==0 else 'FIX',atlasSha256=hashlib.sha256(result.read_bytes()).hexdigest())
    comparison=[{'frame':r['frame'],'expected':r['before']['body'],'actual':r['after']['body'],'foot':r['after']['foot'],'relativeDeviation':abs(r['after']['body']-r['before']['body'])/r['before']['body']} for r in summary['bodyComparison']]
    summary['sourceBodyGate']={'coverage':'SOURCE_PIXEL_MASS_NOT_RUNTIME_NORMALIZATION','status':'PASS' if all(r['relativeDeviation']<=.04 and r['foot']==106 for r in comparison) else 'FIX','rows':comparison}

    refs_spec=importlib.util.spec_from_file_location('candidate_refs',ROOT/'tools/art/gen-referencias.py')
    refs=importlib.util.module_from_spec(refs_spec);refs_spec.loader.exec_module(refs)
    refs.render({'src':str(result),'fw':112,'fh':112,'cols':4,'anchor':106/112},[{'etiqueta':'Ataque frontal','cuadros':[12,13,14,15]},{'etiqueta':'Espalda caminar','cuadros':[8,9,10,11]},{'etiqueta':'Espalda ataque','cuadros':[20,21,22,23]}],escala=3,titulo='B004 clusters nativos; candidato',pie='Diagnostico: no es aprobacion de arte',max_por_linea=4).save(OUT/'contact.png')
assert git_sha((ROOT/spec['atlas']).read_bytes())==spec['atlasGitBlobSha']
# A36-pose template must not replace an existing specialized61-frame runtime pack.
# Named musket/bayonet/horse clips are real callers, not optional documentation.
runtime=(ROOT/'js/champions/libertador.js').read_text()
import re
required={name:sorted(set(re.findall(r'_smFrame\(\s*'+symbol+r'\s*,\s*"([^"]+)"',runtime))) for name,symbol in [('libertador','P'),('libertador_horse','HP')]}
template={'idle_down','idle_side','idle_up','walk_down','walk_side','walk_up','attack_down','attack_side','attack_up','cast_down','cast_side','cast_up','ultimate_down','ultimate_side','ultimate_up','hit_down','hit_side','hit_up','death_down','death_side','death_up'}
missing=sorted(set(required['libertador'])-template)
assert {'fire','reload','bayo_emb','ult_cast'}.issubset(missing),'Specialized runtime audit must detect weapon clips'
summary['runtimeContract']={'coverage':'STATIC_REAL_CALLERS_NOT_RUNTIME_APPROVAL','source':'js/champions/libertador.js','sourceGitBlobSha':git_sha((ROOT/'js/champions/libertador.js').read_bytes()),'requiredByCurrentRenderer':required,'missingFromGeneric36PoseFootPack':missing,'preserveMountedPack':True,'status':'REJECT_FULL_PACK_REPLACEMENT' if missing else 'DECLARED_CONTRACT_ONLY'}
summary['integrationStatus']='FIX_RUNTIME_CONTRACT' if missing else 'RUNTIME_AND_VISUAL_REVIEW_STILL_REQUIRED'
summary['visualReview']={'status':'PENDING_ASSEMBLED_PIXEL_COMPARISON','reviewer':'ChatGPT (AI); no owner approval claimed','reason':'New raw source restores musket/bayonet. Review actual assembled atlas against original identity after native/style tests; keep specialized61-frame and mounted runtime.'}
summary['integrationStatus']='FIX_RUNTIME_CONTRACT_AND_PENDING_VISUAL_REVIEW'
if (OUT/'atlas.png').exists():
    proposal=json.loads((ROOT/'tools/factory/fixtures/libertador-generic36-canary.json').read_text())
    proposal['atlas']=str(OUT/'atlas.png')
    (OUT/'contract-proposal.json').write_text(json.dumps(proposal))
    gate=subprocess.run(['node','tools/factory/check-animation-contract.js','--key','libertador','--candidate',str(OUT/'contract-proposal.json'),'--runtime','js/champions/libertador.js','--symbol','P','--output',str(OUT/'animation-contract.json')],text=True,capture_output=True)
    assert gate.returncode==1,gate.stdout+gate.stderr
    contract=json.loads((OUT/'animation-contract.json').read_text())
    assert contract['status']=='REJECT' and {'fire','reload','bayo_emb','ult_cast'}.issubset({issue.get('clip') for issue in contract['issues']})
    summary['factoryRuntimeContract']=contract

(OUT/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print('CANDIDATE_SUMMARY '+json.dumps(summary),flush=True)
