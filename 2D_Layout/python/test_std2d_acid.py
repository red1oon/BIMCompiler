#!/usr/bin/env python3
# ⚠ DO NOT REMOVE: scope = bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L1.6 (multi-storey acid test: OP1 / COL1 / DIM1 / GRID1
# + their mutation controls). Read the log after every run (exit code is not evidence).
# Expectations are recomputed here from the model DB with this file's own queries and rules (not std2d's functions), so the
# same checks measure any std set: origin/master's ("before") and §L1.6's ("after").
"""
Usage:
    python3 test_std2d_acid.py <model.db> --dir <std output dir> [--controls] [--log FILE]
      <model.db>: Node-extracted DB (scripts/extractIFC2DB.js) or the old schema (read through model_db.py)
      --dir:      a std2d output folder (*_FLOOR_*_std.dxf + log_*_std.txt; the log maps each plan sheet to its storey)
      --controls: also run the mutation controls (each must FAIL its check)
"""
import os
import re
import sys
import glob
import math
import shutil
import argparse
import tempfile

import numpy as np
import ezdxf
from shapely.geometry import Polygon, Point, box
from shapely.ops import unary_union
from shapely.validation import make_valid

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import model_db  # noqa: E402  (schema views only)
from section_cut import slice_mesh, chain_segments  # noqa: E402  (mesh slicing engine, not a std2d rule)

