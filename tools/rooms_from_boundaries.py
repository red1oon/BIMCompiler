#!/usr/bin/env python3
"""
Rung-1 relational room recovery from IfcRelSpaceBoundary — prompts/
RESUME_IFC_BOM_GEOMAPPING.md §RUNG1-SPEC (§NEXT-SESSION-TASKS item 2).
Witness: W-GEOMAP-RUNG1 (scripts/witness_geomap_rung1.py — measured numbers
live THERE against the same 21-room ground-truth Duplex standard).

Non-invent ladder: real relation beats topology beats flood-fill. Every
vertical `IfcRelSpaceBoundary` in the source IFC carries ConnectionGeometry
(measured 2026-07-02: 184/184 vertical = IfcSurfaceOfLinearExtrusion over an
IfcPolyline; 81 horizontal = IfcCurveBoundedPlane, floor/ceiling — not
footprint). The base polyline IS the boundary's own footprint segment, in
SPACE-LOCAL coords (IFC 1st-level boundary convention) — including the
VIRTUAL open-plan split lines no physical-wall method can ever recover.

Method (deterministic, every edge cites its rel GlobalId):
  1. Per space: vertical boundary base polylines -> world XY via the surface
     Position then a MEASURED frame (see 1b). The space's SHAPE representation
     is NEVER read (blind to IfcSpace-the-answer, same discipline as Tier 3;
     placements only anchor the relation's own geometry).
  1b. FRAME RESOLUTION (F5-class anomaly, measured on DX 2026-07-02): the IFC
     spec says ConnectionGeometry is SPACE-local, but this exporter wrote it in
     the STOREY/parent frame — invisible for the 19 spaces whose placement XY
     translation is 0, exposed by the 2 hallways (space-frame lands them
     ~6.5/11.5 m off). Resolved PER SPACE by measurement, never assumption:
     score both candidate frames by mean distance of PHYSICAL boundary
     segments to their CITED elements' real world bboxes (extracted DB — a
     non-peeking signal: related elements, never IfcSpace); pick the closer;
     tie (zero-XY placement) -> the spec frame. Determination is logged.
  2. Boundaries whose extrusion is not world-vertical are skipped + logged
     (none measured on DX; the guard keeps the claim honest elsewhere).
  3. Endpoint snap-clustering (SNAP=0.1 m — door-opening/wall-thickness gaps,
     e.g. the measured 62 mm virtual-vs-physical offset) -> node + polygonize.
  4. Room = largest polygonized face >= MIN_AREA (multi-face is logged);
     no closed face -> HONEST REFUSE (fall through to topology's answer).

Output: geomap/rooms_boundaries_<TAG>.json (deterministic re-run byte-equal).
Usage: python3 tools/rooms_from_boundaries.py DX
Read the §-log after every run.
"""
import json
import os
import sys

import numpy as np
from shapely.geometry import LineString, MultiPolygon
from shapely.ops import polygonize, unary_union

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mine_geomap import MANIFEST, OUT_DIR  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SNAP = 0.10       # m — endpoint cluster radius (door gaps / wall-thickness offsets)
MIN_AREA = 1.0    # m^2 — same floor as rooms_from_topology (GT includes a 1.4 m^2 utility)
VERT_TOL = 0.999  # |world extrusion dir . z| >= this counts as a vertical boundary


def _axis2mat(pl):
    import ifcopenshell.util.placement as P
    return P.get_axis2placement(pl)


def _local_placement(pl):
    import ifcopenshell.util.placement as P
    return P.get_local_placement(pl)


def _storey_of(space):
    for rel in space.Decomposes:
        if rel.RelatingObject.is_a("IfcBuildingStorey"):
            return rel.RelatingObject.Name
    return None


def _element_bboxes(db_path):
    """guid -> world XY bbox (xmin,ymin,xmax,ymax) from the extracted DB (the frame-resolution signal)."""
    import sqlite3
    c = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True).cursor()
    out = {}
    for g, cx, cy, bx, by in c.execute(
            "SELECT guid, center_x, center_y, bbox_x, bbox_y FROM element_transforms"):
        if cx is None or cy is None or not bx or not by:
            continue
        out[g] = (cx - bx / 2, cy - by / 2, cx + bx / 2, cy + by / 2)
    return out


def _seg_bbox_dist(a, b, bb):
    """distance of segment midpoint to an XY bbox (0 inside)."""
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    dx = max(bb[0] - mx, 0, mx - bb[2])
    dy = max(bb[1] - my, 0, my - bb[3])
    return (dx * dx + dy * dy) ** 0.5


