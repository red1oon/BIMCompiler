#!/usr/bin/env python3
# ⚠ DO NOT REMOVE: scope = bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L1.6 P0 (Node extractor tables element_world_bbox,
# rel_fills_host, element_pset_common, storey_elevation). Tests E1-E4 + E2-control. Read the log after every run (exit code is
# not evidence). Oracle = IfcOpenShell reading the IFC (independent of web-ifc). Extraction is ONLY the Node extractor.
"""
Usage:
    python3 scripts/witness_extract_2d_tables.py [--node-modules DIR] [--keep DIR] [--old-duplex-db DX_extracted.db]
Inputs (IFC, read-only): the 5 #181 IFCs (witness_door_operation.py IFCS) + SampleCastle + HHS architect + HHS construction.
Output DBs go to a temp dir (or --keep); none is shipped or committed.
"""
import os
import re
import sys
import shutil
import sqlite3
import argparse
import tempfile
import subprocess

import numpy as np
import ifcopenshell
import ifcopenshell.util.element as UE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOME = os.path.expanduser('~')
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from witness_door_operation import IFCS as IFCS5, extract, table_rows, tables  # noqa: E402

EXTRA = [
    ('SC', os.path.join(HOME, 'bim-compiler/internal/sources/Ifc2x3_SampleCastle.ifc')),
    ('HHS_ARC', os.path.join(HOME, 'bim-compiler/internal/UNMERGED/opensourceBIM_HHS_Office_architect.ifc')),
    ('HHS_STR', os.path.join(HOME, 'bim-compiler/internal/UNMERGED/opensourceBIM_HHS_Office_construction.ifc')),
]
NEW_TABLES = ['element_pset_common', 'element_world_bbox', 'rel_fills_host', 'storey_elevation']
OUT, FAILS = [], []


def say(s):
    print(s)
    OUT.append(s)


def check(tid, issue, ok, detail):
    say(f"{'PASS' if ok else 'FAIL'} {tid} | {issue} | {detail}")
    if not ok:
        FAILS.append(tid)
    return ok


def e1(tag, base_db, new_db):
    bt, nt = tables(base_db), tables(new_db)
    bad = []
    extra = sorted(set(nt) - set(bt))
    if extra != NEW_TABLES:
        bad.append(f'new tables {extra} (expected {NEW_TABLES})')
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
    return check(f'E1[{tag}]', 'an additive table changed an existing table or output', not bad,
                 f'tables={len(bt)} rows compared={nrows} ' + ('; '.join(bad) if bad else 'all identical (import_date excluded)'))


def oracle_fills(ifc):
    f = ifcopenshell.open(ifc)
    host = {r.RelatedOpeningElement.GlobalId: r.RelatingBuildingElement for r in f.by_type('IfcRelVoidsElement')
            if r.RelatedOpeningElement and r.RelatingBuildingElement}
    fill = {r.RelatingOpeningElement.GlobalId: r.RelatedBuildingElement for r in f.by_type('IfcRelFillsElement')
            if r.RelatingOpeningElement and r.RelatedBuildingElement}
    return sorted((o, h.GlobalId, fill[o].GlobalId if o in fill else None, h.is_a(), fill[o].is_a() if o in fill else None)
                  for o, h in host.items())


def e2(tag, db, ifc):
    con = sqlite3.connect(db)
    got = sorted(con.execute('SELECT opening_guid, host_guid, filling_guid, host_class, filling_class FROM rel_fills_host').fetchall())
    con.close()
    exp = oracle_fills(ifc)
    miss, extra = sorted(set(exp) - set(got)), sorted(set(got) - set(exp))
    return check(f'E2[{tag}]', 'host relation missing or wrong (rel_fills_host != IfcRelVoidsElement o IfcRelFillsElement)',
                 not miss and not extra, f'rows={len(got)} oracle={len(exp)} filled={sum(1 for r in exp if r[2])} '
                 f'void-only={sum(1 for r in exp if not r[2])} missing={miss[:2]} extra={extra[:2]}')


def e3(tag, db):
    con = sqlite3.connect(db)
    rows = con.execute("""SELECT b.guid, b.minX, b.maxX, b.minY, b.maxY, b.minZ, b.maxZ, t.center_x, t.center_y, t.center_z, g.vertices
                          FROM element_world_bbox b JOIN element_transforms t USING(guid) JOIN element_instances i USING(guid)
                          JOIN component_geometries g USING(geometry_hash)""").fetchall()
    nb = con.execute('SELECT COUNT(*) FROM element_world_bbox').fetchone()[0]
    nt = con.execute('SELECT COUNT(*) FROM element_transforms').fetchone()[0]
    con.close()
    worst, bad = 0.0, []
    for g, *bb, cx, cy, cz, vb in rows:
        v = np.frombuffer(vb, dtype=np.float32).reshape(-1, 3).astype(np.float64) + [cx, cy, cz]
        mesh = [v[:, 0].min(), v[:, 0].max(), v[:, 1].min(), v[:, 1].max(), v[:, 2].min(), v[:, 2].max()]
        d = max(abs(a - b) for a, b in zip(bb, mesh))
        worst = max(worst, d)
        if d > 1e-5:
            bad.append(g)
    return check(f'E3[{tag}]', 'world bbox is not the stored mesh (frame or scale)', not bad and nb == nt,
                 f'bbox rows={nb} transform rows={nt} with mesh={len(rows)} worst |bbox-mesh|={worst * 1000:.4f} mm bad={bad[:3]}')


