import fitz

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[0]
clip = fitz.Rect(1050, -40, 2200, 220)
pix = page.get_pixmap(dpi=150, clip=clip)
pix.save(r'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\widedim_top2.png')
print(pix.width, pix.height)
