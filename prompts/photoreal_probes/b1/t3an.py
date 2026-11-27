# Z18 analysis of t3.js dump: for each term, find step edges along probe lines and in edge profiles; world spacing vs 0.5 m cell.
import json, sys, base64, numpy as np
d = json.load(open(sys.argv[1])); d = d.get('result', d)
M = d['meta']; CH = d['CH']; cell = M['cell']
print('meta', {k: M[k] for k in M}, 'aoErr', d['aoErr'])
R = {}
for r in d['rois']:
    a = np.frombuffer(base64.b64decode(r['b64']), dtype=np.float32).reshape(r['h'], r['w'], len(CH))
    R[r['n']] = (r, a)
def ch(a, n): return a[:, :, CH.index(n)]
TERMS = ['sun', 'F', 'Gd', 'IR', 'cove', 'ao0', 'full']
def jumps(prof, rel=0.06):
    p = np.asarray(prof, float); rng = np.nanpercentile(p, 98) - np.nanpercentile(p, 2)
    if not np.isfinite(rng) or rng <= 1e-9: return [], rng
    dp = np.abs(np.diff(p)); idx = np.where(dp > rel * rng)[0]
    # merge adjacent indices (one edge spanning 2 px)
    ev = []
    for i in idx:
        if ev and i - ev[-1][-1] <= 1: ev[-1].append(i)
        else: ev.append([i])
    return [e[0] for e in ev], rng
def line(name, pts, npts=None):
    r, a = R[name]
    (x0, y0), (x1, y1) = pts; n = npts or int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    xs = np.round(np.linspace(x0, x1, n)).astype(int) - r['x0']; ys = np.round(np.linspace(y0, y1, n)).astype(int) - r['y0']
    q = np.stack([ch(a, 'qx')[ys, xs], ch(a, 'qy')[ys, xs], ch(a, 'qz')[ys, xs]], 1)
    cidx = np.floor((q - np.array(M['org'][:3])) / cell).astype(int)
    cb = np.where(np.any(np.diff(cidx, axis=0) != 0, axis=1))[0]
    zone = ch(a, 'zone')[ys, xs]; zb = np.where(np.diff(zone) != 0)[0]
    print(f'\n== line {name} {pts} n={n} world {q[0].round(2)} -> {q[-1].round(2)}  cell boundaries crossed at idx {cb.tolist()[:40]}  zone changes at {zb.tolist()[:20]}')
    for t in TERMS:
        pr = ch(a, t)[ys, xs]
        if not np.isfinite(pr).any(): print(f'  {t:5s} n/a'); continue
        j, rng = jumps(pr)
        oncell = sum(1 for i in j if any(abs(i - c) <= 1 for c in cb))
        wpos = [tuple(q[i].round(2)) for i in j[:12]]
        print(f'  {t:5s} range={rng:.4g} min={np.nanmin(pr):.4g} max={np.nanmax(pr):.4g} steps={len(j)} onCellBoundary={oncell} idx={j[:20]}')
        if j: print(f'        world@steps {wpos}')
    return q
def edgeprof(name, t, rows=None, cols=None, thr=0.5):
    """for each row (or col) in the ROI, locate where term t crosses thr between its local min and max -> edge coordinate; report plateaus"""
    r, a = R[name]; v = ch(a, t)
    qx, qy, qz = ch(a, 'qx'), ch(a, 'qy'), ch(a, 'qz')
    res = []
    rng = rows if rows is not None else cols
    for k in rng:
        pr = v[k - r['y0'], :] if rows is not None else v[:, k - r['x0']]
        lo, hi = np.nanpercentile(pr, 5), np.nanpercentile(pr, 95)
        if hi - lo < 1e-6: continue
        lvl = lo + thr * (hi - lo); s = pr > lvl
        c = np.where(np.diff(s.astype(int)) != 0)[0]
        if len(c) == 0: continue
        i = c[0]
        if rows is not None: res.append((k, i + r['x0'], qx[k - r['y0'], i], qy[k - r['y0'], i], qz[k - r['y0'], i]))
        else: res.append((k, i + r['y0'], qx[i, k - r['x0']], qy[i, k - r['x0']], qz[i, k - r['x0']]))
    return res
if __name__ == '__main__':
    exec(open(sys.argv[2]).read()) if len(sys.argv) > 2 else None
