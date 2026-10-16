#!/usr/bin/env python3
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT
"""
Emit a Modeller self-heal SQL patch carrying a building's §ANCHOR rows — the VOID-CONSUMED hosts'
placement + pre-boolean body extent (RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §START HERE OPEN 1,
USER-APPROVED 2026-07-30 with one binding condition: anchors UNMISTAKABLE + excluded from every
count/pick/audit).

WHY THIS EXISTS
---------------
A `kozijn` host wall is fully consumed by its own authored opening, so it correctly has no geometry,
no scene feature, and `stretchRide()` skips its edge — SampleCastle reach 9/74 because 65/71 hosts
are void-consumed. The extractor now persists what it already computes for those hosts (world
placement from `shape.transformation.matrix` + the pre-boolean Body ITEM's LOCAL bbox extent from
the `is_void_consumed()` classification tessellation) as elements_meta rows flagged `is_anchor=1`
plus element_transforms rows with `transform_source='void_anchor'`. Per the project DB policy the
shipped `modeller/*_ARC.db` residents receive those rows as a SQL patch + the existing self-heal
loader (`str_walker_outliner.js _applyPendingPatch`, convention `modeller/patches/<dbFile>.sql`) —
never a rebuilt binary crossing the network.

NON-INVENT: every value is EXTRACTED — read verbatim from a freshly-extracted DB produced by
extractIFCtoDB.py (the ONE implementation of the placement decomposition and the classification
tessellation). Nothing derived here, nothing defaulted. The `building` column value (target schema)
is read from the TARGET's own existing rows.

FRAME GUARD: anchor centers are only correct for the target if the fresh extraction and the shipped
DB share the same normalized building frame. MEASURED (SampleCastle, 2026-07-30): the shipped ARC
element_transforms store the world-AABB MIDPOINT as center, NOT the placement origin the extractor's
element_transforms store — so the guard compares like with like: the fresh extraction's
elements_rtree AABB midpoints vs the target's centers, over every shared guid, and REFUSES to write
if the per-axis |mean Δ| (a systematic frame shift) exceeds 0.05 m. Per-element scatter is reported
but not fatal (it reflects tessellator-version AABB drift, not a frame error). The anchor rows
themselves ship the EXTRACTOR convention — center = placement origin, bbox = pre-boolean LOCAL
extent, marked by transform_source='void_anchor' — the consuming anchorOnly branch keys on that
marker, never on the shipped rows' midpoint convention.

ALTER-TABLE NOTE: `_applyPendingPatch` always applies the patch to the RAW shipped bytes (IDB caches
the unpatched buffer), so the two ALTER TABLE ADD COLUMN statements never run twice on the same
buffer. If a future rebuilt binary already carries the columns, the whole patch exec fails and the
loader falls back to the unpatched buffer — retire the patch when the binary is rebuilt.

Usage:
  python3 scripts/gen_void_anchor_patch.py --db <fresh_extracted.db> \
      --target <path/to/X_ARC.db> --out <path/to/modeller/patches/X_ARC.db.sql> [--append]
  --append: emit only the §ANCHOR section (no file header) for appending to an existing patch file.
"""
import argparse
import datetime
import os
import sqlite3
import sys


