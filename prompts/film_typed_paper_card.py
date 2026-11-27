# ⚠ DO NOT REMOVE — Scope: ERP_DEPTH_FILM.md §FILM-NC (red1 2026-10-14: replace the newspaper-letters intro by a message "typed onto paper style for better legibility").
#   A typewriter (Courier-metric URW Nimbus Mono) types the message onto a sheet of paper, one key per character, in step with the narration:
#   the reveal spans [start, start+speech], pauses weighted at , . ; (data = the narration's measured length, never a guess). Keys tick, the line-end bell rings.
#   Text is dark ink on cream paper at 40 px+: legible at phone size. Silent mp4 + a ticks wav, the SAME contract as film_ransom_open_card.py (the assembler muxes both).
# usage: python3 film_typed_paper_card.py "<text>" <speech_sec> <out_silent.mp4> <out_ticks.wav> [start=0.6] [tail=3.0] [size=40]
import sys, os, math, random, subprocess, wave
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont
text, speech, OUT, TICKS = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4]
START = float(sys.argv[5]) if len(sys.argv) > 5 else 0.6; TAIL = float(sys.argv[6]) if len(sys.argv) > 6 else 3.0; SIZE = int(sys.argv[7]) if len(sys.argv) > 7 else 40
W, H, FPS = 1920, 1080, 24
random.seed(20261014); rng = np.random.default_rng(11)
FONT = next(p for p in ['/usr/share/fonts/opentype/urw-base35/NimbusMonoPS-Regular.otf', '/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'] if os.path.exists(p))
font = ImageFont.truetype(FONT, SIZE); ADV = font.getlength('M'); PITCH = int(SIZE * 1.62)
PX0, PY0, PX1, PY1 = 190, 70, 1730, 1010; LM, TM = PX0 + 120, PY0 + 110; RM = PX1 - 110
cols = int((RM - LM) // ADV)
# word-wrap into lines of at most `cols` characters --------------------------------------------------------------------------------------------------
lines, cur = [], ''
for wd in text.split(' '):
    if len(cur) + (1 if cur else 0) + len(wd) > cols and cur: lines.append(cur); cur = wd
    else: cur = (cur + ' ' + wd) if cur else wd
if cur: lines.append(cur)
assert TM + len(lines) * PITCH + 60 < PY1, 'text does not fit the paper: %d lines' % len(lines)
items = []   # (char, x, y, weight, lineno)
for li, ln in enumerate(lines):
    for ci, ch in enumerate(ln):
        wgt = 1.0 + (5.0 if ch == ',' else 9.0 if ch in '.;:' else 0.0) + (0.4 if ch == ' ' else 0.0)
        items.append(dict(ch=ch, x=LM + ci * ADV, y=TM + li * PITCH, wgt=wgt, li=li, last=(ci == len(ln) - 1)))
    if li < len(lines) - 1: items[-1]['wgt'] += 4.0       # the carriage return costs a beat
tot_w = sum(i['wgt'] for i in items); acc = 0
for it in items: it['t'] = START + (acc / tot_w) * speech * 0.97; acc += it['wgt']
TOT = START + speech + TAIL; NF = int(math.ceil(TOT * FPS))
print('§TYPED lines=%d cols=%d chars=%d size=%d font=%s' % (len(lines), cols, len(items), SIZE, os.path.basename(FONT)))
# desk + paper (cream, fibre noise, soft shadow, faint top-edge shading) ----------------------------------------------------------------------------
desk = (rng.normal(0, 3, (H, W, 1)) + np.array([34, 31, 29])).clip(0, 255).astype('uint8')
yy, xx = np.mgrid[0:H, 0:W]; vig = (1 - 0.38 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)).clip(0.5, 1)[..., None]
bg = Image.fromarray((desk * vig).astype('uint8')).convert('RGBA')
pw, ph = PX1 - PX0, PY1 - PY0
pn = rng.normal(0, 3.2, (ph, pw, 1)); fib = np.asarray(Image.fromarray((rng.normal(0, 14, (ph // 3, pw // 3)).clip(-40, 40) + 128).astype('uint8')).resize((pw, ph), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)[..., None] - 128
pa = np.zeros((ph, pw, 4), np.float32); pa[..., :3] = np.array([246, 241, 228]) + pn + fib * 0.08; pa[..., 3] = 255
gy = np.linspace(0, 1, ph)[:, None, None]; pa[..., :3] -= 7 * (1 - gy) ** 6                               # slight shade near the top edge
paper = Image.fromarray(pa.clip(0, 255).astype('uint8'), 'RGBA')
shadow = Image.new('RGBA', bg.size, (0, 0, 0, 0)); shadow.paste((0, 0, 0, 170), (PX0 + 9, PY0 + 14, PX1 + 9, PY1 + 14)); shadow = shadow.filter(ImageFilter.GaussianBlur(16))
base = Image.alpha_composite(bg, shadow); base.alpha_composite(paper, (PX0, PY0)); base = base.convert('RGB')
# frames -----------------------------------------------------------------------------------------------------------------------------------------
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (W, H), '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', OUT], stdin=subprocess.PIPE)
canvas = base.copy(); cd = ImageDraw.Draw(canvas); placed = 0
for f in range(NF):
    t = f / FPS
    while placed < len(items) and items[placed]['t'] <= t:
        it = items[placed]; placed += 1
        if it['ch'] == ' ': continue
        g = random.randint(24, 62); dy = random.choice([-1, 0, 0, 1]); dx = random.choice([-1, 0, 0, 0, 1])
        cd.text((it['x'] + dx, it['y'] + dy), it['ch'], font=font, fill=(g, g - 2, g - 4))
    frame = canvas
    if int(t * 2.2) % 2 == 0 or placed < len(items):                                                        # a blinking caret at the typing position
        pos = items[placed - 1] if placed else None
        cx, cy = (pos['x'] + ADV, pos['y']) if pos and not pos['last'] else ((LM, TM + (pos['li'] + 1) * PITCH) if pos else (LM, TM))
        frame = canvas.copy(); ImageDraw.Draw(frame).rectangle([cx + 2, cy + 6, cx + ADV * 0.7, cy + SIZE * 1.05], fill=(60, 58, 56))
    ff.stdin.write(frame.tobytes())
ff.stdin.close(); ff.wait()
# typewriter sounds: key clicks (low thump + short noise burst), spacebar softer, bell at each line end, carriage slide --------------------------------
SR = 48000; aud = np.zeros(int(TOT * SR) + SR, dtype=np.float32); r2 = np.random.default_rng(5)
def add(sig, t0): i0 = int(t0 * SR); aud[i0:i0 + len(sig)] += sig[:len(aud) - i0]
for it in items:
    if it['ch'] == ' ': n = int(0.03 * SR); s = np.exp(-np.arange(n) / (0.006 * SR)) * r2.normal(0, 1, n) * 0.18; add(s.astype(np.float32), it['t']); continue
    n = int(0.06 * SR); k = np.arange(n); noise = r2.normal(0, 1, n) * np.exp(-k / (0.004 * SR)); thump = np.sin(2 * math.pi * 120 * k / SR) * np.exp(-k / (0.012 * SR))
    add((0.42 * np.convolve(noise, np.ones(4) / 4, mode='same') + 0.5 * thump).astype(np.float32) * r2.uniform(0.7, 1.0), it['t'])
for it in items:
    if it['last'] and it['li'] < len(lines) - 1:
        n = int(0.9 * SR); k = np.arange(n); bell = (np.sin(2 * math.pi * 2350 * k / SR) + 0.4 * np.sin(2 * math.pi * 4710 * k / SR)) * np.exp(-k / (0.22 * SR)); add((0.16 * bell).astype(np.float32), it['t'] + 0.03)
        m = int(0.18 * SR); sl = np.convolve(r2.normal(0, 1, m), np.ones(40) / 40, mode='same') * np.hanning(m) * 0.35; add(sl.astype(np.float32), it['t'] + 0.2)
w = wave.open(TICKS, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((aud.clip(-1, 1) * 32767).astype('<i2').tobytes()); w.close()
print('§TYPED done frames=%d dur=%.2f first=%.2f last=%.2f speech=%.2f' % (NF, TOT, items[0]['t'], items[-1]['t'], speech))
