import fitz, json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')

# Corrected floor-plan drawing region (left drawing on sheet), rotated display coords
PLAN = (220, 150, 1080, 1180)

def extract(pno):
    page = doc[pno]
    rot = page.rotation_matrix
    drawings = page.get_drawings()
    polys = []
    lines = []
    for d in drawings:
        fill = d.get('fill')
        w = d.get('width') or 0
        pts_list = []
        for item in d['items']:
            if item[0] == 'l':
                p1, p2 = item[1] * rot, item[2] * rot
                pts_list.append(('l', (p1.x, p1.y), (p2.x, p2.y)))
            elif item[0] == 're':
                r = item[1]
                cs = [fitz.Point(r.x0, r.y0) * rot, fitz.Point(r.x1, r.y0) * rot,
                      fitz.Point(r.x1, r.y1) * rot, fitz.Point(r.x0, r.y1) * rot]
                pts_list.append(('re', [(p.x, p.y) for p in cs], None))
        allx, ally = [], []
        for e in pts_list:
            if e[0] == 'l':
                allx += [e[1][0], e[2][0]]; ally += [e[1][1], e[2][1]]
            else:
                allx += [p[0] for p in e[1]]; ally += [p[1] for p in e[1]]
        if not allx:
            continue
        cx, cy = sum(allx)/len(allx), sum(ally)/len(ally)
        if not (PLAN[0] <= cx <= PLAN[2] and PLAN[1] <= cy <= PLAN[3]):
            continue
        if fill is not None:
            poly = []
            for e in pts_list:
                if e[0] == 'l':
                    if not poly:
                        poly.append(e[1])
                    poly.append(e[2])
                else:
                    poly = list(e[1])
            if len(poly) >= 3:
                polys.append(poly)
        if w >= 0.5:
            for e in pts_list:
                if e[0] == 'l':
                    lines.append((e[1][0], e[1][1], e[2][0], e[2][1]))
                else:
                    cs = e[1]
                    for i in range(4):
                        j = (i+1) % 4
                        lines.append((cs[i][0], cs[i][1], cs[j][0], cs[j][1]))
    return polys, lines

for pno, tag in [(2, 'floor1'), (3, 'floor2')]:
    polys, lines = extract(pno)
    allx = [p[0] for poly in polys for p in poly] + [l[0] for l in lines] + [l[2] for l in lines]
    ally = [p[1] for poly in polys for p in poly] + [l[1] for l in lines] + [l[3] for l in lines]
    minx, maxx, miny, maxy = min(allx), max(allx), min(ally), max(ally)
    print(f'{tag}: {len(polys)} polys, {len(lines)} lines, x {minx:.0f}..{maxx:.0f}, y {miny:.0f}..{maxy:.0f}')

    scale = 4.0
    W = int((maxx - minx) * scale) + 80
    H = int((maxy - miny) * scale) + 80
    img = Image.new('L', (W, H), 0)
    dr = ImageDraw.Draw(img)
    for poly in polys:
        dr.polygon([((x-minx)*scale+40, (y-miny)*scale+40) for x, y in poly], fill=255)
    for x0, y0, x1, y1 in lines:
        dr.line([(x0-minx)*scale+40, (y0-miny)*scale+40, (x1-minx)*scale+40, (y1-miny)*scale+40], fill=255, width=6)
    walls = np.array(img) > 0

    walls_c = ndimage.binary_closing(walls, structure=np.ones((81, 81)))
    walls_c = ndimage.binary_dilation(walls_c, structure=np.ones((25, 25)))
    free = ~walls_c
    lab, n = ndimage.label(free)
    border = set(np.unique(np.concatenate([lab[0,:], lab[-1,:], lab[:,0], lab[:,-1]])))
    outside = np.isin(lab, list(border))
    fp = ~outside
    flab, fn = ndimage.label(fp)
    sizes = ndimage.sum(fp, flab, range(1, fn+1))
    fp = flab == (1 + int(np.argmax(sizes)))
    fp = ndimage.binary_erosion(fp, structure=np.ones((25, 25)))

    ys, xs = np.nonzero(fp)
    fx0, fx1, fy0, fy1 = xs.min(), xs.max(), ys.min(), ys.max()
    w_pdf = (fx1-fx0)/scale
    d_pdf = (fy1-fy0)/scale
    print(f'   footprint: w {w_pdf:.1f}u d {d_pdf:.1f}u aspect {w_pdf/d_pdf:.3f}')
    print(f'   if depth=59.917ft -> {d_pdf/59.917:.3f} u/ft, width={w_pdf/(d_pdf/59.917):.2f} ft')

    Image.fromarray((fp*255).astype(np.uint8)).save(rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\footprint_{tag}.png')
    np.save(rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\footprint_{tag}.npy', fp)
    with open(rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\footprint_{tag}_meta.json', 'w') as f:
        json.dump({'minx': minx, 'miny': miny, 'scale': scale, 'offset': 40}, f)
