#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope (v2, prompts/TEAMWORK_FRAMEWORK.md §16.25): measure, on the SHIPPED FRAMES (not the DOM), that every on-screen note is visible: count the pixels of the note's own background colour
# inside its card region and compare with the note box's full area. Method from the Thai cut (§16.22): v1 showed "bad" pink 3,032 px = a strip about 6 px high on the shelf card.
# usage: note_px.py <frames_dir> <notes_px.json> [--control-dir <v1 frames dir> <v1 box height>]   prints §NOTE_PX per note and §NOTE_PX_DONE; INCONCLUSIVE if a note has no pixels at all of its colour AND the DOM says it is visible (cannot judge).
import sys, os, re, json, glob, numpy as np
from PIL import Image
FR, NJ = sys.argv[1], sys.argv[2]
ctl = None
if '--control-dir' in sys.argv: i = sys.argv.index('--control-dir'); ctl = (sys.argv[i + 1], int(sys.argv[i + 2]))
notes = json.load(open(NJ))
def frame_for(d, k):
    fs = sorted(int(re.match(r'(\d+)\.jpg', os.path.basename(f)).group(1)) for f in glob.glob(os.path.join(d, '*.jpg')))
    best = max(x for x in fs if x <= k); return os.path.join(d, '%06d.jpg' % best)
def rgb(s): return tuple(int(x) for x in re.findall(r'\d+', s)[:3])
def measure(d, n, boxh=None):
    a = np.asarray(Image.open(frame_for(d, n['frame'])).convert('RGB')).astype(int)
    cx, cy, cw, ch = n['cardRect']; bx, by, bw, bh = n['box']
    if boxh: bh = boxh
    reg = a[max(cy, 0):min(cy + ch, a.shape[0]), max(cx, 0):min(cx + cw, a.shape[1])]
    m = (np.abs(reg - np.array(rgb(n['bg']))).max(axis=2) <= 10)
    # only the columns of the note box (the card's own background and border are other colours; this also guards against a coincidence elsewhere in the card)
    c0, c1 = max(bx - cx, 0), min(bx - cx + bw, reg.shape[1]); mm = m[:, c0:c1]
    rows = np.where(mm.sum(axis=1) >= 0.25 * bw)[0]                 # rows where the note colour covers at least a quarter of the box width (text takes the rest)
    return int(mm.sum()), (int(rows.max() - rows.min() + 1) if len(rows) else 0), bw * bh
def run(d, label, boxh=None):
    lo = 9; bad = []; allr = []
    for n in notes:
        px, rh, full = measure(d, n, boxh); ratio = px / full; allr.append(ratio)
        ok = ratio >= 0.5 and rh >= (boxh or n['box'][3]) - 3
        if px == 0: print(f'§NOTE_PX {label} part={n["part"]} {n["beat"]}/{n["card"]} INCONCLUSIVE no pixel of the note colour {n["bg"]} in the card'); bad.append(n); continue
        lo = min(lo, ratio)
        if not ok: bad.append(n)
        print(f'§NOTE_PX {label} part={n["part"]} {n["beat"]}/{n["card"]} frame={n["frame"]} colour_px={px} box_area={full} visible_ratio={ratio:.2f} rows_with_colour={rh}/{boxh or n["box"][3]} {"OK" if ok else "NOT-VISIBLE"}')
    return bad, min(allr), max(allr)
bad, mn, mx = run(FR, 'shipped')
print(f'§NOTE_PX_DONE shipped notes={len(notes)} not_visible={len(bad)} min_ratio={mn:.2f} max_ratio={mx:.2f} {"PASS" if not bad and notes else "FAIL"}')
if ctl:
    badc, mnc, _ = run(ctl[0], 'control_v1', ctl[1])
    print(f'§NOTE_PX_CONTROL v1 frames {ctl[0]}: notes_not_visible={len(badc)} ({", ".join(n["beat"] + "/" + n["card"] for n in badc)}) — the method sees the v1 defect: {"YES" if badc else "NO (control cannot see it)"}')
