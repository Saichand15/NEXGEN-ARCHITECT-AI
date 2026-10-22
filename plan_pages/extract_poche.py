import fitz, json
from PIL import Image, ImageDraw

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
# Tight crop: left floor-plan drawing only (from poche render, plan spans ~x 100-860, y 150-1100)
PLAN = (95, 145, 880, 1120)

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
                corners = [fitz.Point(r.x0, r.y0) * rot, fitz.Point(r.x1, r.y0) * rot,
                           fitz.Point(r.x1, r.y1) * rot, fitz.Point(r.x0, r.y1) * rot]
                pts = [(p.x, p.y) for p in corners]
        if len(pts) < 3:
            continue
        cx = sum(p[0] for p in pts) / len(pts)
        cy = sum(p[1] for p in pts) / len(pts)
        # require the WHOLE polygon inside the crop, not just centroid
        px0 = min(p[0] for p in pts); px1 = max(p[0] for p in pts)
        py0 = min(p[1] for p in pts); py1 = max(p[1] for p in pts)
        if (PLAN[0] <= cx <= PLAN[2] and PLAN[1] <= cy <= PLAN[3]
                and px0 >= PLAN[0] - 5 and px1 <= PLAN[2] + 5
                and py0 >= PLAN[1] - 5 and py1 <= PLAN[3] + 5):
            polys.append(pts)

    xs = [p[0] for poly in polys for p in poly]
    ys = [p[1] for poly in polys for p in poly]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    print(f'{tag}: {len(polys)} wall polygons, x {minx:.1f}..{maxx:.1f} ({maxx-minx:.1f}), y {miny:.1f}..{maxy:.1f} ({maxy-miny:.1f})')

    scale = 3.0
    img = Image.new('RGB', (int((maxx - minx) * scale) + 40, int((maxy - miny) * scale) + 40), 'white')
    dr = ImageDraw.Draw(img)
    for poly in polys:
        dr.polygon([((x - minx) * scale + 20, (y - miny) * scale + 20) for x, y in poly], fill='black')
    img.save(rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\poche_{tag}.png')

    with open(rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\poche_{tag}.json', 'w') as f:
        json.dump({'bounds': [minx, miny, maxx, maxy], 'polys': polys}, f)
    print('saved poche_' + tag)
