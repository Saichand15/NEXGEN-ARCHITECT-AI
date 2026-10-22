import fitz, re

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
for pno in [2, 3]:
    page = doc[pno]
    print('=== PAGE', pno, '===')
    d = page.get_text('dict')
    items = []
    for block in d['blocks']:
        if 'lines' not in block:
            continue
        for line in block['lines']:
            for span in line['spans']:
                t = span['text'].strip()
                if re.search(r"[0-9]+'", t) or re.search(r'[0-9]+"', t):
                    x0, y0, x1, y1 = span['bbox']
                    items.append((round(x0), round(y0), t))
    items.sort(key=lambda v: (v[1], v[0]))
    for x, y, t in items:
        print(f'{x:5d} {y:5d}  {t}')
