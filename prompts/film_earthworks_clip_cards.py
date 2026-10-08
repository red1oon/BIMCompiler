# ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §EARTHWORKS_CLIP. Text cards for the Earthworks / Cut & Fill clip. Backdrop = the user's
# latest screenshot (darkened). Numbers on c3 are read off that screenshot's own panel (CUT 119,703 m³ · FILL 278,307 m³) — PRIME rule.
# Closing black card = the user's claim line (paraphrased: "computed", because cut/fill is INFERRED, not extracted) + the prior-art
# lines (web search 2026-10-09, prices third-party/undated where noted). Read the log: §EW_CARDS.
# usage: python3 film_earthworks_clip_cards.py <backdrop.png> <outdir> [en|ms]   → cover.png c1.png c2.png c3.png end.png close.png (1920×1080)
import sys, os
from PIL import Image, ImageDraw, ImageFont
bg_path, outdir = sys.argv[1], sys.argv[2]; LANG = sys.argv[3] if len(sys.argv) > 3 else 'en'; os.makedirs(outdir, exist_ok=True)
W, H = 1920, 1080
def font(sz, bold=False):
    for p in (['/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf', '/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf'] if bold else
              ['/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf', '/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf']):
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
def cover_fit(im):
    r = max(W / im.width, H / im.height); im = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
    x, y = (im.width - W) // 2, (im.height - H) // 2; return im.crop((x, y, x + W, y + H))
def wrap(d, text, f, maxw):
    out, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: out.append(cur); cur = w
    return out + ([cur] if cur else [])
bg = cover_fit(Image.open(bg_path).convert('RGB'))
def card(name, title, lines, sub=None, big=False):
    im = bg.convert('RGBA'); ov = Image.new('RGBA', (W, H), (8, 10, 14, 185)); im = Image.alpha_composite(im, ov); d = ImageDraw.Draw(im)
    y = 300 if not big else 380
    ft = font(96 if big else 74, True)
    for t in wrap(d, title, ft, W - 360): d.text((180, y), t, font=ft, fill=(79, 195, 247)); y += (112 if big else 88)
    if sub: y += 10; d.text((180, y), sub, font=font(44), fill=(220, 224, 230)); y += 70
    y += 20; fb = font(46)
    for ln in lines:
        col = (255, 140, 26) if ln.startswith(('CUT', 'POTONG')) else (51, 136, 255) if ln.startswith(('FILL', 'TAMBAK')) else (235, 238, 242)
        for t in wrap(d, ln, fb, W - 360): d.text((180, y), t, font=fb, fill=col); y += 64
        y += 14
    im.convert('RGB').save(os.path.join(outdir, name + '.png')); print('§EW_CARDS wrote', name)
T = {'en': dict(
    cover=('Earthworks & Roadworks', [], 'Cut and fill, inferred from the model'),
    c1=('Why chainage matters', ['A highway is not a building.', 'You cannot walk it and simply know where you are.', 'Chainage says exactly where the earth is cut, and where it is filled.']),
    c2=('How it decides', ['Ground above the road on both sides: CUT, orange.', 'Ground below the road on both sides: FILL, blue.', 'One of each: side-hill, each side its own colour.', 'Blue, never green, so it is not mistaken for trees.']),
    c3=('Today on Civil Works', ['CUT 119,703 m³    FILL 278,307 m³', 'Read off the panel in the recording. Rough prisms, inferred, not extracted.', 'Roadworks, cost, duration and plant are listed as pending.']),
    end=('Inferred from the IFC alone', ['Every value comes from the model file itself.', 'Engineers can correct it when the design surfaces arrive.']),
    close_head='Computed entirely from a standard IFC2X3 file, even a low-grade one. No AI. No API call.',
    prior='PRIOR ART CHECK  (web search 2026-10-09 · list prices vary by region and vendor)',
    close=['Autodesk Civil 3D: cut/fill volumes from its own design surfaces · US$2,870 per year (Autodesk FAQ)',
           'Bentley OpenRoads Designer: US$6,057 per year, US$15,142 perpetual (G2 listing, updated March 2026)',
           'Trimble Business Center: cut/fill volume tools · US$2,865 to US$4,405 per licence (reseller listings, billing basis unclear)',
           '12d Model: open price, quote only · Novapoint: no public price found',
           'Here: inferred from the exported IFC alone, in the browser, no install.']),
 'ms': dict(
    cover=('Kerja Tanah & Kerja Jalan', [], 'Potong dan tambak, dianggar daripada model'),
    c1=('Mengapa chainage penting', ['Lebuh raya bukan bangunan.', 'Anda tidak boleh berjalan di atasnya dan terus tahu lokasi anda.', 'Chainage menunjukkan dengan tepat di mana tanah dipotong, dan di mana ditambak.']),
    c2=('Bagaimana ia memutuskan', ['Tanah di atas jalan di kedua-dua belah: POTONG, oren.', 'Tanah di bawah jalan di kedua-dua belah: TAMBAK, biru.', 'Satu setiap satu: lereng bukit, setiap belah warnanya sendiri.', 'Biru, bukan hijau, supaya tidak disangka pokok.']),
    c3=('Hari ini pada Civil Works', ['POTONG 119,703 m³    TAMBAK 278,307 m³', 'Dibaca daripada panel dalam rakaman. Prisma kasar, dianggar, bukan diekstrak.', 'Roadworks, kos, tempoh dan jentera disenaraikan sebagai belum siap.']),
    end=('Dianggar daripada IFC sahaja', ['Setiap nilai datang daripada fail model itu sendiri.', 'Jurutera boleh membetulkannya apabila permukaan reka bentuk tiba.']),
    close_head='Dikira sepenuhnya daripada fail IFC2X3 standard, walaupun bermutu rendah. Tiada AI. Tiada panggilan API.',
    prior='SEMAKAN SENI TERDAHULU  (carian web 2026-10-09 · harga senarai berbeza mengikut rantau dan vendor)',
    close=['Autodesk Civil 3D: isi padu potong/tambak daripada permukaan reka bentuk sendiri · AS$2,870 setahun (FAQ Autodesk)',
           'Bentley OpenRoads Designer: AS$6,057 setahun, AS$15,142 kekal (penyenaraian G2, dikemas kini Mac 2026)',
           'Trimble Business Center: alat isi padu potong/tambak · AS$2,865 hingga AS$4,405 setiap lesen (penyenaraian penjual semula, asas bil tidak jelas)',
           '12d Model: harga terbuka, sebut harga sahaja · Novapoint: tiada harga awam ditemui',
           'Di sini: dianggar daripada IFC yang dieksport sahaja, dalam pelayar, tanpa pemasangan.'])}[LANG]
card('cover', T['cover'][0], T['cover'][1], sub=T['cover'][2], big=True)
for k in ('c1', 'c2', 'c3', 'end'): card(k, T[k][0], T[k][1])
# closing black card
im = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(im)
y = 150
for t in wrap(d, T['close_head'], font(54, True), W - 300): d.text((150, y), t, font=font(54, True), fill=(255, 255, 255)); y += 72
y += 40; d.text((150, y), T['prior'], font=font(34, True), fill=(255, 193, 7)); y += 62
FB = font(35)
for ln in T['close']:
    for t in wrap(d, ln, FB, W - 300): d.text((150, y), t, font=FB, fill=(210, 210, 210)); y += 48
    y += 14
im.save(os.path.join(outdir, 'close.png')); print('§EW_CARDS wrote close (black)')
