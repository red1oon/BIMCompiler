# BIM OOTB — Frictionless BIM. Two DBs. One browser. Zero install.
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
# SPDX-License-Identifier: MIT
#!/usr/bin/env python3
"""Mesh section cut engine — slice triangle meshes at a horizontal cut plane.

Produces accurate 2D contours from BIM geometry stored in compiled databases.
Each element's triangle mesh is intersected with a horizontal plane at Z=cut_z,
yielding line segments that are chained into closed polylines (contours).

Usage:
    python3 2D_layout/section_cut.py output/samplehouse.db
    python3 2D_layout/section_cut.py output/samplehouse.db --cut-height 1.0
    python3 2D_layout/section_cut.py output/samplehouse.db --svg output.svg
    python3 2D_layout/section_cut.py output/duplex.db --list-storeys
    python3 2D_layout/section_cut.py output/duplex.db --storey "Level 2"
"""

import sqlite3
import os as _os
import sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
import model_db  # noqa: E402
import sys
import os
import argparse
import math
from dataclasses import dataclass, field
from typing import List, Tuple, Optional

import numpy as np

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
TOLERANCE = 0.005       # 5 mm endpoint matching for segment chaining
EPSILON = 1e-7          # floating point zero guard
DEFAULT_CUT_OFFSET = 1.0  # meters above floor level

# ---------------------------------------------------------------------------
# Dataclasses
# ---------------------------------------------------------------------------

@dataclass
class SectionContour:
    """A closed polyline from slicing one element's mesh."""
    points: List[Tuple[float, float]]   # closed polyline in XY (world meters)
    is_outer: bool                       # outer = CCW (positive area), inner = CW

@dataclass
class ElementSection:
    """All section contours for one building element."""
    guid: str
    ifc_class: str
    element_name: str
    storey: str
    category: str                        # 'CUT', 'BELOW', 'ABOVE'
    contours: List[SectionContour] = field(default_factory=list)
    bbox_2d: Tuple[float, float, float, float] = (0.0, 0.0, 0.0, 0.0)

@dataclass
class StoreyInfo:
    """Detected building storey with floor Z level."""
    name: str
    floor_z: float
    element_count: int

# ---------------------------------------------------------------------------
# BLOB parsers
# ---------------------------------------------------------------------------

def parse_vertices_blob(blob, vertex_count):
    """Parse float32 LE vertex blob -> numpy (N, 3)."""
    expected = vertex_count * 3 * 4  # 3 floats * 4 bytes
    if len(blob) == expected:
        return np.frombuffer(blob, dtype=np.float32).reshape(-1, 3)
    # fallback: try float64
    expected_d = vertex_count * 3 * 8
    if len(blob) == expected_d:
        return np.frombuffer(blob, dtype=np.float64).reshape(-1, 3).astype(np.float32)
    # last resort: infer from blob size
    n = len(blob) // 12
    if n > 0:
        return np.frombuffer(blob[:n * 12], dtype=np.float32).reshape(-1, 3)
    return np.zeros((0, 3), dtype=np.float32)


def parse_faces_blob(blob, face_count):
    """Parse int32 LE face index blob -> numpy (M, 3)."""
    expected = face_count * 3 * 4  # 3 ints * 4 bytes
    if len(blob) == expected:
        return np.frombuffer(blob, dtype=np.int32).reshape(-1, 3)
    # last resort: infer from blob size
    n = len(blob) // 12
    if n > 0:
        return np.frombuffer(blob[:n * 12], dtype=np.int32).reshape(-1, 3)
    return np.zeros((0, 3), dtype=np.int32)

# ---------------------------------------------------------------------------
# Mesh slicing — vectorized numpy
# ---------------------------------------------------------------------------

