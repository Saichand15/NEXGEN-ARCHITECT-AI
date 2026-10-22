import fitz

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[2]
rot = page.rotation_matrix
words = page.get_text('words')

# Grid markers: single alphanumeric chars, find on all 4 sides of the floor plan
print('Single-char grid markers in plan area (x 150..1150, y 100..1300):')
marks = []
for w in words:
    x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
    p = fitz.Point((x0+x1)/2, (y0+y1)/2) * rot
    if 150 < p.x < 1150 and 100 < p.y < 1300 and len(text.strip()) <= 3 and text.strip():
        marks.append((round(p.x,1), round(p.y,1), text.strip()))
marks.sort(key=lambda v: (v[1], v[0]))
for x, y, t in marks:
    print(f'  x{x:7.1f} y{y:7.1f}  {t}')
