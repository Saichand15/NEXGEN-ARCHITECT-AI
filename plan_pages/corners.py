import fitz
from PIL import Image, ImageDraw

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[2]
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
    if len(pts) >= 3:
        polys.append(pts)

def render(x0, y0, x1, y1, name, scale=5.0):
    W = int((x1 - x0) * scale)
    H = int((y1 - y0) * scale)
    img = Image.new('RGB', (W, H), 'white')
    dr = ImageDraw.Draw(img)
    step = 10
    for gx in range(int(x0) - int(x0) % step, int(x1) + 1, step):
        x = (gx - x0) * scale
        dr.line([(x, 0), (x, H)], fill=(230, 230, 230), width=1)
        dr.text((x + 1, 1), str(gx), fill=(200, 0, 0))
    for gy in range(int(y0) - int(y0) % step, int(y1) + 1, step):
        y = (gy - y0) * scale
        dr.line([(0, y), (W, y)], fill=(230, 230, 230), width=1)
        dr.text((1, y + 1), str(gy), fill=(200, 0, 0))
    for poly in polys:
        pts = [((px - x0) * scale, (py - y0) * scale) for px, py in poly]
        if any(0 <= p[0] <= W and 0 <= p[1] <= H for p in pts):
            dr.polygon(pts, fill=(0, 0, 0))
    img.save(rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\corner_{name}.png')
    print('saved', name)

# Four corners of the building (approx from grid): rear-left, rear-right, front-right, front-left(angle)
render(200, 150, 500, 400, 'rearleft')
render(950, 150, 1150, 400, 'rearright')
render(950, 1050, 1150, 1260, 'frontright')
render(200, 900, 550, 1260, 'frontleft')
