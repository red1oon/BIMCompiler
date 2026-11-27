# ⚠ DO NOT REMOVE — DXF2BIM film, sync witness + re-cue (no re-record). Read its output.
# usage: film_dxf2bim_resync.py cue  <take dir> <out beats.log>   -> card beats cued at max(beat t, first frame that shows the card)
#        film_dxf2bim_resync.py check <take dir> <fit dir> <beats.log> -> clips subtitle overlaps in poly.ass, prints
#        §SYNC_OVERLAP (audio + subtitles, max must be 0) and §SYNC_LEAD (worst narration lead over its card, must be <= 0)
# Why: on the late Modeller page the screencast delivered frames ~4 s after the DOM change, so a card swap logged at beat t appears later in the
# film than t. The card beats are re-cued to the frame where the new card is visible (measured from the frames, never assumed).
import sys, re, os, subprocess
from PIL import Image, ImageChops, ImageStat
CARD_BEATS = ['c1', 'r03', 'o01', 'o02', 'o03', 'l01', 'n01', 'end']
mode, take = sys.argv[1], sys.argv[2]
def frames(take):
    L = open(os.path.join(take, 'frames.txt')).read().split('\n'); out = []; t = 0
    for i in range(0, len(L) - 2, 2):
        if L[i].startswith('file') and L[i + 1].startswith('duration'):
            out.append((t, L[i].split("'")[1])); t += float(L[i + 1].split()[1])
    return out
def beats(path): return [(m.group(1), float(m.group(2))) for m in re.finditer(r'id=(\S+) t=([\d.]+)', open(path).read())]
def onset(fs, bt, nxt):
    """first frame at/after bt-1.5 whose card title band changed (diff > 2.5), within [bt-1.5, nxt); None = no change seen"""
    band = lambda f: Image.open(f).convert('L').crop((150, 150, 1700, 600)).resize((120, 20)); prev = None
    for t, f in fs:
        if t < bt - 2 or t >= nxt: continue
        im = band(f)
        if prev is not None and t >= bt - 1.5 and ImageStat.Stat(ImageChops.difference(im, prev)).mean[0] > 2.5: return t
        prev = im
    return None
if mode == 'cue':
    fs, B = frames(take), beats(os.path.join(take, 'film.log')); out = []
    for i, (b, t) in enumerate(B):
        cue = t
        if b in CARD_BEATS and b != 'c1':
            o = onset(fs, t, B[i + 1][1] if i + 1 < len(B) else 1e9)
            if o is not None and o > t: cue = round(o + 0.05, 2)
            print(f'§SYNC_CUE id={b} beat={t:.2f} card_visible={o if o is None else round(o, 2)} cue={cue:.2f} shift={cue - t:+.2f}')
        out.append(f'§ERP_FILM_BEAT id={b} t={cue:.3f} lang=en')
    open(sys.argv[3], 'w').write('\n'.join(out) + '\n')
else:
    fit, bl = sys.argv[3], sys.argv[4]
    # audio: each plan row = one clip at its cue; clips must not overlap
    rows = [l.rstrip('\n').split('\t') for l in open(os.path.join(fit, 'poly_plan.tsv')) if l.strip()]
    dur = lambda f: float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(fit, f)], capture_output=True, text=True).stdout)
    iv = sorted((float(r[1]), float(r[1]) + dur(r[2].strip()), r[0]) for r in rows)
    ao = max([0.0] + [a[1] - b[0] for a, b in zip(iv, iv[1:])])
    # subtitles: spoken-line events (F_/M_) must not overlap; a fitter overlap (turn subtitles share ~0.13 s) is clipped: prev end = next start - 0.02
    A = os.path.join(fit, 'poly.ass'); L = open(A).read().split('\n')
    ts = lambda s: (lambda h, m, x: int(h) * 3600 + int(m) * 60 + float(x))(*s.split(':'))
    fm = lambda v: f'{int(v // 3600)}:{int(v % 3600 // 60):02d}:{v % 60:05.2f}'
    idx = [i for i, l in enumerate(L) if re.match(r'Dialogue: 0,[^,]+,[^,]+,(F|M)_', l)]
    ev = sorted(idx, key=lambda i: ts(L[i].split(',')[1])); before = 0.0; fixed = 0
    for a, b in zip(ev, ev[1:]):
        pa, pb = L[a].split(','), L[b].split(',')
        ov = ts(pa[2]) - ts(pb[1]); before = max(before, ov)
        if ov > 0: pa[2] = fm(ts(pb[1]) - 0.02); L[a] = ','.join(pa); fixed += 1
    open(A, 'w').write('\n'.join(L))
    after = max([0.0] + [ts(L[a].split(',')[2]) - ts(L[b].split(',')[1]) for a, b in zip(ev, ev[1:])])
    print(f'§SYNC_OVERLAP audio_max={ao:.3f}s subtitles_before={before:.3f}s clipped={fixed} subtitles_after={max(0.0, after):.3f}s -> ' + ('OK' if ao <= 0 and after <= 0 else 'WRONG'))
    # lead: narration of a card beat must start at/after the frame where its card is visible
    fs, B = frames(take), beats(os.path.join(take, 'film.log')); cue = {r[0]: float(r[1]) for r in rows}; worst = (-1e9, None)
    for i, (b, t) in enumerate(B):
        if b not in CARD_BEATS or b not in cue: continue
        o = t if b == 'c1' else onset(fs, t, B[i + 1][1] if i + 1 < len(B) else 1e9)
        vis = max(t, o) if o is not None else t
        lead = vis - cue[b]; print(f'§SYNC_LEAD id={b} card_visible={vis:.2f} narration={cue[b]:.2f} lead={lead:+.2f}')
        worst = max(worst, (lead, b))
    print(f'§SYNC_LEAD worst={worst[0]:+.2f}s at {worst[1]} -> ' + ('OK' if worst[0] <= 0 else 'WRONG'))
