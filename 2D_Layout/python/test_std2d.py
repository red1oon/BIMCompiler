#!/usr/bin/env python3
# ⚠ DO NOT REMOVE: scope = lane spec §L1 / §L1.1 / §L1.2 / §L1.4 / §L1.5 / §L1.6 (one DB, either schema; model storeys) (bim-ootb prompts/DXF2BIM_MODELLER_LANE.md), tests W1-W7
# for the standard 2D set written by std2d.py. Read the log after every run (exit code is not evidence).
# Expectations are recomputed here from the DB with their own queries (not std2d's functions).
# The source IFC (when given) is the independent oracle for door swing/hinge (W5) and storey elevations (W6).
"""
Usage:
    python3 test_std2d.py <DX_extracted.db> [--ifc Duplex_ARC.ifc] [--door-ops DB] [--old-dir DIR]
      --door-ops: DB with the door_operation table (scripts/extractIFC2DB.js, §L1.2); W5 then expects
                  one arc per IFC single-swing door, hinge + swing checked against the IFC
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
import re
import argparse
import tempfile
import subprocess

import numpy as np
import ezdxf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import std2d  # noqa: E402  (writer under test; only write_std_set is called)
import model_db  # noqa: E402  (§L1.6 P0: one view shape over the Node or the old DB schema)

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
    con = model_db.connect(db)
    try:
        return con.execute(sql, args).fetchall()
    finally:
        con.close()


def exp_levels(db):
    rows = q(db, """SELECT m.storey, MIN(r.minZ) FROM elements_meta m JOIN m_bbox r ON r.guid=m.guid
                    WHERE m.ifc_class IN ('IfcWall','IfcWallStandardCase') GROUP BY m.storey""")
    lv = {s: z for s, z in rows}
    # §L1.6 R1': the model storey placement when the DB carries it (Node extractor), R1 otherwise
    if q(db, "SELECT 1 FROM sqlite_master WHERE type='table' AND name='storey_elevation'"):
        for s, z in q(db, "SELECT name, placement_z_m FROM storey_elevation WHERE placement_z_m IS NOT NULL"):
            if s in lv:
                lv[s] = z
    fnd = q(db, "SELECT DISTINCT storey FROM elements_meta WHERE ifc_class='IfcFooting'")[0][0]
    grid = min((s for s in lv if lv[s] > lv[fnd]), key=lambda s: lv[s])
    roof = q(db, """SELECT MAX(r.maxZ) FROM elements_meta m JOIN m_bbox r ON r.guid=m.guid
                    WHERE m.ifc_class='IfcRoof'""")[0][0]
    if roof is None:
        roof = q(db, """SELECT MAX(r.maxZ) FROM elements_meta m JOIN m_bbox r ON r.guid=m.guid
                        WHERE m.ifc_class='IfcSlab'""")[0][0]
    return lv, fnd, grid, roof


def walls_bbox(db, storey):
    return q(db, """SELECT m.guid, r.minX, r.maxX, r.minY, r.maxY FROM elements_meta m
                    JOIN m_bbox r ON r.guid=m.guid
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
    for w in W + [w for s in plan_storeys_of(db) if s != gs for w in _ext_only(walls_bbox(db, s))]:
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


PLAN_CUT = 1.2   # m above the storey elevation (R7 / §5.1a), stated here, not imported from the writer


def plan_storeys_of(db):
    """Storeys from the grid storey up with a wall of their own reaching their cut plane (recomputed here)."""
    lv, _, gs, _ = exp_levels(db)
    out = []
    for s in sorted((s for s in lv if lv[s] >= lv[gs]), key=lambda s: lv[s]):
        cz = lv[s] + PLAN_CUT
        if q(db, """SELECT 1 FROM elements_meta m JOIN m_bbox r ON r.guid=m.guid WHERE m.ifc_class IN
                     ('IfcWall','IfcWallStandardCase') AND m.storey=? AND r.minZ <= ? AND r.maxZ > ? LIMIT 1""", (s, cz, cz)):
            out.append(s)
    return out


