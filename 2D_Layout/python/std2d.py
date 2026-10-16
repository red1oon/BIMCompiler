# BIM OOTB — Frictionless BIM. Two DBs. One browser. Zero install.
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
# SPDX-License-Identifier: MIT
"""
std2d.py: standard 2D set (plans + elevations) written from the model DB.

Spec: bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L1 (G1-G8) + §L1.1 (R1-R14).
Every value is from the DB (elements_meta, elements_rtree, element_transforms,
base_geometries, rel_fills_host, spatial_structure) or is a named convention
constant below. Unresolvable values are logged as §GAP; nothing is guessed.

Door hinges (§L1.2): from a `door_operation` table (scripts/extractIFC2DB.js) in the DB itself or
in --door-ops <db> (the Node-extracted DB), joined on GUID. Absent -> GAP:door_hinge, no arc.

Usage (also via drawing_writer_dxf.py --std):
    python3 std2d.py <DX_extracted.db> [--door-ops DB] [--out DIR] [--png]
Output: DIR/{PREFIX}_{FLOOR_GF,FLOOR_FF,FRONT,REAR,LEFT,RIGHT}_std.dxf
        DIR/log_{PREFIX}_std.txt   (read it: §GRID, §DIM, §LEVEL, §GAP lines)
"""
import os
import sys
import json
import math
import sqlite3
import argparse

import numpy as np
import ezdxf
from ezdxf.enums import TextEntityAlignment

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from section_cut import section_cut as run_section_cut, slice_mesh, chain_segments  # noqa: E402

# ── R4/R5 grid rule constants (stated in §L1.1) ──
GRID_MERGE_TOL = 0.010      # m, R5
GRID_MIN_WALL_LEN = 1.0     # m, R4
EXT_FACE_TOL = 0.010        # m, R4(b) outer face on envelope
BEAR_OVERLAP = 0.50         # R4(a) share of wall length over the foundation wall
FACE_PT_TOL = 0.005         # m, R8 contour vertex on the face line
PT_MERGE = 0.001            # m, R8
LEAF_MIRROR_TOL = 0.001     # m, R9 a vertex coordinate with no mirror partner = leaf
VERTICAL_TOL = 1e-6         # §L1.2 H1: door z_axis must be (0,0,1)
SINGLE_SWING = ('SINGLE_SWING_LEFT', 'SINGLE_SWING_RIGHT')   # §L1.2 H1: the only types drawn
CUT_OFFSET = 1.2            # m, R7 (existing §5.1a)
# ── R7/R11 sheet conventions (paper mm at 1:100; model = paper * SCALE) ──
SCALE = 100
DIM_T3, DIM_T2, DIM_T1 = 10, 18, 26
GRID_END, BUBBLE_C, BUBBLE_R = 33, 37, 4.0
TXT_DIM, TXT_BUBBLE, TXT_NOTE, TXT_TITLE, TXT_LEVEL = 2.5, 3.5, 2.0, 5.0, 2.5
ELEV_GRID_END, ELEV_BUBBLE_C = 12, 16
ELEV_DIM_CHAIN, ELEV_DIM_OVERALL = 10, 18
DIM_NARROW = 4.5           # paper mm, narrow-dim text offset (R7)
LEVEL_EXT = 6               # paper mm, datum line beyond the face extents
ROMAN_SKIP = ('I', 'O')
PLAN_NAMES = ['GF', 'FF', 'SF', 'TF']   # convention: ground/first/second/third floor

LAYERS = {   # R12: name -> (ACI colour, lineweight 1/100 mm, linetype)
    'A-WALL-FULL': (7, 50, 'Continuous'), 'A-WALL-PRTN': (7, 35, 'Continuous'),
    'A-WALL-PATT': (8, 13, 'Continuous'), 'A-WALL': (7, 35, 'Continuous'),
    'A-DOOR': (3, 25, 'Continuous'), 'A-GLAZ': (4, 18, 'Continuous'),
    'A-GLAZ-SILL': (4, 25, 'Continuous'), 'A-GRID': (1, 18, 'CENTER'),
    'A-ANNO-DIMS': (7, 18, 'Continuous'), 'A-ANNO-LEVL': (6, 18, 'Continuous'),
    'A-ANNO-NOTE': (1, 18, 'Continuous'), 'A-ANNO-TTLB': (7, 25, 'Continuous'),
    'A-ROOF': (5, 35, 'Continuous'),
    'A-SECT': (7, 50, 'Continuous'), 'S-SLAB': (2, 50, 'Continuous'),   # §L1.4 F5 section cut layers
}


def mm(v):
    """metres -> model mm, rounded to 0.01 mm (removes float32 noise; R13)."""
    return round(float(v) * 1000.0, 2)


class Log:
    def __init__(self):
        self.lines, self.gaps = [], []

    def __call__(self, msg):
        self.lines.append(msg)

    def gap(self, code, guid, detail):
        self.gaps.append((code, guid, detail))
        self.lines.append(f'§GAP {code} guid={guid} {detail}')


# ─────────────────────────────── model ───────────────────────────────

def _orthogonal(verts, faces):
    """R3: every vertical mesh face has an X- or Y-aligned plan normal."""
    if faces is None or len(faces) == 0:
        return True
    a, b, c = verts[faces[:, 0]], verts[faces[:, 1]], verts[faces[:, 2]]
    n = np.cross(b - a, c - a)
    ln = np.linalg.norm(n, axis=1)
    ok = ln > 1e-12
    n = n[ok] / ln[ok, None]
    vert = np.abs(n[:, 2]) < 0.01
    nx, ny = np.abs(n[vert, 0]), np.abs(n[vert, 1])
    return bool(np.all((nx < 1e-3) | (ny < 1e-3)))


def load_door_ops(db_path, door_ops_db, log):
    """§L1.2 D1: guid -> door_operation row, from the DB itself, else from door_ops_db. {} if neither."""
    for src in (db_path, door_ops_db):
        if not src:
            continue
        con = sqlite3.connect(src)
        try:
            if not con.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='door_operation'").fetchone():
                continue
            rows = con.execute("""SELECT guid, operation_type, source, x_axis, y_axis, z_axis
                                  FROM door_operation ORDER BY guid""").fetchall()
        finally:
            con.close()
        log(f'§DOOR_OPS table=door_operation db={os.path.basename(src)} rows={len(rows)}')
        return {g: dict(op=op, source=sc, x=json.loads(x) if x else None, y=json.loads(y) if y else None,
                        z=json.loads(z) if z else None) for g, op, sc, x, y, z in rows}
    log('§DOOR_OPS none (no door_operation table): every door keeps GAP:door_hinge')
    return {}


