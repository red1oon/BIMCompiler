#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — scope: prompts/LOD400_DEFAULT_RULES_SCOPE.md section 9 (BUILD 5 SPEC). Read the log after every run; the exit code is not evidence.
# Implementing LOD400_DEFAULT_RULES_SCOPE.md §9 — Witness: §PIFC_*
# Issue proved/disproved: can the generated parts of sections 6-8 (rebar, gusset connections, welds) leave our DB as an add-on IFC that the
#   receiving team opens on top of its own model: at the right place, every value traceable to its upgrade_changes row, valid, identical on every export?
# Usage: export_parts_ifc.py <db> <out.ifc> --select <guid prefix>[,...] --schema IFC2X3|IFC4 [--frame frame.json] [--check-ifc their.ifc[,more.ifc]]
#        [--tol-mm 1.0] [--frame-axes xyz|xy] [--group-suffixes -PL,-BT,-WD] [--grade-key <name in element_dxf2bim>] [--section-sides 8] [--expect-sha <hex>]
#   PIFC_BREAK=1 in the environment writes every part 10 mm off in x (the FRAME witness must then FAIL).
# Frame JSON (all keys optional; without --frame the DB frame is written as is and the file description says so):
#   {"frame_name": str, "project_name": str, "shift_m": [dx,dy,dz]        (added to DB coordinates to give the frame coordinates),
#    "site": {"location_m": [x,y,z], "ref_direction": [c,s], "latitude": [d,m,s,ms], "longitude": [d,m,s,ms], "elevation_m": z},
#    "storey_elevations_m": {"STOREY NAME": z}}       (a storey name not listed here is an error: no invented elevation)
# Reads the DB (and the --check-ifc files) read-only. Deterministic: no clock, no random; every loop is over sorted keys; GlobalId = UUID5 of our element id.
# Prints §PIFC_* lines; a witness prints INCONCLUSIVE when it judged nothing.
import sqlite3, os, sys, json, math, re, uuid, hashlib, argparse, collections
import numpy as np
import ifcopenshell, ifcopenshell.guid, ifcopenshell.validate, ifcopenshell.geom, ifcopenshell.util.placement as uplace

ap = argparse.ArgumentParser()
ap.add_argument('db'); ap.add_argument('out')
ap.add_argument('--select', required=True); ap.add_argument('--schema', required=True, choices=['IFC2X3', 'IFC4'])
ap.add_argument('--frame', default=None); ap.add_argument('--check-ifc', default=None)
ap.add_argument('--tol-mm', type=float, default=1.0); ap.add_argument('--frame-axes', default='xyz', choices=['xyz', 'xy'])
ap.add_argument('--group-suffixes', default=''); ap.add_argument('--grade-key', default=None)
ap.add_argument('--section-sides', type=int, default=8); ap.add_argument('--expect-sha', default=None)
ap.add_argument('--ligature-words', default='stirrup,tie,ligature')
ap.add_argument('--also-host-regex', default=r'(?:support|gusset plate)\s+([0-9A-Za-z_$]{22})\b')
A = ap.parse_args()
OUT = A.out; SCHEMA = A.schema; PREFIXES = [p for p in A.select.split(',') if p]
BREAK = os.environ.get('PIFC_BREAK') == '1'
AX = [0, 1, 2] if A.frame_axes == 'xyz' else [0, 1]
TSTAMP = '2026-11-18T00:00:00'; TS = 1795046400                      # fixed (2026-11-18), so two exports are byte-identical
NS = uuid.UUID('6f6b7a10-2b4e-4b4e-9b1e-1c0de0bb1d17')              # fixed namespace: same element id -> same GlobalId every run (same as ifc_delta)
gid = lambda key: ifcopenshell.guid.compress(uuid.uuid5(NS, key).hex)
verdicts = []
def verdict(tag, ok, inconclusive=False):
    v = 'INCONCLUSIVE' if inconclusive else ('PASS' if ok else 'FAIL'); verdicts.append((tag, v)); return v

DB = sqlite3.connect('file:' + A.db + '?mode=ro', uri=True)
FR = json.load(open(A.frame)) if A.frame else {}
SHIFT = np.array(FR.get('shift_m', [0., 0., 0.]), float) + (np.array([0.01, 0., 0.]) if BREAK else 0.)
SHIFT_TRUE = np.array(FR.get('shift_m', [0., 0., 0.]), float)
SITE = FR.get('site')
if SITE:
    c_, s_ = SITE['ref_direction']; n_ = math.hypot(c_, s_); c_, s_ = c_ / n_, s_ / n_
    RS = np.array([[c_, -s_, 0.], [s_, c_, 0.], [0., 0., 1.]]); TSITE = np.array(SITE['location_m'], float)
else:
    RS = np.eye(3); TSITE = np.zeros(3)
ELEV = dict(FR.get('storey_elevations_m', {}))
if not ELEV:                                                          # no frame elevations: the DB's own storey table, if it has one
    try: ELEV = {n: float(e) for n, e in DB.execute("select name, elevation_attr_m from storey_elevation")}
    except sqlite3.Error: ELEV = {}

# ------------------------------------------------------------------ select the generated elements and their stated rows
where = ' or '.join(f"substr(m.guid,1,{len(p)})=?" for p in PREFIXES)
ROWS = DB.execute(f"""select m.guid, m.ifc_class, m.element_name, m.storey, u.host_guid, u.rule, u.detail, u.change, c.vertices, c.faces,
    t.center_x, t.center_y, t.center_z, t.rotation_z
    from elements_meta m join element_instances i on i.guid=m.guid join component_geometries c on c.geometry_hash=i.geometry_hash
    join element_transforms t on t.guid=m.guid left join upgrade_changes u on u.guid=m.guid and u.change='ADDED'
    where {where} order by m.guid, u.seq""", PREFIXES).fetchall()
