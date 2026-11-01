#!/usr/bin/env python3
"""Hoja de pares [Códice frente | idle en juego] con la misma altura. Uso: pair-sheet.py PACKS_JSON OUT.png k1 k2 ..."""
import sys,os,json
sys.path.insert(0,os.path.dirname(__file__))
from PIL import Image,ImageDraw
from codex_figures import figures
from fidelity import bbox_crop
packs=json.load(open(sys.argv[1]));ks=sys.argv[3:];T=230;cells=[]
for k in ks:
    p=packs[k];ref=figures(f'assets/ui/codex/champions/{k}.png')[0]
    at=Image.open(p['src']).convert('RGBA');i=p['idle'][0];c,r=i%p['cols'],i//p['cols']
    g=bbox_crop(at.crop((c*p['fw'],r*p['fh'],(c+1)*p['fw'],(r+1)*p['fh'])))
    ref=bbox_crop(ref);im=Image.new('RGB',(2*T+30,T+18),(24,24,24))
    for j,x in enumerate((ref,g)):
        s=T/x.height;x=x.resize((max(1,int(x.width*s)),T),Image.NEAREST if j else Image.LANCZOS);im.paste(x,(10+j*(T+10)+(T-x.width)//2,16),x)
    ImageDraw.Draw(im).text((4,2),f'{k}  [Códice | juego idle0]',fill=(255,255,0));cells.append(im)
cols=3;w=cells[0].width;h=cells[0].height;rows=(len(cells)+cols-1)//cols
sh=Image.new('RGB',(cols*w,rows*h),(0,0,0))
for i,c in enumerate(cells):sh.paste(c,((i%cols)*w,(i//cols)*h))
sh.save(sys.argv[2]);print(sh.size)