def _ext_only(W):
    """§L1.6 M: a non-grid plan storey contributes its exterior walls (own envelope) in the footing regime."""
    if not W:
        return []
    ex0, ex1 = min(w[1] for w in W), max(w[2] for w in W)
    ey0, ey1 = min(w[3] for w in W), max(w[4] for w in W)
    out = []
    for w in W:
        g, x0, x1, y0, y1 = w
        if x1 - x0 >= y1 - y0:
            if abs(y0 - ey0) <= 0.01 or abs(y1 - ey1) <= 0.01:
                out.append(w)
        elif abs(x0 - ex0) <= 0.01 or abs(x1 - ex1) <= 0.01:
            out.append(w)
    return out


def view_key(name):
    """§L1.6 N: the plan sheet key the spec names for a model storey (FLOOR_ + upper case, non-alphanumerics -> _)."""
    return 'FLOOR_' + re.sub(r'[^A-Z0-9]+', '_', name.upper()).strip('_')


def cut_z_of(db, storey):
    lv, _, _, _ = exp_levels(db)
    return lv[storey] + PLAN_CUT


def walls_cut(db, cut_z):
    """§L1.5 P1: walls whose DB z-range contains the plan cut height, any storey."""
    return q(db, """SELECT m.guid, m.storey FROM elements_meta m JOIN m_bbox r ON r.guid=m.guid
                    WHERE m.ifc_class IN ('IfcWall','IfcWallStandardCase') AND r.minZ < ? AND r.maxZ > ? ORDER BY m.guid""",
             (cut_z, cut_z))


def wall_world_coords(db, storey):
    """Raw mesh vertices (centre + local) of the walls the storey's plan cut plane cuts (§L1.5), mm: independent of section_cut."""
    cz = cut_z_of(db, storey)
    rows = q(db, """SELECT t.center_x, t.center_y, b.vertices FROM elements_meta m
                    JOIN element_transforms t ON t.guid=m.guid JOIN element_instances i ON i.guid=m.guid
                    JOIN m_geom b ON b.geometry_hash=i.geometry_hash JOIN m_bbox r ON r.guid=m.guid
                    WHERE m.ifc_class IN ('IfcWall','IfcWallStandardCase') AND r.minZ < ? AND r.maxZ > ?""", (cz, cz))
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
    """IFC oracle per door (mm, plan): +X/+Y of the placement, OperationType (type/style, else occurrence),
    OverallWidth, and the Plan swing arc (IfcTrimmedCurve on IfcCircle) centre = the drawn hinge."""
    import ifcopenshell
    import ifcopenshell.util.placement as P
    import ifcopenshell.util.unit as U
    f = ifcopenshell.open(ifc_path)
    ls = U.calculate_unit_scale(f)
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
                            hinge = (M @ np.array([lc[0], lc[1], 0, 1.0]))[:2] * ls * 1000
        t = None
        for r in list(getattr(d, 'IsTypedBy', None) or []) + [r for r in d.IsDefinedBy or [] if r.is_a('IfcRelDefinesByType')]:
            t = r.RelatingType
        op = getattr(t, 'OperationType', None) if t is not None else None
        op = op or getattr(d, 'OperationType', None)
        out[d.GlobalId] = dict(x=M[:3, 0][:2], y=M[:3, 1][:2], hinge=hinge, op=op,
                               w=(d.OverallWidth * ls * 1000) if d.OverallWidth else None)
    return out


def ifc_storeys(ifc_path):
    import ifcopenshell
    f = ifcopenshell.open(ifc_path)
    return {s.Name: float(s.Elevation) for s in f.by_type('IfcBuildingStorey')}


def _door_marks(plan_dxfs):
    """guid -> {'arcs': [...], 'lines': [...], 'notes': [...]} from A-DOOR ARC/LINE and A-ANNO-NOTE TEXT (BIMGUID xdata)."""
    out = {}

    def g_of(e):
        return e.get_xdata('BIMGUID')[0][1] if e.has_xdata('BIMGUID') else None
    for path in plan_dxfs:
        msp = ezdxf.readfile(path).modelspace()
        for a in msp.query('ARC[layer=="A-DOOR"]'):
            out.setdefault(g_of(a), {'arcs': [], 'lines': [], 'notes': []})['arcs'].append(
                dict(c=np.array([a.dxf.center.x, a.dxf.center.y]), r=a.dxf.radius, s=a.dxf.start_angle, e=a.dxf.end_angle))
        for ln in msp.query('LINE[layer=="A-DOOR"]'):
            out.setdefault(g_of(ln), {'arcs': [], 'lines': [], 'notes': []})['lines'].append(
                (np.array([ln.dxf.start.x, ln.dxf.start.y]), np.array([ln.dxf.end.x, ln.dxf.end.y])))
        for t in msp.query('TEXT[layer=="A-ANNO-NOTE"]'):
            out.setdefault(g_of(t), {'arcs': [], 'lines': [], 'notes': []})['notes'].append(
                np.array([t.dxf.align_point.x, t.dxf.align_point.y]))
    return out