PLAN_CUT = 1.2            # m, R7 knife above the storey elevation (stated here; --cut-offset for the knife stress run)
TOL = 0.5                 # mm, DIM1 / GRID1
AXIS_TOL = 10.0           # mm, COL1 column centre on a grid line (R5 merge tolerance)
GAP_AREA = 1.0            # mm², OP1 host area allowed inside the gap rectangle
WALLS = ('IfcWall', 'IfcWallStandardCase')
WALL_LAYERS = ('A-WALL-FULL', 'A-WALL-PRTN')
COL_LAYERS = ('S-COLS', 'A-COLS')
LETTERS = [c for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' if c not in ('I', 'O')]
OUT, FAILS = [], []


def say(s):
    print(s)
    OUT.append(s)


def check(tid, issue, ok, detail):
    say(f"{'PASS' if ok else 'FAIL'} {tid} | {issue} | {detail}")
    if not ok:
        FAILS.append(tid)
    return ok


# ───────────── model (own queries) ─────────────

class Model:
    def __init__(self, db):
        con = model_db.connect(db)
        rows = con.execute("""SELECT m.guid, m.ifc_class, COALESCE(m.storey,''), r.minX, r.maxX, r.minY, r.maxY, r.minZ, r.maxZ,
                   COALESCE(t.center_x,0), COALESCE(t.center_y,0), COALESCE(t.center_z,0), b.vertices, b.faces
            FROM elements_meta m JOIN m_bbox r ON r.guid=m.guid LEFT JOIN element_transforms t ON t.guid=m.guid
            LEFT JOIN element_instances i ON i.guid=m.guid LEFT JOIN m_geom b ON b.geometry_hash=i.geometry_hash
            WHERE m.ifc_class IN ('IfcWall','IfcWallStandardCase','IfcDoor','IfcWindow','IfcColumn','IfcFooting','IfcOpeningElement')
            ORDER BY m.guid""").fetchall()
        self.els = {}
        for g, c, st, x0, x1, y0, y1, z0, z1, cx, cy, cz, vb, fb in rows:
            v = (np.frombuffer(vb, dtype=np.float32).reshape(-1, 3).astype(np.float64) + [cx, cy, cz]) if vb else np.zeros((0, 3))
            f = np.frombuffer(fb, dtype=np.int32).reshape(-1, 3) if fb else np.zeros((0, 3), dtype=np.int32)
            self.els[g] = dict(guid=g, cls=c, storey=st, b=(x0, x1, y0, y1, z0, z1), v=v, f=f)
        self.fills = dict(con.execute('SELECT filling_guid, host_guid FROM m_fills'))
        self.lbv = dict(con.execute("SELECT guid, value FROM m_psets WHERE name='LoadBearing'"))
        names = [r[0] for r in con.execute("SELECT name FROM spatial_structure WHERE type='IfcBuildingStorey'")]
        place = {}
        if con.execute("SELECT 1 FROM sqlite_master WHERE name='storey_elevation'").fetchone():
            place = {n: z for n, z in con.execute('SELECT name, placement_z_m FROM storey_elevation WHERE placement_z_m IS NOT NULL')}
        con.close()
        self.walls = [e for e in self.els.values() if e['cls'] in WALLS]
        self.lv = {}
        for n in names:
            ws = [w['b'][4] for w in self.walls if w['storey'] == n]
            if n in place:
                self.lv[n] = place[n]
            elif ws:
                self.lv[n] = min(ws)
        wall_st = {w['storey'] for w in self.walls}
        fnd = sorted({e['storey'] for e in self.els.values() if e['cls'] == 'IfcFooting'})
        self.fnd = fnd[0] if len(fnd) == 1 else None
        cand = [s for s in self.lv if s in wall_st and (self.fnd is None or self.lv[s] > self.lv[self.fnd])]
        self.gs = min(cand, key=lambda s: self.lv[s])
        self.wall_storeys = sorted((s for s in self.lv if s in wall_st), key=lambda s: self.lv[s])
        self.plan_storeys = []
        for s in sorted((s for s in self.lv if self.lv[s] >= self.lv[self.gs]), key=lambda s: self.lv[s]):
            cz = self.lv[s] + PLAN_CUT
            if any(w['storey'] == s and w['b'][4] <= cz < w['b'][5] for w in self.walls):
                self.plan_storeys.append(s)
        self._slices = {}

    def of(self, cls, storey=None):
        return [e for e in self.els.values() if e['cls'] in cls and (storey is None or e['storey'] == storey)]

    def slice(self, e, z):
        k = (e['guid'], round(z, 6))
        if k not in self._slices:
            seg = slice_mesh(e['v'], e['f'], z) if len(e['f']) else np.zeros((0, 2, 2))
            ps = []
            for ch in chain_segments(seg):
                if len(ch) >= 3:
                    P = Polygon([(float(p[0]), float(p[1])) for p in ch])
                    ps.append(P if P.is_valid else make_valid(P))
            self._slices[k] = unary_union(ps) if ps else None
        return self._slices[k]

    def host(self, o):
        """Authored host, else the one wall whose mesh at the opening's mid-height has no material at the opening centre
        while its bbox contains it (the void is in that wall)."""
        if o['guid'] in self.fills:
            return self.fills[o['guid']], 'ifc'
        x0, x1, y0, y1, z0, z1 = o['b']
        c = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
        hits = []
        for w in self.walls:
            a0, a1, b0, b1, c0, c1 = w['b']
            if a0 - 0.001 <= c[0] <= a1 + 0.001 and b0 - 0.001 <= c[1] <= b1 + 0.001 and c0 < c[2] < c1:
                U = self.slice(w, c[2])
                if U is not None and not U.contains(Point(c[0], c[1])):
                    hits.append(w['guid'])
        return (hits[0], 'mesh_void') if len(hits) == 1 else (None, f'{len(hits)} candidates')


def orthogonal(e):
    v, f = e['v'], e['f']
    if len(f) == 0:
        return True
    a, b, c = v[f[:, 0]], v[f[:, 1]], v[f[:, 2]]
    n = np.cross(b - a, c - a)
    ln = np.linalg.norm(n, axis=1)
    n = n[ln > 1e-12] / ln[ln > 1e-12, None]
    vert = np.abs(n[:, 2]) < 0.01
    return bool(np.all((np.abs(n[vert, 0]) < 1e-3) | (np.abs(n[vert, 1]) < 1e-3)))


def col_centre(e):
    """C2 oracle (own implementation): mean of the distinct plan vertices, if they are equidistant from it or
    point-symmetric about it within 1 mm; else None."""
    if not len(e['v']):
        return None
    u = np.unique(np.round(e['v'][:, :2], 4), axis=0)
    c = u.mean(0)
    d = u - c
    r = np.hypot(d[:, 0], d[:, 1])
    if r.max() - r.min() <= 0.001 or all(np.min(np.hypot(*(d + p).T)) <= 0.001 for p in d):
        return c
    return None


def axis_of(b):
    x0, x1, y0, y1 = b[:4]
    return ('y', (y0 + y1) / 2, x0, x1) if x1 - x0 >= y1 - y0 else ('x', (x0 + x1) / 2, y0, y1)


def exp_grid(M):
    """§L1.6 M/LB/C2 recomputed: {'x': [mm], 'y': [mm]}."""
    ent = {'x': [], 'y': []}
    fw = [w['b'] for w in M.walls if w['storey'] == M.fnd]

    def on(b, others):
        a, p, lo, hi = axis_of(b)
        for f in others:
            fa, _, flo, fhi = axis_of(f)
            band = (f[2], f[3]) if fa == 'y' else (f[0], f[1])
            if fa == a and band[0] < p < band[1] and min(hi, fhi) - max(lo, flo) >= 0.5 * (hi - lo):
                return True
        return False
    for s in M.plan_storeys:
        W = [w for w in M.walls if w['storey'] == s]
        ex0, ex1 = min(w['b'][0] for w in W), max(w['b'][1] for w in W)
        ey0, ey1 = min(w['b'][2] for w in W), max(w['b'][3] for w in W)
        k = M.wall_storeys.index(s)
        adj = [w['b'] for w in M.walls if w['storey'] in M.wall_storeys[max(0, k - 1):k] + M.wall_storeys[k + 1:k + 2]]
        for w in W:
            if not orthogonal(w):
                continue
            b = w['b']
            a, p, lo, hi = axis_of(b)
            ext = (abs(b[2] - ey0) <= 0.01 or abs(b[3] - ey1) <= 0.01) if a == 'y' else (abs(b[0] - ex0) <= 0.01 or abs(b[1] - ex1) <= 0.01)
            if M.fnd:
                ev = ext or (s == M.gs and on(b, fw))
            else:
                st_ = M.lbv.get(w['guid'])   # LB1 stated wins; LB2 continuity only where the model states nothing
                ev = ext or st_ == 'TRUE' or (st_ not in ('TRUE', 'FALSE') and on(b, adj))
            if ev and hi - lo >= 1.0:
                ent[a].append(p)
        for c in M.of(('IfcColumn',), s):
            cc = col_centre(c)
            if cc is not None:
                ent['x'].append(cc[0])
                ent['y'].append(cc[1])
    out = {}
    for a in ('x', 'y'):
        cl = []
        for p in sorted(ent[a]):
            if cl and p - cl[-1][-1] <= 0.010:
                cl[-1].append(p)
            else:
                cl.append([p])
        out[a] = [round(sum(c) / len(c), 4) * 1000 for c in cl]
    return out


# ───────────── DXF ─────────────

def guid_of(e):
    return e.get_xdata('BIMGUID')[0][1] if e.has_xdata('BIMGUID') else None


def plans_in(d):
    """sheet path -> storey name, from the std log's §VIEW lines (both master and §L1.6 write them)."""
    logs = glob.glob(os.path.join(d, 'log_*_std.txt'))
    out = {}
    for lg in logs:
        pre = os.path.basename(lg)[4:-8]
        for ln in open(lg):
            m = re.match(r"§VIEW (FLOOR_\S+) storey='(.*)' elev=", ln)
            if m:
                out[os.path.join(d, f'{pre}_{m.group(1)}_std.dxf')] = m.group(2)
    return out


def grid_of(msp):
    texts = list(msp.query('TEXT[layer=="A-GRID"]'))
    out = {'x': [], 'y': []}
    for ln in msp.query('LINE[layer=="A-GRID"]'):
        s, e = ln.dxf.start, ln.dxf.end
        if abs(s.x - e.x) < 1e-6:
            out['x'].append((s.x, sorted(t.dxf.text for t in texts if abs(t.dxf.align_point.x - s.x) < 1)))
        elif abs(s.y - e.y) < 1e-6:
            out['y'].append((s.y, sorted(t.dxf.text for t in texts if abs(t.dxf.align_point.y - s.y) < 1)))
    for a in out:
        out[a].sort()
    return out


def polys_by_guid(msp, layers):
    out = {}
    for e in msp.query('LWPOLYLINE'):
        if e.dxf.layer in layers and e.closed:
            g = guid_of(e)
            pts = [(x, y) for x, y in e.get_points('xy')]
            if g and len(pts) >= 3:
                P = Polygon(pts)
                out.setdefault(g, []).append(P if P.is_valid else make_valid(P))
    return out


# ───────────── checks ─────────────

def op1(M, sheets):
    """OP1: every door/window of the storey has a gap in its wall host's plan contour; above-cut ones also a dashed outline."""
    rows, allok = [], True
    for path, st in sheets.items():
        doc = ezdxf.readfile(path)
        msp = doc.modelspace()
        cz = M.lv[st] + PLAN_CUT
        walls = polys_by_guid(msp, WALL_LAYERS)
        dashed = {}
        for e in msp.query('LWPOLYLINE'):
            lt = e.dxf.get('linetype', 'BYLAYER')
            if lt == 'BYLAYER':
                lt = doc.layers.get(e.dxf.layer).dxf.linetype if doc.layers.has_entry(e.dxf.layer) else ''
            if lt.upper() in ('HIDDEN', 'DASHED') and doc.linetypes.has_entry(lt) and guid_of(e):   # a defined dashed linetype
                dashed[guid_of(e)] = True
        ops = M.of(('IfcDoor', 'IfcWindow'), st)
        n = dict(model=len(ops), wall_hosted=0, gap=0, above=0, above_dashed=0, no_host=0, host_no_geom=0, host_not_wall=0, host_not_cut=0)
        missed = []
        for o in sorted(ops, key=lambda e: e['guid']):
            h, src = M.host(o)
            x0, x1, y0, y1, z0, z1 = o['b']
            if z0 >= cz:
                n['above'] += 1
                n['above_dashed'] += bool(dashed.get(o['guid']))
            if h is None:
                n['no_host'] += 1
                continue
            hw = M.els.get(h)
            if hw is None:
                n['host_no_geom'] += 1
                continue
            if hw['cls'] not in WALLS:
                n['host_not_wall'] += 1
                continue
            n['wall_hosted'] += 1
            if not (hw['b'][4] < cz < hw['b'][5]):
                n['host_not_cut'] += 1
                missed.append(o['guid'])
                continue
            a = axis_of(hw['b'])[0]
            if a == 'y':
                m_ = (x0 + x1) / 2
                q = (x1 - x0) / 4
                R = box((m_ - q) * 1000, hw['b'][2] * 1000, (m_ + q) * 1000, hw['b'][3] * 1000)
            else:
                m_ = (y0 + y1) / 2
                q = (y1 - y0) / 4
                R = box(hw['b'][0] * 1000, (m_ - q) * 1000, hw['b'][1] * 1000, (m_ + q) * 1000)
            area = sum(P.intersection(R).area for P in walls.get(h, []))
            if area <= GAP_AREA and h in walls:
                n['gap'] += 1
            else:
                missed.append(o['guid'])
        ok = n['gap'] == n['model'] and n['above_dashed'] == n['above']
        allok &= ok
        rows.append((st, n, missed))
        say(f"  OP1 {os.path.basename(path)} storey={st!r} cut_z={cz:.3f} " + ' '.join(f'{k}={v}' for k, v in n.items())
            + (f' not-gapped={missed[:4]}' if missed else ''))
    return allok, rows


def col1(M, sheets):
    allok, rows = True, []
    for path, st in sheets.items():
        msp = ezdxf.readfile(path).modelspace()
        cz = M.lv[st] + PLAN_CUT
        cols = [c for c in M.of(('IfcColumn',)) if c['b'][4] < cz < c['b'][5] and len(c['f'])]
        cp = polys_by_guid(msp, COL_LAYERS)
        wp = polys_by_guid(msp, WALL_LAYERS)
        hatch = {guid_of(h) for h in msp.query('HATCH') if h.dxf.layer in COL_LAYERS}
        gr = grid_of(msp)
        n = dict(cut=len(cols), as_column=0, filled=0, on_wall_layer=0, gridded=0)
        for c in cols:
            g = c['guid']
            n['as_column'] += g in cp
            n['filled'] += g in hatch
            n['on_wall_layer'] += g in wp
            cc = col_centre(c)
            cx, cy = (cc * 1000) if cc is not None else ((c['b'][0] + c['b'][1]) / 2 * 1000, (c['b'][2] + c['b'][3]) / 2 * 1000)
            n['gridded'] += any(abs(p - cx) <= AXIS_TOL for p, _ in gr['x']) and any(abs(p - cy) <= AXIS_TOL for p, _ in gr['y'])
        ok = n['as_column'] == n['filled'] == n['gridded'] == n['cut'] and n['on_wall_layer'] == 0
        allok &= ok
        rows.append((st, n))
        say(f"  COL1 {os.path.basename(path)} storey={st!r} " + ' '.join(f'{k}={v}' for k, v in n.items()))
    return allok, rows


def dim1(M, sheets, eg):
    allok, rows = True, []
    for path, st in sheets.items():
        msp = ezdxf.readfile(path).modelspace()
        cz = M.lv[st] + PLAN_CUT
        cw = [w for w in M.walls if w['b'][4] < cz < w['b'][5]]
        env = (min(w['b'][0] for w in cw) * 1000, max(w['b'][1] for w in cw) * 1000,
               min(w['b'][2] for w in cw) * 1000, max(w['b'][3] for w in cw) * 1000)
        cut_els = cw + [c for c in M.of(('IfcColumn',)) if c['b'][4] < cz < c['b'][5]]
        xs = set(np.round(np.concatenate([e['v'][:, 0] for e in cut_els if len(e['v'])]) * 1000, 1).tolist())
        ys = set(np.round(np.concatenate([e['v'][:, 1] for e in cut_els if len(e['v'])]) * 1000, 1).tolist())
        for o in M.of(('IfcDoor', 'IfcWindow', 'IfcOpeningElement')):
            xs.update([round(o['b'][0] * 1000, 1), round(o['b'][1] * 1000, 1)])
            ys.update([round(o['b'][2] * 1000, 1), round(o['b'][3] * 1000, 1)])
        for e in cut_els:   # the model at the cut: slice points of the cut walls/columns (a sloped end face is cut mid-edge)
            if len(e['f']):
                seg = slice_mesh(e['v'], e['f'], cz).reshape(-1, 2)
                xs.update(np.round(seg[:, 0] * 1000, 1).tolist())
                ys.update(np.round(seg[:, 1] * 1000, 1).tolist())
        xs, ys = np.array(sorted(xs)), np.array(sorted(ys))
        sp = {a: sorted(abs(b - c) for b, c in zip(eg[a], eg[a][1:])) for a in ('x', 'y')}
        tiers = {s: {'T1': 0, 'T2': 0, 'T3': 0} for s in 'SNWE'}
        bad = []
        for d in msp.query('DIMENSION'):
            if d.dxf.get('text', '') not in ('', '<>'):
                bad.append('text override')
            p1, p2, base = d.dxf.defpoint2, d.dxf.defpoint3, d.dxf.defpoint
            horiz = abs(d.dxf.get('angle', 0)) < 1e-6
            k = 0 if horiz else 1
            dist = abs((p2.x - p1.x) if horiz else (p2.y - p1.y))
            meas = d.get_measurement()
            if abs(meas - dist) > TOL:
                bad.append(f'meas {meas:.2f} != points {dist:.2f}')
            if horiz:
                side, off = ('S', env[2] - base.y) if base.y < env[2] else ('N', base.y - env[3])
            else:
                side, off = ('W', env[0] - base.x) if base.x < env[0] else ('E', base.x - env[1])
            tier = {1000: 'T3', 1800: 'T2', 2600: 'T1'}.get(int(round(off / 100.0) * 100))
            if tier is None:
                bad.append(f'dim at offset {off:.0f}')
                continue
            tiers[side][tier] += 1
            if tier == 'T1':
                want = (env[1] - env[0]) if horiz else (env[3] - env[2])
                if abs(meas - want) > TOL:
                    bad.append(f'T1 {meas:.1f} != envelope {want:.1f}')
            elif tier == 'T2':
                if not any(abs(meas - s) <= TOL for s in sp['x' if horiz else 'y']):
                    bad.append(f'T2 {meas:.1f} not a grid spacing')
            else:
                cand = xs if horiz else ys
                for pt in ((p1.x, p2.x) if horiz else (p1.y, p2.y)):
                    if np.min(np.abs(cand - pt)) > TOL:
                        bad.append(f'T3 point {pt:.1f} not a cut wall/column vertex or opening edge')
        want_t2 = {'x': len(eg['x']) - 1, 'y': len(eg['y']) - 1}
        for sd in 'SNWE':
            for t in ('T1', 'T2', 'T3'):
                if tiers[sd][t] == 0:
                    bad.append(f'{sd}: no {t}')
            if tiers[sd]['T2'] != want_t2['x' if sd in 'SN' else 'y']:
                bad.append(f"{sd}: T2 segments {tiers[sd]['T2']} != grid spacings {want_t2['x' if sd in 'SN' else 'y']}")
        ok = not bad
        allok &= ok
        rows.append((st, tiers, bad))
        say(f"  DIM1 {os.path.basename(path)} storey={st!r} tiers " + ' '.join(f"{sd}:{t['T1']}/{t['T2']}/{t['T3']}" for sd, t in tiers.items())
            + (f" problems={len(bad)} {sorted(set(bad))[:4]}" if bad else ' ok'))
    return allok, rows


def grid1(M, sheets, eg):
    bad, sig, rows = [], {}, []
    for path, st in sheets.items():
        gr = grid_of(ezdxf.readfile(path).modelspace())
        xl, yl = [l for _, l in gr['x']], [l for _, l in gr['y']]
        for i, labs in enumerate(xl):
            if labs != [str(i + 1)] * 2:
                bad.append(f'{st}: x line {i} labels {labs}')
        for i, labs in enumerate(yl):
            want = LETTERS[i] if i < len(LETTERS) else LETTERS[i // len(LETTERS) - 1] + LETTERS[i % len(LETTERS)]
            if labs != [want] * 2:
                bad.append(f'{st}: y line {i} labels {labs}')
        for a in ('x', 'y'):
            got = [p for p, _ in gr[a]]
            if len(got) != len(eg[a]) or any(abs(p - q) > TOL for p, q in zip(got, eg[a])):
                bad.append(f'{st}: {a} lines {len(got)} != model {len(eg[a])}')
        sig[path] = (tuple(round(p, 1) for p, _ in gr['x']), tuple(round(p, 1) for p, _ in gr['y']),
                     tuple(tuple(l) for l in xl), tuple(tuple(l) for l in yl))
        rows.append((st, len(gr['x']), len(gr['y'])))
        say(f"  GRID1 {os.path.basename(path)} storey={st!r} x={[l[0] if l else '?' for l in xl]} y={[l[0] if l else '?' for l in yl]}")
    if len(set(sig.values())) > 1:
        bad.append(f'grid differs between storeys ({len(set(sig.values()))} variants)')
    return not bad, rows, bad


def run_all(M, sheets, eg, tag=''):
    ok_op, _ = op1(M, sheets)
    check(f'OP1{tag}', 'an opening the knife misses is drawn on a solid wall (door/window not a gap in its host wall, or an '
          'above-cut one not dashed)', ok_op, 'per storey above')
    ok_c, _ = col1(M, sheets)
    check(f'COL1{tag}', 'columns drawn as partitions / unfilled / not gridded', ok_c, 'per storey above')
    ok_d, _ = dim1(M, sheets, eg)
    check(f'DIM1{tag}', 'a dimension tier missing on a side, or a dimension not equal to the model', ok_d, 'per storey above')
    ok_g, _, bad = grid1(M, sheets, eg)
    check(f'GRID1{tag}', 'grid unreadable, not the model grid, or not the same on every storey', ok_g,
          f"exp x={len(eg['x'])} y={len(eg['y'])} " + ('; '.join(bad[:5]) if bad else 'all equal'))
    return ok_op, ok_c, ok_d, ok_g


def control(name, issue, fn):
    n0 = len(FAILS)
    say(f'-- {name} (must FAIL) --')
    res = fn()
    del FAILS[n0:]
    if res is None:
        say(f'INFO {name} | not applicable on this set (nothing to mutate); not a PASS')
        return
    check(name, issue, res is False, 'control FAILED as required' if res is False else 'control PASSED: the check is blind')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('db')
    ap.add_argument('--dir', required=True)
    ap.add_argument('--controls', action='store_true')
    ap.add_argument('--log', default=None)
    ap.add_argument('--cut-offset', type=float, default=None, help='knife stress run: the writer was run with this CUT_OFFSET (m)')
    a = ap.parse_args()
    global PLAN_CUT
    if a.cut_offset is not None:
        PLAN_CUT = a.cut_offset
    M = Model(a.db)
    sheets = plans_in(a.dir)
    say(f'§ENTRY test_std2d_acid db={os.path.basename(a.db)} dir={a.dir} knife={PLAN_CUT} m above the storey elevation')
    say(f"§MODEL storeys={ {s: round(z, 4) for s, z in sorted(M.lv.items(), key=lambda kv: kv[1])} } footing_storey={M.fnd!r} "
        f"grid_storey={M.gs!r} plan_storeys={M.plan_storeys}")
    drawn = sorted(set(sheets.values()))
    check('PLANS', 'a model plan storey has no plan sheet (one plan per storey)', set(M.plan_storeys) <= set(drawn),
          f'model={M.plan_storeys} sheets={drawn}')
    sheets = {p: s for p, s in sheets.items() if s in M.lv}
    eg = exp_grid(M)
    say(f"§EXP_GRID x={[round(v, 1) for v in eg['x']]} y={[round(v, 1) for v in eg['y']]}")
    run_all(M, sheets, eg)
    if a.controls:
        tmp = tempfile.mkdtemp(prefix='acid_ctl_')
        try:
            # OP1-control: re-fill one drawn gap (a host-tagged rectangle over an above/below-cut opening) in a copy
            def op1_ctl():
                for p, st in sheets.items():
                    doc = ezdxf.readfile(p)
                    msp = doc.modelspace()
                    cz = M.lv[st] + PLAN_CUT
                    for o in sorted(M.of(('IfcDoor', 'IfcWindow'), st), key=lambda e: e['guid']):
                        h, _ = M.host(o)
                        if h is None or h not in M.els or M.els[h]['cls'] not in WALLS or (o['b'][4] < cz < o['b'][5]):
                            continue
                        hb = M.els[h]['b']
                        pl = msp.add_lwpolyline([(o['b'][0] * 1000, hb[2] * 1000), (o['b'][1] * 1000, hb[2] * 1000),
                                                 (o['b'][1] * 1000, hb[3] * 1000), (o['b'][0] * 1000, hb[3] * 1000)]
                                                if axis_of(hb)[0] == 'y' else
                                                [(hb[0] * 1000, o['b'][2] * 1000), (hb[1] * 1000, o['b'][2] * 1000),
                                                 (hb[1] * 1000, o['b'][3] * 1000), (hb[0] * 1000, o['b'][3] * 1000)],
                                                close=True, dxfattribs={'layer': 'A-WALL-PRTN'})
                        doc.appids.add('BIMGUID') if not doc.appids.has_entry('BIMGUID') else None
                        pl.set_xdata('BIMGUID', [(1000, h)])
                        cp = os.path.join(tmp, 'op1_' + os.path.basename(p))
                        doc.saveas(cp)
                        say(f'  gap of {o["guid"]} re-filled in {os.path.basename(p)}')
                        return op1(M, {cp: st})[0]
                say('  no knife-missed opening with a wall host: control not applicable')
                return None
            control('OP1-control', 'OP1 cannot see a gap filled with wall', op1_ctl)

            def col1_ctl():
                for p, st in sheets.items():
                    doc = ezdxf.readfile(p)
                    cs = [e for e in doc.modelspace().query('LWPOLYLINE') if e.dxf.layer in COL_LAYERS]
                    if cs:
                        cs[0].dxf.layer = 'A-WALL-PRTN'
                        cp = os.path.join(tmp, 'col1_' + os.path.basename(p))
                        doc.saveas(cp)
                        return col1(M, {cp: st})[0]
                say('  no column on a column layer: control not applicable')
                return None
            control('COL1-control', 'COL1 cannot see a column drawn as a partition', col1_ctl)

            def grid1_ctl():
                p0 = sorted(sheets)[-1]
                doc = ezdxf.readfile(p0)
                t = sorted(doc.modelspace().query('TEXT[layer=="A-GRID"]'), key=lambda t: t.dxf.text)[0]
                t.dxf.text = 'Z9'
                cp = os.path.join(tmp, os.path.basename(p0))
                doc.saveas(cp)
                sh = dict(sheets)
                sh.pop(p0)
                sh[cp] = sheets[p0]
                return grid1(M, sh, eg)[0]
            control('GRID1-control', 'GRID1 cannot see one relabelled bubble on one storey', grid1_ctl)

            def dim1_ctl():
                p0 = sorted(sheets)[0]
                doc = ezdxf.readfile(p0)
                d = max(doc.modelspace().query('DIMENSION'), key=lambda d: d.get_measurement())   # the overall (T1) string
                q = d.dxf.defpoint2
                d.dxf.defpoint2 = (q.x + 50, q.y + 50)   # 50 mm off along both axes: the overall no longer equals the model
                cp = os.path.join(tmp, os.path.basename(p0))
                doc.saveas(cp)
                return dim1(M, {cp: sheets[p0]}, eg)[0]
            control('DIM1-control', 'DIM1 cannot see a dimension point moved 50 mm', dim1_ctl)
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
    say(f'SUMMARY fail={len(FAILS)} {FAILS}')
    if a.log:
        with open(a.log, 'w') as fh:
            fh.write('\n'.join(OUT) + '\n')
    sys.exit(1 if FAILS else 0)


if __name__ == '__main__':
    main()