ELS = collections.OrderedDict()
for r in ROWS:
    if r[0] in ELS: ELS[r[0]]['extra_rows'] += 1; continue
    ELS[r[0]] = dict(guid=r[0], cls=r[1], name=r[2] or '', storey=r[3], host=r[4], rule=r[5], detail=r[6], V=np.frombuffer(r[8], np.float32).reshape(-1, 3),
                     F=np.frombuffer(r[9], np.uint32).reshape(-1, 3), t=np.array(r[10:13], float), rz=r[13] or 0.0, extra_rows=0)
NEXP = len(ELS); CLS = collections.Counter(e['cls'] for e in ELS.values())
print(f'§PIFC_SELECT db={os.path.basename(A.db)} prefixes={PREFIXES} schema={SCHEMA} elements={NEXP} classes={dict(sorted(CLS.items()))} frame={"given" if A.frame else "DB frame as is"}'
      + (' PIFC_BREAK=on' if BREAK else ''))
if not NEXP:
    print('§PIFC_ROUNDTRIP -> INCONCLUSIVE (0 elements selected)'); sys.exit(1)
untraced = [g for g, e in ELS.items() if e['detail'] is None]
multi = sum(1 for e in ELS.values() if e['extra_rows'])
print(f'§PIFC_TRACE elements={NEXP} with_ADDED_row={NEXP - len(untraced)} untraced={len(untraced)} elements_with_more_than_one_ADDED_row={multi} -> {verdict("TRACE", not untraced and not multi)}')
if untraced: print('   §PIFC_TRACE_UNTRACED first=', untraced[:3])

# ------------------------------------------------------------------ stated values parsed from the upgrade row text
DIA_RE = re.compile(r'T(\d+)|(\d+(?:\.\d+)?)\s*mm\s*dia|(\d+(?:\.\d+)?)\s*dia')
def stated_dias(detail):
    """every diameter (mm) in the stated string: 'N T d + M T d2' gives two; None if unparsable. Mixed elements hold bars of more than one diameter."""
    m = re.search(r'stated "(.*?)" \(', detail or '')
    if not m: return []
    return sorted({float(next(g for g in h.groups() if g)) for h in DIA_RE.finditer(m.group(1))})
def stated_counts(detail):                                            # {diameter: n} when the stated string reads 'nTd + mTd2' and every bar was placed
    m = re.search(r'stated "(.*?)" \(', detail or ''); pl = re.search(r'(\d+) of (\d+) bars placed', detail or '')
    if not m or not pl or pl.group(1) != pl.group(2): return None
    c = collections.Counter()
    for n_, d_ in re.findall(r'(\d+)T(\d+)', m.group(1)): c[float(d_)] += int(n_)
    return dict(c) if sum(c.values()) == int(pl.group(1)) else None
def stated_len(detail):                                               # metres; (min, max) over the bars of the element, or None
    m = re.search(r'length (\d+(?:\.\d+)?)\.\.(\d+(?:\.\d+)?) mm', detail or '')
    if m: return float(m.group(1)) / 1000, float(m.group(2)) / 1000
    m = re.search(r'each (\d+(?:\.\d+)?) mm', detail or '')
    return (float(m.group(1)) / 1000,) * 2 if m else None
LIG = [w for w in A.ligature_words.split(',') if w]
def short_name(n): return re.split(r' \[stated| \(rules', n)[0]
GRADE = {}
if A.grade_key:
    for host in {e['host'] for e in ELS.values() if e['host']}:
        r = DB.execute("select value from element_dxf2bim where guid=? and name=?", (host, A.grade_key)).fetchone()
        s = DB.execute("select value from element_dxf2bim where guid=? and name=?", (host, 'NoteSource_' + A.grade_key.replace('Note_', ''))).fetchone()
        if r: GRADE[host] = (r[0], s[0] if s else None)

# ------------------------------------------------------------------ mesh -> oriented closed components (world frame, then storey-local)
def world(e):
    V = e['V'].astype(float)
    if e['rz']:
        M = np.array([[math.cos(e['rz']), -math.sin(e['rz']), 0], [math.sin(e['rz']), math.cos(e['rz']), 0], [0, 0, 1]]); V = V @ M.T
    return V + e['t'] + SHIFT
