#!/usr/bin/env python3
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT
"""
Emit the spatial_structure section of a Modeller self-heal patch: the building's own storeys and
IfcSpace rooms (prompts/MODELLER_MASTER.md §SH-ROOMS; WalkerDoctrine §14).

WHY: a resident whose shipped modeller/<X>_ARC.db has no spatial_structure table walks measured bands
instead of room schedules, although its source IFC states its rooms. The rooms are already extracted
(<X>_extracted.db spatial_structure, boxes tessellated once by the extractor); this ships them to the
ARC DB as SQL, applied at open by str_walker_outliner.js _applyPendingPatch. Never a rebuilt binary.

NON-INVENT: rows are copied from the extracted DB; a row is kept only if the source IFC carries its
GlobalId; a space's object_type is the IFC's own LongName, verbatim (the room-type key disc_walker.js
spacesOf reads; same copy stamp_space_longnames.py makes). Nothing is computed or guessed.

The section is written between markers and replaces an earlier one; other generated sections of the
same patch file (rel_fills_host, rel_aggregates) are left as they are.

Usage:
  python3 scripts/gen_spatial_rooms_patch.py --extracted <X_extracted.db> --ifc <source.ifc> \
      --target <modeller/X_ARC.db> --out <modeller/patches/X_ARC.db.sql>
Read the printed §ROOMS-PATCH line: the exit code is not the evidence.
"""
import argparse
import datetime
import os
import sqlite3
import sys

BEGIN = "-- >>> spatial_structure (generated: scripts/gen_spatial_rooms_patch.py, bim-compiler - regenerate, do not hand-edit)"
END = "-- <<< spatial_structure"
COLS = ["guid", "type", "name", "parent_guid", "object_type", "predefined_type",
        "center_x", "center_y", "center_z", "size_x", "size_y", "size_z"]
DDL = ("CREATE TABLE IF NOT EXISTS spatial_structure (guid TEXT PRIMARY KEY, type TEXT NOT NULL, name TEXT, "
       "parent_guid TEXT, object_type TEXT, predefined_type TEXT, center_x REAL, center_y REAL, center_z REAL, "
       "size_x REAL, size_y REAL, size_z REAL);")


def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return repr(v)
    return "'" + str(v).replace("'", "''") + "'"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--extracted", required=True)
    ap.add_argument("--ifc", required=True)
    ap.add_argument("--target", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    import ifcopenshell
    ifc = ifcopenshell.open(a.ifc)
    in_ifc = {}
    for cls in ("IfcProject", "IfcSite", "IfcBuilding", "IfcBuildingStorey", "IfcSpace"):
        for e in ifc.by_type(cls):
            in_ifc[e.GlobalId] = e
    ifc_spaces = len(ifc.by_type("IfcSpace"))

    src = sqlite3.connect("file:" + a.extracted + "?mode=ro", uri=True)
    rows = src.execute("SELECT " + ",".join(COLS) + " FROM spatial_structure ORDER BY "
                       "CASE type WHEN 'IfcBuilding' THEN 0 WHEN 'IfcBuildingStorey' THEN 1 ELSE 2 END, name, guid").fetchall()
    kept, dropped, named = [], [], 0
    for r in rows:
        r = list(r)
        e = in_ifc.get(r[0])
        if e is None or e.is_a() != r[1]:
            dropped.append(r[0])
            continue
        if r[1] == "IfcSpace":
            ln = getattr(e, "LongName", None)
            if ln:
                r[4] = ln
                named += 1
        kept.append(r)
    spaces = [r for r in kept if r[1] == "IfcSpace"]
    storeys = [r for r in kept if r[1] == "IfcBuildingStorey"]
    dbfile = os.path.basename(a.target)
    if not spaces:
        print(f"  §ROOMS-PATCH {dbfile}: 0 IfcSpace rows (IFC states {ifc_spaces}) - nothing to ship. No file written.")
        return 1

    # the frame, measured: the rooms' own extent against the target DB's element extent
    boxed = [r for r in spaces if r[6] is not None and r[9]]
    rx = [min(r[6] - r[9] / 2 for r in boxed), max(r[6] + r[9] / 2 for r in boxed),
          min(r[7] - r[10] / 2 for r in boxed), max(r[7] + r[10] / 2 for r in boxed)]
    tgt = sqlite3.connect("file:" + a.target + "?mode=ro", uri=True)
    tx = tgt.execute("SELECT min(center_x-bbox_x/2), max(center_x+bbox_x/2), min(center_y-bbox_y/2), max(center_y+bbox_y/2) "
                     "FROM element_transforms").fetchone()
    had = tgt.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='spatial_structure'").fetchone()[0]

    sec = [
        BEGIN,
        f"-- {dbfile} spatial_structure - the building's own storeys and IfcSpace rooms (MODELLER_MASTER.md SH-ROOMS, WalkerDoctrine 14).",
        f"-- Source: {os.path.basename(a.ifc)} via {os.path.basename(a.extracted)}   Generated: {datetime.date.today().isoformat()} (ifcopenshell {ifcopenshell.version})",
        f"-- Copied VERBATIM: {len(kept)} rows ({len(storeys)} storeys, {len(spaces)} spaces; the IFC states {ifc_spaces} IfcSpace). object_type of a space = its IFC LongName ({named} named).",
        "-- Nothing computed here: the boxes are the extractor's own tessellation of each space's Representation.",
        "-- Idempotent: CREATE IF NOT EXISTS + INSERT OR IGNORE on the guid PRIMARY KEY.",
        DDL,
    ]
    for r in kept:
        sec.append("INSERT OR IGNORE INTO spatial_structure (" + ",".join(COLS) + ") VALUES (" + ",".join(q(v) for v in r) + ");")
    sec.append(END)

    old = open(a.out).read() if os.path.exists(a.out) else ""
    if BEGIN in old and END in old:
        i, j = old.index(BEGIN), old.index(END) + len(END)
        new = old[:i] + "\n".join(sec) + old[j:]
    else:
        new = (old.rstrip("\n") + "\n\n" if old.strip() else "") + "\n".join(sec) + "\n"
    with open(a.out, "w") as fh:
        fh.write(new)
    print(f"  §ROOMS-PATCH {dbfile}: rows={len(kept)} storeys={len(storeys)} rooms={len(spaces)} ifcSpaces={ifc_spaces} named={named} "
          f"notInIfc={len(dropped)} targetHadTable={had} frame: rooms=[{rx[0]:.2f},{rx[1]:.2f}]x[{rx[2]:.2f},{rx[3]:.2f}] "
          f"target=[{tx[0]:.2f},{tx[1]:.2f}]x[{tx[2]:.2f},{tx[3]:.2f}] -> {a.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
