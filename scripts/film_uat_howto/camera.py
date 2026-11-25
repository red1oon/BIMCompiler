# ⚠ DO NOT REMOVE — film "UAT, hands on": the CAMERA (zoom and view centre per output frame) and its MEASURE (prompts/FILM_UAT_GUIDE.md §5.18 L6). READ THE LOG (§COMP_CAMERA*).
# THE ISSUE IT PROVES OR DISPROVES: "the film's zoom and pan jerk at clicks" (owner 2026-11-22: "The jerking movements during zoom or mouse clicks has to stop and smooth").
#   §5.29 (b) 'smooth' also: groups closer than ZMERGE_S form ONE RUN held at one zoom and one centre (the bounding box of its click targets), so the camera never zooms out and back in
#              between near clicks and never swings its pan between two targets; a run whose targets do not fit the crop is held on the whole screen.
# The whole path is computed BEFORE any frame is drawn, so it can be measured (and, in 'smooth', smoothed both ways in time). Units: zoom (1 = the whole screen) and OUTPUT pixels per frame.
#   'old'    = the path compose.py drew up to rc4: each frame moves 0.30 s-exponentially toward a target that JUMPS (1.0 -> 1.3/1.7 one second before a click, back 0.8 s after,
#              also inside sped playback), reset to 1.0 at a scene change; the crop was rounded to whole pixels.
#   'smooth' = clicks closer than MERGE_S form ONE zoomed group at one level; no zoom inside sped playback (speed > 1) or holds; the target is clamped to the screen first, then
#              smoothed with a zero-phase Gaussian (sigma SIG_S) inside each scene's frames: speed rises and falls continuously (no velocity step). The crop is sub-pixel (compose.py).
import math
LEAD_S, TAIL_S, MERGE_S, SIG_S, EDGE_S = 1.0, 0.8, 1.6, 0.35, 0.6
ZMERGE_S, FIT_X, FIT_Y, MIN_HOLD_S, MARGIN, FLAT_MARGIN_S, LOCK_S = 4.0, 160, 100, 3.2, 25, 1.4, 1.8   # MIN_HOLD_S 1.2 -> 3.2 (§5.33: a zoom held 1.2 s with ramps of ~0.5 s each side read as a swing in Film II's c1 scene)   # §5.29 (b): groups closer than ZMERGE_S are ONE run held at ONE zoom level and ONE view centre (no zoom out and back in, no pan swing between targets); a run whose targets do not fit the crop with FIT_X/FIT_Y px to spare is held on the whole screen

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