def collect_segments(f, el_bbox):
    """space guid -> {segments: [(p0, p1, rel_gid, phys)], skipped, frame} per space.

    Segments are computed in BOTH candidate frames (space-local per IFC spec vs storey/parent
    per the measured DX exporter behaviour) and the frame is RESOLVED per space against the
    cited elements' real world bboxes (see module docstring 1b)."""
    spaces = {}
    for sp in f.by_type("IfcSpace"):
        pl = sp.ObjectPlacement
        parent = pl.PlacementRelTo if pl and pl.is_a("IfcLocalPlacement") else None
        spaces[sp.GlobalId] = {
            "name": sp.Name, "long_name": sp.LongName, "storey": _storey_of(sp),
            "m4": _local_placement(pl),
            "m4_parent": _local_placement(parent) if parent else np.eye(4),
            "raw": [], "skipped": [],
        }
    for rel in f.by_type("IfcRelSpaceBoundary"):
        if not (rel.RelatingSpace and rel.ConnectionGeometry):
            continue
        ent = spaces.get(rel.RelatingSpace.GlobalId)
        if ent is None:
            continue
        cg = rel.ConnectionGeometry
        if not cg.is_a("IfcConnectionSurfaceGeometry"):
            ent["skipped"].append((rel.GlobalId, cg.is_a()))
            continue
        s = cg.SurfaceOnRelatingElement
        if not s.is_a("IfcSurfaceOfLinearExtrusion"):
            continue  # horizontal (IfcCurveBoundedPlane floor/ceiling) — not footprint
        curve = s.SweptCurve.Curve
        if not curve.is_a("IfcPolyline"):
            ent["skipped"].append((rel.GlobalId, curve.is_a()))
            continue
        el = rel.RelatedBuildingElement
        ent["raw"].append((s, rel.GlobalId, rel.PhysicalOrVirtualBoundary,
                           el.GlobalId if el else None))

    def _to_segments(ent, m4):
        segs, skipped = [], []
        for s, gid, phys, elg in ent["raw"]:
            world = m4 @ _axis2mat(s.Position)
            d = np.asarray(s.ExtrudedDirection.DirectionRatios, dtype=np.float64)
            wd = world[:3, :3] @ d
            wd = wd / np.linalg.norm(wd)
            if abs(wd[2]) < VERT_TOL:
                skipped.append((gid, f"non-vertical extrusion {wd.round(3).tolist()}"))
                continue
            pts = []
            for p in s.SweptCurve.Curve.Points:
                c = p.Coordinates
                w = world @ np.array([c[0], c[1] if len(c) > 1 else 0.0, 0.0, 1.0])
                pts.append((float(w[0]), float(w[1])))
            for a, b in zip(pts, pts[1:]):
                if abs(a[0] - b[0]) < 1e-9 and abs(a[1] - b[1]) < 1e-9:
                    continue
                segs.append((a, b, gid, phys, elg))
        return segs, skipped

    for gid, ent in spaces.items():
        cands = {"space-local": _to_segments(ent, ent["m4"]),
                 "storey-parent": _to_segments(ent, ent["m4_parent"])}
        # score each frame against the CITED elements' real world bboxes (PHYSICAL rows only)
        scores = {}
        for fr, (segs, _) in cands.items():
            ds = [_seg_bbox_dist(a, b, el_bbox[elg])
                  for a, b, _, phys, elg in segs
                  if phys == "PHYSICAL" and elg in el_bbox]
            scores[fr] = sum(ds) / len(ds) if ds else None
        if scores["space-local"] is None or scores["storey-parent"] is None or \
                abs(scores["space-local"] - scores["storey-parent"]) < 1e-9:
            frame = "space-local"  # tie / no signal -> the IFC-spec frame
        else:
            frame = min(scores, key=lambda k: scores[k])
        if frame != "space-local":
            print(f"§RUNG1-FRAME {ent['name']}: resolved '{frame}' by cited-element distance "
                  f"(space-local {scores['space-local']:.3f} m vs storey-parent {scores['storey-parent']:.3f} m)")
        segs, skipped = cands[frame]
        ent["segments"] = [(a, b, g, p) for a, b, g, p, _ in segs]
        ent["skipped"].extend(skipped)
        ent["frame"] = frame
        ent["frame_scores"] = {k: (round(v, 4) if v is not None else None) for k, v in scores.items()}
        del ent["raw"]
    return spaces


