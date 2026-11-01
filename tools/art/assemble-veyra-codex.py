#!/usr/bin/env python3
"""Rebuild the reviewed Veyra Codex atlas from preserved whole-frame sources."""
from pathlib import Path
import argparse
from PIL import Image

CELL=(192,144); COLS=8
LONG={88,89,90,92,93,94,95,106,107,110,111}
NEW={104,105,108}

def frames(path):
    im=Image.open(path).convert('RGBA')
    return [im.crop(((i%COLS)*CELL[0],(i//COLS)*CELL[1],(i%COLS+1)*CELL[0],(i//COLS+1)*CELL[1])) for i in range(112)]

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--sources',type=Path,required=True); ap.add_argument('--output',type=Path,required=True); a=ap.parse_args()
    base=frames(a.sources/'closure04-candidate-atlas.png')
    long=frames(a.sources/'closure04-attempt01-candidate-atlas.png')
    new=frames(a.sources/'attempt02-candidate-atlas.png')
    out=Image.new('RGBA',(COLS*CELL[0],14*CELL[1]))
    for i in range(112):
        src=long[i] if i in LONG else new[i] if i in NEW else base[i]
        out.paste(src,((i%COLS)*CELL[0],(i//COLS)*CELL[1]))
    a.output.parent.mkdir(parents=True,exist_ok=True); out.save(a.output)

if __name__=='__main__': main()