MESHSTAT = collections.Counter()
def components(e):
    """triangles joined by a shared edge -> closed components; each is wound outward (flipped when its signed volume is negative and it is consistently wound)."""
    V, F = e['V'], e['F']; _, idv = np.unique(V, axis=0, return_inverse=True); idv = idv.reshape(-1); T = idv[F]; n = len(T); M = int(idv.max()) + 2
    ed = np.concatenate([T[:, [0, 1]], T[:, [1, 2]], T[:, [2, 0]]]); tri = np.tile(np.arange(n), 3)
    key = np.minimum(ed[:, 0], ed[:, 1]).astype(np.int64) * M + np.maximum(ed[:, 0], ed[:, 1]); o = np.argsort(key, kind='stable'); ks, ts = key[o], tri[o]
    parent = list(range(n))
    def find(a):
        while parent[a] != a: parent[a] = parent[parent[a]]; a = parent[a]
        return a
    for k in np.nonzero(ks[1:] == ks[:-1])[0]:
        ra, rb = find(int(ts[k])), find(int(ts[k + 1]))
        if ra != rb: parent[ra] = rb
    lab = np.array([find(i) for i in range(n)]); roots = sorted(set(lab.tolist()), key=lambda r: int(np.nonzero(lab == r)[0][0]))
    dk = ed[:, 0].astype(np.int64) * M + ed[:, 1]; rk = ed[:, 1].astype(np.int64) * M + ed[:, 0]; u, inv, cnt = np.unique(dk, return_inverse=True, return_counts=True)
    pos = np.minimum(np.searchsorted(u, rk), len(u) - 1); rev = np.where(u[pos] == rk, cnt[pos], 0); bad_t = set(lab[tri[(cnt[inv] != 1) | (rev != 1)]].tolist())
    uk, uc = np.unique(key, return_counts=True); ui = np.searchsorted(uk, key); two_sided = {int(r) for r in roots} - set(lab[tri[uc[ui] != 2]].tolist())
    P = world(e); Tw = P[F]; c0 = Tw.reshape(-1, 3).mean(0); out = []
    for r in roots:
        idx = np.nonzero(lab == r)[0]; Tc = Tw[idx] - c0; vol = float(np.einsum('ij,ij->i', Tc[:, 0], np.cross(Tc[:, 1], Tc[:, 2])).sum() / 6)
        closed = r not in bad_t
        if closed and vol < 0: Tw[idx] = Tw[idx][:, [0, 2, 1]]; vol = -vol; MESHSTAT['flipped'] += 1
        MESHSTAT['closed' if closed else 'open'] += 1; MESHSTAT['open_but_every_edge_shared_by_2_triangles(winding inconsistent)'] += (not closed) and (r in two_sided); out.append((Tw[idx], vol, closed))
    MESHSTAT['degenerate_tris'] += int((np.linalg.norm(np.cross(Tw[:, 1] - Tw[:, 0], Tw[:, 2] - Tw[:, 0]), axis=1) < 1e-12).sum())
    return out, c0

# ------------------------------------------------------------------ IFC skeleton (units metre; site and storeys from the frame, as the delta IFC)
f = ifcopenshell.file(schema=SCHEMA)
f.header.file_name.name = os.path.basename(OUT); f.header.file_name.time_stamp = TSTAMP
frame_txt = ('frame: ' + FR.get('frame_name', 'given frame') + f' (shift_m={SHIFT_TRUE.tolist()})') if A.frame else 'frame: DB frame written as is (no frame file given)'
f.header.file_description.description = ('ViewDefinition [CoordinationView_V2.0]' if SCHEMA == 'IFC2X3' else 'ViewDefinition [ReferenceView_V1.2]',
                                         'LOD 400 add-on: generated parts only; ' + frame_txt)
person = f.create_entity('IfcPerson', FamilyName='BIMCompiler'); org = f.create_entity('IfcOrganization', Name='BIMCompiler')
po = f.create_entity('IfcPersonAndOrganization', ThePerson=person, TheOrganization=org)
app = f.create_entity('IfcApplication', ApplicationDeveloper=org, Version='2026-11-18', ApplicationFullName='BIMCompiler LOD 400 parts export', ApplicationIdentifier='BIMC')
oh = f.create_entity('IfcOwnerHistory', OwningUser=po, OwningApplication=app, ChangeAction='ADDED', CreationDate=TS)
O = f.create_entity('IfcCartesianPoint', Coordinates=(0., 0., 0.)); Zd = f.create_entity('IfcDirection', DirectionRatios=(0., 0., 1.)); Xd = f.create_entity('IfcDirection', DirectionRatios=(1., 0., 0.))
A0 = f.create_entity('IfcAxis2Placement3D', Location=O, Axis=Zd, RefDirection=Xd)
ctx = f.create_entity('IfcGeometricRepresentationContext', ContextType='Model', CoordinateSpaceDimension=3, Precision=1e-5, WorldCoordinateSystem=A0)
body = f.create_entity('IfcGeometricRepresentationSubContext', ContextIdentifier='Body', ContextType='Model', ParentContext=ctx, TargetView='MODEL_VIEW')
units = f.create_entity('IfcUnitAssignment', Units=[f.create_entity('IfcSIUnit', UnitType=u, Name=n) for u, n in (('LENGTHUNIT', 'METRE'), ('AREAUNIT', 'SQUARE_METRE'), ('VOLUMEUNIT', 'CUBIC_METRE'), ('PLANEANGLEUNIT', 'RADIAN'))])
proj = f.create_entity('IfcProject', GlobalId=gid('project'), OwnerHistory=oh, Name=FR.get('project_name', 'LOD 400 add-on'), RepresentationContexts=[ctx], UnitsInContext=units)
site_ax = f.create_entity('IfcAxis2Placement3D', Location=f.create_entity('IfcCartesianPoint', Coordinates=tuple(float(x) for x in TSITE)), Axis=f.create_entity('IfcDirection', DirectionRatios=(0., 0., 1.)),
                          RefDirection=f.create_entity('IfcDirection', DirectionRatios=(float(RS[0, 0]), float(RS[1, 0]), 0.)))
