#!/usr/bin/env python3
"""
W-GEOMAP-TIER3 — prompts/RESUME_IFC_BOM_GEOMAPPING.md §WITNESS + §TIER-3-FABLE5
exit criteria: a MEASURED recall/precision number against the SAME 21-room
ground-truth Duplex standard compile_rooms.py uses, and whether it beats the
existing flood-fill baseline.

ISSUES PROVED:
  ACCURACY   wall-topology recovery (tools/rooms_from_topology.py, BLIND to
             IfcSpace) reproduces its shipped numbers EXACTLY on re-run:
             recall 13/21 (62%) / precision 13/15 at IoU>=0.5 (matches at
             IoU 0.95-1.0), 15/21 (71%) / 15/15 at centroid-containment.
  BEATS-24%  the flood-fill baseline (scripts/compile_rooms.py), scored under
             the IDENTICAL harness, gets 1/21 (IoU) / 3/21 (centroid) — the
             topology method must stay strictly above it on BOTH metrics.
  NONINVENT  every doorway closure / gap bridge in the artifact cites a real
             mined relation (R21 fills_host / IfcRelConnectsPathElements edge)
             present in relations_DX.json; the Roof space is recovered via the
             LOGGED fallback parapet cut, not an invented wall.
  CEILING    the 8 open-plan misses are virtual-boundary spaces — asserted
             present in the sidecar's space_boundaries (Rung-1 relational data
             covers them), so the miss is a method ceiling, not data loss.
Exit 0 only if every assertion holds. Read the §-log, not the exit code alone.
"""
import json
import os
import sys

import numpy as np
from shapely.geometry import Polygon, box

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

IOU_T = 0.5
GT_IFC = "internal/sources/Ifc2x3_Duplex_Architecture.ifc"

# The shipped claim (2026-07-02). If a re-run measures differently, this witness
# goes RED — update the claim only with the new measurement, never silently.
EXPECT = {
    "iou": {"recall": 13, "n": 21, "candidates": 15, "matched_cand": 13},
    "centroid": {"recall": 15, "n": 21, "candidates": 15, "matched_cand": 15},
    "baseline_iou_recall": 1,
    "baseline_centroid_recall": 3,
}

fails = 0


def check(name, cond, detail=""):
    global fails
    if not cond:
        fails += 1
    print(f"§W-GEOMAP-TIER3 {'PASS' if cond else 'FAIL'}: {name} {detail}")


def load_gt():
    import ifcopenshell
    import ifcopenshell.geom
    f = ifcopenshell.open(os.path.join(ROOT, GT_IFC))
    st = ifcopenshell.geom.settings()
    st.set(st.USE_WORLD_COORDS, True)
    gt = []
    for sp in f.by_type("IfcSpace"):
        storey = None
        for rel in sp.Decomposes:
            if rel.RelatingObject.is_a("IfcBuildingStorey"):
                storey = rel.RelatingObject.Name
        # keep the shape object alive while reading verts — a temporary here
        # dangles its buffer and silently corrupts the ground truth (found the
        # hard way 2026-07-02: every earlier score read as 0/21)
        shape = ifcopenshell.geom.create_shape(st, sp)
        v = np.array(shape.geometry.verts, dtype=np.float64).reshape(-1, 3)
        del shape
        gt.append((sp.GlobalId, f"{sp.Name} {sp.LongName}", storey,
                   v.min(axis=0)[:2].copy(), v.max(axis=0)[:2].copy()))
    return sorted(gt, key=lambda s: s[0])


def iou(poly, gt_box):
    u = poly.union(gt_box).area
    return poly.intersection(gt_box).area / u if u > 0 else 0.0


def score(cands, gt, metric):
    matched_gt, matched_cand, pairs = set(), set(), []
    for k, (gg, name, storey, mn, mx) in enumerate(gt):
        gt_box = box(mn[0], mn[1], mx[0], mx[1])
        best, bi = None, 0.0
        for ci, poly in enumerate(cands.get(storey, [])):
            v = iou(poly, gt_box) if metric == "iou" else \
                (1.0 if poly.contains(gt_box.centroid) else 0.0)
            if v > bi:
                bi, best = v, (storey, ci)
        if bi >= IOU_T and best not in matched_cand:
            matched_gt.add(k)
            matched_cand.add(best)
            pairs.append((name, storey, round(bi, 2)))
    n_cand = sum(len(v) for k, v in cands.items()
                 if k in {g[2] for g in gt})
    return matched_gt, matched_cand, n_cand, pairs


