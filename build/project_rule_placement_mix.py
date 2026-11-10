#!/usr/bin/env python3
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT
"""
project_rule_placement_mix.py — the mesh MIX of each measured band row, from the row's own source elements
(prompts/MODELLER_MASTER.md §BAND-MIX, the Q9 ruling: proportional allocation).

rule_placement.src_guids records the real elements a band row was measured from (at most 5 per row). This mines,
per row, the distinct real meshes among those elements into `rule_placement_mix`: k = how many of the row's N
recorded elements carry the mesh. The walker then gives a band row's devices these meshes in that proportion,
always provisional. NON-INVENT: only the row's own recorded elements; a guid not in the extraction adds nothing;
a row with none gets no rows (the walker refuses it, as before).

Usage: project_rule_placement_mix.py <rules_db> <building_extracted_db> [--sql <out.sql>]
  Without --sql the table is written into <rules_db> (a scratch copy). With --sql the rules DB is not changed and
  the table is written as a self-heal patch (CREATE IF NOT EXISTS + DELETE + INSERT), the shipped form.
Read the §PLACEMENT-MIX lines: the exit code is not the evidence.
"""
import os
import sqlite3
import sys

DDL = ("CREATE TABLE IF NOT EXISTS rule_placement_mix(disc TEXT, ifc_class TEXT, storey_scope TEXT, geometry_hash TEXT, "
       "k INTEGER, n INTEGER, src_guid TEXT, bbox_dx REAL, bbox_dy REAL, bbox_dz REAL, element_name TEXT, provenance TEXT, "
       "PRIMARY KEY (disc, ifc_class, storey_scope, geometry_hash));")


def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return repr(v)
    return "'" + str(v).replace("'", "''") + "'"


def mine(rules_db, bdb_path, log=print):
    con = sqlite3.connect("file:" + rules_db + "?mode=ro", uri=True)
    bdb = sqlite3.connect("file:" + bdb_path + "?mode=ro", uri=True)
    src = os.path.basename(bdb_path)
    out, rows_with, rows_without = [], 0, []
    for disc, cls, scope, guids, n_meas in con.execute(
            "SELECT disc, ifc_class, storey_scope, src_guids, n_measured FROM rule_placement "
            "WHERE n_measured > 0 AND src_guids IS NOT NULL ORDER BY disc, ifc_class, storey_scope").fetchall():
        found = []
        for g in [x.strip() for x in (guids or "").split(",") if x.strip()]:
            r = bdb.execute(
                "SELECT ei.guid, ei.geometry_hash, t.bbox_x, t.bbox_y, t.bbox_z, em.element_name FROM element_instances ei "
                "JOIN elements_meta em ON em.guid = ei.guid LEFT JOIN element_transforms t ON t.guid = ei.guid "
                "WHERE em.ifc_class = ? AND ei.guid LIKE '%'||? AND ei.geometry_hash IS NOT NULL", (cls, g)).fetchone()
            if r:
                found.append(r)
        if not found:
            rows_without.append(f"{disc}/{cls}/{scope}")
            continue
        rows_with += 1
        by = {}
        for r in found:
            by.setdefault(r[1], []).append(r)
        n = len(found)
        for h in sorted(by, key=lambda x: (-len(by[x]), x)):
            first = by[h][0]
            out.append((disc, cls, scope, h, len(by[h]), n, first[0], first[2], first[3], first[4], first[5],
                        f"measured:mesh of the row's own src_guids ({len(by[h])} of {n} recorded, n_measured={n_meas}):{src}"))
    log(f"§PLACEMENT-MIX {os.path.basename(rules_db)} <- {src}: rows={len(out)} ruleRowsWithMix={rows_with} "
        f"ruleRowsNoSourceFound={len(rows_without)} {rows_without}")
    con.close()
    bdb.close()
    return out