def load_model(db_path, log, door_ops_db=None):
    con = sqlite3.connect(db_path)
    rows = con.execute(
        """SELECT m.guid, m.ifc_class, m.element_name, COALESCE(m.storey,''),
                  r.minX, r.maxX, r.minY, r.maxY, r.minZ, r.maxZ,
                  COALESCE(t.center_x,0), COALESCE(t.center_y,0), COALESCE(t.center_z,0),
                  b.vertices, b.faces, b.vertex_count, b.face_count
           FROM elements_meta m JOIN elements_rtree r ON r.id = m.id
           LEFT JOIN element_transforms t ON t.guid = m.guid
           LEFT JOIN element_instances i ON i.guid = m.guid
           LEFT JOIN base_geometries b ON b.geometry_hash = i.geometry_hash
           WHERE m.ifc_class IN ('IfcWall','IfcWallStandardCase','IfcDoor','IfcWindow',
                                 'IfcSlab','IfcRoof','IfcFooting')
           ORDER BY m.guid""").fetchall()
    storey_names = [r[0] for r in con.execute(
        "SELECT name FROM spatial_structure WHERE type='IfcBuildingStorey' ORDER BY guid")]
    hosts = dict(con.execute("SELECT element_guid, host_guid FROM rel_fills_host ORDER BY element_guid"))
    con.close()
    els = []
    for (g, cls, name, st, x0, x1, y0, y1, z0, z1, cx, cy, cz, vb, fb, vc, fc) in rows:
        v = np.frombuffer(vb, dtype=np.float32).reshape(-1, 3).astype(np.float64) if vb else np.zeros((0, 3))
        f = np.frombuffer(fb, dtype=np.int32).reshape(-1, 3) if fb else np.zeros((0, 3), dtype=np.int32)
        els.append(dict(guid=g, cls=cls, name=name or '', storey=st,
                        x0=x0, x1=x1, y0=y0, y1=y1, z0=z0, z1=z1,
                        c=(cx, cy, cz), v=v, f=f))
    walls = [e for e in els if e.get('cls') in ('IfcWall', 'IfcWallStandardCase')]
    # R1 storey elevation = min minZ of contained walls
    storeys = []
    for s in sorted(set(storey_names)):
        sw = [w for w in walls if w['storey'] == s]
        if not sw:
            log.gap('GAP:storey_no_walls', s, 'no IfcWall in storey; no datum drawn')
            continue
        storeys.append(dict(name=s, elev=min(w['z0'] for w in sw)))
    storeys.sort(key=lambda s: (s['elev'], s['name']))
    for s in storeys:
        log(f"§LEVEL storey={s['name']!r} elev={s['elev']:.4f} m (R1 min wall minZ)")
    fnd_st = sorted({e['storey'] for e in els if e['cls'] == 'IfcFooting'})
    if len(fnd_st) != 1:
        log.gap('GAP:foundation_storey', '-', f'storeys with IfcFooting={fnd_st}; need exactly 1')
        fnd = None
    else:
        fnd = fnd_st[0]
    fnd_elev = next((s['elev'] for s in storeys if s['name'] == fnd), None)
    above = [s for s in storeys if fnd_elev is None or s['elev'] > fnd_elev]
    grid_storey = above[0]['name'] if above else None
    log(f'§STOREY foundation={fnd!r} grid_storey={grid_storey!r} (R2)')
    # R11 roof element: IfcRoof, else the highest IfcSlab
    roofs = [e for e in els if e['cls'] == 'IfcRoof']
    if not roofs:
        slabs = [e for e in els if e['cls'] == 'IfcSlab']
        if slabs:
            top = max(e['z1'] for e in slabs)
            roofs = [e for e in slabs if e['z1'] == top]
    roof_top = max((e['z1'] for e in roofs), default=None)
    if roof_top is None:
        log.gap('GAP:roof_top', '-', 'no IfcRoof / IfcSlab')
    else:
        log(f'§LEVEL T/ROOF={roof_top:.4f} m from {[r["guid"] for r in roofs]} (R11)')
    door_ops = load_door_ops(db_path, door_ops_db, log)
    return dict(els=els, walls=walls, storeys=storeys, foundation=fnd,
                grid_storey=grid_storey, roofs=roofs, roof_top=roof_top, hosts=hosts,
                by_guid={e['guid']: e for e in els}, door_ops=door_ops)


def wall_axis(w):
    """R3: ('y', axis_y, (x0,x1)) for a wall running along X (constant-Y line),
    ('x', axis_x, (y0,y1)) for one running along Y."""
    dx, dy = w['x1'] - w['x0'], w['y1'] - w['y0']
    if dx >= dy:
        return 'y', (w['y0'] + w['y1']) / 2, (w['x0'], w['x1']), dx
    return 'x', (w['x0'] + w['x1']) / 2, (w['y0'], w['y1']), dy


def envelope(walls):
    return (min(w['x0'] for w in walls), max(w['x1'] for w in walls),
            min(w['y0'] for w in walls), max(w['y1'] for w in walls))


def derive_grid(model, log, gaps=True):
    """G1/R3-R6. Returns dict(x=[(label,pos,guids)], y=[...], gridded=set(guids))."""
    gs = model['grid_storey']
    gw = [w for w in model['walls'] if w['storey'] == gs]
    fw = [w for w in model['walls'] if w['storey'] == model['foundation']]
    env = envelope(gw)
    ent = {'x': [], 'y': []}
    gridded = set()
    for w in gw:
        if not _orthogonal(w['v'], w['f']):
            if gaps:
                log.gap('GAP:wall_not_orthogonal', w['guid'], 'not gridded (R3)')
            continue
        ax, pos, (a, b), L = wall_axis(w)
        bear = False
        for f in fw:
            fax, _, (fa, fb), _ = wall_axis(f)
            if fax != ax:
                continue
            lo, hi = (f['y0'], f['y1']) if ax == 'y' else (f['x0'], f['x1'])
            ov = min(b, fb) - max(a, fa)
            if lo < pos < hi and ov >= BEAR_OVERLAP * L:
                bear = True
                break
        if ax == 'y':
            ext = abs(w['y0'] - env[2]) <= EXT_FACE_TOL or abs(w['y1'] - env[3]) <= EXT_FACE_TOL
        else:
            ext = abs(w['x0'] - env[0]) <= EXT_FACE_TOL or abs(w['x1'] - env[1]) <= EXT_FACE_TOL
        keep = (bear or ext) and L >= GRID_MIN_WALL_LEN
        log(f"§WALL guid={w['guid']} axis={ax}={pos:.4f} len={L:.3f} bear={bear} ext={ext} gridded={keep}")
        if keep:
            ent[ax].append((pos, w['guid']))
            gridded.add(w['guid'])
    out = {}
    for ax in ('x', 'y'):
        clusters = []
        for pos, g in sorted(ent[ax]):
            if clusters and pos - clusters[-1][-1][0] <= GRID_MERGE_TOL:
                clusters[-1].append((pos, g))
            else:
                clusters.append([(pos, g)])
        lines = []
        for i, cl in enumerate(clusters):
            p = round(sum(c[0] for c in cl) / len(cl), 4)
            lines.append((grid_label(ax, i), p, sorted(c[1] for c in cl)))
        out[ax] = lines
        for lab, p, gs_ in lines:
            log(f'§GRID {lab} axis={ax} pos={p:.4f} m walls={len(gs_)}')
    out['gridded'] = gridded
    out['env'] = env
    return out


