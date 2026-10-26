import urllib.request,hashlib,json,datetime,pathlib
root=pathlib.Path('/workspace/scratch/27dc1a293731/nahir-work')
base='https://fondalstudios.com/la-horda/jugar/'
def get(path):
    when=datetime.datetime.now(datetime.timezone.utc).isoformat()
    try:
        with urllib.request.urlopen(urllib.request.Request(base+path,headers={'User-Agent':'La-Horda-art-verification','Cache-Control':'no-cache'}),timeout=30) as r:
            data=r.read();return data,{'url':r.url,'status':r.status,'checkedAt':when,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'headers':{k:r.headers.get(k) for k in ['Content-Type','Last-Modified','ETag','Cache-Control']}}
    except Exception as e:return None,{'url':base+path,'checkedAt':when,'error':str(e)}
index,idx=get('');rows=[]
for path in ['js/champions/vfx-b/nahir.js','css/codex.css']:
    data,r=get(path);r['path']=path;r['expectedSha256']=hashlib.sha256((root/path).read_bytes()).hexdigest();r['exact']=r.get('sha256')==r['expectedSha256'];r['indexConsumes']=path.encode() in (index or b'');rows.append(r)
j={'canonical':base,'index':idx,'files':rows,'status':'VERIFIED_SELECTED_FILES' if all(x['exact'] and x['indexConsumes'] for x in rows) else 'NOT_CONFIRMED','scope':'Public GET with normal system TLS verification. Selected runtime/CSS bytes and index consumer only; no infrastructure, accounts or payments changed. Main integration is separate from canonical publication.'}
(root/'art-source/entregas/nahir-echo-20261026/post-cierre-01/PUBLICATION.json').write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n');print(json.dumps(j,ensure_ascii=False))
