import fitz, re

doc = fitz.open(r'C:\Users\Sai Chand\Downloads\PALETINE-NORTHWEST-HIGHWAY-8-25-2026-00.pdf')

for pno in [0, 1, 2]:  # T-1, A-1 area (page indices may shift; scan a few)
    page = doc[pno]
    text = page.get_text('text')
    # find any token that looks like an overall big dimension (two numbers with feet marks)
    matches = re.findall(r"\d{1,3}'-\d{1,2}(?:\s?\d/\d)?\"?", text)
    print(f'--- page {pno} ---')
    for m in matches:
        print(' ', m)
