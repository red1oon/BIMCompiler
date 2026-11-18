#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — film 4 v4 (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4, defects found/fixed: "a leftover top bar obscured the last cards", owner watching v4): check S on the ENCODED FILE, not on the cards.
# The full-screen cards (cover, recap, close) carry no progress strip. In their time windows NO sampled frame (2 per second) may contain the strip's signature ANYWHERE: a full-width band whose pixels are the strip's own colours (#0b1220 ground, #e2e8f0 lit cell). v4's first cut had the strip shifted down by the card's margin-collapse (y=50 on the close card, y=250 on the cover), so a check of only the top 30 rows passed it blind: the red-run on the owner's file proved that.
# Usage: python3 stripcheck.py <film.mp4> <from:to,from:to,...>      (build.sh passes the windows from out/record.log)   Prints §STRIP_VIDEO and §STRIP_VIDEO_VERDICT. READ the log.
import subprocess, sys, os, tempfile, glob
from PIL import Image
import numpy as np
mp4, wins = sys.argv[1], [tuple(map(float, w.split(':'))) for w in sys.argv[2].split(',')]
STRIP = [np.array([11, 18, 32]), np.array([226, 232, 240])]   # the strip's ground and its lit cell (cards.js CSS)
bad = 0; n = 0; where = []
for a, b in wins:
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(a), '-to', str(b), '-i', mp4, '-vf', 'fps=2', os.path.join(td, 'f%04d.png')], check=True)
        for f in sorted(glob.glob(os.path.join(td, 'f*.png'))):
            im = np.asarray(Image.open(f).convert('RGB')).astype(int); n += 1
            near = np.zeros(im.shape[:2], dtype=bool)
            for c in STRIP: near |= (np.abs(im - c).sum(axis=2) <= 9)
            rows = np.nonzero(near.mean(axis=1) >= 0.6)[0]   # rows that are >= 60% strip-coloured
            if len(rows) >= 10: bad += 1; where.append(os.path.basename(f) + '@' + str(a) + ' strip_rows=' + str(int(rows.min())) + '..' + str(int(rows.max())))
print('§STRIP_VIDEO windows=%s frames=%d bar_frames=%d %s' % (sys.argv[2], n, bad, ' '.join(where[:3])))
print('§STRIP_VIDEO_VERDICT %s' % ('INCONCLUSIVE no frame sampled' if not n else ('PASS' if not bad else 'FAIL'))); sys.exit(0 if n and not bad else 1)
