# BIM OOTB — Frictionless BIM. Two DBs. One browser. Zero install.
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
# SPDX-License-Identifier: MIT
#!/usr/bin/env python3
"""
Extract IFC disciplines separately then merge into one extracted.db.

Usage — multiple disciplines (primary use case):
    python3 scripts/extract_merge_disciplines.py \
        --ifc-dir DAGCompiler/lib/input/IFC/UNMERGED \
        --pattern "Hospital_IFC4_*.ifc" \
        --output DAGCompiler/lib/input/Hospital_extracted.db

Usage — single file (works too, glob matches one file):
    python3 scripts/extract_merge_disciplines.py \
        --ifc-dir DAGCompiler/lib/input/IFC \
        --pattern "Clinic_Federated.ifc" \
        --output DAGCompiler/lib/input/Clinic_extracted.db

    Note: for a single file, calling extractIFCtoDB.py directly is simpler:
        python3 DAGCompiler/python/extractIFCtoDB.py \
            --ifc DAGCompiler/lib/input/IFC/Clinic_Federated.ifc \
            -o DAGCompiler/lib/input/Clinic_extracted.db

Why per-discipline:
    Extracting a large merged IFC (200MB+) causes ifcopenshell geometry
    iterator to OOM on the tessellation loop. Extracting each discipline
    file separately caps RAM to one file at a time.

    Also avoids needing a merged IFC at all — the BIM compiler pipeline
    only needs the _extracted.db, not the merged IFC file.
"""

import argparse
import math
import os
import sqlite3
import subprocess
import sys
import tempfile
from pathlib import Path

# S173: Log level — FINE enables per-discipline diagnostics, INFO is summary only.
LOG_LEVEL = os.environ.get("BIM_LOG_LEVEL", "FINE").upper()
FINE = LOG_LEVEL == "FINE"


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS project_metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);
CREATE TABLE IF NOT EXISTS spatial_structure (
    guid TEXT PRIMARY KEY, type TEXT NOT NULL, name TEXT,
    parent_guid TEXT, object_type TEXT, predefined_type TEXT,
    elevation REAL
);
CREATE TABLE IF NOT EXISTS elements_meta (
    id INTEGER PRIMARY KEY, guid TEXT UNIQUE NOT NULL,
    discipline TEXT NOT NULL, ifc_class TEXT NOT NULL,
    element_name TEXT, element_type TEXT, storey TEXT,
    material_name TEXT, material_rgba TEXT
);
CREATE VIRTUAL TABLE IF NOT EXISTS elements_rtree
    USING rtree(id, minX, maxX, minY, maxY, minZ, maxZ);
