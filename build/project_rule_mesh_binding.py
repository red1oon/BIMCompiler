#!/usr/bin/env python3
"""
project_rule_mesh_binding.py — mine each (disc, ifc_class)'s DOMINANT real geometry_hash
from a building's own extraction (element_instances guid→geometry_hash) into its class
rules DB as `rule_mesh_binding`.

WHY (§NOSPACES N3, RESUME_DISC_WALKER_ENVELOPE_BOUND.md item 2, 2026-07-10): the no-spaces
measured placement path must satisfy the LOD400 law (WalkerDoctrine §11 UNBREAKABLE) —
every generated fixture carries a REAL mesh reference or REFUSEs. The walker reads RULES
ONLY (anti-cheat: it never opens the building's MEP rows), so the binding must live in the
rules DB, mined here once from measured data — the same projection doctrine as
project_rule_space_schedule.py / project_rule_shim.py.

NON-INVENT: the hash is the statistical MODE of the class's real instances (most-frequent
real geometry_hash — a measured majority, never a synthesized or borrowed shape); n_of/n_total
records how dominant it is; src_guids samples the real elements it came from. A class absent
from the extraction gets NO row → the walker REFUSEs it honestly.

DISCIPLINE (§MESHBIND-DISC, MODELLER_MASTER.md, 2026-11-10): instances are filtered by the discipline the
extraction records (elements_meta.discipline == the rule row's disc); none = no row = walker REFUSEs.

DISC MAPPING: (disc, ifc_class) pairs come from the rules DB's own rule_placement rows —
the classes the walker can generate — never from a hand list.

ALSO STAMPS `z_datum_offset` into rules_meta (§NOSPACES frame reconciliation, measured this
session): rule_placement's z-bands were baked in the 2026-06-28 extraction's building-datum
frame; the extraction has since been re-datumed to the site frame (+~14.59 m). The offset is
MEASURED per rule row as median(current site z of the row's own src_guids) − band midpoint,
then the median across rows is stamped (this run: 14.593, MAD 0.33 over 37 rows). The walker
adds it to every band it uses — no constant lives in code.

ALSO STAMPS `rule_frame_ref` (§TE-ARC-DATUM-FIX, RESUME_DISC_WALKER_ENVELOPE_BOUND.md, 2026-07-10):
per-class reference z-stats (n, mean center_z in the BAND frame) for every non-generatable class —
the walker measures the band→substrate z-offset at WALK time (median of per-class deltas vs the
walked db) so shipped substrates in a different frame (Terminal_ARC.db = raw-IFC building frame,
−14.66 m from the extraction's site frame) reconcile without baking any one target frame.

Usage: project_rule_mesh_binding.py <rules_db> <building_extracted_db>
"""
import os
import sqlite3
import statistics
import sys


