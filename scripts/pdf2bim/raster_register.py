# Implementing PDF2BIM_VECTOR_PROBE.md §43.17 step A (consensus rule) — Witness: W-S17r (the EG sheet registered to the OG sheet by tick pattern)
# Usage: python3 -P raster_register.py <p3 workdir (chains.json)> <p4 workdir (chains.json)>  > raster_register.log ; writes <p3 work>/register.json
# Tick positions are geometry (no OCR). Both sheets show the same exterior, so ONE map per axis, p3_px = s * p4_px + t, carries every common tick.
import sys, os, json
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def log(*a): print(*a, flush=True)

w3, w4 = sys.argv[1], sys.argv[2]
C3 = json.load(open(os.path.join(w3, 'chains.json'))); C4 = json.load(open(os.path.join(w4, 'chains.json')))
out_p = os.path.join(w3, 'register.json')
if os.path.exists(out_p): os.remove(out_p)
F3 = C3.get('dpi', 200) / 200.0
TOL = float(os.environ.get("REG_TOL_PX", "2.0")) * F3; S_LO, S_HI = 0.4, 1.0
K4 = C4['scale_px_per_m']

def ticks(c): return c['ticks_x'] if c['dir'] == 'H' else c['ticks_y']
def periodic(t):
    d = np.diff(t); return len(t) >= 10 and d.std() / d.mean() < 0.1

def score(T4, P3, s, t):
    r = np.abs(P3[None, :] - (s * T4 + t)[:, None]).min(axis=1); return int((r <= TOL).sum()), r

def lines(C, d, tag):
    """dimension lines of one axis: ticks pooled per line position (± 3 px); tread/hatch fields excluded"""
    ls = []
    for c in C['chains']:
        if c['dir'] != d: continue
        if periodic(ticks(c)):
            log(f"§RASTER_REG_PERIODIC sheet={tag} axis={d} line={c.get('line_y', c.get('line_x'))} ticks={len(ticks(c))} excluded (tread/hatch field)"); continue
        lp = c.get('line_y', c.get('line_x'))
        for L in ls:
            if abs(L['pos'] - lp) <= 3 * F3: L['t'] |= set(ticks(c)); break
        else: ls.append(dict(pos=lp, t=set(ticks(c)), verdict=c['verdict']))
    for L in ls: L['t'] = np.array(sorted(L['t']), dtype=float)
    return ls

def best_fit(T4, P3):
    """best (n, s, t, rms) of ONE chain onto ONE line: candidates from tick pairs, refined by least squares on the inliers"""
    best = (0, None, None, None)
    for i in range(len(T4)):
        for j in range(i + 1, len(T4)):
            a, b = T4[i], T4[j]
            if b - a < 50: continue
            for pa in P3:
                for pb in P3[(P3 >= pa + S_LO * (b - a)) & (P3 <= pa + S_HI * (b - a))]:
                    s = (pb - pa) / (b - a); t = pa - s * a; n, r = score(T4, P3, s, t)
                    if n < 3 or n < best[0]: continue
                    inl = r <= TOL; P = np.array([P3[np.abs(P3 - (s * x + t)).argmin()] for x in T4[inl]])
                    s2, t2 = np.polyfit(T4[inl], P, 1); n2, r2 = score(T4, P3, s2, t2)
                    if n2 > best[0]: best = (n2, float(s2), float(t2), float(np.sqrt((r2[r2 <= TOL] ** 2).mean())))
    return best

def accepted(n, T4): return n >= 6 and n >= 2 * len(T4) / 3

res = {}
for d in ('H', 'V'):
    L4 = [c for c in C4['chains'] if c['dir'] == d and len(ticks(c)) >= 6 and not periodic(ticks(c))]
    L3 = lines(C3, d, 'p3'); hits = []; fals = 0
    for c4 in L4:
        T4 = np.array(ticks(c4), dtype=float); Tm = T4[0] + (T4[-1] - T4)[::-1]      # mirrored: segment order reversed
        for L in L3:
            n, s, t, rms = best_fit(T4, L['t'])
            if accepted(n, T4):
                hits.append(dict(p4_line=c4.get('line_y', c4.get('line_x')), p4_verdict=c4['verdict'], p4_ticks=len(T4), p3_line=L['pos'], n=n, s=s, t=t, rms=rms))
                log(f"§RASTER_REG_MATCH axis={d} p4_line={hits[-1]['p4_line']} ({c4['verdict']}, {len(T4)} ticks) -> p3_line={L['pos']} matched={n}/{len(T4)} s={s:.5f} t={t:.1f} rms_px={rms:.2f}")
            nm = best_fit(Tm, L['t'])[0]
            if accepted(nm, Tm): fals += 1; log(f"§RASTER_REG_FALSIFIER axis={d} mirrored p4_line={c4.get('line_y', c4.get('line_x'))} -> p3_line={L['pos']} matched={nm}/{len(Tm)} (a mirrored chain must not match)")
    if not hits: log(f"§RASTER_W-S17r axis={d} p4_chains={len(L4)} p3_lines={len(L3)} verdict=VACUOUS (no chain matched one line)"); res[d] = None; continue
    ss = np.array([h['s'] for h in hits]); sm = float(np.median(ss)); spread = float((ss.max() - ss.min()) / sm)
    ok = spread <= 0.005 and fals == 0
    log(f"§RASTER_W-S17r axis={d} matches={len(hits)} s_median={sm:.5f} spread={spread:.2%} mirrored_matches={fals} verdict={'PASS' if ok else 'INCONCLUSIVE'}")
    res[d] = dict(s=sm, spread=spread, matches=hits, falsifier=fals, ok=ok)

