import fitz
from collections import Counter

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[2]
print('rotation:', page.rotation, 'rect:', page.rect, 'mediabox:', page.mediabox)

drawings = page.get_drawings()
widths = Counter()
colors = Counter()
fills = Counter()
for d in drawings:
    w = d.get('width')
    widths[w if w is None else round(w, 2)] += 1
    colors[str(d.get('color'))] += 1
    fills[str(d.get('fill'))] += 1

print('stroke widths:', widths.most_common(12))
print('colors:', colors.most_common(8))
print('fills:', fills.most_common(8))

# Look at the thickest lines (likely walls) - get their bounding boxes
thick = [d for d in drawings if d.get('width', 0) >= 1.5]
print('thick paths:', len(thick))