def _fit(zmax, pts, W, BH):
    """the largest zoom level <= zmax at which every click target of a run fits the crop with room to spare, else 1.0; and the centre = the targets' bounding box"""
    xs = [c[0] for _, c in pts]; ys = [c[1] for _, c in pts]; w, h = max(xs) - min(xs), max(ys) - min(ys); z = zmax
    while z > 1.0 and not (w <= W / z - FIT_X and h <= BH / z - FIT_Y): z = round(z - 0.05, 3)
    return (z if z >= 1.05 else 1.0), ((max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2)

def _runs(G, W, BH):
    """§5.29 (b): groups closer than ZMERGE_S in SOURCE time -> one run [t0, t1, zoom, centre, zmax, points] (path() then also merges runs that the film puts closer than ZMERGE_S apart: a sped wait is short on screen)"""
    R = []
    for g in G:
        if R and g[0] - R[-1][1] <= ZMERGE_S: R[-1][1] = g[1]; R[-1][2] = max(R[-1][2], g[2]); R[-1][3] += g[3]
        else: R.append([g[0], g[1], g[2], list(g[3])])
    return [(t0, t1, *_fit(z, pts, W, BH), z, pts) for t0, t1, z, pts in R]

def _flat_spans(EVS, FLAT):
    """§5.30: {scene: [(t0, t1)]} in the take's source time: the spans where the scene shows the downloaded PDF (the camera holds zoom 1.0 there: the page is fitted to the width, its text is readable as it is)"""
    out = {}
    for sid, spans in (FLAT or {}).items():
        cues = {c['name']: c['t'] for c in EVS[sid]['cues']}; out[sid] = [(cues[a], cues[b]) for a, b in spans]
    return out

def is_flat(FS, sid, ts): return sid in FS and any(a <= ts <= b for a, b in FS[sid])

def path(variant, F, EVS, pointer_at, FPS, W, BH, H, FLAT=None):
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
    FS = _flat_spans(EVS, FLAT); G = {sid: _runs(_groups(ev), W, BH) for sid, ev in EVS.items()}
    # §5.30: a click run whose window comes within FLAT_MARGIN_S of a PDF span is dropped (a Back or a link click beside the PDF is not zoomed on): the smoothing's reach (3 sigma, ~1 s) then never carries a zoom into the PDF span
    G = {sid: [r for r in rs if not any(r[0] - LEAD_S < b + FLAT_MARGIN_S and r[1] + TAIL_S > a - FLAT_MARGIN_S for a, b in FS.get(sid, []))] for sid, rs in G.items()}; raw = []; runi = []; dfl = []; lastsid = None; oy = 0.0; OYC = {}; lastshift = [0, -10 ** 9]
    for p, sid, ts in F:
        if sid is None: raw.append(None); runi.append(None); dfl.append(None); continue
        ev = EVS[sid]; px, py = pointer_at(ev, ts); z, ri = 1.0, None
        if sid not in OYC: ys = [pointer_at(EVS[sid], t_)[1] for q_, s_, t_ in F if s_ == sid and t_ is not None][::15]; OYC[sid] = max(0.0, max(ys) + MARGIN - BH) if ys and max(ys) - min(ys) <= BH - 2 * MARGIN else None   # a scene whose pointer stays inside one 930 px band is held at ONE shift for the whole scene (no pan at all on the whole screen)
        if OYC[sid] is not None: oy = OYC[sid]
        elif sid != lastsid: oy, lastsid = 0.0, sid; lastshift[0], lastshift[1] = 0, -10 ** 9   # §5.29 (b): on the whole screen the 150 px the strip takes is a vertical shift; it follows the pointer only when the pointer comes within MARGIN of the shown area's top or bottom (a dead band: a pointer going up and down inside it moves nothing)
        if OYC[sid] is None:
            o0 = oy; nf = len(raw)   # a shift the other way within LOCK_S of the last one waits (a pointer going to a button at the bottom and straight back up would swing the view), unless the pointer is out of view altogether
            hidden = py < oy or py > oy + BH
            if py < oy + MARGIN and (hidden or nf - lastshift[1] > LOCK_S * FPS or lastshift[0] <= 0): oy = max(0.0, py - MARGIN)
            elif py > oy + BH - MARGIN and (hidden or nf - lastshift[1] > LOCK_S * FPS or lastshift[0] >= 0): oy = min(float(H - BH), py - BH + MARGIN)
            if oy != o0: lastshift[0], lastshift[1] = (1 if oy > o0 else -1), nf; FLATDBG.append('shift %s frame %d oy %.0f -> %.0f (pointer y %.0f)' % (sid, nf, o0, oy, py))
        ctr = (W / 2, oy + BH / 2)
        for k, g in enumerate(G[sid]):
            if g[0] - LEAD_S <= ts <= g[1] + TAIL_S: ri = k; break
        if is_flat(FS, sid, ts): ri = None   # §5.30: a PDF span: no run, no zoom
        dfl.append((1.0, ctr[0], ctr[1]))   # the scene's own view at this frame (whole screen, its vertical shift): what a frame shows when no zoom run applies
        if ri is not None and p['kind'] == 'play' and p['speed'] <= 1 and G[sid][ri][2] > 1.0: z, ctr = G[sid][ri][2], G[sid][ri][3]
        raw.append((z, ctr[0], ctr[1])); runi.append(ri)
    first, last = {}, {}   # a sped or held frame INSIDE a run (between its first and last frame held at its level) keeps the level: zooming out and in around a wait is the hunting this removes
    for n, r in enumerate(raw):
        if r is not None and runi[n] is not None and F[n][0]['kind'] == 'play' and F[n][0]['speed'] <= 1: key = (F[n][1], runi[n]); first.setdefault(key, n); last[key] = n
    base = {n: raw[n] for n in range(len(raw)) if raw[n] is not None and is_flat(FS, F[n][1], F[n][2])}   # the flat frames as they were before the runs were filled in
    byscene = {}
    for (sid, ri), n0 in first.items(): byscene.setdefault(sid, []).append([n0, last[(sid, ri)], G[sid][ri][4], list(G[sid][ri][5])])
    for sid, L in byscene.items():   # runs the FILM puts closer than ZMERGE_S apart (a sped wait between two clicks is short on screen) are ONE run: held, not zoomed out and in
        L.sort(); M = [L[0]]
        for it in L[1:]:
            if it[0] - M[-1][1] <= ZMERGE_S * FPS: M[-1][1] = it[1]; M[-1][2] = max(M[-1][2], it[2]); M[-1][3] += it[3]
            else: M.append(it)
        sn = [n for n in range(len(raw)) if F[n][1] == sid and raw[n] is not None]; e = int(EDGE_S * FPS)   # the scene's own frames; its first and last EDGE_S are held on the whole screen
        for n0, n1, zmax, pts in M:
            z, ctr = _fit(zmax, pts, W, BH)
            if sum(1 for n in range(max(n0, sn[0] + e), min(n1, sn[-1] - e) + 1)) < MIN_HOLD_S * FPS: z = 1.0   # a zoom that could only be held for a moment is a pop, not a camera move: left out
            if z == 1.0:   # §5.33: a run left on the whole screen is NO camera move: its frames keep the scene's own (shift-held) view, not a pan to the run's click centre
                for n in range(n0, n1 + 1):
                    if raw[n] is not None and F[n][1] == sid: raw[n] = dfl[n]
                continue
            for n in range(n0, n1 + 1):
                if raw[n] is not None and F[n][1] == sid: raw[n] = (z, ctr[0], ctr[1])
    for n, r in base.items(): raw[n] = r
    flat_n = sorted(base); FM = int(FLAT_MARGIN_S * FPS)   # §5.30: no zoom within FLAT_MARGIN_S of a PDF span, counted in OUTPUT frames (a sped wait is short on screen, so a margin in source seconds is not enough): the smoothing's reach never carries a zoom into it
    import bisect
    for n, r in enumerate(raw):
        if r is None or n in base or r[0] == 1.0: continue
        k = bisect.bisect_left(flat_n, n); near = [flat_n[j] for j in (k - 1, k) if 0 <= j < len(flat_n)]
        if any(abs(m - n) <= FM and F[m][1] == F[n][1] for m in near): raw[n] = (1.0, W / 2, BH / 2)
    for n, r in enumerate(raw):   # clamp the TARGET to the screen, so the smoothed path needs no clamp kink
        if r is not None: z, x, y = r; cw, ch = W / z, BH / z; raw[n] = (z, min(max(x, cw / 2), W - cw / 2), min(max(y, ch / 2), H - ch / 2))
    out = [None] * len(raw); r = max(1, int(3 * SIG_S * FPS)); K = [math.exp(-0.5 * (k / (SIG_S * FPS)) ** 2) for k in range(-r, r + 1)]
    n = 0
    while n < len(raw):
        if raw[n] is None: n += 1; continue
        sid = F[n][1]; m = n
        while m < len(raw) and raw[m] is not None and F[m][1] == sid: m += 1   # one scene run [n, m)
        e = int(EDGE_S * FPS)   # each scene starts and ends on the whole screen, so a cut never jumps out of a zoom (the 'old' path: a pop at every such cut)
        for i in range(n, min(m, n + e)): raw[i] = (1.0, W / 2, BH / 2 + (OYC.get(sid) or 0.0))
        endc = dfl[max(n, m - e - 1)]   # the end edge keeps the view the scene had just before it (a scene that shifted for a pointer at the bottom would otherwise swing back to the top on its last 0.6 s)
        for i in range(max(n, m - e), m): raw[i] = (1.0, W / 2, endc[2] if endc else BH / 2)   # §5.33: a scene held at one vertical shift keeps it at its edges too (a short sped scene otherwise shifted and came straight back: a swing)
        for i in range(n, m):
            sw = sz = sx = sy = 0.0
            for k, w in zip(range(-r, r + 1), K):
                j = min(max(i + k, n), m - 1); z, x, y = raw[j]; sw += w; sz += w * z; sx += w * x; sy += w * y
            out[i] = (sz / sw, sx / sw, sy / sw)
        n = m
    for n, c in enumerate(out):   # §5.30: the PDF spans are exactly zoom 1.0 (the smoothing's reach is kept out of them by FLAT_MARGIN_S above, so this moves a frame by < 0.002)
        if c is not None and is_flat(FS, F[n][1], F[n][2]):
            if abs(c[0] - 1.0) > 0.002: FLATDBG.append('%s frame %d zoom %.4f before forcing (ts-in-span, a zoomed frame within the smoothing reach)' % (F[n][1], n, c[0]))
            out[n] = (1.0, c[1], c[2])
    return out

DBG = []; FLATDBG = []
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
    # §5.29 (b): 'swinging'. Per scene run: zoom hunting (an interior zoom stroke of <= 1.5 s between two strokes) and pan swings (two strokes < 1.5 s apart, each > 40 px, turning > 120 degrees)
    runs, cur = [], []
    for i, c in enumerate(P):
        if c is None or (cur and F[i][1] != F[cur[-1]][1]):
            if cur: runs.append(cur)
            cur = [] if c is None else [i]; continue
        cur.append(i)
    if cur: runs.append(cur)
    zrev = 0; FPS_ = 30; HYS = 0.02; global DBG; DBG = []
    for run in runs:
        zs = [P[i][0] for i in run]; piv = [0]; d = 0; ext = 0   # zig-zag pivots (indices) with 0.02 hysteresis
        for k in range(1, len(zs)):
            if d == 0:
                if zs[k] - zs[0] > HYS: d, ext = 1, k
                elif zs[0] - zs[k] > HYS: d, ext = -1, k
            elif d == 1:
                if zs[k] > zs[ext]: ext = k
                elif zs[ext] - zs[k] > HYS: piv.append(ext); d, ext = -1, k
            else:
                if zs[k] < zs[ext]: ext = k
                elif zs[k] - zs[ext] > HYS: piv.append(ext); d, ext = 1, k
        if d != 0: piv.append(ext)
        for a in range(1, len(piv) - 2):   # the stroke piv[a] -> piv[a+1] has a stroke before it and one after it
            e = piv[a + 1]
            while e + 1 < len(zs) and abs(zs[e + 1] - zs[piv[a + 1]]) < 0.005: e += 1   # the dwell at the turn: out-and-back-in is the stroke PLUS the time it stays at the turn
            if e - piv[a] <= 1.5 * FPS_: zrev += 1; DBG.append('zoom %s run_frame %d dur %.2fs z %.3f->%.3f' % (F[run[0]][1], piv[a], (e - piv[a]) / FPS_, zs[piv[a]], zs[piv[a + 1]]))
    prev_ = 0
    for run in runs:
        o = [(lambda c: (min(max(c[1] - W / c[0] / 2, 0), W - W / c[0]) + W / c[0] / 2, min(max(c[2] - BH / c[0] / 2, 0), H - BH / c[0]) + BH / c[0] / 2))(P[i]) for i in run]; sp = [0.0] + [math.hypot(o[k][0] - o[k - 1][0], o[k][1] - o[k - 1][1]) for k in range(1, len(o))]
        sm = [sum(sp[max(0, k - 2):k + 3]) / len(sp[max(0, k - 2):k + 3]) for k in range(len(sp))]; strokes, k = [], 0
        while k < len(sm):
            if sm[k] > 0.4:
                s0 = k
                while k < len(sm) and (sm[k] > 0.4 or any(sm[j] > 0.4 for j in range(k, min(len(sm), k + 8)))): k += 1
                strokes.append((s0, k - 1))
            else: k += 1
        for (a0, a1), (b0, b1) in zip(strokes, strokes[1:]):
            da = (o[a1][0] - o[a0][0], o[a1][1] - o[a0][1]); db = (o[b1][0] - o[b0][0], o[b1][1] - o[b0][1]); na, nb = math.hypot(*da), math.hypot(*db)
            if na > 40 and nb > 40 and b0 - a1 < 1.5 * FPS_ and (da[0] * db[0] + da[1] * db[1]) / (na * nb) < -0.5: prev_ += 1; DBG.append('pan %s run_frame %d gap %.2fs da=%s db=%s' % (F[run[0]][1], a1, (b0 - a1) / FPS_, tuple(round(x) for x in da), tuple(round(x) for x in db)))
    def q(a, f): a = sorted(a); return a[min(len(a) - 1, int(f * (len(a) - 1)))] if a else 0.0
    return dict(frames=len(zst), zoom_step_max=max(zst or [0]), zoom_acc_max=max(zac or [0]), zoom_acc_p99=q(zac, 0.99),
                pan_speed_max=max(pv or [0]), pan_acc_max=max(pa or [0]), pan_acc_p99=q(pa, 0.99), pan_acc_gt5=sum(1 for x in pa if x > 5), cut_zoom_pops=pops, zoom_reversals=zrev, pan_reversals=prev_)


def flat_report(P, F, FLAT, EVS):
    """§5.30 witness: per PDF scene, the lowest and highest zoom over the frames inside its PDF spans (must both be 1.0), and how many frames that is; a scene with no frame in its span is INCONCLUSIVE, never PASS"""
    FS = _flat_spans(EVS, FLAT); rows = []
    for sid, spans in FS.items():
        zs = [P[i][0] for i, (p, s_, ts) in enumerate(F) if s_ == sid and P[i] is not None and is_flat(FS, sid, ts)]
        if not zs: rows.append((sid, spans, 0, None, None, 'INCONCLUSIVE')); continue
        rows.append((sid, spans, len(zs), min(zs), max(zs), 'PASS' if max(zs) - 1.0 < 1e-6 and 1.0 - min(zs) < 1e-6 else 'FAIL'))
    return rows