def w5(plan_dxfs, db, ifc_path, log_lines, tag='W5', expect_arcs=False, verbose=False):
    """§L1.2 W5: per door, an arc's hinge (position + jamb), swing side and radius vs the IFC; otherwise a hinge GAP."""
    if not ifc_path:
        say(f'SKIP {tag} | swing wrong | no IFC oracle given (--ifc); not a PASS')
        return None
    oracle = ifc_doors(ifc_path)
    doors = {g: (x0, x1, y0, y1) for g, x0, x1, y0, y1 in q(db, """SELECT m.guid, r.minX, r.maxX, r.minY, r.maxY
            FROM elements_meta m JOIN m_bbox r ON r.guid=m.guid WHERE m.ifc_class='IfcDoor'""")}
    gap_hinge = {ln.split('guid=')[1].split()[0] for ln in log_lines
                 if ln.startswith('§GAP GAP:door_hinge') or ln.startswith('§GAP GAP:door_handing_conflict')}
    marks = _door_marks(plan_dxfs)
    bad, n_arc, n_gap, rows = [], 0, 0, []
    for g in sorted(set(marks) - set(doors)):
        bad.append(f'mark without a door guid {g}')
    for g in sorted(doors):
        o, mk = oracle.get(g), marks.get(g, {'arcs': [], 'lines': [], 'notes': []})
        if o is None:
            bad.append(f'{g}: not in IFC')
            continue
        x0, x1, y0, y1 = doors[g]
        c = np.array([(x0 + x1) / 2, (y0 + y1) / 2]) * 1000
        if mk['arcs']:
            n_arc += 1
            if len(mk['arcs']) != 1:
                bad.append(f'{g}: {len(mk["arcs"])} arcs')
            a = mk['arcs'][0]
            span = (a['e'] - a['s']) % 360
            mid = np.radians(a['s'] + span / 2)
            md = np.array([np.cos(mid), np.sin(mid)])
            d_h = None if o['hinge'] is None else float(np.linalg.norm(o['hinge'] - a['c']))
            want_jamb = -1 if str(o['op']).endswith('LEFT') else 1 if str(o['op']).endswith('RIGHT') else 0
            got_jamb = int(np.sign(np.dot(a['c'] - c, o['x'])))
            swing = float(np.dot(md, o['y']))
            leaf_ok = any(np.linalg.norm(s0 - a['c']) <= 1 and np.dot((e0 - s0) / max(np.linalg.norm(e0 - s0), 1e-9), o['y']) > 0.999
                          and abs(np.linalg.norm(e0 - s0) - a['r']) <= 1 for s0, e0 in mk['lines'])
            ok = (d_h is not None and d_h <= 5 and want_jamb != 0 and got_jamb == want_jamb and swing > 0
                  and leaf_ok and abs(span - 90) <= 1e-6 and o['w'] is not None and abs(a['r'] - o['w']) <= 2
                  and g not in gap_hinge)
            rows.append(f"  {g} op={o['op']} hinge jamb IFC={want_jamb:+d} drawn={got_jamb:+d} | hinge to IFC Plan arc centre="
                        f"{'none' if d_h is None else f'{d_h:.2f}'} mm | swing·IFC+Y={swing:+.3f} | leaf line={leaf_ok} | "
                        f"r={a['r']:.1f} IFC width={o['w'] if o['w'] is None else round(o['w'], 1)} | {'ok' if ok else 'BAD'}")
            if not ok:
                bad.append(f'{g}: arc hinge/swing/width wrong')
        else:
            if g not in gap_hinge:
                bad.append(f'{g}: no arc and no hinge GAP')
            n_gap += 1
            for v in mk['notes']:
                if float(np.dot(v - c, o['y'])) <= 0:
                    bad.append(f'{g}: swing note on the wrong side')
            if len(mk['notes']) != 1:
                bad.append(f'{g}: {len(mk["notes"])} swing notes')
    want_arcs = sum(1 for g in doors if str(oracle.get(g, {}).get('op')) in ('SINGLE_SWING_LEFT', 'SINGLE_SWING_RIGHT'))
    if expect_arcs and n_arc != want_arcs:
        bad.append(f'arcs {n_arc} != IFC single-swing doors {want_arcs}')
    if verbose:
        for r in rows:
            say(r)
    return check(tag, 'swing wrong (arc hinge position + jamb vs IFC Plan arc / OperationType, swing side vs IFC +Y, '
                      'radius vs OverallWidth; no arc without a hinge GAP)', not bad,
                 f'doors={len(doors)} arcs={n_arc} hinge GAPs={n_gap} IFC single-swing={want_arcs} problems={len(bad)} {bad[:3]}')