# §43.17 two-stage: V takes s from H (one print), only the offset t_V is searched; >= 5 ticks within TOL; all matches agree on t_V
if res.get('H') and res['H']['ok'] and not res.get('V'):
    sH = res['H']['s']; hits = []; fals = 0
    def best_t(T4, P3):
        best = (0, None)
        for x in T4:
            for p in P3:
                t = p - sH * x; n, r = score(T4, P3, sH, t)
                if n > best[0]:
                    inl = r <= TOL; P = np.array([P3[np.abs(P3 - (sH * v + t)).argmin()] for v in T4[inl]])
                    t2 = float(np.mean(P - sH * T4[inl])); n2, _ = score(T4, P3, sH, t2); best = (max(n, n2), t2 if n2 >= n else t)
        return best
    L4 = [c for c in C4['chains'] if c['dir'] == 'V' and len(ticks(c)) >= 6 and not periodic(ticks(c))]
    for c4 in L4:
        T4 = np.array(ticks(c4), dtype=float); Tm = T4[0] + (T4[-1] - T4)[::-1]
        for L in lines(C3, 'V', 'p3'):
            n, t = best_t(T4, L['t'])
            if n >= 5:
                _, r = score(T4, L['t'], sH, t); inl = r <= TOL
                P = np.array([L['t'][np.abs(L['t'] - (sH * v + t)).argmin()] for v in T4[inl]]); sf = float(np.polyfit(T4[inl], P, 1)[0])
                hits.append(dict(p4_line=c4['line_x'], p4_verdict=c4['verdict'], p4_ticks=len(T4), p3_line=L['pos'], n=n, t=t, s_free=sf))
                log(f"§RASTER_REG_MATCH_V axis=V p4_line={c4['line_x']} ({c4['verdict']}, {len(T4)} ticks) -> p3_line={L['pos']} matched={n}/{len(T4)} t_V={t:.1f} (s fixed {sH:.5f}; free fit s={sf:.5f})")
            if best_t(Tm, L['t'])[0] >= 5: fals += 1; log(f"§RASTER_REG_FALSIFIER axis=V mirrored p4_line={c4['line_x']} -> p3_line={L['pos']}")
    if hits:
        tt = np.array([h['t'] for h in hits]); tspread = float(tt.max() - tt.min()); sfm = float(np.median([h['s_free'] for h in hits]))
        ok = tspread <= TOL and fals == 0 and abs(sfm - sH) / sH <= 0.005
        log(f"§RASTER_W-S17r axis=V (two-stage) matches={len(hits)} t_V_median={np.median(tt):.1f} t_spread_px={tspread:.1f} s_free_median={sfm:.5f} vs s_H {sH:.5f} ({abs(sfm - sH) / sH:.2%}) mirrored={fals} verdict={'PASS' if ok else 'INCONCLUSIVE'}")
        res['V'] = dict(s=sH, t=float(np.median(tt)), s_free=sfm, matches=hits, falsifier=fals, ok=ok, two_stage=True)
    else: log("§RASTER_W-S17r axis=V (two-stage) verdict=VACUOUS")