def e3_old(db_new, db_old):
    """Duplex: Node bbox vs the old IfcOpenShell-tessellated elements_rtree (independent geometry engine), walls/doors/windows."""
    a = sqlite3.connect(db_new)
    nb = {g: r for g, *r in a.execute("""SELECT m.guid, b.minX, b.maxX, b.minY, b.maxY, b.minZ, b.maxZ FROM elements_meta m
                                         JOIN element_world_bbox b USING(guid) WHERE m.ifc_class IN ('IfcWall','IfcWallStandardCase','IfcDoor','IfcWindow')""")}
    a.close()
    o = sqlite3.connect(db_old)
    ob = {g: r for g, *r in o.execute("""SELECT m.guid, r.minX, r.maxX, r.minY, r.maxY, r.minZ, r.maxZ FROM elements_meta m
                                         JOIN elements_rtree r ON r.id=m.id WHERE m.ifc_class IN ('IfcWall','IfcWallStandardCase','IfcDoor','IfcWindow')""")}
    o.close()
    common = sorted(set(nb) & set(ob))
    d = {g: max(abs(x - y) for x, y in zip(nb[g], ob[g])) for g in common}
    bad = sorted(g for g in d if d[g] > 0.001)
    return check('E3-old[DXFED]', 'a different world frame or scale than the IfcOpenShell-tessellated DB', len(common) > 0 and not bad,
                 f'common walls/doors/windows={len(common)} (node={len(nb)} old={len(ob)}) worst={max(d.values()) * 1000:.3f} mm bad={bad[:3]}')


def e4(tag, db, ifc):
    f = ifcopenshell.open(ifc)
    con = sqlite3.connect(db)
    got = {(g, p, n): (v, s) for g, p, n, v, s in con.execute('SELECT guid, pset, name, value, source FROM element_pset_common')}
    ids = {r[0] for r in con.execute('SELECT guid FROM elements_meta')}
    con.close()
    exp = {}
    for el in f.by_type('IfcProduct'):
        if el.GlobalId not in ids:
            continue
        occ = UE.get_psets(el, psets_only=True, should_inherit=False)
        typ = UE.get_psets(UE.get_type(el), psets_only=True) if UE.get_type(el) else {}
        for src, ps in (('type', typ), ('occurrence', occ)):
            for pn, props in ps.items():
                if not re.match(r'^Pset_.*Common$', pn):
                    continue
                for n in ('IsExternal', 'LoadBearing'):
                    if n in props and props[n] is not None:
                        v = props[n]
                        v = 'TRUE' if v is True else 'FALSE' if v is False else str(v).upper()
                        exp[(el.GlobalId, pn, n)] = (v, src)   # occurrence written last: it wins
    miss = sorted(set(exp) - set(got))
    extra = sorted(set(got) - set(exp))
    diff = sorted(k for k in set(exp) & set(got) if exp[k] != got[k])
    return check(f'E4[{tag}]', 'IsExternal/LoadBearing missing or wrong (value or occurrence-over-type source)',
                 not miss and not extra and not diff, f'rows={len(got)} oracle={len(exp)} missing={miss[:2]} extra={extra[:2]} differ={diff[:2]}')


def v1_hosts(db):
    con = sqlite3.connect(db)
    r = {h for (h,) in con.execute(
        "SELECT DISTINCT o.host_guid FROM rel_fills_host o WHERE o.host_guid IS NOT NULL "
        "AND o.host_guid NOT IN (SELECT guid FROM element_world_bbox) AND o.host_guid IN "
        "(SELECT guid FROM elements_meta WHERE ifc_class IN ('IfcWall','IfcWallStandardCase'))")}
    con.close()
    return r


def e5_core(ifc, hosts):
    import ifcopenshell.geom as G
    f = ifcopenshell.open(ifc)
    s_sub, s_raw = G.settings(), G.settings()
    s_raw.set('disable-opening-subtractions', True)
    bad = []
    for gid in sorted(hosts):
        w = f.by_guid(gid)
        def nv(st):
            try:
                return len(G.create_shape(st, w).geometry.verts)
            except Exception:
                return 0
        if not (nv(s_raw) and not nv(s_sub)):
            bad.append(gid)
    return bad