def _mirror_marks(src, dst, oracle, db, axis):
    """Control: reflect every door mark across its door centre along the IFC 'x' (hinge flip) or 'y' (swing flip) axis."""
    doors = {g: (x0, x1, y0, y1) for g, x0, x1, y0, y1 in q(db, """SELECT m.guid, r.minX, r.maxX, r.minY, r.maxY
             FROM elements_meta m JOIN m_bbox r ON r.guid=m.guid WHERE m.ifc_class='IfcDoor'""")}
    doc = ezdxf.readfile(src)
    msp = doc.modelspace()
    for e in list(msp.query('ARC[layer=="A-DOOR"]')) + list(msp.query('LINE[layer=="A-DOOR"]')) + \
            list(msp.query('TEXT[layer=="A-ANNO-NOTE"]')):
        if not e.has_xdata('BIMGUID'):
            continue
        g = e.get_xdata('BIMGUID')[0][1]
        x0, x1, y0, y1 = doors[g]
        c = np.array([(x0 + x1) / 2, (y0 + y1) / 2]) * 1000
        n = oracle[g][axis] / np.linalg.norm(oracle[g][axis])

        def rp(p):
            p = np.array([p[0], p[1]])
            return p - 2 * np.dot(p - c, n) * n

        def rd(deg):
            d = np.array([np.cos(np.radians(deg)), np.sin(np.radians(deg))])
            d = d - 2 * np.dot(d, n) * n
            return np.degrees(np.arctan2(d[1], d[0])) % 360
        if e.dxftype() == 'ARC':
            ctr = rp(e.dxf.center)
            s_, e_ = rd(e.dxf.end_angle), rd(e.dxf.start_angle)   # a reflection reverses the sweep
            e.dxf.center = (ctr[0], ctr[1])
            e.dxf.start_angle, e.dxf.end_angle = s_, e_
        elif e.dxftype() == 'LINE':
            a, b = rp(e.dxf.start), rp(e.dxf.end)
            e.dxf.start, e.dxf.end = (a[0], a[1]), (b[0], b[1])
        else:
            a = rp(e.dxf.align_point)
            e.dxf.align_point = (a[0], a[1])
            e.dxf.insert = e.dxf.align_point
    doc.saveas(dst)