# run pieces are not devices (the walker's own _MAIN_PIECE_CLASSES): their mix rows are written, their meshes are not shipped
RUN_PIECES = ("IfcPipeSegment", "IfcPipeFitting", "IfcDuctSegment", "IfcDuctFitting", "IfcFlowSegment", "IfcFlowFitting")
GEO_DDL = "CREATE TABLE IF NOT EXISTS component_geometries (geometry_hash TEXT PRIMARY KEY, vertices BLOB, faces BLOB, building TEXT);"


def meshes(rows, bdb_path, log=print):
    """The real mesh payloads of the DEVICE mix rows, byte-verbatim from the extraction (the page resolves a walk mesh from the
    opened building's geometry, then from the rules DB itself, then from the rules' source building: modeller.html _dwResolveMeshes)."""
    bdb = sqlite3.connect("file:" + bdb_path + "?mode=ro", uri=True)
    want = sorted({r[3] for r in rows if r[1] not in RUN_PIECES})
    out, missing = [], []
    for h in want:
        g = bdb.execute("SELECT vertices, faces FROM component_geometries WHERE geometry_hash = ?", (h,)).fetchone()
        if not g or g[0] is None or g[1] is None:
            missing.append(h)
            continue
        out.append((h, bytes(g[0]), bytes(g[1])))
    bdb.close()
    log(f"§PLACEMENT-MIX meshes: device hashes={len(want)} shipped={len(out)} missing={len(missing)} {missing[:5]} "
        f"bytes={sum(len(v) + len(f) for _, v, f in out)} (rows only, no new geometry: byte-verbatim)")
    return out


def main():
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    sql_out = None
    for i, x in enumerate(sys.argv):
        if x == "--sql" and i + 1 < len(sys.argv):
            sql_out = sys.argv[i + 1]
            a = [y for y in a if y != sql_out]
    if len(a) != 2:
        print("usage: project_rule_placement_mix.py <rules_db> <building_extracted_db> [--sql <out.sql>]", file=sys.stderr)
        return 2
    rows = mine(a[0], a[1])
    cols = "disc,ifc_class,storey_scope,geometry_hash,k,n,src_guid,bbox_dx,bbox_dy,bbox_dz,element_name,provenance"
    if sql_out:
        L = [f"-- {os.path.basename(a[0])} rule_placement_mix - the mesh mix of each measured band row, from the row's own source elements.",
             "-- Generated by build/project_rule_placement_mix.py (bim-compiler, prompts/MODELLER_MASTER.md BAND-MIX) - regenerate, do not hand-edit.",
             f"-- Source: {os.path.basename(a[1])}. {len(rows)} rows. Idempotent: the table is rewritten whole on every load.",
             DDL, "DELETE FROM rule_placement_mix;"]
        for r in rows:
            L.append(f"INSERT INTO rule_placement_mix ({cols}) VALUES (" + ",".join(q(v) for v in r) + ");")
        geo = meshes(rows, a[1])
        if geo:
            L.append("-- the device meshes the mix names, byte-verbatim from the same extraction (a walk mesh is resolved from the rules DB when the opened building does not hold it)")
            L.append(GEO_DDL)
            src_b = os.path.basename(a[1]).replace("_extracted.db", "")
            for h, v, f in geo:
                L.append(f"INSERT OR REPLACE INTO component_geometries (geometry_hash, vertices, faces, building) VALUES ('{h}', X'{v.hex()}', X'{f.hex()}', '{src_b}');")
        with open(sql_out, "w") as fh:
            fh.write("\n".join(L) + "\n")
        print(f"§PLACEMENT-MIX wrote {sql_out} ({len(rows)} rows)")
    else:
        con = sqlite3.connect(a[0])
        con.execute("DROP TABLE IF EXISTS rule_placement_mix")
        con.execute(DDL)
        con.executemany(f"INSERT INTO rule_placement_mix ({cols}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", rows)
        con.commit()
        con.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
