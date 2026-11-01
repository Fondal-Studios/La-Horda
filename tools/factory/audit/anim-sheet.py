#!/usr/bin/env python3
"""Hoja visual de animaciones: por campeón una fila [Códice frente | walk_down | attack_down/side | cast | hit | death]. Uso: anim-sheet.py PACKS_FULL OUT.png k1 k2 ..."""
import sys,os,json
sys.path.insert(0,os.path.dirname(__file__))
from PIL import Image,ImageDraw
from codex_figures import figures
from fidelity import bbox_crop
packs=json.load(open(sys.argv[1]));ks=sys.argv[3:];C=96
def pick(sets,*names):
    for n in names:
        v=[i for i in sets.get(n,[]) if i>=0]
        if v: return v
    return []
rows=[]
for k in ks:
    p=packs[k];at=Image.open(p['src']).convert('RGBA');fw,fh,cols=p['fw'],p['fh'],p['cols'];s=p['sets']
    seq=[]
    for g,mx in ((pick(s,'walk_down','walk_side'),4),(pick(s,'attack_down','attack_side'),4),(pick(s,'cast_down','cast_side','ultimate_down'),3),(pick(s,'hit_down','hit_side'),1),(pick(s,'death_down','death_side'),4)):
        u=[];[u.append(i) for i in g if i not in u];seq+=u[:mx]+[None]*0;seq.append('|')
    ref=bbox_crop(figures(f'assets/ui/codex/champions/{k}.png')[0])
    W=C*(len([x for x in seq if x!='|'])+1)+12*seq.count('|')+10;row=Image.new('RGB',(W,C+14),(24,24,24));x=4
    sc=C/ref.height;r=ref.resize((max(1,int(ref.width*sc)),C),Image.LANCZOS);row.paste(r,(x+(C-r.width)//2,14),r);x+=C+6
    for i in seq:
        if i=='|': x+=12;continue
        c,rr=i%cols,i//cols;fr=at.crop((c*fw,rr*fh,(c+1)*fw,(rr+1)*fh));sc=C/fh;fr=fr.resize((int(fw*sc),C),Image.NEAREST);row.paste(fr,(x+(C-fr.width)//2,14),fr);x+=C
    ImageDraw.Draw(row).text((4,2),k+'  [Códice | walk | attack | cast | hit | death]',fill=(255,255,0));rows.append(row)
Wm=max(r.width for r in rows);sh=Image.new('RGB',(Wm,sum(r.height for r in rows)),(0,0,0));y=0
for r in rows:sh.paste(r,(0,y));y+=r.height
sh.save(sys.argv[2]);print(sh.size)
