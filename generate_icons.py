import zlib
import struct
import math
import os

def create_png(width, height, get_pixel):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    
    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    idat = chunk(b'IDAT', zlib.compress(bytes(raw_data), 9))
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend

def get_icon_pixel(x, y, w, h, is_maskable=False):
    # Normalized coordinates (-1.0 to 1.0)
    nx = (x / w) * 2.0 - 1.0
    ny = (y / h) * 2.0 - 1.0
    dist = math.sqrt(nx * nx + ny * ny)

    # Base background gradient (Deep Indigo to Slate 950)
    t = (nx + ny + 2.0) / 4.0
    bg_r = int(15 + t * (30 - 15))
    bg_g = int(23 + t * (27 - 23))
    bg_b = int(42 + t * (75 - 42))

    if not is_maskable and dist > 0.95:
        # Transparent outside circle for standard icons
        return (0, 0, 0, 0)

    # Outer glowing ring (radius 0.65 to 0.78)
    ring_inner = 0.62 if not is_maskable else 0.52
    ring_outer = 0.74 if not is_maskable else 0.62
    
    if ring_inner <= dist <= ring_outer:
        # Angle for ring gradient
        angle = math.atan2(ny, nx) # -pi to pi
        grad_t = (angle + math.pi) / (2 * math.pi)
        # Indigo (99, 102, 241) to Cyan (6, 182, 212)
        r = int(99 + grad_t * (6 - 99))
        g = int(102 + grad_t * (182 - 102))
        b = int(241 + grad_t * (212 - 241))
        return (r, g, b, 255)

    # Inner clock face disc (inside ring_inner)
    if dist < ring_inner:
        # Subtle inner dark circle
        dial_r = int(bg_r * 0.7)
        dial_g = int(bg_g * 0.7)
        dial_b = int(bg_b * 0.7 + 10)

        # Center dot (radius 0.08)
        if dist < 0.08:
            return (248, 250, 252, 255) # Bright white center

        # Minute Hand pointing towards 2 o'clock (angle ~ -pi/6)
        # Hour Hand pointing towards 9 o'clock (angle ~ pi)
        # Let's draw hands using distance to line segments
        scale = 0.85 if not is_maskable else 0.72

        # Hand 1: Hour hand (points left-up at -150 deg or dx=-0.35, dy=-0.1)
        # Point from (0,0) to (-0.28, -0.05)
        # Distance to segment
        def dist_to_segment(px, py, x1, y1, x2, y2):
            dx, dy = x2 - x1, y2 - y1
            l2 = dx*dx + dy*dy
            if l2 == 0: return math.hypot(px-x1, py-y1)
            t = max(0, min(1, ((px-x1)*dx + (py-y1)*dy) / l2))
            return math.hypot(px - (x1 + t*dx), py - (y1 + t*dy))

        d_hour = dist_to_segment(nx, ny, 0, 0, -0.26 * scale, -0.08 * scale)
        if d_hour < 0.035 * scale:
            return (248, 250, 252, 255)

        # Hand 2: Minute hand (points up-right at dx=0.20, dy=-0.35)
        d_min = dist_to_segment(nx, ny, 0, 0, 0.22 * scale, -0.36 * scale)
        if d_min < 0.028 * scale:
            return (6, 182, 212, 255) # Cyan

        # Bidirectional arrows or hour ticks
        # 12, 3, 6, 9 o'clock ticks
        tick_r = ring_inner - 0.06
        for h_ang in [0, math.pi/2, math.pi, -math.pi/2]:
            tx = tick_r * math.cos(h_ang)
            ty = tick_r * math.sin(h_ang)
            if math.hypot(nx - tx, ny - ty) < 0.025:
                return (148, 163, 184, 255)

        return (dial_r, dial_g, dial_b, 255)

    return (bg_r, bg_g, bg_b, 255)

target_dir = "/Users/abharamb/.gemini/antigravity/scratch/timezone-converter"
icons_dir = os.path.join(target_dir, "icons")
os.makedirs(icons_dir, exist_ok=True)

print("Generating icon-192.png...")
png192 = create_png(192, 192, lambda x, y, w, h: get_icon_pixel(x, y, w, h, False))
with open(os.path.join(icons_dir, "icon-192.png"), "wb") as f:
    f.write(png192)

print("Generating icon-512.png...")
png512 = create_png(512, 512, lambda x, y, w, h: get_icon_pixel(x, y, w, h, False))
with open(os.path.join(icons_dir, "icon-512.png"), "wb") as f:
    f.write(png512)

print("Generating icon-maskable-512.png...")
png_mask = create_png(512, 512, lambda x, y, w, h: get_icon_pixel(x, y, w, h, True))
with open(os.path.join(icons_dir, "icon-maskable-512.png"), "wb") as f:
    f.write(png_mask)

# Also generate SVG icon
svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="160" fill="none" stroke="url(#ring)" stroke-width="24" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="130" fill="#0b0f19" opacity="0.8"/>
  <line x1="256" y1="256" x2="180" y2="230" stroke="#f8fafc" stroke-width="14" stroke-linecap="round"/>
  <line x1="256" y1="256" x2="320" y2="150" stroke="#06b6d4" stroke-width="10" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="14" fill="#f8fafc"/>
  <circle cx="256" cy="120" r="5" fill="#94a3b8"/>
  <circle cx="392" cy="256" r="5" fill="#94a3b8"/>
  <circle cx="256" cy="392" r="5" fill="#94a3b8"/>
  <circle cx="120" cy="256" r="5" fill="#94a3b8"/>
</svg>'''

with open(os.path.join(icons_dir, "icon.svg"), "w") as f:
    f.write(svg_content)

print("All icons successfully generated in icons/ directory!")
