#!/usr/bin/env python3
# ⚠ DO NOT REMOVE: scope = bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L1.2 (door_operation table written by
# scripts/extractIFC2DB.js). Tests X1-X4 + X4-control. Read the log after every run (exit code is not evidence).
# Oracle = IfcOpenShell reading the IFC directly (independent of web-ifc, which the extractor uses).
# The extraction itself is ONLY ever done by the Node extractor (never the Python one).
"""
Usage:
    python3 scripts/witness_door_operation.py [--node-modules DIR] [--keep DIR]
Writes the log to <keep or tmp>/witness_door_operation.log and prints it.
Inputs (IFC, read-only): ~/bim-ootb/IFC/{Duplex_ARC,SampleHouse_ARC}.ifc, reference/residential/{Ifc2x3_Duplex_Federated,
Ifc4_SampleHouse,Ifc4_WallElementedCase}.ifc. Output DBs go to a temp dir (or --keep); none is shipped or committed.
"""
import os
import re
import sys
import json
import shutil
import sqlite3
import argparse
import tempfile
import subprocess

import numpy as np
import ifcopenshell
import ifcopenshell.util.unit as U
import ifcopenshell.util.placement as P

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOME = os.path.expanduser('~')
IFCS = [   # (tag, path)
    ('DX_ARC', os.path.join(HOME, 'bim-ootb/IFC/Duplex_ARC.ifc')),
    ('DXFED', os.path.join(ROOT, 'reference/residential/Ifc2x3_Duplex_Federated.ifc')),
    ('SH4', os.path.join(ROOT, 'reference/residential/Ifc4_SampleHouse.ifc')),
    ('SH_ARC', os.path.join(HOME, 'bim-ootb/IFC/SampleHouse_ARC.ifc')),
    ('WEC4', os.path.join(ROOT, 'reference/residential/Ifc4_WallElementedCase.ifc')),
]
LEAF_MIRROR_TOL = 0.001   # m, same as std2d R9
AX_TOL, O_TOL = 1e-6, 1e-6
OUT, FAILS = [], []


def say(s):
    print(s)
    OUT.append(s)


def check(tid, issue, ok, detail):
    say(f"{'PASS' if ok else 'FAIL'} {tid} | {issue} | {detail}")
    if not ok:
        FAILS.append(tid)
    return ok


def extract(script, ifc, db, node_modules, log):
    env = dict(os.environ, NODE_PATH=node_modules)
    r = subprocess.run(['node', script, '--ifc', ifc, '-o', db], capture_output=True, text=True, env=env)
    open(log, 'w').write(r.stdout + r.stderr)
    txt = r.stdout + r.stderr
    if r.returncode != 0 or '§DB_WRITTEN' not in txt or '§FATAL' in txt:
        raise RuntimeError(f'extract failed {ifc}: rc={r.returncode} {txt[-400:]}')
    return txt


def table_rows(db, t):
    con = sqlite3.connect(db)
    try:
        rows = con.execute(f'SELECT * FROM "{t}"').fetchall()
    finally:
        con.close()
    return sorted(rows, key=repr)


def tables(db):
    con = sqlite3.connect(db)
    try:
        return dict(con.execute("SELECT name, sql FROM sqlite_master WHERE type='table'").fetchall())
    finally:
        con.close()


# ───────────── X1 ─────────────
def x1(tag, base_db, new_db):
    bt, nt = tables(base_db), tables(new_db)
    bad = []
    extra = sorted(set(nt) - set(bt))
    if extra != ['door_operation']:
        bad.append(f'new tables {extra} (expected only door_operation)')
    if set(bt) - set(nt):
        bad.append(f'missing tables {sorted(set(bt) - set(nt))}')
    nrows = 0
    for t in sorted(bt):
        if t not in nt:
            continue
        if bt[t] != nt[t]:
            bad.append(f'{t}: schema differs')
        a, b = table_rows(base_db, t), table_rows(new_db, t)
        if t == 'project_metadata':
            a = [r for r in a if r[0] != 'import_date']
            b = [r for r in b if r[0] != 'import_date']
        nrows += len(a)
        if a != b:
            bad.append(f'{t}: rows differ ({len(a)} vs {len(b)})')
    return check(f'X1[{tag}]', 'the new table changed an existing table or output', not bad,
                 f'tables={len(bt)} rows compared={nrows} ' + ('; '.join(bad) if bad else 'all identical (import_date excluded)'))


