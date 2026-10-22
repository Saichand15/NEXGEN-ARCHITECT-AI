import fitz

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[2]
d = page.get_text('dict')
anchors = ['STORE', 'RETAIL', 'FOYER', 'STAIRWAY', 'GARBAGE', 'OFFICE', 'STORAGE', 'BACK', 'UTILITY', 'ALL GENDER', 'FURNACE', 'SPRINKLER', 'WAITING', 'RECEPTION', 'GEN']
for block in d['blocks']:
    if 'lines' not in block:
        continue
    for line in block['lines']:
        for span in line['spans']:
            t = span['text'].strip().upper()
            if any(a in t for a in anchors) and len(t) > 2:
                x0, y0, x1, y1 = span['bbox']
                print(f'{x0:7.1f} {y0:7.1f} {x1:7.1f} {y1:7.1f}  {span["text"].strip()}')