def project(rules_db, bdb_path, log=print):
    for p in (rules_db, bdb_path):
        if not os.path.exists(p):
            log(f"§MESHBIND-PROJ SKIP — {p} missing")
            return 0
    con = sqlite3.connect(rules_db)
    bdb = sqlite3.connect(bdb_path)
    cur = con.cursor()
    pairs = cur.execute(
        "SELECT DISTINCT disc, ifc_class FROM rule_placement WHERE n_measured > 0").fetchall()
    cur.executescript("""
        DROP TABLE IF EXISTS rule_mesh_binding;
        CREATE TABLE rule_mesh_binding(
            disc TEXT, ifc_class TEXT, geometry_hash TEXT,
            n_of INTEGER, n_total INTEGER, provenance TEXT, src_guids TEXT,
            PRIMARY KEY (disc, ifc_class));
    """)
    n, absent = 0, []
    src_name = os.path.basename(bdb_path)
    for disc, cls in pairs:
        row = bdb.execute(
            "SELECT ei.geometry_hash, COUNT(*) c,"
            " (SELECT COUNT(*) FROM element_instances e2"
            "   JOIN elements_meta m2 ON m2.guid = e2.guid WHERE m2.ifc_class = ? AND m2.discipline = ?) total,"
            " GROUP_CONCAT(ei.guid) guids"
            " FROM element_instances ei JOIN elements_meta em ON em.guid = ei.guid"
            " WHERE em.ifc_class = ? AND em.discipline = ? AND ei.geometry_hash IS NOT NULL"
            " GROUP BY ei.geometry_hash ORDER BY c DESC, ei.geometry_hash LIMIT 1",
            (cls, disc, cls, disc)).fetchone()
        if not row or not row[0]:
            absent.append(f"{disc}/{cls}")
            continue
        ghash, n_of, n_total, guids = row
        cur.execute("INSERT INTO rule_mesh_binding VALUES (?,?,?,?,?,?,?)",
                    (disc, cls, ghash, n_of, n_total,
                     f"measured:mode-of-real-instances:{src_name}",
                     ",".join((guids or "").split(",")[:5])))
        n += 1
    # z-datum offset: rules-band frame → the extraction's CURRENT frame, measured from each
    # rule row's own src_guids (see docstring). Stamped only if rule rows resolve.
    offs = []
    for lo, hi, guids in cur.execute(
            "SELECT z_band_lo, z_band_hi, src_guids FROM rule_placement "
            "WHERE z_band_lo IS NOT NULL AND z_band_hi IS NOT NULL AND src_guids IS NOT NULL"
    ).fetchall():
        zs = []
        for g in (guids or "").split(",")[:5]:
            row = bdb.execute("SELECT center_z FROM element_transforms WHERE guid LIKE '%'||?",
                              (g.strip(),)).fetchone()
            if row:
                zs.append(row[0])
        if zs:
            offs.append(statistics.median(zs) - (lo + hi) / 2.0)
    if offs:
        z_off = round(statistics.median(offs), 3)
        mad = round(statistics.median([abs(o - z_off) for o in offs]), 3)
        cur.execute("INSERT OR REPLACE INTO rules_meta VALUES ('z_datum_offset', ?)", (str(z_off),))
        cur.execute("INSERT OR REPLACE INTO rules_meta VALUES ('z_datum_offset_prov', ?)",
                    (f"measured:median(src_guids site z - band mid) over {len(offs)} rows, MAD={mad}, src={src_name}",))
        log(f"§MESHBIND-PROJ z_datum_offset={z_off} (MAD={mad}, {len(offs)} rows) stamped into rules_meta")
    # rule_frame_ref (§TE-ARC-DATUM-FIX): per-class reference z-stats in the BAND frame, so the walker
    # can MEASURE the band→substrate offset at walk time from whatever copy/frame it is handed, instead
    # of applying the one mine-time z_datum_offset to every substrate. Classes: non-generatable (never
    # in rule_placement — same anti-cheat set the walker's envelope query uses), != IfcSpace, n≥5.
    z_off_used = round(statistics.median(offs), 3) if offs else 0.0
    gen_cls = [c for (_, c) in pairs] + [r[0] for r in cur.execute(
        "SELECT DISTINCT ifc_class FROM rule_placement").fetchall()]
    ph = ",".join("?" * len(set(gen_cls)))
    refs = bdb.execute(
        "SELECT em.ifc_class, COUNT(*) n, AVG(t.center_z) mz FROM elements_meta em"
        " JOIN element_transforms t ON t.guid = em.guid"
        f" WHERE em.ifc_class NOT IN ({ph}) AND em.ifc_class != 'IfcSpace'"
        " GROUP BY em.ifc_class HAVING COUNT(*) >= 5", sorted(set(gen_cls))).fetchall()
    cur.executescript("""
        DROP TABLE IF EXISTS rule_frame_ref;
        CREATE TABLE rule_frame_ref(
            ifc_class TEXT PRIMARY KEY, n INTEGER, mean_z REAL, provenance TEXT);
    """)
    for cls, cnt, mz in refs:
        cur.execute("INSERT INTO rule_frame_ref VALUES (?,?,?,?)",
                    (cls, cnt, round(mz - z_off_used, 4),
                     f"measured:AVG(center_z)-z_datum_offset({z_off_used}):{src_name}"))
    log(f"§MESHBIND-PROJ rule_frame_ref: {len(refs)} non-generatable class refs stamped (band frame)")
    con.commit()
    log(f"§MESHBIND-PROJ {os.path.basename(rules_db)} ← {src_name}: {n} class bindings "
        f"from {len(pairs)} (disc,ifc_class) pairs"
        + (f"; NO-REAL-MESH (walker must REFUSE): {absent}" if absent else ""))
    con.close()
    bdb.close()
    return n


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("usage: project_rule_mesh_binding.py <rules_db> <building_extracted_db>",
              file=sys.stderr)
        sys.exit(2)
    project(sys.argv[1], sys.argv[2])