def w8(roof_dxf, db, plan_storey_names):
    """§L1.4 F4 roof plan vs the DB, recomputed here: outline = wall bbox union of the highest storey above the
    plans that has walls but no plan; skylights = that storey's IfcWindow bboxes."""
    lv, fnd, gs, _ = exp_levels(db)
    cand = sorted((s for s in lv if lv[s] > lv[gs] and s not in plan_storey_names), key=lambda s: lv[s])
    if not cand:
        return check('W8', 'roof plan invented or missing', roof_dxf is None, 'no roof storey in the DB; sheet=' + str(roof_dxf))
    rs = cand[-1]
    W = walls_bbox(db, rs)
    exp_o = [min(w[1] for w in W) * 1000, max(w[2] for w in W) * 1000, min(w[3] for w in W) * 1000, max(w[4] for w in W) * 1000]
    sky = {g: (x0 * 1000, x1 * 1000, y0 * 1000, y1 * 1000) for g, x0, x1, y0, y1 in q(db, """SELECT m.guid, r.minX, r.maxX, r.minY, r.maxY
           FROM elements_meta m JOIN m_bbox r ON r.guid=m.guid WHERE m.ifc_class='IfcWindow' AND m.storey=?""", (rs,))}
    bad = []
    if roof_dxf is None:
        return check('W8', 'roof plan invented or missing (no ROOF sheet although the model has a roof storey)', False, f'storey={rs}')
    msp = ezdxf.readfile(roof_dxf).modelspace()
    ro = list(msp.query('LWPOLYLINE[layer=="A-ROOF"]'))
    if len(ro) != 1:
        bad.append(f'A-ROOF outlines={len(ro)}')
    else:
        p = list(ro[0].get_points('xy'))
        got = [min(x for x, _ in p), max(x for x, _ in p), min(y for _, y in p), max(y for _, y in p)]
        if any(abs(a - b) > TOL for a, b in zip(got, exp_o)) or len(p) != 4:
            bad.append(f'outline {got} != wall envelope {exp_o}')
    gl = {}
    for e in msp.query('LWPOLYLINE[layer=="A-GLAZ"]'):
        p = list(e.get_points('xy'))
        gl[e.get_xdata('BIMGUID')[0][1]] = (min(x for x, _ in p), max(x for x, _ in p), min(y for _, y in p), max(y for _, y in p))
    if set(gl) != set(sky):
        bad.append(f'skylights {sorted(gl)} != model {sorted(sky)}')
    for g in set(gl) & set(sky):
        if any(abs(a - b) > TOL for a, b in zip(gl[g], sky[g])):
            bad.append(f'{g}: box {gl[g]} != {sky[g]}')
    return check('W8', 'roof plan invented or wrong (outline != roof-storey wall envelope, skylights != model windows)', not bad,
                 f'storey={rs} outline exp={[round(v, 1) for v in exp_o]} skylights={len(gl)}/{len(sky)} {bad[:3]}')


def w9(sect_dxf, db):
    """§L1.4 F5 section vs the DB: cut X = midway between the first two grid lines (recomputed); every slab whose plan
    x-range contains X has a contour on S-SLAB/A-ROOF whose z extent equals its DB z extent (0.5 mm); every contour lies
    inside its element's DB box (h = y)."""
    exp, _, _ = exp_grid(db)
    X = (exp['x'][0] + exp['x'][1]) / 2
    rows = {g: (c, x0 * 1000, x1 * 1000, y0 * 1000, y1 * 1000, z0 * 1000, z1 * 1000) for g, c, x0, x1, y0, y1, z0, z1 in q(db, """SELECT m.guid, m.ifc_class,
            r.minX, r.maxX, r.minY, r.maxY, r.minZ, r.maxZ FROM elements_meta m JOIN m_bbox r ON r.guid=m.guid
            WHERE m.ifc_class IN ('IfcSlab','IfcRoof','IfcWall','IfcWallStandardCase')""")}
    msp = ezdxf.readfile(sect_dxf).modelspace()
    title = [t.dxf.text for t in msp.query('TEXT[layer=="A-ANNO-TTLB"]')]
    bad, seen = [], {}
    if not any(f'AT X={X:.2f}' in t for t in title):
        bad.append(f'title {title} does not state X={X:.2f}')
    for e in msp.query('LWPOLYLINE'):
        if e.dxf.layer not in ('S-SLAB', 'A-ROOF', 'A-SECT'):
            continue
        g = e.get_xdata('BIMGUID')[0][1]
        c, x0, x1, y0, y1, z0, z1 = rows[g]
        p = list(e.get_points('xy'))
        h0, h1, zz0, zz1 = min(a for a, _ in p), max(a for a, _ in p), min(b for _, b in p), max(b for _, b in p)
        if not (x0 < X < x1):
            bad.append(f'{g}: not cut by X')
        if h0 < y0 - TOL or h1 > y1 + TOL or zz0 < z0 - TOL or zz1 > z1 + TOL:
            bad.append(f'{g}: contour outside its DB box')
        seen.setdefault(g, []).append((zz0, zz1, e.dxf.layer))
    slabs = [g for g, r in rows.items() if r[0] in ('IfcSlab', 'IfcRoof') and r[1] < X < r[2]]
    for g in slabs:
        z = seen.get(g)
        if not z:
            bad.append(f'{g}: slab cut by X but not drawn')
        elif abs(min(a for a, _, _ in z) - rows[g][5]) > TOL or abs(max(b for _, b, _ in z) - rows[g][6]) > TOL:
            bad.append(f'{g}: z {z} != DB {rows[g][5:]}')
    return check('W9', 'section invented or wrong (cut plane, slab/roof z extents vs the DB, contours outside their element)', not bad,
                 f'X={X:.2f} slabs cut={len(slabs)} drawn elements={len(seen)} {bad[:3]}')


