from PIL import Image
import os

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(base, "images", "chars")
os.makedirs(out, exist_ok=True)

for i in range(1, 5):
    src = os.path.join(base, f"그림{i}.png")
    img = Image.open(src).convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r < 28 and g < 28 and b < 28:
                pixels[x, y] = (0, 0, 0, 0)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    dest = os.path.join(out, f"char{i}.png")
    img.save(dest, "PNG")
    print(i, img.size, dest)
