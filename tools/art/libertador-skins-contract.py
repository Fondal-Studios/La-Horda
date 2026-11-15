#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,re
from PIL import Image
ROOT=Path(__file__).resolve().parents[2];META=ROOT/'js/assets/unique-skins-meta.js';SKINS=('libertador_escarcha','libertador_ancestral')
REQUIRED={'idle_down','walk_down','run_down','attack_down','cast_down','ultimate_down','hit_down','death_down','idle_side','walk_side','run_side','attack_side','cast_side','ultimate_side','hit_side','death_side','idle_up','walk_up','run_up','attack_up','cast_up','ultimate_up','hit_up','death_up','run','aim','fire','reload','bayo_pre','bayo_emb','bayo_imp','bayo_rem','command','cabral','ult_cast'}
HORSE={'libertador_escarcha':'c50d580e54b1093c2f7af2c3695c4b0c6a6cc8b0bcd4aa19cbee3f7a19e1c71e','libertador_ancestral':'55ae981e3e1eaacd494162c4301d383f750b6efc0a01b2b22d687b9adf6e7894'}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
text=META.read_text();out={'status':'PASS_STATIC_CONTRACT','skins':{}}
for skin in SKINS:
 m=re.search(rf'^Object\.assign\(CROMA_SKINS\["{skin}"\],(\{{.*\}})\);$',text,re.M);assert m
 d=json.loads(m.group(1));pack=d['authoredPacks']['libertador'];meta=pack['meta'];sets=meta['sets'];assert meta['w']==112 and meta['h']==112 and meta['cols']==4;assert REQUIRED<=set(sets)
 idx=sorted({i for seq in sets.values() for i in seq});assert idx==list(range(36))
 p=ROOT/pack['src'];im=Image.open(p).convert('RGBA');assert im.size==(448,1008);a=list(im.getchannel('A').get_flattened_data());assert set(a)<={0,255}
 assert all(im.crop(((i%4)*112,(i//4)*112,(i%4+1)*112,(i//4+1)*112)).getbbox() for i in range(36))
 border=sum(im.getpixel((x,y))[3]>0 for x in range(im.width) for y in(0,im.height-1))+sum(im.getpixel((x,y))[3]>0 for y in range(im.height) for x in(0,im.width-1));assert border==0
 horse=ROOT/d['authoredPacks']['libertador_horse']['src'];assert sha(horse)==HORSE[skin]
 out['skins'][skin]={'atlas':str(p.relative_to(ROOT)),'atlasSha256':sha(p),'frames':36,'uniqueReferencedIndices':36,'sets':len(sets),'binaryAlpha':True,'borderOpaquePixels':0,'horse':str(horse.relative_to(ROOT)),'horseSha256':sha(horse)}
print(json.dumps(out,ensure_ascii=False,indent=2))
