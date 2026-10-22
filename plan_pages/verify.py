import fitz
from PIL import Image, ImageDraw

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[2]
rot = page.rotation_matrix

# Render the actual page region as background (ground truth orientation)
clip = fitz.Rect(150, 100, 1650, 1350)  # rotated display coords
pix = page.get_pixmap(dpi=72, clip=clip)  # 1:1 with points
pix.save(r'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\verify_bg.png')

# Now overlay wall lines (drawings, transformed) on top
img = Image.open(r'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\verify_bg.png').convert('RGB')
dr = ImageDraw.Draw(img)
ox, oy = 150, 100

drawings = page.get_drawings()
n = 0
for d in drawings:
    w = d.get('width') or 0
    if w < 1.0:
        continue
    for item in d['items']:
        if item[0] == 'l':
            p1, p2 = item[1] * rot, item[2] * rot
            dr.line([(p1.x - ox, p1.y - oy), (p2.x - ox, p2.y - oy)], fill=(255, 0, 0), width=1)
            n += 1

# Overlay text labels (NOT transformed - get_text is already in display space)
for w in page.get_text('words'):
    x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
    if text.strip().upper() in ('RETAIL', 'FOYER', 'STAIRWAY', 'OFFICE', 'GARBAGE', 'LIVING'):
        dr.rectangle([x0 - ox, y0 - oy, x1 - ox, y1 - oy], outline=(0, 150, 0), width=1)

img.save(r'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\verify_overlay.png')
print('wall segs drawn:', n, 'image size:', img.size)