site_lp = f.create_entity('IfcLocalPlacement', RelativePlacement=site_ax)
skw = dict(GlobalId=gid('site'), OwnerHistory=oh, Name='Site', ObjectPlacement=site_lp, CompositionType='ELEMENT')
if SITE and SITE.get('latitude'): skw.update(RefLatitude=tuple(SITE['latitude']), RefLongitude=tuple(SITE['longitude']), RefElevation=float(SITE.get('elevation_m', 0.0)))
site = f.create_entity('IfcSite', **skw)
bld = f.create_entity('IfcBuilding', GlobalId=gid('building'), OwnerHistory=oh, Name='LOD 400 add-on', ObjectPlacement=f.create_entity('IfcLocalPlacement', PlacementRelTo=site_lp, RelativePlacement=A0), CompositionType='ELEMENT')
f.create_entity('IfcRelAggregates', GlobalId=gid('agg-ps'), OwnerHistory=oh, RelatingObject=proj, RelatedObjects=[site])
f.create_entity('IfcRelAggregates', GlobalId=gid('agg-sb'), OwnerHistory=oh, RelatingObject=site, RelatedObjects=[bld])
STOREYS = {}; CONTAINED = collections.defaultdict(list)
def storey(name):
    if name not in STOREYS:
        z = float(ELEV[name])                                          # KeyError = a storey name the frame does not give; no invented elevation
        STOREYS[name] = f.create_entity('IfcBuildingStorey', GlobalId=gid('storey:' + name), OwnerHistory=oh, Name=name, CompositionType='ELEMENT', Elevation=z,
            ObjectPlacement=f.create_entity('IfcLocalPlacement', PlacementRelTo=bld.ObjectPlacement, RelativePlacement=f.create_entity('IfcAxis2Placement3D', Location=f.create_entity('IfcCartesianPoint', Coordinates=(0., 0., z)))))
    return STOREYS[name]
MATS = {}
def material(name):
    if name not in MATS: MATS[name] = (f.create_entity('IfcMaterial', Name=name), [])
    return MATS[name]
def pset(obj, name, props, key):
    vals = []
    for k, v in props.items():
        if v is None: continue
        if isinstance(v, (int, float)) and not isinstance(v, bool): nv = f.create_entity('IfcReal', float(v))
        elif k in ('Detail', 'Rule'): nv = f.create_entity('IfcText', str(v))
        else: nv = f.create_entity('IfcLabel', str(v))
        vals.append(f.create_entity('IfcPropertySingleValue', Name=k, NominalValue=nv))
    ps = f.create_entity('IfcPropertySet', GlobalId=gid('pset:' + key + ':' + name), OwnerHistory=oh, Name=name, HasProperties=vals)
    f.create_entity('IfcRelDefinesByProperties', GlobalId=gid('rel:' + key + ':' + name), OwnerHistory=oh, RelatedObjects=[obj], RelatingPropertyDefinition=ps)

def geometry(e, comps, c0):
    """IfcFacetedBrep per closed component (IFC2X3) / one IfcTriangulatedFaceSet (IFC4), in the storey's local frame (their site rotation)."""
    z = float(ELEV[e['storey']])
    loc = lambda P: (P - c0) @ RS
    if SCHEMA == 'IFC2X3':
        items = []
        for Tc, vol, closed in comps:
            key = {}
            def pt(p):
                k = tuple(np.round(loc(p), 6))
                if k not in key: key[k] = f.create_entity('IfcCartesianPoint', Coordinates=tuple(float(x) for x in k))
                return key[k]
            faces = [f.create_entity('IfcFace', Bounds=[f.create_entity('IfcFaceOuterBound', Bound=f.create_entity('IfcPolyLoop', Polygon=[pt(t[0]), pt(t[1]), pt(t[2])]), Orientation=True)]) for t in Tc]
            items.append(f.create_entity('IfcFacetedBrep', Outer=f.create_entity('IfcClosedShell', CfsFaces=faces)))
        rep = f.create_entity('IfcShapeRepresentation', ContextOfItems=body, RepresentationIdentifier='Body', RepresentationType='Brep', Items=items)
    else:
        idx = {}; coords = []; tris = []
        for Tc, vol, closed in comps:
            for t in Tc:
                row = []
                for p in t:
                    k = tuple(float(x) for x in np.round(loc(p), 6))
                    if k not in idx: idx[k] = len(coords) + 1; coords.append(k)
                    row.append(idx[k])
                tris.append(tuple(row))
        fs = f.create_entity('IfcTriangulatedFaceSet', Coordinates=f.create_entity('IfcCartesianPointList3D', CoordList=coords), Closed=all(c[2] for c in comps), CoordIndex=tris)
        rep = f.create_entity('IfcShapeRepresentation', ContextOfItems=body, RepresentationIdentifier='Body', RepresentationType='Tessellation', Items=[fs])
    cl = (c0 - TSITE) @ RS - np.array([0., 0., z])
    lp = f.create_entity('IfcLocalPlacement', PlacementRelTo=storey(e['storey']).ObjectPlacement, RelativePlacement=f.create_entity('IfcAxis2Placement3D', Location=f.create_entity('IfcCartesianPoint', Coordinates=tuple(float(x) for x in cl))))
    return f.create_entity('IfcProductDefinitionShape', Representations=[rep]), lp

