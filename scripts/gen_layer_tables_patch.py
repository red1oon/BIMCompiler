#!/usr/bin/env python3
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT
"""
Emit a Modeller self-heal SQL patch carrying a building's AUTHORED LAYER TABLES —
`rel_material_layer_set` + `material_layers` + `surface_styles` (§LOD400-LAYERS-REAL,
RESUME_MODELLER_LOD400_REAL_GEOMETRY.md; sibling of gen_void_anchor_patch.py, same conventions).

WHY THIS EXISTS
---------------
The shipped `modeller/*_ARC.db` residents were packaged WITHOUT the material-layer tables (loss #3
in §LOD400-ENVELOPE's mechanism list) — even a Modeller that wanted to honour authored layers had
nothing to read. Per the project DB policy the residents receive the small text-friendly tables as
a SQL patch + the existing self-heal loader (`str_walker_outliner.js _applyPendingPatch`, convention
`modeller/patches/<dbFile>.sql`) — never a rebuilt binary crossing the network. The per-layer
GEOMETRY ships separately in the rebuilt *_geo.db (scripts/gen_layered_geo_db.py + object storage).

The Modeller-half §LOD400-ENVELOPE-GATE arms itself on exactly these rows: an element with a
multi-layer `rel_material_layer_set` edge whose resolved mesh has no `component_geometry_layers`
rows is REFUSED loudly (arc_editable.js §LAYER-GATE) — so ship this patch and the rebuilt geo file
TOGETHER (same slice), or the refusal empties the building's layered walls by design.

NON-INVENT: every row is read VERBATIM from a freshly-extracted DB produced by extractIFCtoDB.py
(the ONE implementation of layer extraction — provenance ifc:IfcMaterialLayerSetUsage /
IfcSurfaceStyle). Nothing derived here, nothing defaulted.

Idempotent: CREATE TABLE IF NOT EXISTS + INSERT OR IGNORE on each table's PRIMARY KEY, so the
loader re-applying it on every open is a no-op (same contract as the rel_fills_host patch).

Usage:
  python3 scripts/gen_layer_tables_patch.py --db <fresh_extracted.db> \
      --out <path/to/modeller/patches/X_ARC.db.sql> [--append]
  --append: append the section to an existing patch file (patch files are append-only).
"""
import argparse
import datetime
import sqlite3
import sys


def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, float):
        return repr(v)
    if isinstance(v, int):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


TABLES = {
    "rel_material_layer_set": (
        """CREATE TABLE IF NOT EXISTS rel_material_layer_set (
    element_guid TEXT PRIMARY KEY,
    layer_set_name TEXT,
    layer_count INTEGER,
    total_thickness_m REAL,
    layer_set_direction TEXT,
    direction_sense TEXT,
    offset_from_reference_line REAL,
    provenance TEXT DEFAULT 'ifc:IfcMaterialLayerSetUsage'
);""",
        ["element_guid", "layer_set_name", "layer_count", "total_thickness_m",
         "layer_set_direction", "direction_sense", "offset_from_reference_line", "provenance"],
        "ORDER BY element_guid"),
    "material_layers": (
        """CREATE TABLE IF NOT EXISTS material_layers (
    layer_set_name TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    material_name TEXT,
    thickness_m REAL,
    is_ventilated INTEGER DEFAULT 0,
    PRIMARY KEY (layer_set_name, sequence)
);""",
        ["layer_set_name", "sequence", "material_name", "thickness_m", "is_ventilated"],
        "ORDER BY layer_set_name, sequence"),
    "surface_styles": (
        """CREATE TABLE IF NOT EXISTS surface_styles (
    style_name TEXT PRIMARY KEY,
    surface_r REAL, surface_g REAL, surface_b REAL,
    transparency REAL DEFAULT 0.0,
    specular_r REAL, specular_g REAL, specular_b REAL,
    specular_ratio REAL,
    specular_exponent REAL,
    reflectance_method TEXT DEFAULT 'NOTDEFINED',
    side TEXT DEFAULT 'BOTH',
    source TEXT
);""",
        ["style_name", "surface_r", "surface_g", "surface_b", "transparency",
         "specular_r", "specular_g", "specular_b", "specular_ratio", "specular_exponent",
         "reflectance_method", "side", "source"],
        "ORDER BY style_name"),
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True, help="fresh extractIFCtoDB.py output carrying the layer tables")
    ap.add_argument("--out", required=True, help="patch file to write/append")
    ap.add_argument("--append", action="store_true", help="append section to an existing patch file")
    args = ap.parse_args()

    src = sqlite3.connect(args.db)
    for t in TABLES:
        if not src.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone():
            print("REFUSE: source db has no %s table — run a current extractIFCtoDB.py first" % t)
            return 1

    lines = []
    today = datetime.date.today().isoformat()
    lines.append("")
    lines.append("-- ============================================================================")
    lines.append("-- §LOD400-LAYERS-REAL — authored material-layer tables (Modeller half).")
    lines.append("-- Generated %s by scripts/gen_layer_tables_patch.py (bim-compiler) — regenerate," % today)
    lines.append("-- do not hand-edit. Source of truth: extractIFCtoDB.py extract_rel_material_layer_set()/")
    lines.append("-- extract_material_layers()/surface styles — provenance ifc:IfcMaterialLayerSetUsage.")
    lines.append("-- Read by arc_editable.js §LAYER-GATE: a multi-layer element whose resolved mesh carries")
    lines.append("-- no component_geometry_layers rows (rebuilt *_geo.db) is REFUSED, never envelope-rendered.")
    lines.append("-- Idempotent: CREATE IF NOT EXISTS + INSERT OR IGNORE on every PRIMARY KEY.")
    lines.append("-- ============================================================================")
    counts = {}
    for t, (ddl, cols, order) in TABLES.items():
        lines.extend(ddl.split("\n"))
        rows = src.execute("SELECT %s FROM %s %s" % (",".join(cols), t, order)).fetchall()
        counts[t] = len(rows)
        for r in rows:
            lines.append("INSERT OR IGNORE INTO %s (%s) VALUES (%s);"
                         % (t, ",".join(cols), ",".join(q(v) for v in r)))
    body = "\n".join(lines) + "\n"
    mode = "a" if args.append else "w"
    with open(args.out, mode) as f:
        f.write(body)
    print("§LAYER-PATCH wrote %s (%s): %s"
          % (args.out, "append" if args.append else "new",
             ", ".join("%s=%d" % (t, n) for t, n in counts.items())))
    return 0


if __name__ == "__main__":
    sys.exit(main())