def w10(plan_dxf, db, storey, tag='W10'):
    """§L1.5 P1: the plan's wall contours are exactly the walls its cut plane cuts (any storey)."""
    cz = cut_z_of(db, storey)
    exp = {g: st for g, st in walls_cut(db, cz)}
    msp = ezdxf.readfile(plan_dxf).modelspace()
    got = {e.get_xdata('BIMGUID')[0][1] for e in msp.query('LWPOLYLINE') if e.dxf.layer in ('A-WALL-FULL', 'A-WALL-PRTN') and e.has_xdata('BIMGUID')}
    missing, extra = sorted(set(exp) - got), sorted(got - set(exp))
    other = sorted(g + '@' + st for g, st in exp.items() if st != storey)
    return check(tag, 'an element cut by the plan cut plane is missing (storey membership used), or one not cut is drawn',
                 not missing and not extra, f'{os.path.basename(plan_dxf)} cut_z={cz:.3f} walls exp={len(exp)} drawn={len(got)} '
                 f'other-storey cut walls={other} missing={missing[:4]} extra={extra[:4]}')


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
    ap.add_argument('--door-ops', default=None, help='DB with the door_operation table (§L1.2), passed to std2d')
    a = ap.parse_args()
    out_dir = os.path.normpath(os.path.join(HERE, '..', 'output', 'STD'))
    tmp = tempfile.mkdtemp(prefix='std2d_')
    try:
        # W1 determinism
        r1 = std2d.write_std_set(a.db, os.path.join(tmp, 'run1'), door_ops=a.door_ops)
        std2d.write_std_set(a.db, os.path.join(tmp, 'run2'), door_ops=a.door_ops)
        f1 = sorted(os.path.basename(p) for p in glob.glob(os.path.join(tmp, 'run1', '*')))
        diff = [f for f in f1 if sha(os.path.join(tmp, 'run1', f)) != sha(os.path.join(tmp, 'run2', f))]
        check('W1', 'nondeterminism (two runs from the same DB differ)', not diff and len(f1) >= 7,
              f'files={len(f1)} differing={diff}')
        # W1-proc (§L1.3 F1): 5 separate CLI processes, each a different hash seed, must be byte-identical;
        # control: the same 5 runs with _stable_classes disabled must differ (proves the seeds change hash order)
        def cli_runs(tag, disable):
            digests = []
            for seed in range(1, 6):
                od = os.path.join(tmp, f'{tag}{seed}', *(['d' * seed] * seed))   # §L1.4 F3: a different folder name + depth per run
                argv = [os.path.join(HERE, 'std2d.py'), a.db, '--out', od] + (['--door-ops', a.door_ops] if a.door_ops else [])
                code = (f'import sys; sys.path.insert(0, {HERE!r}); sys.argv = {argv!r}; import std2d; '
                        + ('std2d._stable_classes = lambda doc: None; ' if disable else '') + 'std2d.main()')
                subprocess.run([sys.executable, '-c', code], check=True, capture_output=True,
                               env=dict(os.environ, PYTHONHASHSEED=str(seed)))
                fs_ = sorted(f for f in os.listdir(od) if f.endswith('.dxf'))
                digests.append(hashlib.sha256(b''.join(open(os.path.join(od, f), 'rb').read() for f in fs_)).hexdigest()[:12])
            return digests
        dg = cli_runs('proc', False)
        check('W1-proc', 'nondeterminism across separate processes (hash-seeded CLASS order)', len(set(dg)) == 1,
              f'5 CLI runs, PYTHONHASHSEED=1..5, set digests={dg}')
        dc = cli_runs('procctl', True)
        check('W1-proc-control', 'W1-proc cannot see hash-order output (fix disabled must differ)', len(set(dc)) > 1,
              f'fix disabled: digests={dc} distinct={len(set(dc))}')
        P = r1['paths']
        plans = [P[k] for k in sorted(P) if k.startswith('FLOOR_')]
        elevs = [P[k] for k in ('FRONT', 'REAR', 'LEFT', 'RIGHT')]
        lv, fnd, gs, _ = exp_levels(a.db)
        storey_of = {}
        pss = plan_storeys_of(a.db)
        for s in pss:
            if view_key(s) in P:
                storey_of[P[view_key(s)]] = s
        check('W-N', 'plan sheets not named from the model storeys (§L1.6 N)', len(storey_of) == len(plans) == len(pss),
              f'model plan storeys={pss} sheets={sorted(k for k in P if k.startswith("FLOOR_"))}')
        GF = P[view_key(pss[0])]   # the lowest plan (the grid storey's)
        FF = P[view_key(pss[1])] if len(pss) > 1 else None
        # W2 / W3 / W4
        w2(GF, a.db)
        for p in plans:
            if p != GF:
                w2(p, a.db, tag=f'W2[{os.path.basename(p)}]')
            w3_plan(p, a.db, storey_of[p], tag=f'W3[{os.path.basename(p)}]')
        for p in elevs:
            w3_elev(p, a.db, tag=f'W3[{os.path.basename(p)}]')
        w4(GF)
        # W5 + controls (§L1.2): hinge flip and swing flip must each FAIL
        res5 = w5(plans, a.db, a.ifc, r1['log'], expect_arcs=bool(a.door_ops), verbose=True)
        if res5 is not None:
            oracle = ifc_doors(a.ifc)
            controls = [('y', 'W5-control-swing', 'every door mark mirrored across its door centre along IFC Y (other face)')]
            if a.door_ops:   # a hinge exists to flip only when arcs are drawn
                controls.insert(0, ('x', 'W5-control-hinge', 'every door mark mirrored across its door centre along IFC X (hinge on the other jamb)'))
            for axis, name, what in controls:
                ctl = os.path.join(tmp, name)
                os.makedirs(ctl)
                mirrored = []
                for p in plans:
                    np_ = os.path.join(ctl, os.path.basename(p))
                    _mirror_marks(p, np_, oracle, a.db, axis)
                    mirrored.append(np_)
                say(f'-- {name}: {what} (must FAIL) --')
                n_before = len(FAILS)
                c = w5(mirrored, a.db, a.ifc, r1['log'], tag=name, expect_arcs=bool(a.door_ops))
                if not c:
                    FAILS.pop()   # expected failure is the control passing
                blind = 'W5 cannot see a mirrored hinge' if axis == 'x' else 'W5 cannot see a mirrored swing'
                check(name + '-mutation', blind, c is False and len(FAILS) == n_before,
                      'control FAILED as required' if c is False else 'control PASSED: W5 is blind')
        w6(elevs, a.db, a.ifc)
        for p in plans:   # §L1.5 W10 + control
            w10(p, a.db, storey_of[p], tag=f'W10[{os.path.basename(p)}]')
        ffp = FF
        if ffp:
            ff_other = [g for g, st in walls_cut(a.db, cut_z_of(a.db, storey_of[ffp])) if st != storey_of[ffp]]
            if ff_other:
                doc = ezdxf.readfile(ffp)
                gone = [e for e in doc.modelspace().query('LWPOLYLINE') if e.has_xdata('BIMGUID') and e.get_xdata('BIMGUID')[0][1] == ff_other[0]]
                for e in gone:
                    doc.modelspace().delete_entity(e)
                cp = os.path.join(tmp, 'W10_ctl.dxf')
                doc.saveas(cp)
                say(f'-- W10-control: the {len(gone)} contour(s) of other-storey wall {ff_other[0]} deleted from the FF plan copy (must FAIL) --')
                n0 = len(FAILS)
                c = w10(cp, a.db, storey_of[ffp], tag='W10-control')
                del FAILS[n0:]
                check('W10-mutation', 'W10 cannot see a cut wall missing from the plan', c is False and len(gone) > 0,
                      'control FAILED as required' if c is False else 'control PASSED: blind')
        w8(P.get('ROOF'), a.db, set(storey_of.values()))
        w9(P['SECTION'], a.db)
        # W8/W9 controls: the roof outline / the highest S-SLAB contour moved 50 mm in a copy must FAIL
        for tag, src, layer, pick in (('W8', P.get('ROOF'), 'A-ROOF', lambda es: es[0]),
                                      ('W9', P['SECTION'], 'S-SLAB', lambda es: max(es, key=lambda e: min(y for _, y in e.get_points('xy'))))):
            if not src:
                continue
            doc = ezdxf.readfile(src)
            ent = pick(list(doc.modelspace().query(f'LWPOLYLINE[layer=="{layer}"]')))
            ent.set_points([(x, y - 50) for x, y in ent.get_points('xy')], format='xy')
            mp = os.path.join(tmp, f'{tag}_ctl.dxf')
            doc.saveas(mp)
            n0 = len(FAILS)
            say(f'-- {tag}-control: {layer} {ent.dxf.handle} moved 50 mm in a copy (must FAIL) --')
            c = w8(mp, a.db, set(storey_of.values())) if tag == 'W8' else w9(mp, a.db)
            del FAILS[n0:]
            check(f'{tag}-mutation', f'{tag} cannot see a 50 mm move', c is False, 'control FAILED as required' if c is False else 'control PASSED: blind')
        # W7 mutation: shift one interior load-bearing wall 50 mm
        _, _, ilb = exp_grid(a.db)
        target = sorted(ilb, key=lambda t: t[2])[0]
        mdb = os.path.join(tmp, 'MUT_extracted.db')
        shutil.copy(a.db, mdb)
        con = sqlite3.connect(mdb)
        dx, dy = (0.05, 0.0) if target[0] == 'x' else (0.0, 0.05)
        if con.execute("SELECT 1 FROM sqlite_master WHERE name='element_world_bbox'").fetchone():   # Node DB
            con.execute("""UPDATE element_world_bbox SET minX=minX+?, maxX=maxX+?, minY=minY+?, maxY=maxY+?
                           WHERE guid=?""", (dx, dx, dy, dy, target[2]))
        else:
            con.execute("""UPDATE elements_rtree SET minX=minX+?, maxX=maxX+?, minY=minY+?, maxY=maxY+?
                           WHERE id=(SELECT id FROM elements_meta WHERE guid=?)""", (dx, dx, dy, dy, target[2]))
        con.execute("UPDATE element_transforms SET center_x=center_x+?, center_y=center_y+? WHERE guid=?",
                    (dx, dy, target[2]))
        con.commit()
        con.close()
        say(f'-- W7: wall {target[2]} (axis {target[0]}={target[1]:.1f} mm) shifted 50 mm in a DB copy --')
        n0 = len(FAILS)
        stale2 = w2(GF, mdb, tag='W7.stale-W2')
        stale3 = w3_plan(GF, mdb, gs, tag='W7.stale-W3')
        caught = (not stale2) and (not stale3)
        del FAILS[n0:]   # stale failures are the expected outcome
        rm = std2d.write_std_set(mdb, os.path.join(tmp, 'mut'), door_ops=a.door_ops)
        n1 = len(FAILS)
        fresh2 = w2(rm['paths'][view_key(pss[0])], mdb, tag='W7.fresh-W2')
        fresh3 = w3_plan(rm['paths'][view_key(pss[0])], mdb, gs, tag='W7.fresh-W3')
        del FAILS[n1:]
        check('W7', 'a 50 mm wall shift in the model is not reported by W2/W3 (or the writer does not follow it)',
              caught and fresh2 and fresh3,
              f'stale drawing vs shifted model: W2={"FAIL" if not stale2 else "PASS"} W3={"FAIL" if not stale3 else "PASS"}'
              f' | regenerated: W2={"PASS" if fresh2 else "FAIL"} W3={"PASS" if fresh3 else "FAIL"}')
        # INFO: earlier timestamped set's arcs vs IFC
        if a.old_dir and a.ifc:
            oracle = ifc_doors(a.ifc)
            doors = {g: (x0, x1, y0, y1) for g, x0, x1, y0, y1 in q(a.db, """SELECT m.guid, r.minX, r.maxX,
                     r.minY, r.maxY FROM elements_meta m JOIN m_bbox r ON r.guid=m.guid WHERE m.ifc_class='IfcDoor'""")}
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