SUF = [s for s in A.group_suffixes.split(',') if s]
JOINT_CLS = ('IfcPlate', 'IfcMechanicalFastener', 'IfcFastener')
MIX = []; GROUPS = collections.OrderedDict(); PARTS = collections.OrderedDict(); EXPECT = collections.Counter(); SPLIT_EXTRA = collections.Counter(); BARLEN_CHECK = []; DIA_MEAS = []
sec = lambda dd: A.section_sides / 2 * (dd / 2000.0) ** 2 * math.sin(2 * math.pi / A.section_sides)
for g, e in ELS.items():
    comps, c0 = components(e); sn = short_name(e['name']); cls = e['cls']; PARTS[g] = []
    status = 'configuration only, capacity not checked' if cls in JOINT_CLS else 'ADDED (generated by rule, not authored)'
    groups = collections.OrderedDict([(None, list(range(len(comps))))]); dias = []
    if cls == 'IfcReinforcingBar':
        dias = stated_dias(e['detail'])
        if not dias: raise SystemExit(f'§PIFC_VALUES no stated diameter parsed for {g}')
        asg = []
        for Tc, vol, closed in comps:                                  # measured bar thickness: smallest principal extent of the component (an n-gon section reads between cos(pi/n) d and d)
            P = Tc.reshape(-1, 3); Q = P - P.mean(0); w = np.linalg.svd(Q, full_matrices=False)[2][-1]; pr = Q @ w; th = float((pr.max() - pr.min()) * 1000)
            dd = min(dias, key=lambda x: abs(th / x - (1 + math.cos(math.pi / A.section_sides)) / 2))   # mixed element: the stated diameter this bar's thickness fits best
            asg.append(dd); DIA_MEAS.append((g, th / dd))
        groups = collections.OrderedDict((dd, [i for i, a_ in enumerate(asg) if a_ == dd]) for dd in sorted(set(asg)))
        if len(dias) > 1: MIX.append((g, dias, {k: len(v) for k, v in groups.items()}, stated_counts(e['detail'])))
        allL = [comps[i][1] / sec(asg[i]) for i in range(len(comps)) if comps[i][2]]; sl = stated_len(e['detail'])
        if sl and allL: BARLEN_CHECK.append(max(abs(min(allL) - sl[0]), abs(max(allL) - sl[1])) * 1000)
    for key, idxs in groups.items():
        sub = [comps[i] for i in idxs]; eid = g if len(groups) == 1 else f'{g}#T{key:g}'
        if key != next(iter(groups)): SPLIT_EXTRA[cls] += 1               # parts beyond the first one of a mixed-diameter element
        shape, lp = geometry(e, sub, c0)
        kw = dict(GlobalId=gid(eid), OwnerHistory=oh, Name=sn + (f' (T{key:g} bars)' if len(groups) > 1 else ''), Description=e['name'], ObjectPlacement=lp, Representation=shape, Tag=g)
        extra = {}
        if cls == 'IfcReinforcingBar':
            d = key; Ls = [v / sec(d) for _, v, closed in sub if closed]; sl = stated_len(e['detail'])
            blen = (sl[1] if sl and sl[0] == sl[1] else None) or (float(np.mean(Ls)) if Ls else None); bsrc = 'stated in the upgrade row' if (sl and sl[0] == sl[1]) else 'measured: mesh volume / section area'
            lig = any(w in e['name'].lower() for w in LIG); gr = GRADE.get(e['host'])
            kw.update(BarLength=blen, NominalDiameter=d / 1000.0, CrossSectionArea=math.pi * (d / 1000.0) ** 2 / 4)
            if SCHEMA == 'IFC2X3': kw.update(BarRole='LIGATURE' if lig else 'MAIN')
            else: kw.update(PredefinedType='LIGATURE' if lig else 'MAIN', SteelGrade=f'fy {gr[0]} MPa (stated)' if gr else None)
            extra = dict(DiametersStatedOnElement_mm='; '.join(f'{x:g}' for x in dias) if len(dias) > 1 else None, BarRole='LIGATURE' if lig else 'MAIN', BarCount=len(sub), BarLengthSource=bsrc,
                         BarLengthMin_mm=round(min(Ls) * 1000, 1) if Ls else None, BarLengthMax_mm=round(max(Ls) * 1000, 1) if Ls else None, SteelGradeStated=(f'fy {gr[0]} MPa ({gr[1]})' if gr else None))
            mname = f'Reinforcing steel, fy {gr[0]} MPa (stated)' if gr else 'Reinforcing steel (grade not stated)'
        else:
            mname = 'Steel (grade not stated)'
            m_ = re.search(r'\bM(\d+)\b', e['name'])
            if cls == 'IfcMechanicalFastener':
                if m_: kw.update(NominalDiameter=int(m_.group(1)) / 1000.0)
                if SCHEMA == 'IFC4': kw.update(PredefinedType='BOLT')
            if cls == 'IfcFastener' and SCHEMA == 'IFC4': kw.update(PredefinedType='WELD')
            if cls == 'IfcPlate' and SCHEMA == 'IFC4': kw.update(PredefinedType='NOTDEFINED')
        ent = f.create_entity(cls, **kw); PARTS[g].append((eid, key)); material(mname)[1].append(ent); EXPECT[cls] += 1
        pset(ent, 'BIMC_Upgrade', dict(HostGlobalId=e['host'], Rule=e['rule'], Detail=e['detail'], Status=status, GeneratedElementId=g, **extra), eid)
        base = next((g[:-len(s_)] for s_ in SUF if g.endswith(s_)), None)
        if base and cls in JOINT_CLS: GROUPS.setdefault((base, e['storey']), []).append(ent)
        else: CONTAINED[e['storey']].append(ent)
