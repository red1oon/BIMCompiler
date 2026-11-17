#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — scope: prompts/LOD400_DEFAULT_RULES_SCOPE.md section 6 (BUILD 1 SPEC). Read the log after every run; the exit code is not evidence.
# Implementing LOD400_DEFAULT_RULES_SCOPE.md §6 — Witness: §SHEDRB_*
# Issue proved/disproved: can the stated schedules already attached to each element by the Modeller's table reader become real
#   bar geometry, with every value traced to the drawing and only cover/hook (and a few named layout choices) as defaults, on a COPY
#   of the model DB, identically on every run? Plus build 3: truss fillet welds at every member / gusset-plate contact (end and through).
# Usage: rebar_from_schedule.py <source.db> <out.db> <out.txt> [--defaults rebar_defaults.json] [--callouts <details.dxf>]
#        second source (section 7): --schedule-json <marks.json> --mark-regex <regex on element_name, group 1 = mark> [--host-class IfcBeam] [--beam-defaults rebar_beam_defaults.json]  (rebar_beams.py; prefix §PJRB_, break switch PJRB_BREAK=1)
#                               [--expect-db-sha <hex> --expect-txt-sha <hex>]
#   SHEDRB_BREAK=1 in the environment drops the cover offset when placing bars (the INSIDE witness must then FAIL).
# Reads the source DB read-only. Deterministic: no random, no clock; every loop is over sorted keys. Prints §SHEDRB_* lines;
# a witness prints INCONCLUSIVE when it judged nothing.
import sqlite3, shutil, os, sys, json, math, hashlib, re, collections, argparse
import numpy as np

