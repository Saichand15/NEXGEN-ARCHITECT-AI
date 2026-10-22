import fitz
import numpy as np

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[2]  # 1st floor plan page (confirmed earlier: walls_floor1 etc.)
rot = page.rotation_matrix
drawings = page.get_drawings()

# Collect ALL wall-like geometry (thick strokes + filled poche) with NO
# region cropping first, to find the true overall extents of the main
# floor-plan drawing (left drawing on the sheet, not the ceiling plan copy).
segs = []
for d in drawings:
    w = d.get('width') or 0
    is_thick = w >= 0.9
    is_fill = d.get('fill') is not None
    if not (is_thick or is_fill):
        continue
    for item in d['items']:
        if item[0] == 'l':
            p1, p2 = item[1] * rot, item[2] * rot
            segs.append((p1.x, p1.y, p2.x, p2.y))
        elif item[0] == 're':
            r = item[1]
            cs = [fitz.Point(r.x0, r.y0) * rot, fitz.Point(r.x1, r.y0) * rot,
                  fitz.Point(r.x1, r.y1) * rot, fitz.Point(r.x0, r.y1) * rot]
            for i in range(4):
                j = (i + 1) % 4
                segs.append((cs[i].x, cs[i].y, cs[j].x, cs[j].y))

# Restrict to the LEFT drawing only (floor plan), based on earlier finding
# that it spans roughly x in [220, 1070], y in [140, 1230] in rotated coords.
PLAN = (90, 130, 1200, 1260)
segs_f = [s for s in segs if PLAN[0] <= (s[0] + s[2]) / 2 <= PLAN[2] and PLAN[1] <= (s[1] + s[3]) / 2 <= PLAN[3]]

xs = [s[0] for s in segs_f] + [s[2] for s in segs_f]
ys = [s[1] for s in segs_f] + [s[3] for s in segs_f]
print(f'{len(segs_f)} segs in plan region')
print(f'x range: {min(xs):.1f} .. {max(xs):.1f}  (span {max(xs)-min(xs):.1f})')
print(f'y range: {min(ys):.1f} .. {max(ys):.1f}  (span {max(ys)-min(ys):.1f})')

# Histogram x and y extents to find the main building bounding box
# (ignore tiny stray marks by looking at the bulk of long wall segments)
xs_arr = np.array(xs)
ys_arr = np.array(ys)
print('x percentiles 1/99:', np.percentile(xs_arr, [1, 99]))
print('y percentiles 1/99:', np.percentile(ys_arr, [1, 99]))
