import fitz

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[4]  # A-3 New Elevations
rot = page.rotation_matrix
print('page rect', page.rect, 'rotation', page.rotation)

words = page.get_text('words')
rwords = []
for w in words:
    x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
    p = fitz.Point((x0 + x1) / 2, (y0 + y1) / 2) * rot
    rwords.append((p.x, p.y, text))

# Find all dimension-like strings (contain ' or ") anywhere on the sheet
import re
dims = [(x, y, t) for x, y, t in rwords if re.search(r"[0-9]+['\"]", t)]
dims.sort(key=lambda v: (v[1], v[0]))
print(f'=== {len(dims)} dimension tokens ===')
for x, y, t in dims:
    print(f'  x{x:7.1f} y{y:7.1f}  {t}')
