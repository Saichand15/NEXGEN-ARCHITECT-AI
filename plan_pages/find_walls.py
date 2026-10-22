import fitz
import numpy as np

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[2]
rot = page.rotation_matrix
drawings = page.get_drawings()

# Collect ALL line segments (any width) in the plan region, rotated coords
segs = []
for d in drawings:
    for item in d['items']:
        if item[0] == 'l':
            p1, p2 = item[1] * rot, item[2] * rot
            segs.append((p1.x, p1.y, p2.x, p2.y))
        elif item[0] == 're':
            r = item[1]
            cs = [fitz.Point(r.x0, r.y0) * rot, fitz.Point(r.x1, r.y0) * rot,
                  fitz.Point(r.x1, r.y1) * rot, fitz.Point(r.x0, r.y1) * rot]
            for i in range(4):
                j = (i+1) % 4
                segs.append((cs[i].x, cs[i].y, cs[j].x, cs[j].y))

# Horizontal segments (dy~0) with their y — used for left-side 10ft tick spacing
horiz = {}
for x0, y0, x1, y1 in segs:
    if abs(y1 - y0) < 0.3 and abs(x1 - x0) > 3:
        y = round((y0 + y1) / 2, 1)
        horiz.setdefault(y, []).append((min(x0, x1), max(x0, x1)))

# Vertical segments with their x
vert = {}
for x0, y0, x1, y1 in segs:
    if abs(x1 - x0) < 0.3 and abs(y1 - y0) > 3:
        x = round((x0 + x1) / 2, 1)
        vert.setdefault(x, []).append((min(y0, y1), max(y0, y1)))

# Find long horizontal wall lines (spanning large x) — exterior front/rear walls
print('Long horizontal lines (>300 units):')
for y, spans in sorted(horiz.items()):
    total = sum(b - a for a, b in spans)
    maxspan = max(b - a for a, b in spans)
    if maxspan > 300:
        print(f'  y={y}: maxspan {maxspan:.0f}, spans {sorted(spans)[:6]}')

print('Long vertical lines (>300 units):')
for x, spans in sorted(vert.items()):
    maxspan = max(b - a for a, b in spans)
    if maxspan > 300:
        print(f'  x={x}: maxspan {maxspan:.0f}, spans {sorted(spans)[:6]}')
