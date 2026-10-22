import fitz

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[0]

targets = {
    '59-11': (1328, -40, 1560, 180),
    '64-7': (1020, 275, 1260, 525),
    '69-3': (1300, 740, 1550, 990),
}

for name, (x0, y0, x1, y1) in targets.items():
    clip = fitz.Rect(x0, y0, x1, y1)
    pix = page.get_pixmap(dpi=200, clip=clip)
    out = rf'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\dimcheck2_{name}.png'
    pix.save(out)
    print(name, '->', out, pix.width, pix.height)
