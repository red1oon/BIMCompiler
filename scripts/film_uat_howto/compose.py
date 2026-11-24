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
FAST_IDLE_WINS = bool(getattr(P, 'FAST_IDLE_WINS', False))
IDLE_X, IDLE_KEEP = float(getattr(P, 'IDLE_X', 8.0)), float(getattr(P, 'IDLE_KEEP', 0.8))   # §5.17: a wait's speed and the real time kept at each end, per plan (Parts I and II: x8, 0.8 s)
def font(b, s): return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if b else ''), s)
mode, TAKE, WORK = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(WORK, exist_ok=True)
GUIDE = open(os.path.join(REPO, 'docs', 'CapexUATGuide.md'), encoding='utf-8').read()
for sc in P.SCENES:   # R: the strip is the guide's own words
    ok = sc['strip'] in GUIDE; log('§COMP_STRIP %s %s "%s"' % (sc['id'], 'FOUND' if ok else 'NOT-IN-GUIDE', sc['strip']))
    if not ok: sys.exit(3)
# §5.29 (owner 2026-11-24: the film reads the DOWNLOADED PDF, not the online page): every strip but s1's (s1 is the online page where the PDF is downloaded) must also be in the PDF the take saved (FILM_GUIDE_PDF).
# pdftotext puts a table's cells in one stream, so a strip's words are looked for IN ORDER inside a window after its first three words, not as one unbroken phrase.
def strip_in_pdf(strip, txt):
    w = re.sub(r'\s+', ' ', strip.replace('**', '').replace('`', '')).strip().split(' '); head = ' '.join(w[:3]); start = 0
    while True:
        i = txt.find(head, start)
        if i < 0: return False
        seg = txt[i:i + len(' '.join(w)) * 4 + 200]; pos = 0; ok = True
        for x in w:
            j = seg.find(x, pos)
            if j < 0: ok = False; break
            pos = j + len(x)
        if ok: return True
        start = i + 1
if os.environ.get('FILM_GUIDE_PDF'):
    PDFTXT = re.sub(r'\s+', ' ', subprocess.run(['pdftotext', os.environ['FILM_GUIDE_PDF'], '-'], capture_output=True, text=True).stdout); bad = []
    for sc in P.SCENES:
        if sc['id'] == 's1': continue
        ok = strip_in_pdf(sc['strip'], PDFTXT); log('§COMP_STRIP_PDF %s %s' % (sc['id'], 'FOUND' if ok else 'NOT-IN-PDF')); (not ok) and bad.append(sc['id'])
    log('§COMP_STRIP_PDF_VERDICT %s pdf=%s' % ('PASS' if not bad else 'FAIL ' + ','.join(bad), os.environ['FILM_GUIDE_PDF']))
    if bad: sys.exit(3)
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
FIT_BAD = []
def fit_font(d, txt, f, room, floor):   # §5.18 L7: the largest size <= f's that fits `room` px; None if not even `floor` fits
    size = f.size
    while size > floor and d.textlength(txt, font=ImageFont.truetype(f.path, size)) > room: size -= 2
    g = ImageFont.truetype(f.path, size); return g if d.textlength(txt, font=g) <= room else None
def mkcard(lines):
    im = Image.new('RGB', (W, H), (11, 15, 23)); d = ImageDraw.Draw(im); y = 360
    for txt, f, col in lines:
        g = fit_font(d, txt, f, W - 160, int(f.size * 0.4))
        if g is None: FIT_BAD.append('card:' + txt[:40]); g = f
        w = d.textlength(txt, font=g); log('§COMP_FIT card size=%d->%d w=%.0f room=%d "%s"' % (f.size, g.size, w, W - 160, txt[:50]))
        d.text(((W - w) / 2, y), txt, font=g, fill=col); y += g.size + 36
    return im