def sql_quote(v):
    if v is None:
        return "NULL"
    if isinstance(v, float):
        return repr(v)
    if isinstance(v, int):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def columns(conn, table):
    try:
        return [r[1] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()]
    except sqlite3.OperationalError:
        return []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True, help="freshly-extracted DB carrying is_anchor rows")
    ap.add_argument("--target", required=True, help="shipped modeller/<X>_ARC.db this patch applies to")
    ap.add_argument("--out", required=True, help="output .sql path")
    ap.add_argument("--append", action="store_true",
                    help="append the §ANCHOR section to an existing patch file instead of overwriting")
    args = ap.parse_args()

    src = sqlite3.connect("file:" + args.db + "?mode=ro", uri=True)
    tgt = sqlite3.connect("file:" + args.target + "?mode=ro", uri=True)
    dbfile = os.path.basename(args.target)

    anchors = src.execute("""
        SELECT m.guid, m.ifc_class, m.element_name, m.element_type, m.storey, m.discipline,
               m.material_name, m.material_rgba,
               t.center_x, t.center_y, t.center_z,
               t.rotation_x, t.rotation_y, t.rotation_z,
               t.bbox_x, t.bbox_y, t.bbox_z
        FROM elements_meta m JOIN element_transforms t ON t.guid = m.guid
        WHERE m.is_anchor = 1 AND t.transform_source = 'void_anchor'
        ORDER BY m.guid
    """).fetchall()
    if not anchors:
        print(f"  §VA-PATCH {os.path.basename(args.db)}: 0 anchor rows — nothing to ship. No file written.")
        return 1

    # FRAME GUARD — measure, never assume: same normalized frame on both sides? Shipped ARC
    # element_transforms store AABB MIDPOINTS (measured 2026-07-30, see module docstring), so compare
    # the fresh extraction's rtree AABB midpoints against the target's centers. A frame shift is
    # SYSTEMATIC ⇒ guard on the per-axis |mean Δ|; per-element scatter is reported, not fatal.
    src_mid = {}
    for g, mnx, mxx, mny, mxy, mnz, mxz in src.execute("""
        SELECT m.guid, r.minX, r.maxX, r.minY, r.maxY, r.minZ, r.maxZ
        FROM elements_meta m JOIN elements_rtree r ON r.id = m.id
        WHERE COALESCE(m.is_anchor,0) = 0"""):
        src_mid[g] = ((mnx + mxx) / 2, (mny + mxy) / 2, (mnz + mxz) / 2)
    n_shared = 0
    sum_d = [0.0, 0.0, 0.0]
    max_scatter = 0.0
    for g, x, y, z in tgt.execute(
            "SELECT guid, center_x, center_y, center_z FROM element_transforms"):
        sm = src_mid.get(g)
        if sm is None:
            continue
        n_shared += 1
        d = (sm[0] - x, sm[1] - y, sm[2] - z)
        for i in range(3):
            sum_d[i] += d[i]
        max_scatter = max(max_scatter, abs(d[0]), abs(d[1]), abs(d[2]))
    if n_shared == 0:
        print(f"  §VA-PATCH-FRAME-MISMATCH {dbfile}: 0 shared guids between fresh DB and target — "
              f"wrong building? REFUSING to write.")
        return 1
    mean_d = [s / n_shared for s in sum_d]
    max_mean = max(abs(v) for v in mean_d)
    if max_mean > 0.05:
        print(f"  §VA-PATCH-FRAME-MISMATCH {dbfile}: systematic per-axis mean Δ = "
              f"({mean_d[0]:.4f},{mean_d[1]:.4f},{mean_d[2]:.4f}) m over {n_shared} shared guids — "
              f"frames diverge, anchor centers would be WRONG for this target. REFUSING to write.")
        return 1

    tgt_meta_cols = columns(tgt, "elements_meta")
    tgt_tr_cols = columns(tgt, "element_transforms")
    if not tgt_meta_cols or not tgt_tr_cols:
        print(f"  §VA-PATCH {dbfile}: target lacks elements_meta/element_transforms — not an ARC db?")
        return 1

    # `building` value (target schema only): extracted from the target's own rows.
    building = None
    if "building" in tgt_meta_cols:
        row = tgt.execute("SELECT building FROM elements_meta "
                          "WHERE building IS NOT NULL LIMIT 1").fetchone()
        building = row[0] if row else None

    already_meta = sum(1 for a in anchors if tgt.execute(
        "SELECT 1 FROM elements_meta WHERE guid=?", (a[0],)).fetchone())
    already_tr = sum(1 for a in anchors if tgt.execute(
        "SELECT 1 FROM element_transforms WHERE guid=?", (a[0],)).fetchone())
    stray_inst = sum(1 for a in anchors if tgt.execute(
        "SELECT 1 FROM element_instances WHERE guid=?", (a[0],)).fetchone())
    if stray_inst:
        print(f"  §VA-PATCH {dbfile}: {stray_inst} anchor guid(s) HAVE element_instances rows in the "
              f"target — they are rendered there, not void-consumed. REFUSING to write.")
        return 1

    # Source values available per fresh-DB column name.
    src_val_names = ["guid", "ifc_class", "element_name", "element_type", "storey", "discipline",
                     "material_name", "material_rgba"]

    out = []
    if not args.append:
        out.append(f"-- {dbfile} patch — generated by scripts/gen_void_anchor_patch.py (bim-compiler).")
    out += [
        "",
        "-- ── §ANCHOR — void-consumed hosts persisted as non-rendered logical anchors ──",
        "-- RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §START HERE OPEN 1 — USER-APPROVED 2026-07-30,",
        "-- binding condition: anchors are UNMISTAKABLE (is_anchor=1 + transform_source='void_anchor')",
        "-- and EXCLUDED from every count, pick, and audit. NO element_instances rows are added —",
        "-- an anchor has no geometry hash, nothing to render (§GEOM-HARDFAIL untouched).",
        f"-- Source: fresh extraction {os.path.basename(args.db)}   Generated: "
        f"{datetime.date.today().isoformat()}",
        f"-- {len(anchors)} anchors; target already had {already_meta}/{len(anchors)} meta rows "
        f"(the meta-only population) and {already_tr}/{len(anchors)} transform rows.",
        f"-- Frame guard: per-axis mean Δ = ({mean_d[0]:.4f},{mean_d[1]:.4f},{mean_d[2]:.4f}) m "
        f"(systematic, ≤ 0.05 m), worst per-element scatter {max_scatter:.3f} m over {n_shared} shared guids.",
        "-- element_transforms values: center+rotation from shape.transformation.matrix;",
        "-- bbox_x/y/z = pre-boolean Body ITEM LOCAL extent (NOT world AABB) — 'void_anchor' marks",
        "-- the convention. Idempotent inserts; ALTERs run on RAW shipped bytes only (see generator).",
        "ALTER TABLE elements_meta ADD COLUMN is_anchor INTEGER DEFAULT 0;",
        "ALTER TABLE element_transforms ADD COLUMN transform_source TEXT;",
    ]

    ins_meta_cols = [c for c in tgt_meta_cols if c in src_val_names or c in ("building", "is_anchor")]
    guids = []
    for a in anchors:
        (guid, ifc_class, element_name, element_type, storey, discipline,
         material_name, material_rgba,
         cx, cy, cz, rx, ry, rz, bx, by, bz) = a
        guids.append(guid)
        src_vals = {"guid": guid, "ifc_class": ifc_class, "element_name": element_name,
                    "element_type": element_type, "storey": storey, "discipline": discipline,
                    "material_name": material_name, "material_rgba": material_rgba,
                    "building": building, "is_anchor": 1}
        out.append("INSERT OR IGNORE INTO elements_meta (" + ",".join(ins_meta_cols) + ") VALUES ("
                   + ",".join(sql_quote(src_vals[c]) for c in ins_meta_cols) + ");")
        tr_vals = ["guid", "center_x", "center_y", "center_z",
                   "rotation_x", "rotation_y", "rotation_z", "bbox_x", "bbox_y", "bbox_z"]
        tr_data = dict(zip(tr_vals, [guid, cx, cy, cz, rx, ry, rz, bx, by, bz]))
        cols_tr = [c for c in tr_vals if c in tgt_tr_cols] + ["transform_source"]
        out.append("INSERT OR IGNORE INTO element_transforms (" + ",".join(cols_tr) + ") VALUES ("
                   + ",".join(sql_quote(tr_data[c]) for c in cols_tr[:-1]) + ",'void_anchor');")
    # The meta-only rows that already exist in the target are untouched by INSERT OR IGNORE —
    # flag them too.
    guid_list = ",".join(sql_quote(g) for g in guids)
    out.append(f"UPDATE elements_meta SET is_anchor=1 WHERE guid IN ({guid_list});")
    out.append(f"UPDATE element_transforms SET transform_source='void_anchor' "
               f"WHERE guid IN ({guid_list}) AND transform_source IS NULL;")

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    mode = "a" if args.append and os.path.exists(args.out) else "w"
    with open(args.out, mode) as fh:
        fh.write("\n".join(out) + "\n")
    print(f"  §VA-PATCH {dbfile}: {len(anchors)} anchors "
          f"(meta already present {already_meta}, transforms already present {already_tr}, "
          f"frame meanΔ {max_mean:.4f} m, scatter {max_scatter:.3f} m) → {args.out} ({'append' if mode == 'a' else 'write'})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
