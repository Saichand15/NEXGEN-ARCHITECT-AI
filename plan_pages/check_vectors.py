import fitz

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
for pno in [2, 3]:
    page = doc[pno]
    drawings = page.get_drawings()
    n_lines = 0
    xs, ys = [], []
    for d in drawings:
        for item in d['items']:
            if item[0] == 'l':  # line
                n_lines += 1
                for p in item[1:]:
                    xs.append(p.x)
                    ys.append(p.y)
            elif item[0] == 're':  # rect
                n_lines += 4
                r = item[1]
                xs += [r.x0, r.x1]
                ys += [r.y0, r.y1]
    print(f'PAGE {pno}: {len(drawings)} paths, {n_lines} line segments')
    if xs:
        print(f'  x range: {min(xs):.1f} .. {max(xs):.1f}')
        print(f'  y range: {min(ys):.1f} .. {max(ys):.1f}')