def snap_cluster(segments):
    """Cluster endpoints within SNAP -> centroid; returns snapped segments + bridge count.

    Bridges are IMPLICIT here (two endpoints <= SNAP apart land on one node) — count
    them so the artifact states how much tolerance-closing happened (logged, not silent)."""
    pts = []
    for a, b, _, _ in segments:
        pts.extend([a, b])
    clusters = []  # (centroid, [pts])
    for p in sorted(set(pts)):
        placed = False
        for c in clusters:
            if (p[0] - c[0][0]) ** 2 + (p[1] - c[0][1]) ** 2 <= SNAP ** 2:
                c[1].append(p)
                c[0] = (sum(q[0] for q in c[1]) / len(c[1]), sum(q[1] for q in c[1]) / len(c[1]))
                placed = True
                break
        if not placed:
            clusters.append([p, [p]])
    lookup = {}
    bridges = 0
    for cen, members in clusters:
        if len(set(members)) > 1:
            bridges += len(set(members)) - 1
        for m in members:
            lookup[m] = (round(cen[0], 6), round(cen[1], 6))
    snapped = [(lookup[a], lookup[b], gid, phys) for a, b, gid, phys in segments
               if lookup[a] != lookup[b]]
    return snapped, bridges


def assemble(segments):
    """Snapped segments -> (polygon exterior coords, faces_found) or (None, 0)."""
    lines = [LineString([a, b]) for a, b, _, _ in segments]
    if not lines:
        return None, 0
    noded = unary_union(lines)
    faces = [p for p in polygonize(noded) if p.area >= MIN_AREA]
    if not faces:
        return None, 0
    faces.sort(key=lambda p: (-p.area,))
    best = faces[0]
    coords = [(round(x, 4), round(y, 4)) for x, y in best.exterior.coords]
    return coords, len(faces)


def recover(tag):
    import ifcopenshell
    cfg = MANIFEST[tag]
    src = next((p for p in cfg["ifcs"]
                if "Architecture" in p or len(cfg["ifcs"]) == 1), cfg["ifcs"][0])
    f = ifcopenshell.open(os.path.join(ROOT, src))
    el_bbox = _element_bboxes(os.path.join(ROOT, cfg["db"]))
    spaces = collect_segments(f, el_bbox)
    out = {"building": tag, "src": src, "snap_m": SNAP, "min_area_m2": MIN_AREA,
           "spaces": {}, "refused": {}}
    for gid in sorted(spaces):
        ent = spaces[gid]
        for rgid, why in ent["skipped"]:
            print(f"§RUNG1 {tag}/{ent['name']}: SKIP boundary {rgid} ({why})")
        if not ent["segments"]:
            out["refused"][gid] = "no vertical boundary segments in source IFC"
            print(f"§RUNG1 {tag}/{ent['name']}: REFUSE (no vertical boundary segments)")
            continue
        snapped, bridges = snap_cluster(ent["segments"])
        coords, faces = assemble(snapped)
        if coords is None:
            out["refused"][gid] = f"boundary segments do not close (segs={len(ent['segments'])} bridges={bridges})"
            print(f"§RUNG1 {tag}/{ent['name']}: REFUSE (loop does not close, segs={len(ent['segments'])})")
            continue
        cites = sorted({g for _, _, g, _ in ent["segments"]})
        nvirt = len({g for _, _, g, p in ent["segments"] if p == "VIRTUAL"})
        out["spaces"][gid] = {
            "name": ent["name"], "long_name": ent["long_name"], "storey": ent["storey"],
            "polygon": coords, "cites": cites, "virtual_rels": nvirt,
            "segments": len(ent["segments"]), "snap_bridges": bridges, "faces": faces,
            "frame": ent["frame"], "frame_scores": ent["frame_scores"],
        }
        print(f"§RUNG1 {tag}/{ent['name']} '{ent['long_name']}' storey='{ent['storey']}': "
              f"polygon {len(coords) - 1} edges from {len(ent['segments'])} segs "
              f"({nvirt} virtual rel(s), {bridges} snap-bridge(s), faces={faces})")
    print(f"§RUNG1 {tag}: recovered={len(out['spaces'])} refused={len(out['refused'])} "
          f"of {len(spaces)} spaces (every polygon cites its IfcRelSpaceBoundary GlobalIds)")
    return out


def main():
    tags = [t for t in sys.argv[1:] if t in MANIFEST] or ["DX"]
    for tag in tags:
        if not MANIFEST[tag]["ifcs"]:
            print(f"§RUNG1 {tag}: REFUSE (no source IFC in MANIFEST)")
            continue
        out = recover(tag)
        dst = os.path.join(OUT_DIR, f"rooms_boundaries_{tag}.json")
        with open(dst, "w") as fh:
            json.dump(out, fh, indent=1, sort_keys=True)
            fh.write("\n")
        print(f"§WRITE {dst} ({os.path.getsize(dst) // 1024} KB)")


if __name__ == "__main__":
    main()