# ───────────── oracle ─────────────
def oracle_doors(ifc_path):
    f = ifcopenshell.open(ifc_path)
    ls = U.calculate_unit_scale(f)                       # file length unit -> metres
    out = {}
    for d in f.by_type('IfcDoor'):
        t = None
        for r in getattr(d, 'IsTypedBy', None) or []:
            t = r.RelatingType
        if t is None:
            for r in d.IsDefinedBy or []:
                if r.is_a('IfcRelDefinesByType'):
                    t = r.RelatingType
        op = src = None
        if t is not None and getattr(t, 'OperationType', None):
            op, src = t.OperationType, ('style' if t.is_a('IfcDoorStyle') else 'type' if t.is_a('IfcDoorType') else None)
        if not op and getattr(d, 'OperationType', None):
            op, src = d.OperationType, 'occurrence'
        M = P.get_local_placement(d.ObjectPlacement)    # file units, 4x4
        out[d.GlobalId] = dict(op=op, src=src, x=M[:3, 0], y=M[:3, 1], z=M[:3, 2], o=M[:3, 3] * ls, M=M, ls=ls,
                               w=(d.OverallWidth * ls) if d.OverallWidth else None, ent=d, f=f)
    return out


def plan_arc(o):
    """IFC 'Plan' swing curve: IfcTrimmedCurve on IfcCircle in the door's Plan representation.
    Returns (centre_world_xy, mid_dir_world_xy, radius_m) or None (with the reason)."""
    d, f, M, ls = o['ent'], o['f'], o['M'], o['ls']
    ang = U.calculate_unit_scale(f, 'PLANEANGLEUNIT')   # file angle unit -> radians
    for rep in (d.Representation.Representations if d.Representation else []):
        if rep.RepresentationIdentifier != 'Plan':
            continue
        for it in rep.Items:
            items = [it]
            if it.is_a('IfcMappedItem'):
                ms, mt = it.MappingSource, it.MappingTarget
                mo = ms.MappingOrigin
                ident = (tuple(mo.Location.Coordinates) in ((0.0, 0.0, 0.0), (0.0, 0.0)) and mo.RefDirection is None
                         and getattr(mo, 'Axis', None) is None and tuple(mt.LocalOrigin.Coordinates)[:2] == (0.0, 0.0)
                         and mt.Axis1 is None and mt.Axis2 is None and (mt.Scale in (None, 1.0)))
                if not ident:
                    return None, 'mapped item not identity (unsupported; not guessed)'
                items = ms.MappedRepresentation.Items
            for gs in items:
                for c in getattr(gs, 'Elements', None) or ([gs] if gs.is_a('IfcCurve') else []):
                    if not (c.is_a('IfcTrimmedCurve') and c.BasisCurve.is_a('IfcCircle')):
                        continue
                    if c.MasterRepresentation != 'PARAMETER':
                        return None, f'trim by {c.MasterRepresentation} (unsupported)'
                    circ = c.BasisCurve
                    lc = np.array(circ.Position.Location.Coordinates[:2], float)
                    xr = np.array(circ.Position.RefDirection.DirectionRatios[:2], float) if circ.Position.RefDirection else np.array([1.0, 0])
                    xr /= np.linalg.norm(xr)
                    yr = np.array([-xr[1], xr[0]])
                    t1 = c.Trim1[0].wrappedValue * ang
                    t2 = c.Trim2[0].wrappedValue * ang
                    if not c.SenseAgreement:
                        t1, t2 = t2, t1
                    if t2 < t1:
                        t2 += 2 * np.pi
                    tm = (t1 + t2) / 2
                    mid_l = np.cos(tm) * xr + np.sin(tm) * yr
                    cw = (M @ np.array([lc[0], lc[1], 0, 1.0]))[:2] * ls
                    mw = M[:2, :2] @ mid_l
                    return (cw, mw / np.linalg.norm(mw), circ.Radius * ls), 'ok'
    return None, 'no Plan swing arc'


