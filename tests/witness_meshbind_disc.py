#!/usr/bin/env python3
"""W-MESHBIND-DISC — MODELLER_MASTER.md §MESHBIND-DISC. Proves: the miner binds within the
discipline the extraction records. Usage: witness_meshbind_disc.py <rules_db> <extracted_db>"""
import os, shutil, sqlite3, sys, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'build'))
import project_rule_mesh_binding as M
rules, bdb = sys.argv[1], sys.argv[2]
d = tempfile.mkdtemp(); r = os.path.join(d, 'r.db'); shutil.copy(rules, r)
logs = []; M.project(r, bdb, log=logs.append)
for l in logs: print(l)
con = sqlite3.connect(r); b = sqlite3.connect(bdb)
rows = con.execute("select disc, ifc_class, geometry_hash, src_guids from rule_mesh_binding").fetchall()
fail = 0
def chk(n, ok, msg):
    global fail; print(f"§MESHBIND-DISC {n} {'PASS' if ok else 'FAIL'} {msg}"); fail += (not ok)
if not rows: print("§MESHBIND-DISC INCONCLUSIVE — 0 rows written (VACUOUS)"); sys.exit(1)
bad = 0
for disc, cls, h, g in rows:
    for guid in g.split(','):
        x = b.execute("select discipline from elements_meta where guid=?", (guid,)).fetchone()
        if not x or x[0] != disc: bad += 1
chk('M1', bad == 0, f"rows={len(rows)} src_guids with wrong discipline={bad}")
acmv = [r_ for r_ in rows if r_[0] == 'ACMV']
chk('M3', not acmv, f"ACMV rows={len(acmv)} (extraction records ACMV as MEP)")
# M2: a bound hash must exist among instances of ITS OWN discipline
cross = 0
for disc, cls, h, g in rows:
    n = b.execute("select count(*) from element_instances ei join elements_meta em on em.guid=ei.guid "
                  "where ei.geometry_hash=? and em.ifc_class=? and em.discipline=?", (h, cls, disc)).fetchone()[0]
    cross += (n == 0)
chk('M2', cross == 0, f"rows whose hash has no instance in own discipline={cross}")
print(f"§MESHBIND-DISC {'ALL PASS' if not fail else 'FAILED'}"); sys.exit(1 if fail else 0)
