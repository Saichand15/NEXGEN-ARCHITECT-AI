import fitz
from PIL import Image, ImageDraw

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')

for pno, tag in [(2, 'floor1'), (3, 'floor2')]:
    page = doc[pno]
    rot = page.rotation_matrix
    drawings = page.get_drawings()

    segs = []
    for d in drawings:
        w = d.get('width') or 0
        if w < 1.0:
            continue
        for item in d['items']:
            if item[0] == 'l':
                p1, p2 = item[1] * rot, item[2] * rot
                segs.append((p1.x, p1.y, p2.x, p2.y))
            elif item[0] == 're':
                r = item[1]
                cs = [fitz.Point(r.x0, r.y0) * rot, fitz.Point(r.x1, r.y0) * rot,
                      fitz.Point(r.x1, r.y1) * rot, fitz.Point(r.x0, r.y1) * rot]
                for i in range(4):
                    j = (i + 1) % 4
                    segs.append((cs[i].x, cs[i].y, cs[j].x, cs[j].y))

    xs = [s[0] for s in segs] + [s[2] for s in segs]
    ys = [s[1] for s in segs] + [s[3] for s in segs]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    print(f'{tag}: {len(segs)} thick segs, x {minx:.0f}..{maxx:.0f}, y {miny:.0f}..{maxy:.0f}')

    scale = 1.2
    img = Image.new('RGB', (int((maxx - minx) * scale) + 40, int((maxy - miny) * scale) + 40), 'white')
    dr = ImageDraw.Draw(img)
    for x0, y0, x1, y1 in segs:
        dr.line([(x0 - minx) * scale + 20, (y0 - miny) * scale + 20,
                 (x1 - minx) * scale + 20, (y1 - miny) * scale + 20], fill='black', width=1)
    img.save(rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\thick_{tag}.png')
    print('saved thick_' + tag)
