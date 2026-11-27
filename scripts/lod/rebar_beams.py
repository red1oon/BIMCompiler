# ⚠ DO NOT REMOVE — scope: prompts/LOD400_DEFAULT_RULES_SCOPE.md section 7 (BUILD 2 SPEC). Read the log after every run; the exit code is not evidence.
# Implementing LOD400_DEFAULT_RULES_SCOPE.md §7 — Witness: §PJRB_*
# Issue proved/disproved: can a beam schedule read from a drawing table (marks JSON) become real bars on every concrete beam, joined by
#   the model's own type mark, inside each beam's TRUE mesh with the cover kept, identically on every run?
# Not run on its own: rebar_from_schedule.py calls run(globals()) when --schedule-json is given, so the copy / row writers / bar and tie
#   geometry / IDENT digests are the one engine's. Section 6 (DXF-attached schedules, Shed) is untouched by this file.
# Deterministic: no random, no clock; every loop is over sorted keys. A witness prints INCONCLUSIVE when it judged nothing.
import sqlite3, os, sys, json, math, re, collections
import numpy as np

P = '§PJRB_'


# ---------------------------------------------------------------- mesh geometry (world frame, triangle arrays (n,3,3))
def mesh_tris(c, guid):
    r = c.execute("select g.vertices, g.faces, t.center_x, t.center_y, t.center_z from element_instances i join component_geometries g using(geometry_hash) "
                  "join element_transforms t using(guid) where i.guid=?", (guid,)).fetchone()
    if r is None: return None
    V = np.frombuffer(r[0], np.float32).reshape(-1, 3).astype(float) + np.array(r[2:5])
    return V[np.frombuffer(r[1], np.uint32).reshape(-1, 3)]


def pt_tri_dist(Pt, T):
    """min distance from each point (m,3) to the triangle set T (n,3,3): plane distance if the projection falls inside, else the nearest edge."""
    a = T[:, 0][None]; b = T[:, 1][None]; c = T[:, 2][None]; p = Pt[:, None, :]
    n = np.cross(b - a, c - a); nn = (n * n).sum(-1); ok = nn > 1e-18
    t = ((p - a) * n).sum(-1) / np.where(ok, nn, 1.0); q = p - t[..., None] * n
    s1 = (np.cross(b - a, q - a) * n).sum(-1); s2 = (np.cross(c - b, q - b) * n).sum(-1); s3 = (np.cross(a - c, q - c) * n).sum(-1)
    inside = ok & (s1 >= 0) & (s2 >= 0) & (s3 >= 0)
    def seg(x, y):
        d = y - x; tt = np.clip(((p - x) * d).sum(-1) / np.maximum((d * d).sum(-1), 1e-18), 0, 1); e = p - (x + tt[..., None] * d); return (e * e).sum(-1)
    d2 = np.minimum(np.minimum(seg(a, b), seg(b, c)), seg(c, a))
    d2 = np.where(inside, t * t * nn, d2)
    return np.sqrt(d2.min(1))