def slice_mesh(vertices, faces, cut_z):
    """Slice a triangle mesh at Z=cut_z, returning (K, 2, 2) segment array.

    Each segment is [[x0, y0], [x1, y1]] in world XY coordinates.
    Uses fully vectorized numpy operations for performance.
    """
    if len(faces) == 0 or len(vertices) == 0:
        return np.zeros((0, 2, 2), dtype=np.float64)

    # Gather triangle vertex positions: each (M, 3)
    v0 = vertices[faces[:, 0]].astype(np.float64)
    v1 = vertices[faces[:, 1]].astype(np.float64)
    v2 = vertices[faces[:, 2]].astype(np.float64)

    # Signed distances from cut plane
    d0 = v0[:, 2] - cut_z
    d1 = v1[:, 2] - cut_z
    d2 = v2[:, 2] - cut_z

    # A triangle crosses the plane if not all-above and not all-below
    all_above = (d0 > EPSILON) & (d1 > EPSILON) & (d2 > EPSILON)
    all_below = (d0 < -EPSILON) & (d1 < -EPSILON) & (d2 < -EPSILON)
    crossing = ~all_above & ~all_below

    # Also exclude degenerate cases where all three are on the plane
    all_on = (np.abs(d0) <= EPSILON) & (np.abs(d1) <= EPSILON) & (np.abs(d2) <= EPSILON)
    crossing = crossing & ~all_on

    if not np.any(crossing):
        return np.zeros((0, 2, 2), dtype=np.float64)

    # Filter to crossing triangles
    cv0 = v0[crossing]
    cv1 = v1[crossing]
    cv2 = v2[crossing]
    cd0 = d0[crossing]
    cd1 = d1[crossing]
    cd2 = d2[crossing]

    K = len(cd0)
    segments = np.zeros((K, 2, 2), dtype=np.float64)

    # For each crossing triangle, find the two intersection points.
    # Strategy: check sign patterns to find the isolated vertex,
    # then interpolate the two edges from isolated to the other two.
    #
    # sign: +1 if above, -1 if below, 0 if on plane
    s0 = np.sign(cd0)
    s1 = np.sign(cd1)
    s2 = np.sign(cd2)

    # Treat on-plane as matching whichever side has more vertices
    # For robustness, clamp near-zero to a small positive
    s0[s0 == 0] = 1
    s1[s1 == 0] = 1
    s2[s2 == 0] = 1

    def interp_edge(va, vb, da, db):
        """Interpolate crossing point on edge va->vb at Z=cut_z.
        Returns (K, 2) XY array."""
        denom = da - db
        # guard against division by zero
        safe = np.abs(denom) > EPSILON
        t = np.where(safe, da / denom, 0.5)
        t = t[:, np.newaxis]  # (K, 1)
        pt = va[:, :2] + t * (vb[:, :2] - va[:, :2])
        return pt

    # Case A: vertex 0 is isolated (s0 != s1 and s0 != s2)
    # Case B: vertex 1 is isolated (s1 != s0 and s1 != s2)
    # Case C: vertex 2 is isolated (s2 != s0 and s2 != s1)
    # These are mutually exclusive for true crossings.

    mask_a = (s0 != s1) & (s0 != s2)
    mask_b = (s1 != s0) & (s1 != s2) & ~mask_a
    mask_c = ~mask_a & ~mask_b

    # Case A: isolated = v0, edges v0-v1 and v0-v2
    if np.any(mask_a):
        idx = mask_a
        p0 = interp_edge(cv0[idx], cv1[idx], cd0[idx], cd1[idx])
        p1 = interp_edge(cv0[idx], cv2[idx], cd0[idx], cd2[idx])
        segments[idx, 0] = p0
        segments[idx, 1] = p1

    # Case B: isolated = v1, edges v1-v0 and v1-v2
    if np.any(mask_b):
        idx = mask_b
        p0 = interp_edge(cv1[idx], cv0[idx], cd1[idx], cd0[idx])
        p1 = interp_edge(cv1[idx], cv2[idx], cd1[idx], cd2[idx])
        segments[idx, 0] = p0
        segments[idx, 1] = p1

    # Case C: isolated = v2, edges v2-v0 and v2-v1
    if np.any(mask_c):
        idx = mask_c
        p0 = interp_edge(cv2[idx], cv0[idx], cd2[idx], cd0[idx])
        p1 = interp_edge(cv2[idx], cv1[idx], cd2[idx], cd1[idx])
        segments[idx, 0] = p0
        segments[idx, 1] = p1

    return segments

