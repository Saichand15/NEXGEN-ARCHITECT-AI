import fitz
import numpy as np

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[2]
rot = page.rotation_matrix
drawings = page.get_drawings()

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

# Diagonal segments in the front-left region (x 200-600, y 850-1260)
print('Diagonals in front-left region:')
for x0, y0, x1, y1 in segs:
    dx, dy = x1 - x0, y1 - y0
    length = (dx*dx + dy*dy) ** 0.5
    if length < 5:
        continue
    ang = abs(np.degrees(np.arctan2(dy, dx)))
    if 10 < ang < 80:  # diagonal
        cx, cy = (x0+x1)/2, (y0+y1)/2
        if 180 < cx < 650 and 850 < cy < 1280:
            print(f'  ({x0:7.1f},{y0:7.1f}) -> ({x1:7.1f},{y1:7.1f}) ang {ang:5.1f} len {length:6.1f}')

# Also: what are the leftmost vertical wall segments and their y-extent near the front?
print('\nVertical wall segments with x < 320, y > 800:')
for x0, y0, x1, y1 in segs:
    if abs(x1 - x0) < 0.5:
        x = (x0+x1)/2
        ya, yb = min(y0,y1), max(y0,y1)
        if x < 320 and yb > 800 and (yb-ya) > 20:
            print(f'  x={x:7.1f}  y {ya:7.1f}..{yb:7.1f}  len {yb-ya:6.1f}')

# Horizontal wall segments near the front (y > 1150), their x-extent
print('\nHorizontal segments with y > 1150:')
for x0, y0, x1, y1 in segs:
    if abs(y1 - y0) < 0.5:
        y = (y0+y1)/2
        xa, xb = min(x0,x1), max(x0,x1)
        if y > 1150 and (xb-xa) > 20:
            print(f'  y={y:7.1f}  x {xa:7.1f}..{xb:7.1f}  len {xb-xa:6.1f}')
