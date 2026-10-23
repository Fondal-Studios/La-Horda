#!/usr/bin/env python3
"""Deterministic DIAGNOSTIC packing only. No installation or pixel-art approval.
Preserves raw source. Bounding selection uses alpha >=128; emitted alpha is untouched.
Nearest sampling of generated source is NOT authored native pixel art.
"""
from pathlib import Path
import json, hashlib, importlib.util
import numpy as np
from PIL import Image, ImageDraw
P=Path(__file__).resolve().parent
ROOT=P.parents[3]
raw=Image.open(P/'sources/pose-sheet-raw.png').convert('RGBA')
a=np.array(raw)
xrows=[[0,212,418,620,836],[0,210,418,627,836],[0,214,418,620,836],[0,216,431,623,836],[0,210,440,641,836],[0,216,426,623,836],[0,216,418,621,836],[0,207,422,627,836],[0,206,413,611,836]]
yb=[0,219,415,610,804,992,1180,1388,1609,1881]
assert raw.size==(836,1881)
scale=64/166
atlas=Image.new('RGBA',(448,1008))
records=[]
for i in range(36):
 r,c=divmod(i,4); xb=xrows[r]; box=[xb[c],yb[r],xb[c+1],yb[r+1]]
 crop=raw.crop(box); ar=np.array(crop); yy,xx=np.where(ar[:,:,3]>=128)
 assert len(xx),i
 bbox=[max(0,int(xx.min())-3),max(0,int(yy.min())-3),min(crop.width,int(xx.max())+4),min(crop.height,int(yy.max())+4)]
 obj=crop.crop(bbox)
 size=(round(obj.width*scale),round(obj.height*scale))
 small=obj.resize(size,Image.Resampling.NEAREST)
 x=(112-small.width)//2; y=106-small.height
 assert x>=0 and y>=0 and x+small.width<=112,i
 frame=Image.new('RGBA',(112,112));frame.paste(small,(x,y))
 atlas.paste(frame,(c*112,r*112))
 fa=np.array(frame);mask=fa[:,:,3]>=128; fy,fx=np.where(mask)
 records.append(dict(frame=i,row=r,column=c,sourceCell=box,sourceCrop=bbox,sourceCropRGBAsha256=hashlib.sha256(crop.tobytes()).hexdigest(),rgbaSha256=hashlib.sha256(frame.tobytes()).hexdigest(),opaquePixels=int(mask.sum()),partialAlphaPixels=int(((fa[:,:,3]>0)&(fa[:,:,3]<255)).sum()),bbox128=[int(fx.min()),int(fy.min()),int(fx.max()+1),int(fy.max()+1)],sourceOpaqueTouchesCell=bool(np.any(xx==0)or np.any(xx==crop.width-1)or np.any(yy==0)or np.any(yy==crop.height-1))))
atlas.save(P/'atlas-diagnostic.png');atlas.crop((0,0,112,112)).save(P/'preview.png')
# Contact sheet is native pixels with labels/padding; no new art is drawn.
sheet=Image.new('RGBA',(4*124,9*134),(26,30,38,255));d=ImageDraw.Draw(sheet)
for rec in records:
 i=rec['frame'];r,c=divmod(i,4)
 sheet.alpha_composite(atlas.crop((c*112,r*112,c*112+112,r*112+112)),(c*124+6,r*134+16));d.text((c*124+6,r*134+2),str(i),fill='white')
sheet.save(P/'contact-36.png')
compare=Image.new('RGBA',(4*124,2*150),(26,30,38,255));d=ImageDraw.Draw(compare)
for c,(name,im) in enumerate([('BALTRA MAIN',Image.open(ROOT/'assets/sprites/champions/baltra/preview.png').convert('RGBA')),('BRONT MAIN',Image.open(ROOT/'assets/sprites/champions/bront/preview.png').convert('RGBA')),('BRONT 01',Image.open(P.parent/'primera-pasada-01/preview.png').convert('RGBA')),('BRONT 02',atlas.crop((0,0,112,112)))]):
 d.text((c*124+4,2),name,fill='white');compare.alpha_composite(im,(c*124+6,20))
 sil=Image.new('RGBA',im.size,'white');sil.putalpha(im.getchannel('A'));compare.alpha_composite(sil,(c*124+6,170))
compare.save(P/'comparison-native.png')
sp=importlib.util.spec_from_file_location('style_gate',ROOT/'tools/art/painter/style_gate.py');mod=importlib.util.module_from_spec(sp);sp.loader.exec_module(mod)
refs,rng=mod.reference();metrics=mod.sheet_metrics(P/'atlas-diagnostic.png');fails=mod.check(metrics,rng)
report=dict(status='EN_CORRECCION',artGate='FIX / NO_INTEGRAR',sourceSize=list(raw.size),sourceAlphaLevels=len(np.unique(a[:,:,3])),sourcePartialAlphaPixels=int(((a[:,:,3]>0)&(a[:,:,3]<255)).sum()),nonempty=sum(x['opaquePixels']>0 for x in records),uniqueRGBA=len({x['rgbaSha256']for x in records}),binaryAlphaPass=all(x['partialAlphaPixels']==0 for x in records),frames=records,styleGate=dict(tolerance=mod.TOL,metrics=metrics,referenceRange=rng,pass_=not fails,fails=fails),limitations=['36 nonempty != 36 approved poses','manual source row boundaries: generator did not obey equal grid','global scale and bottom alignment are diagnostic, not verified animation anchors','nearest reduced generated source is not native pixel-art certification','no renderer, skins, equipment or multiplayer validation'])
(P/'VERIFICATION.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['nonempty','uniqueRGBA','binaryAlphaPass','sourcePartialAlphaPixels','styleGate']},indent=2))