logo = Image.open(os.path.expanduser('~/Pictures/SYSNOVALogo.png')).convert('RGBA')
title = mkcard([(P.TITLE['kicker'], font(True, 34), CORAL), (P.TITLE['line1'], font(True, 120), INK), (P.TITLE['line2'], font(True, 72), CORAL), (P.TITLE['note'], font(False, 40), INK)])
plate = Image.new('RGB', (logo.width + 40, logo.height + 30), (255, 255, 255)); plate.paste(logo, (20, 15), logo); title.paste(plate, ((W - plate.width) // 2, 880))
ImageDraw.Draw(title).text(((W - ImageDraw.Draw(title).textlength('Sponsored by', font=font(False, 28))) / 2, 836), 'Sponsored by', font=font(False, 28), fill=(170, 170, 170))
card(title, 3.6)
EVS, PTS, tsv_rows, sounds, beat_out = {}, {}, [], [], {}
def mkpara(oc):   # §5.32: the guide's opening note on a card: a kicker, the note's words wrapped, the Settings path on a line of its own
    im = Image.new('RGB', (W, H), (11, 15, 23)); d = ImageDraw.Draw(im); y = 250; d.text((120, y), oc['kicker'], font=font(True, 34), fill=CORAL); y += 80; f = font(False, 46); room = W - 240
    for para in oc['paras']:
        line = ''
        for wd in para.split(' '):
            if d.textlength((line + ' ' + wd).strip(), font=f) > room: d.text((120, y), line, font=f, fill=INK); y += 66; line = wd
            else: line = (line + ' ' + wd).strip()
        d.text((120, y), line, font=f, fill=INK); y += 66 + 34
    g = fit_font(d, oc['path'], font(True, 60), room, 30) or font(True, 40); d.text((120, y + 20), oc['path'], font=g, fill=CORAL); return im
OC = getattr(P, 'OPEN_CARD', None)   # a card after the title carrying its own spoken line (OC['beat'] = (id, text)); it lasts as long as the line needs
if OC:
    bid_, text_ = OC['beat']; t0_ = T; dur_ = max(OC.get('min', 6.0), VD[bid_] + 1.4); card(mkpara(OC), dur_); beat_out[bid_] = (t0_ + 0.5, text_)
    log('§COMP_CARD_NOTE at %.2fs for %.2fs: %s | %s' % (t0_, dur_, ' // '.join(OC['paras']), OC['path']))
for sc in P.SCENES:
    sc['beats'] = [b for b in sc['beats'] if b[1] != 'card0']   # the card's own line is placed above, not on a scene's cue
    if sc.get('card'):   # §5.23: a silent chapter card before this scene (plain dark, no voice)
        _cl = sc['card']; card(mkcard([(_cl[0], font(True, 34), CORAL)] + [(t, font(True, 72 if i == 0 else 48), INK if i == 0 else CORAL) for i, t in enumerate(_cl[1:])]), 3.6); log('§COMP_CARD %s at %.2fs "%s"' % (sc['id'], T - 3.6, ' / '.join(_cl)))
    sid = sc['id']; ev = json.load(open(os.path.join(TAKE, sid + '.events.json'))); EVS[sid] = ev; PTS[sid] = pts_of(os.path.join(TAKE, sid + '.mkv'))
    cue = {c['name']: c['t'] for c in ev['cues']}
    for c in ev['clicks']:   # §5.15: a beat may also hang on a logged click ('click:<label>', its first press): a long stretch with one cue gets a second line without a re-take
        if c.get('label') and ('click:' + c['label']) not in cue: cue['click:' + c['label']] = c['t']
    for b in sc['beats']:   # §5.16 (4): 'at:<a>|<b>|<f>' = a point between two logged events, for a wait with no event inside it (places a line only; the picture is unchanged)
        if b[1].startswith('at:'):
            ca, cb, f = b[1][3:].split('|'); f = float(f)
            if ca not in cue or cb not in cue or not 0 < f < 1 or cue[cb] <= cue[ca]: sys.exit('§COMP_REFUSED %s %s: unknown event, or f outside (0, 1), or b not after a' % (sid, b[1]))
            cue[b[1]] = cue[ca] + f * (cue[cb] - cue[ca]); log('§COMP_AT %s %s t=+%.1fs' % (sid, b[0], cue[b[1]] - cue[sc['span'][0]]))
    a0, a1 = cue[sc['span'][0]], cue[sc['span'][1]]
    # typing first: the strip types over a hold of the scene's first frame (house style: typing, then the action)
    txt = strip_text(sc); strip_t0 = T
    if txt == globals().get('_prev_strip'):   # §5.18: the same words as the scene before (a repeat): shown whole, not typed again (a 42-fold re-typing was ~100 s of the film)
        sc['_strip'] = (strip_t0 - len(txt) / 30.0 - 1.0, txt); log('§COMP_STRIP_SAME %s not retyped' % sid)
    else:
        ty = len(txt) / 30.0 + 0.7
        for i in range(len(txt)): sounds.append(dict(t=T + 0.25 + i / 30.0, k='k'))
        add('hold', sid, a0, ty); sc['_strip'] = (strip_t0, txt)
    _prev_strip = txt
    # cut points: each beat's cue; after a beat's span, hold if its line needs more room
    cuts = sorted(set([a0] + [cue[b[1]] for b in sc['beats'] if cue[b[1]] > a0] + [a1]))
    fast = [(f['t0'], f['t1'], 3.0) for f in ev['fast'] if 't1' in f]
    # §5.11: idle spans (no move, click, key or wheel notch for > 2 s) play at IDLE_X (x8), IDLE_KEEP (0.8 s) kept real time at each end (§5.17: per plan); a declared fast span (x3) wins where they overlap
    acts = sorted([(m['t0'], m['t1']) for m in ev['moves']] + [(c['t'], c['t'] + 0.3) for c in ev['clicks']] + [(k['t'], k['t'] + 0.12) for k in ev['keys'] if k['k'] != 'w'])   # a wheel notch is travel, not an action: a scroll > 2 s is sped like a wait
    s_, gaps = a0, []
    for x0, x1 in acts:
        if x0 > s_: gaps.append((s_, x0))
        s_ = max(s_, x1)
    gaps.append((s_, a1)); idle = []
    for g0, g1 in gaps:
        g0, g1 = max(g0, a0) + IDLE_KEEP, min(g1, a1) - IDLE_KEEP
        if g1 - g0 <= 2.0 - 1.6: continue
        for f0, f1, _ in ([] if FAST_IDLE_WINS else fast):   # clip out the declared spans (§5.30: unless the plan lets the idle speed win inside them)
            if f1 <= g0 or f0 >= g1: continue
            if f0 > g0: idle.append((g0, f0, IDLE_X))
            g0 = max(g0, f1)
        if g1 > g0: idle.append((g0, g1, IDLE_X))
    idle = [x for x in idle if x[1] - x[0] > 0.4]
    log('§COMP_IDLE %s spans=%d src_s=%.2f out_s=%.2f' % (sid, len(idle), sum(b - a for a, b, _ in idle), sum((b - a) / IDLE_X for a, b, _ in idle)))
    if FAST_IDLE_WINS:   # §5.30 (owner: the PDF reopen is "speed up"): inside a declared span the waits play at the idle speed (x16), only the rest at the declared x3
        nf = []
        for f0, f1, v in fast:
            cur = f0
            for i0, i1, _ in sorted(idle):
                if i1 <= cur or i0 >= f1: continue
                if i0 > cur: nf.append((cur, i0, v))
                cur = max(cur, i1)
            if f1 > cur: nf.append((cur, f1, v))
        fast = nf
    fast = sorted(fast + idle)
    if sc.get('speed'):   # §5.16 a repeat scene plays whole at its speed, badged; its keys and clicks make no sound (a x8 rattle is noise, not information)
        # §5.18: its WAITS play at the faster of the scene's speed and IDLE_X (a sped scene used to play its waits slower than a normal one did)
        sp, segs, s_ = float(sc['speed']), [], a0
        for f0, f1, fs in sorted(idle):
            f0, f1 = max(f0, a0), min(f1, a1)
            if f1 <= s_: continue
            if f0 > s_: segs.append((s_, f0, sp))
            segs.append((max(f0, s_), f1, max(sp, fs))); s_ = f1
        if s_ < a1: segs.append((s_, a1, sp))
        fast = segs; log('§COMP_SPEED %s x%d src_s=%.2f out_s=%.2f waits=%d' % (sid, sc['speed'], a1 - a0, sum((b - a) / v for a, b, v in segs), sum(1 for a, b, v in segs if v > sp)))
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
    for kk in ([] if sc.get('speed') else ev['keys']):
        if a0 <= kk['t'] <= a1 and kk['k'] in ('k', 'r'): sounds.append(dict(src=sid, ts=kk['t'], k=kk['k']))
    for cl in ([] if sc.get('speed') else ev['clicks']):
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
STRIP_FIT = {}
def fit_strips():   # §5.18 L7: each strip at 38 pt, else the largest size >= 26 that fits, else two lines at 26
    d = ImageDraw.Draw(Image.new('RGB', (10, 10))); base = font(False, 38)
    for sc in P.SCENES:
        txt = strip_text(sc); cw = d.textlength(sc['chip'], font=font(True, 30)) + 36; room = W - (40 + cw + 30) - 40
        g = fit_font(d, txt, base, room, 26)
        if g is not None: STRIP_FIT[txt] = (g, None); log('§COMP_FIT strip %s size=%d w=%.0f room=%.0f' % (sc['id'], g.size, d.textlength(txt, font=g), room)); continue
        g = font(False, 26); cut = None   # a break after a space, or inside an address after '&', '?' or '/' (the l0 strip is one long URL)
        for k in sorted((i for i in range(1, len(txt)) if txt[i - 1] in ' &?/'), reverse=True):
            if d.textlength(txt[:k].rstrip(), font=g) <= room and d.textlength(txt[k:].lstrip(), font=g) <= room: cut = k; break
        if cut is None: FIT_BAD.append('strip:' + sc['id']); STRIP_FIT[txt] = (g, None); log('§COMP_FIT strip %s FAIL no two-line fit at 26' % sc['id']); continue
        STRIP_FIT[txt] = (g, cut); log('§COMP_FIT strip %s size=26 wrapped at %d room=%.0f' % (sc['id'], cut, room))
fit_strips()
if FIT_BAD: sys.exit('§COMP_REFUSED text does not fit the frame: ' + ', '.join(FIT_BAD))
def strip_img(sc_strip, chars, cursor):
    im = Image.new('RGB', (W, TOP), BG); d = ImageDraw.Draw(im); chip, txt = sc_strip
    f = font(True, 30); cw = d.textlength(chip, font=f) + 36; d.rounded_rectangle([40, 30, 40 + cw, 76], radius=10, fill=CORAL); d.text((58, 36), chip, font=f, fill=(255, 255, 255))
    f2, x = STRIP_FIT.get(txt, (font(False, 38), None)), 40 + cw + 30
    if f2[1] is None: d.text((x, 34), txt[:chars] + ('▍' if cursor else ''), font=f2[0], fill=INK)
    else:   # wrapped at f2[1] (§5.18 L7): two lines, typed in order
        a = txt[:f2[1]]; shown = txt[:chars]
        d.text((x, 22), shown[:len(a)] + ('▍' if cursor and chars <= len(a) else ''), font=f2[0], fill=INK)
        if chars > len(a): d.text((x, 22 + f2[0].size + 6), shown[len(a):].lstrip() + ('▍' if cursor else ''), font=f2[0], fill=INK)
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
# §5.18 L6: the camera path for every frame, computed (and measured) before any frame is drawn; CAMERA is the plan's ('old' = up to rc4, 'smooth' = §5.18)
import camera
CAMERA = getattr(P, 'CAMERA', 'old'); _F = camera.frames(pieces, NF, FPS, TOTAL); FLAT = getattr(P, 'CAMERA_FLAT', {}); CAM = camera.path(CAMERA, _F, EVS, pointer_at, FPS, W, BH, H, FLAT)
_mo = camera.measure(camera.path('old', _F, EVS, pointer_at, FPS, W, BH, H), _F, W, BH, H) if CAMERA != 'old' else None; _mc = camera.measure(CAM, _F, W, BH, H)
_r = lambda m: json.dumps({k: round(v, 4) if isinstance(v, float) else v for k, v in m.items()})
if _mo: log('§COMP_CAMERA_OLD ' + _r(_mo))
log('§COMP_CAMERA %s %s' % (CAMERA, _r(_mc)))
for _d in camera.DBG[:int(os.environ.get('FILM_CAM_DBG', '0'))]: log('§COMP_CAMERA_REV ' + _d)   # where the reversals are (FILM_CAM_DBG=n lines), measured on the path just computed (the smooth one)
for _d in camera.FLATDBG[:20]: log('§COMP_CAMERA_FLAT_FORCED ' + _d)
_fr = camera.flat_report(CAM, _F, FLAT, EVS) if CAMERA == 'smooth' else []   # §5.30: zoom == 1.0 throughout the PDF scenes
for sid, spans, n, zmin, zmax, v in _fr: log('§COMP_CAMERA_SCENE %s pdf_spans=%d frames=%d zoom_min=%s zoom_max=%s %s' % (sid, len(spans), n, zmin, zmax, v))
if CAMERA == 'smooth':
    _bad = [k for k, ok in (('zoom_acc_max<=0.005', _mc['zoom_acc_max'] <= 0.005), ('pan_acc_max<=10', _mc['pan_acc_max'] <= 10), ('pan_acc_p99<=5', _mc['pan_acc_p99'] <= 5), ('cut_zoom_pops=0', _mc['cut_zoom_pops'] == 0), ('zoom_reversals=0', _mc['zoom_reversals'] == 0), ('pan_reversals=0', _mc['pan_reversals'] == 0)) if not ok] + ['pdf_scene_zoom=1.0:' + r[0] for r in _fr if r[5] != 'PASS']
    _inc = [k for k in ('zoom_reversals', 'pan_reversals') if _mo is not None and _mo[k] == 0]   # a bar the OLD path also meets proves nothing on this film: INCONCLUSIVE, not PASS (§5.29 b)
    log('§COMP_CAMERA_VERDICT %s %s%s' % ('FAIL' if _bad else 'PASS', ','.join(_bad) or 'all bars met', ('; INCONCLUSIVE (the old path reads 0 too, the measure is vacuous here): ' + ','.join(_inc)) if _inc else ''))
    if _bad: sys.exit('§COMP_REFUSED the camera path breaks its bars: ' + ','.join(_bad))
rings = []
scene_of = {sc['id']: sc for sc in P.SCENES}
# §5.18 L9: the piece of every frame, looked up once; a scene's decoder is closed after its LAST frame (52 left open = 19 GB, the rc5 low-memory kill)
PF = [next(q for q in pieces if q['t_out'] <= n / FPS < q['t_out'] + q['dur'] + 1e-9) if n / FPS < TOTAL else pieces[-1] for n in range(NF)]
LAST = {q['scene']: n for n, q in enumerate(PF) if q['kind'] != 'card'}; _dec_opened = set(); _dec_closed = 0; _dec_max = 0
for n in range(NF):
    t = n / FPS; p = PF[n]
    if p['kind'] == 'card': frame = p['img']; enc.stdin.write(frame.tobytes()); continue
    sid = p['scene']; ev = EVS[sid]; ts = p['a'] if p['kind'] == 'hold' else p['a'] + (t - p['t_out']) * p['speed']
    scr = frame_at(sid, ts); zs, cxs, cys = CAM[n]
    cw, ch = W / zs, BH / zs; x0 = min(max(cxs - cw / 2, 0), W - cw); y0 = min(max(cys - ch / 2, 0), H - ch)
    if CAMERA == 'smooth': view = scr.resize((W, BH), Image.LANCZOS, box=(x0, y0, x0 + cw, y0 + ch))   # §5.18 L6: sub-pixel crop (a whole-pixel crop shimmers in a slow zoomed pan)
    else: view = scr.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, BH), Image.LANCZOS)
    out = Image.new('RGB', (W, H), BG); sc = scene_of[sid]; st0, txt = sc['_strip']; chars = min(len(txt), max(0, int((t - st0 - 0.25) * 30)))
    out.paste(strip_img((sc['chip'], txt), chars, chars < len(txt) and int(t * 2) % 2 == 0), (0, 0)); out.paste(view, (0, TOP))
    d = ImageDraw.Draw(out)
    for c in ev['clicks']:   # a ring at each real click, 0.5 s
        if p['kind'] == 'play' and 0 <= ts - c['t'] <= 0.5 * p['speed']:
            r = 12 + (ts - c['t']) / (0.5 * p['speed']) * 34; ox = (c['x'] - x0) * zs; oy = (c['y'] - y0) * zs + TOP
            d.ellipse([ox - r, oy - r, ox + r, oy + r], outline=CORAL, width=5)
    if p['kind'] == 'play' and p['speed'] > 1: d.rounded_rectangle([W - 170, TOP + 20, W - 30, TOP + 74], radius=10, fill=(0, 0, 0)); d.text((W - 150, TOP + 28), '>> x%d' % p['speed'], font=font(True, 32), fill=SKY)
    enc.stdin.write(out.tobytes())
    _dec_opened.update(dec.keys()); _dec_max = max(_dec_max, len(dec))
    if LAST.get(sid) == n and sid in dec:   # §5.18 L9: this scene is not drawn again
        d0 = dec.pop(sid); cur.pop(sid, None); d0.kill(); d0.stdout.close(); d0.wait(); _dec_closed += 1
    if n % 300 == 0: log('§COMP_FRAME %d/%d t=%.1f scene=%s zoom=%.2f' % (n, NF, t, sid, zs))
enc.stdin.close(); enc.wait()
log('§COMP_DECODERS opened=%d closed=%d max_open=%d still_open=%d' % (len(_dec_opened), _dec_closed, _dec_max, len(dec)))
log('§COMP_DONE frames=%d film_s=%.2f -> %s' % (NF, TOTAL, os.path.join(WORK, 'silent.mp4')))