for (base, st), parts in GROUPS.items():
    asm = f.create_entity('IfcElementAssembly', GlobalId=gid(base), OwnerHistory=oh, Name=f'Connection assembly {base}', ObjectType='Steel connection (rule-based)',
                          ObjectPlacement=f.create_entity('IfcLocalPlacement', PlacementRelTo=storey(st).ObjectPlacement, RelativePlacement=f.create_entity('IfcAxis2Placement3D', Location=parts[0].ObjectPlacement.RelativePlacement.Location)),
                          AssemblyPlace='NOTDEFINED', PredefinedType='NOTDEFINED')
    f.create_entity('IfcRelAggregates', GlobalId=gid('agg:' + base), OwnerHistory=oh, RelatingObject=asm, RelatedObjects=parts)
    CONTAINED[st].append(asm); EXPECT['IfcElementAssembly'] += 1
for name in sorted(MATS):
    m, els = MATS[name]
    if els: f.create_entity('IfcRelAssociatesMaterial', GlobalId=gid('mat:' + name), OwnerHistory=oh, RelatedObjects=els, RelatingMaterial=m)
for name in sorted(CONTAINED): f.create_entity('IfcRelContainedInSpatialStructure', GlobalId=gid('cont:' + name), OwnerHistory=oh, RelatedElements=CONTAINED[name], RelatingStructure=storey(name))
f.create_entity('IfcRelAggregates', GlobalId=gid('agg-bs'), OwnerHistory=oh, RelatingObject=bld, RelatedObjects=[STOREYS[k] for k in sorted(STOREYS)])
f.write(OUT)
data = open(OUT, 'rb').read(); SHA = hashlib.sha256(data).hexdigest()
print(f'§PIFC_MESH components_closed={MESHSTAT["closed"]} open={MESHSTAT["open"]} of_which_every_edge_has_2_triangles_but_winding_inconsistent={MESHSTAT["open_but_every_edge_shared_by_2_triangles(winding inconsistent)"]} wound_inward_flipped={MESHSTAT["flipped"]} degenerate_triangles={MESHSTAT["degenerate_tris"]} -> {verdict("MESH", MESHSTAT["open"] == 0 and MESHSTAT["degenerate_tris"] == 0, not MESHSTAT["closed"])}')
print(f'§PIFC_WRITTEN {OUT} bytes={len(data)} sha256={SHA} ' + ' '.join(f'{k}={v}' for k, v in sorted(EXPECT.items())) + f' storeys={len(STOREYS)} schema={SCHEMA}')
if A.expect_sha: print(f'§PIFC_DETERMINISM this={SHA[:16]} expected={A.expect_sha[:16]} -> {verdict("DETERMINISM", SHA.startswith(A.expect_sha[:16]) or SHA == A.expect_sha)}')

# ------------------------------------------------------------------ witnesses on the file as written
g2 = ifcopenshell.open(OUT)
cnt = {k: len(g2.by_type(k, include_subtypes=False)) for k in EXPECT}; guids = [e.GlobalId for e in g2.by_type('IfcRoot')]
log = ifcopenshell.validate.json_logger(); ifcopenshell.validate.validate(g2, log)
nsplit = sum(SPLIT_EXTRA.values()); ok_db = all(EXPECT[k] == CLS[k] + SPLIT_EXTRA[k] for k in CLS)
ok_rt = ok_db and all(cnt[k] == EXPECT[k] for k in EXPECT) and len(guids) == len(set(guids)) and len(log.statements) == 0 and g2.schema == SCHEMA
print(f'§PIFC_ROUNDTRIP counts={cnt} db_elements={dict(CLS)} extra_parts_from_splitting_mixed_diameter_elements={dict(SPLIT_EXTRA)} expected_in_file={dict(EXPECT)} globalids={len(guids)} unique={len(set(guids))} validate_errors={len(log.statements)} schema={g2.schema} -> {verdict("ROUNDTRIP", ok_rt, not sum(EXPECT.values()))}')
for s_ in log.statements[:5]: print('   §PIFC_SCHEMA_ERROR', str(s_)[:240])
# solids as read back: closed, consistently wound, positive volume
bad = collections.Counter(); nsol = 0
def edges_ok(tris):
    E = collections.Counter(); vol = 0.0
    for P in tris:
        for k in range(3): E[(P[k], P[(k + 1) % 3])] += 1
        a, b, c = (np.array(x) for x in P); vol += a @ np.cross(b, c) / 6
    return all(E[(q, p)] == 1 for (p, q) in E) and all(v == 1 for v in E.values()), vol
if SCHEMA == 'IFC2X3':
    for b in g2.by_type('IfcFacetedBrep'):
        nsol += 1; ok, vol = edges_ok([[tuple(p.Coordinates) for p in fc.Bounds[0].Bound.Polygon] for fc in b.Outer.CfsFaces])
        if not ok: bad['not closed or not consistently wound'] += 1
        elif vol <= 0: bad['inside out (volume <= 0)'] += 1
else:
    for fs in g2.by_type('IfcTriangulatedFaceSet'):
        nsol += 1; pts = [tuple(p) for p in fs.Coordinates.CoordList]; ok, vol = edges_ok([[pts[i - 1] for i in t] for t in fs.CoordIndex])
        if not ok: bad['not closed or not consistently wound'] += 1
        elif vol <= 0: bad['inside out (volume <= 0)'] += 1
