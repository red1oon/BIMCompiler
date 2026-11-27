#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — film 6 PROMO (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 6 PROMO SPEC: "VS Code fills the frame"): §VSC_SHARE measured on the ENCODED FILE, not on the plan. 2 frames per second are sampled; a frame counts as "the top area is the real VS Code window" when, in the band y=60..820 (full width),
# at least 30% of the pixels (the cover has its title panel laid over the window, about 40% of the band) are VS Code Default Dark Modern's own backgrounds (editor #1F1F1F, side bar / activity bar / panel / status bar #181818), within a sum of 9 per pixel. The last card (#0b0f17 ground) and any text-only card fail that test. The share must be >= 80%.
# It can say NO: run on a film with no VS Code in it (film 5, text and file cards) it prints FAIL with a share near 0. Usage: python3 vsccheck.py <film.mp4> [min_share_percent=80]. Prints §VSC_SHARE_VIDEO and a verdict. READ the log.
import subprocess, sys, os, tempfile, glob
from PIL import Image
import numpy as np
mp4 = sys.argv[1]; need = float(sys.argv[2]) if len(sys.argv) > 2 else 80.0
BG = [np.array([31, 31, 31]), np.array([24, 24, 24])]
n = 0; yes = 0; no = []
with tempfile.TemporaryDirectory() as td:
    subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, '-vf', 'fps=2', os.path.join(td, 'f%05d.png')], check=True)
    for i, f in enumerate(sorted(glob.glob(os.path.join(td, 'f*.png')))):
        im = np.asarray(Image.open(f).convert('RGB')).astype(int)[60:820, :, :]; n += 1
        near = np.zeros(im.shape[:2], dtype=bool)
        for c in BG: near |= (np.abs(im - c).sum(axis=2) <= 9)
        share = float(near.mean())
        if share >= 0.30: yes += 1
        else: no.append('%.1fs(%.0f%%)' % (i / 2.0, 100 * share))
pct = 100.0 * yes / n if n else 0.0
print('§VSC_SHARE_VIDEO frames=%d vscode_frames=%d share=%.1f%% need>=%.0f%% not_vscode_at=%s' % (n, yes, pct, need, ' '.join(no[:12]) + (' ...' if len(no) > 12 else '')))
print('§VSC_SHARE_VIDEO_VERDICT %s' % ('INCONCLUSIVE no frame sampled' if not n else ('PASS' if pct >= need else 'FAIL')))
sys.exit(0 if n and pct >= need else 1)
