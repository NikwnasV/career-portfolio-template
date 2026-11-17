"""Generate the portfolio's static Open Graph preview (requires Pillow and DejaVu Sans)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
font_root = Path('/usr/share/fonts/truetype/dejavu')
regular = lambda size: ImageFont.truetype(str(font_root / 'DejaVuSans.ttf'), size)
bold = lambda size: ImageFont.truetype(str(font_root / 'DejaVuSans-Bold.ttf'), size)
image = Image.new('RGB', (1200, 630))
pixels = image.load()
for y in range(630):
    for x in range(1200):
        glow = max(0, 1 - ((x - 1040) ** 2 + (y - 70) ** 2) ** 0.5 / 1050)
        pixels[x, y] = (int(15 + glow * 24), int(13 + glow * 14), int(41 + glow * 42))
draw = ImageDraw.Draw(image)
accent = '#A78BFA'
draw.rounded_rectangle((44, 44, 1156, 586), radius=26, outline='#51416F', width=2)
draw.text((84, 90), 'PORTFOLIO / NV', font=bold(20), fill=accent)
draw.text((80, 176), 'Nikonas Varsakis', font=bold(64), fill='#FFFFFF')
draw.text((84, 282), 'IT, Networking & VoIP', font=regular(38), fill='#D9C9FF')
draw.text((84, 358), 'Infrastructure · Java · IoT', font=regular(26), fill='#B2BED1')
draw.line((84, 458, 1116, 458), fill='#51416F', width=2)
draw.text((84, 500), 'nvarsakis.gr', font=bold(25), fill=accent)
draw.text((926, 500), 'Explore →', font=regular(24), fill='#FFFFFF')
image.save(root / 'public/social-card.png', optimize=True)
