# ⚠ DO NOT REMOVE — film "Help that answers": check C (the captions stay in the bottom 170 px). For every Dialogue cue of the ASS, the frame at its middle of the FINAL film and of the SILENT picture are
# compared in the strip y=860..905 (CAP_Y=960 = the falsifier: the caption area itself, must FAIL) (just above the caption area, where a third caption line would land): any changed pixel there = a caption over the picture. Usage: python capcheck.py <ass> <silent.mp4> <final.mp4>. READ THE LOG.
import re, subprocess, sys
import numpy as np
ass, silent, final = sys.argv[1:4]
def frame(f, t):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', '%.3f' % t, '-i', f, '-frames:v', '1', '-vf', 'crop=1920:46:0:%d' % int(__import__('os').environ.get('CAP_Y', '860')), '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.uint8).astype(np.int16)
ts = lambda h, m, s: int(h) * 3600 + int(m) * 60 + float(s)
bad = n = 0
for l in open(ass, encoding='utf8'):
    m = re.match(r'Dialogue: \d+,(\d+):(\d+):([\d.]+),(\d+):(\d+):([\d.]+),\S+,\S+,(\S+),', l)
    if not m: continue
    a, b = ts(*m.group(1, 2, 3)), ts(*m.group(4, 5, 6)); t = (a + b) / 2; n += 1
    d = np.abs(frame(final, t) - frame(silent, t)); changed = int((d > 40).sum())
    ok = changed == 0; bad += 0 if ok else 1
    print('§CAPTION %s cue=%s t=%.2f changed_px_above_caption_area=%d' % ('OK  ' if ok else 'OVER', m.group(7), t, changed))
print('§CAPTION_VERDICT ' + ('INCONCLUSIVE no cue' if not n else ('PASS' if not bad else 'FAIL %d' % bad)) + ' cues=%d' % n); sys.exit(2 if not n else (1 if bad else 0))