print(f'§PIFC_SOLIDS {"facesets" if SCHEMA == "IFC4" else "breps"}={nsol} invalid={sum(bad.values())} {dict(bad)} -> {verdict("SOLIDS", not bad, not nsol)}')
# values: NominalDiameter in the file = the set's stated diameter; BarLength vs the stated length; measured bar thickness
vbad = []; nv = 0; nmix = sum(1 for m_ in MIX)
for g, e in ELS.items():
    for eid, key in PARTS[g]:
        ent = g2.by_guid(gid(eid))
        if e['cls'] == 'IfcReinforcingBar':
            nv += 1
            if abs(ent.NominalDiameter * 1000 - key) > 1e-9 or key not in stated_dias(e['detail']): vbad.append((eid, ent.NominalDiameter * 1000, stated_dias(e['detail'])))
        if e['cls'] == 'IfcMechanicalFastener':
            m_ = re.search(r'\bM(\d+)\b', e['name'])
            if m_: nv += 1; vbad += [] if abs(ent.NominalDiameter * 1000 - int(m_.group(1))) < 1e-9 else [(eid, ent.NominalDiameter * 1000, int(m_.group(1)))]
print(f'§PIFC_VALUES parts_checked={nv} mixed_diameter_elements_split={nmix} mismatches={len(vbad)} (NominalDiameter read back from the file vs a diameter stated in the element upgrade row) -> {verdict("VALUES", not vbad, not nv)}')
for v in vbad[:3]: print('   §PIFC_VALUES_BAD', v)
if MIX:
    mm = [m_ for m_ in MIX if m_[3] is not None]; okc = sum(1 for m_ in mm if {k: v for k, v in m_[3].items()} == m_[2])
    print(f'§PIFC_VALUES_MIX mixed_elements={len(MIX)} with_all_bars_placed={len(mm)} bars_per_diameter_from_mesh_equal_stated_counts={okc} -> {verdict("VALUES_MIX", okc == len(mm), not mm)}')
    for m_ in [m_ for m_ in mm if m_[3] != m_[2]][:3]: print('   §PIFC_VALUES_MIX_BAD', m_)
if DIA_MEAS:
    rr = np.array([x[1] for x in DIA_MEAS]); lo = math.cos(math.pi / A.section_sides) - 0.01
    print(f'§PIFC_VALUES_MESH bars_measured={len(rr)} mesh_thickness_over_stated: min={rr.min():.4f} max={rr.max():.4f} allowed=[{lo:.4f}, 1.0100] outside={int(((rr < lo) | (rr > 1.01)).sum())} -> {verdict("VALUES_MESH", not ((rr < lo) | (rr > 1.01)).any())}')
if BARLEN_CHECK:
    print(f'§PIFC_BARLEN elements_with_stated_length={len(BARLEN_CHECK)} measured_vs_stated_mm max={max(BARLEN_CHECK):.3f} median={float(np.median(BARLEN_CHECK)):.3f} (mesh volume / {A.section_sides}-gon area vs the length in the upgrade row)')
# placement: site + storeys as read back through the library's own placement composition
if SITE:
    Mo = uplace.get_local_placement(g2.by_type('IfcSite')[0].ObjectPlacement); Mx = np.eye(4); Mx[:3, :3] = RS; Mx[:3, 3] = TSITE
    dsite = float(np.abs(Mo - Mx).max()); dst = max(abs(s.Elevation - ELEV[s.Name]) for s in g2.by_type('IfcBuildingStorey'))
    print(f'§PIFC_SITE site_matrix_max_dev={dsite:.2e} storeys={len(g2.by_type("IfcBuildingStorey"))} elevation_max_dev_m={dst:.2e} -> {verdict("SITE", dsite < 1e-6 and dst < 1e-6)}')
# frame: (1) file vs the DB world bbox; (2) the receiving model's host vs ours (proves the frame); (3) every part inside its host(s)
def file_bbox_g(g):
    bb_ = [file_bbox(g2.by_guid(gid(eid))) for eid, _ in PARTS[g]]; return np.min([b[0] for b in bb_], 0), np.max([b[1] for b in bb_], 0)
def file_bbox(ent):
    M = uplace.get_local_placement(ent.ObjectPlacement); pts = []
    for it in ent.Representation.Representations[0].Items:
        if it.is_a('IfcFacetedBrep'): pts += [p.Coordinates for fc in it.Outer.CfsFaces for p in fc.Bounds[0].Bound.Polygon]
        else: pts += [tuple(p) for p in it.Coordinates.CoordList]
    P = np.array(pts, float) @ M[:3, :3].T + M[:3, 3]; return P.min(0), P.max(0)
dfile = []
for g, e in ELS.items():
    lo, hi = file_bbox_g(g); W = world(e) - (SHIFT - SHIFT_TRUE if BREAK else 0)       # BREAK: the DB truth stays unshifted, the file is 10 mm off
    dfile.append(max(np.abs(lo - W.min(0)).max(), np.abs(hi - W.max(0)).max()) * 1000)
