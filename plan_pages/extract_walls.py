import fitz
from PIL import Image, ImageDraw

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')

for pno, tag in [(2, 'floor1'), (3, 'floor2')]:
    page = doc[pno]
    drawings = page.get_drawings()

    # Collect wall candidate geometry: thick strokes (>=1.0) and black fills
    segs = []
    for d in drawings:
        w = d.get('width') or 0
        is_thick = w >= 1.0
        is_fill = d.get('fill') is not None
        if not (is_thick or is_fill):
            continue
        for item in d['items']:
            if item[0] == 'l':
                segs.append((item[1].x, item[1].y, item[2].x, item[2].y))
            elif item[0] == 're':
                r = item[1]
                segs.append((r.x0, r.y0, r.x1, r.y0))
                segs.append((r.x1, r.y0, r.x1, r.y1))
                segs.append((r.x1, r.y1, r.x0, r.y1))
                segs.append((r.x0, r.y1, r.x0, r.y0))

    xs = [s[0] for s in segs] + [s[2] for s in segs]
    ys = [s[1] for s in segs] + [s[3] for s in segs]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    print(f'{tag}: {len(segs)} wall segs, x {minx:.0f}..{maxx:.0f}, y {miny:.0f}..{maxy:.0f}')

    # Render to image
    scale = 2.0
    img = Image.new('RGB', (int((maxx - minx) * scale) + 40, int((maxy - miny) * scale) + 40), 'white')
    dr = ImageDraw.Draw(img)
    for x0, y0, x1, y1 in segs:
        dr.line(
            [(x0 - minx) * scale + 20, (y0 - miny) * scale + 20, (x1 - minx) * scale + 20, (y1 - miny) * scale + 20],
            fill='black', width=2)
    img.save(rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\walls_{tag}.png')
    print('saved walls_' + tag)
