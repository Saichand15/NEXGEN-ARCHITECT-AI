import fitz

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[0]  # T-1 sheet
rot = page.rotation_matrix

d = page.get_text('dict')
targets = ["59'-11", "64'-7", "69'-3", "11'-0", "12'-6"]

for block in d['blocks']:
    if 'lines' not in block:
        continue
    for line in block['lines']:
        for span in line['spans']:
            t = span['text'].strip()
            if any(t.startswith(tg) for tg in targets):
                x0, y0, x1, y1 = span['bbox']
                p0 = fitz.Point(x0, y0) * rot
                p1 = fitz.Point(x1, y1) * rot
                # direction vector of the span's writing (dir field in line, not span)
                dirv = line.get('dir')
                print(f'{t!r:16s} rotated-bbox ({p0.x:7.1f},{p0.y:7.1f})-({p1.x:7.1f},{p1.y:7.1f})  line_dir={dirv}')