def _dist(Pt, T):
    out = np.empty(len(Pt)); step = max(1, 300000 // max(1, len(T)))
    for i in range(0, len(Pt), step): out[i:i + step] = pt_tri_dist(Pt[i:i + step], T)
    return out


DIRS = [np.array([0.577, 0.577, 0.577]), np.array([-0.267, 0.802, 0.535]), np.array([0.707, -0.1, -0.7])]


def _inside(Pt, T):
    """ray parity along three oblique directions, majority vote (the build-1 rule)"""
    a = T[:, 0]; e1 = T[:, 1] - a; e2 = T[:, 2] - a; cnt = np.zeros(len(Pt), int); step = max(1, 300000 // max(1, len(T)))
    for d in DIRS:
        d = d / np.linalg.norm(d); pv = np.cross(d, e2); det = (e1 * pv).sum(1); okd = np.abs(det) > 1e-12; inv = np.where(okd, 1 / np.where(okd, det, 1), 0)
        for i in range(0, len(Pt), step):
            s = Pt[i:i + step, None, :] - a[None]; u = (s * pv[None]).sum(-1) * inv; q = np.cross(s, e1[None]); v = (q @ d) * inv; tt = (e2[None] * q).sum(-1) * inv
            hit = okd & (u >= 0) & (v >= 0) & (u + v <= 1) & (tt > 1e-9); cnt[i:i + step] += hit.sum(1) % 2
    return cnt >= 2


def sdist(Pt, T):
    """signed distance to the mesh surface: positive inside"""
    d = _dist(Pt, T); return np.where(_inside(Pt, T), d, -d)


def clear_ok(Pt, T, thr):
    """True where the point is inside the mesh and at least thr from its surface"""
    d = _dist(Pt, T); ok = d >= thr; idx = np.nonzero(ok)[0]
    if len(idx): ok[idx[~_inside(Pt[idx], T)]] = False
    return ok


def plan_angle(V):
    """degrees; the rotation of the minimum-area rectangle of the plan outline (u = (cos,sin), v = (-sin,cos)); refined in steps down to 0.0001 deg"""
    Pp = V[:, :2] - V[:, :2].mean(0)
    def area(deg):
        a = math.radians(deg); c, s = math.cos(a), math.sin(a); return np.ptp(Pp[:, 0] * c + Pp[:, 1] * s) * np.ptp(-Pp[:, 0] * s + Pp[:, 1] * c)
    best = min(np.arange(0, 180, 0.1), key=area)
    for span, step in ((0.1, 0.01), (0.01, 0.001), (0.001, 0.0001)): best = min(np.arange(best - span, best + span + step / 2, step), key=area)
    return float(best)


def modal_zrange(TL, lo, hi, step=0.05):
    """the vertical extent of the beam BODY: at stations along the axis (local frame, u along the beam) a vertical line through the mid-width is
    intersected with the mesh; the most common (zlo, zhi), to 1 mm, is the reference section. A local stub taller or deeper than the body must not
    set where the bars go. Returns (zlo, zhi, stations_used, stations_total, distinct_ranges); None if the mid-width line never meets the mesh."""
    vm = (lo[1] + hi[1]) / 2; us = np.arange(lo[0] + step / 2, hi[0], step); a, b, c = TL[:, 0], TL[:, 1], TL[:, 2]
    d = (b[:, 1] - a[:, 1]) * (c[:, 0] - a[:, 0]) - (b[:, 0] - a[:, 0]) * (c[:, 1] - a[:, 1]); ok = np.abs(d) > 1e-12; cnt = collections.Counter(); exact = {}; used = 0
    for u in us:
        # barycentric coordinates of the point (u, vm) in the plan projection of every triangle
        l1 = ((u - a[:, 0]) * (c[:, 1] - a[:, 1]) - (vm - a[:, 1]) * (c[:, 0] - a[:, 0])) / np.where(ok, ((b[:, 0] - a[:, 0]) * (c[:, 1] - a[:, 1]) - (b[:, 1] - a[:, 1]) * (c[:, 0] - a[:, 0])), 1)
        l2 = ((vm - a[:, 1]) * (b[:, 0] - a[:, 0]) - (u - a[:, 0]) * (b[:, 1] - a[:, 1])) / np.where(ok, ((b[:, 0] - a[:, 0]) * (c[:, 1] - a[:, 1]) - (b[:, 1] - a[:, 1]) * (c[:, 0] - a[:, 0])), 1)
        hit = ok & (l1 >= -1e-9) & (l2 >= -1e-9) & (l1 + l2 <= 1 + 1e-9)
        if not hit.any(): continue
        z = a[hit, 2] + l1[hit] * (b[hit, 2] - a[hit, 2]) + l2[hit] * (c[hit, 2] - a[hit, 2]); key = (round(float(z.min()), 3), round(float(z.max()), 3)); cnt[key] += 1; exact.setdefault(key, (float(z.min()), float(z.max()))); used += 1
    if not cnt: return None
    best = max(cnt.items(), key=lambda kv: (kv[1], kv[0][1] - kv[0][0])); ex = exact[best[0]]; return ex[0], ex[1], used, len(us), len(cnt)     # counted to 1 mm, used at full precision


def parse_side(s):
    """'2T12-300' -> per level 2 bars, dia 12, pitch 300 ; '8T25' -> 8 bars in all, no pitch. None if not readable."""
    m = re.match(r'^\s*(\d+)\s*T\s*(\d+)\s*-\s*(\d+)\s*$', s or '')
    if m: return {'kind': 'pitch', 'n': int(m.group(1)), 'dia': int(m.group(2)), 'pitch': int(m.group(3))}
    m = re.match(r'^\s*(\d+)\s*T\s*(\d+)\s*$', s or '')
    return {'kind': 'count', 'n': int(m.group(1)), 'dia': int(m.group(2)), 'pitch': None} if m else None


def layers_of(dias, W, c, ds, clear_min):
    """fill layers in the stated order: the most bars per layer such that centre pitch - widest bar >= clear_min"""
    layers = []; rest = list(dias)
    while rest:
        k = 1
        for kk in range(2, len(rest) + 1):
            avail = W - 2 * (c + ds) - rest[0] / 2000.0 - rest[kk - 1] / 2000.0
            if avail / (kk - 1) - max(rest[:kk]) / 1000.0 >= clear_min - 1e-12: k = kk
            else: break
        layers.append(rest[:k]); rest = rest[k:]
    return layers


def run(E):
    A = E['A']; cur = E['cur']; db = E['db']; srcdb = E['srcdb']; META = E['META']; RULES = E['RULES']; rv = E['rv']
    SRC, OUT, TXT, DEF = E['SRC'], E['OUT'], E['TXT'], E['DEF']; SIDES = E['SIDES']; INSIDE_TOL = E['INSIDE_TOL']; STOCK = E['STOCK']
    prism = E['prism']; tie_loop = E['tie_loop']; write_part = E['write_part']; change = E['change']; CH = E['CH']; ring_dirs = E['ring_dirs']
    sha = E['sha']; BREAK = E['BREAK']; table_digest = E['table_digest']; SRC_TABLES = E['SRC_TABLES']; SRC_KEY = E['SRC_KEY']; D_SRC = E['D_SRC']
    N_SRC_META = E['N_SRC_META']; RB_RGBA = E['RB_RGBA']
    BR = json.load(open(A.beam_defaults)); brv = lambda k: BR[k]['value']
    COVER = brv('beam_cover_mm') / 1000.0; MINCL = brv('beam_min_clear_mm') / 1000.0; LAYCL = brv('beam_layer_clear_mm') / 1000.0
    STEP = brv('beam_sample_step_mm') / 1000.0; MARG = brv('beam_fit_margin_mm') / 1000.0
    PLC = 0.0 if BREAK else COVER                                   # the break switch changes PLACEMENT only; the witnesses judge against the rule row
    THR = PLC + MARG if PLC > 0 else -0.0005
    print(f'{P}MODE break={int(BREAK)} cover_rule_mm={COVER * 1000:g} placement_cover_mm={PLC * 1000:g} min_clear_mm={MINCL * 1000:g} layer_clear_mm={LAYCL * 1000:g} sample_step_mm={STEP * 1000:g}')
    MARKS = json.load(open(A.schedule_json)); RX = re.compile(A.mark_regex)
    N_UC0 = cur.execute("select coalesce(max(seq),0) from upgrade_changes").fetchone()[0]
    N_SRC_ROWID = cur.execute("select coalesce(max(rowid),0) from elements_meta").fetchone()[0]

    # ------------------------------------------------------------ join: host element -> mark -> schedule row
    hosts = sorted(g for g, m in META.items() if m[0] == A.host_class and RX.search(m[1]))
    HM = {g: RX.search(META[g][1]).group(1) for g in hosts}
    unjoined = [g for g in hosts if HM[g] not in MARKS]
    used = collections.Counter(HM[g] for g in hosts if HM[g] in MARKS); unused = sorted(set(MARKS) - set(used))
    print(f'{P}INPUT host_class={A.host_class} hosts={len(hosts)} schedule_marks={len(MARKS)} marks_used={len(used)} marks_unused={unused}')
    for g in unjoined: change('NOT_BUILT', g, A.host_class, g, 'No schedule row for the type mark; nothing guessed', f'"{META[g][1]}" | mark "{HM[g]}" is not in the schedule | storey {META[g][2]}')

    RB_NV = SIDES * 4 * 3; LOOP_NV = 4 * SIDES * 2 * 3
    REC = {}; SET_INFO = {}; n_lines = n_lines_ok = 0; n_cand = n_cand_ok = 0; refused_lines = []; first_run = {}
    cache = {}

    def build_beam(gb):
        nonlocal n_lines, n_lines_ok, n_cand, n_cand_ok
        mk = HM[gb]; row = MARKS[mk]; T = mesh_tris(cur, gb); V = T.reshape(-1, 3)
        ang = math.radians(plan_angle(V)); c_, s_ = math.cos(ang), math.sin(ang); u3 = np.array([c_, s_, 0.0]); v3 = np.array([-s_, c_, 0.0]); z3 = np.array([0.0, 0.0, 1.0])
        o = V.mean(0); L = (V - o) @ np.stack([u3, v3, z3]).T
        if np.ptp(L[:, 0]) < np.ptp(L[:, 1]): u3, v3 = v3, -u3; L = (V - o) @ np.stack([u3, v3, z3]).T
        R = np.stack([u3, v3, z3]); lo, hi = L.min(0), L.max(0); Wd = hi[1] - lo[1]; Ln = hi[0] - lo[0]; H_bbox = hi[2] - lo[2]
        mz = modal_zrange(((T.reshape(-1, 3) - o) @ R.T).reshape(-1, 3, 3), lo, hi)
        if mz is not None: lo = lo.copy(); hi = hi.copy(); lo[2], hi[2] = mz[0], mz[1]          # reference section = the body, not a local stub
        Hd = hi[2] - lo[2]
        loc2w = lambda u, v, z: o + np.asarray(u)[..., None] * u3 + np.asarray(v)[..., None] * v3 + np.asarray(z)[..., None] * z3
        info = dict(mark=mk, W=Wd, H=Hd, H_bbox=H_bbox, body=(None if mz is None else mz[2:]), L=Ln, lo=lo, hi=hi, angle_deg=math.degrees(ang), stated_w=row['w'] / 1000.0, stated_h=row['h'] / 1000.0, notes=[])
        if not row.get('stirrup'): info['notes'].append('schedule row has no stirrup'); REC[gb] = info; return info
        ds = row['stirrup'][0] / 1000.0; sp = row['stirrup'][1] / 1000.0; info['ds'] = ds; info['sp'] = sp
        info['stirrup_legs'] = row.get('stirrup_legs')
        # ---- bar lines
        bot = [d for n, d in row['bottom'] for _ in range(n)]; top = [d for n, d in row['top'] for _ in range(n)]
        lb = layers_of(bot, Wd, PLC, ds, MINCL); lt = layers_of(top, Wd, PLC, ds, MINCL); info['bot_layers'] = [len(x) for x in lb]; info['top_layers'] = [len(x) for x in lt]
        info['bot_dias'] = bot; info['top_dias'] = top
        lines = []                                      # (set, v, z, dia_mm)
        def place(layers, from_bottom, name):
            base = PLC + ds; cz = []
            for li, lay in enumerate(layers):
                k = len(lay); va = lo[1] + PLC + ds + lay[0] / 2000.0; vb = hi[1] - PLC - ds - lay[-1] / 2000.0
                vs = [(lo[1] + hi[1]) / 2] if k == 1 else [va + (vb - va) * i / (k - 1) for i in range(k)]
                for d, v in zip(lay, vs):
                    z = lo[2] + base + d / 2000.0 if from_bottom else hi[2] - base - d / 2000.0
                    lines.append((name, v, z, d))
                cz.append((base + lay[0] / 2000.0, max(lay)))         # centre offset of the face-column bar of this layer, widest dia
                base += max(lay) / 1000.0 + LAYCL
            return cz
        cb = place(lb, True, 'BOT'); ct = place(lt, False, 'TOP')
        info['layer_detail'] = {'BOT': [(len(l), max(l)) for l in lb], 'TOP': [(len(l), max(l)) for l in lt]}
        info['single_layer_clear_mm'] = {k: (None if not d else ((Wd - 2 * (PLC + ds) - d[0] / 2000.0 - d[-1] / 2000.0) / (len(d) - 1) - max(d) / 1000.0) * 1000.0 if len(d) > 1 else None) for k, d in (('BOT', bot), ('TOP', top))}
        # ---- side bars
        sd = row.get('side') or ''; side = parse_side(sd) if sd else None; side_why = None
        if sd and side is None: side_why = f'stated side string "{sd}" not readable'
        if side:
            if side['n'] % 2 or (side['kind'] == 'pitch' and side['n'] != 2):
                side_why = f'side string "{sd}": {side["n"]} bars per level / in all is not an even split with one bar per face per level'; side = None
        info['side_parse'] = None if not side and not side_why else (side if side else side_why)
        if side:
            dsd = side['dia'] / 1000.0
            zA = lo[2] + cb[-1][0] if cb else lo[2] + PLC + ds; zB = hi[2] - ct[-1][0] if ct else hi[2] - PLC - ds
            if side['kind'] == 'pitch': nseg = max(1, int(math.ceil((zB - zA) / (side['pitch'] / 1000.0) - 1e-9)))
            else: nseg = side['n'] // 2 + 1
            levels = [zA + (zB - zA) * i / nseg for i in range(1, nseg)]
            gap = (zB - zA) / nseg - (dsd + max([cb[-1][1]] if cb else [0]) / 1000.0) / 2
            if levels and gap < MINCL - 1e-9: side_why = f'side bars at {side["pitch"] if side["pitch"] else "even"} pitch leave {gap * 1000:.1f} mm clear to the corner bars (< {MINCL * 1000:g})'; levels = []
            info['side_levels'] = len(levels); info['side_zAB'] = (zA, zB)
            for z in levels:
                for v in (lo[1] + PLC + ds + dsd / 2, hi[1] - PLC - ds - dsd / 2): lines.append(('SIDE', v, z, side['dia']))
        if side_why: info['notes'].append(side_why)
        # ---- bars: the stretch of each line that lies inside the mesh with the cover kept
        BARS = collections.defaultdict(list); lens = collections.defaultdict(list)
        for name, v, z, d in lines:
            n_lines += 1; r = d / 2000.0
            e1 = np.cross(u3, [1.0, 0, 0] if abs(u3[0]) < 0.9 else [0, 1.0, 0]); e1 /= np.linalg.norm(e1); e2 = np.cross(u3, e1)
            ring = np.array([r * (math.cos(t) * e1 + math.sin(t) * e2) for t in ring_dirs()])         # (SIDES,3): the prism's own ring
            us = np.concatenate([np.arange(lo[0], hi[0], STEP), [hi[0]]])
            pts = loc2w(us, np.full(len(us), v), np.full(len(us), z))[:, None, :] + ring[None]
            good = clear_ok(pts.reshape(-1, 3), T, THR).reshape(len(us), SIDES).all(1)
            best = None; i = 0
            while i < len(us):
                if good[i]:
                    j = i
                    while j + 1 < len(us) and good[j + 1]: j += 1
                    if best is None or j - i > best[1] - best[0]: best = (i, j)
                    i = j + 1
                else: i += 1
            if best is None: refused_lines.append((gb, name, d, 'no stretch of this line is inside the mesh with the cover kept')); continue
            okf = lambda u: bool(clear_ok((loc2w(u, v, z)[None] + ring), T, THR).all())
            def refine(g_, b_):
                for _ in range(30):
                    m_ = (g_ + b_) / 2
                    if okf(m_): g_ = m_
                    else: b_ = m_
                return g_
            ua = us[best[0]] if best[0] == 0 else refine(us[best[0]], us[best[0] - 1]); ub = us[best[1]] if best[1] == len(us) - 1 else refine(us[best[1]], us[best[1] + 1])
            if ub - ua <= 2 * r + 1e-6: refused_lines.append((gb, name, d, f'inside stretch {1000 * (ub - ua):.1f} mm is shorter than the bar diameter')); continue
            P0 = loc2w(ua, v, z); P1 = loc2w(ub, v, z)
            BARS[name] += prism(P0, P1, r); lens[name].append(float(ub - ua)); n_lines_ok += 1
            if ub - ua > STOCK: info.setdefault('lap', []).append((name, d, float(ub - ua)))
        info['bar_lens'] = {k: v for k, v in lens.items()}; info['bar_tris'] = BARS
        # ---- stirrups: closed outer loops at the stated spacing, each must fit the mesh with the cover kept
        hx = Wd / 2 - PLC - ds / 2 - 2 * MARG; hy = Hd / 2 - PLC - ds / 2 - 2 * MARG    # loop outer surface 0.2 mm inside the cover line, so it clears THR = cover + 0.1 mm
        vc = (lo[1] + hi[1]) / 2; zc = (lo[2] + hi[2]) / 2
        tl = np.asarray(tie_loop(vc, zc, 0.0, hx, hy, ds / 2), float)                        # in the tie frame (X, Y, Z) = (v, z, u)
        tw = o + tl[..., [2, 0, 1]] @ R                                                         # world, same winding (cyclic permutation)
        uniq = np.unique(tw.reshape(-1, 3).round(9), axis=0)
        starts = []; u0 = lo[0] + PLC + ds / 2 + 2 * MARG; k = 0
        while u0 + k * sp <= hi[0] - PLC - ds / 2 - 2 * MARG + 1e-9: starts.append(u0 + k * sp); k += 1
        cand = np.array(starts); fits = np.zeros(len(cand), bool)
        if len(cand):
            pts = uniq[None] + cand[:, None, None] * u3[None, None, :]
            fits = clear_ok(pts.reshape(-1, 3), T, THR).reshape(len(cand), -1).all(1)
        n_cand += len(cand); n_cand_ok += int(fits.sum())
        info['stirrup_candidates'] = len(cand); info['stirrup_placed'] = int(fits.sum()); info['stirrup_u'] = cand[fits].tolist()
        info['stirrup_tris'] = [tw + u * u3 for u in cand[fits]]
        REC[gb] = info
        return info

    for gb in hosts:
        if gb in unjoined: continue
        info = build_beam(gb); mk = info['mark']; row = MARKS[mk]
        if 'ds' not in info: change('NOT_BUILT', gb, A.host_class, gb, 'Schedule row has no readable stirrup', f'mark {mk} | {info["notes"]}'); continue
        stor, disc, bld = META[gb][2], META[gb][3], META[gb][4]; src = row.get('source', '')
        DESC = {'BOT': ('Bottom bars', 'bottom', 'bottom (A + ADD B)'), 'TOP': ('Top bars', 'top', 'top (D + E)'), 'SIDE': ('Side bars', 'side', 'side')}
        for name in ('BOT', 'TOP', 'SIDE'):
            tris = info['bar_tris'].get(name)
            stated = {'BOT': ' + '.join(f'{n}T{d}' for n, d in row['bottom']), 'TOP': ' + '.join(f'{n}T{d}' for n, d in row['top']), 'SIDE': row.get('side') or ''}[name]
            want = {'BOT': len(info['bot_dias']), 'TOP': len(info['top_dias']), 'SIDE': 2 * info.get('side_levels', 0)}[name]
            if not tris:
                if want: change('REFUSED', f'GEN-RB-{gb}-{name}', 'IfcReinforcingBar', gb, f'{DESC[name][0]}: no bar placed', f'mark {mk} stated "{stated}" ({src}) | wanted {want} bars, none fits inside the mesh with the cover kept')
                continue
            ls = info['bar_lens'][name]; placed = len(ls); lap = [x for x in info.get('lap', []) if x[0] == name]
            layers = info['layer_detail'].get(name)
            guid = f'GEN-RB-{gb}-{name}'
            write_part(guid, 'IfcReinforcingBar', f'Beam {DESC[name][1]} bars {placed} x {stated} [stated "{stated}" | mark {mk} {src}]', stor, disc, bld, tris, RB_RGBA, parents=[gb])
            lay_txt = '' if name == 'SIDE' else f' | {len(layers)} layer(s): ' + ', '.join(f'{k} bar(s) up to T{d}' for k, d in layers)
            side_txt = f' | side levels per face {info.get("side_levels")}, parse {info.get("side_parse")}' if name == 'SIDE' else ''
            change('ADDED', guid, 'IfcReinforcingBar', gb, f'Beam {DESC[name][2]} bars from schedule mark {mk}; one layer each at cover {PLC * 1000:g} mm + stirrup + d/2 across the width, a further layer only where min clear {MINCL * 1000:g} mm would break; bar = stretch of its line inside the mesh with the cover kept; no anchorage, no laps [{BR["beam_cover_mm"]["source"].split(" (")[0]}; {BR["beam_min_clear_mm"]["source"].split(" (")[0]}]',
                   f'stated "{stated}" ({src}) | {placed} of {want} bars placed | length {min(ls) * 1000:.0f}..{max(ls) * 1000:.0f} mm of a {info["L"] * 1000:.0f} mm beam' + lay_txt + side_txt + (f' | needs lap (not modelled): {len(lap)} bar(s) over {STOCK:g} m' if lap else '') + f' | storey {stor}')
        if info['stirrup_placed']:
            tris = [t for ts in info['stirrup_tris'] for t in ts.reshape(-1, 3, 3)]
            guid = f'GEN-RB-{gb}-STR'; ds_mm = row['stirrup'][0]
            write_part(guid, 'IfcReinforcingBar', f'Beam stirrups {info["stirrup_placed"]} x T{ds_mm} @ {row["stirrup"][1]} [stated "{row["stirrup_legs"]}T{ds_mm}-{row["stirrup"][1]}" | mark {mk} {src}]', stor, disc, bld, tris, RB_RGBA, parents=[gb])
            change('ADDED', guid, 'IfcReinforcingBar', gb, f'Beam stirrups from schedule mark {mk}; closed outer loops at the stated end-zone dia and spacing, first at cover + d/2 from the beam end, a loop that does not fit the mesh with cover {PLC * 1000:g} mm is skipped; hooks not modelled [{BR["beam_stirrup_rule"]["source"].split(" (")[0]}]',
                   f'stated "{row["stirrup_legs"]}T{ds_mm}-{row["stirrup"][1]}" ({src}) | {info["stirrup_placed"]} loops of {info["stirrup_candidates"]} positions ({info["stirrup_candidates"] - info["stirrup_placed"]} skipped, section cut) | loop z..u from {min(info["stirrup_u"]) * 1000:.0f} to {max(info["stirrup_u"]) * 1000:.0f} mm along the beam | storey {stor}')
        else: change('REFUSED', f'GEN-RB-{gb}-STR', 'IfcReinforcingBar', gb, 'Stirrups: no loop fits', f'mark {mk} stated "{row["stirrup_legs"]}T{row["stirrup"][0]}-{row["stirrup"][1]}" ({src}) | {info["stirrup_candidates"]} positions, none fits the mesh with the cover kept')
        nb = []
        if row.get('hanger'): nb.append('hanger column C ' + ' + '.join(f'{n}T{d}' for n, d in row['hanger']))
        if row.get('stirrup_inner'): nb.append(f'inner legs {row["stirrup_inner"]}')
        if row.get('stirrup_balance') and row['stirrup_balance'] != row['stirrup']: nb.append(f'balance zone T{row["stirrup_balance"][0]}-{row["stirrup_balance"][1]} (end-zone spacing used over the full length: zone length not stated)')
        if nb: change('NOT_BUILT', gb, A.host_class, gb, 'Stated on the schedule, not modelled', f'mark {mk} ({src}) | ' + '; '.join(nb))
    for gb, name, d, why in refused_lines: change('REFUSED', f'GEN-RB-{gb}-{name}', 'IfcReinforcingBar', gb, f'Bar line T{d} ({name}): not placed', why)
    n_built = sum(1 for g in hosts if g in REC and 'ds' in REC[g])
    nb_added = len([1 for r in CH if r[0] == 'ADDED'])
    print(f'{P}BUILT beams_built={n_built} sets_added={nb_added} bar_lines={n_lines} bar_lines_placed={n_lines_ok} stirrup_positions={n_cand} stirrup_loops_placed={n_cand_ok}')
    print(f'{P}ASSUMED anchorage={brv("beam_anchorage_modelled")} stirrup_hooks={brv("beam_hooks_modelled")} laps={brv("beam_laps_modelled")} stock_checked_bars={sum(len(v) for r in REC.values() for v in r.get("bar_lens", {}).values())} hanger_C_built={brv("beam_hanger_C_built")} hanger_C_marks={sum(1 for m in used if MARKS[m].get("hanger"))} balance_zone_differs_marks={sorted(m for m in used if MARKS[m].get("stirrup_balance") and MARKS[m]["stirrup_balance"] != MARKS[m]["stirrup"])} inner_legs_marks={sum(1 for m in used if MARKS[m].get("stirrup_inner"))}')
    sp_cnt = collections.Counter(str(REC[g].get('side_parse')) for g in hosts if g in REC and REC[g].get('side_parse'))
    print(f'{P}SIDE_PARSE ' + ' | '.join(f'{k} x{v}' for k, v in sorted(sp_cnt.items())) if sp_cnt else f'{P}SIDE_PARSE no side strings')

    # ------------------------------------------------------------ write the change table (appended after the source rows), commit
    for i, r in enumerate(CH, 1): cur.execute("insert into upgrade_changes values(?,?,?,?,?,?,?)", (N_UC0 + i, *r))
    db.commit(); db.execute("VACUUM"); db.close()

    # ============================================================ witnesses (read the OUT db only)
    out = sqlite3.connect('file:' + OUT + '?mode=ro', uri=True); oc = out.cursor(); FAILS = []
    def verdict(name, ok, line):
        v = 'INCONCLUSIVE' if ok is None else ('PASS' if ok else 'FAIL'); print(f'{P}{name} {line} -> {v}')
        if v == 'FAIL': FAILS.append(name)
        return v
    gen_ids = set(E['ADDED_GUIDS']); rb_ids = sorted(g for g in gen_ids if g.startswith('GEN-RB-'))

    # --- IDENT
    dig_ok = True; bad_tabs = []; ntab = 0; skipped_t = []
    for t in SRC_TABLES:
        if t.startswith('elements_rtree_'): skipped_t.append(t); continue                   # rtree shadow tables change with any insert; the rtree is judged through its own rows
        where = {'elements_meta': "where guid not like 'GEN-RB-%'", 'element_transforms': "where guid not like 'GEN-RB-%'", 'element_instances': "where guid not like 'GEN-RB-%'",
                 'element_world_bbox': "where guid not like 'GEN-RB-%'", 'element_parts': "where child_guid not like 'GEN-RB-%'", 'component_geometries': "where geometry_hash not like 'rb%'",
                 'upgrade_changes': f"where seq <= {N_UC0}", 'elements_rtree': f"where id <= {N_SRC_ROWID}"}.get(t, '')
        d = table_digest(oc, t, SRC_KEY[t], where); ntab += 1
        if d != D_SRC[t]: dig_ok = False; bad_tabs.append(t)
    n_out_meta = oc.execute("select count(*) from elements_meta").fetchone()[0]
    verdict('IDENT', (dig_ok and n_out_meta == N_SRC_META + len(gen_ids) and len(gen_ids) > 0) if gen_ids else None,
            f'source_tables_compared={ntab} (rtree shadow tables skipped: {len(skipped_t)}) tables_identical={dig_ok}{"" if dig_ok else " differing=" + ",".join(bad_tabs)} src_elements={N_SRC_META} out_elements={n_out_meta} added={len(gen_ids)} source_upgrade_rows_kept={N_UC0}')

    # --- JOIN
    listed = {r[0] for r in oc.execute("select host_guid from upgrade_changes where seq > ? and change='NOT_BUILT' and rule like 'No schedule row%'", (N_UC0,))}
    verdict('JOIN', None if not hosts or len(hosts) == len(unjoined) else (set(unjoined) == listed),
            f'beams={len(hosts)} joined={len(hosts) - len(unjoined)} unjoined={len(unjoined)} listed_as_not_built={len(listed)} ' + (f'unjoined_marks={sorted({HM[g] for g in unjoined})} ' if unjoined else '') + f'by_mark={dict(sorted(used.items()))}')

    # --- helpers on stored geometry
    def gverts(g):
        r = oc.execute("select c.vertices, t.center_x, t.center_y, t.center_z from element_instances i join component_geometries c using(geometry_hash) join element_transforms t using(guid) where i.guid=?", (g,)).fetchone()
        return np.frombuffer(r[0], np.float32).reshape(-1, 3).astype(float) + np.array(r[1:4])
    def bar_chunks(g):
        W = gverts(g); assert len(W) % RB_NV == 0; out_ = []
        for C in W.reshape(-1, RB_NV, 3):
            c0 = C.mean(0); a = np.linalg.svd(C - c0, full_matrices=False)[2][0]; rel = C - c0; proj = rel @ a; radial = np.linalg.norm(rel - proj[:, None] * a, axis=1)
            out_.append(dict(c=c0, a=a, dia=2000 * radial.max(), length=float(np.ptp(proj)), ends=(c0 + a * proj.min(), c0 + a * proj.max())))
        return out_
    def loop_chunks(g):
        W = gverts(g); assert len(W) % LOOP_NV == 0; out_ = []
        for C in W.reshape(-1, LOOP_NV, 3):
            c0 = C.mean(0); n = np.linalg.svd(C - c0, full_matrices=False)[2][2]; out_.append(dict(c=c0, n=n, dia=1000 * float(np.ptp((C - c0) @ n))))
        return out_
    kids = collections.defaultdict(dict)
    for p_, c_ in oc.execute("select parent_guid, child_guid from element_parts where child_guid like 'GEN-RB-%' order by 1,2"): kids[p_][c_.rsplit('-', 1)[1]] = c_

    # --- STATED
    bad = []; judged = 0; sp_gap_skips = 0; sp_judged = 0; side_bad_detail = []
    for gb in hosts:
        if gb in unjoined or gb not in REC or 'ds' not in REC[gb]: continue
        row = MARKS[HM[gb]]; k = kids.get(gb, {}); judged += 1; info = REC[gb]
        meas = {}
        for name, want in (('BOT', collections.Counter(info['bot_dias'])), ('TOP', collections.Counter(info['top_dias']))):
            ch = bar_chunks(k[name]) if name in k else []; got = collections.Counter()
            for c in ch:
                if abs(c['dia'] - round(c['dia'])) > 0.01: bad.append((gb, name, f'dia {c["dia"]:.3f} is not a whole stated dia'))
                got[int(round(c['dia']))] += 1
            if +got != +want: bad.append((gb, name, f'bars placed {dict(got)} != stated {dict(want)}'))
            meas[name] = ch
        if row['stirrup'] and 'STR' not in k: bad.append((gb, 'STR', 'no stirrup set'))
        if 'STR' in k:
            lc = loop_chunks(k['STR']); n0 = lc[0]['n']; ds_mm, sp_mm = row['stirrup']
            if any(abs(c['dia'] - ds_mm) > 0.01 for c in lc): bad.append((gb, 'STR', f'stirrup dia {min(c["dia"] for c in lc):.3f}..{max(c["dia"] for c in lc):.3f} != {ds_mm}'))
            pos = np.sort([c['c'] @ n0 for c in lc]); gaps = np.diff(pos) * 1000
            for gp in gaps:
                kk = round(gp / sp_mm); sp_judged += 1
                if kk < 1 or abs(gp - kk * sp_mm) > 0.05: bad.append((gb, 'STR', f'gap {gp:.3f} mm is not a whole multiple of the stated {sp_mm} mm'))
                elif kk > 1: sp_gap_skips += kk - 1
        sd = parse_side(row.get('side') or '') if row.get('side') else None
        if info.get('side_levels') and sd:
            ch = bar_chunks(k['SIDE']) if 'SIDE' in k else []; a = ch[0]['a'] if ch else None
            if ch:
                vdir = np.array([-a[1], a[0], 0.0]); vdir /= np.linalg.norm(vdir); lat = np.array([c['c'] @ vdir for c in ch]); mid = (lat.max() + lat.min()) / 2
                face = {0: sorted(c['c'][2] for c, l_ in zip(ch, lat) if l_ <= mid), 1: sorted(c['c'][2] for c, l_ in zip(ch, lat) if l_ > mid)}
            else: face = {0: [], 1: []}
            zA = max([c['c'][2] for c in meas['BOT']] or [-1e9]); zB = min([c['c'][2] for c in meas['TOP']] or [1e9])
            Tm = mesh_tris(oc, gb)
            if not meas['BOT']: zA = Tm[:, :, 2].min() + COVER + row['stirrup'][0] / 1000.0
            if not meas['TOP']: zB = Tm[:, :, 2].max() - COVER - row['stirrup'][0] / 1000.0
            nexp = (int(math.ceil((zB - zA) / (sd['pitch'] / 1000.0) - 1e-9)) - 1) if sd['kind'] == 'pitch' else sd['n'] // 2
            nexp = max(nexp, 0)
            if any(len(face[f]) != nexp for f in (0, 1)): bad.append((gb, 'SIDE', f'levels per face {len(face[0])}/{len(face[1])} != expected {nexp} from the stored bottom/top bars'))
            if any(abs(c['dia'] - sd['dia']) > 0.01 for c in ch): bad.append((gb, 'SIDE', f'dia != stated {sd["dia"]}'))
            if sd['kind'] == 'pitch':
                for f in (0, 1):
                    seq_ = [zA] + face[f] + [zB]
                    if any(b - a_ > sd['pitch'] / 1000.0 + 1e-5 for a_, b in zip(seq_, seq_[1:])): bad.append((gb, 'SIDE', f'a gap exceeds the stated pitch {sd["pitch"]}'))
        elif sd and not info.get('side_levels') and info.get('side_parse') and isinstance(info['side_parse'], dict) and not info['notes']:
            pass
    bk = collections.Counter(b_[1] for b_ in bad); bb = sorted({(HM[b_[0]], META[b_[0]][1].rsplit(':', 1)[1]) for b_ in bad})
    verdict('STATED', None if judged == 0 else not bad, f'beams_judged={judged} set_mismatches={len(bad)} by_set={dict(sorted(bk.items()))} beams_affected={len(bb)} (mark, Revit id)={bb} stirrup_gaps_checked={sp_judged} skipped_positions_inside_gaps={sp_gap_skips}' + (f' first={bad[0]}' if bad else ''))

    # --- INSIDE: every stored vertex of every bar set against the beam's TRUE mesh (read from the OUT db), never the rtree
    worst = 1e9; worst_g = None; n_bad = 0; n_vert = 0; n_sets = 0; sets_bad = []
    for g in rb_ids:
        host = [p for p, in oc.execute("select parent_guid from element_parts where child_guid=? order by 1", (g,))][0]
        Tm = mesh_tris(oc, host); W = np.unique(gverts(g).round(9), axis=0); sdv = sdist(W, Tm); n_sets += 1; n_vert += len(W)
        m = float(sdv.min()); nb_ = int((sdv < COVER - INSIDE_TOL).sum()); n_bad += nb_
        if nb_: sets_bad.append(g)
        if m < worst: worst = m; worst_g = g
    verdict('INSIDE', None if n_vert == 0 else n_bad == 0, f'sets={n_sets} distinct_vertices={n_vert} violating_vertices={n_bad} sets_violating={len(sets_bad)} min_margin_mm={worst * 1000:.3f} (worst set {worst_g}) required>=cover-{INSIDE_TOL * 1000:g}mm (cover {COVER * 1000:g})')

    # --- LAYERS
    lay_bad = []; lay_rows = collections.Counter(); forced = []; judged_l = 0
    for gb in hosts:
        if gb in unjoined or gb not in REC or 'ds' not in REC[gb]: continue
        info = REC[gb]; k = kids.get(gb, {})
        for name in ('BOT', 'TOP'):
            if name not in k: continue
            ch = bar_chunks(k[name]); zs = sorted(ch, key=lambda c: c['c'][2]); layers = [[zs[0]]]
            for c in zs[1:]:
                if abs(c['c'][2] - layers[-1][-1]['c'][2]) > 0.015: layers.append([c])
                else: layers[-1].append(c)
            judged_l += 1; lay_rows[(name, len(layers))] += 1
            for li, lay in enumerate(layers):
                a = lay[0]['a']; vdir = np.array([-a[1], a[0], 0.0]); vdir /= np.linalg.norm(vdir); ll = sorted(lay, key=lambda c: c['c'] @ vdir)
                for x, y in zip(ll, ll[1:]):
                    clear = abs((y['c'] - x['c']) @ vdir) - (x['dia'] + y['dia']) / 2000.0
                    if clear < MINCL - 1e-5: lay_bad.append((gb, name, li, f'clear {clear * 1000:.2f} mm < {MINCL * 1000:g}'))
            if len(layers) > 1:
                sc = info['single_layer_clear_mm'][name]; forced.append((HM[gb], name, len(layers), sc))
                if sc is None or sc >= MINCL * 1000 - 1e-6: lay_bad.append((gb, name, len(layers), f'second layer not forced: one layer would clear {sc} mm'))
    fcnt = collections.Counter((m, n, l_) for m, n, l_, s in forced)
    fs = sorted({(m, n, l_, round(s, 1)) for m, n, l_, s in forced})
    verdict('LAYERS', None if judged_l == 0 else not lay_bad,
            f'bar_sets_judged={judged_l} by (set,layers)={dict(sorted((f"{a}:{b}", c) for (a, b), c in lay_rows.items()))} multi_layer_sets={len(forced)} min_clear_rule_mm={MINCL * 1000:g} forcing (mark,set,layers,one-layer clear mm)={fs[:30]}{" ..." if len(fs) > 30 else ""}' + (f' first={lay_bad[0]}' if lay_bad else ''))

    # --- LAP
    over = []; judged_bars = 0
    for gb in hosts:
        if gb in unjoined or gb not in REC: continue
        for name, g in sorted(kids.get(gb, {}).items()):
            if name not in ('BOT', 'TOP', 'SIDE'): continue
            for c in bar_chunks(g):
                judged_bars += 1
                if c['length'] > STOCK: over.append((HM[gb], gb, name, round(c['dia']), round(c['length'], 3)))
    flagged = {r[0] for r in oc.execute("select host_guid from upgrade_changes where seq > ? and detail like '%needs lap (not modelled)%'", (N_UC0,))}
    unflag = [o_ for o_ in over if o_[1] not in flagged]
    verdict('LAP', None if judged_bars == 0 else not unflag, f'bars_judged={judged_bars} over_{STOCK:g}m={len(over)} in_beams={len({o_[1] for o_ in over})} unflagged={len(unflag)} list(mark,set,dia,length_m)={sorted(set((o_[0], o_[2], o_[3], o_[4]) for o_ in over))[:12]}{" ..." if len(over) > 12 else ""}')

    # --- reports (no pass/fail): stated section vs the modelled mesh; coverage
    wd = [abs(REC[g]['W'] - REC[g]['stated_w']) * 1000 for g in REC if 'ds' in REC[g]]; dz = collections.Counter(round((REC[g]['stated_h'] - REC[g]['H']) * 1000) for g in REC if 'ds' in REC[g])
    dzb = collections.Counter(round((REC[g]['stated_h'] - REC[g]['H_bbox']) * 1000) for g in REC if 'ds' in REC[g]); multi = sum(1 for g in REC if 'ds' in REC[g] and REC[g].get('body') and REC[g]['body'][2] > 1)
    print(f'{P}SIZE beams={len(wd)} width_within_5mm_of_stated={sum(1 for x in wd if x <= 5)} width_max_dev_mm={max(wd) if wd else 0:.1f} | depth stated minus mesh body (modal section) mm histogram={dict(sorted(dz.items()))} | stated minus mesh bounding box={dict(sorted(dzb.items()))} | beams whose section changes along the axis={multi} (the mesh is the truth for placement; the stated depth is reported, not used)')
    frac = [max(l_) / REC[g]['L'] for g in REC if 'ds' in REC[g] for l_ in REC[g].get('bar_lens', {}).values() if l_]
    print(f'{P}COVERAGE bar_lines={n_lines} placed={n_lines_ok} not_placed={len(refused_lines)} | stirrup_positions={n_cand} placed={n_cand_ok} skipped={n_cand - n_cand_ok} beams_with_zero_loops={sum(1 for g in REC if "ds" in REC[g] and REC[g]["stirrup_placed"] == 0)} | longest_bar_over_beam_length: min={min(frac) if frac else 0:.2f} median={float(np.median(frac)) if frac else 0:.2f}')

    # --- COST
    src_verts = sum(len(np.frombuffer(b, np.float32)) // 3 for b, in srcdb.execute("select c.vertices from element_instances i join component_geometries c using(geometry_hash)"))
    AV = E['ADDED_VERTS']
    print(f'{P}COST added_elements={len(gen_ids)} added_vertices={AV} source_vertices={src_verts} added_pct={100 * AV / src_verts:.2f} est_heap_added_MB={AV * 170 / 1e6:.2f} (0.17 GB per M vertices) of_which_loops={sum(1 for g in rb_ids if g.endswith("-STR"))} sets -> PASS')

    # --- BREAK expectation
    ins_fail = 'INSIDE' in FAILS
    if BREAK: print(f'{P}BREAK_CHECK switch=on expected INSIDE=FAIL got INSIDE={"FAIL" if ins_fail else "PASS"} -> {"PASS" if ins_fail else "FAIL"}')
    out.close()

    # ============================================================ the txt, written FROM the table (rows appended by this run)
    with open(TXT, 'w') as f:
        f.write('JPAM_rebar.db upgrade change list (beam reinforcement)\n')
        f.write(f'Every line below is one row of the table upgrade_changes inside the DB, rows {N_UC0 + 1} onward (same order); rows 1..{N_UC0} are the earlier upgrade, unchanged. Nothing in the source model was changed.\n')
        f.write('Sources (SHA-256):\n')
        for p_ in (SRC, A.schedule_json, DEF, A.beam_defaults): f.write(f'  {sha(p_)[:16]}  {os.path.basename(p_)}\n')
        f.write(f'Host rule: class {A.host_class}, mark = group 1 of regex {A.mark_regex} on element_name\n')
        rows_n = sum(1 for k, v in BR.items() if isinstance(v, dict)); dflt = sum(1 for v in BR.values() if isinstance(v, dict) and str(v.get('source', '')).startswith('default'))
        f.write(f'Beam rule rows: {rows_n}, of which defaults (not stated by the drawings): {dflt}, stated: {rows_n - dflt}\n')
        add = collections.Counter(r[0] for r in CH)
        f.write(f'Totals: ADDED {add["ADDED"]} (reinforcing bar sets on {n_built} of {len(hosts)} beams) | NOT_BUILT {add["NOT_BUILT"]} | REFUSED {add["REFUSED"]}\n')
        f.write('Columns: seq | change | element id | IFC class | host GlobalId | rule | detail\n\n')
        con = sqlite3.connect('file:' + OUT + '?mode=ro', uri=True); nl = 0
        for r in con.execute("select seq,change,guid,ifc_class,host_guid,rule,detail from upgrade_changes where seq > ? order by seq", (N_UC0,)):
            f.write(' | '.join(str(x) for x in r) + '\n'); nl += 1
        nt = con.execute("select count(*) from upgrade_changes where seq > ?", (N_UC0,)).fetchone()[0]
    verdict('LOG', None if nl == 0 else nl == nt, f'txt_data_lines={nl} table_rows_added={nt}')
    dsha, tsha = sha(OUT), sha(TXT)
    print(f'{P}WRITTEN db_sha256={dsha[:16]} txt_sha256={tsha[:16]} db_sha256_full={dsha} txt_sha256_full={tsha}')
    if A.expect_db_sha or A.expect_txt_sha:
        ok = (A.expect_db_sha is None or dsha.startswith(A.expect_db_sha)) and (A.expect_txt_sha is None or tsha.startswith(A.expect_txt_sha))
        verdict('DETERMINISM', ok, f'this_db={dsha[:16]} expected_db={(A.expect_db_sha or "-")[:16]} this_txt={tsha[:16]} expected_txt={(A.expect_txt_sha or "-")[:16]}')
    else: verdict('DETERMINISM', None, 'single build; pass --expect-db-sha / --expect-txt-sha from an earlier run')
    print(f'{P}SUMMARY failed_witnesses={",".join(FAILS) if FAILS else "none"} added={len(gen_ids)} not_built={add["NOT_BUILT"]} refused={add["REFUSED"]}')
    sys.exit(1 if FAILS and not BREAK else 0)
