# ⚠ DO NOT REMOVE — film "UAT, hands on": the CAMERA (zoom and view centre per output frame) and its MEASURE (prompts/FILM_UAT_GUIDE.md §5.18 L6). READ THE LOG (§COMP_CAMERA*).
# THE ISSUE IT PROVES OR DISPROVES: "the film's zoom and pan jerk at clicks" (owner 2026-11-22: "The jerking movements during zoom or mouse clicks has to stop and smooth").
# The whole path is computed BEFORE any frame is drawn, so it can be measured (and, in 'smooth', smoothed both ways in time). Units: zoom (1 = the whole screen) and OUTPUT pixels per frame.
#   'old'    = the path compose.py drew up to rc4: each frame moves 0.30 s-exponentially toward a target that JUMPS (1.0 -> 1.3/1.7 one second before a click, back 0.8 s after,
#              also inside sped playback), reset to 1.0 at a scene change; the crop was rounded to whole pixels.
#   'smooth' = clicks closer than MERGE_S form ONE zoomed group at one level; no zoom inside sped playback (speed > 1) or holds; the target is clamped to the screen first, then
#              smoothed with a zero-phase Gaussian (sigma SIG_S) inside each scene's frames: speed rises and falls continuously (no velocity step). The crop is sub-pixel (compose.py).
import math
LEAD_S, TAIL_S, MERGE_S, SIG_S, EDGE_S = 1.0, 0.8, 1.6, 0.35, 0.6

def frames(pieces, NF, FPS, TOTAL):
    """per output frame: (piece, scene, source time) — the same mapping compose.py renders with"""
    out, j = [], 0
    for n in range(NF):
        t = n / FPS
        if t < TOTAL:
            while not (pieces[j]['t_out'] <= t < pieces[j]['t_out'] + pieces[j]['dur'] + 1e-9): j += 1
            p = pieces[j]
        else: p = pieces[-1]
        if p['kind'] == 'card': out.append((p, None, None)); continue
        ts = p['a'] if p['kind'] == 'hold' else p['a'] + (t - p['t_out']) * p['speed']
        out.append((p, p['scene'], ts))
    return out

def _target_old(ev, ts):
    for c in ev['clicks']:
        if c['t'] - LEAD_S <= ts <= c['t'] + TAIL_S:
            b = c.get('box'); small = b and (b[2] < 60 or b[3] < 24)
            return (1.7 if small else 1.3), ((b[0] + b[2] / 2, b[1] + b[3] / 2) if b else (c['x'], c['y']))
    return 1.0, None

def _groups(ev):
    """clicks closer than MERGE_S -> one group: [t0, t1, zoom (the largest of its clicks), [(t, centre)...]]"""
    G = []
    for c in sorted(ev['clicks'], key=lambda c: c['t']):
        b = c.get('box'); small = b and (b[2] < 60 or b[3] < 24); z = 1.7 if small else 1.3; ctr = (b[0] + b[2] / 2, b[1] + b[3] / 2) if b else (c['x'], c['y'])
        if G and c['t'] - G[-1][1] <= MERGE_S: G[-1][1] = c['t']; G[-1][2] = max(G[-1][2], z); G[-1][3].append((c['t'], ctr))
        else: G.append([c['t'], c['t'], z, [(c['t'], ctr)]])
    return G