# ---------------------------------------------------------------------------
# Segment chaining — build closed polylines from unordered segments
# ---------------------------------------------------------------------------

def chain_segments(segments, tolerance=TOLERANCE):
    """Chain (K, 2, 2) segments into closed polyline lists.

    Returns list of numpy arrays, each shape (N, 2) representing a closed contour.
    Uses O(K^2) direct matching — acceptable for K < 500 per element.
    """
    if len(segments) == 0:
        return []

    # Work with a list of segment endpoint pairs
    remaining = list(range(len(segments)))
    pts = segments.copy()  # (K, 2, 2)

    chains = []

    while remaining:
        # Start a new chain from the first remaining segment
        seed = remaining.pop(0)
        chain = [pts[seed, 0], pts[seed, 1]]

        changed = True
        while changed:
            changed = False
            tail = chain[-1]
            head = chain[0]

            # Check if chain is already closed
            if len(chain) > 2:
                d_close = math.hypot(tail[0] - head[0], tail[1] - head[1])
                if d_close < tolerance:
                    break

            best_idx = -1
            best_dist = tolerance
            best_end = 0  # 0 = match segment start, 1 = match segment end
            best_which = 0  # 0 = append to tail, 1 = prepend to head

            for i, ri in enumerate(remaining):
                seg_start = pts[ri, 0]
                seg_end = pts[ri, 1]

                # Try matching segment start to chain tail
                d = math.hypot(seg_start[0] - tail[0], seg_start[1] - tail[1])
                if d < best_dist:
                    best_dist = d
                    best_idx = i
                    best_end = 0
                    best_which = 0

                # Try matching segment end to chain tail
                d = math.hypot(seg_end[0] - tail[0], seg_end[1] - tail[1])
                if d < best_dist:
                    best_dist = d
                    best_idx = i
                    best_end = 1
                    best_which = 0

                # Try matching segment end to chain head
                d = math.hypot(seg_end[0] - head[0], seg_end[1] - head[1])
                if d < best_dist:
                    best_dist = d
                    best_idx = i
                    best_end = 1
                    best_which = 1

                # Try matching segment start to chain head
                d = math.hypot(seg_start[0] - head[0], seg_start[1] - head[1])
                if d < best_dist:
                    best_dist = d
                    best_idx = i
                    best_end = 0
                    best_which = 1

            if best_idx >= 0:
                ri = remaining.pop(best_idx)
                seg_start = pts[ri, 0]
                seg_end = pts[ri, 1]

                if best_which == 0:  # append to tail
                    if best_end == 0:
                        chain.append(seg_end)
                    else:
                        chain.append(seg_start)
                else:  # prepend to head
                    if best_end == 1:
                        chain.insert(0, seg_start)
                    else:
                        chain.insert(0, seg_end)
                changed = True

        # Convert to numpy array
        chain_arr = np.array(chain, dtype=np.float64)
        if len(chain_arr) >= 3:
            chains.append(chain_arr)

    return chains

# ---------------------------------------------------------------------------
# Contour classification — signed area / shoelace formula
# ---------------------------------------------------------------------------

def classify_contour(points):
    """Classify contour winding using the shoelace formula.

    Returns signed area: positive = CCW (outer), negative = CW (inner/hole).
    Points is (N, 2) numpy array.
    """
    x = points[:, 0]
    y = points[:, 1]
    # Shoelace formula: 2A = sum(x_i * y_{i+1} - x_{i+1} * y_i)
    x_next = np.roll(x, -1)
    y_next = np.roll(y, -1)
    signed_area = 0.5 * np.sum(x * y_next - x_next * y)
    return float(signed_area)

# ---------------------------------------------------------------------------
# Storey detection
# ---------------------------------------------------------------------------

