#!/usr/bin/env python3
"""Hoja de contacto: [base de sprites del Códice (frente/lado/espalda)] | [idle en juego]. Uso: contact-sheet.py INGAME_DIR OUT_DIR k1 k2 ..."""
import sys,os
from PIL import Image,ImageDraw
ing,out=sys.argv[1],sys.argv[2];ks=sys.argv[3:]
os.makedirs(out,exist_ok=True)
def codex_base(k):
    im=Image.open(f'assets/ui/codex/champions/{k}.png').convert('RGB');w,h=im.size
    return im.crop((int(w*.44),int(h*.30),w,int(h*.74)))     # panel derecho: BASE PARA SPRITES (aprox.)
rows=[]
for k in ks:
    c=codex_base(k);c=c.resize((int(c.width*300/c.height),300),Image.LANCZOS)
    g=Image.open(f'{ing}/{k}.png').convert('RGB');g=g.resize((300,300),Image.NEAREST)
    r=Image.new('RGB',(c.width+310,300),(20,20,20));r.paste(c,(0,0));r.paste(g,(c.width+10,0));ImageDraw.Draw(r).text((4,4),k,fill=(255,255,0));rows.append(r)
W=max(r.width for r in rows);sheet=Image.new('RGB',(W,sum(r.height+6 for r in rows)),(0,0,0));y=0
for r in rows:sheet.paste(r,(0,y));y+=r.height+6
sheet.save(f'{out}/sheet_{ks[0]}.png');print(sheet.size)
