import fitz

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[0]

# Rotated-coordinate positions found for the 3 key dimensions:
# 59'-11"  -> (1428-1457, 75-83)
# 64'-7 3/4" -> (1135-1144, 389-410)
# 69'-3 5/16" -> (1415-1437, 852-870)
# These are in ROTATED (display) space. To clip with get_pixmap we need
# UNROTATED page-space coordinates, so invert the rotation.
rot = page.rotation_matrix
inv = ~rot

targets = {
    '59-11': (1428, 60, 1460, 100),
    '64-7': (1120, 375, 1160, 425),
    '69-3': (1400, 840, 1450, 890),
}

for name, (x0, y0, x1, y1) in targets.items():
    # Expand a generous margin in rotated space, convert corners via inverse rotation
    corners = [fitz.Point(x0, y0), fitz.Point(x1, y0), fitz.Point(x1, y1), fitz.Point(x0, y1)]
    uc = [c * inv for c in corners]
    ux0 = min(p.x for p in uc); ux1 = max(p.x for p in uc)
    uy0 = min(p.y for p in uc); uy1 = max(p.y for p in uc)
    margin = 150
    clip = fitz.Rect(ux0 - margin, uy0 - margin, ux1 + margin, uy1 + margin)
    pix = page.get_pixmap(dpi=200, clip=clip)
    out = rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\dimcheck_{name}.png'
    pix.save(out)
    print(name, '->', out, pix.width, pix.height)
