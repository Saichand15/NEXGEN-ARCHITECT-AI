import fitz

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[0]
rot = page.rotation_matrix

d = page.get_text('dict')
targets = ["13'-11", "14'-11", "15'", "14'-9", "59'-11"]
found = []
for block in d['blocks']:
    if 'lines' not in block:
        continue
    for line in block['lines']:
        for span in line['spans']:
            t = span['text'].strip()
            if any(t.startswith(tg) for tg in targets) and line.get('dir') == (1.0, 0.0):
                x0, y0, x1, y1 = span['bbox']
                p0 = fitz.Point(x0, y0) * rot
                p1 = fitz.Point(x1, y1) * rot
                cx = (p0.x + p1.x) / 2
                cy = (p0.y + p1.y) / 2
                found.append((cx, cy, t))

found.sort(key=lambda v: v[1])
for cx, cy, t in found:
    print(f'x={cx:8.1f} y={cy:8.1f}  {t}')