def path(variant, F, EVS, pointer_at, FPS, W, BH, H):
    """-> list of (zs, cx, cy) per output frame (None on a card)"""
    if variant == 'old':
        zs, cxs, cys, last, P = 1.0, 960.0, 540.0, None, []
        a = 1 - math.exp(-1 / FPS / 0.30)
        for p, sid, ts in F:
            if sid is None: P.append(None); continue
            ev = EVS[sid]
            if sid != last: zs, (cxs, cys) = 1.0, pointer_at(ev, ts); last = sid
            zt, ctr = _target_old(ev, ts); px, py = pointer_at(ev, ts); ctr = ctr or (px, py)
            zs += (zt - zs) * a; cxs += (ctr[0] - cxs) * a; cys += (ctr[1] - cys) * a; P.append((zs, cxs, cys))
        return P
    # 'smooth': raw target per frame, then a zero-phase Gaussian per scene run
    G = {sid: _groups(ev) for sid, ev in EVS.items()}; raw = []
    for p, sid, ts in F:
        if sid is None: raw.append(None); continue
        ev = EVS[sid]; px, py = pointer_at(ev, ts); z, ctr = 1.0, (px, py)
        if p['kind'] == 'play' and p['speed'] <= 1:
            for g in G[sid]:
                if g[0] - LEAD_S <= ts <= g[1] + TAIL_S:
                    z = g[2]; ctr = min(g[3], key=lambda tc: abs(tc[0] - ts))[1] if ts > g[0] else g[3][0][1]; break
        cw, ch = W / z, BH / z; cx = min(max(ctr[0], cw / 2), W - cw / 2); cy = min(max(ctr[1], ch / 2), H - ch / 2)   # clamp the TARGET to the screen, so the smoothed path needs no clamp kink
        raw.append((z, cx, cy))
    out = [None] * len(raw); r = max(1, int(3 * SIG_S * FPS)); K = [math.exp(-0.5 * (k / (SIG_S * FPS)) ** 2) for k in range(-r, r + 1)]
    n = 0
    while n < len(raw):
        if raw[n] is None: n += 1; continue
        sid = F[n][1]; m = n
        while m < len(raw) and raw[m] is not None and F[m][1] == sid: m += 1   # one scene run [n, m)
        e = int(EDGE_S * FPS)   # each scene starts and ends on the whole screen, so a cut never jumps out of a zoom (the 'old' path: a pop at every such cut)
        for i in list(range(n, min(m, n + e))) + list(range(max(n, m - e), m)): raw[i] = (1.0, W / 2, BH / 2)
        for i in range(n, m):
            sw = sz = sx = sy = 0.0
            for k, w in zip(range(-r, r + 1), K):
                j = min(max(i + k, n), m - 1); z, x, y = raw[j]; sw += w; sz += w * z; sx += w * x; sy += w * y
            out[i] = (sz / sw, sx / sw, sy / sw)
        n = m
    return out

def measure(P, F, W, BH, H):
    """-> dict: zoom step/accel per frame, pan speed/accel of the view origin in OUTPUT px per frame, and zoom pops at scene changes (frames across a cut or a card are not motion)"""
    zst, zac, pv, pa, pops, prev = [], [], [], [], 0, None
    def origin(c): z, cx, cy = c; cw, ch = W / z, BH / z; return (min(max(cx - cw / 2, 0), W - cw) * z, min(max(cy - ch / 2, 0), H - ch) * z, z)
    for i, c in enumerate(P):
        if c is None or i == 0 or P[i - 1] is None or F[i][1] != F[i - 1][1]:
            if c is not None and i > 0 and P[i - 1] is not None and F[i][1] != F[i - 1][1] and abs(P[i - 1][0] - 1.0) > 0.05: pops += 1
            prev = None; continue
        o0, o1 = origin(P[i - 1]), origin(c)
        v = (o1[0] - o0[0], o1[1] - o0[1], o1[2] - o0[2])
        zst.append(abs(v[2])); pv.append(math.hypot(v[0], v[1]))
        if prev is not None: zac.append(abs(v[2] - prev[2])); pa.append(math.hypot(v[0] - prev[0], v[1] - prev[1]))
        prev = v
    def q(a, f): a = sorted(a); return a[min(len(a) - 1, int(f * (len(a) - 1)))] if a else 0.0
    return dict(frames=len(zst), zoom_step_max=max(zst or [0]), zoom_acc_max=max(zac or [0]), zoom_acc_p99=q(zac, 0.99),
                pan_speed_max=max(pv or [0]), pan_acc_max=max(pa or [0]), pan_acc_p99=q(pa, 0.99), pan_acc_gt5=sum(1 for x in pa if x > 5), cut_zoom_pops=pops)