def detect_storeys(conn):
    """Detect building storeys and their floor Z levels.

    Returns list of StoreyInfo sorted by floor_z ascending.
    """
    rows = conn.execute("""
        SELECT m.storey, MIN(r.minZ) as floor_z, COUNT(*) as n
        FROM elements_meta m
        JOIN m_bbox r ON r.guid = m.guid
        WHERE m.storey IS NOT NULL
        GROUP BY m.storey
        ORDER BY floor_z
    """).fetchall()

    storeys = []
    for name, floor_z, count in rows:
        storeys.append(StoreyInfo(
            name=name,
            floor_z=float(floor_z),
            element_count=count,
        ))
    return storeys

# ---------------------------------------------------------------------------
# Section cut — main orchestration
# ---------------------------------------------------------------------------

def section_cut(db_path, cut_z=None, storey_name=None):
    """Run mesh section cut on a compiled BIM database.

    Args:
        db_path: Path to compiled .db file.
        cut_z: Explicit cut height in meters. If None, auto-detect from storey.
        storey_name: Target storey name. If None, use the first (lowest) storey.

    Returns:
        List of ElementSection objects for all classified elements.
    """
    conn = model_db.connect(db_path)   # §L1.6 P0: Node or old schema, one view shape

    # --- Determine cut height ---
    if cut_z is None:
        storeys = detect_storeys(conn)
        if not storeys:
            conn.close()
            raise ValueError("No storeys found in database")

        if storey_name:
            target = None
            for s in storeys:
                if s.name == storey_name:
                    target = s
                    break
            if target is None:
                conn.close()
                available = [s.name for s in storeys]
                raise ValueError(
                    f"Storey '{storey_name}' not found. Available: {available}"
                )
        else:
            target = storeys[0]

        cut_z = target.floor_z + DEFAULT_CUT_OFFSET
        print(f"Storey: {target.name}  floor_z={target.floor_z:.3f}m  "
              f"cut_z={cut_z:.3f}m  ({target.element_count} elements)")

    print(f"Cut plane Z = {cut_z:.3f}m")

    # --- Classify all elements by Z-range ---
    results = []

    # CUT elements: load meshes and slice
    # LEFT JOIN element_transforms to get element origin (center) in world space.
    # Mesh vertices are in LOCAL element space; world = local + center.
    # Slice must be done in LOCAL space: local_cut_z = world_cut_z - center_z.
    # XY contour points must then be translated to world space: + center_xy.
    cut_query = """
        SELECT m.guid, m.ifc_class, m.element_name, m.storey,
               bg.vertices, bg.faces, bg.vertex_count, bg.face_count,
               r.minX, r.maxX, r.minY, r.maxY,
               COALESCE(et.center_x, 0.0), COALESCE(et.center_y, 0.0),
               COALESCE(et.center_z, 0.0)
        FROM elements_meta m
        JOIN element_instances ei ON m.guid = ei.guid
        JOIN m_geom bg ON ei.geometry_hash = bg.geometry_hash
        JOIN m_bbox r ON r.guid = m.guid
        LEFT JOIN element_transforms et ON m.guid = et.guid
        WHERE r.minZ < :cut_z AND r.maxZ > :cut_z
    """
    cut_rows = conn.execute(cut_query, {"cut_z": cut_z}).fetchall()

    cut_count = 0
    for row in cut_rows:
        guid, ifc_class, element_name, storey = row[0], row[1], row[2], row[3]
        vert_blob, face_blob = row[4], row[5]
        vertex_count, face_count = row[6], row[7]
        minX, maxX, minY, maxY = row[8], row[9], row[10], row[11]
        cx, cy, cz = float(row[12]), float(row[13]), float(row[14])

        if vert_blob is None or face_blob is None:
            continue

        vertices = parse_vertices_blob(vert_blob, vertex_count)
        faces = parse_faces_blob(face_blob, face_count)

        # Convert world cut_z → local cut_z for this element's coordinate frame
        local_cut_z = cut_z - cz
        segments = slice_mesh(vertices, faces, local_cut_z)

        contours = []
        if len(segments) > 0:
            chains = chain_segments(segments)
            for chain in chains:
                area = classify_contour(chain)
                # Filter degenerate slivers (< 4 points or negligible area)
                if len(chain) < 4 or abs(area) < 1e-6:
                    continue
                is_outer = area > 0
                # Translate local XY → world XY by adding element center
                pts = [(float(p[0]) + cx, float(p[1]) + cy) for p in chain]
                contours.append(SectionContour(points=pts, is_outer=is_outer))

        elem = ElementSection(
            guid=guid,
            ifc_class=ifc_class,
            element_name=element_name or "",
            storey=storey or "",
            category="CUT",
            contours=contours,
            bbox_2d=(float(minX), float(minY), float(maxX), float(maxY)),
        )
        results.append(elem)
        cut_count += 1

    # BELOW elements: bounding box only (no mesh slicing)
    below_query = """
        SELECT m.guid, m.ifc_class, m.element_name, m.storey,
               r.minX, r.maxX, r.minY, r.maxY
        FROM elements_meta m
        JOIN m_bbox r ON r.guid = m.guid
        WHERE r.maxZ <= :cut_z
    """
    below_rows = conn.execute(below_query, {"cut_z": cut_z}).fetchall()
    below_count = 0
    for row in below_rows:
        guid, ifc_class, element_name, storey = row[0], row[1], row[2], row[3]
        minX, maxX, minY, maxY = row[4], row[5], row[6], row[7]
        elem = ElementSection(
            guid=guid,
            ifc_class=ifc_class,
            element_name=element_name or "",
            storey=storey or "",
            category="BELOW",
            contours=[],
            bbox_2d=(float(minX), float(minY), float(maxX), float(maxY)),
        )
        results.append(elem)
        below_count += 1

    # ABOVE elements: classify only, no geometry
    above_query = """
        SELECT m.guid, m.ifc_class, m.element_name, m.storey,
               r.minX, r.maxX, r.minY, r.maxY
        FROM elements_meta m
        JOIN m_bbox r ON r.guid = m.guid
        WHERE r.minZ >= :cut_z
    """
    above_rows = conn.execute(above_query, {"cut_z": cut_z}).fetchall()
    above_count = 0
    for row in above_rows:
        guid, ifc_class, element_name, storey = row[0], row[1], row[2], row[3]
        minX, maxX, minY, maxY = row[4], row[5], row[6], row[7]
        elem = ElementSection(
            guid=guid,
            ifc_class=ifc_class,
            element_name=element_name or "",
            storey=storey or "",
            category="ABOVE",
            contours=[],
            bbox_2d=(float(minX), float(minY), float(maxX), float(maxY)),
        )
        results.append(elem)
        above_count += 1

    conn.close()

    print(f"Classification: CUT={cut_count}  BELOW={below_count}  ABOVE={above_count}")
    contour_total = sum(len(e.contours) for e in results)
    print(f"Contours extracted: {contour_total}")

    return results