# §43.17 run 4: the V scale witness = the legend field (periodic, so it fixes s only); the V offset from the exterior pattern
if res.get('H') and res['H']['ok'] and not res.get('V'):
    sH = res['H']['s']
    per4 = [c for c in C4['chains'] if c['dir'] == 'V' and periodic(ticks(c))]; per3 = [c for c in C3['chains'] if c['dir'] == 'V' and periodic(ticks(c))]
    s_leg = None
    for c4 in per4:
        for c3 in per3:
            if len(ticks(c4)) == len(ticks(c3)):
                s_leg = float(np.polyfit(np.array(ticks(c4), float), np.array(ticks(c3), float), 1)[0])
                log(f"§RASTER_REG_VSCALE periodic field p4_line={c4['line_x']} ({len(ticks(c4))} ticks) <-> p3_line={c3['line_x']} ({len(ticks(c3))}) free-fit s={s_leg:.5f} vs s_H {sH:.5f} ({abs(s_leg - sH) / sH:.2%}) (scale only: a periodic field fixes no position)")
    from raster_body import anchor_chains
    _, _, gv4 = anchor_chains(C4)
    if gv4:
        T = np.array(ticks(gv4[0]), float); E = np.array([T[0], T[1], T[-2], T[-1]])
        sup = []
        for L in lines(C3, 'V', 'p3'):
            for p in L['t']:
                for e0 in (E[0], E[-1]):
                    t = p - sH * e0; r = np.abs(L['t'][None, :] - (sH * E + t)[:, None]).min(axis=1)
                    if (r <= TOL).sum() >= 3 and r[0] <= TOL and r[-1] <= TOL:
                        P = np.array([L['t'][np.abs(L['t'] - (sH * v + t)).argmin()] for v in E[r <= TOL]]); t2 = float(np.mean(P - sH * E[r <= TOL]))
                        if not any(abs(x['t'] - t2) < 0.01 and x['line'] == L['pos'] for x in sup): sup.append(dict(line=L['pos'], t=t2, hits=int((r <= TOL).sum())))
        for x in sup: log(f"§RASTER_REG_VOFFSET p3_line={x['line']} exterior_ticks_hit={x['hits']}/4 t_V={x['t']:.1f}")
        best = None
        for x in sup:
            grp = [y for y in sup if abs(y['t'] - x['t']) <= TOL]; lines_ = {y['line'] for y in grp}
            if len(lines_) >= 2 and (best is None or len(lines_) > best[0]): best = (len(lines_), float(np.median([y['t'] for y in grp])), sorted(lines_), max(y['t'] for y in grp) - min(y['t'] for y in grp))
        if best:
            ok = (s_leg is None or abs(s_leg - sH) / sH <= 0.005)
            log(f"§RASTER_W-S17r axis=V (exterior pattern) supporting_lines={best[2]} t_V={best[1]:.1f} spread_px={best[3]:.1f} s=s_H {sH:.5f} legend_s={'%.5f' % s_leg if s_leg else 'none'} verdict={'PASS' if ok else 'INCONCLUSIVE'}")
            res['V'] = dict(s=sH, t=best[1], s_free=s_leg if s_leg else sH, matches=[], support=sup, ok=ok, rule='exterior pattern + legend scale')
        else: log(f"§RASTER_W-S17r axis=V (exterior pattern) supports={len(sup)} verdict=VACUOUS (no offset backed by 2 lines)")

for d in ('H', 'V'):   # one offset per axis = the median t of its matches
    if res.get(d) and 't' not in res[d]: res[d]['t'] = float(np.median([h['t'] for h in res[d]['matches']]))

if not res.get('H') or not res.get('V'):   # §43.18: the H map is still written (stage C reads it), marked partial
    if res.get('H') and res['H']['ok']:
        json.dump(dict(spec='§43.17 step A', ok=False, partial='H only', map={'H': res['H']}, scale_px_per_m={'H': K4['H'] * res['H']['s'], 'V': K4['V'] * res['H']['s']}),
                  open(out_p, 'w'), indent=1)
    sys.exit(log("§RASTER_W-S17r verdict=VACUOUS (an axis has no match)" + (' | register.json written with the H map only' if res.get('H') and res['H']['ok'] else '')))
agree = abs(res['H']['s'] - res['V'].get('s_free', res['V']['s'])) / res['H']['s']
K3 = {'H': K4['H'] * res['H']['s'], 'V': K4['V'] * res['V']['s']}
ok = res['H']['ok'] and res['V']['ok'] and agree <= 0.005
log(f"§RASTER_W-S17r s_H={res['H']['s']:.5f} s_V={res['V']['s']:.5f} agree={agree:.2%} -> p3 px/m H={K3['H']:.3f} V={K3['V']:.3f} "
    f"paper 1:{C3.get('dpi', 200) / 0.0254 / K3['H']:.1f} verdict={'PASS' if ok else 'INCONCLUSIVE'}")
for c in C3['chains']:   # (d) the one unchecked p3 read, a cross-check only
    for sg in c['segs']:
        if sg.get('txt') == '6,77^5':
            log(f"§RASTER_W-S17r_XCHECK p3 single read '6,77^5' spans {sg['R'] - sg['L']} px = {(sg['R'] - sg['L']) / K3[c['dir']]:.3f} m at the registered scale (cross-check only)")
json.dump(dict(spec='§43.17 step A', ok=ok, map=res, scale_px_per_m=K3), open(out_p, 'w'), indent=1)
