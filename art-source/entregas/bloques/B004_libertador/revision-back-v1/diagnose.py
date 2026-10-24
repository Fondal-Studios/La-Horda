"""B004 source-only diagnostic. Never installs assets or claims approval."""
import base64,hashlib,importlib.util,json,subprocess
from pathlib import Path
import numpy as np
from PIL import Image

ROOT=Path.cwd()
FOLDER=ROOT/'art-source/entregas/bloques/B004_libertador/revision-back-v1'
OUT=Path('/tmp/libertador-back-v1');OUT.mkdir(parents=True,exist_ok=True)
spec=json.loads((FOLDER/'source.json').read_text())
def git_sha(data):
    return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
for path,key in [(spec['atlas'],'atlasGitBlobSha'),(spec['replacement'],'replacementGitBlobSha')]:
    assert git_sha((ROOT/path).read_bytes())==spec[key], 'Source changed'
summary={'schema':1,'status':'UNTESTED','approvalClaimed':False,'installed':False,'commit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'frames':spec['frames'],'assemblies':[]}
image=Image.open(ROOT/spec['replacement'])
assert image.mode=='RGBA','Source must be RGBA'
xs=[round(i*image.width/4) for i in range(5)];ys=[round(i*image.height/2) for i in range(3)]
summary['sourceDimensions']=[image.width,image.height];summary['sourceCells']=[]
current=ROOT/spec['atlas']
for index,frame in enumerate(spec['frames']):
    raw=OUT/f'pose-{frame}.png'
    col,row=index%4,index//4
    rect=tuple(spec.get('cellRects',[])[index]) if spec.get('cellRects') else (xs[col],ys[row],xs[col+1],ys[row+1])
    assert 0<=rect[0]<rect[2]<=image.width and 0<=rect[1]<rect[3]<=image.height,'Invalid source bounds'
    summary['sourceCells'].append({'frame':frame,'rect':rect})
    image.crop(rect).save(raw)
    manifest={'atlas':str(current),'atlasSha256':hashlib.sha256(current.read_bytes()).hexdigest(),'replacement':str(raw),'replacementSha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'frame':frame}
    config=OUT/f'assembly-{frame}.json';config.write_text(json.dumps(manifest))
    target=OUT/f'assembled-{frame}.png'
    process=subprocess.run(['python3','tools/factory/replace-authored-frame.py',str(config),str(target)],text=True,capture_output=True)
    if process.returncode:
        summary.update(status='REJECTED_ASSEMBLY',failedFrame=frame,error=process.stderr[-2500:]);break
    summary['assemblies'].append(json.loads(target.with_suffix('.json').read_text()))
    current=target
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
    summary.update(status=report['status'],failedFrames=failed,retainedFrames=28,styleGate='PASS' if style.returncode==0 else 'FIX',atlasSha256=hashlib.sha256(result.read_bytes()).hexdigest())
    refs_spec=importlib.util.spec_from_file_location('candidate_refs',ROOT/'tools/art/gen-referencias.py')
    refs=importlib.util.module_from_spec(refs_spec);refs_spec.loader.exec_module(refs)
    refs.render({'src':str(result),'fw':112,'fh':112,'cols':4,'anchor':106/112},[{'etiqueta':'Espalda caminar','cuadros':[8,9,10,11]},{'etiqueta':'Espalda ataque','cuadros':[20,21,22,23]}],escala=3,titulo='B004 correccion de espalda; candidato',pie='Diagnostico: no es aprobacion de arte',max_por_linea=4).save(OUT/'contact.png')
assert git_sha((ROOT/spec['atlas']).read_bytes())==spec['atlasGitBlobSha']
(OUT/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print('CANDIDATE_SUMMARY '+json.dumps(summary),flush=True)
for name in ['summary.json','atlas.png','native.json','style.log','scan.json','contact.png']:
    path=OUT/name
    if not path.exists():continue
    data=path.read_bytes();encoded=base64.b64encode(data).decode()
    chunks=[encoded[n:n+4096] for n in range(0,len(encoded),4096)]
    print('ASSET_EXPORT '+json.dumps({'file':name,'gitBlobSha':git_sha(data),'sha256':hashlib.sha256(data).hexdigest(),'chunks':len(chunks)}),flush=True)
    for index,chunk in enumerate(chunks):print('ASSET_CHUNK '+json.dumps({'file':name,'index':index,'data':chunk}),flush=True)