# ---------------------------------------------------------------------------
# Debug SVG output
# ---------------------------------------------------------------------------

# Color map by ifc_class
SVG_COLORS = {
    "IfcWall": "#000000",
    "IfcWallStandardCase": "#000000",
    "IfcDoor": "#CC0000",
    "IfcWindow": "#0066CC",
    "IfcPlate": "#4488CC",
    "IfcMember": "#008800",
    "IfcColumn": "#444444",
    "IfcSlab": "#999999",
    "IfcBeam": "#666600",
    "IfcFurniture": "#996633",
    "IfcFurnishingElement": "#996633",
}


def dump_debug_svg(elements, svg_path):
    """Write a minimal debug SVG showing section contours.

    CUT elements: colored contour outlines by ifc_class.
    BELOW elements: light gray bounding box rectangles.
    """
    # Compute global bounding box
    all_min_x = float("inf")
    all_min_y = float("inf")
    all_max_x = float("-inf")
    all_max_y = float("-inf")

    for e in elements:
        bx0, by0, bx1, by1 = e.bbox_2d
        if bx0 < all_min_x: all_min_x = bx0
        if by0 < all_min_y: all_min_y = by0
        if bx1 > all_max_x: all_max_x = bx1
        if by1 > all_max_y: all_max_y = by1

    if all_min_x == float("inf"):
        print("No elements to draw.")
        return

    margin = 0.5  # meters
    all_min_x -= margin
    all_min_y -= margin
    all_max_x += margin
    all_max_y += margin

    world_w = all_max_x - all_min_x
    world_h = all_max_y - all_min_y

    # SVG dimensions: scale to ~1000px wide
    scale = 1000.0 / max(world_w, 0.001)
    svg_w = world_w * scale
    svg_h = world_h * scale

    def tx(x):
        return (x - all_min_x) * scale

    def ty(y):
        # Flip Y for SVG coordinate system
        return (all_max_y - y) * scale

    lines = []
    lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" '
                 f'width="{svg_w:.1f}" height="{svg_h:.1f}" '
                 f'viewBox="0 0 {svg_w:.1f} {svg_h:.1f}">')
    lines.append(f'<rect width="{svg_w:.1f}" height="{svg_h:.1f}" fill="white"/>')

    # Draw BELOW elements as light gray bbox rectangles
    for e in elements:
        if e.category != "BELOW":
            continue
        bx0, by0, bx1, by1 = e.bbox_2d
        rx = tx(bx0)
        ry = ty(by1)  # flip: top of rect is max_y
        rw = (bx1 - bx0) * scale
        rh = (by1 - by0) * scale
        lines.append(f'<rect x="{rx:.2f}" y="{ry:.2f}" '
                     f'width="{rw:.2f}" height="{rh:.2f}" '
                     f'fill="#EEEEEE" stroke="#CCCCCC" stroke-width="0.5"/>')

    # Draw CUT element contours
    for e in elements:
        if e.category != "CUT" or not e.contours:
            continue
        color = SVG_COLORS.get(e.ifc_class, "#888888")
        stroke_w = "1.5" if e.ifc_class.startswith("IfcWall") else "1.0"

        for contour in e.contours:
            if len(contour.points) < 2:
                continue
            pts_str = " ".join(
                f"{tx(p[0]):.2f},{ty(p[1]):.2f}" for p in contour.points
            )
            fill = "none"
            lines.append(f'<polygon points="{pts_str}" '
                         f'fill="{fill}" stroke="{color}" '
                         f'stroke-width="{stroke_w}" stroke-linejoin="round"/>')

    lines.append('</svg>')

    with open(svg_path, 'w') as f:
        f.write('\n'.join(lines))

    print(f"SVG written: {svg_path}")

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Mesh section cut engine for BIM databases"
    )
    parser.add_argument("db_path", help="Path to compiled .db file")
    parser.add_argument("--cut-height", type=float, default=None,
                        help="Explicit cut height Z in meters")
    parser.add_argument("--storey", type=str, default=None,
                        help="Target storey name (auto-detect cut height)")
    parser.add_argument("--svg", type=str, default=None,
                        help="Output SVG path for debug visualization")
    parser.add_argument("--list-storeys", action="store_true",
                        help="List detected storeys and exit")

    args = parser.parse_args()

    if not os.path.exists(args.db_path):
        print(f"Error: database not found: {args.db_path}", file=sys.stderr)
        sys.exit(1)

    if args.list_storeys:
        conn = sqlite3.connect(args.db_path)
        storeys = detect_storeys(conn)
        conn.close()
        print(f"{'Storey':<30} {'Floor Z':>10} {'Elements':>10}")
        print("-" * 52)
        for s in storeys:
            cut = s.floor_z + DEFAULT_CUT_OFFSET
            print(f"{s.name:<30} {s.floor_z:>10.3f} {s.element_count:>10}"
                  f"  (cut @ {cut:.3f})")
        sys.exit(0)

    elements = section_cut(args.db_path, cut_z=args.cut_height,
                           storey_name=args.storey)

    # Summary by category and ifc_class
    from collections import Counter
    by_cat = Counter()
    by_class = Counter()
    for e in elements:
        by_cat[e.category] += 1
        if e.category == "CUT":
            by_class[e.ifc_class] += len(e.contours)

    print("\nCUT contours by class:")
    for cls, n in sorted(by_class.items()):
        print(f"  {cls}: {n} contours")

    if args.svg:
        dump_debug_svg(elements, args.svg)


if __name__ == "__main__":
    main()
