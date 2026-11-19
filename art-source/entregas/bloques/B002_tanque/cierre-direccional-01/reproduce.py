#!/usr/bin/env python3
"""Rebuild Aldric's directional cast/death supplements from preserved sources."""
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
SOURCES = HERE / "sources"

def generated_rows(path, factor, cell_size, foot_y):
    source = Image.open(path).convert("RGBA")
    width, height = source.size
    frames = []
    for row in range(2):
        for col in range(4):
            cell = source.crop((col*width//4,row*height//2,(col+1)*width//4,(row+1)*height//2))
            alpha = cell.getchannel("A").point(lambda value: 255 if value >= 128 else 0)
            cell.putalpha(alpha)
            box = alpha.getbbox()
            if box is None: raise RuntimeError(f"empty generated cell {row}:{col} in {path}")
            cell = cell.crop(box)
            cell = cell.resize((max(1,round(cell.width*factor)),max(1,round(cell.height*factor))),Image.Resampling.NEAREST)
            if cell.width > cell_size or cell.height > foot_y: raise RuntimeError(f"cell {row}:{col} exceeds target: {cell.size}")
            frame = Image.new("RGBA",(cell_size,cell_size))
            frame.alpha_composite(cell,((cell_size-cell.width)//2,foot_y-cell.height))
            frames.append(frame)
    return frames

def approved_row(path, cell_size):
    source = Image.open(path).convert("RGBA")
    if source.size != (cell_size*4,cell_size): raise RuntimeError(f"unexpected approved geometry {source.size}")
    return [source.crop((i*cell_size,0,(i+1)*cell_size,cell_size)) for i in range(4)]

def approved_attack_rows(path):
    """Reuse Aldric's integrated native side/back attack rows as directional cast."""
    source = Image.open(path).convert("RGBA")
    if source.size != (448,1008): raise RuntimeError(f"unexpected approved body geometry {source.size}")
    frames = []
    for index in range(16,24):
        cell = source.crop(((index%4)*112,(index//4)*112,(index%4+1)*112,(index//4+1)*112))
        frame = Image.new("RGBA",(144,144))
        frame.alpha_composite(cell,(16,30))  # source foot 106 -> cast foot 136
        frames.append(frame)
    return frames

def write(frames, cell_size, target):
    if len(frames) != 12: raise RuntimeError(f"expected 12 frames, got {len(frames)}")
    atlas = Image.new("RGBA",(cell_size*4,cell_size*3))
    for i,frame in enumerate(frames): atlas.alpha_composite(frame,((i%4)*cell_size,(i//4)*cell_size))
    target.parent.mkdir(parents=True,exist_ok=True); atlas.save(target,optimize=False)

def main():
    cast = approved_row(SOURCES/"cast-down-approved.png",144)
    cast += approved_attack_rows(ROOT/"art-source/entregas/bloques/B002_tanque/campeones/tanque/hoja_36poses.png")
    write(cast,144,ROOT/"assets/sprites/champions/tanque/v3/cast.png")
    death = approved_row(SOURCES/"death-down-approved.png",112)
    death += generated_rows(SOURCES/"death-directional-imagegen.webp",0.23,112,107)
    write(death,112,ROOT/"assets/sprites/champions/tanque/v3/death.png")

if __name__ == "__main__": main()
