#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — film "UAT, hands on: where to click" (prompts/FILM_UAT_GUIDE.md §5): the COMPOSER. READ THE LOG (§COMP_*); the exit code is not evidence.
# usage: compose.py tsv  <takeDir> <work>                 -> work/narration.tsv with wide windows (to MEASURE each line's voice)
#        compose.py render <takeDir> <work> <fitDir>      -> work/silent.mp4 + work/narration.tsv (real cues) + work/sounds.json (keys, clicks)
# Picture: top strip 150 px = the guide's own words for the action, typed (a key sound per character), then the REAL screen below at 1:1, easing toward each click
# (zoom from the click's measured target box), a ring at each real click, '>> x3' on a sped-up wait. A line that needs more room than its span HOLDS the frame (never trims).
import sys, os, json, re, subprocess, math
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import importlib; P = importlib.import_module(os.environ.get('FILM_PLAN', 'plan'))   # FILM_PLAN=plan2: Part II (§5.15)
FPS, W, H, TOP = 30, 1920, 1080, 150; BH = H - TOP
BG, INK, CORAL, SKY = (15, 23, 42), (243, 238, 232), (255, 107, 120), (125, 211, 252)
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
def log(m): print(m, flush=True)
def font(b, s): return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if b else ''), s)
mode, TAKE, WORK = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(WORK, exist_ok=True)
GUIDE = open(os.path.join(REPO, 'docs', 'CapexUATGuide.md'), encoding='utf-8').read()
for sc in P.SCENES:   # R: the strip is the guide's own words
    ok = sc['strip'] in GUIDE; log('§COMP_STRIP %s %s "%s"' % (sc['id'], 'FOUND' if ok else 'NOT-IN-GUIDE', sc['strip']))
    if not ok: sys.exit(3)
def strip_text(sc): return sc['strip'].replace('**', '').replace('`', '')
if mode == 'tsv':
    rows = []; t = 0
    for sc in P.SCENES:
        for bid, cue, text in sc['beats']: rows.append('\t'.join([bid, '%.2f' % t, '%.2f' % (t + 60), 'plan.py ' + sc['id'] + ' ' + cue, text, 'M: ' + text])); t += 60
    open(os.path.join(WORK, 'narration.tsv'), 'w').write('\n'.join(rows) + '\n'); log('§COMP_TSV measure rows=%d' % len(rows)); sys.exit(0)

FIT = sys.argv[4]
import soundfile as sf
vdur = {}
for l in open(os.path.join(FIT, 'm_plan.tsv')):   # measured voice per beat (fit run on the wide windows)
    i, a, f = l.rstrip('\n').split('\t'); d = sf.info(os.path.join(FIT, f)).duration; vdur[i] = d
beat_ids = [b[0] for sc in P.SCENES for b in sc['beats']]; VD = {bid: vdur[bid] for bid in beat_ids}
log('§COMP_VOICE ' + ' '.join('%s=%.2f' % (k, v) for k, v in VD.items()))

def pts_of(mkv):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'packet=pts_time', '-of', 'csv=p=0', mkv], capture_output=True, text=True).stdout
    return sorted(float(x) for x in out.split() if x.strip())
# ---- the timeline: a list of pieces, each one output frame source
pieces = []   # (kind, scene, src_t0, src_t1, speed) kind: play | hold | card
cards = []; T = 0.0
def add(kind, scene, a, b, speed=1.0, img=None):
    global T
    dur = (b - a) / speed if kind == 'play' else b
    pieces.append(dict(kind=kind, scene=scene, a=a, b=b, speed=speed, t_out=T, dur=dur, img=img)); T += dur
def card(img, sec): add('card', None, 0, sec, img=img)
def mkcard(lines):
    im = Image.new('RGB', (W, H), (11, 15, 23)); d = ImageDraw.Draw(im); y = 360
    for txt, f, col in lines:
        w = d.textlength(txt, font=f); d.text(((W - w) / 2, y), txt, font=f, fill=col); y += f.size + 36
    return im