# ───────────── DB side ─────────────
def db_doors(db):
    con = sqlite3.connect(db)
    try:
        ops = {r[0]: dict(op=r[1], src=r[2], x=json.loads(r[3]) if r[3] else None, y=json.loads(r[4]) if r[4] else None,
                          z=json.loads(r[5]) if r[5] else None, o=json.loads(r[6]) if r[6] else None, w=r[7])
               for r in con.execute('SELECT guid, operation_type, source, x_axis, y_axis, z_axis, origin, overall_width FROM door_operation')}
        mesh = {}
        for g, cx, cy, cz, bx, by, bz, vb, fb in con.execute(
                """SELECT m.guid, t.center_x, t.center_y, t.center_z, t.bbox_x, t.bbox_y, t.bbox_z, c.vertices, c.faces
                   FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid
                   JOIN element_instances i ON i.guid=m.guid JOIN component_geometries c ON c.geometry_hash=i.geometry_hash
                   WHERE m.ifc_class='IfcDoor'"""):
            v = np.frombuffer(vb, dtype=np.float32).reshape(-1, 3).astype(np.float64)
            mesh[g] = dict(c=np.array([cx, cy, cz]), v=v, lo=v.min(0) + [cx, cy, cz], hi=v.max(0) + [cx, cy, cz])
        doors = [r[0] for r in con.execute("SELECT guid FROM elements_meta WHERE ifc_class='IfcDoor'")]
    finally:
        con.close()
    return ops, mesh, doors


def leaf_sign(v, y):
    """R9 along the door's own y axis: sign of the thickness coordinates with no mirror partner (leaf)."""
    t = v[:, :2] @ np.asarray(y[:2], float)
    t = t - (t.min() + t.max()) / 2                  # about the bbox centre (DB vertices are vertex-mean centred)
    vals = np.unique(np.round(t, 4))                 # partner test by tolerance, not by rounding equality
    inner = np.array([x for x in vals if not np.any(np.abs(vals + x) <= LEAF_MIRROR_TOL)])
    if len(inner) == 0:
        return 0
    return 1 if np.all(inner > 0) else -1 if np.all(inner < 0) else 0


def x2(tag, db, ifc):
    ops, mesh, doors = db_doors(db)
    orc = oracle_doors(ifc)
    bad = []
    want = {g for g, o in orc.items() if o['op'] and g in doors}
    if set(ops) != want:
        bad.append(f'rows {len(ops)} vs oracle doors-with-op {len(want)} (missing {sorted(want - set(ops))[:3]} extra {sorted(set(ops) - want)[:3]})')
    for g in sorted(set(ops) & want):
        r, o = ops[g], orc[g]
        if r['op'] != o['op'] or r['src'] != o['src']:
            bad.append(f'{g}: op/src {r["op"]}/{r["src"]} != {o["op"]}/{o["src"]}')
        for k in ('x', 'y', 'z'):
            if r[k] is None or np.max(np.abs(np.array(r[k]) - o[k])) > AX_TOL:
                bad.append(f'{g}: {k}_axis {r[k]} != {o[k].round(6).tolist()}')
        if r['o'] is None or np.max(np.abs(np.array(r['o']) - o['o'])) > O_TOL:
            bad.append(f'{g}: origin {r["o"]} != {o["o"].round(6).tolist()}')
    srcs = {}
    for r in ops.values():
        srcs[r['src']] = srcs.get(r['src'], 0) + 1
    check(f'X2[{tag}]', 'wrong or missing handing data (type, source, axes, origin vs the IFC)', not bad,
          f'doors={len(doors)} rows={len(ops)} sources={srcs} ' + ('; '.join(bad[:4]) if bad else 'all equal the IfcOpenShell oracle'))
    return ops, mesh, orc


