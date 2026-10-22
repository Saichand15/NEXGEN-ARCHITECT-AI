import fitz

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[2]
rot = page.rotation_matrix

# Get words with positions in rotated space
words = page.get_text('words')  # x0,y0,x1,y1,word,...
# Rotate word coords
rwords = []
for w in words:
    x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
    p = fitz.Point((x0+x1)/2, (y0+y1)/2) * rot
    rwords.append((p.x, p.y, text))

# Dimension text near the bottom of floor plan (y 1218..1280, x 200..1100)
print('=== BOTTOM dimension text (front width) ===')
bw = [(x, y, t) for x, y, t in rwords if 1215 < y < 1290 and 180 < x < 1120]
bw.sort(key=lambda v: v[0])
for x, y, t in bw:
    print(f'  x{x:7.1f} y{y:7.1f}  {t}')

print('=== LEFT dimension text (depth), x 150..225 ===')
lw = [(x, y, t) for x, y, t in rwords if 150 < x < 226 and 140 < y < 1260]
lw.sort(key=lambda v: v[1])
for x, y, t in lw:
    print(f'  x{x:7.1f} y{y:7.1f}  {t}')

print('=== TOP dimension text (rear), y 120..165 ===')
tw = [(x, y, t) for x, y, t in rwords if 120 < y < 165 and 180 < x < 1120]
tw.sort(key=lambda v: v[0])
for x, y, t in tw:
    print(f'  x{x:7.1f} y{y:7.1f}  {t}')