print(f'§PIFC_FRAME_FILE parts={len(dfile)} file_vs_db_bbox_mm max={max(dfile):.4f} over_0.01mm={sum(1 for d in dfile if d > 0.01)} -> {verdict("FRAME_FILE", max(dfile) <= 0.01)}')
if A.check_ifc:
    ths = [ifcopenshell.open(p) for p in A.check_ifc.split(',') if p]
    st = ifcopenshell.geom.settings(); st.set('use-world-coords', True); HB = {}; DBW = {}
    def their(guid):
        if guid in HB: return HB[guid]
        for t in ths:
            try: ent = t.by_guid(guid)
            except RuntimeError: continue
            sh = ifcopenshell.geom.create_shape(st, ent); v = np.array(sh.geometry.verts).reshape(-1, 3); HB[guid] = (v.min(0), v.max(0), ent.is_a()); return HB[guid]
        HB[guid] = None; return None
    def our_host(guid):
        r = DB.execute("select c.vertices, t.center_x, t.center_y, t.center_z, t.rotation_z, t.rotation_x, t.rotation_y from element_instances i join component_geometries c using(geometry_hash) join element_transforms t on t.guid=i.guid where i.guid=?", (guid,)).fetchone()
        if not r: return None
        V = np.frombuffer(r[0], np.float32).reshape(-1, 3).astype(float)
        if r[4]: M = np.array([[math.cos(r[4]), -math.sin(r[4]), 0], [math.sin(r[4]), math.cos(r[4]), 0], [0, 0, 1]]); V = V @ M.T
        V = V + np.array(r[1:4]) + SHIFT_TRUE; return V.min(0), V.max(0), (r[5] or 0) != 0 or (r[6] or 0) != 0
    hostsets = {}; also = re.compile(A.also_host_regex)
    for g, e in ELS.items(): hostsets[g] = sorted({h for h in [e['host']] + also.findall(e['detail'] or '') if h})
    allh = sorted({h for hs in hostsets.values() for h in hs}); dev_all = []; dev_ax = []; byc = collections.defaultdict(list); nmiss = 0; nrot = 0; nodb = 0
    for h in allh:
        T = their(h); Oh = our_host(h)
        if T is None: nmiss += 1; continue
        if Oh is None: nodb += 1; continue
        nrot += Oh[2]; d = np.maximum(np.abs(T[0] - Oh[0]), np.abs(T[1] - Oh[1])) * 1000; dev_all.append(float(d.max())); dev_ax.append(float(d[AX].max())); byc[T[2]].append(float(d[AX].max()))
    print(f'§PIFC_FRAME_HOSTS hosts_named={len(allh)} found_in_their_ifc={len(allh) - nmiss} missing_in_their_ifc={nmiss} not_in_our_db={nodb} compared={len(dev_all)} their_host_vs_ours_bbox_mm max_{A.frame_axes}={max(dev_ax, default=0):.3f} '
          f'max_all_axes={max(dev_all, default=0):.3f} over_tol={sum(1 for d in dev_ax if d > A.tol_mm)} by_host_class_max_mm={ {k: (len(v), round(max(v), 3)) for k, v in sorted(byc.items())} } rotated_x_or_y_hosts={nrot} tol_mm={A.tol_mm} -> {verdict("FRAME_HOSTS", dev_ax and max(dev_ax) <= A.tol_mm and not nmiss, not dev_all)}')
    ov = []; ovz = []; ovc = collections.defaultdict(list); nocomp = 0; worst = None
    for g, e in ELS.items():
        hs = [their(h) for h in hostsets[g]]; hs = [h for h in hs if h]
        if not hs: nocomp += 1; continue
        lo, hi = file_bbox_g(g); Hlo = np.min([h[0] for h in hs], 0); Hhi = np.max([h[1] for h in hs], 0)
        o = np.maximum(0, np.maximum(Hlo - lo, hi - Hhi)) * 1000; ov.append(float(o[AX].max())); ovz.append(float(o.max())); ovc[hs[0][2]].append(ov[-1])
        if worst is None or ov[-1] > worst[0]: worst = (ov[-1], g)
    print(f'§PIFC_FRAME_INSIDE parts_compared={len(ov)} parts_without_a_host_found={nocomp} overshoot_beyond_host_bbox_mm max_{A.frame_axes}={max(ov, default=0):.3f} max_all_axes={max(ovz, default=0):.3f} over_tol={sum(1 for o in ov if o > A.tol_mm)} by_first_host_class_max_mm={ {k: (len(v), round(max(v), 3)) for k, v in sorted(ovc.items())} } tol_mm={A.tol_mm}'
          + (f' worst={worst[1]}' if worst and worst[0] > A.tol_mm else '') + f' -> {verdict("FRAME_INSIDE", ov and max(ov) <= A.tol_mm and not nocomp, not ov)}')
    # cross-check of the file bbox read by hand against the geometry kernel, on a sample
    samp = list(ELS)[::max(1, len(ELS) // 12)][:12]; dk = []
    for g in samp:
        eid = PARTS[g][0][0]; sh = ifcopenshell.geom.create_shape(st, g2.by_guid(gid(eid))); v = np.array(sh.geometry.verts).reshape(-1, 3); lo, hi = file_bbox(g2.by_guid(gid(eid))); dk.append(max(np.abs(lo - v.min(0)).max(), np.abs(hi - v.max(0)).max()) * 1000)
    print(f'§PIFC_FRAME_KERNEL sample={len(dk)} hand_bbox_vs_geometry_kernel_mm max={max(dk):.4f} -> {verdict("FRAME_KERNEL", max(dk) <= 0.01)}')
else:
    print('§PIFC_FRAME_HOSTS no --check-ifc given -> INCONCLUSIVE'); verdicts.append(('FRAME_HOSTS', 'INCONCLUSIVE'))
bad_v = [t for t, v in verdicts if v == 'FAIL']
print(f'§PIFC_VERDICT {" ".join(f"{t}={v}" for t, v in verdicts)} -> {"FAIL" if bad_v else ("INCONCLUSIVE" if any(v == "INCONCLUSIVE" for _, v in verdicts) else "PASS")}')
sys.exit(1 if bad_v else 0)