def grid_label(ax, i):
    """R6: numbers on constant-X lines; letters (no I/O) on constant-Y lines."""
    if ax == 'x':
        return str(i + 1)
    letters = [c for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' if c not in ROMAN_SKIP]
    if i < len(letters):
        return letters[i]
    return letters[i // len(letters) - 1] + letters[i % len(letters)]


def door_swing(d):
    """R9: swing side = sign of the leaf offset across the thickness axis.
    Returns (thk_axis 'x'|'y', sign +1/-1) or None."""
    v = d['v']
    if len(v) == 0:
        return None
    ext = v.max(0) - v.min(0)
    ta = 0 if ext[0] < ext[1] else 1
    vals = np.unique(np.round(v[:, ta], 3))
    # the frame/casing is mirror-symmetric about the door centre; the leaf is not
    inner = np.array([x for x in vals if not np.any(np.abs(vals + x) <= LEAF_MIRROR_TOL)])
    if len(inner) == 0:
        return None
    if np.all(inner > 0):
        return ('x' if ta == 0 else 'y', 1)
    if np.all(inner < 0):
        return ('x' if ta == 0 else 'y', -1)
    return None


def _leaf_values(t):
    """R9 leaf test along one axis: coordinates (about the bbox centre) with no mirror partner within 1 mm."""
    t = t - (t.min() + t.max()) / 2
    vals = np.unique(np.round(t, 4))
    inner = [x for x in vals if not np.any(np.abs(vals + x) <= LEAF_MIRROR_TOL)]
    return t, inner


def _components(n, faces):
    """Face-connected vertex sets (union-find over triangle edges)."""
    par = list(range(n))

    def find(a):
        while par[a] != a:
            par[a] = par[par[a]]
            a = par[a]
        return a
    for a, b, c in faces:
        for x, y in ((a, b), (b, c)):
            rx, ry = find(int(x)), find(int(y))
            if rx != ry:
                par[rx] = ry
    return np.array([find(i) for i in range(n)])


def door_hinge(d, op, swing):
    """§L1.2 H1-H5. Returns ('ok', dict(hinge, width, X, Y, closed)) or (gap_code, detail). Never guesses."""
    if op is None:
        return 'GAP:door_hinge', 'no door_operation row; no arc drawn'
    if op['op'] not in SINGLE_SWING:
        return 'GAP:door_hinge', f"operation_type={op['op']} not drawn (H1: single swing only); no arc drawn"
    if not (op['x'] and op['y'] and op['z']) or np.max(np.abs(np.array(op['z']) - [0, 0, 1])) > VERTICAL_TOL:
        return 'GAP:door_hinge', f"placement axes missing or not vertical z={op['z']} (H1); no arc drawn"
    X, Y = np.array(op['x'][:2], float), np.array(op['y'][:2], float)
    ta, sgn = swing                                   # R9 leaf offset (world axis, sign)
    r9 = np.array([sgn, 0.0]) if ta == 'x' else np.array([0.0, sgn])
    if float(np.dot(r9, Y)) <= 0.5:                   # H5: the mesh leaf must sit on the +Y side
        return 'GAP:door_handing_conflict', (f"mesh leaf offset {ta}{sgn:+d} vs IFC +Y={Y.round(6).tolist()} "
                                             f"op={op['op']}; no arc drawn")
    v = d['v']
    t, inner = _leaf_values(v[:, :2] @ Y)
    if not inner:
        return 'GAP:door_swing', 'no leaf along y_axis (H4)'
    seed = np.any(np.abs(np.round(t, 4)[:, None] - np.array(inner)[None, :]) <= 1e-9, axis=1)
    comp = _components(len(v), d['f'])
    leaf = np.isin(comp, np.unique(comp[seed]))      # H4: the mesh components holding a leaf vertex
    w2 = v[leaf, :2] + np.array(d['c'][:2])           # world plan coordinates
    s, tt = w2 @ X, w2 @ Y
    s0, s1, t1 = float(s.min()), float(s.max()), float(tt.max())
    left = op['op'].endswith('LEFT')
    sh = s0 if left else s1                           # H3: LEFT = -X jamb, RIGHT = +X jamb
    hinge = sh * X + t1 * Y                           # at the leaf's +Y face (H4)
    return 'ok', dict(hinge=hinge, width=s1 - s0, X=X, Y=Y, closed=(X if left else -X))


# ─────────────────────────────── DXF ───────────────────────────────

def _stable_classes(doc):
    """§L1.3 F1 (R13 across processes): ezdxf adds one CLASS per DXF type in use by iterating a set
    (hash order, salted per process). Register them first in a fixed order: ezdxf's REQUIRED_CLASSES
    list, then the types in use sorted. ClassesSection.register skips existing keys, so the save-time
    call adds nothing in hash order."""
    from ezdxf.sections.classes import REQUIRED_CLASSES, REQ_R2004
    for name in REQUIRED_CLASSES.get(doc.dxfversion, REQ_R2004):
        doc.classes.add_class(name)
    for name in sorted(doc.entitydb.dxf_types_in_use()):
        doc.classes.add_class(name)


def _save(doc, path):
    _stable_classes(doc)
    doc.saveas(path)


def new_doc():
    ezdxf.options.write_fixed_meta_data_for_testing = True   # R13
    doc = ezdxf.new('R2010', setup=True)
    doc.units = ezdxf.units.MM
    doc.header['$INSUNITS'] = 4
    doc.header['$MEASUREMENT'] = 1
    for name, (col, lw, lt) in LAYERS.items():
        doc.layers.add(name, color=col, lineweight=lw, linetype=lt)
    doc.header['$LTSCALE'] = SCALE / 2
    ds = doc.dimstyles.new('STD100')
    ds.dxf.dimscale = SCALE
    ds.dxf.dimtxt = TXT_DIM
    ds.dxf.dimasz = 1.2
    ds.dxf.dimtsz = 0
    ds.set_arrows(blk='ARCHTICK')
    ds.dxf.dimexo = 1.5
    ds.dxf.dimexe = 1.5
    ds.dxf.dimdec = 0
    ds.dxf.dimgap = 0.6
    ds.dxf.dimtad = 1
    ds.dxf.dimtih = 0
    ds.dxf.dimtoh = 0
    ds.dxf.dimlunit = 2
    ds.dxf.dimzin = 8
    ds.dxf.dimdle = 1.5
    doc.appids.new('BIMGUID')
    return doc


def _tag(ent, guid):
    if guid:
        ent.set_xdata('BIMGUID', [(1000, guid)])


def _text(msp, s, pos, h, layer, align=TextEntityAlignment.MIDDLE_CENTER, rot=0, guid=None):
    t = msp.add_text(s, height=h * SCALE, rotation=rot, dxfattribs={'layer': layer})
    t.set_placement(pos, align=align)
    _tag(t, guid)
    return t


def _bubble(msp, cx, cy, label):
    msp.add_circle((cx, cy), BUBBLE_R * SCALE, dxfattribs={'layer': 'A-GRID', 'linetype': 'Continuous'})
    _text(msp, label, (cx, cy), TXT_BUBBLE, 'A-GRID')


def _dim(msp, p1, p2, base, angle, log, tag, outward=(0, 1)):
    meas = math.hypot(p2[0] - p1[0], p2[1] - p1[1])
    need = (len(f'{meas:.0f}') * 0.9 * TXT_DIM + 1.0) * SCALE   # text width + margin, model mm
    kw = {}
    if meas < need:   # R7 narrow: text moved outward by DIM_NARROW, leader to the dim line
        if angle == 0:
            mid = ((p1[0] + p2[0]) / 2, base[1] + outward[1] * DIM_NARROW * SCALE)
        else:
            mid = (base[0] + outward[0] * DIM_NARROW * SCALE, (p1[1] + p2[1]) / 2)
        kw = dict(location=mid, override={'dimtmove': 1})
    d = msp.add_linear_dim(base=base, p1=p1, p2=p2, angle=angle, dimstyle='STD100',
                           dxfattribs={'layer': 'A-ANNO-DIMS'}, **kw)
    d.render()
    log(f'§DIM {tag} p1=({p1[0]:.2f},{p1[1]:.2f}) p2=({p2[0]:.2f},{p2[1]:.2f}) value={meas:.2f}')
    return meas


def _run_ends(runs, env_ends):
    """R8: ends of the union of the wall runs on a face (runs within 1 mm merge),
    plus the envelope corners."""
    merged = []
    for a, b in sorted(runs):
        if merged and a - merged[-1][1] <= PT_MERGE * 1000:
            merged[-1][1] = max(merged[-1][1], b)
        else:
            merged.append([a, b])
    pts = sorted({round(v, 2) for ab in merged for v in ab} | {round(v, 2) for v in env_ends})
    out = []
    for v in pts:
        if not out or v - out[-1] > PT_MERGE * 1000:
            out.append(v)
    return out


def write_plan(model, grid, storey, view, db_path, out_path, log):
    """G1-G3, G5-G7 for one storey."""
    log(f"§VIEW {view} storey={storey['name']!r} elev={storey['elev']:.4f}")
    doc = new_doc()
    msp = doc.modelspace()
    cut_z = storey['elev'] + CUT_OFFSET
    cut = run_section_cut(db_path, cut_z=cut_z)
    cut = sorted([c for c in cut if c.category == 'CUT' and c.storey == storey['name']
                  and c.ifc_class in ('IfcWall', 'IfcWallStandardCase', 'IfcDoor', 'IfcWindow', 'IfcColumn')],
                 key=lambda c: c.guid)
    sw = [w for w in model['walls'] if w['storey'] == storey['name']]
    env = envelope(sw)
    E = [mm(v) for v in env]   # x0,x1,y0,y1 in mm
    face_runs = {'S': [], 'N': [], 'W': [], 'E': []}
    on_axis = set()
    for w in sw:   # R12: wall on a grid axis -> A-WALL-FULL
        ax, pos, _, _ = wall_axis(w)
        if any(abs(pos - p) <= GRID_MERGE_TOL for _, p, _ in grid[ax]):
            on_axis.add(w['guid'])
    n_w = 0
    for c in cut:
        for ct in c.contours:
            pts = [(mm(p[0]), mm(p[1])) for p in ct.points]
            if len(pts) < 3:
                continue
            if c.ifc_class in ('IfcWall', 'IfcWallStandardCase', 'IfcColumn'):
                layer = 'A-WALL-FULL' if c.guid in on_axis else 'A-WALL-PRTN'
                pl = msp.add_lwpolyline(pts, close=True, dxfattribs={'layer': layer})
                _tag(pl, c.guid)
                h = msp.add_hatch(color=8, dxfattribs={'layer': 'A-WALL-PATT'})
                h.paths.add_polyline_path(pts, is_closed=True)
                n_w += 1
                for side, on, along in (('S', lambda q: abs(q[1] - E[2]) <= FACE_PT_TOL * 1000, 0),
                                        ('N', lambda q: abs(q[1] - E[3]) <= FACE_PT_TOL * 1000, 0),
                                        ('W', lambda q: abs(q[0] - E[0]) <= FACE_PT_TOL * 1000, 1),
                                        ('E', lambda q: abs(q[0] - E[1]) <= FACE_PT_TOL * 1000, 1)):
                    run = [q[along] for q in pts if on(q)]
                    if len(run) >= 2 and max(run) - min(run) > PT_MERGE * 1000:
                        face_runs[side].append((min(run), max(run)))   # R8 run on the face
            else:
                layer = 'A-DOOR' if c.ifc_class == 'IfcDoor' else 'A-GLAZ'
                pl = msp.add_lwpolyline(pts, close=True, dxfattribs={'layer': layer})
                _tag(pl, c.guid)
    log(f'§PLAN wall contours={n_w} cut_z={cut_z:.3f}')
    # ── G6 doors (R9) ──
    doors = [e for e in model['els'] if e['cls'] == 'IfcDoor' and e['storey'] == storey['name']]
    for d in doors:
        sw_ = door_swing(d)
        cx, cy = (d['x0'] + d['x1']) / 2, (d['y0'] + d['y1']) / 2
        if sw_ is None:
            log.gap('GAP:door_swing', d['guid'], 'leaf offset not found (R9)')
            continue
        ta, sgn = sw_
        log(f"§DOOR guid={d['guid']} swing_axis={ta} swing_sign={sgn:+d} (R9 leaf offset)")
        op = model['door_ops'].get(d['guid'])
        code, res = door_hinge(d, op, sw_)
        if code == 'ok':   # §L1.2: leaf line + 90 deg arc, hinge from the IFC operation type and axes
            H, w, Y, C = res['hinge'], res['width'], res['Y'], res['closed']
            hm = (mm(H[0]), mm(H[1]))
            O = H + w * Y
            ln = msp.add_line(hm, (mm(O[0]), mm(O[1])), dxfattribs={'layer': 'A-DOOR'})
            _tag(ln, d['guid'])
            a_c, a_o = math.degrees(math.atan2(C[1], C[0])), math.degrees(math.atan2(Y[1], Y[0]))
            ccw = C[0] * Y[1] - C[1] * Y[0] > 0          # closed -> open is counter-clockwise
            st, en = (a_c, a_o) if ccw else (a_o, a_c)
            arc = msp.add_arc(hm, mm(w), round(st % 360, 6), round(en % 360, 6), dxfattribs={'layer': 'A-DOOR'})
            _tag(arc, d['guid'])
            log(f"§DOOR_ARC guid={d['guid']} op={op['op']} source={op['source']} hinge=({hm[0]:.2f},{hm[1]:.2f}) "
                f"width={w * 1000:.1f} swing=+Y({float(Y[0]):.6f},{float(Y[1]):.6f}) arc={st % 360:.1f}->{en % 360:.1f}")
            continue
        log.gap(code, d['guid'], res)
        half = ((d['x1'] - d['x0']) if ta == 'x' else (d['y1'] - d['y0'])) / 2
        off = half + 0.2
        nx, ny = (cx + sgn * off, cy) if ta == 'x' else (cx, cy + sgn * off)
        _text(msp, 'HINGE ?', (mm(nx), mm(ny)), TXT_NOTE, 'A-ANNO-NOTE',
              rot=90 if ta == 'x' else 0, guid=d['guid'])
    # ── G7 windows (R10) ──
    wins = [e for e in model['els'] if e['cls'] == 'IfcWindow' and e['storey'] == storey['name']]
    seen = set()
    for wdw in wins:
        host = model['by_guid'].get(model['hosts'].get(wdw['guid']))
        if not host:
            log.gap('GAP:window_no_host', wdw['guid'], 'no rel_fills_host')
            continue
        ax, _, _, _ = wall_axis(host)
        if ax == 'y':   # wall along X: lines at host y faces across window x-range
            segs = [((mm(wdw['x0']), mm(f)), (mm(wdw['x1']), mm(f))) for f in (host['y0'], host['y1'])]
        else:
            segs = [((mm(f), mm(wdw['y0'])), (mm(f), mm(wdw['y1']))) for f in (host['x0'], host['x1'])]
        for s in segs:
            if s in seen:
                continue
            seen.add(s)
            ln = msp.add_line(s[0], s[1], dxfattribs={'layer': 'A-GLAZ-SILL'})
            _tag(ln, wdw['guid'])
    # ── G1/G2 grid ──
    ge, bc = GRID_END * SCALE, BUBBLE_C * SCALE
    for lab, p, _ in grid['x']:
        x = mm(p)
        msp.add_line((x, E[2] - ge), (x, E[3] + ge), dxfattribs={'layer': 'A-GRID'})
        _bubble(msp, x, E[2] - bc, lab)
        _bubble(msp, x, E[3] + bc, lab)
    for lab, p, _ in grid['y']:
        y = mm(p)
        msp.add_line((E[0] - ge, y), (E[1] + ge, y), dxfattribs={'layer': 'A-GRID'})
        _bubble(msp, E[0] - bc, y, lab)
        _bubble(msp, E[1] + bc, y, lab)
    # ── G3 dimension strings per side ──
    gx = [mm(p) for _, p, _ in grid['x']]
    gy = [mm(p) for _, p, _ in grid['y']]
    sides = {   # side: (face coord, outward sign, horizontal?)
        'S': (E[2], -1, True), 'N': (E[3], +1, True), 'W': (E[0], -1, False), 'E': (E[1], +1, False)}
    for side, (fc, sg, horiz) in sides.items():
        strings = [('T3', DIM_T3, _run_ends(face_runs[side], (E[0], E[1]) if horiz else (E[2], E[3]))),
                   ('T2', DIM_T2, gx if horiz else gy),
                   ('T1', DIM_T1, [E[0], E[1]] if horiz else [E[2], E[3]])]
        for tier, off, pts in strings:
            base_c = fc + sg * off * SCALE
            for a, b in zip(pts, pts[1:]):
                if horiz:
                    _dim(msp, (a, fc), (b, fc), (a, base_c), 0, log, f'{view}/{side}/{tier}', (0, sg))
                else:
                    _dim(msp, (fc, a), (fc, b), (base_c, a), 90, log, f'{view}/{side}/{tier}', (sg, 0))
    # title
    _text(msp, f"{view.replace('_', ' ')} PLAN - {storey['name'].upper()} (FFL {storey['elev']:+.3f})  1:{SCALE}",
          ((E[0] + E[1]) / 2, E[2] - (BUBBLE_C + 14) * SCALE), TXT_TITLE, 'A-ANNO-TTLB')
    _save(doc, out_path)
    log(f'§WRITE {os.path.basename(out_path)}')


ELEV_FACES = {   # R11: name -> (envelope side, h(x,y) projection)
    'FRONT': ('y0', lambda x, y: x), 'REAR': ('y1', lambda x, y: -x),
    'LEFT': ('x0', lambda x, y: -y), 'RIGHT': ('x1', lambda x, y: y)}


def write_elevation(model, grid, face, out_path, log):
    side, hp = ELEV_FACES[face]
    log(f'§VIEW {face} face={side}')
    doc = new_doc()
    msp = doc.modelspace()
    gs = model['grid_storey']
    g_el = next(s['elev'] for s in model['storeys'] if s['name'] == gs)
    vis = {s['name'] for s in model['storeys'] if s['elev'] >= g_el}
    for s in model['storeys']:
        if s['name'] not in vis:
            log(f"§ELEV_SKIP storey={s['name']!r} elev={s['elev']:.4f} below grid storey (R11)")
    env = envelope([w for w in model['walls'] if w['storey'] == gs])
    fv = {'x0': env[0], 'x1': env[1], 'y0': env[2], 'y1': env[3]}[side]

    def hr(e):
        a, b = hp(e['x0'], e['y0']), hp(e['x1'], e['y1'])
        return (mm(min(a, b)), mm(max(a, b)))

    fw = [w for w in model['walls'] if w['storey'] in vis and abs(w[side] - fv) <= EXT_FACE_TOL]
    for w in fw:
        h0, h1 = hr(w)
        pl = msp.add_lwpolyline([(h0, mm(w['z0'])), (h1, mm(w['z0'])), (h1, mm(w['z1'])), (h0, mm(w['z1']))],
                                close=True, dxfattribs={'layer': 'A-WALL'})
        _tag(pl, w['guid'])
    fwg = {w['guid'] for w in fw}
    n_op = 0
    for e in model['els']:
        if e['cls'] not in ('IfcDoor', 'IfcWindow') or model['hosts'].get(e['guid']) not in fwg:
            continue
        along_x = (e['x1'] - e['x0']) >= (e['y1'] - e['y0'])
        if along_x != (side in ('y0', 'y1')):   # R11: opening must run along this face
            continue
        h0, h1 = hr(e)
        lay = 'A-DOOR' if e['cls'] == 'IfcDoor' else 'A-GLAZ'
        pl = msp.add_lwpolyline([(h0, mm(e['z0'])), (h1, mm(e['z0'])), (h1, mm(e['z1'])), (h0, mm(e['z1']))],
                                close=True, dxfattribs={'layer': lay})
        _tag(pl, e['guid'])
        if e['cls'] == 'IfcWindow':
            ln = msp.add_line((h0, mm(e['z0'])), (h1, mm(e['z0'])), dxfattribs={'layer': 'A-GLAZ-SILL'})
            _tag(ln, e['guid'])
        n_op += 1
    for r in model['roofs']:
        h0, h1 = hr(r)
        pl = msp.add_lwpolyline([(h0, mm(r['z0'])), (h1, mm(r['z0'])), (h1, mm(r['z1'])), (h0, mm(r['z1']))],
                                close=True, dxfattribs={'layer': 'A-ROOF'})
        _tag(pl, r['guid'])
    log(f'§ELEV {face} walls={len(fw)} openings={n_op} roofs={len(model["roofs"])}')
    xs = [hp(env[0], env[2]), hp(env[1], env[3])]
    H0, H1 = mm(min(xs)), mm(max(xs))
    # levels (G4)
    levels = [(s['name'].upper(), s['elev']) for s in model['storeys'] if s['name'] in vis]
    if model['roof_top'] is not None:
        levels.append(('T/ROOF', model['roof_top']))
    levels.sort(key=lambda l: l[1])
    lx0, lx1 = H0 - LEVEL_EXT * SCALE, H1 + LEVEL_EXT * SCALE
    for name, z in levels:
        Z = mm(z)
        msp.add_line((lx0, Z), (lx1, Z), dxfattribs={'layer': 'A-ANNO-LEVL', 'linetype': 'DASHED'})
        t = 1.5 * SCALE
        msp.add_lwpolyline([(lx1, Z), (lx1 - t, Z + t), (lx1 + t, Z + t)], close=True,
                           dxfattribs={'layer': 'A-ANNO-LEVL'})
        _text(msp, f'{name} {z:+.3f}', (lx1 + 2.5 * SCALE, Z + 0.4 * SCALE), TXT_LEVEL, 'A-ANNO-LEVL',
              align=TextEntityAlignment.BOTTOM_LEFT)
        log(f'§LEVEL_DRAWN {face} {name} z={z:.4f}')
    zs = [mm(z) for _, z in levels]
    for a, b in zip(zs, zs[1:]):
        _dim(msp, (H0, a), (H0, b), (H0 - ELEV_DIM_CHAIN * SCALE, a), 90, log, f'{face}/H/chain', (-1, 0))
    if len(zs) > 1:
        _dim(msp, (H0, zs[0]), (H0, zs[-1]), (H0 - ELEV_DIM_OVERALL * SCALE, zs[0]), 90, log, f'{face}/H/overall', (-1, 0))
    # grid bubbles projected on the face (perpendicular grid lines)
    ax = 'x' if face in ('FRONT', 'REAR') else 'y'
    zb, zt = zs[0], zs[-1] + LEVEL_EXT * SCALE
    for lab, p, _ in grid[ax]:
        h = mm(hp(p, 0) if ax == 'x' else hp(0, p))
        msp.add_line((h, zb - ELEV_GRID_END * SCALE), (h, zt), dxfattribs={'layer': 'A-GRID'})
        _bubble(msp, h, zb - ELEV_BUBBLE_C * SCALE, lab)
    _text(msp, f'{face} ELEVATION  1:{SCALE}', ((H0 + H1) / 2, zb - (ELEV_BUBBLE_C + 12) * SCALE),
          TXT_TITLE, 'A-ANNO-TTLB')
    _save(doc, out_path)
    log(f'§WRITE {os.path.basename(out_path)}')


def plan_storeys(model):
    """Storeys from the grid storey up whose walls reach their own cut plane."""
    gs = model['grid_storey']
    g_el = next(s['elev'] for s in model['storeys'] if s['name'] == gs)
    out = []
    for s in model['storeys']:
        if s['elev'] < g_el:
            continue
        cz = s['elev'] + CUT_OFFSET
        if any(w['storey'] == s['name'] and w['z0'] <= cz < w['z1'] for w in model['walls']):
            out.append(s)
    return out


def roof_storey(model):
    """§L1.4 F4: the highest storey above the grid storey that gets no floor plan (its walls do not reach a cut plane)."""
    gs = model['grid_storey']
    g_el = next(s['elev'] for s in model['storeys'] if s['name'] == gs)
    planned = {s['name'] for s in plan_storeys(model)}
    cand = [s for s in model['storeys'] if s['elev'] > g_el and s['name'] not in planned]
    return cand[-1] if cand else None


def _plan_dims(msp, E, grid, log, view):
    """T2 grid-to-grid + T1 overall on 4 sides (no T3: nothing is cut). E = envelope in mm."""
    gx = [mm(p) for _, p, _ in grid['x']]
    gy = [mm(p) for _, p, _ in grid['y']]
    sides = {'S': (E[2], -1, True), 'N': (E[3], +1, True), 'W': (E[0], -1, False), 'E': (E[1], +1, False)}
    for side, (fc, sg, horiz) in sides.items():
        for tier, off, pts in (('T2', DIM_T2, gx if horiz else gy), ('T1', DIM_T1, [E[0], E[1]] if horiz else [E[2], E[3]])):
            base_c = fc + sg * off * SCALE
            for a, b in zip(pts, pts[1:]):
                if horiz:
                    _dim(msp, (a, fc), (b, fc), (a, base_c), 0, log, f'{view}/{side}/{tier}', (0, sg))
                else:
                    _dim(msp, (fc, a), (fc, b), (base_c, a), 90, log, f'{view}/{side}/{tier}', (sg, 0))


def _grid_plan(msp, E, grid):
    ge, bc = GRID_END * SCALE, BUBBLE_C * SCALE
    for lab, p, _ in grid['x']:
        x = mm(p)
        msp.add_line((x, E[2] - ge), (x, E[3] + ge), dxfattribs={'layer': 'A-GRID'})
        _bubble(msp, x, E[2] - bc, lab)
        _bubble(msp, x, E[3] + bc, lab)
    for lab, p, _ in grid['y']:
        y = mm(p)
        msp.add_line((E[0] - ge, y), (E[1] + ge, y), dxfattribs={'layer': 'A-GRID'})
        _bubble(msp, E[0] - bc, y, lab)
        _bubble(msp, E[1] + bc, y, lab)


def write_roof_plan(model, grid, storey, out_path, log):
    """§L1.4 F4: roof outline (A-ROOF) = the roof storey's wall envelope, skylights (A-GLAZ) = its IfcWindow bboxes,
    grid, T2/T1 dims, level texts (storey + T/ROOF). No markings (std2d writes none)."""
    log(f"§VIEW ROOF storey={storey['name']!r} elev={storey['elev']:.4f}")
    doc = new_doc()
    msp = doc.modelspace()
    rw = sorted((w for w in model['walls'] if w['storey'] == storey['name']), key=lambda w: w['guid'])
    env = envelope(rw)
    E = [mm(v) for v in env]
    pl = msp.add_lwpolyline([(E[0], E[2]), (E[1], E[2]), (E[1], E[3]), (E[0], E[3])], close=True, dxfattribs={'layer': 'A-ROOF'})
    _tag(pl, ','.join(w['guid'] for w in rw)[:255])
    log(f'§ROOF_OUTLINE env=({E[0]:.2f},{E[2]:.2f})-({E[1]:.2f},{E[3]:.2f}) walls={len(rw)} (envelope of the roof storey walls)')
    sky = sorted((e for e in model['els'] if e['cls'] == 'IfcWindow' and e['storey'] == storey['name']), key=lambda e: e['guid'])
    for k in sky:
        x0, x1, y0, y1 = mm(k['x0']), mm(k['x1']), mm(k['y0']), mm(k['y1'])
        p2 = msp.add_lwpolyline([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], close=True, dxfattribs={'layer': 'A-GLAZ'})
        _tag(p2, k['guid'])
        log(f"§SKYLIGHT guid={k['guid']} box=({x0:.2f},{y0:.2f})-({x1:.2f},{y1:.2f})")
    _grid_plan(msp, E, grid)
    _plan_dims(msp, E, grid, log, 'ROOF')
    tx = E[0] + 1.0 * SCALE
    ty = E[3] - 4.0 * SCALE
    _text(msp, f"{storey['name'].upper()} {storey['elev']:+.3f}", (tx, ty), TXT_LEVEL, 'A-ANNO-LEVL', align=TextEntityAlignment.BOTTOM_LEFT)
    if model['roof_top'] is not None:
        _text(msp, f"T/ROOF {model['roof_top']:+.3f}", (tx, ty - 4.0 * SCALE), TXT_LEVEL, 'A-ANNO-LEVL', align=TextEntityAlignment.BOTTOM_LEFT)
    _text(msp, f"ROOF PLAN - {storey['name'].upper()} ({storey['elev']:+.3f})  1:{SCALE}",
          ((E[0] + E[1]) / 2, E[2] - (BUBBLE_C + 14) * SCALE), TXT_TITLE, 'A-ANNO-TTLB')
    _save(doc, out_path)
    log(f'§WRITE {os.path.basename(out_path)}')


def section_x(grid):
    """§L1.4 F5 convention: constant-X plane midway between grid lines 1 and 2 (first bay)."""
    xs = [p for _, p, _ in grid['x']]
    return round((xs[0] + xs[1]) / 2, 6) if len(xs) >= 2 else None


def cut_x(e, x):
    """Slice an element mesh by the plane X = x; contours in (y, z) metres (section_cut engine, axes permuted)."""
    if len(e['v']) == 0 or len(e['f']) == 0:
        return []
    w = e['v'] + np.array(e['c'])
    if not (w[:, 0].min() < x < w[:, 0].max()):
        return []
    seg = slice_mesh(np.column_stack([w[:, 1], w[:, 2], w[:, 0]]), e['f'], x)
    return [c for c in chain_segments(seg) if len(c) >= 3]


def write_section(model, grid, out_path, log):
    """§L1.4 F5: building section at X = section_x, viewed toward -X (h = plan y). S-SLAB cut slabs (not the R11 roof
    element), A-ROOF cut roof element, A-SECT cut walls (+ poché), levels, height dims, Y grid bubbles."""
    X = section_x(grid)
    if X is None:
        log.gap('GAP:section_no_bay', '-', 'fewer than 2 X grid lines; no section')
        return False
    log(f'§VIEW SECTION cut X={X * 1000:.2f} mm viewed toward -X (h = +y)')
    doc = new_doc()
    msp = doc.modelspace()
    roof_g = {r['guid'] for r in model['roofs']}
    n = {'S-SLAB': 0, 'A-ROOF': 0, 'A-SECT': 0}
    zlo, zhi = [], []
    for e in sorted(model['els'], key=lambda e: e['guid']):
        if e['guid'] in roof_g:
            layer = 'A-ROOF'
        elif e['cls'] in ('IfcSlab', 'IfcRoof'):
            layer = 'S-SLAB'
        elif e['cls'] in ('IfcWall', 'IfcWallStandardCase'):
            layer = 'A-SECT'
        else:
            continue
        for ct in cut_x(e, X):
            pts = [(mm(p[0]), mm(p[1])) for p in ct]
            pl = msp.add_lwpolyline(pts, close=True, dxfattribs={'layer': layer})
            _tag(pl, e['guid'])
            if layer == 'A-SECT':
                h = msp.add_hatch(color=8, dxfattribs={'layer': 'A-WALL-PATT'})
                h.paths.add_polyline_path(pts, is_closed=True)
            n[layer] += 1
            zs = [p[1] for p in pts]
            zlo.append(min(zs))
            zhi.append(max(zs))
            log(f"§SECT_CUT guid={e['guid']} class={e['cls']} layer={layer} z=({min(zs):.2f},{max(zs):.2f}) "
                f"h=({min(p[0] for p in pts):.2f},{max(p[0] for p in pts):.2f})")
    log(f'§SECTION contours={n}')
    gs = model['grid_storey']
    g_el = next(s['elev'] for s in model['storeys'] if s['name'] == gs)
    levels = [(s['name'].upper(), s['elev']) for s in model['storeys'] if s['elev'] >= g_el]
    if model['roof_top'] is not None:
        levels.append(('T/ROOF', model['roof_top']))
    levels.sort(key=lambda l: l[1])
    env = envelope([w for w in model['walls'] if w['storey'] == gs])
    H0, H1 = mm(env[2]), mm(env[3])
    lx0, lx1 = H0 - LEVEL_EXT * SCALE, H1 + LEVEL_EXT * SCALE
    for name, z in levels:
        Z = mm(z)
        msp.add_line((lx0, Z), (lx1, Z), dxfattribs={'layer': 'A-ANNO-LEVL', 'linetype': 'DASHED'})
        t = 1.5 * SCALE
        msp.add_lwpolyline([(lx1, Z), (lx1 - t, Z + t), (lx1 + t, Z + t)], close=True, dxfattribs={'layer': 'A-ANNO-LEVL'})
        _text(msp, f'{name} {z:+.3f}', (lx1 + 2.5 * SCALE, Z + 0.4 * SCALE), TXT_LEVEL, 'A-ANNO-LEVL',
              align=TextEntityAlignment.BOTTOM_LEFT)
        log(f'§LEVEL_DRAWN SECTION {name} z={z:.4f}')
    zs = [mm(z) for _, z in levels]
    for a, b in zip(zs, zs[1:]):
        _dim(msp, (H0, a), (H0, b), (H0 - ELEV_DIM_CHAIN * SCALE, a), 90, log, 'SECTION/H/chain', (-1, 0))
    if len(zs) > 1:
        _dim(msp, (H0, zs[0]), (H0, zs[-1]), (H0 - ELEV_DIM_OVERALL * SCALE, zs[0]), 90, log, 'SECTION/H/overall', (-1, 0))
    zb, zt = min(zs + zlo), max(zs + zhi) + LEVEL_EXT * SCALE
    for lab, p, _ in grid['y']:
        h = mm(p)
        msp.add_line((h, zb - ELEV_GRID_END * SCALE), (h, zt), dxfattribs={'layer': 'A-GRID'})
        _bubble(msp, h, zb - ELEV_BUBBLE_C * SCALE, lab)
    _text(msp, f'SECTION A-A AT X={X * 1000:.2f}  1:{SCALE}', ((H0 + H1) / 2, zb - (ELEV_BUBBLE_C + 12) * SCALE),
          TXT_TITLE, 'A-ANNO-TTLB')
    _save(doc, out_path)
    log(f'§WRITE {os.path.basename(out_path)}')
    return True


def write_std_set(db_path, out_dir, prefix=None, png=False, door_ops=None):
    os.makedirs(out_dir, exist_ok=True)
    prefix = prefix or os.path.basename(db_path).split('_')[0].upper()
    log = Log()
    log(f'§ENTRY std2d db={os.path.basename(db_path)} prefix={prefix}')
    model = load_model(db_path, log, door_ops)
    grid = derive_grid(model, log)
    paths = {}
    for i, s in enumerate(plan_storeys(model)):
        view = f'FLOOR_{PLAN_NAMES[i] if i < len(PLAN_NAMES) else "L" + str(i)}'
        p = os.path.join(out_dir, f'{prefix}_{view}_std.dxf')
        write_plan(model, grid, s, view, db_path, p, log)
        paths[view] = p
    for face in ELEV_FACES:
        p = os.path.join(out_dir, f'{prefix}_{face}_std.dxf')
        write_elevation(model, grid, face, p, log)
        paths[face] = p
    rs = roof_storey(model)   # §L1.4 F4
    if rs is None:
        log.gap('GAP:no_roof_storey', '-', 'no storey above the grid storey without a floor plan; no roof plan')
    else:
        p = os.path.join(out_dir, f'{prefix}_ROOF_std.dxf')
        write_roof_plan(model, grid, rs, p, log)
        paths['ROOF'] = p
    p = os.path.join(out_dir, f'{prefix}_SECTION_std.dxf')   # §L1.4 F5
    if write_section(model, grid, p, log):
        paths['SECTION'] = p
    log(f'§SUMMARY views={len(paths)} grid_x={[g[0] for g in grid["x"]]} grid_y={[g[0] for g in grid["y"]]} '
        f'gaps={len(log.gaps)}')
    codes = {}
    for c, _, _ in log.gaps:
        codes[c] = codes.get(c, 0) + 1
    log(f'§GAP_SUMMARY {codes}')
    with open(os.path.join(out_dir, f'log_{prefix}_std.txt'), 'w') as fh:
        fh.write('\n'.join(log.lines) + '\n')
    if png:
        for v in ('FLOOR_GF', 'FRONT', 'ROOF', 'SECTION'):
            if v in paths:
                render_png(paths[v], paths[v][:-4] + '.png')
    return dict(paths=paths, grid=grid, model=model, gaps=log.gaps, log=log.lines)


def render_png(dxf_path, png_path, dpi=200):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from ezdxf.addons.drawing import RenderContext, Frontend
    from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
    from ezdxf.addons.drawing.config import Configuration, BackgroundPolicy
    doc = ezdxf.readfile(dxf_path)
    fig = plt.figure(figsize=(16, 20))
    ax = fig.add_axes([0, 0, 1, 1])
    cfg = Configuration(background_policy=BackgroundPolicy.WHITE, min_lineweight=0.15)
    Frontend(RenderContext(doc), MatplotlibBackend(ax), config=cfg).draw_layout(doc.modelspace(), finalize=True)
    fig.savefig(png_path, dpi=dpi, facecolor='white')
    plt.close(fig)


def main():
    ap = argparse.ArgumentParser(description='Standard 2D set from the model DB (§L1).')
    ap.add_argument('db_path')
    ap.add_argument('--out', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'output', 'STD'))
    ap.add_argument('--png', action='store_true', help='also render FLOOR_GF and FRONT PNGs')
    ap.add_argument('--door-ops', default=None, help='DB holding door_operation (§L1.2), joined on GUID')
    a = ap.parse_args()
    r = write_std_set(a.db_path, os.path.normpath(a.out), png=a.png, door_ops=a.door_ops)
    for v, p in r['paths'].items():
        print(f'{v}: {p}')
    print(f'gaps={len(r["gaps"])} log={os.path.normpath(a.out)}/log_*_std.txt')


if __name__ == '__main__':
    main()
