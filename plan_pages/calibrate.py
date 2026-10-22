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

# Vertical segments crossing the storefront band (y 1150..1220), x between 226 and 1060
xs = []
for x0, y0, x1, y1 in segs:
    if abs(x1 - x0) < 0.5:
        x = (x0+x1)/2
        ya, yb = min(y0,y1), max(y0,y1)
        # crosses the storefront line region
        if ya < 1217 and yb > 1150 and 226 <= x <= 1060 and (yb-ya) > 15:
            xs.append(round(x,1))
xs = sorted(set(xs))
print('storefront vertical mullion x-positions:')
print(xs)
print('gaps between consecutive:')
for i in range(1, len(xs)):
    print(f'  {xs[i-1]:7.1f} -> {xs[i]:7.1f} = {xs[i]-xs[i-1]:6.1f} units')

# Left-side horizontal tick marks (dimension ticks) near x 200-226, find y positions
ys = []
for x0, y0, x1, y1 in segs:
    if abs(y1 - y0) < 0.5:
        y = (y0+y1)/2
        xa, xb = min(x0,x1), max(x0,x1)
        if xb < 230 and xa > 180 and (xb-xa) > 5:
            ys.append(round(y,1))
ys = sorted(set(ys))
print('\nleft dimension tick y-positions:')
print(ys)
print('gaps:')
for i in range(1, len(ys)):
    print(f'  {ys[i-1]:7.1f} -> {ys[i]:7.1f} = {ys[i]-ys[i-1]:6.1f} units')
