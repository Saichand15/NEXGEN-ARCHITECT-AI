import fitz
from collections import Counter

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[2]
rot = page.rotation_matrix
drawings = page.get_drawings()

PLAN = (90, 140, 1300, 1760)
item_types = Counter()
fill_types = Counter()
for d in drawings:
    if d.get('fill') is None:
        continue
    for item in d['items']:
        # check center in plan
        pts = []
        if item[0] == 'l':
            pts = [item[1], item[2]]
        elif item[0] == 're':
            r = item[1]
            pts = [fitz.Point(r.x0, r.y0), fitz.Point(r.x1, r.y1)]
        elif item[0] == 'qu':
            q = item[1]
            pts = [q.ul, q.lr]
        elif item[0] == 'c':
            pts = [item[1], item[4]]
        if not pts:
            item_types[item[0] + '?'] += 1
            continue
        tpts = [p * rot for p in pts]
        cx = sum(p.x for p in tpts) / len(tpts)
        cy = sum(p.y for p in tpts) / len(tpts)
        if PLAN[0] <= cx <= PLAN[2] and PLAN[1] <= cy <= PLAN[3]:
            item_types[item[0]] += 1
            fill_types[str(d.get('fill'))] += 1

print('filled item types in plan:', item_types.most_common())
print('fill colors:', fill_types.most_common())
