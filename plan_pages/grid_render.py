import fitz
from PIL import Image, ImageDraw

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')

# Work in rotated display coords. Extract poche fills + thick lines for floor1, full sheet.
pno = 2
page = doc[pno]
rot = page.rotation_matrix
drawings = page.get_drawings()

polys = []
lines = []
for d in drawings:
    fill = d.get('fill')
    w = d.get('width') or 0
    for item in d['items']:
        if item[0] == 'l':
            p1, p2 = item[1] * rot, item[2] * rot
            if fill is not None:
                polys.append([(p1.x, p1.y), (p2.x, p2.y)])
            if w >= 0.5:
                lines.append((p1.x, p1.y, p2.x, p2.y))
        elif item[0] == 're':
            r = item[1]
            cs = [fitz.Point(r.x0, r.y0) * rot, fitz.Point(r.x1, r.y0) * rot,
                  fitz.Point(r.x1, r.y1) * rot, fitz.Point(r.x0, r.y1) * rot]
            if fill is not None:
                polys.append([(p.x, p.y) for p in cs])
            if w >= 0.5:
                for i in range(4):
                    j = (i+1) % 4
                    lines.append((cs[i].x, cs[i].y, cs[j].x, cs[j].y))

# Focus on floor plan region
X0, Y0, X1, Y1 = 200, 130, 1120, 1260
scale = 2.0
W = int((X1 - X0) * scale)
H = int((Y1 - Y0) * scale)
img = Image.new('RGB', (W, H), 'white')
dr = ImageDraw.Draw(img)

# grid every 50 PDF units
for gx in range(int(X0) - int(X0) % 50, int(X1), 50):
    x = (gx - X0) * scale
    dr.line([(x, 0), (x, H)], fill=(220, 220, 220), width=1)
    dr.text((x + 2, 2), str(gx), fill=(180, 0, 0))
for gy in range(int(Y0) - int(Y0) % 50, int(Y1), 50):
    y = (gy - Y0) * scale
    dr.line([(0, y), (W, y)], fill=(220, 220, 220), width=1)
    dr.text((2, y + 2), str(gy), fill=(180, 0, 0))

for poly in polys:
    pts = [((x - X0) * scale, (y - Y0) * scale) for x, y in poly]
    if all(0 <= p[0] <= W and 0 <= p[1] <= H for p in pts):
        dr.polygon(pts, fill=(0, 0, 0))
for x0, y0, x1, y1 in lines:
    dr.line([(x0 - X0) * scale, (y0 - Y0) * scale, (x1 - X0) * scale, (y1 - Y0) * scale], fill=(0, 0, 200), width=1)

img.save(r'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\grid_floor1.png')
print('saved grid_floor1', W, H)
