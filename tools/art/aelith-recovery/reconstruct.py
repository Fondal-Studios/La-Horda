#!/usr/bin/env python3
"""Recover existing pixels; no generation, provider calls, or automatic approval."""
from pathlib import Path
import hashlib,json,re,io
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'art-source/aelith-recovery-20261102'
EXPECTED='b76f27906a1dacff0014848b630711fbb0022c4df476f284be6c94afb48bf5eb'
TASKS=[('preparation','1376af51-77c2-4b5d-a1a4-e9ca1db47aca','51c65b3d9d890a396707d5398eb2e84f95cc8d2137a3c2536806cdec9b98da00'),('windup','ac533293-272c-4925-aa79-8504803747da','28efbcc667933f8756b27c6f5dd039a6ce1d13cf5887004d3dd85252930aca25'),('release','39672591-feca-4a82-a316-ca9eb6bcdf94','41e0c5e2a88a013fda2742622d502e604884c5ccdf2987d142c5fefc7c0bded2')]
BASELINE_PINS = {'source': '8bb5bb0c807bfc80253ec9e32cc711ddde10346b3c00e49c919d53b0806a67c6', 'registry': '10414603ce2dd8e296921d26e04010f7c67fa488e61c139f3a066f780508b501', 'reference': '2aa08dcb1414d2b8d4234a2eafbc910fb8a85c512800afbcfced4eabdf3bf738'}
class GateError(ValueError):pass
def require(condition,message):
 if not condition:raise GateError(message)
def sha(data):return hashlib.sha256(data).hexdigest()
def normalize(path):
 px=np.array(Image.open(path).convert('RGBA'));rgb=px[:,:,:3].astype(int)
 green=(rgb[:,:,1]-rgb[:,:,0]>35)&(rgb[:,:,1]-rgb[:,:,2]>35)&(rgb[:,:,1]>rgb[:,:,0]*1.5)&(rgb[:,:,1]>rgb[:,:,2]*1.5)
 require(green[0].all() and green[-1].all() and green[:,0].all() and green[:,-1].all(),'boundary/background failed')
 px[:,:,3]=np.where(green,0,255);px[green]=0;cut=Image.fromarray(px);bbox=cut.getbbox();require(bbox is not None,'empty image')
 crop=cut.crop(bbox);height=70;width=round(crop.width*height/crop.height);require(width<=106,'cell width unsafe')
 foot=np.where(np.array(crop)[:,:,3][int(crop.height*.88):]>0)[1];center=(int(foot.min())+int(foot.max()))/2
 x=round(56-center*width/crop.width);require(x>=3 and x+width<=109,'cell margin unsafe')
 cell=Image.new('RGBA',(112,112));cell.paste(crop.resize((width,height),Image.Resampling.NEAREST),(x,107-height))
 require(set(cell.getchannel('A').tobytes())=={0,255},'nonbinary alpha');return cell

def main():
 source=ROOT/'assets/sprites/champions/aelith/atlas.png';registry=ROOT/'js/champions/ascension/art.js';ref=ROOT/'assets/ui/codex/champions/aelith.png'
 for key,p in [('source',source),('registry',registry),('reference',ref)]:require(sha(p.read_bytes())==BASELINE_PINS[key],'baseline '+key+' changed; refuse refreshed pins')
 original=Image.open(source).convert('RGBA');require(original.size==(448,1008),'source dimensions changed')
 matches=re.findall(r'^champPackLoadAtlas\("aelith","([^"]+)",(\{.*\})\);$',registry.read_text(),re.M);require(len(matches)==1,'ambiguous Aelith registration')
 oldsource,metatext=matches[0];meta=json.loads(metatext);require(meta['sets']['cast_up']==[24,25,26,27],'original cast contract changed')
 cells=[];provenance=[]
 for name,task,expected in TASKS:
  p=OUT/'sources'/(task+'.png');require(sha(p.read_bytes())==expected,'provider source changed');cell=normalize(p);cell.save(OUT/(name+'.png'));cells.append(cell);provenance.append({'index':36+len(cells)-1,'phase':name,'taskId':task,'sourceSha256':expected})
 cells.append(original.crop((0,224,112,336)));cells[-1].save(OUT/'recovery-inherited8.png');provenance.append({'index':39,'phase':'recovery','inheritedOriginalCell':8,'newGeneration':False})
 candidate=Image.new('RGBA',(448,1120));candidate.paste(original,(0,0))
 for i,c in enumerate(cells):candidate.paste(c,(i*112,1008))
 require(candidate.crop((0,0,448,1008)).tobytes()==original.tobytes(),'original pixels changed')
 data=io.BytesIO();candidate.save(data,format='PNG',optimize=False,compress_level=9);payload=data.getvalue();actual=sha(payload);require(actual==EXPECTED,'historical candidate hash mismatch: '+actual)
 target='assets/sprites/champions/aelith/factory-'+actual+'/atlas.png';dest=ROOT/target;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(payload)
 literal='champPackLoadAtlas("aelith","'+oldsource+'",'+metatext+');';proposed=json.loads(metatext);proposed['sets']['cast_up']=[36,37,38,39]
 manifest={'schema':'fondal.aelith-recovery.v1','baselineCommit':'54aa936fa254112044e29493179893dd0f8694d6','source':{'path':str(source.relative_to(ROOT)),'sha256':sha(source.read_bytes())},'registry':{'path':str(registry.relative_to(ROOT)),'sha256':sha(registry.read_bytes())},'reference':{'path':str(ref.relative_to(ROOT)),'sha256':sha(ref.read_bytes())},'originalLiteral':literal,'originalMeta':meta,'candidate':{'path':target,'sha256':actual,'meta':proposed},'frames':provenance,'original36PixelExact':True,'historicalCreditsSpent':28,'newCreditsSpent':0,'newGenerationCalls':0,'status':'RECONSTRUCTED_NOT_APPROVED','knownVisualLimitation':'Modest head/cape style seam at original idle transition; prior native review accepted only scoped direction-fix candidate, not full hero quality pass.'}
 (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps({'candidateSha256':actual,'historicalExactMatch':True,'original36PixelExact':True}))
if __name__=='__main__':main()
