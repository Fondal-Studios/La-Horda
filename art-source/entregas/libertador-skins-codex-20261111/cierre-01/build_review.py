from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
GAME = ROOT / "gameplay"

def label(im, text, h=24):
    out = Image.new("RGB", (im.width, im.height + h), "#181b22")
    out.paste(im.convert("RGB"), (0, h))
    ImageDraw.Draw(out).text((7, 5), text, fill="white")
    return out

rows = []
for skin in ("libertador_escarcha", "libertador_ancestral"):
    for arena in ("bosque", "hielo"):
        for viewport in ("desktop", "mobile"):
            pair = []
            for variant in ("original", "candidate"):
                p = GAME / variant / f"{skin}-{arena}-{viewport}.png"
                pair.append(label(Image.open(p), f"{variant} | {skin} | {arena} | {viewport}"))
            height = max(i.height for i in pair)
            row = Image.new("RGB", (sum(i.width for i in pair), height), "#101217")
            x = 0
            for i in pair:
                row.paste(i, (x, 0)); x += i.width
            rows.append(row)
sheet = Image.new("RGB", (max(r.width for r in rows), sum(r.height for r in rows)), "#101217")
y = 0
for r in rows:
    sheet.paste(r, (0, y)); y += r.height
sheet.save(ROOT / "gameplay-before-after.jpg", quality=88)

paired_rows = []
for skin in ("libertador_escarcha", "libertador_ancestral"):
    for arena in ("bosque", "hielo"):
        for viewport in ("desktop", "mobile"):
            pair = []
            for variant in ("original", "candidate"):
                p = ROOT / "gameplay-paired" / f"{skin}-{arena}-{viewport}-{variant}.png"
                pair.append(label(Image.open(p), f"{variant} | {skin} | {arena} | {viewport}"))
            row = Image.new("RGB", (sum(i.width for i in pair), max(i.height for i in pair)), "#101217")
            x = 0
            for i in pair: row.paste(i, (x, 0)); x += i.width
            paired_rows.append(row)
paired = Image.new("RGB", (max(r.width for r in paired_rows), sum(r.height for r in paired_rows)), "#101217")
y = 0
for r in paired_rows: paired.paste(r, (0, y)); y += r.height
paired.save(ROOT / "gameplay-paired-before-after.jpg", quality=88)

roster = Image.open(ROOT / "unique-skins" / "roster.png")
crop = roster.crop((0, 4 * 140, roster.width, 6 * 140))
crop.save(ROOT / "libertador-renderer-rows.png")

atlas_rows = []
for skin in ("libertador_escarcha", "libertador_ancestral"):
    atlas = Image.open(ROOT.parents[3] / "assets" / "sprites" / "champions" / "libertador" / "skins" / skin / "atlas.png").convert("RGBA")
    fw, fh = atlas.width // 4, atlas.height // 9
    cells = []
    for n in range(36):
        c = atlas.crop(((n % 4) * fw, (n // 4) * fh, (n % 4 + 1) * fw, (n // 4 + 1) * fh))
        c.thumbnail((56, 126), Image.Resampling.NEAREST)
        cells.append(label(c, str(n), 18))
    row = Image.new("RGBA", (9 * 56, 4 * 144), (20, 22, 28, 255))
    for n, c in enumerate(cells): row.alpha_composite(c.convert("RGBA"), ((n % 9) * 56, (n // 9) * 144))
    atlas_rows.append(label(row, skin))
out = Image.new("RGBA", (max(r.width for r in atlas_rows), sum(r.height for r in atlas_rows)), (16, 18, 23, 255))
y = 0
for r in atlas_rows: out.alpha_composite(r.convert("RGBA"), (0, y)); y += r.height
out.convert("RGB").save(ROOT / "atlas-review.jpg", quality=92)