IN = 0.0254                                   # inches -> metres, exact by definition
ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out'); ap.add_argument('txt')
ap.add_argument('--defaults', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rebar_defaults.json'))
ap.add_argument('--callouts', default=None); ap.add_argument('--expect-db-sha', default=None); ap.add_argument('--expect-txt-sha', default=None)
# second schedule source (section 7, build 2): a marks JSON joined to host elements by a regex on element_name; handled by rebar_beams.py
ap.add_argument('--schedule-json', default=None); ap.add_argument('--mark-regex', default=None); ap.add_argument('--host-class', default='IfcBeam')
ap.add_argument('--beam-defaults', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rebar_beam_defaults.json'))
A = ap.parse_args()
SRC, OUT, TXT, DEF = A.src, A.out, A.txt, A.defaults
BREAK = os.environ.get('PJRB_BREAK' if A.schedule_json else 'SHEDRB_BREAK') == '1'
if A.schedule_json and not A.mark_regex: ap.error('--schedule-json needs --mark-regex')
assert os.path.realpath(OUT) != os.path.realpath(SRC), 'refuse: never write the source DB'
assert os.path.realpath(TXT) != os.path.realpath(SRC)
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()
RULES = json.load(open(DEF)); rv = lambda k: RULES[k]['value']
SIDES = int(rv('bar_sides')); INSIDE_TOL = rv('inside_tol_mm') / 1000.0
COVER_F = rv('footing_cover_mm') / 1000.0; COVER_C = rv('column_cover_mm') / 1000.0
STOCK = rv('stock_length_mm') / 1000.0; END_TOL = rv('weld_contact_end_tol_mm') / 1000.0
ZONE_STATED = rv('column_zone_A_stated_in') * IN
PLACE_F = 0.0 if BREAK else COVER_F; PLACE_C = 0.0 if BREAK else COVER_C   # the break switch changes PLACEMENT only; the witnesses judge against the rule rows
if not A.schedule_json: print(f'§SHEDRB_MODE break={int(BREAK)} cover_footing_rule_mm={COVER_F * 1000:g} cover_column_rule_mm={COVER_C * 1000:g} placement_cover_footing_mm={PLACE_F * 1000:g} placement_cover_column_mm={PLACE_C * 1000:g}')

# ---------------------------------------------------------------- copy + load
if os.path.exists(OUT): os.remove(OUT)
shutil.copyfile(SRC, OUT)
db = sqlite3.connect(OUT); cur = db.cursor()
srcdb = sqlite3.connect('file:' + SRC + '?mode=ro', uri=True)

def table_digest(c, t, key, where=''):
    h = hashlib.sha256()
    for r in c.execute(f"select * from {t} {where} order by {key}"): h.update(repr(r).encode())
    return h.hexdigest()
SRC_TABLES = sorted(r[0] for r in srcdb.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%'"))
SRC_KEY = {}
for t in SRC_TABLES:
    pk = [r[1] for r in srcdb.execute(f"pragma table_info({t})") if r[5]]
    SRC_KEY[t] = ','.join(pk) if pk else 'rowid'
D_SRC = {t: table_digest(srcdb, t, SRC_KEY[t]) for t in SRC_TABLES}
N_SRC_META = srcdb.execute("select count(*) from elements_meta").fetchone()[0]

def world(c, guid):
    r = c.execute("select c.vertices, t.center_x, t.center_y, t.center_z from element_instances i join component_geometries c using(geometry_hash) join element_transforms t using(guid) where i.guid=?", (guid,)).fetchone()
    if r is None: return None
    return np.frombuffer(r[0], np.float32).reshape(-1, 3).astype(float) + np.array(r[1:4])
META = {g: (c, n or '', s, d, b, m) for g, c, n, s, d, b, m in cur.execute("select guid,ifc_class,element_name,storey,discipline,building,material_rgba from elements_meta order by guid")}
ST = collections.defaultdict(dict)
if cur.execute("select count(*) from sqlite_master where name='element_dxf2bim'").fetchone()[0]:     # the DXF-attached schedule rows (Shed); a drawing-table source has none
    for g, n, v in cur.execute("select guid,name,value from element_dxf2bim order by guid,name"): ST[g][n] = v
def by_class(*cl): return sorted(g for g, m in META.items() if m[0] in cl)
def aabb(V): return V.min(0), V.max(0)
def mesh_volume(V):
    T = V.reshape(-1, 3, 3); return abs(np.einsum('ij,ij->i', T[:, 0], np.cross(T[:, 1], T[:, 2])).sum() / 6.0)
def is_box(V): lo, hi = aabb(V); return abs(mesh_volume(V) - np.prod(hi - lo)) <= 1e-4 * np.prod(hi - lo)

# ---------------------------------------------------------------- parse the stated strings
def parse_dia_spacing(s):               # '10dia @ 5" C/C (A)'  /  '12 mm dia @ 6" C/C'
    m = re.match(r'^\s*(\d+(?:\.\d+)?)\s*(?:mm)?\s*dia\s*@\s*(\d+(?:\.\d+)?)\s*"\s*C/C(?:\s*\((\w)\))?\s*$', s or '')
    return None if not m else (float(m.group(1)), float(m.group(2)) * IN, m.group(3), float(m.group(2)))
def parse_main(s):                      # '6-16dia'
    m = re.match(r'^\s*(\d+)\s*-\s*(\d+(?:\.\d+)?)\s*dia\s*$', s or ''); return None if not m else (int(m.group(1)), float(m.group(2)))
def parse_ft_in(s):                     # '4\'-0"'
    m = re.match(r'^\s*(\d+)\'\s*-\s*(\d+(?:\.\d+)?)"\s*$', s or ''); return None if not m else (int(m.group(1)) * 12 + float(m.group(2))) * IN
def parse_size_in(s):                   # '12" x 12"'
    m = re.match(r'^\s*(\d+(?:\.\d+)?)"\s*x\s*(\d+(?:\.\d+)?)"\s*$', s or ''); return None if not m else (float(m.group(1)) * IN, float(m.group(2)) * IN)
def parse_frac_in(s):                   # '1/4' or '12'
    m = re.match(r'^(\d+)(?:/(\d+))?$', s); return None if not m else (int(m.group(1)) / int(m.group(2)) if m.group(2) else float(m.group(1))) * IN

# ---------------------------------------------------------------- geometry builders (triangle soup, outward-wound)
def ring_dirs(): return [2 * math.pi * k / SIDES for k in range(SIDES)]
def tri_out(p0, p1, p2, ref):           # winding so that the normal points away from ref
    n = np.cross(p1 - p0, p2 - p0)
    return (p0, p1, p2) if n @ (((p0 + p1 + p2) / 3) - ref) >= 0 else (p0, p2, p1)
def prism(P0, P1, r):
    """straight bar: SIDES-gon prism from P0 to P1, radius r (vertices on the circle), capped. returns list of triangles."""
    ax = P1 - P0; L = np.linalg.norm(ax); ax = ax / L
    e1 = np.cross(ax, [1.0, 0, 0] if abs(ax[0]) < 0.9 else [0, 1.0, 0]); e1 /= np.linalg.norm(e1); e2 = np.cross(ax, e1)
    ring = lambda C: [C + r * (math.cos(t) * e1 + math.sin(t) * e2) for t in ring_dirs()]
    a, b = ring(P0), ring(P1); tris = []
    for k in range(SIDES):
        k2 = (k + 1) % SIDES; ref = (P0 + P1) / 2
        tris.append(tri_out(a[k], a[k2], b[k2], ref)); tris.append(tri_out(a[k], b[k2], b[k], ref))
        tris.append(tri_out(P1, b[k], b[k2], P1 - ax)); tris.append(tri_out(P0, a[k], a[k2], P0 + ax))
    return tris
def tie_loop(cx, cy, z, hx, hy, r):
    """closed rectangular tie, centreline half-sizes hx,hy at height z, mitred 8-gon sweep radius r. returns triangles."""
    P = [np.array([cx + sx * hx, cy + sy * hy, z]) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]   # counter-clockwise from above
    T = [(P[(i + 1) % 4] - P[i]) / np.linalg.norm(P[(i + 1) % 4] - P[i]) for i in range(4)]
    N = [np.cross([0, 0, 1.0], t) for t in T]                                                          # in-plane, inward (left of travel)
    zhat = np.array([0, 0, 1.0]); rings = []
    for i in range(4):
        n0, n1 = N[(i - 1) % 4], N[i]; qd = (n0 + n1) / (1 + n0 @ n1)
        rings.append([P[i] + r * math.cos(t) * zhat + r * math.sin(t) * qd for t in ring_dirs()])
    tris = []
    for i in range(4):
        a, b = rings[i], rings[(i + 1) % 4]; ref0 = P[i]; ref1 = P[(i + 1) % 4]
        for k in range(SIDES):
            k2 = (k + 1) % SIDES; ref = (ref0 + ref1) / 2
            tris.append(tri_out(a[k], a[k2], b[k2], ref)); tris.append(tri_out(a[k], b[k2], b[k], ref))
    return tris
BREAK_WINDING = os.environ.get('SHEDRB_BREAK_WINDING') == '1'          # reproduces the pre-correction cap winding; §SHEDRB_WELD_WINDING must then FAIL
def bead(c0, c1, s_leg, n_hat, t_out):
    """triangular fillet bead from corner line c0..c1; legs s_leg along n_hat and t_out. 8 triangles."""
    a = [c0, c0 + s_leg * n_hat, c0 + s_leg * t_out]; b = [c1, c1 + s_leg * n_hat, c1 + s_leg * t_out]; ref = (sum(a) + sum(b)) / 6
    # end caps wound outward from the bead's own centroid (corrected 2026-11-18: the first version measured the caps against a point displaced the wrong way, so both caps faced inward)
    tris = [tri_out(*a, ref + ((c0 - c1) if BREAK_WINDING else 0)), tri_out(*b, ref + ((c1 - c0) if BREAK_WINDING else 0))]
    for k in range(3):
        k2 = (k + 1) % 3; tris.append(tri_out(a[k], a[k2], b[k2], ref)); tris.append(tri_out(a[k], b[k2], b[k], ref))
    return tris

# ---------------------------------------------------------------- output rows
cur.execute("CREATE TABLE IF NOT EXISTS element_parts (parent_guid TEXT, child_guid TEXT, parent_class TEXT, child_class TEXT, PRIMARY KEY (parent_guid, child_guid))")
if not cur.execute("select count(*) from sqlite_master where name='upgrade_changes'").fetchone()[0]:     # a source that already has an upgrade_changes keeps its rows; new rows are appended
    cur.execute("CREATE TABLE upgrade_changes (seq INTEGER PRIMARY KEY, change TEXT, guid TEXT, ifc_class TEXT, host_guid TEXT, rule TEXT, detail TEXT)")
HAS_RTREE = cur.execute("select count(*) from sqlite_master where name='elements_rtree'").fetchone()[0] > 0
HAS_WBBOX = cur.execute("select count(*) from sqlite_master where name='element_world_bbox'").fetchone()[0] > 0
N_TCOL = len(cur.execute("pragma table_info(element_transforms)").fetchall()); N_GCOL = len(cur.execute("pragma table_info(component_geometries)").fetchall())
CH = []; ADDED_GUIDS = []; ADDED_HASHES = set(); ADDED_VERTS = 0
RB_RGBA, WD_RGBA = '0.45,0.20,0.12,1.000', '0.40,0.34,0.30,1.000'
def write_part(guid, cls, name, storey, disc, building, tris, rgba, parents=()):
    global ADDED_VERTS
    W = np.asarray(tris, float).reshape(-1, 3); lo, hi = W.min(0), W.max(0); c = (lo + hi) / 2
    vv = (W - c).astype(np.float32).tobytes(); gh = ('rb' if cls == 'IfcReinforcingBar' else 'wd') + hashlib.sha1(vv).hexdigest()[:14]
    assert cur.execute("select count(*) from component_geometries where geometry_hash=?", (gh,)).fetchone()[0] == 0 or gh in ADDED_HASHES, 'hash collision with a source row'
    gfaces = np.arange(len(W), dtype=np.uint32).tobytes()
    if N_GCOL == 5:                                      # source with a normals column: flat per-triangle normals of the stored (centred) soup
        Wc = (W - c).astype(np.float32).reshape(-1, 3, 3); nn = np.cross(Wc[:, 1] - Wc[:, 0], Wc[:, 2] - Wc[:, 0]); nn = nn / np.where(np.linalg.norm(nn, axis=1) == 0, 1, np.linalg.norm(nn, axis=1))[:, None]
        cur.execute("insert or replace into component_geometries values(?,?,?,?,?)", (gh, vv, gfaces, np.repeat(nn, 3, 0).astype(np.float32).tobytes(), building))
    else: cur.execute("insert or replace into component_geometries values(?,?,?,?)", (gh, vv, gfaces, building))
    ADDED_HASHES.add(gh)
    cur.execute("insert into elements_meta values(?,?,?,?,?,?,?,?)", (guid, cls, name, storey, disc, 'Steel (generated)', rgba, building))
    cur.execute("insert into element_transforms values(" + ",".join("?" * N_TCOL) + ")", (guid, *c.tolist(), 0.0, 0.0, 0.0, *(hi - lo).tolist()) + (('lod400:rebar',) if N_TCOL == 11 else ()))
    cur.execute("insert into element_instances values(?,?)", (guid, gh))
    if HAS_WBBOX: cur.execute("insert into element_world_bbox values(?,?,?,?,?,?,?)", (guid, lo[0], hi[0], lo[1], hi[1], lo[2], hi[2]))
    if HAS_RTREE:
        rid = cur.execute("select rowid from elements_meta where guid=?", (guid,)).fetchone()[0]
        cur.execute("insert into elements_rtree values(?,?,?,?,?,?,?)", (rid, lo[0], hi[0], lo[1], hi[1], lo[2], hi[2]))
    for p in parents: cur.execute("insert into element_parts values(?,?,?,?)", (p, guid, META[p][0], cls))
    ADDED_GUIDS.append(guid); ADDED_VERTS += len(W)
    return len(W)
def change(kind, guid, cls, host, rule, detail): CH.append((kind, guid, cls, host, rule, detail))

# ---------------------------------------------------------------- second schedule source: marks JSON joined by a regex on element_name (section 7)
if A.schedule_json:
    import rebar_beams
    rebar_beams.run(globals())              # builds, judges, writes, exits; the DXF-attached path below is not run for this source

# ---------------------------------------------------------------- A. footings and columns
RB_LOG = []                                            # per-set facts for the witnesses (re-derived from the DB there; kept here for printing only)
F_IDS = [g for g in by_class('IfcFooting') if 'Sched_Footing_L_Bar' in ST[g]]
C_IDS = [g for g in by_class('IfcColumn') if 'Sched_Column_Main_Bar' in ST[g]]
WORLD = {g: world(cur, g) for g in F_IDS + C_IDS}
BOX = {}; refused = {}
for g in sorted(WORLD):
    V = WORLD[g]
    if V is None or not is_box(V): refused[g] = 'mesh is not an axis-aligned box'; continue
    BOX[g] = aabb(V)
print(f'§SHEDRB_INPUT footings_with_schedule={len(F_IDS)} column_pieces_with_schedule={len(C_IDS)} boxes_ok={len(BOX)} refused={len(refused)}')

set_dims = []   # (stated vs mesh size check)
def stated_footing(g):
    s = ST[g]; L = parse_dia_spacing(s.get('Sched_Footing_L_Bar')); S = parse_dia_spacing(s.get('Sched_Footing_S_Bar'))
    return L, S
n_added_f = 0; f_counts = {}
for g in sorted(F_IDS):
    if g in refused: change('REFUSED', g, META[g][0], g, 'Footing mesh', refused[g]); continue
    s = ST[g]; L, S = stated_footing(g)
    if L is None or S is None: change('REFUSED', g, META[g][0], g, 'Footing mesh', f'could not parse stated bars L="{s.get("Sched_Footing_L_Bar")}" S="{s.get("Sched_Footing_S_Bar")}"'); continue
    lo, hi = BOX[g]; dim = hi - lo; cx, cy = (lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2
    long_ax = 0 if dim[0] >= dim[1] else 1; short_ax = 1 - long_ax
    # stated size check (L x B vs mesh)
    szs = s.get('Sched_Footing_Size_L_x_B', ''); m = re.match(r'^(.*)\s+x\s+(.*)$', szs); stL = parse_ft_in(m.group(1)) if m else None; stB = parse_ft_in(m.group(2)) if m else None
    stT = parse_frac_in(s.get('Sched_Footing_T', '').rstrip('"')) if s.get('Sched_Footing_T') else None
    if stL and stB and stT: set_dims.append(('footing', g, max(abs(sorted([stL, stB])[0] - min(dim[:2])), abs(sorted([stL, stB])[1] - max(dim[:2])), abs(stT - dim[2])) * 1000))
    bars = {}; first = rv('footing_bottom_layer'); order = ['L_Bar', 'S_Bar'] if first == 'L_Bar' else ['S_Bar', 'L_Bar']
    spec = {'L_Bar': L, 'S_Bar': S}; z_cursor = lo[2] + PLACE_F; zc = {}
    for k in order:
        zc[k] = z_cursor + spec[k][0] / 2000.0; z_cursor += spec[k][0] / 1000.0
    for k, ax_run, ax_dist in (('L_Bar', long_ax, short_ax), ('S_Bar', short_ax, long_ax)):
        d_mm, sp, _, sp_in = spec[k]; d = d_mm / 1000.0; side = dim[ax_dist]
        n = int(math.floor((side - 2 * PLACE_F - d) / sp + 1e-9)) + 1                          # centre-to-centre between first and last bar centre; spec literal below
        n_spec = int(math.floor((side - 2 * PLACE_F) / sp + 1e-9)) + 1
        avail = side - 2 * (PLACE_F + d / 2); marg = (avail - (n - 1) * sp) / 2                  # bars centred in the cover-bounded span
        tris = []
        for i in range(n):
            pos = lo[ax_dist] + PLACE_F + d / 2 + marg + i * sp
            P0 = np.zeros(3); P1 = np.zeros(3)
            P0[ax_run] = lo[ax_run] + PLACE_F; P1[ax_run] = hi[ax_run] - PLACE_F
            P0[ax_dist] = P1[ax_dist] = pos; P0[2] = P1[2] = zc[k]
            tris += prism(P0, P1, d / 2)
        blen = float(hi[ax_run] - lo[ax_run] - 2 * PLACE_F)
        assert blen <= STOCK, 'bar longer than stock length'
        nm = f'Footing {k} {n} x {d_mm:g} mm @ {sp_in:g}" c/c [stated "{s.get("Sched_Footing_" + k)}" | {s.get("SchedSource_footing")}]'
        guid = f'GEN-RB-{g}-{"L" if k == "L_Bar" else "S"}'
        write_part(guid, 'IfcReinforcingBar', nm, META[g][2], META[g][3], META[g][4], tris, RB_RGBA, parents=[g])
        change('ADDED', guid, 'IfcReinforcingBar', g, f'Footing mesh from schedule {s.get("Sched_Footing_Type")}; cover {PLACE_F * 1000:g} mm [{RULES["footing_cover_mm"]["source"].split(" (")[0]}]; layer order {first} first [{RULES["footing_bottom_layer"]["source"].split(" (")[0]}]',
               f'{k}: stated "{s.get("Sched_Footing_" + k)}" ({s.get("SchedSource_footing")}) | {n} bars (spec formula alone gives {n_spec}) | each {blen * 1000:.1f} mm long, runs along {"xy"[ax_run]} | centred in the cover-bounded span (margin {marg * 1000:.2f} mm beyond cover) | storey {META[g][2]}')
        f_counts[(g, k)] = (n, n_spec); n_added_f += 1
        RB_LOG.append(('footing', g, k, n, n_spec, blen))
print(f'§SHEDRB_FOOTING sets_added={n_added_f} footings={len(F_IDS) - sum(1 for g in F_IDS if g in refused)} bars={sum(v[0] for v in f_counts.values())}')

# ---- columns: group the pieces into drawn columns by plan position
groups = []                                              # each: dict(key=(cx,cy), pieces=[guid...])
for g in sorted(C_IDS):
    if g in refused: change('REFUSED', g, 'IfcColumn', g, 'Column bars', refused[g]); continue
    lo, hi = BOX[g]; c = ((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2)
    for G in groups:
        if abs(G['c'][0] - c[0]) <= 0.002 and abs(G['c'][1] - c[1]) <= 0.002: G['pieces'].append(g); break
    else: groups.append({'c': c, 'pieces': [g]})
sizes = collections.Counter(len(G['pieces']) for G in groups)
print(f'§SHEDRB_COLGROUP drawn_columns={len(groups)} pieces_per_column={dict(sorted(sizes.items()))} -> {"PASS" if set(sizes) == {3} else "FAIL"}')
FOOT_BOXES = {g: BOX[g] for g in F_IDS if g in BOX}
n_main = n_tieA = n_tieB = 0; zone_gov = collections.Counter(); col_report = []
for G in sorted(groups, key=lambda G: G['c']):
    pcs = sorted(G['pieces'], key=lambda g: (BOX[g][0][2], g)); host0 = pcs[0]
    def refuse(why):
        for g in pcs: change('REFUSED', g, 'IfcColumn', host0, 'Column bars', why)
    if len(pcs) != 3: refuse(f'{len(pcs)} pieces at this plan position, expected 3'); continue
    ok = all(abs(BOX[pcs[i]][1][2] - BOX[pcs[i + 1]][0][2]) <= 0.001 for i in range(2))
    if not ok: refuse('pieces are not stacked contiguously (gap > 1 mm)'); continue
    rows = [ST[g] for g in pcs]
    keys = ('Sched_Column_Main_Bar', 'Sched_Column_Stirrup_A', 'Sched_Column_Stirrup_B', 'Sched_Column_Type', 'SchedSource_column')
    if any(r.get(k) != rows[0].get(k) for r in rows for k in keys): refuse('the pieces carry different schedule rows'); continue
    mb = parse_main(rows[0].get('Sched_Column_Main_Bar')); tA = parse_dia_spacing(rows[0].get('Sched_Column_Stirrup_A')); tB = parse_dia_spacing(rows[0].get('Sched_Column_Stirrup_B'))
    if not (mb and tA and tB and tA[2] == 'A' and tB[2] == 'B'): refuse(f'could not parse stated bars main="{rows[0].get("Sched_Column_Main_Bar")}" A="{rows[0].get("Sched_Column_Stirrup_A")}" B="{rows[0].get("Sched_Column_Stirrup_B")}"'); continue
    if mb[0] != 6: refuse(f'stated {mb[0]} main bars; the arrangement rule (3 + 3 on two faces) fits 6 only'); continue
    dm = mb[1] / 1000.0; dt = max(tA[0], tB[0]) / 1000.0; sA, sB = tA[1], tB[1]
    fl = [g for g, (flo, fhi) in FOOT_BOXES.items() if flo[0] <= G['c'][0] <= fhi[0] and flo[1] <= G['c'][1] <= fhi[1]]
    if len(fl) != 1: refuse(f'{len(fl)} footings under the column centre, expected 1'); continue
    fg = fl[0]; flo, fhi = FOOT_BOXES[fg]; Ls, Ss = stated_footing(fg)
    if Ls is None or Ss is None: refuse('footing under it has no parsable bars'); continue
    d1, d2 = (Ls[0], Ss[0]) if rv('footing_bottom_layer') == 'L_Bar' else (Ss[0], Ls[0])
    z_mesh_top = flo[2] + PLACE_F + (d1 + d2) / 1000.0                                  # top of the footing's two-layer mesh: the main bars land on it
    zbot = BOX[pcs[0]][0][2]; ztop = BOX[pcs[2]][1][2]; H = ztop - zbot
    hx = min((BOX[g][1][0] - BOX[g][0][0]) / 2 for g in pcs); hy = min((BOX[g][1][1] - BOX[g][0][1]) / 2 for g in pcs)
    cx = float(np.mean([(BOX[g][0][0] + BOX[g][1][0]) / 2 for g in pcs])); cy = float(np.mean([(BOX[g][0][1] + BOX[g][1][1]) / 2 for g in pcs]))
    # stated sizes vs mesh
    sa = parse_size_in(rows[0].get('Sched_Column_Above_Gr')); sb = parse_size_in(rows[0].get('Sched_Column_Below_Gr'))
    if sa and sb:
        for g, want in ((pcs[0], sb), (pcs[2], sa)):
            d = BOX[g][1] - BOX[g][0]; set_dims.append(('column', g, max(abs(d[0] - want[0]), abs(d[1] - want[1])) * 1000))
    # zones
    zone_L6 = H / 6.0; zoneA = max(ZONE_STATED, zone_L6); gov = 'L/6' if zone_L6 >= ZONE_STATED else 'stated 20in'; zone_gov[gov] += 1
    # main bars: 3 + 3 on the two faces normal to the chosen axis; centres at cover + tie + d/2 from the faces of the SMALLEST piece section
    ax_n = 0 if rv('column_bar_face_normal_axis') == 'x' else 1; ax_t = 1 - ax_n; half = [hx, hy]
    off_n = half[ax_n] - (PLACE_C + dt + dm / 2); off_t = half[ax_t] - (PLACE_C + dt + dm / 2)
    z0 = z_mesh_top; z1 = ztop - PLACE_C; blen = z1 - z0
    if blen > STOCK: refuse(f'main bar {blen:.3f} m exceeds stock {STOCK} m and laps are not modelled'); continue
    tris = []
    for sn in (-1, 1):
        for st in (-1, 0, 1):
            P0 = np.zeros(3); P1 = np.zeros(3); P0[ax_n] = P1[ax_n] = (cx, cy)[ax_n] + sn * off_n; P0[ax_t] = P1[ax_t] = (cx, cy)[ax_t] + st * off_t; P0[2] = z0; P1[2] = z1
            tris += prism(P0, P1, dm / 2)
    guid = f'GEN-RB-{host0}-MAIN'; r0 = rows[0]
    write_part(guid, 'IfcReinforcingBar', f'Column main bars {mb[0]} x {mb[1]:g} mm dia [stated "{r0.get("Sched_Column_Main_Bar")}" | {r0.get("Sched_Column_Type")} {r0.get("SchedSource_column")}]',
               META[host0][2], META[host0][3], META[host0][4], tris, RB_RGBA, parents=pcs)
    change('ADDED', guid, 'IfcReinforcingBar', host0, f'Column main bars from schedule {r0.get("Sched_Column_Type")}; 3 + 3 on two opposite faces normal to {rv("column_bar_face_normal_axis")} [{RULES["column_bar_face_normal_axis"]["source"].split(" (")[0]}]; cover {PLACE_C * 1000:g} mm [{RULES["column_cover_mm"]["source"].split(" (")[0]}] on the smallest section; footing mesh top to column top',
           f'stated "{r0.get("Sched_Column_Main_Bar")}" ({r0.get("SchedSource_column")}) | 6 bars, each {blen * 1000:.1f} mm, continuous through {len(pcs)} pieces {", ".join(pcs)} | lands on footing {fg} mesh top z={z_mesh_top:.4f} | stock {STOCK:g} m ok, no laps | storey {META[host0][2]}')
    n_main += 1; RB_LOG.append(('main', host0, 'MAIN', 6, 6, blen))
    # ties
    zA_lo = zbot + PLACE_C + dt / 2; zA_hi = ztop - PLACE_C - dt / 2
    A_bot = [zA_lo + k * sA for k in range(int((zoneA + 1e-9) // sA) + 2) if zA_lo + k * sA <= zbot + zoneA + 1e-9]
    A_top = sorted([zA_hi - k * sA for k in range(int((zoneA + 1e-9) // sA) + 2) if zA_hi - k * sA >= ztop - zoneA - 1e-9])
    if not A_bot or not A_top or A_bot[-1] >= A_top[0]: refuse('end zones overlap (column too short for two (A) zones)'); continue
    gap = A_top[0] - A_bot[-1]; nseg = max(1, int(math.ceil(gap / sB - 1e-9))); B = [A_bot[-1] + gap * i / nseg for i in range(1, nseg)]
    zt_all = [(z, 'A') for z in A_bot + A_top] + [(z, 'B') for z in B]
    thx = hx - PLACE_C - dt / 2; thy = hy - PLACE_C - dt / 2
    for pi, g in enumerate(pcs):
        zlo, zhi = BOX[g][0][2], BOX[g][1][2]; last = pi == 2
        mine = [(z, k) for z, k in zt_all if (zlo - 1e-9 <= z < zhi - 1e-9) or (last and abs(z - zhi) <= 1e-9)]
        for kind, tg in (('A', tA), ('B', tB)):
            zs = sorted(z for z, k in mine if k == kind)
            if not zs: continue
            tris = []
            for z in zs: tris += tie_loop(cx, cy, z, thx, thy, dt / 2)
            sfx = 'TA' if kind == 'A' else 'TB'; guid = f'GEN-RB-{g}-{sfx}'; rs = ST[g]['Sched_Column_Stirrup_' + kind]
            write_part(guid, 'IfcReinforcingBar', f'Column ties {kind} {len(zs)} x {tg[0]:g} mm dia @ {tg[3]:g}" c/c [stated "{rs}" | {ST[g].get("SchedSource_column")}]', META[g][2], META[g][3], META[g][4], tris, RB_RGBA, parents=[g])
            gaps = [b - a for a, b in zip(zs, zs[1:])]
            change('ADDED', guid, 'IfcReinforcingBar', g, f'Column ties ({kind}) from schedule {ST[g].get("Sched_Column_Type")}; closed perimeter loops, hooks not modelled, no cross-ties [default: ours]; zone A = max(stated 20 in, L/6) = {zoneA * 1000:.1f} mm [{RULES["column_zone_A_rule"]["source"].split(" (")[0]}]; cover {PLACE_C * 1000:g} mm',
                   f'stated "{rs}" ({ST[g].get("SchedSource_column")}) | {len(zs)} loops in this piece, z {zs[0]:.4f}..{zs[-1]:.4f} | clear height L={H:.4f} m, L/6={zone_L6:.4f} m, stated 20in={ZONE_STATED:.4f} m, governs: {gov} | storey {META[g][2]}')
            if kind == 'A': n_tieA += len(zs)
            else: n_tieB += len(zs)
            RB_LOG.append(('tie' + kind, g, sfx, len(zs), len(zs), 0.0))
    col_report.append((host0, H, zone_L6, zoneA, gov, len(A_bot), len(A_top), len(B), max([b - a for a, b in zip(A_bot[-1:] + B + A_top[:1], B + A_top[:1] + A_top[:1])] or [0])))
print(f'§SHEDRB_ZONE columns={len(col_report)} governs={dict(zone_gov)} (stated 20in={ZONE_STATED:.4f} m; L/6 per column logged in the change list)'
      + (f' sample_L={col_report[0][1]:.4f} L/6={col_report[0][2]:.4f}' if col_report else ''))
print(f'§SHEDRB_ASSUMED tie_hooks={rv("tie_hooks_modelled")} cross_ties={rv("cross_ties_modelled")} laps={rv("laps_modelled")} stock_checked_bars={sum(1 for r in RB_LOG if r[0] in ("footing", "main"))}')

# ---- not built: beams (no schedule row). callout texts from the details sheet, if given.
BEAMS = by_class('IfcBeam')
callouts = []
if A.callouts:
    try:
        import ezdxf
        d = ezdxf.readfile(A.callouts)
        for e in d.modelspace():
            if e.dxftype() not in ('TEXT', 'MTEXT'): continue
            t = e.dxf.text if e.dxftype() == 'TEXT' else e.text
            t = re.sub(r'\\[A-Za-z][^;]*;', '', t).replace('{', '').replace('}', '').replace('%%c', ' dia').replace('%%C', ' dia').strip()
            if re.search(r'\bdia\b', t) or re.search(r'\bst\b', t): callouts.append((e.dxf.handle, ' '.join(t.split())))
        callouts.sort(key=lambda x: (int(x[0], 16), x[1]))
    except Exception as ex:
        print(f'§SHEDRB_CALLOUTS INCONCLUSIVE could not read the details sheet: {type(ex).__name__}')
no_sched = [g for g in BEAMS if not any(k.startswith('Sched_') for k in ST[g])]
ctext = ' ; '.join(f'#{h}: {t}' for h, t in callouts) if callouts else 'details sheet not supplied (--callouts)'
for g in no_sched:
    change('NOT_BUILT', g, 'IfcBeam', g, 'Beam bars: no schedule row on the element',
           f'"{META[g][1]}" | reader task (scope section 5 item 1b): beam rebar callouts are on long sections, not in a table, and the DB does not attribute them to a beam | texts on the details sheet, by drawing handle: {ctext}')
print(f'§SHEDRB_BEAMS beams={len(BEAMS)} without_schedule_row={len(no_sched)} not_built={len(no_sched)} details_sheet_rebar_texts={len(callouts)} -> {"PASS" if len(no_sched) == 35 else "INCONCLUSIVE" if not BEAMS else "FAIL"}')

# ---------------------------------------------------------------- B. truss welds (build 3)
def clip_poly(poly, lo, hi):
    pts = list(poly)
    for ax in range(3):
        for sign, bound in ((1, lo[ax]), (-1, hi[ax])):
            out = []
            for i in range(len(pts)):
                p, q = pts[i], pts[(i + 1) % len(pts)]; dp = sign * (p[ax] - bound) if sign == 1 else (hi[ax] - p[ax]); dq = sign * (q[ax] - bound) if sign == 1 else (hi[ax] - q[ax])
                if dp >= 0: out.append(p)
                if (dp >= 0) != (dq >= 0): out.append(p + (q - p) * (dp / (dp - dq)))
            pts = out
            if not pts: return []
    return pts
def tri_box(T, c, h):                      # Akenine-Moller: triangles (N,3,3) vs box (centre c, half h)
    V = T - c; e = [V[:, 1] - V[:, 0], V[:, 2] - V[:, 1], V[:, 0] - V[:, 2]]; hit = np.ones(len(T), bool)
    for k in range(3): hit &= (V[:, :, k].min(1) <= h[k]) & (V[:, :, k].max(1) >= -h[k])
    n = np.cross(e[0], e[1]); hit &= np.abs(np.einsum('ij,ij->i', n, V[:, 0])) <= np.abs(n) @ h
    for ei in e:
        for k in range(3):
            a = np.cross(np.eye(3)[k], ei); p = np.einsum('nij,nj->ni', V, a); rr = np.abs(a) @ h
            hit &= (p.min(1) <= rr) & (p.max(1) >= -rr)
    return hit
def ray_count(o, d, T):
    e1 = T[:, 1] - T[:, 0]; e2 = T[:, 2] - T[:, 0]; p = np.cross(d, e2); det = np.einsum('ij,ij->i', e1, p)
    ok = np.abs(det) > 1e-12; inv = np.where(ok, 1 / np.where(ok, det, 1), 0); s = o - T[:, 0]
    u = np.einsum('ij,ij->i', s, p) * inv; q = np.cross(s, e1); vv = (q @ d) * inv; t = np.einsum('ij,ij->i', e2, q) * inv
    return int((ok & (u >= 0) & (vv >= 0) & (u + vv <= 1) & (t > 1e-9)).sum())
def inside_mesh(P, T):
    odd = sum(ray_count(P, d / np.linalg.norm(d), T) % 2 for d in (np.array([0.577, 0.577, 0.577]), np.array([-0.267, 0.802, 0.535]), np.array([0.707, -0.1, -0.7])))
    return odd >= 2
def plate_frame(V):                         # thickness axis = smallest world extent; in-plane axes from the minimum-area rectangle
    ext = V.max(0) - V.min(0); k = int(np.argmin(ext)); ax = [i for i in range(3) if i != k]; Q = V[:, ax]; best = None
    for t in V.reshape(-1, 3, 3):
        for i in range(3):
            d = t[(i + 1) % 3][ax] - t[i][ax]
            if np.hypot(*d) < 1e-9: continue
            ang = math.atan2(d[1], d[0]); c, s = math.cos(ang), math.sin(ang); a2 = np.ptp(Q @ np.array([[c, s], [-s, c]]).T, 0).prod()
            if best is None or a2 < best[0] - 1e-12: best = (a2, ang)
    ang = best[1]; c, s = math.cos(ang), math.sin(ang); u = np.zeros(3); v = np.zeros(3); n = np.zeros(3)
    u[ax[0]] = c; u[ax[1]] = s; v[ax[0]] = -s; v[ax[1]] = c; n[k] = 1.0
    return np.stack([u, v, n], 1)

def member_axis(V):                         # centroid and long axis; sign convention: largest component positive (this fixes which end is 'A')
    c0 = V.mean(0); w_, U = np.linalg.eigh(np.cov((V - c0).T)); a = U[:, 2]
    return c0, (-a if a[np.argmax(np.abs(a))] < 0 else a)
MEM = by_class('IfcMember'); PLT = by_class('IfcPlate')
MV = {g: world(cur, g) for g in MEM}; PV = {g: world(cur, g) for g in PLT}
PF = {}
for g in PLT:
    R = plate_frame(PV[g]); cp = PV[g].mean(0); L = (PV[g] - cp) @ R; lo, hi = L.min(0), L.max(0); PF[g] = (R, cp, lo, hi)
def thick_in(name, pat):
    m = re.search(pat, name or ''); return parse_frac_in(m.group(1)) if m else None
def weld_min(t_mm):
    for up, w in rv('weld_min_table_mm'):
        if t_mm <= up: return w
contacts = []; touch_only = 0; no_contact = []; weld_info = {}; skipped_keys = set()
for gm in MEM:
    VM = MV[gm]; c0, a = member_axis(VM)
    s_all = (VM - c0) @ a; slo, shi = s_all.min(), s_all.max(); mlo, mhi = aabb(VM); n_con = 0
    for gp in PLT:
        R, cp, lo, hi = PF[gp]; plo, phi = aabb(PV[gp])
        if np.any(mhi < plo - 1e-6) or np.any(mlo > phi + 1e-6): continue
        TM = ((VM - cp) @ R).reshape(-1, 3, 3); mid = (lo + hi) / 2; h = (hi - lo) / 2
        corners_in = [(x, y, z) for x in (lo[0], hi[0]) for y in (lo[1], hi[1]) for z in (lo[2], hi[2])]
        sat = tri_box(TM, mid, h + 1e-9).any(); cin = [np.array(cn) for cn in corners_in if inside_mesh(np.array(cn), TM)]
        if not sat and not cin: continue
        pts = []
        for T in TM: pts += clip_poly(list(T), lo, hi)
        pts += cin
        if not pts: continue
        al = R.T @ a; c0l = (c0 - cp) @ R; ss = [(p - c0l) @ al for p in pts]; s0, s1 = min(ss), max(ss)
        if s1 - s0 < 1e-6: touch_only += 1; continue
        end = ('A' if s0 <= slo + END_TOL else '') + ('B' if s1 >= shi - END_TOL else '') or 'T'      # T = through (mid-span) contact
        rec = dict(m=gm, p=gp, s0=s0, s1=s1, end=end, a=a, c0=c0, slo=slo, shi=shi)
        contacts.append(rec); n_con += 1
    if n_con == 0: no_contact.append(gm)
n_endc = sum(1 for r in contacts if r['end'] != 'T'); n_thr = len(contacts) - n_endc
print(f'§SHEDRB_WELD_SCAN members={len(MEM)} plates={len(PLT)} contacts={len(contacts)} end_contacts={n_endc} through_contacts={n_thr} touch_only={touch_only} members_without_any_contact={len(no_contact)}')
n_weld = 0; weld_skipped = []
for rec in sorted(contacts, key=lambda r: (r['m'], r['p'])):
    gm, gp = rec['m'], rec['p']; R, cp, lo, hi = PF[gp]; VM = MV[gm]
    tp = thick_in(META[gp][1], r'(\d+(?:/\d+)?)"\s*Thickness'); tm = thick_in(META[gm][1], r'x(\d+/\d+)"')
    if tp is None: tp = float((hi - lo)[2])                               # measured, only if the name gives none
    thin = min(x for x in (tp, tm) if x is not None); wsz = weld_min(thin * 1000.0)
    a_l = R.T @ rec['a']; c0l = (rec['c0'] - cp) @ R; n_l = np.array([0, 0, 1.0])
    if abs(a_l[2]) > 0.05: weld_skipped.append((gm, gp, 'member axis not parallel to the plate plane (member lies across or against the plate face; the spec has no bead rule for it)')); skipped_keys.add((gm, rec['end'], gp)); continue
    t_l = np.cross(n_l, a_l); t_l /= np.linalg.norm(t_l); TM = ((VM - cp) @ R).reshape(-1, 3, 3); zpl = hi[2]
    seam = []
    for T in TM:
        for i in range(3):
            p, q = T[i], T[(i + 1) % 3]
            if (p[2] - zpl) * (q[2] - zpl) < 0:
                pt = p + (q - p) * ((zpl - p[2]) / (q[2] - p[2])); seam.append(pt @ t_l)       # the member is a prism: its section in the plate-face plane is the same along the whole length
    if not seam: weld_skipped.append((gm, gp, 'the member does not reach the plate face: no seam')); skipped_keys.add((gm, rec['end'], gp)); continue
    t_hi, t_lo = max(seam), min(seam); tc = c0l @ t_l
    corner = lambda s, t_ext: c0l + a_l * s + t_l * (t_ext - tc) + n_l * (zpl - (c0l + a_l * s)[2])
    tris = []
    for t_ext, t_out in ((t_hi, t_l), (t_lo, -t_l)):
        c0w = corner(rec['s0'], t_ext) @ R.T + cp; c1w = corner(rec['s1'], t_ext) @ R.T + cp
        tris += bead(c0w, c1w, wsz / 1000.0, R @ n_l, R @ t_out)
    Lw = rec['s1'] - rec['s0']; guid = f'GEN-WD-{gm}-{rec["end"]}-{gp}'
    write_part(guid, 'IfcFastener', f'2 fillet welds {wsz:g} mm x {Lw * 1000:.0f} mm, member {"through contact" if rec["end"] == "T" else "end " + rec["end"]} to gusset plate', META[gm][2], META[gm][3], META[gm][4], tris, WD_RGBA)
    change('ADDED', guid, 'IfcFastener', gm, f'Fillet weld, AISC 360-16 Table J2.4 minimum for the thinner part ({thin * 1000:.2f} mm -> {wsz:g} mm) [{RULES["weld_min_table_mm"]["source"]}]; length = overlap length [default: ours]',
           f'member "{META[gm][1]}" {"through contact (mid-span, clipped overlap with the plate box)" if rec["end"] == "T" else "end " + rec["end"]} -> gusset plate {gp} "{META[gp][1]}" | overlap along the member {Lw * 1000:.1f} mm | beads on the +face of the plate at the two outer edges of the member | plate t={tp * 1000:.2f} mm, member leg t={"-" if tm is None else f"{tm * 1000:.2f} mm"} | storey {META[gm][2]}')
    weld_info[guid] = (gm, rec['end'], gp, wsz, Lw); n_weld += 1
for gm in sorted(no_contact):
    change('NOT_BUILT', gm, 'IfcMember', gm, 'Weld: member has no contact with a gusset plate', f'"{META[gm][1]}" | counted, not welded')
for gm, gp, why in weld_skipped: change('REFUSED', gm, 'IfcMember', gm, 'Weld', f'plate {gp}: {why}')
print(f'§SHEDRB_WELD_BUILT welds={n_weld} skipped={len(weld_skipped)}')

# ---------------------------------------------------------------- write the change table, commit
for i, r in enumerate(CH, 1): cur.execute("insert into upgrade_changes values(?,?,?,?,?,?,?)", (i, *r))
db.commit(); db.execute("VACUUM"); db.close()

# ================================================================ witnesses (read the OUT db only)
out = sqlite3.connect('file:' + OUT + '?mode=ro', uri=True); oc = out.cursor()
FAILS = []
def verdict(name, ok, line):
    v = 'INCONCLUSIVE' if ok is None else ('PASS' if ok else 'FAIL'); print(f'§SHEDRB_{name} {line} -> {v}')
    if v == 'FAIL': FAILS.append(name)
    return v
gen_ids = set(ADDED_GUIDS)

# --- IDENT
dig_ok = True; ntab = 0; bad_tabs = []
for t in SRC_TABLES:
    where = ''
    if t == 'elements_meta' or t == 'element_transforms' or t == 'element_instances': where = "where guid not like 'GEN-%'"
    elif t == 'element_world_bbox': where = "where guid not like 'GEN-%'"
    elif t == 'element_parts': where = "where parent_guid not like 'GEN-%' and child_guid not like 'GEN-%' and child_guid not in (select guid from elements_meta where guid like 'GEN-%')"
    elif t == 'component_geometries': where = "where geometry_hash not like 'rb%' and geometry_hash not like 'wd%'"
    d = table_digest(oc, t, SRC_KEY[t], where); ntab += 1
    if d != D_SRC[t]: dig_ok = False; bad_tabs.append(t)
n_out_meta = oc.execute("select count(*) from elements_meta").fetchone()[0]
verdict('IDENT', (dig_ok and n_out_meta == N_SRC_META + len(gen_ids) and len(gen_ids) > 0) if gen_ids else None,
        f'source_tables={ntab} tables_identical={dig_ok}{"" if dig_ok else " differing=" + ",".join(bad_tabs)} src_elements={N_SRC_META} out_elements={n_out_meta} added={len(gen_ids)}')

def gworld(g):
    r = oc.execute("select c.vertices, t.center_x, t.center_y, t.center_z from element_instances i join component_geometries c using(geometry_hash) join element_transforms t using(guid) where i.guid=?", (g,)).fetchone()
    return np.frombuffer(r[0], np.float32).reshape(-1, 3).astype(float) + np.array(r[1:4])
BAR_NV = SIDES * 4 * 3; LOOP_NV = 4 * SIDES * 2 * 3
def chunks(g, nv):
    W = gworld(g); assert len(W) % nv == 0, f'{g}: {len(W)} vertices not a multiple of {nv}'; return W.reshape(-1, nv, 3)

rb_ids = sorted(g for g in gen_ids if g.startswith('GEN-RB-'))
# --- STATED
stated_bad = []; judged = 0
parents = collections.defaultdict(list)
for p, c in oc.execute("select parent_guid, child_guid from element_parts where child_guid like 'GEN-RB-%' order by 1,2"): parents[p].append(c)
ties_meas = {}
for g in sorted(F_IDS + C_IDS):
    if g in refused: continue
    s = ST[g]; kids = sorted(parents.get(g, [])); judged += 1
    kinds = sorted(k.rsplit('-', 1)[1] for k in kids)
    if g in F_IDS:
        L, S = parse_dia_spacing(s['Sched_Footing_L_Bar']), parse_dia_spacing(s['Sched_Footing_S_Bar'])
        if kinds != ['L', 'S']: stated_bad.append((g, f'sets {kinds}')); continue
        for k, tg in (('L', L), ('S', S)):
            CHK = chunks(f'GEN-RB-{g}-{k}', BAR_NV); ext = np.array([np.ptp(c, 0) for c in CHK]); runax = int(np.argmax(ext[0])); lat = [a for a in range(3) if a != runax]
            dia = ext[:, lat].min(1) * 1000; cen = np.array([(c.min(0) + c.max(0)) / 2 for c in CHK]); dist_ax = [a for a in lat if np.ptp(cen[:, a]) > 1e-6 or len(CHK) == 1]
            if np.abs(dia - tg[0]).max() > 0.01: stated_bad.append((g, f'{k} dia {dia.min():.3f}..{dia.max():.3f} != {tg[0]}'))
            if len(CHK) > 1:
                da = [a for a in lat if np.ptp(cen[:, a]) > 1e-6][0]; gp = np.diff(np.sort(cen[:, da]))
                if np.abs(gp - tg[1]).max() > 1e-5: stated_bad.append((g, f'{k} spacing {gp.min() * 1000:.3f}..{gp.max() * 1000:.3f} mm != {tg[1] * 1000:.3f}'))
    else:
        mb = parse_main(s['Sched_Column_Main_Bar']); tA = parse_dia_spacing(s['Sched_Column_Stirrup_A']); tB = parse_dia_spacing(s['Sched_Column_Stirrup_B'])
        mains = [k for k in kids if k.endswith('-MAIN')]
        if len(mains) != 1: stated_bad.append((g, f'main sets {len(mains)}')); continue
        CHK = chunks(mains[0], BAR_NV); dia = np.array([np.ptp(c[:, :2], 0).max() for c in CHK]) * 1000
        if len(CHK) != mb[0]: stated_bad.append((g, f'main bars {len(CHK)} != stated {mb[0]}'))
        if np.abs(dia - mb[1]).max() > 0.01: stated_bad.append((g, f'main dia {dia.min():.3f}..{dia.max():.3f} != {mb[1]}'))
        for kind, tg in (('A', tA), ('B', tB)):
            tk = [k for k in kids if k.endswith('-T' + kind)]
            if not tk: continue
            CHK = chunks(tk[0], LOOP_NV); dz = np.array([np.ptp(c[:, 2]) for c in CHK]) * 1000
            if np.abs(dz - tg[0]).max() > 0.01: stated_bad.append((g, f'tie {kind} dia {dz.min():.3f}..{dz.max():.3f} != {tg[0]}'))
            zc = np.sort([(c[:, 2].min() + c[:, 2].max()) / 2 for c in CHK]); ties_meas[(g, kind)] = zc
# expectation of which tie sets each piece must have, from the stated zone intervals (independent of the generator's loops)
exp_missing = []
for G in groups:
    pcs = sorted(G['pieces'], key=lambda g: (BOX[g][0][2], g))
    if len(pcs) != 3 or any(g in refused for g in pcs): continue
    zb, zt = BOX[pcs[0]][0][2], BOX[pcs[2]][1][2]; zoneA = max(ZONE_STATED, (zt - zb) / 6)
    Aint = [(zb, zb + zoneA), (zt - zoneA, zt)]
    for g in pcs:
        zlo, zhi = BOX[g][0][2], BOX[g][1][2]
        needA = any(min(zhi, b) - max(zlo, a) > 0.02 for a, b in Aint)
        needB = (zhi - zlo) - sum(max(0, min(zhi, b) - max(zlo, a)) for a, b in Aint) > 0.02
        have = {k.rsplit('-', 1)[1] for k in parents.get(g, [])}
        if (needA and 'TA' not in have) or (needB and 'TB' not in have) or 'MAIN' not in have: exp_missing.append((g, needA, needB, sorted(have)))
verdict('STATED', None if judged == 0 else (not stated_bad and not exp_missing),
        f'elements_with_schedule={judged} sets_checked={len(rb_ids)} diameter_spacing_mismatches={len(stated_bad)} missing_expected_sets={len(exp_missing)}' + (f' first={stated_bad[0]}' if stated_bad else '') + (f' first_missing={exp_missing[0]}' if exp_missing else ''))
# tie spacing from the stored loops: (A) zone gaps equal the stated spacing, (B) gaps do not exceed it
tie_bad = 0; tie_judged = 0; maxB = 0.0
for G in groups:
    pcs = sorted(G['pieces'], key=lambda g: (BOX[g][0][2], g))
    if len(pcs) != 3 or any(g in refused for g in pcs): continue
    tA = parse_dia_spacing(ST[pcs[0]]['Sched_Column_Stirrup_A']); tB = parse_dia_spacing(ST[pcs[0]]['Sched_Column_Stirrup_B'])
    za = np.sort(np.concatenate([ties_meas[(g, 'A')] for g in pcs if (g, 'A') in ties_meas])); zb_ = np.sort(np.concatenate([ties_meas[(g, 'B')] for g in pcs if (g, 'B') in ties_meas]))
    allz = np.sort(np.concatenate([za, zb_])); gaps = np.diff(allz); tie_judged += 1
    # every consecutive gap is <= the largest stated spacing; gaps between two (A)-zone loops equal the (A) spacing
    Aset = set(np.round(za, 9));
    for i in range(len(allz) - 1):
        both_A = round(allz[i], 9) in Aset and round(allz[i + 1], 9) in Aset and gaps[i] < tB[1] * 0.99
        if both_A and abs(gaps[i] - tA[1]) > 1e-5: tie_bad += 1
        if gaps[i] > tB[1] + 1e-5: tie_bad += 1
        if not both_A and round(allz[i], 9) in set(np.round(zb_, 9)) : maxB = max(maxB, gaps[i])
verdict('STATED_TIE_SPACING', None if tie_judged == 0 else tie_bad == 0, f'columns={tie_judged} violations={tie_bad} max_B_gap_mm={maxB * 1000:.3f} (stated B spacing {parse_dia_spacing(ST[C_IDS[0]]["Sched_Column_Stirrup_B"])[1] * 1000:.3f})' if C_IDS else 'no columns')
if set_dims:
    mx = max(x[2] for x in set_dims); verdict('SIZE_CHECK', mx <= 1.0, f'stated sizes vs mesh boxes: elements={len(set_dims)} max_dev_mm={mx:.4f}')
else: verdict('SIZE_CHECK', None, 'nothing compared')

# --- INSIDE
def region_boxes(set_guid):
    kind = set_guid.rsplit('-', 1)[1]; pars = [p for p, in oc.execute("select parent_guid from element_parts where child_guid=? order by 1", (set_guid,))]
    boxes = [BOX[p] for p in pars if p in BOX]
    if kind in ('MAIN', 'TA', 'TB'):                                           # the drawn column stack = every piece at the same plan position
        c = ((boxes[0][0][0] + boxes[0][1][0]) / 2, (boxes[0][0][1] + boxes[0][1][1]) / 2)
        stack = [BOX[g] for g in sorted(C_IDS) if g in BOX and abs((BOX[g][0][0] + BOX[g][1][0]) / 2 - c[0]) <= 0.002 and abs((BOX[g][0][1] + BOX[g][1][1]) / 2 - c[1]) <= 0.002]
        foot = [b for b in FOOT_BOXES.values() if b[0][0] <= c[0] <= b[1][0] and b[0][1] <= c[1] <= b[1][1]] if kind == 'MAIN' else []
        return stack, foot
    return boxes, []
worst = 1e9; worst_g = None; n_bad = 0; n_bars = 0; n_vert = 0; n_sets = 0
for g in rb_ids:
    stack, foot = region_boxes(g); W = gworld(g); kind = g.rsplit('-', 1)[1]
    cover = COVER_F if kind in ('L', 'S') else COVER_C; allb = stack + foot
    zlo_all = min(b[0][2] for b in allb) if kind != 'MAIN' else min(b[0][2] for b in foot) if foot else min(b[0][2] for b in stack)
    zhi_all = max(b[1][2] for b in allb); n_sets += 1; n_vert += len(W)
    for P in W:
        best = -1e9
        for lo, hi in allb:
            if lo[2] - 1e-6 <= P[2] <= hi[2] + 1e-6: best = max(best, min(P[0] - lo[0], hi[0] - P[0], P[1] - lo[1], hi[1] - P[1]))
        mz = min(P[2] - zlo_all, zhi_all - P[2])
        if kind == 'MAIN': mz = min(mz, zhi_all - P[2])
        m = min(best, mz) if kind != 'MAIN' else min(best, zhi_all - P[2])    # a main bar sits in the footing below the column: only its top end is judged vertically
        if kind == 'MAIN' and P[2] < min(b[0][2] for b in stack) - 1e-6:     # embedded part: lateral margin vs the footing, bottom margin vs the footing's bottom face
            m = min(best, P[2] - zlo_all)
        marg_need = cover
        slack = m - (marg_need - INSIDE_TOL)
        if m < worst: worst = m; worst_g = g
        if slack < 0: n_bad += 1
verdict('INSIDE', None if n_vert == 0 else n_bad == 0,
        f'sets={n_sets} vertices={n_vert} violating_vertices={n_bad} min_margin_mm={worst * 1000:.3f} (worst set {worst_g}) required>=cover-{INSIDE_TOL * 1000:g}mm (footing {COVER_F * 1000:g}, column {COVER_C * 1000:g})')

# --- COUNTS
cnt_bad = []; cnt_n = 0
for g in sorted(F_IDS):
    if g in refused: continue
    L, S = parse_dia_spacing(ST[g]['Sched_Footing_L_Bar']), parse_dia_spacing(ST[g]['Sched_Footing_S_Bar']); lo, hi = BOX[g]; dim = hi - lo
    long_ax = 0 if dim[0] >= dim[1] else 1; short_ax = 1 - long_ax
    for k, tg, ax_dist in (('L', L, short_ax), ('S', S, long_ax)):
        d = tg[0] / 1000.0; want = int(math.floor((dim[ax_dist] - 2 * COVER_F - d) / tg[1] + 1e-9)) + 1; got = len(chunks(f'GEN-RB-{g}-{k}', BAR_NV)); cnt_n += 1
        if got != want: cnt_bad.append((g, k, got, want))
spec_lit = collections.Counter();
for (g, k), (n, nspec) in sorted(f_counts.items()): spec_lit[(n, nspec)] += 1
verdict('COUNTS', None if cnt_n == 0 else not cnt_bad,
        f'footing_sets={cnt_n} count_mismatches={len(cnt_bad)} formula floor((side-2*cover-d)/spacing)+1 (the spec formula without the -d term would give {dict((str(k), v) for k, v in sorted(spec_lit.items()))} as (placed, spec-literal))' + (f' first={cnt_bad[0]}' if cnt_bad else ''))

# --- WELDS
rec_set = set()                              # independent recount, two tests that do not use the clipper: end contact = SAT of the member's END-CAP triangles vs the plate box; through contact = SAT of the whole mesh vs the plate box with no cap hit
for gm in MEM:
    VM = MV[gm]; c0, a = member_axis(VM); T3 = VM.reshape(-1, 3, 3); S3 = (T3 - c0) @ a; slo, shi = S3.min(), S3.max(); mlo, mhi = aabb(VM)
    caps = {'A': T3[np.all(S3 <= slo + END_TOL, 1)], 'B': T3[np.all(S3 >= shi - END_TOL, 1)]}
    for gp in PLT:
        R, cp, lo, hi = PF[gp]; plo, phi = aabb(PV[gp])
        if np.any(mhi < plo - 1e-6) or np.any(mlo > phi + 1e-6): continue
        mid = (lo + hi) / 2; h = (hi - lo) / 2 + END_TOL
        hit = [e for e, T in caps.items() if len(T) and tri_box(((T.reshape(-1, 3) - cp) @ R).reshape(-1, 3, 3), mid, h).any()]
        if hit: rec_set.add((gm, ''.join(hit), gp))
        elif tri_box(((VM - cp) @ R).reshape(-1, 3, 3), mid, (hi - lo) / 2 + 1e-9).any(): rec_set.add((gm, 'T', gp))
built = {(v[0], v[1], v[2]) for v in weld_info.values()}
size_bad = []; len_bad = []
for guid, (gm, end, gp, wsz, Lw) in sorted(weld_info.items()):
    W = gworld(guid); R, cp, lo, hi = PF[gp]; Ln = (W - cp) @ R; leg = Ln[:, 2].max() - hi[2]
    tp = thick_in(META[gp][1], r'(\d+(?:/\d+)?)"\s*Thickness'); tm = thick_in(META[gm][1], r'x(\d+/\d+)"'); thin = min(x for x in (tp, tm) if x is not None)
    if abs(leg * 1000 - weld_min(thin * 1000)) > 0.01: size_bad.append((guid, leg * 1000))
nw = len(weld_info); only_rec = sorted(rec_set - built - skipped_keys); only_built = sorted((built | skipped_keys) - rec_set)
verdict('WELDS', None if (nw == 0 and not rec_set) else (not only_built and not only_rec and not size_bad and nw == len(contacts) - len(weld_skipped) and nw + len(weld_skipped) == len(rec_set)),
        f'welds={nw} contacts_by_clip={len(contacts)} (end {n_endc}, through {n_thr}) contacts_by_independent_sat={len(rec_set)} (end {sum(1 for r in rec_set if r[1] != 'T')}, through {sum(1 for r in rec_set if r[1] == 'T')}) only_in_welds={len(only_built)} only_in_recount={len(only_rec)} size_mismatches={len(size_bad)} table_row_for_6.35mm={weld_min(6.35)}mm skipped={len(weld_skipped)}'
        + (f' first_only_recount={only_rec[0]}' if only_rec else '') + (f' first_only_welds={only_built[0]}' if only_built else ''))

# --- WELD_WINDING: each bead (24 vertices = 8 triangles) must be a closed solid wound consistently outward: every directed edge appears exactly once AND its reverse exactly once, signed volume > 0
wd_bad = []; n_beads = 0; vol_min = None
for guid in sorted(weld_info):
    W = gworld(guid); assert len(W) % 24 == 0
    for bi, B in enumerate(W.reshape(-1, 24, 3)):
        n_beads += 1; T = B.reshape(-1, 3, 3); key = lambda p: tuple(np.round(p, 6)); dirs = collections.Counter()
        for t in T:
            for i in range(3): dirs[(key(t[i]), key(t[(i + 1) % 3]))] += 1
        once = all(v == 1 for v in dirs.values()); paired = all(dirs.get((b_, a_), 0) == 1 for (a_, b_) in dirs)
        vol = float(np.einsum('ij,ij->i', T[:, 0], np.cross(T[:, 1], T[:, 2])).sum() / 6.0); vol_min = vol if vol_min is None else min(vol_min, vol)
        if not (once and paired and vol > 0): wd_bad.append((guid, bi, once, paired, vol))
verdict('WELD_WINDING', None if n_beads == 0 else not wd_bad,
        f'beads={n_beads} not_closed_or_inconsistent={len(wd_bad)} min_signed_volume_mm3={(vol_min or 0) * 1e9:.3f}' + (f' first={wd_bad[0]}' if wd_bad else ''))

# --- COST
src_verts = sum(len(np.frombuffer(b, np.float32)) // 3 for b, in srcdb.execute("select c.vertices from element_instances i join component_geometries c using(geometry_hash)"))
print(f'§SHEDRB_COST added_elements={len(gen_ids)} added_vertices={ADDED_VERTS} source_vertices={src_verts} added_pct={100 * ADDED_VERTS / src_verts:.2f} est_heap_added_MB={ADDED_VERTS * 170 / 1e6:.2f} (0.17 GB per M vertices) of_which_rebar={sum(1 for g in gen_ids if g.startswith("GEN-RB-"))} welds={nw} -> PASS')

# --- BREAK expectation
ins_fail = 'INSIDE' in FAILS
if BREAK: print(f'§SHEDRB_BREAK_CHECK switch=on expected INSIDE=FAIL got INSIDE={"FAIL" if ins_fail else "PASS"} -> {"PASS" if ins_fail else "FAIL"}')
out.close()

# ================================================================ the txt, written FROM the table
with open(TXT, 'w') as f:
    f.write('SHED_rebar.db upgrade change list\n')
    f.write('Every line below is one row of the table upgrade_changes inside the DB (same order). Nothing in the source model was changed.\n')
    f.write('Sources (SHA-256):\n')
    f.write(f'  {sha(SRC)[:16]}  {os.path.basename(SRC)}\n  {sha(DEF)[:16]}  {os.path.basename(DEF)}\n')
    if A.callouts: f.write(f'  {sha(A.callouts)[:16]}  {os.path.basename(A.callouts)} (text of the details sheet; callouts only are listed)\n')
    rows_n = sum(1 for k, v in RULES.items() if isinstance(v, dict)); dflt = sum(1 for v in RULES.values() if isinstance(v, dict) and str(v.get('source', '')).startswith('default'))
    f.write(f'Rule rows: {rows_n}, of which defaults (not stated by the drawings): {dflt}, stated: {rows_n - dflt}\n')
    add = collections.Counter(r[0] for r in CH)
    f.write(f'Totals: ADDED {add["ADDED"]} (reinforcing bars {sum(1 for r in CH if r[0] == "ADDED" and r[2] == "IfcReinforcingBar")}, welds {n_weld}) | NOT_BUILT {add["NOT_BUILT"]} | REFUSED {add["REFUSED"]}\n')
    f.write('Columns: seq | change | element id | IFC class | host GlobalId | rule | detail\n\n')
    con = sqlite3.connect('file:' + OUT + '?mode=ro', uri=True); nl = 0
    for r in con.execute("select seq,change,guid,ifc_class,host_guid,rule,detail from upgrade_changes order by seq"):
        f.write(' | '.join(str(x) for x in r) + '\n'); nl += 1
    nt = con.execute("select count(*) from upgrade_changes").fetchone()[0]
verdict('LOG', None if nl == 0 else nl == nt, f'txt_data_lines={nl} table_rows={nt}')
dsha, tsha = sha(OUT), sha(TXT)
print(f'§SHEDRB_WRITTEN db_sha256={dsha[:16]} txt_sha256={tsha[:16]} db_sha256_full={dsha} txt_sha256_full={tsha}')
if A.expect_db_sha or A.expect_txt_sha:
    ok = (A.expect_db_sha is None or dsha.startswith(A.expect_db_sha)) and (A.expect_txt_sha is None or tsha.startswith(A.expect_txt_sha))
    verdict('DETERMINISM', ok, f'this_db={dsha[:16]} expected_db={(A.expect_db_sha or "-")[:16]} this_txt={tsha[:16]} expected_txt={(A.expect_txt_sha or "-")[:16]}')
else: verdict('DETERMINISM', None, 'single build; pass --expect-db-sha / --expect-txt-sha from an earlier run')
print(f'§SHEDRB_SUMMARY failed_witnesses={",".join(FAILS) if FAILS else "none"} added={len(gen_ids)} not_built={add["NOT_BUILT"]} refused={add["REFUSED"]}')
sys.exit(1 if FAILS and not BREAK else 0)
