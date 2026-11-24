# ⚠ DO NOT REMOVE — film "UAT, hands on" (prompts/FILM_UAT_GUIDE.md §5.30): how wide the PDF page is on the recording desktop's screen (:97), measured from ONE frame, as JSON.
# The page is the white sheet on the viewer's dark ground: per row of the viewer area (x 310..1890, y 160..1060) the first and last white pixel; the medians over the rows are the page's left and right edge.
# usage: python3 pagewidth.py   -> {"left":..,"right":..,"width":..,"area":1580}
import subprocess, json
from PIL import Image
import numpy as np
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'x11grab', '-video_size', '1920x1080', '-i', ':97', '-frames:v', '1', '/tmp/film_pagewidth.png'], env={'DISPLAY': ':97', 'PATH': '/usr/bin:/bin'}, check=True)
a = np.asarray(Image.open('/tmp/film_pagewidth.png').convert('RGB')).astype(int)[160:1060, 310:1890]; w = a.min(axis=2) >= 250; L = []; R = []
for row in w:
    xs = np.nonzero(row)[0]
    if len(xs) > 100: L.append(int(xs[0]) + 310); R.append(int(xs[-1]) + 310)
l, r = (int(np.median(L)), int(np.median(R))) if L else (0, 0)
print(json.dumps({'left': l, 'right': r, 'width': r - l + 1 if L else 0, 'area': 1580}))
