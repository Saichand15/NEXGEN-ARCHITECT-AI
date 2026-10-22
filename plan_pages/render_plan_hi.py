import fitz, os
from PIL import Image

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')
out = r'C:\Users\Sai Chand\Downloads\Architect AI Web App UI\plan_pages'

# Floor plan drawing region in rotated display coords (from thick render):
# x ~230..1070, y ~160..1230. Render that clip at high dpi.
clip = fitz.Rect(200, 130, 1120, 1260)
for pno, tag in [(2, 'floor1'), (3, 'floor2')]:
    page = doc[pno]
    pix = page.get_pixmap(dpi=300, clip=clip)
    p = os.path.join(out, f'planhi_{tag}.png')
    pix.save(p)
    print(tag, pix.width, pix.height)

# Also crop dimension edges from the floor1 hi-res render
img = Image.open(os.path.join(out, 'planhi_floor1.png'))
W, H = img.size
img.crop((0, int(H*0.80), W, H)).save(os.path.join(out, 'dim_bottom.png'))       # bottom dims
img.crop((0, 0, int(W*0.14), H)).save(os.path.join(out, 'dim_left.png'))         # left dims
img.crop((int(W*0.86), 0, W, H)).save(os.path.join(out, 'dim_right.png'))        # right dims
img.crop((0, 0, W, int(H*0.14))).save(os.path.join(out, 'dim_top.png'))          # top dims
print('dims saved')
