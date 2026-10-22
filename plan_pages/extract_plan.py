import fitz
from PIL import Image, ImageDraw

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')

# Floor-plan-only region (left drawing on the sheet), rotated display coords
PLAN = (90, 140, 1300, 1760)

for pno, tag in [(2, 'floor1'), (3, 'floor2')]:
    page = doc[pno]
    rot = page.rotation_matrix  # unrotated -> rotated(display) space
    drawings = page.get_drawings()

    segs = []
    for d in drawings:
        w = d.get('width') or 0
        is_thick = w >= 1.0
        is_fill = d.get('fill') is not None
        if not (is_thick or is_fill):
            continue
        for item in d['items']:
            pts = []
            if item[0] == 'l':
                pts = [item[1], item[2]]
            elif item[0] == 're':
                r = item[1]
                pts = [fitz.Point(r.x0, r.y0), fitz.Point(r.x1, r.y0),
                       fitz.Point(r.x1, r.y1), fitz.Point(r.x0, r.y1)]
            else:
                continue
            tpts = [p * rot for p in pts]
            if item[0] == 'l':
                x0, y0, x1, y1 = tpts[0].x, tpts[0].y, tpts[1].x, tpts[1].y
                cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
                if PLAN[0] <= cx <= PLAN[2] and PLAN[1] <= cy <= PLAN[3]:
                    segs.append((x0, y0, x1, y1))
            else:
                xs = [p.x for p in tpts]
                ys = [p.y for p in tpts]
                cx, cy = sum(xs) / len(xs), sum(ys) / len(ys)
                if PLAN[0] <= cx <= PLAN[2] and PLAN[1] <= cy <= PLAN[3]:
                    segs.append((xs[0], ys[0], xs[1], ys[1]))
                    segs.append((xs[1], ys[1], xs[2], ys[2]))
                    segs.append((xs[2], ys[2], xs[3], ys[3]))
                    segs.append((xs[3], ys[3], xs[0], ys[0]))

    xs = [s[0] for s in segs] + [s[2] for s in segs]
    ys = [s[1] for s in segs] + [s[3] for s in segs]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    print(f'{tag}: {len(segs)} wall segs in plan area, x {minx:.0f}..{maxx:.0f}, y {miny:.0f}..{maxy:.0f}')

    scale = 2.2
    img = Image.new('RGB', (int((maxx - minx) * scale) + 40, int((maxy - miny) * scale) + 40), 'white')
    dr = ImageDraw.Draw(img)
    for x0, y0, x1, y1 in segs:
        dr.line([(x0 - minx) * scale + 20, (y0 - miny) * scale + 20,
                 (x1 - minx) * scale + 20, (y1 - miny) * scale + 20], fill='black', width=2)
    img.save(rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\planonly_{tag}.png')
    print('saved planonly_' + tag)