def main():
    gt = load_gt()
    check("ground truth = 21 spaces", len(gt) == 21, f"({len(gt)})")

    # Deterministic re-run: recover() fresh must equal the shipped artifact.
    import rooms_from_topology as rt
    fresh = rt.recover("DX")
    disk = json.load(open(os.path.join(ROOT, "geomap", "rooms_topology_DX.json")))
    check("re-run byte-equivalent to shipped artifact",
          json.dumps(fresh, sort_keys=True) == json.dumps(disk, sort_keys=True))

    cands = {}
    for st_name, entry in disk["storeys"].items():
        if "rooms" in entry:
            # 4-dp coordinate rounding in the artifact can leave a ring self-touching;
            # buffer(0) is the standard lossless validity repair (area change ~1e-8 m^2)
            cands[st_name] = [
                (lambda p: p if p.is_valid else p.buffer(0))(Polygon(r["polygon_xy"]))
                for r in entry["rooms"]]

    for metric in ("iou", "centroid"):
        m_gt, m_cand, n_cand, pairs = score(cands, gt, metric)
        e = EXPECT[metric]
        check(f"topology[{metric}] recall {e['recall']}/{e['n']}",
              len(m_gt) == e["recall"] and len(gt) == e["n"],
              f"(measured {len(m_gt)}/{len(gt)}: {sorted(p[0] for p in pairs)})")
        check(f"topology[{metric}] precision {e['matched_cand']}/{e['candidates']}",
              len(m_cand) == e["matched_cand"] and n_cand == e["candidates"],
              f"(measured {len(m_cand)}/{n_cand})")

    # Baseline under the identical harness.
    import sqlite3
    import compile_rooms as cr
    c = sqlite3.connect(
        f"file:{os.path.join(ROOT, 'deploy/buildings/Duplex_extracted.db')}?mode=ro",
        uri=True).cursor()
    by = cr.storey_walls(c)
    stairs = [s for lst in cr.storey_stairs(c).values() for s in lst]
    bl = {}
    for st_name, ws in by.items():
        if len(ws) < 3:
            continue
        bl[st_name] = [box(r["cx"] - r["sx"]/2, r["cy"] - r["sy"]/2,
                           r["cx"] + r["sx"]/2, r["cy"] + r["sy"]/2)
                       for r in cr.flood_rooms(ws, stairs)]
    for metric, key in (("iou", "baseline_iou_recall"), ("centroid", "baseline_centroid_recall")):
        m_gt, _, n_cand, _ = score(bl, gt, metric)
        check(f"baseline[{metric}] recall == {EXPECT[key]}/21 and topology beats it",
              len(m_gt) == EXPECT[key] and EXPECT[metric]["recall"] > len(m_gt),
              f"(baseline measured {len(m_gt)}/21 over {n_cand} candidates)")

    # NONINVENT: every closure/bridge cites a relation present in the sidecar.
    side = json.load(open(os.path.join(ROOT, "geomap", "relations_DX.json")))
    fills = {g: e["fills_host"] for g, e in side["elements"].items() if "fills_host" in e}
    conn_pairs = {(e["a"], e["b"]) for e in side["wall_connects"]}
    bad_cl = [c2 for c2 in disk["closures"] if fills.get(c2["filling"]) != c2["host"]]
    bad_br = [b2 for b2 in disk["bridges"] if (b2["a"], b2["b"]) not in conn_pairs]
    check("every closure cites a real R21 relation", not bad_cl, f"({len(disk['closures'])} closures)")
    check("every bridge cites a real connects relation", not bad_br, f"({len(disk['bridges'])} bridges)")
    check("Roof recovered via LOGGED fallback cut",
          disk["storeys"].get("Roof", {}).get("fallback_cut") is True
          and len(disk["storeys"]["Roof"]["rooms"]) == 1)

    # CEILING: the open-plan misses are covered by Rung-1 relational data.
    matched_iou, _, _, _ = score(cands, gt, "iou")
    missed = [gt[k] for k in range(len(gt)) if k not in matched_iou]
    sb_spaces = {b["space"] for b in side["space_boundaries"]}
    uncovered = [m[1] for m in missed if m[0] not in sb_spaces]
    check("all topology misses carry IfcRelSpaceBoundary data in the sidecar (Rung-1 covers them)",
          not uncovered, f"(misses={len(missed)}, uncovered={uncovered})")

    print(f"§W-GEOMAP-TIER3 RESULT: {'GREEN' if fails == 0 else f'RED ({fails} failures)'}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
