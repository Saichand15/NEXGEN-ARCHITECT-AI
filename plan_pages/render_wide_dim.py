import fitz

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
page = doc[0]
# Wider crop around the 59'-11" overall dimension line found at x~1328-1560,y~0-180
clip = fitz.Rect(600, -40, 1700, 220)
pix = page.get_pixmap(dpi=150, clip=clip)
pix.save(r'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages\widedim_top.png')
print(pix.width, pix.height)
