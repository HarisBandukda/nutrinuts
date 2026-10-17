"""
Generate the NutriNuts Open Graph (social share) thumbnail.

Produces public/images/og-image.jpg — 1200x630 (the size Facebook, WhatsApp
and other platforms read via og:image). It is built from the hero banner with
a brand bar so the link preview is eye-catching and on-brand.

Run:  python marketing/graphics/create-og-image.py
"""

import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BANNER = os.path.join(ROOT, "public", "images", "banner.webp")
LOGO = os.path.join(ROOT, "public", "images", "logo.png")
OUT = os.path.join(ROOT, "public", "images", "og-image.jpg")

W, H = 1200, 630

# Brand colours
BROWN = (59, 16, 7)        # #3B1007
GOLD = (245, 197, 132)     # #F5C584
CREAM = (255, 251, 245)    # #FFFBF5

FONT_GEORGIA = r"C:\Windows\Fonts\georgia.ttf"
FONT_GEORGIA_B = r"C:\Windows\Fonts\georgiab.ttf"
FONT_SEGOE = r"C:\Windows\Fonts\segoeui.ttf"
FONT_SEGOE_B = r"C:\Windows\Fonts\segoeuib.ttf"


def font(path, size, bold_path=None, bold=False):
    p = bold_path if bold and bold_path else path
    try:
        return ImageFont.truetype(p, size)
    except Exception:
        return ImageFont.load_default()


def cover(base: Image.Image, w: int, h: int) -> Image.Image:
    """Resize-and-center-crop to exactly w x h (cover behaviour)."""
    base = base.convert("RGB")
    sw, sh = base.size
    scale = max(w / sw, h / sh)
    nw, nh = int(round(sw * scale)), int(round(sh * scale))
    base = base.resize((nw, nh), Image.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return base.crop((left, top, left + w, top + h))


def main():
    banner = Image.open(BANNER)
    base = cover(banner, W, H).convert("RGBA")

    # Dark brown gradient from bottom for legibility.
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    start_y, end_y = 300, H
    max_alpha = 225
    for y in range(start_y, end_y):
        a = int(max_alpha * (y - start_y) / (end_y - start_y))
        od.line([(0, y), (W, y)], fill=(BROWN[0], BROWN[1], BROWN[2], a))
    img = Image.alpha_composite(base, overlay)

    draw = ImageDraw.Draw(img)

    # Cream card holding the logo (keeps the brown logo readable).
    card_w, card_h = 600, 190
    card_x = (W - card_w) // 2
    card_y = 330
    draw.rounded_rectangle(
        [card_x, card_y, card_x + card_w, card_y + card_h],
        radius=30, fill=CREAM, outline=GOLD, width=5,
    )

    logo = Image.open(LOGO).convert("RGBA")
    logo_h = 108
    logo_w = int(logo.width * (logo_h / logo.height))
    logo = logo.resize((logo_w, logo_h), Image.LANCZOS)
    lx = (W - logo_w) // 2
    ly = card_y + (card_h - logo_h) // 2
    img.alpha_composite(logo, (lx, ly))

    # Tagline + URL beneath the card.
    tagline = "Pure. Fresh. Premium."
    f_tag = font(FONT_GEORGIA, 40, FONT_GEORGIA_B, bold=True)
    tb = draw.textbbox((0, 0), tagline, font=f_tag)
    tw = tb[2] - tb[0]
    draw.text(((W - tw) // 2, 545), tagline, font=f_tag, fill=GOLD)

    url = "nutrinuts.pk"
    f_url = font(FONT_SEGOE, 30, FONT_SEGOE_B, bold=True)
    ub = draw.textbbox((0, 0), url, font=f_url)
    uw = ub[2] - ub[0]
    draw.text(((W - uw) // 2, 590), url, font=f_url, fill=CREAM)

    img.convert("RGB").save(OUT, "JPEG", quality=88)
    print("Saved", OUT, os.path.getsize(OUT), "bytes")


if __name__ == "__main__":
    main()
