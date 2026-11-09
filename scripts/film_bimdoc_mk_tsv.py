import sys, re
ns = {}; exec(open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), 'film_bimdoc_rows.py')).read(), ns); ROWS = ns['ROWS']
mode = sys.argv[1]                  # 'measure' or 'final'
out = sys.argv[2]
cue = {}
if mode == 'final':
    for l in open(sys.argv[3]).read().split('\n'):
        m = re.match(r'§ERP_FILM_CUE id=(\S+) t=([\d.]+)', l)
        if m: cue[m.group(1)] = float(m.group(2))
    film = float(sys.argv[4])
order = [r[0] for r in ROWS]
lines = []
for i, (rid, off, src, short, detail) in enumerate(ROWS):
    if mode == 'measure': a, b = 0.0, 1000.0
    else:
        a = cue[rid] + off; b = (cue[order[i + 1]] if i + 1 < len(order) else film)
    lines.append(f'{rid}\t{a:.3f}\t{b:.3f}\t{src}\t{short}\t{detail}')
open(out, 'w').write('\n'.join(lines) + '\n')
