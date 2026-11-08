#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: numbers read from the FINISHED FILE (not from the plan): for every beat, one frame from the final mp4 near the end of the beat is decoded and measured:
#   - the page is not blank (share of pixels away from the ground colour),
#   - ground #080A0E + panel #1A1A19 make up >= 85 % of the page area (y < 930) with ground >= 20 %, and the caption band (y >= 930) is ground-coloured around its captions,
#   - chapter/title cards: the 8 px cyan rule at x=96..103 is present (>= 200 px of #4FC3F7 within +-8), white title pixels and yellow (#FFEB3B) sub-text pixels are present,
#   - palette presence over all sampled frames (each palette colour within +-6 per channel), and the share of frames' pixels that are close to NO palette colour is reported (anti-aliasing, grid lines, the 90 % panel edges).
# Controls: a planted blank frame and a planted red frame must be flagged. Read the log: §FRAME_*.
# usage: film5_frames_check.py <final.mp4> <plan.json> <palette.json>
import sys, json, subprocess, io
import numpy as np
from PIL import Image
V, PLAN, PAL = sys.argv[1:4]
plan = json.load(open(PLAN)); pal = json.load(open(PAL))['colours']
rgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
P = {k: rgb(v['hex']) for k, v in pal.items()}
GROUND, CY, YE, WH = P['ground'], P['cyan'], P['yellow'], (255, 255, 255)
def frame(t):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', V, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True)
    return np.asarray(Image.open(io.BytesIO(r.stdout)).convert('RGB')).astype(int)
def near(a, c, tol): return (abs(a[:, :, 0] - c[0]) <= tol) & (abs(a[:, :, 1] - c[1]) <= tol) & (abs(a[:, :, 2] - c[2]) <= tol)
def measure(a):
    top = a[:930]; band = a[930:]
    g_top = near(top, GROUND, 14).mean(); dark_top = (near(top, GROUND, 14) | near(top, P['panel'], 14)).mean()
    # within 14: JPEG/H.264 noise; the grid lines (#1A1A19 at .9) are near ground too
    blank = 1 - g_top
    rule = int(near(a[80:700, 90:110], CY, 10).sum())      # film6: the cards sit at y=84.. (film5: 330..)
    white = int(near(top, WH, 8).sum()); yellow = int(near(top, YE, 12).sum()); cyan = int(near(top, CY, 10).sum())
    gb = near(band, GROUND, 14).mean()
    return dict(dark_share_page=dark_top, ground_share_page=g_top, not_ground_share=blank, rule_px=rule, white_px=white, yellow_px=yellow, cyan_px=cyan, ground_share_band=gb)
rows = []; bad = 0
cards = [b for b in plan['beats'] if b.get('vis', {}).get('k') == 'card']    # film6: card beats = vis.k == 'card' (a 'seq' beat starts with its card: checked at start+1.2 s too)
seqs = [b for b in plan['beats'] if b.get('vis', {}).get('k') == 'seq']
tot = {k: 0 for k in P}; allpx = 0; offpal = 0
for b in plan['beats']:
    t = b['end'] - 0.6 if (b['end'] - b['start']) > 1.2 else (b['start'] + b['end']) / 2
    a = frame(t); m = measure(a); ok = True; why = []
    if m['not_ground_share'] < 0.01: ok = False; why.append('page nearly blank')
    real = b.get('vis', {}).get('k') == 'shots'                                              # film6: a real-page frame of the live site is NOT in the card palette: only 'not blank' and the caption band are judged for it
    if not real and (m['dark_share_page'] < 0.85 or m['ground_share_page'] < 0.2): ok = False; why.append('ground + panel colours do not make up the page')
    if m['ground_share_band'] < 0.9: ok = False; why.append('caption band not ground-coloured')
    if b in cards:
        cid = b['vis']['c']; need_y = 0 if cid in ('earlier', 'ch5', 'offer') else 500; need_rule = 0 if cid == 'offer' else 200; need_w = 1000 if cid == 'earlier' else 3000
        t2 = b['start'] + 1.2
        a2 = frame(min(t2, b['end'] - 0.7)); m2 = measure(a2)
        if m2['rule_px'] < need_rule: ok = False; why.append(f"cyan rule missing ({m2['rule_px']} px)")
        if m2['white_px'] < need_w: ok = False; why.append(f"white title missing ({m2['white_px']} px)")
        if m2['yellow_px'] < need_y: ok = False; why.append(f"yellow sub-text missing ({m2['yellow_px']} px)")
        m['card'] = {k: m2[k] for k in ('rule_px', 'white_px', 'yellow_px')}
    if b in seqs:
        a3 = frame(b['start'] + 1.2); m3 = measure(a3)
        if m3['rule_px'] < 200 or m3['white_px'] < 3000: ok = False; why.append(f"seq beat: its chapter card is not on screen at start+1.2 s (rule {m3['rule_px']} px, white {m3['white_px']} px)")
    for k, c in P.items(): tot[k] += int(near(a, c, 6).sum())
    allpx += a.shape[0] * a.shape[1]
    near_any = np.zeros(a.shape[:2], bool)
    for c in list(P.values()) + [WH]: near_any |= near(a, c, 40)
    offpal += int((~near_any).sum())
    bad += 0 if ok else 1
    print(f"§FRAME beat={b['id']} t={t:.2f} not_ground={m['not_ground_share']:.3f} ground_page={m['ground_share_page']:.3f} ground+panel={m['dark_share_page']:.3f} band_ground={m['ground_share_band']:.3f} white={m['white_px']} cyan={m['cyan_px']} yellow={m['yellow_px']}" + (f" card_rule={m['card']['rule_px']} card_white={m['card']['white_px']} card_yellow={m['card']['yellow_px']}" if 'card' in m else '') + f" {'OK' if ok else 'WRONG ' + '; '.join(why)}")
print(f"§FRAME_DONE beats={len(plan['beats'])} flagged={bad} {'PASS' if bad == 0 else 'FAIL'}")
print('§FRAME_PALETTE px_within_6_of_each_palette_colour_over_all_sampled_frames: ' + ', '.join(f"{k} {pal[k]['hex']}={v:,}" for k, v in tot.items()))
print(f"§FRAME_PALETTE share_of_pixels_further_than_40_per_channel_from_every_palette_colour={offpal / allpx:.4f} (anti-aliased text edges, panels' 90 % grid, JPEG/H.264 noise)")
# controls
blank = np.full((1080, 1920, 3), GROUND); red = np.full((1080, 1920, 3), (250, 0, 0))
mb, mr = measure(blank), measure(red)
c1 = mb['not_ground_share'] < 0.01; c2 = mr['dark_share_page'] < 0.85
print(f"§FRAME_CONTROL a planted blank frame is seen as blank: {'yes' if c1 else 'NO'}; a planted red frame is seen as not-ground: {'yes' if c2 else 'NO'} {'PASS' if c1 and c2 else 'FAIL'}")
sys.exit(1 if bad or not (c1 and c2) else 0)
