#!/usr/bin/env python3
# ⚠ DO NOT REMOVE: scope = lane spec §L1 / §L1.1 (bim-ootb prompts/DXF2BIM_MODELLER_LANE.md), tests W1-W7
# for the standard 2D set written by std2d.py. Read the log after every run (exit code is not evidence).
# Expectations are recomputed here from the DB with their own queries (not std2d's functions).
# The source IFC (when given) is the independent oracle for door swing/hinge (W5) and storey elevations (W6).
"""
Usage:
    python3 test_std2d.py <DX_extracted.db> [--ifc Duplex_ARC.ifc] [--old-dir DIR]
      --old-dir: folder with the earlier timestamped DX_FLOOR_*_20260428_0636.dxf (INFO only:
                 how many of their door arcs agree with the IFC)
Prints PASS/FAIL per test with the issue it proves; also writes output/STD/test_std2d.log.
"""
import os
import sys
import glob
import shutil
import sqlite3
import hashlib
import argparse
import tempfile

import numpy as np
import ezdxf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import std2d  # noqa: E402  (writer under test; only write_std_set is called)

TOL = 0.5          # mm, W3/W6
GRID_TOL = 0.5     # mm, W2 (grid position vs expected mean)
OUT_LINES = []
FAILS = []


def say(s):
    print(s)
    OUT_LINES.append(s)


def check(tid, issue, ok, detail):
    say(f"{'PASS' if ok else 'FAIL'} {tid} | {issue} | {detail}")
    if not ok:
        FAILS.append(tid)
    return ok


# ───────────── independent expectations from the DB (spec §L1.1 R1-R5) ─────────────

def q(db, sql, args=()):
    con = sqlite3.connect(db)
    try:
        return con.execute(sql, args).fetchall()
    finally:
        con.close()


def exp_levels(db):
    rows = q(db, """SELECT m.storey, MIN(r.minZ) FROM elements_meta m JOIN elements_rtree r ON r.id=m.id
                    WHERE m.ifc_class IN ('IfcWall','IfcWallStandardCase') GROUP BY m.storey""")
    lv = {s: z for s, z in rows}
    fnd = q(db, "SELECT DISTINCT storey FROM elements_meta WHERE ifc_class='IfcFooting'")[0][0]
    grid = min((s for s in lv if lv[s] > lv[fnd]), key=lambda s: lv[s])
    roof = q(db, """SELECT MAX(r.maxZ) FROM elements_meta m JOIN elements_rtree r ON r.id=m.id
                    WHERE m.ifc_class='IfcRoof'""")[0][0]
    if roof is None:
        roof = q(db, """SELECT MAX(r.maxZ) FROM elements_meta m JOIN elements_rtree r ON r.id=m.id
                        WHERE m.ifc_class='IfcSlab'""")[0][0]
    return lv, fnd, grid, roof


def walls_bbox(db, storey):
    return q(db, """SELECT m.guid, r.minX, r.maxX, r.minY, r.maxY FROM elements_meta m
                    JOIN elements_rtree r ON r.id=m.id
                    WHERE m.ifc_class IN ('IfcWall','IfcWallStandardCase') AND m.storey=? ORDER BY m.guid""",
             (storey,))


