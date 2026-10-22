import fitz, json
import numpy as np

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
REGION = (200, 130, 1120, 1260)

for pno, tag in [(2, 'floor1'), (3, 'floor2')]:
    page = doc[pno]
    rot = page.rotation_matrix
    drawings = page.get_drawings()
    polys = []
    for d in drawings:
        if d.get('fill') is None:
            continue
        pts = []
        for item in d['items']:
            if item[0] == 'l':
                p1, p2 = item[1] * rot, item[2] * rot
                if not pts:
                    pts.append((p1.x, p1.y))
                pts.append((p2.x, p2.y))
            elif item[0] == 're':
                r = item[1]
                cs = [fitz.Point(r.x0, r.y0) * rot, fitz.Point(r.x1, r.y0) * rot,
                      fitz.Point(r.x1, r.y1) * rot, fitz.Point(r.x0, r.y1) * rot]
                pts = [(p.x, p.y) for p in cs]
        if len(pts) < 3:
            continue
        cx = sum(p[0] for p in pts) / len(pts)
        cy = sum(p[1] for p in pts) / len(pts)
        if REGION[0] <= cx <= REGION[2] and REGION[1] <= cy <= REGION[3]:
            polys.append(pts)

    allpts = [p for poly in polys for p in poly]
    xs = np.array([p[0] for p in allpts])
    ys = np.array([p[1] for p in allpts])
    print(f'=== {tag}: {len(polys)} poche polys')
    print(f'  x: {xs.min():.1f} .. {xs.max():.1f}  (span {xs.max()-xs.min():.1f})')
    print(f'  y: {ys.min():.1f} .. {ys.max():.1f}  (span {ys.max()-ys.min():.1f})')

    # Histogram of x and y to find wall concentration lines (exterior walls = dense extremes)
    # Rear wall: rows with min y. Front wall: max y.
    for name, mask in [('rear(y min)', ys < ys.min() + 15),
                        ('front(y max)', ys > ys.max() - 15),
                        ('left(x min)', xs < xs.min() + 15),
                        ('right(x max)', xs > xs.max() - 15)]:
        sel = allpts and [(float(xs[i]), float(ys[i])) for i in range(len(xs)) if mask[i]]
        if sel:
            sx = [p[0] for p in sel]; sy = [p[1] for p in sel]
            print(f'  {name}: n={len(sel)} x {min(sx):.1f}..{max(sx):.1f} y {min(sy):.1f}..{max(sy):.1f}')

    with open(rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\poche2_{tag}.json', 'w') as f:
        json.dump({'polys': polys}, f)
