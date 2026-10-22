import fitz
from collections import Counter

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[3]
rot = page.rotation_matrix
drawings = page.get_drawings()

# floor2 plan region guess (same sheet layout): x 230-1070, y 150-1160
PLAN = (230, 150, 1070, 1160)
widths = Counter()
nfills = 0
for d in drawings:
    # centroid
    xs, ys = [], []
    for item in d['items']:
        if item[0] == 'l':
            for p in item[1:]:
                q = p * rot
                xs.append(q.x); ys.append(q.y)
        elif item[0] == 're':
            r = item[1]
            for p in [fitz.Point(r.x0,r.y0), fitz.Point(r.x1,r.y1)]:
                q = p * rot
                xs.append(q.x); ys.append(q.y)
    if not xs:
        continue
    cx, cy = sum(xs)/len(xs), sum(ys)/len(ys)
    if PLAN[0] <= cx <= PLAN[2] and PLAN[1] <= cy <= PLAN[3]:
        w = d.get('width')
        widths[w if w is None else round(w,2)] += 1
        if d.get('fill') is not None:
            nfills += 1

print('floor2 plan-area stroke widths:', widths.most_common(10))
print('floor2 plan-area filled paths:', nfills)