def exp_grid(db):
    """R4/R5 recomputed: returns {'x': [mm...], 'y': [mm...]}, envelope mm, interior load-bearing axes."""
    lv, fnd, gs, _ = exp_levels(db)
    W, F = walls_bbox(db, gs), walls_bbox(db, fnd)
    ex0, ex1 = min(w[1] for w in W), max(w[2] for w in W)
    ey0, ey1 = min(w[3] for w in W), max(w[4] for w in W)
    pos = {'x': [], 'y': []}
    interior_lb = []

    def ax(w):
        g, x0, x1, y0, y1 = w
        return ('y', (y0 + y1) / 2, x0, x1) if x1 - x0 >= y1 - y0 else ('x', (x0 + x1) / 2, y0, y1)
    for w in W:
        a, p, lo, hi = ax(w)
        L = hi - lo
        bear = False
        for f in F:
            fa, fp, flo, fhi = ax(f)
            band = (f[3], f[4]) if fa == 'y' else (f[1], f[2])
            if fa == a and band[0] < p < band[1] and min(hi, fhi) - max(lo, flo) >= 0.5 * L:
                bear = True
        ext = (abs(w[3] - ey0) <= 0.01 or abs(w[4] - ey1) <= 0.01) if a == 'y' else \
              (abs(w[1] - ex0) <= 0.01 or abs(w[2] - ex1) <= 0.01)
        if (bear or ext) and L >= 1.0:
            pos[a].append(p)
            if bear and not ext:
                interior_lb.append((a, p * 1000, w[0]))
    out = {}
    for a in ('x', 'y'):
        cl = []
        for p in sorted(pos[a]):
            if cl and p - cl[-1][-1] <= 0.010:
                cl[-1].append(p)
            else:
                cl.append([p])
        out[a] = [sum(c) / len(c) * 1000 for c in cl]
    return out, (ex0 * 1000, ex1 * 1000, ey0 * 1000, ey1 * 1000), interior_lb


def wall_world_coords(db, storey):
    """Raw mesh vertices (centre + local) of the storey's walls, mm: independent of section_cut."""
    rows = q(db, """SELECT t.center_x, t.center_y, b.vertices FROM elements_meta m
                    JOIN element_transforms t ON t.guid=m.guid JOIN element_instances i ON i.guid=m.guid
                    JOIN base_geometries b ON b.geometry_hash=i.geometry_hash
                    WHERE m.ifc_class IN ('IfcWall','IfcWallStandardCase') AND m.storey=?""", (storey,))
    xs, ys = set(), set()
    for cx, cy, vb in rows:
        v = np.frombuffer(vb, dtype=np.float32).reshape(-1, 3).astype(np.float64)
        xs.update(np.round((v[:, 0] + cx) * 1000, 1).tolist())
        ys.update(np.round((v[:, 1] + cy) * 1000, 1).tolist())
    return np.array(sorted(xs)), np.array(sorted(ys))


# ───────────── DXF readers ─────────────

def grid_from_dxf(path):
    doc = ezdxf.readfile(path)
    msp = doc.modelspace()
    lines = [e for e in msp.query('LINE[layer=="A-GRID"]')]
    texts = [e for e in msp.query('TEXT[layer=="A-GRID"]')]
    out = {'x': [], 'y': []}
    for ln in lines:
        s, e = ln.dxf.start, ln.dxf.end
        if abs(s.x - e.x) < 1e-6:
            labs = sorted(t.dxf.text for t in texts if abs(t.dxf.align_point.x - s.x) < 1)
            out['x'].append((s.x, labs))
        elif abs(s.y - e.y) < 1e-6:
            labs = sorted(t.dxf.text for t in texts if abs(t.dxf.align_point.y - s.y) < 1)
            out['y'].append((s.y, labs))
    for a in out:
        out[a].sort()
    return out


def dims_from_dxf(path):
    doc = ezdxf.readfile(path)
    res = []
    for d in doc.modelspace().query('DIMENSION'):
        p1, p2 = d.dxf.defpoint2, d.dxf.defpoint3
        ang = d.dxf.get('angle', 0)
        res.append(dict(p1=(p1.x, p1.y), p2=(p2.x, p2.y), base=(d.dxf.defpoint.x, d.dxf.defpoint.y),
                        angle=ang, text=d.dxf.get('text', ''), meas=d.get_measurement()))
    return res


# ───────────── W checks (functions so W7 can re-run them on other inputs) ─────────────

