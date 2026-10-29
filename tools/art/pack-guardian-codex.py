"""Pack authored Codex sprites; originals immutable, no procedural replacement art."""
from pathlib import Path
import json,hashlib,re
import numpy as np
from scipy import ndimage
from PIL import Image
R=Path(__file__).resolve().parents[2];O=R/'art-source/entregas/guardianes-codex-20261029/produccion-01'
js=R/'js/assets/champion-sprites.js';text=js.read_text()
for key,ref in [('musashi',184),('cazadora',170),('nigromante',140)]:
 a=np.array(Image.open(O/f'{key}-source.png').convert('RGBA'));lab,n=ndimage.label(a[:,:,3]>127,np.ones((3,3)));sz=np.bincount(lab.ravel());parts=[]
 for i,sl in enumerate(ndimage.find_objects(lab),1):
  if sz[i]>5000: parts.append((i,sl))
 assert len(parts)==32,(key,len(parts));parts.sort(key=lambda x:x[1][0].stop)
 ordered=[]
 for row in range(8):ordered+=sorted(parts[row*4:row*4+4],key=lambda x:x[1][1].start)
 atlas=Image.new('RGBA',(192*4,160*13));rec=[]
 for idx,(label,sl) in enumerate(ordered):
  y,x=sl;labels=[label]
  if key=='nigromante' and idx==28:
   # Detached staff belongs to recoil pose, retain original source pixels.
   labels.append(99);y=slice(1073,y.stop);x=slice(x.start,399);sl=(y,x)
  cut=a[sl].copy();mask=np.isin(lab[sl],labels);cut[:,:,3]=np.where(mask,255,0);cut[~mask]=0
  im=Image.fromarray(cut);im=im.resize((round(im.width*84/ref),round(im.height*84/ref)),Image.Resampling.NEAREST)
  # Foot anchor from body pixels; attack weapon pixels do not move the body horizontally.
  al=np.array(im)[:,:,3];footx=float(np.median(np.where(al[-5:]>0)[1]))+.5
  if idx>=29:footx=im.width/2
  dx=round(96-footx);dy=116-im.height
  if key=='cazadora' and 16<=idx<=19:dy+=round((y.stop-[871,871,872,875][idx-16])*84/ref)
  if dx<2 or dx+im.width>190:dx=(192-im.width)//2
  assert min(dx,dy,192-dx-im.width,160-dy-im.height)>=2,(key,idx)
  atlas.paste(im,((idx%4)*192+dx,(idx//4)*160+dy))
  rec.append({'index':idx,'sourceRect':[x.start,y.start,x.stop,y.stop],'component':label,'scale':84/ref,'bbox':[dx,dy,dx+im.width,dy+im.height]})
 if key=='nigromante':
  rear=np.array(Image.open(O/'nigromante-rear-source04.png').convert('RGBA'));rl,rn=ndimage.label(rear[:,:,3]>127,np.ones((3,3)));rs=np.bincount(rl.ravel());rp=[(i,sl) for i,sl in enumerate(ndimage.find_objects(rl),1) if rs[i]>5000];assert len(rp)==8;rp.sort(key=lambda x:x[1][0].stop);rp=sorted(rp[:4],key=lambda x:x[1][1].start)+sorted(rp[4:],key=lambda x:x[1][1].start)
  for idx,(label,sl) in zip([8,9,10,11,20,21,22,23],rp):
   y,x=sl;cut=rear[sl].copy();mask=rl[sl]==label;cut[:,:,3]=np.where(mask,255,0);cut[~mask]=0;im=Image.fromarray(cut);im=im.resize((round(im.width*84/380),round(im.height*84/380)),Image.Resampling.NEAREST);al=np.array(im)[:,:,3];footx=float(np.median(np.where(al[-5:]>0)[1]))+.5;dx=round(96-footx);dy=116-im.height;assert min(dx,dy,192-dx-im.width,160-dy-im.height)>=2;atlas.paste((0,0,0,0),((idx%4)*192,(idx//4)*160,(idx%4+1)*192,(idx//4+1)*160));atlas.paste(im,((idx%4)*192+dx,(idx//4)*160+dy));rec[idx]={'index':idx,'source':'nigromante-rear-source04.png','sourceRect':[x.start,y.start,x.stop,y.stop],'component':label,'scale':84/380,'bbox':[dx,dy,dx+im.width,dy+im.height]}
 sets={}
 for d,start,atk in [('down',0,16),('side',4,12),('up',8,20)]:
  sets['idle_'+d]=[start];sets['walk_'+d]=list(range(start,start+4));sets['attack_'+d]=list(range(atk,atk+4));sets['hit_'+d]=[28];sets['death_'+d]=[29,30,31]
 sets['cast_side']=[24,25,26,27];sets['run']=[4,5,6,7]
 if key=='cazadora':sets['aim']=[14]
 if key=='nigromante':
  # Keep the already-authored transformation frames exactly; no new UF art claimed.
  old=Image.open(R/'assets/sprites/champions/nigromante/v2/atlas.png').convert('RGBA')
  for j,v in enumerate([22,23,24,25]):atlas.paste(old.crop(((v%8)*161,(v//8)*114,(v%8+1)*161,(v//8+1)*114)),(j*192+15,8*160+9))
  sets['ult']=[32,33,34,35];sets['attack_down']=[16,17,19]
 extra=np.array(Image.open(O/f'{key}-extra-source.png').convert('RGBA'));el,en=ndimage.label(extra[:,:,3]>127,np.ones((3,3)));es=np.bincount(el.ravel());ep=[(i,sl)for i,sl in enumerate(ndimage.find_objects(el),1)if es[i]>5000];assert len(ep)==16;ep.sort(key=lambda x:x[1][0].stop);ep=sum([sorted(ep[r:r+4],key=lambda x:x[1][1].start)for r in range(0,16,4)],[]);eref={'musashi':274,'cazadora':285,'nigromante':248}[key]
 for j,(label,sl)in enumerate(ep):
  idx=36+j;y,x=sl;cut=extra[sl].copy();mask=el[sl]==label;cut[:,:,3]=np.where(mask,255,0);cut[~mask]=0;im=Image.fromarray(cut);im=im.resize((round(im.width*84/eref),round(im.height*84/eref)),Image.Resampling.NEAREST);al=np.array(im)[:,:,3];footx=im.width/2 if 8<=j<=13 else float(np.median(np.where(al[-5:]>0)[1]))+.5;dx=round(96-footx);dy=116-im.height;assert min(dx,dy,192-dx-im.width,160-dy-im.height)>=2;atlas.paste(im,((idx%4)*192+dx,(idx//4)*160+dy));rec.append({'index':idx,'source':f'{key}-extra-source.png','sourceRect':[x.start,y.start,x.stop,y.stop],'component':label,'scale':84/eref,'bbox':[dx,dy,dx+im.width,dy+im.height]})
 sets['idle_down']=[36,37,38,39];sets['idle_left']=[~4];sets['walk_left']=[~4,~5,~6,~7]
 for d in ['down','side','up']:sets['hit_'+d]=[40,41,42,43];sets['death_'+d]=[44,45,46,47,48,49]
 if key=='nigromante':sets['walk_down']=[0,50,1,2,3];sets['walk_up_left']=[~8,~9,~10,~11]
 meta={'w':192,'h':160,'cols':4,'refH':84,'anchor':114/160,'fix':{'left':'mirror'},'sets':sets}
 target=R/f'assets/sprites/champions/{key}/codex-v1';target.mkdir(parents=True,exist_ok=True);atlas.save(target/'atlas.png');atlas.crop((0,1440,192,1600)).save(target/'preview.png')
 (O/f'{key}-meta.json').write_text(json.dumps(meta,indent=2)+'\n');(O/f'{key}-frames.json').write_text(json.dumps(rec,indent=2)+'\n')
 line='champPackLoadAtlas('+json.dumps(key)+', '+json.dumps(str((target/'atlas.png').relative_to(R)))+', '+json.dumps(meta,separators=(',',':'))+');'
 text=re.sub(r'^champPackLoadAtlas\("'+key+r'",.*$',lambda m:line,text,flags=re.M)
 print(key,len(rec),atlas.size)
js.write_text(text)