logo = Image.open(os.path.expanduser('~/Pictures/SYSNOVALogo.png')).convert('RGBA')
title = mkcard([(P.TITLE['kicker'], font(True, 34), CORAL), (P.TITLE['line1'], font(True, 120), INK), (P.TITLE['line2'], font(True, 72), CORAL), (P.TITLE['note'], font(False, 40), INK)])
plate = Image.new('RGB', (logo.width + 40, logo.height + 30), (255, 255, 255)); plate.paste(logo, (20, 15), logo); title.paste(plate, ((W - plate.width) // 2, 880))
ImageDraw.Draw(title).text(((W - ImageDraw.Draw(title).textlength('Sponsored by', font=font(False, 28))) / 2, 836), 'Sponsored by', font=font(False, 28), fill=(170, 170, 170))
card(title, 3.6)
EVS, PTS, tsv_rows, sounds, beat_out = {}, {}, [], [], {}
for sc in P.SCENES:
    sid = sc['id']; ev = json.load(open(os.path.join(TAKE, sid + '.events.json'))); EVS[sid] = ev; PTS[sid] = pts_of(os.path.join(TAKE, sid + '.mkv'))
    cue = {c['name']: c['t'] for c in ev['cues']}
    a0, a1 = cue[sc['span'][0]], cue[sc['span'][1]]
    # typing first: the strip types over a hold of the scene's first frame (house style: typing, then the action)
    txt = strip_text(sc); ty = len(txt) / 30.0 + 0.7; strip_t0 = T
    for i in range(len(txt)): sounds.append(dict(t=T + 0.25 + i / 30.0, k='k'))
    add('hold', sid, a0, ty); sc['_strip'] = (strip_t0, txt)
    # cut points: each beat's cue; after a beat's span, hold if its line needs more room
    cuts = sorted(set([a0] + [cue[b[1]] for b in sc['beats'] if cue[b[1]] > a0] + [a1]))
    fast = [(f['t0'], f['t1'], 3.0) for f in ev['fast'] if 't1' in f]
    # §5.11: idle spans (no move, click, key or wheel notch for > 2 s) play at x8, 0.8 s kept real time at each end; a declared fast span (x3) wins where they overlap
    acts = sorted([(m['t0'], m['t1']) for m in ev['moves']] + [(c['t'], c['t'] + 0.3) for c in ev['clicks']] + [(k['t'], k['t'] + 0.12) for k in ev['keys'] if k['k'] != 'w'])   # a wheel notch is travel, not an action: a scroll > 2 s is sped like a wait
    s_, gaps = a0, []
    for x0, x1 in acts:
        if x0 > s_: gaps.append((s_, x0))
        s_ = max(s_, x1)
    gaps.append((s_, a1)); idle = []
    for g0, g1 in gaps:
        g0, g1 = max(g0, a0) + 0.8, min(g1, a1) - 0.8
        if g1 - g0 <= 2.0 - 1.6: continue
        for f0, f1, _ in fast:   # clip out the declared spans
            if f1 <= g0 or f0 >= g1: continue
            if f0 > g0: idle.append((g0, f0, 8.0))
            g0 = max(g0, f1)
        if g1 > g0: idle.append((g0, g1, 8.0))
    idle = [x for x in idle if x[1] - x[0] > 0.4]
    log('§COMP_IDLE %s spans=%d src_s=%.2f out_s=%.2f' % (sid, len(idle), sum(b - a for a, b, _ in idle), sum((b - a) / 8.0 for a, b, _ in idle)))
    fast = sorted(fast + idle)
    by_cue = {}
    for bid, cname, text in sc['beats']: by_cue.setdefault(cue[cname], []).append((bid, text))
    for k in range(len(cuts)):
        c = cuts[k]
        if c in by_cue:   # this beat speaks from here; make room until the next cut
            nxt = cuts[k + 1] if k + 1 < len(cuts) else None
            for bid, text in by_cue[c]: beat_out[bid] = (T + 0.25, text)
            need = sum(VD[b] for b, _ in by_cue[c]) + 0.6
            span = 0.0
            if nxt is not None:   # the span's own length, with its fast parts at x3
                s = c
                for f0, f1, sp in fast:
                    if f1 <= s or f0 >= nxt: continue
                    span += max(0, f0 - s) + (min(f1, nxt) - max(f0, s)) / sp; s = min(f1, nxt)
                span += max(0, nxt - s)
            if span < need: add('hold', sid, c, need - span); log('§COMP_HOLD %s %s +%.2fs (line %.2fs, span %.2fs)' % (sid, ','.join(b for b, _ in by_cue[c]), need - span, need, span))
        if k + 1 < len(cuts):
            s, e = c, cuts[k + 1]
            for f0, f1, sp in fast:
                if f1 <= s or f0 >= e: continue
                if f0 > s: add('play', sid, s, f0)
                add('play', sid, max(f0, s), min(f1, e), sp); s = min(f1, e)
            if e > s: add('play', sid, s, e)
    for kk in ev['keys']:
        if a0 <= kk['t'] <= a1 and kk['k'] in ('k', 'r'): sounds.append(dict(src=sid, ts=kk['t'], k=kk['k']))
    for cl in ev['clicks']:
        if a0 <= cl['t'] <= a1: sounds.append(dict(src=sid, ts=cl['t'], k='c', n=cl.get('n', 1)))
closing = mkcard([(P.CLOSING['line1'], font(True, 64), INK), (P.CLOSING['line2'], font(True, 96), CORAL), ('Redhuan D. OON, CTFL · Project Consultant', font(False, 40), INK), (P.CLOSING['credit'], font(False, 26), (148, 163, 184))])
closing.paste(plate, ((W - plate.width) // 2, 880)); card(closing, 5.0)
TOTAL = T; NF = int(round(TOTAL * FPS)); log('§COMP_TIMELINE pieces=%d film_s=%.2f frames=%d' % (len(pieces), TOTAL, NF))
def out_of(sid, ts):   # a source time -> its output time (inside a play piece), or None if not shown
    for p in pieces:
        if p['scene'] == sid and p['kind'] == 'play' and p['a'] <= ts <= p['b']: return p['t_out'] + (ts - p['a']) / p['speed']
    return None
for s in sounds:
    if 'src' in s: s['t'] = out_of(s['src'], s['ts'])
sounds = [s for s in sounds if s.get('t') is not None]
json.dump(sounds, open(os.path.join(WORK, 'sounds.json'), 'w'))
log('§COMP_SOUNDS keys=%d returns=%d clicks=%d' % (sum(1 for s in sounds if s['k'] == 'k'), sum(1 for s in sounds if s['k'] == 'r'), sum(1 for s in sounds if s['k'] == 'c')))
rows = []; order = [b for b in beat_ids]
for i, bid in enumerate(order):
    st, text = beat_out[bid]; en = beat_out[order[i + 1]][0] - 0.1 if i + 1 < len(order) else TOTAL - 0.2
    rows.append('\t'.join([bid, '%.2f' % st, '%.2f' % en, 'plan.py', text, 'M: ' + text]))
open(os.path.join(WORK, 'narration.tsv'), 'w').write('\n'.join(rows) + '\n'); log('§COMP_TSV build rows=%d' % len(rows))

# ---- the pointer, zoom and rings, from the events (screen pixels)
def pointer_at(ev, ts):
    last = None
    for m in ev['moves']:
        if ts < m['t0']: break
        if ts <= m['t1']:
            k = min(len(m['pts']) - 1, int((ts - m['t0']) / max(1e-6, m['t1'] - m['t0']) * len(m['pts']))); return m['pts'][k]
        last = m['to']
    return last or [960, 540]
def zoom_target(ev, ts):
    for c in ev['clicks']:
        if c['t'] - 1.0 <= ts <= c['t'] + 0.8:
            b = c.get('box'); small = b and (b[2] < 60 or b[3] < 24)
            return (1.7 if small else 1.3), (b[0] + b[2] / 2, b[1] + b[3] / 2) if b else (c['x'], c['y'])
    return 1.0, None
def strip_img(sc_strip, chars, cursor):
    im = Image.new('RGB', (W, TOP), BG); d = ImageDraw.Draw(im); chip, txt = sc_strip
    f = font(True, 30); cw = d.textlength(chip, font=f) + 36; d.rounded_rectangle([40, 30, 40 + cw, 76], radius=10, fill=CORAL); d.text((58, 36), chip, font=f, fill=(255, 255, 255))
    f2 = font(False, 38); d.text((40 + cw + 30, 34), txt[:chars] + ('▍' if cursor else ''), font=f2, fill=INK)
    d.text((40, 96), 'from the UAT Guide, as written', font=font(False, 24), fill=(148, 163, 184)); return im
# ---- render
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (W, H), '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', os.path.join(WORK, 'silent.mp4')], stdin=subprocess.PIPE)
dec = {}; cur = {}
def frame_at(sid, ts):   # decode forward only (each scene's output order is monotone)
    pts = PTS[sid]; k = max(0, min(len(pts) - 1, next((i for i in range(cur.get(sid, (0, None))[0], len(pts)) if pts[i] > ts), len(pts)) - 1))
    if sid not in dec: dec[sid] = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', os.path.join(TAKE, sid + '.mkv'), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE); cur[sid] = (-1, None)
    i, img = cur[sid]
    while i < k:
        buf = dec[sid].stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        i += 1; img = buf
    cur[sid] = (i, img); return Image.frombytes('RGB', (W, H), img) if img else Image.new('RGB', (W, H))
zs, cxs, cys, last_sid = 1.0, 960.0, 540.0, None; rings = []
scene_of = {sc['id']: sc for sc in P.SCENES}
for n in range(NF):
    t = n / FPS; p = next(q for q in pieces if q['t_out'] <= t < q['t_out'] + q['dur'] + 1e-9) if t < TOTAL else pieces[-1]
    if p['kind'] == 'card': frame = p['img']; enc.stdin.write(frame.tobytes()); continue
    sid = p['scene']; ev = EVS[sid]; ts = p['a'] if p['kind'] == 'hold' else p['a'] + (t - p['t_out']) * p['speed']
    if sid != last_sid: zs, (cxs, cys) = 1.0, pointer_at(ev, ts); last_sid = sid
    scr = frame_at(sid, ts); zt, ctr = zoom_target(ev, ts); px, py = pointer_at(ev, ts); ctr = ctr or (px, py)
    a = 1 - math.exp(-1 / FPS / 0.30); zs += (zt - zs) * a; cxs += (ctr[0] - cxs) * a; cys += (ctr[1] - cys) * a
    cw, ch = W / zs, BH / zs; x0 = min(max(cxs - cw / 2, 0), W - cw); y0 = min(max(cys - ch / 2, 0), H - ch)
    view = scr.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, BH), Image.LANCZOS)
    out = Image.new('RGB', (W, H), BG); sc = scene_of[sid]; st0, txt = sc['_strip']; chars = min(len(txt), max(0, int((t - st0 - 0.25) * 30)))
    out.paste(strip_img((sc['chip'], txt), chars, chars < len(txt) and int(t * 2) % 2 == 0), (0, 0)); out.paste(view, (0, TOP))
    d = ImageDraw.Draw(out)
    for c in ev['clicks']:   # a ring at each real click, 0.5 s
        if p['kind'] == 'play' and 0 <= ts - c['t'] <= 0.5 * p['speed']:
            r = 12 + (ts - c['t']) / (0.5 * p['speed']) * 34; ox = (c['x'] - x0) * zs; oy = (c['y'] - y0) * zs + TOP
            d.ellipse([ox - r, oy - r, ox + r, oy + r], outline=CORAL, width=5)
    if p['kind'] == 'play' and p['speed'] > 1: d.rounded_rectangle([W - 170, TOP + 20, W - 30, TOP + 74], radius=10, fill=(0, 0, 0)); d.text((W - 150, TOP + 28), '>> x%d' % p['speed'], font=font(True, 32), fill=SKY)
    enc.stdin.write(out.tobytes())
    if n % 300 == 0: log('§COMP_FRAME %d/%d t=%.1f scene=%s zoom=%.2f' % (n, NF, t, sid, zs))
enc.stdin.close(); enc.wait()
log('§COMP_DONE frames=%d film_s=%.2f -> %s' % (NF, TOTAL, os.path.join(WORK, 'silent.mp4')))