def w2(plan_dxf, db, tag='W2'):
    exp, env, ilb = exp_grid(db)
    got = grid_from_dxf(plan_dxf)
    bad = []
    for a in ('x', 'y'):
        g = [p for p, _ in got[a]]
        if len(g) != len(exp[a]):
            bad.append(f'{a}: count got={len(g)} exp={len(exp[a])}')
        for e in exp[a]:
            if not any(abs(e - p) <= GRID_TOL for p in g):
                bad.append(f'{a}: missing grid at {e:.1f}')
        for p in g:
            if not any(abs(e - p) <= GRID_TOL for e in exp[a]):
                bad.append(f'{a}: extra grid at {p:.1f}')
    for a, p, guid in ilb:
        if not any(abs(p - gp) <= 10.0 for gp, _ in got[a]):
            bad.append(f'interior load-bearing {guid} axis {a}={p:.1f} has no grid')
    return check(tag, 'grid invented or missing (every load-bearing/exterior wall axis gridded, none extra)',
                 not bad, f"exp x={[round(v, 1) for v in exp['x']]} y={[round(v, 1) for v in exp['y']]} "
                 f"interior_lb={len(ilb)} " + ('; '.join(bad[:6]) if bad else 'all match'))


def w3_plan(plan_dxf, db, storey, tag='W3'):
    exp, env, _ = exp_grid(db)
    xs, ys = wall_world_coords(db, storey)
    dims = dims_from_dxf(plan_dxf)
    bad = []
    gx, gy = sorted(exp['x']), sorted(exp['y'])
    sx = [b - a for a, b in zip(gx, gx[1:])]
    sy = [b - a for a, b in zip(gy, gy[1:])]
    n = {'T1': 0, 'T2': 0, 'T3': 0}
    for d in dims:
        if d['text'] not in ('', '<>'):
            bad.append(f"text override {d['text']!r}")
        horiz = abs(d['angle']) < 1e-6
        k = 0 if horiz else 1
        dist = abs(d['p2'][k] - d['p1'][k])
        if abs(d['meas'] - dist) > TOL:
            bad.append(f"measurement {d['meas']:.2f} != point distance {dist:.2f}")
        # tier from the dim-line offset outside the envelope (R7: 10/18/26 paper mm)
        off = min(abs(d['base'][1] - env[2]), abs(d['base'][1] - env[3])) if horiz else \
            min(abs(d['base'][0] - env[0]), abs(d['base'][0] - env[1]))
        tier = {1000: 'T3', 1800: 'T2', 2600: 'T1'}.get(int(round(off / 100.0) * 100))
        if tier is None:
            bad.append(f'dim at unexpected offset {off:.1f}')
            continue
        n[tier] += 1
        if tier == 'T1':
            want = (env[1] - env[0]) if horiz else (env[3] - env[2])
            if abs(d['meas'] - want) > TOL:
                bad.append(f"overall {d['meas']:.2f} != model envelope {want:.2f}")
        elif tier == 'T2':
            pool = sx if horiz else sy
            if not any(abs(d['meas'] - s) <= TOL for s in pool):
                bad.append(f"grid dim {d['meas']:.2f} not a model grid spacing {[round(s, 1) for s in pool]}")
        else:
            cand = xs if horiz else ys
            for pt in (d['p1'][k], d['p2'][k]):
                if np.min(np.abs(cand - pt)) > TOL:
                    bad.append(f'opening-string point {pt:.2f} is not a wall mesh vertex coordinate')
    ok = not bad and all(n[t] > 0 for t in n)
    return check(tag, 'doctored or wrong dims (override / measurement / model distance)', ok,
                 f"{os.path.basename(plan_dxf)} dims={len(dims)} tiers={n} " +
                 ('; '.join(sorted(set(bad))[:6]) if bad else 'all equal model within 0.5 mm, no overrides'))


