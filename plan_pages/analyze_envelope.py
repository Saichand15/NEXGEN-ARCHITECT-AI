import fitz, json
import numpy as np

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
PLAN = (95, 145, 880, 1120)

for pno, tag in [(2, 'floor1'), (3, 'floor2')]:
    page = doc[pno]
    rot = page.rotation_matrix
    drawings = page.get_drawings()

    segs = []
    for d in drawings:
        w = d.get('width') or 0
        if w < 1.0:
            continue
        for item in d['items']:
            if item[0] != 'l':
                continue
            p1, p2 = item[1] * rot, item[2] * rot
            x0, y0, x1, y1 = p1.x, p1.y, p2.x, p2.y
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
            if PLAN[0] <= cx <= PLAN[2] and PLAN[1] <= cy <= PLAN[3]:
                segs.append((x0, y0, x1, y1))

    # Classify: horizontal, vertical, diagonal
    horiz, vert, diag = [], [], []
    for x0, y0, x1, y1 in segs:
        dx, dy = abs(x1 - x0), abs(y1 - y0)
        if dx < 0.5 and dy < 0.5:
            continue
        ang = np.degrees(np.arctan2(dy, dx))
        if ang > 90: ang -= 180
        if ang < -90: ang += 180
        length = (dx**2 + dy**2) ** 0.5
        if abs(ang) < 3:
            horiz.append((min(x0,x1), (y0+y1)/2, max(x0,x1), length))
        elif abs(abs(ang) - 90) < 3:
            vert.append(((x0+x1)/2, min(y0,y1), max(y0,y1), length))
        else:
            diag.append((x0, y0, x1, y1, ang, length))

    print(f'=== {tag}: {len(segs)} thick segs -> {len(horiz)} horiz, {len(vert)} vert, {len(diag)} diag')

    # Longest horizontal lines (candidate front/rear walls)
    horiz.sort(key=lambda s: -s[3])
    print('  longest horiz (x0, y, x1, len):')
    for s in horiz[:8]:
        print(f'    x {s[0]:7.1f}..{s[2]:7.1f}  y {s[1]:7.1f}  len {s[3]:6.1f}')

    vert.sort(key=lambda s: -s[3])
    print('  longest vert (x, y0..y1, len):')
    for s in vert[:8]:
        print(f'    x {s[0]:7.1f}  y {s[1]:7.1f}..{s[2]:7.1f}  len {s[3]:6.1f}')

    diag.sort(key=lambda s: -s[5])
    print('  longest diag (x0,y0 -> x1,y1, ang, len):')
    for s in diag[:8]:
        print(f'    ({s[0]:7.1f},{s[1]:7.1f}) -> ({s[2]:7.1f},{s[3]:7.1f})  ang {s[4]:6.1f}  len {s[5]:6.1f}')

    with open(rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\thicksegs_{tag}.json', 'w') as f:
        json.dump({'horiz': horiz, 'vert': vert, 'diag': diag}, f)