def e5(tag, db, ifc):
    hosts = v1_hosts(db)
    bad = e5_core(ifc, hosts)
    return check(f'E5[{tag}]', 'a V1 host (SS L1.7) that is not entirely removed by its voids', not bad, f'v1_hosts={len(hosts)} not_fully_voided={bad[:3]}'), hosts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--node-modules', default=os.path.join(ROOT, 'node_modules'))
    ap.add_argument('--keep', default=None)
    ap.add_argument('--old-duplex-db', default=os.path.join(HOME, 'Projects/bim-compiler/2D_Layout/input/DX_extracted.db'))
    a = ap.parse_args()
    nm = os.path.realpath(a.node_modules)
    work = a.keep or tempfile.mkdtemp(prefix='wx2d_')
    os.makedirs(work, exist_ok=True)
    new_js = os.path.join(ROOT, 'scripts', 'extractIFC2DB.js')
    base_js = os.path.join(work, 'extractIFC2DB_origin_master.js')
    open(base_js, 'w').write(subprocess.run(['git', '-C', ROOT, 'show', 'origin/master:scripts/extractIFC2DB.js'],
                                            capture_output=True, text=True, check=True).stdout)
    say(f'§ENTRY witness_extract_2d_tables work={work}')
    try:
        dbs = {}
        for tag, ifc in IFCS5 + EXTRA:
            n = os.path.join(work, f'{tag}_new.db')
            txt = extract(new_js, ifc, n, nm, n[:-3] + '.log')
            say(f'§EXTRACT {tag} ' + ' | '.join(l for l in txt.splitlines() if l.startswith(('§GEOM_EMPTY', '§WORLD_BBOX', '§REL_FILLS_HOST', '§PSET_COMMON', '§STOREY_ELEVATION'))))
            dbs[tag] = n
            if (tag, ifc) in IFCS5:
                b = os.path.join(work, f'{tag}_base.db')
                extract(base_js, ifc, b, nm, b[:-3] + '.log')
                e1(tag, b, n)
            e2(tag, n, ifc)
            e3(tag, n)
            e4(tag, n, ifc)
            _, h5 = e5(tag, n, ifc)
            if tag == 'SC':
                con = sqlite3.connect(n)
                solid = con.execute("SELECT m.guid FROM elements_meta m JOIN element_world_bbox b ON b.guid=m.guid WHERE m.ifc_class='IfcWallStandardCase' ORDER BY m.guid LIMIT 1").fetchone()[0]
                con.close()
                bad = e5_core(ifc, h5 | {solid})
                check('E5-control', 'E5 cannot see a non-voided wall slipped into the V1 set', bad == [solid], f'injected={solid} flagged={bad[:2]}')
        if os.path.exists(a.old_duplex_db):
            e3_old(dbs['DXFED'], a.old_duplex_db)
        else:
            say(f'SKIP E3-old | no old Duplex DB at {a.old_duplex_db}; not a PASS')
        # E2-control: one IfcRelFillsElement removed in a copy -> exactly that opening's filling must read NULL
        dx = dict(IFCS5)['DX_ARC']
        txt = open(dx, encoding='utf-8', errors='surrogateescape').read()
        line = sorted(l for l in txt.splitlines() if re.match(r'^#\d+=\s*IFCRELFILLSELEMENT\(', l))[0]
        ctl_ifc = os.path.join(work, 'DX_ARC_one_fill_removed.ifc')
        open(ctl_ifc, 'w', encoding='utf-8', errors='surrogateescape').write(txt.replace(line + '\n', ''))
        ctl_db = os.path.join(work, 'DX_ARC_one_fill_removed.db')
        extract(new_js, ctl_ifc, ctl_db, nm, ctl_db[:-3] + '.log')
        con = sqlite3.connect(ctl_db)
        nulls = {r[0] for r in con.execute('SELECT opening_guid FROM rel_fills_host WHERE filling_guid IS NULL')}
        con.close()
        con = sqlite3.connect(dbs['DX_ARC'])
        nulls0 = {r[0] for r in con.execute('SELECT opening_guid FROM rel_fills_host WHERE filling_guid IS NULL')}
        con.close()
        n0 = len(FAILS)
        ok_ctl = e2('DX_ARC-ctl', ctl_db, dx)
        del FAILS[n0:]
        check('E2-control', 'E2 cannot see a missing IfcRelFillsElement (one removed in a copy)', ok_ctl is False and len(nulls - nulls0) == 1,
              f'removed {line[:60]}... ; newly void-only openings={sorted(nulls - nulls0)}; E2 on it {"FAILED as required" if ok_ctl is False else "PASSED: blind"}')
    finally:
        say(f'SUMMARY fail={len(FAILS)} {FAILS}')
        with open(os.path.join(work, 'witness_extract_2d_tables.log'), 'w') as fh:
            fh.write('\n'.join(OUT) + '\n')
        if not a.keep:
            shutil.rmtree(work, ignore_errors=True)
    sys.exit(1 if FAILS else 0)


if __name__ == '__main__':
    main()