def w3_elev(elev_dxf, db, tag='W3-elev'):
    lv, fnd, gs, roof = exp_levels(db)
    zs = sorted([v * 1000 for s, v in lv.items() if v >= lv[gs]] + [roof * 1000])
    gaps = [b - a for a, b in zip(zs, zs[1:])] + [zs[-1] - zs[0]]
    dims = dims_from_dxf(elev_dxf)
    bad = []
    for d in dims:
        if d['text'] not in ('', '<>'):
            bad.append('override')
        dist = abs(d['p2'][1] - d['p1'][1])
        if abs(d['meas'] - dist) > TOL:
            bad.append('meas!=points')
        if not any(abs(d['meas'] - g) <= TOL for g in gaps):
            bad.append(f"{d['meas']:.2f} not a model level difference")
    return check(tag, 'height dims doctored or not the model storey differences', not bad and len(dims) == len(gaps),
                 f"{os.path.basename(elev_dxf)} dims={len(dims)} exp={[round(g, 1) for g in gaps]} {bad[:4]}")


def w4(plan_dxf):
    got = grid_from_dxf(plan_dxf)
    letters = [c for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' if c not in ('I', 'O')]
    bad = []
    xl = [labs for _, labs in got['x']]
    yl = [labs for _, labs in got['y']]
    for i, labs in enumerate(xl):
        if labs != [str(i + 1)] * 2:
            bad.append(f'x line {i}: {labs}')
    for i, labs in enumerate(yl):
        if labs != [letters[i]] * 2:
            bad.append(f'y line {i}: {labs}')
    allabs = [l[0] for l in xl + yl if l]
    if len(set(allabs)) != len(allabs):
        bad.append('duplicate labels')
    if any(c in ('I', 'O') for c in allabs):
        bad.append('I/O used')
    return check('W4', 'unreadable grid (labels not sequential, I/O used, duplicates, bubble missing at an end)',
                 not bad, f"x={[l[0] if l else '?' for l in xl]} y={[l[0] if l else '?' for l in yl]} {bad[:4]}")


def ifc_doors(ifc_path):
    import ifcopenshell
    import ifcopenshell.util.placement as P
    f = ifcopenshell.open(ifc_path)
    out = {}
    for d in f.by_type('IfcDoor'):
        M = P.get_local_placement(d.ObjectPlacement)
        hinge = None
        for rep in d.Representation.Representations:
            if rep.RepresentationIdentifier != 'Plan':
                continue
            for it in rep.Items:
                items = it.MappingSource.MappedRepresentation.Items if it.is_a('IfcMappedItem') else [it]
                for gs in items:
                    for c in getattr(gs, 'Elements', []) or []:
                        if c.is_a('IfcTrimmedCurve') and c.BasisCurve.is_a('IfcCircle'):
                            lc = c.BasisCurve.Position.Location.Coordinates
                            hinge = (M @ np.array([lc[0], lc[1], 0, 1.0]))[:2] * 1000
        out[d.GlobalId] = dict(y=M[:3, 1][:2], hinge=hinge)
    return out


def ifc_storeys(ifc_path):
    import ifcopenshell
    f = ifcopenshell.open(ifc_path)
    return {s.Name: float(s.Elevation) for s in f.by_type('IfcBuildingStorey')}


def w5(plan_dxfs, db, ifc_path, log_lines, tag='W5'):
    if not ifc_path:
        say(f'SKIP {tag} | swing wrong | no IFC oracle given (--ifc); not a PASS')
        return None
    oracle = ifc_doors(ifc_path)
    doors = {g: (x0, x1, y0, y1) for g, x0, x1, y0, y1 in q(db, """SELECT m.guid, r.minX, r.maxX, r.minY, r.maxY
            FROM elements_meta m JOIN elements_rtree r ON r.id=m.id WHERE m.ifc_class='IfcDoor'""")}
    gap_hinge = {ln.split('guid=')[1].split()[0] for ln in log_lines if ln.startswith('§GAP GAP:door_hinge')}
    bad, n_note, n_arc = [], 0, 0
    for path in plan_dxfs:
        msp = ezdxf.readfile(path).modelspace()
        for t in msp.query('TEXT[layer=="A-ANNO-NOTE"]'):
            g = t.get_xdata('BIMGUID')[0][1] if t.has_xdata('BIMGUID') else None
            if g not in doors or g not in oracle:
                bad.append(f'note without door guid {g}')
                continue
            x0, x1, y0, y1 = doors[g]
            c = np.array([(x0 + x1) / 2, (y0 + y1) / 2]) * 1000
            v = np.array([t.dxf.align_point.x, t.dxf.align_point.y]) - c
            if float(np.dot(v, oracle[g]['y'])) <= 0:
                bad.append(f'{g}: swing note on the wrong side')
            n_note += 1
        for a in msp.query('ARC[layer=="A-DOOR"]'):
            n_arc += 1
            ctr = np.array([a.dxf.center.x, a.dxf.center.y])
            g = min(oracle, key=lambda k: np.inf if oracle[k]['hinge'] is None else np.linalg.norm(oracle[k]['hinge'] - ctr))
            h = oracle[g]['hinge']
            mid = np.radians((a.dxf.start_angle + a.dxf.end_angle) / 2)
            if h is None or np.linalg.norm(h - ctr) > 5 or np.dot([np.cos(mid), np.sin(mid)], oracle[g]['y']) <= 0:
                bad.append(f'arc at {ctr.round(1)} not at IFC hinge / swing side')
            if g in gap_hinge:
                bad.append(f'{g}: arc drawn although hinge is a GAP (invented)')
    ok = not bad and n_note == len(doors) and len(gap_hinge) + n_arc >= len(doors)
    return check(tag, 'swing wrong (swing side vs IFC +Y; arc hinge vs IFC hinge; no arc for a hinge GAP)', ok,
                 f'doors={len(doors)} swing notes={n_note} arcs={n_arc} hinge GAPs={len(gap_hinge)} {bad[:4]}')


def w6(elev_dxfs, db, ifc_path):
    lv, fnd, gs, roof = exp_levels(db)
    exp = sorted([v * 1000 for s, v in lv.items() if v >= lv[gs]] + [roof * 1000])
    ifc = ifc_storeys(ifc_path) if ifc_path else {}
    bad = []
    for p in elev_dxfs:
        msp = ezdxf.readfile(p).modelspace()
        got = sorted({round(l.dxf.start.y, 2) for l in msp.query('LINE[layer=="A-ANNO-LEVL"]')})
        if len(got) != len(exp) or any(abs(a - b) > TOL for a, b in zip(got, exp)):
            bad.append(f'{os.path.basename(p)} got={got} exp={[round(e, 2) for e in exp]}')
    for s, v in lv.items():
        if v >= lv[gs] and s in ifc and abs(ifc[s] * 1000 - v * 1000) > TOL:
            bad.append(f'{s}: DB-derived {v * 1000:.1f} != IFC {ifc[s] * 1000:.1f}')
    oracle = 'IFC ' + str({k: round(v, 3) for k, v in ifc.items()}) if ifc else 'no IFC oracle'
    return check('W6', 'level invented (datums != model storey elevations / roof top)', not bad,
                 f"exp={[round(e, 1) for e in exp]} views={len(elev_dxfs)} {oracle} {bad[:3]}")


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('db')
    ap.add_argument('--ifc', default=None)
    ap.add_argument('--old-dir', default=None)
    a = ap.parse_args()
    out_dir = os.path.normpath(os.path.join(HERE, '..', 'output', 'STD'))
    tmp = tempfile.mkdtemp(prefix='std2d_')
    try:
        # W1 determinism
        r1 = std2d.write_std_set(a.db, os.path.join(tmp, 'run1'))
        std2d.write_std_set(a.db, os.path.join(tmp, 'run2'))
        f1 = sorted(os.path.basename(p) for p in glob.glob(os.path.join(tmp, 'run1', '*')))
        diff = [f for f in f1 if sha(os.path.join(tmp, 'run1', f)) != sha(os.path.join(tmp, 'run2', f))]
        check('W1', 'nondeterminism (two runs from the same DB differ)', not diff and len(f1) >= 7,
              f'files={len(f1)} differing={diff}')
        P = r1['paths']
        plans = [P[k] for k in sorted(P) if k.startswith('FLOOR_')]
        elevs = [P[k] for k in ('FRONT', 'REAR', 'LEFT', 'RIGHT')]
        lv, fnd, gs, _ = exp_levels(a.db)
        storey_of = {}
        plan_storeys = sorted([s for s in lv if lv[s] >= lv[gs]], key=lambda s: lv[s])
        names = ['GF', 'FF', 'SF', 'TF']
        for i, s in enumerate(plan_storeys):
            if i < len(names) and f'FLOOR_{names[i]}' in P:
                storey_of[P[f'FLOOR_{names[i]}']] = s
        # W2 / W3 / W4
        w2(P['FLOOR_GF'], a.db)
        for p in plans:
            if p != P['FLOOR_GF']:
                w2(p, a.db, tag=f'W2[{os.path.basename(p)}]')
            w3_plan(p, a.db, storey_of[p], tag=f'W3[{os.path.basename(p)}]')
        for p in elevs:
            w3_elev(p, a.db, tag=f'W3[{os.path.basename(p)}]')
        w4(P['FLOOR_GF'])
        # W5 + control
        res5 = w5(plans, a.db, a.ifc, r1['log'])
        if res5 is not None:
            ctl = os.path.join(tmp, 'w5ctl')
            os.makedirs(ctl)
            mirrored = []
            for p in plans:
                doc = ezdxf.readfile(p)
                doors = {g: (x0, x1, y0, y1) for g, x0, x1, y0, y1 in q(a.db, """SELECT m.guid, r.minX, r.maxX,
                         r.minY, r.maxY FROM elements_meta m JOIN elements_rtree r ON r.id=m.id
                         WHERE m.ifc_class='IfcDoor'""")}
                for t in doc.modelspace().query('TEXT[layer=="A-ANNO-NOTE"]'):
                    g = t.get_xdata('BIMGUID')[0][1]
                    x0, x1, y0, y1 = doors[g]
                    cx, cy = (x0 + x1) * 500, (y0 + y1) * 500
                    ap_ = t.dxf.align_point
                    t.dxf.align_point = (2 * cx - ap_.x, 2 * cy - ap_.y)
                    t.dxf.insert = t.dxf.align_point
                np_ = os.path.join(ctl, os.path.basename(p))
                doc.saveas(np_)
                mirrored.append(np_)
            say('-- W5 control: every swing note mirrored across its door centre (must FAIL) --')
            n_before = len(FAILS)
            c = w5(mirrored, a.db, a.ifc, r1['log'], tag='W5-control')
            if not c:
                FAILS.pop()   # expected failure is the control passing
            check('W5-mutation', 'the W5 check cannot see a mirrored swing', c is False and len(FAILS) == n_before,
                  'control FAILED as required' if c is False else 'control PASSED: W5 is blind')
        w6(elevs, a.db, a.ifc)
        # W7 mutation: shift one interior load-bearing wall 50 mm
        _, _, ilb = exp_grid(a.db)
        target = sorted(ilb, key=lambda t: t[2])[0]
        mdb = os.path.join(tmp, 'MUT_extracted.db')
        shutil.copy(a.db, mdb)
        con = sqlite3.connect(mdb)
        dx, dy = (0.05, 0.0) if target[0] == 'x' else (0.0, 0.05)
        con.execute("""UPDATE elements_rtree SET minX=minX+?, maxX=maxX+?, minY=minY+?, maxY=maxY+?
                       WHERE id=(SELECT id FROM elements_meta WHERE guid=?)""", (dx, dx, dy, dy, target[2]))
        con.execute("UPDATE element_transforms SET center_x=center_x+?, center_y=center_y+? WHERE guid=?",
                    (dx, dy, target[2]))
        con.commit()
        con.close()
        say(f'-- W7: wall {target[2]} (axis {target[0]}={target[1]:.1f} mm) shifted 50 mm in a DB copy --')
        n0 = len(FAILS)
        stale2 = w2(P['FLOOR_GF'], mdb, tag='W7.stale-W2')
        stale3 = w3_plan(P['FLOOR_GF'], mdb, gs, tag='W7.stale-W3')
        caught = (not stale2) and (not stale3)
        del FAILS[n0:]   # stale failures are the expected outcome
        rm = std2d.write_std_set(mdb, os.path.join(tmp, 'mut'))
        n1 = len(FAILS)
        fresh2 = w2(rm['paths']['FLOOR_GF'], mdb, tag='W7.fresh-W2')
        fresh3 = w3_plan(rm['paths']['FLOOR_GF'], mdb, gs, tag='W7.fresh-W3')
        del FAILS[n1:]
        check('W7', 'a 50 mm wall shift in the model is not reported by W2/W3 (or the writer does not follow it)',
              caught and fresh2 and fresh3,
              f'stale drawing vs shifted model: W2={"FAIL" if not stale2 else "PASS"} W3={"FAIL" if not stale3 else "PASS"}'
              f' | regenerated: W2={"PASS" if fresh2 else "FAIL"} W3={"PASS" if fresh3 else "FAIL"}')
        # INFO: earlier timestamped set's arcs vs IFC
        if a.old_dir and a.ifc:
            oracle = ifc_doors(a.ifc)
            doors = {g: (x0, x1, y0, y1) for g, x0, x1, y0, y1 in q(a.db, """SELECT m.guid, r.minX, r.maxX,
                     r.minY, r.maxY FROM elements_meta m JOIN elements_rtree r ON r.id=m.id WHERE m.ifc_class='IfcDoor'""")}
            tot = side_ok = hinge_ok = 0
            for p in sorted(glob.glob(os.path.join(a.old_dir, 'DX_FLOOR_?F_20260428_0636.dxf'))):
                for arc in ezdxf.readfile(p).modelspace().query('ARC[layer=="A-DOOR"]'):
                    ctr = np.array([arc.dxf.center.x, arc.dxf.center.y])
                    # the door whose plan bbox (mm, +0.3 m) contains the arc centre
                    g = next((k for k, (x0, x1, y0, y1) in doors.items() if x0 * 1000 - 300 <= ctr[0] <= x1 * 1000 + 300
                              and y0 * 1000 - 300 <= ctr[1] <= y1 * 1000 + 300 and oracle.get(k, {}).get('hinge') is not None), None)
                    tot += 1
                    if g is None:
                        continue
                    x0, x1, y0, y1 = doors[g]
                    c = np.array([(x0 + x1) / 2, (y0 + y1) / 2]) * 1000
                    h = oracle[g]['hinge']
                    mid = np.radians((arc.dxf.start_angle + arc.dxf.end_angle) / 2)
                    side_ok += np.dot([np.cos(mid), np.sin(mid)], oracle[g]['y']) > 0
                    along = np.array([1.0, 0.0]) if abs(oracle[g]['y'][0]) < 0.5 else np.array([0.0, 1.0])
                    hinge_ok += np.sign(np.dot(ctr - c, along)) == np.sign(np.dot(h - c, along))
            right = f'swing side {side_ok}/{tot}, hinge jamb {hinge_ok}/{tot}'
            say(f'INFO earlier timestamped set: door arcs agreeing with the IFC: {right}')
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    say(f'SUMMARY fail={len(FAILS)} {FAILS}')
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, 'test_std2d.log'), 'w') as fh:
        fh.write('\n'.join(OUT_LINES) + '\n')
    sys.exit(1 if FAILS else 0)


if __name__ == '__main__':
    main()