def x4(tag, db, ifc, verbose=True):
    """Per door: enum hinge jamb vs IFC Plan arc jamb; +Y swing vs Plan arc side and DB mesh leaf side."""
    ops, mesh, doors = db_doors(db)
    orc = oracle_doors(ifc)
    rows, bad, nowit = [], [], []
    for g in sorted(ops):
        r = ops[g]
        if r['op'] not in ('SINGLE_SWING_LEFT', 'SINGLE_SWING_RIGHT') or g not in mesh:
            rows.append((g, r['op'], r['src'], 'n/a', 'n/a', 'n/a', 'n/a', 'n/a', 'not single swing / no mesh'))
            continue
        X, Y = np.array(r['x'][:2]), np.array(r['y'][:2])
        m = mesh[g]
        ctr = ((m['lo'] + m['hi']) / 2)[:2]
        enum_h = -1 if r['op'].endswith('LEFT') else 1
        arc, why = plan_arc(orc[g])
        if arc is None:
            plan_h = plan_s = None
        else:
            cw, mw, R = arc
            plan_h = int(np.sign(np.dot(cw - ctr, X)))
            plan_s = int(np.sign(np.dot(mw, Y)))
        mesh_s = leaf_sign(m['v'], r['y'])
        if mesh_s == -1 or (arc is not None and (plan_h != enum_h or plan_s != 1)):
            ok, verdict = False, 'DISAGREE'
        else:
            miss = ([] if arc is not None else [f'IFC Plan: {why}']) + ([] if mesh_s == 1 else ['DB mesh leaf side mixed/none (R9)'])
            ok, verdict = True, ('AGREE' if not miss else 'no contradiction; no witness: ' + ', '.join(miss))
            if miss:
                nowit.append(g)
        lab = {-1: '-X', 1: '+X', 0: '?', None: 'none'}
        sl = {-1: '-Y', 1: '+Y', 0: '?', None: 'none'}
        rows.append((g, r['op'], r['src'], lab[enum_h], lab[plan_h], '+Y', sl[plan_s], sl[mesh_s],
                     verdict))
        if not ok:
            bad.append(g)
    if verbose:
        say(f'  {"guid":24} {"operation":20} {"src":6} hinge(enum) hinge(IFC Plan arc) swing(enum) swing(Plan arc) swing(DB mesh leaf) verdict')
        for row in rows:
            say(f'  {row[0]:24} {row[1]:20} {row[2]:6} {row[3]:11} {row[4]:19} {row[5]:11} {row[6]:15} {row[7]:19} {row[8]}')
    n_ss = sum(1 for row in rows if row[3] != 'n/a')
    return bad, n_ss, nowit


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--node-modules', default=os.path.join(ROOT, 'node_modules'))
    ap.add_argument('--keep', default=None, help='keep the extracted DBs + logs here')
    a = ap.parse_args()
    nm = os.path.realpath(a.node_modules)
    work = a.keep or tempfile.mkdtemp(prefix='wdo_')
    os.makedirs(work, exist_ok=True)
    new_js = os.path.join(ROOT, 'scripts', 'extractIFC2DB.js')
    base_js = os.path.join(work, 'extractIFC2DB_origin_master.js')
    src = subprocess.run(['git', '-C', ROOT, 'show', 'origin/master:scripts/extractIFC2DB.js'], capture_output=True, text=True, check=True).stdout
    open(base_js, 'w').write(src)
    say(f'§ENTRY witness_door_operation work={work} node_modules={nm}')
    try:
        dbs = {}
        for tag, ifc in IFCS:
            b, n = os.path.join(work, f'{tag}_base.db'), os.path.join(work, f'{tag}_door_op.db')
            extract(base_js, ifc, b, nm, b[:-3] + '.log')
            txt = extract(new_js, ifc, n, nm, n[:-3] + '.log')
            say(f'§EXTRACT {tag} ' + ' '.join(l for l in txt.splitlines() if l.startswith('§DOOR_OPERATION') or l.startswith('§SUMMARY')))
            if '§DOOR_OP_FAIL' in txt:
                say(f'§DOOR_OP_FAIL in {tag}')
            dbs[tag] = n
            x1(tag, b, n)
            x2(tag, n, ifc)
        # X3: IFC4 mm file, type precedence + unit scale; then the occurrence path on a copy with type values removed
        ops, mesh, _ = db_doors(dbs['SH4'])
        # origin (m) must sit in the DB mesh frame: distance to the door's own mesh bbox <= its largest extent
        # (a missed or doubled mm->m scale puts it ~1000x away); exact value vs the oracle is X2
        dist = {g: float(np.linalg.norm(np.maximum(0, np.maximum(mesh[g]['lo'] - r['o'], np.array(r['o']) - mesh[g]['hi']))))
                for g, r in ops.items() if g in mesh and r['o']}
        near = [g for g in dist if dist[g] <= float(np.max(mesh[g]['hi'] - mesh[g]['lo']))]
        types = sorted({r['op'] for r in ops.values()})
        check('X3[SH4]', 'IFC4 precedence (type over occurrence) or the mm->m origin scale is wrong',
              all(r['src'] == 'type' for r in ops.values()) and len(near) == len(ops) == 3 and 'DOUBLE_DOOR_SINGLE_SWING' in types,
              f'rows={len(ops)} sources={sorted({r["src"] for r in ops.values()})} ops={types} '
              f'origin-to-mesh-bbox m={[round(dist[g], 3) for g in sorted(dist)]} within door size={len(near)}/{len(ops)}')
        sh4 = dict(IFCS)['SH4']
        txt = open(sh4, encoding='utf-8', errors='surrogateescape').read()
        # IFC4 IfcDoorType(..., PredefinedType, OperationType, ...): drop the OperationType value only
        mut, n_sub = re.subn(r"^(#\d+=IFCDOORTYPE\(.*,\.[A-Z_]+\.,)\.[A-Z_]+\.(,\.[TF]\.,.*)$", r"\1$\2", txt, flags=re.M)
        occ_ifc = os.path.join(work, 'SH4_no_type_op.ifc')
        open(occ_ifc, 'w', encoding='utf-8', errors='surrogateescape').write(mut)
        occ_db = os.path.join(work, 'SH4_no_type_op.db')
        extract(new_js, occ_ifc, occ_db, nm, occ_db[:-3] + '.log')
        ops2, _, _ = db_doors(occ_db)
        orc2 = oracle_doors(occ_ifc)
        okc = (n_sub == 3 and len(ops2) == 3 and all(r['src'] == 'occurrence' for r in ops2.values())
               and all(ops2[g]['op'] == orc2[g]['ent'].OperationType for g in ops2))
        check('X3-occurrence', 'the IFC4 occurrence OperationType is not used when the type carries none',
              okc, f'IfcDoorType values removed={n_sub} rows={len(ops2)} sources={sorted({r["src"] for r in ops2.values()})} '
                   f'ops={sorted(r["op"] for r in ops2.values())}')
        # X4 geometry agreement (Duplex)
        say('-- X4 Duplex_ARC: enum vs geometry, per door --')
        bad, n_ss, nowit = x4('DX_ARC', dbs['DX_ARC'], dict(IFCS)['DX_ARC'])
        check('X4[DX_ARC]', 'enum handing disagrees with the physical door (IFC Plan swing arc / DB mesh leaf)',
              not bad and not nowit and n_ss == 14, f'single-swing doors={n_ss} disagree={bad} without both witnesses={nowit}')
        say('-- X4 Ifc4_SampleHouse --')
        bad4, n4, nowit4 = x4('SH4', dbs['SH4'], sh4)
        # INFO, not PASS: this file has no Plan swing curve and an asymmetric Revit mesh, so it can only show "no contradiction"
        say(f'INFO X4[SH4] single-swing doors={n4} disagree={bad4} without a geometry witness={nowit4}')
        if bad4:
            check('X4[SH4]', 'enum handing contradicted by geometry (IFC4 mm file)', False, f'disagree={bad4}')
        # X4-control: swap one IfcDoorStyle LEFT<->RIGHT in a copy; X4 must flag exactly that style's doors
        dx = dict(IFCS)['DX_ARC']
        txt = open(dx, encoding='utf-8', errors='surrogateescape').read()
        line = [l for l in txt.splitlines() if l.startswith('#8053=IFCDOORSTYLE(')][0]
        ctl_txt = txt.replace(line, line.replace('.SINGLE_SWING_LEFT.', '.SINGLE_SWING_RIGHT.'))
        ctl_ifc = os.path.join(work, 'DX_ARC_style8053_swapped.ifc')
        open(ctl_ifc, 'w', encoding='utf-8', errors='surrogateescape').write(ctl_txt)
        ctl_db = os.path.join(work, 'DX_ARC_style8053_swapped.db')
        extract(new_js, ctl_ifc, ctl_db, nm, ctl_db[:-3] + '.log')
        f0 = ifcopenshell.open(dx)
        st = f0.by_id(8053)
        expect = sorted(o.GlobalId for r in f0.by_type('IfcRelDefinesByType') if r.RelatingType == st for o in r.RelatedObjects)
        badc, _, _ = x4('DX_ARC-ctl', ctl_db, ctl_ifc, verbose=False)
        check('X4-control', 'X4 cannot see a wrong LEFT/RIGHT (style #8053 swapped in a copy must be flagged on exactly its doors)',
              sorted(badc) == expect and len(expect) > 0, f'flagged={badc} expected={expect}')
    finally:
        say(f'SUMMARY fail={len(FAILS)} {FAILS}')
        with open(os.path.join(work, 'witness_door_operation.log'), 'w') as fh:
            fh.write('\n'.join(OUT) + '\n')
        if not a.keep:
            shutil.rmtree(work, ignore_errors=True)
    sys.exit(1 if FAILS else 0)


if __name__ == '__main__':
    main()
