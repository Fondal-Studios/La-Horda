#!/usr/bin/env python3
"""Deterministic pose-only schematic; not generated art, style, skin or weapon design."""
import hashlib
import json
from pathlib import Path
import sys
from PIL import Image, ImageDraw

WIDTH, HEIGHT = 600, 700
COLORS = {'background': '#F5F5F5', 'body': '#61666D', 'joint': '#353A40', 'left': '#2877BE', 'right': '#D46B20'}
FIXED = {
    'head_center': [300, 180], 'head_radius': 32,
    'shoulder_left': [260, 260], 'shoulder_right': [340, 260],
    'hip_left': [275, 350], 'hip_right': [325, 350],
    'elbow_left': [238, 305], 'hand_left': [244, 355],
    'elbow_right': [362, 305], 'hand_right': [356, 355],
}
# Screen sides, NOT the character's anatomical sides. Only legs change between phases.
PHASES = [
    {'meaning': 'screen-left boot forward contact; screen-right boot back',
     'left': {'knee': [265, 440], 'ankle': [250, 530], 'toe': [225, 540]},
     'right': {'knee': [337, 425], 'ankle': [352, 480], 'toe': [375, 490]}},
    {'meaning': 'screen-left leg supports; screen-right knee lifted',
     'left': {'knee': [270, 445], 'ankle': [270, 540], 'toe': [245, 550]},
     'right': {'knee': [375, 330], 'ankle': [355, 420], 'toe': [380, 435]}},
    {'meaning': 'screen-right boot forward contact; screen-left boot back',
     'left': {'knee': [263, 425], 'ankle': [248, 480], 'toe': [225, 490]},
     'right': {'knee': [335, 440], 'ankle': [350, 530], 'toe': [375, 540]}},
    {'meaning': 'screen-right leg supports; screen-left knee lifted',
     'left': {'knee': [225, 330], 'ankle': [245, 420], 'toe': [220, 435]},
     'right': {'knee': [330, 445], 'ankle': [330, 540], 'toe': [355, 550]}},
]


def make_guide(phase, out_png):
    if type(phase) is not int or not 0 <= phase <= 3:
        raise ValueError('phase must be an integer from 0 to 3')
    out_png = Path(out_png)
    if not out_png.suffix:
        out_png = out_png.with_suffix('.png')
    if out_png.suffix.lower() != '.png':
        raise ValueError('output must end in .png')
    out_png.parent.mkdir(parents=True, exist_ok=True)
    out_svg = out_png.with_suffix('.svg')
    im = Image.new('RGB', (WIDTH, HEIGHT), COLORS['background'])
    draw = ImageDraw.Draw(im)
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">',
           f'<rect width="{WIDTH}" height="{HEIGHT}" fill="{COLORS["background"]}"/>']
    bounds = []

    def circle(point, radius, color):
        x, y = point
        draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill=color)
        svg.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{color}"/>')
        bounds.append((x-radius, y-radius, x+radius, y+radius))

    def line(points, color, width=14):
        draw.line([tuple(p) for p in points], fill=color, width=width, joint='curve')
        svg.append(f'<polyline points="{" ".join(str(x)+","+str(y) for x,y in points)}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>')
        for point in points:
            circle(point, width//2, color)

    # The upper body is identical in every phase. No whole-character image flip is used.
    torso = [FIXED[k] for k in ['shoulder_left', 'shoulder_right', 'hip_right', 'hip_left']]
    draw.polygon([tuple(p) for p in torso], fill=COLORS['body'])
    svg.append(f'<polygon points="{" ".join(str(x)+","+str(y) for x,y in torso)}" fill="{COLORS["body"]}"/>')
    line([[300, 210], [300, 260]], COLORS['body'], 16)
    circle(FIXED['head_center'], FIXED['head_radius'], COLORS['body'])
    # Fixed face mark establishes front-facing orientation without copying an identity or target style.
    circle([289, 174], 3, COLORS['background'])
    circle([308, 174], 3, COLORS['background'])
    line([[301, 179], [307, 187], [299, 187]], COLORS['background'], 3)
    for side in ['left', 'right']:
        line([FIXED['shoulder_'+side], FIXED['elbow_'+side], FIXED['hand_'+side]], COLORS['body'], 12)
        circle(FIXED['hand_'+side], 9, COLORS['joint'])
    selected = PHASES[phase]
    for side in ['left', 'right']:
        leg = selected[side]
        points = [FIXED['hip_'+side], leg['knee'], leg['ankle']]
        line(points, COLORS[side], 15)
        line([leg['ankle'], leg['toe']], COLORS[side], 18)
        for joint in points:
            circle(joint, 10, COLORS['joint'])
            circle(joint, 5, COLORS[side])
    svg.append('</svg>')
    svg_bytes = ('\n'.join(svg)+'\n').encode('utf8')
    out_svg.write_bytes(svg_bytes)
    # No timestamps, randomized metadata, fonts, network, AI calls or stochastic processing.
    im.save(out_png, format='PNG', optimize=False, compress_level=9)
    bbox = [min(b[0] for b in bounds), min(b[1] for b in bounds), max(b[2] for b in bounds), max(b[3] for b in bounds)]
    if bbox[0] < WIDTH*.2 or bbox[1] < HEIGHT*.2 or bbox[2] > WIDTH*.8 or bbox[3] > HEIGHT*.8:
        raise ValueError('guide violated 20% subject margin')
    return {'schema': 'fondal.pose-guide.v1', 'phase': phase, 'semantic': selected['meaning'],
            'purpose': 'POSE GEOMETRY ONLY. Do not copy diagram style/colors or invent weapons. Identity, palette and weapon handedness come from the separate character reference. No whole-character mirror.',
            'width': WIDTH, 'height': HEIGHT, 'subjectBounds': bbox, 'minimumMarginFraction': .2,
            'screenSides': {'left': COLORS['left'], 'right': COLORS['right']}, 'fixedUpperBody': FIXED,
            'legs': {side: selected[side] for side in ['left', 'right']},
            'files': {'png': str(out_png), 'svg': str(out_svg)},
            'sha256': {'png': hashlib.sha256(out_png.read_bytes()).hexdigest(), 'svg': hashlib.sha256(svg_bytes).hexdigest()}}


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: pose-guide.py <phase0..3> <outPNG-or-prefix>')
    print(json.dumps(make_guide(int(sys.argv[1]), sys.argv[2]), sort_keys=True))