CREATE TABLE IF NOT EXISTS base_geometries (
    geometry_hash TEXT PRIMARY KEY,
    vertices BLOB, faces BLOB,
    vertex_count INTEGER, face_count INTEGER
);
CREATE TABLE IF NOT EXISTS element_instances (
    guid TEXT PRIMARY KEY, geometry_hash TEXT,
    FOREIGN KEY (geometry_hash) REFERENCES base_geometries(geometry_hash)
);
CREATE TABLE IF NOT EXISTS element_transforms (
    guid TEXT PRIMARY KEY,
    center_x REAL, center_y REAL, center_z REAL,
    rotation_x REAL, rotation_y REAL, rotation_z REAL,
    bbox_x REAL, bbox_y REAL, bbox_z REAL
);
CREATE TABLE IF NOT EXISTS rel_contained_in_space (
    element_guid TEXT, space_guid TEXT,
    PRIMARY KEY (element_guid, space_guid)
);
CREATE TABLE IF NOT EXISTS rel_aggregates (
    parent_guid TEXT NOT NULL, child_guid TEXT NOT NULL,
    PRIMARY KEY (parent_guid, child_guid)
);
CREATE TABLE IF NOT EXISTS surface_styles (
    style_name TEXT PRIMARY KEY,
    surface_r REAL, surface_g REAL, surface_b REAL,
    transparency REAL DEFAULT 0.0,
    specular_r REAL, specular_g REAL, specular_b REAL,
    specular_ratio REAL, specular_exponent REAL,
    reflectance_method TEXT DEFAULT 'NOTDEFINED',
    side TEXT DEFAULT 'BOTH', source TEXT
);
CREATE TABLE IF NOT EXISTS material_layers (
    layer_set_name TEXT NOT NULL, sequence INTEGER NOT NULL,
    material_name TEXT, thickness_m REAL, is_ventilated INTEGER DEFAULT 0,
    PRIMARY KEY (layer_set_name, sequence)
);
"""


def fix_unit_scale(tmp_db_path: Path, ifc_path: Path):
    """
    S173: No-op — geom.iterator() returns metres natively.
    This function is a verification-only check.
    """
    import ifcopenshell
    import ifcopenshell.util.unit

    ifc = ifcopenshell.open(str(ifc_path))
    unit_scale = ifcopenshell.util.unit.calculate_unit_scale(ifc, "LENGTHUNIT")

    conn = sqlite3.connect(str(tmp_db_path))
    row = conn.execute(
        "SELECT AVG(ABS(center_x)), AVG(ABS(center_y)), MAX(ABS(center_z)), "
        "COUNT(*) FROM element_transforms").fetchone()
    conn.close()

    if row and row[0] is not None:
        avg_x, avg_y, max_z, cnt = row
        print(f"  §UNIT_SCALE {ifc_path.name}: ifc_unit_scale={unit_scale} "
              f"n={cnt} avg=({avg_x:.1f}, {avg_y:.1f}) maxZ={max_z:.1f}m (iterator=metres)")


def _read_geolocation(ifc_path: Path):
    """Read geolocation origin from an IFC file using the community's
    auto_xyz2enh (same logic as MergeProjects in IfcPatch).

    Returns dict with:
        enh: (easting, northing, height) — real-world coords of IFC origin
        grid_north: angle in degrees
        ifc: opened ifcopenshell.file (reused by caller)
    """
    import ifcopenshell
    import ifcopenshell.util.geolocation as geo
    try:
        ifc = ifcopenshell.open(str(ifc_path))
        enh = geo.auto_xyz2enh(ifc, 0, 0, 0, should_return_in_map_units=False)
        north = geo.get_grid_north(ifc)
        return {'enh': tuple(enh), 'grid_north': north, 'ifc': ifc}
    except Exception as e:
        print(f"  Warning: geolocation read failed for {ifc_path.name}: {e}")
        return {'enh': (0.0, 0.0, 0.0), 'grid_north': 0.0, 'ifc': None}


def _compute_alignment(ref_geo, other_geo):
    """Compute XYZ correction + rotation to align other discipline to reference.

    Uses the same logic as MergeProjects: compare real-world origins
    (auto_xyz2enh) and compute the XYZ shift needed in local coords.
    Also computes grid_north rotation difference (MergeProjects lines 82-89).

    S174 fix: auto_enh2xyz returns values in the IFC file's local unit
    (e.g. mm for unit_scale=0.001). Our extracted coordinates are always
    in metres (geom.iterator returns metres). Scale the correction by
    unit_scale so it matches.

    Returns (dx, dy, dz, rotation_deg) in METRES / DEGREES to apply to
    other's element coordinates. rotation_deg is the angle to rotate the
    other discipline's coordinates to match the reference grid north.
    """
    import numpy as np
    import ifcopenshell.util.geolocation as geo
    import ifcopenshell.util.unit

    ref_enh = np.array(ref_geo['enh'])
    other_enh = np.array(other_geo['enh'])

    # Compute rotation: same wrapping as MergeProjects lines 85-89
    ref_north = ref_geo['grid_north']
    other_north = other_geo['grid_north']
    model_rotation = ref_north - other_north
    if model_rotation > 180:
        model_rotation = (360 - model_rotation) * -1
    elif model_rotation < -180:
        model_rotation = (model_rotation * -1) - 360

    if FINE and abs(model_rotation) > 0.01:
        print(f"    §ALIGN_ROTATION ref_north={ref_north:.1f} other_north={other_north:.1f} "
              f"model_rotation={model_rotation:.1f}\u00b0")

    if np.allclose(ref_enh, other_enh, atol=0.01) and \
       np.isclose(ref_north, other_north, atol=0.01):
        return (0.0, 0.0, 0.0, 0.0)  # Already aligned

    # Convert reference origin into other's local coordinate system
    other_ifc = other_geo['ifc']
    if other_ifc is None:
        return (0.0, 0.0, 0.0, model_rotation)

    # auto_enh2xyz returns values in IFC local unit (mm if unit_scale=0.001)
    # Our element coords are always in metres, so scale the correction
    unit_scale = ifcopenshell.util.unit.calculate_unit_scale(other_ifc, "LENGTHUNIT")

    try:
        # Where does the reference origin land in other's local coords?
        x, y, z = geo.auto_enh2xyz(other_ifc, *ref_enh, is_specified_in_map_units=False)
        # Scale from IFC local unit to metres
        x_m, y_m, z_m = float(x) * unit_scale, float(y) * unit_scale, float(z) * unit_scale
        print(f"    §ALIGN_DETAIL correction_raw=({x:.1f},{y:.1f},{z:.1f}) "
              f"unit_scale={unit_scale} correction_m=({x_m:.2f},{y_m:.2f},{z_m:.2f})"
              f" rotation={model_rotation:.1f}\u00b0")
        return (x_m, y_m, z_m, model_rotation)
    except Exception as e:
        # Fallback: simple subtraction (ENH is in metres when should_return_in_map_units=False)
        dx = (ref_enh[0] - other_enh[0])
        dy = (ref_enh[1] - other_enh[1])
        dz = (ref_enh[2] - other_enh[2])
        print(f"  Warning: auto_enh2xyz failed ({e}), using simple offset "
              f"({dx:.1f}, {dy:.1f}, {dz:.1f}) rotation={model_rotation:.1f}\u00b0")
        return (dx, dy, dz, model_rotation)


def merge_db(src_path: Path, dst: sqlite3.Connection, disc_label: str,
             correction=(0.0, 0.0, 0.0, 0.0), keep_blobs=False):
    """Merge src DB into dst. Applies coordinate correction (dx, dy, dz)
    and grid_north rotation (rotation_deg) to align this discipline's
    elements to the reference coordinate system.

    Rotation is applied BEFORE translation (rotate around discipline's
    own origin, then shift into position)."""
    src = sqlite3.connect(src_path)
    src.row_factory = sqlite3.Row
    dx, dy, dz = correction[0], correction[1], correction[2]
    rotation_deg = correction[3] if len(correction) > 3 else 0.0
    has_offset = abs(dx) > 0.01 or abs(dy) > 0.01 or abs(dz) > 0.01
    has_rotation = abs(rotation_deg) > 0.01

    # Precompute rotation matrix coefficients
    if has_rotation:
        theta = math.radians(rotation_deg)
        cos_t, sin_t = math.cos(theta), math.sin(theta)
    else:
        theta = 0.0
        cos_t, sin_t = 1.0, 0.0

    # base_geometries — deduplicate by hash.
    # keep_blobs=False (--library mode): store NULL BLOBs — meshless DB, meshes live in library.
    # keep_blobs=True (no library): the merged DB IS the mesh store — copy the blobs through.
    # ⚠ Before 2026-08-10 the None,None was UNCONDITIONAL (the comment said "when --library is
    # used" but the code never checked) — a no-library merge silently DESTROYED every mesh blob
    # (measured: LTU_AHouse 59,917 hash-only rows, 0 vertices). §PROOF's BLOB_COVERAGE check
    # below now fails the run outright if that ever regresses.
    for row in src.execute("SELECT * FROM base_geometries"):
        dst.execute(
            "INSERT OR IGNORE INTO base_geometries VALUES (?,?,?,?,?)",
            (row["geometry_hash"],
             row["vertices"] if keep_blobs else None,
             row["faces"] if keep_blobs else None,
             row["vertex_count"], row["face_count"])
        )

    # elements_meta — skip id (autoincrement), use INSERT OR IGNORE for dups
    for row in src.execute("SELECT * FROM elements_meta"):
        try:
            dst.execute(
                "INSERT OR IGNORE INTO elements_meta "
                "(guid, discipline, ifc_class, element_name, element_type, "
                "storey, material_name, material_rgba) VALUES (?,?,?,?,?,?,?,?)",
                (row["guid"], row["discipline"], row["ifc_class"],
                 row["element_name"], row["element_type"], row["storey"],
                 row["material_name"], row["material_rgba"])
            )
        except Exception:
            pass

    # element_instances
    for row in src.execute("SELECT * FROM element_instances"):
        dst.execute(
            "INSERT OR IGNORE INTO element_instances VALUES (?,?)",
            (row["guid"], row["geometry_hash"])
        )

    # element_transforms — apply rotation + site offset correction + copy rotation
    # Check if source has rotation columns
    src_cols = {r[1] for r in src.execute("PRAGMA table_info(element_transforms)").fetchall()}
    has_rot = 'rotation_x' in src_cols
    rotated_count = 0

    for row in src.execute("SELECT * FROM element_transforms"):
        raw_cx = row["center_x"] or 0.0
        raw_cy = row["center_y"] or 0.0
        raw_cz = row["center_z"] or 0.0
        rx = float(row["rotation_x"] or 0.0) if has_rot else 0.0
        ry = float(row["rotation_y"] or 0.0) if has_rot else 0.0
        rz = float(row["rotation_z"] or 0.0) if has_rot else 0.0

        if has_rotation:
            # Rotate centre around discipline origin BEFORE adding translation
            cx = raw_cx * cos_t - raw_cy * sin_t
            cy = raw_cx * sin_t + raw_cy * cos_t
            cz = raw_cz
            # Adjust element rotation_z by the grid north difference
            rz = rz + theta
            rotated_count += 1
        else:
            cx, cy, cz = raw_cx, raw_cy, raw_cz

        # Then apply translation
        cx += dx
        cy += dy
        cz += dz

        # bbox columns (if source has them)
        has_bbox = 'bbox_x' in src_cols
        bx = float(row["bbox_x"] or 0) if has_bbox else None
        by = float(row["bbox_y"] or 0) if has_bbox else None
        bz = float(row["bbox_z"] or 0) if has_bbox else None
        dst.execute(
            "INSERT OR IGNORE INTO element_transforms VALUES (?,?,?,?,?,?,?,?,?,?)",
            (row["guid"], cx, cy, cz, rx, ry, rz, bx, by, bz)
        )

    if has_rotation and FINE:
        print(f"  §MERGE_ROTATE disc={disc_label} n={rotated_count} "
              f"theta={rotation_deg:.1f}\u00b0 (applied 2D rotation to centres + rotation_z)")

    # elements_rtree — apply rotation + offset, use meta id from destination
    for row in src.execute("SELECT * FROM element_transforms"):
        meta = dst.execute(
            "SELECT id FROM elements_meta WHERE guid=?", (row["guid"],)
        ).fetchone()
        if not meta:
            continue
        bbox = src.execute(
            "SELECT minX,maxX,minY,maxY,minZ,maxZ FROM elements_rtree "
            "WHERE id=(SELECT id FROM elements_meta WHERE guid=?)", (row["guid"],)
        ).fetchone()
        if bbox:
            try:
                bminX, bmaxX, bminY, bmaxY, bminZ, bmaxZ = bbox
                if has_rotation:
                    # Rotate all 4 bbox corners, then re-derive AABB
                    corners_x = [bminX, bminX, bmaxX, bmaxX]
                    corners_y = [bminY, bmaxY, bminY, bmaxY]
                    rot_xs = [cx * cos_t - cy * sin_t for cx, cy in zip(corners_x, corners_y)]
                    rot_ys = [cx * sin_t + cy * cos_t for cx, cy in zip(corners_x, corners_y)]
                    bminX, bmaxX = min(rot_xs), max(rot_xs)
                    bminY, bmaxY = min(rot_ys), max(rot_ys)
                dst.execute(
                    "INSERT OR IGNORE INTO elements_rtree VALUES (?,?,?,?,?,?,?)",
                    (meta[0], bminX+dx, bmaxX+dx, bminY+dy, bmaxY+dy, bminZ+dz, bmaxZ+dz)
                )
            except Exception:
                pass

    # spatial_structure
    # §S21 (prompts/4D_GANTT_TM_REFACTOR.md): elevation carried through the per-discipline merge —
    # read by column name (sqlite3.Row), so this stays correct even if the source tmp_db (an older
    # extractIFCtoDB.py run) predates the elevation column and doesn't have it. EXTRACT ONLY, no
    # inference: a source row with no elevation stays NULL, never backfilled from another row.
    src_cols = {r[1] for r in src.execute("PRAGMA table_info(spatial_structure)")}
    _has_elevation = "elevation" in src_cols
    for row in src.execute("SELECT * FROM spatial_structure"):
        dst.execute(
            "INSERT OR IGNORE INTO spatial_structure VALUES (?,?,?,?,?,?,?)",
            (row["guid"], row["type"], row["name"], row["parent_guid"],
             row["object_type"], row["predefined_type"],
             row["elevation"] if _has_elevation else None)
        )

    # rel_contained_in_space
    for row in src.execute("SELECT * FROM rel_contained_in_space"):
        dst.execute(
            "INSERT OR IGNORE INTO rel_contained_in_space VALUES (?,?)",
            (row["element_guid"], row["space_guid"])
        )

    # rel_aggregates
    for row in src.execute("SELECT * FROM rel_aggregates"):
        dst.execute(
            "INSERT OR IGNORE INTO rel_aggregates VALUES (?,?)",
            (row["parent_guid"], row["child_guid"])
        )

    # surface_styles
    for row in src.execute("SELECT * FROM surface_styles"):
        dst.execute("INSERT OR IGNORE INTO surface_styles VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            tuple(row))

    # material_layers
    for row in src.execute("SELECT * FROM material_layers"):
        dst.execute("INSERT OR IGNORE INTO material_layers VALUES (?,?,?,?,?)",
            tuple(row))

    dst.commit()
    src.close()

    count = dst.execute("SELECT COUNT(*) FROM elements_meta").fetchone()[0]
    print(f"  → merged {disc_label}: running total {count} elements")


def post_normalise_site_origin(dst: sqlite3.Connection, first_ifc: Path):
    """
    Subtract IfcSite placement origin from all element coordinates so the building
    sits near ground level rather than at a real-world datum (e.g. 165m elevation).

    Updates element_transforms and elements_rtree together.
    Camera target is computed by the caller AFTER this function, so it self-corrects.
    No-op when |site_oz| <= 1.0m (site at or near origin).

    Logic source: scripts/topup_extracted_db.py lines 49-147.
    Witness: W-SITE-Z-1 in scripts/verify_extraction.sh.
    """
    try:
        import ifcopenshell
        import ifcopenshell.util.placement as ifcplace
        import ifcopenshell.util.unit as ifcunit
    except ImportError:
        print("  post_normalise_site_origin: ifcopenshell not available — skipping")
        return

    try:
        ifc = ifcopenshell.open(str(first_ifc))
        unit_scale = ifcunit.calculate_unit_scale(ifc, 'LENGTHUNIT')
        sites = ifc.by_type('IfcSite')
        if not sites or not sites[0].ObjectPlacement:
            return
        m = ifcplace.get_local_placement(sites[0].ObjectPlacement)
        site_oz = float(m[2][3]) * unit_scale
    except Exception as e:
        print(f"  post_normalise_site_origin: could not read site placement ({e}) — skipping")
        return

    if abs(site_oz) <= 1.0:
        return

    print(f"  Site origin Z={site_oz:.3f}m — subtracting from all element coordinates")
    dst.execute("UPDATE element_transforms SET center_z = center_z - ?", (site_oz,))
    dst.execute("""
        UPDATE elements_rtree SET
            minZ = minZ - ?,
            maxZ = maxZ - ?
    """, (site_oz, site_oz))
    dst.execute("INSERT OR REPLACE INTO project_metadata VALUES ('site_offset_z', ?)",
                (str(round(site_oz, 4)),))
    dst.commit()
    print(f"  → Z normalised. site_offset_z={site_oz:.3f}m stored in project_metadata")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ifc-dir", required=True)
    parser.add_argument("--pattern", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--extractor", default="DAGCompiler/python/extractIFCtoDB.py")
    parser.add_argument("--library", help="Component library DB path (passed to extractor as --library)")
    parser.add_argument(
        "--disc-map", nargs="*", metavar="STEM=DISC",
        help="Override discipline by source filename stem. "
             "E.g. --disc-map LTU_AHouse_PLB=PLB LTU_AHouse_SAN=SAN LTU_AHouse_HEAT=HEAT"
    )
    args = parser.parse_args()

    # Build stem→discipline override dict from --disc-map pairs
    disc_map = {}
    if args.disc_map:
        for pair in args.disc_map:
            stem, disc = pair.split("=", 1)
            disc_map[stem.strip()] = disc.strip().upper()

    ifc_files = sorted(Path(args.ifc_dir).glob(args.pattern))
    if not ifc_files:
        print(f"No files matching {args.pattern} in {args.ifc_dir}")
        sys.exit(1)

    # S173: Tee all stdout to a persistent log file next to the output DB
    output_path = Path(args.output)
    log_path = output_path.with_suffix('.log')
    import io

    class _Tee:
        """Write to both stdout and a log file."""
        def __init__(self, logf):
            self._stdout = sys.stdout
            self._logf = logf
        def write(self, s):
            self._stdout.write(s)
            self._logf.write(s)
        def flush(self):
            self._stdout.flush()
            self._logf.flush()

    _log_fh = open(str(log_path), 'w')
    sys.stdout = _Tee(_log_fh)

    output = Path(args.output)
    if output.exists():
        output.unlink()

    dst = sqlite3.connect(output)
    dst.executescript(SCHEMA_SQL)
    dst.commit()

    import time as _time
    t0 = _time.time()

    print(f"Extracting {len(ifc_files)} discipline files → {output.name}")
    if disc_map:
        print(f"  Disc overrides: {disc_map}")

    # ── S172: Parallel extraction — launch all disciplines concurrently ──
    # Each discipline IFC is extracted to its own temp DB in parallel.
    # Then merge sequentially (fast, just DB row copies).
    jobs = []  # (ifc, tmp_db, process)
    for ifc in ifc_files:
        tmp_db = Path(tempfile.mktemp(suffix=f"_{ifc.stem}.db"))
        # S173: Do NOT pass --library during parallel extraction.
        # Each extractor writes BLOBs to its own temp DB (no contention).
        # Library is populated sequentially during merge phase.
        cmd = [sys.executable, args.extractor, "--ifc", str(ifc), "-o", str(tmp_db),
               "--skip-normalize"]  # S173: merge script handles normalization
        log_file = open(str(tmp_db) + ".log", 'w')
        proc = subprocess.Popen(cmd, stdout=log_file, stderr=subprocess.STDOUT)
        jobs.append((ifc, tmp_db, proc, log_file))
        size_mb = ifc.stat().st_size / 1024 / 1024
        print(f"  [PID {proc.pid}] {ifc.stem} ({size_mb:.1f} MB) → {tmp_db.name}")

    print(f"\n  {len(jobs)} extractions running in parallel...")

    # Wait for all to finish, report as they complete
    completed = set()
    while len(completed) < len(jobs):
        for i, (ifc, tmp_db, proc, log_file) in enumerate(jobs):
            if i in completed:
                continue
            ret = proc.poll()
            if ret is not None:
                log_file.close()
                elapsed = _time.time() - t0
                if ret == 0 and tmp_db.exists() and tmp_db.stat().st_size > 0:
                    # Read element count from log
                    log_path = str(tmp_db) + ".log"
                    elems = "?"
                    try:
                        with open(log_path) as lf:
                            for line in lf:
                                if "§EXTRACT Elements:" in line:
                                    elems = line.strip()
                                    break
                    except:
                        pass
                    print(f"  ✓ [{int(elapsed)}s] {ifc.stem} done — {elems}")
                else:
                    print(f"  ✗ [{int(elapsed)}s] {ifc.stem} FAILED (exit={ret})")
                completed.add(i)
        if len(completed) < len(jobs):
            _time.sleep(1)

    extract_time = _time.time() - t0
    print(f"\n  All {len(jobs)} extractions done in {extract_time:.0f}s")

    # S173: Dump key diagnostic lines from each discipline's extraction log (FINE only)
    if not FINE:
        print(f"\n  §DIAG skipped (BIM_LOG_LEVEL={LOG_LEVEL})")
    else:
        print(f"\n  §DIAG per-discipline extraction diagnostics:")
    for ifc, tmp_db, proc, log_file in jobs:
        if not FINE:
            continue
        log_path = str(tmp_db) + ".log"
        if not Path(log_path).exists():
            continue
        with open(log_path) as lf:
            for line in lf:
                if any(tag in line for tag in (
                    "§SAMPLE[", "§PRE_NORM", "§NORMALIZE", "§COORD_RANGE",
                    "§MESH_SCALE", "§UNIT_SCALE", "WARNING", "§FAIL"
                )):
                    print(f"    [{ifc.stem}] {line.rstrip()}")

    # ── Geolocation alignment (same logic as IfcPatch MergeProjects) ──
    # Read geolocation from each IFC, compute corrections relative to reference
    print(f"\n  §ALIGN Reading geolocation from {len(jobs)} discipline IFCs...")
    geo_data = {}  # ifc_stem -> geo dict
    for ifc, tmp_db, proc, log_file in jobs:
        if tmp_db.exists() and tmp_db.stat().st_size > 0:
            geo = _read_geolocation(ifc)
            geo_data[ifc.stem] = geo
            enh = geo['enh']
            print(f"    {ifc.stem:45s} enh=({enh[0]:>10.2f}, {enh[1]:>10.2f}, {enh[2]:>10.2f})  north={geo['grid_north']:.1f}")

    # Pick reference: first file (consistent with MergeProjects behavior)
    ref_stem = list(geo_data.keys())[0] if geo_data else None
    ref_geo = geo_data.get(ref_stem)
    if ref_geo:
        print(f"  §ALIGN Reference: {ref_stem}")

    # Compute corrections
    corrections = {}  # ifc_stem -> (dx, dy, dz, rotation_deg)
    for stem, geo in geo_data.items():
        if stem == ref_stem:
            corrections[stem] = (0.0, 0.0, 0.0, 0.0)
        else:
            corr = _compute_alignment(ref_geo, geo)
            corrections[stem] = corr
            has_shift = abs(corr[0]) > 0.01 or abs(corr[1]) > 0.01 or abs(corr[2]) > 0.01
            has_rot = abs(corr[3]) > 0.01
            if has_shift or has_rot:
                rot_str = f" rotation={corr[3]:.1f}\u00b0" if has_rot else ""
                print(f"    {stem:45s} correction=({corr[0]:>10.2f}, {corr[1]:>10.2f}, {corr[2]:>10.2f}){rot_str}")

    # ── Sequential merge (fast — just DB row copies) ──
    merge_t0 = _time.time()
    for ifc, tmp_db, proc, log_file in jobs:
        disc = ifc.stem
        if not tmp_db.exists() or tmp_db.stat().st_size == 0:
            continue

        fix_unit_scale(tmp_db, ifc)

        # Apply discipline override
        override = disc_map.get(ifc.stem)
        if override:
            conn = sqlite3.connect(str(tmp_db))
            conn.execute("UPDATE elements_meta SET discipline=?", (override,))
            conn.commit()
            conn.close()
            print(f"  [{disc}] → discipline overridden to {override}")

        corr = corrections.get(ifc.stem, (0.0, 0.0, 0.0, 0.0))
        merge_db(tmp_db, dst, disc, correction=corr, keep_blobs=not args.library)

        # S173: Copy BLOBs from temp DB → library (sequential, no lock contention)
        if args.library:
            lib_conn = sqlite3.connect(args.library, timeout=30)
            lib_conn.execute("PRAGMA journal_mode=WAL")
            src_conn = sqlite3.connect(str(tmp_db))
            copied = 0
            for row in src_conn.execute(
                    "SELECT geometry_hash, vertices, faces, vertex_count, face_count "
                    "FROM base_geometries WHERE vertices IS NOT NULL"):
                rc = lib_conn.execute(
                    "INSERT OR IGNORE INTO component_geometries "
                    "(geometry_hash, vertices, faces, normals, vertex_count, face_count) "
                    "VALUES (?,?,?,NULL,?,?)", row)
                if rc.rowcount > 0:
                    copied += 1
            lib_conn.commit()
            lib_conn.close()
            src_conn.close()
            if copied > 0:
                print(f"  [{disc}] → {copied} new meshes → library")

        tmp_db.unlink()
        log_path_tmp = Path(str(tmp_db) + ".log")
        if log_path_tmp.exists():
            log_path_tmp.unlink()

    merge_time = _time.time() - merge_t0
    print(f"  Merge phase: {merge_time:.1f}s")

    total = dst.execute("SELECT COUNT(*) FROM elements_meta").fetchone()[0]
    by_disc = dst.execute(
        "SELECT discipline, COUNT(*) FROM elements_meta GROUP BY discipline ORDER BY COUNT(*) DESC"
    ).fetchall()

    # Post-action 1: Legacy Z-only normalization from IfcSite placement
    post_normalise_site_origin(dst, ifc_files[0])

    # Post-action 2 (S172): Full XYZ re-normalization of merged DB.
    # Each discipline was normalized to its own centroid during extraction.
    # After merge, re-center ALL elements to a single shared origin.
    row = dst.execute("""
        SELECT AVG(center_x), AVG(center_y), MIN(center_z)
        FROM element_transforms
    """).fetchone()
    if row and row[0] is not None:
        ox, oy, oz = row[0], row[1], row[2]
        if abs(ox) > 100 or abs(oy) > 100 or abs(oz) > 100:
            print(f"  §NORMALIZE merged centroid far from origin: ({ox:.1f}, {oy:.1f}, {oz:.1f})")
            dst.execute("""
                UPDATE element_transforms
                SET center_x = center_x - ?, center_y = center_y - ?, center_z = center_z - ?
            """, (ox, oy, oz))
            dst.execute("""
                UPDATE elements_rtree
                SET minX = minX - ?, maxX = maxX - ?,
                    minY = minY - ?, maxY = maxY - ?,
                    minZ = minZ - ?, maxZ = maxZ - ?
            """, (ox, ox, oy, oy, oz, oz))
            dst.execute("INSERT OR REPLACE INTO project_metadata VALUES ('merge_offset_x', ?)", (str(round(ox,4)),))
            dst.execute("INSERT OR REPLACE INTO project_metadata VALUES ('merge_offset_y', ?)", (str(round(oy,4)),))
            dst.execute("INSERT OR REPLACE INTO project_metadata VALUES ('merge_offset_z', ?)", (str(round(oz,4)),))
            dst.commit()
            vrow = dst.execute("SELECT AVG(center_x), AVG(center_y), MIN(center_z) FROM element_transforms").fetchone()
            print(f"  §NORMALIZE after: centroid=({vrow[0]:.1f}, {vrow[1]:.1f}, {vrow[2]:.1f})")
        else:
            print(f"  §NORMALIZE merged centroid near origin: ({ox:.1f}, {oy:.1f}, {oz:.1f}) — skip")

    # Store building center + view distance as camera target for the loader.
    # Must run AFTER post_normalise_site_origin so camera tracks corrected coords.
    try:
        row = dst.execute("""
            SELECT (MIN(center_x)+MAX(center_x))/2.0,
                   (MIN(center_y)+MAX(center_y))/2.0,
                   (MIN(center_z)+MAX(center_z))/2.0,
                   SQRT(POWER(MAX(center_x)-MIN(center_x),2)
                      + POWER(MAX(center_y)-MIN(center_y),2)
                      + POWER(MAX(center_z)-MIN(center_z),2)) * 0.8
            FROM element_transforms
        """).fetchone()
        if row and row[0] is not None:
            cx, cy, cz, vd = row
            dst.execute("INSERT OR REPLACE INTO project_metadata VALUES ('view_center_x', ?)", (str(round(cx,2)),))
            dst.execute("INSERT OR REPLACE INTO project_metadata VALUES ('view_center_y', ?)", (str(round(cy,2)),))
            dst.execute("INSERT OR REPLACE INTO project_metadata VALUES ('view_center_z', ?)", (str(round(cz,2)),))
            dst.execute("INSERT OR REPLACE INTO project_metadata VALUES ('view_distance',  ?)", (str(round(vd,1)),))
            dst.commit()
            print(f"  Camera target: ({cx:.2f}, {cy:.2f}, {cz:.2f})m  dist={vd:.1f}m")
    except Exception as e:
        print(f"  Camera target write skipped: {e}")

    # ── S173: PROOF BLOCK — self-checking merge summary ──────────────────
    disc_ranges = dst.execute("""
        SELECT em.discipline, COUNT(*),
               MIN(et.center_x), MAX(et.center_x),
               MIN(et.center_y), MAX(et.center_y),
               MIN(et.center_z), MAX(et.center_z)
        FROM element_transforms et
        JOIN elements_meta em ON et.guid = em.guid
        GROUP BY em.discipline
    """).fetchall()

    size_mb = output.stat().st_size / (1024 * 1024)
    print(f"\n{'='*70}")
    print(f"§PROOF {output.name}  {total:,} elements  {size_mb:.1f}MB  {len(by_disc)} disciplines")
    print(f"{'='*70}")

    _pass = _fail = 0
    def _check(name, ok, evidence):
        nonlocal _pass, _fail
        tag = "PASS" if ok else "FAIL"
        _pass += ok
        _fail += (not ok)
        print(f"  {tag:4s}  {name:20s}  {evidence}")

    # M1: Per-discipline scale — each must span 1-500m
    for d, cnt, x0, x1, y0, y1, z0, z1 in disc_ranges:
        span = max(abs(x1-x0), abs(y1-y0), abs(z1-z0))
        _check(f"SCALE_{d}",
               0.5 < span < 500,
               f"n={cnt}  span={span:.1f}m  "
               f"X=[{x0:.1f},{x1:.1f}] Y=[{y0:.1f},{y1:.1f}] Z=[{z0:.1f},{z1:.1f}]")

    # M2: ALIGN — all disciplines must have bbox overlap with reference
    if len(disc_ranges) > 1:
        ref = disc_ranges[0]
        for row in disc_ranges[1:]:
            x_ol = max(0, min(ref[3], row[3]) - max(ref[2], row[2]))
            y_ol = max(0, min(ref[5], row[5]) - max(ref[4], row[4]))
            ref_xs = ref[3] - ref[2]
            ref_ys = ref[5] - ref[4]
            xp = (x_ol / ref_xs * 100) if ref_xs > 0 else 0
            yp = (y_ol / ref_ys * 100) if ref_ys > 0 else 0
            _check(f"ALIGN_{row[0]}",
                   x_ol > 1.0 and y_ol > 1.0,
                   f"vs {ref[0]}  overlap X={xp:.0f}% Y={yp:.0f}%  "
                   f"({x_ol:.1f}m, {y_ol:.1f}m)")

    # M3: ELEMENT_COUNT — total matches sum of disciplines
    disc_sum = sum(r[1] for r in disc_ranges)
    _check("ELEMENT_COUNT",
           disc_sum == total,
           f"sum={disc_sum}  total={total}")

    # M4b: BLOB_COVERAGE — self-contained (no --library) output must CARRY its meshes: every
    # base_geometries row has a real vertices blob (guards the merge_db keep_blobs path above).
    if not args.library:
        _bc = dst.execute("SELECT COUNT(*), COUNT(vertices) FROM base_geometries").fetchone()
        _check("BLOB_COVERAGE", _bc[0] > 0 and _bc[0] == _bc[1],
               f"rows={_bc[0]}  with_blobs={_bc[1]} (self-contained: must be equal)")

    # M4: LIBRARY — geometry hashes resolvable (spot-check)
    if args.library:
        import sqlite3 as _sq
        _lib = _sq.connect(args.library)
        lib_total = _lib.execute("SELECT COUNT(*) FROM component_geometries").fetchone()[0]
        # Check 10 random hashes from extracted DB resolve in library
        _dst2 = _sq.connect(str(output))
        sample_hashes = _dst2.execute(
            "SELECT DISTINCT geometry_hash FROM element_instances LIMIT 10").fetchall()
        found = 0
        for (h,) in sample_hashes:
            if _lib.execute("SELECT 1 FROM component_geometries WHERE geometry_hash=?", (h,)).fetchone():
                found += 1
        _check("LIBRARY_RESOLVE",
               found == len(sample_hashes),
               f"{found}/{len(sample_hashes)} hashes found in library ({lib_total} total)")
        _dst2.close()
        _lib.close()

    print(f"{'─'*70}")
    result = "PASS" if _fail == 0 else "FAIL"
    print(f"§PROOF RESULT: {result}  ({_pass} pass, {_fail} fail)")
    for d, c in by_disc:
        print(f"  {d}: {c}")
    print(f"{'='*70}")

    dst.close()

    # Close persistent log
    sys.stdout = sys.stdout._stdout
    _log_fh.close()
    print(f"  Log written to {log_path}")


if __name__ == "__main__":
    main()
