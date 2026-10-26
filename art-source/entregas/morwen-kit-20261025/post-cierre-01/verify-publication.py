import urllib.request,urllib.parse,json,hashlib,datetime,re,pathlib,sys
D=pathlib.Path(__file__).resolve().parent;R=D.parents[3];root='https://fondalstudios.com/la-horda/jugar/'
result={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'mergeCommit':sys.argv[1] if len(sys.argv)>1 else None,'canonical':root,'files':[],'noInfrastructureChanges':True}
try:
 with urllib.request.urlopen(root,timeout=45) as r: index=r.read();result['indexStatus']=r.status
 refs=re.findall(r'<script[^>]+src=[\"\x27]([^\"\x27]+)',index.decode('utf-8','replace'));matches=[s for s in refs if 'js/skills/champion-signatures.js' in s];result['consumerRefs']=matches
 expected=hashlib.sha256((R/'js/skills/champion-signatures.js').read_bytes()).hexdigest()
 for ref in matches:
  u=urllib.parse.urljoin(root,ref)
  with urllib.request.urlopen(u,timeout=45) as r:b=r.read();status=r.status
  actual=hashlib.sha256(b).hexdigest();result['files'].append({'url':u,'status':status,'sha256':actual,'expectedSha256':expected,'equal':actual==expected,'bytes':len(b),'containsMorwenNativeConsumer':b'drawMorwenNormalSignature' in b,'matchesKnownOlderSignature':actual=='2bbe76162cac478de248ebbbfa7ff98e8cda17b672ef1bd9d83f2be46098a3ad'})
 result['state']='VERIFIED' if matches and all(f['equal'] for f in result['files']) else 'NOT_CONFIRMED'
except Exception as e:result.update(state='NOT_CONFIRMED',error=str(e))
(D/'PUBLICATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result))
